import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUpload } from "./MediaUpload";
import { SYSTEMS } from "@/types/emulation";
import type { LibraryGame } from "@/types/game";

export function GameEditor({ game, upload, onSave, onClose }: { game: LibraryGame; upload: (file: File) => string; onSave: (game: LibraryGame) => void; onClose: () => void }) {
  const [name, setName] = useState(game.name);
  const [system, setSystem] = useState(game.system);
  const [artwork, setArtwork] = useState(game.artwork);
  const [imageError, setImageError] = useState(false);
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || imageError) return;
    onSave({ ...game, name: name.trim(), system, artwork });
  };
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl">
      <DialogHeader><DialogTitle className="pixel-font text-sm leading-6">Edit game</DialogTitle><DialogDescription className="text-slate-700">Update the title, console shelf, or cartridge label. Your game file stays unchanged.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="game-name">Game title</Label><Input id="game-name" required maxLength={120} value={name} onChange={event => setName(event.target.value)} className="rounded-xl bg-white" /></div>
        <div className="space-y-2"><Label htmlFor="game-console">Console</Label><Select value={system} onValueChange={setSystem}><SelectTrigger id="game-console" className="rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl">{SYSTEMS.filter(entry => !["Multi-system", "Modern"].includes(entry)).map(entry => <SelectItem key={entry} value={entry}>{entry}</SelectItem>)}</SelectContent></Select></div>
        <MediaUpload label="Cartridge artwork" onSelect={file => { setArtwork(upload(file)); setImageError(false); }} />
        {artwork && <div className="space-y-3"><img src={artwork} alt="Game artwork preview" onError={() => setImageError(true)} className="h-40 w-full rounded-xl border-2 border-indigo-400 bg-white object-contain" /><Button type="button" variant="outline" className="rounded-xl bg-white text-red-700" onClick={() => { setArtwork(undefined); setImageError(false); }}>Remove artwork</Button></div>}
        {imageError && <p role="alert" className="text-sm text-red-700">This image could not be displayed. Choose another image or remove it.</p>}
        <p className="break-all text-xs leading-5 text-slate-700">File: {game.relativePath}</p>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!name.trim() || imageError} className="retro-button rounded-xl">Save game</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
