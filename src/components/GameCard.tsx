import { File, Pencil, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartridgeDisplay } from "./CartridgeDisplay";
import { MetadataDetails } from "./MetadataDetails";
import type { LibraryGame } from "@/types/game";

export function GameCard({ game, onEdit, onCover, onRemove }: { game: LibraryGame; onEdit: (game: LibraryGame) => void; onCover: (game: LibraryGame) => void; onRemove: (id: string) => void }) {
  return <article role="listitem" className="collection-card relative flex min-w-0 flex-col rounded-2xl border-2 border-indigo-500 bg-blue-950 p-3 text-white">
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-cyan-200">{game.system}</p><span className="rounded-md border border-indigo-400 bg-indigo-900 px-2 py-1 font-mono text-xs text-blue-100">{game.fileName.split(".").pop()?.toUpperCase()}</span></div>
    <CartridgeDisplay app={game} />
    <div className="mt-4 flex flex-1 flex-col gap-3 border-t border-indigo-600 pt-4">
      <h4 className="pixel-font break-words text-xs leading-6 text-yellow-100">{game.name}</h4>
      <p className="flex min-w-0 items-center gap-2 text-xs text-blue-100" title={game.relativePath}><File className="h-4 w-4 shrink-0" /><span className="truncate">{game.fileName}</span></p>
      <p className="text-xs text-blue-200">Local game file · {game.file ? `${(game.file.size / 1048576).toFixed(1)} MB` : "Directory entry"}</p>
      <MetadataDetails metadata={game.metadata} directoryKey={game.directoryKey} title={game.name} system={game.system} />
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button onClick={() => onCover(game)} aria-label={`Choose cover for ${game.name}`} className="h-auto min-h-9 w-full rounded-lg border border-cyan-300 bg-cyan-800 py-2 text-xs text-white hover:bg-cyan-700"><ImagePlus className="mr-2 h-4 w-4" />Covers</Button>
        <Button onClick={() => onEdit(game)} variant="outline" className="h-auto min-h-9 flex-1 rounded-lg border-indigo-400 bg-indigo-900 py-2 text-xs text-white"><Pencil className="mr-2 h-4 w-4" />Edit game</Button>
        <Button onClick={() => onRemove(game.id)} variant="outline" aria-label={`Remove ${game.name} from library`} className="h-auto min-h-9 rounded-lg border-red-400 bg-blue-950 py-2 text-red-200"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  </article>;
}
