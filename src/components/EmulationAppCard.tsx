import { EmulationApp } from "../types/emulation";
import { Play, Star, Download, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EmulationAppCardProps {
  app: EmulationApp;
  onEdit: (app: EmulationApp) => void;
  onDelete: (id: string) => void;
  onPlay: (app: EmulationApp) => void;
  onToggleFavorite: (app: EmulationApp) => void;
}

export const EmulationAppCard = ({
  app,
  onEdit,
  onDelete,
  onPlay,
  onToggleFavorite,
}: EmulationAppCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: EmulationApp["status"]) => {
    switch (status) {
      case "installed":
        return "bg-green-500";
      case "not-installed":
        return "bg-orange-500";
      case "favorite":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: EmulationApp["status"]) => {
    switch (status) {
      case "installed":
        return "Installed";
      case "not-installed":
        return "Not Installed";
      case "favorite":
        return "Favorite";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className="group relative w-48 h-48 cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-white/30"
        style={{
          background: `linear-gradient(135deg, ${app.color}22, ${app.color}11)`,
          boxShadow: isHovered
            ? `0 20px 40px -10px ${app.color}40, 0 0 0 1px ${app.color}30`
            : `0 10px 30px -5px ${app.color}20`,
        }}
      >
        <div className="absolute inset-0 rounded-2xl p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110 relative"
              style={{
                background: `linear-gradient(135deg, ${app.color}33, ${app.color}11)`,
                boxShadow: `inset 0 2px 4px ${app.color}20, 0 4px 8px ${app.color}10`,
              }}
            >
              <span>{app.icon}</span>
              {isHovered && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs">🎯</span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onPlay(app)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Play
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleFavorite(app)}
                  className="flex items-center gap-2"
                >
                  <Star
                    className={`h-4 w-4 ${
                      app.status === "favorite" ? "fill-yellow-400" : ""
                    }`}
                  />
                  {app.status === "favorite" ? "Remove from Favorites" : "Add to Favorites"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(app)}
                  className="flex items-center gap-2"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(app.id)}
                  className="flex items-center gap-2 text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-white font-bold text-sm leading-tight truncate pr-2">
              {app.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  getStatusColor(app.status)
                } text-white`}
              >
                {getStatusText(app.status)}
              </span>
              <span className="text-white/60 text-xs font-medium">
                {app.system}
              </span>
            </div>
            {app.lastPlayed && (
              <p className="text-white/50 text-xs mt-1">
                Last played: {app.lastPlayed}
              </p>
            )}
            {app.playtimeHours && (
              <p className="text-white/50 text-xs">
                {app.playtimeHours}h played
              </p>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-2 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, ${app.color}44, ${app.color}88)` }}
        />
      </div>
    </div>
  );
};