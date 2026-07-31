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
        className="w-full rounded-lg border border-green-500 bg-white px-2 py-2 text-center text-slate-950 outline-none shadow-sm dark:border-green-500 dark:bg-zinc-900 dark:text-white"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full rounded-lg bg-white px-2 py-2 text-center font-medium text-slate-950 transition hover:bg-slate-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
    >
      {value}
    </button>
  );
}