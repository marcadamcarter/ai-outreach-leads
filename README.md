# AI Outreach Leads

**GuardRailNow City Lead Program** — a volunteer network for local AI safety/risk awareness outreach. The site collects City Lead applications, After-Action Reports (AARs), and quiz results, all synced to Airtable via Netlify Functions.

- **Live site**: https://ai-outreach-leads.netlify.app
- **Playbook**: https://marcadamcarter.github.io/ai-outreach-playbook/
- **Parent org**: https://www.guardrailnow.org

---

## How It Works

1. **Sign Up** — Volunteers apply to become City Leads via the signup form
2. **Get Approved** — Staff reviews applications and updates status in Airtable
3. **Run Events** — Leads run 2–3 community outreach events (booths, gatherings, etc.)
4. **Report Back** — Leads submit After-Action Reports within 72 hours of each event

---

## Pages

### Homepage (`index.html`)
Landing page with CTAs for signup, AAR submission, and the AI Risk Quiz.

### City Lead Signup (`signup.html`)
Application form for new City Leads. Collects contact info, location, motivation, preferred outreach modes, social media, and commitment acknowledgments. Submissions create a record in the Airtable **Leads** table with status "Applied."

### After-Action Report (`aar.html`)
Post-event report form for active City Leads. Captures outreach mode, event details, metrics (conversations, flyers, conversions), qualitative feedback, and restock requests. Submissions create a record in the **AARs** table, linked to the Lead by email.

### AI Risk Knowledge Quiz (`quiz.html`)
5-question multiple-choice quiz on AI safety concepts (alignment, existential risk, the control problem, instrumental convergence, public awareness). Designed for Interactive Booth visitors.

- **Scored client-side** — results display instantly without waiting for a server response
- **Scoring tiers**: AI Novice (0–1), Informed Citizen (2–3), AI Safety Pro (4–5)
- **T-shirt incentive** — perfect score (5/5) earns a free GuardRailNow t-shirt
- **Per-Lead tracking** — each City Lead gets a unique quiz URL via `?ref=<record_id>` parameter, enabling personalized QR codes for booth events. Quiz results link back to the Lead who shared the URL
- **Background save** — results are silently saved to the Airtable **Quiz Results** table after scoring

---

## Tech Stack

- Static HTML + CSS + vanilla JavaScript (no build tools, no frameworks)
- **Netlify Functions** (Node.js) for server-side Airtable writes
- **Airtable** as the backend database
- CSS matches the [guardrailnow.org](https://www.guardrailnow.org) design system

---

## File Structure

```
ai-outreach-leads/
├── css/
│   └── style.css                  ← Shared styles (guardrailnow.org design)
├── js/
│   ├── form.js                    ← Generic form handler (signup + AAR)
│   └── quiz.js                    ← Quiz scoring + background submit
├── netlify/
│   └── functions/
│       ├── signup.js              ← Airtable write for Lead applications
│       ├── aar.js                 ← Airtable write for After-Action Reports
│       └── quiz.js                ← Airtable write for Quiz Results
├── index.html                     ← Homepage
├── signup.html                    ← City Lead application form
├── aar.html                       ← After-Action Report form
├── quiz.html                      ← AI Risk Knowledge Quiz
├── netlify.toml                   ← Netlify config
└── CLAUDE.md                      ← AI dev context (Airtable schema, field mappings)
```

---

## Environment Variables

Set these in the Netlify dashboard under **Site settings > Environment variables**:

| Variable | Description |
|----------|-------------|
| `AIRTABLE_PAT` | Airtable Personal Access Token (starts with `pat...`) |
| `AIRTABLE_BASE_ID` | Airtable Base ID (starts with `app...`) |

---

## The 7 Outreach Modes

Core to the data model — every AAR and Lead preference maps to these:

| Mode | Effort | Description |
|------|--------|-------------|
| Static Presence | Very low | Flyers, posters in coffee shops, libraries |
| Signal Actions | Very low | High-visibility public moments, demonstrations |
| Interactive Booths | Moderate | Tabling at farmers markets, fairs, events |
| Micro-Gatherings | Low-moderate | Small group discussions, house parties, meetups |
| Digital Amplification | Async | Social media campaigns, online outreach |
| Individual Advocacy | Zero | One-on-one personal network conversations |
| Institutional Touchpoints | Variable | City council, school boards, org briefings |

---

## TODO

### Airtable Automation: "Send Quiz Kit Email"
Set up an Airtable automation to send personalized quiz instructions when a Lead is approved.

- **Trigger:** When `Status` field changes to `Approved`
- **Action:** Send email to the Lead's `Email` with:
  - Their personalized **Quiz Link** (formula field: `"https://ai-outreach-leads.netlify.app/quiz.html?ref=" & RECORD_ID()`)
  - Instructions to generate a QR code from the link (e.g., using any free QR code generator)
  - Context on using the quiz at Interactive Booth events to engage visitors and track results back to the Lead
