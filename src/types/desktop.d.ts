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
      launchExecutable: (id: string) => Promise<{ launched: boolean }>;
      listProjectionSources: () => Promise<ProjectionSource[]>;
      selectProjectionSource: (id: string) => Promise<void>;
    };
  }
}
