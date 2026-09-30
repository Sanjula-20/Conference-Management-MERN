import { addColumnIfMissing, createIndexIfMissing, runQuery } from "../utils/schema.js";
export const userModel = (db) => {
  return new Promise((resolve, reject) => {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        googleId VARCHAR(255) NULL,
        role ENUM('user', 'reviewer', 'chairperson', 'admin') DEFAULT 'user',
        track VARCHAR(255),
        designation VARCHAR(255),
        department VARCHAR(255),
        institution VARCHAR(255),
        mobileNumber VARCHAR(30),
        isFirstLogin TINYINT(1) DEFAULT 0,
        resetToken VARCHAR(255) NULL,
        resetTokenExpiry TIMESTAMP NULL,
        reviewerType ENUM('internal', 'external') DEFAULT 'internal',
        submissionLocked TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createQuery, (err) => {
      if (err) {
        console.error("User table creation error:", err);
        return reject(err);
      }

      Promise.all([
        runQuery(db, `ALTER TABLE users MODIFY COLUMN role ENUM('user', 'reviewer', 'chairperson', 'admin') DEFAULT 'user'`),
        addColumnIfMissing(db, "users", "designation", "VARCHAR(255)"),
        addColumnIfMissing(db, "users", "department", "VARCHAR(255)"),
        addColumnIfMissing(db, "users", "institution", "VARCHAR(255)"),
        addColumnIfMissing(db, "users", "mobileNumber", "VARCHAR(30)"),
        addColumnIfMissing(db, "users", "reviewerType", "ENUM('internal', 'external') DEFAULT 'internal'"),
        addColumnIfMissing(db, "users", "submissionLocked", "TINYINT(1) DEFAULT 0")
      ])
        .then(() =>
          Promise.all([
            createIndexIfMissing(db, "users", "idx_users_role", "role"),
            createIndexIfMissing(db, "users", "idx_users_role_name", ["role", "name"]),
            createIndexIfMissing(db, "users", "idx_users_track", "track"),
            createIndexIfMissing(db, "users", "idx_users_mobileNumber", "mobileNumber")
          ])
        )
        .then(() => resolve())
        .catch(reject);
    });
  });
};
