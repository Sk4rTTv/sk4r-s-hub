import { useEffect, useRef, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Play, Monitor, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StartMenu({ onStart }: { onStart: () => void }) {
  const start = useRef<HTMLButtonElement>(null);
  useEffect(() => { start.current?.focus({ preventScroll: true }); }, []);

  const navigate = (event: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a"));
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    event.preventDefault();
    items[next]?.focus({ preventScroll: true });
  };

  return <div className="mx-auto mt-7 w-full max-w-sm">
    <div className="mb-5 flex items-center justify-center gap-3 text-cyan-200" aria-hidden="true"><span className="h-px w-10 bg-cyan-400" /><Gamepad2 className="h-10 w-10" /><span className="h-px w-10 bg-cyan-400" /></div>
    <nav aria-label="Start menu" onKeyDown={navigate} className="start-menu space-y-3 rounded-2xl border-2 border-indigo-300 bg-blue-950/95 p-4 sm:p-5">
      <Button ref={start} onClick={onStart} className="start-menu-option retro-button w-full justify-start rounded-xl px-4 py-4"><ChevronRight className="menu-cursor mr-2 h-4 w-4 shrink-0" /><Play className="mr-3 h-5 w-5 shrink-0" />Start</Button>
      <Button asChild variant="outline" className="start-menu-option w-full justify-start rounded-xl border-2 border-indigo-300 bg-indigo-950 px-4 py-4 text-white"><Link to="/hub"><ChevronRight className="menu-cursor mr-2 h-4 w-4 shrink-0" /><Monitor className="mr-3 h-5 w-5 shrink-0" />Projection Hub</Link></Button>
      <Button asChild variant="outline" className="start-menu-option w-full justify-start rounded-xl border-2 border-indigo-300 bg-indigo-950 px-4 py-4 text-white"><Link to="/settings"><ChevronRight className="menu-cursor mr-2 h-4 w-4 shrink-0" /><Settings className="mr-3 h-5 w-5 shrink-0" />Settings</Link></Button>
    </nav>
    <p className="mt-5 text-xs leading-6 text-blue-100">Choose an option to begin.<br /><span className="text-blue-200">↑ ↓ to select · Enter to open</span></p>
  </div>;
}
