import { openai, GROQ_MODEL, loggedCompletion } from "@/lib/openai";
import { evaluationSchema } from "@/ai/schemas";
import { withRetry } from "./with-retry";
import { getSkill } from "./skills";

export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  topic: string;
  difficulty: string;
}) {
  const { question, answer, topic, difficulty } = params;

  const skill = getSkill(topic);
  const skillGuidance = skill ? `\n\n${skill.evaluationGuidance}` : "";

  const response = await withRetry(() =>
    loggedCompletion("evaluate_answer", {
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `You are evaluating a candidate's answer in a mock technical interview.

Topic: ${topic}
Difficulty: ${difficulty}
Question: "${question}"
Candidate's answer: "${answer}"

Evaluate the answer on correctness, completeness, technical depth, and clarity (each 0-100). Identify specific strengths, weaknesses, and missing concepts. Then decide the next action using these rules, in order:

1. If overallScore is 85 or higher AND correctness is 85 or higher: choose INCREASE_DIFFICULTY, even if minor concepts were missed. Do not require a perfect or exhaustive answer to escalate — real interviewers move on from strong answers.
2. If overallScore is below 40: choose DECREASE_DIFFICULTY.
3. If the answer is on-topic but missing 1-2 significant concepts and scored between 40-84: choose FOLLOW_UP.
4. Choose CHANGE_TOPIC only if this exact topic has already been followed up on multiple times with strong answers.
5. Choose END only if explicitly nearing the end of a full interview (not applicable in isolated testing).

Be a fair but rigorous interviewer. Do not inflate scores. But also do not endlessly follow up on answers that are already strong — recognize mastery when correctness and overall score are both high, and move the candidate forward.${skillGuidance}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: evaluationSchema,
      },
    })
  );

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content returned from model");

  return JSON.parse(content) as {
    correctness: number;
    completeness: number;
    technicalDepth: number;
    clarity: number;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
    nextAction: string;
  };
}