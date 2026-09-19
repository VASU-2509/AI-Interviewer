import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestion } from "@/ai/generate-question";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetRole, topic, difficulty, useResume = true } = await req.json();

  if (!targetRole || !topic || !difficulty) {
    return NextResponse.json(
      { error: "targetRole, topic, and difficulty are required" },
      { status: 400 }
    );
  }

  const interview = await prisma.interview.create({
    data: {
      userId: session.user.id,
      targetRole,
      topic,
      difficulty,
    },
  });

  const resume = useResume
  ? await prisma.resume.findUnique({ where: { userId: session.user.id } })
  : null;

  try {
    const generated = await generateQuestion({
      topic,
      difficulty,
      targetRole,
      resumeText: resume?.extractedText,
    });

    const question = await prisma.question.create({
      data: {
        interviewId: interview.id,
        text: generated.question,
        topic: generated.topic,
        difficulty: generated.difficulty,
        order: 1,
      },
    });

    return NextResponse.json({ interviewId: interview.id, question });
  } catch (err) {
    console.error("Question generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate question. Please try again." },
      { status: 500 }
    );
  }
}