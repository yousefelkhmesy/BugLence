import { validateAiInsightsRequest } from "../services/validationService.js";
import { buildAiInsights } from "../services/aiInsightsService.js";

export async function generateAiInsights(req, res, next) {
  try {
    const validation = validateAiInsightsRequest(req.body);

    if (validation.error) {
      return res.status(validation.statusCode).json({
        error: validation.error,
      });
    }

    const result = await buildAiInsights(validation.data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "AI insights generation failed") {
      return res.status(500).json({
        error: "AI insights generation failed",
      });
    }

    return next(error);
  }
}