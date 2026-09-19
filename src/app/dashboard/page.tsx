import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const completed = await prisma.interview.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: { report: { select: { overallScore: true } } },
    orderBy: { completedAt: "desc" },
  });

  const scores = completed.map((i) => i.report?.overallScore).filter((s): s is number => s !== undefined && s !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const lastPracticed = completed[0]?.completedAt;

  const actions = [
    { href: "/interview/new", title: "Start an interview", description: "Practice with a question set that adapts to how you answer." },
    { href: "/interviews", title: "Interview history", description: "Review past attempts, scores, and study plans." },
    { href: "/resume", title: "Manage resume", description: "Upload or replace the resume used to personalize questions." },
  ];

  const firstName = (session.user.name || session.user.email || "there").trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="mb-8 text-2xl font-medium">
          Hey {firstName}, let&apos;s get you interview-ready.
        </h1>

        <div className="mb-10 flex divide-x divide-[#E4E2DD] border-y border-[#E4E2DD]">
          <div className="flex-1 py-4 pr-4">
            <p className="font-mono text-2xl">{completed.length}</p>
            <p className="text-sm text-[#6B6F76]">Interviews completed</p>
          </div>
          <div className="flex-1 py-4 px-4">
            <p className="font-mono text-2xl">{avgScore !== null ? avgScore : "—"}</p>
            <p className="text-sm text-[#6B6F76]">Average score</p>
          </div>
          <div className="flex-1 py-4 pl-4">
            <p className="font-mono text-2xl">
              {lastPracticed ? new Date(lastPracticed).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
            </p>
            <p className="text-sm text-[#6B6F76]">Last practiced</p>
          </div>
        </div>

        <div className="border-t border-[#E4E2DD]">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className="group flex items-baseline justify-between border-b border-[#E4E2DD] py-5">
              <div>
                <h2 className="text-base font-medium group-hover:text-[#2F5D50]">{action.title}</h2>
                <p className="mt-1 text-sm text-[#6B6F76]">{action.description}</p>
              </div>
              <span className="font-mono text-sm text-[#6B6F76] group-hover:text-[#2F5D50]">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}