import { EmulationApp } from "../types/emulation";
import { Star, MoreHorizontal, Play, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EmulationAppCardProps {
  app: EmulationApp;
  onEdit: (app: EmulationApp) => void;
  onDelete: (id: string) => void;
  onPlay: (app: EmulationApp) => void;
  onToggleFavorite: (app: EmulationApp) => void;
}

export const EmulationAppCard = ({ app, onEdit, onDelete, onPlay, onToggleFavorite }: EmulationAppCardProps) => (
  <article className="cartridge group relative flex min-w-0 flex-col rounded-xl" style={{ backgroundColor: app.color }}>
    <div aria-hidden="true" className="cartridge-grip mx-auto mb-3 mt-1 h-4 w-2/3 rounded-sm" />
    <div className="cartridge-label relative flex h-32 items-center justify-center overflow-hidden rounded-t-lg bg-[var(--retro-cream)] sm:h-36">
      {app.artwork ? <img src={app.artwork} alt={`${app.name} cartridge artwork`} className="absolute inset-0 h-full w-full object-cover" /> : <>
        <div aria-hidden="true" className="absolute -left-8 -top-8 h-32 w-32 rotate-12 rounded-3xl opacity-20" style={{ backgroundColor: app.color }} />
        <div aria-hidden="true" className="absolute -bottom-12 -right-8 h-32 w-32 rotate-45 rounded-3xl opacity-20" style={{ backgroundColor: app.color }} />
        <span className="retro-game-icon relative text-6xl transition-transform duration-200 motion-safe:group-hover:scale-110">{app.icon}</span>
      </>}
      {app.status === "favorite" && <Star aria-label="Favorite" className="absolute left-3 top-3 h-6 w-6 fill-[var(--retro-gold)] text-amber-800" />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${app.name}`} className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-white text-[var(--retro-ink)] hover:bg-amber-100 hover:text-[var(--retro-ink)]"><MoreHorizontal className="h-5 w-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="retro-menu w-52 rounded-xl">
          <DropdownMenuItem onClick={() => onPlay(app)} className="gap-2 rounded-lg focus:bg-amber-100 focus:text-amber-950"><Play className="h-4 w-4" />Play</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleFavorite(app)} className="gap-2 rounded-lg focus:bg-amber-100 focus:text-amber-950"><Star className="h-4 w-4" />{app.status === "favorite" ? "Remove Favorite" : "Add Favorite"}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(app)} className="gap-2 rounded-lg focus:bg-amber-100 focus:text-amber-950"><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(app.id)} className="gap-2 rounded-lg text-red-700 focus:bg-red-100 focus:text-red-800"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="cartridge-label flex flex-1 flex-col gap-2 rounded-b-lg bg-[var(--retro-paper)] p-3 text-[var(--retro-ink)] sm:p-4">
      <p className="pixel-font text-[8px] uppercase leading-4 text-[var(--retro-wood)]">{app.system}</p>
      <h3 className="pixel-font min-h-10 break-words text-[9px] leading-5 sm:text-[10px]">{app.name}</h3>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${app.status === "not-installed" ? "border-orange-300 bg-orange-100 text-orange-900" : app.status === "favorite" ? "border-yellow-400 bg-yellow-100 text-yellow-900" : "border-green-300 bg-green-100 text-green-900"}`}>{app.status === "not-installed" ? "Not installed" : app.status === "favorite" ? "Favorite" : "Installed"}</span>
        {app.playtimeHours !== undefined && <span className="text-xs font-bold">{app.playtimeHours}h</span>}
      </div>
      {app.lastPlayed && <p className="text-[10px] text-[var(--retro-wood)]">Last played: {app.lastPlayed}</p>}
    </div>
    <div aria-hidden="true" className="cartridge-connector mx-auto mt-4 h-4 w-2/3 rounded-t-sm" />
  </article>
);
