import { useState, type FormEvent } from 'react'
import Logo from './Logo'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    // Placeholder — wire up to your auth backend later
    console.log('Login attempt:', { email })
  }

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true" />

      <main className="login-card">
        <div className="login-logo">
          <Logo width={260} />
        </div>

        <p className="login-tagline">Competitive 2v2 matchmaking</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <a href="#" className="login-link">
            Sign up
          </a>
        </p>
      </main>
    </div>
  )
}
