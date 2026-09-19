import { describe, it, expect } from "vitest";
import { nextDifficulty, shouldEndInterview } from "./interview-engine";

describe("nextDifficulty", () => {
  it("increases difficulty by one level", () => {
    expect(nextDifficulty("EASY", "INCREASE_DIFFICULTY")).toBe("MEDIUM");
    expect(nextDifficulty("MEDIUM", "INCREASE_DIFFICULTY")).toBe("HARD");
    expect(nextDifficulty("HARD", "INCREASE_DIFFICULTY")).toBe("EXPERT");
  });

  it("clamps at EXPERT, the top of the ladder", () => {
    expect(nextDifficulty("EXPERT", "INCREASE_DIFFICULTY")).toBe("EXPERT");
  });

  it("decreases difficulty by one level", () => {
    expect(nextDifficulty("EXPERT", "DECREASE_DIFFICULTY")).toBe("HARD");
    expect(nextDifficulty("MEDIUM", "DECREASE_DIFFICULTY")).toBe("EASY");
  });

  it("clamps at EASY, the bottom of the ladder", () => {
    expect(nextDifficulty("EASY", "DECREASE_DIFFICULTY")).toBe("EASY");
  });

  it("stays the same on FOLLOW_UP or CHANGE_TOPIC", () => {
    expect(nextDifficulty("MEDIUM", "FOLLOW_UP")).toBe("MEDIUM");
    expect(nextDifficulty("HARD", "CHANGE_TOPIC")).toBe("HARD");
  });

  it("defaults to MEDIUM for an unrecognized starting difficulty", () => {
    expect(nextDifficulty("NOT_A_REAL_DIFFICULTY", "FOLLOW_UP")).toBe("MEDIUM");
  });
});

describe("shouldEndInterview", () => {
  it("ends when action is END", () => {
    expect(
      shouldEndInterview({ action: "END", questionsAskedSoFar: 2, maxQuestions: 8 })
    ).toBe(true);
  });

  it("ends when question count reaches the max", () => {
    expect(
      shouldEndInterview({ action: "FOLLOW_UP", questionsAskedSoFar: 8, maxQuestions: 8 })
    ).toBe(true);
  });

  it("does not end when under the max and action is not END", () => {
    expect(
      shouldEndInterview({ action: "FOLLOW_UP", questionsAskedSoFar: 3, maxQuestions: 8 })
    ).toBe(false);
  });

  it("ends even past the max, not just exactly at it", () => {
    expect(
      shouldEndInterview({ action: "INCREASE_DIFFICULTY", questionsAskedSoFar: 9, maxQuestions: 8 })
    ).toBe(true);
  });
});