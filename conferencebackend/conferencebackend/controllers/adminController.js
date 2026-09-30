  import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';
    import { db } from '../config/db.js';
    import {
      sendReviewerAssignmentEmail,
      sendReviewerCredentialsEmail,
      sendPaperStatusUpdateEmail,
      sendFinalSubmissionResetEmail,
      sendReviewReminderEmail,
      sendPasswordResetEmail
    } from '../services/emailServices.js';
  import { getReviewDeadlineMinutes } from '../config/reviewSchedule.js';
  import { paymentModel } from '../models/paymentModel.js';
  import { settingsModel } from '../models/settingsModel.js';
  import crypto from 'crypto';
  import * as XLSX from 'xlsx';

    const JWT_SECRET = process.env.JWT_SECRET || 'necadmin';

    // List all assignments (admin)
    export const getAllAssignments = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { fromDate, toDate, paperTracks, reviewerTracks, paperId } = req.query;
      let query = `
        SELECT
          pa.paperId,
          r.paperTitle,
          r.tracks as paperTracks,
          r.createdAt,
          u1.name as reviewer1Name,
          CONCAT(u1.name, ' (', u1.email, ')') as reviewer1Details,
          u1.track as reviewer1Track,
          u2.name as reviewer2Name,
          CONCAT(u2.name, ' (', u2.email, ')') as reviewer2Details,
          u2.track as reviewer2Track,
          pa.reviewer1,
          pa.reviewer2
        FROM paper_assignments pa
        JOIN registrations r ON pa.paperId = r.id
        LEFT JOIN users u1 ON pa.reviewer1 = u1.id
        LEFT JOIN users u2 ON pa.reviewer2 = u2.id
      `;
      const params = [];
      const conditions = [];

      if (fromDate) {
        conditions.push('r.createdAt >= ?');
        params.push(fromDate);
      }
      if (toDate) {
        conditions.push('r.createdAt < DATE_ADD(?, INTERVAL 1 DAY)');
        params.push(toDate);
      }
      if (paperId) {
        conditions.push('r.id LIKE ?');
        params.push(`%${paperId}%`);
      }
      if (paperTracks) {
        const tracks = Array.isArray(paperTracks) ? paperTracks : [paperTracks];
        const placeholders = tracks.map(() => '?').join(',');
        conditions.push(`r.tracks IN (${placeholders})`);
        params.push(...tracks);
      }
      if (reviewerTracks) {
        const tracks = Array.isArray(reviewerTracks) ? reviewerTracks : [reviewerTracks];
        const placeholders = tracks.map(() => '?').join(',');
        conditions.push(`(u1.track IN (${placeholders}) OR u2.track IN (${placeholders}))`);
        params.push(...tracks, ...tracks);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY r.paperTitle';

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('DB error fetching assignments:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Process results to format reviewers
        const processedResults = results.map(row => {
          const reviewerNames = [];
          const reviewerDetails = [];
          const reviewerIds = [];
          if (row.reviewer1) {
            reviewerNames.push(row.reviewer1Name);
            reviewerDetails.push(row.reviewer1Details);
            reviewerIds.push(row.reviewer1);
          }
          if (row.reviewer2) {
            reviewerNames.push(row.reviewer2Name);
            reviewerDetails.push(row.reviewer2Details);
            reviewerIds.push(row.reviewer2);
          }
          return {
            paperId: row.paperId,
            paperTitle: row.paperTitle,
            track: row.paperTracks,
            reviewerNames,
            reviewerDetails,
            reviewerIds
          };
        });

        res.json(processedResults);
      });
    };

  // Admin: update custom payment amount for a paper
  export const updatePaperPaymentAmount = (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { paperId, amount } = req.body; // amount expected in rupees (number or string)

    if (!paperId || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'paperId and amount are required' });
    }

    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const amountPaise = Math.round(parsed * 100);

    // Verify paper exists
    db.query('SELECT id FROM registrations WHERE id = ?', [paperId], (err, results) => {
      if (err) {
        console.error('DB error checking paper:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      paymentModel.setCustomAmountByPaperId(paperId, amountPaise, (err2) => {
        if (err2) {
          console.error('Error setting custom amount:', err2);
          return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ message: 'Custom amount updated', paperId, amountPaise });
      });
    });
  };

  // Admin: correct country or author details for an existing registration.
  export const updateRegistrationDetails = (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { country, authors } = req.body;
    if (!id || typeof country !== 'string' || !country.trim() || !Array.isArray(authors) || authors.length === 0) {
      return res.status(400).json({ error: 'A country and at least one author are required' });
    }

    const cleanAuthors = authors.map((author) => ({
      name: String(author?.name || '').trim(),
      designation: String(author?.designation || '').trim(),
      type: String(author?.type || '').trim(),
      institution: String(author?.institution || '').trim(),
      email: String(author?.email || '').trim(),
      mobile: String(author?.mobile || '').trim()
    }));
    if (cleanAuthors.some((author) => !author.name)) {
      return res.status(400).json({ error: 'Each author must have a name' });
    }

    db.query(
      'UPDATE registrations SET country = ?, authors = ? WHERE id = ?',
      [country.trim(), JSON.stringify(cleanAuthors), id],
      (err, result) => {
        if (err) {
          console.error('DB error updating registration details:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!result.affectedRows) return res.status(404).json({ error: 'Registration not found' });
        return res.json({ message: 'Registration details updated', id: Number(id), country: country.trim(), authors: cleanAuthors });
      }
    );
  };

  // Admin: list conference participants (user payment configs) with pagination
  export const getConferenceParticipants = (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const includeUnpaid = String(req.query.includeUnpaid || '').toLowerCase() === 'true';
    const whereClause = includeUnpaid ? '' : "WHERE r.paymentStatus = 'paid'";

    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_payment_configs upc
      LEFT JOIN registrations r ON upc.paperId = r.id
      ${whereClause}
    `;
    const dataQuery = `
      SELECT
        upc.*,
        r.paperTitle,
        r.authors,
        r.paymentStatus,
        r.paymentId,
        r.paymentDate
      FROM user_payment_configs upc
      LEFT JOIN registrations r ON upc.paperId = r.id
      ${whereClause}
      ORDER BY upc.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (countErr, countResult) => {
      if (countErr) {
        console.error('DB error counting conference participants:', countErr);
        return res.status(500).json({
          error: 'Database error',
          details: process.env.NODE_ENV === 'production' ? undefined : countErr.message
        });
      }

      const total = countResult && countResult[0] ? countResult[0].total : 0;

      db.query(dataQuery, [limit, offset], (dataErr, rows) => {
        if (dataErr) {
          console.error('DB error fetching conference participants:', dataErr);
          return res.status(500).json({
            error: 'Database error',
            details: process.env.NODE_ENV === 'production' ? undefined : dataErr.message
          });
        }

        return res.json({
          data: rows || [],
          page,
          limit,
          total,
          totalPages: total ? Math.ceil(total / limit) : 1
        });
      });
    });
  };

    // Delete assignment (unassign reviewer from paper)
    export const deleteAssignment = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      const { paperId, reviewerId } = req.params;
      if (!paperId || !reviewerId) {
        return res.status(400).json({ error: 'Paper ID and reviewer ID are required' });
      }
      // Check which reviewer column to set to NULL
      const checkQuery = 'SELECT reviewer1, reviewer2 FROM paper_assignments WHERE paperId = ?';
      db.query(checkQuery, [paperId], (err, results) => {
        if (err) {
          console.error('DB error checking assignment:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Assignment not found' });
        }
        const row = results[0];
        let updateQuery;
        let params;
        if (row.reviewer1 == reviewerId) {
          updateQuery = 'UPDATE paper_assignments SET reviewer1 = NULL, reviewer1DueAt = NULL WHERE paperId = ?';
          params = [paperId];
        } else if (row.reviewer2 == reviewerId) {
          updateQuery = 'UPDATE paper_assignments SET reviewer2 = NULL, reviewer2DueAt = NULL WHERE paperId = ?';
          params = [paperId];
        } else {
          return res.status(404).json({ error: 'Reviewer not assigned to this paper' });
        }
        db.query(updateQuery, params, (err, result) => {
          if (err) {
            console.error('DB error updating assignment:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Assignment deleted successfully', paperId, reviewerId });
        });
      });
    };

    // Update assignment (change reviewer for a paper)
    export const updateAssignment = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      const { paperId, reviewerId } = req.params;
      const { reviewerId: newReviewerId } = req.body;
      if (!paperId || !reviewerId || !newReviewerId) {
        return res.status(400).json({ error: 'Paper ID, current reviewer ID, and new reviewer ID are required' });
      }
      // First, check current assignments
      const checkQuery = 'SELECT reviewer1, reviewer2 FROM paper_assignments WHERE paperId = ?';
      db.query(checkQuery, [paperId], (err, results) => {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Assignment not found' });
        }
        const row = results[0];
        let updateQuery;
        let params;
        if (row.reviewer1 == reviewerId) {
          updateQuery = `UPDATE paper_assignments SET reviewer1 = ?, reviewer1DueAt = DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE) WHERE paperId = ?`;
          params = [newReviewerId, paperId];
        } else if (row.reviewer2 == reviewerId) {
          updateQuery = `UPDATE paper_assignments SET reviewer2 = ?, reviewer2DueAt = DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE) WHERE paperId = ?`;
          params = [newReviewerId, paperId];
        } else {
          return res.status(404).json({ error: 'Reviewer not assigned to this paper' });
        }
        db.query(updateQuery, params, (err, result) => {
          if (err) {
            console.error('DB error updating assignment:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Assignment updated successfully', paperId, oldReviewerId: reviewerId, newReviewerId });
        });
      });
    };

    export const createReviewer = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { name, email, password, track, institution, reviewerType } = req.body;
      const normalizedReviewerType = reviewerType === 'external' ? 'external' : 'internal';

      if (!name || !email || !password || !track || !institution?.trim()) {
        return res.status(400).json({ error: 'Name, email, institution, password, and track are required' });
      }

      try {
        // Check if user already exists
        const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], async (err, results) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert reviewer
          const insertQuery = 'INSERT INTO users (name, email, password, role, track, institution, reviewerType, isFirstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, 1)';
          db.query(insertQuery, [name, email, hashedPassword, 'reviewer', track, institution || null, normalizedReviewerType], async (err, result) => {
            if (err) {
              console.error('DB insert error:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Send email with credentials to the new reviewer
            let emailLog = '';
            try {
              await sendReviewerCredentialsEmail(email, name, password);
              emailLog = `Reviewer credentials email sent successfully to ${email}`;
              console.log(emailLog);
            } catch (emailError) {
              emailLog = `Failed to send reviewer credentials email to ${email}: ${emailError.message}`;
              console.error(emailLog);
              // Don't fail the creation if email fails
            }

            res.status(201).json({
              message: 'Reviewer created successfully',
              user: { id: result.insertId, name, email, role: 'reviewer', track, institution, reviewerType: normalizedReviewerType },
              emailSent: true,
              emailLog: emailLog
            });
          });
        });
      } catch (error) {
        console.error('Create reviewer error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    export const getReviewers = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = "SELECT id, name, email, track, institution, reviewerType FROM users WHERE role = 'reviewer'";

      db.query(query, (err, results) => {
        if (err) {
          console.error('DB error fetching reviewers:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
      });
    };

    // Helper function to assign reviewer without req/res
    export const assignReviewerDirect = async (paperId, reviewerId) => {
      return new Promise((resolve, reject) => {
        if (!paperId || !reviewerId) {
          return reject(new Error('paperId and reviewerId are required'));
        }

        try {
          // Check current assignments for the paper
          const checkQuery = 'SELECT reviewer1, reviewer2 FROM paper_assignments WHERE paperId = ?';
          db.query(checkQuery, [paperId], async (err, results) => {
            if (err) {
              console.error('DB error:', err);
              return reject(err);
            }

            let reviewer1 = null;
            let reviewer2 = null;
            let hasRow = false;
            let slot;

            if (results.length > 0) {
              hasRow = true;
              reviewer1 = results[0].reviewer1;
              reviewer2 = results[0].reviewer2;
            }

            // Check if reviewer is already assigned to this paper
            if (reviewer1 == reviewerId || reviewer2 == reviewerId) {
              return reject(new Error('Reviewer already assigned to this paper'));
            }

            // Determine available slot
            if (reviewer1 === null) {
              slot = 1;
            } else if (reviewer2 === null) {
              slot = 2;
            } else {
              return reject(new Error('No available slot'));
            }

            // Get reviewer and paper details for email
            const getDetailsQuery = `
              SELECT u.name as reviewerName, u.email as reviewerEmail, r.paperTitle
              FROM users u
              JOIN registrations r ON r.id = ?
              WHERE u.id = ?
            `;

            db.query(getDetailsQuery, [paperId, reviewerId], async (err, details) => {
              if (err) {
                console.error('DB error fetching details:', err);
                return reject(err);
              }

              if (details.length === 0) {
                return reject(new Error('Reviewer or paper not found'));
              }

              const { reviewerName, reviewerEmail, paperTitle } = details[0];

              let query;
              let params;

              if (!hasRow) {
                // Insert new assignment row
                if (slot === 1) {
                  query = `INSERT INTO paper_assignments (paperId, reviewer1, reviewer1DueAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE))`;
                  params = [paperId, reviewerId];
                } else {
                  query = `INSERT INTO paper_assignments (paperId, reviewer2, reviewer2DueAt) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE))`;
                  params = [paperId, reviewerId];
                }
              } else {
                // Update existing row
                if (slot === 1) {
                  query = `UPDATE paper_assignments SET reviewer1 = ?, reviewer1DueAt = DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE) WHERE paperId = ?`;
                  params = [reviewerId, paperId];
                } else {
                  query = `UPDATE paper_assignments SET reviewer2 = ?, reviewer2DueAt = DATE_ADD(NOW(), INTERVAL ${getReviewDeadlineMinutes()} MINUTE) WHERE paperId = ?`;
                  params = [reviewerId, paperId];
                }
              }

              db.query(query, params, async (err, result) => {
                if (err) {
                  console.error('DB insert/update error:', err);
                  return reject(err);
                }

                // Update paper status to under_review
                const updateStatusQuery = 'UPDATE registrations SET status = ? WHERE id = ?';
                db.query(updateStatusQuery, ['under_review', paperId], async (err, updateResult) => {
                  if (err) {
                    console.error('DB error updating paper status:', err);
                    return reject(err);
                  }

                  // Send email notification to reviewer (don't fail assignment if email fails)
                  try {
                    console.log(`Attempting to send assignment email to: ${reviewerEmail}`);
                    await sendReviewerAssignmentEmail(reviewerEmail, reviewerName, paperTitle, paperId);
                    console.log(`✅ Assignment notification sent successfully to reviewer: ${reviewerEmail}`);
                  } catch (emailError) {
                    console.error('❌ Failed to send assignment notification email:', emailError.message);
                    console.error('Full email error details:', emailError);
                    // Continue without failing
                  }

                  resolve({
                    message: 'Reviewer assigned successfully',
                    assignmentId: result.insertId || result.affectedRows,
                    emailSent: true
                  });
                });
              });
            });
          });
        } catch (error) {
          console.error('Assign reviewer error:', error);
          reject(error);
        }
      });
    };

    export const assignReviewer = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId, reviewerId } = req.body;

      try {
        const result = await assignReviewerDirect(paperId, reviewerId);
        return res.status(201).json(result);
      } catch (error) {
        console.error('Assign reviewer error:', error);
        if (error.message === 'Reviewer already assigned to this paper') {
          return res.status(400).json({ error: error.message });
        }
        if (error.message === 'No available slot') {
          return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Reviewer or paper not found') {
          return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Server error' });
      }
    };

    export const getReviewersWithAssignments = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.track,
          u.institution,
          u.reviewerType,
          COUNT(DISTINCT pa.paperId) as assignedPapers,
          GROUP_CONCAT(DISTINCT r.paperTitle SEPARATOR '; ') as paperTitles
        FROM users u
        LEFT JOIN (
          SELECT paperId, reviewer1 as reviewerId FROM paper_assignments WHERE reviewer1 IS NOT NULL
          UNION ALL
          SELECT paperId, reviewer2 as reviewerId FROM paper_assignments WHERE reviewer2 IS NOT NULL
        ) pa ON u.id = pa.reviewerId
        LEFT JOIN registrations r ON pa.paperId = r.id
        WHERE u.role = 'reviewer'
        GROUP BY u.id, u.name, u.email, u.track, u.institution, u.reviewerType
        ORDER BY u.name
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('DB error fetching reviewers with assignments:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Process the results to format paper titles
        const processedResults = results.map(reviewer => ({
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email,
          track: reviewer.track,
          institution: reviewer.institution,
          reviewerType: reviewer.reviewerType || 'internal',
          assignedPapers: reviewer.assignedPapers || 0,
          paperTitles: reviewer.paperTitles ? reviewer.paperTitles.split('; ') : []
        }));

        res.json(processedResults);
      });
    };

    export const updateReviewer = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { name, email, track, institution, reviewerType } = req.body;
      const normalizedReviewerType = reviewerType === 'external' ? 'external' : (reviewerType === 'internal' ? 'internal' : undefined);

      if (!id || !name || !email || !track || !institution?.trim()) {
        return res.status(400).json({ error: 'ID, name, email, institution, and track are required' });
      }

      try {
        // Check if reviewer exists
        const checkQuery = 'SELECT id, email FROM users WHERE id = ? AND role = ?';
        db.query(checkQuery, [id, 'reviewer'], (err, results) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: 'Reviewer not found' });
          }

          const existingEmail = results[0].email;

          // Check if email is being changed and if new email already exists
          if (email !== existingEmail) {
            const emailCheckQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
            db.query(emailCheckQuery, [email, id], (err, emailResults) => {
              if (err) {
                console.error('DB error checking email:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              if (emailResults.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
              }

              // Update reviewer
              const updateQuery = normalizedReviewerType
                ? 'UPDATE users SET name = ?, email = ?, track = ?, institution = ?, reviewerType = ? WHERE id = ? AND role = ?'
                : 'UPDATE users SET name = ?, email = ?, track = ?, institution = ? WHERE id = ? AND role = ?';
              const updateParams = normalizedReviewerType
                ? [name, email, track, institution || null, normalizedReviewerType, id, 'reviewer']
                : [name, email, track, institution || null, id, 'reviewer'];
              db.query(updateQuery, updateParams, (err, result) => {
                if (err) {
                  console.error('DB error updating reviewer:', err);
                  return res.status(500).json({ error: 'Database error' });
                }

                if (result.affectedRows === 0) {
                  return res.status(404).json({ error: 'Reviewer not found' });
                }

                res.json({
                  message: 'Reviewer updated successfully',
                  reviewer: { id, name, email, track, institution, reviewerType: normalizedReviewerType }
                });
              });
            });
          } else {
            // Email not changed, proceed with update
            const updateQuery = normalizedReviewerType
              ? 'UPDATE users SET name = ?, email = ?, track = ?, institution = ?, reviewerType = ? WHERE id = ? AND role = ?'
              : 'UPDATE users SET name = ?, email = ?, track = ?, institution = ? WHERE id = ? AND role = ?';
            const updateParams = normalizedReviewerType
              ? [name, email, track, institution || null, normalizedReviewerType, id, 'reviewer']
              : [name, email, track, institution || null, id, 'reviewer'];
            db.query(updateQuery, updateParams, (err, result) => {
              if (err) {
                console.error('DB error updating reviewer:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reviewer not found' });
              }

              res.json({
                message: 'Reviewer updated successfully',
                reviewer: { id, name, email, track, institution, reviewerType: normalizedReviewerType }
              });
            });
          }
        });
      } catch (error) {
        console.error('Update reviewer error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    export const deleteReviewer = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Reviewer ID is required' });
      }

      try {
        // Check if reviewer exists
        const checkQuery = 'SELECT id, name FROM users WHERE id = ? AND role = ?';
        db.query(checkQuery, [id, 'reviewer'], (err, results) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: 'Reviewer not found' });
          }

          const reviewerName = results[0].name;

          // Delete assignments first (foreign key constraint)
          const deleteAssignmentsQuery = 'DELETE FROM paper_assignments WHERE reviewer1 = ? OR reviewer2 = ?';
          db.query(deleteAssignmentsQuery, [id, id], (err, result) => {
            if (err) {
              console.error('DB error deleting assignments:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Delete reviewer
            const deleteQuery = 'DELETE FROM users WHERE id = ? AND role = ?';
            db.query(deleteQuery, [id, 'reviewer'], (err, result) => {
              if (err) {
                console.error('DB error deleting reviewer:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reviewer not found' });
              }

              res.json({
                message: `Reviewer "${reviewerName}" deleted successfully`,
                deletedReviewer: { id, name: reviewerName }
              });
            });
          });
        });
      } catch (error) {
        console.error('Delete reviewer error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    // Get assigned papers for a reviewer
    export const getAssignedPapers = (req, res) => {
      if (req.user.role !== 'reviewer') {
        return res.status(403).json({ error: 'Access denied. Reviewer only.' });
      }

      const reviewerId = req.user.id;

      // Show all papers assigned to this reviewer, including resubmissions
      const query = `
        SELECT
          r.id,
          r.paperTitle,
          r.authors,
          r.email,
          r.status,
          r.createdAt,
          r.updatedAt,
          r.abstractBlob,
          r.finalPaperBlob,
          pa.assignedAt,
          pr.status as reviewStatus,
          pr.comments,
          pr.reviewedAt
        FROM (
          SELECT paperId, reviewer1 as reviewerId, assignedAt FROM paper_assignments WHERE reviewer1 IS NOT NULL
          UNION ALL
          SELECT paperId, reviewer2 as reviewerId, assignedAt FROM paper_assignments WHERE reviewer2 IS NOT NULL
        ) pa
        JOIN registrations r ON pa.paperId = r.id
        LEFT JOIN paper_reviews pr ON r.id = pr.paperId AND pr.reviewerId = pa.reviewerId
        WHERE pa.reviewerId = ?
        ORDER BY r.createdAt DESC
      `;

      // **Fixed**: only one "?" placeholder, so pass a single value
      db.query(query, [reviewerId], (err, results) => {
        if (err) {
          console.error('DB error fetching assigned papers:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Convert BLOB data to base64 string for JSON response
        const processedResults = results.map(paper => ({
          id: paper.id,
          paperTitle: paper.paperTitle,
          authors: typeof paper.authors === 'string' ? JSON.parse(paper.authors) : paper.authors,
          email: paper.email,
          status: paper.status,
          createdAt: paper.createdAt,
          updatedAt: paper.updatedAt,
          abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
          finalPaperBlob: paper.finalPaperBlob ? Buffer.from(paper.finalPaperBlob).toString('base64') : null,
          assignedAt: paper.assignedAt,
          reviewStatus: paper.reviewStatus,
          comments: paper.comments,
          reviewedAt: paper.reviewedAt
        }));

        res.json(processedResults);
      });
    };

    // Update paper status by reviewer
    export const updatePaperStatus = (req, res) => {
      if (req.user.role !== 'reviewer') {
        return res.status(403).json({ error: 'Access denied. Reviewer only.' });
      }

      const { paperId, status, comments, q1, q2, q3, q4, q5, q6 } = req.body;
      const reviewerId = req.user.id;

      if (!paperId || !status) {
        return res.status(400).json({ error: 'Paper ID and status are required' });
      }

      if (!['under_review', 'accepted', 'rejected', 'accepted_with_minor_revision', 'accepted_with_major_revision', 'published'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      try {
        // Check if assignment exists
        const checkAssignmentQuery = 'SELECT id FROM paper_assignments WHERE paperId = ? AND (reviewer1 = ? OR reviewer2 = ?)';
        db.query(checkAssignmentQuery, [paperId, reviewerId, reviewerId], (err, results) => {
          if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length === 0) {
            return res.status(403).json({ error: 'Paper not assigned to this reviewer' });
          }

          // Update or insert review
          const upsertQuery = `
            INSERT INTO paper_reviews (paperId, reviewerId, status, comments)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            comments = VALUES(comments),
            reviewedAt = CURRENT_TIMESTAMP
          `;

          db.query(upsertQuery, [paperId, reviewerId, status, comments], (err, result) => {
            if (err) {
              console.error('DB error updating review:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Update or insert review details (q1-q6)
            const upsertDetailsQuery = `
              INSERT INTO paper_review_details (paperId, reviewerId, q1, q2, q3, q4, q5, q6)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              q1 = VALUES(q1),
              q2 = VALUES(q2),
              q3 = VALUES(q3),
              q4 = VALUES(q4),
              q5 = VALUES(q5),
              q6 = VALUES(q6)
            `;

            db.query(upsertDetailsQuery, [paperId, reviewerId, q1, q2, q3, q4, q5, q6], (err, detailsResult) => {
              if (err) {
                console.error('DB error updating review details:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                message: 'Paper status updated successfully',
                paperId,
                status,
                comments,
                q1,
                q2,
                q3,
                q4,
                q5,
                q6
              });
            });
          });
        });
      } catch (error) {
        console.error('Update paper status error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    // Send paper status update email to authors (admin only)
    export const sendPaperStatusEmail = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId } = req.body;

      if (!paperId) {
        return res.status(400).json({ error: 'Paper ID is required' });
      }

      try {
        // Get paper details and admin status
        const paperQuery = `
          SELECT r.paperTitle, r.authors, r.status, r.comments
          FROM registrations r
          WHERE r.id = ?
        `;

        db.query(paperQuery, [paperId], async (err, paperResults) => {
          if (err) {
            console.error('DB error fetching paper details:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (paperResults.length === 0) {
            return res.status(404).json({ error: 'Paper not found' });
          }

          const { paperTitle, authors, status, comments } = paperResults[0];

          if (!status || status === 'submitted' || status === 'under_review') {
            return res.status(400).json({ error: 'No admin decision status found for this paper' });
          }

          let authorsArr;
          try {
            authorsArr = typeof authors === 'string' ? JSON.parse(authors) : authors;
          } catch (parseErr) {
            console.error('Error parsing authors JSON:', parseErr);
            return res.status(500).json({ error: 'Error parsing author data' });
          }

          // Send emails to all authors
          const emailPromises = authorsArr.map(async (author) => {
            if (author.email) {
              try {
                await sendPaperStatusUpdateEmail(
                  author.email,
                  author.name,
                  paperTitle,
                  paperId,
                  status,
                  comments || 'No comments provided',
                  'Admin Decision'
                );
                console.log(`Status update email sent to ${author.email} for paper ${paperId}`);
              } catch (emailErr) {
                console.error(`Failed to send email to ${author.email}: ${emailErr.message}`);
              }
            }
          });

          await Promise.all(emailPromises);

          // Mark notification as sent
          const updateQuery = 'UPDATE registrations SET notificationSent = TRUE WHERE id = ?';
          db.query(updateQuery, [paperId], (err, result) => {
            if (err) {
              console.error('DB error updating notificationSent:', err);
            }
          });

          res.json({
            message: 'Status update emails sent successfully',
            paperId,
            emailsSent: authorsArr.filter(author => author.email).length
          });
        });
      } catch (error) {
        console.error('Send paper status email error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    // Send notification to authors with all reviewer comments (admin only)
    export const sendNotification = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId } = req.body;

      if (!paperId) {
        return res.status(400).json({ error: 'Paper ID is required' });
      }

      try {
        // Get paper details and all reviews
        const paperQuery = `
          SELECT r.paperTitle, r.authors, r.notificationSent
          FROM registrations r
          WHERE r.id = ?
        `;

        db.query(paperQuery, [paperId], async (err, paperResults) => {
          if (err) {
            console.error('DB error fetching paper details:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (paperResults.length === 0) {
            return res.status(404).json({ error: 'Paper not found' });
          }

          const { paperTitle, authors, notificationSent } = paperResults[0];

          if (notificationSent) {
            return res.status(400).json({ error: 'Notification already sent' });
          }

          // Get all reviews
          const reviewsQuery = `
            SELECT pr.comments, u.name as reviewerName
            FROM paper_reviews pr
            JOIN users u ON pr.reviewerId = u.id
            WHERE pr.paperId = ?
            ORDER BY pr.reviewedAt
          `;

          db.query(reviewsQuery, [paperId], async (err, reviewResults) => {
            if (err) {
              console.error('DB error fetching reviews:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            let authorsArr;
            try {
              authorsArr = typeof authors === 'string' ? JSON.parse(authors) : authors;
            } catch (parseErr) {
              console.error('Error parsing authors JSON:', parseErr);
              return res.status(500).json({ error: 'Error parsing author data' });
            }

            // Prepare comments text
            const commentsText = reviewResults
              .map(review => `Reviewer ${review.reviewerName}: ${review.comments || 'No comments'}`)
              .join('\n\n');

            // Send emails to all authors
            const emailPromises = authorsArr.map(async (author) => {
              if (author.email) {
                try {
                  await sendPaperStatusUpdateEmail(
                    author.email,
                    author.name,
                    paperTitle,
                    paperId,
                    'reviewed',
                    commentsText,
                    'Reviewers'
                  );
                  console.log(`Notification email sent to ${author.email} for paper ${paperId}`);
                } catch (emailErr) {
                  console.error(`Failed to send email to ${author.email}: ${emailErr.message}`);
                }
              }
            });

            await Promise.all(emailPromises);

            // Update notificationSent
            const updateQuery = 'UPDATE registrations SET notificationSent = TRUE WHERE id = ?';
            db.query(updateQuery, [paperId], (err, result) => {
              if (err) {
                console.error('DB error updating notificationSent:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                message: 'Notification sent successfully',
                paperId,
                emailsSent: authorsArr.filter(author => author.email).length
              });
            });
          });
        });
      } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    // Get paper status for users
    export const getPaperStatus = (req, res) => {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const query = `
        SELECT
          r.id,
          r.paperTitle,
          r.authors,
          r.tracks,
          r.country,
          r.state,
          r.city,
          r.status,
          r.finalSubmissionStatus,
          r.notificationSent,
          r.createdAt,
          r.updatedAt,
          r.abstractBlob,
          r.finalPaperBlob,
          r.adminComments,
          pr.status as reviewStatus,
          pr.comments,
          pr.reviewedAt,
          u.name as reviewerName
        FROM registrations r
        LEFT JOIN paper_reviews pr ON r.id = pr.paperId
        LEFT JOIN users u ON pr.reviewerId = u.id
        WHERE r.userId = ?
        ORDER BY r.createdAt DESC, pr.reviewedAt ASC
      `;

      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('DB error fetching paper status:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Group results by paper
        const paperMap = {};
        results.forEach(row => {
          if (!paperMap[row.id]) {
            paperMap[row.id] = {
              id: row.id,
              paperTitle: row.paperTitle,
              authors: typeof row.authors === 'string'
                ? JSON.parse(row.authors)
                : row.authors,
              tracks: row.tracks,
              country: row.country,
              state: row.state,
              city: row.city,
              status: row.status,
              finalSubmissionStatus: row.finalSubmissionStatus,
              notificationSent: row.notificationSent,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              abstractBlob: row.abstractBlob ? Buffer.from(row.abstractBlob).toString('base64') : null,
              finalPaperBlob: row.finalPaperBlob ? Buffer.from(row.finalPaperBlob).toString('base64') : null,
              adminComments: row.adminComments,
              reviews: []
            };
          }
          if (row.reviewStatus) {
            paperMap[row.id].reviews.push({
              status: row.reviewStatus,
              comments: row.comments,
              reviewedAt: row.reviewedAt,
              reviewerName: row.reviewerName
            });
          }
        });

        const processedResults = Object.values(paperMap);
        res.json(processedResults);
      });
    };

    // Get papers available for assignment (papers with 0 or 1 reviewer assigned)
    export const getPapersAvailableForAssignment = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { fromDate, toDate, paperTracks, reviewerTracks, paperId } = req.query;
      let query = `
        SELECT
          r.id,
          r.userId,
          r.paperTitle,
          r.authors,
          r.email,
          r.createdAt,
          r.abstractBlob,
          r.tracks as paperTracks,
          CASE WHEN pa.reviewer1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN pa.reviewer2 IS NOT NULL THEN 1 ELSE 0 END as assignedReviewers,
          CONCAT_WS('; ', u1.name, u2.name) as currentReviewers
        FROM registrations r
        LEFT JOIN paper_assignments pa ON r.id = pa.paperId
        LEFT JOIN users u1 ON pa.reviewer1 = u1.id
        LEFT JOIN users u2 ON pa.reviewer2 = u2.id
        WHERE CASE WHEN pa.reviewer1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN pa.reviewer2 IS NOT NULL THEN 1 ELSE 0 END <2
      `;
      const params = [];
      const conditions = [];

      if (fromDate) {
        conditions.push('r.createdAt >= ?');
        params.push(fromDate);
      }
      if (toDate) {
        conditions.push('r.createdAt < DATE_ADD(?, INTERVAL 1 DAY)');
        params.push(toDate);
      }
      if (paperId) {
        conditions.push('r.id LIKE ?');
        params.push(`%${paperId}%`);
      }
      if (paperTracks) {
        const tracks = Array.isArray(paperTracks) ? paperTracks : [paperTracks];
        const placeholders = tracks.map(() => '?').join(',');
        conditions.push(`r.tracks IN (${placeholders})`);
        params.push(...tracks);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY r.createdAt DESC';

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('DB error fetching papers available for assignment:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Convert BLOB data to base64 string for JSON response
        const processedResults = results.map(paper => ({
          id: paper.id,
          userId: paper.userId,
          paperTitle: paper.paperTitle,
          authors: typeof paper.authors === 'string' ? JSON.parse(paper.authors) : paper.authors,
          email: paper.email,
          createdAt: paper.createdAt,
          abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
          track: paper.paperTracks,
          assignedReviewers: paper.assignedReviewers,
          currentReviewers: paper.currentReviewers ? paper.currentReviewers.split('; ').filter(name => name) : []
        }));

        // Prevent caching to avoid ERR_CACHE_WRITE_FAILURE
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(processedResults);
      });
    };

    // Get unassigned papers (papers not in paper_assignments table)
    export const getUnassignedPapers = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { fromDate, toDate, paperTracks } = req.query;
      let query = `
        SELECT
          r.id,
          r.userId,
          r.paperTitle,
          r.authors,
          r.email,
          r.createdAt,
          r.abstractBlob,
          r.tracks as paperTracks
        FROM registrations r
        WHERE r.id NOT IN (
          SELECT DISTINCT paperId
          FROM paper_assignments
        )
      `;
      const params = [];
      const conditions = [];

      if (fromDate) {
        conditions.push('r.createdAt >= ?');
        params.push(fromDate);
      }
      if (toDate) {
        conditions.push('r.createdAt < DATE_ADD(?, INTERVAL 1 DAY)');
        params.push(toDate);
      }
      if (paperTracks) {
        const tracks = Array.isArray(paperTracks) ? paperTracks : [paperTracks];
        const placeholders = tracks.map(() => '?').join(',');
        conditions.push(`r.tracks IN (${placeholders})`);
        params.push(...tracks);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' ORDER BY r.createdAt DESC';

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('DB error fetching unassigned papers:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Convert BLOB data to base64 string for JSON response
        const processedResults = results.map(paper => ({
          id: paper.id,
          userId: paper.userId,
          paperTitle: paper.paperTitle,
          authors: typeof paper.authors === 'string' ? JSON.parse(paper.authors) : paper.authors,
          email: paper.email,
          createdAt: paper.createdAt,
          abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
          track: paper.paperTracks
        }));

        res.json(processedResults);
      });
    };

    // Get all registrations with assigned reviewers
    export const getRegistrationsWithAssignments = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // First get all registrations
      const registrationsQuery = `
        SELECT
          id,
          userId,
          paperTitle,
          authors,
          email,
          country,
          createdAt,
          abstractBlob,
          finalPaperBlob,
          tracks,
          status,
          finalSubmissionStatus,
          notificationSent
        FROM registrations
        ORDER BY createdAt DESC
      `;

      db.query(registrationsQuery, (err, registrationResults) => {
        if (err) {
          console.error('DB error fetching registrations:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (registrationResults.length === 0) {
          return res.json([]);
        }

        // Get assignments and reviews for all registrations in one query
        const registrationIds = registrationResults.map(r => r.id);
        const placeholders = registrationIds.map(() => '?').join(',');

        const assignmentsQuery = `
          SELECT
            pa.paperId,
            u1.id as reviewerId1,
            u1.name as reviewerName1,
            u2.id as reviewerId2,
            u2.name as reviewerName2,
            pa.assignedAt,
            pr1.status as reviewStatus1,
            pr1.comments as comments1,
            pr1.reviewedAt as reviewedAt1,
            pr2.status as reviewStatus2,
            pr2.comments as comments2,
            pr2.reviewedAt as reviewedAt2
          FROM paper_assignments pa
          LEFT JOIN users u1 ON pa.reviewer1 = u1.id
          LEFT JOIN users u2 ON pa.reviewer2 = u2.id
          LEFT JOIN paper_reviews pr1 ON pa.paperId = pr1.paperId AND pa.reviewer1 = pr1.reviewerId
          LEFT JOIN paper_reviews pr2 ON pa.paperId = pr2.paperId AND pa.reviewer2 = pr2.reviewerId
          WHERE pa.paperId IN (${placeholders})
          ORDER BY pa.paperId, pa.assignedAt
        `;

        db.query(assignmentsQuery, registrationIds, (err, assignmentResults) => {
          if (err) {
            console.error('DB error fetching assignments:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Group assignments by paperId
          const assignmentsByPaper = {};
          assignmentResults.forEach(assignment => {
            if (!assignmentsByPaper[assignment.paperId]) {
              assignmentsByPaper[assignment.paperId] = [];
            }
            if (assignment.reviewerId1) {
              assignmentsByPaper[assignment.paperId].push({
                id: assignment.reviewerId1,
                name: assignment.reviewerName1,
                assignedAt: assignment.assignedAt,
                reviewStatus: assignment.reviewStatus1,
                comments: assignment.comments1,
                reviewedAt: assignment.reviewedAt1
              });
            }
            if (assignment.reviewerId2) {
              assignmentsByPaper[assignment.paperId].push({
                id: assignment.reviewerId2,
                name: assignment.reviewerName2,
                assignedAt: assignment.assignedAt,
                reviewStatus: assignment.reviewStatus2,
                comments: assignment.comments2,
                reviewedAt: assignment.reviewedAt2
              });
            }
          });

          // Combine registrations with their assignments
          const processedResults = registrationResults.map(registration => ({
            id: registration.id,
            userId: registration.userId,
            paperTitle: registration.paperTitle,
            authors:
              typeof registration.authors === 'string'
                ? (() => {
                    try {
                      return JSON.parse(registration.authors);
                    } catch {
                      return registration.authors
                        .split(',')
                        .map(name => ({ name: name.trim() }));
                    }
                  })()
                : registration.authors,
            email: registration.email,
            country: registration.country,
            createdAt: registration.createdAt,
            abstractBlob: registration.abstractBlob
              ? Buffer.from(registration.abstractBlob).toString('base64')
              : null,
            tracks: registration.tracks,
            status: registration.status,
            finalSubmissionStatus: registration.finalSubmissionStatus,
            notificationSent: registration.notificationSent,
            reviewers: assignmentsByPaper[registration.id] || []
          }));

          // Prevent caching to avoid ERR_CACHE_WRITE_FAILURE
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');

          res.json(processedResults);
        });
      });
    };

    // Get registration analytics (counts by country and state)
    export const getRegistrationAnalytics = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // Query for country counts
      const countryQuery = `
        SELECT country, COUNT(*) as count
        FROM registrations
        WHERE country IS NOT NULL AND country != ''
        GROUP BY country
        ORDER BY count DESC
      `;

      // Query for state counts
      const stateQuery = `
        SELECT state, COUNT(*) as count
        FROM registrations
        WHERE state IS NOT NULL AND state != ''
        GROUP BY state
        ORDER BY count DESC
      `;

      db.query(countryQuery, (err, countryResults) => {
        if (err) {
          console.error('DB error fetching country analytics:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        db.query(stateQuery, (err, stateResults) => {
          if (err) {
            console.error('DB error fetching state analytics:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Prevent caching to avoid ERR_CACHE_WRITE_FAILURE
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');

          res.json({
            countries: countryResults,
            states: stateResults
          });
        });
      });
    };



    // Delete registration by ID (admin only)
    export const deleteRegistration = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Registration ID is required' });
      }

      try {
        // Delete related assignments first (foreign key constraints)
        const deleteAssignmentsQuery = 'DELETE FROM paper_assignments WHERE paperId = ?';
        db.query(deleteAssignmentsQuery, [id], (err) => {
          if (err) {
            console.error('DB error deleting assignments:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Delete related reviews
          const deleteReviewsQuery = 'DELETE FROM paper_reviews WHERE paperId = ?';
          db.query(deleteReviewsQuery, [id], (err) => {
            if (err) {
              console.error('DB error deleting reviews:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            // Delete the registration
            const deleteRegistrationQuery = 'DELETE FROM registrations WHERE id = ?';
            db.query(deleteRegistrationQuery, [id], (err, result) => {
              if (err) {
                console.error('DB error deleting registration:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Registration not found' });
              }

              res.json({ message: 'Registration deleted successfully', id });
            });
          });
        });
      } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    export const updateRegistrationStatus = (req, res) => {
      console.log(`Request received: ${req.method} ${req.path}`);
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { status, adminComments } = req.body;

      console.log(`Update registration status request: id=${id}, status=${status}, adminComments=${adminComments}`);

      if (!id || !status) {
        console.error('Missing required parameters: id or status');
        return res.status(400).json({ error: 'Registration ID and status are required' });
      }

      if (!['under_review', 'accepted', 'rejected', 'accepted_with_minor_revision', 'accepted_with_major_revision', 'published'].includes(status)) {
        console.error(`Invalid status value: ${status}`);
        return res.status(400).json({ error: 'Invalid status' });
      }

      // First, check if the registration exists
      const checkQuery = 'SELECT id FROM registrations WHERE id = ?';
      db.query(checkQuery, [id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error('DB error checking registration existence:', checkErr);
          return res.status(500).json({ error: 'Database error' });
        }

        if (checkResults.length === 0) {
          console.error(`Registration not found: id=${id}`);
          return res.status(404).json({ error: 'Registration not found' });
        }

      // Now update the status and adminComments if provided
        let updateQuery;
        let params;
        if (adminComments !== undefined && adminComments !== null && adminComments.trim() !== '') {
          updateQuery = 'UPDATE registrations SET status = ?, adminComments = ? WHERE id = ?';
          params = [status, adminComments.trim(), id];
        } else {
          updateQuery = 'UPDATE registrations SET status = ? WHERE id = ?';
          params = [status, id];
        }

        db.query(updateQuery, params, (err, result) => {
          if (err) {
            console.error('DB error updating registration status:', err);
            console.error('Error details:', {
              code: err.code,
              errno: err.errno,
              sqlState: err.sqlState,
              sqlMessage: err.sqlMessage
            });
            return res.status(500).json({ error: 'Database error' });
          }

          if (result.affectedRows === 0) {
            console.error(`No rows affected for update: id=${id}, status=${status}`);
            return res.status(404).json({ error: 'Registration not found' });
          }

          console.log(`Registration status updated successfully: id=${id}, status=${status}, comments=${adminComments || 'none'}`);
          res.json({ message: 'Registration status updated successfully', id, status, comments: adminComments });
        });
      });
    };

    // Get total registrations count
    export const getTotalRegistrations = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = 'SELECT COUNT(*) as total FROM registrations';

      db.query(query, (err, results) => {
        if (err) {
          console.error('DB error fetching total registrations:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ total: results[0].total });
      });
    };

// Get dashboard statistics - paper status counts and payment counts
    export const getDashboardStats = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // Debug: First get all unique status values in the database
      const debugStatusQuery = "SELECT DISTINCT status FROM registrations WHERE status IS NOT NULL";
      
      db.query(debugStatusQuery, (debugErr, debugResults) => {
        if (debugErr) {
          console.error('Debug: Error fetching status values:', debugErr);
        } else {
          console.log('Debug: Available status values in database:', debugResults.map(r => r.status));
        }

        // Query to get all counts in one go
        const statsQuery = `
          SELECT 
            COUNT(*) as totalRegistrations,
            SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as acceptedPapers,
            SUM(CASE WHEN status = 'accepted_with_minor_revision' THEN 1 ELSE 0 END) as acceptedWithMinorRevision,
            SUM(CASE WHEN status = 'accepted_with_major_revision' THEN 1 ELSE 0 END) as acceptedWithMajorRevision,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedPapers,
            SUM(CASE WHEN paymentStatus = 'paid' THEN 1 ELSE 0 END) as papersWithPaymentDone
          FROM registrations
        `;

        // Query to get total payments received (from with captured/paid status) 
        // payments table      
        const paymentQuery = `
          SELECT COALESCE(SUM(amount), 0) as totalPaymentsReceived
          FROM payments
          WHERE status IN ('captured', 'paid')
        `;

        db.query(statsQuery, (err, statsResults) => {
          if (err) {
            console.error('DB error fetching dashboard stats:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          db.query(paymentQuery, (paymentErr, paymentResults) => {
            if (paymentErr) {
              console.error('DB error fetching payment stats:', paymentErr);
              // Continue without payment data rather than failing completely
              const row = statsResults[0];
              return res.json({
                totalRegistrations: row.totalRegistrations || 0,
                acceptedPapers: row.acceptedPapers || 0,
                acceptedWithMinorRevision: row.acceptedWithMinorRevision || 0,
                acceptedWithMajorRevision: row.acceptedWithMajorRevision || 0,
                rejectedPapers: row.rejectedPapers || 0,
                totalAcceptPapers: Number(row.acceptedPapers || 0) + Number(row.acceptedWithMinorRevision || 0) + Number(row.acceptedWithMajorRevision || 0),
                papersWithPaymentDone: row.papersWithPaymentDone || 0,
                totalPaymentsReceived: 0
              });
            }

            const row = statsResults[0];
            const paymentRow = paymentResults[0];
            
            // Calculate total accept papers as sum of all accepted categories
            const totalAcceptPapers = Number(row.acceptedPapers || 0) + Number(row.acceptedWithMinorRevision || 0) + Number(row.acceptedWithMajorRevision || 0);
            
            console.log('Dashboard Stats Debug:', {
              acceptedPapers: row.acceptedPapers,
              acceptedWithMinorRevision: row.acceptedWithMinorRevision,
              acceptedWithMajorRevision: row.acceptedWithMajorRevision,
              totalAcceptPapers: totalAcceptPapers
            });
            
            res.json({
              totalRegistrations: row.totalRegistrations || 0,
              acceptedPapers: row.acceptedPapers || 0,
              acceptedWithMinorRevision: row.acceptedWithMinorRevision || 0,
              acceptedWithMajorRevision: row.acceptedWithMajorRevision || 0,
              rejectedPapers: row.rejectedPapers || 0,
              totalAcceptPapers: totalAcceptPapers,
              papersWithPaymentDone: row.papersWithPaymentDone || 0,
              totalPaymentsReceived: paymentRow.totalPaymentsReceived || 0
            });
          });
        });
      });
    };

    export const seedAdmin = async () => {
      const adminEmail = 'san20jula2007@gmail.com';
      const adminPassword = 'admin123';
      const adminName = 'NEC Admin';

      try {
        // Check if admin already exists
        const checkQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(checkQuery, [adminEmail], async (err, results) => {
          if (err) {
            console.error('DB error checking admin:', err);
            return;
          }

          if (results.length > 0) {
            console.log('Admin user already exists');
            return;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(adminPassword, 10);

          // Insert admin
          const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
          db.query(insertQuery, [adminName, adminEmail, hashedPassword, 'admin'], (err, result) => {
            if (err) {
              console.error('DB insert admin error:', err);
            } else {
              console.log('Default admin user created: san20jula2007@gmail.com / admin123');
            }
          });
        });
      } catch (error) {
        console.error('Seed admin error:', error);
      }
    };

    // Reset final submission (admin only)
    export const resetFinalSubmission = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Registration ID is required' });
      }

      try {
        // First get paper details for email
        const paperQuery = 'SELECT paperTitle, authors FROM registrations WHERE id = ?';
        db.query(paperQuery, [id], async (err, paperResults) => {
          if (err) {
            console.error('DB error fetching paper details:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (paperResults.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
          }

          const { paperTitle, authors } = paperResults[0];

          // Update the registration to reset final submission
          const updateQuery = 'UPDATE registrations SET finalSubmissionStatus = ?, finalPaperBlob = NULL WHERE id = ?';
          db.query(updateQuery, ['not_submitted', id], async (err, result) => {
            if (err) {
              console.error('DB error resetting final submission:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Registration not found' });
            }

            // Send email notifications to authors
            try {
              let authorsArr;
              try {
                authorsArr = typeof authors === 'string' ? JSON.parse(authors) : authors;
              } catch (parseErr) {
                console.error('Error parsing authors JSON:', parseErr);
                // Continue without sending emails if parsing fails
                return res.json({ message: 'Final submission reset successfully', id });
              }

              // Send emails to all authors
              const emailPromises = authorsArr.map(async (author) => {
                if (author.email) {
                  try {
                    await sendFinalSubmissionResetEmail(author.email, author.name, paperTitle, id);
                    console.log(`Final submission reset email sent to ${author.email} for paper ${id}`);
                  } catch (emailErr) {
                    console.error(`Failed to send email to ${author.email}: ${emailErr.message}`);
                  }
                }
              });

              await Promise.all(emailPromises);
            } catch (emailError) {
              console.error('Error sending final submission reset emails:', emailError.message);
              // Don't fail the reset if email sending fails
            }

            res.json({ message: 'Final submission reset successfully', id });
          });
        });
      } catch (error) {
        console.error('Reset final submission error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };

    // Get single paper with reviewer comments and details (admin only) - OPTIMIZED VERSION
    export const getPaperWithReviewerComments = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId } = req.params;

      if (!paperId) {
        return res.status(400).json({ error: 'Paper ID is required' });
      }

      // Single optimized query combining paper details and reviewer information
      const combinedQuery = `
        SELECT
          r.id,
          r.userId,
          r.paperTitle,
          r.authors,
          r.email,
          r.createdAt,
          r.abstractBlob,
          r.finalPaperBlob,
          r.tracks,
          r.status,
          r.finalSubmissionStatus,
          r.notificationSent,
          pa.reviewer1,
          pa.reviewer2,
          u1.name as reviewer1Name,
          u2.name as reviewer2Name,
          pr1.status as reviewStatus1,
          pr1.comments as comments1,
          pr1.reviewedAt as reviewedAt1,
          prd1.q1 as q1_1,
          prd1.q2 as q2_1,
          prd1.q3 as q3_1,
          prd1.q4 as q4_1,
          prd1.q5 as q5_1,
          prd1.q6 as q6_1,
          pr2.status as reviewStatus2,
          pr2.comments as comments2,
          pr2.reviewedAt as reviewedAt2,
          prd2.q1 as q1_2,
          prd2.q2 as q2_2,
          prd2.q3 as q3_2,
          prd2.q4 as q4_2,
          prd2.q5 as q5_2,
          prd2.q6 as q6_2
        FROM registrations r
        LEFT JOIN paper_assignments pa ON r.id = pa.paperId
        LEFT JOIN users u1 ON pa.reviewer1 = u1.id
        LEFT JOIN users u2 ON pa.reviewer2 = u2.id
        LEFT JOIN paper_reviews pr1 ON r.id = pr1.paperId AND pa.reviewer1 = pr1.reviewerId
        LEFT JOIN paper_reviews pr2 ON r.id = pr2.paperId AND pa.reviewer2 = pr2.reviewerId
        LEFT JOIN paper_review_details prd1 ON r.id = prd1.paperId AND pa.reviewer1 = prd1.reviewerId
        LEFT JOIN paper_review_details prd2 ON r.id = prd2.paperId AND pa.reviewer2 = prd2.reviewerId
        WHERE r.id = ?
      `;

      db.query(combinedQuery, [paperId], (err, results) => {
        if (err) {
          console.error('DB error fetching paper with reviews:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Paper not found' });
        }

        const row = results[0];

        // Process reviewers
        const reviewers = [];
        if (row.reviewer1) {
          reviewers.push({
            id: row.reviewer1,
            name: row.reviewer1Name,
            reviewStatus: row.reviewStatus1,
            comments: row.comments1,
            reviewedAt: row.reviewedAt1,
            questions: {
              q1: row.q1_1,
              q2: row.q2_1,
              q3: row.q3_1,
              q4: row.q4_1,
              q5: row.q5_1,
              q6: row.q6_1
            }
          });
        }

        if (row.reviewer2) {
          reviewers.push({
            id: row.reviewer2,
            name: row.reviewer2Name,
            reviewStatus: row.reviewStatus2,
            comments: row.comments2,
            reviewedAt: row.reviewedAt2,
            questions: {
              q1: row.q1_2,
              q2: row.q2_2,
              q3: row.q3_2,
              q4: row.q4_2,
              q5: row.q5_2,
              q6: row.q6_2
            }
          });
        }

        // Process paper data
        const processedPaper = {
          id: row.id,
          userId: row.userId,
          paperTitle: row.paperTitle,
          authors: typeof row.authors === 'string'
            ? JSON.parse(row.authors)
            : row.authors,
          email: row.email,
          createdAt: row.createdAt,
          abstractBlob: row.abstractBlob ? Buffer.from(row.abstractBlob).toString('base64') : null,
          finalPaperBlob: row.finalPaperBlob ? Buffer.from(row.finalPaperBlob).toString('base64') : null,
          tracks: row.tracks,
          status: row.status,
          finalSubmissionStatus: row.finalSubmissionStatus,
          notificationSent: row.notificationSent,
          reviewers: reviewers
        };

        res.json(processedPaper);
      });
    };

    // Download final paper (admin or owner)
export const downloadFinalPaper = (req, res) => {
      const paperId = req.params.paperId;
      if (!paperId) {
        return res.status(400).json({ error: 'Paper ID is required' });
      }

      // Only allow admin or the paper owner to download
      const requester = req.user;
      if (!requester) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = 'SELECT userId, paperTitle, finalPaperBlob FROM registrations WHERE id = ?';
      db.query(query, [paperId], (err, results) => {
        if (err) {
          console.error('DB error fetching final paper:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Paper not found' });
        }

        const row = results[0];

        // Authorization: admin can download any; owner (userId) can download their own final paper
        if (requester.role !== 'admin' && String(requester.id) !== String(row.userId)) {
          return res.status(403).json({ error: 'Access denied' });
        }

        const blob = row.finalPaperBlob;
        if (!blob) {
          return res.status(404).json({ error: 'Final paper not available' });
        }

        // Determine MIME type and extension from file signature (basic heuristics)
        let mimeType = 'application/octet-stream';
        let extension = 'bin';
        const buffer = Buffer.isBuffer(blob) ? blob : Buffer.from(blob);

        if (buffer.length >= 4) {
          if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
            mimeType = 'application/pdf';
            extension = 'pdf';
          } else if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
            mimeType = 'application/msword';
            extension = 'doc';
          } else if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            extension = 'docx';
          }
        }

        const safeTitle = (row.paperTitle || 'paper')
          .replace(/[^\w\-. ]/g, '')
          .replace(/\s+/g, '');
        const filename = `${safeTitle}_final.${extension}`;

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
      });
    };

    export const createChairperson = async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        name,
        email,
        designation,
        department,
        institution,
        mobileNumber,
        track,
        tracks
      } = req.body;
      const chairTrack = track || tracks;

      if (!name || !email || !designation || !department || !institution || !mobileNumber || !chairTrack) {
        return res.status(400).json({
          error: 'Name, email, designation, department, institution, mobile number, and track are required'
        });
      }

      try {
        const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], async (err, results) => {
          if (err) {
            console.error('DB error while checking chairperson:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
          }

          const defaultPassword = 'ICODSES@2026';
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);
          const insertQuery = `
            INSERT INTO users
            (name, email, password, role, designation, department, institution, mobileNumber, track, isFirstLogin)
            VALUES (?, ?, ?, 'chairperson', ?, ?, ?, ?, ?, 0)
          `;

          db.query(
            insertQuery,
            [name, email, hashedPassword, designation, department, institution, mobileNumber, chairTrack],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error('DB error creating chairperson:', insertErr);
                return res.status(500).json({ error: 'Database error' });
              }

              return res.status(201).json({
                message: 'Chairperson credentials created successfully',
                user: {
                  id: insertResult.insertId,
                  name,
                  email,
                  role: 'chairperson',
                  designation,
                  department,
                  institution,
                  mobileNumber,
                  track: chairTrack
                },
                defaultPassword
              });
            }
          );
        });
      } catch (error) {
        console.error('Create chairperson error:', error);
        return res.status(500).json({ error: 'Server error' });
      }
    };

    export const getChairpersons = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.designation,
          u.department,
          u.institution,
          u.mobileNumber,
          u.track,
          COUNT(cpa.paperId) as assignedPapers
        FROM users u
        LEFT JOIN chair_paper_assignments cpa ON cpa.chairpersonId = u.id
        WHERE u.role = 'chairperson'
        GROUP BY u.id, u.name, u.email, u.designation, u.department, u.institution, u.mobileNumber, u.track
        ORDER BY u.name ASC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('DB error fetching chairpersons:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        return res.json(results);
      });
    };

    export const assignChairpersonToPaper = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId, chairpersonId } = req.body;
      if (!paperId || !chairpersonId) {
        return res.status(400).json({ error: 'paperId and chairpersonId are required' });
      }

      const verifyChairpersonQuery = "SELECT id FROM users WHERE id = ? AND role = 'chairperson'";
      db.query(verifyChairpersonQuery, [chairpersonId], (chairErr, chairResults) => {
        if (chairErr) {
          console.error('DB error checking chairperson:', chairErr);
          return res.status(500).json({ error: 'Database error' });
        }

        if (chairResults.length === 0) {
          return res.status(404).json({ error: 'Chairperson not found' });
        }

        const verifyPaperQuery = 'SELECT id FROM registrations WHERE id = ?';
        db.query(verifyPaperQuery, [paperId], (paperErr, paperResults) => {
          if (paperErr) {
            console.error('DB error checking paper:', paperErr);
            return res.status(500).json({ error: 'Database error' });
          }

          if (paperResults.length === 0) {
            return res.status(404).json({ error: 'Paper not found' });
          }

          const insertQuery = `
            INSERT INTO chair_paper_assignments (paperId, chairpersonId)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE assignedAt = assignedAt
          `;
          db.query(insertQuery, [paperId, chairpersonId], (insertErr) => {
            if (insertErr) {
              console.error('DB error assigning chairperson:', insertErr);
              return res.status(500).json({ error: 'Database error' });
            }

            return res.status(201).json({
              message: 'Paper assigned to chairperson successfully',
              paperId,
              chairpersonId
            });
          });
        });
      });
    };

    export const removeChairpersonAssignment = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { paperId, chairpersonId } = req.params;
      if (!paperId || !chairpersonId) {
        return res.status(400).json({ error: 'paperId and chairpersonId are required' });
      }

      const deleteQuery = `
        DELETE FROM chair_paper_assignments
        WHERE paperId = ? AND chairpersonId = ?
      `;
      db.query(deleteQuery, [paperId, chairpersonId], (err, result) => {
        if (err) {
          console.error('DB error removing chair assignment:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Assignment not found' });
        }

        return res.json({ message: 'Chairperson assignment removed' });
      });
    };

    export const getChairAssignments = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = `
        SELECT
          r.id as paperId,
          r.paperTitle,
          r.authors,
          r.tracks,
          COUNT(cpa.chairpersonId) as assignedChairpersons,
          GROUP_CONCAT(u.name ORDER BY u.name SEPARATOR '; ') as chairpersonNames
        FROM registrations r
        LEFT JOIN chair_paper_assignments cpa ON cpa.paperId = r.id
        LEFT JOIN users u ON u.id = cpa.chairpersonId
        GROUP BY r.id, r.paperTitle, r.authors, r.tracks
        ORDER BY r.createdAt DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('DB error fetching chair assignments:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const processedResults = results.map((row) => ({
          paperId: row.paperId,
          paperTitle: row.paperTitle,
          authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors,
          tracks: row.tracks,
          assignedChairpersons: Number(row.assignedChairpersons || 0),
          chairpersonNames: row.chairpersonNames ? row.chairpersonNames.split('; ') : []
        }));

        return res.json(processedResults);
      });
    };

    export const getChairpersonAssignedPapers = (req, res) => {
      if (req.user.role !== 'chairperson') {
        return res.status(403).json({ error: 'Access denied. Chairperson only.' });
      }

      const query = `
        SELECT
          r.id,
          r.paperTitle,
          r.authors,
          r.tracks,
          cpa.assignedAt,
          cr.technicalDepthScore,
          cr.practicalImpactScore,
          cr.researchQualityScore,
          cr.presentationSkillsScore,
          cr.queryResponseScore,
          cr.totalScore,
          cr.recommendation,
          cr.reviewedAt
        FROM chair_paper_assignments cpa
        JOIN registrations r ON r.id = cpa.paperId
        LEFT JOIN chair_reviews cr ON cr.paperId = cpa.paperId AND cr.chairpersonId = cpa.chairpersonId
        WHERE cpa.chairpersonId = ?
        ORDER BY cpa.assignedAt DESC
      `;

      db.query(query, [req.user.id], (err, results) => {
        if (err) {
          console.error('DB error fetching chairperson assigned papers:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const processedResults = results.map((row) => ({
          id: row.id,
          paperTitle: row.paperTitle,
          authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors,
          tracks: row.tracks,
          assignedAt: row.assignedAt,
          review: row.totalScore === null ? null : {
            technicalDepthScore: row.technicalDepthScore,
            practicalImpactScore: row.practicalImpactScore,
            researchQualityScore: row.researchQualityScore,
            presentationSkillsScore: row.presentationSkillsScore,
            queryResponseScore: row.queryResponseScore,
            totalScore: row.totalScore,
            recommendation: row.recommendation,
            reviewedAt: row.reviewedAt
          }
        }));

        return res.json(processedResults);
      });
    };

    export const submitChairpersonReview = (req, res) => {
      if (req.user.role !== 'chairperson') {
        return res.status(403).json({ error: 'Access denied. Chairperson only.' });
      }

      const { paperId, technicalDepthScore, practicalImpactScore, researchQualityScore, presentationSkillsScore, queryResponseScore, recommendation } = req.body;

      if (!paperId || recommendation === undefined) {
        return res.status(400).json({ error: 'paperId, all scores, and recommendation are required' });
      }

      const scores = {
        technicalDepthScore: Number(technicalDepthScore),
        practicalImpactScore: Number(practicalImpactScore),
        researchQualityScore: Number(researchQualityScore),
        presentationSkillsScore: Number(presentationSkillsScore),
        queryResponseScore: Number(queryResponseScore)
      };

      const invalidScore = Object.values(scores).some((score) => Number.isNaN(score) || score < 0 || score > 10);
      if (invalidScore) {
        return res.status(400).json({ error: 'Each score must be a number between 0 and 10' });
      }

      if (!['strongly_recommended', 'recommended', 'not_recommended'].includes(recommendation)) {
        return res.status(400).json({ error: 'Invalid recommendation value' });
      }

      const totalScore = scores.technicalDepthScore +
        scores.practicalImpactScore +
        scores.researchQualityScore +
        scores.presentationSkillsScore +
        scores.queryResponseScore;

      const checkAssignmentQuery = `
        SELECT id FROM chair_paper_assignments
        WHERE paperId = ? AND chairpersonId = ?
      `;
      db.query(checkAssignmentQuery, [paperId, req.user.id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error('DB error checking chair assignment:', checkErr);
          return res.status(500).json({ error: 'Database error' });
        }
        if (checkResults.length === 0) {
          return res.status(403).json({ error: 'Paper is not assigned to this chairperson' });
        }

        const upsertQuery = `
          INSERT INTO chair_reviews
          (
            paperId,
            chairpersonId,
            technicalDepthScore,
            practicalImpactScore,
            researchQualityScore,
            presentationSkillsScore,
            queryResponseScore,
            totalScore,
            recommendation
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            technicalDepthScore = ?,
            practicalImpactScore = ?,
            researchQualityScore = ?,
            presentationSkillsScore = ?,
            queryResponseScore = ?,
            totalScore = ?,
            recommendation = ?,
            reviewedAt = CURRENT_TIMESTAMP
        `;

        const upsertParams = [
          paperId,
          req.user.id,
          scores.technicalDepthScore,
          scores.practicalImpactScore,
          scores.researchQualityScore,
          scores.presentationSkillsScore,
          scores.queryResponseScore,
          totalScore,
          recommendation,
          scores.technicalDepthScore,
          scores.practicalImpactScore,
          scores.researchQualityScore,
          scores.presentationSkillsScore,
          scores.queryResponseScore,
          totalScore,
          recommendation
        ];

        const maxRetryCount = 3;
        const executeUpsert = (attempt = 0) => {
          db.query(upsertQuery, upsertParams, (upsertErr) => {
            if (upsertErr) {
              const isRetriableLockError =
                upsertErr.code === 'ER_LOCK_WAIT_TIMEOUT' || upsertErr.code === 'ER_LOCK_DEADLOCK';

              if (isRetriableLockError && attempt < maxRetryCount) {
                const delayMs = 200 * (attempt + 1);
                console.warn(
                  `Retrying chair review upsert due to lock error (attempt ${attempt + 1}/${maxRetryCount})`,
                  { paperId, chairpersonId: req.user.id, code: upsertErr.code }
                );
                return setTimeout(() => executeUpsert(attempt + 1), delayMs);
              }

              console.error('DB error saving chair review:', upsertErr);
              if (isRetriableLockError) {
                return res.status(503).json({ error: 'Database is busy. Please retry submitting the review.' });
              }
              return res.status(500).json({ error: 'Database error' });
            }

            return res.json({
              message: 'Review submitted successfully',
              totalScore
            });
          });
        };

        executeUpsert();
      });
    };

    export const getChairReviewResults = (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const query = `
        SELECT
          r.id as paperId,
          r.paperTitle,
          r.authors,
          r.tracks,
          COUNT(cr.id) as totalReviews,
          ROUND(AVG(cr.technicalDepthScore), 2) as avgTechnicalDepthScore,
          ROUND(AVG(cr.practicalImpactScore), 2) as avgPracticalImpactScore,
          ROUND(AVG(cr.researchQualityScore), 2) as avgResearchQualityScore,
          ROUND(AVG(cr.presentationSkillsScore), 2) as avgPresentationSkillsScore,
          ROUND(AVG(cr.queryResponseScore), 2) as avgQueryResponseScore,
          ROUND(AVG(cr.totalScore), 2) as avgTotalScore,
          SUM(CASE WHEN cr.recommendation = 'strongly_recommended' THEN 1 ELSE 0 END) as stronglyRecommendedCount,
          SUM(CASE WHEN cr.recommendation = 'recommended' THEN 1 ELSE 0 END) as recommendedCount,
          SUM(CASE WHEN cr.recommendation = 'not_recommended' THEN 1 ELSE 0 END) as notRecommendedCount
        FROM registrations r
        LEFT JOIN chair_reviews cr ON cr.paperId = r.id
        GROUP BY r.id, r.paperTitle, r.authors, r.tracks
        ORDER BY avgTotalScore DESC, totalReviews DESC, r.id ASC
      `;

      db.query(query, (err, summaryResults) => {
        if (err) {
          console.error('DB error fetching chair review results:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const detailedQuery = `
          SELECT
            cr.paperId,
            u.id as chairpersonId,
            u.name as chairpersonName,
            u.email as chairpersonEmail,
            cr.technicalDepthScore,
            cr.practicalImpactScore,
            cr.researchQualityScore,
            cr.presentationSkillsScore,
            cr.queryResponseScore,
            cr.totalScore,
            cr.recommendation,
            cr.reviewedAt
          FROM chair_reviews cr
          JOIN users u ON u.id = cr.chairpersonId
          ORDER BY cr.paperId ASC, cr.reviewedAt DESC
        `;

        db.query(detailedQuery, (detailErr, detailResults) => {
          if (detailErr) {
            console.error('DB error fetching detailed chair review results:', detailErr);
            return res.status(500).json({ error: 'Database error' });
          }

          const detailByPaper = detailResults.reduce((acc, row) => {
            if (!acc[row.paperId]) {
              acc[row.paperId] = [];
            }
            acc[row.paperId].push({
              chairpersonId: row.chairpersonId,
              chairpersonName: row.chairpersonName,
              chairpersonEmail: row.chairpersonEmail,
              technicalDepthScore: row.technicalDepthScore,
              practicalImpactScore: row.practicalImpactScore,
              researchQualityScore: row.researchQualityScore,
              presentationSkillsScore: row.presentationSkillsScore,
              queryResponseScore: row.queryResponseScore,
              totalScore: row.totalScore,
              recommendation: row.recommendation,
              reviewedAt: row.reviewedAt
            });
            return acc;
          }, {});

          const response = summaryResults.map((row) => ({
            paperId: row.paperId,
            paperTitle: row.paperTitle,
            authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors,
            tracks: row.tracks,
            totalReviews: Number(row.totalReviews || 0),
            avgTechnicalDepthScore: row.avgTechnicalDepthScore === null ? null : Number(row.avgTechnicalDepthScore),
            avgPracticalImpactScore: row.avgPracticalImpactScore === null ? null : Number(row.avgPracticalImpactScore),
            avgResearchQualityScore: row.avgResearchQualityScore === null ? null : Number(row.avgResearchQualityScore),
            avgPresentationSkillsScore: row.avgPresentationSkillsScore === null ? null : Number(row.avgPresentationSkillsScore),
            avgQueryResponseScore: row.avgQueryResponseScore === null ? null : Number(row.avgQueryResponseScore),
            avgTotalScore: row.avgTotalScore === null ? null : Number(row.avgTotalScore),
            recommendations: {
              stronglyRecommended: Number(row.stronglyRecommendedCount || 0),
              recommended: Number(row.recommendedCount || 0),
              notRecommended: Number(row.notRecommendedCount || 0)
            },
            reviews: detailByPaper[row.paperId] || []
          }));

          return res.json(response);
        });
      });
    };

// ============================================================
// Admin: Reset a user's password (admin-triggered)
// Generates a secure reset token and emails the reset link to
// the user, reusing the same self-service reset-password flow.
// ============================================================
export const adminResetUserPassword = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const userQuery = 'SELECT id, name, email FROM users WHERE id = ?';
    db.query(userQuery, [userId], async (err, results) => {
      if (err) {
        console.error('DB error fetching user for reset:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetUser = results[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const updateQuery = 'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?';
      db.query(updateQuery, [resetToken, resetTokenExpiry, targetUser.id], async (updateErr) => {
        if (updateErr) {
          console.error('DB error saving reset token:', updateErr);
          return res.status(500).json({ error: 'Database error' });
        }

        try {
          await sendPasswordResetEmail(targetUser.email, targetUser.name, resetToken);
          return res.json({ message: `Password reset link sent to ${targetUser.email}` });
        } catch (emailError) {
          console.error('Failed to send admin-triggered reset email:', emailError.message);
          return res.status(500).json({ error: 'Failed to send reset email' });
        }
      });
    });
  } catch (error) {
    console.error('Admin reset user password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================================
// Submission lock/unlock (global and per-user)
// ============================================================
export const getSubmissionLockStatus = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  settingsModel.get(db, 'submissionLocked', (err, value) => {
    if (err) {
      console.error('DB error fetching submission lock status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ locked: value === 'true' });
  });
};

export const setGlobalSubmissionLock = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { locked } = req.body;
  if (typeof locked !== 'boolean') {
    return res.status(400).json({ error: 'locked (boolean) is required' });
  }

  settingsModel.set(db, 'submissionLocked', locked ? 'true' : 'false', (err) => {
    if (err) {
      console.error('DB error setting submission lock:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: `Submissions ${locked ? 'locked' : 'unlocked'} for all users`, locked });
  });
};

export const getLockedUsers = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const query = "SELECT id, name, email, submissionLocked FROM users WHERE role = 'user' ORDER BY name";
  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching users for lock list:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results.map(u => ({ ...u, submissionLocked: Boolean(u.submissionLocked) })));
  });
};

export const setUserSubmissionLock = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  const { locked } = req.body;
  if (typeof locked !== 'boolean') {
    return res.status(400).json({ error: 'locked (boolean) is required' });
  }

  const query = 'UPDATE users SET submissionLocked = ? WHERE id = ?';
  db.query(query, [locked ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error('DB error setting user submission lock:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: `Submission ${locked ? 'locked' : 'unlocked'} for user`, id, locked });
  });
};

// ============================================================
// Conference participants - Excel (.xlsx) export
// ============================================================
export const exportConferenceParticipantsExcel = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const includeUnpaid = String(req.query.includeUnpaid || '').toLowerCase() === 'true';
  const whereClause = includeUnpaid ? '' : "WHERE r.paymentStatus = 'paid'";

  const dataQuery = `
    SELECT
      upc.id,
      upc.paperId,
      upc.userId,
      upc.presentationMode,
      upc.stayRequired,
      upc.baseCategory,
      upc.baseAmount,
      upc.additionalParticipants,
      upc.additionalAmount,
      upc.totalAmount,
      upc.currency,
      upc.participantIndexes,
      upc.createdAt,
      r.paperTitle,
      r.authors,
      r.paymentStatus,
      r.paymentId,
      r.paymentDate
    FROM user_payment_configs upc
    LEFT JOIN registrations r ON upc.paperId = r.id
    ${whereClause}
    ORDER BY upc.createdAt DESC
  `;

  db.query(dataQuery, (err, rows) => {
    if (err) {
      console.error('DB error exporting conference participants:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const formatCurrency = (amount) => Number(((amount || 0) / 100).toFixed(2));

    const sheetRows = (rows || []).map((row) => {
      let authors = [];
      try {
        authors = typeof row.authors === 'string' ? JSON.parse(row.authors) : (row.authors || []);
      } catch {
        authors = [];
      }
      let participants = [];
      try {
        const idxList = typeof row.participantIndexes === 'string' ? JSON.parse(row.participantIndexes) : row.participantIndexes;
        participants = Array.isArray(idxList) ? idxList.map(i => authors[i]?.name || `Author ${i + 1}`) : [];
      } catch {
        participants = [];
      }

      return {
        'ID': row.id,
        'Paper ID': row.paperId,
        'Paper Title': row.paperTitle || '',
        'User ID': row.userId,
        'Presentation Mode': row.presentationMode || '',
        'Stay Required': row.stayRequired ? 'Yes' : 'No',
        'Base Category': row.baseCategory || '',
        'Base Amount (INR)': formatCurrency(row.baseAmount),
        'Additional Participants': row.additionalParticipants || 0,
        'Additional Amount (INR)': formatCurrency(row.additionalAmount),
        'Total Amount (INR)': formatCurrency(row.totalAmount),
        'Currency': row.currency || 'INR',
        'Payment Status': row.paymentStatus || '',
        'Payment ID': row.paymentId || '',
        'Authors': authors.length ? authors.map(a => `${a.name || 'Author'} (${a.email || 'N/A'})`).join(', ') : 'N/A',
        'Participants': participants.length ? participants.join(', ') : 'N/A',
        'Created At': row.createdAt ? new Date(row.createdAt).toLocaleString('en-IN') : ''
      };
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(sheetRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="conference_participants.xlsx"');
      res.send(buffer);
    } catch (xlsxErr) {
      console.error('Error building Excel export:', xlsxErr);
      res.status(500).json({ error: 'Failed to build Excel export' });
    }
  });
};

// ============================================================
// Pending review status (assigned but not yet reviewed) + reminders
// ============================================================
export const getPendingReviewStatus = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const deadlineMinutes = getReviewDeadlineMinutes();
  const query = `
    SELECT
      pa.paperId,
      r.paperTitle,
      pa.assignedAt,
      pa.dueAt,
      pa.lastReminderSentAt,
      pa.reviewerId,
      u.name as reviewerName,
      u.email as reviewerEmail,
      u.reviewerType
    FROM (
      SELECT paperId, reviewer1 as reviewerId, assignedAt,
        COALESCE(reviewer1DueAt, DATE_ADD(assignedAt, INTERVAL ${deadlineMinutes} MINUTE)) AS dueAt,
        lastReminderSentAt FROM paper_assignments WHERE reviewer1 IS NOT NULL
      UNION ALL
      SELECT paperId, reviewer2 as reviewerId, assignedAt,
        COALESCE(reviewer2DueAt, DATE_ADD(assignedAt, INTERVAL ${deadlineMinutes} MINUTE)) AS dueAt,
        lastReminderSentAt FROM paper_assignments WHERE reviewer2 IS NOT NULL
    ) pa
    JOIN registrations r ON pa.paperId = r.id
    JOIN users u ON pa.reviewerId = u.id
    LEFT JOIN paper_reviews pr ON pr.paperId = pa.paperId AND pr.reviewerId = pa.reviewerId
    WHERE pr.id IS NULL
    ORDER BY pa.assignedAt ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching pending review status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

export const sendReviewReminders = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { paperId, reviewerId, sendAll } = req.body || {};

  const getPending = (whereClause, params) => new Promise((resolve, reject) => {
    const query = `
      SELECT
        pa.paperId,
        r.paperTitle,
        pa.reviewerId,
        u.name as reviewerName,
        u.email as reviewerEmail
      FROM (
        SELECT paperId, reviewer1 as reviewerId FROM paper_assignments WHERE reviewer1 IS NOT NULL
        UNION ALL
        SELECT paperId, reviewer2 as reviewerId FROM paper_assignments WHERE reviewer2 IS NOT NULL
      ) pa
      JOIN registrations r ON pa.paperId = r.id
      JOIN users u ON pa.reviewerId = u.id
      LEFT JOIN paper_reviews pr ON pr.paperId = pa.paperId AND pr.reviewerId = pa.reviewerId
      WHERE pr.id IS NULL ${whereClause}
    `;
    db.query(query, params, (err, results) => (err ? reject(err) : resolve(results)));
  });

  try {
    let pending;
    if (sendAll) {
      pending = await getPending('', []);
    } else if (paperId && reviewerId) {
      pending = await getPending('AND pa.paperId = ? AND pa.reviewerId = ?', [paperId, reviewerId]);
    } else {
      return res.status(400).json({ error: 'Provide paperId & reviewerId, or sendAll: true' });
    }

    if (!pending || pending.length === 0) {
      return res.json({ message: 'No pending reviews to remind', sent: 0 });
    }

    // Group by reviewer so each reviewer gets one email listing all their pending papers
    const byReviewer = {};
    pending.forEach((row) => {
      if (!byReviewer[row.reviewerId]) {
        byReviewer[row.reviewerId] = { name: row.reviewerName, email: row.reviewerEmail, papers: [] };
      }
      byReviewer[row.reviewerId].papers.push({ paperId: row.paperId, paperTitle: row.paperTitle });
    });

    let sentCount = 0;
    const errors = [];
    for (const revId of Object.keys(byReviewer)) {
      const { name, email, papers } = byReviewer[revId];
      try {
        await sendReviewReminderEmail(email, name, papers);
        sentCount += 1;
        // Update lastReminderSentAt for the relevant assignment rows
        const paperIds = papers.map(p => p.paperId);
        if (paperIds.length > 0) {
          const placeholders = paperIds.map(() => '?').join(',');
          db.query(
            `UPDATE paper_assignments SET lastReminderSentAt = NOW() WHERE paperId IN (${placeholders}) AND (reviewer1 = ? OR reviewer2 = ?)`,
            [...paperIds, revId, revId]
          );
        }
      } catch (emailErr) {
        console.error(`Failed to send reminder to reviewer ${revId}:`, emailErr.message);
        errors.push({ reviewerId: revId, error: emailErr.message });
      }
    }

    res.json({ message: `Reminder emails sent to ${sentCount} reviewer(s)`, sent: sentCount, errors });
  } catch (error) {
    console.error('Send review reminders error:', error);
    res.status(500).json({ error: 'Unable to retrieve pending reviews for reminders.' });
  }
};

