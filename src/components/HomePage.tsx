import { AppShell } from "./AppShell";
import type { User } from "../types/user";

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  return (
    <AppShell activeTab="home">
      <section className="content-card home-card">
        <div className="home-user">
          <img
            src={user.avatarUrl}
            alt=""
            className="home-avatar"
            width={72}
            height={72}
          />
          <div>
            <h1 className="home-welcome">Welcome back</h1>
            <p className="home-name">{user.displayName}</p>
            <p className="home-discord-tag">
              League Master System · Connected via Discord
            </p>
          </div>
        </div>

        <div className="home-actions">
          <button type="button" className="logout-btn" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </section>
    </AppShell>
  );
}
