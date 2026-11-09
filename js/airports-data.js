// AeroTrack Pro - Global Airports Database
const AIRPORTS_DATA = [
  // North America
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy Intl Airport', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781, elev: 13, tz: 'America/New_York' },
  { iata: 'EWR', icao: 'KEWR', name: 'Newark Liberty Intl Airport', city: 'Newark/NYC', country: 'United States', lat: 40.6895, lon: -74.1745, elev: 18, tz: 'America/New_York' },
  { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles Intl Airport', city: 'Los Angeles', country: 'United States', lat: 33.9416, lon: -118.4085, elev: 125, tz: 'America/Los_Angeles' },
  { iata: 'ORD', icao: 'KORD', name: "O'Hare Intl Airport", city: 'Chicago', country: 'United States', lat: 41.9742, lon: -87.9073, elev: 672, tz: 'America/Chicago' },
  { iata: 'MDW', icao: 'KMDW', name: 'Chicago Midway Intl Airport', city: 'Chicago', country: 'United States', lat: 41.7868, lon: -87.7522, elev: 620, tz: 'America/Chicago' },
  { iata: 'SFO', icao: 'KSFO', name: 'San Francisco Intl Airport', city: 'San Francisco', country: 'United States', lat: 37.6213, lon: -122.3790, elev: 13, tz: 'America/Los_Angeles' },
  { iata: 'MIA', icao: 'KMIA', name: 'Miami Intl Airport', city: 'Miami', country: 'United States', lat: 25.7959, lon: -80.2870, elev: 8, tz: 'America/New_York' },
  { iata: 'MCO', icao: 'KMCO', name: 'Orlando Intl Airport', city: 'Orlando', country: 'United States', lat: 28.4312, lon: -81.3081, elev: 96, tz: 'America/New_York' },
  { iata: 'LAS', icao: 'KLAS', name: 'Harry Reid Intl Airport', city: 'Las Vegas', country: 'United States', lat: 36.0840, lon: -115.1537, elev: 2181, tz: 'America/Los_Angeles' },
  { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'United States', lat: 33.6407, lon: -84.4277, elev: 1026, tz: 'America/New_York' },
  { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth Intl Airport', city: 'Dallas', country: 'United States', lat: 32.8998, lon: -97.0403, elev: 607, tz: 'America/Chicago' },
  { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma Intl Airport', city: 'Seattle', country: 'United States', lat: 47.4502, lon: -122.3088, elev: 433, tz: 'America/Los_Angeles' },
  { iata: 'BOS', icao: 'KBOS', name: 'Boston Logan Intl Airport', city: 'Boston', country: 'United States', lat: 42.3656, lon: -71.0096, elev: 20, tz: 'America/New_York' },
  { iata: 'DEN', icao: 'KDEN', name: 'Denver Intl Airport', city: 'Denver', country: 'United States', lat: 39.8561, lon: -104.6737, elev: 5431, tz: 'America/Denver' },
  { iata: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson Intl Airport', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248, elev: 569, tz: 'America/Toronto' },
  { iata: 'YVR', icao: 'CYVR', name: 'Vancouver Intl Airport', city: 'Vancouver', country: 'Canada', lat: 49.1967, lon: -123.1815, elev: 14, tz: 'America/Vancouver' },
  { iata: 'MEX', icao: 'MMMX', name: 'Mexico City Benito Juárez Intl', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lon: -99.0721, elev: 7316, tz: 'America/Mexico_City' },

  // Europe
  { iata: 'LHR', icao: 'EGLL', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lon: -0.4543, elev: 83, tz: 'Europe/London' },
  { iata: 'LGW', icao: 'EGKK', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', lat: 51.1537, lon: -0.1821, elev: 202, tz: 'Europe/London' },
  { iata: 'CDG', icao: 'LFPG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, elev: 392, tz: 'Europe/Paris' },
  { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, elev: 364, tz: 'Europe/Berlin' },
  { iata: 'MUC', icao: 'EDDM', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3537, lon: 11.7860, elev: 1487, tz: 'Europe/Berlin' },
  { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, elev: -11, tz: 'Europe/Amsterdam' },
  { iata: 'MAD', icao: 'LEMD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4839, lon: -3.5680, elev: 2001, tz: 'Europe/Madrid' },
  { iata: 'BCN', icao: 'LEBL', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lon: 2.0833, elev: 14, tz: 'Europe/Madrid' },
  { iata: 'FCO', icao: 'LIRF', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lon: 12.2389, elev: 15, tz: 'Europe/Rome' },
  { iata: 'ZRH', icao: 'LSZH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4582, lon: 8.5555, elev: 1416, tz: 'Europe/Zurich' },
  { iata: 'VIE', icao: 'LOWW', name: 'Vienna Intl Airport', city: 'Vienna', country: 'Austria', lat: 48.1103, lon: 16.5697, elev: 600, tz: 'Europe/Vienna' },
  { iata: 'IST', icao: 'LTFM', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519, elev: 325, tz: 'Europe/Istanbul' },
  { iata: 'DUB', icao: 'EIDW', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', lat: 53.4264, lon: -6.2499, elev: 242, tz: 'Europe/Dublin' },
  { iata: 'OSL', icao: 'ENGM', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', lat: 60.1976, lon: 11.1004, elev: 681, tz: 'Europe/Oslo' },
  { iata: 'ARN', icao: 'ESSA', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', lat: 59.6498, lon: 17.9238, elev: 137, tz: 'Europe/Stockholm' },
  { iata: 'CPH', icao: 'EKCH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', lat: 55.6180, lon: 12.6508, elev: 17, tz: 'Europe/Copenhagen' },
  { iata: 'HEL', icao: 'EFHK', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', lat: 60.3172, lon: 24.9633, elev: 179, tz: 'Europe/Helsinki' },

  // Middle East & Africa
  { iata: 'DXB', icao: 'OMDB', name: 'Dubai Intl Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657, elev: 62, tz: 'Asia/Dubai' },
  { iata: 'DOH', icao: 'OTHH', name: 'Hamad Intl Airport', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081, elev: 13, tz: 'Asia/Qatar' },
  { iata: 'AUH', icao: 'OMAA', name: 'Zayed Intl Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4330, lon: 54.6511, elev: 88, tz: 'Asia/Dubai' },
  { iata: 'JED', icao: 'OEJN', name: 'King Abdulaziz Intl Airport', city: 'Jeddah', country: 'Saudi Arabia', lat: 21.6796, lon: 39.1565, elev: 48, tz: 'Asia/Riyadh' },
  { iata: 'RUH', icao: 'OERK', name: 'King Khalid Intl Airport', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lon: 46.6988, elev: 2049, tz: 'Asia/Riyadh' },
  { iata: 'CAI', icao: 'HECA', name: 'Cairo Intl Airport', city: 'Cairo', country: 'Egypt', lat: 30.1219, lon: 31.4056, elev: 382, tz: 'Africa/Cairo' },
  { iata: 'JNB', icao: 'FAOR', name: 'O. R. Tambo Intl Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1367, lon: 28.2411, elev: 5558, tz: 'Africa/Johannesburg' },
  { iata: 'CPT', icao: 'FACT', name: 'Cape Town Intl Airport', city: 'Cape Town', country: 'South Africa', lat: -33.9715, lon: 18.6021, elev: 151, tz: 'Africa/Johannesburg' },
  { iata: 'NBO', icao: 'HKJK', name: 'Jomo Kenyatta Intl Airport', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lon: 36.9278, elev: 5327, tz: 'Africa/Nairobi' },

  // Asia & Oceania
  { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, elev: 35, tz: 'Asia/Tokyo' },
  { iata: 'NRT', icao: 'RJAA', name: 'Tokyo Narita Intl Airport', city: 'Tokyo', country: 'Japan', lat: 35.7720, lon: 140.3929, elev: 141, tz: 'Asia/Tokyo' },
  { iata: 'KIX', icao: 'RJBB', name: 'Kansai Intl Airport', city: 'Osaka', country: 'Japan', lat: 34.4320, lon: 135.2304, elev: 26, tz: 'Asia/Tokyo' },
  { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, elev: 22, tz: 'Asia/Singapore' },
  { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong Intl Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, elev: 28, tz: 'Asia/Hong_Kong' },
  { iata: 'ICN', icao: 'RKSI', name: 'Incheon Intl Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407, elev: 23, tz: 'Asia/Seoul' },
  { iata: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, elev: 5, tz: 'Asia/Bangkok' },
  { iata: 'KUL', icao: 'WMKK', name: 'Kuala Lumpur Intl Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lon: 101.7099, elev: 69, tz: 'Asia/Kuala_Lumpur' },
  { iata: 'PEK', icao: 'ZBAA', name: 'Beijing Capital Intl Airport', city: 'Beijing', country: 'China', lat: 40.0799, lon: 116.6031, elev: 116, tz: 'Asia/Shanghai' },
  { iata: 'PKX', icao: 'ZBAD', name: 'Beijing Daxing Intl Airport', city: 'Beijing', country: 'China', lat: 39.5098, lon: 116.4105, elev: 98, tz: 'Asia/Shanghai' },
  { iata: 'PVG', icao: 'ZSPD', name: 'Shanghai Pudong Intl Airport', city: 'Shanghai', country: 'China', lat: 31.1443, lon: 121.8083, elev: 13, tz: 'Asia/Shanghai' },
  { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi Intl Airport', city: 'New Delhi', country: 'India', lat: 28.5562, lon: 77.1000, elev: 777, tz: 'Asia/Kolkata' },
  { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, elev: 39, tz: 'Asia/Kolkata' },
  { iata: 'BLR', icao: 'VOBL', name: 'Kempegowda Intl Airport', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066, elev: 3000, tz: 'Asia/Kolkata' },
  { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9461, lon: 151.1772, elev: 21, tz: 'Australia/Sydney' },
  { iata: 'MEL', icao: 'YMML', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6690, lon: 144.8410, elev: 434, tz: 'Australia/Melbourne' },
  { iata: 'AKL', icao: 'NZAA', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lon: 174.7850, elev: 23, tz: 'Pacific/Auckland' },

  // South America
  { iata: 'GRU', icao: 'SBGR', name: 'São Paulo/Guarulhos Intl', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lon: -46.4731, elev: 2459, tz: 'America/Sao_Paulo' },
  { iata: 'GIG', icao: 'SBGL', name: 'Rio de Janeiro/Galeão Intl', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8089, lon: -43.2436, elev: 28, tz: 'America/Sao_Paulo' },
  { iata: 'EZE', icao: 'SAEZ', name: 'Ministro Pistarini Intl (Ezeiza)', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lon: -58.5358, elev: 67, tz: 'America/Argentina/Buenos_Aires' },
  { iata: 'BOG', icao: 'SKBO', name: 'El Dorado Intl Airport', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lon: -74.1469, elev: 8361, tz: 'America/Bogota' },
  { iata: 'SCL', icao: 'SCEL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'Chile', lat: -33.3930, lon: -70.7858, elev: 1555, tz: 'America/Santiago' },
  { iata: 'LIM', icao: 'SPJC', name: 'Jorge Chávez Intl Airport', city: 'Lima', country: 'Peru', lat: -12.0219, lon: -77.1143, elev: 113, tz: 'America/Lima' }
];

// Helper to lookup airport by IATA or ICAO
function getAirport(code) {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  return AIRPORTS_DATA.find(a => a.iata === upper || a.icao === upper) || null;
}

// Calculate active runway best aligned into the wind
function getActiveRunway(airport, windDir) {
  if (!airport) return 'N/A';
  const runwayTable = {
    'JFK': ['04L', '04R', '13L', '13R', '22L', '22R', '31L', '31R'],
    'LHR': ['09L', '09R', '27L', '27R'],
    'LAX': ['06L', '06R', '07L', '07R', '24L', '24R', '25L', '25R'],
    'ORD': ['09C', '09L', '09R', '10C', '10L', '22L', '27C', '27L', '27R', '28C'],
    'SFO': ['01L', '01R', '10L', '10R', '19L', '19R', '28L', '28R'],
    'HND': ['04', '05', '16L', '16R', '22', '23', '34L', '34R'],
    'DXB': ['12L', '12R', '30L', '30R'],
    'CDG': ['08L', '08R', '09L', '09R', '26L', '26R', '27L', '27R'],
    'FRA': ['07L', '07C', '07R', '18', '25L', '25C', '25R'],
    'AMS': ['06', '09', '18C', '18L', '18R', '24', '27', '36C', '36R'],
    'SIN': ['02L', '02C', '02R', '20L', '20C', '20R'],
    'SYD': ['07', '16L', '16R', '25', '34L', '34R']
  };

  const list = runwayTable[airport.iata] || ['09', '27'];
  let bestRwy = list[0];
  let minDiff = 999;

  list.forEach(rwy => {
    const num = parseInt(rwy.replace(/\D/g, ''), 10);
    const rwyHdg = num * 10;
    let diff = Math.abs(windDir - rwyHdg) % 360;
    if (diff > 180) diff = 360 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      bestRwy = rwy;
    }
  });

  return bestRwy;
}
