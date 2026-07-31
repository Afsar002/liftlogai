import type { WorkoutTemplateDB } from "../../../database/types";

import { Menu } from "@headlessui/react";
import {
  FiCopy,
  FiEdit2,
  FiMoreVertical,
  FiPlay,
  FiTrash2,
} from "react-icons/fi";

interface Props {
  template: WorkoutTemplateDB;

  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function TemplateCard({
  template,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-500
        hover:shadow-xl
        hover:shadow-green-500/10
        dark:border-zinc-800
        dark:bg-zinc-900
      "
    >
      {/* Green Accent */}
      <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {template.name}
          </h2>

          <div
            className="
              mt-3
              inline-flex
              items-center
              rounded-full
              bg-green-500/15
              px-3
              py-1
              text-xs
              font-semibold
              text-green-400
            "
          >
            🏋 {template.exercises.length} Exercises
          </div>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button
            className="
              rounded-lg
              p-2
              text-zinc-500
              transition
              hover:bg-slate-100
              hover:text-slate-950
              dark:text-zinc-400
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            <FiMoreVertical size={20} />
          </Menu.Button>

          <Menu.Items
            className="
              absolute
              right-0
              z-50
              mt-2
              w-48
              overflow-hidden
              rounded-xl
              border
              border-zinc-200
              bg-white
              shadow-xl
              focus:outline-none
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onEdit}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    transition
                    ${active ? "bg-slate-100 dark:bg-zinc-800" : ""}
                  `}
                >
                  <FiEdit2 />
                  Edit
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onDuplicate}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    transition
                    ${active ? "bg-slate-100 dark:bg-zinc-800" : ""}
                  `}
                >
                  <FiCopy />
                  Duplicate
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-red-400
                    transition
                    ${active ? "bg-slate-100 dark:bg-zinc-800" : ""}
                  `}
                >
                  <FiTrash2 />
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-zinc-200 dark:border-zinc-800" />

      {/* Exercise Preview */}
      <div className="space-y-2">
        {template.exercises.slice(0, 4).map((exercise) => (
          <div
            key={exercise.id}
            className="
              flex
              items-center
              justify-between
              rounded-lg
              px-2
              py-2
              text-sm
              text-zinc-700
              transition
              hover:bg-slate-100/90
              dark:text-zinc-300
              dark:hover:bg-zinc-800/40
            "
          >
            <span className="truncate">
              {exercise.name}
            </span>

            <span className="text-zinc-400">
              {exercise.targetSets} × {exercise.targetReps}
            </span>
          </div>
        ))}

        {template.exercises.length > 4 && (
          <button
            className="
              mt-2
              text-sm
              font-medium
              text-green-600
              transition
              hover:text-green-500
            "
          >
            +{template.exercises.length - 4} more exercises
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

      {/* Start Button */}
      <button
        onClick={onStart}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-blue-500
          to-emerald-500
          py-3.5
          font-semibold
          text-black
          transition-all
          duration-200
          hover:scale-[1.02]
          hover:shadow-lg
          hover:shadow-green-500/20
          active:scale-[0.98]
        "
      >
        <FiPlay />
        Start Workout
      </button>
    </div>
  );
}