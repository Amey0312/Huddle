import multer from "multer";
import pdfParse from "pdf-parse";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

// Function to extract text from PDF resume
const parseResume = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        throw new Error("Error parsing resume.");
    }
};

// Function to get resume rating from Gemini AI
const getResumeRating = async (resumeText, jobDescription) => {
    try {
        const response = await axios.post("GEMINI_AI_API_ENDPOINT", {
            prompt: `Analyze the following resume and compare it with the job description. Provide a match percentage.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
            max_tokens: 100,
        }, {
            headers: { "Authorization": `Bearer ${process.env.GEMINI_API_KEY}` }
        });

        return response.data.match_percentage || 0;
    } catch (error) {
        console.error("AI rating error:", error);
        return 0;
    }
};

// API to upload and analyze resume
export const uploadResume = async (req, res) => {
    try {
        const { jobId } = req.body;
        if (!jobId || !req.file) {
            return res.status(400).json({ message: "Job ID and resume are required." });
        }

        // Parse Resume
        const resumeText = await parseResume(req.file.buffer);

        // Fetch job description
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Get AI rating
        const rating = await getResumeRating(resumeText, job.description);

        return res.status(200).json({ message: "Resume analyzed", rating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Multer Middleware for resume upload
export const resumeUploadMiddleware = upload.single("resume");
