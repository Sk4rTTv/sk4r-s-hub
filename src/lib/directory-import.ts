import type { AppDirectoryScan } from "@/types/desktop";
import gameFormats from "@/types/game-formats.json";
import { SYSTEMS } from "@/types/emulation";

export type DirectoryKind = "apps" | "games";
export interface DirectoryCandidate {
  key: string;
  name: string;
  fileName: string;
  relativePath: string;
  system?: string;
  file?: File;
}
export interface DirectorySelection extends DirectoryCandidate { system: string }
export interface DirectoryReview {
  folderName: string;
  candidates: DirectoryCandidate[];
  truncated: boolean;
  skippedDirectories: number;
}
const appExtension = /\.(exe|msi|apk|appimage|dmg|pkg|jar|deb|rpm|lnk|desktop|zip|7z)$/i;
const formats: Record<string, string | null> = gameFormats;
export const directoryFileKey = (file: File) => `file:${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
const entryName = (fileName: string) => fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 120) || "Imported item";

export function inferGameConsole(relativePath: string): string | undefined {
  const extension = relativePath.match(/\.[^.\\/]+$/)?.[0].toLowerCase() ?? "";
  if (formats[extension]) return formats[extension]!;
  const aliases: Record<string, string> = { n64: "Nintendo 64", gba: "Game Boy Advance", gb: "Game Boy", gbc: "Game Boy", nds: "Nintendo DS", ds: "Nintendo DS", "3ds": "Nintendo 3DS", "super nintendo": "SNES", "mega drive": "Genesis", ps1: "PlayStation", ps2: "PlayStation 2", "pc engine": "TurboGrafx-16" };
  for (const folder of relativePath.split(/[\\/]/).slice(0, -1).reverse()) {
    const normalized = folder.toLowerCase().replace(/[_-]+/g, " ").trim();
    const console = Object.prototype.hasOwnProperty.call(aliases, normalized) ? aliases[normalized] : SYSTEMS.find(system => system.toLowerCase().replace(/[_-]+/g, " ").trim() === normalized);
    if (console && !["Multi-system", "Modern"].includes(console)) return console;
  }
}

export function reviewBrowserDirectory(files: File[], kind: DirectoryKind = "apps"): DirectoryReview {
  const candidates: DirectoryCandidate[] = [];
  let truncated = files.length > 20000;
  for (const file of files.slice(0, 20000)) {
    const extension = file.name.match(/\.[^.]+$/)?.[0].toLowerCase() ?? "";
    if (kind === "apps" ? !appExtension.test(file.name) : !Object.prototype.hasOwnProperty.call(formats, extension)) continue;
    if (candidates.length >= 500) { truncated = true; break; }
    const relativePath = file.webkitRelativePath || file.name;
    candidates.push({ key: directoryFileKey(file), name: entryName(file.name), fileName: file.name, relativePath, file, system: kind === "games" ? inferGameConsole(relativePath) : undefined });
  }
  return { folderName: files[0]?.webkitRelativePath.split("/")[0] || "Selected folder", candidates, truncated, skippedDirectories: 0 };
}

export function reviewDesktopDirectory(scan: AppDirectoryScan, kind: DirectoryKind = "apps"): DirectoryReview {
  return { folderName: scan.folderName, truncated: scan.truncated, skippedDirectories: scan.skippedDirectories, candidates: scan.entries.map(entry => ({ key: `desktop:${entry.id}`, name: entryName(entry.fileName), fileName: entry.fileName, relativePath: entry.relativePath, system: kind === "games" ? inferGameConsole(entry.relativePath) : undefined })) };
}
