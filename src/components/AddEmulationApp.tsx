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
  const [system, setSystem] = useState(app?.system ?? "");
  const [icon, setIcon] = useState(app?.icon ?? "🎮");
  const [color, setColor] = useState(app?.color ?? "#64748b");
  const [artwork, setArtwork] = useState(app?.artwork);
  const [status, setStatus] = useState<EmulationApp["status"]>(app?.status ?? "installed");
  const [lastPlayed, setLastPlayed] = useState(app?.lastPlayed ?? "");
  const [playtimeHours, setPlaytimeHours] = useState(app?.playtimeHours?.toString() ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !system) { setError("Enter a game name and choose a system."); return; }
    onAdd({ name: name.trim(), system, icon: icon || "🎮", color, artwork, status, lastPlayed: lastPlayed || undefined, playtimeHours: playtimeHours ? Number(playtimeHours) : undefined });
  };

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-6">
      <DialogHeader>
        <DialogTitle className="pixel-font pr-6 text-sm leading-6">{app ? "Edit cartridge" : "New cartridge"}</DialogTitle>
        <DialogDescription className="text-amber-900">Customize your game label and cartridge shell.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="game-name">Game name</Label><Input id="game-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-white" placeholder="Super Mario World" /></div>
        <div className="space-y-2"><Label htmlFor="game-system">System</Label><Select value={system} onValueChange={setSystem}><SelectTrigger id="game-system" className="rounded-xl bg-white"><SelectValue placeholder="Select system" /></SelectTrigger><SelectContent className="retro-menu rounded-xl">{Array.from(new Set([...SYSTEMS, ...(system ? [system] : [])])).map(s => <SelectItem key={s} value={s} className="rounded-lg focus:bg-amber-100 focus:text-amber-950">{s}</SelectItem>)}</SelectContent></Select></div>
        <MediaUpload label="Cartridge artwork" onSelect={file => setArtwork(upload(file))} />
        {artwork && <div className="space-y-2"><img src={artwork} alt="Cartridge label preview" className="h-36 w-full rounded-xl border-4 border-slate-500 bg-slate-100 object-cover" onError={() => setError("This image format could not be displayed. Try PNG, JPG, WebP, or GIF.")} /><Button type="button" variant="outline" className="rounded-lg bg-white text-red-700 hover:bg-red-50" onClick={() => setArtwork(undefined)}>Remove artwork</Button></div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="game-icon">Fallback icon</Label><Input id="game-icon" value={icon} maxLength={20} onChange={e => setIcon(e.target.value)} className="rounded-xl bg-white text-xl" /></div>
          <div className="space-y-2"><Label htmlFor="game-color">Shell color</Label><Input id="game-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 rounded-xl bg-white p-1" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="game-status">Status</Label><Select value={status} onValueChange={value => setStatus(value as EmulationApp["status"])}><SelectTrigger id="game-status" className="rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl"><SelectItem value="installed">Installed</SelectItem><SelectItem value="not-installed">Not installed</SelectItem><SelectItem value="favorite">Favorite</SelectItem></SelectContent></Select></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="game-last">Last played</Label><Input id="game-last" value={lastPlayed} onChange={e => setLastPlayed(e.target.value)} placeholder="2 hours ago" className="rounded-xl bg-white" /></div><div className="space-y-2"><Label htmlFor="game-hours">Hours played</Label><Input id="game-hours" type="number" min="0" step="0.1" value={playtimeHours} onChange={e => setPlaytimeHours(e.target.value)} className="rounded-xl bg-white" /></div></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pb-2"><Button type="button" variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button type="submit" className="retro-button rounded-xl">{app ? "Save changes" : "Add game"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
};
