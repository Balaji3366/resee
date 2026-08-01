"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import Input from "@/components/ui/Input";
import { useSearch } from "@/hooks/useSearch";

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
  delayMs?: number;
  onSearch: (debouncedQuery: string) => void;
  className?: string;
}

/**
 * Debounced search input — composes Input.tsx with the useSearch hook
 * and forwards only the debounced value to `onSearch`, so callers never
 * hand-wire their own debounce/effect pair.
 */
export default function SearchBar({
  placeholder = "Search…",
  initialQuery = "",
  delayMs = 300,
  onSearch,
  className = "",
}: SearchBarProps) {
  const { query, setQuery, debouncedQuery } = useSearch(initialQuery, delayMs);

  useEffect(() => {
    onSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search size={16} />}
      rightIcon={
        query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="pointer-events-auto text-slate hover:text-bone"
          >
            <X size={14} />
          </button>
        ) : undefined
      }
      containerClassName={className}
    />
  );
}
