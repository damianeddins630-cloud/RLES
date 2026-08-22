import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setMessage('Please enter your email and password.')
      return
    }
    setMessage('Login coming soon — account system is not connected yet.')
  }

  return (
    <div className="page login-page">
      <header className="site-header">
        <Link to="/" className="header-logo">
          <Logo size="small" />
        </Link>
      </header>

      <main className="login-main">
        <div className="login-card">
          <Logo size="small" className="login-logo" />
          <h1>Log In</h1>
          <p className="login-subtitle">Welcome back. Enter your credentials to continue.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button type="submit" className="btn btn-primary btn-full">
              Log In
            </button>
          </form>

          {message && <p className="login-message">{message}</p>}

          <p className="login-footer-text">
            Don&apos;t have an account?{' '}
            <span className="text-muted">Sign up coming soon</span>
          </p>
        </div>
      </main>
    </div>
  )
}
