import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LEAGUE_SETTINGS,
  type LeagueSettings,
} from "../types/leagueSettings";

const STORAGE_PREFIX = "lms-league-settings:";

export function readLeagueSettings(leagueId: string): LeagueSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${leagueId}`);
    if (!raw) return { ...DEFAULT_LEAGUE_SETTINGS };
    return { ...DEFAULT_LEAGUE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_LEAGUE_SETTINGS };
  }
}

export const LEAGUE_SETTINGS_UPDATED_EVENT = "lms:league-settings-updated";

function cacheSettings(leagueId: string, settings: LeagueSettings) {
  localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(settings));
}

export function useLeagueSettings(leagueId: string, initialName?: string) {
  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const stored = readLeagueSettings(leagueId);
    if (initialName && stored.name === DEFAULT_LEAGUE_SETTINGS.name) {
      return { ...stored, name: initialName };
    }
    return stored;
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leagues/settings?leagueId=${encodeURIComponent(leagueId)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const body = (await res.json()) as {
          settings: LeagueSettings | null;
          persisted: boolean;
        };
        if (body.settings) {
          setSettings(body.settings);
          cacheSettings(leagueId, body.settings);
          setPersisted(body.persisted);
        } else {
          const local = readLeagueSettings(leagueId);
          setSettings(local);
          setPersisted(false);
        }
      }
    } catch {
      setSettings(readLeagueSettings(leagueId));
      setPersisted(false);
    } finally {
      setLoading(false);
      setSaved(false);
    }
  }, [leagueId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    function onSettingsUpdated(event: Event) {
      const detail = (event as CustomEvent<{ leagueId: string }>).detail;
      if (detail?.leagueId === leagueId) {
        setSettings(readLeagueSettings(leagueId));
      }
    }

    window.addEventListener(LEAGUE_SETTINGS_UPDATED_EVENT, onSettingsUpdated);
    return () =>
      window.removeEventListener(LEAGUE_SETTINGS_UPDATED_EVENT, onSettingsUpdated);
  }, [leagueId]);

  const updateSettings = useCallback((patch: Partial<LeagueSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaved(false);
    setSaveError(null);
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    cacheSettings(leagueId, settings);

    try {
      const res = await fetch(
        `/api/leagues/settings?leagueId=${encodeURIComponent(leagueId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }
      );

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Failed to save settings");
      }

      const body = (await res.json()) as {
        settings: LeagueSettings;
        persisted: boolean;
      };
      setSettings(body.settings);
      cacheSettings(leagueId, body.settings);
      setPersisted(body.persisted);
      setSaved(true);
      window.dispatchEvent(
        new CustomEvent(LEAGUE_SETTINGS_UPDATED_EVENT, { detail: { leagueId } })
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }, [leagueId, settings]);

  return {
    settings,
    saved,
    saving,
    saveError,
    persisted,
    loading,
    updateSettings,
    saveSettings,
    reloadSettings: loadSettings,
  };
}
