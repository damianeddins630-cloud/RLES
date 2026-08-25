import type { LeaderboardRow, StatKey } from "../../../types/standings";
import { STAT_CATEGORIES } from "../../../types/standings";
import { RankCell } from "./standingsUtils";

interface StatLeaderboardsGridProps {
  leaderboards: Record<StatKey, LeaderboardRow[]>;
  activeStat: StatKey;
  onStatChange: (stat: StatKey) => void;
  variant?: "full" | "compact";
}

export function StatLeaderboardsGrid({
  leaderboards,
  activeStat,
  onStatChange,
  variant = "full",
}: StatLeaderboardsGridProps) {
  const active = STAT_CATEGORIES.find((s) => s.key === activeStat);
  const rows = leaderboards[activeStat] ?? [];
  const topRows = rows.filter((r) => r.value > 0 || r.matchesPlayed > 0).slice(0, 15);

  return (
    <div className="standings-leaderboards">
      {variant === "full" && (
        <>
          <nav className="standings-stat-nav" aria-label="Stat categories">
            {STAT_CATEGORIES.map((stat) => (
              <button
                key={stat.key}
                type="button"
                className={`standings-stat-btn${activeStat === stat.key ? " standings-stat-btn--active" : ""}`}
                onClick={() => onStatChange(stat.key)}
              >
                {stat.label}
              </button>
            ))}
          </nav>

          <div className="standings-block glass-panel">
            <h3 className="standings-block-title">
              {active?.label ?? "Leaderboard"} leaders
            </h3>

            {topRows.length === 0 ? (
              <p className="league-admin-empty">No stat data yet for this category.</p>
            ) : (
              <ol className="standings-leaderboard-list">
                {topRows.map((row) => (
                  <li key={row.playerId} className="standings-leaderboard-item">
                    <RankCell rank={row.rank} />
                    <div className="standings-leaderboard-body">
                      <strong>{row.displayName}</strong>
                      <span className="league-admin-row-meta">
                        {row.value} {active?.short} · {row.matchesPlayed} GP
                      </span>
                    </div>
                    <span className="standings-leaderboard-value">{row.value}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}

      <div className="standings-leaderboard-cards">
        {STAT_CATEGORIES.map((stat) => {
          const statRows = (leaderboards[stat.key] ?? [])
            .filter((r) => r.value > 0)
            .slice(0, 3);
          if (statRows.length === 0) return null;

          return (
            <div key={stat.key} className="standings-mini-card glass-panel">
              <h4 className="standings-mini-title">{stat.label}</h4>
              <ul className="standings-mini-list">
                {statRows.map((row) => (
                  <li key={row.playerId}>
                    <RankCell rank={row.rank} />
                    <span>{row.displayName}</span>
                    <strong>{row.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
