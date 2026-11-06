import { useRef, useState, type CSSProperties } from "react";
import { Gamepad2, ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameCard } from "./GameCard";
import type { LibraryGame } from "@/types/game";
import type { GamePlayStats } from "@/types/play-stats";
import "@/game-box-art.css";

type GridProps = Omit<Parameters<typeof GameCard>[0], "game" | "stats"> & {
  games: LibraryGame[];
  stats: Record<string, GamePlayStats>;
};

function BoxArtTile({ game, onSelect }: { game: LibraryGame; onSelect: (button: HTMLButtonElement) => void }) {
  const artwork = game.artwork;
  const [failedSource, setFailedSource] = useState<string>();
  const showArtwork = artwork && artwork !== failedSource;
  return <article role="listitem" className="min-w-0">
    <button type="button" onClick={event => onSelect(event.currentTarget)} aria-haspopup="dialog" aria-label={`View details for ${game.name}`} className="game-box-tile w-full rounded-2xl border-2 p-2 text-left" style={{ "--game-color": game.color } as CSSProperties}>
      <div className="game-box-face relative aspect-[3/4] overflow-hidden rounded-xl border">
        {showArtwork ? <img src={artwork} alt={`${game.name} box art`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" onError={() => setFailedSource(artwork)} /> : <div className="game-box-fallback absolute inset-0 flex flex-col items-center justify-between gap-2 p-2 text-center sm:p-4">
          <span className="w-full truncate border-b pb-2 text-[.6rem] font-bold uppercase tracking-widest" title={game.system}>{game.system}</span>
          <Gamepad2 aria-hidden="true" className="h-8 w-8 shrink-0 sm:h-14 sm:w-14" strokeWidth={1.25} />
          <span className="flex items-center justify-center gap-1 text-[.6rem]"><ImagePlus aria-hidden="true" className="h-3 w-3 shrink-0" />{artwork ? "Cover unavailable" : "Add box art"}</span>
        </div>}
      </div>
      <div className="px-1 pb-1 pt-3">
        <h4 className="line-clamp-2 min-h-[2.5em] text-sm font-bold leading-snug" title={game.name}>{game.name}</h4>
        <span className="mt-1 block truncate text-[.65rem] opacity-90">{game.system}</span>
      </div>
    </button>
  </article>;
}

export function GameBoxArtGrid({ games, stats, onEdit, onCover, onRemove, onLog, ...cardProps }: GridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const selected = games.find(game => game.id === selectedId);
  return <>
    <div role="list" aria-label="Game box art" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-5">
      {games.map(game => <BoxArtTile key={game.id} game={game} onSelect={button => { returnFocus.current = button; setSelectedId(game.id); }} />)}
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null); }}>
      {selected && <DialogContent className="retro-dialog max-h-[85dvh] max-w-md overflow-y-auto rounded-3xl p-4 sm:p-6" onCloseAutoFocus={event => {
        event.preventDefault();
        if (!document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]') && returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
      }}>
        <DialogHeader className="pr-5"><DialogTitle className="break-words text-xl leading-snug">{selected.name}</DialogTitle><DialogDescription>Manage artwork, edit game details, or log a play session. Game files stay local and are opened separately in your emulator.</DialogDescription></DialogHeader>
        <div role="list" aria-label="Selected game details">
          <GameCard {...cardProps} game={selected} stats={stats[selected.directoryKey]}
            onEdit={game => { setSelectedId(null); onEdit(game); }}
            onCover={game => { setSelectedId(null); onCover(game); }}
            onRemove={id => { setSelectedId(null); onRemove(id); }}
            onLog={game => { setSelectedId(null); onLog(game); }} />
        </div>
      </DialogContent>}
    </Dialog>
  </>;
}
