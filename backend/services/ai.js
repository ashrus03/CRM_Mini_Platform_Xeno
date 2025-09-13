import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const router = Router();

router.post("/suggest", async (req, res) => {
  const { objective } = req.body;
  if (!objective) {
    return res
      .status(400)
      .json({ success: false, message: "Objective is required" });
  }

  try {
    const businessName = "Mini-CRM";
    const prompt =
      `Write 3 catchy, friendly SMS messages for this campaign goal: "${objective}". ` +
      `The messages should be concise, engaging, and suitable for a business named "${businessName}". ` +
      `Make them 1-2 sentences long. Avoid emojis and do NOT include any placeholders like [link], URLs, or contact info. ` +
      `Return only a raw JSON array (no markdown).`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = (await model.generateContent(prompt)).response;
    const aiText = result.text().trim();
    const cleaned = aiText
      .replace(/^\s*```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const suggestions = JSON.parse(cleaned);

    return res.json({ success: true, data: { suggestions } });
  } catch (err) {
    console.error("Error generating message suggestions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate message suggestions",
    });
  }
});

export default router;
