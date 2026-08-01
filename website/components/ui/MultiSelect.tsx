"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import Checkbox from "@/components/ui/Checkbox";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

/**
 * Generic multi-select dropdown — Radix has no dedicated multi-select
 * primitive (react-select is single-value only), so this composes
 * Popover.tsx + Checkbox.tsx, both already built and accessible. This is
 * a general-purpose `components/ui/` primitive, distinct from
 * `components/jobs/MultiSelectChips.tsx` (a Jobs-module-specific
 * chip-based picker built earlier and left as-is — different component,
 * different scope, not a duplicate).
 */
export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  label,
  className = "",
}: MultiSelectProps) {
  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? placeholder)
        : `${selected.length} selected`;

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-bold text-bone">{label}</p>}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-[12px] border-2 border-bone/15 bg-panel px-4 text-bone transition-colors focus:border-amber focus:outline-none"
          >
            <span className={selected.length === 0 ? "text-slate" : ""}>{summary}</span>
            <ChevronDown size={18} className="text-slate" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-72 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {options.map((option) => (
              <div key={option.value} className="rounded-lg px-2 py-2 hover:bg-amber/10">
                <Checkbox
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggle(option.value)}
                  label={option.label}
                />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
