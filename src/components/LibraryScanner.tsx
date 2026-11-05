import { useState, type FormEvent } from "react";
import { FolderSearch, Loader2, Link as LinkIcon, Square, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SYSTEMS } from "@/types/emulation";
import type { ScannerCredentials, ScannerState } from "@/types/library-scanner";

export function LibraryScanner({ state, onClose }: { state: ScannerState; onClose: () => void }) {
  const desktop = window.emuDesktop;
  const [credentials, setCredentials] = useState<ScannerCredentials>({ developerId: "", developerPassword: "", username: "", password: "" });
  const [kind, setKind] = useState<"apps" | "games" | "both">("both");
  const [system, setSystem] = useState("detect");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const act = async (operation: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true); setError("");
    try { await operation(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Scanner action failed. Try again."); }
    finally { setBusy(false); }
  };
  const connect = (event: FormEvent) => {
    event.preventDefault();
    if (!desktop) return;
    void act(async () => { await desktop.connectScanner(credentials); setCredentials({ developerId: "", developerPassword: "", username: "", password: "" }); });
  };
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl p-5 sm:p-6">
      <DialogHeader><DialogTitle className="pixel-font flex items-center gap-3 pr-5 text-sm leading-6"><FolderSearch className="h-6 w-6 shrink-0 text-indigo-700" />Automatic library scanner</DialogTitle><DialogDescription className="text-slate-700">Select a folder once. EmuHub discovers its files automatically and checks for new additions every 15 seconds while the desktop app is running.</DialogDescription></DialogHeader>
      {!desktop ? <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-5 text-sm leading-6 text-slate-800">Continuous folder monitoring and private ScreenScraper credentials require <strong>EmuHub for Windows</strong>. The web preview cannot read your filesystem in the background. Its existing Directory Folder and Add Games Directory options remain available for manual imports.</div> : <>
        <section className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-indigo-900"><LinkIcon className="h-5 w-5" />ScreenScraper connection</h2>
          <p role="status" className="mb-3 text-xs font-bold text-indigo-800">{state.connected ? "Connected for this desktop session" : "Not connected — game metadata needs developer and member credentials"}</p>
          {!state.connected && <form onSubmit={connect} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">{([
              ["developerId", "Developer ID", false], ["developerPassword", "Developer password", true], ["username", "ScreenScraper username", false], ["password", "ScreenScraper password", true],
            ] as const).map(([key, label, secret]) => <div key={key} className="space-y-2"><Label htmlFor={`scanner-${key}`}>{label}</Label><Input id={`scanner-${key}`} type={secret ? "password" : "text"} required maxLength={200} autoComplete="off" disabled={busy} value={credentials[key]} onChange={event => setCredentials(current => ({ ...current, [key]: event.target.value }))} className="rounded-xl border-indigo-300 bg-white" /></div>)}</div>
            <Button type="submit" disabled={busy || !!state.current} className="retro-button rounded-xl">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Test & connect</Button>
          </form>}
          {state.connected && <Button disabled={busy} variant="outline" className="rounded-xl border-indigo-300 bg-white" onClick={() => void act(() => desktop.disconnectScanner())}>Disconnect & forget credentials</Button>}
          <p className="mt-3 text-xs leading-5 text-slate-700">ScreenScraper requires your own approved developer ID/password in addition to your member account. Credentials are sent only to ScreenScraper by the desktop process, never logged or saved to disk. Form fields are cleared after connection.</p>
          <a href="https://www.screenscraper.fr/webapi2.php" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs text-indigo-800 underline">ScreenScraper API & account information</a>
        </section>
        <section className="space-y-4 rounded-xl border-2 border-indigo-300 bg-white p-4">
          <h2 className="text-sm font-bold text-indigo-900">Choose a folder to monitor</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="scanner-kind">Folder contents</Label><select id="scanner-kind" value={kind} disabled={busy} onChange={event => setKind(event.target.value as typeof kind)} className="w-full rounded-xl border-2 border-indigo-300 bg-white p-3 text-sm text-slate-900"><option value="both">Apps & games together</option><option value="apps">Emulator applications (.exe)</option><option value="games">Games / ROMs / disc images</option></select></div>
            <div className="space-y-2"><Label htmlFor="scanner-system">Fallback console for ambiguous games</Label><select id="scanner-system" value={system} disabled={busy || kind === "apps"} onChange={event => setSystem(event.target.value)} className="w-full rounded-xl border-2 border-indigo-300 bg-white p-3 text-sm text-slate-900"><option value="detect">Detect from file / folder</option>{SYSTEMS.filter(value => !["Multi-system", "Modern"].includes(value)).map(value => <option key={value}>{value}</option>)}</select></div>
          </div>
          <p className="text-xs leading-5 text-slate-700">Files are added to the correct library tab immediately. Ambiguous games use the fallback console or appear as Unassigned; edit their console and retry metadata. Uninstallers and helper executables may also be cataloged—remove unwanted entries from your library.</p>
          <Button disabled={busy || state.folders.length >= 5 || kind !== "apps" && !state.connected} onClick={() => void act(() => desktop.startScanner({ kind, system }))} className="retro-button rounded-xl"><FolderSearch className="mr-2 h-5 w-5" />Select & monitor folder</Button>
        </section>
        <section className="space-y-3" aria-label="Background scanner progress">
          <p role="status" className="text-sm font-bold text-indigo-900">{state.current ? `Fetching metadata: ${state.current}` : "Scanner ready"} · {state.queued} queued · {state.folders.length}/5 folders</p>
          {state.error && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{state.error}</p>}
          <Button disabled={busy} variant="outline" className="rounded-xl border-indigo-300 bg-white" onClick={() => void act(() => desktop.resumeScanner())}><RefreshCw className="mr-2 h-4 w-4" />Resume / retry failed metadata</Button>
          {state.folders.map(folder => <div key={folder.id} className="rounded-xl border border-indigo-300 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="break-all text-sm font-bold text-indigo-900">{folder.folderName}</h3><p className="mt-1 text-xs text-slate-700">{folder.kind} · {folder.files} files discovered · {folder.scanning ? "Scanning…" : folder.lastScan ? `Last check ${new Date(folder.lastScan).toLocaleTimeString()}` : "Starting…"}</p></div><Button disabled={busy} variant="outline" className="rounded-xl bg-white text-red-700" onClick={() => void act(() => desktop.stopScanner(folder.id))}><Square className="mr-2 h-4 w-4" />Stop watching</Button></div>
            {folder.warning && <p className="mt-3 text-xs leading-5 text-amber-900">{folder.warning}</p>}
          </div>)}
        </section>
      </>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <p className="text-xs leading-5 text-slate-700">Games use ScreenScraper; recognized emulator apps use Wikipedia/Wikidata and available encyclopedia artwork, not game box art. Only filenames and inferred consoles are sent for game lookups. Local files are never uploaded, opened, extracted, or executed. New-file detection and metadata are separate background tasks. Symbolic links are skipped, scan limits are enforced, and source text may omit some fields. Existing custom covers are preserved. Stop watching leaves your library and files unchanged; everything lasts for this session.</p>
      <div className="flex justify-end"><Button onClick={onClose} className="retro-button rounded-xl">{desktop ? "Done — continue in background" : "Close"}</Button></div>
    </DialogContent>
  </Dialog>;
}
