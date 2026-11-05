export interface NativeExecutable {
  id: string;
  name: string;
  fileName: string;
}

declare global {
  interface Window {
    emuDesktop?: {
      selectExecutable: () => Promise<NativeExecutable | null>;
      launchExecutable: (id: string) => Promise<{ launched: boolean }>;
    };
  }
}
