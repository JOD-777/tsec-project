"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldSelectOption = {
  value: string;
  label: ReactNode;
};

export function FieldSelect({
  ariaLabel,
  value,
  options,
  onValueChange,
  className,
  compact = false,
}: {
  ariaLabel: string;
  value: string;
  options: readonly FieldSelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(String(next))}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "group w-full border-line bg-surface text-foreground shadow-sm hover:border-brand/70 hover:bg-surface-2 data-popup-open:border-brand data-popup-open:ring-4 data-popup-open:ring-brand/10 data-popup-open:[&_svg]:rotate-180",
          compact
            ? "h-10 min-h-10 rounded-xl px-3 text-xs"
            : "h-auto min-h-12 rounded-2xl px-4 py-3 text-sm sm:min-h-14 sm:text-base",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        sideOffset={8}
        className="app-scrollbar rounded-2xl border border-line bg-surface p-1.5 text-foreground shadow-2xl ring-0"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-11 cursor-pointer rounded-xl px-3 py-2.5 pr-9 text-sm hover:bg-surface-2 focus:bg-surface-2 focus:text-foreground data-selected:bg-brand/10 data-selected:text-brand"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
