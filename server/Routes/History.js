import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const db = () => mongoose.connection.db;
const notConnected = (res) => res.status(503).json({ error: 'Η βάση δεδομένων δεν είναι συνδεδεμένη.' });

// GET all
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return notConnected(res);
  try {
    const entries = await db().collection('history').find({}).sort({ createdAt: -1 }).toArray();
    res.json(entries);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST save new
router.post('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return notConnected(res);
  try {
    const entry = { ...req.body, createdAt: new Date() };
    const result = await db().collection('history').insertOne(entry);
    res.status(201).json({ _id: result.insertedId, ...entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST bulk delete
router.post('/bulk-delete', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return notConnected(res);
  try {
    const { ids } = req.body;
    const { ObjectId } = mongoose.Types;
    await db().collection('history').deleteMany({
      _id: { $in: ids.map(id => new ObjectId(id)) }
    });
    res.json({ message: `${ids.length} εγγραφές διαγράφηκαν.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update existing entry
router.put('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return notConnected(res);
  try {
    const { ObjectId } = mongoose.Types;
    const updated = { ...req.body, updatedAt: new Date() };
    await db().collection('history').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updated }
    );
    res.json({ _id: req.params.id, ...updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE single
router.delete('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return notConnected(res);
  try {
    const { ObjectId } = mongoose.Types;
    await db().collection('history').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Η εγγραφή διαγράφηκε.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
