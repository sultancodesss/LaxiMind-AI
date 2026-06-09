const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host:     process.env.DB_HOST     || "127.0.0.1",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "laximind",
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Auto-create the database and users table if they don't exist
async function initDB() {
  // Step 1: connect without a database to create it
  const tempConn = await mysql.createConnection({
    host:     dbConfig.host,
    port:     dbConfig.port,
    user:     dbConfig.user,
    password: dbConfig.password,
  });

  await tempConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
  );
  await tempConn.end();

  // Step 2: create tables using the pool (which now targets the DB)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log(`✅ Database "${dbConfig.database}" and users table are ready.`);
}

module.exports = { pool, initDB };
