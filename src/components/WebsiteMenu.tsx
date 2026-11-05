import { ChevronDown, ExternalLink, Gamepad2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

export function WebsiteMenu() {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="h-10 rounded-xl border-2 border-blue-200 bg-blue-900 text-white hover:bg-blue-800 hover:text-white">
        <Globe className="mr-2 h-4 w-4" />Websites<ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} aria-label="Emulation websites" className="max-h-[min(32rem,var(--radix-dropdown-menu-content-available-height))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border-2 border-indigo-300 bg-indigo-950 p-2 text-white shadow-xl">
      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-cyan-200">Game archive & manuals</DropdownMenuLabel>
      <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-3 focus:bg-blue-800 focus:text-white">
        <a href="https://vimm.net/" target="_blank" rel="noopener noreferrer">
          <Globe className="mr-3 h-5 w-5 shrink-0 text-yellow-300" />
          <span className="min-w-0 flex-1"><span className="block font-semibold">Vimm’s Lair</span><span className="mt-1 block text-xs leading-5 text-blue-100">Multi-console · retro game archive</span></span>
          <ExternalLink className="ml-2 h-4 w-4 shrink-0 text-cyan-200" />
          <span className="sr-only">Opens externally</span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="my-2 bg-indigo-500" />
      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-cyan-200">Official emulator websites</DropdownMenuLabel>
      {websites.map(website => <DropdownMenuItem key={website.name} asChild className="cursor-pointer rounded-xl p-3 focus:bg-blue-800 focus:text-white">
        <a href={website.url} target="_blank" rel="noopener noreferrer">
          <Gamepad2 className="mr-3 h-5 w-5 shrink-0 text-yellow-300" />
          <span className="min-w-0 flex-1"><span className="block font-semibold">{website.name}</span><span className="mt-1 block text-xs leading-5 text-blue-100">{website.consoles}</span></span>
          <ExternalLink className="ml-2 h-4 w-4 shrink-0 text-cyan-200" />
          <span className="sr-only">Opens externally</span>
        </a>
      </DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>;
}
