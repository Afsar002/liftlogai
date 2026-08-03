import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiGrid,
  FiTarget,
} from "react-icons/fi";

interface QuickAction {
  title: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  href?: string;
  targetId?: string;
  wide?: boolean;
}

const actions: QuickAction[] = [
  { title: "Workout Templates", icon: FiTarget, href: "/templates" },
  { title: "Personal Records", icon: FiBarChart2, href: "/records" },
  { title: "Weekly Progress", icon: FiClock, targetId: "weekly-progress" },
  { title: "Goal Insights", icon: FiActivity, targetId: "goals" },
  { title: "Exercise Library", icon: FiGrid, href: "/exercises", wide: true },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;

        function handleClick() {
          if (action.targetId) {
            const target = document.getElementById(action.targetId);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
          }
          if (action.href) {
            navigate(action.href);
          }
        }

        return (
          <Card
            key={action.title}
            className={cn("overflow-hidden", action.wide && "col-span-2")}
            padding="none"
          >
            <button
              type="button"
              onClick={handleClick}
              className="group flex w-full flex-col items-center gap-3 rounded-2xl px-4 py-5 text-center transition-colors duration-200 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:hover:bg-white/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 transition-transform duration-200 group-hover:scale-110 dark:bg-white/8 dark:text-zinc-400">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {action.title}
              </span>
            </button>
          </Card>
        );
      })}
    </div>
  );
}
