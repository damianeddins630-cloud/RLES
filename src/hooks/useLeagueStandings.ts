import { useCallback, useEffect, useState } from "react";
import type { LeagueStandingsData } from "../types/standings";

export function useLeagueStandings(leagueId: string) {
  const [data, setData] = useState<LeagueStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/leagues/standings?leagueId=${encodeURIComponent(leagueId)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Could not load standings");
      const body = (await res.json()) as LeagueStandingsData;
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load standings");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
