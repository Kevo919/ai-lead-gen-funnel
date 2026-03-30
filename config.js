// City/metro configuration for templated landing pages
// Add new cities here to generate landing pages for additional metros
const cities = [
  {
    slug: "phoenix-az",
    name: "Phoenix",
    state: "AZ",
    fullName: "Phoenix, AZ",
    areaRefs: ["Phoenix Metro", "Scottsdale", "Tempe", "Mesa", "Chandler", "Gilbert"],
    phone: "(602) 555-0199"
  },
  {
    slug: "dallas-tx",
    name: "Dallas",
    state: "TX",
    fullName: "Dallas, TX",
    areaRefs: ["Dallas-Fort Worth", "Plano", "Arlington", "Irving", "Frisco", "McKinney"],
    phone: "(214) 555-0199"
  },
  {
    slug: "atlanta-ga",
    name: "Atlanta",
    state: "GA",
    fullName: "Atlanta, GA",
    areaRefs: ["Atlanta Metro", "Marietta", "Roswell", "Alpharetta", "Decatur", "Kennesaw"],
    phone: "(404) 555-0199"
  }
];

const services = {
  hvac: {
    slug: "hvac",
    title: "HVAC Repair & Installation",
    shortTitle: "HVAC",
    heroHeadline: (city) => `Fast & Affordable HVAC Repair in ${city}`,
    heroSubline: (city) => `Trusted by thousands of ${city} homeowners. Get your FREE quote in 60 seconds.`,
    serviceOptions: [
      "AC Repair",
      "AC Installation",
      "Heating Repair",
      "Furnace Installation",
      "Duct Cleaning",
      "Maintenance / Tune-Up",
      "Other"
    ],
    benefits: [
      { icon: "🔧", title: "Same-Day Service", desc: "Emergency repairs available 7 days a week" },
      { icon: "💰", title: "Upfront Pricing", desc: "No hidden fees — know your cost before we start" },
      { icon: "✅", title: "Licensed & Insured", desc: "Fully certified technicians you can trust" },
      { icon: "❄️", title: "All Brands Serviced", desc: "Carrier, Trane, Lennox, Goodman & more" }
    ],
    testimonials: [
      { name: "Sarah M.", text: "They came out the same day and fixed our AC for half what the other company quoted. Highly recommend!", rating: 5 },
      { name: "James R.", text: "Professional, on time, and fair pricing. They're now our go-to for all HVAC needs.", rating: 5 },
      { name: "Linda K.", text: "Saved us $2,000 on a new furnace installation. The team was fantastic from start to finish.", rating: 5 }
    ]
  },
  roofing: {
    slug: "roofing",
    title: "Roof Replacement & Repair",
    shortTitle: "Roofing",
    heroHeadline: (city) => `#1 Rated Roof Replacement in ${city}`,
    heroSubline: (city) => `Protect your home with a new roof. Free inspections for ${city} homeowners — limited time.`,
    serviceOptions: [
      "Full Roof Replacement",
      "Roof Repair",
      "Storm Damage / Insurance Claim",
      "Leak Repair",
      "Gutter Installation",
      "Inspection / Estimate",
      "Other"
    ],
    benefits: [
      { icon: "🏠", title: "Free Roof Inspection", desc: "Complete assessment with drone technology" },
      { icon: "🛡️", title: "25-Year Warranty", desc: "Industry-leading warranty on materials & labor" },
      { icon: "✅", title: "Licensed & Insured", desc: "Fully bonded with $2M liability coverage" },
      { icon: "⭐", title: "5-Star Rated", desc: "Hundreds of satisfied homeowners in your area" }
    ],
    testimonials: [
      { name: "Mike T.", text: "They handled our entire insurance claim and installed a beautiful new roof in 2 days. Outstanding!", rating: 5 },
      { name: "Patricia W.", text: "Best roofing company we've ever worked with. Fair price, great communication, quality work.", rating: 5 },
      { name: "David & Carol S.", text: "Found a leak and had it fixed within hours. They even showed us drone footage of the damage. Very professional.", rating: 5 }
    ]
  }
};

module.exports = { cities, services };
