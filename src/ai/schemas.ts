export const questionSchema = {
  name: "generate_question",
  schema: {
    type: "object",
    properties: {
      question: { type: "string" },
      topic: { type: "string" },
      difficulty: {
        type: "string",
        enum: ["EASY", "MEDIUM", "HARD", "EXPERT"],
      },
    },
    required: ["question", "topic", "difficulty"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const evaluationSchema = {
  name: "evaluate_answer",
  schema: {
    type: "object",
    properties: {
      correctness: { type: "integer", minimum: 0, maximum: 100 },
      completeness: { type: "integer", minimum: 0, maximum: 100 },
      technicalDepth: { type: "integer", minimum: 0, maximum: 100 },
      clarity: { type: "integer", minimum: 0, maximum: 100 },
      overallScore: { type: "integer", minimum: 0, maximum: 100 },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      missingConcepts: { type: "array", items: { type: "string" } },
      nextAction: {
        type: "string",
        enum: [
          "FOLLOW_UP",
          "INCREASE_DIFFICULTY",
          "DECREASE_DIFFICULTY",
          "CHANGE_TOPIC",
          "END",
        ],
      },
    },
    required: [
      "correctness",
      "completeness",
      "technicalDepth",
      "clarity",
      "overallScore",
      "strengths",
      "weaknesses",
      "missingConcepts",
      "nextAction",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;