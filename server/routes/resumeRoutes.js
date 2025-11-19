import express from "express";
import { Resume } from "../models/Resume.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";


const router = express.Router();

// Create new resume version (from form/voice/chat input)
router.post("/resumes", async (req, res) => {
  try {
    const { userIdentifier, versionData } = req.body; // versionData contains all resume fields

    if (!userIdentifier || !versionData) {
      return res.status(400).json({ message: "userIdentifier and versionData are required" });
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

// Get all versions for a user (simple versioning history)
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

    // Ensure comments array exists
    if (!latestVersion.comments) {
      latestVersion.comments = [];
    }

    latestVersion.comments.push({
      text,
      author: author || "Reviewer",
      createdAt: new Date(),
    });

    // Tell Mongoose that nested array changed
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

// Generate PDF for latest resume version
router.get("/resumes/:resumeId/pdf", async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);

    if (!resume || !resume.versions || resume.versions.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const latestVersion = resume.versions[resume.versions.length - 1];

    // Set headers so browser downloads the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${latestVersion.fullName || "resume"}.pdf`
    );

    const doc = new PDFDocument();

    doc.pipe(res);

    doc.fontSize(20).text(latestVersion.fullName || "Unnamed", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Role: ${latestVersion.role || ""}`);
    doc.text(`Email: ${latestVersion.email || ""}`);
    doc.text(`Phone: ${latestVersion.phone || ""}`);
    doc.moveDown();

    if (latestVersion.summary) {
      doc.fontSize(14).text("Summary");
      doc.fontSize(12).text(latestVersion.summary);
      doc.moveDown();
    }

    if (latestVersion.skills && latestVersion.skills.length > 0) {
      doc.fontSize(14).text("Skills");
      doc.fontSize(12).text(latestVersion.skills.join(", "));
      doc.moveDown();
    }

    if (latestVersion.experience && latestVersion.experience.length > 0) {
      doc.fontSize(14).text("Experience");
      latestVersion.experience.forEach((exp) => {
        doc.fontSize(12).text(`${exp.position || ""} - ${exp.company || ""}`);
        doc.text(`${exp.startDate || ""} - ${exp.endDate || ""}`);
        if (exp.description) {
          doc.text(exp.description);
        }
        doc.moveDown();
      });
    }

    if (latestVersion.education && latestVersion.education.length > 0) {
      doc.fontSize(14).text("Education");
      latestVersion.education.forEach((edu) => {
        doc.fontSize(12).text(`${edu.degree || ""} - ${edu.institution || ""} (${edu.year || ""})`);
      });
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Generate QR code that links to public profile
router.get("/resumes/:resumeId/qr", async (req, res) => {
  try {
    const { resumeId } = req.params;

    // URL where mobile-friendly profile will be served
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

// Public profile data (for mobile-friendly web profile)
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
