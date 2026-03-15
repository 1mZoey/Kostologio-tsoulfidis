import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  unit: {
    type: String,
    default: "piece"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Product", ProductSchema);