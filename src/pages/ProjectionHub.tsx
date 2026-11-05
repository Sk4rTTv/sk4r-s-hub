import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Monitor, AppWindow, Square, ScreenShare, RefreshCw, ExternalLink, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectionFps } from "@/hooks/useProjectionFps";
import type { ProjectionSource } from "@/types/desktop";
import "@/retro.css";

const ProjectionHub = () => {
  const desktop = window.emuDesktop;
  const [type, setType] = useState<"monitor" | "application">("monitor");
  const [sources, setSources] = useState<ProjectionSource[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sourceName, setSourceName] = useState("");
  const stream = useRef<MediaStream | null>(null);
  const player = useRef<HTMLVideoElement>(null);
  const { fps, available: fpsAvailable } = useProjectionFps(player, active);
  const mounted = useRef(true);
  const pending = useRef(false);
  const refreshing = useRef(false);
  const supported = typeof navigator.mediaDevices?.getDisplayMedia === "function";
  const available = sources.filter(source => source.type === type);

  const refresh = async () => {
    if (!desktop || refreshing.current || pending.current || stream.current) return;
    refreshing.current = true; setLoading(true); setError("");
    try {
      const list = await desktop.listProjectionSources();
      if (mounted.current) setSources(list);
    } catch { if (mounted.current) setError("Could not list monitors and applications. Try refreshing the list."); }
    finally { refreshing.current = false; if (mounted.current) setLoading(false); }
  };
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      stream.current?.getTracks().forEach(track => { track.onended = null; track.stop(); });
      stream.current = null;
    };
  }, []);
  useEffect(() => {
    setSelectedId(previous => sources.some(source => source.id === previous && source.type === type) ? previous : sources.find(source => source.type === type)?.id ?? "");
  }, [sources, type]);

  const stop = () => {
    const current = stream.current;
    stream.current = null;
    current?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    if (player.current) player.current.srcObject = null;
    setActive(false); setSourceName("");
  };
  const start = async () => {
    if (!supported || pending.current || refreshing.current || stream.current || (desktop && !selectedId)) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (desktop) await desktop.selectProjectionSource(selectedId);
      if (!mounted.current) return;
      const capture = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: type === "monitor" ? "monitor" : "window" }, audio: false });
      if (!mounted.current) { capture.getTracks().forEach(track => track.stop()); return; }
      stream.current = capture;
      const track = capture.getVideoTracks()[0];
      track.onended = stop;
      setSourceName(track.label || available.find(source => source.id === selectedId)?.name || "Shared source");
      if (player.current) { player.current.srcObject = capture; await player.current.play(); }
      if (!mounted.current || stream.current !== capture || track.readyState === "ended") return;
      setActive(true);
    } catch (cause) {
      if (!mounted.current) return;
      stop();
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError" ? "Mirroring was canceled or blocked. Try again and approve sharing." : name === "NotReadableError" ? "The source could not be captured. Check screen-recording permissions for this app or browser." : desktop ? "This source may have closed. Refresh the list and select it again." : "Mirroring is unavailable here. Try opening the hub in a new tab in a supported desktop browser.");
    } finally { pending.current = false; if (mounted.current) setBusy(false); }
  };

  return <div className="retro-world min-h-screen px-2 py-3 text-white sm:p-6">
    <div className="console-shell mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <header className="console-header flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
        <h1 className="retro-hud flex items-center gap-3 text-xs leading-6"><Monitor className="h-7 w-7 text-yellow-300" />Projection Hub</h1>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white hover:bg-blue-800 hover:text-white"><Link to="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></Button>
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white hover:bg-blue-800 hover:text-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to title</Link></Button>
        </div>
      </header>
      <main className="space-y-5 p-4 sm:p-7">
        <div className="retro-toolbar flex flex-wrap items-end gap-4 rounded-2xl p-4">
          <div className="w-full space-y-2 sm:w-52"><Label htmlFor="mirror-type" className="text-blue-100">What to mirror</Label><Select value={type} onValueChange={value => setType(value as typeof type)} disabled={active || busy || loading}><SelectTrigger id="mirror-type"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-blue-500 bg-blue-950 text-white"><SelectItem value="monitor" className="text-white focus:bg-blue-700 focus:text-white">Monitor</SelectItem><SelectItem value="application" className="text-white focus:bg-blue-700 focus:text-white">Application window</SelectItem></SelectContent></Select></div>
          <div className="min-w-0 flex-1 space-y-2"><Label htmlFor="mirror-source" className="text-blue-100">{type === "monitor" ? "Select monitor" : "Select application"}</Label>
            <Select value={desktop ? selectedId || undefined : "browser"} onValueChange={setSelectedId} disabled={active || busy || loading || (!!desktop && !available.length)}><SelectTrigger id="mirror-source" className="w-full sm:min-w-64"><SelectValue placeholder={loading ? "Loading sources…" : "No sources available"} /></SelectTrigger><SelectContent className="rounded-xl border-blue-500 bg-blue-950 text-white">{desktop ? available.map(source => <SelectItem key={source.id} value={source.id} className="text-white focus:bg-blue-700 focus:text-white">{source.name}</SelectItem>) : <SelectItem value="browser" className="text-white focus:bg-blue-700 focus:text-white">Choose {type === "monitor" ? "monitor" : "window"} in browser picker</SelectItem>}</SelectContent></Select>
          </div>
          {desktop && <Button aria-label="Refresh monitors and application windows" onClick={refresh} disabled={active || busy || loading} variant="outline" className="h-10 rounded-xl bg-blue-950 text-white hover:bg-blue-800 hover:text-white"><RefreshCw className={`h-4 w-4 ${loading ? "motion-safe:animate-spin" : ""}`} /></Button>}
          <Button onClick={start} disabled={!supported || active || busy || loading || (!!desktop && !selectedId)} className="retro-button h-10 rounded-xl"><ScreenShare className="mr-2 h-4 w-4" />{busy ? "Connecting…" : "Mirror"}</Button>
          <Button onClick={stop} disabled={!active} variant="outline" className="h-10 rounded-xl border-red-300 bg-blue-950 text-white hover:bg-red-900 hover:text-white"><Square className="mr-2 h-4 w-4" />Stop</Button>
        </div>
        {!desktop && <p className="text-sm leading-6 text-blue-100">The browser keeps monitor and window names private until you approve sharing. Choose the actual source in its permission picker. Direct source dropdowns are available in EmuHub for Windows.</p>}
        {desktop && !loading && !available.length && <p className="text-sm text-amber-200">No {type === "monitor" ? "monitors" : "application windows"} found. Open the app you want to mirror, then refresh.</p>}
        {!supported && <p role="alert" className="rounded-xl border border-amber-400 bg-amber-950 p-4 text-sm text-amber-100">Screen mirroring is not supported here. Use EmuHub desktop or a supported desktop browser over HTTPS.</p>}
        {error && <p role="alert" className="rounded-xl border border-red-400 bg-red-950 p-4 text-sm text-red-100">{error}</p>}
        <div className="relative flex aspect-video min-h-60 items-center justify-center overflow-hidden rounded-2xl border-4 border-indigo-400 bg-[#090f30] shadow-[0_6px_0_#070b22]">
          <video ref={player} autoPlay muted playsInline aria-label="Live mirrored monitor or application" className={`h-full w-full object-contain ${active ? "" : "invisible"}`} />
          {!active && <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5 text-center">{type === "monitor" ? <Monitor className="h-16 w-16 text-indigo-300 sm:h-24 sm:w-24" /> : <AppWindow className="h-16 w-16 text-indigo-300 sm:h-24 sm:w-24" />}<h2 className="retro-hud text-xs leading-6">SELECT A SOURCE TO MIRROR</h2><p className="text-sm text-blue-100">Choose a monitor or running application above.</p></div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p role="status" className="flex min-w-0 items-center gap-2 text-sm text-blue-100"><span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-green-400" : "bg-slate-400"}`} /><span className="break-all">{active ? `Mirroring · ${sourceName}` : "Not mirroring"}</span></p>
          <div className="flex items-center gap-3 rounded-xl border-2 border-cyan-600 bg-blue-950 px-4 py-3" title="Displayed projection-video frames per second, not emulator FPS.">
            <Activity className="h-5 w-5 text-cyan-300" />
            <div><p className="text-xs text-blue-100">Projection FPS</p><p className="font-mono text-xl font-bold tabular-nums text-cyan-200">{!active ? "—" : !fpsAvailable ? "Unavailable" : fps === null ? "Measuring…" : `${fps} FPS`}</p></div>
          </div>
        </div>
        <p className="text-xs leading-5 text-blue-200">FPS measures the mirrored video and updates every second; it is not the emulator’s internal FPS. Static windows may show a low rate.</p>
        <p className="text-xs leading-5 text-blue-200">Display only—no recording, uploads, or remote input. Mirroring a monitor shows all its windows and notifications. Stop ends sharing, not the application. Opening Settings ends sharing; mirror again when you return.</p>
        {!desktop && <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded text-sm text-yellow-300 underline underline-offset-4"><ExternalLink className="h-4 w-4" />Open in a new tab if preview sharing is blocked</a>}
      </main>
    </div>
  </div>;
};
export default ProjectionHub;
