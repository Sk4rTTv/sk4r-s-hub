import { EmulationApp } from "@/types/emulation";
import { EmulationAppCard } from "./EmulationAppCard";
import { Search, ChevronDown, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface EmulationAppListProps {
  apps: EmulationApp[];
  onEdit: (app: EmulationApp) => void;
  onDelete: (id: string) => void;
  onOpen: (app: EmulationApp) => void;
  onToggleFavorite: (app: EmulationApp) => void;
}

export const EmulationAppList = ({ apps, onEdit, onDelete, onOpen, onToggleFavorite }: EmulationAppListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "system">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const systems = useMemo(() => Array.from(new Set(apps.map(app => app.system))).sort(), [apps]);
  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return apps.filter(app => (app.name.toLowerCase().includes(query) || app.system.toLowerCase().includes(query)) && (selectedSystem === "all" || app.system === selectedSystem))
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]) * (sortOrder === "asc" ? 1 : -1));
  }, [apps, searchQuery, selectedSystem, sortBy, sortOrder]);
  const changeSort = (column: typeof sortBy) => {
    if (sortBy === column) setSortOrder(order => order === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("asc"); }
  };

  return <div className="w-full">
    <div className="retro-toolbar mb-8 flex flex-col gap-3 rounded-2xl p-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" /><Input aria-label="Search apps" placeholder="Search your emulator apps…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-white/20 bg-white/10 pl-10 text-white placeholder-white/60 focus:border-blue-400" /></div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedSystem} onValueChange={setSelectedSystem}><SelectTrigger aria-label="Filter supported systems" className="w-[200px] border-white/20 bg-white/10 text-white"><SelectValue placeholder="All Systems" /></SelectTrigger><SelectContent className="rounded-xl border-blue-500 bg-blue-950 text-white"><SelectItem value="all" className="rounded-lg text-white focus:bg-blue-700 focus:text-white">All Systems</SelectItem>{systems.filter(system => system !== "all").map(system => <SelectItem key={system} value={system} className="rounded-lg text-white focus:bg-blue-700 focus:text-white">{system}</SelectItem>)}</SelectContent></Select>
        <div className="retro-sort flex flex-wrap gap-1 rounded-xl border p-1">{(["name", "system"] as const).map(column => <Button key={column} variant="ghost" size="sm" aria-pressed={sortBy === column} onClick={() => changeSort(column)} className="h-8 rounded-lg px-3 text-white hover:text-white"><span className="flex items-center gap-1 text-xs font-medium">{column === "name" ? "App name" : "System"}<ChevronDown className={`h-4 w-4 ${sortBy === column && sortOrder === "asc" ? "rotate-180" : ""}`} /></span></Button>)}</div>
        {(searchQuery || selectedSystem !== "all") && <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setSelectedSystem("all"); }} className="rounded-lg text-white hover:bg-blue-800 hover:text-white"><X className="mr-1 h-4 w-4" />Clear</Button>}
      </div>
    </div>
    {filteredApps.length ? <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4" role="list" aria-label="Emulator apps">{filteredApps.map(app => <EmulationAppCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} onOpen={onOpen} onToggleFavorite={onToggleFavorite} />)}</div> : <div className="rounded-2xl border-2 border-indigo-400 bg-[var(--retro-blue)] px-5 py-12 text-center">
      <Gamepad2 className="mx-auto mb-5 h-16 w-16 text-[var(--retro-gold)]" />
      <h3 className="retro-hud mb-4 text-xs text-white sm:text-sm">{apps.length ? "No apps found" : "Your app collection starts here"}</h3>
      <p className="mx-auto max-w-md text-sm leading-6 text-blue-100">{apps.length ? "Try a different search or clear your filters." : "Use Add App above to add RetroArch, Dolphin, PCSX2, or any of your emulation apps. Each app gets its own cartridge and image."}</p>
    </div>}
    <div className="retro-hud mt-8 text-center text-[8px] leading-5 text-white sm:text-[10px]">Showing {filteredApps.length} of {apps.length} apps</div>
  </div>;
};
