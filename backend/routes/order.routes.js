import { Router } from "express";
import { ingestOrders } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", ingestOrders);

export default orderRouter;
