import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
      throw new Error("Requirement analysis response was not valid JSON");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
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

function normalizeRequirementAnalysis(data, analysisOptions) {
  return {
    ambiguities: analysisOptions.ambiguities
      ? normalizeList(data?.ambiguities)
      : [],

    missingInfo: analysisOptions.missingInfo
      ? normalizeList(data?.missingInfo)
      : [],

    risks: analysisOptions.risks
      ? normalizeList(data?.risks)
      : [],

    testScenarios: analysisOptions.testScenarios
      ? normalizeList(data?.testScenarios)
      : [],

    edgeCases: analysisOptions.edgeCases
      ? normalizeList(data?.edgeCases)
      : [],
  };
}

function selectedAnalysisNames(analysisOptions) {
  const names = [];

  if (analysisOptions.ambiguities) {
    names.push("Ambiguities");
  }

  if (analysisOptions.missingInfo) {
    names.push("Missing Information");
  }

  if (analysisOptions.risks) {
    names.push("Risks");
  }

  if (analysisOptions.testScenarios) {
    names.push("Suggested Test Scenarios");
  }

  if (analysisOptions.edgeCases) {
    names.push("Edge Cases");
  }

  return names.join(", ");
}

export async function buildRequirementAnalysis(input) {
  const { requirement, analysisOptions } = input;

  try {
    const prompt = `
You are a Senior QA Engineer analyzing a software requirement before testing begins.

Your task is to review the provided requirement from a QA perspective and generate only the analysis requested by the user.

Design principle:
AI recommendations are suggestions only.
The QA Engineer is responsible for final validation.
Use the principle: AI Recommendation + Human Validation.

Generate only these selected analysis areas:
${selectedAnalysisNames(analysisOptions)}

Definitions:

Ambiguities:
Identify unclear, vague, contradictory, or open-to-interpretation statements.

Missing Information:
Identify information that may be required to correctly implement or test the requirement but is not specified.

Risks:
Identify realistic product, functional, integration, data, security, usability, or implementation risks relevant to testing.

Suggested Test Scenarios:
Suggest high-level QA test scenarios derived from the requirement.
Do not generate unnecessarily detailed test steps.

Edge Cases:
Identify boundary conditions, unusual user behavior, exceptional states, and less obvious scenarios worth testing.

Rules:
- Return valid JSON only.
- Do not return markdown.
- Do not invent confirmed product behavior that is not stated in the requirement.
- Clearly treat uncertain conclusions as suggestions.
- Be specific and actionable.
- Avoid duplicate findings.
- Use professional QA terminology.
- Analyze only the options selected by the user.
- For unselected analysis areas, return [].
- If no meaningful finding exists for a selected area, return [].

JSON format:
{
  "ambiguities": [],
  "missingInfo": [],
  "risks": [],
  "testScenarios": [],
  "edgeCases": []
}

Requirement:
${requirement}
`;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 1800,
    });

    const content = completion.choices[0].message.content;
    const parsed = parseAiJson(content);

    return normalizeRequirementAnalysis(parsed, analysisOptions);
  } catch (error) {
    console.error(error);

    const serviceError = new Error(
      "Requirement analysis generation failed"
    );

    serviceError.statusCode = 500;

    throw serviceError;
  }
}