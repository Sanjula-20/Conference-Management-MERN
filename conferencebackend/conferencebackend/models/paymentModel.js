import { db } from "../config/db.js";

// Payment model for handling payment-related database operations
export const paymentModel = {
  // Create payment record
  createPayment: (paymentData, callback) => {
    const { paperId, userId, amount, currency, razorpayOrderId, status, idempotencyKey } = paymentData;
    
    const query = `
      INSERT INTO payments (paperId, userId, amount, currency, razorpayOrderId, status, idempotencyKey, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(query, [paperId, userId, amount, currency || 'INR', razorpayOrderId, status || 'pending', idempotencyKey || null], (err, result) => {
      if (err) {
        console.error("Error creating payment record:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Update payment status
  updatePaymentStatus: (razorpayOrderId, status, razorpayPaymentId, callback) => {
    // Ensure callback is always a function to prevent crashes
    const cb = typeof callback === 'function' ? callback : () => {};
    
    const query = `
      UPDATE payments 
      SET status = ?, 
          razorpayPaymentId = ?, 
          updatedAt = NOW()
      WHERE razorpayOrderId = ?
    `;
    
    db.query(query, [status, razorpayPaymentId, razorpayOrderId], (err, result) => {
      if (err) {
        console.error("Error updating payment status:", err);
        return cb(err, null);
      }
      return cb(null, result);
    });
  },

  // Get payment by paper ID
  getPaymentByPaperId: (paperId, callback) => {
    const query = `
      SELECT * FROM payments WHERE paperId = ? ORDER BY createdAt DESC LIMIT 1
    `;
    
    db.query(query, [paperId], (err, result) => {
      if (err) {
        console.error("Error fetching payment by paper ID:", err);
        return callback(err, null);
      }
      return callback(null, result[0] || null);
    });
  },

  // Get payment by order ID
  getPaymentByOrderId: (razorpayOrderId, callback) => {
    const query = `
      SELECT * FROM payments WHERE razorpayOrderId = ?
    `;
    
    db.query(query, [razorpayOrderId], (err, result) => {
      if (err) {
        console.error("Error fetching payment by order ID:", err);
        return callback(err, null);
      }
      return callback(null, result[0] || null);
    });
  },

  // Check if payment is already completed for a paper
  isPaymentCompleted: (paperId, callback) => {
    const query = `
      SELECT COUNT(*) as count FROM payments 
      WHERE paperId = ? AND status = 'captured'
    `;
    
    db.query(query, [paperId], (err, result) => {
      if (err) {
        console.error("Error checking payment status:", err);
        return callback(err, null);
      }
      return callback(null, result[0].count > 0);
    });
  },

  // Check if there's a pending payment for a paper (prevent concurrent attempts)
  getPendingPayment: (paperId, callback) => {
    const query = `
      SELECT * FROM payments 
      WHERE paperId = ? AND status = 'pending' 
      AND createdAt > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      ORDER BY createdAt DESC LIMIT 1
    `;
    
    db.query(query, [paperId], (err, result) => {
      if (err) {
        console.error("Error fetching pending payment:", err);
        return callback(err, null);
      }
      return callback(null, result[0] || null);
    });
  },

  // Check idempotency key to prevent duplicate orders
  checkIdempotencyKey: (idempotencyKey, callback) => {
    if (!idempotencyKey) {
      return callback(null, null);
    }
    const query = `
      SELECT * FROM payments WHERE idempotencyKey = ?
    `;
    
    db.query(query, [idempotencyKey], (err, result) => {
      if (err) {
        console.error("Error checking idempotency key:", err);
        return callback(err, null);
      }
      return callback(null, result[0] || null);
    });
  },

  // Mark payment confirmation email as sent
  markEmailSent: (paperId, callback) => {
    const cb = typeof callback === 'function' ? callback : () => {};
    const query = `
      UPDATE payments
      SET paymentEmailSent = TRUE,
          updatedAt = NOW()
      WHERE paperId = ? AND status = 'captured' AND paymentEmailSent = FALSE
    `;

    db.query(query, [paperId], (err, result) => {
      if (err) {
        console.error("Error marking payment email as sent:", err);
        return cb(err, null);
      }
      return cb(null, result);
    });
  },

  // Get all payments for a user
  getPaymentsByUserId: (userId, callback) => {
    const query = `
      SELECT p.*, r.paperTitle, r.userId as regUserId
      FROM payments p
      LEFT JOIN registrations r ON p.paperId = r.id
      WHERE p.userId = ?
      ORDER BY p.createdAt DESC
    `;
    
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching payments by user ID:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Get all pending payments older than specified minutes (for cleanup/sync)
  getPendingPaymentsOlderThan: (minutes, callback) => {
    const query = `
      SELECT * FROM payments 
      WHERE status = 'pending' 
      AND createdAt < DATE_SUB(NOW(), INTERVAL ? MINUTE)
      ORDER BY createdAt ASC
    `;
    
    db.query(query, [minutes], (err, result) => {
      if (err) {
        console.error("Error fetching pending payments:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Get all payments (for admin)
  getAllPayments: (callback) => {
    const query = `
      SELECT p.*, r.paperTitle, r.userId as regUserId 
      FROM payments p
      LEFT JOIN registrations r ON p.paperId = r.id
      ORDER BY p.createdAt DESC
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching all payments:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Mark payment as failed with reason
  markPaymentFailed: (razorpayOrderId, failureReason, callback) => {
    // Ensure callback is always a function to prevent crashes
    const cb = typeof callback === 'function' ? callback : () => {};
    
    const query = `
      UPDATE payments 
      SET status = 'failed', 
          failureReason = ?,
          updatedAt = NOW()
      WHERE razorpayOrderId = ?
    `;
    
    db.query(query, [failureReason, razorpayOrderId], (err, result) => {
      if (err) {
        console.error("Error marking payment failed:", err);
        return cb(err, null);
      }
      return cb(null, result);
    });
  },

  // Add audit log entry
  addAuditLog: (auditData, callback) => {
    // Ensure callback is always a function to prevent crashes
    const cb = typeof callback === 'function' ? callback : () => {};
    
    const { paymentId, razorpayOrderId, action, details, userId } = auditData;
    
    const query = `
      INSERT INTO payment_audit_logs (paymentId, razorpayOrderId, action, details, userId, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(query, [paymentId, razorpayOrderId, action, JSON.stringify(details), userId], (err, result) => {
      if (err) {
        console.error("Error adding audit log:", err);
        return cb(err, null);
      }
      return cb(null, result);
    });
  },

  // Get audit logs for a payment
  getAuditLogs: (razorpayOrderId, callback) => {
    const query = `
      SELECT * FROM payment_audit_logs 
      WHERE razorpayOrderId = ?
      ORDER BY createdAt ASC
    `;
    
    db.query(query, [razorpayOrderId], (err, result) => {
      if (err) {
        console.error("Error fetching audit logs:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Initialize payments table
  initializeTable: () => {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paperId INT NOT NULL,
        userId VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        razorpayOrderId VARCHAR(100) UNIQUE,
        razorpayPaymentId VARCHAR(100),
        status ENUM('pending', 'captured', 'failed', 'refunded') DEFAULT 'pending',
        idempotencyKey VARCHAR(100) UNIQUE,
        failureReason TEXT,
        paymentEmailSent BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
        INDEX idx_paperId (paperId),
        INDEX idx_userId (userId),
        INDEX idx_razorpayOrderId (razorpayOrderId),
        INDEX idx_status (status),
        INDEX idx_idempotencyKey (idempotencyKey),
        INDEX idx_userId_createdAt (userId, createdAt),
        INDEX idx_status_createdAt (status, createdAt),
        INDEX idx_paperId_status (paperId, status),
        INDEX idx_createdAt (createdAt)
      )
    `;
    
    db.query(createQuery, (err) => {
      if (err) {
        console.error("Error creating payments table:", err);
      } else {
        console.log("Payments table initialized successfully");
      }
    });

    const ensureEmailSentColumnQuery = `
      ALTER TABLE payments
      ADD COLUMN paymentEmailSent BOOLEAN DEFAULT FALSE
    `;

    db.query(ensureEmailSentColumnQuery, (err) => {
      if (err) {
        if (err.code !== "ER_DUP_FIELDNAME") {
          console.error("Error adding paymentEmailSent column:", err);
        }
      }
    });

    // Create table to store custom payment amounts per paper
    const createCustomAmountsTable = `
      CREATE TABLE IF NOT EXISTS paper_payment_amounts (
        paperId INT PRIMARY KEY,
        amount INT NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE
      )
    `;

    db.query(createCustomAmountsTable, (err) => {
      if (err) {
        console.error("Error creating paper_payment_amounts table:", err);
      }
    });
  },

  // Get custom amount (in paise) for a paperId
  getCustomAmountByPaperId: (paperId, callback) => {
    const query = `SELECT amount FROM paper_payment_amounts WHERE paperId = ? LIMIT 1`;
    db.query(query, [paperId], (err, result) => {
      if (err) {
        console.error("Error fetching custom amount:", err);
        return callback(err, null);
      }
      if (!result || result.length === 0) return callback(null, null);
      return callback(null, result[0].amount);
    });
  },

  // Set or update custom amount (in paise) for a paperId
  setCustomAmountByPaperId: (paperId, amount, callback) => {
    const query = `INSERT INTO paper_payment_amounts (paperId, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount), updatedAt = NOW()`;
    db.query(query, [paperId, amount], (err, result) => {
      if (err) {
        console.error("Error setting custom amount:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Initialize audit logs table
  initializeAuditTable: () => {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS payment_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paymentId INT,
        razorpayOrderId VARCHAR(100),
        action VARCHAR(50) NOT NULL,
        details JSON,
        userId VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_paymentId (paymentId),
        INDEX idx_razorpayOrderId (razorpayOrderId),
        INDEX idx_action (action),
        INDEX idx_createdAt (createdAt)
      )
    `;
    
    db.query(createQuery, (err) => {
      if (err) {
        console.error("Error creating payment_audit_logs table:", err);
      } else {
        console.log("Payment audit logs table initialized successfully");
      }
    });
  }
};

// Provide a fallback alias with the capitalized name to avoid ReferenceError
// in environments or older code that accidentally reference `PaymentModel`.
const PaymentModel = paymentModel;

export default paymentModel;
