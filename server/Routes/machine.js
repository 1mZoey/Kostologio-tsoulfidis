import express from 'express';
import Machine from '../models/Machine.js';

const router = express.Router();

// GET /api/machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find({}).lean();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// POST /api/machines
router.post('/', async (req, res) => {
  try {
    const machine = await Machine.create(req.body);
    res.status(201).json(machine);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

// PUT /api/machines/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// DELETE /api/machines/:id
router.delete('/:id', async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

export default router;