import { createIndexIfMissing, addColumnIfMissing } from "../utils/schema.js";

export const registrationModel = (db) => {
  return new Promise((resolve, reject) => {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        paperTitle VARCHAR(255) NOT NULL,
        authors JSON NOT NULL,
        abstractBlob LONGBLOB,
        email VARCHAR(255) NOT NULL,
        tracks VARCHAR(255),
        country VARCHAR(255),
        state VARCHAR(255),
        city VARCHAR(255),
        finalSubmissionStatus ENUM('not_submitted', 'submitted', 'approved', 'rejected') DEFAULT 'not_submitted',
        status ENUM('submitted', 'under_review', 'accepted', 'accepted_with_minor_revision', 'accepted_with_major_revision', 'rejected', 'published') DEFAULT 'submitted',
        assignedReviewerName VARCHAR(255),
        reviewStatus ENUM('under_review', 'accepted', 'accepted_with_minor_revision', 'accepted_with_major_revision', 'rejected', 'published'),
        comments TEXT,
        adminComments TEXT,
        reviewedAt TIMESTAMP NULL,
        finalPaperBlob LONGBLOB,
        notificationSent BOOLEAN DEFAULT FALSE,
        paymentStatus ENUM('not_paid', 'paid', 'failed') DEFAULT 'not_paid',
        paymentId VARCHAR(100),
        paymentDate TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    db.query(createQuery, (err) => {
      if (err) {
        console.error("Table creation error:", err);
        return reject(err);
      }

      // Create indexes for registrations
      const regPromises = [
        createIndexIfMissing(db, "registrations", "idx_reg_createdAt", "createdAt"),
        createIndexIfMissing(db, "registrations", "idx_reg_userId", "userId"),
            createIndexIfMissing(db, "registrations", "idx_reg_tracks", "tracks"),
            createIndexIfMissing(db, "registrations", "idx_reg_status", "status"),
            createIndexIfMissing(db, "registrations", "idx_reg_finalStatus", "finalSubmissionStatus"),
            createIndexIfMissing(db, "registrations", "idx_reg_paymentStatus", "paymentStatus")
      ];
      Promise.all(regPromises).then(() => {

        // Create paper_assignments table
        const assignmentQuery = `
          CREATE TABLE IF NOT EXISTS paper_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            paperId INT NOT NULL UNIQUE,
            reviewer1 INT NULL,
            reviewer2 INT NULL,
            assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer1) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (reviewer2) REFERENCES users(id) ON DELETE SET NULL
          )
        `;
        db.query(assignmentQuery, (err) => {
          if (err) {
            console.error("Paper assignments table creation error:", err);
            return reject(err);
          }

          // Create indexes for paper_assignments
          const paPromises = [
            createIndexIfMissing(db, "paper_assignments", "idx_pa_paperId", "paperId"),
            createIndexIfMissing(db, "paper_assignments", "idx_pa_reviewer1", "reviewer1"),
            createIndexIfMissing(db, "paper_assignments", "idx_pa_reviewer2", "reviewer2"),
            // Required by the reminder scheduler.  Include this migration in
            // initialization so it completes before the scheduler can query it.
            addColumnIfMissing(db, "paper_assignments", "lastReminderSentAt", "TIMESTAMP NULL"),
            // Each reviewer receives their own seven-day deadline, including
            // when a second reviewer is added to an existing assignment.
            addColumnIfMissing(db, "paper_assignments", "reviewer1DueAt", "DATETIME NULL"),
            addColumnIfMissing(db, "paper_assignments", "reviewer2DueAt", "DATETIME NULL")
          ];
          Promise.all(paPromises)
            .then(async () => {
              // The scheduler filters assignments by their individual due
              // time. Create these only after the columns exist, so this
              // migration is safe for databases created before the feature.
              await Promise.all([
                createIndexIfMissing(db, "paper_assignments", "idx_pa_reviewer1DueAt", "reviewer1DueAt"),
                createIndexIfMissing(db, "paper_assignments", "idx_pa_reviewer2DueAt", "reviewer2DueAt")
              ]);

              const execute = (sql) => new Promise((resolveQuery, rejectQuery) =>
                db.query(sql, (queryErr) => queryErr ? rejectQuery(queryErr) : resolveQuery())
              );

              try {
                await execute(`CREATE TABLE IF NOT EXISTS paper_review_reminders (
                  id INT AUTO_INCREMENT PRIMARY KEY, paperId INT NOT NULL, reviewerId INT NOT NULL,
                  reminderType VARCHAR(30) NOT NULL, reminderDate DATE NOT NULL,
                  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY unique_daily_review_reminder (paperId, reviewerId, reminderType, reminderDate),
                  FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
                  FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE
                )`);
                await execute(`CREATE TABLE IF NOT EXISTS paper_reviews (
                  id INT AUTO_INCREMENT PRIMARY KEY, paperId INT NOT NULL, reviewerId INT NOT NULL,
                  status ENUM('under_review', 'accepted', 'accepted_with_minor_revision', 'accepted_with_major_revision', 'rejected', 'published') NOT NULL,
                  comments TEXT, reviewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
                  FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
                  UNIQUE KEY unique_review (paperId, reviewerId)
                )`);
                await Promise.all([
                  createIndexIfMissing(db, "paper_reviews", "idx_pr_paperId", "paperId"),
                  createIndexIfMissing(db, "paper_reviews", "idx_pr_reviewerId", "reviewerId")
                ]);
                await execute(`CREATE TABLE IF NOT EXISTS paper_review_details (
                  id INT AUTO_INCREMENT PRIMARY KEY, paperId INT NOT NULL, reviewerId INT NOT NULL,
                  q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT, q5 TEXT, q6 TEXT,
                  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
                  FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
                  UNIQUE KEY unique_review_details (paperId, reviewerId)
                )`);
                await execute(`CREATE TABLE IF NOT EXISTS chair_paper_assignments (
                  id INT AUTO_INCREMENT PRIMARY KEY, paperId INT NOT NULL, chairpersonId INT NOT NULL,
                  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
                  FOREIGN KEY (chairpersonId) REFERENCES users(id) ON DELETE CASCADE,
                  UNIQUE KEY unique_chair_assignment (paperId, chairpersonId)
                )`);
                await Promise.all([
                  createIndexIfMissing(db, "chair_paper_assignments", "idx_cpa_paperId", "paperId"),
                  createIndexIfMissing(db, "chair_paper_assignments", "idx_cpa_chairpersonId", "chairpersonId")
                ]);
                await execute(`CREATE TABLE IF NOT EXISTS chair_reviews (
                  id INT AUTO_INCREMENT PRIMARY KEY, paperId INT NOT NULL, chairpersonId INT NOT NULL,
                  technicalDepthScore TINYINT NOT NULL, practicalImpactScore TINYINT NOT NULL,
                  researchQualityScore TINYINT NOT NULL, presentationSkillsScore TINYINT NOT NULL,
                  queryResponseScore TINYINT NOT NULL, totalScore TINYINT NOT NULL,
                  recommendation ENUM('strongly_recommended', 'recommended', 'not_recommended') NOT NULL,
                  reviewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
                  FOREIGN KEY (chairpersonId) REFERENCES users(id) ON DELETE CASCADE,
                  UNIQUE KEY unique_chair_review (paperId, chairpersonId)
                )`);
                await Promise.all([
                  createIndexIfMissing(db, "chair_reviews", "idx_cr_paperId", "paperId"),
                  createIndexIfMissing(db, "chair_reviews", "idx_cr_chairpersonId", "chairpersonId"),
                  createIndexIfMissing(db, "chair_reviews", "idx_cr_recommendation", "recommendation")
                ]);
                try {
                  await execute(`INSERT INTO paper_review_details (paperId, reviewerId, q1)
                    SELECT paperId, reviewerId, comments FROM paper_reviews
                    WHERE comments IS NOT NULL AND comments != ''
                    ON DUPLICATE KEY UPDATE q1 = VALUES(q1)`);
                } catch (migrationError) {
                  console.error("Migration error:", migrationError);
                }
                resolve();
              } catch (modelError) {
                reject(modelError);
              }
            })
            .catch(reject);
        });
      })
      .catch(reject);
    });
  });
};
