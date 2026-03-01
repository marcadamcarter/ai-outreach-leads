# ai-outreach-leads

GuardRailNow City Lead Program — volunteer network for local AI safety/risk awareness outreach.

- **Live site**: https://ai-outreach-leads.netlify.app
- **Playbook**: https://marcadamcarter.github.io/ai-outreach-playbook/

---

## TODO

### Airtable Automation: "Send Quiz Kit Email"
Set up an Airtable automation to send personalized quiz instructions when a Lead is approved.

- **Trigger:** When `Status` field changes to `Approved`
- **Action:** Send email to the Lead's `Email` with:
  - Their personalized **Quiz Link** (formula field: `"https://ai-outreach-leads.netlify.app/quiz.html?ref=" & RECORD_ID()`)
  - Instructions to generate a QR code from the link (e.g., using any free QR code generator)
  - Context on using the quiz at Interactive Booth events to engage visitors and track results back to the Lead