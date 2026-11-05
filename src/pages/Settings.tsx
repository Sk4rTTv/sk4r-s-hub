import { Link } from "react-router-dom";
import { ArrowLeft, Monitor, Settings as SettingsIcon, Type, PanelTop, RotateCcw, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useInterfaceSettings } from "@/contexts/InterfaceSettings";
import "@/retro.css";

export default function Settings() {
  const { textSize, guiSize, setTextSize, setGuiSize, reset } = useInterfaceSettings();
  return <div className="retro-world min-h-screen px-2 py-3 text-white sm:p-6">
    <div className="console-shell mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <header className="console-header flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
        <h1 className="retro-hud flex items-center gap-3 text-xs leading-6"><SettingsIcon className="h-7 w-7 text-yellow-300" />Settings</h1>
        <nav aria-label="Settings navigation" className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white"><Link to="/hub"><Monitor className="mr-2 h-4 w-4" />Projection Hub</Link></Button>
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to title</Link></Button>
        </nav>
      </header>
      <main className="space-y-6 p-4 sm:p-7">
        <section className="rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-5 sm:p-7">
          <p className="retro-hud mb-3 text-xs text-yellow-300">YOUR HUB, YOUR SIZE</p>
          <h2 className="text-2xl font-bold">Make everything comfortable.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Changes apply instantly to the title screen, Projection Hub, and dialogs. Interface size scales the overall layout; text size adds a separate adjustment to the lettering.</p>
        </section>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="retro-toolbar space-y-5 rounded-2xl p-5">
            <div className="flex items-center gap-3"><Type className="h-7 w-7 text-yellow-300" /><h2 className="text-lg font-bold">Text size</h2><output htmlFor="text-size" className="ml-auto rounded-lg bg-blue-950 px-3 py-2 font-mono text-sm text-yellow-300">{textSize}%</output></div>
            <div className="space-y-2"><Label htmlFor="text-size" className="text-blue-100">Lettering scale</Label><input id="text-size" type="range" min="85" max="150" step="5" value={textSize} onChange={event => setTextSize(Number(event.target.value))} className="settings-range" /><div className="flex justify-between text-xs text-blue-200"><span>Smaller · 85%</span><span>Larger · 150%</span></div></div>
            <p className="text-sm text-blue-100">Resize headings, labels, menus, buttons, and the FPS readout without enlarging icons.</p>
          </section>
          <section className="retro-toolbar space-y-5 rounded-2xl p-5">
            <div className="flex items-center gap-3"><PanelTop className="h-7 w-7 text-cyan-300" /><h2 className="text-lg font-bold">Interface size</h2><output htmlFor="gui-size" className="ml-auto rounded-lg bg-blue-950 px-3 py-2 font-mono text-sm text-cyan-200">{guiSize}%</output></div>
            <div className="space-y-2"><Label htmlFor="gui-size" className="text-blue-100">GUI scale</Label><input id="gui-size" type="range" min="80" max="125" step="5" value={guiSize} onChange={event => setGuiSize(Number(event.target.value))} className="settings-range" /><div className="flex justify-between text-xs text-blue-200"><span>Compact · 80%</span><span>Roomy · 125%</span></div></div>
            <p className="text-sm text-blue-100">Scale controls, icons, spacing, and lettering together. The layout still adapts to your screen.</p>
          </section>
        </div>
        <section className="rounded-2xl border-2 border-indigo-400 bg-blue-950 p-5">
          <h2 className="mb-4 text-lg font-bold">Live preview</h2>
          <div className="flex flex-wrap items-center gap-5">
            <Gamepad2 className="h-14 w-14 text-cyan-300" />
            <div className="min-w-0 flex-1"><p className="retro-hud text-xs text-yellow-300">READY TO PLAY</p><p className="mt-2 text-sm text-blue-100">This lettering and these controls use your current sizes.</p></div>
            <Button asChild className="retro-button rounded-xl"><Link to="/hub"><Monitor className="mr-2 h-5 w-5" />Open Hub</Link></Button>
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs leading-5 text-blue-200">Settings last for this session. Adjusting sizes does not resize the emulator’s own window or change captured video resolution.</p>
          <Button onClick={reset} variant="outline" className="rounded-xl border-indigo-300 bg-blue-950 text-white"><RotateCcw className="mr-2 h-4 w-4" />Reset sizes to 100%</Button>
        </div>
      </main>
    </div>
  </div>;
}
