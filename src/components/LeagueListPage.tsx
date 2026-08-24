import { AppShell } from "./AppShell";
import { LeagueListItem } from "./LeagueListItem";
import { LEAGUES } from "../data/leagues";
import type { User } from "../types/user";

interface LeagueListPageProps {
  user: User;
  onLogout: () => void;
  onSelectLeague: (leagueId: string) => void;
}

export function LeagueListPage({ user, onLogout, onSelectLeague }: LeagueListPageProps) {
  return (
    <AppShell showNav={false}>
      <section className="content-card league-list-card" aria-labelledby="leagues-heading">
        <p className="content-tagline">League Master System</p>
        <h1 id="leagues-heading" className="content-title" style={{ marginTop: "0.5rem" }}>
          Your Leagues
        </h1>
        <p className="content-subtitle">
          Signed in as <strong>{user.displayName}</strong> — choose a league to open
        </p>

        <ul className="league-list" aria-label="Available leagues">
          {LEAGUES.map((league) => (
            <li key={league.id}>
              <LeagueListItem
                league={league}
                onSelect={() => onSelectLeague(league.id)}
              />
            </li>
          ))}
        </ul>

        <div className="home-actions" style={{ marginTop: "1.25rem" }}>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </section>
    </AppShell>
  );
}
