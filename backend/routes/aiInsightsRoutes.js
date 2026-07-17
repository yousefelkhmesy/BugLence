import { Router } from "express";
import { generateAiInsights } from "../controllers/aiInsightsController.js";

const router = Router();

router.post("/api/ai-insights", generateAiInsights);

export default router;