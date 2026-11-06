export interface NativeExecutable {
  id: string;
  name: string;
  fileName: string;
}

export interface ProjectionSource {
  id: string;
  name: string;
  type: "monitor" | "application";
}

export interface AppDirectoryScan {
  folderName: string;
  entries: { id: string; fileName: string; relativePath: string }[];
  truncated: boolean;
  skippedDirectories: number;
}

declare global {
  interface Window {
    emuDesktop?: {
      selectExecutable: () => Promise<NativeExecutable | null>;
      selectAppDirectory: () => Promise<AppDirectoryScan | null>;
      selectGameDirectory: () => Promise<AppDirectoryScan | null>;
      launchExecutable: (id: string) => Promise<{ launched: boolean }>;
      listProjectionSources: () => Promise<ProjectionSource[]>;
      selectProjectionSource: (id: string) => Promise<void>;
      scannerState: () => Promise<import("./library-scanner").ScannerSnapshot>;
      connectScanner: (credentials: import("./library-scanner").ScannerCredentials) => Promise<{ connected: boolean }>;
      startScanner: (options: { kind: "apps" | "games" | "both"; system: string }) => Promise<{ id: string } | null>;
      stopScanner: (id: string) => Promise<void>;
      resumeScanner: () => Promise<void>;
      retryScannerMetadata: (id: string, system: string, title: string) => Promise<void>;
      disconnectScanner: () => Promise<void>;
      onScannerEvent: (callback: (event: import("./library-scanner").ScannerEvent) => void) => () => void;
      readPlayStats: (gameIds: string[]) => Promise<import("./play-stats").PlayStatsSnapshot>;
      logPlaySession: (gameId: string, session: import("./play-stats").CompletedPlaySession) => Promise<import("./play-stats").PlayStatsSnapshot>;
    };
  }
}
