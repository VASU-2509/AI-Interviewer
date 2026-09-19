import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer } from "@/ai/evaluate-answer";
import { generateQuestion } from "@/ai/generate-question";
import { nextDifficulty, shouldEndInterview } from "@/ai/interview-engine";
import { generateReport } from "@/ai/generate-report";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, answerText } = await req.json();

  if (!questionId || !answerText) {
    return NextResponse.json(
      { error: "questionId and answerText are required" },
      { status: 400 }
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { interview: { include: { questions: true } } },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (question.interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const answer = await prisma.answer.create({
    data: {
      questionId: question.id,
      text: answerText,
    },
  });

  try {
    const result = await evaluateAnswer({
      question: question.text,
      answer: answerText,
      topic: question.topic,
      difficulty: question.difficulty,
    });

    const evaluation = await prisma.evaluation.create({
      data: {
        answerId: answer.id,
        correctness: result.correctness,
        completeness: result.completeness,
        technicalDepth: result.technicalDepth,
        clarity: result.clarity,
        overallScore: result.overallScore,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        missingConcepts: result.missingConcepts,
        nextAction: result.nextAction,
      },
    });

    const interview = question.interview;
    const questionsAskedSoFar = interview.questions.length;

    const ending = shouldEndInterview({
      action: result.nextAction,
      questionsAskedSoFar,
      maxQuestions: interview.maxQuestions,
    });

   if (ending) {
  await prisma.interview.update({
    where: { id: interview.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  const fullInterview = await prisma.interview.findUnique({
    where: { id: interview.id },
    include: {
      questions: {
        include: { answer: { include: { evaluation: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  const qaHistory = (fullInterview?.questions ?? [])
    .filter((q) => q.answer && q.answer.evaluation)
    .map((q) => ({
      question: q.text,
      answer: q.answer!.text,
      overallScore: q.answer!.evaluation!.overallScore,
      strengths: q.answer!.evaluation!.strengths,
      weaknesses: q.answer!.evaluation!.weaknesses,
      missingConcepts: q.answer!.evaluation!.missingConcepts,
    }));

  let report = null;
  try {
    const generated = await generateReport({
      targetRole: interview.targetRole,
      topic: interview.topic,
      qaHistory,
    });

    report = await prisma.report.create({
      data: {
        interviewId: interview.id,
        overallScore: generated.overallScore,
        strengths: generated.strengths,
        weaknesses: generated.weaknesses,
        studyPlan: generated.studyPlan,
      },
    });
  } catch (err) {
    console.error("Report generation failed:", err);
    // Interview is still marked completed even if report generation fails —
    // we don't want a report glitch to trap the interview in a broken state.
  }

  return NextResponse.json({
    answer,
    evaluation,
    interviewStatus: "COMPLETED",
    nextQuestion: null,
    report,
  });
}

    const newDifficulty = nextDifficulty(interview.difficulty, result.nextAction);

    const generated = await generateQuestion({
      topic: question.topic,
      difficulty: newDifficulty,
      targetRole: interview.targetRole,
      previousQuestions: interview.questions.map((q) => q.text),
      followUpOn:
        result.nextAction === "FOLLOW_UP"
          ? {
              question: question.text,
              answer: answerText,
              missingConcepts: result.missingConcepts,
            }
          : undefined,
    });

    const nextQuestion = await prisma.question.create({
      data: {
        interviewId: interview.id,
        text: generated.question,
        topic: generated.topic,
        difficulty: generated.difficulty,
        order: questionsAskedSoFar + 1,
      },
    });

    await prisma.interview.update({
      where: { id: interview.id },
      data: { difficulty: newDifficulty },
    });

    return NextResponse.json({
      answer,
      evaluation,
      interviewStatus: "IN_PROGRESS",
      nextQuestion,
    });
  } catch (err) {
    console.error("Answer evaluation/next-question generation failed:", err);
    return NextResponse.json(
      { error: "Failed to process answer. Please try again." },
      { status: 500 }
    );
  }
}