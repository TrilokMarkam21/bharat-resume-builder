// client/src/config/templateConfig.js

// Template library varies by job category + visual style.
// Used ONLY for layout/colors/ordering, never to print category labels.
export const TEMPLATE_LIBRARY = {
  "blue-collar": {
    "ats-basic": {
      name: "Blue‑collar ATS",
      description: "Skills and experience highlighted first, 1‑page layout.",
      accentColor: "#22c55e",
      borderColor: "rgba(34, 197, 94, 0.7)",
      headerBg: "#111827",
      order: ["summary", "skills", "experience", "education"],
    },
    "modern-flex": {
      name: "Blue‑collar Modern",
      description: "Bolder headings, more whitespace, still ATS‑safe.",
      accentColor: "#10b981",
      borderColor: "rgba(16, 185, 129, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "skills", "education"],
    },
    compact: {
      name: "Blue‑collar Compact",
      description: "Very tight 1‑page version for quick scans.",
      accentColor: "#0ea5e9",
      borderColor: "rgba(14, 165, 233, 0.7)",
      headerBg: "#020617",
      order: ["summary", "skills", "experience", "education"],
    },
  },

  "grey-collar": {
    "ats-basic": {
      name: "Service ATS",
      description: "Field + customer work, with clear dates and locations.",
      accentColor: "#6366f1",
      borderColor: "rgba(99, 102, 241, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "skills", "education"],
    },
    "modern-flex": {
      name: "Service Modern",
      description: "Modern card feel, emphasis on responsibilities.",
      accentColor: "#a855f7",
      borderColor: "rgba(168, 85, 247, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "skills", "education"],
    },
    compact: {
      name: "Service Compact",
      description: "When you want to fit 2–3 roles on one page.",
      accentColor: "#f97316",
      borderColor: "rgba(249, 115, 22, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "education", "skills"],
    },
  },

  "white-collar": {
    "ats-basic": {
      name: "Office ATS",
      description: "Classic single‑column, recruiter‑style layout.",
      accentColor: "#2563eb",
      borderColor: "rgba(37, 99, 235, 0.7)",
      headerBg: "#111827",
      order: ["summary", "experience", "education", "skills"],
    },
    "modern-flex": {
      name: "Office Modern",
      description: "More visual hierarchy, ideal for corporate roles.",
      accentColor: "#7c3aed",
      borderColor: "rgba(124, 58, 237, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "skills", "education"],
    },
    compact: {
      name: "Office Compact",
      description: "Very compact, useful for senior profiles.",
      accentColor: "#facc15",
      borderColor: "rgba(250, 204, 21, 0.7)",
      headerBg: "#020617",
      order: ["summary", "experience", "skills", "education"],
    },
  },
};

export const getTemplateFor = (jobCategory, templateKey) => {
  const byCategory = TEMPLATE_LIBRARY[jobCategory] || TEMPLATE_LIBRARY["blue-collar"];
  return byCategory[templateKey] || byCategory["ats-basic"];
};
