import express from "express";
import { 
  createPaymentOrder, 
  verifyPayment, 
  getPaymentStatus, 
  handlePaymentFailure,
  getUserPayments,
  getAllPayments,
  getTotalPaymentReceived,
  handleWebhook,
  checkPaymentStatus
} from "../controllers/paymentController.js";
import {
  prepareUserPayment,
  getUserPaymentConfig
} from "../controllers/userPaymentController.js";
import { getPaymentRate } from "../controllers/conferenceConfigController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Create a new payment order
router.post("/create-order", authenticateToken, createPaymentOrder);

// Save payment details (presentation/stay/participants)
router.post("/prepare", authenticateToken, prepareUserPayment);

// Get saved payment details
router.get("/config/:paperId", authenticateToken, getUserPaymentConfig);
router.get("/rates", authenticateToken, getPaymentRate);

// Verify payment signature
router.post("/verify", authenticateToken, verifyPayment);

// Get payment status for a paper
router.get("/status/:paperId", authenticateToken, getPaymentStatus);

// Handle payment failure
router.post("/failure", authenticateToken, handlePaymentFailure);

// Get all payments for current user
router.get("/user-payments", authenticateToken, getUserPayments);

// Get all payments (admin only)
router.get("/all-payments", authenticateToken, getAllPayments);

// Get total payment received (admin only)
router.get("/total", authenticateToken, getTotalPaymentReceived);

// Check payment status by order ID
router.get("/check/:razorpayOrderId", authenticateToken, checkPaymentStatus);

// Handle webhook from Razorpay (no auth needed)
router.post("/webhook", handleWebhook);

export default router;
