import { useMemo, useState, useEffect } from "react";
import { ExerciseLibraryRepository } from "../services/ExerciseLibraryRepository";
import { ExerciseIcon } from "./ExerciseIcons";

interface Props {
  onSelect(id: string): void;
  existingNames?: string[];
}

export default function ExercisePicker({
  onSelect,
  existingNames = [],
}: Props) {
  const [search, setSearch] = useState("");

  const [library, setLibrary] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await ExerciseLibraryRepository.getAll();
      if (!mounted) return;
      setLibrary(data);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return library
      .filter((exercise) => !existingNames.includes(exercise.name))
      .filter((exercise) =>
        exercise.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [search, existingNames, library]);

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();

    function classify(muscle?: string) {
      if (!muscle) return "Other";

      const m = muscle.toLowerCase();

      if (m.includes("chest")) return "Chest";
      if (m.includes("back")) return "Back";

      if (
        m.includes("biceps") ||
        m.includes("triceps") ||
        m.includes("shoulder") ||
        m.includes("delts")
      )
        return "Upper Body";

      if (
        m.includes("leg") ||
        m.includes("quad") ||
        m.includes("hamstring") ||
        m.includes("glute") ||
        m.includes("calf")
      )
        return "Lower Body";

      if (m.includes("core") || m.includes("abs") || m.includes("plank"))
        return "Core";

      if (m.includes("cardio") || m.includes("sprint") || m.includes("row"))
        return "Cardio";

      if (m.includes("full body") || m.includes("full")) return "Full Body";

      return "Other";
    }

    filtered.forEach((ex) => {
      const cat = classify(ex.muscle);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(ex);
    });

    // Keep a consistent order
    const order = ["Chest", "Back", "Upper Body", "Lower Body", "Core", "Full Body", "Cardio", "Other"];

    return order.map((k) => ({
      category: k,
      items: map.get(k) ?? [],
    })).filter(g => g.items.length > 0);
  }, [filtered]);

  const visibleGroups = useMemo(() => {
    if (selectedCategory === "All") return groups;

    return groups.filter((g) => g.category === selectedCategory);
  }, [groups, selectedCategory]);

  return (
    <div className="space-y-4">
      <input
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-slate-50 p-3 text-slate-950 shadow-sm outline-none dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
      />

      {/* Category tabs */}
      <div className="mb-3 overflow-x-auto hide-scrollbar scroll-snap-x">
        <div className="inline-flex gap-2 px-1">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`flex-shrink-0 scroll-snap-child rounded-lg px-3 py-1 text-sm ${selectedCategory === "All" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent"}`}
          >
            All
          </button>

          {groups.map((g) => (
            <button
              key={g.category}
              onClick={() => setSelectedCategory(g.category)}
              className={`flex-shrink-0 scroll-snap-child rounded-lg px-3 py-1 text-sm ${selectedCategory === g.category ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent"}`}
            >
              {g.category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <div key={group.category}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{group.category}</div>

                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [group.category]: !c[group.category] }))}
                  className="text-sm text-zinc-500"
                >
                  {collapsed[group.category] ? "Expand" : "Collapse"}
                </button>
              </div>

              {!collapsed[group.category] && (
                <div className="space-y-2">
                  {group.items.map((exercise: any) => (
                    <button
                      key={exercise.id}
                      onClick={() => onSelect(exercise.id)}
                      className="w-full rounded-lg bg-white p-3 text-left text-slate-950 shadow-sm transition hover:bg-slate-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 flex items-center gap-3"
                    >
                      {/* use per-exercise icon when available */}
                      <div className="flex-shrink-0"> 
                        {/* @ts-ignore */}
                        <ExerciseIcon id={exercise.id} size={36} />
                      </div>
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">{exercise.muscle} • {exercise.equipment}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-slate-50/90 p-4 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-400">
            {existingNames.length > 0 ? "All available exercises are already added." : "No matching exercises found."}
          </div>
        )}
      </div>
      {/* Allow creating custom exercise when no match */}
      {filtered.length === 0 && (
        <CreateCustomExercise
          onCreated={async (exercise) => {
            const created = await ExerciseLibraryRepository.create(exercise);
            setLibrary((l) => [created, ...l]);
            onSelect(created.id);
          }}
        />
      )}
    </div>
  );
}

function CreateCustomExercise({
  onCreated,
}: {
  onCreated(ex: { name: string; muscle?: string; equipment?: string }): void;
}) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">Create new exercise</div>

      <input
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Muscle (optional)"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"
        />

        <input
          placeholder="Equipment (optional)"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800"
        />
      </div>

      <div className="flex justify-end">
        <button
          disabled={!name.trim()}
          onClick={() => onCreated({ name: name.trim(), muscle: muscle.trim(), equipment: equipment.trim() })}
          className="rounded-lg bg-green-500 px-3 py-1 text-black disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}