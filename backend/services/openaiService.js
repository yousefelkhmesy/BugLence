import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function buildBugReport(input) {
  const { description, platform, os, browser, stage } = input;

  try {
    const prompt = `
You are a professional QA Engineer.

Generate a professional bug report using this exact JSON format:

{
  "title": "",
  "preconditions": [],
  "steps": [],
  "expected": "",
  "actual": "",
  "severity": "",
  "priority": ""
}

Rules:
- Output valid JSON only
- Do not add notes
- Do not add markdown
- Do not invent environment data
- Keep responses concise and professional
- Generate clear reproducible steps

Severity Rules:
- Crash = Critical
- Login/Payment issues = High
- Functional issues = Medium
- UI issues = Low

Description:
${description}

Environment:
Platform: ${platform}
Browser: ${browser || "N/A"}
OS: ${os}
Stage: ${stage}
`;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;

    return JSON.parse(content);
  } catch (error) {
    console.error(error);

    const serviceError = new Error("AI generation failed");
    serviceError.statusCode = 500;

    throw serviceError;
  }
}