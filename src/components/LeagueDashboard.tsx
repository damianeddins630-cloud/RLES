import { useState } from "react";
import { Logo } from "./Logo";
import { LeagueSettingsPage } from "./league/LeagueSettingsPage";
import { LeagueTabPlaceholder } from "./league/LeagueTabPlaceholder";
import { useLeagueSettings } from "../hooks/useLeagueSettings";
import type { League } from "../types/league";
import type { User } from "../types/user";

export type LeagueTab = "home" | "standings" | "teams" | "settings";

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
];

export function LeagueDashboard({
  league,
  user,
  onBack,
  onLogout,
}: LeagueDashboardProps) {
  const [activeTab, setActiveTab] = useState<LeagueTab>("home");
  const { settings, updateSettings, saveSettings, saved } = useLeagueSettings(
    league.id,
    league.name
  );

  const displayLogo = settings.logoUrl ?? league.logoUrl;
  const displayName = settings.name || league.name;

  return (
    <div className="league-dashboard">
      <div className="app-bg" aria-hidden="true">
        <Logo variant="fill" className="app-bg-logo" />
        <div className="app-bg-scrim" />
      </div>

      <aside className="league-sidebar" aria-label="League navigation">
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
        className={`league-main${activeTab === "settings" ? " league-main--settings" : ""}`}
        aria-live="polite"
      >
        {activeTab === "settings" ? (
          <LeagueSettingsPage
            league={league}
            settings={settings}
            onChange={updateSettings}
            onSave={saveSettings}
            saved={saved}
          />
        ) : activeTab === "home" ? (
          <LeagueTabPlaceholder title="Home" />
        ) : activeTab === "standings" ? (
          <LeagueTabPlaceholder title="Standings" />
        ) : (
          <LeagueTabPlaceholder title="Teams" />
        )}
      </main>
    </div>
  );
}
