import { useState } from "react";
import { Gamepad2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useController } from "@/contexts/Controller";

export function ControllerSettings() {
  const { connected, native, setShortcut } = useController();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mappings = [["D-pad / left stick", "Move between controls"], ["A / bottom face button", "Select, launch, or edit text"], ["B / right face button", "Close a menu or go back"], ["Y / top face button", "Open Settings"], ["LB / RB", "Previous / next control"], ["Left / right on a slider", "Adjust its value"]];
  return <section className="retro-toolbar space-y-5 rounded-2xl p-5 sm:p-7" aria-labelledby="controller-heading">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="controller-heading" className="flex items-center gap-3 text-lg font-bold"><Gamepad2 className="h-7 w-7 text-cyan-300" />Controller controls</h2><span role="status" className="rounded-lg bg-blue-950 px-3 py-2 text-xs text-blue-100">{connected ? "Controller connected" : "Press a button with EmuHub focused to connect"}</span></div>
    <div className="grid gap-3 sm:grid-cols-2">{mappings.map(([button, description]) => <div key={button} className="rounded-xl border border-indigo-400 bg-blue-950 p-3"><p className="font-bold text-yellow-300">{button}</p><p className="mt-1 text-sm text-blue-100">{description}</p></div>)}</div>
    <p className="text-sm leading-6 text-blue-100">Navigation follows the current dialog or menu and scrolls focused controls into view. Text, password, numeric, date, and color fields open an on-screen keyboard. Native selects use A to edit, D-pad to choose, and A/B to finish. Xbox-style button names refer to their physical positions on other standard-mapped controllers.</p>
    <div className="space-y-3 rounded-xl border-2 border-indigo-400 bg-blue-950 p-4">
      <h3 className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5 text-cyan-300" />Global return to EmuHub</h3>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2"><input type="checkbox" checked={native.shortcutEnabled} disabled={!native.nativeAvailable || busy} onChange={async event => {
        setBusy(true); setError("");
        try { await setShortcut(event.target.checked); } catch { setError("The shortcut setting could not be changed. Try again."); } finally { setBusy(false); }
      }} className="mt-1 h-5 w-5 shrink-0 accent-[var(--ui-accent)]" /><span><span className="block font-bold">Hold Back/Select + Start for 1.5 seconds</span><span className="mt-1 block text-sm text-blue-100">Works outside EmuHub on Windows with an XInput-compatible controller while EmuHub is running. Settings last for this session.</span></span></label>
      <p className="text-sm leading-6 text-blue-100">{native.message}{native.nativeAvailable && !native.connected ? " Waiting for an XInput controller; other controllers can still navigate the foreground UI through the browser API." : ""}</p>
      <p className="flex items-start gap-2 text-sm leading-6 text-yellow-200"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" />Force-close may lose unsaved emulator progress. Only the foreground emulator process launched by EmuHub is targeted (or the last launched one when EmuHub itself is focused). External apps and untracked child launchers are never terminated.</p>
      <p className="text-xs leading-5 text-blue-200">Windows native dialogs: D-pad navigates, A confirms, B cancels, and RB tabs between controls. Controls are restricted to dialogs owned by this EmuHub instance. Browser permission/file dialogs may require a keyboard or mouse; non-XInput controllers do not support the background shortcut. Guide is reserved by Windows on many controllers, so it is not used.</p>
      {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
    </div>
  </section>;
}
