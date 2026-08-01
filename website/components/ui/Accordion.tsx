"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export const Accordion = RadixAccordion.Root;

interface AccordionItemProps {
  value: string;
  title: string;
  children: ReactNode;
}

/**
 * Built on @radix-ui/react-accordion — arrow-key navigation between
 * triggers, Home/End, and correct aria-expanded/aria-controls wiring
 * handled by the primitive. Usage:
 *   <Accordion type="single" collapsible>
 *     <AccordionItem value="a" title="Section A">content</AccordionItem>
 *   </Accordion>
 */
export function AccordionItem({ value, title, children }: AccordionItemProps) {
  return (
    <RadixAccordion.Item value={value} className="border-b-2 border-bone/10 last:border-b-0">
      <RadixAccordion.Header>
        <RadixAccordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-bold text-bone">
          {title}
          <ChevronDown
            size={18}
            className="shrink-0 text-slate transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>

      <RadixAccordion.Content className="radix-accordion-content overflow-hidden text-sm text-slate">
        <div className="pb-4">{children}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}
