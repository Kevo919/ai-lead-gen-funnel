const express = require("express");
const fs = require("fs");
const path = require("path");
const { cities, services } = require("./config");
const { addLeadToDrip, decodeUnsubscribeToken, addUnsubscribe } = require("./drip-queue");
const { startScheduler } = require("./email-scheduler");

const app = express();
const PORT = process.env.PORT || 3200;
const LEADS_FILE = path.join(__dirname, "data", "leads.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, "[]", "utf8");
}

// Helper: read HTML template and inject city/service data
function renderLanding(service, city) {
  let html = fs.readFileSync(path.join(__dirname, "views", "landing.html"), "utf8");

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  const benefitsHtml = service.benefits
    .map(b => `<div class="benefit-card"><div class="benefit-icon">${b.icon}</div><h3>${b.title}</h3><p>${b.desc}</p></div>`)
    .join("\n");

  const serviceOptionsHtml = service.serviceOptions
    .map(o => `<option value="${o}">${o}</option>`)
    .join("\n");

  const testimonialsHtml = service.testimonials
    .map(t => `<div class="testimonial-card"><div class="stars">${stars(t.rating)}</div><p class="testimonial-text">"${t.text}"</p><p class="testimonial-author">— ${t.name}</p></div>`)
    .join("\n");

  const areaList = city.areaRefs.map(a => `<li>${a}</li>`).join("");

  const replacements = {
    "{{PAGE_TITLE}}": `${service.shortTitle} Services in ${city.fullName} | Free Quote`,
    "{{HERO_HEADLINE}}": service.heroHeadline(city.name),
    "{{HERO_SUBLINE}}": service.heroSubline(city.name),
    "{{CITY_NAME}}": city.name,
    "{{CITY_FULL}}": city.fullName,
    "{{STATE}}": city.state,
    "{{PHONE}}": city.phone,
    "{{SERVICE_SLUG}}": service.slug,
    "{{SERVICE_TITLE}}": service.title,
    "{{SERVICE_SHORT}}": service.shortTitle,
    "{{BENEFITS_HTML}}": benefitsHtml,
    "{{SERVICE_OPTIONS}}": serviceOptionsHtml,
    "{{TESTIMONIALS_HTML}}": testimonialsHtml,
    "{{AREA_LIST}}": areaList,
    "{{CITY_SLUG}}": city.slug,
    "{{YEAR}}": new Date().getFullYear().toString()
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  return html;
}

function renderThankYou(service, city) {
  let html = fs.readFileSync(path.join(__dirname, "views", "thank-you.html"), "utf8");
  const replacements = {
    "{{PAGE_TITLE}}": `Thank You | ${service.shortTitle} Quote Request`,
    "{{CITY_NAME}}": city.name,
    "{{CITY_FULL}}": city.fullName,
    "{{PHONE}}": city.phone,
    "{{SERVICE_TITLE}}": service.title,
    "{{SERVICE_SHORT}}": service.shortTitle,
    "{{SERVICE_SLUG}}": service.slug,
    "{{CITY_SLUG}}": city.slug,
    "{{YEAR}}": new Date().getFullYear().toString()
  };
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }
  return html;
}

// Landing pages: /:service/:city (e.g., /hvac/phoenix-az)
app.get("/:service/:city", (req, res) => {
  const service = services[req.params.service];
  const city = cities.find(c => c.slug === req.params.city);
  if (!service || !city) return res.status(404).send("Page not found");
  res.send(renderLanding(service, city));
});

// Thank-you page
app.get("/:service/:city/thank-you", (req, res) => {
  const service = services[req.params.service];
  const city = cities.find(c => c.slug === req.params.city);
  if (!service || !city) return res.status(404).send("Page not found");
  res.send(renderThankYou(service, city));
});

// Lead submission endpoint
app.post("/api/leads", (req, res) => {
  const { name, phone, email, service, zipCode, city, serviceType } = req.body;

  if (!name || !phone || !email || !service || !zipCode) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name,
    phone,
    email,
    service,
    serviceType: serviceType || "",
    zipCode,
    city: city || "",
    submittedAt: new Date().toISOString(),
    status: "new"
  };

  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");

  // Add lead to email drip sequence
  const serviceInfo = services[service];
  const cityInfo = cities.find(c => c.slug === city || c.fullName === city);

  if (serviceInfo && cityInfo) {
    addLeadToDrip(lead, serviceInfo, cityInfo);
  } else {
    console.warn(`Could not add lead ${lead.id} to drip: service or city not found`);
  }

  res.json({ success: true, leadId: lead.id });
});

// View leads (simple admin)
app.get("/api/leads", (req, res) => {
  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
  res.json(leads);
});

// Unsubscribe from email drip
app.get("/api/unsubscribe", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid unsubscribe link");
  }

  const decoded = decodeUnsubscribeToken(token);

  if (!decoded || !decoded.email) {
    return res.status(400).send("Invalid unsubscribe token");
  }

  addUnsubscribe(decoded.email);

  res.send(`<!DOCTYPE html><html><head><title>Unsubscribed</title>
    <style>body{font-family:system-ui;max-width:600px;margin:100px auto;padding:0 20px;text-align:center}
    h1{color:#16a34a;font-size:32px}p{color:#64748b;font-size:18px;line-height:1.6}</style></head>
    <body><h1>✓ You've been unsubscribed</h1>
    <p>You will no longer receive emails from us at <strong>${decoded.email}</strong>.</p>
    <p>If this was a mistake, please contact us to re-subscribe.</p></body></html>`);
});

// Homepage - directory of all landing pages
app.get("/", (req, res) => {
  const links = [];
  for (const [sKey, sVal] of Object.entries(services)) {
    for (const city of cities) {
      links.push(`<li><a href="/${sKey}/${city.slug}">${sVal.shortTitle} — ${city.fullName}</a></li>`);
    }
  }
  res.send(`<!DOCTYPE html><html><head><title>AI Lead Gen Funnels</title>
    <style>body{font-family:system-ui;max-width:600px;margin:40px auto;padding:0 20px}
    h1{color:#1e293b}a{color:#2563eb}li{margin:8px 0}</style></head>
    <body><h1>AI Lead Gen Funnels</h1><p>Landing Pages:</p><ul>${links.join("")}</ul>
    <p><a href="/api/leads">View Leads (JSON)</a></p></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Lead Gen Funnels running at http://localhost:${PORT}`);
  console.log("Available pages:");
  for (const [sKey, sVal] of Object.entries(services)) {
    for (const city of cities) {
      console.log(`  http://localhost:${PORT}/${sKey}/${city.slug}`);
    }
  }

  // Start email drip scheduler (checks every 5 minutes)
  startScheduler(5);
});
