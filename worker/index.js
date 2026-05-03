/**
 * AirHunt — Duffel API Proxy Worker
 * Deploy this in Cloudflare Workers dashboard (copy-paste the whole file)
 * Then add DUFFEL_TOKEN as a secret in Settings → Variables
 */
export default {
  async fetch(request, env) {

    // Allow all origins (safe since we validate on Duffel's side)
    const corsHeaders = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    // ── Health check ─────────────────────────────────────────
    if (path === '/health') {
      const hasToken = !!env.DUFFEL_TOKEN;
      return json({ status: 'ok', token_configured: hasToken }, 200, corsHeaders);
    }

    // ── Search flights ────────────────────────────────────────
    if (path === '/search' && request.method === 'POST') {
      if (!env.DUFFEL_TOKEN) {
        return json({ error: 'DUFFEL_TOKEN secret not set in Worker' }, 500, corsHeaders);
      }

      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'Invalid JSON body' }, 400, corsHeaders); }

      const { from, to, date, passengers, cabin } = body;
      if (!from || !to || !date) {
        return json({ error: 'Missing: from, to, date' }, 400, corsHeaders);
      }

      const cabinMap = { economy:'economy', premium:'premium_economy', business:'business', first:'first' };
      const paxList  = [];
      for (let i = 0; i < (passengers?.adults   || 1); i++) paxList.push({ type: 'adult' });
      for (let i = 0; i < (passengers?.children || 0); i++) paxList.push({ type: 'child' });
      for (let i = 0; i < (passengers?.infants  || 0); i++) paxList.push({ type: 'infant_without_seat' });

      try {
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
              slices:       [{ origin: from, destination: to, departure_date: date }],
              passengers:   paxList,
              cabin_class:  cabinMap[cabin] || 'economy',
              return_offers: true,
            }
          }),
        });

        const data = await duffelRes.json();

        if (!duffelRes.ok) {
          console.error('Duffel error:', JSON.stringify(data));
          return json({ error: 'Duffel API error', details: data }, duffelRes.status, corsHeaders);
        }

        return json({ offers: data.data?.offers || [] }, 200, corsHeaders);

      } catch (e) {
        console.error('Fetch error:', e.message);
        return json({ error: 'Failed to reach Duffel', message: e.message }, 500, corsHeaders);
      }
    }

    // ── Book a flight ─────────────────────────────────────────
    if (path === '/book' && request.method === 'POST') {
      if (!env.DUFFEL_TOKEN) {
        return json({ error: 'DUFFEL_TOKEN secret not set in Worker' }, 500, corsHeaders);
      }

      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'Invalid JSON body' }, 400, corsHeaders); }

      const { offerId, passengers } = body;
      if (!offerId || !passengers?.length) {
        return json({ error: 'Missing offerId or passengers' }, 400, corsHeaders);
      }

      const duffelHeaders = {
        'Authorization':  `Bearer ${env.DUFFEL_TOKEN}`,
        'Content-Type':   'application/json',
        'Duffel-Version': 'v2',
        'Accept':         'application/json',
      };

      try {
        // ✅ FIX: Step 1 — Fetch the offer to get total_amount and total_currency
        const offerRes = await fetch(`https://api.duffel.com/air/offers/${offerId}`, {
          method: 'GET',
          headers: duffelHeaders,
        });
        const offerData = await offerRes.json();

        if (!offerRes.ok) {
          console.error('Duffel offer fetch error:', JSON.stringify(offerData));
          return json({ error: 'Failed to retrieve offer', details: offerData }, offerRes.status, corsHeaders);
        }

        const { total_amount, total_currency } = offerData.data;

        // ✅ FIX: Step 2 — Use `payments` (plural array) with correct amount + currency
        const duffelRes = await fetch('https://api.duffel.com/air/orders', {
          method: 'POST',
          headers: duffelHeaders,
          body: JSON.stringify({
            data: {
              selected_offers: [offerId],
              passengers,
              payments: [{ type: 'balance', currency: total_currency, amount: total_amount }],
            }
          }),
        });

        const data = await duffelRes.json();

        if (!duffelRes.ok) {
          console.error('Duffel booking error:', JSON.stringify(data));
          return json({ error: 'Booking failed', details: data }, duffelRes.status, corsHeaders);
        }

        return json({ order: data.data }, 200, corsHeaders);

      } catch (e) {
        return json({ error: 'Failed to reach Duffel', message: e.message }, 500, corsHeaders);
      }
    }

    return json({ error: 'Not found', routes: ['/health', '/search', '/book'] }, 404, corsHeaders);
  }
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
