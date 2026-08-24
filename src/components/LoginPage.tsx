import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
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
    <AppShell activeTab="home">
      <section className="content-card" aria-labelledby="login-heading">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <Logo size={120} />
        </div>
        <p className="content-tagline">Your leagues. One platform.</p>

        <h1 id="login-heading" className="content-title" style={{ marginTop: "1.25rem" }}>
          Sign In
        </h1>
        <p className="content-subtitle">
          Connect with Discord to manage multiple competitive leagues
        </p>

        {error && (
          <div className="content-error" role="alert">
            {error}
          </div>
        )}

        <DiscordButton />

        <p className="content-footer">
          By signing in, you agree to connect your Discord profile with League Master System.
        </p>
      </section>
    </AppShell>
  );
}
