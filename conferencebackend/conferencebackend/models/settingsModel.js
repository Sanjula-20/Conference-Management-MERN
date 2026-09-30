// Simple key-value settings store used for admin-controlled toggles
// such as the global paper-submission lock.
export const settingsModel = {
  initializeTable: () => {
    return new Promise((resolve, reject) => {
      const createQuery = `
        CREATE TABLE IF NOT EXISTS system_settings (
          settingKey VARCHAR(100) PRIMARY KEY,
          settingValue VARCHAR(255) NOT NULL,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      import("../config/db.js").then(({ db }) => {
        db.query(createQuery, (err) => {
          if (err) {
            console.error("system_settings table creation error:", err);
            return reject(err);
          }
          // Seed default value for submission lock if missing
          db.query(
            "INSERT IGNORE INTO system_settings (settingKey, settingValue) VALUES ('submissionLocked', 'false')",
            (seedErr) => {
              if (seedErr) {
                console.error("system_settings seed error:", seedErr);
                return reject(seedErr);
              }
              resolve();
            }
          );
        });
      }).catch(reject);
    });
  },

  get: (db, key, callback) => {
    db.query("SELECT settingValue FROM system_settings WHERE settingKey = ?", [key], (err, results) => {
      if (err) return callback(err);
      if (!results || results.length === 0) return callback(null, null);
      callback(null, results[0].settingValue);
    });
  },

  set: (db, key, value, callback) => {
    const query = `
      INSERT INTO system_settings (settingKey, settingValue)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue)
    `;
    db.query(query, [key, value], callback);
  }
};
