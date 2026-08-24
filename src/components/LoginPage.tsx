import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { DiscordButton } from "./DiscordButton";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Discord login was cancelled.",
  missing_code: "Discord did not return an authorization code.",
  auth_failed: "Discord login failed. Please try again.",
  token_exchange_failed:
    "Discord rejected the login callback. Check OAuth redirect URL in Developer Portal.",
  redirect_uri_mismatch:
    "Invalid OAuth redirect — add the callback URL in Discord Developer Portal (see yellow box below).",
};

interface AuthStatus {
  redirectConfigured: boolean;
  expectedRedirectUri: string;
  fixSteps: string[];
}

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    if (errorCode) {
      setError(ERROR_MESSAGES[errorCode] ?? "An error occurred during login.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: AuthStatus) => setAuthStatus(data))
      .catch(() => setAuthStatus(null));
  }, []);

  return (
    <AppShell activeTab="home">
      <section className="content-card" aria-labelledby="login-heading">
        <p className="content-tagline">Your leagues. One platform.</p>

        <h1 id="login-heading" className="content-title" style={{ marginTop: "0.75rem" }}>
          Sign In
        </h1>
        <p className="content-subtitle">
          Connect with Discord to manage multiple competitive leagues
        </p>

        {authStatus && !authStatus.redirectConfigured && (
          <div className="oauth-setup-banner" role="status">
            <strong>Discord login is not configured yet</strong>
            <p>
              Add this URL in Discord Developer Portal → OAuth2 → Redirects:
            </p>
            <code className="oauth-setup-url">{authStatus.expectedRedirectUri}</code>
            <ol className="oauth-setup-steps">
              {authStatus.fixSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

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
