import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TotalHoursGamified({ minutes, sessions, loading, error, onRetry }: { minutes: number; sessions: number; loading: boolean; error: string; onRetry: () => void }) {
  return <section aria-label="Total playtime progression" className="mx-auto mt-6 w-full max-w-lg rounded-2xl border-2 border-indigo-400 bg-indigo-950 p-4 text-left sm:p-5">
    <div className="flex items-center gap-4"><span className="rounded-xl border border-indigo-400 bg-blue-950 p-3"><Trophy className="h-8 w-8 text-yellow-300" aria-hidden="true" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-blue-100">Total Hours Gamified</h2><p role="status" className="mt-1 font-mono text-2xl font-bold tabular-nums text-cyan-200">{loading ? "Loading…" : error ? "Stats unavailable" : `${(minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 2 })} hours`}</p><p className="mt-1 text-xs leading-5 text-blue-200">{sessions.toLocaleString()} completed {sessions === 1 ? "session" : "sessions"} · across all logged games</p></div></div>
    {error ? <div className="mt-3 space-y-2"><p role="alert" className="text-xs leading-5 text-blue-100">{error}</p><Button type="button" onClick={onRetry} variant="outline" className="rounded-xl bg-blue-950 text-white"><RefreshCw className="mr-2 h-4 w-4" />Retry loading stats</Button></div> : <p className="mt-3 text-xs text-blue-200">{window.emuDesktop ? "Auto-saved locally in the app’s saves folder." : "Web preview stats are session-only. Desktop saves persist beside the app."}</p>}
  </section>;
}
