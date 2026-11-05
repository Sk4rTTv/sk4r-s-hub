import { EmulationApp, SYSTEMS } from "@/types/emulation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUpload } from "./MediaUpload";

interface AddEmulationAppProps {
  app?: EmulationApp;
  onAdd: (app: Omit<EmulationApp, "id">) => void;
  onClose: () => void;
  upload: (file: File) => string;
}

export const AddEmulationApp = ({ app, onAdd, onClose, upload }: AddEmulationAppProps) => {
  const [name, setName] = useState(app?.name ?? "");
  const [system, setSystem] = useState(app?.system ?? "Multi-system");
  const [icon, setIcon] = useState(app?.icon ?? "🎮");
  const [color, setColor] = useState(app?.color ?? "#64748b");
  const [artwork, setArtwork] = useState(app?.artwork);
  const [status, setStatus] = useState<EmulationApp["status"]>(app?.status ?? "installed");
  const [url, setUrl] = useState(app?.url ?? "");
  const [error, setError] = useState("");

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
    onAdd({ name: name.trim(), system: system.trim(), icon: icon || "🎮", color, artwork, status, url: link });
  };

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-6">
      <DialogHeader>
        <DialogTitle className="pixel-font pr-6 text-sm leading-6">{app ? "Edit app" : "Add emulator app"}</DialogTitle>
        <DialogDescription className="text-slate-700">One cartridge per app—not per game. Add your emulator's name and image.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="app-name">App name</Label><Input id="app-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-white" placeholder="RetroArch, Dolphin, PCSX2…" /></div>
        <div className="space-y-2"><Label htmlFor="app-system">Supported system(s)</Label><Input id="app-system" required list="app-system-options" maxLength={150} value={system} onChange={e => setSystem(e.target.value)} className="rounded-xl bg-white" placeholder="GameCube / Wii, Multi-system…" /><datalist id="app-system-options">{SYSTEMS.map(s => <option key={s} value={s} />)}</datalist><p className="text-xs text-slate-700">Choose a suggestion or type the systems your app supports.</p></div>
        <MediaUpload label="App image / logo" onSelect={file => setArtwork(upload(file))} />
        {artwork && <div className="space-y-2"><img src={artwork} alt="App cartridge image preview" className="h-36 w-full rounded-xl border-4 border-slate-500 bg-slate-100 object-contain" onError={() => setError("This image format could not be displayed. Try PNG, JPG, WebP, or GIF.")} /><Button type="button" variant="outline" className="rounded-lg bg-white text-red-700 hover:bg-red-50" onClick={() => setArtwork(undefined)}>Remove image</Button></div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="app-icon">Fallback icon</Label><Input id="app-icon" value={icon} maxLength={20} onChange={e => setIcon(e.target.value)} className="rounded-xl bg-white text-xl" /></div>
          <div className="space-y-2"><Label htmlFor="app-color">Shell color</Label><Input id="app-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 rounded-xl bg-white p-1" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="app-status">Status</Label><Select value={status} onValueChange={value => setStatus(value as EmulationApp["status"])}><SelectTrigger id="app-status" className="rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl"><SelectItem value="installed">Installed</SelectItem><SelectItem value="not-installed">Not installed</SelectItem><SelectItem value="favorite">Favorite</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="app-url">App web link (optional)</Label><Input id="app-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="rounded-xl bg-white" /><p className="text-xs leading-5 text-slate-700">Link to a web app or the emulator's website. This browser organizer cannot upload or launch desktop executables.</p></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pb-2"><Button type="button" variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button type="submit" className="retro-button rounded-xl">{app ? "Save changes" : "Add app"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
};
