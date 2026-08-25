import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FRANCHISE_ROLES } from "../data/defaultFranchiseRoles";
import {
  DEFAULT_TIER_CONFIGS,
  DEFAULT_TIER_SALARY,
  DEFAULT_TIERS,
} from "../data/defaultTiers";
import type {
  FranchiseRole,
  LeagueAdminData,
  LeagueMember,
  LeagueTeam,
  LeagueTier,
  TierSalaryConfig,
} from "../types/leagueAdmin";

const STORAGE_PREFIX = "lms-league-admin:";

function createId(): string {
  return crypto.randomUUID();
}

function slugFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "tier";
}

function uniqueTierId(name: string, existingIds: string[]): string {
  const base = slugFromName(name);
  if (!existingIds.includes(base)) return base;
  return `${base}-${createId().slice(0, 6)}`;
}

function uniqueRoleId(name: string, existingIds: string[]): string {
  const base = slugFromName(name);
  if (!existingIds.includes(base)) return base;
  return `${base}-${createId().slice(0, 6)}`;
}

function mergeTierConfigs(
  tiers: LeagueTier[],
  tierConfigs: TierSalaryConfig[]
): TierSalaryConfig[] {
  return tiers.map((tier) => {
    const existing = tierConfigs.find((c) => c.tierId === tier.id);
    if (existing) return existing;
    return { tierId: tier.id, ...DEFAULT_TIER_SALARY };
  });
}

function migrateLegacyPlayers(
  members: LeagueMember[],
  players?: Array<{
    memberId: string;
    teamId: string;
    tierId: string;
    trackerUrl: string;
    salary: number;
  }>
): LeagueMember[] {
  if (!players?.length) return members;

  const byId = new Map(members.map((m) => [m.id, { ...m }]));

  for (const player of players) {
    const existing = byId.get(player.memberId);
    if (existing) {
      byId.set(player.memberId, {
        ...existing,
        teamId: existing.teamId ?? player.teamId,
        tierId: player.tierId ?? existing.tierId,
        trackerUrl: existing.trackerUrl || player.trackerUrl,
        salary: existing.salary || player.salary,
      });
    }
  }

  return Array.from(byId.values());
}

function normalizeAdminData(parsed: Partial<LeagueAdminData> & { players?: unknown[] }): LeagueAdminData {
  const tiers = (parsed.tiers ?? DEFAULT_TIERS).map((t) => ({
    ...t,
    logoUrl: t.logoUrl ?? null,
  }));
  const tierConfigs = mergeTierConfigs(tiers, parsed.tierConfigs ?? DEFAULT_TIER_CONFIGS);
  const franchiseRoles = (parsed.franchiseRoles ?? DEFAULT_FRANCHISE_ROLES).map((r) => ({
    ...r,
  }));

  const defaultTierId = tiers[0]?.id ?? "premier";
  const defaultRoleId = franchiseRoles[0]?.id ?? "player";

  let members = migrateLegacyPlayers(
    parsed.members ?? [],
    parsed.players as Array<{
      memberId: string;
      teamId: string;
      tierId: string;
      trackerUrl: string;
      salary: number;
    }>
  ).map((m) => ({
    ...m,
    franchiseRoleId: m.franchiseRoleId ?? defaultRoleId,
    teamId: m.teamId ?? null,
    trackerUrl: m.trackerUrl ?? "",
    salary: m.salary ?? 0,
    tierId: m.tierId ?? defaultTierId,
  }));

  return {
    tiers,
    tierConfigs,
    franchiseRoles,
    teams: parsed.teams ?? [],
    members,
  };
}

function defaultAdminData(): LeagueAdminData {
  return normalizeAdminData({});
}

