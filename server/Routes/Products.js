import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const router = express.Router();

// Products.js - query directly like the others
router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    console.log('Products found:', products.length, products.map(p => p.name));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
