import mongoose from "mongoose";

const CostItemSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["material", "labor", "energy", "transport", "other"]
  },

  costPerUnit: {
    type: Number,
    required: true
  }

});

export default mongoose.model("CostItem", CostItemSchema);