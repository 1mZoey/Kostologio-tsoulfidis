import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const VAT_RATE = 0.24;

// --- Helpers ---

async function findMachine(db, machineName) {
  return await db.collection("machines").findOne({
    $or: [{ name: machineName }, { nameShort: machineName }],
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

// --- Routes ---

router.get("/available-finishes/:productName", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res
      .status(503)
      .json({ error: "Η βάση δεδομένων δεν είναι συνδεδεμένη." });

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
    const { productName, finish, source, quantity, packaging, widthCm } =
      req.body;
    const db = mongoose.connection.db;

    // 0. Check if this is a traded good (no production, just resale)
    const productDoc = await db
      .collection("products")
      .findOne({ name: productName });

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
        grandTotalNoTax: parseFloat(grandTotalNoTax.toFixed(2)),
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        grandTotalWithTax: parseFloat(grandTotalWithTax.toFixed(2)),
      });
    }

    // 1. Πρώτη ύλη — ψάξε raw_loads πρώτα, μετά hammer_loads
    let rawCost = await db.collection("raw_loads").findOne({ source });
    let isHammerLoad = false;

    if (!rawCost) {
      rawCost = await db.collection("hammer_loads").findOne({ source });
      isHammerLoad = !!rawCost;
    }

    if (!rawCost)
      return res.status(404).json({
        error: `Η πηγή "${source}" δεν βρέθηκε στη βάση δεδομένων.`,
      });

    // 2. Τιμή επεξεργασίας από pricing
    const pricingQuery = finish
      ? { product: productName, finish }
      : { product: productName };

    const productPrice = await db.collection("pricing").findOne(pricingQuery);

    if (!productPrice)
      return res.status(404).json({
        error: finish
          ? `Δεν βρέθηκε τιμή για "${productName}" με φινίρισμα "${finish}".`
          : `Δεν βρέθηκε τιμή για "${productName}".`,
      });

    // 2α. Υπολόγισε processingCost
    let processingCost = 0;

    if (productPrice.priceTable) {
      // Καπάκι: τιμή βάσει φάρδους
      if (!widthCm)
        return res.status(400).json({
          error:
            "Το προϊόν αυτό χρειάζεται φάρδος (widthCm) για υπολογισμό τιμής.",
        });
      processingCost = resolvePriceTable(productPrice.priceTable, widthCm);
    } else if (productPrice.price != null) {
      processingCost = productPrice.price;
    } else {
      // 2β. Fallback: άθροισε machineCosts από production_routes
      // Ψάξε το category από τη συλλογή products
      const productDoc = await db
        .collection("products")
        .findOne({ name: productName });

      if (productDoc?.category) {
        const route = await db
          .collection("production_routes")
          .findOne({ category: productDoc.category });

        if (route?.machineCosts) {
          processingCost = Object.values(route.machineCosts)
            .filter((v) => v !== null && v !== undefined)
            .reduce((sum, v) => sum + v, 0);
        }
      }
    }

    // 3. Συσκευασία
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
        (isHammerLoad ? rawCost.crateFee : rawCost.packaging?.crateFlatFee) ??
        40.0;
    }

    // 4. Πάγια κόστη για hammer_loads (pressingFee)
    const pressingFlatFee = isHammerLoad ? (rawCost.pressingFee ?? 0) : 0;

    // 5. Βασικό κόστος πρώτης ύλης ανά m²
    const baseCost = isHammerLoad
      ? (rawCost.irregularCladding_3_5cm?.baseCostPerM2 ?? 0)
      : (rawCost.baseCostPerM2 ?? 0);

    // 6. Υπολογισμοί
    const totalPerM2NoTax = baseCost + processingCost + packagingAddon;
    const grandTotalNoTax =
      totalPerM2NoTax * quantity + packagingFlatFee + pressingFlatFee;
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
      grandTotalNoTax: parseFloat(grandTotalNoTax.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      grandTotalWithTax: parseFloat(grandTotalWithTax.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: `Σφάλμα διακομιστή: ${err.message}` });
  }
});

export default router;
