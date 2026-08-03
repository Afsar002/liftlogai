import { useState } from "react";
import toast from "react-hot-toast";

import type {
  WorkoutTemplateDB,
  TemplateExercise,
} from "../../../database/types";

import { TemplateRepository } from "../services/TemplateRepository";

import { ExerciseLibraryRepository } from "../../exercises/services/ExerciseLibraryRepository";
    
import ExercisePickerModal from "../../exercises/components/ExercisePickerModal";
import { useNavigate } from "react-router-dom";


interface Props {
  template: WorkoutTemplateDB;
}

export default function TemplateEditor({
  template,
}: Props) {
  const [edited, setEdited] =
    useState<WorkoutTemplateDB>(template);
const navigate = useNavigate();

        const [showPicker, setShowPicker] =
    useState(false);



  function updateExercise(
    index: number,
    updates: Partial<TemplateExercise>
  ) {
    const exercises = [...edited.exercises];

    exercises[index] = {
      ...exercises[index],
      ...updates,
    };

    setEdited({
      ...edited,
      exercises,
    });
  }

  function removeExercise(index: number) {
    setEdited({
      ...edited,
      exercises: edited.exercises.filter(
        (_, i) => i !== index
      ),
    });
  }
async function addExercise(id: string) {
  const exercise = await ExerciseLibraryRepository.getById(id);

  if (!exercise) return;

  setEdited({
    ...edited,
    exercises: [
      ...edited.exercises,
      {
        id: crypto.randomUUID(),
        name: exercise.name,
        targetSets: 3,
        targetReps: "8-12",
        rest: 90,
      },
    ],
  });
}

 async function save() {
  if (!edited.id) return;

  await TemplateRepository.update(edited.id, {
    ...edited,
    updatedAt: new Date().toISOString(),
  });

  toast.success("Template saved!");
setTimeout(() => {
  navigate("/templates");
}, 500);
 }

  return (
    <div className="space-y-5">
      <input
        value={edited.name}
        onChange={(e) =>
          setEdited({
            ...edited,
            name: e.target.value,
          })
        }
        className="
          w-full
          rounded-xl
          bg-white
          p-4
          text-2xl
          font-bold
          text-slate-950
          shadow-sm
          dark:bg-zinc-900
          dark:text-white
        "
    /> 
    
{edited.exercises.length === 0 && (
  <div
    className="
      rounded-xl
      border-2
      border-dashed
      border-zinc-200
      bg-white
      p-10
      text-center
      dark:border-zinc-700
      dark:bg-zinc-950
    "
  >
    <div className="text-5xl">🏋️</div>

    <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
      No exercises yet
    </h3>

    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
      Add your first exercise to start building this workout.
    </p>
  </div>
)}
      {edited.exercises.map(
        (exercise, index) => (
          <div
            key={exercise.id}
            className="
              rounded-xl
              bg-white
              p-5
              shadow-sm
              dark:bg-zinc-900
            "
          >
            <div className="flex justify-between">
              <input
                value={exercise.name}
                onChange={(e) =>
                  updateExercise(index, {
                    name: e.target.value,
                  })
                }
                className="
                  bg-transparent
                  text-lg
                  font-semibold
                  text-slate-950
                  dark:text-white
                "
              />

              <button
                onClick={() =>
                  removeExercise(index)
                }
                className="text-red-500"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <input
                type="number"
                value={exercise.targetSets}
                onChange={(e) =>
                  updateExercise(index, {
                    targetSets: Number(
                      e.target.value
                    ),
                  })
                }
                className="
                  rounded-lg
                  bg-slate-100
                  p-3
                  text-slate-950
                  dark:bg-zinc-800
                  dark:text-white
                "
              />

              <input
                value={exercise.targetReps}
                onChange={(e) =>
                  updateExercise(index, {
                    targetReps:
                      e.target.value,
                  })
                }
                className="
                  rounded-lg
                  bg-slate-100
                  p-3
                  text-slate-950
                  dark:bg-zinc-800
                  dark:text-white
                "
              />

              <input
                type="number"
                value={exercise.rest}
                onChange={(e) =>
                  updateExercise(index, {
                    rest: Number(
                      e.target.value
                    ),
                  })
                }
                className="
                  rounded-lg
                  bg-slate-100
                  p-3
                  text-slate-950
                  dark:bg-zinc-800
                  dark:text-white
                "
              />
            </div>
          </div>
          
        )
      
        )}
      
        
      <button
        onClick={() => setShowPicker(true)}
        className="
          w-full
          rounded-xl
          border
          border-dashed
          border-zinc-200
          bg-white
          py-4
          text-left
          pl-5
          font-semibold
          text-slate-950
          transition
          hover:border-green-400
          hover:text-green-700
          dark:border-zinc-700
          dark:bg-zinc-900
          dark:text-white
          dark:hover:text-green-300
        "
      >
        + Add Exercise
      </button>

      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addExercise}
        existingNames={edited.exercises.map((exercise) => exercise.name)}
      />
      <button
        onClick={save}
        className="
          w-full
          rounded-xl
          bg-green-500
          py-4
          font-semibold
          text-black
        "
      >
        Save Template
      </button>
    </div>
   ); 
}

