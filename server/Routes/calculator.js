import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const VAT_RATE = 0.24;

// --- Helpers ---

async function findMachine(db, machineName) {
  return await db.collection("machines").findOne({
    $or: [{ name: machineName }, { nameShort: machineName }, { machineKey: machineName }],
  });
}

function resolvePriceTable(table, widthCm) {
  for (const [range, price] of Object.entries(table)) {
    if (range === "40+cm" && widthCm > 40) return price;
    const [min, max] = range.replace("cm", "").split("-").map(Number);
    if (widthCm >= min && widthCm <= max) return price;
  }
  return 0;
}

// Compute overhead €/m² for a machine across all 4 overhead cost types
function computeOverheadPerM2(machine, overheadCosts) {
  if (!machine.dailyOutputM2) return null;
  let total = 0;
  const typeMap = {
    electricity: "electricity_pct",
    diamond: "diamond_pct",
    consumables: "consumables_pct",
    maintenance: "maintenance_pct",
  };
  for (const cost of overheadCosts) {
    const pctKey = typeMap[cost.type];
    if (!pctKey) continue;
    const pct = machine.overheadAllocation?.[pctKey] ?? 0;
    total += (cost.dailyEUR * pct) / 100 / machine.dailyOutputM2;
  }
  return parseFloat(total.toFixed(4));
}

// Compute labour €/m² for a machine
function computeLabourPerM2(machine) {
  if (!machine.dailyOutputM2) return null;
  const wage = (machine.workers ?? 1) * (machine.dailyWageEUR ?? 0);
  return parseFloat((wage / machine.dailyOutputM2).toFixed(4));
}

// Build machineBreakdown array for a production route
async function buildMachineBreakdown(db, route, overheadCosts) {
  const breakdown = [];
  const POLYSYRMA_COST_PER_CUT = 30.25;

  for (const machineName of route.machines ?? []) {
    // Πολύσυρμα is not in machines collection — handle separately
    if (machineName === "Πολύσυρμα") {
      breakdown.push({
        machine: "Πολύσυρμα",
        perCut: true,
        costPerCut: POLYSYRMA_COST_PER_CUT,
        labourPerM2: null,
        overheadPerM2: null,
        totalPerM2: null,
      });
      continue;
    }

    // Also handle "Μονόσυρμα" which maps to Οριζόντιο machine
    const lookupName = machineName === "Μονόσυρμα" ? "Οριζόντιο" : machineName;
    const machine = await findMachine(db, lookupName);

    if (!machine) {
      breakdown.push({ machine: machineName, error: "Δεν βρέθηκε" });
      continue;
    }

    const labourPerM2 = computeLabourPerM2(machine);
    const overheadPerM2 = computeOverheadPerM2(machine, overheadCosts);

    // costPerM2 from route machineCosts takes priority, else from machine doc
    const routeCost = route.machineCosts?.[machineName] ?? null;
    const machineCost =
      routeCost ??
      machine.costPerM2 ??
      machine.costPerM2_stone ??
      machine.costPerM2_marble ??
      null;

    const totalPerM2 =
      labourPerM2 != null && overheadPerM2 != null
        ? parseFloat((labourPerM2 + overheadPerM2).toFixed(4))
        : null;

    breakdown.push({
      machine: machineName,
      perCut: false,
      labourPerM2,
      overheadPerM2,
      processingCostPerM2: machineCost,
      totalPerM2,
    });
  }

  return breakdown;
}

// --- Routes ---

router.get("/available-finishes/:productName", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: "Η βάση δεδομένων δεν είναι συνδεδεμένη." });

  const db = mongoose.connection.db;
  const entries = await db
    .collection("pricing")
    .find({ product: req.params.productName })
    .toArray();
  const finishes = [...new Set(entries.map((e) => e.finish).filter(Boolean))];
  res.json(finishes);
});

