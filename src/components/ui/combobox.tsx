"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
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

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Allow the user to type a value that isn't in `options` and use it as-is. */
  allowCreate?: boolean;
  /** Called once, only when a genuinely new value is added (not on selecting an existing option). */
  onCreate?: (value: string) => void;
  /** If provided, shows a delete affordance on each option row. */
  onDelete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search or type to add…",
  emptyText = "No matches.",
  allowCreate = true,
  onCreate,
  onDelete,
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const normalizedQuery = query.trim();

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(normalizedQuery.toLowerCase()),
  );

  const exactMatch = options.some(
    (option) => option.toLowerCase() === normalizedQuery.toLowerCase(),
  );

  const select = (next: string) => {
    onChange(next);
    setQuery("");
    setOpen(false);
  };

  const create = (next: string) => {
    select(next);
    onCreate?.(next);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between px-3 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {filteredOptions.length === 0 &&
              !(allowCreate && normalizedQuery) && (
                <CommandEmpty>{emptyText}</CommandEmpty>
              )}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => select(option)}
                  className="group/item"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{option}</span>
                  {onDelete && (
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Delete "${option}"`}
                      className="ml-2 shrink-0 rounded-md p-1 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover/item:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${option}"? This can't be undone.`)) {
                          onDelete(option);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </CommandItem>
              ))}
              {allowCreate && normalizedQuery && !exactMatch && (
                <CommandItem
                  value={`__create__${normalizedQuery}`}
                  onSelect={() => create(normalizedQuery)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add "{normalizedQuery}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
