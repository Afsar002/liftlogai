import type { BackupFile } from "../types/BackupFile";
import { validateBackup } from "./validateBackup";

export async function readBackupFile(
  file: File
): Promise<BackupFile> {
  if (file.size === 0) {
    throw new Error("The selected file is empty.");
  }

  const text = await file.text();

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  return validateBackup(parsed);
}