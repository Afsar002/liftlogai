import type { BackupFile } from "../types/BackupFile";

function createFilename(): string {
  const now = new Date();

  const date = now.toISOString().slice(0, 10);

  const time = now
    .toTimeString()
    .slice(0, 8)
    .replace(/:/g, "-");

  return `liftlog-backup-${date}-${time}.json`;
}

export function downloadBackup(
  backup: BackupFile,
  filename = createFilename()
) {
  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(url);
  }
}