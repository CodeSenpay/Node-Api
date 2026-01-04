import "dotenv/config";
import nodemailer from "nodemailer";

/**
 * Gmail SMTP transporter (Railway-safe)
 * IMPORTANT:
 * - Uses explicit host/port (NO service: "gmail")
 * - Requires Gmail App Password
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for port 587
  auth: {
    user: process.env.SMTP_USER,      // yourgmail@gmail.com
    pass: process.env.SMTP_PASSWORD,  // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

/**
 * Verify SMTP on startup (recommended)
 */
transporter
  .verify()
  .then(() => console.log("SMTP verified ✅"))
  .catch((err) => console.error("SMTP verification failed ❌", err));

/**
 * Send email to student
 */
export async function sendEmailToStudent(
  email,
  appointment_status,
  transaction_title,
  appointment_details
) {
  const statusMap = {
    approved: { color: "green", text: "Approved" },
    declined: { color: "red", text: "Declined" },
  };

  const statusKey = String(appointment_status).toLowerCase();
  const { color: statusColor, text: statusText } =
    statusMap[statusKey] || {
      color: "black",
      text:
        String(appointment_status).charAt(0).toUpperCase() +
        String(appointment_status).slice(1).toLowerCase(),
    };

  const hasTitle = Boolean(transaction_title);
  const transactionText = hasTitle
    ? ` for <strong>${transaction_title}</strong>`
    : "";
  const transactionTextPlain = hasTitle
    ? ` for "${transaction_title}"`
    : "";

  const subject = `Appointment ${statusText}${
    hasTitle ? `: ${transaction_title}` : ""
  }`;

  // Appointment details
  let appointmentDetailsText = "";
  let appointmentDetailsHtml = "";

  if (appointment_details && typeof appointment_details === "object") {
    const { appointment_date, time_frame, user_id } = appointment_details;
    const detailsArr = [];

    if (appointment_date) detailsArr.push(`Date: ${appointment_date}`);
    if (time_frame) detailsArr.push(`Time: ${time_frame}`);
    if (user_id) detailsArr.push(`User ID: ${user_id}`);

    if (detailsArr.length) {
      appointmentDetailsText = `\n\nAppointment Details:\n${detailsArr.join(
        "\n"
      )}`;

      appointmentDetailsHtml = `
        <div style="margin: 12px 0; font-size: 14px; color: #444;">
          <strong>Appointment Details:</strong><br>
          ${appointment_date ? `Date: ${appointment_date}<br>` : ""}
          ${time_frame ? `Time: ${time_frame}<br>` : ""}
          ${user_id ? `User ID: ${user_id}<br>` : ""}
        </div>
      `;
    }
  }

  const text = `Dear Student,

Your appointment${transactionTextPlain} has been ${statusText.toLowerCase()}.${
    appointmentDetailsText || ""
  }

Please check your account or contact the office for further details.

Thank you,
DSAS System`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
      <h2 style="color: #2d7ff9; margin-top: 0;">
        Appointment ${statusText}${
          hasTitle ? `: <span style="color:#333">${transaction_title}</span>` : ""
        }
      </h2>

      <p style="font-size: 16px; color: #333;">
        Your appointment${transactionText} has been
        <strong style="color:${statusColor};"> ${statusText}</strong>.
      </p>

      ${appointmentDetailsHtml}

      <p style="font-size: 14px; color: #555;">
        Please check your account or contact the office for further details.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin-top:24px;" />

      <p style="font-size: 12px; color: #aaa; margin-top: 12px;">
        DSAS System
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"DSAS System" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    text,
    html,
  };

  try {
    const mailResult = await transporter.sendMail(mailOptions);

    if (mailResult.accepted?.length) {
      return {
        success: true,
        message: "Email sent to student",
        mailResult,
      };
    }

    return {
      success: false,
      message: "Email was not accepted by the server",
    };
  } catch (error) {
    console.error("Send mail error:", error);

    return {
      success: false,
      message: "Failed to send email",
      error: error?.message,
    };
  }
}

export default transporter;
