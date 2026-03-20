import express from 'express';
import mongoose from 'mongoose';
import ProductionBatch from '../models/ProductionBatch.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([{
      _id: 'error_db',
      product: { name: 'Βάση Δεδομένων Μη Διαθέσιμη' },
      quantityProduced: 0,
      costs: [],
      totalCost: 0,
      costPerUnit: 0
    }]);
  }
  try {
    const batches = await ProductionBatch.find().populate('product');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantityProduced, costs } = req.body;

    const totalCost = costs.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const costPerUnit = quantityProduced > 0 ? totalCost / quantityProduced : 0;

    const batch = new ProductionBatch({
      product: productId,
      quantityProduced,
      costs,
      totalCost,
      costPerUnit
    });

    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ProductionBatch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Calculation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
