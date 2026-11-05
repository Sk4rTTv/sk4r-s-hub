import { Check, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useInterfaceSettings } from "@/contexts/InterfaceSettings";
import { uiThemes, type UiColors } from "@/lib/ui-colors";

const colorFields: { key: keyof UiColors; label: string; description: string }[] = [
  { key: "background", label: "Page background", description: "The frame behind your menus." },
  { key: "panel", label: "Panels & controls", description: "Headers, cards, shelves, and menus." },
  { key: "accent", label: "Buttons & highlights", description: "Primary actions and selected controls." },
];

export function UiColorSettings() {
  const { colors, setColors, resetColors } = useInterfaceSettings();
  const selected = uiThemes.find(theme => colorFields.every(field => theme.colors[field.key] === colors[field.key]));
  return <section aria-labelledby="ui-colors-heading" className="space-y-5 rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-5 sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 id="ui-colors-heading" className="flex items-center gap-3 text-lg font-bold"><Palette className="h-7 w-7 text-cyan-300" />UI colors</h2>
      <Button onClick={resetColors} variant="outline" className="rounded-xl border-indigo-300 bg-blue-950 text-white"><RotateCcw className="mr-2 h-4 w-4" />Reset colors</Button>
    </div>
    <p className="text-sm leading-6 text-blue-100">Choose a theme or build your own palette. Text contrast adjusts automatically. Wallpaper, game covers, and emulator video keep their original colors.</p>
    <div role="group" aria-label="Preset color themes" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {uiThemes.map(theme => <button key={theme.name} type="button" aria-pressed={selected?.name === theme.name} onClick={() => setColors(theme.colors)} className="theme-preset rounded-xl border-2 border-indigo-400 bg-blue-950 p-4 text-left">
        <span className="mb-3 flex gap-2" aria-hidden="true">{colorFields.map(field => <span key={field.key} className="h-7 w-7 rounded-full border border-white/40" style={{ backgroundColor: theme.colors[field.key] }} />)}</span>
        <span className="flex items-center justify-between gap-2 text-sm font-bold">{theme.name}{selected?.name === theme.name && <Check className="h-4 w-4 shrink-0" />}</span>
      </button>)}
    </div>
    <p role="status" className="text-xs text-blue-200">Active palette: {selected?.name ?? "Custom colors"}</p>
    <div className="grid gap-4 md:grid-cols-3">
      {colorFields.map(field => <div key={field.key} className="rounded-xl border border-indigo-400 p-4">
        <Label htmlFor={`ui-${field.key}`} className="font-bold">{field.label}</Label>
        <p className="mt-2 text-xs leading-5 text-blue-100">{field.description}</p>
        <div className="mt-3 flex items-center gap-3"><input id={`ui-${field.key}`} type="color" value={colors[field.key]} onChange={event => setColors({ ...colors, [field.key]: event.target.value })} className="ui-color-picker h-12 w-16 cursor-pointer rounded-lg border-2 border-indigo-300 bg-transparent p-1" /><output htmlFor={`ui-${field.key}`} className="font-mono text-sm">{colors[field.key].toUpperCase()}</output></div>
      </div>)}
    </div>
  </section>;
}
