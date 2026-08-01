import { useMemo, useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

/**
 * Generic page-state manager — no existing pagination pattern exists
 * anywhere in this codebase today (confirmed via grep), so this doesn't
 * conflict with or replace anything.
 */
export function usePagination({
  initialPage = 1,
  pageSize = 20,
  totalItems = 0,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const previousPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (target: number) => setPage(Math.min(totalPages, Math.max(1, target)));

  return {
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    setPage,
    /** 0-based offset for a typical `range(offset, offset + pageSize - 1)` query. */
    offset: (page - 1) * pageSize,
  };
}
