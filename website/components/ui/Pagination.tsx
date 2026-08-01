import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Presentational pager — pairs with the `usePagination` hook (which
 * owns page/pageSize state) but takes plain props so it can be driven
 * by any state source. Always shows first/last plus a window around the
 * current page, collapsing gaps with an ellipsis.
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageList(page, totalPages);

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bone/15 text-bone transition-colors hover:border-bone/30 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate"
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              entry === page ? "bg-amber-dim text-ink" : "text-bone hover:bg-panel-2"
            }`}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bone/15 text-bone transition-colors hover:border-bone/30 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function getPageList(page: number, totalPages: number): Array<number | "ellipsis"> {
  const WINDOW = 1;
  const pages: Array<number | "ellipsis"> = [];

  for (let p = 1; p <= totalPages; p++) {
    const isEdge = p === 1 || p === totalPages;
    const isNearCurrent = Math.abs(p - page) <= WINDOW;

    if (isEdge || isNearCurrent) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return pages;
}
