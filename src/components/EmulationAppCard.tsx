import { EmulationApp } from "@/types/emulation";
import { Star, MoreHorizontal, ExternalLink, Pencil, Trash2, ImagePlus, File, Play } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EmulationAppCardProps {
  app: EmulationApp;
  onEdit: (app: EmulationApp) => void;
  onArtwork: (app: EmulationApp) => void;
  onDelete: (id: string) => void;
  onOpen: (app: EmulationApp) => void;
  onLaunch: (app: EmulationApp) => void;
  launchingAppId: string | null;
  onToggleFavorite: (app: EmulationApp) => void;
}

export const EmulationAppCard = ({ app, onEdit, onArtwork, onDelete, onOpen, onLaunch, launchingAppId, onToggleFavorite }: EmulationAppCardProps) => (
  <article className="cartridge group relative flex min-w-0 flex-col rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${app.color} 14%, #a5a9bc)` }}>
    <div aria-hidden="true" className="cartridge-grip mx-auto mb-3 mt-1 h-4 w-2/3 rounded-sm" />
    <div className="cartridge-label cartridge-art relative flex h-32 items-center justify-center overflow-hidden rounded-t-lg bg-slate-100 sm:h-36">
      {app.artwork ? <img src={app.artwork} alt={`${app.name} app logo`} className="absolute inset-0 h-full w-full object-contain p-2" /> : <span className="text-6xl" aria-label="App icon">{app.icon}</span>}
      {app.status === "favorite" && <Star aria-label="Favorite" className="absolute left-2 top-2 h-5 w-5 fill-[var(--retro-gold)] text-amber-800" />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${app.name}`} className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-white text-[var(--retro-ink)] hover:bg-blue-100 hover:text-[var(--retro-ink)]"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="retro-menu w-60 rounded-xl">
          {app.url && <DropdownMenuItem onClick={() => onOpen(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><ExternalLink className="h-4 w-4" />Open app link</DropdownMenuItem>}
          <DropdownMenuItem onClick={() => onArtwork(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><ImagePlus className="h-4 w-4" />{app.artwork ? "Change cartridge image" : "Add cartridge image"}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleFavorite(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><Star className="h-4 w-4" />{app.status === "favorite" ? "Remove Favorite" : "Add Favorite"}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><Pencil className="h-4 w-4" />Edit app</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(app.id)} className="gap-2 rounded-lg text-red-700 focus:bg-red-100 focus:text-red-800"><Trash2 className="h-4 w-4" />Remove app</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="cartridge-label flex flex-1 flex-col gap-2 rounded-b-lg bg-[var(--retro-paper)] p-3 text-[var(--retro-ink)] sm:p-4">
      <p className="pixel-font break-words text-[8px] uppercase leading-4 text-[var(--retro-wood)]">{app.system}</p>
      <h3 className="pixel-font min-h-10 break-words text-[9px] leading-5 sm:text-[10px]">{app.name}</h3>
      {(app.nativeExecutable || app.appFile) && <p className="flex items-center gap-1 text-[10px]" title={app.nativeExecutable?.fileName ?? app.appFile?.name}><File className="h-3 w-3 shrink-0" /><span className="truncate">{app.nativeExecutable?.fileName ?? app.appFile?.name}</span></p>}
      <div className="mt-auto flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${app.status === "not-installed" ? "border-orange-300 bg-orange-100 text-orange-900" : app.status === "favorite" ? "border-yellow-400 bg-yellow-100 text-yellow-900" : "border-green-300 bg-green-100 text-green-900"}`}>{app.status === "not-installed" ? "Not installed" : app.status === "favorite" ? "Favorite" : "Installed"}</span></div>
      <Button disabled={launchingAppId !== null || (!window.emuDesktop && !app.url)} aria-label={`Open ${app.name}`} onClick={() => window.emuDesktop ? onLaunch(app) : onOpen(app)} className="retro-button mt-3 h-10 rounded-lg px-2">
        <Play className="mr-2 h-4 w-4" />{launchingAppId === app.id ? "Opening…" : window.emuDesktop ? "Launch app" : app.url ? "Open app" : "Launch app"}
      </Button>
      {!window.emuDesktop && !app.url && <p className="text-[10px] leading-4">Native launching requires EmuHub for Windows.</p>}
      {window.emuDesktop && !app.nativeExecutable && <p className="text-[10px] leading-4">Choose its installed .exe when launching for the first time.</p>}
      <Button variant="outline" size="sm" onClick={() => onArtwork(app)} className="mt-2 h-8 rounded-lg border-slate-500 bg-white text-[10px] text-slate-900 hover:bg-blue-100 hover:text-slate-900"><ImagePlus className="mr-1 h-3 w-3" />{app.artwork ? "Change image" : "Add image"}</Button>
      {window.emuDesktop && app.url && <Button variant="outline" size="sm" onClick={() => onOpen(app)} className="mt-2 h-8 rounded-lg border-slate-500 bg-white text-xs text-slate-900 hover:bg-blue-100 hover:text-slate-900"><ExternalLink className="mr-2 h-3 w-3" />Open link</Button>}
    </div>
    <div aria-hidden="true" className="cartridge-connector mx-auto mt-4 h-4 w-2/3 rounded-t-sm" />
  </article>
);
