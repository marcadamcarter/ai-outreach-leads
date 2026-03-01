/**
 * Netlify Function: aar
 * Receives After-Action Report data and creates a record in Airtable AARs table.
 * Links to the Leads table by matching on email.
 *
 * Environment variables required (set in Netlify dashboard):
 *   AIRTABLE_PAT      — Personal Access Token (starts with "pat...")
 *   AIRTABLE_BASE_ID  — Base ID (starts with "app...")
 */

const AIRTABLE_LEADS_TABLE = 'Leads';
const AIRTABLE_AARS_TABLE  = 'AARs';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const baseUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
  const authHeader = { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` };

  // Look up the Lead record by email so we can link the AAR
  let leadRecordId = null;
  try {
    const lookupRes = await fetch(
      `${baseUrl}/${encodeURIComponent(AIRTABLE_LEADS_TABLE)}?filterByFormula=LOWER({Email})="${(data.email || '').toLowerCase()}"&maxRecords=1`,
      { headers: authHeader }
    );
    if (lookupRes.ok) {
      const lookupData = await lookupRes.json();
      if (lookupData.records && lookupData.records.length > 0) {
        leadRecordId = lookupData.records[0].id;
      }
    }
  } catch (err) {
    console.warn('Lead lookup failed, continuing without link:', err);
  }

  const fields = {
    'Outreach Mode':       data['outreach-mode'] || '',
    'Sponsor Involved':    data['sponsor-involved'] === true || data['sponsor-involved'] === 'Yes',
    'Event Name':          data.event_name || '',
    'Event Date':          data.event_date || '',
    'Event Type':          data.event_type || '',
    'City':                data.city || '',
    'State':               (data.state || '').toUpperCase(),
    'Duration (hrs)':      data.duration ? parseFloat(data.duration) : undefined,
    'Volunteers':          data.volunteers ? parseInt(data.volunteers, 10) : undefined,
    'Flyers Distributed':  data.flyers ? parseInt(data.flyers, 10) : undefined,
    'Conversations':       data.conversations ? parseInt(data.conversations, 10) : undefined,
    'Conversions':         data.conversions ? parseInt(data.conversions, 10) : undefined,
    'Conversion Type':     data.conversion_type || '',
    'Top Questions':       data.top_questions || '',
    'What Worked':         data.what_worked || '',
    'Improvements':        data.improvements || '',
    'Restock Request':     data.materials_needed || '',
    'Photo Link':          data.photo_link || '',
    'Run Again?':          data.do_again || '',
    'Submitted Date':      new Date().toISOString().split('T')[0],
  };

  // Link to Lead record if found
  if (leadRecordId) {
    fields['Lead'] = [leadRecordId];
  }

  // Remove undefined/empty optional fields
  Object.keys(fields).forEach((k) => {
    if (fields[k] === undefined || fields[k] === '') delete fields[k];
  });

  try {
    const res = await fetch(
      `${baseUrl}/${encodeURIComponent(AIRTABLE_AARS_TABLE)}`,
      {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Airtable error:', err);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Failed to save to Airtable', detail: err }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
