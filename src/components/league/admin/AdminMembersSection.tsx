import { useState } from "react";
import type { LeagueMember, LeagueTeam, LeagueTier, TierSalaryConfig } from "../../../types/leagueAdmin";
import { tierName } from "./adminUtils";

interface AdminMembersSectionProps {
  tiers: LeagueTier[];
  teams: LeagueTeam[];
  members: LeagueMember[];
  tierConfigs: TierSalaryConfig[];
  onAdd: (displayName: string, tierId: string) => void;
  onRemove: (memberId: string) => void;
  onUpdate: (memberId: string, patch: Partial<LeagueMember>) => void;
}

function salaryWarning(
  salary: number,
  tierId: string,
  tierConfigs: TierSalaryConfig[]
): string | null {
  const config = tierConfigs.find((c) => c.tierId === tierId);
  if (!config || salary === 0) return null;
  if (salary < config.salaryMin) return `Below min (${config.salaryMin})`;
  if (salary > config.salaryMax) return `Above max (${config.salaryMax})`;
  return null;
}

export function AdminMembersSection({
  tiers,
  teams,
  members,
  tierConfigs,
  onAdd,
  onRemove,
  onUpdate,
}: AdminMembersSectionProps) {
  const [displayName, setDisplayName] = useState("");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "premier");

  function handleAdd() {
    if (!displayName.trim()) return;
    onAdd(displayName, tierId);
    setDisplayName("");
  }

  return (
    <section className="league-admin-section" aria-labelledby="admin-members-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-members-heading" className="league-admin-section-title">Members</h2>
        <p className="league-settings-hint">
          League members with Tracker.gg link and individual salary.
        </p>
      </header>

      <div className="league-admin-add-row">
        <input
          type="text"
          className="league-settings-input"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
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
          Add member
        </button>
      </div>

      {members.length === 0 ? (
        <p className="league-admin-empty">No members yet.</p>
      ) : (
        <ul className="league-admin-table league-admin-table--wide" aria-label="Members">
          {members.map((member) => {
            const warn = salaryWarning(member.salary, member.tierId, tierConfigs);

            return (
              <li key={member.id} className="league-admin-member-row glass-panel">
                <div className="league-admin-member-fields">
                  <label className="league-settings-field">
                    <span className="league-settings-label">Name</span>
                    <input
                      type="text"
                      className="league-settings-input"
                      value={member.displayName}
                      onChange={(e) =>
                        onUpdate(member.id, { displayName: e.target.value })
                      }
                    />
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Tier</span>
                    <select
                      className="league-settings-input league-settings-select"
                      value={member.tierId}
                      onChange={(e) =>
                        onUpdate(member.id, { tierId: e.target.value })
                      }
                    >
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Team</span>
                    <select
                      className="league-settings-input league-settings-select"
                      value={member.teamId ?? ""}
                      onChange={(e) =>
                        onUpdate(member.id, {
                          teamId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">No team</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Tracker URL</span>
                    <input
                      type="url"
                      className="league-settings-input"
                      placeholder="https://tracker.gg/rocket-league/profile/..."
                      value={member.trackerUrl}
                      onChange={(e) =>
                        onUpdate(member.id, { trackerUrl: e.target.value })
                      }
                    />
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Salary</span>
                    <input
                      type="number"
                      min={0}
                      className="league-settings-input"
                      value={member.salary}
                      onChange={(e) =>
                        onUpdate(member.id, { salary: Number(e.target.value) || 0 })
                      }
                    />
                    {warn && (
                      <span className="league-admin-warn league-admin-warn--inline">{warn}</span>
                    )}
                  </label>
                </div>

                <div className="league-admin-member-footer">
                  <span className="league-admin-row-meta">
                    {tierName(tiers, member.tierId)}
                    {member.teamId && (
                      <> · {teams.find((t) => t.id === member.teamId)?.name}</>
                    )}
                  </span>
                  <button
                    type="button"
                    className="league-admin-remove-btn"
                    onClick={() => onRemove(member.id)}
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
