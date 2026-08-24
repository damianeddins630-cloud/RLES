import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TIER_CONFIGS,
  DEFAULT_TIER_SALARY,
  DEFAULT_TIERS,
} from "../data/defaultTiers";
import type {
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

function mergeTierConfigs(
  tiers: LeagueTier[],
  tierConfigs: TierSalaryConfig[]
): TierSalaryConfig[] {
  return tiers.map((tier) => {
    const existing = tierConfigs.find((c) => c.tierId === tier.id);
    if (existing) return existing;
    return {
      tierId: tier.id,
      ...DEFAULT_TIER_SALARY,
    };
  });
}

function normalizeAdminData(parsed: Partial<LeagueAdminData>): LeagueAdminData {
  const tiers = (parsed.tiers ?? DEFAULT_TIERS).map((t) => ({
    ...t,
    logoUrl: t.logoUrl ?? null,
  }));
  const tierConfigs = mergeTierConfigs(tiers, parsed.tierConfigs ?? DEFAULT_TIER_CONFIGS);

  return {
    tiers,
    tierConfigs,
    teams: parsed.teams ?? [],
    members: parsed.members ?? [],
    players: parsed.players ?? [],
  };
}

function defaultAdminData(): LeagueAdminData {
  return {
    tiers: [...DEFAULT_TIERS],
    tierConfigs: [...DEFAULT_TIER_CONFIGS],
    teams: [],
    members: [],
    players: [],
  };
}

export function readLeagueAdmin(leagueId: string): LeagueAdminData {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${leagueId}`);
    if (!raw) return defaultAdminData();
    const parsed = JSON.parse(raw) as Partial<LeagueAdminData>;
    return normalizeAdminData(parsed);
  } catch {
    return defaultAdminData();
  }
}

export const LEAGUE_ADMIN_UPDATED_EVENT = "lms:league-admin-updated";

export function useLeagueAdmin(leagueId: string) {
  const [data, setData] = useState<LeagueAdminData>(() => readLeagueAdmin(leagueId));
  const [saved, setSaved] = useState(false);

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
    },
    []
  );

  const save = useCallback(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(data));
    setSaved(true);
    window.dispatchEvent(
      new CustomEvent(LEAGUE_ADMIN_UPDATED_EVENT, { detail: { leagueId } })
    );
  }, [leagueId, data]);

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
        data.tiers.length === 0
          ? 0
          : Math.max(...data.tiers.map((t) => t.order)) + 1;

      const tier: LeagueTier = {
        id,
        name: trimmed,
        order,
        logoUrl: null,
      };

      persist({
        ...data,
        tiers: [...data.tiers, tier],
        tierConfigs: [
          ...data.tierConfigs,
          { tierId: id, ...DEFAULT_TIER_SALARY },
        ],
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
        players: data.players.map((p) =>
          p.tierId === tierId ? { ...p, tierId: fallback.id } : p
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
        players: data.players.filter((p) => p.teamId !== teamId),
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

  const addMember = useCallback(
    (displayName: string, tierId: string) => {
      const member: LeagueMember = {
        id: createId(),
        displayName: displayName.trim(),
        tierId,
        teamId: null,
        trackerUrl: "",
        salary: 0,
      };
      persist({ ...data, members: [...data.members, member] });
    },
    [data, persist]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      persist({
        ...data,
        members: data.members.filter((m) => m.id !== memberId),
        players: data.players.filter((p) => p.memberId !== memberId),
      });
    },
    [data, persist]
  );

  const updateMember = useCallback(
    (memberId: string, patch: Partial<LeagueMember>) => {
      const members = data.members.map((m) =>
        m.id === memberId ? { ...m, ...patch } : m
      );
      const updated = members.find((m) => m.id === memberId);
      let players = data.players;
      if (updated) {
        players = data.players.map((p) =>
          p.memberId === memberId
            ? {
                ...p,
                tierId: updated.tierId,
                trackerUrl: updated.trackerUrl,
                salary: updated.salary,
                teamId: updated.teamId ?? p.teamId,
              }
            : p
        );
        if (!updated.teamId) {
          players = players.filter((p) => p.memberId !== memberId);
        } else if (!data.players.some((p) => p.memberId === memberId)) {
          players = [
            ...players,
            {
              id: createId(),
              memberId,
              teamId: updated.teamId!,
              tierId: updated.tierId,
              trackerUrl: updated.trackerUrl,
              salary: updated.salary,
            },
          ];
        }
      }
      persist({ ...data, members, players });
    },
    [data, persist]
  );

  const addPlayer = useCallback(
    (memberId: string, teamId: string) => {
      const member = data.members.find((m) => m.id === memberId);
      if (!member) return;
      updateMember(memberId, { teamId });
    },
    [data.members, updateMember]
  );

  const removePlayer = useCallback(
    (playerId: string) => {
      const player = data.players.find((p) => p.id === playerId);
      if (!player) return;
      persist({
        ...data,
        players: data.players.filter((p) => p.id !== playerId),
        members: data.members.map((m) =>
          m.id === player.memberId ? { ...m, teamId: null } : m
        ),
      });
    },
    [data, persist]
  );

  const getTeamSalaryTotal = useCallback(
    (teamId: string) =>
      data.players
        .filter((p) => p.teamId === teamId)
        .reduce((sum, p) => sum + p.salary, 0),
    [data.players]
  );

  const getTierConfig = useCallback(
    (tierId: string) => data.tierConfigs.find((c) => c.tierId === tierId),
    [data.tierConfigs]
  );

  return {
    data,
    saved,
    save,
    updateTierConfig,
    addTier,
    removeTier,
    updateTier,
    addTeam,
    removeTeam,
    updateTeam,
    addMember,
    removeMember,
    updateMember,
    addPlayer,
    removePlayer,
    getTeamSalaryTotal,
    getTierConfig,
  };
}
