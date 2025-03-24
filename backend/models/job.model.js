import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     requirements: [{
//         type: String
//     }],
//     salary: {
//         type: Number,
//         required: true
//     },
//     experienceLevel:{
//         type:Number,
//         required:true,
//     },
//     location: {
//         type: String,
//         required: true
//     },
//     jobType: {
//         type: String,
//         required: true
//     },
//     position: {
//         type: Number,
//         required: true
//     },
//     company: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Company',
//         required: true
//     },
//     created_by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     applications: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Application',
//         }
//     ]
// },{timestamps:true});
// export const Job = mongoose.model("Job", jobSchema);

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        requirements: [{ type: String }],
        salary: { type: Number, required: true },
        experienceLevel: { type: Number, required: true },
        location: { type: String, required: true },
        jobType: { type: String, required: true },
        position: { type: Number, required: true }, // Number of positions
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
        deadline: { type: Date, required: true },
        evaluationCriteria: { type: Number, default: 0 }, // Minimum score required
        acceptedApplicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // 🆕 Accepted applications
        rejectedApplicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // 🆕 Rejected applications
    },
    { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);

