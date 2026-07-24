import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function normalizeTestCases(data) {
  const normalizeList = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.title &&
        Array.isArray(item.steps)
    );
  };

  return {
    positive: normalizeList(data?.positive),
    negative: normalizeList(data?.negative),
    edge: normalizeList(data?.edge),
    regression: normalizeList(data?.regression),
  };
}

export async function buildTestCases(bugReport) {
  try {
    const prompt = `
You are a Senior QA Engineer and Test Analyst.

Analyze the provided bug report and generate professional test cases.

Generate exactly:

- 2 Positive Test Cases
- 2 Negative Test Cases
- 1 Edge Test Case
- 1 Regression Test Case

Rules:
- Maximum 3 steps per test case.
- Keep titles short.
- Description must not duplicate title.
- Every test case must include an expected result.
- Expected result is mandatory and cannot be empty.
- Return valid JSON only.
- No markdown.
- No explanations.

Negative test cases must validate invalid, failed, or rejected scenarios and must not reproduce the original bug.

Each test case object must follow this schema:

{
  "title": "string",
  "description": "string",
  "steps": ["string"],
  "expectedResult": "string"
}

JSON format:

{
  "positive": [],
  "negative": [],
  "edge": [],
  "regression": []
}


Bug Report:
${JSON.stringify(bugReport, null, 2)}
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
  max_completion_tokens: 2000,
});

    const content = completion.choices[0].message.content;

const cleanedContent = content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

console.log(cleanedContent);

console.log("RAW AI RESPONSE =>", cleanedContent);

const parsed = JSON.parse(cleanedContent);

console.log("PARSED AI RESPONSE =>", parsed);

return normalizeTestCases(parsed);


} catch (error) {
    console.error(error);

    const serviceError = new Error("AI test case generation failed");
    serviceError.statusCode = 500;

    throw serviceError;
  }
}