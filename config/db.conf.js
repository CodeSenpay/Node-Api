import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST_LOCAL || "localhost",
  user: process.env.DB_USER_LOCAL,
  database: process.env.DB_NAME_LOCAL,
  password: process.env.DB_PASSWORD_LOCAL,
  port: Number(process.env.DB_PORT_LOCAL ?? 3306),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log("✅ MySQL connected");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
}

verifyConnection();

export default pool;
