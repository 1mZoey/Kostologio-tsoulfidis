import express from 'express';
import mongoose from 'mongoose';
import CostItem from '../models/CostItem.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { category } = req.query;

    const query = {};
    if (category) query.category = category;

    // For raw_load, only return ones with baseCostPerM2
    const items = await db.collection('Kostologio')
      .find({ 
        source: { $exists: true },
        baseCostPerM2: { $exists: true }  // ← only valid sources
      })
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
