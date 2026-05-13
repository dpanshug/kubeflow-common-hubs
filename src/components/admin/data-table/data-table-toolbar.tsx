"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onChange: (value: string) => void;
  }[];
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-4">
      {onSearchChange && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "h-9 w-full rounded-lg border border-border bg-bg-secondary pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-[var(--kf-blue)] focus:border-transparent"
            )}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {filters?.map((filter) => (
        <select
          key={filter.key}
          value={filter.value || ""}
          onChange={(e) => filter.onChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-primary"
          aria-label={filter.label}
        >
          <option value="">{filter.label}: All</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {actions && <div className="sm:ml-auto">{actions}</div>}
    </div>
  );
}
