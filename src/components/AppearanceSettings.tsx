import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MediaUpload } from "./MediaUpload";

export interface BackgroundMedia { url: string; type: "image" | "video"; name: string }
interface Props {
  onClose: () => void;
  background: BackgroundMedia | null;
  onBackground: (media: BackgroundMedia | null) => void;
  upload: (file: File) => string;
  dim: number;
  onDim: (value: number) => void;
  paused: boolean;
  onPaused: (value: boolean) => void;
}
export const AppearanceSettings = ({ onClose, background, onBackground, upload, dim, onDim, paused, onPaused }: Props) => (
  <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl">
      <DialogHeader><DialogTitle className="pixel-font text-sm leading-6">Your background</DialogTitle><DialogDescription className="text-amber-900">Set the scene with your own picture, GIF, or video.</DialogDescription></DialogHeader>
      <MediaUpload label="Choose background media" video onSelect={file => { onBackground({ url: upload(file), type: file.type.startsWith("video/") ? "video" : "image", name: file.name }); onPaused(false); }} />
      {background && <div className="space-y-3">
        {background.type === "video" ? <video src={background.url} muted playsInline controls className="h-40 w-full rounded-xl bg-slate-900 object-contain" /> : <img src={background.url} alt="Background preview" className="h-40 w-full rounded-xl object-cover" />}
        <p className="break-all text-sm text-amber-900">{background.name}</p>
        <div className="space-y-2"><Label htmlFor="background-dim">Darken background: {dim}%</Label><Input id="background-dim" type="range" min="0" max="80" value={dim} onChange={e => onDim(Number(e.target.value))} className="h-8 border-0 p-0 accent-amber-600 shadow-none" /></div>
        {background.type === "video" && <Button variant="outline" className="rounded-xl bg-white" onClick={() => onPaused(!paused)}>{paused ? "Play background" : "Pause background"}</Button>}
        <Button variant="outline" className="ml-2 rounded-xl bg-white text-red-700" onClick={() => onBackground(null)}>Reset background</Button>
      </div>}
      <p className="text-xs leading-5 text-amber-900">Uploads stay on your device and are available during this session. Videos loop silently; GIFs keep their animation.</p>
      <Button className="retro-button rounded-xl" onClick={onClose}>Done</Button>
    </DialogContent>
  </Dialog>
);
