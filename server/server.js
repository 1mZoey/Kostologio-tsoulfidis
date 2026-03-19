import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./Routes/Products.js";
import costRoutes from "./Routes/Costs.js";
import calculationRoutes from "./Routes/calculations.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running"));

app.use("/api/products", productRoutes);
app.use("/api/cost-items", costRoutes);
app.use("/api/calculations", calculationRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
