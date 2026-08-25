import { useMemo, useState } from "react";
import type { PlayerStatRow, StatKey } from "../../../types/standings";
import { STAT_CATEGORIES } from "../../../types/standings";
import { RankCell } from "./standingsUtils";

type SortKey =
  | StatKey
  | "displayName"
  | "overallRank"
  | "goalsPerMatch"
  | "assistsPerMatch"
  | "savesPerMatch"
  | "shotsPerMatch"
  | "demosPerMatch"
  | "scorePerMatch";

interface PlayerStatsTableProps {
  players: PlayerStatRow[];
}

function getSortValue(player: PlayerStatRow, key: SortKey): string | number {
  return player[key as keyof PlayerStatRow] as string | number;
}

export function PlayerStatsTable({ players }: PlayerStatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("overallRank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const list = [...players];
    list.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      const an = Number(av);
      const bn = Number(bv);
      return sortDir === "asc" ? an - bn : bn - an;
    });
    return list;
  }, [players, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "displayName" ? "asc" : "desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  if (players.length === 0) {
    return (
      <p className="league-admin-empty">
        No player stats yet. Register players and report matches on Discord.
      </p>
    );
  }

  return (
    <div className="standings-block glass-panel">
      <h3 className="standings-block-title">Full player statistics</h3>
      <p className="league-settings-hint standings-table-hint">
        Click column headers to sort. Per-match averages shown for rate stats.
      </p>
      <div className="standings-table-wrap standings-table-wrap--wide">
        <table className="standings-table standings-table--stats">
          <thead>
            <tr>
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("overallRank")}>
                  Rank{sortIndicator("overallRank")}
                </button>
              </th>
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("displayName")}>
                  Player{sortIndicator("displayName")}
                </button>
              </th>
              {STAT_CATEGORIES.map((s) => (
                <th key={s.key}>
                  <button
                    type="button"
                    className="standings-th-btn"
                    onClick={() => toggleSort(s.key)}
                  >
                    {s.short}{sortIndicator(s.key)}
                  </button>
                </th>
              ))}
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("goalsPerMatch")}>
                  G/GP{sortIndicator("goalsPerMatch")}
                </button>
              </th>
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("assistsPerMatch")}>
                  A/GP{sortIndicator("assistsPerMatch")}
                </button>
              </th>
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("savesPerMatch")}>
                  SV/GP{sortIndicator("savesPerMatch")}
                </button>
              </th>
              <th>
                <button type="button" className="standings-th-btn" onClick={() => toggleSort("scorePerMatch")}>
                  PTS/GP{sortIndicator("scorePerMatch")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td><RankCell rank={p.overallRank} /></td>
                <td className="standings-player-name">{p.displayName}</td>
                <td className="standings-num">{p.goals}</td>
                <td className="standings-num">{p.assists}</td>
                <td className="standings-num">{p.saves}</td>
                <td className="standings-num">{p.shots}</td>
                <td className="standings-num">{p.demos}</td>
                <td className="standings-num">{p.score}</td>
                <td className="standings-num">{p.matchesPlayed}</td>
                <td className="standings-num">{p.goalsPerMatch.toFixed(2)}</td>
                <td className="standings-num">{p.assistsPerMatch.toFixed(2)}</td>
                <td className="standings-num">{p.savesPerMatch.toFixed(2)}</td>
                <td className="standings-num">{p.scorePerMatch.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
