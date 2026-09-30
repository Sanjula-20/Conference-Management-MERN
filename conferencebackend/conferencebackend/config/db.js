import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Replace single connection with a pool to avoid app crash on connect error
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "5105",
  database: process.env.DB_NAME || "conference_db",
  
});

// Export a callback-capable pool as `db` so legacy code using db.query(sql, params, cb) keeps working.
export const db = pool;

// Also export a promise-based client for async/await usage.
export const dbPromise = pool.promise();

// Helper that supports both callback and promise styles:
// - If a callback is passed it delegates to the callback-style pool.query
// - Otherwise it returns a promise via the promise client
export function query(sql, params, cb) {
  if (typeof cb === "function") {
    return pool.query(sql, params, cb);
  }
  return dbPromise.query(sql, params);
}

// Test connection without throwing so server won't crash if DB is temporarily down
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message || err);
    return;
  }
  console.log("✅ MySQL Pool connected...");
  connection.release();
});

