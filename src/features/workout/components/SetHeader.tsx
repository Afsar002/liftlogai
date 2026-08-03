interface Props {
  showCheck?: boolean;
}

export default function SetHeader({
  showCheck = true,
}: Props) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
      <div className="text-center">Set</div>
      <div className="text-center">Kg</div>
      <div className="text-center">Reps</div>
      <div className="text-center">RIR</div>
      {showCheck && <div className="text-center">✓</div>}
    </div>
  );
}
