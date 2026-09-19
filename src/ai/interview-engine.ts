const DIFFICULTY_LADDER = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
type Difficulty = (typeof DIFFICULTY_LADDER)[number];

export function nextDifficulty(current: string, action: string): Difficulty {
  const index = DIFFICULTY_LADDER.indexOf(current as Difficulty);
  const safeIndex = index === -1 ? 1 : index; // default to MEDIUM if unknown

  if (action === "INCREASE_DIFFICULTY") {
    return DIFFICULTY_LADDER[Math.min(safeIndex + 1, DIFFICULTY_LADDER.length - 1)];
  }
  if (action === "DECREASE_DIFFICULTY") {
    return DIFFICULTY_LADDER[Math.max(safeIndex - 1, 0)];
  }
  return DIFFICULTY_LADDER[safeIndex]; // FOLLOW_UP, CHANGE_TOPIC, or unrecognized: stay put
}

export function shouldEndInterview(params: {
  action: string;
  questionsAskedSoFar: number;
  maxQuestions: number;
}): boolean {
  const { action, questionsAskedSoFar, maxQuestions } = params;
  return action === "END" || questionsAskedSoFar >= maxQuestions;
}