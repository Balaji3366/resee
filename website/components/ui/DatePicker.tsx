"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { formatDateLong } from "@/lib/format/date";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
}

/**
 * Single-date picker built on `react-day-picker` (no Radix calendar
 * primitive exists) inside our own Popover.tsx shell. No default
 * react-day-picker stylesheet is imported — every UI part is restyled
 * via `classNames` to match the ink-bordered design tokens instead of
 * fighting its bundled CSS.
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  disabled,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-bold text-bone">{label}</p>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-[12px] border-2 border-bone/15 bg-panel px-4 text-bone transition-colors focus:border-amber focus:outline-none"
          >
            <span className={value ? "" : "text-slate"}>
              {value ? formatDateLong(value) : placeholder}
            </span>
            <CalendarDays size={18} className="text-slate" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            disabled={disabled}
            showOutsideDays
            classNames={{
              months: "flex flex-col gap-3",
              month: "flex flex-col gap-3",
              month_caption: "flex justify-center pb-1 font-display font-bold text-bone",
              caption_label: "text-sm",
              nav: "flex items-center justify-between absolute inset-x-0 top-0 px-1",
              button_previous:
                "flex h-7 w-7 items-center justify-center rounded-full hover:bg-amber/10 text-bone disabled:opacity-30",
              button_next:
                "flex h-7 w-7 items-center justify-center rounded-full hover:bg-amber/10 text-bone disabled:opacity-30",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "w-9 text-center text-xs font-bold text-slate",
              weeks: "flex flex-col gap-0.5",
              week: "flex",
              day: "p-0.5 text-center",
              day_button:
                "flex h-8 w-8 items-center justify-center rounded-full text-sm text-bone transition-colors hover:bg-amber/10",
              selected:
                "[&>button]:bg-amber-dim [&>button]:text-ink [&>button]:font-bold [&>button]:hover:bg-amber-dim",
              today: "[&>button]:border-2 [&>button]:border-amber",
              outside: "[&>button]:text-slate/40",
              disabled:
                "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />,
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
