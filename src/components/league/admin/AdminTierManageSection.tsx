import { useRef, useState } from "react";
import type { LeagueTier } from "../../../types/leagueAdmin";

interface AdminTierManageSectionProps {
  tiers: LeagueTier[];
  onAdd: (name: string) => void;
  onRemove: (tierId: string) => void;
  onUpdate: (tierId: string, patch: Partial<LeagueTier>) => void;
}

function TierLogoPreview({ tier }: { tier: LeagueTier }) {
  if (tier.logoUrl) {
    return (
      <img
        src={tier.logoUrl}
        alt=""
        className="league-admin-tier-logo"
        width={56}
        height={56}
      />
    );
  }

  return (
    <span className="league-admin-tier-logo-badge" aria-hidden="true">
      {tier.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function AdminTierManageSection({
  tiers,
  onAdd,
  onRemove,
  onUpdate,
}: AdminTierManageSectionProps) {
  const [newName, setNewName] = useState("");
  const [logoDrafts, setLogoDrafts] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd(newName);
    setNewName("");
  }

  function applyLogoUrl(tierId: string, url: string) {
    const trimmed = url.trim();
    if (trimmed) {
      onUpdate(tierId, { logoUrl: trimmed });
      setLogoDrafts((prev) => ({ ...prev, [tierId]: "" }));
    }
  }

  function handleLogoFile(tierId: string, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (result) onUpdate(tierId, { logoUrl: result });
    };
    reader.readAsDataURL(file);
  }

  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  return (
    <section className="league-admin-section" aria-labelledby="admin-tier-manage-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-tier-manage-heading" className="league-admin-section-title">
          Tiers
        </h2>
        <p className="league-settings-hint">
          Add or remove competitive tiers. Set each tier name and logo.
        </p>
      </header>

      <div className="league-admin-add-row">
        <input
          type="text"
          className="league-settings-input"
          placeholder="New tier name (e.g. Academy)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button type="button" className="league-admin-add-btn" onClick={handleAdd}>
          Add tier
        </button>
      </div>

      <ul className="league-admin-tier-manage-list" aria-label="League tiers">
        {sortedTiers.map((tier) => (
          <li key={tier.id} className="league-admin-tier-manage-row glass-panel">
            <div className="league-admin-tier-manage-main">
              <TierLogoPreview tier={tier} />

              <div className="league-admin-tier-manage-fields">
                <label className="league-settings-field">
                  <span className="league-settings-label">Tier name</span>
                  <input
                    type="text"
                    className="league-settings-input"
                    value={tier.name}
                    onChange={(e) => onUpdate(tier.id, { name: e.target.value })}
                  />
                </label>

                <label className="league-settings-field">
                  <span className="league-settings-label">Logo URL</span>
                  <div className="league-admin-tier-logo-row">
                    <input
                      type="url"
                      className="league-settings-input"
                      placeholder="https://example.com/tier-logo.png"
                      value={logoDrafts[tier.id] ?? ""}
                      onChange={(e) =>
                        setLogoDrafts((prev) => ({
                          ...prev,
                          [tier.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyLogoUrl(tier.id, logoDrafts[tier.id] ?? "");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="league-settings-icon-btn"
                      title="Apply logo URL"
                      onClick={() => applyLogoUrl(tier.id, logoDrafts[tier.id] ?? "")}
                    >
                      ↗
                    </button>
                    <button
                      type="button"
                      className="league-settings-icon-btn"
                      title="Upload logo"
                      onClick={() => fileRefs.current[tier.id]?.click()}
                    >
                      ↑
                    </button>
                    <input
                      ref={(el) => {
                        fileRefs.current[tier.id] = el;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="league-settings-file-input"
                      onChange={(e) => handleLogoFile(tier.id, e.target.files?.[0])}
                    />
                  </div>
                  {tier.logoUrl && (
                    <button
                      type="button"
                      className="league-admin-tier-clear-logo"
                      onClick={() => onUpdate(tier.id, { logoUrl: null })}
                    >
                      Remove logo
                    </button>
                  )}
                </label>
              </div>
            </div>

            <div className="league-admin-tier-manage-actions">
              <button
                type="button"
                className="league-admin-remove-btn"
                onClick={() => onRemove(tier.id)}
                disabled={tiers.length <= 1}
                title={
                  tiers.length <= 1
                    ? "At least one tier is required"
                    : "Remove tier"
                }
              >
                Remove tier
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
