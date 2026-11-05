import { useState } from "react";
import { EmulationApp } from "@/types/emulation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MediaUpload } from "./MediaUpload";

export const CartridgeArtwork = ({ app, upload, onSave, onClose }: { app: EmulationApp; upload: (file: File) => string; onSave: (artwork: string | undefined) => void; onClose: () => void }) => {
  const [artwork, setArtwork] = useState(app.artwork);
  const [error, setError] = useState(false);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl">
      <DialogHeader><DialogTitle className="pixel-font pr-5 text-xs leading-6">Cartridge image</DialogTitle><DialogDescription className="text-slate-700">Customize the image on {app.name}'s cartridge. This does not change the app file.</DialogDescription></DialogHeader>
      <MediaUpload label="Choose cartridge image" onSelect={file => { setArtwork(upload(file)); setError(false); }} />
      {artwork ? <div className="space-y-3"><img src={artwork} alt={`${app.name} cartridge image preview`} className="h-44 w-full rounded-xl border-4 border-slate-500 bg-white object-contain" onError={() => setError(true)} /><Button variant="outline" className="rounded-xl bg-white text-red-700" onClick={() => { setArtwork(undefined); setError(false); }}>Remove image</Button></div> : <div className="flex h-36 items-center justify-center rounded-xl border-4 border-slate-500 bg-white text-6xl">{app.icon}</div>}
      {error && <p role="alert" className="text-sm text-red-700">This image could not be displayed. Choose PNG, JPG, WebP, or GIF.</p>}
      <div className="flex justify-end gap-3"><Button variant="outline" className="rounded-xl bg-white" onClick={onClose}>Cancel</Button><Button disabled={error} className="retro-button rounded-xl" onClick={() => onSave(artwork)}>Save image</Button></div>
    </DialogContent>
  </Dialog>;
};
