  // ★ BESPOKE ANIMATED NIGHT CHECKPOINT MENU PANORAMA ★
  let menuAnimRaf = null;
  function stopMenuAnimation() {
    if (menuAnimRaf && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(menuAnimRaf);
    }
    menuAnimRaf = null;
  }

  function drawMenuPanorama(canvas, tSec = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Deep Evening Border Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, "#091017");
    sky.addColorStop(0.55, "#162630");
    sky.addColorStop(1, "#2A3C38");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Subtle stars + Moon
    [[42, 20], [112, 34], [184, 15], [268, 28], [344, 18], [406, 26]].forEach(([sx, sy], i) => {
      const alpha = 0.35 + 0.35 * Math.sin(tSec * 1.6 + i * 1.4);
      ctx.fillStyle = `rgba(255, 248, 225, ${alpha.toFixed(2)})`;
      ctx.fillRect(sx, sy, 1.8, 1.8);
    });
    ctx.beginPath();
    ctx.arc(w * 0.13, 30, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#EFE2BD";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.13 + 4, 27, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#111C24";
    ctx.fill();

    // 2. Smooth Layered Mountain Horizon + Watchtower Searchlight & Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    for (let ci = 0; ci < 3; ci++) {
      const clx = ((tSec * (6 + ci * 2) + ci * 140) % (w + 90)) - 45;
      ctx.beginPath(); ctx.ellipse(clx, 26 + ci * 14, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = "#1A2925";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.quadraticCurveTo(w * 0.16, h * 0.38, w * 0.36, h * 0.56);
    ctx.quadraticCurveTo(w * 0.56, h * 0.34, w * 0.78, h * 0.54);
    ctx.quadraticCurveTo(w * 0.90, h * 0.44, w, h * 0.58);
    ctx.lineTo(w, h * 0.64);
    ctx.closePath();
    ctx.fill();

    // Watchtower + rotating searchlight beam
    ctx.fillStyle = "#0E1714";
    ctx.fillRect(w * 0.44, h * 0.25, 6, h * 0.34);
    ctx.fillRect(w * 0.41, h * 0.21, 13, 10);
    const sweepX = Math.sin(tSec * 1.1) * 70;
    const beamGrad = ctx.createLinearGradient(w * 0.44, h * 0.26, w * 0.28 + sweepX, h * 0.72);
    beamGrad.addColorStop(0, "rgba(255, 245, 157, 0.22)");
    beamGrad.addColorStop(1, "rgba(255, 245, 157, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.26);
    ctx.lineTo(w * 0.16 + sweepX, h * 0.72);
    ctx.lineTo(w * 0.40 + sweepX, h * 0.72);
    ctx.closePath();
    ctx.fill();

    // Distant treeline band
    ctx.fillStyle = "#111A17";
    ctx.fillRect(0, h * 0.57, w, h * 0.08);

    // 3. Frontier Highway Asphalt
    const roadGrad = ctx.createLinearGradient(0, h * 0.63, 0, h);
    roadGrad.addColorStop(0, "#1E2523");
    roadGrad.addColorStop(1, "#121615");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, h * 0.63, w, h * 0.37);
    ctx.fillStyle = "#2F3A35";
    ctx.fillRect(0, h * 0.63, w, 2.5);

    ctx.strokeStyle = "rgba(224, 177, 69, 0.38)";
    ctx.setLineDash([16, 12]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85);
    ctx.lineTo(w, h * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Checkpoint Canopy & Booth on Right + Rotating Roof Radar + Signal Lamp
    ctx.fillStyle = "#24302A";
    ctx.fillRect(w * 0.68, h * 0.34, w * 0.27, h * 0.36);
    ctx.fillStyle = "#141B18";
    ctx.fillRect(w * 0.64, h * 0.28, w * 0.34, 11);
    // Rotating radar dish on booth canopy roof
    const dishOsc = Math.sin(tSec * 2.4) * 5;
    ctx.strokeStyle = "#80DEEA";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(w * 0.80, h * 0.28); ctx.lineTo(w * 0.80, h * 0.16); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.80 + dishOsc * 0.35, h * 0.15, 6, Math.PI, 0); ctx.stroke();
    // Warm lit booth window + animated inspector silhouette
    const inspBob = Math.sin(tSec * 2.2) * 1.2;
    ctx.fillStyle = "#E0B145";
    ctx.fillRect(w * 0.73, h * 0.42, 54, 28);
    ctx.fillStyle = "#2A2018";
    ctx.beginPath(); ctx.arc(w * 0.79, h * 0.55 + inspBob, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(w * 0.768, h * 0.61 + inspBob * 0.5, 16, 9);

    // Checkpoint flag stripe (Blue / Yellow) & Glowing Signal Lamp
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(w * 0.66, h * 0.34, 4, 12);
    ctx.fillStyle = "#FBC02D";
    ctx.fillRect(w * 0.66, h * 0.34 + 12, 4, 12);

    // 5a. Distant Waiting Vehicle Silhouette on Left Queue
    const qCarX = w * 0.03, qCarY = h * 0.63 + Math.sin(tSec * 15) * 0.35;
    const qHead = ctx.createLinearGradient(qCarX + 54, qCarY + 14, qCarX + 100, qCarY + 18);
    qHead.addColorStop(0, "rgba(255, 240, 150, 0.20)");
    qHead.addColorStop(1, "rgba(255, 240, 150, 0)");
    ctx.fillStyle = qHead;
    ctx.beginPath();
    ctx.moveTo(qCarX + 54, qCarY + 11);
    ctx.lineTo(qCarX + 100, qCarY + 7);
    ctx.lineTo(qCarX + 100, qCarY + 23);
    ctx.lineTo(qCarX + 54, qCarY + 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#131B20";
    ctx.beginPath(); ctx.roundRect(qCarX, qCarY + 6, 56, 17, 4); ctx.fill();
    ctx.fillStyle = "#1E282E";
    ctx.beginPath(); ctx.roundRect(qCarX + 9, qCarY, 34, 9, 3); ctx.fill();
    ctx.fillStyle = "#D32F2F"; ctx.fillRect(qCarX + 1, qCarY + 10, 3, 4);
    ctx.fillStyle = "#FFF59D"; ctx.fillRect(qCarX + 52, qCarY + 11, 3, 4);

    // 5. Lead SUV at the Gate + Engine Vibration + Exhaust + Warm Headlight Cone
    const engineVib = Math.sin(tSec * 20) * 0.5;
    const carX = w * 0.25, carY = h * 0.60 + engineVib;
    for (let ep = 0; ep < 3; ep++) {
      const age = (tSec * 1.2 + ep * 0.33) % 1;
      ctx.fillStyle = `rgba(200, 215, 220, ${(1 - age) * 0.28})`;
      ctx.beginPath(); ctx.arc(carX - 4 - age * 20, carY + 26 - age * 14, 2.5 + age * 4.5, 0, Math.PI * 2); ctx.fill();
    }
    const headGrad = ctx.createLinearGradient(carX + 94, carY + 22, carX + 185, carY + 28);
    headGrad.addColorStop(0, "rgba(255, 240, 150, 0.34)");
    headGrad.addColorStop(1, "rgba(255, 240, 150, 0)");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(carX + 94, carY + 18);
    ctx.lineTo(carX + 185, carY + 12);
    ctx.lineTo(carX + 185, carY + 38);
    ctx.lineTo(carX + 94, carY + 26);
    ctx.closePath();
    ctx.fill();

    // SUV Body
    ctx.fillStyle = "#1A2328";
    ctx.beginPath(); ctx.roundRect(carX, carY + 10, 96, 26, 6); ctx.fill();
    ctx.fillStyle = "#28353C";
    ctx.beginPath(); ctx.roundRect(carX + 12, carY, 62, 14, 5); ctx.fill();
    ctx.fillStyle = "#0F161A";
    ctx.beginPath(); ctx.roundRect(carX + 18, carY + 3, 48, 8, 2); ctx.fill();
    // Wheels
    ctx.fillStyle = "#0B0D0E";
    [carX + 20, carX + 76].forEach(wx => {
      ctx.beginPath(); ctx.arc(wx, carY + 35, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#78909C";
      ctx.beginPath(); ctx.arc(wx, carY + 35, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0B0D0E";
    });
    // Taillight & Headlight
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(carX + 1, carY + 15, 4, 5);
    ctx.fillStyle = "#FFF59D";
    ctx.beginPath(); ctx.arc(carX + 92, carY + 20, 3.5, 0, Math.PI * 2); ctx.fill();

    // 6. Red-and-White Barrier Gate in front of the SUV + Signal Halo
    const barPostX = w * 0.56, barY = h * 0.63;
    ctx.fillStyle = "#37474F";
    ctx.fillRect(barPostX, h * 0.54, 10, 36);
    const pulse = 0.5 + 0.5 * Math.sin(tSec * 4.0);
    ctx.fillStyle = `rgba(255, 23, 68, ${(pulse * 0.25).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(barPostX + 5, h * 0.52, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 23, 68, ${pulse.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(barPostX + 5, h * 0.52, 4, 0, Math.PI * 2); ctx.fill();
    for (let s = 0; s < 6; s++) {
      ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
      ctx.fillRect(barPostX + 10 + s * 14, barY, 14, 5.5);
    }

    // Drifting night snow / dust particles
    ctx.fillStyle = "rgba(220, 238, 250, 0.36)";
    for (let sn = 0; sn < 18; sn++) {
      const sx = (sn * 29 + tSec * 18) % w;
      const sy = (sn * 19 + tSec * 28) % h;
      ctx.fillRect(sx, sy, 1.8, 1.8);
    }
  }

  function drawMorningBanner(canvas, dayNumber, tSec = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dawn gradient sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.68);
    sky.addColorStop(0, dayNumber >= 4 ? "#1A233A" : "#243B55");
    sky.addColorStop(1, "#D6824B");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rising sun glow
    const sunY = h * 0.54 - Math.sin(tSec * 0.8) * 2;
    ctx.fillStyle = "rgba(255, 224, 130, 0.25)";
    ctx.beginPath(); ctx.arc(w * 0.22, sunY, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD54F";
    ctx.beginPath(); ctx.arc(w * 0.22, sunY, 13, 0, Math.PI * 2); ctx.fill();

    // Horizon silhouettes + pine trees
    ctx.fillStyle = "#18221D";
    ctx.fillRect(0, h * 0.56, w, h * 0.44);
    for (let tx = 8; tx < w * 0.65; tx += 18) {
      ctx.beginPath(); ctx.moveTo(tx, h * 0.56); ctx.lineTo(tx + 6, h * 0.40); ctx.lineTo(tx + 12, h * 0.56); ctx.fill();
    }

    // Road + Checkpoint Canopy on right
    ctx.fillStyle = "#2A322E";
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    ctx.fillStyle = "#202824";
    ctx.fillRect(w * 0.66, h * 0.26, w * 0.28, h * 0.46);
    ctx.fillStyle = "#E0B145";
    ctx.fillRect(w * 0.70, h * 0.40, 34, 16);

    // Rotating radar dish on booth roof
    const radSweep = Math.sin(tSec * 3.0) * 6;
    ctx.strokeStyle = "#80DEEA";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.79, h * 0.26); ctx.lineTo(w * 0.79, h * 0.14); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.79 + radSweep * 0.4, h * 0.14, 6, Math.PI, 0); ctx.stroke();

    // Flag
    ctx.fillStyle = "#1565C0"; ctx.fillRect(w * 0.90, h * 0.14, 14, 5);
    ctx.fillStyle = "#FBC02D"; ctx.fillRect(w * 0.90, h * 0.19, 14, 5);
  }

  function drawOnboardingBanner(canvas, tabIdx, tSec = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (tabIdx === 0) {
      // Tab 0: Night arrival at Checkpoint "Zakhid-04"
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#0A1318");
      sky.addColorStop(1, "#1F2E28");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#131C18";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68);
      ctx.quadraticCurveTo(w * 0.25, h * 0.30, w * 0.52, h * 0.62);
      ctx.quadraticCurveTo(w * 0.78, h * 0.34, w, h * 0.65);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      // Searchlight beam
      const sweep = Math.sin(tSec * 1.4) * 55;
      const beam = ctx.createLinearGradient(w * 0.18, 12, w * 0.26 + sweep, h);
      beam.addColorStop(0, "rgba(255, 224, 130, 0.26)");
      beam.addColorStop(1, "rgba(255, 224, 130, 0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(w * 0.18, 12);
      ctx.lineTo(w * 0.10 + sweep, h);
      ctx.lineTo(w * 0.36 + sweep, h);
      ctx.closePath(); ctx.fill();
      // Road + Gate + Warm Booth Window
      ctx.fillStyle = "#111615"; ctx.fillRect(0, h * 0.70, w, h * 0.30);
      ctx.fillStyle = "#26332C"; ctx.fillRect(w * 0.70, h * 0.26, 78, h * 0.44);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(w * 0.74, h * 0.38, 36, 18);
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
        ctx.fillRect(w * 0.44 + s * 16, h * 0.67, 16, 5);
      }
      // Rain streaks
      ctx.strokeStyle = "rgba(180, 220, 235, 0.28)";
      ctx.lineWidth = 1;
      for (let r = 0; r < 18; r++) {
        const rx = (r * 27 + tSec * 45) % w;
        const ry = (r * 19 + tSec * 90) % h;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 8); ctx.stroke();
      }
    } else if (tabIdx === 1) {
      // Tab 1: State Agencies Command Radar (5 pulsing nodes)
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#0A1726");
      bg.addColorStop(1, "#112822");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(79, 195, 247, 0.18)";
      ctx.lineWidth = 1;
      for (let gx = 20; gx < w; gx += 28) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      const labels = ["ДПСК", "СБК", "ГУР-М", "ВСП", "НАБК"];
      const cols = ["#4CAF50", "#42A5F5", "#FFA726", "#AB47BC", "#EF5350"];
      labels.forEach((lbl, i) => {
        const nx = 46 + i * 82, ny = h * 0.48 + Math.sin(tSec * 2 + i) * 3;
        const ring = 14 + ((tSec * 14 + i * 4) % 10);
        ctx.strokeStyle = cols[i];
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(nx, ny, ring, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#101B24";
        ctx.beginPath(); ctx.arc(nx, ny, 14, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ECEFF1";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(lbl, nx, ny + 3);
      });
      ctx.textAlign = "left";
    } else if (tabIdx === 2) {
      // Tab 2: Shadow Players & Threats
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1C1414");
      bg.addColorStop(0.5, "#171D1A");
      bg.addColorStop(1, "#111420");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // Palych Envelope & Gold glow on left
      ctx.fillStyle = "#3E2723"; ctx.fillRect(28, 30, 62, 34);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(34, 38, 18, 12);
      ctx.fillStyle = "#81C784"; ctx.font = "bold 12px monospace"; ctx.fillText("$", 58, 52);
      // Tolik Sprinter van in middle
      const vanX = 166 + Math.sin(tSec * 3) * 2;
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.roundRect(vanX, 32, 86, 30, 5); ctx.fill();
      ctx.fillStyle = "#101618"; ctx.fillRect(vanX + 54, 37, 22, 11);
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(vanX + 18, 64, 6, 0, Math.PI * 2); ctx.arc(vanX + 68, 64, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFF59D"; ctx.fillRect(vanX + 82, 46, 4, 4);
      // FSM Target Reticle on right
      const rx = 345, ry = 44;
      ctx.strokeStyle = "#FF5252"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(rx, ry, 18 + Math.sin(tSec * 4) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 24, ry); ctx.lineTo(rx + 24, ry); ctx.moveTo(rx, ry - 24); ctx.lineTo(rx, ry + 24); ctx.stroke();
    } else {
      // Tab 3: Booth Desk & UV / Dog / Stamps
      ctx.fillStyle = "#3B291B"; ctx.fillRect(0, 0, w, h);
      // Cream document + purple UV beam
      ctx.fillStyle = "#F1E8D2"; ctx.fillRect(28, 16, 108, 58);
      ctx.fillStyle = "#4E342E"; ctx.fillRect(40, 26, 54, 6); ctx.fillRect(40, 38, 74, 4); ctx.fillRect(40, 48, 60, 4);
      const uvSweep = Math.sin(tSec * 2.5) * 22;
      ctx.fillStyle = "rgba(179, 136, 255, 0.30)";
      ctx.beginPath(); ctx.arc(82 + uvSweep, 45, 22, 0, Math.PI * 2); ctx.fill();
      // Sniffer Dog badge
      ctx.fillStyle = "#1D2621";
      ctx.beginPath(); ctx.roundRect(166, 20, 74, 48, 8); ctx.fill();
      ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "22px sans-serif"; ctx.fillText("🐕", 190, 52);
      // Three decision stamps
      [
        { x: 266, col: "#2E7D32", txt: "✔" },
        { x: 314, col: "#C62828", txt: "✖" },
        { x: 362, col: "#1565C0", txt: "🚨" }
      ].forEach(st => {
        ctx.fillStyle = st.col;
        ctx.beginPath(); ctx.roundRect(st.x, 22, 38, 44, 6); ctx.fill();
        ctx.fillStyle = "#FFF"; ctx.font = "bold 16px sans-serif";
        ctx.fillText(st.txt, st.x + 11, 50);
      });
    }
  }

  function drawEveningBanner(canvas, st, tSec = 0) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const owned = st.ownedAssets || [];
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    sky.addColorStop(0, "#0A111A");
    sky.addColorStop(1, "#1C2A36");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Twinkling night stars
    [[24, 14], [78, 22], [140, 12], [220, 19], [310, 11], [380, 24]].forEach(([sx, sy], i) => {
      const a = 0.35 + 0.4 * Math.sin(tSec * 2 + i);
      ctx.fillStyle = `rgba(255,250,220,${a.toFixed(2)})`;
      ctx.fillRect(sx, sy, 2, 2);
    });

    // Ground / Driveway
    ctx.fillStyle = "#1B2420";
    ctx.fillRect(0, h * 0.68, w, h * 0.32);

    // Home Architecture evolves with owned realty!
    const hasVilla = owned.includes("spain_villa") || owned.includes("dnipro_mansion");
    const hasPenthouse = owned.includes("kyivhrad_flat") || owned.includes("carpathian_chalet");
    const hasHouse = owned.includes("suburban_brick_house") || owned.includes("border_hotel");

    if (hasVilla) {
      // Grand modern villa + palm/pool glow
      ctx.fillStyle = "#EDE7F6"; ctx.fillRect(w * 0.08, h * 0.24, 125, 42);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(w * 0.06, h * 0.20, 133, 6);
      ctx.fillStyle = "#4FC3F7"; ctx.fillRect(w * 0.42, h * 0.56, 48, 12);
    } else if (hasPenthouse) {
      // City tower / alpine chalet
      ctx.fillStyle = "#37474F"; ctx.fillRect(w * 0.08, h * 0.16, 78, 50);
      ctx.fillStyle = "#FFE082";
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 3; wx++) {
          ctx.fillRect(w * 0.11 + wx * 20, h * 0.22 + wy * 13, 10, 7);
        }
      }
    } else {
      // Cozy home / brick house
      ctx.fillStyle = hasHouse ? "#6D4C41" : "#3E4A45";
      ctx.fillRect(w * 0.10, h * 0.36, 74, 30);
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.36); ctx.lineTo(w * 0.10 + 37, h * 0.18); ctx.lineTo(w * 0.10 + 78, h * 0.36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#FFD54F";
      ctx.fillRect(w * 0.14, h * 0.44, 14, 12);
      ctx.fillRect(w * 0.21, h * 0.44, 14, 12);
    }

    // Shawarma Kiosk neon badge if owned
    if (owned.includes("shawarma_kiosk")) {
      const neon = 0.65 + 0.35 * Math.sin(tSec * 4.5);
      ctx.fillStyle = "#4E342E"; ctx.fillRect(w * 0.45, h * 0.40, 42, 26);
      ctx.fillStyle = `rgba(255, 138, 101, ${neon.toFixed(2)})`;
      ctx.fillRect(w * 0.46, h * 0.35, 40, 6);
    }

    // Best Car in Garage showcase!
    let carCol = null, carStyle = null;
    if (owned.includes("monako_hypercar") || owned.includes("porsche_911")) { carCol = "#E53935"; carStyle = "SPORT"; }
    else if (owned.includes("euro_bmw")) { carCol = "#1C242B"; carStyle = "SUV"; }
    else if (owned.includes("lanos_sport")) { carCol = "#455A64"; carStyle = "SEDAN"; }
    else if (owned.includes("steppe_ebike")) { carCol = "#00ACC1"; carStyle = "E_SCOOTER"; }

    if (carCol) {
      const cx = w * 0.66, cy = h * 0.48;
      ctx.fillStyle = carCol;
      ctx.beginPath(); ctx.roundRect(cx, cy + 6, 68, carStyle === "SPORT" ? 13 : 16, 4); ctx.fill();
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.roundRect(cx + 12, cy, 38, 10, 3); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(cx + 15, cy + 20, 5, 0, Math.PI * 2); ctx.arc(cx + 53, cy + 20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFF59D"; ctx.fillRect(cx + 63, cy + 9, 4, 3);
    } else {
      ctx.fillStyle = "#546E7A";
      ctx.font = "bold 10px monospace";
      ctx.fillText("🏠 GARAGE EMPTY", w * 0.62, h * 0.56);
    }
  }

  function startMenuPanoramaLoop() {
    stopMenuAnimation();
    const tick = (nowMs) => {
      if (state.phase !== "MAIN_MENU") {
        stopMenuAnimation();
        return;
      }
      const c = document.getElementById("menu-canvas");
      if (!c) {
        stopMenuAnimation();
        return;
      }
      drawMenuPanorama(c, (nowMs || 0) / 1000);
      if (typeof requestAnimationFrame === "function") {
        menuAnimRaf = requestAnimationFrame(tick);
      }
    };
    tick(0);
  }

  // ★ DISTINCT MALE VS FEMALE PORTRAIT + VISUAL REACTIONS RENDERER ★
  function drawPortrait(ctx, p, cx, bottomY, scale, opts = {}) {
    const isFemale = p.gender === "F";
    const isLive = !!opts.isLive;
    const tSec = opts.timeSec || 0;
    const breathY = isLive ? Math.sin(tSec * 2.1) * 1.4 * scale : 0;
    const headBob = isLive ? Math.sin(tSec * 2.1 - 0.5) * 1.1 * scale : 0;
    const blinkCycle = (tSec + ((p.skinTone || 0) * 0.7)) % 3.8;
    const isBlinking = isLive && opts.reactionState !== "INTIMIDATED" && blinkCycle > 3.65;

    const skinColors = ["#F6D5BD", "#ECC5A4", "#DDA982", "#FAE2CE", "#C98F68", "#F1C4A7"];
    const shadowColors = ["#DFB495", "#D2A37E", "#BE865D", "#E6C2A7", "#A9714C", "#D6A381"];
    const hairColors = ["#1D1A1B", "#5A3722", "#8E969C", "#E4B54C", "#9E3B24", "#D8C090", "#3B2820"];
    const lipColors = ["#D85A6C", "#B8293D", "#E06D53", "#9E3B56"];
    const outfitPalette = isFemale
      ? ["#7E4A5C", "#3949AB", "#2E7D32", "#5D4037", "#8E24AA", "#00695C"]
      : ["#4E433B", "#263238", "#37474F", "#4A553B", "#283593", "#3E2723"];
    const coatMap = {
      PALYCH_BOSS: "#3A4D39",
      TOLIK_SMUGGLER: "#1C1F22",
      VOLUNTEER_OLYA: "#556B2F",
      DEPUTY_SON_MAJORS: "#8D6E1F",
      AUNT_HALYA: "#5C6BC0",
      SHYTOMYR_BRO: "#1565C0",
      NABK_AGENT: "#2C353D"
    };
    const skinIdx = (p.skinTone || 0) % skinColors.length;
    const skin = skinColors[skinIdx];
    const skinShade = shadowColors[skinIdx];
    const hair = hairColors[(p.hairColor || 0) % hairColors.length];
    const outfitIdx = (p.outfitStyle || 0) % outfitPalette.length;
    const coat = coatMap[p.specialId] || outfitPalette[outfitIdx];

    ctx.save();
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.2 * scale;

    const fs = p.faceShape || 0;
    const hw = (isFemale ? (fs === 2 ? 60 : 56) : (fs === 4 ? 70 : (fs === 2 ? 62 : 66))) * scale;
    const hh = (isFemale ? 70 : (fs === 1 ? 78 : 74)) * scale;
    const sw = (isFemale ? 106 : 124) * scale;
    const sh = 46 * scale;
    const hTop = bottomY - sh - hh + 4 * scale + headBob;

    // 1. FEMALE BACK HAIR (multiple silhouettes!)
    if (isFemale && p.headwear !== 2) {
      const hSt = (p.hairStyle || 0) % 6;
      ctx.fillStyle = hair;
      if (hSt === 4) {
        // Two side braids/pigtails
        ctx.beginPath();
        ctx.roundRect(cx - hw * 0.72, hTop + 14 * scale, 14 * scale, hh + 18 * scale, 7 * scale);
        ctx.roundRect(cx + hw * 0.72 - 14 * scale, hTop + 14 * scale, 14 * scale, hh + 18 * scale, 7 * scale);
        ctx.fill(); ctx.stroke();
      } else if (hSt !== 5 && hSt !== 1) {
        const backH = hSt === 2 ? hh * 0.88 : hh + 28 * scale;
        ctx.beginPath();
        ctx.roundRect(cx - hw * 0.74, hTop + 6 * scale, hw * 1.48, backH, (hSt === 3 ? 32 : 22) * scale);
        ctx.fill(); ctx.stroke();
      }
    }

    // 2. Shoulders / Coat with depth & outfit styles
    const coatY = bottomY - sh + breathY;
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, coatY, sw, sh + 14, 22 * scale);
    ctx.fill();
    ctx.stroke();

    // Coat shading & lapels
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, coatY + sh * 0.55, sw, sh * 0.55, 10 * scale);
    ctx.fill();

    if (isFemale) {
      ctx.fillStyle = "#F5E6D3";
      ctx.beginPath();
      ctx.moveTo(cx - 16 * scale, coatY);
      ctx.lineTo(cx + 16 * scale, coatY);
      ctx.lineTo(cx, coatY + 23 * scale);
      ctx.closePath();
      ctx.fill();
      if (outfitIdx === 4) {
        // Vyshyvanka geometric embroidery
        ctx.fillStyle = "#C62828";
        ctx.fillRect(cx - 3 * scale, coatY + 12 * scale, 6 * scale, 18 * scale);
      }
    } else if (outfitIdx === 2 || p.specialId === "NABK_AGENT") {
      // Suit + tie
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.moveTo(cx - 15 * scale, coatY);
      ctx.lineTo(cx + 15 * scale, coatY);
      ctx.lineTo(cx, coatY + 22 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.specialId === "NABK_AGENT" ? "#B71C1C" : "#263238";
      ctx.beginPath();
      ctx.moveTo(cx - 4 * scale, coatY + 5 * scale);
      ctx.lineTo(cx + 4 * scale, coatY + 5 * scale);
      ctx.lineTo(cx + 2 * scale, coatY + 26 * scale);
      ctx.lineTo(cx - 2 * scale, coatY + 26 * scale);
      ctx.closePath();
      ctx.fill();
    } else if (outfitIdx === 0) {
      // Hoodie drawstrings
      ctx.strokeStyle = "#ECEFF1";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 10 * scale, coatY + 4 * scale); ctx.lineTo(cx - 11 * scale, coatY + 24 * scale);
      ctx.moveTo(cx + 10 * scale, coatY + 4 * scale); ctx.lineTo(cx + 11 * scale, coatY + 24 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    } else if (outfitIdx === 4) {
      // Men's vyshyvanka collar
      ctx.fillStyle = "#FAF6EC";
      ctx.fillRect(cx - 12 * scale, coatY, 24 * scale, 24 * scale);
      ctx.fillStyle = "#B71C1C";
      ctx.fillRect(cx - 3 * scale, coatY + 3 * scale, 6 * scale, 20 * scale);
    } else {
      // Jacket zipper
      ctx.strokeStyle = "#90A4AE";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.moveTo(cx, coatY + 2 * scale); ctx.lineTo(cx, coatY + sh); ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    // Gold chain
    if (p.scarOrDetail === 3) {
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(cx, coatY + 6 * scale, 20 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    // Secret NABK UV Camera Lapel Glint!
    if (opts.uvActive && p.specialId === "NABK_AGENT") {
      ctx.fillStyle = "#FF1744";
      ctx.beginPath();
      ctx.arc(cx - 22 * scale, coatY + 18 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FF80AB";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(cx - 22 * scale, coatY + 18 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    // 3. Neck with chin shadow
    const neckW = (isFemale ? 20 : 28) * scale;
    ctx.fillStyle = skin;
    ctx.fillRect(cx - neckW / 2, coatY - 12 * scale, neckW, 18 * scale);
    ctx.fillStyle = skinShade;
    ctx.fillRect(cx - neckW / 2, coatY - 12 * scale, neckW, 7 * scale);

    // Floral headscarf background
    if (p.headwear === 2) {
      ctx.fillStyle = "#8D4E42";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.68, hTop - 7 * scale, hw * 1.36, hh * 1.18, 30 * scale);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Ears + Earrings
    const earY = hTop + hh * 0.54;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx - hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.arc(cx + hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isFemale && (p.earrings || 1) > 0) {
      ctx.fillStyle = (p.earrings === 2) ? "#E0E0E0" : "#FFD54F";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.54, earY + 7 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.54, earY + 7 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Head contour (varied shapes!)
    const headRadius = (isFemale ? 28 : (fs === 2 ? 28 : (fs === 1 ? 14 : 20))) * scale;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2, hTop, hw, hh, headRadius);
    ctx.fill();
    ctx.stroke();

    // Cheekbone / jawline shading
    ctx.fillStyle = skinShade;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2 + 3 * scale, hTop + hh * 0.72, hw - 6 * scale, hh * 0.24, 12 * scale);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (isFemale) {
      ctx.fillStyle = "rgba(229, 115, 115, 0.28)";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.freckles) {
      ctx.fillStyle = "rgba(121, 85, 72, 0.45)";
      [-0.24, -0.18, 0.18, 0.24].forEach(fx => {
        ctx.beginPath();
        ctx.arc(cx + hw * fx, hTop + hh * 0.57, 1.3 * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 6. Hair & Headwear (much richer styles!)
    const hSt = (p.hairStyle || 0) % 8;
    if (isFemale) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.55, hTop - 7 * scale, hw * 1.1, hh * 0.28, 18 * scale);
      ctx.fill();
      if ((hSt === 1 || hSt === 0) && p.headwear !== 2) {
        // Top bun
        ctx.beginPath();
        ctx.arc(cx, hTop - 11 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else if (hSt === 2 && p.headwear !== 2) {
        // Side bangs / bob
        ctx.beginPath();
        ctx.moveTo(cx - hw * 0.52, hTop + 6 * scale);
        ctx.quadraticCurveTo(cx, hTop + 20 * scale, cx + hw * 0.52, hTop + 6 * scale);
        ctx.lineTo(cx + hw * 0.52, hTop - 6 * scale);
        ctx.lineTo(cx - hw * 0.52, hTop - 6 * scale);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillRect(cx - hw * 0.56, hTop + 8 * scale, 9 * scale, hh * 0.62);
      ctx.fillRect(cx + hw * 0.47, hTop + 8 * scale, 9 * scale, hh * 0.62);
    } else if (p.headwear === 0) {
      ctx.fillStyle = hair;
      if (hSt === 3) {
        // Receding / bald top with side hair + shine!
        ctx.fillRect(cx - hw * 0.53, hTop + 8 * scale, 7 * scale, hh * 0.34);
        ctx.fillRect(cx + hw * 0.46, hTop + 8 * scale, 7 * scale, hh * 0.34);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.ellipse(cx - 10 * scale, hTop + 8 * scale, 7 * scale, 3 * scale, -0.3, 0, Math.PI * 2); ctx.fill();
      } else if (hSt === 2) {
        // Curly afro/fluffy hair
        for (let ci = -2; ci <= 2; ci++) {
          ctx.beginPath(); ctx.arc(cx + ci * 12 * scale, hTop + 2 * scale, 12 * scale, 0, Math.PI * 2); ctx.fill();
        }
      } else if (hSt === 5) {
        // Messy spiky hair
        ctx.beginPath();
        ctx.moveTo(cx - hw * 0.52, hTop + 10 * scale);
        ctx.lineTo(cx - hw * 0.32, hTop - 12 * scale);
        ctx.lineTo(cx - hw * 0.08, hTop - 4 * scale);
        ctx.lineTo(cx + hw * 0.14, hTop - 14 * scale);
        ctx.lineTo(cx + hw * 0.36, hTop - 5 * scale);
        ctx.lineTo(cx + hw * 0.52, hTop + 10 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(cx - hw * 0.53, hTop - 6 * scale, hw * 1.06, hh * 0.25, 12 * scale);
        ctx.fill();
      }
    }

    if (p.headwear === 1) {
      // Baseball Cap with visor
      ctx.fillStyle = "#3E4A3F";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.56, hTop - 9 * scale, hw * 1.12, 22 * scale, 12 * scale);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#263228";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.42, hTop + 7 * scale, hw * 0.98, 7 * scale, 4 * scale);
      ctx.fill(); ctx.stroke();
    } else if (p.headwear === 3) {
      // Warm knit beanie
      ctx.fillStyle = "#6D4C41";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.56, hTop - 12 * scale, hw * 1.12, 25 * scale, 14 * scale);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#4E342E";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.58, hTop + 5 * scale, hw * 1.16, 10 * scale, 4 * scale);
      ctx.fill(); ctx.stroke();
    } else if (p.headwear === 4) {
      // Border guard / officer peaked cap
      ctx.fillStyle = "#2E473B";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.62, hTop - 13 * scale, hw * 1.24, 23 * scale, 7 * scale);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFCA28";
      ctx.beginPath();
      ctx.arc(cx, hTop - 3 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.headwear === 5) {
      // Stylish fedora / beret
      ctx.fillStyle = "#37474F";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.70, hTop + 4 * scale, hw * 1.40, 6 * scale, 3 * scale);
      ctx.roundRect(cx - hw * 0.45, hTop - 13 * scale, hw * 0.90, 19 * scale, 8 * scale);
      ctx.fill(); ctx.stroke();
    }

    // 7. Eyes + Eyebrows + Blink + Nose + Sweat drops
    const eyeY = hTop + hh * 0.44;
    const eyeOx = hw * 0.22;
    const eyeR = (opts.reactionState === "INTIMIDATED" ? 7.0 : 5.8) * scale;

    if (isBlinking) {
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.4 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 6 * scale, eyeY); ctx.lineTo(cx - eyeOx + 6 * scale, eyeY);
      ctx.moveTo(cx + eyeOx - 6 * scale, eyeY); ctx.lineTo(cx + eyeOx + 6 * scale, eyeY);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(cx - eyeOx, eyeY, eyeR, 0, Math.PI * 2);
      ctx.arc(cx + eyeOx, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      const irisColors = ["#2E4053", "#4E342E", "#1B5E20", "#1B1B1B"];
      ctx.fillStyle = irisColors[(p.skinTone + (p.hairColor || 0)) % irisColors.length];
      const pupR = (opts.reactionState === "INTIMIDATED" ? 2.4 : 3.4) * scale;
      ctx.beginPath();
      ctx.arc(cx - eyeOx, eyeY, pupR, 0, Math.PI * 2);
      ctx.arc(cx + eyeOx, eyeY, pupR, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight glint!
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(cx - eyeOx + 1.2 * scale, eyeY - 1.2 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.arc(cx + eyeOx + 1.2 * scale, eyeY - 1.2 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isFemale) {
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 5 * scale, eyeY - 3 * scale);
      ctx.lineTo(cx - eyeOx - 9 * scale, eyeY - 7 * scale);
      ctx.moveTo(cx + eyeOx + 5 * scale, eyeY - 3 * scale);
      ctx.lineTo(cx + eyeOx + 9 * scale, eyeY - 7 * scale);
      ctx.stroke();

      ctx.strokeStyle = hair;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx - eyeOx, eyeY - 6 * scale, 8 * scale, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeOx, eyeY - 6 * scale, 8 * scale, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.strokeStyle = hair;
      ctx.lineWidth = 3.5 * scale;
      const browTilt = (p.expression === 2 || opts.reactionState === "INTIMIDATED") ? 2.5 * scale : 0;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 8 * scale, eyeY - 9 * scale - browTilt);
      ctx.lineTo(cx - eyeOx + 8 * scale, eyeY - 10 * scale + browTilt);
      ctx.moveTo(cx + eyeOx - 8 * scale, eyeY - 10 * scale + browTilt);
      ctx.lineTo(cx + eyeOx + 8 * scale, eyeY - 9 * scale - browTilt);
      ctx.stroke();
    }

    // Nose with soft shadow
    ctx.strokeStyle = skinShade;
    ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 1 * scale, eyeY + 3 * scale);
    ctx.lineTo(cx + 3 * scale, eyeY + 13 * scale);
    ctx.lineTo(cx - 2 * scale, eyeY + 14 * scale);
    ctx.stroke();

    // Glasses (4 distinct styles!)
    ctx.strokeStyle = p.glasses === 4 ? "#E0B145" : "#171717";
    ctx.lineWidth = 2.2 * scale;
    if (p.glasses > 0) {
      ctx.fillStyle = p.glasses === 2 ? "rgba(16,32,39,0.86)" : "rgba(224,247,250,0.25)";
      if (p.glasses === 3) {
        // Round intellectual glasses
        ctx.beginPath();
        ctx.arc(cx - eyeOx, eyeY, 9.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + eyeOx, eyeY, 9.5 * scale, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(cx - eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, p.glasses === 4 ? 10 * scale : 14 * scale, 4 * scale);
        ctx.roundRect(cx + eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, p.glasses === 4 ? 10 * scale : 14 * scale, 4 * scale);
        ctx.fill(); ctx.stroke();
      }
      // Bridge
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx + 10 * scale, eyeY - 1 * scale);
      ctx.lineTo(cx + eyeOx - 10 * scale, eyeY - 1 * scale);
      ctx.stroke();
    }

    // Left cheek scar (glows faintly under UV!)
    if (p.scarOrDetail === 1) {
      ctx.strokeStyle = opts.uvActive ? "#FF4081" : "#B71C1C";
      ctx.lineWidth = (opts.uvActive ? 3.4 : 2.6) * scale;
      ctx.beginPath();
      ctx.moveTo(cx + hw * 0.16, eyeY + 8 * scale);
      ctx.lineTo(cx + hw * 0.34, eyeY + 22 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#171717";
    }

    // Animated sweat drops when yelled at / intimidated!
    if (opts.reactionState === "INTIMIDATED") {
      const dropSlide = isLive ? ((tSec * 14) % 12) * scale : 0;
      ctx.fillStyle = "#4FC3F7";
      ctx.beginPath();
      ctx.ellipse(cx + hw * 0.38, eyeY - 10 * scale + dropSlide, 3 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - hw * 0.36, eyeY - 4 * scale + (dropSlide * 0.6), 2.5 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Mustache / Beard & Mouth (Smiles when Coffee Given, O-shape when Intimidated)
    const mouthY = hTop + hh * 0.77;
    if (!isFemale && p.facialHair > 0) {
      ctx.fillStyle = hair;
      if (p.facialHair === 1) {
        // Stubble
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.roundRect(cx - hw * 0.44, mouthY - 6 * scale, hw * 0.88, 22 * scale, 10 * scale);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.facialHair === 2 || p.facialHair === 4) {
        const mw = (p.facialHair === 4 ? 38 : 26) * scale;
        ctx.beginPath();
        ctx.roundRect(cx - mw / 2, mouthY - 8 * scale, mw, 8 * scale, 4 * scale);
        ctx.fill();
      } else if (p.facialHair === 3 || p.facialHair === 5) {
        // Full beard
        ctx.beginPath();
        ctx.roundRect(cx - hw * 0.38, mouthY - 5 * scale, hw * 0.76, p.facialHair === 5 ? 24 * scale : 18 * scale, 10 * scale);
        ctx.fill();
      } else if (p.facialHair === 6) {
        // Goatee
        ctx.beginPath();
        ctx.roundRect(cx - 11 * scale, mouthY + 2 * scale, 22 * scale, 14 * scale, 6 * scale);
        ctx.fill();
      }
    }

    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.2 * scale;
    if (opts.reactionState === "INTIMIDATED") {
      ctx.fillStyle = "#4E2728";
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 1 * scale, 6 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (isFemale) {
      ctx.fillStyle = lipColors[(p.lipColor || 0) % lipColors.length];
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 8.5 * scale, opts.reactionState === "COFFEE_GIVEN" ? 5 * scale : 4.2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (opts.reactionState === "COFFEE_GIVEN") {
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2 * scale, 9 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 10 * scale, mouthY);
      ctx.lineTo(cx + 10 * scale, mouthY - (p.expression === 1 ? 2.5 * scale : 0));
      ctx.stroke();
    }
    ctx.restore();
  }

  // ★ DYNAMIC COLOR & SHAPE TRANSPORT ART IN BOOTH WINDOW ★
  function drawTransportInBooth(ctx, w, h, shape, bodyColor, roofColor, opts = {}) {
    ctx.save();
    const tSec = opts.timeSec || 0;
    const isLive = !!opts.isLive;
    const cx = w * 0.28;
    const groundY = h * 0.84;

    if (shape === "ON_FOOT") {
      const sway = isLive ? Math.sin(tSec * 2.5) * 1.2 : 0;
      [cx - 26, cx + 4].forEach((bx, idx) => {
        const bw = 20, bh = 18, by = groundY - bh + (idx * 2) + (idx === 0 ? sway : -sway * 0.5);
        ctx.fillStyle = "#1565C0";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "#C62828";
        ctx.fillRect(bx + 3, by, 4, bh);
        ctx.fillRect(bx + 12, by, 4, bh);
        ctx.fillStyle = "#ECEFF1";
        ctx.fillRect(bx, by + 5, bw, 3);
        ctx.fillRect(bx, by + 11, bw, 3);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by, 5, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    if (shape === "BICYCLE") {
      const wr = 9.5;
      const lx = cx - 22, rx = cx + 18, wy = groundY - wr;
      ctx.strokeStyle = "#14181A";
      ctx.lineWidth = 2.2;
      [lx, rx].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "#78909C"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(wx - wr + 2, wy); ctx.lineTo(wx + wr - 2, wy); ctx.moveTo(wx, wy - wr + 2); ctx.lineTo(wx, wy + wr - 2); ctx.stroke();
        ctx.strokeStyle = "#14181A"; ctx.lineWidth = 2.2;
      });
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, wy); ctx.lineTo(cx - 2, wy); ctx.lineTo(rx - 5, wy - 15); ctx.lineTo(lx + 6, wy - 12); ctx.closePath();
      ctx.moveTo(rx, wy); ctx.lineTo(rx - 7, wy - 20); ctx.lineTo(rx - 13, wy - 21);
      ctx.stroke();
      ctx.fillStyle = "#C5A880";
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(lx + 3, wy - 12, 8, 5.5, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      return;
    }

    if (shape === "E_SCOOTER") {
      const lx = cx - 18, rx = cx + 16, wy = groundY - 5;
      ctx.fillStyle = "#14181A";
      [lx, rx].forEach(wx => { ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = bodyColor;
      ctx.fillRect(lx, wy - 4, rx - lx, 4);
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(rx - 2, wy - 3); ctx.lineTo(rx - 6, wy - 30); ctx.lineTo(rx - 12, wy - 30); ctx.stroke();
      ctx.fillStyle = "#FFF59D";
      ctx.beginPath(); ctx.arc(rx - 2, wy - 27, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    if (shape === "MOTORCYCLE") {
      const vib = isLive ? Math.sin(tSec * 22) * 0.6 : 0;
      const lx = cx - 22, rx = cx + 20, wy = groundY - 8;
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath(); ctx.ellipse(cx, groundY - 1, 28, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#111"; ctx.lineWidth = 3.5;
      [lx, rx].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, wy, 7.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#B0BEC5"; ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(lx + 4, wy - 15 + vib, 30, 9, 4);
      ctx.fill();
      ctx.fillStyle = "#263238";
      ctx.fillRect(lx + 5, wy - 18 + vib, 16, 4);
      ctx.strokeStyle = "#CFD8DC"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(rx, wy); ctx.lineTo(rx - 7, wy - 21 + vib); ctx.stroke();
      ctx.fillStyle = "#FFF59D";
      ctx.beginPath(); ctx.arc(rx - 4, wy - 15 + vib, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    // Cars / Buses / Vans / Hearses / Pickups / Trucks / Armored
    const engineVib = isLive ? Math.sin(tSec * 20) * 0.55 : 0;
    const isTall = shape === "MINIBUS" || shape === "HEARSE" || shape === "BUS" || shape === "ARMORED" || shape === "TRUCK";
    const isSuv = shape === "SUV" || shape === "G_WAGON" || shape === "PICKUP";
    const vw = (shape === "BUS" || shape === "TRUCK") ? w * 0.50 : (isTall ? w * 0.47 : w * 0.45);
    const vh = shape === "BUS" ? 39 : (shape === "TRUCK" ? 41 : (isTall ? 34 : (isSuv ? 31 : (shape === "SPORT" ? 23 : 27))));
    const vx = 8;
    const vy = groundY - vh - 5 + engineVib;

    // Ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.36)";
    ctx.beginPath();
    ctx.ellipse(vx + vw / 2, groundY - 1, vw * 0.49, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated exhaust smoke puffs!
    if (isLive) {
      for (let p = 0; p < 3; p++) {
        const age = ((tSec * 1.3 + p * 0.33) % 1);
        const ex = vx - 3 - age * 14;
        const ey = groundY - 9 - age * 10;
        ctx.fillStyle = `rgba(200, 210, 215, ${(1 - age) * 0.35})`;
        ctx.beginPath(); ctx.arc(ex, ey, 2 + age * 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Lower body
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = "#121618";
    ctx.lineWidth = 1.6;
    if (shape === "TRUCK") {
      // Trailer + Cab
      ctx.beginPath();
      ctx.roundRect(vx, vy + 3, vw * 0.65, vh - 8, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = roofColor || bodyColor;
      ctx.beginPath();
      ctx.roundRect(vx + vw * 0.67, vy + 6, vw * 0.33, vh - 11, 5);
      ctx.fill(); ctx.stroke();
      // Exhaust stack
      ctx.fillStyle = "#90A4AE";
      ctx.fillRect(vx + vw * 0.64, vy, 3, vh * 0.65);
    } else {
      ctx.beginPath();
      ctx.roundRect(vx, vy + (isTall ? 2 : 9), vw, vh - (isTall ? 2 : 9), (shape === "G_WAGON" || shape === "ARMORED") ? 3 : 7);
      ctx.fill();
      ctx.stroke();

      // Subtle glossy highlight strip
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(vx + 4, vy + (isTall ? 5 : 11), vw - 8, 3);
    }

    // Upper Cabin / Roof
    if (!isTall) {
      const cabX = shape === "PICKUP" ? vx + vw * 0.14 : vx + vw * 0.16;
      const cabW = shape === "PICKUP" ? vw * 0.44 : vw * 0.60;
      ctx.fillStyle = roofColor || bodyColor;
      ctx.beginPath();
      ctx.roundRect(cabX, vy, cabW, shape === "SPORT" ? 11 : 14, shape === "G_WAGON" ? 2 : 6);
      ctx.fill();
      ctx.stroke();
    }

    if (shape === "SPORT") {
      ctx.fillStyle = "#111";
      ctx.fillRect(vx + 1, vy + 4, 10, 3);
    } else if (shape === "RETRO") {
      ctx.strokeStyle = "#CFD8DC";
      ctx.lineWidth = 1.8;
      ctx.strokeRect(vx + vw * 0.24, vy - 4, vw * 0.42, 4);
    } else if (shape === "G_WAGON") {
      // Rear spare wheel
      ctx.fillStyle = "#1B1E20";
      ctx.fillRect(vx - 3, vy + 10, 4, 12);
    } else if (shape === "ARMORED") {
      ctx.fillStyle = "#E0B145";
      ctx.fillRect(vx + 6, vy + 17, vw - 12, 3);
      ctx.fillStyle = "#2979FF";
      ctx.fillRect(vx + vw * 0.65, vy - 3, 7, 3);
    } else if (shape === "HEARSE") {
      ctx.fillStyle = "#E0B145";
      ctx.fillRect(vx + vw * 0.72, vy + 9, 2.5, 11);
      ctx.fillRect(vx + vw * 0.72 - 3.5, vy + 13, 9.5, 2.5);
    }

    // Windows with diagonal reflection glint!
    ctx.fillStyle = "#1B262C";
    if (shape === "BUS") {
      for (let wi = 0; wi < 4; wi++) {
        ctx.fillRect(vx + 7 + wi * (vw * 0.22), vy + 5, vw * 0.17, 12);
      }
    } else if (shape === "TRUCK") {
      ctx.fillRect(vx + vw * 0.74, vy + 9, vw * 0.21, 10);
    } else {
      const winX = vx + vw * 0.20;
      const winW = vw * (shape === "PICKUP" ? 0.34 : 0.48);
      ctx.beginPath();
      ctx.roundRect(winX, vy + 3.5, winW, 9.5, 2.5);
      ctx.fill();
      if (opts.hasPassenger) {
        ctx.fillStyle = "#90A4AE";
        ctx.beginPath(); ctx.arc(winX + winW * 0.34, vy + 8, 3.0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#CFD8DC";
        ctx.beginPath(); ctx.arc(winX + winW * 0.68, vy + 8, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(winX + 5, vy + 12); ctx.lineTo(winX + 12, vy + 4); ctx.stroke();
    }

    // Door handle + bumper trim
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    if (shape !== "TRUCK") ctx.fillRect(vx + vw * 0.46, vy + (isTall ? 18 : 16), 5, 1.8);

    // Multi-layered Wheels
    const wheelXs = shape === "TRUCK" ? [vx + vw * 0.16, vx + vw * 0.42, vx + vw * 0.82] : [vx + vw * 0.22, vx + vw * 0.78];
    const wr = isSuv ? 7 : 5.8;
    wheelXs.forEach(wx => {
      ctx.fillStyle = "#111315";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, wr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#B0BEC5";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, wr * 0.48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#37474F";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, 1.3, 0, Math.PI * 2); ctx.fill();
    });

    // Headlight beam + Taillight
    const beamGrad = ctx.createLinearGradient(vx + vw, groundY - 11, vx + vw + 28, groundY - 7);
    beamGrad.addColorStop(0, "rgba(255, 245, 157, 0.42)");
    beamGrad.addColorStop(1, "rgba(255, 245, 157, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(vx + vw - 1, groundY - 12);
    ctx.lineTo(vx + vw + 26, groundY - 19);
    ctx.lineTo(vx + vw + 26, groundY - 4);
    ctx.lineTo(vx + vw - 1, groundY - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#FFF59D";
    ctx.fillRect(vx + vw - 5, groundY - 12, 4, 3.5);
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(vx + 1, groundY - 12, 3.5, 3.5);
    ctx.restore();
  }

  function drawBoothScene(canvas, opts) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const sirenActive = !!opts.sirenActive;
    const droneWarning = !!opts.droneWarning;
    const dayNumber = opts.dayNumber || 1;
    const barrierState = opts.barrierState || "CLOSED";
    const tSec = opts.timeSec || 0;
    const isLive = !!opts.isLive;

    // Sky gradient + moving clouds
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.44);
    skyGrad.addColorStop(0, sirenActive ? "#5A1F1E" : (droneWarning ? "#4E342E" : (dayNumber >= 4 ? "#1E282E" : "#2D3C45")));
    skyGrad.addColorStop(1, sirenActive ? "#7D2C2B" : (droneWarning ? "#6D4C41" : "#546E7A"));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.44);

    // Drifting clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let ci = 0; ci < 3; ci++) {
      const cx = ((tSec * (4 + ci * 1.5) + ci * 75) % (w + 40)) - 20;
      const cy = 12 + ci * 11;
      ctx.beginPath(); ctx.ellipse(cx, cy, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Watchtower + rotating searchlight
    ctx.fillStyle = "#18211C";
    ctx.fillRect(w * 0.36, h * 0.16, 4, h * 0.22);
    ctx.fillRect(w * 0.34, h * 0.14, 9, 7);
    if (isLive) {
      const sweep = Math.sin(tSec * 1.4) * 16;
      const beam = ctx.createLinearGradient(w * 0.38, h * 0.17, w * 0.15 + sweep, h * 0.45);
      beam.addColorStop(0, "rgba(255, 245, 157, 0.18)");
      beam.addColorStop(1, "rgba(255, 245, 157, 0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(w * 0.37, h * 0.17);
      ctx.lineTo(w * 0.05 + sweep, h * 0.44);
      ctx.lineTo(w * 0.28 + sweep, h * 0.44);
      ctx.closePath();
      ctx.fill();
    }

    // Distant horizon forest silhouette
    ctx.fillStyle = "#1B2520";
    ctx.fillRect(0, h * 0.36, w, h * 0.08);
    for (let tx = 4; tx < w * 0.56; tx += 14) {
      ctx.beginPath(); ctx.moveTo(tx, h * 0.36); ctx.lineTo(tx + 5, h * 0.28); ctx.lineTo(tx + 10, h * 0.36); ctx.fill();
    }

    // Drone alert ONLY during active warning / siren
    if (droneWarning || sirenActive) {
      const dx = w * 0.44 + (isLive ? Math.sin(tSec * 4) * 5 : 0), dy = h * 0.14;
      ctx.fillStyle = "rgba(255, 23, 68, 0.38)";
      ctx.beginPath(); ctx.arc(dx, dy + 1, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFCDD2";
      ctx.beginPath();
      ctx.moveTo(dx, dy - 5); ctx.lineTo(dx + 11, dy + 5); ctx.lineTo(dx - 11, dy + 5); ctx.closePath();
      ctx.fill();
    }

    // Asphalt yard & road marking
    ctx.fillStyle = "#3A423E";
    ctx.fillRect(0, h * 0.43, w, h * 0.57);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, h * 0.66); ctx.lineTo(w * 0.54, h * 0.66); ctx.stroke();
    ctx.setLineDash([]);

    // Ambient snow / drizzle particles
    if (isLive) {
      ctx.fillStyle = "rgba(220, 235, 245, 0.32)";
      for (let pi = 0; pi < 12; pi++) {
        const px = ((pi * 31 + tSec * 12) % (w * 0.54));
        const py = ((pi * 23 + tSec * 36) % h);
        ctx.fillRect(px, py, 1.6, 3.2);
      }
    }

    if (barrierState === "SBK_ARREST_FLASH") {
      const flash = isLive ? Math.sin(tSec * 16) > 0 : true;
      ctx.fillStyle = flash ? "rgba(21, 101, 192, 0.42)" : "rgba(213, 0, 0, 0.42)";
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.42, w * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? "rgba(213, 0, 0, 0.42)" : "rgba(21, 101, 192, 0.42)";
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.42, w * 0.22, 0, Math.PI * 2); ctx.fill();
    }

    // Barrier gate behind car on left/mid lane
    const barY = h * 0.50;
    ctx.fillStyle = "#263238";
    ctx.fillRect(w * 0.03, barY - 12, 10, 38);
    const lightColor = barrierState === "OPEN_APPROVED" ? "#00E676" : (barrierState === "SBK_ARREST_FLASH" ? "#2979FF" : "#FF1744");
    ctx.fillStyle = lightColor;
    ctx.beginPath(); ctx.arc(w * 0.03 + 5, barY - 6, 3.5, 0, Math.PI * 2); ctx.fill();

    for (let s = 0; s < 6; s++) {
      const sy = barrierState === "OPEN_APPROVED" ? barY - (s + 1) * 5 : barY;
      ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
      ctx.fillRect(w * 0.08 + s * (w * 0.075), sy, w * 0.075, 6);
    }

    // Draw detailed animated transport!
    drawTransportInBooth(ctx, w, h, opts.transportShape || "SEDAN", opts.colorHex || "#607D8B", opts.roofHex || "#455A64", { timeSec: tSec, isLive, hasPassenger: !!opts.hasPassenger });

    // Booth counter divider & Traveler portrait on RIGHT window!
    ctx.fillStyle = "rgba(18, 22, 20, 0.46)";
    ctx.fillRect(w * 0.55, 0, w * 0.45, h);
    ctx.fillStyle = "#263238";
    ctx.fillRect(w * 0.54, 0, 3, h);

    drawPortrait(ctx, opts.portrait, w * 0.77, h * 0.99, 0.84, {
      reactionState: opts.reactionState,
      uvActive: opts.uvActive,
      timeSec: tSec,
      isLive
    });

    // UV Spotlight Beam over booth window + animated scan line!
    const isEn = opts.lang === "EN";
    const owned = opts.ownedAssets || [];

    // Owned Booth Gear Props (rendered subtly around frame/counter)!
    if (owned.includes("uv_spotlight")) {
      ctx.save();
      ctx.fillStyle = "#311B92";
      ctx.fillRect(w * 0.56, 2, 22, 5);
      ctx.fillStyle = opts.uvActive ? "#B388FF" : "#5E35B1";
      ctx.fillRect(w * 0.57, 5, 18, 2.5);
      ctx.restore();
    }
    if (owned.includes("parrot_kesha")) {
      ctx.save();
      const bob = isLive ? Math.sin(tSec * 3.5) * 1.3 : 0;
      const px = w * 0.91, py = 14 + bob;
      const hasGoldCage = owned.includes("addon_gold_cage");
      ctx.strokeStyle = hasGoldCage ? "#FFD54F" : "#8D6E63";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px - 7, py + 7); ctx.lineTo(px + 7, py + 7); ctx.stroke();
      ctx.fillStyle = "#4CAF50";
      ctx.beginPath(); ctx.ellipse(px, py + 2, 4.5, 6, -0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFEB3B";
      ctx.beginPath(); ctx.arc(px, py - 4, 3.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FF6D00";
      ctx.beginPath(); ctx.moveTo(px - 3, py - 4); ctx.lineTo(px - 7, py - 2.5); ctx.lineTo(px - 3, py - 1.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(px - 1.2, py - 4.5, 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (owned.includes("espresso_machine")) {
      ctx.save();
      const ex = w * 0.89, ey = h - 22;
      ctx.fillStyle = "#B0BEC5";
      ctx.strokeStyle = "#37474F";
      ctx.lineWidth = 1;
      ctx.fillRect(ex, ey, 14, 16);
      ctx.strokeRect(ex, ey, 14, 16);
      ctx.fillStyle = "#263238";
      ctx.fillRect(ex + 2, ey + 6, 10, 7);
      ctx.fillStyle = "#FF5252";
      ctx.fillRect(ex + 10, ey + 2, 2.2, 2.2);
      if (isLive) {
        const sOff = Math.sin(tSec * 4) * 1.5;
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath(); ctx.moveTo(ex + 6, ey - 1); ctx.lineTo(ex + 6 + sOff, ey - 7); ctx.stroke();
      }
      ctx.restore();
    }
    if (owned.includes("sbk_database_tablet")) {
      ctx.save();
      const tx = w * 0.84, ty = h - 13;
      ctx.fillStyle = "#102027";
      ctx.fillRect(tx, ty, 13, 9);
      ctx.fillStyle = "#1976D2";
      ctx.fillRect(tx + 1.5, ty + 1.5, 10, 6);
      const pulseW = isLive ? 2 + ((tSec * 12) % 8) : 6;
      ctx.fillStyle = "#64FFDA";
      ctx.fillRect(tx + 2.5, ty + 3, pulseW, 1.5);
      ctx.restore();
    }

    if (opts.uvActive) {
      const uvGrad = ctx.createRadialGradient(w * 0.75, h * 0.55, 8, w * 0.75, h * 0.55, w * 0.55);
      uvGrad.addColorStop(0, "rgba(179, 136, 255, 0.34)");
      uvGrad.addColorStop(1, "rgba(49, 27, 146, 0.25)");
      ctx.fillStyle = uvGrad;
      ctx.fillRect(0, 0, w, h);

      if (isLive) {
        const scanY = (tSec * 65) % h;
        ctx.strokeStyle = "rgba(0, 229, 255, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();
      }

      ctx.save();
      if (opts.storyTag === "NABK_STING") {
        ctx.strokeStyle = "#00E5FF";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(w * 0.74, h * 0.84);
        ctx.lineTo(w * 0.79, h * 0.96);
        ctx.stroke();
        ctx.fillStyle = "#FF1744";
        ctx.beginPath();
        ctx.arc(w * 0.74, h * 0.84, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#00E5FF";
        ctx.font = "bold 9px monospace";
        ctx.fillText("MIC", w * 0.76, h * 0.83);
      } else if (opts.storyTag === "FSM_SPY") {
        ctx.fillStyle = "rgba(255, 64, 129, 0.85)";
        ctx.font = "bold 10px monospace";
        ctx.fillText(isEn ? "FSM-UV" : "ФСМ-UV", w * 0.69, h * 0.82);
      } else if (opts.storyTag === "INTEL_ALLY") {
        ctx.fillStyle = "#FFD54F";
        ctx.font = "bold 10px monospace";
        ctx.fillText(isEn ? "🦅 GUR-M" : "🦅 ГУР-М", w * 0.69, h * 0.82);
      }

      if (opts.hasContraband) {
        ctx.fillStyle = "rgba(118, 255, 3, 0.65)";
        ctx.beginPath(); ctx.arc(w * 0.64, h * 0.88, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.67, h * 0.91, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.62, h * 0.92, 2.5, 0, Math.PI * 2); ctx.fill();
      }

      if (opts.hasCloneCar) {
        ctx.strokeStyle = "#FF4081";
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.08, h * 0.56, w * 0.42, h * 0.28);
        ctx.setLineDash([]);
        ctx.fillStyle = "#FF80AB";
        ctx.font = "bold 9px monospace";
        ctx.fillText("VIN?", w * 0.10, h * 0.54);
      }
      ctx.restore();
    }

    // Visual Coffee Cup with rising steam if COFFEE_GIVEN!
    if (opts.reactionState === "COFFEE_GIVEN") {
      const cx = w * 0.58, cy = h * 0.84;
      ctx.fillStyle = "#ECEFF1";
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx, cy, 13, 16);
      ctx.strokeRect(cx, cy, 13, 16);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(cx - 1, cy - 3, 15, 3.5);
      const steamShift = isLive ? Math.sin(tSec * 4) * 2 : 0;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.moveTo(cx + 4, cy - 6); ctx.lineTo(cx + 6 + steamShift, cy - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 9, cy - 5); ctx.lineTo(cx + 10 - steamShift, cy - 15); ctx.stroke();
    }

    // Sniffer dog Bavovna peeking at bottom-left with wagging ears!
    if (opts.snifferActive) {
      const wag = isLive ? Math.sin(tSec * 10) * 0.14 : 0;
      const dogX = 24, dogY = h - 18 + (isLive ? Math.abs(Math.sin(tSec * 6)) * -1.8 : 0);
      ctx.fillStyle = "#B87A42";
      ctx.strokeStyle = "#2E1E11";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(dogX, dogY, 13, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#6D4C2D";
      ctx.beginPath(); ctx.ellipse(dogX - 11, dogY - 4, 4, 9, 0.2 + wag, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dogX + 11, dogY - 4, 4, 9, -0.2 - wag, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(dogX - 4, dogY - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(dogX + 4, dogY - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(dogX, dogY + 3, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = opts.hasContraband ? "#B71C1C" : "#1B5E20";
      ctx.fillRect(4, h - 42, 62, 14);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(opts.hasContraband ? (isEn ? "🐕 STASH!" : "🐕 ТАЙНИК!") : (isEn ? "🐕 CLEAN" : "🐕 ЧИСТО"), 8, h - 32);
    }

    // ★ Shytomyr Unique Encounter Effects ★
    if (opts.storyTag && opts.storyTag.startsWith("SHYTOMYR_")) {
      ctx.save();
      ctx.fillStyle = "rgba(13, 30, 56, 0.85)";
      ctx.strokeStyle = "#E0B145";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(4, 4, 82, 15, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFE082";
      ctx.font = "bold 9px monospace";
      ctx.fillText(isEn ? "🧦 SHYTOMYR" : "🧦 М. ШИТОМИР", 8, 14.5);

      if (opts.storyTag === "SHYTOMYR_COSMOS") {
        // Floating green plasma meteor sparks + orbit ring
        const cyOrb = h * 0.48 + Math.sin(tSec * 3) * 4;
        ctx.strokeStyle = "rgba(105, 240, 174, 0.55)";
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.ellipse(w * 0.25, cyOrb, 22, 6, -0.25, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const sx = w * 0.14 + k * 14 + Math.sin(tSec * 4 + k) * 3;
          const sy = h * 0.42 - ((tSec * 16 + k * 9) % 24);
          ctx.fillStyle = "#69F0AE";
          ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (opts.storyTag === "SHYTOMYR_PHANTOM") {
        // Floating cyan "404" matrix digits
        ctx.fillStyle = "rgba(0, 229, 255, 0.72)";
        ctx.font = "bold 9px monospace";
        for (let k = 0; k < 4; k++) {
          const mx = 14 + k * 24;
          const my = 26 + ((tSec * 22 + k * 17) % 48);
          ctx.fillText(k % 2 === 0 ? "404" : "01", mx, my);
        }
      } else if (opts.storyTag === "SHYTOMYR_HVIZHS") {
        // Furry glowing-eyed "Polissia Khvizhs" peeking on car roof + floating stream hearts
        const hx = w * 0.27, hy = h * 0.54 + Math.sin(tSec * 5) * 1.5;
        ctx.fillStyle = "#4A148C";
        ctx.beginPath(); ctx.ellipse(hx, hy, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFEA00";
        ctx.beginPath(); ctx.arc(hx - 3, hy - 1, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + 3, hy - 1, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FF80AB";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("♥", hx + 12, hy - ((tSec * 18) % 22));
      } else if (opts.storyTag === "SHYTOMYR_M06") {
        // Blue & orange turbo jet flames behind pickup
        const flLen = 10 + Math.sin(tSec * 28) * 4;
        ctx.fillStyle = "#FF6D00";
        ctx.beginPath(); ctx.moveTo(8, h * 0.78); ctx.lineTo(8 - flLen, h * 0.80); ctx.lineTo(8, h * 0.83); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#00E5FF";
        ctx.beginPath(); ctx.moveTo(8, h * 0.79); ctx.lineTo(8 - flLen * 0.6, h * 0.805); ctx.lineTo(8, h * 0.82); ctx.closePath(); ctx.fill();
      } else if (opts.storyTag === "SHYTOMYR_ICECREAM") {
        // Drifting cyan cryo-frost crystals
        ctx.fillStyle = "rgba(128, 222, 234, 0.75)";
        for (let k = 0; k < 6; k++) {
          const fx = 10 + k * 17;
          const fy = 22 + ((tSec * 20 + k * 19) % 68);
          ctx.fillRect(fx, fy, 2.5, 2.5);
        }
      } else {
        // Golden sparkles / aroma waves around legend
        ctx.fillStyle = "rgba(255, 224, 130, 0.8)";
        for (let k = 0; k < 5; k++) {
          const gx = w * 0.12 + k * 18 + Math.cos(tSec * 2 + k) * 4;
          const gy = h * 0.48 + Math.sin(tSec * 3 + k) * 6;
          ctx.beginPath(); ctx.arc(gx, gy, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }

    // ★ Collected Shytomyr Booth Relics Animated on Counter Sill ★
    const relics = opts.shytomyrRelics || [];
    if (relics.length > 0) {
      ctx.save();
      relics.slice(0, 6).forEach((relId, idx) => {
        const rx = w * 0.56 + idx * 14.5;
        const ry = h - 12;
        if (relId === "RELIC_KEVLAR_SOCKS") {
          const sway = Math.sin(tSec * 2.5) * 1.2;
          ctx.fillStyle = "#1565C0"; ctx.fillRect(rx - 3 + sway * 0.4, ry - 6, 6, 8);
          ctx.fillStyle = "#FFD54F"; ctx.fillRect(rx - 3 + sway * 0.4, ry - 2, 7, 3);
        } else if (relId === "RELIC_TETERIV_METEOR") {
          const levY = ry - 6 + Math.sin(tSec * 4) * 2.2;
          ctx.fillStyle = "rgba(105, 240, 174, 0.35)";
          ctx.beginPath(); ctx.arc(rx, levY, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#00E676";
          ctx.beginPath(); ctx.arc(rx, levY, 3, 0, Math.PI * 2); ctx.fill();
        } else if (relId === "RELIC_CRYO_CONE") {
          ctx.fillStyle = "#D7CCC8";
          ctx.beginPath(); ctx.moveTo(rx - 3, ry - 4); ctx.lineTo(rx + 3, ry - 4); ctx.lineTo(rx, ry + 4); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#80DEEA";
          ctx.beginPath(); ctx.arc(rx, ry - 6, 3.5, 0, Math.PI * 2); ctx.fill();
        } else if (relId === "RELIC_GOLD_DERUN") {
          ctx.fillStyle = "#FFA000";
          ctx.beginPath(); ctx.ellipse(rx, ry - 2, 5.5, 3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(255, 245, 157, 0.75)";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(rx, ry - 6); ctx.lineTo(rx + Math.sin(tSec * 5) * 2, ry - 12); ctx.stroke();
        } else if (relId === "RELIC_404_FLOPPY") {
          ctx.fillStyle = "#00E5FF";
          ctx.fillRect(rx - 4, ry - 8, 8, 8);
          ctx.fillStyle = "#101820";
          ctx.fillRect(rx - 2, ry - 7, 4, 3);
        } else if (relId === "RELIC_AMBER_BEETLE") {
          ctx.fillStyle = "rgba(255, 179, 0, 0.45)";
          ctx.beginPath(); ctx.arc(rx, ry - 4, 6 + Math.sin(tSec * 3.5), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FFB300";
          ctx.beginPath(); ctx.arc(rx, ry - 4, 3.5, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.restore();
    }
  }
