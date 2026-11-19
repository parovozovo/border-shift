  // Warm Cinematic Web Audio Engine (Filtered Analog Pads + Realistic Foley SFX)
  class WebAudioEngine {
    constructor() {
      this.ctx = null;
      this.noiseBuf = null;
      this.musicEnabled = true;
      this.mood = "CALM_DARK";
      this.musicInterval = null;
      this.chordStep = 0;
      this._ensuring = false;
    }

    ensureCtx() {
      if (this._ensuring) return;
      this._ensuring = true;
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
            const sr = this.ctx.sampleRate;
            this.noiseBuf = this.ctx.createBuffer(1, sr, sr);
            const data = this.noiseBuf.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < sr; i++) {
              const white = Math.random() * 2 - 1;
              b0 = 0.997 * b0 + white * 0.029;
              b1 = 0.985 * b1 + white * 0.032;
              b2 = 0.950 * b2 + white * 0.048;
              data[i] = (b0 + b1 + b2 + white * 0.04) * 0.35;
            }
          }
        }
        if (this.ctx && this.ctx.state === "suspended" && typeof this.ctx.resume === "function") {
          this.ctx.resume().catch(() => {});
        }
        if (!this.musicInterval && this.ctx) {
          this.startMusicLoop();
        }
      } catch (_) {} finally {
        this._ensuring = false;
      }
    }

    playNoiseBurst(durationSec, filterType, cutoffHz, qVal, gainVal) {
      try {
        this.ensureCtx();
        if (!this.ctx || !this.noiseBuf) return;
        const now = this.ctx.currentTime;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(cutoffHz, now);
        filter.Q.setValueAtTime(qVal, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(now);
        src.stop(now + durationSec);
      } catch (_) {}
    }

    playWarmNote(freq, durationSec, attackSec = 0.02, cutoffHz = 900, gainVal = 0.06, wave = "triangle") {
      try {
        this.ensureCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(cutoffHz, now);
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + attackSec);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + durationSec);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec);
      } catch (_) {}
    }

    playApprove() {
      this.playNoiseBurst(0.065, "bandpass", 420, 2.2, 0.25);
      this.playWarmNote(92, 0.11, 0.005, 220, 0.16, "sine");
      setTimeout(() => {
        this.playWarmNote(293.66, 0.22, 0.015, 800, 0.055, "triangle");
        this.playWarmNote(440.0, 0.28, 0.02, 850, 0.05, "sine");
      }, 55);
    }

    playDeny() {
      this.playNoiseBurst(0.075, "bandpass", 340, 2.0, 0.28);
      this.playWarmNote(78, 0.14, 0.005, 180, 0.18, "sine");
      setTimeout(() => {
        this.playWarmNote(196.0, 0.26, 0.015, 500, 0.06, "triangle");
        this.playWarmNote(185.0, 0.30, 0.02, 460, 0.05, "sine");
      }, 50);
    }

    playDetain() {
      this.playNoiseBurst(0.05, "bandpass", 1400, 3.5, 0.18);
      setTimeout(() => {
        this.playWarmNote(587.33, 0.14, 0.01, 1100, 0.065, "triangle");
        setTimeout(() => {
          this.playWarmNote(440.0, 0.18, 0.01, 1000, 0.065, "triangle");
          this.playNoiseBurst(0.04, "bandpass", 1300, 3.5, 0.14);
        }, 120);
      }, 45);
    }

    playBribe() {
      this.playNoiseBurst(0.08, "highpass", 1600, 1.2, 0.12);
      this.playWarmNote(523.25, 0.22, 0.015, 1100, 0.045, "sine");
      setTimeout(() => this.playWarmNote(659.25, 0.28, 0.02, 1200, 0.045, "sine"), 75);
    }

    playTap() {
      this.playNoiseBurst(0.045, "bandpass", 1100, 1.8, 0.14);
    }

    playKnock() {
      this.playNoiseBurst(0.055, "bandpass", 650, 2.8, 0.28);
      this.playWarmNote(115, 0.08, 0.004, 240, 0.16, "sine");
      setTimeout(() => {
        this.playNoiseBurst(0.055, "bandpass", 680, 2.8, 0.26);
        this.playWarmNote(122, 0.08, 0.004, 240, 0.15, "sine");
      }, 135);
    }

    playCoffee() {
      this.playWarmNote(1174.66, 0.12, 0.008, 1600, 0.045, "sine");
      setTimeout(() => this.playWarmNote(1479.98, 0.18, 0.01, 1800, 0.04, "sine"), 85);
    }

    playUvSwitch() {
      this.playNoiseBurst(0.025, "highpass", 1900, 2.2, 0.15);
      this.playWarmNote(620, 0.07, 0.005, 1400, 0.03, "triangle");
    }

    playDogSniff() {
      this.playNoiseBurst(0.06, "bandpass", 950, 1.5, 0.2);
      setTimeout(() => this.playWarmNote(310, 0.09, 0.01, 700, 0.07, "triangle"), 70);
      setTimeout(() => this.playWarmNote(370, 0.11, 0.01, 750, 0.07, "triangle"), 180);
    }

    playComboChime(combo) {
      const step = Math.min(8, Math.max(0, (combo || 3) - 3));
      const root = 523.25 * Math.pow(1.06, step);
      this.playWarmNote(root, 0.14, 0.008, 1600, 0.055, "triangle");
      setTimeout(() => this.playWarmNote(root * 1.25, 0.16, 0.01, 1800, 0.05, "sine"), 65);
      setTimeout(() => this.playWarmNote(root * 1.5, 0.24, 0.01, 2000, 0.05, "sine"), 130);
    }

    playWarn() {
      this.playWarmNote(311.13, 0.13, 0.01, 800, 0.065, "triangle");
      setTimeout(() => this.playWarmNote(233.08, 0.22, 0.01, 650, 0.06, "triangle"), 125);
    }

    playSiren() {
      try {
        this.ensureCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(195, now);
        osc1.frequency.exponentialRampToValueAtTime(345, now + 1.1);
        osc1.frequency.exponentialRampToValueAtTime(215, now + 2.3);

        osc2.frequency.setValueAtTime(198, now);
        osc2.frequency.exponentialRampToValueAtTime(350, now + 1.1);
        osc2.frequency.exponentialRampToValueAtTime(218, now + 2.3);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(460, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.35);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.4);
        osc2.stop(now + 2.4);
      } catch (_) {}
    }

    startMusicLoop() {
      if (this.musicInterval) return;
      const themes = {
        // Original checkpoint booth progression (kept as loved!)
        BOOTH: [
          [146.83, 220.00, 261.63, 329.63],
          [116.54, 174.61, 220.00, 293.66],
          [98.00,  146.83, 174.61, 261.63],
          [110.00, 164.81, 196.00, 277.18]
        ],
        // Atmospheric night border main menu theme (Cm -> Ab -> Eb -> G)
        MENU: [
          [130.81, 196.00, 233.08, 311.13],
          [103.83, 155.56, 207.65, 261.63],
          [155.56, 233.08, 293.66, 392.00],
          [98.00,  146.83, 196.00, 246.94]
        ],
        // Warm, cozy late-night home / evening theme (Am -> F -> C -> E7)
        EVENING: [
          [110.00, 164.81, 220.00, 261.63],
          [87.31,  174.61, 220.00, 261.63],
          [130.81, 196.00, 261.63, 329.63],
          [82.41,  164.81, 207.65, 293.66]
        ],
        // Cinematic epilogue / ending theme (Em -> C -> G -> D)
        ENDING: [
          [164.81, 246.94, 293.66, 392.00],
          [130.81, 196.00, 246.94, 329.63],
          [196.00, 293.66, 369.99, 440.00],
          [146.83, 220.00, 293.66, 369.99]
        ]
      };

      const playPadSlice = () => {
        try {
          if (!this.musicEnabled || !this.ctx || this.ctx.state !== "running" || document.hidden) return;
          const m = this.mood || "MENU";
          const isTense = m === "TENSE";
          const isBooth = m === "BOOTH_NORMAL";
          const isMenu = m === "MENU";
          const isEvening = m === "EVENING";
          const isEnding = m === "ENDING";

          const bank = isMenu ? themes.MENU : (isEvening ? themes.EVENING : (isEnding ? themes.ENDING : themes.BOOTH));
          const chord = bank[this.chordStep % bank.length];
          this.chordStep = (this.chordStep + 1) % bank.length;

          const cutoff = isTense ? 520 : (isBooth ? 420 : (isEnding ? 560 : (isEvening ? 460 : 340)));

          chord.forEach((freq, idx) => {
            const voiceGain = idx === 0 ? (isEvening ? 0.018 : 0.022) : 0.011;
            this.playWarmNote(freq, 3.5, 1.2, cutoff, voiceGain, idx === 0 ? "sine" : "triangle");
          });

          if (isMenu) {
            // Subtle night watchtower arpeggio notes
            const n1 = chord[2] * 2;
            const n2 = chord[3] * 2;
            setTimeout(() => {
              if (!this.musicEnabled || document.hidden || this.mood !== "MENU") return;
              this.playWarmNote(n1, 1.3, 0.05, 500, 0.012, "sine");
            }, 900);
            setTimeout(() => {
              if (!this.musicEnabled || document.hidden || this.mood !== "MENU") return;
              this.playWarmNote(n2, 1.6, 0.05, 520, 0.011, "sine");
            }, 1900);
          } else if (isEvening) {
            // Warm home electric-piano style gentle chimes
            const notes = [chord[1] * 2, chord[2] * 2, chord[3] * 2];
            notes.forEach((nf, ni) => {
              setTimeout(() => {
                if (!this.musicEnabled || document.hidden || this.mood !== "EVENING") return;
                this.playWarmNote(nf, 1.5, 0.03, 720, 0.012, "triangle");
              }, 700 + ni * 850);
            });
          } else if (isEnding) {
            // Cinematic epilogue 3-note motif
            const motif = [chord[3], chord[2] * 2, chord[3] * 2];
            motif.forEach((ef, ei) => {
              setTimeout(() => {
                if (!this.musicEnabled || document.hidden || this.mood !== "ENDING") return;
                this.playWarmNote(ef, 2.1, 0.06, 820, 0.015, "sine");
              }, 500 + ei * 950);
            });
          } else if (isBooth || isTense) {
            const melodyFreq = chord[(this.chordStep + 1) % chord.length] * 2;
            setTimeout(() => {
              if (!this.musicEnabled || document.hidden) return;
              this.playWarmNote(melodyFreq, 1.4, 0.04, 620, 0.016, "sine");
            }, 1200);
          }

          if (isTense) {
            this.playWarmNote(55.0, 0.35, 0.02, 130, 0.085, "sine");
            setTimeout(() => {
              if (!this.musicEnabled || document.hidden) return;
              this.playWarmNote(52.0, 0.42, 0.02, 120, 0.065, "sine");
            }, 320);
          }
        } catch (_) {}
      };

      // Assign interval BEFORE initial slice so ensureCtx() never re-enters startMusicLoop()!
      this.musicInterval = setInterval(playPadSlice, 3600);
      playPadSlice();
    }
  }

  const audio = new WebAudioEngine();
