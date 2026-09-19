"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  const fieldClass =
    "w-full border-0 border-b border-[#E4E2DD] bg-transparent py-2 text-base focus:border-[#2F5D50] focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] text-[#16181D]">
      <div className="w-full max-w-sm border border-[#E4E2DD] bg-white px-8 py-10">
  <h1 className="mb-8 text-2xl font-medium">Log in</h1>
  <form onSubmit={handleSubmit} className="space-y-6">
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
      {loading ? "Logging in…" : "Log in"}
    </button>
  </form>
  <p className="mt-6 text-sm text-[#6B6F76]">
    Don&apos;t have an account?{" "}
    <a href="/signup" className="text-[#2F5D50] underline">Sign up</a>
  </p>
</div>
    </div>
  );
}