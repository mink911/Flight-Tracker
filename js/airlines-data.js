// AeroTrack Pro - Global Airlines Database
const AIRLINES_DATA = [
  { iata: 'AA', icao: 'AAL', name: 'American Airlines', callsign: 'AMERICAN', country: 'United States', color: '#0078D7', checkinUrl: 'https://www.aa.com/flight-checkin' },
  { iata: 'DL', icao: 'DAL', name: 'Delta Air Lines', callsign: 'DELTA', country: 'United States', color: '#E01933', checkinUrl: 'https://www.delta.com/flight-checkin' },
  { iata: 'UA', icao: 'UAL', name: 'United Airlines', callsign: 'UNITED', country: 'United States', color: '#002244', checkinUrl: 'https://www.united.com/en/us/checkin' },
  { iata: 'WN', icao: 'SWA', name: 'Southwest Airlines', callsign: 'SOUTHWEST', country: 'United States', color: '#F9B612', checkinUrl: 'https://www.southwest.com/air/check-in/' },
  { iata: 'BA', icao: 'BAW', name: 'British Airways', callsign: 'SPEEDBIRD', country: 'United Kingdom', color: '#075AAA', checkinUrl: 'https://www.britishairways.com/travel/olci/public/en_gb' },
  { iata: 'LH', icao: 'DLH', name: 'Lufthansa', callsign: 'LUFTHANSA', country: 'Germany', color: '#05164D', checkinUrl: 'https://www.lufthansa.com/checkin' },
  { iata: 'AF', icao: 'AFR', name: 'Air France', callsign: 'AIRFRANS', country: 'France', color: '#002157', checkinUrl: 'https://wwws.airfrance.com/check-in' },
  { iata: 'KL', icao: 'KLM', name: 'KLM Royal Dutch Airlines', callsign: 'KLM', country: 'Netherlands', color: '#00A1DE', checkinUrl: 'https://www.klm.com/check-in' },
  { iata: 'EK', icao: 'UAE', name: 'Emirates', callsign: 'EMIRATES', country: 'United Arab Emirates', color: '#D71920', checkinUrl: 'https://www.emirates.com/english/manage-booking/online-check-in/' },
  { iata: 'QR', icao: 'QTR', name: 'Qatar Airways', callsign: 'QATARI', country: 'Qatar', color: '#5C0632', checkinUrl: 'https://www.qatarairways.com/en/check-in.html' },
  { iata: 'SQ', icao: 'SIA', name: 'Singapore Airlines', callsign: 'SINGAPORE', country: 'Singapore', color: '#F1A93B', checkinUrl: 'https://www.singaporeair.com/en_UK/us/plan-travel/your-booking/checkin/' },
  { iata: 'CX', icao: 'CPA', name: 'Cathay Pacific', callsign: 'CATHAY', country: 'Hong Kong', color: '#006564', checkinUrl: 'https://www.cathaypacific.com/cx/en_US/manage-booking/check-in.html' },
  { iata: 'JL', icao: 'JAL', name: 'Japan Airlines', callsign: 'JAPANAIR', country: 'Japan', color: '#CC0000', checkinUrl: 'https://www.jal.co.jp/ar/en/inter/boarding/checkin/' },
  { iata: 'NH', icao: 'ANA', name: 'All Nippon Airways', callsign: 'ALL NIPPON', country: 'Japan', color: '#10529C', checkinUrl: 'https://www.ana.co.jp/en/us/travel-information/online-check-in/' },
  { iata: 'QF', icao: 'QFA', name: 'Qantas', callsign: 'QANTAS', country: 'Australia', color: '#E0001B', checkinUrl: 'https://www.qantas.com/travel/airlines/check-in/' },
  { iata: 'AC', icao: 'ACA', name: 'Air Canada', callsign: 'AIR CANADA', country: 'Canada', color: '#D8232A', checkinUrl: 'https://www.aircanada.com/checkin' },
  { iata: 'VS', icao: 'VIR', name: 'Virgin Atlantic', callsign: 'VIRGIN', country: 'United Kingdom', color: '#C41230', checkinUrl: 'https://www.virginatlantic.com/flight-checkin' },
  { iata: 'TK', icao: 'THY', name: 'Turkish Airlines', callsign: 'TURKISH', country: 'Turkey', color: '#C70000', checkinUrl: 'https://www.turkishairlines.com/en-int/flights/check-in/' },
  { iata: 'LX', icao: 'SWR', name: 'Swiss International Air Lines', callsign: 'SWISS', country: 'Switzerland', color: '#E30613', checkinUrl: 'https://www.swiss.com/check-in' },
  { iata: 'IB', icao: 'IBE', name: 'Iberia', callsign: 'IBERIA', country: 'Spain', color: '#D6001C', checkinUrl: 'https://www.iberia.com/us/autocheckin-online/' },
  { iata: 'EY', icao: 'ETD', name: 'Etihad Airways', callsign: 'ETIHAD', country: 'United Arab Emirates', color: '#B3995D', checkinUrl: 'https://www.etihad.com/en-us/manage/check-in' },
  { iata: 'AI', icao: 'AIC', name: 'Air India', callsign: 'AIRINDIA', country: 'India', color: '#971317', checkinUrl: 'https://www.airindia.com/in/en/manage/web-checkin.html' },
  { iata: 'KE', icao: 'KAL', name: 'Korean Air', callsign: 'KOREANAIR', country: 'South Korea', color: '#002B66', checkinUrl: 'https://www.koreanair.com/contents/plan-your-travel/check-in/online-check-in' },
  { iata: 'LA', icao: 'LAN', name: 'LATAM Airlines', callsign: 'LAN', country: 'Chile', color: '#1B0088', checkinUrl: 'https://www.latamairlines.com/us/en/check-in' },
  { iata: 'AM', icao: 'AMX', name: 'Aeroméxico', callsign: 'AEROMEXICO', country: 'Mexico', color: '#0B2341', checkinUrl: 'https://aeromexico.com/en-us/check-in' },
  { iata: 'SK', icao: 'SAS', name: 'Scandinavian Airlines', callsign: 'SCANDINAVIAN', country: 'Sweden', color: '#000066', checkinUrl: 'https://www.flysas.com/en/checkin' },
  { iata: 'TP', icao: 'TAP', name: 'TAP Air Portugal', callsign: 'AIR PORTUGAL', country: 'Portugal', color: '#1B6535', checkinUrl: 'https://www.flytap.com/en-us/check-in' },
  { iata: 'NZ', icao: 'ANZ', name: 'Air New Zealand', callsign: 'NEW ZEALAND', country: 'New Zealand', color: '#000000', checkinUrl: 'https://www.airnewzealand.com/online-check-in' },
  { iata: 'AV', icao: 'AVA', name: 'Avianca', callsign: 'AVIANCA', country: 'Colombia', color: '#E01933', checkinUrl: 'https://www.avianca.com/en/check-in/' }
];

// Helper to deduce airline from flight callsign or ICAO
function getAirlineByCallsign(callsign) {
  if (!callsign) return null;
  const clean = callsign.trim().toUpperCase();
  for (const airline of AIRLINES_DATA) {
    if (clean.startsWith(airline.icao) || clean.startsWith(airline.iata)) {
      return airline;
    }
  }
  return null;
}
