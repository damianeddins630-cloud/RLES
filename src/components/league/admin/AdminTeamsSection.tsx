import { useState } from "react";
import type { LeagueTeam, LeagueTier } from "../../../types/leagueAdmin";
import { tierName } from "./adminUtils";

interface AdminTeamsSectionProps {
  tiers: LeagueTier[];
  teams: LeagueTeam[];
  getTeamSalaryTotal: (teamId: string) => number;
  getTierConfig: (tierId: string) => { teamCap: number } | undefined;
  onAdd: (name: string, shortLabel: string, tierId: string) => void;
  onRemove: (teamId: string) => void;
  onUpdate: (teamId: string, patch: Partial<LeagueTeam>) => void;
}

export function AdminTeamsSection({
  tiers,
  teams,
  getTeamSalaryTotal,
  getTierConfig,
  onAdd,
  onRemove,
  onUpdate,
}: AdminTeamsSectionProps) {
  const [name, setName] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "premier");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name, shortLabel || name.slice(0, 4), tierId);
    setName("");
    setShortLabel("");
  }

  return (
    <section className="league-admin-section" aria-labelledby="admin-teams-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-teams-heading" className="league-admin-section-title">Teams</h2>
        <p className="league-settings-hint">Add or remove franchise teams per tier.</p>
      </header>

      <div className="league-admin-add-row">
        <input
          type="text"
          className="league-settings-input"
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="league-settings-input league-admin-input-short"
          placeholder="Tag"
          value={shortLabel}
          onChange={(e) => setShortLabel(e.target.value)}
          maxLength={6}
        />
        <select
          className="league-settings-input league-settings-select"
          value={tierId}
          onChange={(e) => setTierId(e.target.value)}
        >
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="button" className="league-admin-add-btn" onClick={handleAdd}>
          Add team
        </button>
      </div>

      {teams.length === 0 ? (
        <p className="league-admin-empty">No teams yet. Add your first team above.</p>
      ) : (
        <ul className="league-admin-table" aria-label="Teams">
          {teams.map((team) => {
            const total = getTeamSalaryTotal(team.id);
            const cap = getTierConfig(team.tierId)?.teamCap ?? 0;
            const overCap = cap > 0 && total > cap;

            return (
              <li key={team.id} className="league-admin-row glass-panel">
                <div className="league-admin-row-main">
                  <span className="league-admin-badge">{team.shortLabel}</span>
                  <div>
                    <strong className="league-admin-row-title">{team.name}</strong>
                    <span className="league-admin-row-meta">
                      {tierName(tiers, team.tierId)} · Cap {total}/{cap}
                      {overCap && (
                        <span className="league-admin-warn"> Over cap</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="league-admin-row-actions">
                  <select
                    className="league-settings-input league-settings-select league-admin-select-sm"
                    value={team.tierId}
                    onChange={(e) => onUpdate(team.id, { tierId: e.target.value })}
                    aria-label={`Tier for ${team.name}`}
                  >
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="league-admin-remove-btn"
                    onClick={() => onRemove(team.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
