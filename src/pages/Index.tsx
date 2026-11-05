import { EmulationAppList } from "@/components/EmulationAppList";
import { AddEmulationApp } from "@/components/AddEmulationApp";
import { CartridgeArtwork } from "@/components/CartridgeArtwork";
import { AppearanceSettings, type BackgroundMedia } from "@/components/AppearanceSettings";
import { EmulationApp } from "@/types/emulation";
import { Plus, Star, Gamepad2, ImagePlus, Volume2, VolumeX, Pause, Play, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRetroSounds } from "@/hooks/useRetroSounds";
import { toast } from "sonner";
import "@/retro.css";

const Index = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<EmulationApp>();
  const [artworkApp, setArtworkApp] = useState<EmulationApp>();
  const [apps, setApps] = useState<EmulationApp[]>([]);
  const [launchingAppId, setLaunchingAppId] = useState<string | null>(null);
  const launchPending = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const [background, setBackground] = useState<BackgroundMedia | null>(null);
  const [dim, setDim] = useState(35);
  const [paused, setPaused] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const urls = useRef<string[]>([]);
  const { enabled, setEnabled } = useRetroSounds();
  const inHub = useLocation().pathname.replace(/\/$/, "") === "/hub";

  const upload = (file: File) => {
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    return url;
  };
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (paused || inHub) player.pause();
    else void player.play().catch(() => { setPaused(true); });
  }, [paused, background, inHub]);

  const handleSave = (data: Omit<EmulationApp, "id">) => {
    setApps(prev => editing ? prev.map(app => app.id === editing.id ? { ...data, id: app.id } : app) : [...prev, { ...data, id: crypto.randomUUID() }]);
    setShowAddForm(false); setEditing(undefined);
    toast.success(editing ? "App updated!" : "App added!");
  };
  const handleEdit = (app: EmulationApp) => { setEditing(app); setShowAddForm(true); };
  const handleDelete = (id: string) => setApps(prev => prev.filter(app => app.id !== id));
  const handleOpen = (app: EmulationApp) => {
    if (app.url) window.open(app.url, "_blank", "noopener,noreferrer");
  };
  const handleLaunch = async (app: EmulationApp) => {
    const desktop = window.emuDesktop;
    if (!desktop || launchPending.current) return;
    launchPending.current = true;
    setLaunchingAppId(app.id);
    try {
      const executable = app.nativeExecutable ?? await desktop.selectExecutable();
      if (!executable) return;
      if (!app.nativeExecutable) setApps(prev => prev.map(entry => entry.id === app.id ? { ...entry, nativeExecutable: executable } : entry));
      const result = await desktop.launchExecutable(executable.id);
      if (result.launched) toast.success(`${app.name} started in its own Windows window.`);
    } catch {
      toast.error("Could not start this app. Use Edit app to select its installed .exe again, and check that its supporting files are present.");
    } finally {
      launchPending.current = false;
      setLaunchingAppId(null);
    }
  };
  const handleToggleFavorite = (app: EmulationApp) => setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: a.status === "favorite" ? "installed" : "favorite" } : a));
  const closeForm = () => { setShowAddForm(false); setEditing(undefined); };
  const mediaError = () => { toast.error("This media could not be displayed. Try PNG, JPG, GIF, MP4, or WebM."); setBackground(null); };

  return (
    <>
    <div hidden={inHub} className="retro-world relative min-h-screen overflow-x-hidden px-2 py-3 text-white sm:p-6">
      {background && <div className="pointer-events-none fixed inset-0">
        {background.type === "video" ? <video key={background.url} ref={video} src={background.url} muted loop playsInline autoPlay className="h-full w-full object-cover" onError={mediaError} /> : <img src={background.url} alt="" className="h-full w-full object-cover" onError={mediaError} />}
        <div className="absolute inset-0 bg-blue-950" style={{ opacity: dim / 100 }} />
      </div>}
      <div className="console-shell relative mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <div aria-hidden="true" className="crt-lines pointer-events-none absolute inset-0 z-40" />
      <header className="console-header relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><Gamepad2 className="h-8 w-8 text-[var(--retro-gold)]" /><span className="retro-hud text-xs">EmuHub</span></div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="retro-hud mr-2 flex items-center gap-2 text-xs"><Star className="h-6 w-6 fill-[var(--retro-gold)] text-[var(--retro-gold)]" /><span>× {String(apps.length).padStart(2, "0")}</span></div>
          <Button variant="outline" onClick={() => setEnabled(!enabled)} aria-pressed={enabled} aria-label={enabled ? "Mute retro sounds" : "Enable retro sounds"} className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">{enabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}Sound {enabled ? "on" : "off"}</Button>
          <Button variant="outline" onClick={() => setShowSettings(true)} className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white"><ImagePlus className="mr-2 h-4 w-4" />Background</Button>
          {background?.type === "video" && <Button variant="outline" aria-label={paused ? "Play background video" : "Pause background video"} onClick={() => setPaused(!paused)} className="rounded-xl border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>}
        </div>
      </header>
      <section className="console-hero relative z-10 mx-auto px-5 pb-10 pt-9 text-center sm:pb-12 sm:pt-12" style={background ? { backgroundImage: "none", backgroundColor: "transparent" } : undefined}>
        <p className="retro-hud mb-5 text-[8px] leading-6 tracking-wide sm:text-[10px]">— APP SELECT —</p>
        <h1 aria-label="EmuHub" className="retro-title text-3xl sm:text-5xl md:text-6xl">
          {"EmuHub".split("").map((letter, i) => <span key={i} style={{ color: ["var(--retro-red)", "var(--retro-gold)", "#65c649", "#65c649", "var(--retro-red)", "var(--retro-gold)"][i], transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>{letter}</span>)}
        </h1>
        <p className="retro-hud mt-6 text-[10px] sm:text-xs">All your emulation apps One hub.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Button onClick={() => { setEditing(undefined); setShowAddForm(true); }} className="retro-button h-12 rounded-xl px-7"><Plus className="mr-2 h-5 w-5" /> Add App</Button>
          <Button asChild className="retro-button h-12 rounded-xl px-7"><Link to="/hub"><Monitor className="mr-2 h-5 w-5" />App Projection Hub</Link></Button>
        </div>
      </section>
      <main className="console-library relative z-10 mx-auto max-w-6xl p-4 sm:p-7"><EmulationAppList apps={apps} onEdit={handleEdit} onArtwork={setArtworkApp} onDelete={handleDelete} onOpen={handleOpen} onLaunch={handleLaunch} launchingAppId={launchingAppId} onToggleFavorite={handleToggleFavorite} /></main>
      <footer className="console-footer relative z-10 flex flex-wrap items-center justify-center gap-6 px-4 py-5 text-xs"><span className="flex items-center gap-2"><Gamepad2 className="h-6 w-6 text-slate-300" /> Your app collection</span><span className="flex items-center gap-2"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> {apps.length} apps</span></footer>
      </div>
      {showAddForm && <AddEmulationApp app={editing} onAdd={handleSave} onClose={closeForm} />}
      {artworkApp && <CartridgeArtwork app={artworkApp} upload={upload} onClose={() => setArtworkApp(undefined)} onSave={artwork => {
        setApps(prev => prev.map(app => app.id === artworkApp.id ? { ...app, artwork } : app));
        setArtworkApp(undefined);
        toast.success("Cartridge image updated!");
      }} />}
      {showSettings && <AppearanceSettings onClose={() => setShowSettings(false)} background={background} onBackground={setBackground} upload={upload} dim={dim} onDim={setDim} paused={paused} onPaused={setPaused} />}
    </div>
    <Outlet context={{ apps }} />
    </>
  );
};
export default Index;
