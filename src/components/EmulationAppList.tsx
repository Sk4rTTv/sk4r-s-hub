import { EmulationApp, SYSTEMS } from "../types/emulation";
import { EmulationAppCard } from "./EmulationAppCard";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface EmulationAppListProps {
  apps: EmulationApp[];
  onEdit: (app: EmulationApp) => void;
  onDelete: (id: string) => void;
  onPlay: (app: EmulationApp) => void;
  onToggleFavorite: (app: EmulationApp) => void;
}

export const EmulationAppList = ({
  apps,
  onEdit,
  onDelete,
  onPlay,
  onToggleFavorite,
}: EmulationAppListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "system" | "lastPlayed" | "playtime">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredApps = useMemo(() => {
    let result = [...apps];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.system.toLowerCase().includes(query)
      );
    }

    if (selectedSystem !== "all") {
      result = result.filter((app) => app.system === selectedSystem);
    }

    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "system":
          aVal = a.system.toLowerCase();
          bVal = b.system.toLowerCase();
          break;
        case "lastPlayed":
          aVal = a.lastPlayed || "";
          bVal = b.lastPlayed || "";
          break;
        case "playtime":
          aVal = a.playtimeHours || 0;
          bVal = b.playtimeHours || 0;
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [apps, searchQuery, selectedSystem, sortBy, sortOrder]);

  const systemsWithApps = useMemo(() => {
    const systems = new Set(apps.map((app) => app.system));
    return Array.from(systems).sort();
  }, [apps]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return <ChevronDown className="h-4 w-4 text-white" />;
    return (
      <ChevronDown
        className={`h-4 w-4 transition-transform ${
          sortOrder === "asc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  return (
      <div className="w-full">
        <div className="retro-toolbar mb-8 flex flex-col gap-3 rounded-2xl p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
            <Input
                          type="text"
                          placeholder="Search games..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400 focus:ring-blue-400/30"
                        />
          </div>
  
          <div className="flex flex-wrap items-center gap-3 relative">
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/30">
                <SelectValue placeholder="All Systems" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-gray-900 border-gray-700 text-white">
                <SelectItem value="all" className="rounded-lg text-white focus:bg-blue-700 focus:text-white">All Systems</SelectItem>
                {systemsWithApps.map((system) => (
                  <SelectItem key={system} value={system} className="rounded-lg text-white focus:bg-blue-700 focus:text-white">
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            <div className="retro-sort flex flex-wrap items-center gap-1 rounded-xl border p-1">
              {(["name", "system", "lastPlayed", "playtime"] as const).map((column) => (
                <Button
                  key={column}
                  variant="ghost"
                  size="sm"
                  aria-pressed={sortBy === column}
                  onClick={() => handleSortChange(column)}
                  className="text-white hover:text-white h-8 px-3 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-1 text-xs font-medium">
                    {column === "name" && "Name"}
                    {column === "system" && "System"}
                    {column === "lastPlayed" && "Last Played"}
                    {column === "playtime" && "Playtime"}
                    {getSortIcon(column)}
                  </span>
                </Button>
              ))}
            </div>
  
            {(searchQuery || selectedSystem !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSystem("all");
                }}
                className="text-white hover:text-white h-8 px-3 rounded-lg"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

      {filteredApps.length === 0 ? (
        <div className="retro-hud rounded-2xl bg-[var(--retro-blue)] py-16 text-center">
          <div className="mb-4 text-6xl">⭐</div>
          <h3 className="mb-2 text-xl font-bold text-white">No adventures found</h3>
          <p className="text-white">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-7"
          role="list"
          aria-label="Emulation apps"
        >
          {filteredApps.map((app) => (
            <EmulationAppCard
              key={app.id}
              app={app}
              onEdit={onEdit}
              onDelete={onDelete}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      <div className="retro-hud mt-8 text-center text-[8px] leading-5 text-white sm:text-[10px]">
        Showing {filteredApps.length} of {apps.length} games
      </div>
    </div>
  );
};