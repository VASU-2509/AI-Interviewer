import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function cleanup() {
  const deletedEvaluations = await prisma.evaluation.deleteMany({});
  const deletedAnswers = await prisma.answer.deleteMany({});
  const deletedReports = await prisma.report.deleteMany({});
  const deletedQuestions = await prisma.question.deleteMany({});
  const deletedInterviews = await prisma.interview.deleteMany({});
  const deletedLogs = await prisma.llmCallLog.deleteMany({});

  console.log("Cleanup complete:");
  console.log(`  Evaluations deleted: ${deletedEvaluations.count}`);
  console.log(`  Answers deleted: ${deletedAnswers.count}`);
  console.log(`  Reports deleted: ${deletedReports.count}`);
  console.log(`  Questions deleted: ${deletedQuestions.count}`);
  console.log(`  Interviews deleted: ${deletedInterviews.count}`);
  console.log(`  LLM call logs deleted: ${deletedLogs.count}`);
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });