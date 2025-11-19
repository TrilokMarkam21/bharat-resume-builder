// client/src/components/ResumePreviewCard.jsx
import { getTemplateFor } from "../config/templateConfig.js";

function ResumePreviewCard({
  fullName,
  role,
  email,
  phone,
  summary,
  skillsText,
  jobCategory,
  templateKey,
  expTitle,
  expCompany,
  expDuration,
  expDetails,
  projectName,
  projectDescription,
}) {
  const tpl = getTemplateFor(jobCategory, templateKey);

  const baseSkills = skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const initials =
    (fullName || "Candidate")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "U";

  const layout = templateKey; // "ats-basic" | "modern-flex" | "compact"

  const renderExperience = (extraProps = {}) => {
    if (!expTitle && !expCompany && !expDuration && !expDetails) return null;

    return (
      <section className="preview-section" {...extraProps}>
        <div className="preview-section-title">Experience</div>
        <div className="preview-section-text">
          <strong>{expTitle || "Job title"}</strong>
          {expCompany || expDuration ? (
            <>
              {" · "}
              <span>
                {[expCompany, expDuration].filter(Boolean).join(" · ")}
              </span>
            </>
          ) : null}
          {expDetails && (
            <>
              <br />
              <span>{expDetails}</span>
            </>
          )}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projectName && !projectDescription) return null;

    return (
      <section className="preview-section">
        <div className="preview-section-title">Projects</div>
        <div className="preview-section-text">
          <strong>{projectName || "Project name"}</strong>
          {projectDescription && (
            <>
              <br />
              <span>{projectDescription}</span>
            </>
          )}
        </div>
      </section>
    );
  };

  const renderBody = () => {
    if (layout === "modern-flex") {
      // Modern: summary and skills side by side, experience full-width, then projects
      return (
        <div className="preview-body preview-body-modern">
          <section className="preview-section">
            <div className="preview-section-title">Summary</div>
            <div className="preview-section-text">
              {summary ||
                "Write 2–3 lines about your experience, tools you use, and key results."}
            </div>
          </section>

          <section className="preview-section">
            <div className="preview-section-title">Skills</div>
            <div className="preview-skill-list">
              {baseSkills.length > 0 ? (
                baseSkills.map((s, i) => (
                  <span key={i} className="preview-skill-pill">
                    {s}
                  </span>
                ))
              ) : (
                <span className="preview-section-text">
                  Add your main skills – technical, sales, or service skills.
                </span>
              )}
            </div>
          </section>

          {renderExperience({ style: { gridColumn: "1 / -1" } })}
          {renderProjects()}
        </div>
      );
    }

    if (layout === "compact") {
      // Compact: tighter fonts and pills
      return (
        <div className="preview-body preview-body-compact">
          <section className="preview-section">
            <div className="preview-section-title">Summary</div>
            <div className="preview-section-text">
              {summary ||
                'Short, focused summary. Example: "2+ years in delivery and warehouse work, reliable and on-time."'}
            </div>
          </section>

          <section className="preview-section">
            <div className="preview-section-title">Skills</div>
            <div className="preview-skill-list">
              {baseSkills.length > 0 ? (
                baseSkills.map((s, i) => (
                  <span
                    key={i}
                    className="preview-skill-pill compact-pill"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="preview-section-text">
                  Add 5–8 short skills; they will be packed more tightly.
                </span>
              )}
            </div>
          </section>

          {renderExperience()}
          {renderProjects()}
        </div>
      );
    }

    // Default ATS-basic: classic stacked layout
    return (
      <div className="preview-body">
        <section className="preview-section">
          <div className="preview-section-title">Summary</div>
          <div className="preview-section-text">
            {summary ||
              "Write 2–3 lines about your experience, strengths and work ethic."}
          </div>
        </section>

        <section className="preview-section">
          <div className="preview-section-title">Skills</div>
          <div className="preview-skill-list">
            {baseSkills.length > 0 ? (
              baseSkills.map((s, i) => (
                <span key={i} className="preview-skill-pill">
                  {s}
                </span>
              ))
            ) : (
              <span className="preview-section-text">
                Add a few skills – for example: Customer service, Cash
                handling, Inventory.
              </span>
            )}
          </div>
        </section>

        {renderExperience()}
        {renderProjects()}
      </div>
    );
  };

  return (
    <div className="builder-preview card-outline">
      <h3 className="builder-side-title">Live resume preview</h3>
      <p className="builder-side-sub">
        This preview changes format based on the template you choose in the
        Templates step.
      </p>

      <div
        className="preview-card"
        style={{
          borderColor: tpl.borderColor,
        }}
      >
        <header
          className="preview-header"
          style={{ background: tpl.headerBg }}
        >
          <div className="preview-avatar">{initials}</div>
          <div>
            <div className="preview-name">
              {fullName || "Your full name"}
            </div>
            <div className="preview-role">
              {role || "Target role (e.g. Retail Sales Associate)"}
            </div>
            <div className="preview-contact">
              {(email || "email@example.com") +
                " · " +
                (phone || "+91-XXXXXXXXXX")}
            </div>
          </div>
        </header>

        {renderBody()}
      </div>
    </div>
  );
}

export default ResumePreviewCard;
