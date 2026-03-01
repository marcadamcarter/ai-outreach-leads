/**
 * Netlify Function: quiz
 * Receives quiz results and creates a record in Airtable "Quiz Results" table.
 * Links to the Leads table via ?ref= URL param (Lead record ID) or email fallback.
 *
 * Environment variables required (set in Netlify dashboard):
 *   AIRTABLE_PAT      — Personal Access Token (starts with "pat...")
 *   AIRTABLE_BASE_ID  — Base ID (starts with "app...")
 */

const AIRTABLE_LEADS_TABLE = 'Leads';
const AIRTABLE_QUIZ_TABLE  = 'Quiz Results';

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

  // Link to Lead: use ref param (record ID) if provided, else try email lookup
  let leadRecordId = data.leadRef || null;
  if (!leadRecordId) {
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
  }

  const fields = {
    'Email':            data.email || '',
    'Score':            typeof data.score === 'number' ? data.score : parseInt(data.score, 10),
    'Total Questions':  typeof data.totalQuestions === 'number' ? data.totalQuestions : parseInt(data.totalQuestions, 10),
    'Tier':             data.tier || '',
    'Answers':          data.answers || '',
    'T-Shirt Qualified': data.tshirtQualified === true,
    'Submitted Date':   new Date().toISOString().split('T')[0],
  };

  if (leadRecordId) {
    fields['Lead'] = [leadRecordId];
  }

  // Remove empty optional fields
  Object.keys(fields).forEach((k) => {
    if (fields[k] === undefined || fields[k] === '') delete fields[k];
  });

  try {
    const res = await fetch(
      `${baseUrl}/${encodeURIComponent(AIRTABLE_QUIZ_TABLE)}`,
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
