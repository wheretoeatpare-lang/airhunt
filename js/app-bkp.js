// ============================================================
// AirHunt — App Logic
// ============================================================

(function () {
  'use strict';

  // ── STATE ─────────────────────────────────────────────────
  const state = {
    fromAirport: null,
    toAirport: null,
    departDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    cabin: 'economy',
    tripType: 'roundtrip',
    allFlights: [],
    filteredFlights: [],
    displayedCount: 0,
    pageSize: 8,
    sortBy: 'price',
    filters: {
      maxPrice: 999999,
      stops: [0, 1, 2],
      airlines: [],
      departureTimes: ['00-06', '06-12', '12-18', '18-24'],
      maxDuration: 24,
    },
  };

  // ── DOM REFS ──────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    setupNav();
    setupTripTabs();
    setupAirportSearch();
    setupSwap();
    setupPassengers();
    setupDates();
    setupSearch();
    setupFilters();
    setupSortButtons();
    setupModals();
    setupLoadMore();
    renderDeals();
    setupRegionTabs();
    animateChartBars();
    setDefaultDates();
  }

  // ── NAV SCROLL + MOBILE HAMBURGER ────────────────────────
  function setupNav() {
    const nav = document.getElementById('nav');
    const hamburger = $('hamburger');
    const mobileNav = $('mobileNav');
    const mobileNavClose = $('mobileNavClose');
    const mobileNavBackdrop = $('mobileNavBackdrop');

    // Scroll class
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Open drawer
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    // Close drawer
    function closeMobileNav() {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNavBackdrop.addEventListener('click', closeMobileNav);

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  // ── TRIP TABS ─────────────────────────────────────────────
  function setupTripTabs() {
    $$('.trip-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.trip-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.tripType = tab.dataset.trip;
        const returnField = $('returnDateField');
        returnField.style.opacity = state.tripType === 'oneway' ? '0.4' : '1';
        returnField.style.pointerEvents = state.tripType === 'oneway' ? 'none' : '';
      });
    });
  }

  // ── AIRPORT SEARCH ────────────────────────────────────────
  function setupAirportSearch() {
    setupAirportField('fromInput', 'fromDropdown', 'from');
    setupAirportField('toInput', 'toDropdown', 'to');

    // Close dropdowns on outside click
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('#fromField')) closeDropdown('fromDropdown');
      if (!e.target.closest('#toField'))   closeDropdown('toDropdown');
    });
  }

  function setupAirportField(inputId, dropdownId, type) {
    const input    = $(inputId);
    const dropdown = $(dropdownId);

    input.addEventListener('focus', () => {
      renderAirportDropdown(dropdown, input.value, type);
      dropdown.classList.add('open');
    });

    input.addEventListener('input', () => {
      renderAirportDropdown(dropdown, input.value, type);
      dropdown.classList.add('open');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDropdown(dropdownId); input.blur(); }
    });
  }

  function renderAirportDropdown(dropdown, query, type) {
    const q = (query || '').toLowerCase().trim();

    // Strip already-selected value format like "Manila (MNL)" to search by city
    const cleanQ = q.replace(/\s*\([a-z]{3}\)\s*$/, '').trim();

    let matches, sectionLabel;

    if (!cleanQ) {
      // Show popular airports by default when focused
      const popular = ['MNL','SIN','HKG','NRT','DXB','ICN','BKK','KUL','TPE','SYD','LHR','CDG','LAX','DPS','HND'];
      matches = popular.map(code => AIRPORTS.find(a => a.code === code)).filter(Boolean);
      sectionLabel = '⭐ Popular airports';
    } else {
      matches = AIRPORTS.filter(a =>
        a.code.toLowerCase().includes(cleanQ) ||
        a.city.toLowerCase().includes(cleanQ) ||
        a.name.toLowerCase().includes(cleanQ) ||
        a.country.toLowerCase().includes(cleanQ)
      );
      sectionLabel = matches.length ? `🔍 ${matches.length} result${matches.length !== 1 ? 's' : ''}` : null;
    }

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding:16px;text-align:center;color:var(--ink-light);font-size:13px">
          No airports found for "<strong>${cleanQ}</strong>"
        </div>`;
      return;
    }

    const highlight = (text) => {
      if (!cleanQ) return text;
      const idx = text.toLowerCase().indexOf(cleanQ);
      if (idx === -1) return text;
      return text.slice(0, idx) +
        `<mark style="background:rgba(255,85,51,0.15);color:var(--accent);border-radius:3px;padding:0 1px">${text.slice(idx, idx + cleanQ.length)}</mark>` +
        text.slice(idx + cleanQ.length);
    };

    dropdown.innerHTML = `
      <div class="dropdown-section-label">${sectionLabel}</div>
      ${matches.slice(0, 10).map(a => `
        <div class="airport-item" data-code="${a.code}" data-type="${type}">
          <span class="code">${highlight(a.code)}</span>
          <div class="info">
            <div class="name">${a.emoji} ${highlight(a.city)} — ${a.name}</div>
            <div class="country">${highlight(a.country)}</div>
          </div>
        </div>
      `).join('')}
    `;

    // Use mousedown so it fires before the input's blur event
    dropdown.querySelectorAll('.airport-item[data-code]').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault(); // prevent input blur
        const code    = item.dataset.code;
        const airport = AIRPORTS.find(a => a.code === code);
        selectAirport(airport, type);
      });
    });
  }

  function selectAirport(airport, type) {
    if (type === 'from') {
      state.fromAirport = airport;
      $('fromInput').value = `${airport.city} (${airport.code})`;
      closeDropdown('fromDropdown');
      // Auto-focus TO field if empty
      if (!state.toAirport) setTimeout(() => $('toInput').focus(), 50);
    } else {
      state.toAirport = airport;
      $('toInput').value = `${airport.city} (${airport.code})`;
      closeDropdown('toDropdown');
    }
  }

  function closeDropdown(id) {
    const el = $(id);
    if (el) el.classList.remove('open');
  }

  // ── SWAP ─────────────────────────────────────────────────
  function setupSwap() {
    $('swapBtn').addEventListener('click', () => {
      const tmp = state.fromAirport;
      state.fromAirport = state.toAirport;
      state.toAirport = tmp;
      $('fromInput').value = state.fromAirport ? `${state.fromAirport.city} (${state.fromAirport.code})` : '';
      $('toInput').value = state.toAirport ? `${state.toAirport.city} (${state.toAirport.code})` : '';
    });
  }

  // ── PASSENGERS ────────────────────────────────────────────
  function setupPassengers() {
    const field    = $('passengersField');
    const dropdown = $('paxDropdown');
    let isOpen     = false;

    // Toggle on the field div itself (mousedown to match other dropdowns)
    field.addEventListener('mousedown', e => {
      // Let pax-btn, select, done button handle their own events
      if (e.target.closest('.pax-btn') || e.target.closest('select') || e.target.id === 'paxDone') return;
      e.preventDefault(); // prevent any focus shift
      if (isOpen) {
        dropdown.classList.remove('open');
        isOpen = false;
      } else {
        dropdown.classList.add('open');
        isOpen = true;
      }
    });

    // Close when clicking outside
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('#passengersField')) {
        dropdown.classList.remove('open');
        isOpen = false;
      }
    });

    $$('.pax-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type   = btn.dataset.type;
        const action = btn.dataset.action;
        if (action === 'plus') state.passengers[type]++;
        else if (action === 'minus' && state.passengers[type] > (type === 'adults' ? 1 : 0)) state.passengers[type]--;
        updatePaxDisplay();
      });
    });

    $('cabinClass').addEventListener('change', e => {
      state.cabin = e.target.value;
    });

    $('paxDone').addEventListener('click', () => {
      dropdown.classList.remove('open');
      isOpen = false;
    });
  }

  function updatePaxDisplay() {
    const { adults, children, infants } = state.passengers;
    $('adultsCount').textContent = adults;
    $('childrenCount').textContent = children;
    $('infantsCount').textContent = infants;
    const total = adults + children + infants;
    const parts = [`${adults} adult${adults !== 1 ? 's' : ''}`];
    if (children) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    if (infants) parts.push(`${infants} infant${infants !== 1 ? 's' : ''}`);
    $('paxDisplay').textContent = parts.join(', ');

    // Disable minus buttons at min
    $$('.pax-btn[data-action="minus"]').forEach(btn => {
      const type = btn.dataset.type;
      btn.disabled = state.passengers[type] <= (type === 'adults' ? 1 : 0);
    });
  }

  // ── DATES ─────────────────────────────────────────────────
  function setupDates() {
    $('departDate').addEventListener('change', e => {
      state.departDate = e.target.value;
      // Ensure return is after depart
      if (state.returnDate && state.returnDate < state.departDate) {
        const next = new Date(state.departDate);
        next.setDate(next.getDate() + 7);
        state.returnDate = next.toISOString().split('T')[0];
        $('returnDate').value = state.returnDate;
      }
      $('returnDate').min = state.departDate;
    });

    $('returnDate').addEventListener('change', e => {
      state.returnDate = e.target.value;
    });
  }

  function setDefaultDates() {
    const today = new Date();
    const next = new Date();
    const ret = new Date();
    next.setDate(today.getDate() + 14);
    ret.setDate(today.getDate() + 21);
    $('departDate').value = next.toISOString().split('T')[0];
    $('returnDate').value = ret.toISOString().split('T')[0];
    $('returnDate').min = next.toISOString().split('T')[0];
    state.departDate = $('departDate').value;
    state.returnDate = $('returnDate').value;
  }

  // ── AMADEUS CONFIG ────────────────────────────────────────
  // Sign up free at https://developers.amadeus.com
  // Add your keys here after getting them
  const AMADEUS = {
    clientId:     '',   // ← paste your Amadeus API Key here
    clientSecret: '',   // ← paste your Amadeus API Secret here
    token: null,
    tokenExpiry: 0,
  };

  // Exchange rates (approximate) — PHP base
  const PHP_RATES = {
    EUR: 62.5, USD: 57.0, GBP: 72.0, AED: 15.5, SGD: 42.0,
    JPY: 0.38, KRW: 0.043, AUD: 37.0, MYR: 12.5, THB: 1.6,
    HKD: 7.3, TWD: 1.8, INR: 0.69, QAR: 15.7, SAR: 15.2,
    GBP: 72.0, CAD: 42.0, NZD: 34.0, CNY: 7.9,
  };

  function toPhp(amount, currency) {
    const rate = PHP_RATES[currency] || 57.0;
    return Math.round(parseFloat(amount) * rate);
  }

  async function getAmadeusToken() {
    if (!AMADEUS.clientId) return null;
    if (AMADEUS.token && Date.now() < AMADEUS.tokenExpiry) return AMADEUS.token;
    try {
      const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${AMADEUS.clientId}&client_secret=${AMADEUS.clientSecret}`,
      });
      const data = await res.json();
      AMADEUS.token = data.access_token;
      AMADEUS.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return AMADEUS.token;
    } catch (e) {
      console.warn('Amadeus auth failed:', e);
      return null;
    }
  }

  async function fetchAmadeusFlights(from, to, date, adults, cabin) {
    const token = await getAmadeusToken();
    if (!token) return null;

    const cabinMap = { economy: 'ECONOMY', premium: 'PREMIUM_ECONOMY', business: 'BUSINESS', first: 'FIRST' };
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?` +
      `originLocationCode=${from}&destinationLocationCode=${to}` +
      `&departureDate=${date}&adults=${adults}` +
      `&travelClass=${cabinMap[cabin] || 'ECONOMY'}` +
      `&currencyCode=EUR&max=20&nonStop=false`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Amadeus ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch (e) {
      console.warn('Amadeus search failed:', e);
      return null;
    }
  }

  function parseAmadeusOffer(offer, fromAirport, toAirport) {
    const seg0   = offer.itineraries[0].segments[0];
    const segLast = offer.itineraries[0].segments.at(-1);
    const stops  = offer.itineraries[0].segments.length - 1;
    const dur    = offer.itineraries[0].duration; // PT3H30M
    const durationMin = parseDuration(dur);

    const depart = seg0.departure.at.slice(11, 16);
    const arrive = segLast.arrival.at.slice(11, 16);

    const priceEur  = parseFloat(offer.price.grandTotal);
    const pricePhp  = toPhp(priceEur, offer.price.currency || 'EUR');

    const airlineCode = seg0.carrierCode;
    const airline     = AIRLINES.find(a => a.code === airlineCode) || {
      code: airlineCode, name: airlineCode, emoji: '✈️',
    };

    const viaList = stops > 0
      ? offer.itineraries[0].segments.slice(0, -1).map(s => s.arrival.iataCode).join(', ')
      : null;

    return {
      id:          offer.id,
      amadeusOffer: offer,           // keep raw offer for booking
      airline,
      from:        seg0.departure.iataCode,
      to:          segLast.arrival.iataCode,
      fromCity:    fromAirport?.city || seg0.departure.iataCode,
      toCity:      toAirport?.city   || segLast.arrival.iataCode,
      depart,
      arrive,
      duration:    formatDuration(durationMin),
      durationMin,
      stops,
      via:         viaList,
      price:       pricePhp,
      pricePerPax: pricePhp,
      priceChange: '',
      baggage:     getBaggageLabel(offer),
      refundable:  offer.pricingOptions?.refundableFare || false,
      seats:       offer.numberOfBookableSeats || '?',
      flightNum:   `${airlineCode}${seg0.number}`,
      class:       offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Economy',
      source:      'live',
    };
  }

  function parseDuration(iso) { // "PT3H30M" → minutes
    const h = parseInt((iso.match(/(\d+)H/) || [0,0])[1]);
    const m = parseInt((iso.match(/(\d+)M/) || [0,0])[1]);
    return h * 60 + m;
  }

  function getBaggageLabel(offer) {
    try {
      const bags = offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags;
      if (bags?.quantity) return `${bags.quantity}x checked bag`;
      if (bags?.weight)   return `${bags.weight}${bags.weightUnit} checked`;
    } catch {}
    return 'Carry-on only';
  }

  // ── BOOKING LINKS ─────────────────────────────────────────
  // Deep-link URLs that open with the route pre-filled
  function buildBookingLinks(f) {
    const from    = f.from;
    const to      = f.to;
    const date    = state.departDate;          // YYYY-MM-DD
    const ret     = state.returnDate;
    const adults  = state.passengers.adults;
    const isRT    = state.tripType === 'roundtrip' && ret;

    // Google Flights (always works, no API needed)
    const gfDate  = date.replace(/-/g, '');
    const gfRet   = isRT ? ret.replace(/-/g, '') : '';
    const gfType  = isRT ? '1' : '2';  // 1=roundtrip, 2=oneway
    const googleFlights = `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}` +
      `&hl=en&gl=PH&curr=PHP`;

    // Kiwi.com (great for cheapest fares)
    const kiwiRet   = isRT ? `&returnFrom=${to}&returnTo=${from}&returnDepartDate=${ret}&returnArriveDate=${ret}` : '';
    const kiwi = `https://www.kiwi.com/en/search/results/${from}/${to}/${date}${isRT ? '/' + ret : ''}` +
      `?adults=${adults}&children=${state.passengers.children}&infants=${state.passengers.infants}` +
      `&cabinType=economy&currency=PHP`;

    // Skyscanner
    const ssDate  = date.slice(0, 7).replace('-', '');  // YYYYMM
    const skyscanner = `https://www.skyscanner.com.ph/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${date.replace(/-/g,'').slice(2)}` +
      `/?adults=${adults}&currency=PHP`;

    // Airline direct links
    const airlineLinks = {
      'PR': `https://www.philippineairlines.com/en/ph/home/book-a-flight?origin=${from}&destination=${to}&departureDate=${date}&adults=${adults}`,
      '5J': `https://book.cebupacificair.com/Search?lang=EN&cur=PHP&org1=${from}&dst1=${to}&dep1=${date}&Adult=${adults}&Child=${state.passengers.children}&Infant=${state.passengers.infants}`,
      'Z2': `https://flights.airasia.com/select?searchType=O&origin=${from}&destination=${to}&departDate=${date}&adult=${adults}&child=${state.passengers.children}&infant=${state.passengers.infants}&currency=PHP`,
      'AK': `https://flights.airasia.com/select?searchType=O&origin=${from}&destination=${to}&departDate=${date}&adult=${adults}&child=${state.passengers.children}&infant=${state.passengers.infants}&currency=PHP`,
      'SQ': `https://www.singaporeair.com/en_UK/ppsclub-krisflyer/plan-and-book/book-a-flight/?dep=${from}&des=${to}&depDate=${date}&pax=${adults}`,
      'EK': `https://www.emirates.com/ph/english/book/fly/?origin=${from}&destination=${to}&journeyType=O&depDate=${date}&adults=${adults}`,
      'CX': `https://www.cathaypacific.com/cx/en_PH/booking/flights.html?origin=${from}&destination=${to}&journeyType=oneWay&departDate=${date}&adults=${adults}`,
      'QR': `https://www.qatarairways.com/en-ph/homepage.html`,
      'MH': `https://www.malaysiaairlines.com/ph/en/book/book-a-flight.html`,
      'TG': `https://www.thaiairways.com/en_PH/book/search_flight.page`,
      'KE': `https://www.koreanair.com/global/en/booking/booking-seat.html?origin=${from}&destination=${to}&depDate=${date}`,
      'JL': `https://www.jal.co.jp/en/booking/`,
      'NH': `https://www.ana.co.jp/en/ph/`,
      'BA': `https://www.britishairways.com/travel/booking/public/en_ph`,
      'AF': `https://www.airfrance.ph/`,
      'LH': `https://www.lufthansa.com/ph/en/homepage`,
    };

    const airlineDirect = airlineLinks[f.airline.code] || null;

    return { googleFlights, kiwi, skyscanner, airlineDirect };
  }

  // ── SEARCH ────────────────────────────────────────────────
  function setupSearch() {
    $('searchBtn').addEventListener('click', doSearch);
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.target.id === 'fromInput' || e.target.id === 'toInput')) {
        doSearch();
      }
    });
  }

  async function doSearch() {
    // Default airports if not selected
    if (!state.fromAirport) {
      state.fromAirport = AIRPORTS.find(a => a.code === 'MNL');
      $('fromInput').value = 'Manila (MNL)';
    }
    if (!state.toAirport) {
      state.toAirport = AIRPORTS.find(a => a.code === 'SIN');
      $('toInput').value = 'Singapore (SIN)';
    }

    const btn = $('searchBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<span>Hunting prices...</span> <span>⏳</span>';

    $('resultsSection').style.display = 'block';
    $('exploreSection').style.display = 'none';
    $('priceCal').style.display = 'block';
    $('resultsList').innerHTML = [1,2,3,4,5].map(() => '<div class="skeleton skeleton-card"></div>').join('');

    setTimeout(() => {
      $('priceCal').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const from   = state.fromAirport.code;
    const to     = state.toAirport.code;
    const date   = state.departDate;
    const adults = state.passengers.adults;

    let flights = null;

    // Try Amadeus live data if keys are configured
    if (AMADEUS.clientId) {
      try {
        const raw = await fetchAmadeusFlights(from, to, date, adults, state.cabin);
        if (raw && raw.length > 0) {
          flights = raw.map(o => parseAmadeusOffer(o, state.fromAirport, state.toAirport));
          flights.sort((a, b) => a.price - b.price);
          if (flights[0]) flights[0].badge = 'cheapest';
          const fastIdx = flights.reduce((best, f, i, arr) => f.durationMin < arr[best].durationMin ? i : best, 0);
          if (flights[fastIdx]) flights[fastIdx].badge = flights[fastIdx].badge || 'fastest';
          const bestIdx = flights.findIndex((f, i) => !f.badge);
          if (bestIdx !== -1) flights[bestIdx].badge = 'best';
        }
      } catch (e) {
        console.warn('Live search failed, falling back to aggregator links:', e);
      }
    }

    // Fallback: mock data + aggregator booking links
    if (!flights) {
      const totalPax = state.passengers.adults + state.passengers.children;
      flights = generateFlights(state.fromAirport, state.toAirport, date, totalPax);
      flights.forEach(f => { f.source = 'aggregator'; });
    }

    btn.classList.remove('loading');
    btn.innerHTML = '<span>Search flights</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';

    state.allFlights      = flights;
    state.filteredFlights = [...flights];
    state.displayedCount  = 0;

    updateResultsMeta();
    setupAirlineFilters();
    updatePriceRange();
    renderResults(true);
    renderCalendar();
  }

  // ── CALENDAR ─────────────────────────────────────────────
  function renderCalendar() {
    const prices = generateCalendarPrices(state.departDate);
    const strip = $('calStrip');
    strip.innerHTML = prices.map((d, i) => `
      <div class="cal-day ${d.cheapest ? 'cheapest' : ''} ${i === 0 ? 'selected' : ''}" data-idx="${i}">
        <div class="date-label">${d.date.toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
        <div class="cal-price">${formatPrice(d.price)}</div>
        ${d.cheapest ? '<div class="cheapest-tag">Cheapest</div>' : ''}
      </div>
    `).join('');

    strip.querySelectorAll('.cal-day').forEach(el => {
      el.addEventListener('click', () => {
        strip.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
  }

  // ── RESULTS ──────────────────────────────────────────────
  function updateResultsMeta() {
    $('resultsCount').textContent = `${state.filteredFlights.length} flights found`;
    $('resultsRoute').textContent = `${state.fromAirport?.city || 'Manila'} → ${state.toAirport?.city || 'Singapore'} · ${
      new Date(state.departDate).toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short' })}`;
    $('alertRoute').textContent = `${state.fromAirport?.city} → ${state.toAirport?.city}`;
  }

  function renderResults(reset = false) {
    const list = $('resultsList');
    if (reset) {
      list.innerHTML = '';
      state.displayedCount = 0;
    }

    const slice = state.filteredFlights.slice(state.displayedCount, state.displayedCount + state.pageSize);
    slice.forEach((flight, i) => {
      const card = createFlightCard(flight);
      card.style.animationDelay = `${i * 0.05}s`;
      list.appendChild(card);
    });
    state.displayedCount += slice.length;

    const loadWrap = $('loadMoreWrap');
    loadWrap.style.display = state.displayedCount < state.filteredFlights.length ? 'block' : 'none';
  }

  function createFlightCard(f) {
    const div = document.createElement('div');
    div.className = `flight-card ${f.badge === 'best' ? 'best-value' : ''}`;
    div.dataset.id = f.id;

    const stopText = f.stops === 0 ? 'Direct' : f.stops === 1 ? `1 stop · ${f.via}` : `${f.stops} stops · ${f.via}`;
    const stopClass = f.stops === 0 ? 'direct' : f.stops === 1 ? 'one-stop' : '';
    const badgeHTML = f.badge ? `<div class="card-badge ${
      f.badge === 'cheapest' ? 'badge-cheapest' : f.badge === 'fastest' ? 'badge-fastest' : 'badge-best'
    }">${f.badge === 'cheapest' ? '🔥 Cheapest' : f.badge === 'fastest' ? '⚡ Fastest' : '⭐ Best value'}</div>` : '';

    const priceDir = f.priceChange.startsWith('+') ? 'up' : 'down';
    const priceIcon = priceDir === 'up' ? '↑' : '↓';

    div.innerHTML = `
      <div>
        ${badgeHTML}
        <div class="flight-info">
          <div class="airline-logo">${f.airline.emoji}</div>
          <div>
            <div style="font-weight:600;font-size:13px">${f.airline.name}</div>
            <div class="airline-name">${f.flightNum} · ${f.class}</div>
          </div>
          <div class="flight-route">
            <div class="route-point">
              <div class="route-time">${f.depart}</div>
              <div class="route-code">${f.from}</div>
            </div>
            <div class="route-line">
              <div class="route-duration">${f.duration}</div>
              <div class="route-bar"><span class="route-plane">✈</span></div>
              <div class="stop-info ${stopClass}">${stopText}</div>
            </div>
            <div class="route-point">
              <div class="route-time">${f.arrive}</div>
              <div class="route-code">${f.to}</div>
            </div>
          </div>
        </div>
        <div class="card-meta">
          <span class="meta-tag">🧳 ${f.baggage}</span>
          ${f.refundable ? '<span class="meta-tag green">✓ Refundable</span>' : '<span class="meta-tag">Non-refundable</span>'}
          <span class="meta-tag">💺 ${f.seats} seat${f.seats !== 1 ? 's' : ''} left</span>
          <span class="meta-tag price-${priceDir}">${priceIcon} ${f.priceChange} in 24h</span>
        </div>
      </div>
      <div class="card-right">
        <div class="flight-price">${formatPrice(f.price)}<span class="price-per">/pax</span></div>
        <button class="book-btn" onclick="event.stopPropagation()">Book now →</button>
      </div>
    `;

    div.addEventListener('click', () => openFlightModal(f));
    div.querySelector('.book-btn').addEventListener('click', e => {
      e.stopPropagation();
      // Open Google Flights directly from card button — fastest path to booking
      const links = buildBookingLinks(f);
      window.open(links.airlineDirect || links.googleFlights, '_blank', 'noopener');
    });
    return div;
  }

  // ── FILTERS ──────────────────────────────────────────────
  function setupAirlineFilters() {
    const airlines = [...new Set(state.allFlights.map(f => f.airline.name))];
    state.filters.airlines = airlines;
    const container = $('airlineFilters');
    container.innerHTML = airlines.map(name => `
      <label class="check-label">
        <input type="checkbox" class="airline-filter" value="${name}" checked />
        ${name}
      </label>
    `).join('');
    $$('.airline-filter').forEach(cb => {
      cb.addEventListener('change', applyFilters);
    });
  }

  function updatePriceRange() {
    const max = Math.max(...state.allFlights.map(f => f.price));
    const range = $('priceRange');
    range.max = max;
    range.value = max;
    $('priceMax').textContent = formatPrice(max);
    state.filters.maxPrice = max;
  }

  function setupFilters() {
    $('priceRange').addEventListener('input', e => {
      state.filters.maxPrice = Number(e.target.value);
      $('priceMax').textContent = formatPrice(state.filters.maxPrice);
      applyFilters();
    });

    $$('.stop-filter').forEach(cb => {
      cb.addEventListener('change', () => {
        state.filters.stops = [...$$('.stop-filter:checked')].map(c => Number(c.value));
        applyFilters();
      });
    });

    $$('.time-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        state.filters.departureTimes = [...$$('.time-chip.active')].map(c => c.dataset.time);
        applyFilters();
      });
    });

    $('durationRange').addEventListener('input', e => {
      state.filters.maxDuration = Number(e.target.value);
      $('durationMax').textContent = `${state.filters.maxDuration}h`;
      applyFilters();
    });

    $('clearFilters').addEventListener('click', () => {
      // Reset all filter controls
      $$('.stop-filter').forEach(cb => cb.checked = true);
      $$('.airline-filter').forEach(cb => cb.checked = true);
      $$('.time-chip').forEach(c => c.classList.add('active'));
      const maxP = Math.max(...state.allFlights.map(f => f.price));
      $('priceRange').value = maxP;
      $('priceMax').textContent = formatPrice(maxP);
      $('durationRange').value = 24;
      $('durationMax').textContent = '24h';
      state.filters = {
        maxPrice: maxP,
        stops: [0, 1, 2],
        airlines: state.allFlights.map(f => f.airline.name),
        departureTimes: ['00-06', '06-12', '12-18', '18-24'],
        maxDuration: 24,
      };
      applyFilters();
    });
  }

  function applyFilters() {
    const selectedAirlines = [...$$('.airline-filter:checked')].map(c => c.value);

    state.filteredFlights = state.allFlights.filter(f => {
      if (f.price > state.filters.maxPrice) return false;
      if (!state.filters.stops.includes(f.stops)) return false;
      if (!selectedAirlines.includes(f.airline.name)) return false;
      if (f.durationMin > state.filters.maxDuration * 60) return false;
      const [h] = f.depart.split(':').map(Number);
      const inTime = state.filters.departureTimes.some(range => {
        const [s, e] = range.split('-').map(Number);
        return h >= s && h < e;
      });
      if (!inTime) return false;
      return true;
    });

    sortFlights();
    updateResultsMeta();
    renderResults(true);
  }

  // ── SORT ─────────────────────────────────────────────────
  function setupSortButtons() {
    $$('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.sortBy = btn.dataset.sort;
        sortFlights();
        renderResults(true);
      });
    });
  }

  function sortFlights() {
    if (state.sortBy === 'price') {
      state.filteredFlights.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'duration') {
      state.filteredFlights.sort((a, b) => a.durationMin - b.durationMin);
    } else {
      // "Best" = balance of price and duration
      state.filteredFlights.sort((a, b) => {
        const scoreA = a.price / 1000 + a.durationMin / 60;
        const scoreB = b.price / 1000 + b.durationMin / 60;
        return scoreA - scoreB;
      });
    }
  }

  // ── LOAD MORE ────────────────────────────────────────────
  function setupLoadMore() {
    $('loadMoreBtn').addEventListener('click', () => {
      renderResults(false);
    });
  }

  // ── FLIGHT MODAL ─────────────────────────────────────────
  function openFlightModal(f) {
    const overlay = $('modalOverlay');
    const content = $('modalContent');
    const links   = buildBookingLinks(f);
    const isLive  = f.source === 'live';

    const sourceBadge = isLive
      ? `<span style="background:rgba(0,196,106,0.1);color:var(--green);font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px">✓ Live price</span>`
      : `<span style="background:rgba(255,136,0,0.1);color:var(--accent-2);font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px">⚡ Estimated price</span>`;

    content.innerHTML = `
      <div class="modal-flight-header">
        <div>
          <div style="font-size:13px;color:var(--ink-muted);margin-bottom:6px">${f.airline.name} · ${f.flightNum}</div>
          <div class="modal-route">${f.from} → ${f.to}</div>
          <div style="margin-top:8px">${sourceBadge}</div>
        </div>
        <div class="modal-price-block">
          <span class="price">${formatPrice(f.price)}</span>
          <span class="sub">per person · ${f.class}</span>
        </div>
      </div>

      <h4 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink-muted);margin-bottom:12px">Flight details</h4>

      <div class="segment">
        <div class="seg-airline">${f.airline.emoji} ${f.airline.name} <span style="color:var(--ink-light);font-weight:400">${f.flightNum}</span></div>
        <div class="seg-flight">
          <div>
            <div class="seg-time">${f.depart}</div>
            <div class="seg-code">${f.from} · ${f.fromCity}</div>
          </div>
          <div class="seg-line"></div>
          <div style="text-align:center">
            <div style="font-size:12px;color:var(--ink-muted)">${f.duration}</div>
            <div style="font-size:12px;color:var(--ink-muted)">${f.stops === 0 ? '✈ Direct' : f.stops + ' stop' + (f.stops > 1 ? 's' : '')}</div>
          </div>
          <div class="seg-line"></div>
          <div style="text-align:right">
            <div class="seg-time">${f.arrive}</div>
            <div class="seg-code">${f.to} · ${f.toCity}</div>
          </div>
        </div>
      </div>

      ${f.via ? `<div style="text-align:center;font-size:13px;color:var(--ink-muted);padding:8px 0">📍 Stopover: ${f.via}</div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0">
        <div style="background:var(--surface-2);border-radius:10px;padding:14px">
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Baggage</div>
          <div style="font-weight:600;font-size:15px;margin-top:4px">🧳 ${f.baggage}</div>
        </div>
        <div style="background:var(--surface-2);border-radius:10px;padding:14px">
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Flexibility</div>
          <div style="font-weight:600;font-size:15px;margin-top:4px">${f.refundable ? '✅ Refundable' : '❌ Non-refundable'}</div>
        </div>
        <div style="background:var(--surface-2);border-radius:10px;padding:14px">
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Seats left</div>
          <div style="font-weight:600;font-size:15px;margin-top:4px;color:${f.seats < 4 ? 'var(--accent)' : 'inherit'}">💺 ${f.seats} seat${f.seats > 1 ? 's' : ''}</div>
        </div>
        <div style="background:var(--surface-2);border-radius:10px;padding:14px">
          <div style="font-size:11px;color:var(--ink-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Cabin</div>
          <div style="font-weight:600;font-size:15px;margin-top:4px">✈ ${f.class}</div>
        </div>
      </div>

      <!-- Book on airline directly -->
      ${links.airlineDirect ? `
        <a href="${links.airlineDirect}" target="_blank" rel="noopener" class="modal-book-btn">
          Book on ${f.airline.name} — ${formatPrice(f.price)}
        </a>
      ` : ''}

      <!-- Compare on aggregators -->
      <div class="booking-alts">
        <p class="booking-alts-label">Or compare on:</p>
        <div class="booking-alts-grid">
          <a href="${links.googleFlights}" target="_blank" rel="noopener" class="alt-book-btn">
            <span class="alt-logo">🌐</span>
            <span>Google Flights</span>
            <span class="alt-arrow">→</span>
          </a>
          <a href="${links.kiwi}" target="_blank" rel="noopener" class="alt-book-btn">
            <span class="alt-logo">🥝</span>
            <span>Kiwi.com</span>
            <span class="alt-arrow">→</span>
          </a>
          <a href="${links.skyscanner}" target="_blank" rel="noopener" class="alt-book-btn">
            <span class="alt-logo">🔵</span>
            <span>Skyscanner</span>
            <span class="alt-arrow">→</span>
          </a>
        </div>
      </div>

      <div style="background:var(--blue-light);border-radius:10px;padding:12px 14px;font-size:12px;color:var(--blue);display:flex;gap:8px;align-items:flex-start;margin-top:12px">
        <span style="flex-shrink:0">💡</span>
        <span>${isLive
          ? 'This is a live fare from Amadeus. Final price is confirmed at checkout on the airline\'s site.'
          : 'Price is an estimate. Click any booking option above to see exact fares and complete your booking.'
        }</span>
      </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // ── MODALS ────────────────────────────────────────────────
  function setupModals() {
    // Flight modal
    $('modalClose').addEventListener('click', closeFlightModal);
    $('modalOverlay').addEventListener('click', e => {
      if (e.target === $('modalOverlay')) closeFlightModal();
    });

    // Alert modal
    $('setAlertBtn').addEventListener('click', () => {
      $('alertOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    $('alertClose').addEventListener('click', closeAlertModal);
    $('alertOverlay').addEventListener('click', e => {
      if (e.target === $('alertOverlay')) closeAlertModal();
    });

    $('saveAlert').addEventListener('click', () => {
      const email = $('alertEmail').value;
      const target = $('alertTarget').value;
      if (!email) { $('alertEmail').focus(); return; }
      $('alertModal').innerHTML = `
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:56px;margin-bottom:16px">🔔</div>
          <h3>Alert set!</h3>
          <p style="margin-top:8px">We'll email <strong>${email}</strong> the moment prices drop${target ? ` below ₱${Number(target).toLocaleString()}` : ''} for this route.</p>
          <button class="btn-primary" style="margin-top:20px" onclick="document.getElementById('alertOverlay').classList.remove('open');document.body.style.overflow=''">Done</button>
        </div>
      `;
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeFlightModal(); closeAlertModal(); }
    });
  }

  function closeFlightModal() {
    $('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAlertModal() {
    $('alertOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── DEALS ─────────────────────────────────────────────────
  let dealsRegion = 'all';
  let dealsShowing = 12;

  function renderDeals() {
    const grid = $('dealsGrid');
    const filtered = dealsRegion === 'all'
      ? DEALS_DATA
      : DEALS_DATA.filter(d =>
          d.region === dealsRegion ||
          // "North America" tab also shows South America
          (dealsRegion === 'North America' && d.region === 'South America')
        );

    const visible = filtered.slice(0, dealsShowing);

    grid.innerHTML = visible.map(d => `
      <div class="deal-card" onclick="void(0)">
        <div class="deal-img" style="--c1:${d.colors[0]};--c2:${d.colors[1]}">
          <span style="position:relative;z-index:1">${d.emoji}</span>
          <div class="deal-discount">-${d.discount}</div>
        </div>
        <div class="deal-body">
          <div class="deal-dest">${d.dest}</div>
          <div class="deal-from">From ${d.from} · ${d.airline}</div>
          <div class="deal-price-row">
            <div>
              <div class="deal-price">${formatPrice(d.price)}</div>
              <div class="deal-original">${formatPrice(d.original)}</div>
            </div>
            <span style="font-size:12px;color:var(--ink-muted)">one-way</span>
          </div>
        </div>
      </div>
    `).join('');

    // Show/hide load more
    const loadMoreWrap = $('dealsLoadMore');
    if (loadMoreWrap) {
      loadMoreWrap.style.display = filtered.length > dealsShowing ? 'block' : 'none';
    }
  }

  function setupRegionTabs() {
    $$('.region-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.region-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        dealsRegion = tab.dataset.region;
        dealsShowing = 12;
        renderDeals();
      });
    });

    const moreBtn = $('dealsMoreBtn');
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        dealsShowing += 12;
        renderDeals();
      });
    }
  }

  // ── CHART ANIMATION ───────────────────────────────────────
  function animateChartBars() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.chart-bar').forEach((bar, i) => {
            bar.style.transition = `height 0.6s ease ${i * 0.08}s`;
          });
        }
      });
    }, { threshold: 0.3 });

    const chart = document.querySelector('.chart-mock');
    if (chart) observer.observe(chart);
  }

  // ── BOOT ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

})();
