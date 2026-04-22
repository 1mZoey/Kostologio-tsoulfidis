import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  name: String,
  nameShort: String,
  machineKey: String,

  // Cost fields — different machines use different ones
  costPerM2: Number,
  costPerM2_stone: Number,
  costPerM2_marble: Number,
  costPerM2_stone_alt: Number,
  costPerM_primary: Number,
  costPerM_secondary: Number,

  // Output & labour
  dailyOutputM2: Number,
  workers: Number,
  dailyWageEUR: Number,

  // Overhead allocation percentages
  overheadAllocation: {
    electricity_pct: Number,
    diamond_pct: Number,
    consumables_pct: Number,
    maintenance_pct: Number,
  },

  notes: String,
}, {
  collection: 'machines',  // matches your MongoDB collection name exactly
});

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;