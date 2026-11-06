export interface GamePlayStats {
  totalMinutes: number;
  lastPlayed: string | null;
  sessionCount: number;
}
export interface PlayStatsSnapshot {
  games: Record<string, GamePlayStats>;
  totalMinutes: number;
  sessionCount: number;
  saveFolder: string;
}
export interface CompletedPlaySession {
  id: string;
  minutes: number;
  playedAt: string;
}
export const emptyPlayStats: GamePlayStats = { totalMinutes: 0, lastPlayed: null, sessionCount: 0 };
export function formatPlaytime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours.toLocaleString()}h ${remainder}m` : `${remainder}m`;
}
