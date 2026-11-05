import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Search, Loader2, Check, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { coverConsoles, coverImageUrl, searchGameCovers, downloadGameCover, type CoverResult } from "@/lib/game-covers";
import type { LibraryGame } from "@/types/game";

export function GameCoverMenu({ game, upload, onSave, onClose }: { game: LibraryGame; upload: (file: File) => string; onSave: (cover: string | undefined) => void; onClose: () => void }) {
  const [console, setConsole] = useState(Object.prototype.hasOwnProperty.call(coverConsoles, game.system) ? game.system : "NES");
  const [query, setQuery] = useState(game.name.replace(/\([^)]*\)|\[[^\]]*\]/g, "").trim());
  const [results, setResults] = useState<CoverResult[] | null>(null);
  const [selected, setSelected] = useState<CoverResult>();
  const [limit, setLimit] = useState(24);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const busy = loading || saving;
  useEffect(() => () => request.current?.abort(), []);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || query.trim().length < 2) return;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setLoading(true); setError(""); setSelected(undefined); setResults(null); setFailed(new Set()); setLimit(24);
    try {
      const result = await searchGameCovers(console, query.trim(), controller.signal);
      if (!controller.signal.aborted) { setResults(result.covers); setTruncated(result.truncated); }
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Cover search failed. Check your connection and try again."); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  };
  const apply = async () => {
    if (!selected || busy) return;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setSaving(true); setError("");
    try {
      const file = await downloadGameCover(selected, controller.signal);
      if (!controller.signal.aborted) onSave(upload(file));
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not save this cover. Try another result."); }
    finally { if (!controller.signal.aborted) setSaving(false); }
  };

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl p-5 sm:p-6">
      <DialogHeader><DialogTitle className="pixel-font flex items-center gap-3 pr-5 text-sm leading-6"><ImagePlus className="h-6 w-6 shrink-0 text-indigo-700" />Game covers</DialogTitle><DialogDescription className="text-slate-700">Find a third-party cover for <strong>{game.name}</strong> in the public Libretro thumbnails collection.</DialogDescription></DialogHeader>
      <form onSubmit={search} className="space-y-3 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4">
        <div className="space-y-2"><Label htmlFor="cover-console">Cover collection</Label><select id="cover-console" value={console} disabled={busy} onChange={event => { setConsole(event.target.value); setResults(null); setSelected(undefined); setError(""); }} className="w-full rounded-xl border-2 border-indigo-300 bg-white p-3 text-sm text-slate-900">{Object.keys(coverConsoles).map(system => <option key={system}>{system}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="cover-search">Game title</Label><div className="flex flex-wrap gap-3"><Input id="cover-search" required minLength={2} maxLength={120} disabled={busy} value={query} onChange={event => setQuery(event.target.value)} placeholder="Super Mario, Zelda, Sonic…" className="min-w-0 flex-1 basis-52 rounded-xl border-indigo-300 bg-white" /><Button type="submit" disabled={busy || query.trim().length < 2} className="retro-button rounded-xl">{loading ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : <Search className="mr-2 h-4 w-4" />}{loading ? "Searching…" : "Search covers"}</Button></div></div>
      </form>
      <p className="text-xs leading-5 text-slate-700">Cover search contacts GitHub and loads online image previews. Your game files never leave your device. Saved covers are local copies for this session.</p>
      {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading && <p role="status" className="py-5 text-center text-sm text-indigo-800">Loading the console’s cover index…</p>}
      {results && <>
        <p role="status" className="text-sm font-bold text-indigo-900">{results.length} {results.length === 1 ? "cover" : "covers"} found · showing {Math.min(limit, results.length)}</p>
        {truncated && <p className="text-xs text-amber-900">The provider returned a partial index. Some titles may be missing.</p>}
        {!results.length && <p className="rounded-xl border border-indigo-300 bg-white p-5 text-sm leading-6 text-slate-700">No covers matched. Try a shorter title, remove region/revision tags, or choose another console collection. You can still upload your own cover through Edit game.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {results.slice(0, limit).map(cover => {
            const key = `${cover.repository}/${cover.path}`;
            const chosen = selected?.path === cover.path && selected.repository === cover.repository;
            const unavailable = failed.has(key);
            return <button key={key} type="button" aria-pressed={chosen} disabled={saving || unavailable} onClick={() => setSelected(cover)} className={`relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left ${chosen ? "border-indigo-700 ring-2 ring-indigo-400" : "border-slate-300"}`}>
              {unavailable ? <span className="flex h-36 items-center justify-center p-3 text-center text-xs text-red-800">Preview unavailable</span> : <img src={coverImageUrl(cover)} alt={cover.title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(current => new Set([...current, key]))} className="h-36 w-full bg-slate-100 object-contain p-2" />}
              {chosen && <span className="absolute right-2 top-2 rounded-full bg-indigo-700 p-1 text-white"><Check className="h-4 w-4" /></span>}
              <span className="block break-words p-3 text-xs font-bold leading-5 text-slate-900">{cover.title}</span>
            </button>;
          })}
        </div>
        {results.length > limit && <Button type="button" variant="outline" className="rounded-xl border-indigo-300 bg-white" disabled={saving} onClick={() => setLimit(current => current + 24)}>Show more covers</Button>}
      </>}
      {!results && !loading && !error && <div className="flex flex-wrap items-center gap-5 rounded-xl border-2 border-indigo-300 bg-white p-4">{game.artwork ? <img src={game.artwork} alt="Current game cover" className="h-32 w-24 rounded-lg bg-slate-100 object-contain" /> : <ImagePlus className="h-16 w-16 text-indigo-500" />}<p className="min-w-0 flex-1 text-sm leading-6 text-slate-700">Search to browse regional box-art variants and choose the cover you want on this cartridge.</p></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-200 pt-4">
        <a href="https://github.com/libretro-thumbnails/libretro-thumbnails" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-indigo-800 underline underline-offset-4"><ExternalLink className="h-4 w-4" />Source & credits: Libretro thumbnails</a>
        <p className="text-xs text-slate-700">Game art belongs to its respective creators and publishers.</p>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        {game.artwork && <Button type="button" disabled={busy} variant="outline" className="rounded-xl bg-white text-red-700" onClick={() => onSave(undefined)}>Remove cover</Button>}
        <Button type="button" variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button>
        <Button type="button" disabled={busy || !selected || failed.has(`${selected?.repository}/${selected?.path}`)} className="retro-button rounded-xl" onClick={apply}>{saving && <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />}{saving ? "Saving cover…" : "Apply cover"}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
