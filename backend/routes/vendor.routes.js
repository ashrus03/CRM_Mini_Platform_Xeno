import { Router } from "express";
import {
  simulateDelivery,
  updateLog,
} from "../controllers/vendor.controller.js";

const vendorRouter = Router();

vendorRouter.post("/send", simulateDelivery);
vendorRouter.post("/receipt", updateLog);

export default vendorRouter;
