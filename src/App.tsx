import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { LeagueDashboard } from "./components/LeagueDashboard";
import { LeagueListPage } from "./components/LeagueListPage";
import { LoginPage } from "./components/LoginPage";
import { SiteBackground } from "./components/SiteBackground";
import { LEAGUES } from "./data/leagues";
import type { League } from "./types/league";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  if (loading) {
    return (
      <div className="app-shell">
        <SiteBackground />
        <div className="loading-page">
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (user) {
    if (selectedLeague) {
      return (
        <LeagueDashboard
          league={selectedLeague}
          user={user}
          onBack={() => setSelectedLeague(null)}
          onLogout={() => {
            setSelectedLeague(null);
            logout();
          }}
        />
      );
    }

    return (
      <LeagueListPage
        user={user}
        onLogout={logout}
        onSelectLeague={(leagueId) => {
          const league = LEAGUES.find((l) => l.id === leagueId);
          if (league) setSelectedLeague(league);
        }}
      />
    );
  }

  return <LoginPage />;
}
