import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const interviews = await prisma.interview.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      report: {
        select: {
          overallScore: true,
          strengths: true,
          weaknesses: true,
        },
      },
      _count: {
        select: { questions: true },
      },
    },
  });

  const history = interviews.map((interview) => ({
    id: interview.id,
    targetRole: interview.targetRole,
    topic: interview.topic,
    status: interview.status,
    questionsAsked: interview._count.questions,
    createdAt: interview.createdAt,
    completedAt: interview.completedAt,
    overallScore: interview.report?.overallScore ?? null,
    strengths: interview.report?.strengths ?? [],
    weaknesses: interview.report?.weaknesses ?? [],
  }));

  return NextResponse.json({ history });
}