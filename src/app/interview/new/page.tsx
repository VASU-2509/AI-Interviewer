"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

const TOPICS = ["OOP", "DBMS"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export default function NewInterviewPage() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [useResume, setUseResume] = useState(true);

  useEffect(() => {
    fetch("/api/resume/status").then((res) => res.json()).then((data) => setResumeFileName(data.fileName ?? null));
  }, []);

  const handleStart = async () => {
    if (!targetRole.trim()) {
      setError("Enter a target role to continue.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, topic, difficulty, useResume }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Couldn't start the interview. Try again.");
      return;
    }
    router.push(`/interview/${data.interviewId}`);
  };

  const fieldClass = "w-full border-0 border-b border-[#E4E2DD] bg-transparent py-2 text-base focus:border-[#2F5D50] focus:outline-none";

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-10 text-2xl font-medium">New interview</h1>
        <div className="space-y-8">
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Target role</label>
            <input className={fieldClass} placeholder="Backend Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Topic</label>
            <select className={fieldClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Starting difficulty</label>
            <select className={fieldClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {resumeFileName && (
            <label className="flex items-start gap-3 text-sm text-[#6B6F76]">
              <input type="checkbox" checked={useResume} onChange={(e) => setUseResume(e.target.checked)} className="mt-1" />
              <span>Personalize with <span className="text-[#16181D]">{resumeFileName}</span></span>
            </label>
          )}
          {error && <p className="text-sm text-[#B65C3B]">{error}</p>}
          <button onClick={handleStart} disabled={loading} className="w-full bg-[#2F5D50] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? "Starting…" : "Start interview"}
          </button>
        </div>
      </div>
    </div>
  );
}