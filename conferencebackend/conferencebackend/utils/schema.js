const identifierPattern = /^[A-Za-z0-9_]+$/;

const assertIdentifier = (value) => {
  if (!identifierPattern.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`);
  }
};

const query = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });

export const addColumnIfMissing = async (db, tableName, columnName, columnDefinition) => {
  assertIdentifier(tableName);
  assertIdentifier(columnName);

  const rows = await query(
    db,
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  if (rows[0].count === 0) {
    await query(db, `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
};

export const createIndexIfMissing = async (db, tableName, indexName, columns) => {
  assertIdentifier(tableName);
  assertIdentifier(indexName);
  const columnList = Array.isArray(columns) ? columns : [columns];
  columnList.forEach(assertIdentifier);

  const rows = await query(
    db,
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
    `,
    [tableName, indexName]
  );

  if (rows[0].count === 0) {
    await query(db, `CREATE INDEX ${indexName} ON ${tableName}(${columnList.join(", ")})`);
  }
};

export const runQuery = query;

