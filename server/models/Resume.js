// server/models/Resume.js
import mongoose from "mongoose";

const ResumeVersionSchema = new mongoose.Schema(
  {
    jobCategory: {
      type: String,
      enum: ["blue-collar", "grey-collar", "white-collar"],
      default: "blue-collar",
    },
    templateKey: {
      type: String,
      enum: ["ats-basic", "modern-flex", "compact"],
      default: "ats-basic",
    },
    fullName: String,
    email: String,
    phone: String,
    role: String,
    summary: String,
    skills: [String],
    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],
    comments: [
      {
        text: String,
        author: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const ResumeSchema = new mongoose.Schema(
  {
    userIdentifier: {
      type: String,
      required: true,
    },
    versions: [ResumeVersionSchema],
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", ResumeSchema);
