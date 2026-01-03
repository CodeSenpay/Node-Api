import argon2 from "argon2";
import pool from "../config/db.conf.js";
import logger from "../middleware/logger.js";
const JWT_SECRET = process.env.JWT_SECRET;

async function registerUser(payload, req, res) {
  const requiredFields = [
    "email",
    "password",
    "first_name",
    "last_name",
    "middle_name",
    "mobile_number",
  ];

  // Check for missing fields
  const missingFields = requiredFields.filter(field => !(field in payload));
  if (missingFields.length) {
    await logger(
      {
        action: "register_attempt",
        user_id: payload.email || null,
        details: `Registration failed: missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
      req,
      res
    );
    return {
      message: "Missing required fields",
      missingFields,
      receivedPayload: payload,
    };
  }

  // Validate email format
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    await logger(
      {
        action: "register_attempt",
        user_id: payload.email || null,
        details: `Registration failed: invalid email format (${payload.email})`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
      req,
      res
    );
    return {
      message: "Invalid email format",
      receivedEmail: payload.email,
    };
  }

  // Hash password if present
  if (payload.password) {
    try {
      // Use argon2 to hash the password
      payload.password = await argon2.hash(String(payload.password));
    } catch (error) {
      await logger(
        {
          action: "register_error",
          user_id: payload.email || null,
          details: `Password hashing failed: ${error.message}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        },
        req,
        res
      );
      return {
        message: "Password hashing failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  try {
    const jsondata = JSON.stringify(payload);
    const [rows] = await pool.query(`CALL register_user(?)`, [jsondata]);

    await logger(
      {
        action: "register_success",
        user_id: payload.email || null,
        details: `User registration attempted via API`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
      req,
      res
    );

    return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
  } catch (error) {
    await logger(
      {
        action: "register_error",
        user_id: payload.email || null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
      req,
      res
    );
    return {
      message: "Stored procedure execution failed",
      error: error.message,
      receivedPayload: payload,
    };
  }
}

export { registerUser };
