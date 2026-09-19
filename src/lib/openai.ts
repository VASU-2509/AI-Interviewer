import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_MODEL = "openai/gpt-oss-120b";

export async function loggedCompletion(
  purpose: string,
  params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
) {
  const start = Date.now();
  try {
    const response = await openai.chat.completions.create(params);
    const latencyMs = Date.now() - start;

    await prisma.llmCallLog
      .create({
        data: {
          purpose,
          model: params.model,
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          latencyMs,
          succeeded: true,
        },
      })
      .catch((err: unknown) => console.error("Failed to log LLM call:", err));

    return response;
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    await prisma.llmCallLog
      .create({
        data: {
          purpose,
          model: params.model,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs,
          succeeded: false,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
      })
      .catch((logErr: unknown) => console.error("Failed to log LLM call:", logErr));

    throw err;
  }
}