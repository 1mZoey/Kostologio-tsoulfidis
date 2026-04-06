import express from 'express';
import mongoose from 'mongoose';


const router = express.Router();

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1)
  return res.status(503).json({ error: 'Η βάση δεδομένων δεν είναι συνδεδεμένη.' });
  try {
    const db = mongoose.connection.db;
    const items = await db.collection('raw_loads')
      .find({ baseCostPerM2: { $exists: true } })
      .toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
