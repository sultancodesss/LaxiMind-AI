require("dotenv").config();

const provider = process.env.DATABASE_PROVIDER || "mysql";

let rawPool;
let queryWrapper;

if (provider === "supabase") {
  const { Pool } = require("pg");

  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
      }
    : {
        host: process.env.SUPABASE_DB_HOST,
        port: process.env.SUPABASE_DB_PORT || 5432,
        database: process.env.SUPABASE_DB_NAME || "postgres",
        user: process.env.SUPABASE_DB_USER,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        max: 10,
      };

  rawPool = new Pool(poolConfig);

  // Query wrapper to mimic mysql2's pool.query(sql, params) -> [rows, fields]
  queryWrapper = async (sql, params) => {
    // Convert MySQL placeholder '?' to PostgreSQL placeholder '$1', '$2', etc.
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);

    let finalSql = pgSql;
    const isInsert = finalSql.trim().toUpperCase().startsWith("INSERT INTO");

    // Append RETURNING id for INSERT queries to simulate insertId
    if (isInsert && !finalSql.toUpperCase().includes("RETURNING")) {
      finalSql += " RETURNING id";
    }

    const result = await rawPool.query(finalSql, params);

    if (isInsert && result.rows.length > 0) {
      result.insertId = result.rows[0].id;
    }

    const mockRows = isInsert ? { insertId: result.insertId } : result.rows;
    return [mockRows, result.fields];
  };

} else {
  const mysql = require("mysql2/promise");

  rawPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "sultan",
    database: process.env.DB_NAME || "laximind_ai",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  queryWrapper = async (sql, params) => {
    return await rawPool.query(sql, params);
  };
}

const pool = {
  query: queryWrapper,
};

async function initDB() {
  try {
    if (provider === "supabase") {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      const mysql = require("mysql2/promise");
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "sultan",
      });

      const dbName = process.env.DB_NAME || "laximind_ai";
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("✅ Database connection is ready and users table is available.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message, err.stack);
    throw err;
  }
}

module.exports = { pool, initDB };
