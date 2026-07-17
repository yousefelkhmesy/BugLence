import { Router } from "express";
import { generateTestCases } from "../controllers/testCaseController.js";

const router = Router();

router.post("/generate-test-cases", generateTestCases);

export default router;