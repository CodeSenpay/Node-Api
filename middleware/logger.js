import pool from "../config/db.conf.js";

async function logger(payload, req, res) {
  const requiredFields = ["action", "user_id", "details", "timestamp"];
  // console.log("Logger middleware called with payload:", payload);

  const missingFields = requiredFields.filter((field) => !(field in payload));
  if (missingFields.length > 0) {
    return {
      message: "Missing required fields",
      missingFields,
      receivedPayload: payload,
    };
  }

  try {
    // Ensure timestamp is a string or empty
    if (typeof payload.timestamp !== "string") {
      payload.timestamp = "";
    }

    const jsondata = JSON.stringify(payload);
    const [rows] = await pool.query(`CALL insert_log_entry(?)`, [jsondata]);
    // rows[0] contains the SELECT result from the SP
    const result =
      rows && Array.isArray(rows) && rows.length > 0 ? rows[0][0] : rows;

    return result;
  } catch (error) {
    return {
      message: "Stored procedure execution failed",
      error: error.message,
      receivedPayload: payload,
    };
  }
}

export default logger;
