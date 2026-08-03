import { FiArchive, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

import Card from "../../../shared/components/ui/Card";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

import { exportDatabase } from "../../../features/data/services/exportDatabase";
import { useRef, useState } from "react";
import { restoreBackup } from "../../../features/data/services/restoreBackup";
import { resetDatabase } from "../../data/services/resetDatabase";
import { readBackupFile } from "../../data/services/readBackupFile";

export default function DataCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  async function handleReset() {
    try {
      await resetDatabase();
      toast.success("All data has been reset.", { duration: 1000 });
      setShowResetDialog(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset data.");
    }
  }

  async function createBackup() {
    try {
      await exportDatabase();
      toast.success("Backup created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create backup.");
    }
  }

  function handleRestoreBackup() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = await readBackupFile(file);
      await restoreBackup(backup);
      toast.success("Backup restored successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to restore backup.");
      event.target.value = "";
    }
  }

  const actions = [
    {
      id: "backup",
      icon: <FiArchive size={18} aria-hidden="true" />,
      title: "Create backup",
      desc: "Save workouts & settings",
      onClick: createBackup,
      tone: "emerald" as const,
    },
    {
      id: "restore",
      icon: <FiRotateCcw size={18} aria-hidden="true" />,
      title: "Restore",
      desc: "From a previous backup",
      onClick: handleRestoreBackup,
      tone: "zinc" as const,
    },
    {
      id: "reset",
      icon: <FiTrash2 size={18} aria-hidden="true" />,
      title: "Reset all data",
      desc: "Erase everything",
      onClick: () => setShowResetDialog(true),
      tone: "red" as const,
    },
  ];

  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
    zinc: "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-white/12",
    red: "bg-red-500/10 text-red-500 group-hover:bg-red-500/20",
  };

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Account & data</h3>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          stored on this device
        </span>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-200/70 p-3 text-center transition-colors hover:border-zinc-300 dark:border-white/8"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${tones[action.tone]}`}>
                {action.icon}
              </span>
              <span className="text-xs font-bold leading-tight text-zinc-800 dark:text-zinc-200">
                {action.title}
              </span>
              <span className="text-[10px] font-medium leading-tight text-zinc-400 dark:text-zinc-500">
                {action.desc}
              </span>
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleFileSelected}
        />

        <ConfirmDialog
          open={showResetDialog}
          title="Reset All Data"
          description="This will permanently delete all workouts, templates, personal records and settings. This action cannot be undone."
          confirmText="Delete Everything"
          variant="danger"
          onCancel={() => setShowResetDialog(false)}
          onConfirm={handleReset}
        />
      </Card>
    </div>
  );
}
