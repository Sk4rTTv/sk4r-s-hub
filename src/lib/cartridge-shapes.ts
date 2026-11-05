export type CartridgeShape = "nes" | "snes" | "n64" | "gb" | "gba" | "ds" | "genesis" | "atari" | "hucard" | "neogeo" | "disc" | "generic";

export function getCartridgeShape(system: string): CartridgeShape {
  const name = system.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (/\b(snes|super nintendo|super famicom)\b/.test(name)) return "snes";
  if (/\b(n64|nintendo 64)\b/.test(name)) return "n64";
  if (/\b(nes|nintendo entertainment system|famicom)\b/.test(name)) return "nes";
  if (/\b(gba|game boy advance|gameboy advance)\b/.test(name)) return "gba";
  if (/\b(game boy|gameboy|gb|gbc)\b/.test(name)) return "gb";
  if (/\b(nintendo ds|nintendo 3ds|ds|3ds|ps vita|vita)\b/.test(name)) return "ds";
  if (/\b(genesis|mega drive|megadrive)\b/.test(name)) return "genesis";
  if (/\b(atari|2600)\b/.test(name)) return "atari";
  if (/\b(turbografx|turbo grafx|pc engine|hucard)\b/.test(name)) return "hucard";
  if (/\b(neo geo|neogeo)\b/.test(name)) return "neogeo";
  if (/\b(gamecube|game cube|wii|saturn|playstation|ps1|ps2|psp|dreamcast)\b/.test(name)) return "disc";
  return "generic";
}

interface ShellGeometry {
  path: string;
  color: string;
  edge: string;
  label: [number, number, number, number];
  ribs: [number, number, number, number][];
  contacts: [number, number, number];
}

export const cartridgeShapes: Record<CartridgeShape, ShellGeometry> = {
  nes: { path: "M72 12H226V26H248V252H228V266H72Z", color: "#a6a7a9", edge: "#54565f", label: [96, 96, 128, 134], ribs: [[88, 30, 136, 5], [88, 43, 136, 5], [88, 56, 136, 5], [88, 69, 136, 5]], contacts: [111, 252, 98] },
  snes: { path: "M30 74H66V66H254V74H290V234H276V250H44V234H30Z", color: "#b6b4bb", edge: "#656273", label: [91, 91, 138, 106], ribs: [[45, 92, 28, 7], [45, 110, 28, 7], [45, 128, 28, 7], [45, 146, 28, 7], [247, 92, 28, 7], [247, 110, 28, 7], [247, 128, 28, 7], [247, 146, 28, 7], [89, 210, 142, 4], [89, 222, 142, 4]], contacts: [100, 248, 120] },
  n64: { path: "M35 110Q38 95 61 88L87 77Q160 42 233 77L259 88Q282 95 285 110V245Q285 255 270 255H50Q35 255 35 245Z", color: "#969b9f", edge: "#4e5661", label: [88, 104, 144, 112], ribs: [[49, 119, 22, 5], [49, 132, 22, 5], [49, 145, 22, 5], [249, 119, 22, 5], [249, 132, 22, 5], [249, 145, 22, 5]], contacts: [111, 251, 98] },
  gb: { path: "M80 37H220V57H240V249H80Z", color: "#b4b7af", edge: "#646d68", label: [102, 95, 116, 120], ribs: [[98, 55, 104, 4], [98, 65, 104, 4], [98, 75, 104, 4]], contacts: [113, 243, 95] },
  gba: { path: "M39 156H91V146Q160 157 229 146V156H281V247H259V257H61V247H39Z", color: "#6662a1", edge: "#383559", label: [88, 169, 144, 63], ribs: [[53, 175, 20, 4], [53, 188, 20, 4], [247, 175, 20, 4], [247, 188, 20, 4]], contacts: [111, 251, 98] },
  ds: { path: "M99 78H205L229 102V250H99Z", color: "#555b67", edge: "#292f40", label: [112, 100, 102, 103], ribs: [[112, 214, 102, 4]], contacts: [118, 232, 94] },
  genesis: { path: "M29 120Q29 73 76 64Q160 42 244 64Q291 73 291 120V240H270V255H50V240H29Z", color: "#343d51", edge: "#172037", label: [78, 93, 164, 133], ribs: [[43, 118, 20, 5], [43, 133, 20, 5], [43, 148, 20, 5], [257, 118, 20, 5], [257, 133, 20, 5], [257, 148, 20, 5]], contacts: [110, 250, 100] },
  atari: { path: "M65 38H255V250H65Z", color: "#3d3941", edge: "#211f2b", label: [87, 75, 146, 120], ribs: [[78, 49, 164, 5], [78, 59, 164, 5], [81, 210, 158, 4], [81, 223, 158, 4]], contacts: [108, 246, 104] },
  hucard: { path: "M82 26H238V254H82Z", color: "#e3e3d7", edge: "#8a918b", label: [91, 40, 138, 149], ribs: [], contacts: [92, 209, 136] },
  neogeo: { path: "M28 32H292V248H276V259H44V248H28Z", color: "#39424d", edge: "#1c2639", label: [68, 77, 184, 125], ribs: [[43, 45, 234, 5], [43, 58, 234, 5], [42, 90, 13, 102], [265, 90, 13, 102]], contacts: [90, 254, 140] },
  disc: { path: "M51 33H269V251H51Z", color: "#a0b3c4", edge: "#456079", label: [76, 46, 180, 191], ribs: [[59, 49, 7, 183]], contacts: [0, 0, 0] },
  generic: { path: "M62 49Q62 33 80 33H240Q258 33 258 49V245H239V258H81V245H62Z", color: "#929aad", edge: "#4b5572", label: [86, 94, 148, 128], ribs: [[84, 50, 152, 5], [84, 63, 152, 5], [84, 76, 152, 5]], contacts: [111, 253, 98] },
};
