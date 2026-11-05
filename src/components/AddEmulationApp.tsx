import { EmulationApp, SYSTEMS } from "@/types/emulation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NativeExecutable } from "@/types/desktop";

interface AddEmulationAppProps {
  app?: EmulationApp;
  onAdd: (app: Omit<EmulationApp, "id">) => void;
  onClose: () => void;
}

export const AddEmulationApp = ({ app, onAdd, onClose }: AddEmulationAppProps) => {
  const [name, setName] = useState(app?.name ?? "");
  const [system, setSystem] = useState(app?.system ?? "Multi-system");
  const [icon, setIcon] = useState(app?.icon ?? "🎮");
  const [color, setColor] = useState(app?.color ?? "#64748b");
  const [appFile, setAppFile] = useState(app?.appFile);
  const [nativeExecutable, setNativeExecutable] = useState<NativeExecutable | undefined>(app?.nativeExecutable);
  const [choosing, setChoosing] = useState(false);
  const [status, setStatus] = useState<EmulationApp["status"]>(app?.status ?? "installed");
  const [url, setUrl] = useState(app?.url ?? "");
  const [error, setError] = useState("");
  const chooseInstalledApp = async () => {
    if (!window.emuDesktop || choosing) return;
    setChoosing(true); setError("");
    try {
      const executable = await window.emuDesktop.selectExecutable();
      if (executable) {
        setNativeExecutable(executable); setAppFile(undefined);
        if (!name.trim()) setName(executable.name.slice(0, 120));
        if (/dolphin/i.test(executable.name)) setSystem("GameCube / Wii");
      }
    } catch { setError("Could not select the executable. Choose an installed Windows .exe file."); }
    finally { setChoosing(false); }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !system.trim()) { setError("Enter an app name and its supported system."); return; }
    let link: string | undefined;
    if (url.trim()) {
      try {
        const parsed = new URL(url.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
        link = parsed.href;
      } catch { setError("Enter a full http:// or https:// app link."); return; }
    }
    onAdd({ name: name.trim(), system: system.trim(), icon: icon || "🎮", color, artwork: app?.artwork, appFile, directoryKey: app?.directoryKey, nativeExecutable, status, url: link });
  };

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-6">
      <DialogHeader>
        <DialogTitle className="pixel-font pr-6 text-sm leading-6">{app ? "Edit app" : "Add emulator app"}</DialogTitle>
        <DialogDescription className="text-slate-700">Select your app file or enter an app name and web link. Add images later from the cartridge menu.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        {window.emuDesktop ? <div className="space-y-3 rounded-xl border-2 border-indigo-300 bg-white p-4">
          <Label>Installed Windows emulator</Label>
          <Button type="button" disabled={choosing} onClick={chooseInstalledApp} className="retro-button w-full rounded-xl">{choosing ? "Choosing…" : "Choose installed app (.exe)"}</Button>
          {nativeExecutable && <div className="flex items-center gap-2"><p className="min-w-0 flex-1 break-all text-sm">Selected: {nativeExecutable.fileName}</p><Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setNativeExecutable(undefined)}>Remove</Button></div>}
          <p className="text-xs leading-5 text-slate-700">Choose Dolphin.exe from its installed folder, not a setup installer. The hub can launch it in a separate native window.</p>
        </div> : <div className="space-y-2">
          <Label htmlFor="app-file">Choose app file (optional)</Label>
          <Input id="app-file" type="file" accept=".exe,.msi,.apk,.appimage,.dmg,.pkg,.app,.jar,.deb,.rpm,.lnk,.desktop,.zip,.7z" className="h-auto rounded-xl bg-white p-3 text-xs file:mr-2 file:rounded file:border-0 file:bg-blue-100 file:p-2 file:text-blue-950" onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!/\.(exe|msi|apk|appimage|dmg|pkg|app|jar|deb|rpm|lnk|desktop|zip|7z)$/i.test(file.name)) { setError("Choose an app, installer, shortcut, or app archive—not an image."); e.target.value = ""; return; }
            setAppFile(file);
            if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, "").slice(0, 120));
            setError("");
          }} />
          {appFile && <div className="flex items-center gap-2"><p className="min-w-0 flex-1 break-all text-xs text-slate-700">Selected: {appFile.name}</p><Button type="button" variant="outline" size="sm" className="rounded-lg bg-white" onClick={() => { setAppFile(undefined); const input = document.getElementById("app-file") as HTMLInputElement; input.value = ""; }}>Remove</Button></div>}
          <p className="text-xs leading-5 text-slate-700">App files stay local for this session. Native launching requires the Windows desktop version; this browser preview cannot launch executables.</p>
        </div>}
        <div className="space-y-2"><Label htmlFor="app-name">App name</Label><Input id="app-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-white" placeholder="RetroArch, Dolphin, PCSX2…" /></div>
        <div className="space-y-2"><Label htmlFor="app-system">Supported system(s)</Label><Input id="app-system" required list="app-system-options" maxLength={150} value={system} onChange={e => setSystem(e.target.value)} className="rounded-xl bg-white" placeholder="NES, SNES, Nintendo 64…" /><datalist id="app-system-options">{SYSTEMS.map(s => <option key={s} value={s} />)}</datalist><p className="text-xs text-slate-700">This determines the cartridge shape. Choose a single console for its matching shell; unrecognized systems use a classic generic shell.</p></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="app-icon">Fallback icon</Label><Input id="app-icon" value={icon} maxLength={20} onChange={e => setIcon(e.target.value)} className="rounded-xl bg-white text-xl" /></div>
          <div className="space-y-2"><Label htmlFor="app-color">Label color</Label><Input id="app-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 rounded-xl bg-white p-1" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="app-status">Status</Label><Select value={status} onValueChange={value => setStatus(value as EmulationApp["status"])}><SelectTrigger id="app-status" className="rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl"><SelectItem value="installed">Installed</SelectItem><SelectItem value="not-installed">Not installed</SelectItem><SelectItem value="favorite">Favorite</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="app-url">App web link (optional)</Label><Input id="app-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="rounded-xl bg-white" /><p className="text-xs leading-5 text-slate-700">Link to a web app or the emulator's website to open it from the cartridge.</p></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pb-2"><Button type="button" variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button type="submit" className="retro-button rounded-xl">{app ? "Save changes" : "Add app"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
};