router.post("/calculate", async (req, res) => {
  try {
    const { productName, finish, source, quantity, packaging, widthCm } = req.body;
    const db = mongoose.connection.db;

    // Load overhead costs once (used for machine breakdown)
    const overheadCosts = await db.collection("overhead_costs").find({}).toArray();

    // 0. Check if traded good
    const productDoc = await db.collection("products").findOne({ name: productName });

    if (
      productDoc?.tradeGood === true ||
      productDoc?.tradeGood === "true" ||
      productDoc?.tradeGood === "True"
    ) {
      const basePrice = productDoc.sellingPrice ?? 0;
      const grandTotalNoTax = basePrice * quantity;
      const vatAmount = grandTotalNoTax * VAT_RATE;
      const grandTotalWithTax = grandTotalNoTax + vatAmount;

      return res.json({
        isTradeGood: true,
        breakdown: {
          sellingPricePerM2: basePrice,
          totalPerM2NoTax: basePrice,
          quantity,
          packagingPerM2: 0,
          packagingFlatFee: 0,
          pressingFlatFee: 0,
        },
        machineBreakdown: [],
        grandTotalNoTax: parseFloat(grandTotalNoTax.toFixed(2)),
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        grandTotalWithTax: parseFloat(grandTotalWithTax.toFixed(2)),
      });
    }

    // 1. Πρώτη ύλη
    let rawCost = await db.collection("raw_loads").findOne({ source });
    let isHammerLoad = false;

    if (!rawCost) {
      rawCost = await db.collection("hammer_loads").findOne({ source });
      isHammerLoad = !!rawCost;
    }

    if (!rawCost)
      return res.status(404).json({ error: `Η πηγή "${source}" δεν βρέθηκε στη βάση δεδομένων.` });

    // 2. Τιμή επεξεργασίας από pricing
    const pricingQuery = finish ? { product: productName, finish } : { product: productName };
    const productPrice = await db.collection("pricing").findOne(pricingQuery);

    if (!productPrice)
      return res.status(404).json({
        error: finish
          ? `Δεν βρέθηκε τιμή για "${productName}" με φινίρισμα "${finish}".`
          : `Δεν βρέθηκε τιμή για "${productName}".`,
      });

    // 2α. processingCost
    let processingCost = 0;

    if (productPrice.priceTable) {
      if (!widthCm)
        return res.status(400).json({ error: "Το προϊόν αυτό χρειάζεται φάρδος (widthCm) για υπολογισμό τιμής." });
      processingCost = resolvePriceTable(productPrice.priceTable, widthCm);
    } else if (productPrice.price != null) {
      processingCost = productPrice.price;
    } else {
      if (productDoc?.category) {
        const route = await db.collection("production_routes").findOne({ category: productDoc.category });
        if (route?.machineCosts) {
          processingCost = Object.values(route.machineCosts)
            .filter((v) => v !== null && v !== undefined)
            .reduce((sum, v) => sum + v, 0);
        }
      }
    }

    // 3. Machine breakdown (NEW)
    let machineBreakdown = [];
    if (productDoc?.category) {
      const route = await db
        .collection("production_routes")
        .findOne({ category: productDoc.category });
      if (route) {
        machineBreakdown = await buildMachineBreakdown(db, route, overheadCosts);
      }
    }

    // 4. Συσκευασία
    let packagingAddon = 0;
    let packagingFlatFee = 0;

    if (packaging === "παλέτα") {
      packagingAddon =
        (isHammerLoad
          ? rawCost.irregularCladding_3_5cm?.palletAddon
          : rawCost.packaging?.palletAddonPerM2) ?? 1.0;
    } else if (packaging === "κιβώτιο") {
      packagingAddon =
        (isHammerLoad
          ? rawCost.irregularCladding_3_5cm?.crateAddon
          : rawCost.packaging?.crateAddonPerM2) ?? 4.0;
      packagingFlatFee =
        (isHammerLoad ? rawCost.crateFee : rawCost.packaging?.crateFlatFee) ?? 40.0;
    }

    // 5. Pressing flat fee
    const pressingFlatFee = isHammerLoad ? (rawCost.pressingFee ?? 0) : 0;

    // 6. Base cost
    const baseCost = isHammerLoad
      ? (rawCost.irregularCladding_3_5cm?.baseCostPerM2 ?? 0)
      : (rawCost.baseCostPerM2 ?? 0);

    // 7. Totals
    const totalPerM2NoTax = baseCost + processingCost + packagingAddon;
    const grandTotalNoTax = totalPerM2NoTax * quantity + packagingFlatFee + pressingFlatFee;
    const vatAmount = grandTotalNoTax * VAT_RATE;
    const grandTotalWithTax = grandTotalNoTax + vatAmount;

    res.json({
      breakdown: {
        baseCostPerM2: baseCost,
        processingCostPerM2: processingCost,
        packagingPerM2: packagingAddon,
        packagingFlatFee,
        pressingFlatFee,
        totalPerM2NoTax,
        quantity,
        isHammerLoad,
      },
      machineBreakdown,
      grandTotalNoTax: parseFloat(grandTotalNoTax.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      grandTotalWithTax: parseFloat(grandTotalWithTax.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: `Σφάλμα διακομιστή: ${err.message}` });
  }
});

export default router;
