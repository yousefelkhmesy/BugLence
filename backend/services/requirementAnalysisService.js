import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function cleanAiJson(content) {
  return String(content || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseAiJson(content) {
  const cleaned = cleanAiJson(content);

  if (!cleaned) {
    throw new Error("AI returned an empty requirement analysis response");
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid requirement analysis JSON:", cleaned);

    throw new Error(
      `Requirement analysis response was not valid JSON: ${error.message}`
    );
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

  if (analysisOptions?.ambiguities) {
    names.push("Ambiguities");
  }

  if (analysisOptions?.missingInfo) {
    names.push("Missing Information");
  }

  if (analysisOptions?.risks) {
    names.push("Risks");
  }

  if (analysisOptions?.testScenarios) {
    names.push("Suggested Test Scenarios");
  }

  if (analysisOptions?.edgeCases) {
    names.push("Edge Cases");
  }

  return names.join(", ");
}

export async function buildRequirementAnalysis(input) {
  const { requirement, analysisOptions } = input;

  try {
    const prompt = `
You are a Senior QA Engineer analyzing a software requirement before testing begins.

Analyze the provided requirement from a QA perspective.

AI recommendations are suggestions only.
The QA Engineer is responsible for final validation.

Selected analysis areas:
${selectedAnalysisNames(analysisOptions)}

DEFINITIONS:

Ambiguities:
Identify unclear, vague, contradictory, or open-to-interpretation statements.

Missing Information:
Identify important information required to correctly implement or test the requirement that is not specified.

Risks:
Identify realistic functional, integration, data, security, usability, performance, or implementation risks relevant to QA.

Suggested Test Scenarios:
Suggest concise high-level QA scenarios derived from the requirement.
Do not generate detailed execution steps.

Edge Cases:
Identify boundaries, exceptional states, unusual behavior, and less obvious scenarios worth testing.

OUTPUT RULES:

- Return exactly one valid JSON object.
- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not include comments.
- Do not include text before or after the JSON.
- Analyze only the selected areas.
- Return [] for every unselected area.
- Return [] when no meaningful finding exists.
- Avoid duplicate findings.
- Keep each finding concise and actionable.
- Do not invent unsupported product behavior.
- Generate a maximum of 8 findings per selected area.
- Prefer meaningful QA findings over quantity.

Required JSON structure:

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
          role: "system",
          content:
            "You are a Senior QA Engineer. Return valid JSON only and follow the requested JSON structure exactly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.1,

      max_completion_tokens: 5000,

      response_format: {
        type: "json_object",
      },
    });

    const choice = completion.choices?.[0];
    const content = choice?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty requirement analysis response");
    }

    if (choice?.finish_reason === "length") {
      throw new Error(
        "Requirement analysis exceeded the maximum output length"
      );
    }

    const parsed = parseAiJson(content);

    return normalizeRequirementAnalysis(
      parsed,
      analysisOptions
    );
  } catch (error) {
    console.error(
      "Requirement analysis generation failed:",
      error
    );

    const serviceError = new Error(
      "Requirement analysis generation failed"
    );

    serviceError.statusCode = 500;

    throw serviceError;
  }
}