// client/src/pages/ResumeBuilder.jsx
import { useState, useRef } from "react";
import axios from "axios";
import ResumePreviewCard from "../components/ResumePreviewCard.jsx";

const API_BASE = "http://localhost:5000/api";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

// Simple email validation (frontend)
const isValidEmail = (value) => {
  if (!value) return true;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(value);
};

// Simple Indian mobile validation (10 digits, starts 6–9)
const isValidIndianMobile = (value) => {
  if (!value) return true;
  const digitsOnly = value.replace(/\D/g, "");
  return /^[6-9][0-9]{9}$/.test(digitsOnly);
};

// Very simple keyword-based skill inference from summary text
const inferSkillsFromSummary = (summary) => {
  if (!summary) return [];
  const text = summary.toLowerCase();

  const mappedSkills = [];
  const addIf = (cond, skill) => {
    if (cond) mappedSkills.push(skill);
  };

  // Blue / grey collar examples
  addIf(text.includes("electric"), "Electrical work");
  addIf(text.includes("wiring"), "Wiring");
  addIf(text.includes("ac repair") || text.includes("air conditioner"), "AC repair");
  addIf(text.includes("plumb"), "Plumbing");
  addIf(text.includes("driver") || text.includes("driving"), "Driving");
  addIf(text.includes("delivery"), "Delivery");
  addIf(text.includes("warehouse") || text.includes("inventory"), "Inventory management");
  addIf(text.includes("welding"), "Welding");

  // White collar / tech examples
  addIf(text.includes("javascript"), "JavaScript");
  addIf(text.includes("react"), "React");
  addIf(text.includes("node"), "Node.js");
  addIf(text.includes("mongo"), "MongoDB");
  addIf(text.includes("frontend") || text.includes("front-end"), "Frontend development");
  addIf(text.includes("backend") || text.includes("back-end"), "Backend development");

  // Generic soft skills
  addIf(text.includes("team") || text.includes("collaborat"), "Teamwork");
  addIf(text.includes("customer") || text.includes("client"), "Customer handling");
  addIf(text.includes("communication"), "Communication");
  addIf(text.includes("lead") || text.includes("supervis"), "Leadership");

  return Array.from(new Set(mappedSkills));
};

// Category-specific helper texts (content adapts by job type, but not printed as labels)
const summaryPromptByCategory = (jobCategory) => {
  switch (jobCategory) {
    case "blue-collar":
      return "Focus on simple, practical details: your years of hands-on work, main tasks (driving, delivery, housekeeping, warehouse, electrician, plumbing, security, construction) and reliability.";
    case "grey-collar":
      return "Write a short summary of your customer or field work, communication skills, sales or service targets, and tools you use (POS, billing, basic apps).";
    case "white-collar":
      return "Summarise your domain expertise, key technical and soft skills, and 1–2 achievements with measurable impact.";
    default:
      return "In 2–3 sentences, describe your experience and strengths.";
  }
};

const skillsPlaceholderByCategory = (jobCategory) => {
  switch (jobCategory) {
    case "blue-collar":
      return "e.g. Driving, Navigation, Loading/unloading, Electrical wiring, Plumbing, Safety practices";
    case "grey-collar":
      return "e.g. Customer service, Sales closing, POS billing, Field visits, Phone follow-ups, CRM tools";
    case "white-collar":
      return "e.g. React, Data analysis, Excel, Marketing strategy, Stakeholder management, Leadership";
    default:
      return "e.g. Wiring, Maintenance, Customer handling";
  }
};

const educationPlaceholderByCategory = (jobCategory) => {
  switch (jobCategory) {
    case "blue-collar":
      return "e.g. 8th Pass, 10th Pass, 12th Pass";
    case "grey-collar":
      return "e.g. 10th Pass, 12th Pass, Diploma in retail / customer support";
    case "white-collar":
      return "e.g. B.Com from Delhi University, B.Tech in CSE, MBA Marketing";
    default:
      return "e.g. 10th Pass, 12th Pass, Diploma";
  }
};

const licensesPlaceholderByCategory = (jobCategory) => {
  switch (jobCategory) {
    case "blue-collar":
      return "e.g. LMV Driving License, Commercial License, Safety Training Certificate";
    case "grey-collar":
      return "e.g. Retail training, Customer service certificate, Basic computer course";
    case "white-collar":
      return "e.g. Google Data Analytics, CPA, AWS, MS Office certification";
    default:
      return "e.g. Driving license, safety or job-related certificates";
  }
};

