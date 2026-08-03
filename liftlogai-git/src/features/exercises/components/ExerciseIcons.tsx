import React from "react";

import chestIcon from "../../../assets/icons/chest.svg";
import backIcon from "../../../assets/icons/back.svg";
import upperIcon from "../../../assets/icons/upper-body.svg";
import lowerIcon from "../../../assets/icons/lower-body.svg";
import coreIcon from "../../../assets/icons/core.svg";
import fullBodyIcon from "../../../assets/icons/full-body.svg";
import cardioIcon from "../../../assets/icons/cardio.svg";
import otherIcon from "../../../assets/icons/other.svg";

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const props = { width: 20, height: 20, className };

  switch (category) {
    case "Chest":
      return <img src={chestIcon} alt="Chest" width={20} height={20} className={className} />;
    case "Back":
      return <img src={backIcon} alt="Back" width={20} height={20} className={className} />;
    case "Upper Body":
      return <img src={upperIcon} alt="Upper Body" width={20} height={20} className={className} />;
    case "Lower Body":
      return <img src={lowerIcon} alt="Lower Body" width={20} height={20} className={className} />;
    case "Core":
      return <img src={coreIcon} alt="Core" width={20} height={20} className={className} />;
    case "Full Body":
      return <img src={fullBodyIcon} alt="Full Body" width={20} height={20} className={className} />;
    case "Cardio":
      return <img src={cardioIcon} alt="Cardio" width={20} height={20} className={className} />;
    default:
      return <img src={otherIcon} alt="Other" width={20} height={20} className={className} />;
  }
}

export function ExerciseThumbnail({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-800 dark:bg-zinc-800 dark:text-white">
      {initials}
    </div>
  );
}

export default null;

export function ExerciseIcon({ id, size = 36 }: { id: string; size?: number }) {
  // Simple per-exercise SVGs — add more mappings as needed
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  const emojiMap: Record<string, string> = {
    bench_press: "🏋️",
    incline_db_press: "🏋️",
    deadlift: "🏋️",
    squat: "🦵",
    pull_up: "🧗",
    chin_up: "🧗",
    push_up: "🤸",
    plank: "🧘",
    kettlebell_swing: "🔔",
    rowing_machine: "🚣",
    battle_rope: "💥",
    sprint_intervals: "🏃",
    box_jump: "📦",
    leg_press: "🦵",
  };

  if (emojiMap[id]) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center rounded-md bg-slate-100 text-lg dark:bg-zinc-800">
        <span>{emojiMap[id]}</span>
      </div>
    );
  }

  switch (id) {
    case "bench_press":
    case "incline_db_press":
      return (
        <svg {...common} className="rounded">
          <rect x="2" y="10" width="20" height="3" rx="1" fill="#fde68a" />
          <rect x="4" y="7" width="2" height="8" rx="1" fill="#f97316" />
          <rect x="18" y="7" width="2" height="8" rx="1" fill="#f97316" />
        </svg>
      );
    case "deadlift":
    case "romanian_deadlift":
      return (
        <svg {...common}>
          <path d="M3 18h18" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="6" y="6" width="12" height="6" rx="2" fill="#93c5fd" />
        </svg>
      );
    case "squat":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3" fill="#c7f9cc" />
          <rect x="8" y="14" width="8" height="3" rx="1" fill="#16a34a" />
        </svg>
      );
    case "pull_up":
    case "chin_up":
      return (
        <svg {...common}>
          <path d="M4 4h16v4" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 8v8" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 8v8" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return <ExerciseThumbnail name={id} />;
  }
}
