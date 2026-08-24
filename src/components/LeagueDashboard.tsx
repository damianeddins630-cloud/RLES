import { useState } from "react";
import { Logo } from "./Logo";
import type { League } from "../types/league";
import type { User } from "../types/user";

export type LeagueTab = "home" | "standings" | "teams";

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
];

export function LeagueDashboard({
  league,
  user,
  onBack,
  onLogout,
}: LeagueDashboardProps) {
  const [activeTab, setActiveTab] = useState<LeagueTab>("home");

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
          {league.logoUrl ? (
            <img
              src={league.logoUrl}
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
            <p className="league-sidebar-name">{league.name}</p>
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

      <main className="league-main" aria-live="polite">
        <div className="league-main-panel">
          <h1 className="league-main-title">{TABS.find((t) => t.id === activeTab)?.label}</h1>
          <p className="league-main-placeholder">Content coming soon.</p>
        </div>
      </main>
    </div>
  );
}
