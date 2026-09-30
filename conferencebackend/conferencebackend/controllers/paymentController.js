import { db } from "../config/db.js";
import { paymentModel } from "../models/paymentModel.js";
import { userPaymentModel } from "../models/userPaymentModel.js";
import { conferenceConfigModel } from "../models/conferenceConfigModel.js";
import razorpayService from "../services/razorpayService.js";
import { sendPaymentConfirmationEmail } from "../services/emailServices.js";

// Payment amount in paise (10 INR = 1000 paise) - SERVER SIDE CONFIG
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT || 1000;
const PAYMENT_CURRENCY = "INR";
const INTERNATIONAL_PAYMENT_MESSAGE =
  "International payments are not accepted online. Please contact ICoDSES admin for direct payment options.";
const ACCEPTED_STATUSES = [
  "accepted",
  "accepted_with_minor_revision",
  "accepted_with_major_revision"
];

// The payment-order decision itself uses the database pricing record above.
// This fallback is retained for the status payload used by existing clients.
const isInternationalCountry = (country) =>
  typeof country === "string" && country.trim().toLowerCase() !== "" && country.trim().toLowerCase() !== "india";

// Create idempotency key
const createIdempotencyKey = (userId, paperId) => {
  return `payment_${userId}_${paperId}_${Date.now()}`;
};

