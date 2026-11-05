export interface EmulationApp {
  id: string;
  name: string;
  system: string;
  icon: string;
  color: string;
  artwork?: string;
  url?: string;
  appFile?: File;
  status: "installed" | "not-installed" | "favorite";
}

export const SYSTEMS = [
  "Multi-system",
  "NES",
  "SNES",
  "Nintendo 64",
  "GameCube",
  "Wii",
  "Game Boy",
  "Game Boy Advance",
  "Nintendo DS",
  "Nintendo 3DS",
  "Genesis",
  "Sega Saturn",
  "PlayStation",
  "PlayStation 2",
  "PSP",
  "PS Vita",
  "Atari 2600",
  "TurboGrafx-16",
  "Neo Geo",
  "Dreamcast",
  "Modern",
];
