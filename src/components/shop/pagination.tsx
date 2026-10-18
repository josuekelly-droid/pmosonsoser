"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // ex: "/motos"
  searchParams: Record<string, string | undefined>;
};

function buildPageUrl(
  baseUrl: string,
  searchParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== "page") params.set(k, v);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-wrap items-center justify-center gap-3"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/60 p-2 backdrop-blur-xl shadow-2xl">
        {/* Précédent */}
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(baseUrl, searchParams, currentPage - 1)}
            aria-label="Page précédente"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-all duration-300 hover:border-white/30 hover:bg-white hover:text-black"
          >
            <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-neutral-700">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {/* Pages */}
        <div className="flex items-center gap-1.5 px-2">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 font-mono text-xs text-neutral-600"
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildPageUrl(baseUrl, searchParams, p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={cn(
                  "flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border px-3.5 font-mono text-xs font-bold transition-all duration-300",
                  p === currentPage
                    ? "border-brand-red bg-brand-red text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/30 hover:bg-white/10 hover:text-white"
                )}
              >
                {p < 10 ? `0${p}` : p}
              </Link>
            )
          )}
        </div>

        {/* Suivant */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(baseUrl, searchParams, currentPage + 1)}
            aria-label="Page suivante"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-all duration-300 hover:border-white/30 hover:bg-white hover:text-black"
          >
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-neutral-700">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}