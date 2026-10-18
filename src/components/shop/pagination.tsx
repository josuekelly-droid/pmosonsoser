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
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {/* Précédent */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(baseUrl, searchParams, currentPage - 1)}
          aria-label="Page précédente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-black/10 bg-white text-brand-black transition hover:border-brand-red hover:text-brand-red"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-black/5 bg-white text-brand-black/30">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm text-brand-black/40"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(baseUrl, searchParams, p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition",
              p === currentPage
                ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30"
                : "border-brand-black/10 bg-white text-brand-black hover:border-brand-red hover:text-brand-red"
            )}
          >
            {p}
          </Link>
        )
      )}

      {/* Suivant */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(baseUrl, searchParams, currentPage + 1)}
          aria-label="Page suivante"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-black/10 bg-white text-brand-black transition hover:border-brand-red hover:text-brand-red"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-black/5 bg-white text-brand-black/30">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}