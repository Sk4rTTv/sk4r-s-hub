import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Gamepad2, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/retro.css";

const websites = [
  { name: "Dolphin", consoles: "Nintendo GameCube · Wii", url: "https://dolphin-emu.org/" },
  { name: "Project64", consoles: "Nintendo 64", url: "https://www.pj64-emu.com/" },
  { name: "PCSX2", consoles: "PlayStation 2", url: "https://pcsx2.net/" },
  { name: "xemu", consoles: "Original Xbox", url: "https://xemu.app/" },
  { name: "Xenia", consoles: "Xbox 360", url: "https://xenia.jp/" },
  { name: "Cemu", consoles: "Nintendo Wii U", url: "https://cemu.info/" },
  { name: "SameBoy", consoles: "Game Boy · Game Boy Color", url: "https://sameboy.github.io/" },
  { name: "mGBA", consoles: "Game Boy Advance · Game Boy · Game Boy Color", url: "https://mgba.io/" },
  { name: "PPSSPP", consoles: "PlayStation Portable (PSP)", url: "https://www.ppsspp.org/" },
  { name: "Azahar", consoles: "Nintendo 3DS", url: "https://azahar-emu.org/" },
];

export default function Websites() {
  return <div className="retro-world min-h-screen px-2 py-3 text-white sm:p-6">
    <div className="console-shell mx-auto max-w-6xl overflow-hidden rounded-3xl">
      <header className="console-header flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
        <h1 className="retro-hud flex items-center gap-3 text-xs leading-6"><Globe className="h-7 w-7 text-yellow-300" />Websites</h1>
        <nav aria-label="Websites navigation" className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white"><Link to="/settings"><Settings className="mr-2 h-4 w-4" />UI settings</Link></Button>
          <Button asChild variant="outline" className="rounded-xl bg-blue-950 text-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to title</Link></Button>
        </nav>
      </header>
      <main className="space-y-7 p-4 sm:p-7">
        <section className="retro-toolbar flex flex-wrap items-center gap-5 rounded-2xl p-5 sm:p-7">
          <Globe className="h-16 w-16 shrink-0 text-cyan-300" aria-hidden="true" />
          <div className="min-w-0 flex-1"><p className="retro-hud mb-3 text-xs text-yellow-300">EXPLORE THE EMULATION WORLD</p><h2 className="text-2xl font-bold">Your website directory</h2><p className="mt-3 text-sm leading-6 text-blue-100">Choose a console below to visit its emulator’s official website. Links open in a new tab or your desktop browser, not inside EmuHub.</p></div>
        </section>
        <section aria-labelledby="archive-heading" className="space-y-3">
          <h2 id="archive-heading" className="text-lg font-bold">Game archive & manuals</h2>
          <a href="https://vimm.net/" target="_blank" rel="noopener noreferrer" className="website-link flex flex-wrap items-center gap-4 rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-5">
            <Globe className="h-10 w-10 shrink-0 text-yellow-300" aria-hidden="true" />
            <span className="min-w-0 flex-1"><span className="block text-lg font-bold">Vimm’s Lair</span><span className="mt-1 block text-sm text-blue-100">Multi-console · retro game archive & manuals</span><span className="mt-2 block text-xs text-blue-200">vimm.net</span></span>
            <ExternalLink className="h-5 w-5 text-cyan-200" aria-hidden="true" /><span className="sr-only">Opens externally</span>
          </a>
        </section>
        <section aria-labelledby="emulators-heading" className="space-y-3">
          <h2 id="emulators-heading" className="text-lg font-bold">Official emulator websites</h2>
          <nav aria-label="Emulator website directory" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map(website => <a key={website.name} href={website.url} target="_blank" rel="noopener noreferrer" className="website-link flex flex-col gap-4 rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-5">
              <span className="flex items-center justify-between gap-3"><Gamepad2 className="h-9 w-9 text-yellow-300" aria-hidden="true" /><ExternalLink className="h-5 w-5 text-cyan-200" aria-hidden="true" /></span>
              <span><span className="block text-lg font-bold">{website.name}</span><span className="mt-2 block text-sm leading-6 text-blue-100">{website.consoles}</span></span>
              <span className="mt-auto text-xs text-blue-200">{new URL(website.url).hostname}</span><span className="sr-only">Opens externally</span>
            </a>)}
          </nav>
        </section>
      </main>
    </div>
  </div>;
}