export function readLeagueAdmin(leagueId: string): LeagueAdminData {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${leagueId}`);
    if (!raw) return defaultAdminData();
    const parsed = JSON.parse(raw) as Partial<LeagueAdminData> & { players?: unknown[] };
    return normalizeAdminData(parsed);
  } catch {
    return defaultAdminData();
  }
}

export const LEAGUE_ADMIN_UPDATED_EVENT = "lms:league-admin-updated";

export function useLeagueAdmin(leagueId: string) {
  const [data, setData] = useState<LeagueAdminData>(() => readLeagueAdmin(leagueId));
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setData(readLeagueAdmin(leagueId));
    setSaved(false);
  }, [leagueId]);

  useEffect(() => {
    function onUpdated(event: Event) {
      const detail = (event as CustomEvent<{ leagueId: string }>).detail;
      if (detail?.leagueId === leagueId) {
        setData(readLeagueAdmin(leagueId));
      }
    }

    window.addEventListener(LEAGUE_ADMIN_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(LEAGUE_ADMIN_UPDATED_EVENT, onUpdated);
  }, [leagueId]);

  const persist = useCallback(
    (next: LeagueAdminData) => {
      setData(next);
      setSaved(false);
      setSaveError(null);
      localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(next));
    },
    [leagueId]
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(
        `/api/leagues/admin?leagueId=${encodeURIComponent(leagueId)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Could not load admin data");
      const body = (await res.json()) as {
        admin: LeagueAdminData | null;
        persisted: boolean;
      };
      if (body.admin) {
        const normalized = normalizeAdminData(body.admin);
        setData(normalized);
        localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(normalized));
        setPersisted(body.persisted);
      } else {
        const local = readLeagueAdmin(leagueId);
        setData(local);
        setPersisted(false);
      }
      setSaved(false);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to load");
      setData(readLeagueAdmin(leagueId));
      setPersisted(false);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [leagueId]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(data));

    try {
      const res = await fetch(
        `/api/leagues/admin?leagueId=${encodeURIComponent(leagueId)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Failed to save admin data");
      }

      const body = (await res.json()) as {
        admin: LeagueAdminData;
        persisted: boolean;
      };
      const normalized = normalizeAdminData(body.admin);
      setData(normalized);
      localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(normalized));
      setPersisted(body.persisted);
      setSaved(true);
      window.dispatchEvent(
        new CustomEvent(LEAGUE_ADMIN_UPDATED_EVENT, { detail: { leagueId } })
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }, [leagueId, data]);

  const refreshRegistrations = useCallback(async () => {
    await loadAdmin();
  }, [loadAdmin]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const updateTierConfig = useCallback(
    (tierId: string, patch: Partial<TierSalaryConfig>) => {
      persist({
        ...data,
        tierConfigs: data.tierConfigs.map((c) =>
          c.tierId === tierId ? { ...c, ...patch } : c
        ),
      });
    },
    [data, persist]
  );

  const addTier = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const id = uniqueTierId(trimmed, data.tiers.map((t) => t.id));
      const order =
        data.tiers.length === 0 ? 0 : Math.max(...data.tiers.map((t) => t.order)) + 1;

      persist({
        ...data,
        tiers: [...data.tiers, { id, name: trimmed, order, logoUrl: null }],
        tierConfigs: [...data.tierConfigs, { tierId: id, ...DEFAULT_TIER_SALARY }],
      });
    },
    [data, persist]
  );

  const removeTier = useCallback(
    (tierId: string) => {
      if (data.tiers.length <= 1) return;
      const fallback = data.tiers.find((t) => t.id !== tierId);
      if (!fallback) return;

      persist({
        ...data,
        tiers: data.tiers.filter((t) => t.id !== tierId),
        tierConfigs: data.tierConfigs.filter((c) => c.tierId !== tierId),
        teams: data.teams.map((t) =>
          t.tierId === tierId ? { ...t, tierId: fallback.id } : t
        ),
        members: data.members.map((m) =>
          m.tierId === tierId ? { ...m, tierId: fallback.id } : m
        ),
      });
    },
    [data, persist]
  );

  const updateTier = useCallback(
    (tierId: string, patch: Partial<LeagueTier>) => {
      persist({
        ...data,
        tiers: data.tiers.map((t) => (t.id === tierId ? { ...t, ...patch } : t)),
      });
    },
    [data, persist]
  );

  const addFranchiseRole = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const id = uniqueRoleId(trimmed, data.franchiseRoles.map((r) => r.id));
      const order =
        data.franchiseRoles.length === 0
          ? 0
          : Math.max(...data.franchiseRoles.map((r) => r.order)) + 1;
      persist({
        ...data,
        franchiseRoles: [...data.franchiseRoles, { id, name: trimmed, order }],
      });
    },
    [data, persist]
  );

  const removeFranchiseRole = useCallback(
    (roleId: string) => {
      if (data.franchiseRoles.length <= 1) return;
      const fallback = data.franchiseRoles.find((r) => r.id !== roleId);
      if (!fallback) return;

      persist({
        ...data,
        franchiseRoles: data.franchiseRoles.filter((r) => r.id !== roleId),
        members: data.members.map((m) =>
          m.franchiseRoleId === roleId
            ? { ...m, franchiseRoleId: fallback.id }
            : m
        ),
      });
    },
    [data, persist]
  );

  const updateFranchiseRole = useCallback(
    (roleId: string, patch: Partial<FranchiseRole>) => {
      persist({
        ...data,
        franchiseRoles: data.franchiseRoles.map((r) =>
          r.id === roleId ? { ...r, ...patch } : r
        ),
      });
    },
    [data, persist]
  );

  const addTeam = useCallback(
    (name: string, shortLabel: string, tierId: string) => {
      const team: LeagueTeam = {
        id: createId(),
        name: name.trim(),
        shortLabel: shortLabel.trim().toUpperCase().slice(0, 6),
        tierId,
        logoUrl: null,
      };
      persist({ ...data, teams: [...data.teams, team] });
    },
    [data, persist]
  );

  const removeTeam = useCallback(
    (teamId: string) => {
      persist({
        ...data,
        teams: data.teams.filter((t) => t.id !== teamId),
        members: data.members.map((m) =>
          m.teamId === teamId ? { ...m, teamId: null } : m
        ),
      });
    },
    [data, persist]
  );

  const updateTeam = useCallback(
    (teamId: string, patch: Partial<LeagueTeam>) => {
      persist({
        ...data,
        teams: data.teams.map((t) => (t.id === teamId ? { ...t, ...patch } : t)),
      });
    },
    [data, persist]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      persist({
        ...data,
        members: data.members.filter((m) => m.id !== memberId),
      });
    },
    [data, persist]
  );

  const updateMember = useCallback(
    (memberId: string, patch: Partial<LeagueMember>) => {
      persist({
        ...data,
        members: data.members.map((m) =>
          m.id === memberId ? { ...m, ...patch } : m
        ),
      });
    },
    [data, persist]
  );

  const getTeamSalaryTotal = useCallback(
    (teamId: string) =>
      data.members
        .filter((m) => m.teamId === teamId)
        .reduce((sum, m) => sum + m.salary, 0),
    [data.members]
  );

  const getTierConfig = useCallback(
    (tierId: string) => data.tierConfigs.find((c) => c.tierId === tierId),
    [data.tierConfigs]
  );

  return {
    data,
    saved,
    saving,
    saveError,
    persisted,
    loading,
    syncing,
    syncError,
    save,
    refreshRegistrations,
    reloadAdmin: loadAdmin,
    updateTierConfig,
    addTier,
    removeTier,
    updateTier,
    addFranchiseRole,
    removeFranchiseRole,
    updateFranchiseRole,
    addTeam,
    removeTeam,
    updateTeam,
    removeMember,
    updateMember,
    getTeamSalaryTotal,
    getTierConfig,
  };
}
