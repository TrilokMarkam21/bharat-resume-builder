// client/src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

function ProfilePage() {
  const { resumeId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const loadResume = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/public/resume/${resumeId}`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading public resume:", err);
      setError(
        "Unable to load this resume. It may have been removed or the link is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!data || !data.resumeId) return;

    try {
      setCommentLoading(true);
      setError("");
      await axios.post(`${API_BASE}/resumes/${data.resumeId}/comments`, {
        text: commentText,
        author: commentAuthor || "Reviewer",
      });

      setCommentText("");
      await loadResume();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-layout">
        <div className="card-elevated">
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-layout">
        <div className="card-elevated">
          <p style={{ color: "#fb7185" }}>{error}</p>
          <p style={{ marginTop: "0.5rem" }}>
            <Link to="/builder" className="btn-primary">
              Go back to builder
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.latestVersion) {
    return (
      <div className="profile-layout">
        <div className="card-elevated">
          <p>No resume data available.</p>
        </div>
      </div>
    );
  }

  const r = data.latestVersion;

  return (
    <div className="profile-layout">
      <section className="card-elevated profile-main">
        <header className="profile-header">
          <div className="profile-avatar">
            <span>{(r.fullName || "U").charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-heading">
            <h2 className="profile-name">{r.fullName || "Unnamed Candidate"}</h2>
            <p className="profile-role">{r.role || "Job Seeker"}</p>
            <p className="profile-contact">
              {r.email && <span>{r.email}</span>}
              {r.email && r.phone && <span> · </span>}
              {r.phone && <span>{r.phone}</span>}
            </p>
          </div>
        </header>

        {r.summary && (
          <section className="profile-section">
            <h3 className="profile-section-title">Summary</h3>
            <p className="profile-section-text">{r.summary}</p>
          </section>
        )}

        {r.skills && r.skills.length > 0 && (
          <section className="profile-section">
            <h3 className="profile-section-title">Skills</h3>
            <div className="profile-skill-list">
              {r.skills.map((skill, idx) => (
                <span key={idx} className="profile-skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {r.experience && r.experience.length > 0 && (
          <section className="profile-section">
            <h3 className="profile-section-title">Experience</h3>
            {r.experience.map((exp, idx) => (
              <div key={idx} className="profile-item">
                <p className="profile-item-title">
                  {exp.position}{" "}
                  {exp.company && <span className="profile-item-dot">·</span>}{" "}
                  {exp.company}
                </p>
                <p className="profile-item-sub">
                  {exp.startDate} {exp.endDate && `– ${exp.endDate}`}
                </p>
                {exp.description && (
                  <p className="profile-item-text">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {r.education && r.education.length > 0 && (
          <section className="profile-section">
            <h3 className="profile-section-title">Education</h3>
            {r.education.map((edu, idx) => (
              <div key={idx} className="profile-item">
                <p className="profile-item-title">
                  {edu.degree}{" "}
                  {edu.institution && (
                    <>
                      <span className="profile-item-dot">·</span>{" "}
                      {edu.institution}
                    </>
                  )}
                </p>
                {edu.year && (
                  <p className="profile-item-sub">{edu.year}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <footer className="profile-footer-meta">
          <p>Resume ID: {data.resumeId}</p>
          <p>Generated by Bharat Resume Builder</p>
        </footer>
      </section>

      {/* Comments / feedback card */}
      <section className="card-outline profile-comments">
        <h3 className="profile-section-title">Feedback / Comments</h3>

        {r.comments && r.comments.length > 0 ? (
          <div className="profile-comment-list">
            {r.comments.map((c, idx) => (
              <div key={idx} className="profile-comment">
                <p className="profile-comment-text">{c.text}</p>
                <p className="profile-comment-meta">
                  — {c.author || "Reviewer"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-comment-empty">
            No comments yet. Be the first to leave feedback.
          </p>
        )}

        <form onSubmit={handleAddComment} className="profile-comment-form">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
          />
          <textarea
            placeholder="Write feedback for this candidate..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button type="submit" disabled={commentLoading}>
            {commentLoading ? "Posting..." : "Add Comment"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
