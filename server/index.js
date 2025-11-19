import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import resumeRoutes from "./routes/resumeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";




dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", resumeRoutes);
// after app.use(express.json());
app.use("/api/ai", aiRoutes);


const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(MONGODB_URI, { dbName: "bharat-resume-builder" })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Simple health route
app.get("/", (req, res) => {
  res.send("Bharat Resume Builder API running");
});
