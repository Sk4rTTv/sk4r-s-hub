import { useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, Search, CheckSquare, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SYSTEMS, type EmulationApp } from "@/types/emulation";
import { directoryFileKey, reviewBrowserDirectory, reviewDesktopDirectory, type DirectoryReview } from "@/lib/directory-import";

interface Props {
  apps: EmulationApp[];
  onClose: () => void;
  onImport: (apps: Omit<EmulationApp, "id">[]) => void;
}

export function DirectoryImport({ apps, onClose, onImport }: Props) {
  const [review, setReview] = useState<DirectoryReview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [names, setNames] = useState<Record<string, string>>({});
  const [system, setSystem] = useState("Multi-system");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const folderInput = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const scanning = useRef(false);
  const desktop = window.emuDesktop;
  const existing = useMemo(() => new Set(apps.flatMap(app => [app.directoryKey, app.appFile ? directoryFileKey(app.appFile) : undefined].filter((key): key is string => !!key))), [apps]);
  const visible = review?.candidates.filter(candidate => `${candidate.name} ${candidate.relativePath}`.toLowerCase().includes(query.toLowerCase())) ?? [];
  const selectedCandidates = review?.candidates.filter(candidate => selected.has(candidate.key) && !existing.has(candidate.key)) ?? [];
  const duplicates = review?.candidates.filter(candidate => existing.has(candidate.key)).length ?? 0;

  useEffect(() => {
    mounted.current = true;
    folderInput.current?.setAttribute("webkitdirectory", "");
    return () => { mounted.current = false; };
  }, []);

  const showReview = (result: DirectoryReview) => {
    setReview(result); setSelected(new Set()); setNames({}); setQuery(""); setError("");
  };
  const chooseFolder = async () => {
    if (!desktop) {
      if (!folderInput.current || !("webkitdirectory" in folderInput.current)) { setError("This browser does not support folder selection. Use a current desktop browser or EmuHub for Windows."); return; }
      folderInput.current.click();
      return;
    }
    if (scanning.current) return;
    scanning.current = true; setBusy(true); setError("");
    try {
      const result = await desktop.selectAppDirectory();
      if (mounted.current && result) showReview(reviewDesktopDirectory(result));
    } catch { if (mounted.current) setError("Could not scan this directory. Choose an accessible folder of installed apps and try again."); }
    finally { scanning.current = false; if (mounted.current) setBusy(false); }
  };
  const importSelected = () => {
    if (!selectedCandidates.length) return;
    if (selectedCandidates.some(candidate => !(names[candidate.key] ?? candidate.name).trim())) { setError("Enter a name for every selected app."); return; }
    onImport(selectedCandidates.map(candidate => ({ name: (names[candidate.key] ?? candidate.name).trim(), system, icon: "🎮", color: "#64748b", status: "installed", appFile: candidate.file, directoryKey: candidate.key })));
  };

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6">
      <DialogHeader><DialogTitle className="pixel-font flex items-center gap-3 text-sm leading-6"><FolderOpen className="h-6 w-6 shrink-0 text-indigo-700" />Directory Folder</DialogTitle><DialogDescription className="text-slate-700">Scan a folder and its subfolders, then choose which apps to add as separate cartridges.</DialogDescription></DialogHeader>
      <input ref={folderInput} type="file" multiple hidden onChange={event => {
        const files = Array.from(event.target.files ?? []);
        if (files.length) showReview(reviewBrowserDirectory(files));
        event.target.value = "";
      }} />
      <Button type="button" onClick={chooseFolder} disabled={busy} className="retro-button rounded-xl">{busy ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : <FolderOpen className="mr-2 h-4 w-4" />}{busy ? "Scanning directory…" : review ? "Choose another folder" : "Choose directory folder"}</Button>
      <p className="text-xs leading-5 text-slate-700">{desktop ? "Windows scans for .exe files only. Nothing is registered for launching or executed during import. Select the trusted installed .exe on first launch." : "The browser only reads file names and keeps selected files locally. App packages, installers, and archives can be listed; they are not installed or extracted. Native launching requires EmuHub for Windows."}</p>
      {review && <>
        <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-3"><p className="break-all text-sm font-bold">{review.folderName}</p><p role="status" className="mt-1 text-xs text-slate-700">{review.candidates.length} app files found · {duplicates} already added · {selectedCandidates.length} selected</p></div>
        {review.truncated && <p className="rounded-xl border border-amber-400 bg-amber-50 p-3 text-xs leading-5 text-amber-950">This scan reached its safety limit (500 app files, 20,000 entries, or 12 subfolder levels). Choose a smaller subfolder to import the rest.</p>}
        {review.skippedDirectories > 0 && <p className="text-xs text-amber-900">{review.skippedDirectories} inaccessible folders were skipped. Symbolic links are not followed.</p>}
        {review.candidates.length > 0 ? <>
          <div className="space-y-2"><Label htmlFor="directory-system">Console for selected apps</Label><Select value={system} onValueChange={setSystem}><SelectTrigger id="directory-system" className="rounded-xl border-indigo-300 bg-white"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl">{SYSTEMS.map(entry => <SelectItem key={entry} value={entry}>{entry}</SelectItem>)}</SelectContent></Select><p className="text-xs text-slate-700">Sets their cartridge shape. Use Edit app afterward if individual apps support different consoles.</p></div>
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-600" /><Input aria-label="Filter directory apps" placeholder="Filter names or subfolders…" value={query} onChange={event => setQuery(event.target.value)} className="rounded-xl border-indigo-300 bg-white pl-9" /></div>
          <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="rounded-xl border-indigo-300 bg-white" onClick={() => setSelected(current => new Set([...current, ...visible.filter(candidate => !existing.has(candidate.key)).map(candidate => candidate.key)]))}><CheckSquare className="mr-2 h-4 w-4" />Select visible</Button><Button type="button" variant="outline" className="rounded-xl border-indigo-300 bg-white" onClick={() => setSelected(new Set())}>Clear selection</Button></div>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border-2 border-indigo-300 bg-white p-2" aria-label="Apps found in directory">
            {visible.map(candidate => {
              const duplicate = existing.has(candidate.key);
              return <div key={candidate.key} className={`flex items-start gap-3 rounded-lg border p-3 ${selected.has(candidate.key) ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                <input type="checkbox" checked={selected.has(candidate.key) && !duplicate} disabled={duplicate} aria-label={`Add ${candidate.relativePath}`} className="mt-2 h-5 w-5 shrink-0 accent-indigo-700" onChange={event => setSelected(current => { const next = new Set(current); if (event.target.checked) next.add(candidate.key); else next.delete(candidate.key); return next; })} />
                <div className="min-w-0 flex-1"><Input aria-label={`App name for ${candidate.relativePath}`} disabled={duplicate} maxLength={120} value={names[candidate.key] ?? candidate.name} onChange={event => setNames(current => ({ ...current, [candidate.key]: event.target.value }))} className="h-auto rounded-lg border-slate-300 bg-white py-2 text-sm" /><p className="mt-1 break-all text-xs text-slate-700">{candidate.relativePath}</p>{duplicate && <p className="mt-1 text-xs font-bold text-indigo-700">Already in your collection</p>}</div>
              </div>;
            })}
            {!visible.length && <p className="p-4 text-center text-sm text-slate-700">No matching app files.</p>}
          </div>
        </> : <p className="rounded-xl border border-indigo-300 bg-white p-5 text-sm text-slate-700">No supported app files found. Choose a folder {desktop ? "containing installed .exe files" : "containing app files such as .exe, .apk, .jar, .appimage, .zip, or .7z"}. Images, documents, and game ROMs are not imported as apps.</p>}
      </>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-slate-700">Imports last for this session. Review helper tools and uninstallers carefully before selecting them.</p>
      <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button disabled={busy || !selectedCandidates.length} className="retro-button rounded-xl" onClick={importSelected}>Add {selectedCandidates.length} {selectedCandidates.length === 1 ? "app" : "apps"}</Button></div>
    </DialogContent>
  </Dialog>;
}