// ============================================================
// Reviewer-wise status report: for each reviewer, list of
// assigned papers and their individual review status.
// ============================================================
export const getReviewerStatusReport = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const query = `
    SELECT
      u.id as reviewerId,
      u.name as reviewerName,
      u.email as reviewerEmail,
      u.track,
      u.reviewerType,
      pa.paperId,
      r.paperTitle,
      pa.assignedAt,
      pr.status as reviewStatus,
      pr.reviewedAt
    FROM users u
    JOIN (
      SELECT paperId, reviewer1 as reviewerId, assignedAt FROM paper_assignments WHERE reviewer1 IS NOT NULL
      UNION ALL
      SELECT paperId, reviewer2 as reviewerId, assignedAt FROM paper_assignments WHERE reviewer2 IS NOT NULL
    ) pa ON pa.reviewerId = u.id
    JOIN registrations r ON pa.paperId = r.id
    LEFT JOIN paper_reviews pr ON pr.paperId = pa.paperId AND pr.reviewerId = pa.reviewerId
    WHERE u.role = 'reviewer'
    ORDER BY u.name, pa.assignedAt DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching reviewer status report:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const byReviewer = {};
    results.forEach((row) => {
      if (!byReviewer[row.reviewerId]) {
        byReviewer[row.reviewerId] = {
          reviewerId: row.reviewerId,
          reviewerName: row.reviewerName,
          reviewerEmail: row.reviewerEmail,
          track: row.track,
          reviewerType: row.reviewerType || 'internal',
          papers: []
        };
      }
      byReviewer[row.reviewerId].papers.push({
        paperId: row.paperId,
        paperTitle: row.paperTitle,
        assignedAt: row.assignedAt,
        status: row.reviewStatus || 'pending',
        reviewedAt: row.reviewedAt
      });
    });

    res.json(Object.values(byReviewer));
  });
};
