# AeroTrack Pro - Global Flight Radar & Live ADS-B Tracker ✈️

A modern, high-performance real-time flight tracking web application inspired by Flightradar24 and FlightAware. AeroTrack Pro features interactive tactical radar maps, dynamic Great Circle route projections, live cockpit HUD telemetry, airport terminal FIDS boards, and procedural aviation audio.

![AeroTrack Pro](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

### 1. 🗺️ Global Tactical Radar Map
- **Leaflet Vector Maps**: Switch between **Radar Dark**, **Aviation Satellite Imagery (Esri)**, and **Aviation Day**.
- **Live Doppler Weather Radar**: Integrated real-time storm cells and precipitation radar overlay powered by the RainViewer API (100% free, no key required).
- **Real-Time Aircraft Silhouettes**: Aircraft markers rendered in SVG, rotated precisely to the aircraft's current true heading ($\theta$).
- **Anti-Meridian Splitting**: Seamless transpacific routes (Tokyo/Sydney to Los Angeles) across the $\pm 180^\circ$ dateline.
- **Altitude-Based Color Coding**:
  - 🟢 **Green**: Low / Takeoff / Approach (< 5,000 ft)
  - 🟡 **Amber**: Climb / Descent transition (5,000 - 18,000 ft)
  - 🔵 **Cyan**: High Cruise Level (18,000 - 34,000 ft)
  - 🟣 **Magenta**: Super Cruise (> 34,000 ft)
- **Great Circle Geodesic Trajectory**: Calculates and displays true spherical navigation curves between origin and destination with real-time waypoint breadcrumbs.
- **Solar Terminator Shadow**: Live day/night terminator line showing where dusk/night falls across the planet.

### 2. 🛩️ Cockpit Primary Flight Display (HUD / PFD)
- High-frame-rate Canvas Primary Flight Display:
  - **Artificial Horizon**: Pitch ladder degrees and bank roll pointer reflecting aircraft climb/descent rates.
  - **Airspeed Tape**: Calibrated airspeed tape with digital readout box and Mach number estimate.
  - **Altitude Tape**: Rolling altitude tape and barometric standard pressure indicator.
  - **Compass Heading Tape**: Digital 360° magnetic bearing with cardinal compass reference (e.g., `HDG 284° WNW`).
  - **Flight Mode Annunciator (FMA)**: `LNAV`, `VNAV PTH`, `SPD`, `AP1 ENGAGED`.
- **Chase Camera Mode (Follow Plane)**: Locks map camera onto the tracked aircraft in flight.

### 3. 🏢 Airport FIDS Terminal Boards (Flight Information Display System)
- Click any major airport hub on the map or select from the dropdown (JFK, LHR, HND, DXB, SIN, CDG, LAX, SYD, FRA, etc.).
- Switch between **Departures** and **Arrivals**.
- Real-time status indicators: `ON TIME`, `APPROACHING`, `DEPARTED`, `EN ROUTE`.
- Instant `Track ➔` button to focus the radar directly onto any departing or arriving flight.
- Live simulated airport weather & **METAR** report (temperature, wind direction/speed, barometric altimeter, sky conditions).

### 4. 📻 Procedural Aviation Audio Synthesizer
- Built with the **Web Audio API** (zero external sound files required):
  - **VHF Radio Squelch & Mic Click**: Realistic frequency-filtered noise bursts.
  - **Radar Target Lock Ping**: Resonant chirp when selecting aircraft.
  - **Cabin Ding-Dong Chime**: Boeing/Airbus two-tone passenger alert.
  - **Emergency Caution Chime**: Squawk 7700 alert.
  - **Airport VOR/NDB Morse Code**: Audio identifier transmitted upon clicking any airport beacon.
  - **Cabin & Jet Engine Hum**: Soothing ambient low-pass pink noise background rumble.
  - **Procedural ATC Radio Chatter**: Real simulated Air Traffic Control voice transmissions using Web Speech API synthesis.

### 5. 📅 Flight Search, Calendar Export & 2-Day Reminder ([`flight-calendar.html`](flight-calendar.html))
- **Flight Number Search**: Enter any commercial flight number (e.g. `DL412`, `BA117`, `EK201`, `SQ321`, `UA960`, `AA100`) and choose your departure date.
- **Automatic 2-Day Pre-Flight Reminder**: Calculates the exact timestamp 48 hours prior to departure ($T - 48\text{h}$).
- **1-Click Google Calendar**: Pre-fills flight number, terminals, gates, and departure airport location.
- **Apple Calendar & Outlook (.ICS File)**: Implements standard RFC 5545 with embedded `VALARM` set to `TRIGGER:-P2D` (alerts you 2 days before the flight on iPhone, Mac, Windows, and Android).
- **Web Push Notifications**: Desktop browser alert scheduled for 48 hours before takeoff.
- **My Trips Dashboard**: Live countdown to departure and persistent flight itinerary saved in `localStorage`.

### 6. 🚀 Custom Flight Creator & Simulation
- **Spawn Flight Tool**: Inject custom aircraft (Concorde, A380, F-16, VIP jet) on any global route with custom speeds and cruise levels.

### 5. 🔍 Multi-Parameter Search & Filter Engine
- Filter by:
  - **Flight Number** (e.g. `BA117`, `DL412`, `EK201`)
  - **Airline** (e.g. Delta, Emirates, British Airways, Singapore Airlines, Lufthansa)
  - **Airport Code / City** (e.g. `JFK`, `LHR`, `Tokyo`, `Paris`)
  - **Flight Status** (`Climbing`, `Cruising`, `Descending`)
  - **Altitude Range Slider** (`0 - 50,000 ft`)
  - **ICAO24 Transponder Hex Address**

### 6. 🌐 Dual-Mode Data Architecture
1. **Simulation Fleet Mode (Offline / Standalone)**:
   - 120+ active commercial flights across North America, Europe, Asia, Middle East, Oceania, and Latin America.
   - Realistic Great Circle physics, turnaround logic, and dynamic wind/ground speed variances.
   - Works immediately out-of-the-box just by opening `index.html`!
2. **Live ADS-B Network Mode (OpenSky Network)**:
   - Queries OpenSky Network REST API via the included local PowerShell proxy (`server.ps1`).
   - Automatically enriches real-time ADS-B transponder data with airline profiles, logos, and flight routes.

---

## 🚀 Quick Start

### Method 1: One-Click Windows Launch (Recommended)
Double-click `start.bat` in the project directory:
```batch
start.bat
```
This automatically starts the local HTTP server and OpenSky ADS-B proxy on `http://localhost:8080` and launches your default web browser!

### Method 2: PowerShell Server
Open PowerShell in the `Flight-tracker` folder and run:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```

### Method 3: Direct Browser Open (No Server Needed)
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari). The simulation fleet, HUD, airport boards, filters, and audio will work 100% offline!

### Method 4: Free Hosting on GitHub Pages 🌐
This project is built to run 100% client-side with zero backend required:
1. Push your repository to GitHub (`mink911/Flight-Tracker`).
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Branch**, select `main` and root `/` folder, then click **Save**.
4. Your website will be live worldwide at: `https://mink911.github.io/Flight-Tracker/`!

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Esc` | Close flight details panel or airport modal |
| `F` | Toggle Chase Camera (follow selected flight) |
| `Space` | Center map on active flight |

---

## 📁 File Structure

```
Flight-tracker/
├── index.html            # Main single-page application
├── css/
│   └── styles.css        # Aviation radar UI, HUD, glassmorphism, responsive styles
├── js/
│   ├── app.js            # Main application controller, UI event handling
│   ├── map.js            # Leaflet radar map, rotated SVG markers, day/night terminator
│   ├── flight-engine.js  # Great Circle spherical math, physics, OpenSky ADS-B parser
│   ├── airports-data.js  # Global database of major international airports
│   ├── airlines-data.js  # Global airlines database with callsigns and liveries
│   ├── hud.js            # Cockpit Primary Flight Display (PFD) HUD canvas engine
│   └── audio.js          # Procedural Web Audio API aviation synthesizer
├── server.ps1            # Lightweight PowerShell HTTP server & OpenSky CORS proxy
├── start.bat             # Windows one-click launcher
└── README.md             # Documentation
```

---

## 🛡️ License
MIT License. Built for aviation enthusiasts and developers.

