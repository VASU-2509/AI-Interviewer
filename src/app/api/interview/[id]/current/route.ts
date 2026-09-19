import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      questions: {
        include: { answer: true },
        orderBy: { order: "desc" },
      },
      report: true,
    },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  if (interview.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (interview.status === "COMPLETED") {
    return NextResponse.json({
      status: "COMPLETED",
      question: null,
      report: interview.report,
    });
  }

  const unansweredQuestion = interview.questions.find((q) => !q.answer);

  return NextResponse.json({
    status: "IN_PROGRESS",
    question: unansweredQuestion ?? null,
    report: null,
  });
}