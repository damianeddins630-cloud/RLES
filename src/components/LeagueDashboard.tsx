import { useState } from "react";
import { SiteBackground } from "./SiteBackground";
import { LeagueAdminPage } from "./league/LeagueAdminPage";
import { LeagueSettingsPage } from "./league/LeagueSettingsPage";
import { LeagueStandingsPage } from "./league/LeagueStandingsPage";
import { LeagueTabPlaceholder } from "./league/LeagueTabPlaceholder";
import { useLeagueSettings } from "../hooks/useLeagueSettings";
import type { League } from "../types/league";
import type { User } from "../types/user";

export type LeagueTab = "home" | "standings" | "teams" | "settings" | "admin";

interface LeagueDashboardProps {
  league: League;
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const TABS: { id: LeagueTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "standings", label: "Standings" },
  { id: "teams", label: "Teams" },
  { id: "settings", label: "Settings" },
  { id: "admin", label: "Admin" },
];

export function LeagueDashboard({
  league,
  user,
  onBack,
  onLogout,
}: LeagueDashboardProps) {
  const [activeTab, setActiveTab] = useState<LeagueTab>("home");
  const { settings, updateSettings, saveSettings, saved, saving, saveError, persisted } =
    useLeagueSettings(league.id, league.name);

  const displayLogo = settings.logoUrl ?? league.logoUrl;
  const displayName = settings.name || league.name;

  return (
    <div className="league-dashboard">
      <SiteBackground />

      <aside className="league-sidebar glass-panel" aria-label="League navigation">
        <button type="button" className="league-sidebar-back" onClick={onBack}>
          ← All Leagues
        </button>

        <div className="league-sidebar-header">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt=""
              className="league-sidebar-logo"
              width={52}
              height={52}
            />
          ) : (
            <span className="league-sidebar-badge">{league.shortLabel}</span>
          )}
          <div>
            <p className="league-sidebar-label">League</p>
            <p className="league-sidebar-name">{displayName}</p>
          </div>
        </div>

        <nav className="league-side-nav" aria-label="League sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`league-side-tab${activeTab === tab.id ? " league-side-tab--active" : ""}`}
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="league-sidebar-footer">
          <p className="league-sidebar-user">{user.displayName}</p>
          <button type="button" className="logout-btn logout-btn--compact" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main
        className={`league-main${activeTab === "settings" || activeTab === "admin" || activeTab === "standings" ? " league-main--wide" : ""}`}
        aria-live="polite"
      >
        {activeTab === "settings" ? (
          <LeagueSettingsPage
            league={league}
            settings={settings}
            onChange={updateSettings}
            onSave={saveSettings}
            saved={saved}
            saving={saving}
            saveError={saveError}
            persisted={persisted}
          />
        ) : activeTab === "admin" ? (
          <LeagueAdminPage leagueId={league.id} />
        ) : activeTab === "home" ? (
          <LeagueTabPlaceholder title="Home" />
        ) : activeTab === "standings" ? (
          <LeagueStandingsPage leagueId={league.id} />
        ) : (
          <LeagueTabPlaceholder title="Teams" />
        )}
      </main>
    </div>
  );
}
