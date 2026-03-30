const fs = require("fs");
const path = require("path");

const DRIP_QUEUE_FILE = path.join(__dirname, "data", "drip-queue.json");
const UNSUBSCRIBES_FILE = path.join(__dirname, "data", "unsubscribes.json");

// Ensure files exist
if (!fs.existsSync(DRIP_QUEUE_FILE)) {
  fs.writeFileSync(DRIP_QUEUE_FILE, "[]", "utf8");
}
if (!fs.existsSync(UNSUBSCRIBES_FILE)) {
  fs.writeFileSync(UNSUBSCRIBES_FILE, "[]", "utf8");
}

// Drip sequence definition
const DRIP_SEQUENCE = [
  { day: 0, template: "day0-thank-you", subject: "Thank you for your {{SERVICE_SHORT}} quote request!" },
  { day: 1, template: "day1-why-choose-us", subject: "Why {{CITY}} homeowners choose us for {{SERVICE_SHORT}}" },
  { day: 3, template: "day3-limited-offer", subject: "⏰ Limited time offer: Save up to $500 on {{SERVICE_SHORT}}" },
  { day: 7, template: "day7-final-followup", subject: "Still looking for {{SERVICE_SHORT}} in {{CITY}}?" }
];

// Read queue
function readQueue() {
  return JSON.parse(fs.readFileSync(DRIP_QUEUE_FILE, "utf8"));
}

// Write queue
function writeQueue(queue) {
  fs.writeFileSync(DRIP_QUEUE_FILE, JSON.stringify(queue, null, 2), "utf8");
}

// Read unsubscribes
function readUnsubscribes() {
  return JSON.parse(fs.readFileSync(UNSUBSCRIBES_FILE, "utf8"));
}

// Write unsubscribes
function writeUnsubscribes(unsubscribes) {
  fs.writeFileSync(UNSUBSCRIBES_FILE, JSON.stringify(unsubscribes, null, 2), "utf8");
}

// Check if email is unsubscribed
function isUnsubscribed(email) {
  const unsubscribes = readUnsubscribes();
  return unsubscribes.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Add unsubscribe
function addUnsubscribe(email) {
  const unsubscribes = readUnsubscribes();
  if (!isUnsubscribed(email)) {
    unsubscribes.push({
      email: email.toLowerCase(),
      unsubscribedAt: new Date().toISOString()
    });
    writeUnsubscribes(unsubscribes);
  }
}

// Generate unique token for unsubscribe
function generateUnsubscribeToken(email, leadId) {
  return Buffer.from(`${email}:${leadId}`).toString("base64");
}

// Decode unsubscribe token
function decodeUnsubscribeToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [email, leadId] = decoded.split(":");
    return { email, leadId };
  } catch (e) {
    return null;
  }
}

// Add lead to drip sequence
function addLeadToDrip(lead, serviceInfo, cityInfo) {
  if (isUnsubscribed(lead.email)) {
    console.log(`Skipping drip for unsubscribed email: ${lead.email}`);
    return;
  }

  const queue = readQueue();
  const now = new Date();
  const unsubToken = generateUnsubscribeToken(lead.email, lead.id);

  // Create email entries for each day in the sequence
  const emails = DRIP_SEQUENCE.map(step => {
    const sendAt = new Date(now);
    sendAt.setDate(sendAt.getDate() + step.day);

    return {
      id: `${lead.id}-day${step.day}`,
      leadId: lead.id,
      email: lead.email,
      name: lead.name,
      service: serviceInfo.title,
      serviceShort: serviceInfo.shortTitle,
      city: cityInfo.fullName,
      phone: cityInfo.phone,
      template: step.template,
      subject: step.subject
        .replace("{{SERVICE_SHORT}}", serviceInfo.shortTitle)
        .replace("{{CITY}}", cityInfo.name),
      sendAt: sendAt.toISOString(),
      sent: false,
      unsubscribeToken: unsubToken,
      createdAt: now.toISOString()
    };
  });

  queue.push(...emails);
  writeQueue(queue);
  console.log(`Added ${emails.length} drip emails for lead ${lead.id} (${lead.email})`);
}

// Get pending emails that are ready to send
function getPendingEmails() {
  const queue = readQueue();
  const now = new Date();

  return queue.filter(email => {
    if (email.sent) return false;
    if (isUnsubscribed(email.email)) return false;
    return new Date(email.sendAt) <= now;
  });
}

// Mark email as sent
function markEmailSent(emailId, success = true, error = null) {
  const queue = readQueue();
  const email = queue.find(e => e.id === emailId);

  if (email) {
    email.sent = true;
    email.sentAt = new Date().toISOString();
    email.success = success;
    if (error) email.error = error;
    writeQueue(queue);
  }
}

// Get drip stats
function getStats() {
  const queue = readQueue();
  const unsubscribes = readUnsubscribes();

  return {
    total: queue.length,
    sent: queue.filter(e => e.sent).length,
    pending: queue.filter(e => !e.sent).length,
    unsubscribes: unsubscribes.length
  };
}

module.exports = {
  addLeadToDrip,
  getPendingEmails,
  markEmailSent,
  isUnsubscribed,
  addUnsubscribe,
  generateUnsubscribeToken,
  decodeUnsubscribeToken,
  getStats
};
