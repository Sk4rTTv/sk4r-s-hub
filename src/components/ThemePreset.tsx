import { Check, Gamepad2 } from "lucide-react";
import { Portal } from "@radix-ui/react-hover-card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { readableText, readableAccent, type UiColors } from "@/lib/ui-colors";

export function ThemePreset({ theme, selected, onSelect }: { theme: { name: string; colors: UiColors }; selected: boolean; onSelect: () => void }) {
  const foreground = readableText(theme.colors.panel);
  const highlight = readableAccent(theme.colors);
  return <HoverCard openDelay={150} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button type="button" aria-pressed={selected} onClick={onSelect} className="theme-preset rounded-xl border-2 border-indigo-400 bg-blue-950 p-4 text-left">
        <span className="mb-3 flex gap-2" aria-hidden="true">{Object.values(theme.colors).map(color => <span key={color} className="h-7 w-7 rounded-full border border-white/40" style={{ backgroundColor: color }} />)}</span>
        <span className="flex items-center justify-between gap-2 text-sm font-bold">{theme.name}{selected && <Check className="h-4 w-4 shrink-0" />}</span>
      </button>
    </HoverCardTrigger>
    <Portal>
      <HoverCardContent side="bottom" align="center" sideOffset={10} collisionPadding={16} className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-slate-300 bg-white p-3 text-slate-900 shadow-xl motion-reduce:animate-none">
        <p className="mb-2 text-sm font-bold">{theme.name}</p>
        <div aria-label={`${theme.name} panel and button color preview`} className="space-y-3 rounded-xl p-3" style={{ backgroundColor: theme.colors.background }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: theme.colors.panel, color: foreground }}><Gamepad2 className="h-5 w-5" style={{ color: highlight }} />EmuHub<span className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.accent }} /></div>
          <div className="space-y-3 rounded-lg border p-3" style={{ backgroundColor: theme.colors.panel, color: foreground, borderColor: `${foreground}55` }}>
            <p className="text-xs font-bold">Your library</p>
            <div className="flex gap-2" aria-hidden="true"><span className="h-8 flex-1 rounded-md border" style={{ borderColor: `${foreground}55` }} /><span className="h-8 flex-1 rounded-md border" style={{ borderColor: `${foreground}55` }} /><span className="h-8 flex-1 rounded-md border" style={{ borderColor: `${foreground}55` }} /></div>
            <div className="flex gap-2 text-[11px] font-bold"><span className="rounded-lg border px-3 py-2" style={{ backgroundColor: theme.colors.accent, color: readableText(theme.colors.accent), borderColor: readableText(theme.colors.accent) }}>Add game</span><span className="rounded-lg border px-3 py-2" style={{ borderColor: `${foreground}55` }}>Settings</span></div>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-700">Preview only · click the theme to apply.</p>
      </HoverCardContent>
    </Portal>
  </HoverCard>;
}
