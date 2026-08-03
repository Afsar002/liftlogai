import { FiCode, FiCpu, FiDatabase, FiHeart, FiInfo } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";

const rows = [
  { icon: <FiInfo size={15} aria-hidden="true" />, label: "Version", value: "1.0.0" },
  { icon: <FiCode size={15} aria-hidden="true" />, label: "Framework", value: "React 19" },
  { icon: <FiCpu size={15} aria-hidden="true" />, label: "Language", value: "TypeScript" },
  { icon: <FiDatabase size={15} aria-hidden="true" />, label: "Database", value: "Dexie.js" },
];

/**
 * Compact about panel — the tech stack as small spec chips instead of a list.
 */
export default function AboutCard() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">About</h3>
      </div>

      <Card>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-2.5 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-white/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-white/8 dark:text-zinc-300">
                  {row.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {row.label}
                  </p>
                  <p className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-lime-400/10 px-4 py-3">
            <FiHeart size={15} className="shrink-0 text-emerald-500" aria-hidden="true" />
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              LiftLog AI — built to help you build stronger habits.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
