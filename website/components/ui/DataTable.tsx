"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Lightweight sortable table over an already-fetched array — no
 * @tanstack/react-table, per the project's "add infra only when proven
 * necessary" principle (only client-side sort is needed; server-side
 * paging/filtering, if ever needed, composes with usePagination +
 * Pagination.tsx separately rather than pulling in a table framework).
 */
export default function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle = "Nothing here yet",
  emptyMessage,
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = column.sortValue!(a);
      const bValue = column.sortValue!(b);
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [data, columns, sortKey, sortDirection]);

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortValue) return;
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection("asc");
    } else {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} className={className} />;
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.sortValue ? (
                <button
                  type="button"
                  onClick={() => toggleSort(column)}
                  className="flex items-center gap-1 uppercase tracking-wide hover:text-bone"
                >
                  {column.header}
                  {sortKey === column.key ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </button>
              ) : (
                column.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedData.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((column) => (
              <TableCell key={column.key} className={column.className}>
                {column.accessor(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
