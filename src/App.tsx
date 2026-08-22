import { useAuth } from "./hooks/useAuth";
import { HomePage } from "./components/HomePage";
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
    return <HomePage user={user} onLogout={logout} />;
  }

  return <LoginPage />;
}
