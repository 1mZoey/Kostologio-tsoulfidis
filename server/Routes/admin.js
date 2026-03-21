import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// GET all 4 active overhead costs
router.get("/overhead", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const costs = await db.collection("overhead_costs")
      .find({ validTo: null })
      .toArray();
    res.json(costs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a cost type
router.put("/overhead/:costType", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { perMonth } = req.body;
    const perDay = parseFloat((perMonth / 25).toFixed(4)); // 25 working days
    const today = new Date();

    // Close current active entry
    await db.collection("overhead_costs").updateOne(
      { costType: req.params.costType, validTo: null },
      { $set: { validTo: today } }
    );

    // Get old entry to carry over allocations
    const old = await db.collection("overhead_costs").findOne({
      costType: req.params.costType,
      validTo: today
    });

    // Insert new active entry
    await db.collection("overhead_costs").insertOne({
      costType: req.params.costType,
      perMonth,
      perDay,
      allocations: old?.allocations ?? {},
      validFrom: today,
      validTo: null
    });

    res.json({ success: true, perMonth, perDay });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
