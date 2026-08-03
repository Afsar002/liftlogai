import Layout from "../../../shared/components/layout/Layout";
import { usePersonalRecords } from "../hooks/usePersonalRecords";
import PRCard from "../components/PRCard";

export default function RecordPage() {
  const { records , loading } = usePersonalRecords();

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-zinc-700 dark:text-zinc-400">
          Loading personal records...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-5 p-4">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Personal Records
        </h1>

        {records.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            No personal records yet.
            <br />
            Complete a workout to set your first PR.
          </div>
        ) : (
          records.map((record) => (
            <PRCard
              key={record.id}
              exercise={record.exerciseName}
              weight={record.weight}
              reps={record.reps}
              estimated1RM={record.estimated1RM}
            />
          ))
        )}
      </div>
    </Layout>
  );
}