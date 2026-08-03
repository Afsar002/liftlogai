import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { AnimatedPage } from "../../../shared/components/motion";

import ProgramsHero from "../components/ProgramsHero";
import FeaturedPrograms from "../components/FeaturedPrograms";
import ProgramCard from "../components/ProgramCard";

import { useTemplates } from "../hooks/useTemplates";
import { TemplateRepository } from "../services/TemplateRepository";
import type { WorkoutTemplateDB } from "../../../database/types";

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

  function handleStart(template: WorkoutTemplateDB) {
    if (currentSession) {
      const confirmStart = window.confirm(
        "An active workout session is already in progress. Start a new workout and discard the current session?"
      );
      if (!confirmStart) return;
    }

    const workout = WorkoutSessionFactory.create(template);

    setSession(workout);

    toast.success(`${template.name} started`);

    navigate("/workout");
  }

  async function handleEdit(template: WorkoutTemplateDB) {
    navigate(`/templates/${template.id}`);
  }

  async function handleDuplicate(template: WorkoutTemplateDB) {
    if (!template.id) return;

    await TemplateRepository.duplicate(template.id);

    toast.success("Template duplicated");

    reload();
  }

  async function handleDelete(template: WorkoutTemplateDB) {
    if (!template.id) return;

    if (confirm(`Delete "${template.name}"?`)) {
      await TemplateRepository.delete(template.id);

      toast.success("Template deleted");

      reload();
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl space-y-7">
          <Skeleton variant="rectangular" className="h-44" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton variant="card" className="h-72" />
            <Skeleton variant="card" className="h-72" />
            <Skeleton variant="card" className="h-72" />
          </div>
        </div>
      </Layout>
    );
  }

  const recent = [...templates].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const featured = recent.slice(0, 3);
  const totalExercises = templates.reduce((sum, t) => sum + t.exercises.length, 0);

  return (
    <Layout>
      <AnimatedPage>
        <div className="mx-auto max-w-5xl space-y-9">
          <ProgramsHero
            programCount={templates.length}
            exerciseCount={totalExercises}
            onCreate={handleCreateTemplate}
          />

          {templates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/10">
              <p className="text-4xl">🏋️</p>
              <h2 className="mt-3 text-lg font-black text-zinc-900 dark:text-white">No programs yet</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Create a routine to start logging faster.
              </p>
              <button
                type="button"
                onClick={handleCreateTemplate}
                className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-extrabold text-emerald-950 shadow-fab"
              >
                Create your first program
              </button>
            </div>
          ) : (
            <>
              {featured.length > 1 && (
                <section>
                  <div className="mb-3 flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                      Featured
                    </h2>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                      recently updated
                    </span>
                  </div>
                  <FeaturedPrograms
                    templates={featured}
                    onStart={handleStart}
                    onOpen={handleEdit}
                  />
                </section>
              )}

              <section>
                <div className="mb-3 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                    All programs
                  </h2>
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {templates.length} saved
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <ProgramCard
                      key={template.id}
                      template={template}
                      onStart={() => handleStart(template)}
                      onEdit={() => handleEdit(template)}
                      onDuplicate={() => handleDuplicate(template)}
                      onDelete={() => handleDelete(template)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </AnimatedPage>
    </Layout>
  );
}
