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

declare global {
  interface Window {
    emuDesktop?: {
      selectExecutable: () => Promise<NativeExecutable | null>;
      launchExecutable: (id: string) => Promise<{ launched: boolean }>;
      listProjectionSources: () => Promise<ProjectionSource[]>;
      selectProjectionSource: (id: string) => Promise<void>;
    };
  }
}
