import { useEffect, useState } from "react";
import { ExerciseRepository } from "../services/ExerciseRepository";

export function useExercise(name: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [pr, setPr] = useState({    weight: 0,    reps: 0,  });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState< { date: string; oneRM: number }[]>([]);


  useEffect(() => {
    async function load() {
      setLoading(true);

      const history =
        await ExerciseRepository.getExerciseHistory(name);

      const pr =
        await ExerciseRepository.getPersonalRecord(name);


        const progress =
            await ExerciseRepository.getProgress(name);


      setHistory(history);
      setPr(pr);
       setProgress(progress);
      setLoading(false);
    }

    load();
  }, [name]);

  return {
    history,
    pr,
    progress,
    loading,
  };
}