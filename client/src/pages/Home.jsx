// client/src/pages/Home.jsx
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-layout">
      {/* Left: hero */}
      <section className="home-hero card-elevated">
        <p className="home-tag">Built for Bharat&apos;s workforce</p>

        <h1 className="home-heading">
          Create an ATS‑ready resume in minutes.
        </h1>

        <p className="home-text">
          Use form, voice or guided chat to capture details for delivery,
          retail, field, and office jobs. Get a clean resume PDF and a
          shareable profile link that works on any device.
        </p>

        <div className="home-actions">
          <Link to="/builder" className="btn-primary">
            Start free resume
          </Link>
          <Link to="/templates" className="btn-ghost">
            Browse templates
          </Link>
        </div>

        <ul className="home-benefits">
          <li>Templates that stay friendly to ATS and recruiters.</li>
          <li>Questions tailored to blue, grey, and white‑collar roles.</li>
          <li>Download PDF or share a QR profile in seconds.</li>
        </ul>
        {/* Decorative hero visual to fill space */}
        <div className="home-hero-visual">
          <div className="home-hero-card">
            <div className="home-hero-card-header" />
            <div className="home-hero-card-lines">
              <div className="home-hero-line long" />
              <div className="home-hero-line" />
              <div className="home-hero-line" />
            </div>
          </div>
        </div>
      </section>

      {/* Right: how it works + mini templates */}
      <section className="home-right">
        <div id="how-it-works" className="card-outline home-steps">
          <h3 className="feature-title">How it works</h3>
          <ol className="steps-list">
            <li>
              <span className="step-label">1</span>
              Choose a layout that fits your style and job type.
            </li>
            <li>
              <span className="step-label">2</span>
              Answer simple questions using form, voice, or chat.
            </li>
            <li>
              <span className="step-label">3</span>
              Download an ATS‑friendly PDF and share your QR profile.
            </li>
          </ol>
        </div>

        <div className="card-outline home-templates">
          <h3 className="feature-title">Popular templates</h3>
          <p className="feature-text">
            Pick a starting layout; you can always switch designs inside the
            builder without losing your information.
          </p>

          <div className="template-grid">
            <Link to="/templates" className="template-card">
              <div className="template-thumb template-thumb-ats">
                <span className="template-badge">Recommended</span>
              </div>
              <div className="template-info">
                <div className="template-title">Clean Classic</div>
                <div className="template-sub">
                  Single‑column layout that recruiters and ATS both like.
                </div>
              </div>
            </Link>

            <Link to="/templates" className="template-card">
              <div className="template-thumb template-thumb-modern">
                <span className="template-badge template-badge-secondary">
                  Modern
                </span>
              </div>
              <div className="template-info">
                <div className="template-title">Modern Header</div>
                <div className="template-sub">
                  Strong top bar and sections, great for office roles.
                </div>
              </div>
            </Link>

            <Link to="/templates" className="template-card">
              <div className="template-thumb template-thumb-compact" />
              <div className="template-info">
                <div className="template-title">Compact One‑Pager</div>
                <div className="template-sub">
                  Tighter layout when you want everything on a single page.
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
