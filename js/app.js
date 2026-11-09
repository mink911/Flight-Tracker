// AeroTrack Pro - Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Systems
  const engine = new FlightEngine();
  let hud = null;
  let favorites = new Set(JSON.parse(localStorage.getItem('aerotrack_favorites') || '[]'));

  // Initialize Map
  const radarMap = new RadarMap(
    'map',
    (flightId) => selectFlight(flightId, true),
    (airportCode) => openAirportBoard(airportCode)
  );

  // Initialize HUD Canvas
  try {
    hud = new CockpitHUD('hudCanvas');
  } catch (e) {
    console.warn('HUD canvas init error:', e);
  }

  // UI Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const activeFlightsCount = document.getElementById('activeFlightsCount');
  const utcClock = document.getElementById('utcClock');
  const dataSourceBadge = document.getElementById('dataSourceBadge');
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const flightDetailsPanel = document.getElementById('flightDetailsPanel');
  const closeDetailsBtn = document.getElementById('closeDetailsBtn');
  const flightListContainer = document.getElementById('flightListContainer');
  const airportBoardModal = document.getElementById('airportBoardModal');
  const closeAirportBtn = document.getElementById('closeAirportBtn');
  const airportTabDepartures = document.getElementById('airportTabDepartures');
  const airportTabArrivals = document.getElementById('airportTabArrivals');
  const airportBoardTitle = document.getElementById('airportBoardTitle');
  const airportBoardSubtitle = document.getElementById('airportBoardSubtitle');
  const airportBoardTbody = document.getElementById('airportBoardTbody');
  const airportWeatherWidget = document.getElementById('airportWeatherWidget');
  const airportSelectPicker = document.getElementById('airportSelectPicker');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const atcToggleBtn = document.getElementById('atcToggleBtn');
  const followFlightBtn = document.getElementById('followFlightBtn');
  const favoriteToggleBtn = document.getElementById('favoriteToggleBtn');
  const mapThemeSelect = document.getElementById('mapThemeSelect');
  const simSpeedSlider = document.getElementById('simSpeedSlider');
  const simSpeedValue = document.getElementById('simSpeedValue');
  const filterAirlineSelect = document.getElementById('filterAirlineSelect');
  const filterStatusSelect = document.getElementById('filterStatusSelect');
  const altMinInput = document.getElementById('altMinInput');
  const altMaxInput = document.getElementById('altMaxInput');
  const altValueLabel = document.getElementById('altValueLabel');
  const toggleAirportsBtn = document.getElementById('toggleAirportsBtn');
  const weatherRadarBtn = document.getElementById('weatherRadarBtn');
  const cabinHumBtn = document.getElementById('cabinHumBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingOpenSkyUser = document.getElementById('settingOpenSkyUser');
  const settingOpenSkyPass = document.getElementById('settingOpenSkyPass');
  const settingApiEndpoint = document.getElementById('settingApiEndpoint');
  const saveApiSettingsBtn = document.getElementById('saveApiSettingsBtn');
  const spawnFlightBtn = document.getElementById('spawnFlightBtn');
  const spawnModal = document.getElementById('spawnModal');
  const closeSpawnBtn = document.getElementById('closeSpawnBtn');
  const spawnOrigSelect = document.getElementById('spawnOrigSelect');
  const spawnDestSelect = document.getElementById('spawnDestSelect');
  const executeSpawnBtn = document.getElementById('executeSpawnBtn');

  // Load saved credentials from localStorage
  const savedUser = localStorage.getItem('aerotrack_opensky_user') || '';
  const savedPass = localStorage.getItem('aerotrack_opensky_pass') || '';
  const savedEndpoint = localStorage.getItem('aerotrack_api_endpoint') || '/api/live-flights';
  if (settingOpenSkyUser) settingOpenSkyUser.value = savedUser;
  if (settingOpenSkyPass) settingOpenSkyPass.value = savedPass;
  if (settingApiEndpoint) settingApiEndpoint.value = savedEndpoint;
  engine.liveApiEndpoint = savedEndpoint;

  // Populate Spawn Airport Pickers
  if (spawnOrigSelect && spawnDestSelect) {
    AIRPORTS_DATA.forEach(apt => {
      const opt1 = document.createElement('option');
      opt1.value = apt.iata;
      opt1.textContent = `${apt.iata} - ${apt.city}`;
      const opt2 = opt1.cloneNode(true);
      spawnOrigSelect.appendChild(opt1);
      spawnDestSelect.appendChild(opt2);
    });
    spawnOrigSelect.value = 'JFK';
    spawnDestSelect.value = 'LHR';
  }

  let currentAirportCode = 'JFK';
  let currentAirportTab = 'departures';
  let activeFollowFlight = false;

  // 1. Live UTC Clock
  function updateClock() {
    const now = new Date();
    const utcStr = now.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 5)[0] + ' UTC';
    if (utcClock) utcClock.textContent = utcStr;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Populate Airport Select Picker
  if (airportSelectPicker) {
    AIRPORTS_DATA.forEach(apt => {
      const opt = document.createElement('option');
      opt.value = apt.iata;
      opt.textContent = `${apt.iata} - ${apt.city} (${apt.country})`;
      airportSelectPicker.appendChild(opt);
    });
    airportSelectPicker.value = 'JFK';
  }

  // Populate Airline Filter Dropdown
  if (filterAirlineSelect) {
    AIRLINES_DATA.forEach(al => {
      const opt = document.createElement('option');
      opt.value = al.icao;
      opt.textContent = `${al.name} (${al.icao})`;
      filterAirlineSelect.appendChild(opt);
    });
  }

  // 2. Select Flight Handler
  function selectFlight(flightId, panTo = true) {
    const flight = engine.flights.get(flightId);
    if (!flight) return;

    engine.selectedFlightId = flightId;
    radarMap.selectFlight(flightId, panTo);
    if (hud) hud.setFlight(flight);

    window.aviationAudio.playRadarBlip();

    renderFlightDetails(flight);
    if (flightDetailsPanel) {
      flightDetailsPanel.classList.remove('hidden');
      flightDetailsPanel.classList.add('visible');
    }

    updateFavoritesButtonState(flightId);
    renderFlightList();
  }

  // Render Telemetry & Flight Information Details Panel
  function renderFlightDetails(f) {
    document.getElementById('detailFlightNumber').textContent = f.flightNumber || f.callsign;
    document.getElementById('detailCallsign').textContent = f.callsign || f.id;
    document.getElementById('detailAirline').textContent = f.airline || 'Commercial';
    document.getElementById('detailAircraft').textContent = f.aircraft || 'Commercial Jet';
    document.getElementById('detailReg').textContent = f.reg || 'N/A';
    document.getElementById('detailHex').textContent = f.icao24 ? f.icao24.toUpperCase() : 'N/A';

    const squawkElem = document.getElementById('detailSquawk');
    squawkElem.textContent = f.squawk || '1200';
    if (f.squawk === '7700') {
      squawkElem.className = 'val-squawk alert-squawk';
      window.aviationAudio.playCautionAlert();
    } else {
      squawkElem.className = 'val-squawk';
    }

    // Origin & Destination
    const origIata = document.getElementById('detailOrigIata');
    const origCity = document.getElementById('detailOrigCity');
    const destIata = document.getElementById('detailDestIata');
    const destCity = document.getElementById('detailDestCity');

    if (f.origin) {
      origIata.textContent = f.origin.iata;
      origCity.textContent = `${f.origin.city}, ${f.origin.country}`;
    }
    if (f.destination) {
      destIata.textContent = f.destination.iata;
      destCity.textContent = `${f.destination.city}, ${f.destination.country}`;
    }

    // Progress Bar
    const progressPct = Math.min(100, Math.max(0, Math.round((f.progress || 0.5) * 100)));
    document.getElementById('progressBarFill').style.width = progressPct + '%';
    document.getElementById('progressPercentage').textContent = progressPct + '%';
    document.getElementById('detailTotalDist').textContent = (f.totalDistanceNM || 0) + ' NM';
    document.getElementById('detailRemainingDist').textContent = (f.remainingDistanceNM || 0) + ' NM';

    // Live Telemetry Cards
    document.getElementById('detailAltitude').textContent = Math.round(f.altitude).toLocaleString() + ' ft';
    document.getElementById('detailSpeed').textContent = Math.round(f.speed) + ' kts';
    document.getElementById('detailHeading').textContent = Math.round(f.heading) + '°';
    
    const vRateElem = document.getElementById('detailVRate');
    const vRate = f.verticalRate || 0;
    vRateElem.textContent = (vRate > 0 ? '+' : '') + vRate + ' fpm';
    vRateElem.className = 'telemetry-val ' + (vRate > 200 ? 'text-climb' : vRate < -200 ? 'text-descend' : 'text-level');

    document.getElementById('detailCoords').textContent = `${f.lat.toFixed(4)}°, ${f.lon.toFixed(4)}°`;
    document.getElementById('detailStatusBadge').textContent = f.status || 'Cruising';

    // Weather at Destination
    if (f.destination) {
      const wx = engine.getAirportWeather(f.destination);
      if (wx) {
        document.getElementById('detailDestWeather').textContent = `${wx.conditions}, ${wx.tempC}°C (${wx.windSpeed} kts @ ${wx.windDir}°)`;
      }
    }

    // Set Calendar Reminder Link
    const calReminderBtn = document.getElementById('detailCalReminderBtn');
    if (calReminderBtn) {
      calReminderBtn.href = `flight-calendar.html?flight=${encodeURIComponent(f.flightNumber || f.callsign)}`;
    }
  }

  // Update Favorite Toggle Button State
  function updateFavoritesButtonState(flightId) {
    if (!favoriteToggleBtn) return;
    if (favorites.has(flightId)) {
      favoriteToggleBtn.innerHTML = '★ Favorited';
      favoriteToggleBtn.classList.add('active');
    } else {
      favoriteToggleBtn.innerHTML = '☆ Add to Watchlist';
      favoriteToggleBtn.classList.remove('active');
    }
  }

  // Toggle Favorite
  if (favoriteToggleBtn) {
    favoriteToggleBtn.addEventListener('click', () => {
      const fid = engine.selectedFlightId;
      if (!fid) return;
      if (favorites.has(fid)) {
        favorites.delete(fid);
      } else {
        favorites.add(fid);
        window.aviationAudio.playCabinChime();
      }
      localStorage.setItem('aerotrack_favorites', JSON.stringify(Array.from(favorites)));
      updateFavoritesButtonState(fid);
      renderFlightList();
    });
  }

  // Close Flight Details
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', () => {
      flightDetailsPanel.classList.remove('visible');
      flightDetailsPanel.classList.add('hidden');
      engine.selectedFlightId = null;
      radarMap.selectedFlightId = null;
      radarMap.clearTrajectory();
      radarMap.followSelectedFlight = false;
      if (followFlightBtn) followFlightBtn.classList.remove('active');
    });
  }

  // 3. Render Flight List Sidebar
  function renderFlightList() {
    if (!flightListContainer) return;
    const filtered = engine.getFilteredFlights();

    if (activeFlightsCount) {
      activeFlightsCount.textContent = filtered.length;
    }

    // Sort: favorited first, then selected, then flight number
    filtered.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;
      return a.flightNumber.localeCompare(b.flightNumber);
    });

    if (filtered.length === 0) {
      flightListContainer.innerHTML = `
        <div class="empty-state">
          <p>No flights matching current radar filters.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.slice(0, 100).forEach((f) => {
      const isSel = f.id === engine.selectedFlightId;
      const isFav = favorites.has(f.id);
      const isEmergency = f.squawk === '7700';

      html += `
        <div class="flight-card ${isSel ? 'active' : ''} ${isEmergency ? 'emergency-card' : ''}" data-flight-id="${f.id}">
          <div class="card-header">
            <div class="flight-id-wrap">
              <span class="flight-num">${f.flightNumber}</span>
              ${isFav ? '<span class="star-badge">★</span>' : ''}
              ${isEmergency ? '<span class="emergency-badge">SQUAWK 7700</span>' : ''}
            </div>
            <span class="flight-alt" style="color: ${radarMap.getAltitudeColor(f.altitude)}">${Math.round(f.altitude / 100)}00 ft</span>
          </div>
          <div class="card-route">
            <span class="route-apt">${f.origin ? f.origin.iata : '---'}</span>
            <span class="route-arrow">✈</span>
            <span class="route-apt">${f.destination ? f.destination.iata : '---'}</span>
            <span class="route-speed">${Math.round(f.speed)} kts</span>
          </div>
          <div class="card-footer">
            <span class="card-airline">${f.airline}</span>
            <span class="card-aircraft">${f.aircraft ? f.aircraft.split(' ')[0] + ' ' + (f.aircraft.split(' ')[1] || '') : ''}</span>
          </div>
        </div>
      `;
    });

    flightListContainer.innerHTML = html;

    // Attach click events to cards
    flightListContainer.querySelectorAll('.flight-card').forEach(card => {
      card.addEventListener('click', () => {
        const fid = card.getAttribute('data-flight-id');
        selectFlight(fid, true);
      });
    });
  }

  // 4. Airport Departures/Arrivals FIDS Board Modal
  function openAirportBoard(iataCode) {
    currentAirportCode = iataCode || currentAirportCode;
    const fids = engine.getAirportFIDS(currentAirportCode);
    const airport = fids.airport;
    if (!airport) return;

    if (airportSelectPicker) airportSelectPicker.value = airport.iata;

    airportBoardTitle.textContent = `${airport.name} (${airport.iata})`;
    airportBoardSubtitle.textContent = `${airport.city}, ${airport.country} • Elevation: ${airport.elev} ft • Timezone: ${airport.tz}`;

    // Render Weather Widget
    const wx = engine.getAirportWeather(airport);
    if (airportWeatherWidget && wx) {
      airportWeatherWidget.innerHTML = `
        <div class="wx-item"><span class="wx-label">Conditions:</span> <strong>${wx.conditions}</strong></div>
        <div class="wx-item"><span class="wx-label">Temperature:</span> <strong>${wx.tempC}°C / ${wx.tempF}°F</strong></div>
        <div class="wx-item"><span class="wx-label">Wind:</span> <strong>${wx.windDir}° at ${wx.windSpeed} kts</strong></div>
        <div class="wx-item"><span class="wx-label">Altimeter:</span> <strong>${wx.altimeter} inHg</strong></div>
        <div class="wx-metar"><span class="wx-label">METAR:</span> <code>${wx.metar}</code></div>
      `;
    }

    renderFidsTable(fids);
    airportBoardModal.classList.remove('hidden');
    airportBoardModal.classList.add('visible');
    window.aviationAudio.playCabinChime();
  }

  function renderFidsTable(fids) {
    if (!airportBoardTbody) return;
    const isDep = currentAirportTab === 'departures';
    const list = isDep ? fids.departures : fids.arrivals;

    if (list.length === 0) {
      airportBoardTbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No scheduled ${isDep ? 'departures' : 'arrivals'} in current radar fleet.</td></tr>`;
      return;
    }

    let rows = '';
    list.forEach(item => {
      rows += `
        <tr>
          <td><strong>${item.time}</strong></td>
          <td><span class="badge-fnum">${item.flightNumber}</span></td>
          <td>${item.airline}</td>
          <td><strong>${isDep ? item.destination : item.origin}</strong></td>
          <td><span class="gate-box">${item.gate}</span></td>
          <td><span class="fids-status ${item.statusClass}">${item.status}</span></td>
          <td><button class="track-btn" data-fid="${item.flightId}">Track ➔</button></td>
        </tr>
      `;
    });

    airportBoardTbody.innerHTML = rows;

    airportBoardTbody.querySelectorAll('.track-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fid = btn.getAttribute('data-fid');
        airportBoardModal.classList.remove('visible');
        airportBoardModal.classList.add('hidden');
        selectFlight(fid, true);
      });
    });
  }

  // FIDS Tab Switches
  if (airportTabDepartures && airportTabArrivals) {
    airportTabDepartures.addEventListener('click', () => {
      currentAirportTab = 'departures';
      airportTabDepartures.classList.add('active');
      airportTabArrivals.classList.remove('active');
      const fids = engine.getAirportFIDS(currentAirportCode);
      renderFidsTable(fids);
    });

    airportTabArrivals.addEventListener('click', () => {
      currentAirportTab = 'arrivals';
      airportTabArrivals.classList.add('active');
      airportTabDepartures.classList.remove('active');
      const fids = engine.getAirportFIDS(currentAirportCode);
      renderFidsTable(fids);
    });
  }

  if (closeAirportBtn) {
    closeAirportBtn.addEventListener('click', () => {
      airportBoardModal.classList.remove('visible');
      airportBoardModal.classList.add('hidden');
    });
  }

  if (airportSelectPicker) {
    airportSelectPicker.addEventListener('change', (e) => {
      openAirportBoard(e.target.value);
    });
  }

  // 5. Filter Controls Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      engine.filters.search = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
      renderFlightList();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      engine.filters.search = '';
      clearSearchBtn.style.display = 'none';
      renderFlightList();
    });
  }

  if (filterAirlineSelect) {
    filterAirlineSelect.addEventListener('change', (e) => {
      engine.filters.airline = e.target.value;
      renderFlightList();
    });
  }

  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', (e) => {
      engine.filters.status = e.target.value;
      renderFlightList();
    });
  }

  if (altMinInput && altMaxInput) {
    const updateAlt = () => {
      const min = parseInt(altMinInput.value, 10);
      const max = parseInt(altMaxInput.value, 10);
      engine.filters.altitudeRange = [min, max];
      if (altValueLabel) altValueLabel.textContent = `${min.toLocaleString()} - ${max.toLocaleString()} ft`;
      renderFlightList();
    };
    altMinInput.addEventListener('input', updateAlt);
    altMaxInput.addEventListener('input', updateAlt);
  }

  // Map Basemap Selector
  if (mapThemeSelect) {
    mapThemeSelect.addEventListener('change', (e) => {
      radarMap.setTileTheme(e.target.value);
    });
  }

  // Toggle Airport Waypoint Pins
  if (toggleAirportsBtn) {
    let showApts = true;
    toggleAirportsBtn.addEventListener('click', () => {
      showApts = !showApts;
      radarMap.toggleAirports(showApts);
      toggleAirportsBtn.classList.toggle('active', showApts);
    });
  }

  // Toggle Chase Plane Mode
  if (followFlightBtn) {
    followFlightBtn.addEventListener('click', () => {
      activeFollowFlight = !activeFollowFlight;
      radarMap.followSelectedFlight = activeFollowFlight;
      followFlightBtn.classList.toggle('active', activeFollowFlight);
      followFlightBtn.textContent = activeFollowFlight ? '🔒 Chase Camera ON' : '🎯 Chase Camera OFF';
    });
  }

  // Sound FX and ATC Toggles
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      window.aviationAudio.enabled = !window.aviationAudio.enabled;
      soundToggleBtn.classList.toggle('active', window.aviationAudio.enabled);
      soundToggleBtn.textContent = window.aviationAudio.enabled ? '🔊 Audio ON' : '🔇 Audio Muted';
    });
  }

  if (atcToggleBtn) {
    let atcOn = false;
    atcToggleBtn.addEventListener('click', () => {
      atcOn = !atcOn;
      window.aviationAudio.toggleAtcChatter(atcOn);
      atcToggleBtn.classList.toggle('active', atcOn);
      atcToggleBtn.textContent = atcOn ? '📻 ATC Radio LIVE' : '📻 ATC Radio OFF';
    });
  }

  // Simulation Speed Controller
  if (simSpeedSlider && simSpeedValue) {
    simSpeedSlider.addEventListener('input', (e) => {
      const spd = parseInt(e.target.value, 10);
      engine.simSpeedMultiplier = spd;
      simSpeedValue.textContent = spd + 'x';
    });
  }

  // Toggle Live ADS-B Mode vs Simulation
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      const willBeLive = !engine.isLiveMode;
      engine.setMode(willBeLive);
      if (willBeLive) {
        modeToggleBtn.textContent = '📡 LIVE ADS-B';
        modeToggleBtn.classList.add('live-active');
        if (dataSourceBadge) {
          dataSourceBadge.textContent = 'LIVE ADS-B (OPENSKY)';
          dataSourceBadge.className = 'status-badge live';
        }
      } else {
        modeToggleBtn.textContent = '✈ SIMULATION';
        modeToggleBtn.classList.remove('live-active');
        if (dataSourceBadge) {
          dataSourceBadge.textContent = 'SIMULATION FLEET';
          dataSourceBadge.className = 'status-badge sim';
        }
      }
      renderFlightList();
    });
  }

  // Weather Radar Overlay Toggle
  if (weatherRadarBtn) {
    let wxOn = false;
    weatherRadarBtn.addEventListener('click', () => {
      wxOn = !wxOn;
      radarMap.toggleWeatherRadar(wxOn);
      weatherRadarBtn.classList.toggle('active', wxOn);
    });
  }

  // Cabin / Engine Hum Toggle
  if (cabinHumBtn) {
    let humOn = false;
    cabinHumBtn.addEventListener('click', () => {
      humOn = !humOn;
      window.aviationAudio.toggleEngineHum(humOn);
      cabinHumBtn.classList.toggle('active', humOn);
      cabinHumBtn.textContent = humOn ? '✈ Cabin Hum ON' : '✈ Cabin Hum OFF';
    });
  }

  // Settings Modal Handlers
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
      settingsModal.classList.add('visible');
    });
  }
  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('visible');
      settingsModal.classList.add('hidden');
    });
  }
  if (saveApiSettingsBtn) {
    saveApiSettingsBtn.addEventListener('click', () => {
      const u = settingOpenSkyUser.value.trim();
      const p = settingOpenSkyPass.value.trim();
      const ep = settingApiEndpoint.value.trim();
      localStorage.setItem('aerotrack_opensky_user', u);
      localStorage.setItem('aerotrack_opensky_pass', p);
      localStorage.setItem('aerotrack_api_endpoint', ep);
      engine.liveApiEndpoint = ep || '/api/live-flights';
      saveApiSettingsBtn.textContent = '✓ Saved!';
      setTimeout(() => { saveApiSettingsBtn.textContent = 'Save Credentials'; }, 2000);
      window.aviationAudio.playCabinChime();
    });
  }

  // Spawn Custom Flight Modal Handlers
  if (spawnFlightBtn && spawnModal) {
    spawnFlightBtn.addEventListener('click', () => {
      spawnModal.classList.remove('hidden');
      spawnModal.classList.add('visible');
    });
  }
  if (closeSpawnBtn && spawnModal) {
    closeSpawnBtn.addEventListener('click', () => {
      spawnModal.classList.remove('visible');
      spawnModal.classList.add('hidden');
    });
  }
  if (executeSpawnBtn) {
    executeSpawnBtn.addEventListener('click', () => {
      const fnum = document.getElementById('spawnFlightNum').value;
      const aircraft = document.getElementById('spawnAircraft').value;
      const origCode = spawnOrigSelect.value;
      const destCode = spawnDestSelect.value;
      const alt = document.getElementById('spawnAlt').value;
      const spd = document.getElementById('spawnSpeed').value;

      const flight = engine.spawnCustomFlight({
        flightNumber: fnum,
        airlineName: 'Private / Custom',
        origCode,
        destCode,
        aircraft,
        cruiseAlt: alt,
        cruiseSpeed: spd
      });

      spawnModal.classList.remove('visible');
      spawnModal.classList.add('hidden');

      selectFlight(flight.id, true);
      renderFlightList();
      window.aviationAudio.playCabinChime();
    });
  }

  // 6. Main Simulation & Map Update Loop
  let lastTime = performance.now();
  let listRenderCounter = 0;

  function mainLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Advance flight physics in simulation
    if (!engine.isLiveMode) {
      engine.tickSimulation(dt);
    }

    // Refresh active map markers
    const filtered = engine.getFilteredFlights();
    radarMap.updateAircraft(filtered);

    // Update Telemetry Panel if a flight is selected
    if (engine.selectedFlightId) {
      const activeSel = engine.flights.get(engine.selectedFlightId);
      if (activeSel) {
        renderFlightDetails(activeSel);
        if (hud) hud.setFlight(activeSel);
      }
    }

    // Throttle sidebar list re-rendering to every ~1.5 seconds for optimal CPU
    listRenderCounter += dt;
    if (listRenderCounter > 1.5) {
      renderFlightList();
      listRenderCounter = 0;
    }

    requestAnimationFrame(mainLoop);
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settingsModal && settingsModal.classList.contains('visible')) {
        settingsModal.classList.remove('visible');
        settingsModal.classList.add('hidden');
      } else if (spawnModal && spawnModal.classList.contains('visible')) {
        spawnModal.classList.remove('visible');
        spawnModal.classList.add('hidden');
      } else if (airportBoardModal.classList.contains('visible')) {
        airportBoardModal.classList.remove('visible');
        airportBoardModal.classList.add('hidden');
      } else if (flightDetailsPanel.classList.contains('visible')) {
        closeDetailsBtn.click();
      }
    } else if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key.toLowerCase() === 'f' && document.activeElement !== searchInput) {
      if (followFlightBtn) followFlightBtn.click();
    }
  });

  // Start Main Animation Loop
  renderFlightList();
  requestAnimationFrame(mainLoop);
});

