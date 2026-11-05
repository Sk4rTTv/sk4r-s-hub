import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const MediaUpload = ({ label, video = false, onSelect }: { label: string; video?: boolean; onSelect: (file: File) => void }) => {
  const id = useId();
  const [error, setError] = useState("");
  return <div className="space-y-2">
    <Label htmlFor={id} className="font-bold">{label}</Label>
    <Input id={id} type="file" accept={video ? "image/*,video/mp4,video/webm,video/ogg" : "image/*"} className="h-auto rounded-xl border-2 border-amber-200 bg-white p-3 text-xs file:mr-2 file:rounded file:border-0 file:bg-amber-200 file:p-2 file:text-amber-950" onChange={e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const isVideo = ["video/mp4", "video/webm", "video/ogg"].includes(file.type);
      if (!file.type.startsWith("image/") && !(video && isVideo)) { setError("Choose an image, GIF, or supported video."); e.target.value = ""; return; }
      if (file.size > (isVideo ? 100 : 10) * 1024 * 1024) { setError(isVideo ? "Videos must be under 100 MB." : "Images must be under 10 MB."); e.target.value = ""; return; }
      setError(""); onSelect(file);
    }} />
    <p className="text-xs text-amber-900">{video ? "Images / GIFs up to 10 MB. MP4, WebM, Ogg videos up to 100 MB." : "Upload an image or GIF, up to 10 MB."}</p>
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
  </div>;
};
