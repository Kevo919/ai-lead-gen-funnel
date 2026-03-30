# AI Lead Generation Funnels

Conversion-optimized landing pages for home services lead capture (HVAC & Roofing).

## Quick Start

```bash
npm install
npm start
```

Server runs at `http://localhost:3200`.

## Landing Pages

Each page is city-specific and auto-generated from config:

| Service | City | URL |
|---------|------|-----|
| HVAC | Phoenix, AZ | `/hvac/phoenix-az` |
| HVAC | Dallas, TX | `/hvac/dallas-tx` |
| HVAC | Atlanta, GA | `/hvac/atlanta-ga` |
| Roofing | Phoenix, AZ | `/roofing/phoenix-az` |
| Roofing | Dallas, TX | `/roofing/dallas-tx` |
| Roofing | Atlanta, GA | `/roofing/atlanta-ga` |

## Adding New Cities

Edit `config.js` and add a new entry to the `cities` array:

```js
{
  slug: "miami-fl",
  name: "Miami",
  state: "FL",
  fullName: "Miami, FL",
  areaRefs: ["Miami Beach", "Coral Gables", "Hialeah"],
  phone: "(305) 555-0199"
}
```

No code changes needed — new pages are generated automatically.

## Lead Storage & Email Drip

Leads are stored in `data/leads.json`. View all leads at `/api/leads`.

### Email Drip Sequence

When a lead is captured, they're automatically enrolled in a 4-email nurture sequence:

| Day | Email | Purpose |
|-----|-------|---------|
| 0 | Thank You | Immediate confirmation & set expectations |
| 1 | Why Choose Us | Build trust with benefits & testimonials |
| 3 | Limited Offer | Create urgency with special pricing |
| 7 | Final Follow-up | Re-engagement or graceful exit |

**Setup:**

1. Copy `.env.example` to `.env`
2. Configure SMTP credentials (SendGrid, Mailgun, Gmail, etc.)
3. Restart the server

**Development Mode (No SMTP):**
The app works without SMTP configuration — emails are logged to `data/email-log.json` but not sent. Perfect for testing.

**Email Management:**
- Queue: `data/drip-queue.json` (all pending emails)
- Logs: `data/email-log.json` (sent/failed history)
- Unsubscribes: `data/unsubscribes.json` (opt-out list)

**Unsubscribe:**
All emails include an unsubscribe link. Unsubscribed emails are automatically skipped from future sends.

## Project Structure

```
server.js              - Express server with routing and templating
config.js              - City/service configuration (add cities here)
email-service.js       - Nodemailer SMTP integration
email-scheduler.js     - Drip sequence processor (runs every 5 min)
drip-queue.js          - Email queue & unsubscribe management
views/
  landing.html         - Shared landing page template
  thank-you.html       - Confirmation page template
email-templates/
  day0-thank-you.html  - Immediate thank you email
  day1-why-choose-us.html - Value/trust building
  day3-limited-offer.html - Urgency/special offer
  day7-final-followup.html - Re-engagement
public/
  css/styles.css       - Responsive styles
  js/form.js           - Form validation and submission
data/
  leads.json           - Lead database (auto-created)
  drip-queue.json      - Email drip queue (auto-created)
  email-log.json       - Email send/fail log (auto-created)
  unsubscribes.json    - Unsubscribe list (auto-created)
```
