import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    loadType: { type: String, enum: ['per_load', 'per_m3'], required: true },
    pricePerLoad: Number,
    pricePerM3: Number,
    estimatedM3: Number,
    baseCostPerM2: Number,
    currency: { type: String, default: 'EUR' },
    notes: String,
  },
  {
    collection: 'raw_loads',
    timestamps: true,
  }
);

const Material = mongoose.model('Material', materialSchema);
export default Material;