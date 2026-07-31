import { useNavigate } from "react-router-dom";
import Card from "../../../shared/components/ui/Card";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiTarget,
} from "react-icons/fi";

const actions = [
  {
    title: "Workout Templates",
    icon: FiTarget,
    href: "/templates",
  },
  {
    title: "Personal Records",
    icon: FiBarChart2,
    href: "/records",
  },
  {
    title: "Weekly Progress",
    icon: FiClock,
    targetId: "weekly-progress",
  },
  {
    title: "Goal Insights",
    icon: FiActivity,
    targetId: "goals",
  },
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
          <Card key={action.title} className="overflow-hidden" padding="none">
            <button
              type="button"
              onClick={handleClick}
              className="
                flex
                w-full
                flex-col
                items-center
                gap-3
                rounded-[1.75rem]
                border
                border-zinc-200/70
                bg-white/90
                px-5
                py-6
                text-zinc-900
                transition
                duration-200
                hover:-translate-y-0.5
                hover:border-green-300/70
                hover:bg-green-50/80
                dark:border-zinc-800/70
                dark:bg-zinc-950/90
                dark:text-zinc-100
                dark:hover:border-green-400/70
                dark:hover:bg-green-950/80
              "
            >
              <Icon
                size={26}
                className="text-green-500"
              />

              <span className="font-medium">
                {action.title}
              </span>
            </button>
          </Card>
        );
      })}
    </div>
  );
}