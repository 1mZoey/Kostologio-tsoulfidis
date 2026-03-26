import express from 'express';
import mongoose from 'mongoose';
import CostItem from '../models/CostItem.js';

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




router.post('/', async (req, res) => {
  try {
    const item = new CostItem(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await CostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cost item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
