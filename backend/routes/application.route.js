import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, evaluateResumes } from "../controllers/application.controller.js";
 

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.post("/:id/evaluate",isAuthenticated, evaluateResumes);  // 🆕 New route
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
 

export default router;

