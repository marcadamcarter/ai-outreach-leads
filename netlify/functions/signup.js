/**
 * Netlify Function: signup
 * Receives City Lead sign-up data and creates a record in Airtable Leads table.
 *
 * Environment variables required (set in Netlify dashboard):
 *   AIRTABLE_PAT      — Personal Access Token (starts with "pat...")
 *   AIRTABLE_BASE_ID  — Base ID (starts with "app...")
 */

const AIRTABLE_TABLE = 'Leads';

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

  // preferred-modes[] arrives as repeated keys; FormData flattens to last value,
  // so collect all values from the raw body key array
  const preferredModes = Array.isArray(data['preferred-modes[]'])
    ? data['preferred-modes[]']
    : data['preferred-modes[]']
      ? [data['preferred-modes[]']]
      : [];

  const fields = {
    'First Name':              data.first_name || '',
    'Last Name':               data.last_name || '',
    'Email':                   data.email || '',
    'Phone':                   data.phone || '',
    'City':                    data.city || '',
    'State':                   (data.state || '').toUpperCase(),
    'Organization':            data.organization || '',
    'Shipping Address':        data.shipping_address || '',
    'LinkedIn':                data.linkedin || '',
    'X (Twitter)':             data.twitter || '',
    'Other Social':            data.other_social || '',
    'How did you hear about us?': data.heard_from || '',
    'Why do you want to help?':   data.motivation || '',
    'Preferred Modes':         preferredModes,
    'Commitment Acknowledged': data.commitment === true || data.commitment === 'true',
    'Social Review Acknowledged': data.social_review === true || data.social_review === 'true',
    'Status':                  'Applied',
    'Signed Up':               new Date().toISOString().split('T')[0],
  };

  // Remove empty optional string fields so Airtable doesn't complain
  Object.keys(fields).forEach((k) => {
    if (fields[k] === '') delete fields[k];
  });

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
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
