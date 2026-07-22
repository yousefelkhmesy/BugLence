import { validateRequirementAnalysisRequest } from "../services/validationService.js";
import { buildRequirementAnalysis } from "../services/requirementAnalysisService.js";

export async function analyzeRequirement(req, res, next) {
  try {
    const validation = validateRequirementAnalysisRequest(req.body);

    if (validation.error) {
      return res.status(validation.statusCode).json({
        error: validation.error,
      });
    }

    const result = await buildRequirementAnalysis(validation.data);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Requirement analysis generation failed") {
      return res.status(500).json({
        error: "Requirement analysis generation failed",
      });
    }

    return next(error);
  }
}