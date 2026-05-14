import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// GET all 4 active overhead costs
router.get("/overhead", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res
      .status(503)
      .json({ error: "Η βάση δεδομένων δεν είναι συνδεδεμένη." });
  try {
    const costs = await mongoose.connection.db
      .collection("overhead_costs")
      .find({})
      .toArray();
    res.json(costs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a cost type
router.put("/overhead/:type", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res
      .status(503)
      .json({ error: "Η βάση δεδομένων δεν είναι συνδεδεμένη." });
  try {
    const { monthlyEUR } = req.body;
    const dailyEUR = parseFloat((monthlyEUR / 25).toFixed(4));
    await mongoose.connection.db
      .collection("overhead_costs")
      .updateOne(
        { type: req.params.type },
        { $set: { monthlyEUR: parseFloat(monthlyEUR), dailyEUR } },
      );
    res.json({ success: true, monthlyEUR, dailyEUR });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — add new overhead entry
router.post("/overhead", async (req, res) => {
  try {
    const { type, label, monthlyEUR } = req.body;
    const dailyEUR = parseFloat((monthlyEUR / 25).toFixed(4));
    await mongoose.connection.db.collection("overhead_costs").insertOne({
      type,
      label,
      monthlyEUR: parseFloat(monthlyEUR),
      dailyEUR,
      allocations: {},
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — rename label only
router.patch("/overhead/:type/label", async (req, res) => {
  try {
    await mongoose.connection.db
      .collection("overhead_costs")
      .updateOne(
        { type: req.params.type },
        { $set: { label: req.body.label } },
      );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove entry
router.delete("/overhead/:type", async (req, res) => {
  try {
    await mongoose.connection.db
      .collection("overhead_costs")
      .deleteOne({ type: req.params.type });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
