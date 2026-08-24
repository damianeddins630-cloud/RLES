import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LEAGUE_SETTINGS,
  type LeagueSettings,
} from "../types/leagueSettings";

const STORAGE_PREFIX = "lms-league-settings:";

function readSettings(leagueId: string): LeagueSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${leagueId}`);
    if (!raw) return { ...DEFAULT_LEAGUE_SETTINGS };
    return { ...DEFAULT_LEAGUE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_LEAGUE_SETTINGS };
  }
}

export function useLeagueSettings(leagueId: string, initialName?: string) {
  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const stored = readSettings(leagueId);
    if (initialName && stored.name === DEFAULT_LEAGUE_SETTINGS.name) {
      return { ...stored, name: initialName };
    }
    return stored;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(readSettings(leagueId));
    setSaved(false);
  }, [leagueId]);

  const updateSettings = useCallback((patch: Partial<LeagueSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  const saveSettings = useCallback(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(settings));
    setSaved(true);
  }, [leagueId, settings]);

  return { settings, updateSettings, saveSettings, saved };
}
