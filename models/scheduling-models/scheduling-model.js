import argon2 from "argon2";
import pool from "../../config/db.conf.js";
import logger from "../../middleware/logger.js";

const getMissingFields = (requiredFields, payload) =>
  requiredFields.filter((field) => !(field in payload));

const getRowsResult = (rows) =>
  rows && Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;

export class SchedulingModel {
  // ========================================================== Availability Functions ==========================================================
  static async insertAvailability(payload, socket) {
    const requiredFields = [
      "transaction_type_id",
      "college",
      "semester",
      "school_year",
      "start_date",
      "end_date",
      "created_by",
      "created_at",
      "time_windows",
    ];

    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      await logger({
        action: "insertAvailability",
        user_id: payload.created_by || null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL insert_availability(?)`, [
        jsondata,
      ]);
      await logger({
        action: "insertAvailability",
        user_id: payload.created_by || null,
        details: "Availability inserted successfully",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return getRowsResult(rows);
    } catch (error) {
      await logger({
        action: "insertAvailability",
        user_id: payload.created_by || null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async updateAvailability(payload, socket) {
    const requiredFields = [
      "availability_id",
      "transaction_type_id",
      "college",
      "semester",
      "school_year",
      "start_date",
      "end_date",
      "user_id",
      "time_windows",
    ];

    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      await logger({
        action: "updateAvailability",
        user_id: payload.user_id || null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL update_availability(?)`, [
        jsondata,
      ]);
      await logger({
        action: "updateAvailability",
        user_id: payload.user_id || null,
        details: "Availability updated successfully",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return getRowsResult(rows);
    } catch (error) {
      await logger({
        action: "updateAvailability",
        user_id: payload.user_id || null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async getAvailability(payload, socket) {
    const { searchkey, college, semester, school_year } = payload || {};
    const spPayload = { searchkey, college, semester, school_year };

    try {
      const jsondata = JSON.stringify(spPayload);
      const [rows] = await pool.query(`CALL get_availability(?)`, [jsondata]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async deleteAvailability(payload, socket) {
    const requiredFields = ["availability_id"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const [rows] = await pool.query("CALL delete_availability(?)", [
        payload.availability_id,
      ]);
      if (rows && Array.isArray(rows) && rows.length > 0) {
        const result = rows[0];
        if (
          typeof result === "object" &&
          result !== null &&
          "success" in result
        ) {
          return result;
        } else if (typeof result === "string") {
          try {
            return JSON.parse(result);
          } catch (e) {
            return {
              success: false,
              message: "Malformed response from stored procedure",
              raw: result,
            };
          }
        }
        return result;
      }
      return { success: false, message: "No response from stored procedure" };
    } catch (error) {
      return {
        success: false,
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  // ========================================================== Appointment Functions ==========================================================
  static async insertAppointment(payload, socket) {
    const requiredFields = [
      "transaction_type_id",
      "user_id",
      "appointment_date",
      "time_frame",
      "school_year",
      "semester",
    ];

    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      console.log(jsondata);
      const [rows] = await pool.query(`CALL insert_appointment(?)`, [jsondata]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async getAppointment(payload, socket) {
    const requiredFields = [
      "appointment_id",
      "appointment_status",
      "transaction_type_id",
      "user_id",
      "appointment_date",
      "school_year",
      "semester",
    ];

    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL get_appointment(?)`, [jsondata]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async getTimewindow(payload) {
    const requiredFields = ["available_date"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL get_timewindow(?)`, [jsondata]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async approveAppointment(payload, req) {
    const requiredFields = [
      "appointment_id",
      "approved_by",
      "appointment_status",
      "student_email",
      "student_id",
    ];

    const missingFields = getMissingFields(requiredFields, payload);

    if (missingFields.length) {
      await logger({
        action: "approveAppointment",
        user_id: payload.approved_by ?? null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL approve_appointment(?)`, [
        jsondata,
      ]);

      let emailResult = null;
      // let spResult = rows?.[0]?.[0]?.result;

      // if (spResult?.success && payload.student_email) {
      //   let transaction_title = spResult?.transaction_type ?? null;
      //   let appointment_details = spResult?.appointment_details ?? null;
      //   emailResult = await sendEmailToStudent(
      //     payload.student_email,
      //     payload.appointment_status,
      //     transaction_title,
      //     appointment_details
      //   );
      // }
      const io = req.app.get("socketio");
      io.to(payload.student_id.toString()).emit("appointmentUpdate", {
        message: `Your Appointment ${payload.appointment_id} has been ${payload.appointment_status}`,
        status: payload.appointment_status,
      });
      await logger({
        action: "approveAppointment",
        user_id: payload.approved_by ?? null,
        details: `Appointment ${payload.appointment_status} successfully${emailResult?.message ? `; Email: ${emailResult.message}` : ""}`,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      });

      return Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;
    } catch (error) {
      await logger({
        action: "approveAppointment",
        user_id: payload.approved_by ?? null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async deleteAppointment(payload) {
    const requiredFields = ["appointment_id", "user_id"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      await logger({
        action: "deleteAppointment",
        user_id: payload.user_id || null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const [rows] = await pool.query(`CALL delete_appointment(?)`, [
        payload.appointment_id,
      ]);
      await logger({
        action: "deleteAppointment",
        user_id: payload.user_id || null,
        details: "Appointment deletion attempted",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      if (rows && Array.isArray(rows) && rows.length > 0 && rows[0].result) {
        try {
          return JSON.parse(rows[0].result);
        } catch {
          return rows[0];
        }
      }
      return getRowsResult(rows);
    } catch (error) {
      await logger({
        action: "deleteAppointment",
        user_id: payload.user_id || null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  // ========================================================== Transaction Type Functions ==========================================================
  static async insertTransactionType(payload) {
    const requiredFields = ["transaction_title", "transaction_detail"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      await logger({
        action: "insertTransactionType",
        user_id: payload.user_id || null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL insert_transaction_type(?)`, [
        jsondata,
      ]);
      await logger({
        action: "insertTransactionType",
        user_id: payload.user_id || null,
        details: "Transaction type inserted successfully",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Stored procedure executed successfully",
        result: rows,
        receivedPayload: payload,
      };
    } catch (error) {
      await logger({
        action: "insertTransactionType",
        user_id: payload.user_id || null,
        details: `Stored procedure execution failed: ${error.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  static async getTransactionType() {
    try {
      const [rows] = await pool.query(`CALL get_transaction_type()`);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
      };
    }
  }

  static async getCollegeDeparments() {
    try {
      const [rows] = await pool.query("SELECT * FROM college_departments");
      return rows && Array.isArray(rows) && rows.length > 0 ? rows : rows;
    } catch (err) {
      return {
        message: "Fetching of College Departments Failed!",
        error: err.message,
      };
    }
  }

  static async updateStudentEmail(payload) {
    const requiredFields = ["student_id", "student_email"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL update_student_email(?)`, [
        jsondata,
      ]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  // static async uploadProfile(payload) {
  //   const requiredFields = ["student_id", "student_profile"];
  //   const missingFields = getMissingFields(requiredFields, payload);
  //   if (missingFields.length > 0) {
  //     return {
  //       message: "Missing required fields",
  //       missingFields,
  //       receivedPayload: payload,
  //     };
  //   }
  //   try {
  //     const jsondata = JSON.stringify(payload);
  //     const [rows] = await pool.query(`CALL upload_student_profile(?)`, [jsondata]);
  //     return getRowsResult(rows);
  //   } catch (error) {
  //     return {
  //       message: "Stored procedure execution failed",
  //       error: error.message,
  //       receivedPayload: payload,
  //     };
  //   }
  // }

  // static async getStudentProfile(payload) {
  //   const requiredFields = ["student_id"];
  //   const missingFields = getMissingFields(requiredFields, payload);
  //   if (missingFields.length > 0) {
  //     return {
  //       message: "Missing required fields",
  //       missingFields,
  //       receivedPayload: payload,
  //     };
  //   }
  //   try {
  //     const [rows] = await pool.query(`CALL get_student_profile(?)`, [payload]);
  //     if (rows && Array.isArray(rows) && rows.length > 0) {
  //       const profileResult = rows[0] && rows[0][0] && rows[0][0].student_profile
  //         ? { student_profile: rows[0][0].student_profile }
  //         : null;
  //       const responseResult = rows[1] && rows[1][0] && rows[1][0].Response
  //         ? JSON.parse(rows[1][0].Response)
  //         : null;
  //       if (profileResult) {
  //         return { success: true, ...profileResult };
  //       } else if (responseResult) {
  //         return responseResult;
  //       }
  //     }
  //     return { success: false, message: "Unexpected response from stored procedure." };
  //   } catch (error) {
  //     return {
  //       message: "Stored procedure execution failed",
  //       error: error.message,
  //       receivedPayload: payload,
  //     };
  //   }
  // }

  static async generateReport(payload) {
    const requiredFields = [
      "transaction_type_id",
      "date",
      "school_year",
      "semester",
      "status",
    ];

    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const jsondata = JSON.stringify(payload);
      const [rows] = await pool.query(`CALL generate_report(?)`, [jsondata]);
      return getRowsResult(rows);
    } catch (error) {
      return {
        message: "Stored procedure execution failed",
        error: error.message,
        receivedPayload: payload,
      };
    }
  }

  // ========================================================== Fetching Section ====================================================================
  static async fetchTotalSlots(payload) {
    const requiredFields = ["transaction_type_id"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const [rows] = await pool.query("CALL get_total_slots(?)", [
        payload.transaction_type_id,
      ]);
      return getRowsResult(rows);
    } catch (err) {
      return {
        message: "Fetching total slots failed!",
        error: err.message,
      };
    }
  }

  static async fetchTotalPendings(payload) {
    const requiredFields = ["transaction_type_id"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      return {
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      const [rows] = await pool.query("CALL get_total_pending(?)", [
        payload.transaction_type_id,
      ]);
      return getRowsResult(rows);
    } catch (err) {
      return {
        message: "Fetching total pendings failed",
        error: err.message,
      };
    }
  }

  static async updateAdminPassword(payload) {
    const requiredFields = ["admin_email", "new_password"];
    const missingFields = getMissingFields(requiredFields, payload);
    if (missingFields.length > 0) {
      await logger({
        action: "updateAdminPassword",
        user_id: payload.admin_email || null,
        details: `Missing required fields: ${missingFields.join(", ")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        success: false,
        message: "Missing required fields",
        missingFields,
        receivedPayload: payload,
      };
    }

    try {
      // Use argon2 to hash the new password before storing
      const hashedPassword = await argon2.hash(payload.new_password);

      // Prepare JSON data for the stored procedure, using the hashed password
      const jsondata = JSON.stringify({
        admin_email: payload.admin_email,
        new_password: hashedPassword,
      });

      // Call the stored procedure
      const [rows] = await pool.query("CALL update_admin_password(?)", [
        jsondata,
      ]);

      // The result is always in rows[0][0].result (because SELECT returns a result set)
      let result;
      if (
        Array.isArray(rows) &&
        rows.length > 0 &&
        Array.isArray(rows[0]) &&
        rows[0].length > 0 &&
        rows[0][0].result
      ) {
        // rows[0][0].result is a JSON string
        result =
          typeof rows[0][0].result === "string"
            ? JSON.parse(rows[0][0].result)
            : rows[0][0].result;
      } else {
        result = {
          success: false,
          message: "Unexpected response from update_admin_password procedure",
          raw: rows,
        };
      }

      await logger({
        action: "updateAdminPassword",
        user_id: payload.admin_email || null,
        details: result.success
          ? "Admin password updated successfully"
          : `Failed to update admin password: ${result.message || "Unknown error"}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });

      return result;
    } catch (err) {
      await logger({
        action: "updateAdminPassword",
        user_id: payload.admin_email || null,
        details: `Error updating admin password: ${err.message}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        success: false,
        message: "Failed to update admin password",
        error: err.message,
      };
    }
  }

  static async getCollegeYearLevels() {
    try {
      const [rows] = await pool.query("CALL get_college_year_level()");
      // The result of a CALL is always in rows[0]
      return {
        success: true,
        data: Array.isArray(rows[0]) ? rows[0] : [],
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch college and year level data",
        error: error.message,
      };
    }
  }


  static async updateAllowedLogin(payload) {
    try {
      // The payload is expected to have { updates: [ { college, year_level, is_allowed }, ... ] }
      // Validate and prepare the JSON for the stored procedure
      let updates = Array.isArray(payload?.updates)
        ? payload.updates
        : [];

      // If the frontend sent a single update as {college, year_level, is_allowed}, wrap it in an array
      if (
        updates.length === 0 &&
        payload &&
        typeof payload === "object" &&
        payload.college &&
        payload.year_level &&
        typeof payload.is_allowed !== "undefined"
      ) {
        updates = [
          {
            college: payload.college,
            year_level: payload.year_level,
            is_allowed: payload.is_allowed,
          },
        ];
      }

      const jsondata = JSON.stringify({ updates });

      // Call the stored procedure
      const [rows] = await pool.query("CALL update_allowed_login(?)", [jsondata]);

      // Debug logging

      // The result of a CALL is always in rows[0]
      let result;
      if (rows && Array.isArray(rows[0]) && rows[0].length > 0) {
        // Check if the result is in the first row
        const firstRow = rows[0][0];
        if (firstRow && firstRow.result) {
          try {
            result = JSON.parse(firstRow.result);
          } catch (e) {
            // If parsing fails, check if it's already an object
            if (typeof firstRow.result === 'object') {
              result = firstRow.result;
            } else {
              result = {
                status: "error",
                message: "Malformed response from update_allowed_login",
                raw: firstRow.result,
              };
            }
          }
        } else {
          // If no 'result' field, the entire row might be the result
          try {
            result = JSON.parse(JSON.stringify(firstRow));
          } catch (e) {
            result = {
              status: "error",
              message: "Unexpected response structure from update_allowed_login",
              raw: firstRow,
            };
          }
        }
      } else {
        result = {
          status: "error",
          message: "Unexpected response from update_allowed_login",
          raw: rows,
        };
      }

      // Log the request and response
      await logger({
        action: "updateAllowedLogin",
        user_id: payload?.updated_by || null,
        details: {
          request: { updates },
          response: result,
          rawRows: rows,
        },
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });

      // Return the result in a format expected by the frontend
      // (frontend expects { success: true/false, data: ... } or { success: false, message: ... })
      if (result.status === "success" || result.status === "partial_success") {
        return {
          success: true,
          data: {
            status: result.status,
            total: result.total,
            successful_updates: result.successful,
            failed_updates: result.failed,
          },
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to update allowed login",
          data: {
            status: result.status,
            total: result?.total,
            successful_updates: result?.successful,
            failed_updates: result?.failed,
          },
        };
      }
    } catch (error) {
      await logger({
        action: "updateAllowedLogin",
        user_id: payload?.updated_by || null,
        details: {
          request: payload,
          error: error.message,
        },
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      return {
        success: false,
        message: "Failed to update allowed login",
        error: error.message,
      };
    }
  }
}
