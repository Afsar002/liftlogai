import {
  BACKUP_VERSION,
  type BackupFile,
} from "../types/BackupFile";

export function validateBackup(
  data: unknown
): BackupFile {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid backup file.");
  }

  const backup = data as BackupFile;

  if (!backup.metadata) {
    throw new Error("Backup metadata is missing.");
  }

  if (!backup.database) {
    throw new Error("Backup data is missing.");
  }

  if (backup.metadata.app !== "LiftLog AI") {
    throw new Error(
      "This is not a LiftLog AI backup."
    );
  }

  if (
    backup.metadata.version !==
    BACKUP_VERSION
  ) {
    throw new Error(
      `Unsupported backup version (${backup.metadata.version}).`
    );
  }

  const db = backup.database;

  if (!Array.isArray(db.templates)) {
    throw new Error("Templates are missing.");
  }

  if (!Array.isArray(db.workoutSessions)) {
    throw new Error("Workout sessions are missing.");
  }

  if (!Array.isArray(db.history)) {
    throw new Error("Workout history is missing.");
  }

  if (!Array.isArray(db.personalRecords)) {
    throw new Error("Personal records are missing.");
  }

  if (!db.settings) {
    throw new Error("Settings are missing.");
  }

  return backup;
}