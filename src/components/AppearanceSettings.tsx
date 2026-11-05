import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shuffle, SkipForward, Check } from "lucide-react";
import { retroScenes } from "@/lib/retro-scenes";
import { MediaUpload } from "./MediaUpload";

export interface BackgroundMedia { url: string; type: "image" | "video"; name: string }
interface Props {
  onClose: () => void;
  background: BackgroundMedia | null;
  onBackground: (media: BackgroundMedia | null) => void;
  sceneId: string;
  onScene: (id: string) => void;
  shuffle: boolean;
  onShuffle: (value: boolean) => void;
  onNext: () => void;
  upload: (file: File) => string;
  dim: number;
  onDim: (value: number) => void;
  paused: boolean;
  onPaused: (value: boolean) => void;
}
export const AppearanceSettings = ({ onClose, background, onBackground, sceneId, onScene, shuffle, onShuffle, onNext, upload, dim, onDim, paused, onPaused }: Props) => (
  <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl">
      <DialogHeader><DialogTitle className="pixel-font text-sm leading-6">Set the scene</DialogTitle><DialogDescription className="text-slate-700">Pick a retro world, shuffle the collection, or bring your own background.</DialogDescription></DialogHeader>
      <div className="grid grid-cols-2 gap-3" aria-label="Retro backgrounds">
        {retroScenes.map(scene => {
          const selected = !background && scene.id === sceneId;
          return <button key={scene.id} type="button" aria-pressed={selected} onClick={() => onScene(scene.id)} className={`scene-choice relative overflow-hidden rounded-xl border-2 text-left ${selected ? "border-indigo-700 bg-indigo-100" : "border-slate-400 bg-white"}`}>
            <img src={scene.url} alt="" className="h-24 w-full object-cover sm:h-28" />
            {selected && <span className="absolute right-2 top-2 rounded-full bg-indigo-700 p-1 text-white"><Check className="h-4 w-4" /></span>}
            <span className="block px-3 py-2"><span className="block text-sm font-bold">{scene.name}</span><span className="block text-xs">{scene.description}</span></span>
          </button>;
        })}
      </div>
      <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button aria-pressed={shuffle} className="retro-button rounded-xl" onClick={() => onShuffle(!shuffle)}><Shuffle className="mr-2 h-4 w-4" />Shuffle {shuffle ? "on" : "off"}</Button>
          <Button variant="outline" className="rounded-xl border-indigo-300 bg-white" onClick={onNext}><SkipForward className="mr-2 h-4 w-4" />Next scene</Button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-700">Shuffle picks a different retro scene every 20 seconds. Picking a scene or uploading media turns shuffle off.</p>
      </div>
      <div className="space-y-2"><Label htmlFor="background-dim">Darken background: {dim}%</Label><Input id="background-dim" type="range" min="0" max="80" value={dim} onChange={e => onDim(Number(e.target.value))} className="h-8 border-0 p-0 accent-indigo-600 shadow-none" /></div>
      <MediaUpload label="Use your own image or video" video onSelect={file => { onBackground({ url: upload(file), type: file.type.startsWith("video/") ? "video" : "image", name: file.name }); onPaused(false); }} />
      {background && <div className="space-y-3">
        {background.type === "video" ? <video src={background.url} muted playsInline controls className="h-40 w-full rounded-xl bg-slate-900 object-contain" /> : <img src={background.url} alt="Background preview" className="h-40 w-full rounded-xl object-cover" />}
        <p className="break-all text-sm text-slate-700">{background.name}</p>
        <div className="flex flex-wrap gap-2">
          {background.type === "video" && <Button variant="outline" className="rounded-xl bg-white" onClick={() => onPaused(!paused)}>{paused ? "Play background" : "Pause background"}</Button>}
          <Button variant="outline" className="rounded-xl bg-white text-red-700" onClick={() => onBackground(null)}>Back to retro scenes</Button>
        </div>
      </div>}
      <p className="text-xs leading-5 text-slate-700">Uploads stay on your device for this session. Videos loop silently; GIFs keep their animation.</p>
      <Button className="retro-button rounded-xl" onClick={onClose}>Done</Button>
    </DialogContent>
  </Dialog>
);
