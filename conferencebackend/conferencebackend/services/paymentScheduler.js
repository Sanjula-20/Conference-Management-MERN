import { paymentModel } from "../models/paymentModel.js";
import { fetchPaymentFromRazorpay, isPaymentCaptured } from "./razorpayService.js";
import { db } from "../config/db.js";

// Check and update pending payments
export const checkPendingPayments = async () => {
  console.log("Running pending payment check...");
  
  try {
    // Get pending payments older than 5 minutes
    paymentModel.getPendingPaymentsOlderThan(5, async (err, payments) => {
      if (err) {
        console.error("Error fetching pending payments:", err);
        return;
      }
      
      if (!payments || payments.length === 0) {
        console.log("No pending payments to check");
        return;
      }
      
      console.log(`Found ${payments.length} pending payments to verify`);
      
      for (const payment of payments) {
        try {
          // Check payment status with Razorpay
          if (payment.razorpayOrderId) {
            const result = await isPaymentCaptured(payment.razorpayPaymentId);
            
            if (result.captured) {
              // Payment was successful, update status
              paymentModel.updatePaymentStatus(
                payment.razorpayOrderId,
                "captured",
                payment.razorpayPaymentId,
                async (err) => {
                  if (err) {
                    console.error("Error updating payment status:", err);
                    return;
                  }
                  
                  // Update registration payment status
                  const updateQuery = `
                    UPDATE registrations 
                    SET paymentStatus = 'paid', 
                        paymentId = ?,
                        paymentDate = NOW()
                    WHERE id = ?
                  `;
                  db.query(updateQuery, [payment.razorpayPaymentId, payment.paperId], (err) => {
                    if (err) {
                      console.error("Error updating registration payment status:", err);
                    }
                  });
                  
                  // Add audit log
                  paymentModel.addAuditLog({
                    paymentId: payment.id,
                    razorpayOrderId: payment.razorpayOrderId,
                    action: "payment_verified",
                    details: { source: "scheduler", razorpayPaymentId: payment.razorpayPaymentId },
                    userId: payment.userId,
                  });
                  
                  console.log(`Payment ${payment.razorpayOrderId} verified and updated to captured`);
                }
              );
            } else if (result.status === "failed") {
              // Payment failed
              paymentModel.markPaymentFailed(
                payment.razorpayOrderId,
                "Payment failed as per Razorpay",
                (err) => {
                  if (err) {
                    console.error("Error marking payment failed:", err);
                    return;
                  }
                  
                  paymentModel.addAuditLog({
                    paymentId: payment.id,
                    razorpayOrderId: payment.razorpayOrderId,
                    action: "payment_failed",
                    details: { source: "scheduler", status: result.status },
                    userId: payment.userId,
                  });
                  
                  console.log(`Payment ${payment.razorpayOrderId} marked as failed`);
                }
              );
            }
          }
        } catch (error) {
          console.error(`Error checking payment ${payment.razorpayOrderId}:`, error);
        }
      }
    });
  } catch (error) {
    console.error("Error in checkPendingPayments:", error);
  }
};

// Cleanup expired pending orders (older than 30 minutes)
export const cleanupExpiredOrders = async () => {
  console.log("Running expired order cleanup...");
  
  try {
    paymentModel.getPendingPaymentsOlderThan(30, (err, payments) => {
      if (err) {
        console.error("Error fetching expired payments:", err);
        return;
      }
      
      if (!payments || payments.length === 0) {
        console.log("No expired orders to cleanup");
        return;
      }
      
      console.log(`Found ${payments.length} expired orders to cleanup`);
      
      for (const payment of payments) {
        // Mark as failed with reason
        paymentModel.markPaymentFailed(
          payment.razorpayOrderId,
          "Payment session expired - no payment received within timeout period",
          (err) => {
            if (err) {
              console.error("Error marking payment as expired:", err);
              return;
            }
            
            paymentModel.addAuditLog({
              paymentId: payment.id,
              razorpayOrderId: payment.razorpayOrderId,
              action: "payment_expired",
              details: { source: "scheduler", timeoutMinutes: 30 },
              userId: payment.userId,
            });
            
            console.log(`Payment ${payment.razorpayOrderId} marked as expired`);
          }
        );
      }
    });
  } catch (error) {
    console.error("Error in cleanupExpiredOrders:", error);
  }
};

// Start the scheduler
export const startPaymentScheduler = () => {
  // Check pending payments every 5 minutes
  setInterval(checkPendingPayments, 5 * 60 * 1000);
  
  // Cleanup expired orders every 15 minutes
  setInterval(cleanupExpiredOrders, 15 * 60 * 1000);
  
  console.log("Payment scheduler started");
  
  // Run initial check after 30 seconds
  setTimeout(checkPendingPayments, 30000);
  setTimeout(cleanupExpiredOrders, 45000);
};

export default {
  checkPendingPayments,
  cleanupExpiredOrders,
  startPaymentScheduler,
};
