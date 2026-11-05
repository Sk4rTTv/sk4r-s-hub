import { useMemo, useState } from "react";
import { Search, Gamepad2, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameCard } from "./GameCard";
import type { LibraryGame } from "@/types/game";

export function GamesLibrary({ games, onImport, onEdit, onRemove }: { games: LibraryGame[]; onImport: () => void; onEdit: (game: LibraryGame) => void; onRemove: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [console, setConsole] = useState("all");
  const consoles = useMemo(() => Array.from(new Set(games.map(game => game.system))).sort(), [games]);
  const groups = useMemo(() => {
    const byConsole = new Map<string, LibraryGame[]>();
    games.filter(game => (console === "all" || game.system === console) && `${game.name} ${game.fileName} ${game.system}`.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)).forEach(game => {
        const shelf = byConsole.get(game.system) ?? [];
        shelf.push(game); byConsole.set(game.system, shelf);
      });
    return Array.from(byConsole.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [games, console, search]);
  const visibleCount = groups.reduce((sum, [, entries]) => sum + entries.length, 0);

  return <div className="space-y-7">
    <div className="retro-toolbar flex flex-wrap items-center gap-3 rounded-2xl p-4">
      <div className="relative min-w-0 flex-1 basis-64"><Search className="absolute left-3 top-3 h-5 w-5 text-blue-100" /><Input aria-label="Search games" placeholder="Search games or consoles…" value={search} onChange={event => setSearch(event.target.value)} className="rounded-xl pl-10" /></div>
      <Select value={console} onValueChange={setConsole}><SelectTrigger aria-label="Filter games by console" className="w-full rounded-xl sm:w-52"><SelectValue /></SelectTrigger><SelectContent className="retro-menu rounded-xl"><SelectItem value="all">All consoles</SelectItem>{consoles.map(entry => <SelectItem key={entry} value={entry}>{entry}</SelectItem>)}</SelectContent></Select>
      {(search || console !== "all") && <Button variant="outline" className="rounded-xl border-indigo-300 bg-blue-950 text-white" onClick={() => { setSearch(""); setConsole("all"); }}><X className="mr-2 h-4 w-4" />Clear</Button>}
    </div>
    <p className="text-xs leading-5 text-blue-200">Your games are sorted into console shelves. This is a local organizer; open game files in your emulator to play. Removing a cartridge does not delete its file.</p>
    {groups.map(([system, entries]) => <section key={system} aria-label={`${system} games`} className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-indigo-500 bg-indigo-950 px-5 py-4"><h3 className="retro-hud flex items-center gap-3 text-xs text-yellow-200"><Gamepad2 className="h-6 w-6 shrink-0 text-cyan-300" />{system}</h3><span className="rounded-lg bg-blue-950 px-3 py-1 font-mono text-sm text-cyan-200">{entries.length} {entries.length === 1 ? "game" : "games"}</span></header>
      <div role="list" aria-label={`${system} game cartridges`} className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-7 xl:grid-cols-4">{entries.map(game => <GameCard key={game.id} game={game} onEdit={onEdit} onRemove={onRemove} />)}</div>
    </section>)}
    {!groups.length && <div className="rounded-2xl border-2 border-indigo-400 bg-indigo-950 px-5 py-12 text-center"><Gamepad2 className="mx-auto mb-5 h-16 w-16 text-yellow-300" /><h3 className="retro-hud mb-4 text-xs text-yellow-100">{games.length ? "No matching games" : "Build your game collection"}</h3><p className="mx-auto mb-6 max-w-md text-sm leading-6 text-blue-100">{games.length ? "Clear your filters or try another title." : "Import a directory of game files, choose their consoles, and give each cartridge its own artwork."}</p>{!games.length && <Button onClick={onImport} className="retro-button rounded-xl"><FolderOpen className="mr-2 h-5 w-5" />Add Games Directory</Button>}</div>}
    <p role="status" className="text-center text-xs text-blue-100">Showing {visibleCount} of {games.length} games · {consoles.length} {consoles.length === 1 ? "console" : "consoles"}</p>
  </div>;
}
