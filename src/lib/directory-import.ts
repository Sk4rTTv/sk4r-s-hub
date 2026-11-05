import type { AppDirectoryScan } from "@/types/desktop";

export interface DirectoryCandidate {
  key: string;
  name: string;
  fileName: string;
  relativePath: string;
  file?: File;
}
export interface DirectoryReview {
  folderName: string;
  candidates: DirectoryCandidate[];
  truncated: boolean;
  skippedDirectories: number;
}
const appExtension = /\.(exe|msi|apk|appimage|dmg|pkg|jar|deb|rpm|lnk|desktop|zip|7z)$/i;
export const directoryFileKey = (file: File) => `file:${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
const appName = (fileName: string) => fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 120) || "Imported app";

export function reviewBrowserDirectory(files: File[]): DirectoryReview {
  const candidates: DirectoryCandidate[] = [];
  let truncated = files.length > 20000;
  for (const file of files.slice(0, 20000)) {
    if (!appExtension.test(file.name)) continue;
    if (candidates.length >= 500) { truncated = true; break; }
    candidates.push({ key: directoryFileKey(file), name: appName(file.name), fileName: file.name, relativePath: file.webkitRelativePath || file.name, file });
  }
  return { folderName: files[0]?.webkitRelativePath.split("/")[0] || "Selected folder", candidates, truncated, skippedDirectories: 0 };
}

export function reviewDesktopDirectory(scan: AppDirectoryScan): DirectoryReview {
  return { folderName: scan.folderName, truncated: scan.truncated, skippedDirectories: scan.skippedDirectories, candidates: scan.entries.map(entry => ({ key: `desktop:${entry.id}`, name: appName(entry.fileName), fileName: entry.fileName, relativePath: entry.relativePath })) };
}
