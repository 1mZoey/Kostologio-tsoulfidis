import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all history entries
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: 'Η βάση δεδομένων δεν είναι συνδεδεμένη.' });
  try {
    const db = mongoose.connection.db;
    const entries = await db.collection('history')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save a new quote to history
router.post('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: 'Η βάση δεδομένων δεν είναι συνδεδεμένη.' });
  try {
    const db = mongoose.connection.db;
    const entry = {
      ...req.body,
      createdAt: new Date(),
    };
    const result = await db.collection('history').insertOne(entry);
    res.status(201).json({ _id: result.insertedId, ...entry });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a history entry by id
router.delete('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: 'Η βάση δεδομένων δεν είναι συνδεδεμένη.' });
  try {
    const db = mongoose.connection.db;
    const { ObjectId } = mongoose.Types;
    await db.collection('history').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Η εγγραφή διαγράφηκε.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;