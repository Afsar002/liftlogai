import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiCalendar, FiMaximize, FiMove } from "react-icons/fi";
import type { UserSettings } from "../../settings/types";

interface Props {
  settings: UserSettings | null;
}

function Metric({
  icon,
  label,
  value,
  unit,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 30 }}
      className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-3.5 shadow-sm dark:border-white/8 dark:bg-[#141417]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        {icon}
      </span>
      <div>
        <p className="text-lg font-black tabular-nums leading-none text-zinc-950 dark:text-white">
          {value}
          <span className="ml-1 text-xs font-bold text-zinc-400 dark:text-zinc-500">{unit}</span>
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Body metrics dashboard — four metric tiles (weight, height, age, target)
 * that replace the old profile list rows. Presentational; editing happens in
 * the profile editor sheet.
 */
export default function BodyMetrics({ settings }: Props) {
  if (!settings) return null;

  const weight = settings.weightUnit === "lb"
    ? (settings.weight * 2.20462).toFixed(1)
    : settings.weight.toFixed(1);
  const target = settings.weightUnit === "lb"
    ? (settings.targetWeight * 2.20462).toFixed(1)
    : settings.targetWeight.toFixed(1);
  const height = settings.heightUnit === "ft"
    ? `${Math.floor(settings.height / 30.48)}'${Math.round((settings.height % 30.48) / 2.54)}"`
    : `${settings.height} cm`;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Body metrics</h3>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          used for calorie targets
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<FiActivity size={16} aria-hidden="true" />} label="Weight" value={weight} unit={settings.weightUnit.toUpperCase()} delay={0} />
        <Metric icon={<FiMaximize size={16} aria-hidden="true" />} label="Height" value={height} unit="" delay={0.05} />
        <Metric icon={<FiCalendar size={16} aria-hidden="true" />} label="Age" value={String(settings.age || "—")} unit="yrs" delay={0.1} />
        <Metric icon={<FiMove size={16} aria-hidden="true" />} label="Target" value={target} unit={settings.weightUnit.toUpperCase()} delay={0.15} />
      </div>
    </div>
  );
}
