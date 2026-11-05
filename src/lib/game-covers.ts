export const coverConsoles: Record<string, string> = {
  NES: "Nintendo_-_Nintendo_Entertainment_System",
  SNES: "Nintendo_-_Super_Nintendo_Entertainment_System",
  "Nintendo 64": "Nintendo_-_Nintendo_64",
  "Game Boy": "Nintendo_-_Game_Boy",
  "Game Boy Color": "Nintendo_-_Game_Boy_Color",
  "Game Boy Advance": "Nintendo_-_Game_Boy_Advance",
  "Nintendo DS": "Nintendo_-_Nintendo_DS",
  "Nintendo 3DS": "Nintendo_-_Nintendo_3DS",
  GameCube: "Nintendo_-_GameCube",
  Wii: "Nintendo_-_Wii",
  Genesis: "Sega_-_Mega_Drive_-_Genesis",
  "Sega Saturn": "Sega_-_Saturn",
  Dreamcast: "Sega_-_Dreamcast",
  PlayStation: "Sony_-_PlayStation",
  "PlayStation 2": "Sony_-_PlayStation_2",
  PSP: "Sony_-_PlayStation_Portable",
  "PS Vita": "Sony_-_PlayStation_Vita",
  "Atari 2600": "Atari_-_2600",
  "TurboGrafx-16": "NEC_-_PC_Engine_-_TurboGrafx_16",
  "Neo Geo": "SNK_-_Neo_Geo",
};
export interface CoverResult { title: string; repository: string; path: string }
interface CoverIndex { covers: CoverResult[]; truncated: boolean }
const indices = new Map<string, CoverIndex>();
const normalize = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function coverImageUrl(cover: CoverResult) {
  if (!Object.values(coverConsoles).includes(cover.repository) || !/^Named_Boxarts\/[^/\\]+\.png$/i.test(cover.path)) throw new Error("Invalid cover source.");
  return `https://raw.githubusercontent.com/libretro-thumbnails/${cover.repository}/master/${cover.path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function searchGameCovers(console: string, query: string, signal: AbortSignal) {
  if (!Object.prototype.hasOwnProperty.call(coverConsoles, console)) throw new Error("Choose a supported cover collection.");
  const repository = coverConsoles[console];
  if (!normalize(query)) throw new Error("Enter a game title containing letters or numbers.");
  let index = indices.get(repository);
  if (!index) {
    const response = await fetch(`https://api.github.com/repos/libretro-thumbnails/${repository}/git/trees/master?recursive=1`, { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), credentials: "omit", referrerPolicy: "no-referrer" });
    if (response.status === 403 || response.status === 429) throw new Error("The cover service is rate-limited. Try again later or upload a cover through Edit game.");
    if (!response.ok) throw new Error("This cover collection is unavailable right now. Try again later.");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("tree" in data) || !Array.isArray(data.tree)) throw new Error("The cover service returned an invalid index.");
    const covers: CoverResult[] = [];
    for (const entry of data.tree) {
      if (!entry || typeof entry !== "object" || entry.type !== "blob" || typeof entry.path !== "string" || !/^Named_Boxarts\/[^/\\]+\.png$/i.test(entry.path)) continue;
      covers.push({ title: entry.path.slice("Named_Boxarts/".length, -4), repository, path: entry.path });
    }
    index = { covers, truncated: "truncated" in data && data.truncated === true };
    indices.set(repository, index);
  }
  const terms = normalize(query).split(" ").filter(Boolean);
  const covers = index.covers.filter(cover => terms.every(term => normalize(cover.title).includes(term)))
    .sort((a, b) => (normalize(a.title) === normalize(query) ? -1 : normalize(b.title) === normalize(query) ? 1 : a.title.localeCompare(b.title)));
  return { covers, truncated: index.truncated };
}

export async function downloadGameCover(cover: CoverResult, signal: AbortSignal) {
  const response = await fetch(coverImageUrl(cover), { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), credentials: "omit", referrerPolicy: "no-referrer", redirect: "error" });
  if (!response.ok || !response.body) throw new Error("This cover could not be downloaded. Choose another result or try again.");
  const maxBytes = 10 * 1024 * 1024;
  if (response.headers.get("content-type")?.split(";")[0] !== "image/png" || Number(response.headers.get("content-length")) > maxBytes) {
    await response.body.cancel();
    throw new Error("This result is not a supported PNG cover under 10 MB.");
  }
  const reader = response.body.getReader();
  const parts: Blob[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("This cover exceeds the 10 MB image limit."); }
      parts.push(new Blob([value]));
    }
  } finally { reader.releaseLock(); }
  const blob = new Blob(parts, { type: "image/png" });
  const bitmap = await createImageBitmap(blob).catch(() => { throw new Error("This cover image could not be decoded. Choose another result."); });
  bitmap.close();
  return new File([blob], cover.path.slice("Named_Boxarts/".length), { type: "image/png" });
}
