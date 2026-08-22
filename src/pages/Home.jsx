import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Home() {
  return (
    <div className="page home-page">
      <header className="site-header">
        <Link to="/" className="header-logo">
          <Logo size="small" />
        </Link>
        <Link to="/login" className="btn btn-outline">
          Log In
        </Link>
      </header>

      <main className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <Logo size="large" className="hero-logo" />
        <p className="hero-tagline">Competitive 2v2. Built for the grind.</p>
        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary">
            Get Started
          </Link>
          <a href="#about" className="btn btn-ghost">
            Learn More
          </a>
        </div>
      </main>

      <section id="about" className="about">
        <div className="about-card">
          <h2>Welcome to RLES 2v2</h2>
          <p>
            Your home for competitive 2v2 matchmaking, tournaments, and stats.
            Sign in to track your rank, join lobbies, and climb the leaderboard.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} RLES 2v2. All rights reserved.</p>
      </footer>
    </div>
  )
}
