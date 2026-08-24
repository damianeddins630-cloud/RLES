import { useRef, useState } from "react";
import type { League } from "../../types/league";
import type { LeagueSettings } from "../../types/leagueSettings";

interface LeagueSettingsPageProps {
  league: League;
  settings: LeagueSettings;
  onChange: (patch: Partial<LeagueSettings>) => void;
  onSave: () => void;
  saved: boolean;
}

function LeagueLogoPreview({
  league,
  logoUrl,
}: {
  league: League;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <img src={logoUrl} alt="" className="league-settings-logo-preview" width={72} height={72} />
    );
  }

  return (
    <span className="league-settings-logo-badge" aria-hidden="true">
      {league.shortLabel}
    </span>
  );
}

export function LeagueSettingsPage({
  league,
  settings,
  onChange,
  onSave,
  saved,
}: LeagueSettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoDraftUrl, setLogoDraftUrl] = useState("");

  const previewLogo = logoDraftUrl.trim() || settings.logoUrl;
  const previewDescription =
    settings.description.trim() || "No public description yet.";

  function handleLogoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (result) {
        onChange({ logoUrl: result });
        setLogoDraftUrl("");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="league-settings glass-panel">
      <div className="league-settings-content">
      <header className="league-settings-header">
        <h1 className="league-settings-title">League settings</h1>
        <p className="league-settings-subtitle">
          Core identity, visibility, and operational controls.
        </p>
      </header>

      <div className="league-settings-grid">
        <label className="league-settings-field">
          <span className="league-settings-label">League name</span>
          <input
            type="text"
            className="league-settings-input"
            value={settings.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </label>

        <label className="league-settings-field">
          <span className="league-settings-label">Visibility</span>
          <select
            className="league-settings-input league-settings-select"
            value={settings.visibility}
            onChange={(e) =>
              onChange({ visibility: e.target.value as LeagueSettings["visibility"] })
            }
          >
            <option value="public">Public</option>
            <option value="private" disabled>Private (coming soon)</option>
          </select>
          <span className="league-settings-hint">
            New leagues are public by default and appear in discovery listings.
          </span>
        </label>

        <label className="league-settings-field league-settings-field--full">
          <span className="league-settings-label">Description</span>
          <span className="league-settings-hint">
            Public summary for listings and overview pages.
          </span>
          <textarea
            className="league-settings-input league-settings-textarea"
            rows={4}
            value={settings.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Competitive Rocket League league for structured franchise play."
          />
        </label>

        <label className="league-settings-field">
          <span className="league-settings-label">League timezone</span>
          <span className="league-settings-hint">
            Interprets timezone-less league-authored times and replay fallbacks.
          </span>
          <select
            className="league-settings-input league-settings-select"
            value={settings.timezone}
            onChange={(e) =>
              onChange({ timezone: e.target.value as LeagueSettings["timezone"] })
            }
          >
            <option value="unspecified">Unspecified</option>
            <option value="America/New_York">Eastern (US)</option>
            <option value="America/Chicago">Central (US)</option>
            <option value="America/Denver">Mountain (US)</option>
            <option value="America/Los_Angeles">Pacific (US)</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
          </select>
        </label>

        <label className="league-settings-field">
          <span className="league-settings-label">Preferred Rocket League server region</span>
          <select
            className="league-settings-input league-settings-select"
            value={settings.serverRegion}
            onChange={(e) =>
              onChange({ serverRegion: e.target.value as LeagueSettings["serverRegion"] })
            }
          >
            <option value="unspecified">Unspecified</option>
            <option value="us-east">US East</option>
            <option value="us-west">US West</option>
            <option value="us-central">US Central</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
          </select>
        </label>
      </div>

      <section className="league-settings-section" aria-labelledby="league-logo-heading">
        <div className="league-settings-section-head">
          <h2 id="league-logo-heading" className="league-settings-section-title">
            League Logo
          </h2>
          <p className="league-settings-hint">Required. Upload or paste an image URL.</p>
        </div>

        <div className="league-settings-logo-row">
          <LeagueLogoPreview league={league} logoUrl={previewLogo} />

          <div className="league-settings-logo-controls">
            <p className="league-settings-logo-status">
              {settings.logoUrl ? "Current image saved." : "No image saved yet."}
              <span>PNG, JPG, or WebP</span>
            </p>
            <div className="league-settings-logo-input-row">
              <input
                type="url"
                className="league-settings-input"
                placeholder="https://example.com/image.png"
                value={logoDraftUrl}
                onChange={(e) => setLogoDraftUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && logoDraftUrl.trim()) {
                    onChange({ logoUrl: logoDraftUrl.trim() });
                    setLogoDraftUrl("");
                  }
                }}
              />
              <button
                type="button"
                className="league-settings-icon-btn"
                title="Apply URL"
                onClick={() => {
                  if (logoDraftUrl.trim()) {
                    onChange({ logoUrl: logoDraftUrl.trim() });
                    setLogoDraftUrl("");
                  }
                }}
              >
                ↗
              </button>
              <button
                type="button"
                className="league-settings-icon-btn"
                title="Upload image"
                onClick={() => fileInputRef.current?.click()}
              >
                ↑
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="league-settings-file-input"
                onChange={(e) => handleLogoFile(e.target.files?.[0])}
              />
            </div>
            <p className="league-settings-hint">Save this form to commit preview images permanently.</p>
          </div>
        </div>
      </section>

      <section className="league-settings-section" aria-labelledby="listing-preview-heading">
        <div className="league-settings-section-head">
          <h2 id="listing-preview-heading" className="league-settings-section-title">
            Listing preview
          </h2>
          <p className="league-settings-hint">
            Live discovery card preview using your unsaved form state.
          </p>
        </div>

        <div className="league-settings-listing-card">
          <LeagueLogoPreview league={league} logoUrl={previewLogo} />
          <div className="league-settings-listing-body">
            <div className="league-settings-listing-title-row">
              <strong>{settings.name || "League name"}</strong>
              <span className="league-settings-visibility-pill">
                {settings.visibility === "private" ? "Private" : "Public"}
              </span>
            </div>
            <p className="league-settings-listing-desc">{previewDescription}</p>
          </div>
        </div>
      </section>

      <div className="league-settings-actions">
        <button type="button" className="league-settings-save-btn" onClick={onSave}>
          Save changes
        </button>
        {saved && (
          <span className="league-settings-saved" role="status">Settings saved.</span>
        )}
      </div>
      </div>
    </div>
  );
}
