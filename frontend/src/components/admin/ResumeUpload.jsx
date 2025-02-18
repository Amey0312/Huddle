import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const ResumeUpload = ({ jobId }) => {
    const [file, setFile] = useState(null);
    const [matchScore, setMatchScore] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobId", jobId);

        try {
            const res = await axios.post("/api/v1/application/upload-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            setMatchScore(res.data.rating);
            toast.success("Resume uploaded successfully!");
        } catch (error) {
            toast.error(error.response.data.message || "Upload failed.");
        }
    };

    return (
        <div className="resume-upload">
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload & Analyze</button>
            {matchScore !== null && <p>Match Score: {matchScore}%</p>}
        </div>
    );
};

export default ResumeUpload;
