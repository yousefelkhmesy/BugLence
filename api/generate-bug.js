import { generateBugReport } from "../backend/controllers/bugController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  return generateBugReport(req, res, (error) => {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  });
}