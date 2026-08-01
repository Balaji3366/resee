"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "cmdk";
import * as RadixPopover from "@radix-ui/react-popover";
import { Search } from "lucide-react";

export interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  label?: string;
  className?: string;
}

/**
 * Single-select typeahead built on `cmdk` (Radix has no combobox
 * primitive) — the popover-open state is driven directly off the input's
 * focus/query, not a separate Radix Popover.Root, since cmdk's own
 * `Command` already owns keyboard nav (arrow keys, Enter, Escape).
 */
export default function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Search…",
  emptyText = "No results found.",
  label,
  className = "",
}: AutocompleteProps) {
  const [query, setQuery] = useState(() => options.find((o) => o.value === value)?.label ?? "");
  const [open, setOpen] = useState(false);

  function selectOption(option: AutocompleteOption) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-bold text-bone">{label}</p>}

      <RadixPopover.Root open={open} onOpenChange={setOpen}>
        <Command shouldFilter className="relative" loop>
          <RadixPopover.Anchor asChild>
            <div className="flex h-11 items-center gap-2 rounded-[12px] border-2 border-bone/15 bg-panel px-4 focus-within:border-amber">
              <Search size={16} className="shrink-0 text-slate" />
              <CommandInput
                value={query}
                onValueChange={(next) => {
                  setQuery(next);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-bone outline-none placeholder:text-slate"
              />
            </div>
          </RadixPopover.Anchor>

          <RadixPopover.Portal>
            <RadixPopover.Content
              align="start"
              sideOffset={6}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="radix-content z-50 w-[var(--radix-popover-trigger-width)] rounded-[16px] border-2 border-bone bg-panel p-1.5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <CommandList className="max-h-64 overflow-y-auto">
                <CommandEmpty className="px-3 py-4 text-center text-sm text-slate">
                  {emptyText}
                </CommandEmpty>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => selectOption(option)}
                    className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-bone outline-none data-[selected=true]:bg-amber/10"
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandList>
            </RadixPopover.Content>
          </RadixPopover.Portal>
        </Command>
      </RadixPopover.Root>
    </div>
  );
}
