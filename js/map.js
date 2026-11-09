// AeroTrack Pro - Leaflet Radar Map Engine

class RadarMap {
  constructor(containerId, onSelectFlight, onSelectAirport) {
    this.containerId = containerId;
    this.onSelectFlight = onSelectFlight;
    this.onSelectAirport = onSelectAirport;
    this.map = null;
    this.planeMarkers = new Map();
    this.airportMarkers = new Map();
    this.flightPathLayer = null;
    this.trailLayer = null;
    this.terminatorLayer = null;
    this.weatherRadarLayer = null;
    this.showWeatherRadar = false;
    this.selectedFlightId = null;
    this.followSelectedFlight = false;
    this.showAirports = true;
    this.currentTileLayer = null;

    this.initMap();
    this.initRainViewerRadar();
  }

  initMap() {
    // Initial map centered over Atlantic/Europe/US corridor
    this.map = L.map(this.containerId, {
      center: [30, -20],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true
    });

    // Custom positioned zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Map Tile Layers
    this.tileLayers = {
      radarDark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 18
      }),
      radarLight: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      })
    };

    this.currentTileLayer = this.tileLayers.radarDark;
    this.currentTileLayer.addTo(this.map);

    // Path & Trail layer groups
    this.flightPathLayer = L.layerGroup().addTo(this.map);
    this.trailLayer = L.layerGroup().addTo(this.map);
    this.airportLayer = L.layerGroup().addTo(this.map);

    this.renderAirports();
    this.updateDayNightTerminator();

    // Map click clears selection if clicked on ocean/land
    this.map.on('click', (e) => {
      if (e.originalEvent.target.classList.contains('leaflet-container')) {
        // Did not click marker
      }
    });
  }

  // Initialize Free Live Doppler Weather Radar (RainViewer)
  async initRainViewerRadar() {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.radar || !data.radar.past || data.radar.past.length === 0) return;

      const latestRadar = data.radar.past[data.radar.past.length - 1];
      const host = data.host || 'https://tilecache.rainviewer.com';
      const path = latestRadar.path;

      // Color scheme 2 = Universal radar color scheme, smooth=1, snow=1
      const weatherUrl = `${host}${path}/512/{z}/{x}/{y}/2/1_1.png`;
      this.weatherRadarLayer = L.tileLayer(weatherUrl, {
        opacity: 0.55,
        zIndex: 200,
        attribution: '&copy; RainViewer Doppler Radar'
      });

      if (this.showWeatherRadar && this.weatherRadarLayer) {
        this.weatherRadarLayer.addTo(this.map);
      }
    } catch (e) {
      console.warn('Weather radar overlay offline:', e.message);
    }
  }

  toggleWeatherRadar(show) {
    this.showWeatherRadar = show;
    if (!this.weatherRadarLayer) {
      if (show) this.initRainViewerRadar();
      return;
    }
    if (show) {
      this.weatherRadarLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.weatherRadarLayer);
    }
  }
  setTileTheme(themeName) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[themeName] || this.tileLayers.radarDark;
    this.currentTileLayer.addTo(this.map);
  }

  // Get color gradient based on altitude
  getAltitudeColor(alt) {
    if (alt <= 5000) return '#10b981'; // Green (Low/Approach)
    if (alt <= 18000) return '#fbbf24'; // Amber (Transition)
    if (alt <= 34000) return '#00d2ff'; // Cyan (Cruise)
    return '#a855f7'; // Purple/Magenta (High Cruise Flight Level)
  }

  // Build SVG Aircraft Marker with Heading Rotation
  createAircraftIcon(flight, isSelected) {
    const color = this.getAltitudeColor(flight.altitude);
    const rotation = flight.heading || 0;
    const isEmergency = flight.squawk === '7700';
    const markerColor = isEmergency ? '#ef4444' : color;
    const size = isSelected ? 34 : 26;

    const svgHtml = `
      <div class="aircraft-marker-wrapper ${isSelected ? 'selected' : ''} ${isEmergency ? 'squawk-emergency' : ''}" style="transform: rotate(${rotation}deg);">
        ${isSelected ? '<div class="radar-pulse-ring"></div>' : ''}
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${markerColor}" class="aircraft-svg">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      <div class="aircraft-label ${isSelected ? 'active' : ''}">
        <span class="callsign">${flight.callsign || flight.flightNumber}</span>
        <span class="alt">${Math.round(flight.altitude / 100)}FL</span>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-plane-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  // Update or render aircraft on map
  updateAircraft(flights) {
    const activeIds = new Set();

    flights.forEach((f) => {
      activeIds.add(f.id);
      const isSelected = f.id === this.selectedFlightId;
      const icon = this.createAircraftIcon(f, isSelected);

      if (this.planeMarkers.has(f.id)) {
        const marker = this.planeMarkers.get(f.id);
        marker.setLatLng([f.lat, f.lon]);
        marker.setIcon(icon);
        marker.setZIndexOffset(isSelected ? 1000 : 100);
      } else {
        const marker = L.marker([f.lat, f.lon], {
          icon: icon,
          zIndexOffset: isSelected ? 1000 : 100
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (this.onSelectFlight) this.onSelectFlight(f.id);
        });

        marker.addTo(this.map);
        this.planeMarkers.set(f.id, marker);
      }

      // If chase plane mode enabled, follow camera
      if (isSelected && this.followSelectedFlight) {
        this.map.panTo([f.lat, f.lon], { animate: true, duration: 0.8 });
      }
    });

    // Remove markers that are no longer active
    for (const [id, marker] of this.planeMarkers.entries()) {
      if (!activeIds.has(id)) {
        this.map.removeLayer(marker);
        this.planeMarkers.delete(id);
      }
    }

    // Refresh flight path for selected flight
    if (this.selectedFlightId) {
      const selectedFlight = flights.find(f => f.id === this.selectedFlightId);
      if (selectedFlight) {
        this.drawFlightTrajectory(selectedFlight);
      }
    }
  }

  // Draw Great Circle trajectory path and historical breadcrumbs trail
  drawFlightTrajectory(flight) {
    this.flightPathLayer.clearLayers();
    this.trailLayer.clearLayers();

    if (!flight || !flight.origin || !flight.destination) return;

    // Draw past breadcrumb trail
    if (flight.trail && flight.trail.length > 1) {
      const latlngs = flight.trail.map(p => [p.lat, p.lon]);
      latlngs.push([flight.lat, flight.lon]);
      const trailPoly = L.polyline(latlngs, {
        color: '#00e5ff',
        weight: 3,
        opacity: 0.7,
        dashArray: '4, 4'
      });
      this.trailLayer.addLayer(trailPoly);
    }

    // Generate Great Circle arc points (60 intermediate samples)
    // Handle Anti-Meridian crossing by segmenting if longitude jump > 180 deg
    const segments = [[]];
    const samples = 60;
    let prevLon = null;

    for (let i = 0; i <= samples; i++) {
      const fraction = i / samples;
      const pt = GeoMath.intermediatePoint(flight.origin.lat, flight.origin.lon, flight.destination.lat, flight.destination.lon, fraction);
      
      if (prevLon !== null && Math.abs(pt.lon - prevLon) > 180) {
        // Start a new continuous line segment across dateline
        segments.push([]);
      }
      segments[segments.length - 1].push([pt.lat, pt.lon]);
      prevLon = pt.lon;
    }

    // Projected future route segments
    segments.forEach(seg => {
      if (seg.length > 1) {
        const routePoly = L.polyline(seg, {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round'
        });
        this.flightPathLayer.addLayer(routePoly);
      }
    });

    // Glowing origin and destination waypoint circles
    const origMarker = L.circleMarker([flight.origin.lat, flight.origin.lon], {
      radius: 6,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).bindTooltip(`DEP: ${flight.origin.iata} (${flight.origin.city})`, { permanent: false, direction: 'top' });

    const destMarker = L.circleMarker([flight.destination.lat, flight.destination.lon], {
      radius: 6,
      fillColor: '#f43f5e',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).bindTooltip(`ARR: ${flight.destination.iata} (${flight.destination.city})`, { permanent: false, direction: 'top' });

    this.flightPathLayer.addLayer(origMarker);
    this.flightPathLayer.addLayer(destMarker);
  }

  // Clear selected flight path
  clearTrajectory() {
    this.flightPathLayer.clearLayers();
    this.trailLayer.clearLayers();
  }

  // Select flight and fly camera to it
  selectFlight(flightId, zoomTo = true) {
    this.selectedFlightId = flightId;
    if (flightId && this.planeMarkers.has(flightId)) {
      const marker = this.planeMarkers.get(flightId);
      if (zoomTo) {
        this.map.flyTo(marker.getLatLng(), Math.max(this.map.getZoom(), 7), {
          animate: true,
          duration: 1.2
        });
      }
    }
  }

  // Render Major World Airports on the Radar
  renderAirports() {
    this.airportLayer.clearLayers();
    if (!this.showAirports) return;

    AIRPORTS_DATA.forEach((apt) => {
      const airportIcon = L.divIcon({
        html: `
          <div class="airport-radar-node" title="${apt.iata} - ${apt.name}">
            <div class="apt-pin"></div>
            <span class="apt-code">${apt.iata}</span>
          </div>
        `,
        className: 'custom-airport-icon',
        iconSize: [28, 20],
        iconAnchor: [14, 10]
      });

      const marker = L.marker([apt.lat, apt.lon], { icon: airportIcon, zIndexOffset: 50 });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (window.aviationAudio) window.aviationAudio.playAirportMorse(apt.iata);
        if (this.onSelectAirport) this.onSelectAirport(apt.iata);
      });

      this.airportLayer.addLayer(marker);
    });
  }

  toggleAirports(show) {
    this.showAirports = show;
    if (show) {
      this.renderAirports();
    } else {
      this.airportLayer.clearLayers();
    }
  }

  // Day/Night Solar Terminator Polygon
  updateDayNightTerminator() {
    if (this.terminatorLayer) {
      this.map.removeLayer(this.terminatorLayer);
    }

    try {
      // Calculate sun declination and subsolar point
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const dec = -23.44 * Math.cos(GeoMath.deg2rad((360 / 365) * (dayOfYear + 10)));
      const gha = (now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600) * 15;
      const sunLon = -gha;

      const nightPolygon = [];
      const steps = 72;
      for (let i = 0; i <= steps; i++) {
        const lon = -180 + (i * 360) / steps;
        const radLon = GeoMath.deg2rad(lon - sunLon);
        const tanLat = -Math.cos(radLon) / Math.tan(GeoMath.deg2rad(dec));
        const lat = GeoMath.rad2deg(Math.atan(tanLat));
        nightPolygon.push([lat, lon]);
      }

      // Complete hemisphere shadow bounding box
      const isNorthernSummer = dec > 0;
      const poleLat = isNorthernSummer ? -90 : 90;
      nightPolygon.push([poleLat, 180]);
      nightPolygon.push([poleLat, -180]);

      this.terminatorLayer = L.polygon(nightPolygon, {
        color: 'transparent',
        fillColor: '#030712',
        fillOpacity: 0.28,
        interactive: false
      }).addTo(this.map);
    } catch (e) {
      // Terminator computation fallback
    }
  }
}

window.RadarMap = RadarMap;

