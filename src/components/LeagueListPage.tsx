import { AppShell } from "./AppShell";
import { LEAGUES } from "../data/leagues";
import type { User } from "../types/user";

interface LeagueListPageProps {
  user: User;
  onLogout: () => void;
}

export function LeagueListPage({ user, onLogout }: LeagueListPageProps) {
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
              <button type="button" className="league-list-item">
                {league.logoUrl ? (
                  <img
                    src={league.logoUrl}
                    alt=""
                    className="league-list-logo"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="league-list-badge" aria-hidden="true">
                    {league.shortLabel}
                  </span>
                )}
                <span className="league-list-name">{league.name}</span>
              </button>
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
