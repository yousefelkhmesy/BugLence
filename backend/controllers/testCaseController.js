import { validateTestCaseRequest } from "../services/validationService.js";
import { buildTestCases } from "../services/testCaseService.js";

export async function generateTestCases(req, res, next) {
  try {
    const validation = validateTestCaseRequest(req.body);

    if (validation.error) {
      return res.status(validation.statusCode).json({
        error: validation.error,
      });
    }

    const result = await buildTestCases(validation.data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "AI test case generation failed") {
      return res.status(500).json({
        error: "AI test case generation failed",
      });
    }

    return next(error);
  }
}