"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Upload failed.");
      return;
    }
    setStatus("success");
    setMessage(`Uploaded "${data.fileName}". Preview: ${data.preview}…`);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#16181D]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-10 text-2xl font-medium">Resume</h1>
        <p className="mb-6 text-sm text-[#6B6F76]">Uploading a resume lets interview questions reference your real projects and skills.</p>
        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-[#6B6F76] file:mr-4 file:border-0 file:bg-[#2F5D50] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
          <button onClick={handleUpload} disabled={!file || status === "uploading"} className="bg-[#2F5D50] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {status === "uploading" ? "Uploading…" : "Upload"}
          </button>
          {message && <p className={`text-sm ${status === "error" ? "text-[#B65C3B]" : "text-[#6B6F76]"}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}