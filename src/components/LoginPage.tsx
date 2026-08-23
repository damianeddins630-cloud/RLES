import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { DiscordButton } from "./DiscordButton";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Discord login was cancelled.",
  missing_code: "Discord did not return an authorization code.",
  auth_failed: "Discord login failed. Please try again.",
};

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    if (errorCode) {
      setError(ERROR_MESSAGES[errorCode] ?? "An error occurred during login.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-glow login-bg-glow--blue" />
        <div className="login-bg-glow login-bg-glow--silver" />
      </div>

      <main className="login-container">
        <header className="login-header">
          <Logo size={260} className="login-logo" />
          <p className="login-tagline">Your leagues. One platform.</p>
        </header>

        <section className="login-card" aria-labelledby="login-heading">
          <h1 id="login-heading" className="login-title">Sign In</h1>
          <p className="login-subtitle">
            Connect with Discord to manage multiple competitive leagues
          </p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-actions">
            <DiscordButton />
          </div>

          <p className="login-footer">
            By signing in, you agree to connect your Discord profile with League Master System.
          </p>
        </section>
      </main>
    </div>
  );
}
