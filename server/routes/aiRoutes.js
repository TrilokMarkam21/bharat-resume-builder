import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // make sure OPENAI_API_KEY is loaded before creating client

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/summary", async (req, res) => {
  try {
    const { jobCategory, templateKey, role, currentSummary } = req.body;

    const categoryLabel =
      jobCategory === "blue-collar"
        ? "blue-collar (hands-on / field work)"
        : jobCategory === "grey-collar"
        ? "grey-collar (field + customer / tech)"
        : "white-collar (office / knowledge work)";

    const templateLabel =
      templateKey === "ats-basic"
        ? "ATS-friendly single-column"
        : templateKey === "modern-flex"
        ? "modern but still ATS-safe"
        : "compact one-page";

    const prompt = `
You are an assistant that writes resume summaries for workers in India.

Job category: ${categoryLabel}
Resume template style: ${templateLabel}
Target role: ${role || "not specified"}

Existing summary (may be empty):
"${currentSummary || ""}"

Write a 2–3 sentence professional summary in plain English (no bullet points), optimised for ATS, suitable for this job category and role. Use simple language and focus on real work done, tools, safety/quality, and customer impact. Do not include headings like "Summary:" in the text.
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 120,
    });

    const aiText =
      completion.output?.[0]?.content?.[0]?.text?.trim() || "";

    res.json({ summary: aiText });
  } catch (err) {
    console.error("AI summary error:", err);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

export default router;
