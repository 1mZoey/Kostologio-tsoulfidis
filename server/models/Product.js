import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model("Product", ProductSchema, "products");
