"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

interface Question { id: string; text: string; topic: string; difficulty: string; order: number; }
interface Report { overallScore: number; strengths: string[]; weaknesses: string[]; studyPlan: { day: number; focus: string }[]; }

export default function InterviewPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<{ overallScore: number; nextAction: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterview() {
      const res = await fetch(`/api/interview/${interviewId}/current`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load this interview.");
        setLoading(false);
        return;
      }
      if (data.status === "COMPLETED") {
        setCompleted(true);
        setReport(data.report);
      } else {
        setCurrentQuestion(data.question);
      }
      setLoading(false);
    }
    loadInterview();
  }, [interviewId]);

  const handleSubmit = async () => {
    if (!answerText.trim() || !currentQuestion) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/interview/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id, answerText }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Couldn't submit that answer. Try again.");
      return;
    }

    setLastEvaluation({ overallScore: data.evaluation.overallScore, nextAction: data.evaluation.nextAction });
    setAnswerText("");

    if (data.interviewStatus === "COMPLETED") {
      setCompleted(true);
      setReport(data.report);
      setCurrentQuestion(null);
    } else {
      setCurrentQuestion(data.nextQuestion);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3]">
        <SiteHeader />
        <div className="flex justify-center py-16 text-[#6B6F76]">Loading…</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-16">
          {report ? (
            <>
              <p className="text-sm text-[#6B6F76]">Interview complete</p>
              <p className="mb-10 font-mono text-5xl">{report.overallScore}<span className="text-2xl text-[#6B6F76]">/100</span></p>
              <div className="border-t border-[#E4E2DD] py-6">
                <h2 className="mb-3 text-sm text-[#6B6F76]">Strengths</h2>
                <ul className="space-y-2">{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="border-t border-[#E4E2DD] py-6">
                <h2 className="mb-3 text-sm text-[#6B6F76]">Weaknesses</h2>
                <ul className="space-y-2">{report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
              <div className="border-t border-b border-[#E4E2DD] py-6">
                <h2 className="mb-3 text-sm text-[#6B6F76]">Study plan</h2>
                <ul className="space-y-3">
                  {report.studyPlan.map((item) => (
                    <li key={item.day} className="flex gap-3">
                      <span className="font-mono text-sm text-[#2F5D50]">Day {item.day}</span>
                      <span>{item.focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/interviews" className="mt-8 inline-block text-sm text-[#2F5D50] underline">Back to history</Link>
            </>
          ) : (
            <p className="text-[#6B6F76]">Report is still generating. Check your history shortly.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-8 flex justify-between font-mono text-sm text-[#6B6F76]">
          <span>{currentQuestion?.topic}</span>
          <span>{currentQuestion?.difficulty}</span>
          <span>Q{currentQuestion?.order}</span>
        </div>
        {lastEvaluation && (
          <p className="mb-6 text-sm text-[#6B6F76]">
            Previous answer: <span className="font-mono text-[#16181D]">{lastEvaluation.overallScore}/100</span>
            {" — "}{lastEvaluation.nextAction.replace(/_/g, " ").toLowerCase()}
          </p>
        )}
        <p className="mb-8 text-lg leading-relaxed">{currentQuestion?.text}</p>
        <textarea
          className="min-h-[180px] w-full border border-[#E4E2DD] bg-white p-4 text-base focus:border-[#2F5D50] focus:outline-none"
          placeholder="Type your answer here…"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        {error && <p className="mt-3 text-sm text-[#B65C3B]">{error}</p>}
        <button onClick={handleSubmit} disabled={submitting || !answerText.trim()} className="mt-4 bg-[#2F5D50] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          {submitting ? "Evaluating…" : "Submit answer"}
        </button>
      </div>
    </div>
  );
}