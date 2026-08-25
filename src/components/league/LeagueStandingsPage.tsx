import { useState } from "react";
import { useLeagueStandings } from "../../hooks/useLeagueStandings";
import type { StatKey } from "../../types/standings";
import { PlayerStatsTable } from "./standings/PlayerStatsTable";
import { StatLeaderboardsGrid } from "./standings/StatLeaderboardsGrid";
import { TeamStandingsTable } from "./standings/TeamStandingsTable";

type StandingsView = "overview" | "teams" | "leaderboards" | "players";

const VIEWS: { id: StandingsView; label: string }[] = [
  { id: "overview", label: "Overall" },
  { id: "teams", label: "Teams" },
  { id: "leaderboards", label: "Stat leaderboards" },
  { id: "players", label: "All player stats" },
];

interface LeagueStandingsPageProps {
  leagueId: string;
}

export function LeagueStandingsPage({ leagueId }: LeagueStandingsPageProps) {
  const [view, setView] = useState<StandingsView>("overview");
  const [activeStat, setActiveStat] = useState<StatKey>("goals");
  const { data, loading, error, refresh } = useLeagueStandings(leagueId);

  if (loading) {
    return (
      <div className="standings-page glass-panel">
        <div className="standings-loading">
          <div className="loading-spinner" aria-label="Loading standings" />
          <p>Loading standings…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="standings-page glass-panel">
        <p className="league-admin-warn" role="alert">{error ?? "No data"}</p>
        <button type="button" className="league-admin-add-btn" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  const conferences = data.conferences.length > 0 ? data.conferences : ["Overall"];
  const teamsByConference = new Map<string, typeof data.teams>();

  for (const team of data.teams) {
    const conf = team.conference ?? "Overall";
    const list = teamsByConference.get(conf) ?? [];
    list.push(team);
    teamsByConference.set(conf, list);
  }

  const topOverall = data.players.slice(0, 10);

  return (
    <div className="standings-page glass-panel">
      <header className="standings-header">
        <div>
          <h1 className="league-settings-title">Standings</h1>
          <p className="league-settings-subtitle">
            Team records, stat leaderboards, and full player statistics for{" "}
            {data.leagueName || "this league"}.
          </p>
        </div>
        <button type="button" className="league-admin-add-btn" onClick={refresh}>
          Refresh
        </button>
      </header>

      <nav className="standings-view-nav" aria-label="Standings views">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`league-admin-nav-btn${view === v.id ? " league-admin-nav-btn--active" : ""}`}
            aria-current={view === v.id ? "page" : undefined}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className="standings-body">
        {view === "overview" && (
          <div className="standings-overview">
            <section aria-labelledby="overall-teams-heading">
              <h2 id="overall-teams-heading" className="standings-section-title">
                Team standings (overall)
              </h2>
              <TeamStandingsTable teams={data.teams} />
            </section>

            <section aria-labelledby="overall-players-heading">
              <h2 id="overall-players-heading" className="standings-section-title">
                Overall player rankings
              </h2>
              <p className="league-settings-hint">
                Ranked by goals, then assists, then score — same as Discord{" "}
                <code className="league-admin-code">/player-standings</code>.
              </p>
              {topOverall.length === 0 ? (
                <p className="league-admin-empty">No players ranked yet.</p>
              ) : (
                <ol className="standings-leaderboard-list glass-panel standings-overview-list">
                  {topOverall.map((p) => (
                    <li key={p.id} className="standings-leaderboard-item">
                      <span className="standings-rank">{p.overallRank}</span>
                      <div className="standings-leaderboard-body">
                        <strong>{p.displayName}</strong>
                        <span className="league-admin-row-meta">
                          {p.goals}G · {p.assists}A · {p.saves}SV · {p.matchesPlayed} GP
                        </span>
                      </div>
                      <span className="standings-leaderboard-value">{p.goals}G</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section aria-labelledby="quick-leaders-heading">
              <h2 id="quick-leaders-heading" className="standings-section-title">
                Category leaders (top 3)
              </h2>
              <StatLeaderboardsGrid
                leaderboards={data.leaderboards}
                activeStat={activeStat}
                onStatChange={setActiveStat}
                variant="compact"
              />
            </section>
          </div>
        )}

        {view === "teams" && (
          <div className="standings-teams-view">
            {conferences.map((conf) => (
              <section key={conf} aria-labelledby={`conf-${conf}`}>
                <h2 id={`conf-${conf}`} className="standings-section-title">
                  {conf === "Overall" ? "All teams" : conf}
                </h2>
                <TeamStandingsTable
                  teams={teamsByConference.get(conf) ?? []}
                  title={undefined}
                />
              </section>
            ))}
          </div>
        )}

        {view === "leaderboards" && (
          <StatLeaderboardsGrid
            leaderboards={data.leaderboards}
            activeStat={activeStat}
            onStatChange={setActiveStat}
          />
        )}

        {view === "players" && (
          <PlayerStatsTable players={data.players} />
        )}
      </div>
    </div>
  );
}