const achievementsPlaceholderByCategory = (jobCategory) => {
  switch (jobCategory) {
    case "blue-collar":
      return "e.g. Best delivery performer, zero-accident record, completed 100+ orders/day";
    case "grey-collar":
      return "e.g. Achieved 120% of sales target, Employee of the Month, reduced complaints";
    case "white-collar":
      return "e.g. Improved process by 20%, led 5-member team, published 2 papers";
    default:
      return "e.g. Targets achieved, awards, leadership roles";
  }
};

function ResumeBuilder() {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [jobCategory, setJobCategory] = useState("blue-collar");
  // TemplateKey still used internally, default from localStorage or ATS
  const [templateKey] = useState(
    localStorage.getItem("brb_templateKey") || "ats-basic"
  );

  // extra fields by job-type requirements
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [licenses, setLicenses] = useState("");
  const [achievementsText, setAchievementsText] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // experience
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDetails, setExpDetails] = useState("");

  // project (white-collar)
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [latestResume, setLatestResume] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [listeningField, setListeningField] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [mode, setMode] = useState("form"); // "form" | "chat"
  const [chatStep, setChatStep] = useState(0);

  const chatSteps = [
    {
      id: "identifier",
      title: "Contact",
      question: "What is your phone number or email? This will be your identifier.",
      field: "userIdentifier",
    },
    {
      id: "name",
      title: "Name",
      question: "What is your full name?",
      field: "fullName",
    },
    {
      id: "role",
      title: "Role",
      question:
        "Which role are you targeting? (e.g. Electrician, Delivery Executive, Software Engineer)",
      field: "role",
    },
    {
      id: "summary",
      title: "Summary",
      question: "",
      field: "summary",
    },
    {
      id: "skills",
      title: "Skills",
      question:
        "List your main skills separated by commas. (e.g. Wiring, AC repair, Customer handling)",
      field: "skillsText",
    },
    {
      id: "review",
      title: "Review",
      question: "Review your details below and click Save to create your resume.",
      field: null,
    },
  ];

  const currentChatStep = chatSteps[chatStep];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setQrDataUrl(null);
    setProfileUrl(null);

    const emailOk = isValidEmail(email);
    const phoneOk = isValidIndianMobile(phone);

    setEmailError(emailOk ? "" : "Please enter a valid email address.");
    setPhoneError(
      phoneOk ? "" : "Please enter a valid 10-digit Indian mobile number starting with 6–9."
    );

    if (!emailOk || !phoneOk) return;

    setLoading(true);

    try {
      const manualSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const inferredSkills = inferSkillsFromSummary(summary);
      const skills = Array.from(new Set([...manualSkills, ...inferredSkills]));

      const versionData = {
        jobCategory,
        templateKey,
        fullName,
        email,
        phone,
        role,
        summary,
        skills,
        age,
        city,
        languages,
        educationLevel,
        licenses,
        achievements: achievementsText,
        linkedin,
        portfolio,
        experience:
          expTitle || expCompany || expDuration || expDetails
            ? [
                {
                  jobTitle: expTitle,
                  company: expCompany,
                  duration: expDuration,
                  responsibilities: expDetails,
                },
              ]
            : [],
        projects:
          projectName || projectDescription
            ? [
                {
                  name: projectName,
                  description: projectDescription,
                },
              ]
            : [],
        education: [],
      };

      const res = await axios.post(`${API_BASE}/resumes`, {
        userIdentifier,
        versionData,
      });

      setLatestResume(res.data.latestVersion);
      setResumeId(res.data.resumeId);
    } catch (err) {
      console.error("Error saving resume:", err);
      setError("Failed to save resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!resumeId) return;
    window.open(`${API_BASE}/resumes/${resumeId}/pdf`, "_blank");
  };

  const handleGenerateQr = async () => {
    if (!resumeId) return;
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/resumes/${resumeId}/qr`);
      setQrDataUrl(res.data.qrDataUrl);
      setProfileUrl(res.data.profileUrl);
    } catch (err) {
      console.error("Error generating QR:", err);
      setError("Failed to generate QR code.");
    }
  };

  // AI disabled for now
  const handleGenerateSummaryAI = () => {
    alert(
      "AI summary is disabled in this build (API key not configured). Your summary and auto‑skills still work normally."
    );
  };

  const handleVoiceInput = (fieldName) => {
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setListeningField(fieldName);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setListeningField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningField(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      switch (fieldName) {
        case "fullName":
          setFullName(transcript);
          break;
        case "role":
          setRole(transcript);
          break;
        case "summary":
          setSummary((prev) => (prev ? prev + " " + transcript : transcript));
          break;
        case "skills":
          setSkillsText((prev) => (prev ? prev + ", " + transcript : transcript));
          break;
        default:
          break;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    if (newMode === "chat") setChatStep(0);
  };

  const currentChatFieldValue = () => {
    if (!currentChatStep.field) return "";
    switch (currentChatStep.field) {
      case "userIdentifier":
        return userIdentifier;
      case "fullName":
        return fullName;
      case "role":
        return role;
      case "summary":
        return summary;
      case "skillsText":
        return skillsText;
      default:
        return "";
    }
  };

  const handleChatInputChange = (value) => {
    if (!currentChatStep.field) return;
    switch (currentChatStep.field) {
      case "userIdentifier":
        setUserIdentifier(value);
        break;
      case "fullName":
        setFullName(value);
        break;
      case "role":
        setRole(value);
        break;
      case "summary":
        setSummary(value);
        break;
      case "skillsText":
        setSkillsText(value);
        break;
      default:
        break;
    }
  };

  const goNextChatStep = () => {
    if (chatStep < chatSteps.length - 1) setChatStep((s) => s + 1);
  };

  const goPrevChatStep = () => {
    if (chatStep > 0) setChatStep((s) => s - 1);
  };

  return (
    <div className="builder-layout">
      {/* Left: main builder */}
      <section className="builder-main">
        <h3>Resume Builder</h3>
        <p>
          Fill details on the left; a live resume preview updates on the right
          using an ATS‑friendly template that adapts to your job type. The
          resume itself stays neutral and professional.
        </p>

        {/* High-level steps indicator */}
        <div className="builder-steps">
          <div className="builder-step-item builder-step-complete">
            <span className="builder-step-circle">1</span>
            <span className="builder-step-label">Choose template</span>
          </div>
          <div className="builder-step-separator" />
          <div className="builder-step-item builder-step-current">
            <span className="builder-step-circle">2</span>
            <span className="builder-step-label">Fill details</span>
          </div>
          <div className="builder-step-separator" />
          <div className="builder-step-item">
            <span className="builder-step-circle">3</span>
            <span className="builder-step-label">Download &amp; share</span>
          </div>
        </div>

        {/* Job category selector */}
        <div
          style={{
            marginTop: "0.5rem",
            marginBottom: "0.6rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          {[
            { id: "blue-collar", label: "Blue‑collar jobs", hint: "Delivery, driving, trades" },
            { id: "grey-collar", label: "Grey‑collar jobs", hint: "Retail, sales, service" },
            { id: "white-collar", label: "White‑collar jobs", hint: "Office / knowledge work" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setJobCategory(opt.id)}
              style={{
                borderRadius: "999px",
                border:
                  jobCategory === opt.id
                    ? "1px solid #6366f1"
                    : "1px solid #1f2937",
                padding: "0.35rem 0.9rem",
                background:
                  jobCategory === opt.id
                    ? "rgba(99, 102, 241, 0.22)"
                    : "rgba(15, 23, 42, 0.9)",
                color: "#e5e7eb",
                fontSize: "0.82rem",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.08rem",
              }}
            >
              <span>{opt.label}</span>
              <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                {opt.hint}
              </span>
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div
          style={{
            margin: "0.6rem 0 1rem",
            display: "inline-flex",
            borderRadius: "999px",
            border: "1px solid #555",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => changeMode("form")}
            style={{
              padding: "0.4rem 0.9rem",
              border: "none",
              cursor: "pointer",
              background: mode === "form" ? "#4c4cff" : "transparent",
              color: mode === "form" ? "#fff" : "#ddd",
            }}
          >
            Form + Voice
          </button>
          <button
            type="button"
            onClick={() => changeMode("chat")}
            style={{
              padding: "0.4rem 0.9rem",
              border: "none",
              cursor: "pointer",
              background: mode === "chat" ? "#4c4cff" : "transparent",
              color: mode === "chat" ? "#fff" : "#ddd",
            }}
          >
            Guided Chat
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* FORM MODE */}
        {mode === "form" && (
          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: 500,
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #444",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <h4>Resume Builder (Form + Voice)</h4>

            <label>
              User Identifier (email or phone)
              <input
                type="text"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                required
              />
            </label>

            <label>
              Full Name
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput("fullName")}
                >
                  {isListening && listeningField === "fullName" ? "Stop" : "🎙"}
                </button>
              </div>
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>{emailError}</p>
              )}
            </label>

            <label>
              Phone
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {phoneError && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>{phoneError}</p>
            )}

            {/* Extra basic details */}
            <label>
              Age
              <input
                type="number"
                min="15"
                max="70"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 22"
              />
            </label>

            <label>
              City / Location
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi"
              />
            </label>

            <label>
              Languages known
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder={
                  jobCategory === "blue-collar"
                    ? "e.g. Hindi, basic English"
                    : "e.g. Hindi, English"
                }
              />
            </label>

            {/* White-collar extra header links */}
            {jobCategory === "white-collar" && (
              <>
                <label>
                  LinkedIn (optional)
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. linkedin.com/in/yourname"
                  />
                </label>

                <label>
                  Portfolio / GitHub (optional)
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="e.g. github.com/username or portfolio site"
                  />
                </label>
              </>
            )}

            <label>
              Target Role
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => handleVoiceInput("role")}>
                  {isListening && listeningField === "role" ? "Stop" : "🎙"}
                </button>
              </div>
            </label>

            <label>
              Summary
              <small
                style={{
                  display: "block",
                  color: "#9ca3af",
                  fontSize: "0.76rem",
                  marginBottom: "0.15rem",
                }}
              >
                {summaryPromptByCategory(jobCategory)}
              </small>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput("summary")}
                >
                  {isListening && listeningField === "summary" ? "Stop" : "🎙"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerateSummaryAI}
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.7rem",
                  borderRadius: "999px",
                  border: "1px solid #4b5563",
                  background: "rgba(15,23,42,0.95)",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                Generate / Improve with AI (disabled in this build)
              </button>
            </label>

            <label>
              Skills (comma separated)
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder={skillsPlaceholderByCategory(jobCategory)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput("skills")}
                >
                  {isListening && listeningField === "skills" ? "Stop" : "🎙"}
                </button>
              </div>
              <small style={{ color: "#aaa" }}>
                Some skills may also be auto-inferred from your summary.
              </small>
            </label>

            {/* Education / Licenses / Achievements / Experience / Projects
                Order depends on job category */}
            {jobCategory === "white-collar" ? (
              <>
                {/* White-collar: Experience right after skills */}
                <fieldset
                  style={{
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    padding: "0.6rem 0.7rem 0.7rem",
                    marginTop: "0.4rem",
                  }}
                >
                  <legend
                    style={{
                      padding: "0 0.4rem",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    Latest work experience
                  </legend>

                  <label style={{ fontSize: "0.85rem" }}>
                    Job title
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="e.g. Software Engineer, Marketing Executive"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Company / Organization
                    <input
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="e.g. ABC Tech Pvt Ltd"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Duration
                    <input
                      type="text"
                      value={expDuration}
                      onChange={(e) => setExpDuration(e.target.value)}
                      placeholder="e.g. Jan 2022 – Mar 2024"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Main duties / achievements
                    <textarea
                      rows={2}
                      value={expDetails}
                      onChange={(e) => setExpDetails(e.target.value)}
                      placeholder="e.g. Led 3-member team, improved process by 20%, handled key client accounts."
                    />
                  </label>
                </fieldset>

                {/* Projects */}
                <fieldset
                  style={{
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    padding: "0.6rem 0.7rem 0.7rem",
                    marginTop: "0.6rem",
                  }}
                >
                  <legend
                    style={{
                      padding: "0 0.4rem",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    Project (optional)
                  </legend>

                  <label style={{ fontSize: "0.85rem" }}>
                    Project name
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Inventory Management System, Sales Dashboard"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Project description
                    <textarea
                      rows={2}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Briefly describe what you built, tools used, and results."
                    />
                  </label>
                </fieldset>

                {/* Achievements then Education */}
                <label>
                  Achievements (optional)
                  <textarea
                    rows={2}
                    value={achievementsText}
                    onChange={(e) => setAchievementsText(e.target.value)}
                    placeholder="e.g. Awarded 'Employee of the Year', published 2 papers, led college fest."
                  />
                </label>

                <label>
                  Education
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder={educationPlaceholderByCategory(jobCategory)}
                  />
                </label>

                {/* Licenses / Certificates (still useful for white-collar) */}
                <label>
                  Licenses / Certificates (optional)
                  <input
                    type="text"
                    value={licenses}
                    onChange={(e) => setLicenses(e.target.value)}
                    placeholder={licensesPlaceholderByCategory(jobCategory)}
                  />
                </label>
              </>
            ) : (
              <>
                {/* Non white-collar: keep simpler order */}
                <label>
                  Education
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder={educationPlaceholderByCategory(jobCategory)}
                  />
                </label>

                <label>
                  Licenses / Certificates (optional)
                  <input
                    type="text"
                    value={licenses}
                    onChange={(e) => setLicenses(e.target.value)}
                    placeholder={licensesPlaceholderByCategory(jobCategory)}
                  />
                </label>

                <label>
                  Achievements (optional)
                  <textarea
                    rows={2}
                    value={achievementsText}
                    onChange={(e) => setAchievementsText(e.target.value)}
                    placeholder={achievementsPlaceholderByCategory(jobCategory)}
                  />
                </label>

                <fieldset
                  style={{
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    padding: "0.6rem 0.7rem 0.7rem",
                    marginTop: "0.4rem",
                  }}
                >
                  <legend
                    style={{
                      padding: "0 0.4rem",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    Latest work experience (optional)
                  </legend>

                  <label style={{ fontSize: "0.85rem" }}>
                    Job title
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="e.g. Delivery Executive, Retail Associate"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Company / Organization
                    <input
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="e.g. Swiggy, Local Kirana Store"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Duration
                    <input
                      type="text"
                      value={expDuration}
                      onChange={(e) => setExpDuration(e.target.value)}
                      placeholder="e.g. Jan 2022 – Mar 2024"
                    />
                  </label>

                  <label style={{ fontSize: "0.85rem" }}>
                    Main duties
                    <textarea
                      rows={2}
                      value={expDetails}
                      onChange={(e) => setExpDetails(e.target.value)}
                      placeholder="Describe daily work in simple words."
                    />
                  </label>
                </fieldset>
              </>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Resume Version"}
            </button>
          </form>
        )}

        {/* CHAT MODE (unchanged) */}
        {/* ... keep your existing chat mode code here ... */}

        {/* Saved version actions */}
        {latestResume && (
          <div style={{ marginTop: "1.5rem" }}>
            <h4>Saved Resume Version</h4>
            <p>
              <strong>Name:</strong> {latestResume.fullName}
            </p>
            <p>
              <strong>Role:</strong> {latestResume.role}
            </p>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button onClick={handleDownloadPdf} disabled={!resumeId}>
                View / Download PDF
              </button>
              <button onClick={handleGenerateQr} disabled={!resumeId}>
                Generate QR for Profile
              </button>
            </div>

            {profileUrl && (
              <p style={{ marginTop: "0.5rem" }}>
                Profile link:{" "}
                <a href={profileUrl} target="_blank" rel="noreferrer">
                  {profileUrl}
                </a>
              </p>
            )}

            {qrDataUrl && (
              <div style={{ marginTop: "0.5rem" }}>
                <p>Scan this QR to open mobile-friendly profile:</p>
                <img
                  src={qrDataUrl}
                  alt="Resume QR"
                  style={{ width: 200, height: 200 }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Right: live preview + change template hint */}
      <div>
        <ResumePreviewCard
          fullName={fullName}
          role={role}
          email={email}
          phone={phone}
          summary={summary}
          skillsText={skillsText}
          jobCategory={jobCategory}
          templateKey={templateKey}
          expTitle={expTitle}
          expCompany={expCompany}
          expDuration={expDuration}
          expDetails={expDetails}
        />

        <div className="builder-change-template">
          <p className="builder-change-title">Want a different look?</p>
          <p className="builder-change-text">
            Your content stays the same. Only the layout and styling change
            when you pick another template.
          </p>
          <a href="/templates" className="btn-ghost btn-small">
            Browse templates
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
