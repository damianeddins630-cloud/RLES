import { Logo } from "./Logo";
import type { User } from "../types/user";

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-glow login-bg-glow--blue" />
        <div className="login-bg-glow login-bg-glow--silver" />
      </div>

      <main className="login-container home-container">
        <header className="login-header">
          <Logo size={220} className="login-logo" />
        </header>

        <section className="login-card home-card">
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
      </main>
    </div>
  );
}
