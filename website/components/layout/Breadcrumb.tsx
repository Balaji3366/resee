import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Doesn't exist anywhere in the app today — new. */
export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={item.label}>
            {index > 0 && <ChevronRight size={14} className="text-bone/30" />}

            {item.href && !isLast ? (
              <Link href={item.href} className="font-medium text-slate hover:text-amber">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className="font-semibold text-bone">
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
