import express from "express";
import CostItem from "../models/CostItem.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/calculate", async (req, res) => {
  try {
    const { productName, finish, source, quantity, packaging } = req.body;

    const db = mongoose.connection.db;

    const allSources = await db
      .collection("Kostologio") // ← .collection not .connection
      .find({ thicknessCm: { $exists: true } }) // ← thicknessCm not thinknessCm
      .toArray();
    console.log(
      "Available sources:",
      allSources.map((s) => s.source),
    );
    console.log("Looking for source:", source);
    // 1. Get raw material base cost

    const rawCost = await db.collection("Kostologio").findOne({
      source: source,
      thicknessCm: { $exists: true },
    });

    if (!rawCost) return res.status(404).json({ error: "Πηγή δεν βρέθηκε" });

    console.log("Looking for product: ", { productName, finish });
    // 2. Get product processing price
    let productPrice;

    if (finish) {
      productPrice = await db.collection("Kostologio").findOne({
        product: productName,
        finish: finish,
      });
    } else {
      // Try item field first, then product field without finish
      productPrice = await db.collection("Kostologio").findOne({
        $or: [
          { item: productName },
          { product: productName, finish: { $exists: false } },
        ],
      });
    }

    // Handle both price and basePrice fields
    const processingCost =
      productPrice?.price ??
      productPrice?.basePrice ??
      productPrice?.barrelPrice ??
      0;

    console.log("productPrice found:", productPrice);

    if (!productPrice)
      return res.status(404).json({ error: "Προϊόν δεν βρέθηκε" });

    // 3. Packaging addon
    let packagingAddon = 0;
    let packagingFlatFee = 0;

    if (packaging === "παλέτα") {
      packagingAddon = rawCost.packaging?.palletAddonPerM2 || 1.0;
    } else if (packaging === "κιβώτιο") {
      packagingAddon = rawCost.packaging?.crateAddonPerM2 || 4.0;
      packagingFlatFee = rawCost.packaging?.crateFlatFee || 40.0;
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
