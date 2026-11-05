export interface UiColors {
  background: string;
  panel: string;
  accent: string;
}

export const uiThemes: { name: string; colors: UiColors }[] = [
  { name: "Retro midnight", colors: { background: "#10143f", panel: "#202064", accent: "#ffe347" } },
  { name: "Ocean arcade", colors: { background: "#082d3d", panel: "#124b61", accent: "#6ce5ee" } },
  { name: "Berry console", colors: { background: "#321334", panel: "#54234f", accent: "#ffb2d4" } },
  { name: "Mint daylight", colors: { background: "#d6eee4", panel: "#f2fff8", accent: "#087552" } },
];

function luminance(hex: string) {
  const channels = [1, 3, 5].map(start => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function readableText(background: string) {
  return luminance(background) > 0.179 ? "#000000" : "#ffffff";
}

export function readableAccent(colors: UiColors) {
  const a = luminance(colors.accent);
  const b = luminance(colors.panel);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5 ? colors.accent : readableText(colors.panel);
}
