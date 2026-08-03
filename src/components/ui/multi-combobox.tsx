"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";

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

interface MultiComboboxProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Allow the user to type a value that isn't in `options` and add it as a new tag. */
  allowCreate?: boolean;
  /** Called once, only when a genuinely new value is added (not on toggling an existing option). */
  onCreate?: (value: string) => void;
  /** If provided, shows a delete affordance on each option row. */
  onDelete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MultiCombobox({
  values,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search or type to add…",
  allowCreate = true,
  onCreate,
  onDelete,
  className,
  disabled,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const normalizedQuery = query.trim();

  // Surface already-selected custom values even if they're not in the preset list.
  const allOptions = React.useMemo(() => {
    const extras = values.filter(
      (v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()),
    );
    return [...options, ...extras];
  }, [options, values]);

  const filteredOptions = allOptions.filter((option) =>
    option.toLowerCase().includes(normalizedQuery.toLowerCase()),
  );

  const exactMatch = allOptions.some(
    (option) => option.toLowerCase() === normalizedQuery.toLowerCase(),
  );

  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
    setQuery("");
  };

  const remove = (option: string) => {
    onChange(values.filter((v) => v !== option));
  };

  const create = (option: string) => {
    toggle(option);
    onCreate?.(option);
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
            "h-auto min-h-9 w-full justify-between px-3 py-2 font-normal",
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1">
            {values.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {values.map((v) => (
              <Badge
                key={v}
                variant="secondary"
                className="gap-1 pr-1 font-normal"
              >
                {v}
                <span
                  role="button"
                  tabIndex={-1}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(v);
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
                <CommandEmpty>No matches.</CommandEmpty>
              )}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => toggle(option)}
                  className="group/item"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(option) ? "opacity-100" : "opacity-0",
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
