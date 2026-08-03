import {
  FiArchive,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Card from "../../../shared/components/ui/Card";
import ListRow from "../../../shared/components/ui/ListRow";
import SectionTitle from "../../../shared/components/ui/SectionTitle";

import { exportDatabase } from "../../../features/data/services/exportDatabase";
import { useRef } from "react";
import { restoreBackup } from "../../../features/data/services/restoreBackup";
import {useState} from "react"
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { resetDatabase } from "../../data/services/resetDatabase";
import { readBackupFile } from "../../data/services/readBackupFile";





export default function DataCard() {
const fileInputRef = useRef<HTMLInputElement>(null);
const [showResetDialog, setShowResetDialog] = useState(false);


async function handleReset() {
  try {
    await resetDatabase();

    toast.success("All data has been reset.", {
      duration: 1000,
    });

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

    async function handleFileSelected(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const backup = await readBackupFile(file);

    await restoreBackup(backup);

    toast.success("Backup restored successfully.",{
      duration: 1000,});
    

    // Reset input so the same file can be selected again later
    event.target.value = "";
setTimeout(()=>{
    // Reload app so all components read the restored data
    window.location.reload();
  },1000);
  } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to restore backup."
    );

    event.target.value = "";
  }
}

  

  return (
    <Card>
      <SectionTitle
        title="Backup & Restore"
        subtitle="Keep your LiftLog AI data safe."
        action={<FiArchive size={20} />}
      />

      <div className="space-y-2">
        <ListRow
          clickable
          icon={<FiArchive size={18} />}
          title="Create Backup"
          subtitle="Save your workouts, templates and settings."
          onClick={createBackup}
        />

        <ListRow
          clickable
          icon={<FiRotateCcw size={18} />}
          title="Restore Backup"
          subtitle="Restore data from a previous backup."
          onClick={handleRestoreBackup}
        />

        <ListRow
        clickable
  danger
  icon={<FiTrash2 size={18}/>}
  title="Reset All Data"
  subtitle="Permanently delete everything stored on this device."
  onClick={() => setShowResetDialog(true)}
/>
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
  );
}