import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import pdfParse from "pdf-parse";
import { evaluateResume } from "../utils/evaluator.js";
import fs from "fs";
import path from "path";
import axios from "axios";


// export const evaluateResumes = async (req, res) => {
//     try {
//         const jobId = req.params.id;
//         const job = await Job.findById(jobId);
//         if (!job) return res.status(404).json({ message: "Job not found", success: false });

//         const applications = await Application.find({ job: jobId }).populate("applicant");
//         let updatedApplications = [];

//         for (const application of applications) {
//             const user = application.applicant;
//             if (!user.profile?.resume) continue;

//             try {
//                 // ✅ Download resume from URL
//                 const response = await axios.get(user.profile.resume, { responseType: "arraybuffer" });

//                 // ✅ Parse resume text directly from buffer (no need for temp files)
//                 const resumeData = await pdfParse(Buffer.from(response.data));
//                 const resumeText = resumeData.text;

//                 // ✅ Calculate similarity score
//                 const score = calculateSimilarity(resumeText, job.description);
//                 application.score = score;
//                 await application.save();
//                 updatedApplications.push(application);
//             } catch (err) {
//                 console.error(`Error processing resume for ${user.fullname}:`, err);
//             }
//         }
//     } catch (error) {
//         console.error("Error evaluating resumes:", error);
//         res.status(500).json({ message: "Error evaluating resumes", success: false });
//     }
// };

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
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        const jobDescription = job.description || '';
        console.log("Job Description:", jobDescription);

        const updatedApplications = await Promise.all(
            job.applications.map(async (application) => {
                let resumePath = application?.applicant?.profile?.resume || application?.applicant?.resume || null;

                console.log(`Resume URL for ${application.applicant.fullname}: ${resumePath}`);

                if (!resumePath) {
                    return { ...application.toObject(), score: 0, message: 'No resume found.' };
                }

                try {
                    // Fetch resume as buffer
                    const response = await axios.get(resumePath, { responseType: 'arraybuffer' });

                    // ✅ Check if content-type indicates a PDF
                    const contentType = response.headers['content-type'];
                    if (!['application/pdf', 'application/octet-stream'].includes(contentType)) {
                        console.log(`Invalid content-type: ${contentType} for ${resumePath}`);
                        return { ...application.toObject(), score: 0, message: 'Invalid resume format. Only PDF allowed.' };
                    }
                    const resumeBuffer = response.data;

                    // Parse PDF and extract text
                    const pdfData = await pdfParse(resumeBuffer);
                    console.log('Extracted Text Preview:', pdfData.text.substring(0, 500));

                    // Score based on job description
                    const score = evaluateResume(pdfData.text, jobDescription);

                    // Save score (if schema allows it)
                    application.score = score;
                    await application.save();

                    return { ...application.toObject(), score };
                } catch (err) {
                    console.log(`Error processing resume for applicant ${application.applicant._id}:`, err.message);
                    return { ...application.toObject(), score: 0, message: 'Error processing resume.' };
                }
            })
        );

        // Respond with updated applications
        return res.status(200).json({
            job: {
                ...job.toObject(),
                applications: updatedApplications
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};
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

export const processJobApplications = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate("applications");

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        const { evaluationCriteria, position } = job;

        // Fetch and sort applications by score (descending)
        let applications = await Application.find({ job: jobId }).sort({ score: -1 });

        if (applications.length === 0) {
            return res.status(400).json({ message: "No applications found for this job", success: false });
        }

        let acceptedApplicants = [];
        let rejectedApplicants = [];

        // Process applications
        for (const application of applications) {
            if (application.score >= evaluationCriteria && acceptedApplicants.length < position) {
                application.status = "accepted";
                acceptedApplicants.push(application._id);
            } else {
                application.status = "rejected";
                rejectedApplicants.push(application._id);
            }
            await application.save();
        }

        // Update job with accepted & rejected applicants
        job.acceptedApplicants = acceptedApplicants;
        job.rejectedApplicants = rejectedApplicants;
        await job.save();

        return res.status(200).json({
            message: "Applicants have been evaluated and statuses updated.",
            acceptedApplicants,
            rejectedApplicants,
            success: true,
        });
    } catch (error) {
        console.error("Error processing applications:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Auto-select applicants after the job deadline
export const autoSelectApplicants = async () => {
    try {
        // Get jobs where deadline has passed and applicants are still pending
        const expiredJobs = await Job.find({
            deadline: { $lt: new Date() }, // Past deadline
            applications: { $exists: true, $not: { $size: 0 } }
        }).populate({
            path: 'applications',
            populate: {
                path: 'applicant'
            }
        });

        for (const job of expiredJobs) {
            const { applications, position, evaluationCriteria } = job;

            // Filter out applicants who meet evaluation criteria
            let filteredApplicants = applications.filter(app => app.score >= evaluationCriteria);

            // Sort applicants by: Score → Experience Level → Earliest Application
            filteredApplicants.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score; // Higher score first
                if (b.applicant.experienceLevel !== a.applicant.experienceLevel) return b.applicant.experienceLevel - a.applicant.experienceLevel; // More experience first
                return new Date(a.createdAt) - new Date(b.createdAt); // Earlier applications first
            });

            // Select top `N` applicants
            const selectedApplicants = filteredApplicants.slice(0, position);
            const rejectedApplicants = filteredApplicants.slice(position);

            // Update status for accepted and rejected applicants
            for (const app of selectedApplicants) {
                app.status = "accepted";
                await app.save();
            }
            for (const app of rejectedApplicants) {
                app.status = "rejected";
                await app.save();
            }
        }

        console.log("✅ Auto-selection process completed.");
    } catch (error) {
        console.error("❌ Error processing applications:", error);
    }
};
