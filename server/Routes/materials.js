import express from 'express';
import Material from '../models/Material.js';

const router = express.Router();

// GET /api/materials
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find({}).sort({ source: 1 }).lean();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// POST /api/materials
router.post('/', async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// PUT /api/materials/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;