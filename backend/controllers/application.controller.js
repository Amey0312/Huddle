import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import pdfParse from "pdf-parse";
import natural from "natural";
import fs from "fs";
import path from "path";
import axios from "axios";

// import { extractTextFromPDF } from "../utils/resumeParser.js";
// import { getSimilarityScore } from "../utils/similarity.js";

// export const evaluateResumes = async (req, res) => {
//     try {
//         const jobId = req.params.id;
//         const job = await Job.findById(jobId).populate({
//             path: 'applications',
//             populate: { path: 'applicant' }
//         });

//         if (!job) {
//             return res.status(404).json({ message: 'Job not found', success: false });
//         }

//         const jobDescription = job.description;
//         let evaluatedApplicants = [];

//         for (let application of job.applications) {
//             if (application.applicant.profile.resume) {
//                 const resumeText = await extractTextFromPDF(application.applicant.profile.resume);
//                 const score = getSimilarityScore(resumeText, jobDescription);
//                 evaluatedApplicants.push({
//                     applicant: application.applicant,
//                     score
//                 });
//             }
//         }

//         evaluatedApplicants.sort((a, b) => b.score - a.score);

//         return res.status(200).json({
//             message: "Resumes evaluated successfully",
//             applicants: evaluatedApplicants,
//             success: true
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Server error", success: false });
//     }
// };



// export const calculateSimilarity = (resumeText, jobDescription) => {
//     const tokenizer = new natural.WordTokenizer();
//     const resumeTokens = tokenizer.tokenize(resumeText.toLowerCase());
//     const jobTokens = tokenizer.tokenize(jobDescription.toLowerCase());

//     const tfidf = new natural.TfIdf();
//     tfidf.addDocument(resumeTokens.join(" "));
//     tfidf.addDocument(jobTokens.join(" "));

//     const similarity = tfidf.tfidf(0, 1);
//     return similarity > 1 ? 1 : similarity.toFixed(2);
// };

// export const evaluateResumes = async (req, res) => {
//     try {
//         const jobId = req.params.id;
//         const job = await Job.findById(jobId);
//         if (!job) return res.status(404).json({ message: "Job not found", success: false });

//         const applications = await Application.find({ job: jobId }).populate("applicant");
//         let updatedApplications = [];

//         const tempDir = path.join(__dirname, "../temp"); // ✅ Ensure a temp directory exists
//         if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//         for (const application of applications) {
//             const user = application.applicant;
//             if (!user.profile?.resume) continue;

//             const resumePath = path.join(tempDir, `${user._id}.pdf`);
            
//             // ✅ Download resume file
//             const response = await axios.get(user.profile.resume, { responseType: "arraybuffer" });
//             fs.writeFileSync(resumePath, response.data);

//             // ✅ Check if file exists before reading
//             if (!fs.existsSync(resumePath)) {
//                 console.error(`File not found: ${resumePath}`);
//                 continue;
//             }

//             // ✅ Extract text from resume
//             const dataBuffer = fs.readFileSync(resumePath);
//             const resumeData = await pdfParse(dataBuffer);
//             const resumeText = resumeData.text;

//             // ✅ Calculate similarity
//             const score = calculateSimilarity(resumeText, job.description);
//             application.score = score;
//             await application.save();
//             updatedApplications.push(application);

//             // ✅ Clean up temp file
//             fs.unlinkSync(resumePath);
//         }

//         return res.status(200).json({ message: "Resumes evaluated", success: true, applications: updatedApplications });
//     } catch (error) {
//         console.error("Error evaluating resumes:", error);
//         res.status(500).json({ message: "Error evaluating resumes", success: false });
//     }
// };

export const evaluateResumes = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        const applications = await Application.find({ job: jobId }).populate("applicant");
        let updatedApplications = [];

        for (const application of applications) {
            const user = application.applicant;
            if (!user.profile?.resume) continue;

            try {
                // ✅ Download resume from URL
                const response = await axios.get(user.profile.resume, { responseType: "arraybuffer" });

                // ✅ Parse resume text directly from buffer (no need for temp files)
                const resumeData = await pdfParse(Buffer.from(response.data));
                const resumeText = resumeData.text;

                // ✅ Calculate similarity score
                const score = calculateSimilarity(resumeText, job.description);
                application.score = score;
                await application.save();
                updatedApplications.push(application);
            } catch (err) {
                console.error(`Error processing resume for ${user.fullname}:`, err);
            }
        }
    } catch (error) {
        console.error("Error evaluating resumes:", error);
        res.status(500).json({ message: "Error evaluating resumes", success: false });
    }
};

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        return res.status(200).json({
            job, 
            succees:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:'status is required',
                success:false
            })
        };

        // find the application by applicantion id
        const application = await Application.findOne({_id:applicationId});
        if(!application){
            return res.status(404).json({
                message:"Application not found.",
                success:false
            })
        };

        // update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message:"Status updated successfully.",
            success:true
        });

    } catch (error) {
        console.log(error);
    }

}