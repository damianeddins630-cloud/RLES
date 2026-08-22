import { useState, type FormEvent } from "react";
import { Logo } from "./Logo";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder — connect to auth backend later
    setTimeout(() => setIsLoading(false), 800);
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-glow login-bg-glow--blue" />
        <div className="login-bg-glow login-bg-glow--purple" />
      </div>

      <main className="login-container">
        <header className="login-header">
          <Logo size={240} className="login-logo" />
          <p className="login-tagline">Compete. Dominate. Repeat.</p>
        </header>

        <section className="login-card" aria-labelledby="login-heading">
          <h1 id="login-heading" className="login-title">Sign In</h1>
          <p className="login-subtitle">Enter your credentials to access your account</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            Don&apos;t have an account?{" "}
            <a href="#" className="login-link">Create one</a>
          </p>
        </section>
      </main>
    </div>
  );
}
