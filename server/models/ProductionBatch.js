import mongoose from "mongoose";

const ProductionBatchSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  quantityProduced: Number,

  costs: [
    {
      costItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CostItem"
      },

      amountUsed: Number,
      totalCost: Number
    }
  ],

  totalCost: Number,

  costPerUnit: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("ProductionBatch", ProductionBatchSchema);