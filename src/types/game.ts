export interface LibraryGame {
  id: string;
  name: string;
  system: string;
  icon: string;
  color: string;
  artwork?: string;
  fileName: string;
  relativePath: string;
  directoryKey: string;
  file?: File;
}
