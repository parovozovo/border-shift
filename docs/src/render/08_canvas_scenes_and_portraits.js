  // ★ BESPOKE RETINA HiDPI CANVAS & ANIMATED SCENE ENGINE (v9.0) ★
  let menuAnimRaf = null;
  let smoothBarrierAngle = 0;

  function prepareHiDpiCanvas(canvas, logicalW, logicalH) {
    if (!canvas) return null;
    if (!canvas._logicalW) canvas._logicalW = logicalW || canvas.width || 200;
    if (!canvas._logicalH) canvas._logicalH = logicalH || canvas.height || 172;
    const w = canvas._logicalW;
    const h = canvas._logicalH;
    const rawDpr = (typeof window !== "undefined" && window.devicePixelRatio) ? window.devicePixelRatio : 1;
    const dpr = Math.min(2, Math.max(1, Number(rawDpr) || 1));
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (typeof ctx.setTransform === "function") ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h, dpr };
  }

  function stopMenuAnimation() {
    if (menuAnimRaf && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(menuAnimRaf);
    }
    menuAnimRaf = null;
  }

  function drawMenuPanorama(canvas, tSec = 0) {
    const prep = prepareHiDpiCanvas(canvas, 436, 204);
    if (!prep) return;
    const { ctx, w, h } = prep;

    // 1. Rich Twilight Frontier Sky + Crescent Moon Glow
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.66);
    sky.addColorStop(0, "#070E15");
    sky.addColorStop(0.50, "#142430");
    sky.addColorStop(1, "#2A3D38");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Horizon warm city/checkpoint haze
    const horizonGlow = ctx.createRadialGradient(w * 0.78, h * 0.56, 8, w * 0.78, h * 0.56, w * 0.55);
    horizonGlow.addColorStop(0, "rgba(224, 177, 69, 0.16)");
    horizonGlow.addColorStop(1, "rgba(224, 177, 69, 0)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, w, h * 0.66);

    // Subtle twinkling stars + Crescent Moon with atmospheric halo
    [[34, 18], [86, 30], [142, 13], [212, 22], [274, 16], [336, 28], [398, 17], [420, 34]].forEach(([sx, sy], i) => {
      const alpha = 0.30 + 0.45 * Math.abs(Math.sin(tSec * 1.4 + i * 1.3));
      ctx.fillStyle = `rgba(255, 249, 226, ${alpha.toFixed(2)})`;
      ctx.fillRect(sx, sy, i % 2 === 0 ? 1.8 : 1.3, i % 2 === 0 ? 1.8 : 1.3);
    });
    const moonHalo = ctx.createRadialGradient(w * 0.13, 30, 6, w * 0.13, 30, 34);
    moonHalo.addColorStop(0, "rgba(239, 226, 189, 0.25)");
    moonHalo.addColorStop(1, "rgba(239, 226, 189, 0)");
    ctx.fillStyle = moonHalo;
    ctx.beginPath(); ctx.arc(w * 0.13, 30, 34, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.13, 30, 11, 0, Math.PI * 2); ctx.fillStyle = "#F4E9CA"; ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.13 + 4.2, 26.8, 10, 0, Math.PI * 2); ctx.fillStyle = "#0F1A23"; ctx.fill();

    // 2. Layered Carpathian Ridge + Drifting Night Mist
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    for (let ci = 0; ci < 3; ci++) {
      const clx = ((tSec * (5 + ci * 1.8) + ci * 145) % (w + 96)) - 48;
      ctx.beginPath(); ctx.ellipse(clx, 24 + ci * 14, 38, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#162320";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.quadraticCurveTo(w * 0.14, h * 0.36, w * 0.34, h * 0.55);
    ctx.quadraticCurveTo(w * 0.54, h * 0.31, w * 0.76, h * 0.53);
    ctx.quadraticCurveTo(w * 0.90, h * 0.42, w, h * 0.57);
    ctx.lineTo(w, h * 0.64);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#101916";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.quadraticCurveTo(w * 0.22, h * 0.47, w * 0.45, h * 0.59);
    ctx.quadraticCurveTo(w * 0.68, h * 0.44, w, h * 0.61);
    ctx.lineTo(w, h * 0.64);
    ctx.closePath();
    ctx.fill();

    // Drifting valley mist ribbon
    const mistShift = Math.sin(tSec * 0.45) * 18;
    const mistGrad = ctx.createLinearGradient(0, h * 0.52, 0, h * 0.65);
    mistGrad.addColorStop(0, "rgba(180, 210, 215, 0)");
    mistGrad.addColorStop(0.5, "rgba(180, 210, 215, 0.09)");
    mistGrad.addColorStop(1, "rgba(180, 210, 215, 0)");
    ctx.fillStyle = mistGrad;
    ctx.fillRect(mistShift - 20, h * 0.52, w + 40, h * 0.13);

    // Watchtower + Volumetric Rotating Searchlight Cone
    ctx.fillStyle = "#0B1310";
    ctx.fillRect(w * 0.44, h * 0.24, 6, h * 0.35);
    ctx.fillRect(w * 0.405, h * 0.20, 14, 10);
    const sweepX = Math.sin(tSec * 0.95) * 76;
    const beamGrad = ctx.createLinearGradient(w * 0.44, h * 0.25, w * 0.26 + sweepX, h * 0.72);
    beamGrad.addColorStop(0, "rgba(255, 245, 160, 0.24)");
    beamGrad.addColorStop(1, "rgba(255, 245, 160, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.25);
    ctx.lineTo(w * 0.14 + sweepX, h * 0.72);
    ctx.lineTo(w * 0.38 + sweepX, h * 0.72);
    ctx.closePath();
    ctx.fill();

    // Distant horizon highway taillights creeping toward border
    for (let hl = 0; hl < 4; hl++) {
      const lx = (w * 0.02 + ((tSec * 14 + hl * 62) % (w * 0.36)));
      ctx.fillStyle = "rgba(255, 82, 82, 0.55)";
      ctx.fillRect(lx, h * 0.60, 3, 1.5);
      ctx.fillStyle = "rgba(255, 245, 180, 0.45)";
      ctx.fillRect(lx + 4, h * 0.60, 2, 1.5);
    }

    // Distant treeline silhouette
    ctx.fillStyle = "#0D1613";
    ctx.fillRect(0, h * 0.58, w, h * 0.06);

    // 3. Frontier Wet Highway Asphalt + Reflections
    const roadGrad = ctx.createLinearGradient(0, h * 0.63, 0, h);
    roadGrad.addColorStop(0, "#1D2422");
    roadGrad.addColorStop(0.5, "#151A19");
    roadGrad.addColorStop(1, "#0E1211");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, h * 0.63, w, h * 0.37);
    ctx.fillStyle = "#2E3A35";
    ctx.fillRect(0, h * 0.63, w, 2.5);

    ctx.strokeStyle = "rgba(224, 177, 69, 0.42)";
    ctx.setLineDash([16, 12]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.86);
    ctx.lineTo(w, h * 0.86);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Checkpoint Canopy, Illuminated Header Sign, Waving Flag & Booth Interior
    ctx.fillStyle = "#202B26";
    ctx.fillRect(w * 0.67, h * 0.34, w * 0.29, h * 0.36);
    ctx.fillStyle = "#121815";
    ctx.fillRect(w * 0.63, h * 0.27, w * 0.36, 12);
    ctx.fillStyle = "#E0B145";
    ctx.fillRect(w * 0.64, h * 0.295, 52, 7);
    ctx.fillStyle = "#121815";
    ctx.font = "bold 5.5px monospace";
    ctx.fillText("КПП ЗАХІД-04", w * 0.645, h * 0.295 + 5.5);

    // Rotating roof radar
    const dishOsc = Math.sin(tSec * 2.1) * 5;
    ctx.strokeStyle = "#80DEEA";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(w * 0.80, h * 0.27); ctx.lineTo(w * 0.80, h * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.80 + dishOsc * 0.35, h * 0.14, 6, Math.PI, 0); ctx.stroke();

    // Warm lit booth window + desk lamp glow + inspector silhouette
    const inspBob = Math.sin(tSec * 2.0) * 1.1;
    const winGlow = ctx.createRadialGradient(w * 0.79, h * 0.56, 4, w * 0.79, h * 0.56, 42);
    winGlow.addColorStop(0, "rgba(255, 213, 79, 0.30)");
    winGlow.addColorStop(1, "rgba(255, 213, 79, 0)");
    ctx.fillStyle = winGlow;
    ctx.beginPath(); ctx.arc(w * 0.79, h * 0.56, 42, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#E7BA52";
    ctx.fillRect(w * 0.73, h * 0.42, 56, 28);
    ctx.fillStyle = "rgba(255, 252, 230, 0.35)";
    ctx.fillRect(w * 0.73, h * 0.42, 56, 6);
    ctx.fillStyle = "#261E16";
    ctx.beginPath(); ctx.arc(w * 0.79, h * 0.55 + inspBob, 6.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(w * 0.768, h * 0.61 + inspBob * 0.5, 16, 9);

    // Animated waving National Flag on flagpole!
    ctx.fillStyle = "#78909C";
    ctx.fillRect(w * 0.66, h * 0.14, 2, 22);
    for (let fw = 0; fw < 6; fw++) {
      const waveY = Math.sin(tSec * 4.2 + fw * 0.7) * 1.3;
      ctx.fillStyle = "#1565C0";
      ctx.fillRect(w * 0.66 + 2 + fw * 3, h * 0.14 + waveY, 3.2, 5);
      ctx.fillStyle = "#FBC02D";
      ctx.fillRect(w * 0.66 + 2 + fw * 3, h * 0.14 + 5 + waveY, 3.2, 5);
    }

    // 5a. Distant Waiting Vehicle Silhouette on Left Queue
    const qCarX = w * 0.03, qCarY = h * 0.63 + Math.sin(tSec * 14) * 0.32;
    const qHead = ctx.createLinearGradient(qCarX + 54, qCarY + 14, qCarX + 102, qCarY + 18);
    qHead.addColorStop(0, "rgba(255, 240, 150, 0.22)");
    qHead.addColorStop(1, "rgba(255, 240, 150, 0)");
    ctx.fillStyle = qHead;
    ctx.beginPath();
    ctx.moveTo(qCarX + 54, qCarY + 11); ctx.lineTo(qCarX + 102, qCarY + 7);
    ctx.lineTo(qCarX + 102, qCarY + 23); ctx.lineTo(qCarX + 54, qCarY + 17);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#121A1F";
    ctx.beginPath(); ctx.roundRect(qCarX, qCarY + 6, 56, 17, 4); ctx.fill();
    ctx.fillStyle = "#1E292F";
    ctx.beginPath(); ctx.roundRect(qCarX + 9, qCarY, 34, 9, 3); ctx.fill();
    ctx.fillStyle = "#D32F2F"; ctx.fillRect(qCarX + 1, qCarY + 10, 3, 4);
    ctx.fillStyle = "#FFF59D"; ctx.fillRect(qCarX + 52, qCarY + 11, 3, 4);

    // 5. Lead SUV at Gate + Exhaust + Volumetric Headlights + Asphalt Reflection
    const engineVib = Math.sin(tSec * 20) * 0.45;
    const carX = w * 0.25, carY = h * 0.60 + engineVib;
    for (let ep = 0; ep < 3; ep++) {
      const age = (tSec * 1.15 + ep * 0.33) % 1;
      ctx.fillStyle = `rgba(200, 215, 220, ${(1 - age) * 0.25})`;
      ctx.beginPath(); ctx.arc(carX - 4 - age * 22, carY + 26 - age * 14, 2.4 + age * 4.5, 0, Math.PI * 2); ctx.fill();
    }
    const headGrad = ctx.createLinearGradient(carX + 94, carY + 22, carX + 195, carY + 28);
    headGrad.addColorStop(0, "rgba(255, 245, 165, 0.38)");
    headGrad.addColorStop(0.6, "rgba(255, 240, 150, 0.12)");
    headGrad.addColorStop(1, "rgba(255, 240, 150, 0)");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(carX + 94, carY + 18); ctx.lineTo(carX + 195, carY + 11);
    ctx.lineTo(carX + 195, carY + 40); ctx.lineTo(carX + 94, carY + 26);
    ctx.closePath(); ctx.fill();

    // Wet ground reflection under SUV
    ctx.fillStyle = "rgba(255, 82, 82, 0.14)";
    ctx.beginPath(); ctx.ellipse(carX + 10, carY + 40, 16, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255, 245, 157, 0.14)";
    ctx.beginPath(); ctx.ellipse(carX + 112, carY + 40, 24, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Shaded SUV Body
    const bodyGrad = ctx.createLinearGradient(carX, carY, carX, carY + 36);
    bodyGrad.addColorStop(0, "#2C3B43");
    bodyGrad.addColorStop(1, "#141C21");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); ctx.roundRect(carX, carY + 10, 96, 26, 6); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(carX + 6, carY + 13, 84, 2);
    ctx.fillStyle = "#2A3941";
    ctx.beginPath(); ctx.roundRect(carX + 12, carY, 62, 14, 5); ctx.fill();
    ctx.fillStyle = "#0F161A";
    ctx.beginPath(); ctx.roundRect(carX + 18, carY + 3, 48, 8, 2); ctx.fill();
    // Wheels
    [carX + 20, carX + 76].forEach(wx => {
      ctx.fillStyle = "#0B0D0E";
      ctx.beginPath(); ctx.arc(wx, carY + 35, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#90A4AE";
      ctx.beginPath(); ctx.arc(wx, carY + 35, 3.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#FF5252"; ctx.fillRect(carX + 1, carY + 15, 4, 5);
    ctx.fillStyle = "#FFF59D"; ctx.beginPath(); ctx.arc(carX + 92, carY + 20, 3.5, 0, Math.PI * 2); ctx.fill();

    // 6. Red-and-White Barrier Gate + Smooth Pulsing Semaphore Halo (<= 1Hz)
    const barPostX = w * 0.56, barY = h * 0.63;
    ctx.fillStyle = "#37474F";
    ctx.fillRect(barPostX, h * 0.54, 10, 36);
    const pulse = 0.55 + 0.45 * Math.sin(tSec * 3.8);
    ctx.fillStyle = `rgba(255, 23, 68, ${(pulse * 0.26).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(barPostX + 5, h * 0.52, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 23, 68, ${pulse.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(barPostX + 5, h * 0.52, 4, 0, Math.PI * 2); ctx.fill();
    for (let s = 0; s < 6; s++) {
      ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
      ctx.fillRect(barPostX + 10 + s * 14, barY, 14, 5.5);
    }

    // Subtle drifting dust motes / mountain chill
    ctx.fillStyle = "rgba(220, 238, 250, 0.34)";
    for (let sn = 0; sn < 18; sn++) {
      const sx = (sn * 29 + tSec * 16) % w;
      const sy = (sn * 19 + tSec * 24) % h;
      ctx.fillRect(sx, sy, 1.7, 1.7);
    }
  }

  function drawMorningBanner(canvas, dayNumber, tSec = 0, weather = "CLEAR") {
    const prep = prepareHiDpiCanvas(canvas, 420, 84);
    if (!prep) return;
    const { ctx, w, h } = prep;

    // Weather-reactive dawn sky
    const skyTopMap = { CLEAR: dayNumber >= 4 ? "#1A233A" : "#243B55", RAIN: "#1B2630", FOG: "#2B383B", SNOW: "#203344", STORM: "#141826" };
    const skyBotMap = { CLEAR: "#D6824B", RAIN: "#526671", FOG: "#788C91", SNOW: "#6A8294", STORM: "#4A3A58" };
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    sky.addColorStop(0, skyTopMap[weather] || skyTopMap.CLEAR);
    sky.addColorStop(1, skyBotMap[weather] || skyBotMap.CLEAR);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rising sun or misty moon glow
    if (weather === "CLEAR") {
      const sunY = h * 0.54 - Math.sin(tSec * 0.8) * 2;
      const glow = ctx.createRadialGradient(w * 0.22, sunY, 4, w * 0.22, sunY, 34);
      glow.addColorStop(0, "rgba(255, 224, 130, 0.55)");
      glow.addColorStop(1, "rgba(255, 224, 130, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(w * 0.22, sunY, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFD54F";
      ctx.beginPath(); ctx.arc(w * 0.22, sunY, 12, 0, Math.PI * 2); ctx.fill();
    }

    // Horizon silhouettes + pine ridge
    ctx.fillStyle = "#16201B";
    ctx.fillRect(0, h * 0.56, w, h * 0.44);
    for (let tx = 8; tx < w * 0.65; tx += 17) {
      ctx.beginPath(); ctx.moveTo(tx, h * 0.56); ctx.lineTo(tx + 5.5, h * 0.39); ctx.lineTo(tx + 11, h * 0.56); ctx.fill();
    }

    // Road + Checkpoint Canopy on right
    ctx.fillStyle = "#262E2A";
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    ctx.fillStyle = "#1E2622";
    ctx.fillRect(w * 0.66, h * 0.26, w * 0.28, h * 0.46);
    ctx.fillStyle = "#E0B145";
    ctx.fillRect(w * 0.70, h * 0.40, 36, 16);

    // Approaching silhouette supply truck moving toward checkpoint
    const trX = ((tSec * 24) % (w * 0.60)) - 34;
    ctx.fillStyle = "#101614";
    ctx.fillRect(trX, h * 0.55, 28, 12);
    ctx.fillRect(trX + 28, h * 0.59, 9, 8);
    ctx.fillStyle = "#FFF59D";
    ctx.fillRect(trX + 36, h * 0.62, 4, 2);

    // Rotating radar dish + waving flag
    const radSweep = Math.sin(tSec * 3.0) * 6;
    ctx.strokeStyle = "#80DEEA";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.79, h * 0.26); ctx.lineTo(w * 0.79, h * 0.14); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.79 + radSweep * 0.4, h * 0.14, 6, Math.PI, 0); ctx.stroke();
    const flagW = Math.sin(tSec * 4.5) * 1.2;
    ctx.fillStyle = "#1565C0"; ctx.fillRect(w * 0.90, h * 0.14 + flagW, 14, 5);
    ctx.fillStyle = "#FBC02D"; ctx.fillRect(w * 0.90, h * 0.19 + flagW, 14, 5);

    // Morning precipitation overlay
    if (weather === "RAIN" || weather === "STORM") {
      ctx.strokeStyle = "rgba(180, 220, 240, 0.42)";
      ctx.lineWidth = 1;
      for (let r = 0; r < 22; r++) {
        const rx = (r * 21 + tSec * 36) % w;
        const ry = (r * 13 + tSec * 90) % h;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 7); ctx.stroke();
      }
    } else if (weather === "SNOW") {
      ctx.fillStyle = "rgba(245, 250, 255, 0.78)";
      for (let s = 0; s < 22; s++) {
        const sx = (s * 23 + tSec * 16) % w;
        const sy = (s * 17 + tSec * 28) % h;
        ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (weather === "FOG") {
      ctx.fillStyle = "rgba(205, 220, 225, 0.30)";
      ctx.fillRect(0, h * 0.46, w, h * 0.34);
    }
  }

  function drawOnboardingBanner(canvas, tabIdx, tSec = 0) {
    const prep = prepareHiDpiCanvas(canvas, 420, 88);
    if (!prep) return;
    const { ctx, w, h } = prep;

    if (tabIdx === 0) {
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
      const sweep = Math.sin(tSec * 1.4) * 55;
      const beam = ctx.createLinearGradient(w * 0.18, 12, w * 0.26 + sweep, h);
      beam.addColorStop(0, "rgba(255, 224, 130, 0.28)");
      beam.addColorStop(1, "rgba(255, 224, 130, 0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(w * 0.18, 12); ctx.lineTo(w * 0.10 + sweep, h); ctx.lineTo(w * 0.36 + sweep, h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#111615"; ctx.fillRect(0, h * 0.70, w, h * 0.30);
      ctx.fillStyle = "#26332C"; ctx.fillRect(w * 0.70, h * 0.26, 78, h * 0.44);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(w * 0.74, h * 0.38, 36, 18);
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
        ctx.fillRect(w * 0.44 + s * 16, h * 0.67, 16, 5);
      }
      ctx.strokeStyle = "rgba(180, 220, 235, 0.28)";
      ctx.lineWidth = 1;
      for (let r = 0; r < 18; r++) {
        const rx = (r * 27 + tSec * 45) % w;
        const ry = (r * 19 + tSec * 90) % h;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 8); ctx.stroke();
      }
    } else if (tabIdx === 1) {
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#0A1726"); bg.addColorStop(1, "#112822");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(79, 195, 247, 0.18)"; ctx.lineWidth = 1;
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
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1C1414"); bg.addColorStop(0.5, "#171D1A"); bg.addColorStop(1, "#111420");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3E2723"; ctx.fillRect(28, 30, 62, 34);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(34, 38, 18, 12);
      ctx.fillStyle = "#81C784"; ctx.font = "bold 12px monospace"; ctx.fillText("$", 58, 52);
      const vanX = 166 + Math.sin(tSec * 3) * 2;
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.roundRect(vanX, 32, 86, 30, 5); ctx.fill();
      ctx.fillStyle = "#101618"; ctx.fillRect(vanX + 54, 37, 22, 11);
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(vanX + 18, 64, 6, 0, Math.PI * 2); ctx.arc(vanX + 68, 64, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFF59D"; ctx.fillRect(vanX + 82, 46, 4, 4);
      const rx = 345, ry = 44;
      ctx.strokeStyle = "#FF5252"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(rx, ry, 18 + Math.sin(tSec * 4) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 24, ry); ctx.lineTo(rx + 24, ry); ctx.moveTo(rx, ry - 24); ctx.lineTo(rx, ry + 24); ctx.stroke();
    } else {
      ctx.fillStyle = "#3B291B"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#F1E8D2"; ctx.fillRect(28, 16, 108, 58);
      ctx.fillStyle = "#4E342E"; ctx.fillRect(40, 26, 54, 6); ctx.fillRect(40, 38, 74, 4); ctx.fillRect(40, 48, 60, 4);
      const uvSweep = Math.sin(tSec * 2.5) * 22;
      ctx.fillStyle = "rgba(179, 136, 255, 0.30)";
      ctx.beginPath(); ctx.arc(82 + uvSweep, 45, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1D2621";
      ctx.beginPath(); ctx.roundRect(166, 20, 74, 48, 8); ctx.fill();
      ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "22px sans-serif"; ctx.fillText("🐕", 190, 52);
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
    const prep = prepareHiDpiCanvas(canvas, 420, 88);
    if (!prep) return;
    const { ctx, w, h } = prep;

    const owned = st.ownedAssets || [];
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    sky.addColorStop(0, "#091019");
    sky.addColorStop(1, "#1C2B38");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Crescent moon & twinkling night stars
    ctx.fillStyle = "#EFE2BD";
    ctx.beginPath(); ctx.arc(w * 0.92, 18, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0F1924";
    ctx.beginPath(); ctx.arc(w * 0.92 + 3, 16, 6.2, 0, Math.PI * 2); ctx.fill();

    [[24, 14], [78, 22], [140, 12], [220, 19], [310, 11], [358, 24]].forEach(([sx, sy], i) => {
      const a = 0.35 + 0.45 * Math.abs(Math.sin(tSec * 1.9 + i));
      ctx.fillStyle = `rgba(255,250,220,${a.toFixed(2)})`;
      ctx.fillRect(sx, sy, 2, 2);
    });

    // Ground / Driveway
    ctx.fillStyle = "#19221E";
    ctx.fillRect(0, h * 0.68, w, h * 0.32);

    // Home Architecture evolves with owned realty!
    const hasVilla = owned.includes("spain_villa") || owned.includes("dnipro_mansion");
    const hasPenthouse = owned.includes("kyivhrad_flat") || owned.includes("carpathian_chalet");
    const hasHouse = owned.includes("suburban_brick_house") || owned.includes("border_hotel");

    if (hasVilla) {
      ctx.fillStyle = "#EDE7F6"; ctx.fillRect(w * 0.08, h * 0.24, 125, 42);
      ctx.fillStyle = "#E0B145"; ctx.fillRect(w * 0.06, h * 0.20, 133, 6);
      // Shimmering animated pool water
      ctx.fillStyle = "#29B6F6"; ctx.fillRect(w * 0.40, h * 0.56, 52, 12);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(w * 0.41 + Math.sin(tSec * 3) * 6, h * 0.59, 14, 2);
    } else if (hasPenthouse) {
      ctx.fillStyle = "#37474F"; ctx.fillRect(w * 0.08, h * 0.16, 78, 50);
      ctx.fillStyle = "#FFE082";
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 3; wx++) {
          ctx.fillRect(w * 0.11 + wx * 20, h * 0.22 + wy * 13, 10, 7);
        }
      }
    } else {
      ctx.fillStyle = hasHouse ? "#6D4C41" : "#3E4A45";
      ctx.fillRect(w * 0.10, h * 0.36, 74, 30);
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.36); ctx.lineTo(w * 0.10 + 37, h * 0.18); ctx.lineTo(w * 0.10 + 78, h * 0.36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#FFD54F";
      ctx.fillRect(w * 0.14, h * 0.44, 14, 12);
      ctx.fillRect(w * 0.21, h * 0.44, 14, 12);
      // Chimney & cozy rising smoke wisps
      ctx.fillStyle = "#4E342E"; ctx.fillRect(w * 0.23, h * 0.16, 8, 12);
      for (let sm = 0; sm < 3; sm++) {
        const age = (tSec * 0.55 + sm * 0.33) % 1;
        ctx.fillStyle = `rgba(220, 230, 235, ${(1 - age) * 0.32})`;
        ctx.beginPath(); ctx.arc(w * 0.24 + Math.sin(age * 4) * 3, h * 0.14 - age * 14, 2.5 + age * 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Shawarma Kiosk neon badge + grill smoke
    if (owned.includes("shawarma_kiosk")) {
      const neon = 0.65 + 0.35 * Math.sin(tSec * 3.8);
      ctx.fillStyle = "#4E342E"; ctx.fillRect(w * 0.45, h * 0.40, 42, 26);
      ctx.fillStyle = `rgba(255, 138, 101, ${neon.toFixed(2)})`;
      ctx.fillRect(w * 0.46, h * 0.35, 40, 6);
    }

    // Best Car in Garage Showcase with soft overhead showroom cone!
    let carCol = null, carStyle = null;
    if (owned.includes("monako_hypercar")) { carCol = "#D50000"; carStyle = "SPORT"; }
    else if (owned.includes("porsche_911")) { carCol = "#FBC02D"; carStyle = "SPORT"; }
    else if (owned.includes("gelik_v8")) { carCol = "#1C242B"; carStyle = "SUV"; }
    else if (owned.includes("euro_bmw") || owned.includes("audi_q7_blyakha")) { carCol = "#263238"; carStyle = "SUV"; }
    else if (owned.includes("skoda_octavia_rs") || owned.includes("camry_35") || owned.includes("lanos_sport")) { carCol = "#455A64"; carStyle = "SEDAN"; }
    else if (owned.includes("steppe_ebike")) { carCol = "#00ACC1"; carStyle = "E_SCOOTER"; }

    if (carCol) {
      const cx = w * 0.66, cy = h * 0.48;
      const spot = ctx.createRadialGradient(cx + 34, cy + 10, 4, cx + 34, cy + 12, 48);
      spot.addColorStop(0, "rgba(255, 245, 180, 0.22)");
      spot.addColorStop(1, "rgba(255, 245, 180, 0)");
      ctx.fillStyle = spot;
      ctx.fillRect(cx - 12, cy - 18, 96, 46);
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
    const reduced = typeof isMotionReduced === "function" && isMotionReduced();
    if (reduced) {
      const c = document.getElementById("menu-canvas");
      if (c) drawMenuPanorama(c, 0);
      return;
    }
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

  // ★ DISTINCT MALE VS FEMALE ILLUSTRATED PORTRAIT + REACTIONS & SPEECH ANIMATION ★
  function drawPortrait(ctx, p, cx, bottomY, scale, opts = {}) {
    const isFemale = p.gender === "F";
    const isLive = !!opts.isLive;
    const tSec = opts.timeSec || 0;
    const arriveP = (typeof opts.arriveProgress === "number") ? Math.max(0, Math.min(1, opts.arriveProgress)) : 1;
    const easedArrive = 1 - Math.pow(1 - arriveP, 3);
    const arriveShiftY = (1 - easedArrive) * 16 * scale;
    const breathY = isLive ? Math.sin(tSec * 2.1) * 1.4 * scale : 0;
    const headBob = isLive ? Math.sin(tSec * 2.1 - 0.5) * 1.1 * scale : 0;
    const blinkCycle = (tSec + ((p.skinTone || 0) * 0.7)) % 3.8;
    const isBlinking = isLive && opts.reactionState !== "INTIMIDATED" && blinkCycle > 3.65;
    const eyeLookX = isLive && opts.reactionState !== "INTIMIDATED" ? Math.sin(tSec * 1.15) * 1.0 * scale : 0;
    const isSpeaking = Boolean(opts.speechActive && isLive && opts.reactionState !== "INTIMIDATED");

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
    const hTop = bottomY - sh - hh + 4 * scale + headBob + arriveShiftY;

    // 1. FEMALE BACK HAIR
    if (isFemale && p.headwear !== 2) {
      const hSt = (p.hairStyle || 0) % 6;
      ctx.fillStyle = hair;
      if (hSt === 4) {
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

    // Soft drop shadow behind torso
    const coatY = bottomY - sh + breathY + arriveShiftY;
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2 - 2 * scale, coatY + 3 * scale, sw + 4 * scale, sh + 16, 22 * scale);
    ctx.fill();

    // 2. Shoulders / Coat with depth & outfit styles
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, coatY, sw, sh + 14, 22 * scale);
    ctx.fill();
    ctx.stroke();

    // Coat shading & lapels
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, coatY + sh * 0.55, sw, sh * 0.55, 10 * scale);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.4 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - sw * 0.25, coatY + 4 * scale); ctx.lineTo(cx - sw * 0.14, coatY + sh * 0.55);
    ctx.moveTo(cx + sw * 0.25, coatY + 4 * scale); ctx.lineTo(cx + sw * 0.14, coatY + sh * 0.55);
    ctx.stroke();
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.2 * scale;

    if (isFemale) {
      ctx.fillStyle = "#F5E6D3";
      ctx.beginPath();
      ctx.moveTo(cx - 16 * scale, coatY); ctx.lineTo(cx + 16 * scale, coatY); ctx.lineTo(cx, coatY + 23 * scale);
      ctx.closePath(); ctx.fill();
      if (outfitIdx === 4) {
        ctx.fillStyle = "#C62828";
        ctx.fillRect(cx - 3 * scale, coatY + 12 * scale, 6 * scale, 18 * scale);
      }
    } else if (outfitIdx === 2 || p.specialId === "NABK_AGENT") {
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.moveTo(cx - 15 * scale, coatY); ctx.lineTo(cx + 15 * scale, coatY); ctx.lineTo(cx, coatY + 22 * scale);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = p.specialId === "NABK_AGENT" ? "#B71C1C" : "#263238";
      ctx.beginPath();
      ctx.moveTo(cx - 4 * scale, coatY + 5 * scale); ctx.lineTo(cx + 4 * scale, coatY + 5 * scale);
      ctx.lineTo(cx + 2 * scale, coatY + 26 * scale); ctx.lineTo(cx - 2 * scale, coatY + 26 * scale);
      ctx.closePath(); ctx.fill();
    } else if (outfitIdx === 0) {
      ctx.strokeStyle = "#ECEFF1";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 10 * scale, coatY + 4 * scale); ctx.lineTo(cx - 11 * scale, coatY + 24 * scale);
      ctx.moveTo(cx + 10 * scale, coatY + 4 * scale); ctx.lineTo(cx + 11 * scale, coatY + 24 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    } else if (outfitIdx === 4) {
      ctx.fillStyle = "#FAF6EC";
      ctx.fillRect(cx - 12 * scale, coatY, 24 * scale, 24 * scale);
      ctx.fillStyle = "#B71C1C";
      ctx.fillRect(cx - 3 * scale, coatY + 3 * scale, 6 * scale, 20 * scale);
    } else {
      ctx.strokeStyle = "#90A4AE";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.moveTo(cx, coatY + 2 * scale); ctx.lineTo(cx, coatY + sh); ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    if (p.scarOrDetail === 3) {
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath(); ctx.arc(cx, coatY + 6 * scale, 20 * scale, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    if (opts.uvActive && p.specialId === "NABK_AGENT") {
      ctx.fillStyle = "#FF1744";
      ctx.beginPath(); ctx.arc(cx - 22 * scale, coatY + 18 * scale, 4.5 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FF80AB";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath(); ctx.arc(cx - 22 * scale, coatY + 18 * scale, 9 * scale, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#171717";
      ctx.lineWidth = 2.2 * scale;
    }

    // 3. Neck with soft chin shadow
    const neckW = (isFemale ? 20 : 28) * scale;
    ctx.fillStyle = skin;
    ctx.fillRect(cx - neckW / 2, coatY - 12 * scale, neckW, 18 * scale);
    ctx.fillStyle = skinShade;
    ctx.fillRect(cx - neckW / 2, coatY - 12 * scale, neckW, 8 * scale);

    if (p.headwear === 2) {
      ctx.fillStyle = "#8D4E42";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.68, hTop - 7 * scale, hw * 1.36, hh * 1.18, 30 * scale); ctx.fill(); ctx.stroke();
    }

    // 4. Ears + Earrings
    const earY = hTop + hh * 0.54;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx - hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.arc(cx + hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    if (isFemale && (p.earrings || 1) > 0) {
      ctx.fillStyle = (p.earrings === 2) ? "#E0E0E0" : "#FFD54F";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.54, earY + 7 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.54, earY + 7 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Head contour with 3D radial booth-lamp skin lighting!
    const headRadius = (isFemale ? 28 : (fs === 2 ? 28 : (fs === 1 ? 14 : 20))) * scale;
    const faceGrad = ctx.createRadialGradient(cx + hw * 0.14, hTop + hh * 0.30, hw * 0.12, cx, hTop + hh * 0.52, hw * 0.78);
    faceGrad.addColorStop(0, skin);
    faceGrad.addColorStop(1, skinShade);
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2, hTop, hw, hh, headRadius);
    ctx.fill();
    ctx.stroke();

    // Soft jaw shading + blush
    ctx.fillStyle = skinShade;
    ctx.globalAlpha = 0.28;
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
        ctx.beginPath(); ctx.arc(cx + hw * fx, hTop + hh * 0.57, 1.3 * scale, 0, Math.PI * 2); ctx.fill();
      });
    }

    // 6. Hair & Headwear
    const hSt = (p.hairStyle || 0) % 8;
    if (isFemale) {
      ctx.fillStyle = hair;
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.55, hTop - 7 * scale, hw * 1.1, hh * 0.28, 18 * scale); ctx.fill();
      if ((hSt === 1 || hSt === 0) && p.headwear !== 2) {
        ctx.beginPath(); ctx.arc(cx, hTop - 11 * scale, 13 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (hSt === 2 && p.headwear !== 2) {
        ctx.beginPath();
        ctx.moveTo(cx - hw * 0.52, hTop + 6 * scale);
        ctx.quadraticCurveTo(cx, hTop + 20 * scale, cx + hw * 0.52, hTop + 6 * scale);
        ctx.lineTo(cx + hw * 0.52, hTop - 6 * scale); ctx.lineTo(cx - hw * 0.52, hTop - 6 * scale);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillRect(cx - hw * 0.56, hTop + 8 * scale, 9 * scale, hh * 0.62);
      ctx.fillRect(cx + hw * 0.47, hTop + 8 * scale, 9 * scale, hh * 0.62);
    } else if (p.headwear === 0) {
      ctx.fillStyle = hair;
      if (hSt === 3) {
        ctx.fillRect(cx - hw * 0.53, hTop + 8 * scale, 7 * scale, hh * 0.34);
        ctx.fillRect(cx + hw * 0.46, hTop + 8 * scale, 7 * scale, hh * 0.34);
        ctx.fillStyle = "rgba(255,255,255,0.42)";
        ctx.beginPath(); ctx.ellipse(cx - 10 * scale, hTop + 8 * scale, 7 * scale, 3 * scale, -0.3, 0, Math.PI * 2); ctx.fill();
      } else if (hSt === 2) {
        for (let ci = -2; ci <= 2; ci++) {
          ctx.beginPath(); ctx.arc(cx + ci * 12 * scale, hTop + 2 * scale, 12 * scale, 0, Math.PI * 2); ctx.fill();
        }
      } else if (hSt === 5) {
        ctx.beginPath();
        ctx.moveTo(cx - hw * 0.52, hTop + 10 * scale); ctx.lineTo(cx - hw * 0.32, hTop - 12 * scale);
        ctx.lineTo(cx - hw * 0.08, hTop - 4 * scale); ctx.lineTo(cx + hw * 0.14, hTop - 14 * scale);
        ctx.lineTo(cx + hw * 0.36, hTop - 5 * scale); ctx.lineTo(cx + hw * 0.52, hTop + 10 * scale);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.roundRect(cx - hw * 0.53, hTop - 6 * scale, hw * 1.06, hh * 0.25, 12 * scale); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath(); ctx.moveTo(cx - hw * 0.30, hTop - 1 * scale); ctx.lineTo(cx + hw * 0.15, hTop - 1 * scale); ctx.stroke();
        ctx.strokeStyle = "#171717";
        ctx.lineWidth = 2.2 * scale;
      }
    }

    if (p.headwear === 1) {
      ctx.fillStyle = "#3E4A3F";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.56, hTop - 9 * scale, hw * 1.12, 22 * scale, 12 * scale); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#263228";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.42, hTop + 7 * scale, hw * 0.98, 7 * scale, 4 * scale); ctx.fill(); ctx.stroke();
    } else if (p.headwear === 3) {
      ctx.fillStyle = "#6D4C41";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.56, hTop - 12 * scale, hw * 1.12, 25 * scale, 14 * scale); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#4E342E";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.58, hTop + 5 * scale, hw * 1.16, 10 * scale, 4 * scale); ctx.fill(); ctx.stroke();
    } else if (p.headwear === 4) {
      ctx.fillStyle = "#2E473B";
      ctx.beginPath(); ctx.roundRect(cx - hw * 0.62, hTop - 13 * scale, hw * 1.24, 23 * scale, 7 * scale); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFCA28";
      ctx.beginPath(); ctx.arc(cx, hTop - 3 * scale, 4.5 * scale, 0, Math.PI * 2); ctx.fill();
    } else if (p.headwear === 5) {
      ctx.fillStyle = "#37474F";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.70, hTop + 4 * scale, hw * 1.40, 6 * scale, 3 * scale);
      ctx.roundRect(cx - hw * 0.45, hTop - 13 * scale, hw * 0.90, 19 * scale, 8 * scale);
      ctx.fill(); ctx.stroke();
    }

    // 7. Eyes + Subtle Idle Gaze Glance + Eyebrows + Blink + Nose + Sweat
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
      ctx.arc(cx - eyeOx + eyeLookX, eyeY, pupR, 0, Math.PI * 2);
      ctx.arc(cx + eyeOx + eyeLookX, eyeY, pupR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(cx - eyeOx + eyeLookX + 1.2 * scale, eyeY - 1.2 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.arc(cx + eyeOx + eyeLookX + 1.2 * scale, eyeY - 1.2 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isFemale) {
      ctx.strokeStyle = "#171717"; ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 5 * scale, eyeY - 3 * scale); ctx.lineTo(cx - eyeOx - 9 * scale, eyeY - 7 * scale);
      ctx.moveTo(cx + eyeOx + 5 * scale, eyeY - 3 * scale); ctx.lineTo(cx + eyeOx + 9 * scale, eyeY - 7 * scale);
      ctx.stroke();
      ctx.strokeStyle = hair; ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.arc(cx - eyeOx, eyeY - 6 * scale, 8 * scale, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + eyeOx, eyeY - 6 * scale, 8 * scale, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
    } else {
      ctx.strokeStyle = hair; ctx.lineWidth = 3.5 * scale;
      const browTilt = (p.expression === 2 || opts.reactionState === "INTIMIDATED") ? 2.5 * scale : 0;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 8 * scale, eyeY - 9 * scale - browTilt); ctx.lineTo(cx - eyeOx + 8 * scale, eyeY - 10 * scale + browTilt);
      ctx.moveTo(cx + eyeOx - 8 * scale, eyeY - 10 * scale + browTilt); ctx.lineTo(cx + eyeOx + 8 * scale, eyeY - 9 * scale - browTilt);
      ctx.stroke();
    }

    ctx.strokeStyle = skinShade; ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 1 * scale, eyeY + 3 * scale); ctx.lineTo(cx + 3 * scale, eyeY + 13 * scale); ctx.lineTo(cx - 2 * scale, eyeY + 14 * scale);
    ctx.stroke();

    // Glasses + crisp lens glint
    ctx.strokeStyle = p.glasses === 4 ? "#E0B145" : "#171717";
    ctx.lineWidth = 2.2 * scale;
    if (p.glasses > 0) {
      ctx.fillStyle = p.glasses === 2 ? "rgba(16,32,39,0.88)" : "rgba(224,247,250,0.28)";
      if (p.glasses === 3) {
        ctx.beginPath(); ctx.arc(cx - eyeOx, eyeY, 9.5 * scale, 0, Math.PI * 2); ctx.arc(cx + eyeOx, eyeY, 9.5 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(cx - eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, p.glasses === 4 ? 10 * scale : 14 * scale, 4 * scale);
        ctx.roundRect(cx + eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, p.glasses === 4 ? 10 * scale : 14 * scale, 4 * scale);
        ctx.fill(); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(cx - eyeOx + 10 * scale, eyeY - 1 * scale); ctx.lineTo(cx + eyeOx - 10 * scale, eyeY - 1 * scale); ctx.stroke();
      // Diagonal reflective lens glint
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 6 * scale, eyeY - 4 * scale); ctx.lineTo(cx - eyeOx - 1 * scale, eyeY + 2 * scale);
      ctx.moveTo(cx + eyeOx - 6 * scale, eyeY - 4 * scale); ctx.lineTo(cx + eyeOx - 1 * scale, eyeY + 2 * scale);
      ctx.stroke();
    }

    if (p.scarOrDetail === 1) {
      ctx.strokeStyle = opts.uvActive ? "#FF4081" : "#B71C1C";
      ctx.lineWidth = (opts.uvActive ? 3.4 : 2.6) * scale;
      ctx.beginPath(); ctx.moveTo(cx + hw * 0.16, eyeY + 8 * scale); ctx.lineTo(cx + hw * 0.34, eyeY + 22 * scale); ctx.stroke();
      ctx.strokeStyle = "#171717";
    }

    if (opts.reactionState === "INTIMIDATED") {
      const dropSlide = isLive ? ((tSec * 14) % 12) * scale : 0;
      ctx.fillStyle = "#4FC3F7";
      ctx.beginPath(); ctx.ellipse(cx + hw * 0.38, eyeY - 10 * scale + dropSlide, 3 * scale, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx - hw * 0.36, eyeY - 4 * scale + (dropSlide * 0.6), 2.5 * scale, 4 * scale, 0, 0, Math.PI * 2); ctx.fill();
    }

    // 8. Mustache / Beard & Animated Talking / Reacting Mouth
    const mouthY = hTop + hh * 0.77;
    if (!isFemale && p.facialHair > 0) {
      ctx.fillStyle = hair;
      if (p.facialHair === 1) {
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.roundRect(cx - hw * 0.44, mouthY - 6 * scale, hw * 0.88, 22 * scale, 10 * scale); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.facialHair === 2 || p.facialHair === 4) {
        const mw = (p.facialHair === 4 ? 38 : 26) * scale;
        ctx.beginPath(); ctx.roundRect(cx - mw / 2, mouthY - 8 * scale, mw, 8 * scale, 4 * scale); ctx.fill();
      } else if (p.facialHair === 3 || p.facialHair === 5) {
        ctx.beginPath(); ctx.roundRect(cx - hw * 0.38, mouthY - 5 * scale, hw * 0.76, p.facialHair === 5 ? 24 * scale : 18 * scale, 10 * scale); ctx.fill();
      } else if (p.facialHair === 6) {
        ctx.beginPath(); ctx.roundRect(cx - 11 * scale, mouthY + 2 * scale, 22 * scale, 14 * scale, 6 * scale); ctx.fill();
      }
    }

    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.2 * scale;
    const talkOpen = isSpeaking ? Math.abs(Math.sin(tSec * 14)) * 3.8 * scale : 0;
    if (opts.reactionState === "INTIMIDATED") {
      ctx.fillStyle = "#4E2728";
      ctx.beginPath(); ctx.ellipse(cx, mouthY + 1 * scale, 6 * scale, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    } else if (isFemale) {
      ctx.fillStyle = lipColors[(p.lipColor || 0) % lipColors.length];
      ctx.beginPath(); ctx.ellipse(cx, mouthY, 8.5 * scale, (opts.reactionState === "COFFEE_GIVEN" ? 5 : 4.2) * scale + talkOpen * 0.65, 0, 0, Math.PI * 2); ctx.fill();
    } else if (opts.reactionState === "COFFEE_GIVEN") {
      ctx.beginPath(); ctx.arc(cx, mouthY - 2 * scale, 9 * scale, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else if (talkOpen > 0.8 * scale) {
      ctx.fillStyle = "#5A2A27";
      ctx.beginPath(); ctx.ellipse(cx, mouthY + 0.5 * scale, 7.5 * scale, talkOpen, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(cx - 10 * scale, mouthY); ctx.lineTo(cx + 10 * scale, mouthY - (p.expression === 1 ? 2.5 * scale : 0)); ctx.stroke();
    }
    ctx.restore();
  }

  // ★ DYNAMIC COLOR, DRIVE-IN BRAKING & WHEEL-SPIN TRANSPORT ART ★
  function drawTransportInBooth(ctx, w, h, shape, bodyColor, roofColor, opts = {}) {
    ctx.save();
    const tSec = opts.timeSec || 0;
    const isLive = !!opts.isLive;
    const arriveP = (typeof opts.arriveProgress === "number") ? Math.max(0, Math.min(1, opts.arriveProgress)) : 1;
    const eased = 1 - Math.pow(1 - arriveP, 3);
    const slideX = -(1 - eased) * (w * 0.44);
    const isBraking = isLive && arriveP > 0.68 && arriveP < 0.99;
    const noseDip = isBraking ? Math.sin(((arriveP - 0.68) / 0.31) * Math.PI) * 1.6 : 0;
    const wheelSpin = (1 - eased) * 12;

    const cx = w * 0.28 + slideX;
    const groundY = h * 0.84;

    if (shape === "ON_FOOT") {
      const walkBob = arriveP < 1 ? Math.abs(Math.sin(tSec * 14)) * -2.2 : 0;
      const sway = isLive ? Math.sin(tSec * 2.5) * 1.2 : 0;
      [cx - 26, cx + 4].forEach((bx, idx) => {
        const bw = 20, bh = 18, by = groundY - bh + (idx * 2) + (idx === 0 ? sway : -sway * 0.5) + walkBob;
        ctx.fillStyle = "#1565C0"; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "#C62828"; ctx.fillRect(bx + 3, by, 4, bh); ctx.fillRect(bx + 12, by, 4, bh);
        ctx.fillStyle = "#ECEFF1"; ctx.fillRect(bx, by + 5, bw, 3); ctx.fillRect(bx, by + 11, bw, 3);
        ctx.strokeStyle = "#111"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(bx + bw / 2, by, 5, Math.PI, 0); ctx.stroke();
      });
      ctx.restore();
      return;
    }

    if (shape === "BICYCLE") {
      const wr = 9.5;
      const lx = cx - 22, rx = cx + 18, wy = groundY - wr;
      ctx.strokeStyle = "#14181A"; ctx.lineWidth = 2.2;
      [lx, rx].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "#78909C"; ctx.lineWidth = 1;
        const a1 = wheelSpin, a2 = wheelSpin + Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(wx - Math.cos(a1) * (wr - 2), wy - Math.sin(a1) * (wr - 2)); ctx.lineTo(wx + Math.cos(a1) * (wr - 2), wy + Math.sin(a1) * (wr - 2));
        ctx.moveTo(wx - Math.cos(a2) * (wr - 2), wy - Math.sin(a2) * (wr - 2)); ctx.lineTo(wx + Math.cos(a2) * (wr - 2), wy + Math.sin(a2) * (wr - 2));
        ctx.stroke();
        ctx.strokeStyle = "#14181A"; ctx.lineWidth = 2.2;
      });
      ctx.strokeStyle = bodyColor; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, wy); ctx.lineTo(cx - 2, wy); ctx.lineTo(rx - 5, wy - 15); ctx.lineTo(lx + 6, wy - 12); ctx.closePath();
      ctx.moveTo(rx, wy); ctx.lineTo(rx - 7, wy - 20); ctx.lineTo(rx - 13, wy - 21);
      ctx.stroke();
      ctx.fillStyle = "#C5A880"; ctx.strokeStyle = "#4E342E"; ctx.lineWidth = 1.4;
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
      ctx.strokeStyle = bodyColor; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(rx - 2, wy - 3); ctx.lineTo(rx - 6, wy - 30); ctx.lineTo(rx - 12, wy - 30); ctx.stroke();
      ctx.fillStyle = "#FFF59D";
      ctx.beginPath(); ctx.arc(rx - 2, wy - 27, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    if (shape === "MOTORCYCLE") {
      const vib = isLive ? Math.sin(tSec * 22) * 0.55 : 0;
      const lx = cx - 22, rx = cx + 20, wy = groundY - 8;
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.beginPath(); ctx.ellipse(cx, groundY - 1, 28, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#111"; ctx.lineWidth = 3.5;
      [lx, rx].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, wy, 7.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#B0BEC5"; ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = bodyColor;
      ctx.beginPath(); ctx.roundRect(lx + 4, wy - 15 + vib + noseDip, 30, 9, 4); ctx.fill();
      ctx.fillStyle = "#263238"; ctx.fillRect(lx + 5, wy - 18 + vib + noseDip, 16, 4);
      ctx.strokeStyle = "#CFD8DC"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(rx, wy); ctx.lineTo(rx - 7, wy - 21 + vib + noseDip); ctx.stroke();
      ctx.fillStyle = "#FFF59D"; ctx.beginPath(); ctx.arc(rx - 4, wy - 15 + vib + noseDip, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    // Cars / Buses / Vans / Hearses / Pickups / Trucks / Armored
    const engineVib = isLive ? Math.sin(tSec * 20) * 0.5 : 0;
    const isTall = shape === "MINIBUS" || shape === "HEARSE" || shape === "BUS" || shape === "ARMORED" || shape === "TRUCK";
    const isSuv = shape === "SUV" || shape === "G_WAGON" || shape === "PICKUP";
    const vw = (shape === "BUS" || shape === "TRUCK") ? w * 0.50 : (isTall ? w * 0.47 : w * 0.45);
    const vh = shape === "BUS" ? 39 : (shape === "TRUCK" ? 41 : (isTall ? 34 : (isSuv ? 31 : (shape === "SPORT" ? 23 : 27))));
    const vx = 8 + slideX;
    const vy = groundY - vh - 5 + engineVib + noseDip;

    // Ground contact shadow
    ctx.fillStyle = "rgba(0,0,0,0.40)";
    ctx.beginPath(); ctx.ellipse(vx + vw / 2, groundY - 1, vw * 0.50, 4.6, 0, 0, Math.PI * 2); ctx.fill();

    // Animated exhaust smoke puffs
    if (isLive) {
      for (let p = 0; p < 3; p++) {
        const age = ((tSec * 1.3 + p * 0.33) % 1);
        const ex = vx - 3 - age * 14;
        const ey = groundY - 9 - age * 10;
        ctx.fillStyle = `rgba(200, 210, 215, ${(1 - age) * 0.32})`;
        ctx.beginPath(); ctx.arc(ex, ey, 2 + age * 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Metallic Shaded Lower Body
    const paintGrad = ctx.createLinearGradient(vx, vy, vx, vy + vh);
    paintGrad.addColorStop(0, bodyColor);
    paintGrad.addColorStop(1, roofColor || bodyColor);
    ctx.fillStyle = paintGrad;
    ctx.strokeStyle = "#121618";
    ctx.lineWidth = 1.6;
    if (shape === "TRUCK") {
      ctx.beginPath(); ctx.roundRect(vx, vy + 3, vw * 0.65, vh - 8, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = roofColor || bodyColor;
      ctx.beginPath(); ctx.roundRect(vx + vw * 0.67, vy + 6, vw * 0.33, vh - 11, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#90A4AE"; ctx.fillRect(vx + vw * 0.64, vy, 3, vh * 0.65);
    } else {
      ctx.beginPath();
      ctx.roundRect(vx, vy + (isTall ? 2 : 9), vw, vh - (isTall ? 2 : 9), (shape === "G_WAGON" || shape === "ARMORED") ? 3 : 7);
      ctx.fill(); ctx.stroke();
      // Glossy top shoulder strip & dark rocker panel
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(vx + 5, vy + (isTall ? 5 : 11), vw - 10, 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(vx + 3, vy + vh - 4, vw - 6, 3);
      // Front bumper grille accent
      ctx.fillStyle = "#1A1E22";
      ctx.fillRect(vx + vw - 4, vy + vh - 9, 4, 5);
    }

    // Upper Cabin / Roof
    if (!isTall) {
      const cabX = shape === "PICKUP" ? vx + vw * 0.14 : vx + vw * 0.16;
      const cabW = shape === "PICKUP" ? vw * 0.44 : vw * 0.60;
      ctx.fillStyle = roofColor || bodyColor;
      ctx.beginPath();
      ctx.roundRect(cabX, vy, cabW, shape === "SPORT" ? 11 : 14, shape === "G_WAGON" ? 2 : 6);
      ctx.fill(); ctx.stroke();
    }

    if (shape === "SPORT") {
      ctx.fillStyle = "#111"; ctx.fillRect(vx + 1, vy + 4, 10, 3);
    } else if (shape === "RETRO") {
      ctx.strokeStyle = "#CFD8DC"; ctx.lineWidth = 1.8;
      ctx.strokeRect(vx + vw * 0.24, vy - 4, vw * 0.42, 4);
    } else if (shape === "G_WAGON") {
      ctx.fillStyle = "#1B1E20"; ctx.fillRect(vx - 3, vy + 10, 4, 12);
    } else if (shape === "ARMORED") {
      ctx.fillStyle = "#E0B145"; ctx.fillRect(vx + 6, vy + 17, vw - 12, 3);
      ctx.fillStyle = "#2979FF"; ctx.fillRect(vx + vw * 0.65, vy - 3, 7, 3);
    } else if (shape === "HEARSE") {
      ctx.fillStyle = "#E0B145";
      ctx.fillRect(vx + vw * 0.72, vy + 9, 2.5, 11);
      ctx.fillRect(vx + vw * 0.72 - 3.5, vy + 13, 9.5, 2.5);
    }

    // Sky-tinted Glass Windows + diagonal glint + mirror
    const glassGrad = ctx.createLinearGradient(vx, vy + 3, vx, vy + 14);
    glassGrad.addColorStop(0, "#243540");
    glassGrad.addColorStop(1, "#121A1F");
    ctx.fillStyle = glassGrad;
    if (shape === "BUS") {
      for (let wi = 0; wi < 4; wi++) {
        ctx.fillRect(vx + 7 + wi * (vw * 0.22), vy + 5, vw * 0.17, 12);
      }
    } else if (shape === "TRUCK") {
      ctx.fillRect(vx + vw * 0.74, vy + 9, vw * 0.21, 10);
    } else {
      const winX = vx + vw * 0.20;
      const winW = vw * (shape === "PICKUP" ? 0.34 : 0.48);
      ctx.beginPath(); ctx.roundRect(winX, vy + 3.5, winW, 9.5, 2.5); ctx.fill();
      if (opts.hasPassenger) {
        ctx.fillStyle = "#90A4AE"; ctx.beginPath(); ctx.arc(winX + winW * 0.34, vy + 8, 3.0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#CFD8DC"; ctx.beginPath(); ctx.arc(winX + winW * 0.68, vy + 8, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.34)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(winX + 5, vy + 12); ctx.lineTo(winX + 12, vy + 4); ctx.stroke();
      ctx.fillStyle = roofColor || bodyColor;
      ctx.fillRect(winX + winW - 3, vy + 11, 4, 3);
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    if (shape !== "TRUCK") ctx.fillRect(vx + vw * 0.46, vy + (isTall ? 18 : 16), 5, 1.8);

    // Multi-layered Wheels with Animated Spinning Spokes during Drive-In!
    const wheelXs = shape === "TRUCK" ? [vx + vw * 0.16, vx + vw * 0.42, vx + vw * 0.82] : [vx + vw * 0.22, vx + vw * 0.78];
    const wr = isSuv ? 7 : 5.8;
    wheelXs.forEach(wx => {
      ctx.fillStyle = "#111315";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, wr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#B0BEC5";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, wr * 0.50, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#37474F"; ctx.lineWidth = 1.1;
      const sa = wheelSpin;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(sa) * (wr * 0.45), (groundY - 4) - Math.sin(sa) * (wr * 0.45));
      ctx.lineTo(wx + Math.cos(sa) * (wr * 0.45), (groundY - 4) + Math.sin(sa) * (wr * 0.45));
      ctx.stroke();
      ctx.fillStyle = "#263238";
      ctx.beginPath(); ctx.arc(wx, groundY - 4, 1.4, 0, Math.PI * 2); ctx.fill();
    });

    // Volumetric Headlight Beam + Braking Taillight Bloom
    const beamGrad = ctx.createLinearGradient(vx + vw, groundY - 11, vx + vw + 32, groundY - 7);
    beamGrad.addColorStop(0, "rgba(255, 245, 157, 0.46)");
    beamGrad.addColorStop(1, "rgba(255, 245, 157, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(vx + vw - 1, groundY - 12); ctx.lineTo(vx + vw + 30, groundY - 20);
    ctx.lineTo(vx + vw + 30, groundY - 3); ctx.lineTo(vx + vw - 1, groundY - 8);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#FFF59D"; ctx.fillRect(vx + vw - 5, groundY - 12, 4, 3.5);
    if (isBraking) {
      ctx.fillStyle = "rgba(255, 23, 68, 0.45)";
      ctx.beginPath(); ctx.arc(vx + 2, groundY - 10, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = isBraking ? "#FF1744" : "#FF5252";
    ctx.fillRect(vx + 1, groundY - 12, 3.5, 3.5);
    ctx.restore();
  }

  function drawBoothScene(canvas, opts) {
    const prep = prepareHiDpiCanvas(canvas, 200, 172);
    if (!prep) return;
    const { ctx, w, h } = prep;

    const sirenActive = !!opts.sirenActive;
    const droneWarning = !!opts.droneWarning;
    const dayNumber = opts.dayNumber || 1;
    const barrierState = opts.barrierState || "CLOSED";
    const tSec = opts.timeSec || 0;
    const reduceMotion = !!opts.reduceMotion;
    const isLive = !!opts.isLive && !reduceMotion;
    const nowMs = opts.nowMs || Date.now();
    const weather = opts.weather || "CLEAR";
    const weatherCleared = opts.weatherCleared !== false;
    const hasGenerator = (opts.ownedAssets || []).includes("diesel_generator");
    const isEn = opts.lang === "EN";

    const enterAge = opts.travelerEnteredAt ? Math.max(0, nowMs - opts.travelerEnteredAt) : 9999;
    const arriveProgress = reduceMotion ? 1 : Math.min(1, enterAge / 520);
    const arriveEased = 1 - Math.pow(1 - arriveProgress, 3);
    const portraitShiftY = reduceMotion ? 0 : (1 - arriveEased) * 18;
    const isSpeaking = !reduceMotion && !!(opts.speechAt && (nowMs - opts.speechAt) >= 0 && (nowMs - opts.speechAt) < 1650);

    // Sky gradient + dynamic weather tint
    const skyTopMap = { CLEAR: "#101A24", RAIN: "#182229", FOG: "#2A3437", SNOW: "#1B2A38", STORM: "#0E1420" };
    const skyBotMap = { CLEAR: "#2B4050", RAIN: "#37474F", FOG: "#607177", SNOW: "#546E7A", STORM: "#243045" };
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.44);
    skyGrad.addColorStop(0, sirenActive ? "#5A1F1E" : (droneWarning ? "#4E342E" : (skyTopMap[weather] || (dayNumber >= 4 ? "#1E282E" : "#2D3C45"))));
    skyGrad.addColorStop(1, sirenActive ? "#7D2C2B" : (droneWarning ? "#6D4C41" : (skyBotMap[weather] || "#546E7A")));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.44);

    // Clear starry night sparkles vs slow calm Storm distant bolt (< 1 flash per 4s, WCAG safe)
    if (weather === "CLEAR" && !sirenActive) {
      for (let si = 0; si < 14; si++) {
        const sx = (si * 37 + 9) % Math.floor(w * 0.53);
        const sy = 5 + ((si * 19 + 3) % Math.floor(h * 0.24));
        const alpha = 0.35 + (isLive ? 0.32 * Math.abs(Math.sin(tSec * 1.4 + si)) : 0.2);
        ctx.fillStyle = `rgba(255, 250, 220, ${alpha.toFixed(2)})`;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
    } else if (weather === "STORM" && isLive) {
      const cycle = tSec % 5.5;
      if (cycle > 4.95 && cycle < 5.18) {
        ctx.fillStyle = "rgba(215, 235, 255, 0.20)";
        ctx.fillRect(0, 0, w * 0.54, h * 0.44);
        ctx.strokeStyle = "#FFFDE7";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(w * 0.19, 2);
        ctx.lineTo(w * 0.16, h * 0.14);
        ctx.lineTo(w * 0.21, h * 0.16);
        ctx.lineTo(w * 0.15, h * 0.31);
        ctx.stroke();
      }
    }

    // Drifting clouds
    ctx.fillStyle = weather === "STORM" ? "rgba(255, 255, 255, 0.13)" : "rgba(255, 255, 255, 0.08)";
    for (let ci = 0; ci < 3; ci++) {
      const cx = ((tSec * (isLive ? (3.5 + ci * 1.2) : 0) + ci * 75) % (w + 40)) - 20;
      const cy = 12 + ci * 11;
      ctx.beginPath(); ctx.ellipse(cx, cy, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Watchtower + smooth rotating searchlight
    ctx.fillStyle = "#18211C";
    ctx.fillRect(w * 0.36, h * 0.16, 4, h * 0.22);
    ctx.fillRect(w * 0.34, h * 0.14, 9, 7);
    if (isLive) {
      const sweep = Math.sin(tSec * 1.1) * 16;
      const beam = ctx.createLinearGradient(w * 0.38, h * 0.17, w * 0.15 + sweep, h * 0.45);
      beam.addColorStop(0, "rgba(255, 245, 157, 0.20)");
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
    ctx.fillRect(0, h * 0.36, w * 0.56, h * 0.08);
    for (let tx = 4; tx < w * 0.54; tx += 14) {
      ctx.beginPath(); ctx.moveTo(tx, h * 0.36); ctx.lineTo(tx + 5, h * 0.27); ctx.lineTo(tx + 10, h * 0.36); ctx.fill();
    }

    // Drone alert ONLY during active warning / siren
    if (droneWarning || sirenActive) {
      const dx = w * 0.44 + (isLive ? Math.sin(tSec * 3.2) * 5 : 0), dy = h * 0.14;
      ctx.fillStyle = "rgba(255, 23, 68, 0.36)";
      ctx.beginPath(); ctx.arc(dx, dy + 1, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFCDD2";
      ctx.beginPath();
      ctx.moveTo(dx, dy - 5); ctx.lineTo(dx + 11, dy + 5); ctx.lineTo(dx - 11, dy + 5); ctx.closePath();
      ctx.fill();
    }

    // Asphalt yard & wet/snowy surface accents
    const roadGrad = ctx.createLinearGradient(0, h * 0.43, 0, h);
    if (weather === "RAIN" || weather === "STORM") {
      roadGrad.addColorStop(0, "#242D30");
      roadGrad.addColorStop(1, "#323D40");
    } else if (weather === "SNOW") {
      roadGrad.addColorStop(0, "#425058");
      roadGrad.addColorStop(1, "#54636B");
    } else {
      roadGrad.addColorStop(0, "#2E3532");
      roadGrad.addColorStop(1, "#3E4743");
    }
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, h * 0.43, w * 0.55, h * 0.57);

    if (weather === "RAIN" || weather === "STORM") {
      ctx.fillStyle = "rgba(128, 203, 196, 0.14)";
      ctx.beginPath(); ctx.ellipse(w * 0.27, h * 0.87, 36, 6, 0, 0, Math.PI * 2); ctx.fill();
      if (isLive) {
        const rip = (tSec * 1.8) % 1;
        ctx.strokeStyle = `rgba(178, 223, 219, ${(1 - rip) * 0.42})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(w * 0.25, h * 0.87, 6 + rip * 18, 1.5 + rip * 3.5, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (weather === "SNOW") {
      ctx.fillStyle = "rgba(240, 248, 255, 0.46)";
      ctx.fillRect(0, h * 0.43, w * 0.54, 4);
      ctx.fillRect(0, h - 5, w * 0.54, 5);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, h * 0.66); ctx.lineTo(w * 0.54, h * 0.66); ctx.stroke();
    ctx.setLineDash([]);

    // Dynamic Precipitation Particles
    if (weather === "RAIN" || weather === "STORM") {
      const dropCount = weather === "STORM" ? 30 : 20;
      const spd = weather === "STORM" ? 135 : 95;
      ctx.strokeStyle = "rgba(176, 216, 235, 0.5)";
      ctx.lineWidth = 1.1;
      for (let pi = 0; pi < dropCount; pi++) {
        const px = ((pi * 23 + (isLive ? tSec * 34 : 0)) % (w * 0.54));
        const py = ((pi * 17 + (isLive ? tSec * spd : 0)) % h);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 3.5, py + 7.5);
        ctx.stroke();
      }
    } else if (weather === "SNOW") {
      ctx.fillStyle = "rgba(245, 250, 255, 0.84)";
      for (let pi = 0; pi < 24; pi++) {
        const px = ((pi * 19 + (isLive ? tSec * 14 + Math.sin(tSec * 2 + pi) * 4 : 0)) % (w * 0.54));
        const py = ((pi * 15 + (isLive ? tSec * 28 : 0)) % h);
        ctx.beginPath();
        ctx.arc(Math.abs(px), py, (pi % 2) + 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // WCAG-safe (< 1 Hz alternation) SBK arrest spotlight glow
    if (barrierState === "SBK_ARREST_FLASH") {
      const phase = isLive ? Math.sin(tSec * 5.2) : 1;
      const blueA = phase >= 0 ? 0.36 : 0.14;
      const redA = phase >= 0 ? 0.14 : 0.36;
      ctx.fillStyle = `rgba(21, 101, 192, ${blueA})`;
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.40, w * 0.20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(213, 0, 0, ${redA})`;
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.40, w * 0.20, 0, Math.PI * 2); ctx.fill();
    }

    // Smooth Pivoting Barrier Arm behind car on left/mid lane
    const barY = h * 0.50;
    const pivotX = w * 0.055;
    const targetAngle = barrierState === "OPEN_APPROVED" ? -Math.PI * 0.41 : 0;
    if (reduceMotion) {
      smoothBarrierAngle = targetAngle;
    } else {
      smoothBarrierAngle += (targetAngle - smoothBarrierAngle) * (isLive ? 0.22 : 1);
      if (Math.abs(targetAngle - smoothBarrierAngle) < 0.005) smoothBarrierAngle = targetAngle;
    }

    ctx.fillStyle = "#263238";
    ctx.fillRect(w * 0.03, barY - 12, 10, 38);
    const lightColor = barrierState === "OPEN_APPROVED" ? "#00E676" : (barrierState === "SBK_ARREST_FLASH" ? "#2979FF" : "#FF1744");
    ctx.fillStyle = lightColor;
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(w * 0.03 + 5, barY - 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(w * 0.03 + 5, barY - 6, 3.5, 0, Math.PI * 2); ctx.fill();

    if (typeof ctx.translate === "function" && typeof ctx.rotate === "function") {
      ctx.save();
      ctx.translate(pivotX, barY);
      ctx.rotate(smoothBarrierAngle);
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
        ctx.fillRect(4 + s * (w * 0.075), -3, w * 0.075, 5.5);
      }
      ctx.fillStyle = "#37474F";
      ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      for (let s = 0; s < 6; s++) {
        const sy = barrierState === "OPEN_APPROVED" ? barY - (s + 1) * 5 : barY;
        ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
        ctx.fillRect(w * 0.08 + s * (w * 0.075), sy, w * 0.075, 6);
      }
    }

    // Draw detailed animated transport with smooth drive-in!
    drawTransportInBooth(ctx, w, h, opts.transportShape || "SEDAN", opts.colorHex || "#607D8B", opts.roofHex || "#455A64", {
      timeSec: tSec,
      isLive,
      hasPassenger: !!opts.hasPassenger,
      arriveProgress
    });

    // Fog occlusion over vehicle lane until cleared (or warm floodlight cone when cleared)
    if (weather === "FOG") {
      if (!weatherCleared) {
        const drift = isLive ? Math.sin(tSec * 0.9) * 8 : 0;
        ctx.fillStyle = "rgba(195, 210, 214, 0.74)";
        ctx.beginPath(); ctx.ellipse(w * 0.25 + drift, h * 0.70, w * 0.27, h * 0.20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(176, 195, 200, 0.65)";
        ctx.beginPath(); ctx.ellipse(w * 0.18 - drift, h * 0.56, w * 0.24, h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w * 0.34 + drift * 0.6, h * 0.84, w * 0.22, h * 0.14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(isEn ? "🌫️ DENSE FOG" : "🌫️ ТУМАН", 8, h - 10);
      } else {
        const beam = ctx.createLinearGradient(w * 0.54, h * 0.45, w * 0.04, h * 0.85);
        beam.addColorStop(0, "rgba(255, 249, 196, 0.26)");
        beam.addColorStop(1, "rgba(255, 249, 196, 0.02)");
        ctx.fillStyle = beam;
        ctx.fillRect(0, h * 0.42, w * 0.54, h * 0.56);
      }
    }

    // Booth Interior Backdrop + Warm Lamp Glow + Riveted Window Divider + Counter Sill
    const boothBg = ctx.createLinearGradient(w * 0.55, 0, w, h);
    boothBg.addColorStop(0, "rgba(38, 32, 24, 0.72)");
    boothBg.addColorStop(1, "rgba(16, 20, 18, 0.68)");
    ctx.fillStyle = boothBg;
    ctx.fillRect(w * 0.55, 0, w * 0.45, h);

    // Overhead warm tungsten glow behind traveler
    const bulbGrad = ctx.createRadialGradient(w * 0.77, 14, 4, w * 0.77, 24, w * 0.28);
    bulbGrad.addColorStop(0, "rgba(255, 224, 150, 0.28)");
    bulbGrad.addColorStop(1, "rgba(255, 224, 150, 0)");
    ctx.fillStyle = bulbGrad;
    ctx.fillRect(w * 0.55, 0, w * 0.45, h * 0.68);

    // Subtle divider wall & rivets
    ctx.fillStyle = "#263238";
    ctx.fillRect(w * 0.54, 0, 3.5, h);
    ctx.fillStyle = "#546E7A";
    for (let ry = 12; ry < h - 10; ry += 28) {
      ctx.beginPath(); ctx.arc(w * 0.54 + 1.7, ry, 1.1, 0, Math.PI * 2); ctx.fill();
    }

    // Counter Sill at bottom of window
    ctx.fillStyle = "#4A3528";
    ctx.fillRect(w * 0.55, h - 8, w * 0.45, 8);
    ctx.fillStyle = "rgba(255, 236, 200, 0.14)";
    ctx.fillRect(w * 0.55, h - 8, w * 0.45, 1.5);

    drawPortrait(ctx, opts.portrait, w * 0.77, h * 0.99, 0.84, {
      reactionState: opts.reactionState,
      uvActive: opts.uvActive,
      timeSec: tSec,
      isLive,
      arriveShiftY: portraitShiftY,
      isSpeaking
    });

    // Subtle glass sheen across booth window
    const sheen = ctx.createLinearGradient(w * 0.56, 0, w * 0.96, h);
    sheen.addColorStop(0, "rgba(255,255,255,0.06)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(1, "rgba(255,255,255,0.04)");
    ctx.fillStyle = sheen;
    ctx.fillRect(w * 0.55, 0, w * 0.45, h - 8);

    // Calm Storm booth power dip unless diesel generator is owned (WCAG safe: slow gentle dip <= 1/2s)
    if (weather === "STORM" && !hasGenerator && !opts.uvActive && isLive && Math.sin(tSec * 2.1) > 0.72) {
      ctx.fillStyle = "rgba(8, 12, 18, 0.30)";
      ctx.fillRect(w * 0.55, 0, w * 0.45, h);
    }

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
      const ex = w * 0.89, ey = h - 24;
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
      const tx = w * 0.84, ty = h - 15;
      ctx.fillStyle = "#102027";
      ctx.fillRect(tx, ty, 13, 9);
      ctx.fillStyle = "#1976D2";
      ctx.fillRect(tx + 1.5, ty + 1.5, 10, 6);
      const pulseW = isLive ? 2 + ((tSec * 12) % 8) : 6;
      ctx.fillStyle = "#64FFDA";
      ctx.fillRect(tx + 2.5, ty + 3, pulseW, 1.5);
      ctx.restore();
    }

    // UV Spotlight Beam over booth window + animated scan line!
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

    // Knock Glass Shockwaves VFX
    if (!reduceMotion && opts.knockVfxAt) {
      const kAge = nowMs - opts.knockVfxAt;
      if (kAge >= 0 && kAge < 650) {
        const kp = kAge / 650;
        const kx = w * 0.64, ky = h * 0.46;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 224, 130, ${(1 - kp) * 0.9})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(kx, ky, 5 + kp * 26, 0, Math.PI * 2); ctx.stroke();
        if (kp > 0.15) {
          const kp2 = (kp - 0.15) / 0.85;
          ctx.strokeStyle = `rgba(255, 138, 101, ${(1 - kp2) * 0.7})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(kx, ky, 4 + kp2 * 18, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Visual Coffee Cup with slide-in & rising steam if COFFEE_GIVEN!
    if (opts.reactionState === "COFFEE_GIVEN") {
      const cAge = opts.coffeeVfxAt ? Math.max(0, nowMs - opts.coffeeVfxAt) : 9999;
      const cP = reduceMotion ? 1 : Math.min(1, cAge / 420);
      const cx = (w * 0.50) + (w * 0.08) * (1 - Math.pow(1 - cP, 3));
      const cy = h * 0.82;
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

    // Sniffer dog Bavovna peeking at bottom-left with bounce-in & wagging ears!
    if (opts.snifferActive) {
      const dAge = opts.dogVfxAt ? Math.max(0, nowMs - opts.dogVfxAt) : 9999;
      const dBounce = reduceMotion || dAge > 450 ? 0 : (1 - Math.min(1, dAge / 450)) * 24;
      const wag = isLive ? Math.sin(tSec * 9) * 0.14 : 0;
      const dogX = 24, dogY = h - 18 + dBounce + (isLive ? Math.abs(Math.sin(tSec * 5.5)) * -1.8 : 0);
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
      if (!reduceMotion && dAge >= 0 && dAge < 700) {
        const dp = dAge / 700;
        ctx.fillStyle = `rgba(129, 212, 250, ${(1 - dp) * 0.75})`;
        ctx.beginPath(); ctx.arc(dogX + 14 + dp * 10, dogY - 6 - dp * 12, 3.2, 0, Math.PI * 2); ctx.fill();
      }
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
        const cyOrb = h * 0.48 + (isLive ? Math.sin(tSec * 3) * 4 : 0);
        ctx.strokeStyle = "rgba(105, 240, 174, 0.55)";
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.ellipse(w * 0.25, cyOrb, 22, 6, -0.25, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const sx = w * 0.14 + k * 14 + (isLive ? Math.sin(tSec * 4 + k) * 3 : 0);
          const sy = h * 0.42 - (((isLive ? tSec * 16 : 0) + k * 9) % 24);
          ctx.fillStyle = "#69F0AE";
          ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (opts.storyTag === "SHYTOMYR_PHANTOM") {
        ctx.fillStyle = "rgba(0, 229, 255, 0.72)";
        ctx.font = "bold 9px monospace";
        for (let k = 0; k < 4; k++) {
          const mx = 14 + k * 24;
          const my = 26 + (((isLive ? tSec * 20 : 0) + k * 17) % 48);
          ctx.fillText(k % 2 === 0 ? "404" : "01", mx, my);
        }
      } else if (opts.storyTag === "SHYTOMYR_HVIZHS") {
        const hx = w * 0.27, hy = h * 0.54 + (isLive ? Math.sin(tSec * 4.5) * 1.5 : 0);
        ctx.fillStyle = "#4A148C";
        ctx.beginPath(); ctx.ellipse(hx, hy, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFEA00";
        ctx.beginPath(); ctx.arc(hx - 3, hy - 1, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + 3, hy - 1, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FF80AB";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("♥", hx + 12, hy - ((isLive ? tSec * 16 : 6) % 22));
      } else if (opts.storyTag === "SHYTOMYR_M06") {
        const flLen = 10 + (isLive ? Math.sin(tSec * 9) * 3.5 : 0);
        ctx.fillStyle = "#FF6D00";
        ctx.beginPath(); ctx.moveTo(8, h * 0.78); ctx.lineTo(8 - flLen, h * 0.80); ctx.lineTo(8, h * 0.83); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#00E5FF";
        ctx.beginPath(); ctx.moveTo(8, h * 0.79); ctx.lineTo(8 - flLen * 0.6, h * 0.805); ctx.lineTo(8, h * 0.82); ctx.closePath(); ctx.fill();
      } else if (opts.storyTag === "SHYTOMYR_ICECREAM") {
        ctx.fillStyle = "rgba(128, 222, 234, 0.75)";
        for (let k = 0; k < 6; k++) {
          const fx = 10 + k * 17;
          const fy = 22 + (((isLive ? tSec * 18 : 0) + k * 19) % 68);
          ctx.fillRect(fx, fy, 2.5, 2.5);
        }
      } else {
        ctx.fillStyle = "rgba(255, 224, 130, 0.8)";
        for (let k = 0; k < 5; k++) {
          const gx = w * 0.12 + k * 18 + (isLive ? Math.cos(tSec * 2 + k) * 4 : 0);
          const gy = h * 0.48 + (isLive ? Math.sin(tSec * 3 + k) * 6 : 0);
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
          const sway = isLive ? Math.sin(tSec * 2.5) * 1.2 : 0;
          ctx.fillStyle = "#1565C0"; ctx.fillRect(rx - 3 + sway * 0.4, ry - 6, 6, 8);
          ctx.fillStyle = "#FFD54F"; ctx.fillRect(rx - 3 + sway * 0.4, ry - 2, 7, 3);
        } else if (relId === "RELIC_TETERIV_METEOR") {
          const levY = ry - 6 + (isLive ? Math.sin(tSec * 4) * 2.2 : 0);
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
          ctx.beginPath(); ctx.moveTo(rx, ry - 6); ctx.lineTo(rx + (isLive ? Math.sin(tSec * 5) * 2 : 0), ry - 12); ctx.stroke();
        } else if (relId === "RELIC_404_FLOPPY") {
          ctx.fillStyle = "#00E5FF";
          ctx.fillRect(rx - 4, ry - 8, 8, 8);
          ctx.fillStyle = "#101820";
          ctx.fillRect(rx - 2, ry - 7, 4, 3);
        } else if (relId === "RELIC_AMBER_BEETLE") {
          ctx.fillStyle = "rgba(255, 179, 0, 0.45)";
          ctx.beginPath(); ctx.arc(rx, ry - 4, 6 + (isLive ? Math.sin(tSec * 3.5) : 0), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FFB300";
          ctx.beginPath(); ctx.arc(rx, ry - 4, 3.5, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.restore();
    }
  }
