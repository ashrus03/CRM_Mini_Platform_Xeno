import { Router } from "express";
import { ingestCustomers } from "../controllers/customer.controller.js";

const customerRouter = Router();

customerRouter.post("/", ingestCustomers);

export default customerRouter;
