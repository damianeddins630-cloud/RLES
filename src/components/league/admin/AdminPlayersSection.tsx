import { useState } from "react";
import type {
  LeagueMember,
  LeaguePlayer,
  LeagueTeam,
  LeagueTier,
  TierSalaryConfig,
} from "../../../types/leagueAdmin";
import { tierName } from "./adminUtils";

interface AdminPlayersSectionProps {
  tiers: LeagueTier[];
  teams: LeagueTeam[];
  members: LeagueMember[];
  players: LeaguePlayer[];
  tierConfigs: TierSalaryConfig[];
  getTeamSalaryTotal: (teamId: string) => number;
  getTierConfig: (tierId: string) => { teamCap: number } | undefined;
  onAddPlayer: (memberId: string, teamId: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export function AdminPlayersSection({
  tiers,
  teams,
  members,
  players,
  tierConfigs,
  getTeamSalaryTotal,
  getTierConfig,
  onAddPlayer,
  onRemovePlayer,
}: AdminPlayersSectionProps) {
  const [memberId, setMemberId] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");

  const unassignedMembers = members.filter(
    (m) => !players.some((p) => p.memberId === m.id)
  );

  function handleAdd() {
    if (!memberId || !teamId) return;
    onAddPlayer(memberId, teamId);
    setMemberId("");
  }

  function memberName(memberId: string): string {
    return members.find((m) => m.id === memberId)?.displayName ?? "Unknown";
  }

  return (
    <section className="league-admin-section" aria-labelledby="admin-players-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-players-heading" className="league-admin-section-title">Players</h2>
        <p className="league-settings-hint">
          Roster players assigned to teams. Salary and tracker sync from member records.
        </p>
      </header>

      {teams.length === 0 ? (
        <p className="league-admin-empty">Add teams first to manage rosters.</p>
      ) : (
        <>
          <div className="league-admin-add-row">
            <select
              className="league-settings-input league-settings-select"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Select member</option>
              {unassignedMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
            <select
              className="league-settings-input league-settings-select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="league-admin-add-btn"
              onClick={handleAdd}
              disabled={!memberId}
            >
              Add to roster
            </button>
          </div>

          <div className="league-admin-roster-grid">
            {teams.map((team) => {
              const roster = players.filter((p) => p.teamId === team.id);
              const total = getTeamSalaryTotal(team.id);
              const cap = getTierConfig(team.tierId)?.teamCap ?? 0;
              const overCap = cap > 0 && total > cap;

              return (
                <div key={team.id} className="league-admin-roster-card glass-panel">
                  <header className="league-admin-roster-head">
                    <div>
                      <h3 className="league-admin-roster-title">
                        {team.shortLabel} — {team.name}
                      </h3>
                      <p className="league-admin-row-meta">
                        {tierName(tiers, team.tierId)} · Salary {total}/{cap}
                        {overCap && (
                          <span className="league-admin-warn"> Over cap</span>
                        )}
                      </p>
                    </div>
                  </header>

                  {roster.length === 0 ? (
                    <p className="league-admin-empty league-admin-empty--sm">No players</p>
                  ) : (
                    <ul className="league-admin-roster-list">
                      {roster.map((player) => {
                        const member = members.find((m) => m.id === player.memberId);
                        const config = tierConfigs.find((c) => c.tierId === player.tierId);
                        const salaryWarn =
                          config &&
                          player.salary > 0 &&
                          (player.salary < config.salaryMin ||
                            player.salary > config.salaryMax);

                        return (
                          <li key={player.id} className="league-admin-roster-item">
                            <div>
                              <strong>{member?.displayName ?? "Unknown"}</strong>
                              <span className="league-admin-row-meta">
                                Salary {player.salary}
                                {salaryWarn && (
                                  <span className="league-admin-warn"> Out of range</span>
                                )}
                              </span>
                              {player.trackerUrl && (
                                <a
                                  href={player.trackerUrl}
                                  className="league-admin-tracker-link"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Tracker
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              className="league-admin-remove-btn"
                              onClick={() => onRemovePlayer(player.id)}
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {players.length > 0 && (
            <div className="league-admin-all-players">
              <h3 className="league-admin-subtitle">All roster players</h3>
              <ul className="league-admin-table" aria-label="All players">
                {players.map((player) => (
                  <li key={player.id} className="league-admin-row glass-panel">
                    <div className="league-admin-row-main">
                      <strong>{memberName(player.memberId)}</strong>
                      <span className="league-admin-row-meta">
                        {teams.find((t) => t.id === player.teamId)?.name} ·{" "}
                        {tierName(tiers, player.tierId)} · Salary {player.salary}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="league-admin-remove-btn"
                      onClick={() => onRemovePlayer(player.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
