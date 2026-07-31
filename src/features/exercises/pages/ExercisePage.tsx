import { useParams } from "react-router-dom";
import Layout from "../../../shared/components/layout/Layout";
import { useExercise } from "../hooks/useExercise";
import ExerciseHeader from "../components/ExerciseHeader";
import PRCard from "../components/PRCard";
import StrengthChart from "../components/StrengthChart";
import ExerciseHistory from "../components/ExerciseHistory";




export default function ExercisePage() {
  const { name } = useParams();

  const { history, pr, progress, loading } = useExercise(name ?? "");

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ExerciseHeader
          name={name ?? ""}
          sessions={history.length}
        />

        <PRCard
          weight={pr.weight}
          reps={pr.reps}
        />

        <StrengthChart data={progress} />

<ExerciseHistory history={history} />
      </div>
    </Layout>
  );
}