import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteBackground } from "./SiteBackground";

export type AppTab = "home" | "leagues" | "standings" | "settings";

interface AppShellProps {
  children: ReactNode;
  activeTab?: AppTab;
  showNav?: boolean;
}

const TABS: { id: AppTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "leagues", label: "Leagues" },
  { id: "standings", label: "Standings" },
  { id: "settings", label: "Settings" },
];

export function AppShell({
  children,
  activeTab = "home",
  showNav = true,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <SiteBackground />

      {showNav && (
        <header className="app-nav">
          <div className="app-nav-inner">
            <div className="app-nav-brand">
              <Logo size={44} className="app-nav-logo" />
              <span className="app-nav-title">LMS</span>
            </div>
            <nav className="app-tabs" aria-label="Main navigation">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`app-tab${activeTab === tab.id ? " app-tab--active" : ""}`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main className="app-main">{children}</main>
    </div>
  );
}
