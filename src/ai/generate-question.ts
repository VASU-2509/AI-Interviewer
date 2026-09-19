import { openai, GROQ_MODEL, loggedCompletion } from "@/lib/openai";
import { questionSchema } from "@/ai/schemas";
import { withRetry } from "./with-retry";
import { getSkill } from "./skills";

export async function generateQuestion(params: {
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  targetRole: string;
  previousQuestions?: string[];
  resumeText?: string;
  followUpOn?: {
    question: string;
    answer: string;
    missingConcepts: string[];
  };
}) {
  const { topic, difficulty, targetRole, previousQuestions = [], resumeText, followUpOn } = params;

  const skill = getSkill(topic);

  const basePrompt = `You are a technical interviewer conducting a mock interview for a ${targetRole} position. The current topic is "${topic}" at ${difficulty} difficulty.`;

  const skillGuidance = skill ? ` ${skill.questionGuidance}` : "";

  const resumeInstruction = resumeText
    ? ` The candidate's resume is provided below.

RULES FOR USING THE RESUME (follow strictly):
1. You may mention a project name, or a technology/skill, ONLY if it is written verbatim in the resume text below.
2. Do NOT invent any implementation detail that is not explicitly written — this includes but is not limited to: database schemas, table names, column names, API endpoints, specific data models, architecture details, or scale/performance numbers. If the resume doesn't state it, you cannot reference it, even as a plausible example "based on" the project.
3. It is acceptable, and often better, to mention a project by name and then ask a general conceptual or scenario-based question on the topic that does NOT require assuming any unstated implementation detail. For example: "In your [Project Name], you worked with [technology explicitly listed]. Independent of how you actually built it, imagine a scenario where..." This lets you personalize the framing without fabricating facts.
4. If you cannot construct a question this way without inventing details, ignore the resume entirely and generate a standard question instead.

Resume:
"""${resumeText.slice(0, 3000)}"""`
    : "";

  const followUpInstruction = followUpOn
    ? `The candidate was just asked: "${followUpOn.question}" and answered: "${followUpOn.answer}". Their answer was missing these concepts: ${followUpOn.missingConcepts.join(", ") || "general depth"}. Generate a targeted follow-up question that probes specifically at what they missed, rather than a completely new topic.`
    : `Generate one new interview question on this topic. The question should be clear, specific, and appropriate for a real interview setting.`;

  const avoidRepeats = previousQuestions.length
    ? `Do not repeat or closely rephrase any of these previously asked questions: ${previousQuestions.map((q) => `"${q}"`).join(", ")}.`
    : "";

  const response = await withRetry(() =>
    loggedCompletion("generate_question", {
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `${basePrompt}${skillGuidance} ${followUpInstruction} ${avoidRepeats}${resumeInstruction}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: questionSchema,
      },
    })
  );

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content returned from model");

  return JSON.parse(content) as {
    question: string;
    topic: string;
    difficulty: string;
  };
}