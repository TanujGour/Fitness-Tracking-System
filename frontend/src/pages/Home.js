import { Link } from "react-router-dom";
import {
  FaDumbbell,
  FaChartLine,
  FaHeartbeat,
  FaRobot,
  FaAppleAlt,
  FaRunning,
} from "react-icons/fa";

function Home() {
  return (
    <div className="landing-page">
      <div className="landing-overlay">
        <header className="landing-header">
          <div className="landing-brand">🏋️ Fitness Training and Management System</div>
          <nav className="landing-nav">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-left">
            <span className="badge-pill">AI Powered Fitness Experience</span>
            <h1>Fitness Training and Management System</h1>
            <p>
              Transform your fitness journey with smart progress tracking,
              beautiful analytics, calorie monitoring, health-focused insights,
              and AI-based recommendations tailored to your activity.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Free
              </Link>
              <Link to="/login" className="btn btn-glass btn-large">
                Explore Dashboard
              </Link>
            </div>

            <div className="hero-mini-stats">
              <div className="mini-stat">
                <h3>10K+</h3>
                <p>Daily Step Goal</p>
              </div>
              <div className="mini-stat">
                <h3>AI</h3>
                <p>Smart Recommendations</p>
              </div>
              <div className="mini-stat">
                <h3>24/7</h3>
                <p>Progress Access</p>
              </div>
            </div>
          </div>

          <div className="landing-right">
            <div className="glass-panel">
              <h3>Platform Features</h3>

              <div className="feature-grid">
                <div className="feature-card">
                  <FaRunning />
                  <span>Step Tracking</span>
                </div>
                <div className="feature-card">
                  <FaChartLine />
                  <span>Visual Analytics</span>
                </div>
                <div className="feature-card">
                  <FaHeartbeat />
                  <span>Health Insights</span>
                </div>
                <div className="feature-card">
                  <FaRobot />
                  <span>AI Guidance</span>
                </div>
                <div className="feature-card">
                  <FaAppleAlt />
                  <span>Diet Awareness</span>
                </div>
                <div className="feature-card">
                  <FaDumbbell />
                  <span>Workout Focus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-info-cards">
          <div className="info-card">
            <h3>Track Every Day</h3>
            <p>
              Log steps and calories daily and review your consistency with
              charts and progress summaries.
            </p>
          </div>
          <div className="info-card">
            <h3>AI Fitness Suggestions</h3>
            <p>
              Receive helpful recommendations depending on your recent activity,
              averages, and goal progress.
            </p>
          </div>
          <div className="info-card">
            <h3>Modern Dashboard</h3>
            <p>
              Enjoy colorful cards, visual reports, progress rings, tips, and
              motivational content in one place.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;