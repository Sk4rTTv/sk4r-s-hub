import { Monitor, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useInterfaceSettings } from "@/contexts/InterfaceSettings";

export function CrtSettings() {
  const { crtEnabled, setCrtEnabled } = useInterfaceSettings();
  return <section className="retro-toolbar space-y-5 rounded-2xl p-5 sm:p-7" aria-labelledby="crt-heading">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><Monitor className="h-7 w-7 text-cyan-300" /><div><h2 id="crt-heading" className="text-lg font-bold">CRT display effect</h2><p className="mt-1 text-sm text-blue-100">A little arcade atmosphere. No heavy flicker.</p></div></div>
      <div className="flex items-center gap-3 rounded-xl border border-indigo-400 bg-blue-950 px-4 py-3">
        <Label htmlFor="crt-effect" className="cursor-pointer text-sm font-bold">Enable CRT</Label>
        <Switch id="crt-effect" checked={crtEnabled} onCheckedChange={setCrtEnabled} aria-describedby="crt-description" className="crt-switch h-7 w-12 border-2 [&>span]:h-5 [&>span]:w-5 [&>span[data-state=checked]]:translate-x-6" />
      </div>
    </div>
    <div className="flex flex-wrap gap-2" aria-label="CRT effects">{["Fine scanlines", "Curved-glass edges", "Tiny RGB text fringe"].map(effect => <span key={effect} className="rounded-lg border border-indigo-400 bg-blue-950 px-3 py-2 text-xs text-blue-100">{effect}</span>)}</div>
    <p id="crt-description" className="max-w-3xl text-sm leading-6 text-blue-100">Adds a subtle CRT-style finish to EmuHub’s screens and dialogs. The glass treatment is visual only: controls stay in place, and text remains readable. Turning it off removes the scanlines and all added CRT effects.</p>
    <div role="status" className="flex items-center gap-2 text-sm font-bold text-yellow-200"><Sparkles className="h-4 w-4" />{crtEnabled ? "CRT enabled — see the effect on this screen" : "Clean display — CRT effects off"}</div>
    <p className="text-xs leading-5 text-blue-200">Applies instantly and lasts for this session. It does not alter an emulator’s own window, game files, or captured video resolution.</p>
  </section>;
}
