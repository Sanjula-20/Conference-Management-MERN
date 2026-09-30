import { db } from "../config/db.js";

const run = (sql, values = []) => new Promise((resolve, reject) =>
  db.query(sql, values, (error, results) => error ? reject(error) : resolve(results))
);

// These tables are deliberately seeded with INSERT IGNORE: changes made by an
// administrator directly in MySQL are never overwritten on a restart.
export const conferenceConfigModel = {
  async initializeTable() {
    await run(`CREATE TABLE IF NOT EXISTS registration_countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      iso2 CHAR(2) NOT NULL UNIQUE,
      isDomestic BOOLEAN NOT NULL DEFAULT FALSE,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      displayOrder INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await run(`CREATE TABLE IF NOT EXISTS author_types (
      code VARCHAR(50) PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      displayOrder INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await run(`CREATE TABLE IF NOT EXISTS payment_rates (
      authorTypeCode VARCHAR(50) PRIMARY KEY,
      domesticBaseAmount INT NOT NULL,
      internationalBaseAmount INT NOT NULL,
      domesticAdditionalAmount INT NOT NULL,
      internationalAdditionalAmount INT NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (authorTypeCode) REFERENCES author_types(code) ON DELETE CASCADE
    )`);

    await run(`INSERT IGNORE INTO registration_countries (name, iso2, isDomestic, displayOrder) VALUES
      ('India', 'IN', TRUE, 1)`);
    await run(`INSERT IGNORE INTO author_types (code, label, displayOrder) VALUES
      ('ug_student', 'UG Student', 1), ('pg_student', 'PG Student', 2),
      ('faculty', 'Faculty', 3), ('industry', 'Industry', 4)`);
    await run(`INSERT IGNORE INTO payment_rates
      (authorTypeCode, domesticBaseAmount, internationalBaseAmount, domesticAdditionalAmount, internationalAdditionalAmount) VALUES
      ('ug_student', 800000, 9000, 150000, 2000),
      ('pg_student', 800000, 9000, 150000, 2000),
      ('faculty', 900000, 10000, 150000, 2000),
      ('industry', 1000000, 11000, 150000, 2000)`);
  },

  getRegistrationOptions() {
    return Promise.all([
      run("SELECT name, iso2, isDomestic FROM registration_countries WHERE isActive = TRUE ORDER BY displayOrder, name"),
      run("SELECT code AS value, label FROM author_types WHERE isActive = TRUE ORDER BY displayOrder, label")
    ]).then(([countries, authorTypes]) => ({ countries, authorTypes }));
  },

  async getPricing(authorTypeCode, countryName) {
    const countries = await run("SELECT isDomestic FROM registration_countries WHERE name = ? AND isActive = TRUE LIMIT 1", [countryName]);
    const rateRows = await run(`SELECT r.*, a.label FROM payment_rates r
      JOIN author_types a ON a.code = r.authorTypeCode
      WHERE r.authorTypeCode = ? AND a.isActive = TRUE LIMIT 1`, [authorTypeCode]);
    if (!rateRows[0]) return null;
    const isDomestic = !!countries[0]?.isDomestic;
    const rate = rateRows[0];
    return {
      baseCategory: rate.label,
      baseAmount: isDomestic ? rate.domesticBaseAmount : rate.internationalBaseAmount,
      additionalAmount: isDomestic ? rate.domesticAdditionalAmount : rate.internationalAdditionalAmount,
      currency: isDomestic ? "INR" : "USD",
      isInternational: !isDomestic
    };
  }
};
