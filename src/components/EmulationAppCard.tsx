import { EmulationApp } from "@/types/emulation";
import { Star, MoreHorizontal, ExternalLink, Pencil, Trash2, ImagePlus, File, Play } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CartridgeDisplay } from "./CartridgeDisplay";
import { MetadataDetails } from "./MetadataDetails";

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
  <article role="listitem" className="collection-card relative flex min-w-0 flex-col rounded-2xl border-2 border-indigo-500 bg-blue-950 p-3 text-white">
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 break-words text-xs font-bold uppercase tracking-wide text-cyan-200">{app.system}</p>
      {app.status === "favorite" && <Star aria-label="Favorite" className="h-5 w-5 shrink-0 fill-[var(--retro-gold)] text-yellow-300" />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${app.name}`} className="h-8 w-8 shrink-0 rounded-lg bg-indigo-900 text-white hover:bg-blue-100 hover:text-blue-950"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="retro-menu w-60 rounded-xl">
          {app.url && <DropdownMenuItem onClick={() => onOpen(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><ExternalLink className="h-4 w-4" />Open app link</DropdownMenuItem>}
          <DropdownMenuItem onClick={() => onArtwork(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><ImagePlus className="h-4 w-4" />{app.artwork ? "Change cartridge image" : "Add cartridge image"}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleFavorite(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><Star className="h-4 w-4" />{app.status === "favorite" ? "Remove Favorite" : "Add Favorite"}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(app)} className="gap-2 rounded-lg focus:bg-blue-100 focus:text-blue-950"><Pencil className="h-4 w-4" />Edit app</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(app.id)} className="gap-2 rounded-lg text-red-700 focus:bg-red-100 focus:text-red-800"><Trash2 className="h-4 w-4" />Remove app</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <CartridgeDisplay app={app} />
    <div className="mt-4 flex flex-1 flex-col gap-3 border-t border-indigo-600 pt-4">
      <h3 className="pixel-font break-words text-xs leading-6 text-yellow-100">{app.name}</h3>
      {(app.nativeExecutable || app.appFile) && <p className="flex items-center gap-1 text-xs text-blue-100" title={app.nativeExecutable?.fileName ?? app.appFile?.name}><File className="h-3 w-3 shrink-0" /><span className="truncate">{app.nativeExecutable?.fileName ?? app.appFile?.name}</span></p>}
      <MetadataDetails metadata={app.metadata} directoryKey={app.directoryKey} title={app.name} system={app.system} />
      <div className="mt-auto flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-1 text-xs font-bold ${app.status === "not-installed" ? "border-orange-300 bg-orange-100 text-orange-900" : app.status === "favorite" ? "border-yellow-400 bg-yellow-100 text-yellow-900" : "border-green-300 bg-green-100 text-green-900"}`}>{app.status === "not-installed" ? "Not installed" : app.status === "favorite" ? "Favorite" : "Installed"}</span></div>
      <Button disabled={launchingAppId !== null || (!window.emuDesktop && !app.url)} aria-label={`Open ${app.name}`} onClick={() => window.emuDesktop ? onLaunch(app) : onOpen(app)} className="retro-button h-auto min-h-10 rounded-lg px-2 py-2">
        <Play className="mr-2 h-4 w-4" />{launchingAppId === app.id ? "Opening…" : window.emuDesktop ? "Launch app" : app.url ? "Open app" : "Launch app"}
      </Button>
      {!window.emuDesktop && !app.url && <p className="text-xs leading-5 text-blue-100">Native launching requires EmuHub for Windows.</p>}
      {window.emuDesktop && !app.nativeExecutable && <p className="text-xs leading-5 text-blue-100">Choose its installed .exe when launching for the first time.</p>}
      <Button variant="outline" size="sm" onClick={() => onArtwork(app)} className="h-auto min-h-8 rounded-lg border-indigo-400 bg-indigo-900 py-2 text-xs text-white"><ImagePlus className="mr-1 h-3 w-3" />{app.artwork ? "Change image" : "Add image"}</Button>
      {window.emuDesktop && app.url && <Button variant="outline" size="sm" onClick={() => onOpen(app)} className="h-auto min-h-8 rounded-lg border-indigo-400 bg-indigo-900 py-2 text-xs text-white"><ExternalLink className="mr-2 h-3 w-3" />Open link</Button>}
    </div>
  </article>
);
