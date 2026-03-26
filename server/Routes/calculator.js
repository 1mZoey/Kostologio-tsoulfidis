import express from "express";
import CostItem from "../models/CostItem.js";
import mongoose from "mongoose";

const router = express.Router();
const VAT_RATE = 0.24;

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
  const finishes = entries.map((e) => e.finish).filter(Boolean);
  res.json(finishes);
});

router.post("/calculate", async (req, res) => {
  try {
    const { productName, finish, source, quantity, packaging } = req.body;
    const db = mongoose.connection.db;

    // 1. Raw material cost
    const rawCost = await db.collection("raw_loads").findOne({ source });
    if (!rawCost)
      return res.status(404).json({
        error: `Η πηγή "${source}" δεν βρέθηκε στη βάση δεδομένων.`,
      });

    // 2. Product price
    let productPrice;
    if (finish) {
      productPrice = await db
        .collection("pricing")
        .findOne({ product: productName, finish });
    } else {
      productPrice = await db
        .collection("pricing")
        .findOne({ product: productName });
    }

    if (!productPrice)
      return res.status(404).json({
        error: finish
          ? `Δεν βρέθηκε τιμή για "${productName}" με φινίρισμα "${finish}".`
          : `Δεν βρέθηκε τιμή για "${productName}".`,
      });

    const processingCost = productPrice?.price ?? productPrice?.basePrice ?? 0;

    // 3. Packaging
    let packagingAddon = 0;
    let packagingFlatFee = 0;
    if (packaging === "παλέτα") {
      packagingAddon = rawCost.packaging?.palletAddonPerM2 ?? 1.0;
    } else if (packaging === "κιβώτιο") {
      packagingAddon = rawCost.packaging?.crateAddonPerM2 ?? 4.0;
      packagingFlatFee = rawCost.packaging?.crateFlatFee ?? 40.0;
    }

    // 4. Calculate
    const baseCost = rawCost.baseCostPerM2;
    const totalPerM2NoTax = baseCost + processingCost + packagingAddon;
    const grandTotalNoTax = totalPerM2NoTax * quantity + packagingFlatFee;
    const vatAmount = grandTotalNoTax * VAT_RATE;
    const grandTotalWithTax = grandTotalNoTax + vatAmount;

    res.json({
      breakdown: {
        baseCostPerM2: baseCost,
        processingCostPerM2: processingCost,
        packagingPerM2: packagingAddon,
        packagingFlatFee,
        totalPerM2NoTax,
        quantity,
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
