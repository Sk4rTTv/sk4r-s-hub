import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowLeft, Monitor, Maximize2, Square, ScreenShare, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EmulationApp } from "@/types/emulation";
import "@/retro.css";

const ProjectionHub = () => {
  const { apps } = useOutletContext<{ apps: EmulationApp[] }>();
  const [selectedId, setSelectedId] = useState(apps[0]?.id ?? "none");
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sourceName, setSourceName] = useState("");
  const stream = useRef<MediaStream | null>(null);
  const player = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const pending = useRef(false);
  const supported = typeof navigator.mediaDevices?.getDisplayMedia === "function";
  const selectedApp = apps.find(app => app.id === selectedId);

  const stop = () => {
    const current = stream.current;
    stream.current = null;
    current?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    if (player.current) player.current.srcObject = null;
    setActive(false); setSourceName("");
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stream.current?.getTracks().forEach(track => { track.onended = null; track.stop(); });
      stream.current = null;
    };
  }, []);
  const start = async () => {
    if (!supported || pending.current || stream.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const capture = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      if (!mounted.current) { capture.getTracks().forEach(track => track.stop()); return; }
      stream.current = capture;
      const track = capture.getVideoTracks()[0];
      track.onended = stop;
      setSourceName(track.label || "Shared window");
      if (player.current) { player.current.srcObject = capture; await player.current.play(); }
      if (!mounted.current || stream.current !== capture || track.readyState === "ended") return;
      setActive(true);
    } catch (cause) {
      if (!mounted.current) return;
      stop();
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError" ? "Sharing was canceled or blocked. Try again and allow screen sharing. If the preview blocks it, open this hub in a new tab." : name === "NotFoundError" ? "No shareable screen was found. Open your emulator on this computer first." : name === "NotReadableError" ? "The window could not be captured. Check your operating system's screen-recording permission for this browser." : "Screen sharing is unavailable here. Try a desktop browser and open this hub in a new tab.");
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const fullscreen = async () => {
    try { await screen.current?.requestFullscreen(); }
    catch { setError("Fullscreen was blocked. Open the hub in a new tab and try again."); }
  };

  return <div className="retro-world min-h-screen px-2 py-3 text-white sm:p-6">
    <div className="console-shell mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <header className="console-header flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
        <h1 className="retro-hud flex items-center gap-3 text-xs leading-6"><Monitor className="h-7 w-7 text-yellow-300" />App Projection Hub</h1>
        <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white hover:bg-blue-800 hover:text-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to title</Link></Button>
      </header>
      <main className="space-y-6 p-4 sm:p-7">
        <div className="retro-toolbar flex flex-wrap items-end gap-4 rounded-2xl p-4">
          <div className="min-w-0 flex-1 space-y-2"><Label htmlFor="projection-app" className="text-blue-100">App to project</Label><Select value={selectedId} onValueChange={setSelectedId} disabled={active || busy}><SelectTrigger id="projection-app" className="w-full sm:min-w-64"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-blue-500 bg-blue-950 text-white"><SelectItem value="none" className="text-white focus:bg-blue-700 focus:text-white">Any running emulator window</SelectItem>{apps.map(app => <SelectItem key={app.id} value={app.id} className="text-white focus:bg-blue-700 focus:text-white">{app.name}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={start} disabled={!supported || active || busy} className="retro-button h-11 rounded-xl"><ScreenShare className="mr-2 h-4 w-4" />{busy ? "Choose window…" : "Project app window"}</Button>
          <Button onClick={stop} disabled={!active} variant="outline" className="h-11 rounded-xl border-red-300 bg-blue-950 text-white hover:bg-red-900 hover:text-white"><Square className="mr-2 h-4 w-4" />Stop</Button>
        </div>
        {selectedApp && <p className="text-sm leading-6 text-blue-100">Selected: <strong>{selectedApp.name}</strong>{selectedApp.appFile && <span> ({selectedApp.appFile.name})</span>}. Open it on your device, then choose its window in the browser picker. Selecting it here does not launch its file.</p>}
        {!supported && <p role="alert" className="rounded-xl border border-amber-400 bg-amber-950 p-4 text-sm text-amber-100">Screen sharing isn't available in this browser. Use a supported desktop browser, such as Chrome or Edge, over HTTPS.</p>}
        {error && <p role="alert" className="rounded-xl border border-red-400 bg-red-950 p-4 text-sm text-red-100">{error}</p>}
        <div ref={screen} className="relative flex aspect-video min-h-60 items-center justify-center overflow-hidden rounded-2xl border-4 border-indigo-400 bg-[#090f30] shadow-[0_6px_0_#070b22]">
          <video ref={player} autoPlay muted playsInline controls={active} aria-label="Live projected emulator window" className={`h-full w-full object-contain ${active ? "" : "invisible"}`} />
          {!active && <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5 text-center"><Monitor className="h-16 w-16 text-indigo-300 sm:h-24 sm:w-24" /><h2 className="retro-hud text-xs leading-6 sm:text-sm">READY TO PROJECT</h2><p className="max-w-sm text-sm leading-6 text-blue-100">Your emulator window will appear here after you approve screen sharing.</p></div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="flex min-w-0 items-center gap-2 text-sm text-blue-100"><span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-green-400" : "bg-slate-400"}`} /><span className="break-all">{active ? `Live · ${sourceName}` : "No window connected"}</span></p><Button onClick={fullscreen} disabled={!active || typeof document.documentElement.requestFullscreen !== "function"} variant="outline" className="rounded-xl bg-blue-950 text-white hover:bg-blue-800 hover:text-white"><Maximize2 className="mr-2 h-4 w-4" />Fullscreen</Button></div>
        <section className="rounded-2xl border-2 border-indigo-500 bg-blue-950 p-5 text-sm leading-6 text-blue-100"><h2 className="pixel-font mb-4 text-[10px] text-yellow-300">HOW IT WORKS</h2><ol className="ml-5 list-decimal space-y-2"><li>Open your native emulator on this computer. For an APK, run it in an Android emulator first.</li><li>Click <strong>Project app window</strong> and select that emulator's window—not this hub's window.</li><li>Control the emulator in its original window. This hub mirrors its display; it does not forward keyboard/controller input or run uploaded EXE/APK files.</li></ol><p className="mt-4 flex items-start gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-green-300" />The feed stays local: no recording or server upload. Only share the window you intend to show. Sound continues in the original app.</p><a href={window.location.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded text-yellow-300 underline underline-offset-4"><ExternalLink className="h-4 w-4" />Open hub in a new tab if preview sharing is blocked</a></section>
      </main>
    </div>
  </div>;
};
export default ProjectionHub;
