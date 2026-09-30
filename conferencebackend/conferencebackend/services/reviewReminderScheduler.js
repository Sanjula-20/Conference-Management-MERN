import { db } from "../config/db.js";
import { sendReviewReminderEmail } from "./emailServices.js";
import {
  getReviewDeadlineMinutes,
  getReviewReminderCheckIntervalMs,
  getReviewReminderLeadMinutes
} from "../config/reviewSchedule.js";

const runQuery = (query, params = []) => new Promise((resolve, reject) => {
  db.query(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

export const checkPendingReviewsAndRemind = async () => {
  const deadlineMinutes = getReviewDeadlineMinutes();
  const reminderLeadMinutes = getReviewReminderLeadMinutes();
  console.log("Running review-deadline reminder check...");

  const query = `
    SELECT
      pa.paperId, r.paperTitle, pa.reviewerId, pa.dueAt,
      u.name AS reviewerName, u.email AS reviewerEmail,
      CASE
        WHEN pa.dueAt > NOW() THEN 'upcoming'
        ELSE 'overdue'
      END AS reminderType
    FROM (
      SELECT paperId, reviewer1 AS reviewerId,
        COALESCE(reviewer1DueAt, DATE_ADD(assignedAt, INTERVAL ${deadlineMinutes} MINUTE)) AS dueAt
      FROM paper_assignments WHERE reviewer1 IS NOT NULL
      UNION ALL
      SELECT paperId, reviewer2 AS reviewerId,
        COALESCE(reviewer2DueAt, DATE_ADD(assignedAt, INTERVAL ${deadlineMinutes} MINUTE)) AS dueAt
      FROM paper_assignments WHERE reviewer2 IS NOT NULL
    ) pa
    JOIN registrations r ON r.id = pa.paperId
    JOIN users u ON u.id = pa.reviewerId
    LEFT JOIN paper_reviews pr ON pr.paperId = pa.paperId AND pr.reviewerId = pa.reviewerId
    LEFT JOIN paper_review_reminders rr ON rr.paperId = pa.paperId
      AND rr.reviewerId = pa.reviewerId
      AND rr.reminderType = CASE
        WHEN pa.dueAt > NOW() THEN 'upcoming'
        ELSE 'overdue'
      END
      AND rr.reminderDate = CURDATE()
    WHERE pr.id IS NULL
      AND (pa.dueAt BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ${reminderLeadMinutes} MINUTE) OR pa.dueAt <= NOW())
      AND rr.id IS NULL
  `;

  try {
    const results = await runQuery(query);
    if (!results.length) {
      console.log("No review reminders are due today.");
      return;
    }

    const groups = new Map();
    for (const row of results) {
      const key = `${row.reviewerId}:${row.reminderType}`;
      if (!groups.has(key)) groups.set(key, { ...row, papers: [] });
      groups.get(key).papers.push({ paperId: row.paperId, paperTitle: row.paperTitle, dueAt: row.dueAt });
    }

    for (const { reviewerId, reviewerName, reviewerEmail, reminderType, papers } of groups.values()) {
      try {
        await sendReviewReminderEmail(reviewerEmail, reviewerName, papers, reminderType);
        await Promise.all(papers.map((paper) => runQuery(
          `INSERT IGNORE INTO paper_review_reminders
            (paperId, reviewerId, reminderType, reminderDate)
           VALUES (?, ?, ?, CURDATE())`,
          [paper.paperId, reviewerId, reminderType]
        )));
        console.log(`${reminderType} review reminder sent to ${reviewerEmail} for ${papers.length} paper(s)`);
      } catch (error) {
        console.error(`Failed to send ${reminderType} reminder to reviewer ${reviewerId}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching reviews for the reminder scheduler:", error);
  }
};

export const startReviewReminderScheduler = () => {
  const intervalMs = getReviewReminderCheckIntervalMs();
  setInterval(checkPendingReviewsAndRemind, intervalMs);
  console.log(`Review reminder scheduler started (checks every ${intervalMs / 1000} seconds)`);
  setTimeout(checkPendingReviewsAndRemind, 1000);
};

export default { checkPendingReviewsAndRemind, startReviewReminderScheduler };
