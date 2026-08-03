"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ProductMultiPickerOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface ProductMultiPickerProps {
  values: string[];
  onChange: (values: string[]) => void;
  /** The current search page's results — not the full selected set. */
  options: ProductMultiPickerOption[];
  onSearch: (query: string) => void;
  /** Labels for already-selected ids that aren't in the current search
   * page (e.g. loaded once on edit) — keeps chips readable without
   * re-searching for every previously-chosen product. */
  selectedLabels?: Record<string, string>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

/**
 * Multi-select analogue of TargetPicker.tsx — same async, id-keyed,
 * server-searched Command+Popover shell, but with MultiCombobox.tsx's chip
 * UI instead of a single selected label. Built for offer.products[] /
 * offer.freeProductIds[] (BOGO), where options come from a paginated
 * product search (useProducts), not a small fixed list.
 */
export function ProductMultiPicker({
  values,
  onChange,
  options,
  onSearch,
  selectedLabels = {},
  placeholder = "Select products…",
  searchPlaceholder = "Search products…",
  emptyText = "No matches.",
  disabled,
}: ProductMultiPickerProps) {
  const [open, setOpen] = React.useState(false);

  const labelById = React.useMemo(() => {
    const map: Record<string, string> = { ...selectedLabels };

    for (const option of options) {
      map[option.id] = option.label;
    }

    return map;
  }, [options, selectedLabels]);

  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  };

  const remove = (id: string) => {
    onChange(values.filter((v) => v !== id));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-auto min-h-9 w-full justify-between px-3 py-2 font-normal"
        >
          <span className="flex flex-1 flex-wrap items-center gap-1">
            {values.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {values.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1 pr-1 font-normal">
                {labelById[id] ?? id}
                <span
                  role="button"
                  tabIndex={-1}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(id);
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => toggle(option.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(option.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-muted-foreground">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
