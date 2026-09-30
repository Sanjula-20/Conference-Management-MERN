import express from "express";
import {
  createReviewer,
  getReviewers,
  assignReviewer,
  getReviewersWithAssignments,
  updateReviewer,
  deleteReviewer,
  getAssignedPapers,
  updatePaperStatus,
  sendPaperStatusEmail,
  sendNotification,
  getPaperStatus,
  getUnassignedPapers,
  getPapersAvailableForAssignment,
  getRegistrationsWithAssignments,
  getAllAssignments,
  deleteAssignment,
  updateAssignment,
  updatePaperPaymentAmount,
  updateRegistrationDetails,
  getRegistrationAnalytics,
  deleteRegistration,
  updateRegistrationStatus,
  getTotalRegistrations,
  downloadFinalPaper,
  resetFinalSubmission,
  getPaperWithReviewerComments,
  getConferenceParticipants,
  getDashboardStats,
  createChairperson,
  getChairpersons,
  assignChairpersonToPaper,
  removeChairpersonAssignment,
  getChairAssignments,
  getChairpersonAssignedPapers,
  submitChairpersonReview,
  getChairReviewResults,
  adminResetUserPassword,
  getSubmissionLockStatus,
  setGlobalSubmissionLock,
  getLockedUsers,
  setUserSubmissionLock,
  exportConferenceParticipantsExcel,
  getPendingReviewStatus,
  sendReviewReminders,
  getReviewerStatusReport
} from "../controllers/adminController.js";
import {
  getSupportTickets,
  createSupportTicketAdmin,
  assignTechnician,
  updateTicketStatus,
  getTechnicians,
  deleteSupportTicketAdmin
} from "../controllers/techSupportController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.post("/create-reviewer", authenticateToken, createReviewer);
router.get("/reviewers", authenticateToken, getReviewers);
router.post("/assign-reviewer", authenticateToken, assignReviewer);
router.get("/reviewers-with-assignments", authenticateToken, getReviewersWithAssignments);
router.put("/update-reviewer/:id", authenticateToken, updateReviewer);
router.delete("/delete-reviewer/:id", authenticateToken, deleteReviewer);
router.get("/unassigned-papers", authenticateToken, getUnassignedPapers);
router.get("/papers-available-for-assignment", authenticateToken, getPapersAvailableForAssignment);
router.get("/registrations-with-assignments", authenticateToken, getRegistrationsWithAssignments);
router.delete("/registrations/:id", authenticateToken, deleteRegistration);
router.get("/registration-analytics", authenticateToken, getRegistrationAnalytics);
router.post("/send-status-email", authenticateToken, sendPaperStatusEmail);
router.post("/send-notification", authenticateToken, sendNotification);
router.put("/registrations/:id/status", authenticateToken, updateRegistrationStatus);
router.put("/registrations/:id/details", authenticateToken, updateRegistrationDetails);

// Assignment management (admin)
router.get("/assignments", authenticateToken, getAllAssignments);
router.delete("/assignment/:paperId/:reviewerId", authenticateToken, deleteAssignment);
router.put("/assignment/:paperId/:reviewerId", authenticateToken, updateAssignment);

// Reviewer routes
router.get("/reviewer/assigned-papers", authenticateToken, getAssignedPapers);
router.post("/reviewer/update-status", authenticateToken, updatePaperStatus);

// User routes
router.get("/paper-status/:userId", authenticateToken, getPaperStatus);

// Total registrations route
router.get("/total-registrations", authenticateToken, getTotalRegistrations);

// Download final paper
router.get("/download-final-paper/:paperId", authenticateToken, downloadFinalPaper);

// Reset final submission
router.put("/registrations/:id/reset-final-submission", authenticateToken, resetFinalSubmission);

// Get paper with reviewer comments
router.get("/paper-with-comments/:paperId", authenticateToken, getPaperWithReviewerComments);

// Admin: update custom payment amount for a paper (amount in rupees)
router.post("/update-payment-amount", authenticateToken, updatePaperPaymentAmount);

// Admin: conference participants (payment configs)
router.get("/conference-participants", authenticateToken, getConferenceParticipants);

// Dashboard statistics - paper status counts
router.get("/dashboard-stats", authenticateToken, getDashboardStats);

// Chairperson management and assignments (admin)
router.post("/create-chairperson", authenticateToken, createChairperson);
router.get("/chairpersons", authenticateToken, getChairpersons);
router.get("/chair-assignments", authenticateToken, getChairAssignments);
router.post("/assign-chairperson", authenticateToken, assignChairpersonToPaper);
router.delete("/chair-assignment/:paperId/:chairpersonId", authenticateToken, removeChairpersonAssignment);
router.get("/chair-results", authenticateToken, getChairReviewResults);

// Chairperson routes
router.get("/chairperson/assigned-papers", authenticateToken, getChairpersonAssignedPapers);
router.post("/chairperson/submit-review", authenticateToken, submitChairpersonReview);

// Admin: reset a user's password (sends reset link email)
router.post("/reset-user-password", authenticateToken, adminResetUserPassword);

// Admin: submission lock/unlock (global and per-user)
router.get("/submission-lock", authenticateToken, getSubmissionLockStatus);
router.post("/submission-lock", authenticateToken, setGlobalSubmissionLock);
router.get("/submission-lock/users", authenticateToken, getLockedUsers);
router.put("/submission-lock/users/:id", authenticateToken, setUserSubmissionLock);

// Admin: conference participants Excel export
router.get("/conference-participants/export", authenticateToken, exportConferenceParticipantsExcel);

// Admin: pending review status + reminder emails
router.get("/pending-reviews", authenticateToken, getPendingReviewStatus);
router.post("/pending-reviews/remind", authenticateToken, sendReviewReminders);

// Admin: reviewer-wise status report
router.get("/reviewer-status-report", authenticateToken, getReviewerStatusReport);

export default router;
