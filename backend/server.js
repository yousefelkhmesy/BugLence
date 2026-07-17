import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bugRoutes from "./routes/bugRoutes.js";
import testCaseRoutes from "./routes/testCaseRoutes.js";
import aiInsightsRoutes from "./routes/aiInsightsRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", bugRoutes);
app.use("/", testCaseRoutes);
app.use("/", aiInsightsRoutes);

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message =
    status >= 500 ? "Internal server error" : err.message || "Request failed";

  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});