/**
 * AirHunt — Duffel API Proxy Worker
 * 
 * This Cloudflare Worker acts as a secure proxy between your frontend
 * and the Duffel API. Your Duffel token is stored as a Cloudflare
 * secret (environment variable) and is NEVER exposed to the browser.
 * 
 * Deploy: wrangler deploy  (or paste into Cloudflare Workers dashboard)
 * Secret: wrangler secret put DUFFEL_TOKEN  (then paste your token)
 */

export default {
  async fetch(request, env) {

    // ── CORS headers ─────────────────────────────────────────
    // Allow requests from your AirHunt domain only
    const allowedOrigins = [
      'https://airhunt.webmasterjamez.workers.dev',
      'https://airhunt.pages.dev',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age':       '86400',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Route requests ────────────────────────────────────────
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST /search — search for flights
      if (path === '/search' && request.method === 'POST') {
        return await handleSearch(request, env, corsHeaders);
      }

      // POST /book — create a booking
      if (path === '/book' && request.method === 'POST') {
        return await handleBook(request, env, corsHeaders);
      }

      // GET /health — check the worker is running
      if (path === '/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error', message: err.message }, 500, corsHeaders);
    }
  }
};

// ── SEARCH HANDLER ────────────────────────────────────────────
async function handleSearch(request, env, corsHeaders) {
  const body = await request.json();
  const { from, to, date, passengers, cabin } = body;

  // Validate required fields
  if (!from || !to || !date || !passengers) {
    return jsonResponse({ error: 'Missing required fields: from, to, date, passengers' }, 400, corsHeaders);
  }

  const cabinMap = {
    economy: 'economy',
    premium: 'premium_economy',
    business: 'business',
    first: 'first',
  };

  // Build passengers array
  const paxList = [];
  for (let i = 0; i < (passengers.adults   || 1); i++) paxList.push({ type: 'adult' });
  for (let i = 0; i < (passengers.children || 0); i++) paxList.push({ type: 'child' });
  for (let i = 0; i < (passengers.infants  || 0); i++) paxList.push({ type: 'infant_without_seat' });

  const duffelRes = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${env.DUFFEL_TOKEN}`,
      'Content-Type':   'application/json',
      'Duffel-Version': 'v2',
      'Accept':         'application/json',
    },
    body: JSON.stringify({
      data: {
        slices: [{ origin: from, destination: to, departure_date: date }],
        passengers: paxList,
        cabin_class: cabinMap[cabin] || 'economy',
        return_offers: true,
      }
    }),
  });

  if (!duffelRes.ok) {
    const err = await duffelRes.json().catch(() => ({}));
    console.error('Duffel search error:', err);
    return jsonResponse({ error: 'Duffel search failed', details: err }, duffelRes.status, corsHeaders);
  }

  const data = await duffelRes.json();
  return jsonResponse({ offers: data.data?.offers || [] }, 200, corsHeaders);
}

// ── BOOK HANDLER ──────────────────────────────────────────────
async function handleBook(request, env, corsHeaders) {
  const body = await request.json();
  const { offerId, passengers } = body;

  if (!offerId || !passengers?.length) {
    return jsonResponse({ error: 'Missing offerId or passengers' }, 400, corsHeaders);
  }

  const duffelRes = await fetch('https://api.duffel.com/air/orders', {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${env.DUFFEL_TOKEN}`,
      'Content-Type':   'application/json',
      'Duffel-Version': 'v2',
      'Accept':         'application/json',
    },
    body: JSON.stringify({
      data: {
        selected_offers: [offerId],
        passengers,
        payment: { type: 'balance' },
      }
    }),
  });

  if (!duffelRes.ok) {
    const err = await duffelRes.json().catch(() => ({}));
    console.error('Duffel booking error:', err);
    return jsonResponse({ error: 'Booking failed', details: err }, duffelRes.status, corsHeaders);
  }

  const data = await duffelRes.json();
  return jsonResponse({ order: data.data }, 200, corsHeaders);
}

// ── HELPER ────────────────────────────────────────────────────
function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}
