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
      throw new Error("AI response was not valid JSON");
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

function normalizePriority(value) {
  const priority = normalizeString(value);

  return ["Low", "Medium", "High", "Critical"].includes(priority)
    ? priority
    : "Medium";
}

function normalizeType(value) {
  const type = normalizeString(value);

  return ["Positive", "Negative", "Edge Case", "Regression"].includes(type)
    ? type
    : "Positive";
}

function normalizeTestCase(testCase, index) {
  return {
    id: `TC-${String(index + 1).padStart(3, "0")}`,
    title: normalizeString(testCase?.title) || `Test Case ${index + 1}`,
    type: normalizeType(testCase?.type),
    priority: normalizePriority(testCase?.priority),
    preconditions: normalizeList(testCase?.preconditions),
    steps: normalizeList(testCase?.steps),
    expectedResult: normalizeString(testCase?.expectedResult),
  };
}

function normalizeResponse(data) {
  const testCases = Array.isArray(data?.testCases)
    ? data.testCases
    : [];

  return {
    testCases: testCases.map(normalizeTestCase),
  };
}

function selectedTypes(testTypes) {
  const types = [];

  if (testTypes.positive) types.push("Positive");
  if (testTypes.negative) types.push("Negative");
  if (testTypes.edge) types.push("Edge Case");
  if (testTypes.regression) types.push("Regression");

  return types;
}

export async function generateRequirementTestCases(input) {
  const { context, testTypes } = input;

  const types = selectedTypes(testTypes);

  try {
    const prompt = `
You are a Senior QA Engineer specializing in professional test design.

Generate executable manual test cases based strictly on the provided requirement, user story, acceptance criteria, or feature description.

Selected test case types:
${types.join(", ")}

Design principle:
AI generates test suggestions.
A QA Engineer reviews, edits, validates, and approves them before execution.

Requirements:

- Generate only the selected test case types.
- Generate useful, non-duplicate test cases.
- Prioritize meaningful test coverage over generating a large number of cases.
- Keep each test case independently executable where practical.
- Use clear professional QA terminology.
- Do not invent unsupported product behavior as confirmed fact.
- If assumptions are necessary, keep them reasonable and visible through the test case context.
- Steps must be specific and executable.
- Expected results must be observable and testable.
- Avoid vague expected results such as "works correctly".
- Do not duplicate the same scenario across multiple test types.
- Include boundary and unusual behavior under Edge Case when selected.
- Regression cases should focus on existing functionality that could reasonably be affected.
- Priority must represent testing importance and potential product impact.

Allowed test case types:
- Positive
- Negative
- Edge Case
- Regression

Allowed priority values:
- Low
- Medium
- High
- Critical

Return valid JSON only.
Do not return markdown.
Do not include explanations outside the JSON.

Return this exact structure:

{
  "testCases": [
    {
      "title": "Verify...",
      "type": "Positive",
      "priority": "High",
      "preconditions": [
        "..."
      ],
      "steps": [
        "...",
        "..."
      ],
      "expectedResult": "..."
    }
  ]
}

Test Context:

${context}
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
      max_completion_tokens: 3500,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty response");
    }

    const parsed = parseAiJson(content);

    return normalizeResponse(parsed);
  } catch (error) {
    console.error("Requirement test case generation failed:", error);

    const serviceError = new Error(
      "Test case generation failed"
    );

    serviceError.statusCode = 500;

    throw serviceError;
  }
}