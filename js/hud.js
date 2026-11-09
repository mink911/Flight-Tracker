// AeroTrack Pro - Cockpit Primary Flight Display (HUD / PFD) Engine

class CockpitHUD {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.flight = null;
    this.pitch = 0;       // Degrees (-20 to +20)
    this.roll = 0;        // Degrees (-45 to +45)
    this.smoothPitch = 0;
    this.smoothRoll = 0;
    this.smoothHeading = 0;
    this.smoothSpeed = 0;
    this.smoothAlt = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startRenderLoop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio || 400;
    this.canvas.height = rect.height * window.devicePixelRatio || 280;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  setFlight(flight) {
    this.flight = flight;
    if (flight) {
      // Calculate realistic simulated pitch from vertical rate
      // e.g. +2000 fpm -> +4 deg pitch, -1500 fpm -> -3 deg pitch
      const targetPitch = Math.max(-10, Math.min(12, (flight.verticalRate || 0) / 450));
      this.pitch = targetPitch;
      this.roll = 0;
    }
  }

  startRenderLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  draw() {
    if (!this.ctx || !this.width) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Smooth interpolations
    if (this.flight) {
      const targetPitch = Math.max(-12, Math.min(15, (this.flight.verticalRate || 0) / 400));
      this.smoothPitch += (targetPitch - this.smoothPitch) * 0.08;
      this.smoothHeading += ((this.flight.heading || 0) - this.smoothHeading) * 0.1;
      this.smoothSpeed += ((this.flight.speed || 0) - this.smoothSpeed) * 0.1;
      this.smoothAlt += ((this.flight.altitude || 0) - this.smoothAlt) * 0.1;
    }

    ctx.clearRect(0, 0, w, h);

    // 1. Artificial Horizon Background (Sky & Ground)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.rotate((this.smoothRoll * Math.PI) / 180);

    const pitchOffset = this.smoothPitch * 7; // 7 pixels per degree
    ctx.translate(0, pitchOffset);

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, -h * 1.5, 0, 0);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-w * 1.5, -h * 2, w * 3, h * 2);

    // Ground Gradient
    const groundGrad = ctx.createLinearGradient(0, 0, 0, h * 1.5);
    groundGrad.addColorStop(0, '#78350f');
    groundGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(-w * 1.5, 0, w * 3, h * 2);

    // Horizon Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-w * 1.5, 0);
    ctx.lineTo(w * 1.5, 0);
    ctx.stroke();

    // Pitch Ladder
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1.8;

    for (let deg = -30; deg <= 30; deg += 5) {
      if (deg === 0) continue;
      const y = -deg * 7;
      const lineLen = deg % 10 === 0 ? 55 : 30;

      ctx.beginPath();
      // Left bar
      ctx.moveTo(-lineLen, y);
      ctx.lineTo(-18, y);
      if (deg > 0) ctx.lineTo(-18, y + 4); // Chevron down for nose up
      else ctx.lineTo(-18, y - 4);
      // Right bar
      ctx.moveTo(18, y);
      ctx.lineTo(lineLen, y);
      if (deg > 0) ctx.lineTo(18, y + 4);
      else ctx.lineTo(18, y - 4);
      ctx.stroke();

      if (deg % 10 === 0) {
        ctx.fillText(Math.abs(deg).toString(), -lineLen - 12, y + 4);
        ctx.fillText(Math.abs(deg).toString(), lineLen + 12, y + 4);
      }
    }

    ctx.restore();

    // 2. Center Aircraft Watermark / Reticle
    ctx.strokeStyle = '#fbbf24'; // Aviation yellow
    ctx.fillStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Left wing
    ctx.moveTo(cx - 50, cy);
    ctx.lineTo(cx - 20, cy);
    ctx.lineTo(cx - 20, cy + 8);
    // Right wing
    ctx.moveTo(cx + 20, cy + 8);
    ctx.lineTo(cx + 20, cy);
    ctx.lineTo(cx + 50, cy);
    // Center pip
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Airspeed Tape (Left Side)
    const tapeW = 55;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(10, 30, tapeW, h - 70);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(10, 30, tapeW, h - 70);

    // Speed marks
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    const curSpd = this.smoothSpeed;
    const spdBase = Math.floor(curSpd / 10) * 10;

    for (let s = spdBase - 40; s <= spdBase + 40; s += 10) {
      if (s < 0) continue;
      const y = cy - (s - curSpd) * 2.8;
      if (y >= 35 && y <= h - 45) {
        ctx.beginPath();
        ctx.moveTo(10 + tapeW - 8, y);
        ctx.lineTo(10 + tapeW, y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillText(s.toString(), 10 + tapeW - 12, y + 3);
      }
    }

    // Current Speed Readout Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, cy - 14, tapeW + 4, 28);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, cy - 14, tapeW + 4, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(curSpd).toString(), 8 + (tapeW + 4) / 2, cy + 5);

    // Speed Label & Mach
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px sans-serif';
    ctx.fillText('GS KTS', 10 + tapeW / 2, 24);
    const mach = (curSpd / 573).toFixed(2);
    ctx.fillText(`M ${mach}`, 10 + tapeW / 2, h - 25);

    // 4. Altitude Tape (Right Side)
    const altX = w - tapeW - 10;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(altX, 30, tapeW + 5, h - 70);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(altX, 30, tapeW + 5, h - 70);

    // Altitude marks
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    const curAlt = this.smoothAlt;
    const altBase = Math.floor(curAlt / 500) * 500;

    for (let a = altBase - 1500; a <= altBase + 1500; a += 500) {
      if (a < 0) continue;
      const y = cy - (a - curAlt) * 0.055;
      if (y >= 35 && y <= h - 45) {
        ctx.beginPath();
        ctx.moveTo(altX, y);
        ctx.lineTo(altX + 8, y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillText((a / 100).toString(), altX + 12, y + 3);
      }
    }

    // Current Altitude Readout Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(altX - 4, cy - 14, tapeW + 9, 28);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(altX - 4, cy - 14, tapeW + 9, 28);
    ctx.fillStyle = '#22c55e'; // Green digits
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(curAlt).toString(), altX + (tapeW + 5) / 2, cy + 5);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px sans-serif';
    ctx.fillText('ALT FT', altX + tapeW / 2, 24);
    ctx.fillText('STD 29.92', altX + tapeW / 2, h - 25);

    // 5. Compass Heading Tape (Bottom)
    const compY = h - 22;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(cx - 80, compY - 14, 160, 26);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(cx - 80, compY - 14, 160, 26);

    const curHdg = (Math.round(this.smoothHeading) + 360) % 360;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';

    let cardinal = 'N';
    if (curHdg >= 23 && curHdg < 68) cardinal = 'NE';
    else if (curHdg >= 68 && curHdg < 113) cardinal = 'E';
    else if (curHdg >= 113 && curHdg < 158) cardinal = 'SE';
    else if (curHdg >= 158 && curHdg < 203) cardinal = 'S';
    else if (curHdg >= 203 && curHdg < 248) cardinal = 'SW';
    else if (curHdg >= 248 && curHdg < 293) cardinal = 'W';
    else if (curHdg >= 293 && curHdg < 338) cardinal = 'NW';

    ctx.fillText(`HDG ${curHdg.toString().padStart(3, '0')}° ${cardinal}`, cx, compY + 4);

    // 6. Flight Mode Annunciator (Top Banner)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(cx - 120, 4, 240, 20);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeRect(cx - 120, 4, 240, 20);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#10b981'; // Green FMA active
    ctx.fillText('SPD', cx - 90, 18);
    ctx.fillText('LNAV', cx - 30, 18);
    ctx.fillText('VNAV PTH', cx + 40, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('AP1', cx + 95, 18);
  }
}

window.CockpitHUD = CockpitHUD;