// Create a new payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { paperId } = req.body;
    const userId = req.user.id;

    // Validate paper ID
    if (!paperId) {
      return res.status(400).json({ error: "Paper ID is required" });
    }

    // Generate idempotency key
    const idempotencyKey = createIdempotencyKey(userId, paperId);

    // Check if paper exists and belongs to user
    const paperQuery = "SELECT * FROM registrations WHERE id = ? AND userId = ?";
    db.query(paperQuery, [paperId, userId], async (err, papers) => {
      if (err) {
        console.error("Error fetching paper:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!papers || papers.length === 0) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const paper = papers[0];

      // Check if paper is accepted (payment allowed only after acceptance notification)
      const isAccepted =
        ACCEPTED_STATUSES.includes(paper.status) ||
        ACCEPTED_STATUSES.includes(paper.reviewStatus);
      if (!paper.notificationSent || !isAccepted) {
        return res.status(400).json({
          error: "Payment is available only for accepted papers after notification",
          code: "PAYMENT_NOT_AVAILABLE"
        });
      }

      const mainAuthor = typeof paper.authors === "string" ? JSON.parse(paper.authors || "[]")[0] : paper.authors?.[0];
      const authorType = (mainAuthor?.type || "").toString().trim().toLowerCase().replace(/\s+/g, "_");
      let pricing;
      try {
        pricing = await conferenceConfigModel.getPricing(authorType, paper.country);
      } catch (pricingError) {
        console.error("Error loading payment rate:", pricingError);
        return res.status(500).json({ error: "Unable to load payment rate" });
      }
      if (!pricing) return res.status(400).json({ error: "No payment rate is configured for the main author type" });
      if (pricing.isInternational) {
        return res.status(400).json({ error: INTERNATIONAL_PAYMENT_MESSAGE, code: "INTERNATIONAL_PAYMENT_DISABLED" });
      }

      // Check if payment already completed
      paymentModel.isPaymentCompleted(paperId, async (err, isCompleted) => {
        if (err) {
          console.error("Error checking payment status:", err);
          return res.status(500).json({ error: "Error checking payment status" });
        }

        if (isCompleted) {
          return res.status(400).json({ 
            error: "Payment already completed for this paper",
            code: "PAYMENT_ALREADY_COMPLETED"
          });
        }

        // Check for pending payment to prevent concurrent attempts
        paymentModel.getPendingPayment(paperId, async (err, pendingPayment) => {
          if (err) {
            console.error("Error checking pending payment:", err);
            return res.status(500).json({ error: "Error checking payment status" });
          }

          if (pendingPayment) {
            return res.status(200).json({
              success: true,
              orderId: pendingPayment.razorpayOrderId,
              amount: pendingPayment.amount,
              currency: pendingPayment.currency,
              keyId: process.env.RAZORPAY_KEY_ID || "your_razorpay_key_id",
              existingPayment: true,
              message: "You have an existing pending payment. Please complete or cancel it first.",
            });
          }

          // Determine amount (use custom amount if available, otherwise saved payment config)
          paymentModel.getCustomAmountByPaperId(paperId, async (err, customAmount) => {
            if (err) {
              console.error("Error fetching custom amount:", err);
            }

            const hasCustom = !err && customAmount && Number.isInteger(customAmount) && customAmount > 0;

            userPaymentModel.getPaymentConfigByPaperId(paperId, async (configErr, paymentConfig) => {
              if (configErr) {
                console.error("Error fetching payment config:", configErr);
                return res.status(500).json({ error: "Error fetching payment details" });
              }

              if (!paymentConfig && !hasCustom) {
                return res.status(400).json({
                  error: "Payment details not set. Please complete the payment dashboard first.",
                  code: "PAYMENT_DETAILS_MISSING"
                });
              }

              const configAmount = paymentConfig ? Number(paymentConfig.totalAmount) : 0;
              const amountToUse = hasCustom ? customAmount : configAmount;

              if (!Number.isInteger(amountToUse) || amountToUse <= 0) {
                return res.status(400).json({
                  error: "Invalid payment amount",
                  code: "INVALID_PAYMENT_CONFIG"
                });
              }

              try {
                const orderResult = await razorpayService.createOrder({
                  amount: amountToUse,
                  currency: PAYMENT_CURRENCY,
                  receipt: `paper_${paperId}_${Date.now()}`,
                  notes: {
                    paperId,
                    userId,
                    paperTitle: paper.paperTitle,
                    presentationMode: paymentConfig ? paymentConfig.presentationMode : "online",
                    stayRequired: paymentConfig && paymentConfig.stayRequired ? "yes" : "no",
                    participants: paymentConfig ? (paymentConfig.participantIndexes || "[]") : "[]"
                  }
                });

                if (!orderResult.success) {
                  console.error("Razorpay order creation error:", orderResult.error);
                  return res.status(500).json({ error: "Failed to create payment order" });
                }

                const order = orderResult.order;

                paymentModel.createPayment(
                  {
                    paperId,
                    userId,
                    amount: amountToUse,
                    currency: PAYMENT_CURRENCY,
                    razorpayOrderId: order.id,
                    status: "pending",
                    idempotencyKey,
                  },
                  () => {}
                );

                return res.status(200).json({
                  success: true,
                  orderId: order.id,
                  amount: order.amount,
                  currency: order.currency,
                  keyId: process.env.RAZORPAY_KEY_ID,
                });
              } catch (e) {
                console.error("Razorpay order creation error:", e);
                return res.status(500).json({ error: "Failed to create payment order" });
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify payment signature - with server-side verification
export const verifyPayment = async (req, res) => {
  console.log("[PaymentController] Starting payment verification:", {
    userId: req.user.id,
    timestamp: new Date().toISOString()
  });
  
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    console.log("[PaymentController] Payment verification details:", {
      razorpayOrderId,
      razorpayPaymentId,
      hasSignature: !!razorpaySignature,
      userId
    });

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      console.error("[PaymentController] Missing required payment details");
      return res.status(400).json({ error: "All payment details are required" });
    }

    // First verify the signature
    console.log("[PaymentController] Step 1: Verifying signature...");
    const signatureResult = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!signatureResult.valid) {
      console.error("[PaymentController] Signature verification failed:", signatureResult.error);
      console.error("[PaymentController] Debug info:", signatureResult.debugInfo);
      
      // Update payment status to failed
      paymentModel.updatePaymentStatus(razorpayOrderId, "failed", razorpayPaymentId, (err) => {
        if (err) console.error("Error updating payment status:", err);
      });
      
      // Add audit log
      paymentModel.addAuditLog({
        paymentId: null,
        razorpayOrderId,
        action: "verification_failed",
        details: { 
          reason: signatureResult.error,
          debugInfo: signatureResult.debugInfo,
          razorpayPaymentId,
          razorpayOrderId
        },
        userId,
      });
      
      // Return detailed error message to help debugging
      return res.status(400).json({ 
        error: "Payment verification failed: " + signatureResult.error,
        errorCode: "SIGNATURE_VERIFICATION_FAILED",
        verified: false,
        details: signatureResult.debugInfo ? {
          hint: "This could be due to using test key in production or vice versa"
        } : undefined
      });
    }

    console.log("[PaymentController] Step 2: Checking payment in database...");
    // Get payment from database to verify amount
    paymentModel.getPaymentByOrderId(razorpayOrderId, async (err, payment) => {
      if (err) {
        console.error("[PaymentController] Database error fetching payment:", err);
        return res.status(500).json({ 
          error: "Database error while fetching payment details",
          errorCode: "DB_ERROR"
        });
      }
      
      if (!payment) {
        console.error("[PaymentController] Payment record not found:", { razorpayOrderId });
        return res.status(404).json({ 
          error: "Payment record not found. Please contact support if this issue persists.",
          errorCode: "PAYMENT_NOT_FOUND",
          verified: false
        });
      }

      console.log("[PaymentController] Step 3: Checking payment capture status with Razorpay...", {
        razorpayPaymentId,
        expectedAmount: payment.amount,
        paymentId: payment.id
      });
      
      // Server-side verification with Razorpay API
      const razorpayResult = await razorpayService.isPaymentCaptured(razorpayPaymentId);
      
      console.log("[PaymentController] Razorpay response:", razorpayResult);
      
      if (razorpayResult.error) {
        console.error("[PaymentController] Razorpay API error:", razorpayResult.error);
        
        paymentModel.updatePaymentStatus(razorpayOrderId, "failed", razorpayPaymentId, (err) => {
          if (err) console.error("Error updating payment status:", err);
        });
        
        paymentModel.addAuditLog({
          paymentId: payment.id,
          razorpayOrderId,
          action: "razorpay_api_error",
          details: { error: razorpayResult.error },
          userId,
        });
        
        return res.status(400).json({ 
          error: "Failed to verify payment with Razorpay: " + razorpayResult.error,
          errorCode: "RAZORPAY_API_ERROR",
          verified: false 
        });
      }
      
      if (!razorpayResult.captured) {
        console.error("[PaymentController] Payment not captured by Razorpay:", razorpayResult.status);
        
        paymentModel.updatePaymentStatus(razorpayOrderId, "failed", razorpayPaymentId, (err) => {
          if (err) console.error("Error updating payment status:", err);
        });
        
        paymentModel.addAuditLog({
          paymentId: payment.id,
          razorpayOrderId,
          action: "razorpay_verification_failed",
          details: { razorpayStatus: razorpayResult.status, razorpayPaymentId },
          userId,
        });
        
        return res.status(400).json({ 
          error: "Payment was not completed. Razorpay status: " + razorpayResult.status,
          errorCode: "PAYMENT_NOT_CAPTURED",
          verified: false 
        });
      }

      console.log("[PaymentController] Step 4: Verifying amount...", {
        expected: payment.amount,
        actual: razorpayResult.amount
      });

      // Verify amount matches DB value (payment.amount)
      if (razorpayResult.amount !== payment.amount) {
        console.error("[PaymentController] Amount mismatch detected!", {
          expected: payment.amount,
          actual: razorpayResult.amount
        });

        paymentModel.markPaymentFailed(
          razorpayOrderId, 
          "Amount mismatch - possible tampering detected",
          (err) => {
            if (err) console.error("Error marking payment failed:", err);
          }
        );

        paymentModel.addAuditLog({
          paymentId: payment.id,
          razorpayOrderId,
          action: "amount_mismatch",
          details: { 
            expected: payment.amount, 
            actual: razorpayResult.amount 
          },
          userId,
        });

        return res.status(400).json({ 
          error: "Payment amount verification failed. Expected: ₹" + (payment.amount/100) + ", Received: ₹" + (razorpayResult.amount/100) + ". Please contact support.",
          errorCode: "AMOUNT_MISMATCH",
          verified: false 
        });
      }

      console.log("[PaymentController] Step 5: Updating payment status to captured...");
      // Payment verified successfully, update status
      // Store payment in stable variable to avoid variable shadowing issues
      const paymentRecord = payment;
      
      paymentModel.updatePaymentStatus(razorpayOrderId, "captured", razorpayPaymentId, (err, result) => {
        if (err) {
          console.error("[PaymentController] Error updating payment status:", err);
          return res.status(500).json({ 
            error: "Failed to update payment status. Please contact support.",
            errorCode: "UPDATE_FAILED"
          });
        }

        console.log("[PaymentController] Step 6: Updating registration payment status...");
        // Update registration payment status - use stable paymentRecord variable
        if (paymentRecord) {
          const updateQuery = `
            UPDATE registrations 
            SET paymentStatus = 'paid', 
                paymentId = ?,
                paymentDate = NOW()
            WHERE id = ?
          `;
          db.query(updateQuery, [razorpayPaymentId, paymentRecord.paperId], (err) => {
            if (err) {
              console.error("Error updating registration payment status:", err);
            } else {
              console.log("[PaymentController] Registration payment status updated successfully");
            }
          });
        }

        // Send payment confirmation email (once) - Transaction-safe approach
        // Send email FIRST, then mark as sent only if successful
        if (paymentRecord && !paymentRecord.paymentEmailSent) {
          // First, get the user and paper details using stable paymentRecord
          const userQuery = "SELECT name, email FROM users WHERE id = ?";
          db.query(userQuery, [paymentRecord.userId], (userErr, users) => {
            if (userErr || !users || users.length === 0) {
              console.error("[PaymentController] Error fetching user for payment email:", userErr || "User not found");
              return;
            }

            const userRecord = users[0];
            const paperQuery = "SELECT paperTitle FROM registrations WHERE id = ?";
            db.query(paperQuery, [paymentRecord.paperId], (paperErr, papers) => {
              if (paperErr || !papers || papers.length === 0) {
                console.error("[PaymentController] Error fetching paper for payment email:", paperErr || "Paper not found");
                return;
              }

              const paperRecord = papers[0];
              const paymentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              // Try to send email FIRST (before marking as sent in DB)
              sendPaymentConfirmationEmail({
                recipient: userRecord.email,
                userName: userRecord.name,
                paperTitle: paperRecord.paperTitle,
                paperId: paymentRecord.paperId,
                paymentAmount: (paymentRecord.amount / 100).toFixed(2),
                paymentDate,
                razorpayPaymentId
              }).then(() => {
                // Email sent successfully, now mark as sent in DB
                paymentModel.markEmailSent(paymentRecord.paperId, (markErr, markResult) => {
                  if (markErr) {
                    console.error("[PaymentController] Error marking payment email as sent:", markErr);
                    return;
                  }

                  if (!markResult || markResult.affectedRows === 0) {
                    console.log("[PaymentController] Email sent but DB marking returned 0 affected rows (possibly already marked)");
                    return;
                  }

                  console.log("[PaymentController] Payment confirmation email sent and marked in DB");
                });
              }).catch((emailErr) => {
                console.error("[PaymentController] Error sending payment confirmation email:", emailErr);
                // Do NOT mark as sent in DB if email failed - this ensures email can be retried
              });
            });
          });
        }

        // Add audit log - use stable paymentRecord variable
        paymentModel.addAuditLog({
          paymentId: paymentRecord.id,
          razorpayOrderId,
          action: "payment_verified",
          details: { 
            razorpayPaymentId,
            amount: razorpayResult.amount,
            currency: razorpayResult.currency
          },
          userId,
        });

        console.log("[PaymentController] Payment verification completed successfully!");
        res.status(200).json({
          success: true,
          verified: true,
          message: "Payment verified successfully",
        });
      });
    });
  } catch (error) {
    console.error("[PaymentController] Verify payment error:", error);
    console.error("[PaymentController] Stack trace:", error.stack);
    res.status(500).json({ 
      error: "An unexpected error occurred during payment verification. Please try again or contact support if the issue persists.",
      errorCode: "INTERNAL_ERROR",
      verified: false 
    });
  }
};

// Get payment status for a paper
export const getPaymentStatus = async (req, res) => {
  try {
    const { paperId } = req.params;
    const userId = req.user.id;

    // Validate paper ID
    if (!paperId) {
      return res.status(400).json({ error: "Paper ID is required" });
    }

    // Check if paper exists and belongs to user
    const paperQuery = "SELECT * FROM registrations WHERE id = ? AND userId = ?";
    db.query(paperQuery, [paperId, userId], (err, papers) => {
      if (err) {
        console.error("Error fetching paper:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!papers || papers.length === 0) {
        return res.status(404).json({ error: "Paper not found" });
      }

      // Get payment details
      paymentModel.getPaymentByPaperId(paperId, async (err, payment) => {
        if (err) {
          console.error("Error fetching payment:", err);
          return res.status(500).json({ error: "Error fetching payment details" });
        }

        const paper = papers[0];
        let parsedAuthors = [];
        try {
          parsedAuthors = typeof paper.authors === "string" ? JSON.parse(paper.authors) : paper.authors;
        } catch {
          parsedAuthors = [];
        }
        
        // Normalize payment status: convert "captured" to "paid" for frontend compatibility
        // The payments table stores "captured" but frontend expects "paid"
        let normalizedStatus = payment ? payment.status : "not_initiated";
        if (normalizedStatus === "captured") {
          normalizedStatus = "paid";
        }

        userPaymentModel.getPaymentConfigByPaperId(paperId, async (configErr, config) => {
          if (configErr) {
            console.error("Error fetching payment config:", configErr);
          }

          let paymentConfig = null;
          if (config) {
            let participantIndexes = [];
            try {
              participantIndexes = config.participantIndexes
                ? JSON.parse(config.participantIndexes)
                : [];
            } catch {
              participantIndexes = [];
            }

            paymentConfig = {
              paperId: config.paperId,
              presentationMode: config.presentationMode,
              stayRequired: !!config.stayRequired,
              participantIndexes,
              baseCategory: config.baseCategory,
              baseAmount: config.baseAmount,
              additionalParticipants: config.additionalParticipants,
              additionalAmount: config.additionalAmount,
              totalAmount: config.totalAmount,
              currency: config.currency || PAYMENT_CURRENCY
            };
          }

          let pricing = null;
          try {
            const authorType = (parsedAuthors[0]?.type || "").toString().trim().toLowerCase().replace(/\s+/g, "_");
            pricing = await conferenceConfigModel.getPricing(authorType, paper.country);
          } catch (pricingError) {
            console.error("Error loading payment rate for status:", pricingError);
          }
          const isInternational = pricing ? pricing.isInternational : isInternationalCountry(paper.country);
          const paymentRestriction = isInternational ? INTERNATIONAL_PAYMENT_MESSAGE : null;

          paymentModel.getCustomAmountByPaperId(paperId, (customErr, customAmount) => {
            const hasCustom = !customErr && customAmount && Number.isInteger(customAmount) && customAmount > 0;

            if (paymentConfig && hasCustom) {
              paymentConfig.baseAmount = customAmount;
              paymentConfig.totalAmount = customAmount + (paymentConfig.additionalAmount || 0);
            }

            const sendResponse = (amountToDisplay, amountOverride) => {
              res.status(200).json({
                paperId: paperId,
                paperTitle: paper.paperTitle,
                finalSubmissionStatus: paper.finalSubmissionStatus,
                paymentStatus: normalizedStatus,
                paymentId: payment ? payment.razorpayPaymentId : null,
                amount: amountToDisplay,
                currency: payment ? payment.currency : PAYMENT_CURRENCY,
                displayCurrency: pricing?.currency || (payment ? payment.currency : PAYMENT_CURRENCY),
                paymentDate: payment ? payment.createdAt : null,
                canPay: !isInternational && (!payment || (payment.status !== "captured" && payment.status !== "paid" && payment.status !== "refunded")),
                paymentConfig,
                amountOverride: amountOverride || null,
                authors: parsedAuthors,
                country: paper.country || null,
                isInternational,
                paymentRestriction
              });
            };

            // Determine amount to display: use payment amount if exists, otherwise check custom amount, then config amount, else default
            if (payment && payment.amount) {
              return sendResponse(payment.amount, hasCustom ? customAmount : null);
            }

            const configAmount = paymentConfig && Number.isInteger(paymentConfig.totalAmount)
              ? paymentConfig.totalAmount
              : null;

            let amountToDisplay = PAYMENT_AMOUNT;
            let overrideAmount = null;

            if (hasCustom) {
              amountToDisplay = customAmount + (paymentConfig ? (paymentConfig.additionalAmount || 0) : 0);
              overrideAmount = customAmount;
            } else if (configAmount && configAmount > 0) {
              amountToDisplay = configAmount;
            }

            return sendResponse(amountToDisplay, overrideAmount);
          });
        });
      });
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, error } = req.body;
    const userId = req.user.id;

    if (!razorpayOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Update payment status to failed
    paymentModel.markPaymentFailed(
      razorpayOrderId, 
      error || "Payment failed by user",
      (err, result) => {
        if (err) {
          console.error("Error updating payment status:", err);
          return res.status(500).json({ error: "Failed to update payment status" });
        }

        // Add audit log
        paymentModel.addAuditLog({
          paymentId: null,
          razorpayOrderId,
          action: "payment_failed",
          details: { error, razorpayPaymentId },
          userId,
        });

        res.status(200).json({
          success: true,
          message: "Payment marked as failed",
        });
      }
    );
  } catch (error) {
    console.error("Handle payment failure error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all payments for the current user
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    paymentModel.getPaymentsByUserId(userId, (err, payments) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ error: "Error fetching payments" });
      }

      res.status(200).json({
        payments: payments || [],
      });
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    paymentModel.getAllPayments((err, payments) => {
      if (err) {
        console.error("Error fetching all payments:", err);
        return res.status(500).json({ error: "Error fetching payments" });
      }

      res.status(200).json({
        payments: payments || [],
        total: payments ? payments.length : 0,
      });
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total payment received (admin only) - calculates sum of all captured/paid payments
export const getTotalPaymentReceived = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    paymentModel.getAllPayments((err, payments) => {
      if (err) {
        console.error("Error fetching payments for total:", err);
        return res.status(500).json({ error: "Error fetching payments" });
      }

      // Calculate total from payments with status "captured" or "paid"
      const totalAmount = payments.reduce((sum, payment) => {
        const status = payment.status?.toString().toLowerCase();
        if (status === 'captured' || status === 'paid') {
          return sum + (payment.amount || 0);
        }
        return sum;
      }, 0);

      res.status(200).json({
        totalAmount: totalAmount,
        currency: "INR"
      });
    });
  } catch (error) {
    console.error("Get total payment received error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle webhook from Razorpay
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(body, signature);
    
    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }
    
    const event = req.body;
    const payload = event && event.payload && event.payload.payment && event.payload.payment.entity;
    
    if (!payload) {
      console.log("No payment payload in webhook");
      return res.status(200).json({ received: true });
    }
    
    const razorpayOrderId = payload.order_id;
    const razorpayPaymentId = payload.id;
    
    // Get payment from database
    paymentModel.getPaymentByOrderId(razorpayOrderId, async (err, payment) => {
      if (err || !payment) {
        console.error("Payment not found for webhook:", razorpayOrderId);
        return res.status(200).json({ received: true });
      }
      
      switch (event.event) {
        case "payment.captured":
          // Verify amount matches DB before accepting webhook capture
          if (typeof payload.amount !== 'undefined' && payload.amount !== payment.amount) {
            console.error('Webhook amount mismatch for order', razorpayOrderId, { webhookAmount: payload.amount, expected: payment.amount });
            // Mark failed and log
            paymentModel.markPaymentFailed(
              razorpayOrderId,
              'Webhook amount mismatch',
              (err) => { if (err) console.error('Error marking payment failed:', err); }
            );
            paymentModel.addAuditLog({
              paymentId: payment.id,
              razorpayOrderId,
              action: 'webhook_amount_mismatch',
              details: { source: 'webhook', webhookAmount: payload.amount, expected: payment.amount },
            });
            // Stop processing this webhook
            return res.status(200).json({ received: true });
          }

          // Update payment status
          paymentModel.updatePaymentStatus(
            razorpayOrderId,
            "captured",
            razorpayPaymentId,
            (err) => {
              if (err) {
                console.error("Error updating payment status:", err);
              }

              // Update registration
              const updateQuery = `
                UPDATE registrations 
                SET paymentStatus = 'paid', 
                    paymentId = ?,
                    paymentDate = NOW()
                WHERE id = ?
              `;
              db.query(updateQuery, [razorpayPaymentId, payment.paperId], (err) => {
                if (err) {
                  console.error("Error updating registration:", err);
                }
              });

              // Add audit log
              paymentModel.addAuditLog({
                paymentId: payment.id,
                razorpayOrderId,
                action: "webhook_payment_captured",
                details: { source: "webhook", razorpayPaymentId },
              });
            }
          );
          break;
          
        case "payment.failed":
            paymentModel.markPaymentFailed(
            razorpayOrderId,
            (payload && payload.error && payload.error.description) || "Payment failed as per Razorpay",
            (err) => {
              if (err) console.error("Error marking payment failed:", err);
              
              paymentModel.addAuditLog({
                paymentId: payment.id,
                razorpayOrderId,
                action: "webhook_payment_failed",
                details: { source: "webhook", error: payload && payload.error },
              });
            }
          );
          break;
          
        default:
          console.log("Unhandled webhook event:", event.event);
      }
      
      res.status(200).json({ received: true });
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check payment status (for manual verification)
export const checkPaymentStatus = async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;
    
    if (!razorpayOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Get payment from database
    paymentModel.getPaymentByOrderId(razorpayOrderId, async (err, payment) => {
      if (err || !payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      // If already captured, no need to check with Razorpay
      if (payment.status === "captured") {
        return res.status(200).json({
          status: payment.status,
          alreadyVerified: true,
        });
      }
      
      // Check with Razorpay
      if (payment.razorpayPaymentId) {
        const result = await razorpayService.isPaymentCaptured(payment.razorpayPaymentId);
        
        if (result.captured) {
          // Update status
          paymentModel.updatePaymentStatus(
            razorpayOrderId,
            "captured",
            payment.razorpayPaymentId,
            (err) => {
              if (err) console.error("Error updating status:", err);
              
              // Update registration
              const updateQuery = `
                UPDATE registrations 
                SET paymentStatus = 'paid', 
                    paymentId = ?,
                    paymentDate = NOW()
                WHERE id = ?
              `;
              db.query(updateQuery, [payment.razorpayPaymentId, payment.paperId]);
            }
          );
          
          paymentModel.addAuditLog({
            paymentId: payment.id,
            razorpayOrderId,
            action: "manual_verification_success",
            details: { source: "manual_check" },
          });
          
          return res.status(200).json({
            status: "captured",
            verified: true,
          });
        }
      }
      
      res.status(200).json({
        status: payment.status,
        verified: false,
      });
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  handlePaymentFailure,
  getUserPayments,
  getAllPayments,
  getTotalPaymentReceived,
  handleWebhook,
  checkPaymentStatus,
};
