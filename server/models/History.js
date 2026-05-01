import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  name:   { type: String, default: '' },
  inputs: {
    productName: String,
    finish:      String,
    source:      String,
    quantity:    Number,
    packaging:   String,
    widthCm:     Number,
    profitMargin: Number,
  },
  result:    { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'history' });

export default mongoose.model('History', historySchema);
