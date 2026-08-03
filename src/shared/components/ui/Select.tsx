import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "../../lib/cn";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface SelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setHighlightedIndex(
        options.findIndex((o) => o.value === value)
      );
    }
  }, [open, value, options]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < options.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : options.length - 1;
          return next;
        });
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlightedIndex(-1);
        triggerRef.current?.focus();
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
          "border-zinc-200/80 bg-white text-zinc-900",
          "hover:border-zinc-300 hover:bg-zinc-50",
          "focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
          "dark:border-white/10 dark:bg-white/5 dark:text-white",
          "dark:hover:border-white/20 dark:hover:bg-white/8",
          "dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/20"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-zinc-400 dark:text-zinc-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-xl border py-1 shadow-lg",
            "border-zinc-200/80 bg-white",
            "dark:border-white/10 dark:bg-[#141417]",
            "focus:outline-none"
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                aria-label={option.label}
                tabIndex={-1}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setHighlightedIndex(-1);
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : isHighlighted
                      ? "bg-zinc-100 text-zinc-900 dark:bg-white/8 dark:text-white"
                      : "text-zinc-700 dark:text-zinc-200"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}