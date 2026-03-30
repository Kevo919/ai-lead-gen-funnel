const fs = require("fs");
const path = require("path");
const { sendEmail, isSmtpConfigured } = require("./email-service");
const { getPendingEmails, markEmailSent, getStats } = require("./drip-queue");

// Load email template and replace placeholders
function loadTemplate(templateName, data) {
  const templatePath = path.join(__dirname, "email-templates", `${templateName}.html`);
  let html = fs.readFileSync(templatePath, "utf8");

  // Build unsubscribe URL
  const baseUrl = process.env.BASE_URL || "http://localhost:3200";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${data.unsubscribeToken}`;

  const replacements = {
    "{{NAME}}": data.name,
    "{{EMAIL}}": data.email,
    "{{SERVICE}}": data.service,
    "{{SERVICE_SHORT}}": data.serviceShort,
    "{{CITY}}": data.city,
    "{{PHONE}}": data.phone,
    "{{UNSUBSCRIBE_URL}}": unsubscribeUrl
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  return html;
}

// Process pending emails
async function processPendingEmails() {
  const pending = getPendingEmails();

  if (pending.length === 0) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  console.log(`Processing ${pending.length} pending email(s)...`);

  let sent = 0;
  let failed = 0;

  for (const emailJob of pending) {
    try {
      // Load and populate template
      const html = loadTemplate(emailJob.template, emailJob);

      // Send email
      const result = await sendEmail({
        to: emailJob.email,
        subject: emailJob.subject,
        html,
        unsubscribeToken: emailJob.unsubscribeToken
      });

      if (result.success) {
        markEmailSent(emailJob.id, true);
        sent++;
      } else if (result.skipped) {
        // SMTP not configured - mark as sent so we don't retry
        markEmailSent(emailJob.id, true, result.reason);
        failed++;
      } else {
        markEmailSent(emailJob.id, false, result.error);
        failed++;
      }
    } catch (error) {
      console.error(`Error processing email ${emailJob.id}:`, error.message);
      markEmailSent(emailJob.id, false, error.message);
      failed++;
    }
  }

  return { processed: pending.length, sent, failed };
}

// Start email scheduler
function startScheduler(intervalMinutes = 5) {
  console.log(`Email scheduler started (checking every ${intervalMinutes} minutes)`);

  if (!isSmtpConfigured()) {
    console.warn("⚠️  SMTP not configured - emails will be logged but not sent");
    console.warn("⚠️  Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL to enable sending");
  }

  // Run immediately on start
  processPendingEmails().then(result => {
    if (result.processed > 0) {
      console.log(`Initial check: ${result.sent} sent, ${result.failed} failed/skipped`);
    }
  });

  // Then run on interval
  setInterval(async () => {
    const result = await processPendingEmails();
    if (result.processed > 0) {
      console.log(`Scheduler: ${result.sent} sent, ${result.failed} failed/skipped`);
      const stats = getStats();
      console.log(`Queue stats: ${stats.total} total, ${stats.sent} sent, ${stats.pending} pending, ${stats.unsubscribes} unsubscribed`);
    }
  }, intervalMinutes * 60 * 1000);
}

module.exports = {
  startScheduler,
  processPendingEmails
};
