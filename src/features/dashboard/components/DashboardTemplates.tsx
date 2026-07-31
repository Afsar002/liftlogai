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
      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiGrid className="text-green-600 dark:text-green-400" />

            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Workout Templates
            </h2>
          </div>

          <button
            onClick={() => navigate("/templates")}
            className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            See All
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-slate-50 py-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              No templates yet.
            </p>

            <button
              onClick={() => navigate("/templates")}
              className="mt-4 rounded-lg bg-green-500 px-4 py-2 font-medium text-black hover:bg-green-400"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() =>
                  navigate(`/templates/${template.id}`)
                }
                className="flex w-full items-center justify-between rounded-xl bg-slate-100 p-4 text-slate-950 transition hover:bg-slate-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {template.name}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {template.exercises.length} Exercises
                  </p>
                </div>

                <FiChevronRight className="text-zinc-500 dark:text-zinc-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}