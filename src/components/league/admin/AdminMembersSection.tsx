import type {
  FranchiseRole,
  LeagueMember,
  LeagueTeam,
  LeagueTier,
  TierSalaryConfig,
} from "../../../types/leagueAdmin";
import { franchiseRoleName, tierName } from "./adminUtils";

interface AdminMembersSectionProps {
  tiers: LeagueTier[];
  teams: LeagueTeam[];
  franchiseRoles: FranchiseRole[];
  members: LeagueMember[];
  tierConfigs: TierSalaryConfig[];
  syncing: boolean;
  syncError: string | null;
  onRefresh: () => void;
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

function formatSignedUp(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function AdminMembersSection({
  tiers,
  teams,
  franchiseRoles,
  members,
  tierConfigs,
  syncing,
  syncError,
  onRefresh,
  onRemove,
  onUpdate,
}: AdminMembersSectionProps) {
  const sorted = [...members].sort((a, b) => {
    const aTime = a.signedUpAt ? new Date(a.signedUpAt).getTime() : 0;
    const bTime = b.signedUpAt ? new Date(b.signedUpAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <section className="league-admin-section" aria-labelledby="admin-members-heading">
      <header className="league-admin-section-head">
        <div className="league-admin-members-head">
          <div>
            <h2 id="admin-members-heading" className="league-admin-section-title">
              Signed-up members
            </h2>
            <p className="league-settings-hint">
              Everyone who registers for the league (Discord sign-up). Set franchise role,
              tier, team, tracker, and salary for each person.
            </p>
          </div>
          <button
            type="button"
            className="league-admin-add-btn"
            onClick={onRefresh}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : "Refresh sign-ups"}
          </button>
        </div>
        {syncError && (
          <p className="league-admin-warn" role="alert">{syncError}</p>
        )}
      </header>

      {sorted.length === 0 ? (
        <p className="league-admin-empty">
          No sign-ups yet. Members appear here when they register via Discord
          <code className="league-admin-code"> /register-player</code>, or after you refresh.
        </p>
      ) : (
        <ul className="league-admin-table league-admin-table--wide" aria-label="Signed-up members">
          {sorted.map((member) => {
            const warn = salaryWarning(member.salary, member.tierId, tierConfigs);
            const signedLabel = formatSignedUp(member.signedUpAt);

            return (
              <li key={member.id} className="league-admin-member-row glass-panel">
                <div className="league-admin-member-top">
                  <div>
                    <strong className="league-admin-member-name">{member.displayName}</strong>
                    <span className="league-admin-row-meta">
                      {member.fromRegistration ? "Discord sign-up" : "Manual entry"}
                      {signedLabel && ` · Joined ${signedLabel}`}
                      {member.discordUserId && (
                        <> · ID {member.discordUserId.slice(0, 8)}…</>
                      )}
                    </span>
                  </div>
                  {!member.fromRegistration && (
                    <button
                      type="button"
                      className="league-admin-remove-btn"
                      onClick={() => onRemove(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="league-admin-member-fields">
                  <label className="league-settings-field">
                    <span className="league-settings-label">Franchise role</span>
                    <select
                      className="league-settings-input league-settings-select"
                      value={member.franchiseRoleId ?? ""}
                      onChange={(e) =>
                        onUpdate(member.id, { franchiseRoleId: e.target.value })
                      }
                    >
                      {franchiseRoles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Tier</span>
                    <select
                      className="league-settings-input league-settings-select"
                      value={member.tierId}
                      onChange={(e) => onUpdate(member.id, { tierId: e.target.value })}
                    >
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="league-settings-field">
                    <span className="league-settings-label">Franchise team</span>
                    <select
                      className="league-settings-input league-settings-select"
                      value={member.teamId ?? ""}
                      onChange={(e) =>
                        onUpdate(member.id, { teamId: e.target.value || null })
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

                <p className="league-admin-row-meta league-admin-member-summary">
                  {franchiseRoleName(franchiseRoles, member.franchiseRoleId)} ·{" "}
                  {tierName(tiers, member.tierId)}
                  {member.teamId && (
                    <> · {teams.find((t) => t.id === member.teamId)?.name}</>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
