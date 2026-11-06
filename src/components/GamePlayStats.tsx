import { CalendarDays, Clock3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emptyPlayStats, formatPlaytime, type GamePlayStats as PlayStats } from "@/types/play-stats";

export function GamePlayStats({ name, stats = emptyPlayStats, loading, unavailable, onLog }: { name: string; stats?: PlayStats; loading: boolean; unavailable: boolean; onLog: () => void }) {
  const pending = loading ? "Loading…" : unavailable ? "Unavailable" : null;
  return <section aria-label={`Play statistics for ${name}`} className="mt-4 space-y-3 rounded-xl border-2 border-indigo-400 bg-indigo-950 p-3">
    <dl className="space-y-3">
      <div><dt className="flex items-center gap-2 text-xs text-blue-100"><Clock3 className="h-4 w-4 shrink-0" />Total Playtime</dt><dd className="mt-1 font-mono text-lg font-bold tabular-nums text-cyan-200">{pending || formatPlaytime(stats.totalMinutes)}</dd></div>
      <div><dt className="flex items-center gap-2 text-xs text-blue-100"><CalendarDays className="h-4 w-4 shrink-0" />Last Played Date</dt><dd title={stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleString() : undefined} className="mt-1 text-xs font-bold text-yellow-200">{pending || (stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Never played")}</dd></div>
    </dl>
    <Button onClick={onLog} disabled={loading} variant="outline" className="h-auto min-h-9 w-full rounded-lg border-indigo-300 bg-blue-950 py-2 text-xs text-white"><Plus className="mr-2 h-4 w-4" />Log play session</Button>
  </section>;
}
