import { EmulationAppList } from "@/components/EmulationAppList";
import { AddEmulationApp } from "@/components/AddEmulationApp";
import { DirectoryImport } from "@/components/DirectoryImport";
import { GamesLibrary } from "@/components/GamesLibrary";
import { GameEditor } from "@/components/GameEditor";
import { GameCoverMenu } from "@/components/GameCoverMenu";
import { CartridgeArtwork } from "@/components/CartridgeArtwork";
import { StartMenu } from "@/components/StartMenu";
import { AppearanceSettings, type BackgroundMedia } from "@/components/AppearanceSettings";
import { EmulationApp } from "@/types/emulation";
import type { LibraryGame } from "@/types/game";
import { directoryFileKey, type DirectorySelection } from "@/lib/directory-import";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Star, Gamepad2, ImagePlus, Volume2, VolumeX, Pause, Play, Monitor, Settings, ArrowLeft, FolderOpen, AppWindow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRetroSounds } from "@/hooks/useRetroSounds";
import { retroScenes } from "@/lib/retro-scenes";
import { useRetroMotion } from "@/hooks/useRetroMotion";
import startMenuWallpaper from "@/assets/start-menu-wallpaper.svg";
import { toast } from "sonner";
import "@/retro.css";

const Index = () => {
  const [started, setStarted] = useState(false);
  const collectionTitle = useRef<HTMLHeadingElement>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDirectoryImport, setShowDirectoryImport] = useState(false);
  const [showGameImport, setShowGameImport] = useState(false);
  const [libraryTab, setLibraryTab] = useState("apps");
  const [editingGame, setEditingGame] = useState<LibraryGame>();
  const [coverGame, setCoverGame] = useState<LibraryGame>();
  const [games, setGames] = useState<LibraryGame[]>([]);
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
  const inHub = ["/hub", "/settings"].includes(useLocation().pathname.replace(/\/$/, ""));
  const [sceneId, setSceneId] = useState(retroScenes[0].id);
  const [shuffle, setShuffle] = useState(false);
  const world = useRetroMotion(!inHub && started, apps.length + games.length, libraryTab);
  useEffect(() => {
    if (inHub) setStarted(false);
    else if (started) collectionTitle.current?.focus({ preventScroll: true });
  }, [inHub, started]);
  const scene = retroScenes.find(entry => entry.id === sceneId)!;
  const nextScene = () => setSceneId(current => {
    const choices = retroScenes.filter(entry => entry.id !== current);
    return choices[Math.floor(Math.random() * choices.length)].id;
  });
  const selectScene = (id: string) => { setSceneId(id); setBackground(null); setShuffle(false); };
  const changeBackground = (media: BackgroundMedia | null) => { setBackground(media); setShuffle(false); };
  useEffect(() => {
    if (!shuffle || inHub) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) nextScene();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [shuffle, inHub]);

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
  }, [paused, background, inHub, started]);

  const handleSave = (data: Omit<EmulationApp, "id">) => {
    setApps(prev => editing ? prev.map(app => app.id === editing.id ? { ...data, id: app.id } : app) : [...prev, { ...data, id: crypto.randomUUID() }]);
    setShowAddForm(false); setEditing(undefined);
    toast.success(editing ? "App updated!" : "App added!");
  };
  const handleDirectoryImport = (entries: DirectorySelection[]) => {
    const imported: EmulationApp[] = entries.map(entry => ({ id: crypto.randomUUID(), name: entry.name, system: entry.system, icon: "🎮", color: "#64748b", status: "installed", appFile: entry.file, directoryKey: entry.key }));
    setApps(current => {
      const keys = new Set(current.map(app => app.directoryKey).filter(Boolean));
      return [...current, ...imported.filter(app => !keys.has(app.directoryKey))];
    });
    setShowDirectoryImport(false);
    toast.success(`${imported.length} ${imported.length === 1 ? "app" : "apps"} added from directory.`);
  };
  const handleGameImport = (entries: DirectorySelection[]) => {
    const imported: LibraryGame[] = entries.map(entry => ({ id: crypto.randomUUID(), name: entry.name, system: entry.system, icon: "🎮", color: "#64748b", fileName: entry.fileName, relativePath: entry.relativePath, file: entry.file, directoryKey: entry.key }));
    setGames(current => {
      const keys = new Set(current.map(game => game.directoryKey));
      return [...current, ...imported.filter(game => !keys.has(game.directoryKey))];
    });
    setShowGameImport(false);
    toast.success(`${imported.length} ${imported.length === 1 ? "game" : "games"} added to console shelves.`);
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
  const selectedMedia = background?.type === "video" ? <video key={background.url} ref={video} src={background.url} muted loop playsInline autoPlay className="h-full w-full object-cover" onError={mediaError} /> : <img key={background?.url ?? scene.url} src={background?.url ?? scene.url} alt="" className="scene-image h-full w-full object-cover" onError={background ? mediaError : undefined} />;

  return (
    <>
    <div ref={world} hidden={inHub} className="retro-world relative min-h-screen overflow-x-hidden px-2 py-3 text-white sm:p-6">
      <div className="retro-backdrop pointer-events-none fixed" aria-hidden="true">
        {started ? selectedMedia : <img src={startMenuWallpaper} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-blue-950" style={{ opacity: started ? dim / 100 : 0.12 }} />
      </div>
      <div className="console-shell relative mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <div aria-hidden="true" className="crt-lines pointer-events-none absolute inset-0 z-40" />
      <header className="console-header relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><Gamepad2 className="h-8 w-8 text-[var(--retro-gold)]" /><span className="retro-hud text-xs">EmuHub</span></div>
        <div className="flex flex-wrap items-center gap-3">
          {started && <Button variant="outline" onClick={() => { setStarted(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white"><ArrowLeft className="mr-2 h-4 w-4" />Start menu</Button>}
          <div className="retro-hud mr-2 flex items-center gap-2 text-xs" aria-label={`${apps.length} apps and ${games.length} games`}><Star className="h-6 w-6 fill-[var(--retro-gold)] text-[var(--retro-gold)]" /><span>× {String(apps.length + games.length).padStart(2, "0")}</span></div>
          <Button variant="outline" onClick={() => setEnabled(!enabled)} aria-pressed={enabled} aria-label={enabled ? "Mute retro sounds" : "Enable retro sounds"} className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">{enabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}Sound {enabled ? "on" : "off"}</Button>
          <Button variant="outline" onClick={() => setShowSettings(true)} className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white"><ImagePlus className="mr-2 h-4 w-4" />Background</Button>
          <Button asChild variant="outline" className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white"><Link to="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></Button>
          {background?.type === "video" && <Button variant="outline" aria-label={paused ? "Play background video" : "Pause background video"} onClick={() => setPaused(!paused)} className="rounded-xl border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>}
        </div>
      </header>
      <section className={`console-hero relative z-10 mx-auto px-5 pb-10 pt-9 text-center sm:pb-12 sm:pt-12 ${started ? "" : "title-screen"}`} style={{ backgroundImage: background ? "none" : `url("${scene.url}")`, backgroundColor: "transparent" }}>
        {!started && background && <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0">
          {selectedMedia}
          <div className="absolute inset-0 bg-blue-950" style={{ opacity: dim / 100 }} />
        </div>}
        {!background && <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0 bg-blue-950" style={{ opacity: dim / 100 }} />}
        <p className="retro-hud mb-5 text-[length:calc(.5rem*var(--text-scale))] leading-6 tracking-wide sm:text-[length:calc(.625rem*var(--text-scale))]">{started ? libraryTab === "games" ? "— GAME SELECT —" : "— APP SELECT —" : "— PLAYER ONE · READY —"}</p>
        <h1 aria-label="EmuHub" className="retro-title text-3xl sm:text-5xl md:text-6xl">
          {"EmuHub".split("").map((letter, i) => <span key={i} style={{ color: ["var(--retro-red)", "var(--retro-gold)", "#65c649", "#65c649", "var(--retro-red)", "var(--retro-gold)"][i], transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>{letter}</span>)}
        </h1>
        <p className="retro-hud mt-6 text-[length:calc(.625rem*var(--text-scale))] sm:text-xs">Your emulation apps and games. One hub.</p>
        {started ? <div className="mt-7 flex flex-wrap justify-center gap-4">
          {libraryTab === "apps" ? <>
            <Button onClick={() => { setEditing(undefined); setShowAddForm(true); }} className="retro-button h-12 rounded-xl px-7"><Plus className="mr-2 h-5 w-5" /> Add App</Button>
            <Button onClick={() => setShowDirectoryImport(true)} className="retro-button h-12 rounded-xl px-7"><FolderOpen className="mr-2 h-5 w-5" />Directory Folder</Button>
          </> : <Button onClick={() => setShowGameImport(true)} className="retro-button h-12 rounded-xl px-7"><FolderOpen className="mr-2 h-5 w-5" />Add Games Directory</Button>}
          <Button asChild className="retro-button h-12 rounded-xl px-7"><Link to="/hub"><Monitor className="mr-2 h-5 w-5" />App Projection Hub</Link></Button>
        </div> : !inHub && <StartMenu onStart={() => setStarted(true)} />}
      </section>
      {started && <main className="console-library relative z-10 mx-auto max-w-6xl p-4 sm:p-7">
        <h2 ref={collectionTitle} tabIndex={-1} className="retro-hud mb-5 text-xs text-yellow-300">Your library</h2>
        <Tabs value={libraryTab} onValueChange={setLibraryTab}>
          <TabsList aria-label="Library collection" className="library-tabs mb-6 h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-2 sm:w-auto">
            <TabsTrigger value="apps" className="flex-1 flex-wrap gap-2 rounded-xl border-2 border-transparent px-3 py-3 text-xs text-blue-100 data-[state=active]:border-yellow-300 data-[state=active]:bg-yellow-300 data-[state=active]:text-blue-950 sm:px-5 sm:text-sm"><AppWindow className="h-5 w-5" />Apps <span className="font-mono">({apps.length})</span></TabsTrigger>
            <TabsTrigger value="games" className="flex-1 flex-wrap gap-2 rounded-xl border-2 border-transparent px-3 py-3 text-xs text-blue-100 data-[state=active]:border-yellow-300 data-[state=active]:bg-yellow-300 data-[state=active]:text-blue-950 sm:px-5 sm:text-sm"><Gamepad2 className="h-5 w-5" />Games <span className="font-mono">({games.length})</span></TabsTrigger>
          </TabsList>
          <TabsContent value="apps" className="mt-0"><EmulationAppList apps={apps} onEdit={handleEdit} onArtwork={setArtworkApp} onDelete={handleDelete} onOpen={handleOpen} onLaunch={handleLaunch} launchingAppId={launchingAppId} onToggleFavorite={handleToggleFavorite} /></TabsContent>
          <TabsContent value="games" className="mt-0"><GamesLibrary games={games} onImport={() => setShowGameImport(true)} onEdit={setEditingGame} onCover={setCoverGame} onRemove={id => setGames(current => current.filter(game => game.id !== id))} /></TabsContent>
        </Tabs>
      </main>}
      <footer className="console-footer relative z-10 flex flex-wrap items-center justify-center gap-6 px-4 py-5 text-xs"><span className="flex items-center gap-2"><Gamepad2 className="h-6 w-6 text-slate-300" /> {started ? "Your apps & games" : "Choose your next adventure"}</span><span className="flex items-center gap-2"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> {apps.length} apps · {games.length} games</span></footer>
      </div>
      {showAddForm && <AddEmulationApp app={editing} onAdd={handleSave} onClose={closeForm} />}
      {showDirectoryImport && <DirectoryImport kind="apps" existingKeys={apps.flatMap(app => [app.directoryKey, app.appFile ? directoryFileKey(app.appFile) : undefined].filter((key): key is string => !!key))} onClose={() => setShowDirectoryImport(false)} onImport={handleDirectoryImport} />}
      {showGameImport && <DirectoryImport kind="games" existingKeys={games.map(game => game.directoryKey)} onClose={() => setShowGameImport(false)} onImport={handleGameImport} />}
      {editingGame && <GameEditor game={editingGame} upload={upload} onClose={() => setEditingGame(undefined)} onSave={game => {
        setGames(current => current.map(entry => entry.id === game.id ? game : entry));
        setEditingGame(undefined);
        toast.success("Game updated!");
      }} />}
      {coverGame && <GameCoverMenu game={coverGame} upload={upload} onClose={() => setCoverGame(undefined)} onSave={artwork => {
        setGames(current => current.map(game => game.id === coverGame.id ? { ...game, artwork } : game));
        setCoverGame(undefined);
        toast.success(artwork ? "Game cover updated!" : "Game cover removed.");
      }} />}
      {artworkApp && <CartridgeArtwork app={artworkApp} upload={upload} onClose={() => setArtworkApp(undefined)} onSave={artwork => {
        setApps(prev => prev.map(app => app.id === artworkApp.id ? { ...app, artwork } : app));
        setArtworkApp(undefined);
        toast.success("Cartridge image updated!");
      }} />}
      {showSettings && <AppearanceSettings onClose={() => setShowSettings(false)} background={background} onBackground={changeBackground} sceneId={sceneId} onScene={selectScene} shuffle={shuffle} onShuffle={value => { setShuffle(value); if (value) { setBackground(null); nextScene(); } }} onNext={() => { setBackground(null); nextScene(); }} upload={upload} dim={dim} onDim={setDim} paused={paused} onPaused={setPaused} />}
    </div>
    <Outlet context={{ apps }} />
    </>
  );
};
export default Index;
