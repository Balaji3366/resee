import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Composes useDebounce into the shape a search input needs: an
 * immediate `query` for the input's own value, and a `debouncedQuery`
 * to actually trigger a fetch against.
 */
export function useSearch(initialQuery = "", delayMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, delayMs);

  return { query, setQuery, debouncedQuery };
}
