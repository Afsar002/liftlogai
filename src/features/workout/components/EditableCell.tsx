import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function EditableCell({
  value,
  onChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const save = () => {
    const number = Number(localValue);
    onChange(Number.isNaN(number) ? 0 : number);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        className="w-full rounded-full border border-emerald-500 bg-white px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-zinc-900 shadow-sm outline-none dark:bg-[#141417] dark:text-white"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full rounded-full bg-zinc-100 px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
    >
      {value}
    </button>
  );
}
