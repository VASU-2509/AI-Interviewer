import "dotenv/config";
import { evaluateAnswer } from "@/ai/evaluate-answer";
import { evalDataset } from "./dataset";

async function runEval() {
  console.log(`Running ${evalDataset.length} eval cases...\n`);

  let passed = 0;
  const failures: string[] = [];

  for (const testCase of evalDataset) {
    const result = await evaluateAnswer({
      question: testCase.question,
      answer: testCase.answer,
      topic: testCase.topic,
      difficulty: testCase.difficulty,
    });

    const [min, max] = testCase.expectedScoreRange;
    const scoreInRange = result.overallScore >= min && result.overallScore <= max;
    const actionAcceptable = testCase.acceptableActions.includes(result.nextAction);
    const casePassed = scoreInRange && actionAcceptable;

    const status = casePassed ? "PASS" : "FAIL";
    console.log(
      `[${status}] ${testCase.id} — score: ${result.overallScore} (expected ${min}-${max}), action: ${result.nextAction} (expected one of ${testCase.acceptableActions.join(", ")})`
    );

    if (casePassed) {
      passed++;
    } else {
      failures.push(
        `${testCase.id}: ${testCase.rationale}\n  Got score=${result.overallScore}, action=${result.nextAction}`
      );
    }
  }

  console.log(`\n${passed}/${evalDataset.length} passed.\n`);

  if (failures.length > 0) {
    console.log("--- Failures ---");
    failures.forEach((f) => console.log(f + "\n"));
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

runEval().catch((err) => {
  console.error("Eval run crashed:", err);
  process.exit(1);
});