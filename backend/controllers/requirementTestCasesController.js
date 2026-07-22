import { generateRequirementTestCases } from "../services/requirementTestCasesService.js";
import { validateRequirementTestCasesRequest } from "../services/validationService.js";

export async function generateRequirementTestCasesController(req, res) {
  try {
    const validation = validateRequirementTestCasesRequest(req.body);

    if (validation.error) {
      return res.status(validation.statusCode || 400).json({
        error: validation.error,
      });
    }

    const result = await generateRequirementTestCases(validation.data);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Requirement test cases controller error:", error);

    return res.status(error.statusCode || 500).json({
      error: error.message || "Test case generation failed.",
    });
  }
}