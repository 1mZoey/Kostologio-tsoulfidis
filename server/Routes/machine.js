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

export default router;