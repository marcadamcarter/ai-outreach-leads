# CLAUDE.md — AI Outreach Leads Project Context

## Project Overview
This is the **GuardRailNow City Lead Program** — a volunteer network for local AI safety/risk awareness outreach. The site collects City Lead applications and After-Action Reports (AARs) via Netlify Forms, synced to Airtable.

- **Live site**: https://ai-outreach-leads.netlify.app
- **Repo**: https://github.com/marcadamcarter/ai-outreach-leads
- **Playbook reference**: https://marcadamcarter.github.io/ai-outreach-playbook/

## Design System
The CSS should match **guardrailnow.org** styling. There's a separate `css/` folder with stylesheets. Do NOT replace inline styles — use the existing external CSS structure.

## The 7 Outreach Modes
These are core to the data model. Every AAR should capture which mode was used:

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

## Airtable Schema

### Leads Table
| Field | Type | Notes |
|-------|------|-------|
| Lead ID | Auto-number | e.g., CL-001 |
| First Name | Single line text | |
| Last Name | Single line text | |
| Display Name | Formula | `{Last Name} & ", " & {First Name}` |
| Email | Email | Primary key for AAR linking |
| Phone | Phone | Optional |
| City | Single line text | |
| State | Single select | |
| Shipping Address | Long text | |
| Organization | Single line text | Optional |
| How did you hear about us? | Single select | Social media, Referral, Event, Website, News, Other |
| Why do you want to help? | Long text | |
| Preferred Modes | Multi-select | **NEW** — The 7 modes above |
| LinkedIn | URL | |
| X (Twitter) | Single line text | |
| Other Social | Single line text | |
| Commitment Acknowledged | Checkbox | |
| Social Review Acknowledged | Checkbox | |
| Status | Single select | Applied, Approved, Kit Shipped, Active, Inactive |
| Kit Shipped | Checkbox | |
| Kit Ship Date | Date | |
| Signed Up | Date | Auto-filled |
| Staff Notes | Long text | Internal |
| AARs | Link to AARs | Reverse link |
| Count AARs | Rollup | COUNTA of linked AARs |
| Total Conversations | Rollup | SUM of Conversations |
| Total Flyers | Rollup | SUM of Flyers Distributed |
| Last Event Date | Rollup | MAX of Event Date |
| Modes Used | Rollup | ARRAYJOIN(ARRAYUNIQUE(Outreach Mode)) |

### AARs Table
| Field | Type | Notes |
|-------|------|-------|
| Name | Auto-number | e.g., AAR-001 |
| Lead | Link to Leads | Matched by email |
| Lead ID (from Lead) | Lookup | |
| Email (from Lead) | Lookup | |
| Organization (from Lead) | Lookup | |
| Outreach Mode | Single select | **NEW** — The 7 modes |
| Sponsor Involved | Checkbox | **NEW** |
| Event Name | Single line text | |
| Event Date | Date | |
| Event Type | Single select | Expanded list grouped by mode |
| City | Single line text | |
| State | Single select | |
| Duration (hrs) | Number | |
| Volunteers | Number | |
| Flyers Distributed | Number | |
| Conversations | Number | |
| Conversions | Number | Signups, donations, pledges |
| Conversion Type | Single select | Newsletter, Donation, Pledge, Social follow, Mix, Other |
| Top Questions | Long text | |
| What Worked | Long text | |
| Improvements | Long text | |
| Restock Request | Long text | |
| Photo Link | URL | |
| Run Again? | Single select | Yes definitely, Maybe with changes, No |
| Submitted Date | Date | Auto-filled |
| Staff Notes | Long text | Internal |

---

## Form Updates Needed

### signup.html — Add These Fields

**New section: "Preferred Outreach Modes"** (after "Why do you want to be a City Lead?")
- Checkbox group with all 7 modes
- Field name: `preferred-modes[]` (array for multi-select)
- Include brief descriptions for each mode
- Link to playbook for details

### aar.html — Add These Fields

**New section: "Outreach Mode"** (after email, before Event Details)
- Dropdown: `outreach-mode` (required) — all 7 modes
- Checkbox: `sponsor-involved` — "This activity was sponsor-supported"

**Update: Event Type dropdown**
- Group options by mode using `<optgroup>` tags
- Add new options: House party, Meetup, Book club, City council, School board, Flyer placement, Public demonstration, Social media campaign, Online event

**Update: Conversion Type dropdown**
- Add: "Social follow" option

---

## Netlify Form Field Names → Airtable Mapping

### signup.html
```
first-name → First Name
last-name → Last Name
email → Email
phone → Phone
city → City
state → State
shipping-address → Shipping Address
organization → Organization
referral-source → How did you hear about us?
motivation → Why do you want to help?
preferred-modes[] → Preferred Modes (NEW)
linkedin → LinkedIn
twitter → X (Twitter)
other-social → Other Social
commitment → Commitment Acknowledged
social-review → Social Review Acknowledged
```

### aar.html
```
email → (used to match Lead record)
outreach-mode → Outreach Mode (NEW)
sponsor-involved → Sponsor Involved (NEW)
event-name → Event Name
event-date → Event Date
event-type → Event Type
city → City
state → State
duration → Duration (hrs)
volunteers → Volunteers
flyers → Flyers Distributed
conversations → Conversations
conversions → Conversions
conversion-type → Conversion Type
top-questions → Top Questions
what-worked → What Worked
improvements → Improvements
restock-request → Restock Request
photo-link → Photo Link
run-again → Run Again?
```

---

## Outstanding Tasks

1. [x] Airtable Leads table — structure complete
2. [x] Airtable AARs table — structure complete
3. [x] Airtable linking — Lead ↔ AAR via email lookup
4. [x] Airtable rollups — Count AARs, Total Conversations, etc.
5. [x] **signup.html** — Add "Preferred Modes" checkbox group
6. [x] **aar.html** — Add "Outreach Mode" dropdown + "Sponsor Involved" checkbox
7. [x] **aar.html** — Expand Event Type dropdown with grouped options
8. [x] Netlify → Airtable integration via Netlify Functions (direct API, no Zapier needed)
9. [x] Test form submissions end-to-end — both signup and AAR confirmed working

---

## File Structure
```
ai-outreach-leads/
├── css/
│   └── (stylesheets matching guardrailnow.org)
├── js/
│   └── (form handling scripts)
├── netlify/
│   └── functions/
├── index.html
├── signup.html      ← City Lead application form
├── aar.html         ← After-Action Report form
├── netlify.toml
└── README.md
```

---

## Important Notes
- Preserve existing CSS styling that matches guardrailnow.org
- Forms use Netlify Forms (`data-netlify="true"`)
- Honeypot spam protection (`netlify-honeypot="bot-field"`)
- JavaScript handles form submission UX (success/error messages)