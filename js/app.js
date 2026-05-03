/* ═══════════════════════════════════════════════════════════
   AirHunt — App Logic (matches new HTML structure)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── API CONFIG ────────────────────────────────────────────
  // Your Duffel token lives in the Cloudflare Worker (see /worker/index.js)
  // NEVER paste the token here — GitHub will block your push!
  // After deploying the worker, paste its URL below:
  const API = {
    workerUrl: 'https://airhunt-api.webmasterjamez.workers.dev', // e.g. 'https://airhunt-api.YOUR_NAME.workers.dev'
  };

  const PHP_RATES = {
    EUR:62.5,USD:57.0,GBP:72.0,AED:15.5,SGD:42.0,
    JPY:0.38,KRW:0.043,AUD:37.0,MYR:12.5,THB:1.6,
    HKD:7.3,TWD:1.8,INR:0.69,QAR:15.7,SAR:15.2,CAD:42.0,NZD:34.0,CNY:7.9,
  };
  function toPhp(amount, currency) {
    return Math.round(parseFloat(amount) * (PHP_RATES[currency] || 57.0));
  }

  // ── STATE ─────────────────────────────────────────────────
  const state = {
    fromAirport: null, toAirport: null,
    departDate: '', returnDate: '',
    passengers: { adults:1, children:0, infants:0 },
    cabin: 'economy', tripType: 'roundtrip',
    allFlights: [], filteredFlights: [],
    displayedCount: 0, pageSize: 8, sortBy: 'price',
  };

  // ── HELPERS ───────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  function init() {
    setupNav(); setupTripTabs(); setupAirportSearch();
    setupSwap(); setupPassengers(); setupDates();
    setupSearch(); setupFilters(); setupSort();
    setupModals(); setupLoadMore(); setupRegionTabs();
    renderDeals(); setDefaultDates();
  }

  // ── NAV ───────────────────────────────────────────────────
  function setupNav() {
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive:true });
    nav.classList.toggle('scrolled', window.scrollY > 20);

    const hamburger = $('hamburger');
    const mobileNav = $('mobileNav');
    const backdrop  = $('mobileNavBackdrop');
    const closeBtn  = $('mobileNavClose');

    hamburger.addEventListener('click', () => { mobileNav.classList.add('open'); document.body.style.overflow='hidden'; });
    function closeMobile() { mobileNav.classList.remove('open'); document.body.style.overflow=''; }
    backdrop.addEventListener('click', closeMobile);
    closeBtn.addEventListener('click', closeMobile);
    document.addEventListener('keydown', e => { if (e.key==='Escape') closeMobile(); });
  }

  // ── TRIP TABS ─────────────────────────────────────────────
  function setupTripTabs() {
    $$('.sw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.sw-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.tripType = tab.dataset.trip;
        const retField = $('returnDateField');
        retField.style.opacity = state.tripType==='oneway' ? '0.4' : '1';
        retField.style.pointerEvents = state.tripType==='oneway' ? 'none' : '';
      });
    });
  }

  // ── AIRPORT SEARCH ────────────────────────────────────────
  function setupAirportSearch() {
    setupAirportField('fromInput','fromDropdown','from');
    setupAirportField('toInput','toDropdown','to');
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('#fromField')) closeDropdown('fromDropdown');
      if (!e.target.closest('#toField'))   closeDropdown('toDropdown');
    });
  }

  function setupAirportField(inputId, dropdownId, type) {
    const input    = $(inputId);
    const dropdown = $(dropdownId);
    input.addEventListener('focus',  () => { renderAirportDropdown(dropdown, input.value, type); dropdown.classList.add('open'); });
    input.addEventListener('input',  () => { renderAirportDropdown(dropdown, input.value, type); dropdown.classList.add('open'); });
    input.addEventListener('keydown', e => { if (e.key==='Escape') { closeDropdown(dropdownId); input.blur(); } });
  }

  function renderAirportDropdown(dropdown, query, type) {
    const q = (query||'').toLowerCase().replace(/\s*\([a-z]{3}\)\s*$/,'').trim();
    const POPULAR = ['MNL','SIN','HKG','NRT','DXB','ICN','BKK','KUL','TPE','SYD','LHR','CDG','LAX','DPS','HND','CEB','DVO','GUM','HNL','AKL'];
    const matches = q
      ? AIRPORTS.filter(a =>
          a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q))
      : POPULAR.map(c => AIRPORTS.find(a => a.code===c)).filter(Boolean);

    const hl = (text) => {
      if (!q) return text;
      const i = text.toLowerCase().indexOf(q);
      if (i===-1) return text;
      return text.slice(0,i)+`<mark style="background:rgba(7,112,227,0.12);color:var(--sky);border-radius:2px;padding:0 1px">${text.slice(i,i+q.length)}</mark>`+text.slice(i+q.length);
    };

    const label = q ? `🔍 ${matches.length} result${matches.length!==1?'s':''}` : '⭐ Popular airports';
    if (!matches.length) {
      dropdown.innerHTML = `<div class="dd-section-label">No airports found for "${q}"</div>`;
      return;
    }
    dropdown.innerHTML = `<div class="dd-section-label">${label}</div>`+
      matches.slice(0,10).map(a=>`
        <div class="airport-item" data-code="${a.code}" data-type="${type}">
          <span class="code">${hl(a.code)}</span>
          <div class="info">
            <div class="name">${a.emoji} ${hl(a.city)} — ${a.name}</div>
            <div class="country">${hl(a.country)}</div>
          </div>
        </div>`).join('');

    dropdown.querySelectorAll('.airport-item[data-code]').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        selectAirport(AIRPORTS.find(a=>a.code===item.dataset.code), item.dataset.type);
      });
    });
  }

  function selectAirport(airport, type) {
    if (!airport) return;
    if (type==='from') {
      state.fromAirport = airport;
      $('fromInput').value = `${airport.city} (${airport.code})`;
      closeDropdown('fromDropdown');
      if (!state.toAirport) setTimeout(() => $('toInput').focus(), 60);
    } else {
      state.toAirport = airport;
      $('toInput').value = `${airport.city} (${airport.code})`;
      closeDropdown('toDropdown');
    }
  }

  function closeDropdown(id) { const el=$(id); if(el) el.classList.remove('open'); }

  // ── SWAP ──────────────────────────────────────────────────
  function setupSwap() {
    $('swapBtn').addEventListener('click', () => {
      [state.fromAirport, state.toAirport] = [state.toAirport, state.fromAirport];
      $('fromInput').value = state.fromAirport ? `${state.fromAirport.city} (${state.fromAirport.code})` : '';
      $('toInput').value   = state.toAirport   ? `${state.toAirport.city} (${state.toAirport.code})` : '';
    });
  }

  // ── PASSENGERS ────────────────────────────────────────────
  function setupPassengers() {
    const field    = $('passengersField');
    const dropdown = $('paxDropdown');
    let isOpen = false;

    field.addEventListener('mousedown', e => {
      if (e.target.closest('.pax-btn') || e.target.closest('select') || e.target.id==='paxDone') return;
      e.preventDefault();
      isOpen = !isOpen;
      dropdown.classList.toggle('open', isOpen);
    });
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('#passengersField')) { dropdown.classList.remove('open'); isOpen=false; }
    });
    $$('.pax-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const t=btn.dataset.type, a=btn.dataset.action;
        if (a==='plus') state.passengers[t]++;
        else if (a==='minus' && state.passengers[t]>(t==='adults'?1:0)) state.passengers[t]--;
        updatePaxDisplay();
      });
    });
    $('cabinClass').addEventListener('change', e => { state.cabin=e.target.value; updatePaxDisplay(); });
    $('paxDone').addEventListener('click', () => { dropdown.classList.remove('open'); isOpen=false; });
  }

  function updatePaxDisplay() {
    const {adults,children,infants} = state.passengers;
    $('adultsCount').textContent   = adults;
    $('childrenCount').textContent = children;
    $('infantsCount').textContent  = infants;
    $$('.pax-btn[data-action="minus"]').forEach(b => { b.disabled = state.passengers[b.dataset.type]<=(b.dataset.type==='adults'?1:0); });
    const total = adults+children+infants;
    const parts = [`${adults} adult${adults!==1?'s':''}`];
    if (children) parts.push(`${children} child${children!==1?'ren':''}`);
    if (infants)  parts.push(`${infants} infant${infants!==1?'s':''}`);
    const cabinLabel = {economy:'Economy',premium:'Premium Economy',business:'Business',first:'First Class'};
    $('paxDisplay').textContent = parts.join(', ') + ' · ' + (cabinLabel[state.cabin]||'Economy');
  }

  // ── DATES ─────────────────────────────────────────────────
  function setupDates() {
    $('departDate').addEventListener('change', e => {
      state.departDate = e.target.value;
      if (state.returnDate && state.returnDate < state.departDate) {
        const d = new Date(state.departDate); d.setDate(d.getDate()+7);
        state.returnDate = d.toISOString().split('T')[0];
        $('returnDate').value = state.returnDate;
      }
      $('returnDate').min = state.departDate;
    });
    $('returnDate').addEventListener('change', e => { state.returnDate = e.target.value; });
  }

  function setDefaultDates() {
    const d1 = new Date(); d1.setDate(d1.getDate()+14);
    const d2 = new Date(); d2.setDate(d2.getDate()+21);
    $('departDate').value = d1.toISOString().split('T')[0];
    $('returnDate').value = d2.toISOString().split('T')[0];
    $('returnDate').min   = $('departDate').value;
    state.departDate = $('departDate').value;
    state.returnDate = $('returnDate').value;
  }

  // ── API CALLS (via Cloudflare Worker proxy) ───────────────
  // Token lives in the Worker — never in this file or GitHub!
  async function fetchDuffelFlights(from, to, date, passengers, cabin) {
    if (!API.workerUrl) return null;
    try {
      const res = await fetch(`${API.workerUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, date, passengers, cabin }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.offers || [];
    } catch(e) { console.warn('Search error:', e); return null; }
  }

  function parseDuffelOffer(offer, fromAirport, toAirport) {
    const slice=offer.slices[0], seg0=slice.segments[0], segL=slice.segments.at(-1);
    const stops=slice.segments.length-1;
    const parseIso = iso => { if(!iso) return 120; const h=parseInt((iso.match(/(\d+)H/)||[0,0])[1]); const m=parseInt((iso.match(/(\d+)M/)||[0,0])[1]); return h*60+m; };
    const dmin = parseIso(slice.duration);
    const ac = seg0.marketing_carrier?.iata_code||'??';
    const airline = AIRLINES.find(a=>a.code===ac)||{code:ac,name:seg0.marketing_carrier?.name||ac,emoji:'✈️'};
    return {
      id: offer.id, duffelOffer: offer, airline, source:'live',
      from: seg0.origin?.iata_code||fromAirport?.code,
      to:   segL.destination?.iata_code||toAirport?.code,
      fromCity: fromAirport?.city||'', toCity: toAirport?.city||'',
      depart: seg0.departing_at?.slice(11,16)||'--:--',
      arrive: segL.arriving_at?.slice(11,16)||'--:--',
      duration: formatDuration(dmin), durationMin: dmin, stops,
      via: stops>0 ? slice.segments.slice(0,-1).map(s=>s.destination?.iata_code||'').join(', ') : null,
      price: toPhp(offer.total_amount, offer.total_currency),
      pricePerPax: toPhp(offer.total_amount, offer.total_currency),
      priceChange: '',
      baggage: (()=>{ try{ const b=offer.passengers?.[0]?.baggages?.find(x=>x.type==='checked'); return b?`${b.quantity}x checked`:'Carry-on only'; }catch{return 'Carry-on only';} })(),
      refundable: offer.conditions?.refund_before_departure?.allowed===true,
      seats: offer.available_services?.length||9,
      flightNum: `${ac}${seg0.marketing_carrier_flight_number||''}`,
      class: offer.cabin_class||'economy',
    };
  }

  async function bookDuffelFlight(offerId, passengers) {
    if (!API.workerUrl) return null;
    try {
      const res = await fetch(`${API.workerUrl}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, passengers }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.order || null;
    } catch(e) { return null; }
  }

  // ── SEARCH ────────────────────────────────────────────────
  function setupSearch() {
    $('searchBtn').addEventListener('click', doSearch);
    document.addEventListener('keydown', e=>{
      if (e.key==='Enter'&&(e.target.id==='fromInput'||e.target.id==='toInput')) doSearch();
    });
  }

  async function doSearch() {
    if (!state.fromAirport) { state.fromAirport=AIRPORTS.find(a=>a.code==='MNL'); $('fromInput').value='Manila (MNL)'; }
    if (!state.toAirport)   { state.toAirport=AIRPORTS.find(a=>a.code==='SIN');   $('toInput').value='Singapore (SIN)'; }

    const btn = $('searchBtn');
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Searching...`;

    $('resultsSection').style.display = 'block';
    $('exploreSection').style.display = 'none';
    $('priceCal').style.display = 'block';
    $('resultsList').innerHTML = [1,2,3,4,5].map(()=>'<div class="skeleton skeleton-card"></div>').join('');
    setTimeout(()=>$('priceCal').scrollIntoView({behavior:'smooth',block:'start'}),100);

    let flights = null;
    if (API.workerUrl) {
      const raw = await fetchDuffelFlights(state.fromAirport.code, state.toAirport.code, state.departDate, state.passengers, state.cabin);
      if (raw?.length) {
        flights = raw.map(o=>parseDuffelOffer(o,state.fromAirport,state.toAirport));
        flights.sort((a,b)=>a.price-b.price);
        if (flights[0]) flights[0].badge='cheapest';
        const fi=flights.reduce((b,f,i,arr)=>f.durationMin<arr[b].durationMin?i:b,0);
        flights[fi].badge=flights[fi].badge||'fastest';
        const bi=flights.findIndex(f=>!f.badge);
        if (bi!==-1) flights[bi].badge='best';
      }
    }
    if (!flights) {
      flights = generateFlights(state.fromAirport, state.toAirport, state.departDate, state.passengers.adults+state.passengers.children);
      flights.forEach(f=>{f.source='estimated';});
    }

    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Search`;

    state.allFlights=flights; state.filteredFlights=[...flights]; state.displayedCount=0;
    updateResultsMeta(); setupAirlineFilters(); updatePriceRange();
    renderResults(true); renderCalendar();
  }

  // ── CALENDAR ──────────────────────────────────────────────
  function renderCalendar() {
    const prices = generateCalendarPrices(state.departDate);
    $('calStrip').innerHTML = prices.map((d,i)=>`
      <div class="cal-day ${d.cheapest?'cheapest':''} ${i===0?'selected':''}" data-idx="${i}">
        <div class="cal-date">${d.date.toLocaleDateString('en-PH',{weekday:'short',day:'numeric',month:'short'})}</div>
        <div class="cal-price">${formatPrice(d.price)}</div>
        ${d.cheapest?'<span class="cal-tag">Cheapest</span>':''}
      </div>`).join('');
    $$('.cal-day').forEach(el=>{
      el.addEventListener('click',()=>{
        $$('.cal-day').forEach(d=>d.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
  }

  // ── RESULTS ───────────────────────────────────────────────
  function updateResultsMeta() {
    $('resultsCount').textContent = `${state.filteredFlights.length} flight${state.filteredFlights.length!==1?'s':''} found`;
    $('resultsRoute').textContent = `${state.fromAirport?.city||''} → ${state.toAirport?.city||''} · ${new Date(state.departDate).toLocaleDateString('en-PH',{weekday:'short',day:'numeric',month:'short'})}`;
    if ($('alertRoute')) $('alertRoute').textContent = `${state.fromAirport?.city} → ${state.toAirport?.city}`;
  }

  function renderResults(reset=false) {
    const list=$('resultsList');
    if (reset) { list.innerHTML=''; state.displayedCount=0; }
    const slice = state.filteredFlights.slice(state.displayedCount, state.displayedCount+state.pageSize);
    slice.forEach((f,i)=>{ const card=createFlightCard(f); card.style.animationDelay=`${i*0.04}s`; list.appendChild(card); });
    state.displayedCount += slice.length;
    $('loadMoreWrap').style.display = state.displayedCount<state.filteredFlights.length?'block':'none';
  }

  function createFlightCard(f) {
    const div = document.createElement('div');
    const stopClass = f.stops===0?'direct':f.stops===1?'one':'multi';
    const stopText  = f.stops===0?'Direct':f.stops===1?`1 stop via ${f.via||''}`:f.stops+` stops via ${f.via||''}`;
    const badgeHTML = f.badge?`<div class="card-badge badge-${f.badge}">${f.badge==='cheapest'?'🔥 Cheapest':f.badge==='fastest'?'⚡ Fastest':'⭐ Best value'}</div>`:'';
    const bestClass = f.badge==='best'?'card-best':'';
    const priceDir  = f.priceChange.includes('-')?'down':'up';

    div.className = `flight-card ${bestClass}`;
    div.dataset.id = f.id;
    div.innerHTML = `
      ${badgeHTML}
      <div class="card-airline">
        <div class="card-airline-logo">${f.airline.emoji}</div>
        <div class="card-airline-name">${f.airline.name}</div>
      </div>
      <div class="card-inner">
        <div class="card-top">
          <div class="card-route">
            <div class="route-pt"><div class="route-time">${f.depart}</div><div class="route-code">${f.from}</div></div>
            <div class="route-mid">
              <div class="route-dur">${f.duration}</div>
              <div class="route-line-wrap"><div class="route-dot"></div><div class="route-bar-line"></div><span class="route-plane-icon">✈</span><div class="route-bar-line"></div><div class="route-dot"></div></div>
              <div class="route-stop ${stopClass}">${stopText}</div>
            </div>
            <div class="route-pt"><div class="route-time">${f.arrive}</div><div class="route-code">${f.to}</div></div>
          </div>
        </div>
        <div class="card-bottom">
          <span class="ctag">🧳 ${f.baggage}</span>
          ${f.refundable?'<span class="ctag green">✓ Refundable</span>':''}
          <span class="ctag">💺 ${f.seats} left</span>
          <span class="ctag ${f.source==='live'?'blue':''}">${f.source==='live'?'✓ Live price':'Est. price'}</span>
          ${f.priceChange?`<span class="price-chg ${priceDir}">${f.priceChange} 24h</span>`:''}
        </div>
      </div>
      <div class="card-price">
        <div class="price-amt">${formatPrice(f.price)}</div>
        <div class="price-note">${state.passengers.adults+state.passengers.children} pax · ${f.class}</div>
        <button class="card-book-btn">Select →</button>
      </div>`;

    div.addEventListener('click', ()=>openFlightModal(f));
    div.querySelector('.card-book-btn').addEventListener('click', e=>{ e.stopPropagation(); openFlightModal(f); });
    return div;
  }

  // ── FILTERS ───────────────────────────────────────────────
  function setupAirlineFilters() {
    const airlines = [...new Set(state.allFlights.map(f=>f.airline.name))];
    $('airlineFilters').innerHTML = airlines.map(n=>`
      <label class="check-row">
        <input type="checkbox" class="airline-filter" value="${n}" checked />
        <span class="check-box"></span>${n}
      </label>`).join('');
    $$('.airline-filter').forEach(cb=>cb.addEventListener('change',applyFilters));
  }

  function updatePriceRange() {
    const max = Math.max(...state.allFlights.map(f=>f.price));
    const r=$('priceRange'); r.max=max; r.value=max;
    $('priceMax').textContent=formatPrice(max);
  }

  function setupFilters() {
    $('priceRange').addEventListener('input',e=>{ $('priceMax').textContent=formatPrice(e.target.value); applyFilters(); });
    $$('.stop-filter').forEach(cb=>cb.addEventListener('change',applyFilters));
    $$('.time-chip').forEach(chip=>chip.addEventListener('click',()=>{ chip.classList.toggle('active'); applyFilters(); }));
    $('durationRange').addEventListener('input',e=>{ $('durationMax').textContent=`${e.target.value}h`; applyFilters(); });
    $('clearFilters').addEventListener('click',()=>{
      $$('.stop-filter,.airline-filter').forEach(cb=>cb.checked=true);
      $$('.time-chip').forEach(c=>c.classList.add('active'));
      const max=Math.max(...state.allFlights.map(f=>f.price));
      $('priceRange').value=max; $('priceMax').textContent=formatPrice(max);
      $('durationRange').value=24; $('durationMax').textContent='24h';
      state.filteredFlights=[...state.allFlights]; sortFlights(); renderResults(true); updateResultsMeta();
    });
  }

  function applyFilters() {
    const maxPrice    = Number($('priceRange').value);
    const stops       = [...$$('.stop-filter:checked')].map(c=>Number(c.value));
    const airlines    = [...$$('.airline-filter:checked')].map(c=>c.value);
    const times       = [...$$('.time-chip.active')].map(c=>c.dataset.time);
    const maxDurH     = Number($('durationRange').value);
    state.filteredFlights = state.allFlights.filter(f=>{
      if (f.price>maxPrice) return false;
      if (!stops.includes(f.stops)) return false;
      if (!airlines.includes(f.airline.name)) return false;
      if (f.durationMin>maxDurH*60) return false;
      const h=parseInt(f.depart.split(':')[0]);
      return times.some(t=>{ const [s,e]=t.split('-').map(Number); return h>=s&&h<e; });
    });
    sortFlights(); updateResultsMeta(); renderResults(true);
  }

  // ── SORT ──────────────────────────────────────────────────
  function setupSort() {
    $$('.sort-btn').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.sort-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); state.sortBy=btn.dataset.sort;
      sortFlights(); renderResults(true);
    }));
  }
  function sortFlights() {
    if (state.sortBy==='price')    state.filteredFlights.sort((a,b)=>a.price-b.price);
    else if (state.sortBy==='duration') state.filteredFlights.sort((a,b)=>a.durationMin-b.durationMin);
    else state.filteredFlights.sort((a,b)=>(a.price/1000+a.durationMin/60)-(b.price/1000+b.durationMin/60));
  }

  // ── LOAD MORE ─────────────────────────────────────────────
  function setupLoadMore() {
    $('loadMoreBtn').addEventListener('click',()=>renderResults(false));
  }

  // ── FLIGHT MODAL ──────────────────────────────────────────
  function openFlightModal(f) {
    const content=$('modalContent');
    const isLive=f.source==='live';
    const badge=isLive
      ?'<span class="source-badge live">✓ Live price</span>'
      :'<span class="source-badge est">⚡ Estimated</span>';

    content.innerHTML=`
      <div class="modal-flight-header">
        <div>
          <div style="font-size:12px;color:var(--ink-4);margin-bottom:5px">${f.airline.name} · ${f.flightNum}</div>
          <div class="modal-route">${f.from} → ${f.to}</div>
          <div style="margin-top:8px">${badge}</div>
        </div>
        <div class="modal-price-block">
          <span class="price">${formatPrice(f.price)}</span>
          <span class="sub">total · ${f.class}</span>
        </div>
      </div>

      <div class="segment">
        <div class="seg-airline">${f.airline.emoji} ${f.airline.name} <span style="color:var(--ink-4);font-weight:400;font-size:12px">${f.flightNum}</span></div>
        <div class="seg-flight">
          <div><div class="seg-time">${f.depart}</div><div class="seg-code">${f.from} · ${f.fromCity}</div></div>
          <div class="seg-mid">
            <div class="seg-dur">${f.duration}</div>
            <div style="display:flex;align-items:center;width:120px;gap:4px"><div class="seg-line"></div><span style="font-size:13px">✈</span><div class="seg-line"></div></div>
            <div style="font-size:11px;color:var(--ink-4)">${f.stops===0?'Direct':f.stops+' stop'+(f.stops>1?'s':'')}</div>
          </div>
          <div style="text-align:right"><div class="seg-time">${f.arrive}</div><div class="seg-code">${f.to} · ${f.toCity}</div></div>
        </div>
      </div>
      ${f.via?`<div style="text-align:center;font-size:12px;color:var(--ink-4);padding:4px 0 12px">📍 Via ${f.via}</div>`:''}

      <div class="fare-grid">
        <div class="fare-cell"><div class="fare-label">Baggage</div><div class="fare-val">🧳 ${f.baggage}</div></div>
        <div class="fare-cell"><div class="fare-label">Flexibility</div><div class="fare-val">${f.refundable?'✅ Refundable':'❌ Non-refundable'}</div></div>
        <div class="fare-cell"><div class="fare-label">Seats left</div><div class="fare-val" style="color:${f.seats<4?'var(--red)':'inherit'}">💺 ${f.seats}</div></div>
        <div class="fare-cell"><div class="fare-label">Cabin</div><div class="fare-val">✈ ${f.class}</div></div>
      </div>

      ${isLive ? renderBookingForm(f) : renderAggregatorLinks(f)}
    `;
    if (isLive) wireBookingForm(f);
    $('modalOverlay').classList.add('open');
    document.body.style.overflow='hidden';
  }

  function renderBookingForm(f) {
    const n = state.passengers.adults+state.passengers.children;
    let forms='';
    for(let i=0;i<n;i++){
      const isAdult=i<state.passengers.adults;
      forms+=`<div class="pax-form-row">
          <div class="pax-field"><label>Gender</label><select class="pax-input" data-field="gender"><option value="">Select</option><option value="m">Male</option><option value="f">Female</option></select></div>
          <div class="pax-field"><label>Title</label><select class="pax-input" data-field="title"><option value="">Select</option><option value="mr">Mr</option><option value="ms">Ms</option><option value="mrs">Mrs</option><option value="dr">Dr</option></select></div>
        </div>
        <div class="pax-form-row">
          <div class="pax-field"><label>Email</label><input class="pax-input" type="email" data-field="email" placeholder="your@email.com" ${i>0?'disabled style="opacity:0.4"':''} /></div>
          <div class="pax-field"><label>Phone number</label><input class="pax-input" type="tel" data-field="phone_number" placeholder="+639171234567" ${i>0?'disabled style="opacity:0.4"':''} /></div>
        </div>
      </div>`;
    };
    }
    return `<div class="booking-form-section">
      <h4 class="booking-form-title">✈ Complete your booking</h4>
      <p class="booking-form-sub">Enter passenger details — booking confirmed directly on this site, no redirect.</p>
      ${forms}
      <button class="modal-book-btn" id="confirmBookBtn">Confirm & Book — ${formatPrice(f.price)}</button>
      <div id="bookingStatus"></div>
    </div>`;
  }

  function renderAggregatorLinks(f) {
    const {from,to}=f, date=state.departDate, ret=state.returnDate, adults=state.passengers.adults;
    const isRT=state.tripType==='roundtrip'&&ret;
    const gf=`https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}&hl=en&gl=PH&curr=PHP`;
    const kw=`https://www.kiwi.com/en/search/results/${from}/${to}/${date}${isRT?'/'+ret:''}?adults=${adults}&children=${state.passengers.children}&infants=${state.passengers.infants}&currency=PHP`;
    const ss=`https://www.skyscanner.com.ph/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${date.replace(/-/g,'').slice(2)}/?adults=${adults}&currency=PHP`;
    const airlineMap={
      'PR':`https://www.philippineairlines.com/en/ph/home/book-a-flight?origin=${from}&destination=${to}&departureDate=${date}&adults=${adults}`,
      '5J':`https://book.cebupacificair.com/Search?lang=EN&cur=PHP&org1=${from}&dst1=${to}&dep1=${date}&Adult=${adults}&Child=${state.passengers.children}&Infant=${state.passengers.infants}`,
      'Z2':`https://flights.airasia.com/select?searchType=O&origin=${from}&destination=${to}&departDate=${date}&adult=${adults}&child=${state.passengers.children}&infant=${state.passengers.infants}&currency=PHP`,
      'AK':`https://flights.airasia.com/select?searchType=O&origin=${from}&destination=${to}&departDate=${date}&adult=${adults}&child=${state.passengers.children}&infant=${state.passengers.infants}&currency=PHP`,
      'SQ':`https://www.singaporeair.com/en_UK/ppsclub-krisflyer/plan-and-book/book-a-flight/?dep=${from}&des=${to}&depDate=${date}&pax=${adults}`,
      'EK':`https://www.emirates.com/ph/english/book/fly/?origin=${from}&destination=${to}&journeyType=O&depDate=${date}&adults=${adults}`,
      'CX':`https://www.cathaypacific.com/cx/en_PH/booking/flights.html?origin=${from}&destination=${to}&journeyType=oneWay&departDate=${date}&adults=${adults}`,
    };
    const direct=airlineMap[f.airline.code];
    return `
      ${direct?`<a href="${direct}" target="_blank" rel="noopener" class="modal-book-btn">Book on ${f.airline.name} — ${formatPrice(f.price)}</a>`:''}
      <div class="booking-alts">
        <div class="booking-alts-label">Or compare on:</div>
        <div class="booking-alts-grid">
          <a href="${gf}" target="_blank" rel="noopener" class="alt-book-btn"><span class="alt-logo">🌐</span>Google Flights<span class="alt-arrow">→</span></a>
          <a href="${kw}" target="_blank" rel="noopener" class="alt-book-btn"><span class="alt-logo">🥝</span>Kiwi.com<span class="alt-arrow">→</span></a>
          <a href="${ss}" target="_blank" rel="noopener" class="alt-book-btn"><span class="alt-logo">🔵</span>Skyscanner<span class="alt-arrow">→</span></a>
        </div>
      </div>
      <div class="booking-info" style="margin-top:12px">
        💡 Add a Duffel API token to enable direct booking inside this site.
        <a href="setup.html" style="font-weight:700;color:var(--sky)">Setup guide →</a>
      </div>`;
  }

  function wireBookingForm(f) {
    const btn=$('confirmBookBtn');
    if(!btn) return;
    btn.addEventListener('click', async()=>{
      const forms=document.querySelectorAll('.pax-form');
      const passengers=[]; let valid=true;
      forms.forEach((form,i)=>{
        const g=fn=>form.querySelector(`[data-field="${fn}"]`)?.value?.trim()||'';
        const given=g('given_name'),family=g('family_name'),born=g('born_on'),nat=g('nationality').toUpperCase(),gender=g('gender'),email=g('email'),phone=g('phone_number'),title=g('title');
if(!given||!family||!born||!nat||!gender||!phone){ valid=false; form.style.borderColor='var(--red)'; }
        if(!given||!family||!born||!nat||!gender){ valid=false; form.style.borderColor='var(--red)'; }
        else form.style.borderColor='';
        // ✅ FIXED — grabs the Duffel passenger id from the offer
const duffelPaxId = f.duffelOffer?.passengers?.[i]?.id;
passengers.push({...(duffelPaxId ? {id: duffelPaxId} : {}), type:i<state.passengers.adults?'adult':'child',given_name:given,family_name:family,born_on:born,nationality:nat,gender,...(title?{title}:{}),phone_number:phone,...(email?{email}:{})});
      });
      if(!valid){ $('bookingStatus').innerHTML='<div class="booking-error">Please fill in all required passenger details.</div>'; return; }
      btn.textContent='Booking...'; btn.disabled=true;
      $('bookingStatus').innerHTML='<div class="booking-info">⏳ Confirming with the airline...</div>';
      const order=await bookDuffelFlight(f.id, passengers);
      if(order){
        $('bookingStatus').innerHTML=`<div class="booking-success"><div style="font-size:36px;margin-bottom:10px">🎉</div><h3>Booking confirmed!</h3><p>Reference: <strong>${order.booking_reference||order.id}</strong></p><p>Check your email for full details.</p></div>`;
        btn.style.display='none';
      } else {
        btn.textContent=`Confirm & Book — ${formatPrice(f.price)}`; btn.disabled=false;
        $('bookingStatus').innerHTML='<div class="booking-error">Booking failed. Please try again.</div>';
      }
    });
  }

  // ── MODALS ────────────────────────────────────────────────
  function setupModals() {
    $('modalClose').addEventListener('click', closeFlightModal);
    $('modalOverlay').addEventListener('click', e=>{ if(e.target===$('modalOverlay')) closeFlightModal(); });
    $('alertClose').addEventListener('click', closeAlertModal);
    $('alertOverlay').addEventListener('click', e=>{ if(e.target===$('alertOverlay')) closeAlertModal(); });
    $('setAlertBtn').addEventListener('click',()=>{ $('alertOverlay').classList.add('open'); document.body.style.overflow='hidden'; });
    $('saveAlert').addEventListener('click',()=>{
      const email=$('alertEmail').value;
      if(!email){ $('alertEmail').focus(); return; }
      $('alertModal').innerHTML=`<div style="text-align:center;padding:20px 0"><div style="font-size:48px;margin-bottom:14px">🔔</div><h3 style="font-family:var(--font-display);font-weight:800;font-size:20px;margin-bottom:8px">Alert set!</h3><p style="color:var(--ink-3);font-size:14px;margin-bottom:20px">We'll email <strong>${email}</strong> when fares drop for this route.</p><button class="alert-submit" onclick="document.getElementById('alertOverlay').classList.remove('open');document.body.style.overflow=''">Done</button></div>`;
    });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeFlightModal(); closeAlertModal(); }});
  }
  function closeFlightModal(){ $('modalOverlay').classList.remove('open'); document.body.style.overflow=''; }
  function closeAlertModal(){ $('alertOverlay').classList.remove('open'); document.body.style.overflow=''; }

  // ── DEALS ─────────────────────────────────────────────────
  let dealsRegion='all', dealsShowing=12;

  function renderDeals() {
    const filtered = dealsRegion==='all'
      ? DEALS_DATA
      : DEALS_DATA.filter(d=>d.region===dealsRegion||(dealsRegion==='North America'&&d.region==='South America'));
    const visible=filtered.slice(0,dealsShowing);
    $('dealsGrid').innerHTML=visible.map(d=>`
      <div class="deal-card">
        <div class="deal-img" style="--dc1:${d.colors[0]};--dc2:${d.colors[1]}">
          <span style="position:relative;z-index:1">${d.emoji}</span>
          <div class="deal-disc">-${d.discount}</div>
        </div>
        <div class="deal-body">
          <div class="deal-dest">${d.dest}</div>
          <div class="deal-carrier">From ${d.from} · ${d.airline}</div>
          <div class="deal-price-row">
            <div><div class="deal-price">${formatPrice(d.price)}</div><div class="deal-orig">${formatPrice(d.original)}</div></div>
            <div class="deal-type">one-way</div>
          </div>
        </div>
      </div>`).join('');
    if($('dealsLoadMore')) $('dealsLoadMore').style.display=filtered.length>dealsShowing?'block':'none';
  }

  function setupRegionTabs() {
    $$('.rtab').forEach(tab=>{
      tab.addEventListener('click',()=>{
        $$('.rtab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        dealsRegion=tab.dataset.region; dealsShowing=12; renderDeals();
      });
    });
    const more=$('dealsMoreBtn');
    if(more) more.addEventListener('click',()=>{ dealsShowing+=12; renderDeals(); });
  }

  // ── SPIN KEYFRAME ─────────────────────────────────────────
  const style=document.createElement('style');
  style.textContent='@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', init);
})();
