"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/login");
  };

  const fieldClass =
    "w-full border-0 border-b border-[#E4E2DD] bg-transparent py-2 text-base focus:border-[#2F5D50] focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] text-[#16181D]">
      <div className="w-full max-w-sm border border-[#E4E2DD] bg-white px-8 py-10">
        <h1 className="mb-8 text-2xl font-medium">Create an account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Name</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Email</label>
            <input
              type="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#6B6F76]">Password</label>
            <input
              type="password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-[#B65C3B]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F5D50] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-sm text-[#6B6F76]">
          Already have an account?{" "}
          <a href="/login" className="text-[#2F5D50] underline">Log in</a>
        </p>
      </div>
    </div>
  );
}