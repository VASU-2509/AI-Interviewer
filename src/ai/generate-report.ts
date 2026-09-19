import { openai, GROQ_MODEL } from "@/lib/openai";
import { withRetry } from "./with-retry";

const reportSchema = {
  name: "generate_report",
  schema: {
    type: "object",
    properties: {
      overallScore: { type: "integer", minimum: 0, maximum: 100 },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      studyPlan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer" },
            focus: { type: "string" },
          },
          required: ["day", "focus"],
          additionalProperties: false,
        },
      },
    },
    required: ["overallScore", "strengths", "weaknesses", "studyPlan"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export async function generateReport(params: {
  targetRole: string;
  topic: string;
  qaHistory: {
    question: string;
    answer: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
  }[];
}) {
  const { targetRole, topic, qaHistory } = params;

  const historyText = qaHistory
    .map(
      (qa, i) =>
        `Q${i + 1} (score: ${qa.overallScore}): ${qa.question}\nAnswer: ${qa.answer}\nWeaknesses: ${qa.weaknesses.join(", ") || "none"}\nMissing: ${qa.missingConcepts.join(", ") || "none"}`
    )
    .join("\n\n");

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `You are generating a final performance report for a candidate who just completed a mock interview for a ${targetRole} position on the topic "${topic}".

Here is the full question-by-question history:

${historyText}

Generate:
1. An overallScore (0-100) reflecting their performance across the whole interview, not just an average — weigh later questions slightly more since they reflect adapted difficulty.
2. A list of specific strengths demonstrated across the interview (not generic praise).
3. A list of specific weaknesses, based on recurring gaps you see across multiple answers, not just restating one answer's flaws.
4. A studyPlan: an array of 3-5 days, each with a specific, actionable focus area addressing the weaknesses you identified. Be concrete (e.g., "Practice explaining ACID properties with real transaction examples" not "Study databases more").`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: reportSchema,
      },
    })
  );

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content returned from model");

  return JSON.parse(content) as {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    studyPlan: { day: number; focus: string }[];
  };
}