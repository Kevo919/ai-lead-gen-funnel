const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const EMAIL_LOG_FILE = path.join(__dirname, "data", "email-log.json");

// Ensure email log file exists
if (!fs.existsSync(EMAIL_LOG_FILE)) {
  fs.writeFileSync(EMAIL_LOG_FILE, "[]", "utf8");
}

// Check if SMTP is configured
function isSmtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.FROM_EMAIL
  );
}

// Create transporter (lazy init)
let transporter = null;

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return transporter;
}

// Log email activity
function logEmail(data) {
  const logs = JSON.parse(fs.readFileSync(EMAIL_LOG_FILE, "utf8"));
  logs.push({
    ...data,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify(logs, null, 2), "utf8");
}

// Send email
async function sendEmail({ to, subject, html, unsubscribeToken }) {
  const transport = getTransporter();

  if (!transport) {
    const warning = `SMTP not configured - skipping email to ${to} (${subject})`;
    console.warn(warning);
    logEmail({
      to,
      subject,
      status: "skipped",
      reason: "SMTP not configured"
    });
    return { success: false, skipped: true, reason: "SMTP not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html
    });

    logEmail({
      to,
      subject,
      status: "sent",
      messageId: info.messageId
    });

    console.log(`Email sent to ${to}: ${subject} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmail({
      to,
      subject,
      status: "failed",
      error: error.message
    });

    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,
  isSmtpConfigured
};
