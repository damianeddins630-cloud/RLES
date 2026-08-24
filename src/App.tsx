import { useAuth } from "./hooks/useAuth";
import { LeagueListPage } from "./components/LeagueListPage";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (user) {
    return <LeagueListPage user={user} onLogout={logout} />;
  }

  return <LoginPage />;
}
