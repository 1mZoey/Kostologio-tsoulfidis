import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/Products.js";
import costRoutes from "./routes/Costs.js";
import historyRoutes from "./routes/History.js";
import machineRoutes from "./routes/machine.js";
import calculatorRouter from "./routes/calculator.js";
import adminRouter from "./routes/admin.js";
import sourcesRouter from "./routes/Sources.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running"));

app.use("/api/products", productRoutes);
app.use("/api/cost-items", costRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/calculator", calculatorRouter);
app.use("/api/machines", machineRoutes);
app.use("/api/sources", sourcesRouter);
app.use("/api/admin", adminRouter);

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
