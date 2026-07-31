import {downloadBackup} from "./downloadBackup";
import {buildBackup} from "./buildBackup";


export async function exportDatabase() {
    const backup = await buildBackup();

    downloadBackup(backup);
}