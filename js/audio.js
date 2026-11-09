// AeroTrack Pro - Aviation Audio Synthesizer (Procedural Web Audio API)
class AviationAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.atcChatterEnabled = false;
    this.atcTimer = null;
    this.engineHumNode = null;
    this.engineHumGain = null;
    this.engineHumActive = false;

    // Unlock Web Audio API automatically on the first user interaction
    const unlockAudio = () => {
      this.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play realistic VHF radio squelch burst
  playRadioSquelch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.12; // 120ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {
      // Audio error silently ignored
    }
  }

  // Radar target lock / selection blip
  playRadarBlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  // Classic Boeing/Airbus cabin two-tone chime (Ding-Dong)
  playCabinChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const playTone = (freq, time, dur) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur + 0.05);
      };

      const now = this.ctx.currentTime;
      playTone(659.25, now, 0.7);        // E5
      playTone(523.25, now + 0.35, 1.0);  // C5
    } catch (e) {}
  }

  // Emergency squawk 7700 alert
  playCautionAlert() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + (i * 0.18);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      }
    } catch (e) {}
  }

  // Toggle synthesized ATC chatter
  toggleAtcChatter(enable) {
    this.atcChatterEnabled = enable;
    if (this.atcTimer) {
      clearInterval(this.atcTimer);
      this.atcTimer = null;
    }

    if (enable) {
      this.playProceduralAtcTransmission();
      this.atcTimer = setInterval(() => {
        if (this.atcChatterEnabled && Math.random() > 0.4) {
          this.playProceduralAtcTransmission();
        }
      }, 14000);
    }
  }

  playProceduralAtcTransmission() {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    this.playRadioSquelch();

    const phrases = [
      "Speedbird 1 1 7, radar contact, climb and maintain flight level 3 8 0.",
      "Delta 4 1 2, turn left heading 2 4 0, cleared ILS runway 2 2 right.",
      "Emirates 2 0 1 heavy, descend to 7 0 0 0 feet, contact tower on 1 1 8 point 7.",
      "United 8 8 3, direct WAYPOINT MERIT, maintain 3 0 0 knots or greater.",
      "Air France 0 0 6, wind 2 8 0 at 1 4 knots, runway 2 6 left cleared to land.",
      "Lufthansa 4 0 0, squawk 4 5 1 2, ident.",
      "Singapore 3 2 1 heavy, expedite climb through flight level 2 4 0.",
      "Qantas 1 1, contact oceanic control on 1 3 2 point 9, good day."
    ];

    setTimeout(() => {
      try {
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 0.45;
        
        utterance.onend = () => {
          setTimeout(() => this.playRadioSquelch(), 100);
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }, 200);
  }

  // Realistic low-frequency cockpit/cabin hum generator (Pink noise + Lowpass filter)
  toggleEngineHum(enable) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (!enable) {
      if (this.engineHumGain) {
        this.engineHumGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.engineHumNode) {
            this.engineHumNode.stop();
            this.engineHumNode.disconnect();
            this.engineHumNode = null;
          }
        }, 600);
      }
      this.engineHumActive = false;
      return;
    }

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.15;
      }

      this.engineHumNode = this.ctx.createBufferSource();
      this.engineHumNode.buffer = buffer;
      this.engineHumNode.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 160;

      this.engineHumGain = this.ctx.createGain();
      this.engineHumGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.engineHumGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);

      this.engineHumNode.connect(lowpass);
      lowpass.connect(this.engineHumGain);
      this.engineHumGain.connect(this.ctx.destination);

      this.engineHumNode.start();
      this.engineHumActive = true;
    } catch (e) {}
  }

  // Play VOR/Airport Morse Code audio identifier
  playAirportMorse(iata) {
    if (!this.enabled || !iata) return;
    this.init();
    if (!this.ctx) return;

    const morseDict = {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..'
    };

    try {
      const code = iata.toUpperCase().split('').map(c => morseDict[c] || '').join(' ');
      const dotDur = 0.07;
      let t = this.ctx.currentTime + 0.05;

      for (const char of code) {
        if (char === '.' || char === '-') {
          const dur = char === '.' ? dotDur : dotDur * 3;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1020, t); // Standard 1020 Hz VOR ident
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.06, t + 0.005);
          gain.gain.setValueAtTime(0.06, t + dur - 0.005);
          gain.gain.linearRampToValueAtTime(0, t + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.01);
          t += dur + dotDur;
        } else if (char === ' ') {
          t += dotDur * 2;
        }
      }
    } catch (e) {}
  }
}

window.aviationAudio = new AviationAudio();

