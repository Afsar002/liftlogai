import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FiCheck } from "react-icons/fi";

import { cn } from "../../lib/cn";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface SelectDialogProps<T extends string | number> {
  open: boolean;
  title: string;
  options: Option<T>[];
  selected: T;
  onClose: () => void;
  onSelect: (value: T) => void;
}

export default function SelectDialog<
  T extends string | number
>({
  open,
  title,
  options,
  selected,
  onClose,
  onSelect,
}: SelectDialogProps<T>) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            "w-full max-w-sm rounded-2xl border shadow-2xl",
            "border-zinc-200 bg-white",
            "dark:border-zinc-800 dark:bg-zinc-900",
            "p-6"
          )}
        >
          <DialogTitle className="mb-5 text-xl font-bold text-zinc-900 dark:text-white">
            {title}
          </DialogTitle>

          <div className="space-y-2">
            {options.map((option) => {
              const active =
                selected === option.value;

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl",
                    "px-4 py-3",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/50",

                    active
                      ? [
                          "bg-green-500",
                          "text-white",
                        ]
                      : [
                          "bg-zinc-100",
                          "text-zinc-900",
                          "hover:bg-zinc-200",

                          "dark:bg-zinc-800",
                          "dark:text-white",
                          "dark:hover:bg-zinc-700",
                        ]
                  )}
                >
                  <span className="font-medium">
                    {option.label}
                  </span>

                  {active && (
                    <FiCheck size={18} />
                  )}
                </button>
              );
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}