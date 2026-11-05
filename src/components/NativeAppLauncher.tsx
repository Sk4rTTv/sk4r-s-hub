import { useState } from "react";
import { FolderOpen, Play, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NativeExecutable } from "@/types/desktop";

export const NativeAppLauncher = ({ executable }: { executable?: NativeExecutable }) => {
  const [target, setTarget] = useState(executable);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const desktop = window.emuDesktop;
  const choose = async () => {
    if (!desktop || busy) return;
    setBusy(true); setError(""); setMessage("");
    try { const picked = await desktop.selectExecutable(); if (picked) setTarget(picked); }
    catch { setError("Could not select an app. Choose Dolphin.exe from its installed folder."); }
    finally { setBusy(false); }
  };
  const launch = async () => {
    if (!desktop || !target || busy) return;
    setBusy(true); setError(""); setMessage("");
    try { const result = await desktop.launchExecutable(target.id); if (result.launched) setMessage(`${target.name} was started in its own Windows window. Use Project app window below to mirror it here.`); }
    catch { setError("Could not launch this app. Select its installed .exe again and check that its required files are present."); }
    finally { setBusy(false); }
  };
  return <section className="rounded-2xl border-2 border-yellow-400 bg-blue-950 p-5">
    <h2 className="pixel-font mb-4 flex items-center gap-3 text-[10px] leading-6 text-yellow-300"><Monitor className="h-5 w-5" />NATIVE EMULATOR LAUNCHER</h2>
    {desktop ? <>
      <p className="mb-4 text-sm leading-6 text-blue-100">Select an installed Windows emulator, such as Dolphin.exe. Launching opens the actual app in its own window.</p>
      <div className="flex flex-wrap items-center gap-3"><Button disabled={busy} onClick={choose} variant="outline" className="rounded-xl border-indigo-300 bg-blue-900 text-white hover:bg-blue-800 hover:text-white"><FolderOpen className="mr-2 h-4 w-4" />{target ? "Change executable" : "Choose Dolphin / emulator"}</Button><Button disabled={busy || !target} onClick={launch} className="retro-button rounded-xl"><Play className="mr-2 h-4 w-4" />{busy ? "Please wait…" : "Launch emulator"}</Button></div>
      {target && <p className="mt-4 break-all text-sm text-blue-100">Selected: <strong>{target.fileName}</strong></p>}
      <p className="mt-3 text-xs leading-5 text-blue-200">Only launch apps you trust. Windows asks for confirmation. EmuHub does not bundle Dolphin, install apps, or run APK files directly.</p>
    </> : <p className="text-sm leading-6 text-blue-100">Native launching is available in the <strong>Windows desktop version</strong> of EmuHub. This website preview cannot start Dolphin.exe. Screen sharing below can mirror an emulator you have opened yourself.</p>}
    {message && <p role="status" className="mt-4 rounded-xl border border-green-400 bg-green-950 p-3 text-sm text-green-100">{message}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-400 bg-red-950 p-3 text-sm text-red-100">{error}</p>}
  </section>;
};
