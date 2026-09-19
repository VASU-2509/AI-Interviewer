"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

interface HistoryItem { id: string; targetRole: string; topic: string; status: string; questionsAsked: number; createdAt: string; overallScore: number | null; }

export default function InterviewsPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/interview/history").then((res) => res.json()).then((data) => {
      setHistory(data.history ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3]">
        <SiteHeader />
        <div className="flex justify-center py-16 text-[#6B6F76]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="mb-10 text-2xl font-medium">History</h1>
        {history.length === 0 ? (
          <p className="text-[#6B6F76]">No interviews yet — start one to see it here.</p>
        ) : (
          <div className="border-t border-[#E4E2DD]">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-[#E4E2DD] py-5">
                <div>
                  <p className="font-medium">{item.targetRole} — {item.topic}</p>
                  <p className="text-sm text-[#6B6F76]">
                    {item.questionsAsked} question{item.questionsAsked !== 1 ? "s" : ""} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {item.status === "COMPLETED" ? (
                  <span className="font-mono text-lg">{item.overallScore !== null ? item.overallScore : "—"}</span>
                ) : (
                  <Link href={`/interview/${item.id}`} className="text-sm text-[#2F5D50] underline">Resume</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}