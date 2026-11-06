import { useRef, useState, type FormEvent } from "react";
import { Clock3, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LibraryGame } from "@/types/game";
import type { CompletedPlaySession } from "@/types/play-stats";

function localDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function LogPlaySession({ game, saveFolder, onSave, onClose }: { game: LibraryGame; saveFolder: string; onSave: (session: CompletedPlaySession) => Promise<void>; onClose: () => void }) {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [playedAt, setPlayedAt] = useState(localDateTime);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    const duration = Number(hours) * 60 + Number(minutes);
    const date = new Date(playedAt);
    if (!hours.trim() || !minutes.trim() || !Number.isInteger(Number(hours)) || !Number.isInteger(Number(minutes)) || Number(hours) < 0 || Number(minutes) < 0 || Number(minutes) > 59 || duration < 1 || duration > 1440 || !Number.isFinite(date.getTime()) || date.getTime() < 0 || date.getTime() > Date.now()) { setError("Enter 1 minute to 24 hours and a completed-session date that is not in the future."); return; }
    pending.current = true; setSaving(true); setError("");
    try { await onSave({ id: sessionId, minutes: duration, playedAt: date.toISOString() }); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This session could not be saved. Try again."); }
    finally { pending.current = false; setSaving(false); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}>
    <DialogContent className="retro-dialog max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-5 sm:p-6" onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => { if (saving) event.preventDefault(); }}>
      <DialogHeader><DialogTitle className="pixel-font flex items-center gap-3 pr-4 text-sm leading-6"><Clock3 className="h-6 w-6 shrink-0 text-indigo-700" />Log play session</DialogTitle><DialogDescription className="text-slate-700">Record time you already played in your emulator for <strong>{game.name}</strong>. Logging does not launch or open the game.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="play-hours">Hours</Label><Input id="play-hours" type="number" inputMode="numeric" min="0" max="24" step="1" required disabled={saving} value={hours} onChange={event => setHours(event.target.value)} className="rounded-xl border-indigo-300 bg-white" /></div>
          <div className="space-y-2"><Label htmlFor="play-minutes">Minutes</Label><Input id="play-minutes" type="number" inputMode="numeric" min="0" max="59" step="1" required disabled={saving} value={minutes} onChange={event => setMinutes(event.target.value)} className="rounded-xl border-indigo-300 bg-white" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="play-date">Session ended (your local time)</Label><Input id="play-date" type="datetime-local" required min="1970-01-01T00:00" max={localDateTime()} disabled={saving} value={playedAt} onChange={event => setPlayedAt(event.target.value)} className="rounded-xl border-indigo-300 bg-white" /><p className="text-xs leading-5 text-slate-700">Backdated sessions add to total playtime without replacing a more recent Last Played date.</p></div>
        <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-3 text-xs leading-5 text-slate-800">{window.emuDesktop ? <><strong>Saved automatically:</strong><span className="mt-1 block break-all">{saveFolder ? `${saveFolder} / play-stats.json` : "saves/play-stats.json beside EmuHub"}</span>Your stats survive restarting EmuHub and re-importing the same game file. Moving the game file creates a new tracking identity.</> : <><strong>Web preview:</strong> logged stats last for this preview session only. App-folder saves require EmuHub for Windows.</>}</div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3"><Button type="button" disabled={saving} variant="outline" onClick={onClose} className="rounded-xl bg-white">Cancel</Button><Button type="submit" disabled={saving} className="retro-button rounded-xl">{saving ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{saving ? "Saving…" : "Save session"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
