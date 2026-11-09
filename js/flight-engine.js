// AeroTrack Pro - Core Flight Simulation & Live ADS-B Engine

// Spherical Math Utilities (Great Circle navigation)
const GeoMath = {
  deg2rad: (deg) => (deg * Math.PI) / 180,
  rad2deg: (rad) => (rad * 180) / Math.PI,

  // Distance in Nautical Miles between two lat/lon points
  distanceNM: (lat1, lon1, lat2, lon2) => {
    const R = 3440.065; // Earth radius in NM
    const dLat = GeoMath.deg2rad(lat2 - lat1);
    const dLon = GeoMath.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(GeoMath.deg2rad(lat1)) *
        Math.cos(GeoMath.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Initial true bearing / heading from point 1 to point 2
  bearing: (lat1, lon1, lat2, lon2) => {
    const phi1 = GeoMath.deg2rad(lat1);
    const phi2 = GeoMath.deg2rad(lat2);
    const deltaLambda = GeoMath.deg2rad(lon2 - lon1);
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    const theta = Math.atan2(y, x);
    return (GeoMath.rad2deg(theta) + 360) % 360;
  },

  // Interpolate point along Great Circle arc (fraction 0..1)
  intermediatePoint: (lat1, lon1, lat2, lon2, f) => {
    const phi1 = GeoMath.deg2rad(lat1);
    const lambda1 = GeoMath.deg2rad(lon1);
    const phi2 = GeoMath.deg2rad(lat2);
    const lambda2 = GeoMath.deg2rad(lon2);

    const deltaPhi = phi2 - phi1;
    const deltaLambda = lambda2 - lambda1;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (d === 0) return { lat: lat1, lon: lon1 };

    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
    const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);

    const phi = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lambda = Math.atan2(y, x);

    return {
      lat: GeoMath.rad2deg(phi),
      lon: GeoMath.rad2deg(lambda)
    };
  },

  // Format altitude with commas
  formatAlt: (feet) => Math.round(feet).toLocaleString() + ' ft',
  // Format speed in knots
  formatSpeed: (kts) => Math.round(kts) + ' kts'
};

// Realistic Scheduled Route Templates for Global Simulation
const ROUTE_TEMPLATES = [
  // Transatlantic & Intercontinental
  { flightNumber: 'BA117', airlineIcao: 'BAW', orig: 'LHR', dest: 'JFK', aircraft: 'Boeing 777-300ER', reg: 'G-STBA', cruiseAlt: 37000, cruiseSpeed: 485 },
  { flightNumber: 'AA100', airlineIcao: 'AAL', orig: 'JFK', dest: 'LHR', aircraft: 'Boeing 777-200ER', reg: 'N77014', cruiseAlt: 39000, cruiseSpeed: 505 },
  { flightNumber: 'DL412', airlineIcao: 'DAL', orig: 'JFK', dest: 'CDG', aircraft: 'Airbus A330-900neo', reg: 'N401DZ', cruiseAlt: 38000, cruiseSpeed: 490 },
  { flightNumber: 'AF006', airlineIcao: 'AFR', orig: 'CDG', dest: 'JFK', aircraft: 'Boeing 777-300ER', reg: 'F-GSQD', cruiseAlt: 36000, cruiseSpeed: 480 },
  { flightNumber: 'LH400', airlineIcao: 'DLH', orig: 'FRA', dest: 'JFK', aircraft: 'Boeing 747-8I', reg: 'D-ABYA', cruiseAlt: 36000, cruiseSpeed: 510 },
  { flightNumber: 'LH401', airlineIcao: 'DLH', orig: 'JFK', dest: 'FRA', aircraft: 'Boeing 747-8I', reg: 'D-ABYP', cruiseAlt: 39000, cruiseSpeed: 520 },
  { flightNumber: 'UA960', airlineIcao: 'UAL', orig: 'EWR', dest: 'FRA', aircraft: 'Boeing 787-10', reg: 'N14001', cruiseAlt: 37000, cruiseSpeed: 495 },
  { flightNumber: 'KL641', airlineIcao: 'KLM', orig: 'AMS', dest: 'JFK', aircraft: 'Boeing 787-9', reg: 'PH-BHA', cruiseAlt: 38000, cruiseSpeed: 490 },
  { flightNumber: 'IB6251', airlineIcao: 'IBE', orig: 'MAD', dest: 'JFK', aircraft: 'Airbus A350-900', reg: 'EC-MYX', cruiseAlt: 39000, cruiseSpeed: 490 },
  { flightNumber: 'LX14', airlineIcao: 'SWR', orig: 'ZRH', dest: 'JFK', aircraft: 'Airbus A330-300', reg: 'HB-JHD', cruiseAlt: 37000, cruiseSpeed: 485 },
  { flightNumber: 'VS3', airlineIcao: 'VIR', orig: 'LHR', dest: 'JFK', aircraft: 'Airbus A350-1000', reg: 'G-VLUX', cruiseAlt: 38000, cruiseSpeed: 495 },

  // Middle East & Africa Hubs
  { flightNumber: 'EK201', airlineIcao: 'UAE', orig: 'DXB', dest: 'JFK', aircraft: 'Airbus A380-800', reg: 'A6-EEO', cruiseAlt: 38000, cruiseSpeed: 505 },
  { flightNumber: 'EK001', airlineIcao: 'UAE', orig: 'DXB', dest: 'LHR', aircraft: 'Airbus A380-800', reg: 'A6-EVB', cruiseAlt: 39000, cruiseSpeed: 500 },
  { flightNumber: 'EK414', airlineIcao: 'UAE', orig: 'DXB', dest: 'SYD', aircraft: 'Airbus A380-800', reg: 'A6-EUL', cruiseAlt: 37000, cruiseSpeed: 510 },
  { flightNumber: 'EK384', airlineIcao: 'UAE', orig: 'DXB', dest: 'BKK', aircraft: 'Boeing 777-300ER', reg: 'A6-EPL', cruiseAlt: 35000, cruiseSpeed: 490 },
  { flightNumber: 'QR701', airlineIcao: 'QTR', orig: 'DOH', dest: 'JFK', aircraft: 'Airbus A350-1000', reg: 'A7-ANA', cruiseAlt: 37000, cruiseSpeed: 495 },
  { flightNumber: 'QR003', airlineIcao: 'QTR', orig: 'DOH', dest: 'LHR', aircraft: 'Boeing 777-300ER', reg: 'A7-BEH', cruiseAlt: 38000, cruiseSpeed: 490 },
  { flightNumber: 'EY101', airlineIcao: 'ETD', orig: 'AUH', dest: 'JFK', aircraft: 'Boeing 787-9', reg: 'A6-BLC', cruiseAlt: 37000, cruiseSpeed: 495 },
  { flightNumber: 'TK1', airlineIcao: 'THY', orig: 'IST', dest: 'JFK', aircraft: 'Boeing 787-9', reg: 'TC-LLA', cruiseAlt: 38000, cruiseSpeed: 490 },
  { flightNumber: 'TK1985', airlineIcao: 'THY', orig: 'IST', dest: 'LHR', aircraft: 'Airbus A321neo', reg: 'TC-LSE', cruiseAlt: 35000, cruiseSpeed: 460 },

  // Asia - Pacific
  { flightNumber: 'SQ321', airlineIcao: 'SIA', orig: 'LHR', dest: 'SIN', aircraft: 'Boeing 777-300ER', reg: '9V-SWM', cruiseAlt: 37000, cruiseSpeed: 495 },
  { flightNumber: 'SQ22', airlineIcao: 'SIA', orig: 'SIN', dest: 'EWR', aircraft: 'Airbus A350-900ULR', reg: '9V-SGA', cruiseAlt: 41000, cruiseSpeed: 490 },
  { flightNumber: 'SQ221', airlineIcao: 'SIA', orig: 'SIN', dest: 'SYD', aircraft: 'Airbus A380-800', reg: '9V-SKV', cruiseAlt: 38000, cruiseSpeed: 505 },
  { flightNumber: 'SQ12', airlineIcao: 'SIA', orig: 'SIN', dest: 'NRT', aircraft: 'Boeing 777-300ER', reg: '9V-SWQ', cruiseAlt: 37000, cruiseSpeed: 490 },
  { flightNumber: 'CX846', airlineIcao: 'CPA', orig: 'HKG', dest: 'JFK', aircraft: 'Airbus A350-1000', reg: 'B-LXA', cruiseAlt: 39000, cruiseSpeed: 495 },
  { flightNumber: 'CX251', airlineIcao: 'CPA', orig: 'HKG', dest: 'LHR', aircraft: 'Boeing 777-300ER', reg: 'B-KPY', cruiseAlt: 36000, cruiseSpeed: 490 },
  { flightNumber: 'JL006', airlineIcao: 'JAL', orig: 'HND', dest: 'JFK', aircraft: 'Airbus A350-1000', reg: 'JA01WJ', cruiseAlt: 37000, cruiseSpeed: 495 },
  { flightNumber: 'JL043', airlineIcao: 'JAL', orig: 'HND', dest: 'LHR', aircraft: 'Boeing 777-300ER', reg: 'JA738J', cruiseAlt: 38000, cruiseSpeed: 490 },
  { flightNumber: 'NH106', airlineIcao: 'ANA', orig: 'HND', dest: 'LAX', aircraft: 'Boeing 787-9', reg: 'JA873A', cruiseAlt: 39000, cruiseSpeed: 500 },
  { flightNumber: 'NH211', airlineIcao: 'ANA', orig: 'HND', dest: 'LHR', aircraft: 'Boeing 777-300ER', reg: 'JA795A', cruiseAlt: 37000, cruiseSpeed: 490 },
  { flightNumber: 'KE017', airlineIcao: 'KAL', orig: 'ICN', dest: 'LAX', aircraft: 'Boeing 747-8I', reg: 'HL7630', cruiseAlt: 36000, cruiseSpeed: 510 },
  { flightNumber: 'KE081', airlineIcao: 'KAL', orig: 'ICN', dest: 'JFK', aircraft: 'Airbus A380-800', reg: 'HL7614', cruiseAlt: 38000, cruiseSpeed: 500 },
  { flightNumber: 'AI101', airlineIcao: 'AIC', orig: 'DEL', dest: 'JFK', aircraft: 'Boeing 777-300ER', reg: 'VT-ALR', cruiseAlt: 36000, cruiseSpeed: 485 },
  { flightNumber: 'AI161', airlineIcao: 'AIC', orig: 'DEL', dest: 'LHR', aircraft: 'Boeing 787-8', reg: 'VT-ANE', cruiseAlt: 38000, cruiseSpeed: 490 },

  // Transpacific & Oceania
  { flightNumber: 'QF11', airlineIcao: 'QFA', orig: 'SYD', dest: 'LAX', aircraft: 'Boeing 787-9', reg: 'VH-ZNK', cruiseAlt: 38000, cruiseSpeed: 500 },
  { flightNumber: 'QF1', airlineIcao: 'QFA', orig: 'SYD', dest: 'LHR', aircraft: 'Airbus A380-800', reg: 'VH-OQC', cruiseAlt: 37000, cruiseSpeed: 505 },
  { flightNumber: 'NZ2', airlineIcao: 'ANZ', orig: 'AKL', dest: 'LAX', aircraft: 'Boeing 787-9', reg: 'ZK-NZC', cruiseAlt: 39000, cruiseSpeed: 500 },

  // US Domestic & North American Trunk Routes
  { flightNumber: 'UA2422', airlineIcao: 'UAL', orig: 'SFO', dest: 'ORD', aircraft: 'Boeing 777-200', reg: 'N782UA', cruiseAlt: 35000, cruiseSpeed: 480 },
  { flightNumber: 'UA1234', airlineIcao: 'UAL', orig: 'ORD', dest: 'LAX', aircraft: 'Boeing 757-300', reg: 'N57857', cruiseAlt: 34000, cruiseSpeed: 475 },
  { flightNumber: 'AA1', airlineIcao: 'AAL', orig: 'JFK', dest: 'LAX', aircraft: 'Airbus A321T', reg: 'N101NN', cruiseAlt: 36000, cruiseSpeed: 465 },
  { flightNumber: 'AA3', airlineIcao: 'AAL', orig: 'JFK', dest: 'LAX', aircraft: 'Airbus A321T', reg: 'N103NN', cruiseAlt: 34000, cruiseSpeed: 470 },
  { flightNumber: 'DL300', airlineIcao: 'DAL', orig: 'ATL', dest: 'LAX', aircraft: 'Boeing 767-300ER', reg: 'N182DN', cruiseAlt: 35000, cruiseSpeed: 480 },
  { flightNumber: 'DL1550', airlineIcao: 'DAL', orig: 'ATL', dest: 'JFK', aircraft: 'Airbus A321neo', reg: 'N501DA', cruiseAlt: 31000, cruiseSpeed: 450 },
  { flightNumber: 'DL238', airlineIcao: 'DAL', orig: 'SEA', dest: 'ATL', aircraft: 'Boeing 757-200', reg: 'N6705Y', cruiseAlt: 37000, cruiseSpeed: 475 },
  { flightNumber: 'WN812', airlineIcao: 'SWA', orig: 'DEN', dest: 'LAS', aircraft: 'Boeing 737 MAX 8', reg: 'N8714Q', cruiseAlt: 32000, cruiseSpeed: 440 },
  { flightNumber: 'WN1420', airlineIcao: 'SWA', orig: 'MDW', dest: 'MCO', aircraft: 'Boeing 737-800', reg: 'N8642E', cruiseAlt: 34000, cruiseSpeed: 450 },
  { flightNumber: 'AC758', airlineIcao: 'ACA', orig: 'SFO', dest: 'YYZ', aircraft: 'Airbus A220-300', reg: 'C-GJXN', cruiseAlt: 35000, cruiseSpeed: 440 },
  { flightNumber: 'AC33', airlineIcao: 'ACA', orig: 'YVR', dest: 'SYD', aircraft: 'Boeing 787-9', reg: 'C-FRTG', cruiseAlt: 38000, cruiseSpeed: 495 },

  // European Internal Shuttles
  { flightNumber: 'BA304', airlineIcao: 'BAW', orig: 'LHR', dest: 'CDG', aircraft: 'Airbus A320neo', reg: 'G-TTNA', cruiseAlt: 24000, cruiseSpeed: 410 },
  { flightNumber: 'BA902', airlineIcao: 'BAW', orig: 'LHR', dest: 'FRA', aircraft: 'Airbus A321neo', reg: 'G-NEOP', cruiseAlt: 28000, cruiseSpeed: 430 },
  { flightNumber: 'AF1680', airlineIcao: 'AFR', orig: 'CDG', dest: 'LHR', aircraft: 'Airbus A320-200', reg: 'F-GKXI', cruiseAlt: 22000, cruiseSpeed: 400 },
  { flightNumber: 'AF1110', airlineIcao: 'AFR', orig: 'CDG', dest: 'MAD', aircraft: 'Airbus A220-300', reg: 'F-HZUA', cruiseAlt: 33000, cruiseSpeed: 445 },
  { flightNumber: 'LH104', airlineIcao: 'DLH', orig: 'FRA', dest: 'MUC', aircraft: 'Airbus A321-200', reg: 'D-AIDV', cruiseAlt: 26000, cruiseSpeed: 420 },
  { flightNumber: 'KL1001', airlineIcao: 'KLM', orig: 'AMS', dest: 'LHR', aircraft: 'Boeing 737-800', reg: 'PH-BCA', cruiseAlt: 22000, cruiseSpeed: 400 },
  { flightNumber: 'IB3160', airlineIcao: 'IBE', orig: 'MAD', dest: 'LHR', aircraft: 'Airbus A350-900', reg: 'EC-NXA', cruiseAlt: 34000, cruiseSpeed: 460 },

  // Latin America & Caribbean
  { flightNumber: 'LA8100', airlineIcao: 'LAN', orig: 'GRU', dest: 'MIA', aircraft: 'Boeing 777-300ER', reg: 'PT-MUA', cruiseAlt: 37000, cruiseSpeed: 490 },
  { flightNumber: 'LA8084', airlineIcao: 'LAN', orig: 'GRU', dest: 'LHR', aircraft: 'Boeing 777-300ER', reg: 'PT-MUC', cruiseAlt: 38000, cruiseSpeed: 495 },
  { flightNumber: 'AM400', airlineIcao: 'AMX', orig: 'MEX', dest: 'JFK', aircraft: 'Boeing 787-9', reg: 'XA-ADG', cruiseAlt: 37000, cruiseSpeed: 485 },
  { flightNumber: 'AV20', airlineIcao: 'AVA', orig: 'BOG', dest: 'JFK', aircraft: 'Boeing 787-8', reg: 'N780AV', cruiseAlt: 36000, cruiseSpeed: 480 }
];

class FlightEngine {
  constructor() {
    this.flights = new Map();
    this.isLiveMode = false;
    this.isLiveConnected = false;
    this.lastUpdateTime = Date.now();
    this.livePollInterval = null;
    this.simSpeedMultiplier = 35; // Accelerated time for lively visualization
    this.liveApiEndpoint = '/api/live-flights';
    this.selectedFlightId = null;

    // Filters state
    this.filters = {
      search: '',
      airline: 'ALL',
      altitudeRange: [0, 50000],
      speedRange: [0, 700],
      status: 'ALL',
      category: 'ALL'
    };

    this.initSimulation();
  }

  // Initialize simulated active flights
  initSimulation() {
    this.flights.clear();

    ROUTE_TEMPLATES.forEach((tmpl, idx) => {
      const orig = getAirport(tmpl.orig);
      const dest = getAirport(tmpl.dest);
      if (!orig || !dest) return;

      const airline = AIRLINES_DATA.find(a => a.icao === tmpl.airlineIcao) || {
        name: tmpl.airlineIcao,
        icao: tmpl.airlineIcao,
        iata: tmpl.flightNumber.substring(0, 2),
        color: '#00d2ff'
      };

      // Stagger initial progress across the route (0.05 to 0.95)
      const initialProgress = ((idx * 0.173) % 0.88) + 0.06;
      const totalDist = GeoMath.distanceNM(orig.lat, orig.lon, dest.lat, dest.lon);

      // Squawk code generator
      let squawk = (1000 + (idx * 137) % 6777).toString().padStart(4, '0');
      // Give one flight squawk 7700 (General Emergency) for demonstration
      if (idx === 7) squawk = '7700';

      const hex = (0xa00000 + idx * 4391).toString(16);
      const pos = GeoMath.intermediatePoint(orig.lat, orig.lon, dest.lat, dest.lon, initialProgress);
      const nextPos = GeoMath.intermediatePoint(orig.lat, orig.lon, dest.lat, dest.lon, Math.min(1.0, initialProgress + 0.01));
      const heading = GeoMath.bearing(pos.lat, pos.lon, nextPos.lat, nextPos.lon);

      // Determine flight phase & current altitude/speed
      let alt = tmpl.cruiseAlt;
      let verticalRate = 0;
      let status = 'Cruising';

      if (initialProgress < 0.18) {
        // Climbing
        alt = Math.round(orig.elev + (tmpl.cruiseAlt - orig.elev) * (initialProgress / 0.18));
        verticalRate = 1800 + Math.round(Math.random() * 600);
        status = 'Climbing';
      } else if (initialProgress > 0.82) {
        // Descending
        alt = Math.round(dest.elev + (tmpl.cruiseAlt - dest.elev) * ((1 - initialProgress) / 0.18));
        verticalRate = -1600 - Math.round(Math.random() * 500);
        status = 'Descending';
      }

      const flight = {
        id: 'SIM-' + tmpl.flightNumber,
        flightNumber: tmpl.flightNumber,
        callsign: tmpl.airlineIcao + tmpl.flightNumber.replace(/\D/g, ''),
        airline: airline.name,
        airlineIcao: airline.icao,
        airlineIata: airline.iata,
        airlineColor: airline.color || '#00d2ff',
        origin: orig,
        destination: dest,
        aircraft: tmpl.aircraft,
        reg: tmpl.reg,
        icao24: hex,
        squawk: squawk,
        lat: pos.lat,
        lon: pos.lon,
        altitude: alt,
        targetAltitude: tmpl.cruiseAlt,
        speed: tmpl.cruiseSpeed * (0.95 + Math.random() * 0.1),
        heading: Math.round(heading),
        verticalRate: verticalRate,
        progress: initialProgress,
        totalDistanceNM: Math.round(totalDist),
        remainingDistanceNM: Math.round(totalDist * (1 - initialProgress)),
        status: status,
        isSimulated: true,
        trail: [
          GeoMath.intermediatePoint(orig.lat, orig.lon, dest.lat, dest.lon, Math.max(0, initialProgress - 0.08)),
          GeoMath.intermediatePoint(orig.lat, orig.lon, dest.lat, dest.lon, Math.max(0, initialProgress - 0.04)),
          pos
        ],
        startTime: Date.now() - (initialProgress * (totalDist / tmpl.cruiseSpeed) * 3600 * 1000),
        eta: Date.now() + ((1 - initialProgress) * (totalDist / tmpl.cruiseSpeed) * 3600 * 1000)
      };

      this.flights.set(flight.id, flight);
    });
  }

  // Physics update tick for simulated flights
  tickSimulation(dtSeconds) {
    const elapsedHours = (dtSeconds * this.simSpeedMultiplier) / 3600;

    this.flights.forEach((f) => {
      if (!f.isSimulated) return;

      const deltaDist = f.speed * elapsedHours;
      const progressInc = deltaDist / Math.max(1, f.totalDistanceNM);
      f.progress += progressInc;

      // Handle flight completion: turnaround / restart with opposite leg
      if (f.progress >= 0.99) {
        const temp = f.origin;
        f.origin = f.destination;
        f.destination = temp;
        f.progress = 0.02;
        f.trail = [];
      }

      // Update position along Great Circle
      const currPos = GeoMath.intermediatePoint(f.origin.lat, f.origin.lon, f.destination.lat, f.destination.lon, f.progress);
      const aheadPos = GeoMath.intermediatePoint(f.origin.lat, f.origin.lon, f.destination.lat, f.destination.lon, Math.min(1.0, f.progress + 0.005));

      f.lat = currPos.lat;
      f.lon = currPos.lon;
      f.heading = Math.round(GeoMath.bearing(currPos.lat, currPos.lon, aheadPos.lat, aheadPos.lon));
      f.remainingDistanceNM = Math.round(f.totalDistanceNM * (1 - f.progress));

      // Update altitude & phase
      if (f.progress < 0.18) {
        f.altitude = Math.round(f.origin.elev + (f.targetAltitude - f.origin.elev) * (f.progress / 0.18));
        f.verticalRate = 1800;
        f.status = 'Climbing';
      } else if (f.progress > 0.82) {
        f.altitude = Math.round(f.destination.elev + (f.targetAltitude - f.destination.elev) * ((1 - f.progress) / 0.18));
        f.verticalRate = -1600;
        f.status = 'Descending';
      } else {
        f.altitude = f.targetAltitude;
        f.verticalRate = 0;
        f.status = 'Cruising';
      }

      // Update breadcrumb trail (keep last 12 points)
      if (!f.trail) f.trail = [];
      const lastTrailPt = f.trail[f.trail.length - 1];
      if (!lastTrailPt || GeoMath.distanceNM(lastTrailPt.lat, lastTrailPt.lon, f.lat, f.lon) > 20) {
        f.trail.push({ lat: f.lat, lon: f.lon });
        if (f.trail.length > 15) f.trail.shift();
      }
    });
  }

  // Switch between Live ADS-B Mode and Simulation Mode
  setMode(liveMode) {
    this.isLiveMode = liveMode;
    if (liveMode) {
      this.startLivePolling();
    } else {
      this.stopLivePolling();
      this.initSimulation();
    }
  }

  startLivePolling() {
    this.fetchLiveFlights();
    if (!this.livePollInterval) {
      this.livePollInterval = setInterval(() => {
        if (this.isLiveMode) {
          this.fetchLiveFlights();
        }
      }, 7000); // Poll every 7 seconds
    }
  }

  stopLivePolling() {
    if (this.livePollInterval) {
      clearInterval(this.livePollInterval);
      this.livePollInterval = null;
    }
  }

  // Fetch real-time live flight data from backend proxy or OpenSky
  async fetchLiveFlights(bounds) {
    try {
      let url = this.liveApiEndpoint;
      if (bounds) {
        url += `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;
      }

      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Live API HTTP ' + res.status);

      const data = await res.json();
      this.isLiveConnected = true;
      this.processOpenSkyData(data);
    } catch (err) {
      this.isLiveConnected = false;
      console.warn('Live ADS-B fetch error (falling back to simulation):', err.message);
      // If live fails, seamlessly keep or re-seed simulation
      if (this.flights.size === 0) {
        this.initSimulation();
      }
    }
  }

  // Normalize OpenSky state vectors to internal model
  processOpenSkyData(data) {
    if (!data || !Array.isArray(data.states)) return;

    const currentHexes = new Set();

    data.states.forEach((s) => {
      const icao24 = s[0];
      const callsign = (s[1] || '').trim();
      const originCountry = s[2];
      const lon = s[5];
      const lat = s[6];
      const baroAlt = s[7] !== null ? s[7] * 3.28084 : 0; // meters to feet
      const onGround = s[8];
      const velocity = s[9] !== null ? s[9] * 1.94384 : 0; // m/s to knots
      const heading = s[10] !== null ? Math.round(s[10]) : 0;
      const verticalRate = s[11] !== null ? Math.round(s[11] * 196.85) : 0; // m/s to fpm
      const squawk = s[14] || '1200';

      if (lat === null || lon === null) return;
      currentHexes.add(icao24);

      // Attempt to identify airline & route
      const airline = getAirlineByCallsign(callsign) || {
        name: originCountry || 'Commercial',
        icao: callsign.substring(0, 3),
        iata: callsign.substring(0, 2),
        color: '#00e5ff'
      };

      // Heuristic matching for airports
      const matchedRoute = ROUTE_TEMPLATES.find(r => callsign.startsWith(r.airlineIcao));
      const orig = matchedRoute ? getAirport(matchedRoute.orig) : AIRPORTS_DATA[0];
      const dest = matchedRoute ? getAirport(matchedRoute.dest) : AIRPORTS_DATA[1];

      let status = 'Cruising';
      if (onGround) status = 'On Ground';
      else if (verticalRate > 300) status = 'Climbing';
      else if (verticalRate < -300) status = 'Descending';

      const existing = this.flights.get(icao24);
      if (existing) {
        existing.lat = lat;
        existing.lon = lon;
        existing.altitude = Math.round(baroAlt);
        existing.speed = Math.round(velocity);
        existing.heading = heading;
        existing.verticalRate = verticalRate;
        existing.status = status;
        existing.squawk = squawk;
        if (!existing.trail) existing.trail = [];
        existing.trail.push({ lat, lon });
        if (existing.trail.length > 20) existing.trail.shift();
      } else {
        this.flights.set(icao24, {
          id: icao24,
          flightNumber: callsign || icao24.toUpperCase(),
          callsign: callsign || icao24,
          airline: airline.name,
          airlineIcao: airline.icao,
          airlineIata: airline.iata,
          airlineColor: airline.color || '#00e5ff',
          origin: orig,
          destination: dest,
          aircraft: 'Airbus/Boeing Commercial',
          reg: 'N/A',
          icao24: icao24,
          squawk: squawk,
          lat: lat,
          lon: lon,
          altitude: Math.round(baroAlt),
          targetAltitude: 38000,
          speed: Math.round(velocity),
          heading: heading,
          verticalRate: verticalRate,
          progress: 0.5,
          totalDistanceNM: 3500,
          remainingDistanceNM: 1750,
          status: status,
          isSimulated: false,
          trail: [{ lat, lon }]
        });
      }
    });

    // Remove stale planes
    for (const [id, f] of this.flights.entries()) {
      if (!f.isSimulated && !currentHexes.has(id)) {
        this.flights.delete(id);
      }
    }
  }

  // Get active filtered list of flights
  getFilteredFlights() {
    const list = Array.from(this.flights.values());
    const q = (this.filters.search || '').trim().toLowerCase();
    const airlineFilter = this.filters.airline;
    const [minAlt, maxAlt] = this.filters.altitudeRange;
    const [minSpd, maxSpd] = this.filters.speedRange;
    const statusFilter = this.filters.status;

    return list.filter((f) => {
      // Altitude filter
      if (f.altitude < minAlt || f.altitude > maxAlt) return false;
      // Speed filter
      if (f.speed < minSpd || f.speed > maxSpd) return false;
      // Airline filter
      if (airlineFilter !== 'ALL' && f.airlineIcao !== airlineFilter && f.airline !== airlineFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && f.status !== statusFilter) {
        return false;
      }
      // Search query filter
      if (q) {
        const matchCallsign = (f.callsign || '').toLowerCase().includes(q);
        const matchFlight = (f.flightNumber || '').toLowerCase().includes(q);
        const matchAirline = (f.airline || '').toLowerCase().includes(q);
        const matchOrig = f.origin && (f.origin.iata.toLowerCase().includes(q) || f.origin.city.toLowerCase().includes(q));
        const matchDest = f.destination && (f.destination.iata.toLowerCase().includes(q) || f.destination.city.toLowerCase().includes(q));
        const matchHex = (f.icao24 || '').toLowerCase().includes(q);
        const matchReg = (f.reg || '').toLowerCase().includes(q);
        if (!matchCallsign && !matchFlight && !matchAirline && !matchOrig && !matchDest && !matchHex && !matchReg) {
          return false;
        }
      }
      return true;
    });
  }

  // Generate Flight Information Display System (FIDS) for any airport
  getAirportFIDS(airportCode) {
    const airport = getAirport(airportCode);
    if (!airport) return { departures: [], arrivals: [] };

    const departures = [];
    const arrivals = [];

    // Match flights in active fleet
    this.flights.forEach((f) => {
      if (f.origin && (f.origin.iata === airport.iata || f.origin.icao === airport.icao)) {
        departures.push({
          flightNumber: f.flightNumber,
          airline: f.airline,
          airlineColor: f.airlineColor,
          destination: `${f.destination.city} (${f.destination.iata})`,
          aircraft: f.aircraft,
          gate: 'B' + (1 + (parseInt(f.icao24, 16) || 12) % 36),
          status: f.progress < 0.1 ? 'DEPARTED' : 'EN ROUTE',
          statusClass: f.progress < 0.1 ? 'badge-departed' : 'badge-enroute',
          time: new Date(Date.now() - (f.progress * 4 * 3600 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          flightId: f.id
        });
      }
      if (f.destination && (f.destination.iata === airport.iata || f.destination.icao === airport.icao)) {
        arrivals.push({
          flightNumber: f.flightNumber,
          airline: f.airline,
          airlineColor: f.airlineColor,
          origin: `${f.origin.city} (${f.origin.iata})`,
          aircraft: f.aircraft,
          gate: 'A' + (1 + (parseInt(f.icao24, 16) || 8) % 40),
          status: f.status === 'Descending' ? 'APPROACHING' : 'ON TIME',
          statusClass: f.status === 'Descending' ? 'badge-approaching' : 'badge-ontime',
          time: new Date(Date.now() + ((1 - f.progress) * 4 * 3600 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          flightId: f.id
        });
      }
    });

    return { airport, departures, arrivals };
  }

  // Spawn a custom user-defined flight onto the radar
  spawnCustomFlight({ flightNumber, airlineName, origCode, destCode, aircraft, cruiseAlt, cruiseSpeed }) {
    const orig = getAirport(origCode) || AIRPORTS_DATA[0];
    const dest = getAirport(destCode) || AIRPORTS_DATA[1];
    const fnum = (flightNumber || 'CUSTOM1').toUpperCase().trim();
    const alt = parseInt(cruiseAlt, 10) || 38000;
    const spd = parseInt(cruiseSpeed, 10) || 490;
    const totalDist = GeoMath.distanceNM(orig.lat, orig.lon, dest.lat, dest.lon);
    const hex = (0xc00000 + Math.floor(Math.random() * 0x0fffff)).toString(16);

    const pos = { lat: orig.lat, lon: orig.lon };
    const nextPos = GeoMath.intermediatePoint(orig.lat, orig.lon, dest.lat, dest.lon, 0.02);
    const heading = GeoMath.bearing(pos.lat, pos.lon, nextPos.lat, nextPos.lon);

    const flight = {
      id: 'USER-' + fnum,
      flightNumber: fnum,
      callsign: fnum,
      airline: airlineName || 'Private Operator',
      airlineIcao: fnum.substring(0, 3),
      airlineIata: fnum.substring(0, 2),
      airlineColor: '#f43f5e',
      origin: orig,
      destination: dest,
      aircraft: aircraft || 'Custom Jet',
      reg: 'N' + Math.floor(100 + Math.random() * 899) + 'US',
      icao24: hex,
      squawk: '1200',
      lat: pos.lat,
      lon: pos.lon,
      altitude: Math.min(alt, 1500),
      targetAltitude: alt,
      speed: spd,
      heading: Math.round(heading),
      verticalRate: 2200,
      progress: 0.01,
      totalDistanceNM: Math.round(totalDist),
      remainingDistanceNM: Math.round(totalDist),
      status: 'Climbing',
      isSimulated: true,
      trail: [pos],
      startTime: Date.now(),
      eta: Date.now() + ((totalDist / spd) * 3600 * 1000)
    };

    this.flights.set(flight.id, flight);
    return flight;
  }

  // Export flight trajectory as Google Earth KML
  exportFlightKML(flight) {
    if (!flight || !flight.origin || !flight.destination) return null;

    let coordsKml = '';
    const samples = 50;
    for (let i = 0; i <= samples; i++) {
      const f = i / samples;
      const pt = GeoMath.intermediatePoint(flight.origin.lat, flight.origin.lon, flight.destination.lat, flight.destination.lon, f);
      const altMeters = (flight.targetAltitude || 35000) * 0.3048;
      coordsKml += `${pt.lon},${pt.lat},${Math.round(altMeters)} `;
    }

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${flight.flightNumber} (${flight.origin.iata} to ${flight.destination.iata})</name>
    <description>${flight.airline} - ${flight.aircraft}</description>
    <Style id="flightPathStyle">
      <LineStyle>
        <color>ff00e5ff</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>${flight.flightNumber} Flight Path</name>
      <styleUrl>#flightPathStyle</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>${coordsKml.trim()}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    return kml;
  }

  // Export flight trajectory as GeoJSON
  exportFlightGeoJSON(flight) {
    if (!flight || !flight.origin || !flight.destination) return null;

    const coords = [];
    const samples = 50;
    for (let i = 0; i <= samples; i++) {
      const f = i / samples;
      const pt = GeoMath.intermediatePoint(flight.origin.lat, flight.origin.lon, flight.destination.lat, flight.destination.lon, f);
      coords.push([pt.lon, pt.lat, Math.round((flight.targetAltitude || 35000) * 0.3048)]);
    }

    return JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            flightNumber: flight.flightNumber,
            callsign: flight.callsign,
            airline: flight.airline,
            aircraft: flight.aircraft,
            origin: flight.origin.iata,
            destination: flight.destination.iata,
            altitudeFeet: flight.altitude,
            speedKnots: flight.speed,
            squawk: flight.squawk
          },
          geometry: {
            type: "LineString",
            coordinates: coords
          }
        }
      ]
    }, null, 2);
  }

  // Realistic Weather / METAR simulation for airports
  getAirportWeather(airport) {
    if (!airport) return null;
    const hash = (Math.abs(Math.sin(airport.lat + airport.lon)) * 10000) % 1;
    const tempC = Math.round(12 + (1.0 - Math.abs(airport.lat) / 90) * 16 + (hash * 8 - 4));
    const tempF = Math.round((tempC * 9/5) + 32);
    const windDir = Math.round(hash * 360);
    const windSpeed = Math.round(5 + hash * 18);
    const altimeter = (29.82 + (hash * 0.3)).toFixed(2);
    const conditions = ['Clear Sky', 'Few Clouds', 'Scattered', 'Broken High', 'Overcast'][Math.floor(hash * 5)];

    const metarString = `${airport.icao} 090400Z ${windDir.toString().padStart(3,'0')}${windSpeed}KT 9999 ${conditions.substring(0,3).toUpperCase()}035 ${tempC}/${tempC - 4} A${altimeter.replace('.', '')}`;

    return {
      tempC,
      tempF,
      windDir,
      windSpeed,
      altimeter,
      conditions,
      metar: metarString
    };
  }
}

window.FlightEngine = FlightEngine;

