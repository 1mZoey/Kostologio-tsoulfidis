import express from "express";
import CostItem from "../models/CostItem.js";
import mongoose from "mongoose";

const router = express.Router();

router.get('/available-finishes/:productName', async (req, res) => {
  const db = mongoose.connection.db;
  const entries = await db.collection('pricing')
    .find({ product: req.params.productName })
    .toArray();
  const finishes = entries.map(e => e.finish).filter(Boolean);
  res.json(finishes);
});

router.post("/calculate", async (req, res) => {
  try {
    const { productName, finish, source, quantity, packaging } = req.body;
    const db = mongoose.connection.db;

    // 1. Get raw material base cost from raw_loads
    const rawCost = await db.collection("raw_loads").findOne({ source });
    if (!rawCost) return res.status(404).json({ error: "Πηγή δεν βρέθηκε" });

    // 2. Get product processing price from pricing
    let productPrice;
    if (finish) {
      productPrice = await db.collection("pricing").findOne({
        product: productName,
        finish
      });
    } else {
      productPrice = await db.collection("pricing").findOne({
        product: productName
      });
    }

    if (!productPrice)
      return res.status(404).json({ error: "Προϊόν δεν βρέθηκε" });

    const processingCost = productPrice?.price ?? productPrice?.basePrice ?? 0;

    // 3. Packaging addon
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
    const totalPerM2 = baseCost + processingCost + packagingAddon;
    const grandTotal = totalPerM2 * quantity + packagingFlatFee;

    res.json({
      breakdown: {
        baseCostPerM2: baseCost,
        processingCostPerM2: processingCost,
        packagingPerM2: packagingAddon,
        packagingFlatFee,
        totalPerM2,
        quantity,
      },
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
