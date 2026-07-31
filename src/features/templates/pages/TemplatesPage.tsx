import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Layout from "../../../shared/components/layout/Layout";

import TemplateList from "../components/TemplateList";

import { useTemplates } from "../hooks/useTemplates";
import { TemplateRepository } from "../services/TemplateRepository";

import { WorkoutSessionFactory } from "../../workout/services/WorkoutSessionFactory";
import { useWorkout } from "../../workout/context/WorkoutContext";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { session: currentSession, setSession } = useWorkout();

  const { templates, loading, reload } = useTemplates();

  async function handleCreateTemplate() {
    const name = window.prompt("Enter workout name");

    if (!name) return;

    const trimmed = name.trim();

    if (!trimmed) return;

    const id = await TemplateRepository.createBlank(trimmed);

    navigate(`/templates/${id}`);
  }

  if (loading) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">
          Loading templates...
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Workout Templates
          </h1>

          <button
            onClick={handleCreateTemplate}
            className="
              rounded-xl
              bg-gradient-to-r
              from-green-500
              to-emerald-500
              px-5
              py-3
              font-semibold
              text-black
              transition
              hover:scale-105
            "
          >
            + New
          </button>
        </div>

        <TemplateList
          templates={templates}
          onStart={(template) => {
            if (currentSession) {
              const confirmStart = window.confirm(
                "An active workout session is already in progress. Start a new workout and discard the current session?"
              );
              if (!confirmStart) return;
            }

            const workout =
              WorkoutSessionFactory.create(template);

            setSession(workout);

            toast.success(`${template.name} started`);

            navigate("/workout");
          }}
          onEdit={(template) => {
            navigate(`/templates/${template.id}`);
          }}
          onDuplicate={async (template) => {
            if (!template.id) return;

            await TemplateRepository.duplicate(
              template.id
            );

            toast.success("Template duplicated");

            reload();
          }}
          onDelete={async (template) => {
            if (!template.id) return;

            if (
              confirm(`Delete "${template.name}"?`)
            ) {
              await TemplateRepository.delete(
                template.id
              );

              toast.success("Template deleted");

              reload();
            }
          }}
        />
      </div>
    </Layout>
  );
}