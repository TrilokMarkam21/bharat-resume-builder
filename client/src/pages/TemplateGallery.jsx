// client/src/pages/TemplateGallery.jsx
import { useNavigate } from "react-router-dom";

const TEMPLATE_OPTIONS = [
  {
    id: "ats-basic",
    name: "Clean Classic",
    description: "Single-column, recruiter-style layout for most jobs.",
    badge: "Recommended",
    layout: "classic",
  },
  {
    id: "modern-flex",
    name: "Modern Header",
    description: "Strong header band, clear sections, good for office roles.",
    badge: "Popular",
    layout: "modern",
  },
  {
    id: "compact",
    name: "Compact One‑Pager",
    description: "Tighter layout to fit more content on one page.",
    badge: "",
    layout: "compact",
  },
];

function TemplateGallery() {
  const navigate = useNavigate();

  const handleChoose = (templateId) => {
    localStorage.setItem("brb_templateKey", templateId);
    navigate("/builder");
  };

  const renderPreview = (layout) => {
    switch (layout) {
      case "classic":
        return (
          <>
            <div className="thumb-header-bar thumb-header-classic" />
            <div className="thumb-lines thumb-lines-wide" />
            <div className="thumb-lines thumb-lines-narrow" />
            <div className="thumb-footer-bar" />
          </>
        );
      case "modern":
        return (
          <>
            <div className="thumb-header-bar thumb-header-modern">
              <div className="thumb-avatar-circle" />
              <div className="thumb-header-text" />
            </div>
            <div className="thumb-two-column">
              <div className="thumb-side-column" />
              <div className="thumb-main-column">
                <div className="thumb-main-block" />
                <div className="thumb-main-block small" />
              </div>
            </div>
          </>
        );
      case "compact":
      default:
        return (
          <>
            <div className="thumb-header-bar thumb-header-compact" />
            <div className="thumb-lines thumb-lines-compact-1" />
            <div className="thumb-lines thumb-lines-compact-2" />
            <div className="thumb-lines thumb-lines-compact-3" />
          </>
        );
    }
  };

  return (
    <div className="template-gallery-layout">
      <header className="template-gallery-header">
        <h2>Templates we recommend for you</h2>
        <p>You can always change your template later inside the builder.</p>

        <div className="template-filter-bar">
          <div className="template-filter-group">
            <span className="filter-label">Filter by</span>
            <select className="filter-select">
              <option>All layouts</option>
              <option>Simple</option>
              <option>Modern</option>
              <option>Compact</option>
            </select>
            <select className="filter-select">
              <option>All content</option>
              <option>Skills focused</option>
              <option>Experience focused</option>
            </select>
          </div>

          <div className="template-filter-group">
            <span className="filter-label">Colors</span>
            <div className="template-color-dots">
              {[
                "#111827",
                "#6b7280",
                "#6366f1",
                "#0ea5e9",
                "#22c55e",
                "#f97316",
                "#ef4444",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  className="color-dot"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="template-grid">
        {TEMPLATE_OPTIONS.map((tpl) => (
          <article key={tpl.id} className="template-card-large">
            <div className="template-thumb-large">
              {tpl.badge && (
                <span className="template-badge-top">{tpl.badge}</span>
              )}
              {renderPreview(tpl.layout)}
            </div>
            <div className="template-card-footer">
              <div>
                <div className="template-title-main">{tpl.name}</div>
                <div className="template-sub-main">{tpl.description}</div>
              </div>
              <button
                type="button"
                className="btn-template-choose"
                onClick={() => handleChoose(tpl.id)}
              >
                Choose template
              </button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

export default TemplateGallery;
