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
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(0, 160, 232, 0.15), rgba(0, 160, 232, 0.05))", border: "1px solid rgba(0, 160, 232, 0.2)" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
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
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Systems</SelectItem>
                {systemsWithApps.map((system) => (
                  <SelectItem key={system} value={system}>
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            <div className="flex items-center gap-1 border border-white/10 rounded-xl bg-white/5 p-1">
              {(["name", "system", "lastPlayed", "playtime"] as const).map((column) => (
                <Button
                  key={column}
                  variant="ghost"
                  size="sm"
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
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-white/70 mb-2">No games found</h3>
          <p className="text-white/40">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
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

      <div className="mt-6 text-center text-white/40 text-sm">
        Showing {filteredApps.length} of {apps.length} games
      </div>
    </div>
  );
};