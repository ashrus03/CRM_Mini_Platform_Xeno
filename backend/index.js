import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./config/db.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import authRoutes from "./routes/auth.routes.js";
import aiRouter from "./services/ai.js";
import vendorRouter from "./routes/vendor.routes.js";
import { authenticateJWT } from "./middlewares/auth.js";
import setupSwagger from "./docs/swagger.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      `${process.env.BASE_URL_FRONTEND}`,
      `${process.env.BASE_URL_BACKEND}`,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDB();

// Public API routes
app.use("/api/auth", authRoutes);

// Protected API routes
app.use("/api/customers", authenticateJWT, customerRoutes);
app.use("/api/orders", authenticateJWT, orderRoutes);
app.use("/api/campaigns", authenticateJWT, campaignRoutes);
app.use("/api/ai", authenticateJWT, aiRouter);
app.use("/api/vendor", vendorRouter);

setupSwagger(app);

// Health check
app.get("/health", async (req, res) => {
  try {
    await User.findOne({}, "_id").lean();
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("MongoDB connection failed");
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Mini CRM Backend API is Running");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
