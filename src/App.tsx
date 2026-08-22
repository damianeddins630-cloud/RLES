import { useState, type FormEvent } from 'react'
import './App.css'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setMessage('Enter your email and password to continue.')
      return
    }
    setMessage('Login is ready for wiring — credentials received locally.')
  }

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="wash wash-a" />
        <div className="wash wash-b" />
        <div className="grid" />
        <div className="beam" />
      </div>

      <main className="hero">
        <img
          className="logo"
          src="/rles-logo.png"
          alt="RLES 2V2"
          width={520}
          height={346}
        />

        <h1 className="headline">Sign in to the series</h1>
        <p className="lede">
          Queue up, lock in your roster, and get back on the pitch.
        </p>

        <form className="login" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {message ? <p className="status" role="status">{message}</p> : null}

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              Log in
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setMessage('Account creation comes next — stay tuned.')
              }
            >
              Create account
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
