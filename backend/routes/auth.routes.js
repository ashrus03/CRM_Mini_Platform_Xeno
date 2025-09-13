import { Router } from "express";
import { authenticateUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/google", authenticateUser);

export default authRouter;
