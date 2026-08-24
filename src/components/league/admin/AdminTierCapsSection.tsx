import type { LeagueTier, TierSalaryConfig } from "../../../types/leagueAdmin";

interface AdminTierCapsSectionProps {
  tiers: LeagueTier[];
  tierConfigs: TierSalaryConfig[];
  onUpdate: (tierId: string, patch: Partial<TierSalaryConfig>) => void;
}

export function AdminTierCapsSection({
  tiers,
  tierConfigs,
  onUpdate,
}: AdminTierCapsSectionProps) {
  return (
    <section className="league-admin-section" aria-labelledby="admin-tiers-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-tiers-heading" className="league-admin-section-title">
          Tier salary ranges & team caps
        </h2>
        <p className="league-settings-hint">
          Set allowed salary range per player and maximum team salary cap for each tier.
        </p>
      </header>

      <div className="league-admin-tier-grid">
        {tiers.map((tier) => {
          const config = tierConfigs.find((c) => c.tierId === tier.id);
          if (!config) return null;

          return (
            <div key={tier.id} className="league-admin-tier-card glass-panel">
              <h3 className="league-admin-tier-name">{tier.name}</h3>

              <div className="league-admin-tier-fields">
                <label className="league-settings-field">
                  <span className="league-settings-label">Min salary</span>
                  <input
                    type="number"
                    min={0}
                    className="league-settings-input"
                    value={config.salaryMin}
                    onChange={(e) =>
                      onUpdate(tier.id, { salaryMin: Number(e.target.value) || 0 })
                    }
                  />
                </label>

                <label className="league-settings-field">
                  <span className="league-settings-label">Max salary</span>
                  <input
                    type="number"
                    min={0}
                    className="league-settings-input"
                    value={config.salaryMax}
                    onChange={(e) =>
                      onUpdate(tier.id, { salaryMax: Number(e.target.value) || 0 })
                    }
                  />
                </label>

                <label className="league-settings-field league-settings-field--full">
                  <span className="league-settings-label">Team salary cap</span>
                  <span className="league-settings-hint">
                    Max total salary for all players on a {tier.name} team.
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="league-settings-input"
                    value={config.teamCap}
                    onChange={(e) =>
                      onUpdate(tier.id, { teamCap: Number(e.target.value) || 0 })
                    }
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
