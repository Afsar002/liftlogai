interface Props {
  showCheck?: boolean;
}

export default function SetHeader({
  showCheck = true,
}: Props) {
  return (
<div className="grid grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] gap-2 px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">      <div className="text-center">Set</div>
      <div className="text-center">Kg</div>
      <div className="text-center">Reps</div>
      <div className="text-center">RIR</div>

      {showCheck && (
        <div className="text-center">✓</div>
      )}
    </div>
  );
}