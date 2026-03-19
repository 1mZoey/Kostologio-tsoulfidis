import express from 'express';
import mongoose from 'mongoose';
import CostItem from '../models/CostItem.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([{ _id: 'error_db', name: 'Βάση Δεδομένων Μη Διαθέσιμη', type: 'System', unit: 'N/A', costPerUnit: 0 }]);
  }
  try {
    const items = await CostItem.find();
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
