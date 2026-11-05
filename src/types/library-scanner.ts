export interface LibraryMetadata {
  status: "pending" | "matched" | "unmatched" | "needs-console" | "error";
  description?: string;
  releaseYear?: number;
  developer?: string;
  artwork?: string;
  source?: "ScreenScraper" | "Wikipedia";
  sourceUrl?: string;
  message?: string;
  system?: string;
}
export interface ScannerCredentials {
  developerId: string;
  developerPassword: string;
  username: string;
  password: string;
}
export interface ScannerEntry {
  id: string;
  folderId: string;
  kind: "apps" | "games";
  fileName: string;
  relativePath: string;
  title: string;
  system: string;
  metadata?: LibraryMetadata;
}
export interface ScannerState {
  connected: boolean;
  paused: boolean;
  error: string;
  current: string;
  queued: number;
  folders: { id: string; folderName: string; kind: "apps" | "games" | "both"; files: number; lastScan: number | null; warning: string; scanning: boolean }[];
}
export interface ScannerSnapshot extends ScannerState { entries: ScannerEntry[] }
export type ScannerEvent = { type: "state"; state: ScannerState } | { type: "entries"; entries: ScannerEntry[] } | { type: "metadata"; id: string; kind: "apps" | "games"; metadata: LibraryMetadata };
