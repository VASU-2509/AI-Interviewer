"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview/new", label: "New interview" },
  { href: "/interviews", label: "History" },
  { href: "/resume", label: "Resume" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#E4E2DD] bg-[#F7F6F3]">
      <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
        <Link href="/dashboard" className="text-sm font-medium text-[#16181D]">
          AI Interviewer
        </Link>
        <nav className="flex flex-1 items-center justify-evenly text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "text-[#2F5D50]" : "text-[#6B6F76] hover:text-[#16181D]"}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[#6B6F76] hover:text-[#16181D]"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}