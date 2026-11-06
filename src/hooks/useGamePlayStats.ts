import { useCallback, useEffect, useState } from "react";
import type { LibraryGame } from "@/types/game";
import { emptyPlayStats, type CompletedPlaySession, type GamePlayStats, type PlayStatsSnapshot } from "@/types/play-stats";

export function useGamePlayStats(games: LibraryGame[]) {
  const [stats, setStats] = useState<Record<string, GamePlayStats>>({});
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [saveFolder, setSaveFolder] = useState("");
  const [loading, setLoading] = useState(!!window.emuDesktop);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const ids = [...new Set(games.filter(game => game.directoryKey.startsWith("desktop:")).map(game => game.directoryKey.slice(8)))].sort().join(",");
  const applySnapshot = useCallback((snapshot: PlayStatsSnapshot) => {
    setStats(current => ({ ...current, ...Object.fromEntries(Object.entries(snapshot.games).map(([id, value]) => [`desktop:${id}`, value])) }));
    setTotalMinutes(snapshot.totalMinutes); setSessionCount(snapshot.sessionCount); setSaveFolder(snapshot.saveFolder);
  }, []);
  useEffect(() => {
    const desktop = window.emuDesktop;
    if (!desktop) return;
    let active = true;
    setLoading(true); setError("");
    void desktop.readPlayStats(ids ? ids.split(",") : []).then(snapshot => { if (active) applySnapshot(snapshot); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Could not load saved playtime."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ids, revision, applySnapshot]);
  const logSession = async (game: LibraryGame, session: CompletedPlaySession) => {
    if (window.emuDesktop) {
      if (!game.directoryKey.startsWith("desktop:")) throw new Error("Import this game using the desktop directory picker before logging playtime.");
      const snapshot = await window.emuDesktop.logPlaySession(game.directoryKey.slice(8), session);
      applySnapshot(snapshot); setError("");
    } else {
      setStats(current => {
        const previous = current[game.directoryKey] || emptyPlayStats;
        return { ...current, [game.directoryKey]: { totalMinutes: previous.totalMinutes + session.minutes, sessionCount: previous.sessionCount + 1, lastPlayed: previous.lastPlayed && Date.parse(previous.lastPlayed) > Date.parse(session.playedAt) ? previous.lastPlayed : session.playedAt } };
      });
      setTotalMinutes(current => current + session.minutes); setSessionCount(current => current + 1);
    }
  };
  return { stats, totalMinutes, sessionCount, saveFolder, loading, error, logSession, reload: () => setRevision(current => current + 1) };
}
