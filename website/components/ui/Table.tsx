import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

type TableProps = HTMLAttributes<HTMLTableElement>;

/**
 * Bare styled table primitives — the building blocks DataTable.tsx
 * composes into a sortable/paginated table. Exported separately for
 * call sites that just need plain markup (no sorting/pagination).
 */
export function Table({ className = "", ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border-2 border-bone/10">
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...props} />
    </div>
  );
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-panel-2/60" {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-bone/10" {...props} />;
}

export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition-colors hover:bg-panel-2/40 ${className}`} {...props} />;
}

export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-bone ${className}`} {...props} />;
}
