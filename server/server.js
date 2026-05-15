import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import productRoutes from "./routes/Products.js";
import costRoutes from "./routes/Costs.js";
import historyRoutes from "./routes/History.js";
import machineRoutes from "./routes/machine.js";
import calculatorRouter from "./routes/calculator.js";
import adminRouter from "./routes/admin.js";
import sourcesRouter from "./routes/Sources.js";
import materialsRouter from "./routes/materials.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.resourcesPath, ".env")
    : path.resolve(__dirname, "./.env");

dotenv.config({ path: envPath });

import fs from "fs";

export async function startServer(PORT = process.env.PORT || 5000) {
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
  app.use("/api/materials", materialsRouter);
  app.use("/api/admin", adminRouter);

  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    throw error;
  }
}

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
