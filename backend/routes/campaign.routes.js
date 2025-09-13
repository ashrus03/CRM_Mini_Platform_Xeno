import { Router } from "express";
import {
  createCampaign,
  getCampaignHistory,
  previewAudienceSize,
} from "../controllers/campaign.controller.js";

const router = Router();

router.get("/history", getCampaignHistory);
router.post("/", createCampaign);
router.post("/preview", previewAudienceSize);

export default router;
