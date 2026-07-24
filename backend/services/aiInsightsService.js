import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const allowedSeverity = new Set(["Low", "Medium", "High", "Critical", "Blocker"]);
const allowedPriority = new Set(["Low", "Medium", "High", "Urgent"]);

function cleanAiJson(content) {
  return String(content || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function parseAiJson(content) {
  const cleaned = cleanAiJson(content);

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI insights response was not valid JSON");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeConfidence(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function normalizeAiInsights(data, enabledInsights) {
  const severity = normalizeString(data?.suggestedSeverity);
  const priority = normalizeString(data?.suggestedPriority);

  return {
    suggestedSeverity: enabledInsights.severity && allowedSeverity.has(severity) ? severity : null,
    suggestedPriority: enabledInsights.priority && allowedPriority.has(priority) ? priority : null,
    confidence: normalizeConfidence(data?.confidence),
    reasoning: normalizeString(data?.reasoning),
    suggestedRootCause: enabledInsights.rootCause ? normalizeList(data?.suggestedRootCause) : [],
    suggestedFix: enabledInsights.fix ? normalizeList(data?.suggestedFix) : [],
    regressionScope: enabledInsights.regressionScope ? normalizeList(data?.regressionScope) : [],
  };
}

function selectedInsightNames(enabledInsights) {
  const names = [];

  if (enabledInsights.severity) names.push("Suggested Severity");
  if (enabledInsights.priority) names.push("Suggested Priority");
  if (enabledInsights.rootCause) names.push("Suggested Root Cause");
  if (enabledInsights.fix) names.push("Suggested Fix");
  if (enabledInsights.regressionScope) names.push("Regression Scope");

  return names.join(", ");
}

export async function buildAiInsights(input) {
  const { bugDescription, platform, os, browser, enabledInsights } = input;

  try {
    const prompt = `
You are a Senior QA Engineer and Product Triage Analyst.

Analyze the bug context and generate AI-powered triage recommendations.

Design principle:
AI recommendations are suggestions only. Final decisions are made by QA Engineers or Product Owners.
Use the principle: AI Recommendation + Human Validation.

Generate only these selected insights:
${selectedInsightNames(enabledInsights)}

Allowed severity values:
- Low
- Medium
- High
- Critical
- Blocker

Allowed priority values:
- Low
- Medium
- High
- Urgent

Rules:
- Return valid JSON only.
- Do not return markdown.
- Do not present root causes as facts.
- Suggested root causes must be possible causes only.
- Use professional QA terminology.
- Confidence must be an integer from 0 to 100.
- If an insight is not selected, return null for scalar fields or [] for arrays.

JSON format:
{
  "suggestedSeverity": null,
  "suggestedPriority": null,
  "confidence": 0,
  "reasoning": "",
  "suggestedRootCause": [],
  "suggestedFix": [],
  "regressionScope": []
}

Bug Context:
Description: ${bugDescription}
Platform: ${platform}
OS: ${os}
Browser: ${browser || "N/A"}
`;

   const completion = await client.chat.completions.create({
  model: "openai/gpt-oss-20b",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  reasoning_effort: "low",
  temperature: 0.1,
  max_completion_tokens: 1500,
});

    const content = completion.choices[0].message.content;
    const parsed = parseAiJson(content);

    return normalizeAiInsights(parsed, enabledInsights);
  } catch (error) {
    console.error(error);

    const serviceError = new Error("AI insights generation failed");
    serviceError.statusCode = 500;

    throw serviceError;
  }
}