import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiGrid } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import { TemplateRepository } from "../../templates/services/TemplateRepository";
import type { WorkoutTemplateDB } from "../../../database/types";

export default function DashboardTemplates() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<
    WorkoutTemplateDB[]
  >([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const data = await TemplateRepository.getAll();
    setTemplates(data.slice(0, 3));
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
            <FiGrid size={18} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Workout Templates
          </h2>
        </div>

        <button
          onClick={() => navigate("/templates")}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          See All
        </button>
      </div>

      <div className="mt-5">
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400">
              No templates yet.
            </p>
            <button
              onClick={() => navigate("/templates")}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => navigate(`/templates/${template.id}`)}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/8"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {template.exercises.length} Exercises
                  </p>
                </div>
                <FiChevronRight className="shrink-0 text-zinc-400" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
