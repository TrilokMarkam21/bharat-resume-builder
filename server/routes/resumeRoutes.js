// server/routes/resumeRoutes.js
import express from "express";
import { Resume } from "../models/Resume.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const router = express.Router();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
// basic regex for email + Indian mobile (server-side)
const simpleEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const indianMobileRegex = /^[6-9][0-9]{9}$/;

// Create new resume version (from form/voice/chat input)
router.post("/resumes", async (req, res) => {
  try {
    const { userIdentifier, versionData } = req.body;

    if (!userIdentifier || !versionData) {
      return res
        .status(400)
        .json({ message: "userIdentifier and versionData are required" });
    }

    // Basic validation for email/phone in versionData
    const { email, phone } = versionData;

    if (email && !simpleEmailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (phone) {
      const digitsOnly = phone.replace(/\D/g, "");
      if (!indianMobileRegex.test(digitsOnly)) {
        return res.status(400).json({
          message:
            "Invalid mobile number. Expecting 10-digit Indian mobile starting with 6-9.",
        });
      }
    }

    let resume = await Resume.findOne({ userIdentifier });

    if (!resume) {
      resume = new Resume({
        userIdentifier,
        versions: [versionData],
      });
    } else {
      resume.versions.push(versionData);
    }

    await resume.save();

    const latestVersion = resume.versions[resume.versions.length - 1];

    res.status(201).json({
      message: "Resume version saved",
      resumeId: resume._id,
      latestVersion,
    });
  } catch (err) {
    console.error("Error creating resume version:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get latest resume version for a user
router.get("/resumes/latest/:userIdentifier", async (req, res) => {
  try {
    const { userIdentifier } = req.params;

    const resume = await Resume.findOne({ userIdentifier });

    if (!resume || resume.versions.length === 0) {
      return res.status(404).json({ message: "No resume found" });
    }

    const latestVersion = resume.versions[resume.versions.length - 1];

    res.json({
      resumeId: resume._id,
      latestVersion,
      versionsCount: resume.versions.length,
    });
  } catch (err) {
    console.error("Error fetching latest resume:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all versions for a user
router.get("/resumes/versions/:userIdentifier", async (req, res) => {
  try {
    const { userIdentifier } = req.params;

    const resume = await Resume.findOne({ userIdentifier });

    if (!resume || resume.versions.length === 0) {
      return res.status(404).json({ message: "No resume versions found" });
    }

    res.json({
      resumeId: resume._id,
      versions: resume.versions,
    });
  } catch (err) {
    console.error("Error fetching versions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment/feedback to latest version
router.post("/resumes/:resumeId/comments", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { text, author } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume || !resume.versions || resume.versions.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const latestIndex = resume.versions.length - 1;
    const latestVersion = resume.versions[latestIndex];

    if (!latestVersion.comments) {
      latestVersion.comments = [];
    }

    latestVersion.comments.push({
      text,
      author: author || "Reviewer",
      createdAt: new Date(),
    });

    resume.markModified("versions");

    await resume.save();

    res.status(201).json({
      message: "Comment added to latest version",
      latestVersion,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/resumes/:resumeId/pdf - Download nicely formatted PDF
router.get("/resumes/:resumeId/pdf", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume || !resume.versions.length) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const latestVersion = resume.versions[resume.versions.length - 1];

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 }, // clean page margins
    });

    const safeName =
      (latestVersion.fullName || "Resume").replace(/\s+/g, "_") + ".pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);

    doc.pipe(res);

    // ========== HEADER (Name + role + contact) ==========
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(latestVersion.fullName || "Candidate Name", { align: "center" });

    doc.moveDown(0.3);

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#000000")
      .text(latestVersion.role || "Target Role", { align: "center" });

    doc.moveDown(0.2);

    const contactParts = [];
    if (latestVersion.email) contactParts.push(latestVersion.email);
    if (latestVersion.phone) contactParts.push(latestVersion.phone);
    if (latestVersion.city) contactParts.push(latestVersion.city);

    if (contactParts.length > 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(contactParts.join(" · "), { align: "center" });
    }

    if (latestVersion.linkedin || latestVersion.portfolio) {
      const links = [];
      if (latestVersion.linkedin) links.push(latestVersion.linkedin);
      if (latestVersion.portfolio) links.push(latestVersion.portfolio);
      doc
        .fontSize(9)
        .fillColor("#1e40af")
        .text(links.join(" · "), { align: "center" });
    }

    doc.moveDown(1);

    // Helper to render section heading with underline
    const renderSectionHeading = (title) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(title.toUpperCase());
      const y = doc.y;
      doc
        .moveTo(doc.page.margins.left, y)
        .lineTo(doc.page.width - doc.page.margins.right, y)
        .strokeColor("#d1d5db")
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.4);
    };

    // ========== SUMMARY ==========
    if (latestVersion.summary && latestVersion.summary.trim()) {
      renderSectionHeading("Summary");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(latestVersion.summary, {
          align: "left",
        });
      doc.moveDown(0.8);
    }

    // ========== SKILLS ==========
    if (latestVersion.skills && latestVersion.skills.length > 0) {
      renderSectionHeading("Skills");
      const skillsText = latestVersion.skills.join(" · ");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(skillsText, { align: "left" });
      doc.moveDown(0.8);
    }

    // --- EXPERIENCE (optional, if you later add array) ---
if (latestVersion.experience && latestVersion.experience.length > 0) {
  renderSectionHeading("Experience");
  latestVersion.experience.forEach((exp, idx) => {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(exp.jobTitle || "Job Title");

    const companyBits = [];
    if (exp.company) companyBits.push(exp.company);
    if (exp.duration) companyBits.push(exp.duration);

    if (companyBits.length > 0) {
      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .fillColor("#000000")
        .text(companyBits.join(" · "));
    }

    if (exp.responsibilities) {
      doc.moveDown(0.2);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(exp.responsibilities, { align: "left" });
    }

    if (idx < latestVersion.experience.length - 1) {
      doc.moveDown(0.6);
    }
  });
  doc.moveDown(0.8);
}

        // --- PROJECTS SECTION ---
    if (latestVersion.projects && latestVersion.projects.length > 0) {
      renderSectionHeading("Projects");
      latestVersion.projects.forEach((proj, idx) => {
        if (!proj) return;

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(proj.name || "Project");

        if (proj.description) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#000000")
            .text(proj.description, { align: "left" });
        }

        if (idx < latestVersion.projects.length - 1) {
          doc.moveDown(0.5);
        }
      });
      doc.moveDown(0.8);
    }


    // ========== EDUCATION ==========
    if (latestVersion.educationLevel && latestVersion.educationLevel.trim()) {
      renderSectionHeading("Education");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(latestVersion.educationLevel);
      doc.moveDown(0.8);
    }

    // ========== LICENSES / CERTIFICATES ==========
    if (latestVersion.licenses && latestVersion.licenses.trim()) {
      renderSectionHeading("Licenses & Certificates");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(latestVersion.licenses);
      doc.moveDown(0.8);
    }

    // ========== ACHIEVEMENTS ==========
    if (latestVersion.achievements && latestVersion.achievements.trim()) {
      renderSectionHeading("Achievements");
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000000")
        .text(latestVersion.achievements, { align: "left" });
      doc.moveDown(0.8);
    }

    // ========== FOOTER ==========
    const footerY = doc.page.height - 30;
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(
        "Resume generated via Bharat Resume Builder",
        doc.page.margins.left,
        footerY,
        {
          align: "center",
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "Failed to generate PDF", details: error.message });
  }
});



// Generate QR code that links to public profile
router.get("/resumes/:resumeId/qr", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const profileUrl = `http://localhost:5173/profile/${resumeId}`;

    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 300,
      margin: 2,
    });

    res.json({
      profileUrl,
      qrDataUrl,
    });
  } catch (err) {
    console.error("Error generating QR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Public profile data
router.get("/public/resume/:resumeId", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);

    if (!resume || !resume.versions || resume.versions.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const latestVersion = resume.versions[resume.versions.length - 1];

    res.json({
      resumeId: resume._id,
      latestVersion,
    });
  } catch (err) {
    console.error("Error fetching public resume:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
