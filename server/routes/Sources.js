import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// GET all material sources (raw_loads + hammer_loads combined)
router.get("/", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: "Η βάση δεδομένων δεν είναι συνδεδεμένη." });

  try {
    const db = mongoose.connection.db;

    const [rawLoads, hammerLoads] = await Promise.all([
      db.collection("raw_loads").find({}).toArray(),
      db.collection("hammer_loads").find({}).toArray(),
    ]);

    // Tag each so the frontend knows which type it came from
    const tagged = [
      ...rawLoads.map((r) => ({ ...r, loadType: "raw" })),
      ...hammerLoads.map((h) => ({ ...h, loadType: "hammer" })),
    ];

    res.json(tagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;