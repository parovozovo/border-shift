  function maskPlateInVehicleDesc(descStr) {
    if (!descStr) return descStr;
    return String(descStr).replace(/\([А-ЯІЇЄҐA-Z]{1,3}[\s-]\d{3,4}(?:[\s-][А-ЯІЇЄҐA-Z]{2})?\)\s*$/u, "(❄️❄️❄️ ❄️❄️❄️)");
  }

  function syncStampSlamHost() {
    const host = document.getElementById("stamp-slam-host");
    if (!host) return;
    if (state.phase !== "BOOTH_SHIFT" && state.phase !== "SHIFT_SUMMARY") {
      host.innerHTML = "";
      return;
    }
    if (!state.stampSlam || state.stampSlam.seq === state.stampSlamRenderedSeq) return;
    const ageMs = Date.now() - (state.stampSlam.at || 0);
    const slamSeq = state.stampSlam.seq;
    state.stampSlamRenderedSeq = slamSeq;
    if (ageMs > 1200) return;
    host.innerHTML = `<div id="stamp-slam-overlay" class="stamp-slam-overlay"><div class="stamp-slam-badge stamp-${state.stampSlam.kind}">${tr(state.stampSlam.label, state.lang)}</div></div>`;
    setTimeout(() => {
      if (state.stampSlam && state.stampSlam.seq === slamSeq && host) {
        host.innerHTML = "";
      }
    }, 680);
  }

  function syncFxFloatHost() {
    const host = document.getElementById("fx-float-host");
    if (!host) return;
    const reduced = isMotionReduced();
    if (reduced || (state.phase !== "BOOTH_SHIFT" && state.phase !== "SHIFT_SUMMARY" && state.phase !== "HOME_EVENING")) {
      host.innerHTML = "";
      return;
    }
    if (!state.fxBursts || state.fxBursts.seq === state.fxBurstRenderedSeq) return;
    const seq = state.fxBursts.seq;
    state.fxBurstRenderedSeq = seq;
    if (Date.now() - (state.fxBursts.at || 0) > 1500) return;
    const chipsHtml = (state.fxBursts.items || []).map((it, idx) => {
      const label = typeof it.text === "string" ? it.text : tr(it.text, state.lang);
      return `<div class="fx-float-chip fx-${it.tone || "gold"}" style="--fx-i:${idx};">${label}</div>`;
    }).join("");
    host.innerHTML = `<div class="fx-float-stack">${chipsHtml}</div>`;
    setTimeout(() => {
      if (state.fxBursts && state.fxBursts.seq === seq && host) {
        host.innerHTML = "";
      }
    }, 1050);
  }

  function render() {
    stopMenuAnimation();
    updateMood();
    syncStampSlamHost();
    syncFxFloatHost();
    if (document.body && document.body.classList) {
      document.body.classList.toggle("reduce-motion", isMotionReduced());
    }
    document.documentElement.lang = state.lang === "EN" ? "en" : "uk";
    const root = document.getElementById("app-shell");
    if (!root) return;
    root.innerHTML = "";

    if (state.phase === "AGE_GATE") {
      state.phase = "MAIN_MENU";
    }

    if (state.phase === "MAIN_MENU") {
      const canResume = hasSavedGame();
      const unlockedCount = loadUnlockedArchetypes().length;
      const shytCount = loadUnlockedShytomyr().length;
      const badges = loadAgencyBadges();
      const discoveries = loadDiscoveries();
      const totalServDisc = AGENCY_BADGE_DEFS.length + GAME_DISCOVERY_DEFS.length;
      const openServDisc = badges.length + discoveries.length;
      const stats = loadCareerStats();
      const onboardingNew = !hasSeenOnboarding();
      const shieldSvg = `<svg width="36" height="36" viewBox="0 0 64 64" style="flex-shrink:0;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));"><path d="M32 4L56 14v18c0 14-10 24-24 28C18 56 8 46 8 32V14L32 4z" fill="#1B3B2B" stroke="#E0B145" stroke-width="3"/><rect x="14" y="28" width="36" height="7" rx="2" fill="#C62828"/><rect x="22" y="28" width="8" height="7" fill="#ECEFF1"/><rect x="38" y="28" width="8" height="7" fill="#ECEFF1"/><polygon points="32,11 35,19 43,19 36,23 38,31 32,26 26,31 28,23 21,19 29,19" fill="#E0B145"/></svg>`;

      root.innerHTML = `
        <div class="game-menu-wrap">
          <div style="display:flex;flex-direction:column;gap:9px;">
            <div class="game-menu-hero">
              <canvas id="menu-canvas" width="436" height="204"></canvas>
              <div class="game-menu-hero-overlay">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:10px;font-weight:800;color:#E0B145;background:rgba(0,0,0,0.62);padding:3px 8px;border-radius:4px;border:1px solid rgba(224,177,69,0.4);">
                    🟢 ${tr(L("КПП «ЗАХІД-04» • ДПСК KRAINA", "GATE 04 • SBGS KRAINA"), state.lang)}
                  </span>
                  <div style="display:flex;gap:5px;">
                    <button type="button" id="menu-lang" class="ctrl-pill">${state.lang === "UK" ? "🇺🇦 UA" : "🇬🇧 EN"}</button>
                    <button type="button" id="menu-motion" class="ctrl-pill" title="${tr(L("Увімкнути або призупинити анімації", "Toggle animations & FX"), state.lang)}">${isMotionReduced() ? "⏸ FX" : "✨ FX"}</button>
                    <button type="button" id="menu-music" class="ctrl-pill" aria-label="Toggle music">${audio.musicEnabled ? "🔊" : "🔇"}</button>
                  </div>
                </div>
                <div>
                  <div class="game-menu-brand">
                    ${shieldSvg}
                    <div>
                      <div class="game-menu-title">BORDER SHIFT: KRAINA</div>
                      <div class="game-menu-sub">${tr(L("Симулятор прикордонного контролю, спецслужб та вибору", "Border control, agencies, smuggling & choices"), state.lang)}</div>
                    </div>
                  </div>
                  <div class="menu-faction-strip">
                    <span class="menu-faction-pill">🛂 ${tr(L("ДПСК", "SBGS"), state.lang)}</span>
                    <span class="menu-faction-pill">🕵️ ${tr(L("СБК", "SBK"), state.lang)}</span>
                    <span class="menu-faction-pill">🦅 ${tr(L("ГУР-М", "GUR-M"), state.lang)}</span>
                    <span class="menu-faction-pill">🎖️ ${tr(L("ВСП", "VSP"), state.lang)}</span>
                    <span class="menu-faction-pill">⚖️ ${tr(L("НАБК", "NABK"), state.lang)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="menu-dossier-strip">
              <div class="menu-dossier-cell">
                <span class="menu-dossier-val">${stats.totalProcessed}</span>
                <span class="menu-dossier-lbl">${tr(L("Оформлено авто", "Travelers Checked"), state.lang)}</span>
              </div>
              <div class="menu-dossier-cell">
                <span class="menu-dossier-val">${unlockedCount}/16</span>
                <span class="menu-dossier-lbl">${tr(L("Титули Долі", "Fate Titles"), state.lang)}</span>
              </div>
              <div class="menu-dossier-cell">
                <span class="menu-dossier-val">${openServDisc + shytCount}/${totalServDisc + SHYTOMYR_LEGENDS.length}</span>
                <span class="menu-dossier-lbl">${tr(L("Служби і Легенди", "Agencies & Legends"), state.lang)}</span>
              </div>
            </div>

            <div class="game-menu-actions">
              <button type="button" id="btn-open-onboarding" class="game-btn game-btn-onboard">
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:13.5px;font-weight:900;color:#FFE082;">📖 ${tr(L("ПЕРЕДІСТОРІЯ, СЛУЖБИ ТА ІНСТРУКТАЖ", "BACKSTORY & AGENCIES GUIDE"), state.lang)}</span>
                    ${onboardingNew ? `<span class="menu-badge-new">${tr(L("ВАЖЛИВО", "NEW"), state.lang)}</span>` : ""}
                  </div>
                  <div style="font-size:10.5px;color:#CFD8DC;margin-top:2px;">${tr(L("Хто такі ДПСК, СБК, ГУР-М, ВСП, НАБК, Толік та як перевіряти авто", "Who are SBGS, SBK, GUR-M, VSP, NABK, Tolik & how to inspect"), state.lang)}</div>
                </div>
                <span style="font-size:16px;color:#FFE082;">📘</span>
              </button>

              ${canResume ? `
                <button type="button" id="btn-resume" class="game-btn game-btn-gold">
                  <div>
                    <div style="font-size:14px;font-weight:900;">⏯ ${tr(L("ПРОДОВЖИТИ ЗМІНУ", "RESUME SHIFT"), state.lang)}</div>
                    <div style="font-size:11px;opacity:0.84;">${tr(L("Повернутися до збереженого дня та бюджету", "Return to your saved shift & funds"), state.lang)}</div>
                  </div>
                  <span style="font-size:18px;">→</span>
                </button>
              ` : ""}

              <div class="menu-modes-grid">
                <button type="button" id="btn-start-camp" class="game-btn game-btn-primary">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <span style="font-size:18px;">🛂</span>
                    <span style="font-size:10px;font-weight:800;color:#A5D6A7;background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;">${tr(L("СЮЖЕТ", "7 DAYS"), state.lang)}</span>
                  </div>
                  <div>
                    <div style="font-size:13.5px;font-weight:900;">${tr(L("КАМПАНІЯ", "STORY CAMPAIGN"), state.lang)}</div>
                    <div style="font-size:10.5px;opacity:0.84;margin-top:2px;">${tr(L("7 днів + кар'єра, вербування та фінал", "Story events, ranks & finale"), state.lang)}</div>
                  </div>
                </button>
                <button type="button" id="btn-start-sand" class="game-btn game-btn-sandbox">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <span style="font-size:18px;">♾️</span>
                    <span style="font-size:10px;font-weight:800;color:#90CAF9;background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;">${tr(L("НЕСКІНЧЕННО", "FREEPLAY"), state.lang)}</span>
                  </div>
                  <div>
                    <div style="font-size:13.5px;font-weight:900;">${tr(L("ВІЛЬНА ГРА", "ENDLESS SANDBOX"), state.lang)}</div>
                    <div style="font-size:10.5px;opacity:0.84;margin-top:2px;">${tr(L("Випадкові укази, ранги, 25 000 💵 втеча", "Random decrees, ranks & escape"), state.lang)}</div>
                  </div>
                </button>
              </div>

              <button type="button" id="btn-open-archive" class="game-btn" style="padding:10px 13px;">
                <div>
                  <div style="font-size:13px;font-weight:800;">🗄️ ${tr(L("АРХІВ ДПСК ТА КОЛЕКЦІЯ", "ARCHIVE & COLLECTION"), state.lang)}</div>
                  <div style="font-size:10.5px;opacity:0.78;">${tr(L(`Титули: ${unlockedCount}/16 • Шитомир: ${shytCount}/${SHYTOMYR_LEGENDS.length} • Відзнаки: ${openServDisc}/${totalServDisc}`, `Titles: ${unlockedCount}/16 • Shytomyr: ${shytCount}/${SHYTOMYR_LEGENDS.length} • Medals: ${openServDisc}/${totalServDisc}`), state.lang)}</div>
                </div>
                <span style="font-size:15px;">📂</span>
              </button>

              ${(() => {
                const cps = loadCampaignCheckpoints();
                const days = [1, 2, 3, 4, 5, 6, 7].filter(d => cps["day_" + d]);
                if (days.length === 0) return "";
                return `<div style="background:rgba(255,255,255,0.04);border:1px solid #354039;border-radius:8px;padding:7px 9px;">
                  <div style="font-size:10.5px;font-weight:800;color:#E0B145;margin-bottom:5px;">⏪ ${tr(L("Швидкий старт із дня кампанії:", "Replay Campaign Day:"), state.lang)}</div>
                  <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    ${days.map(d => `<button type="button" class="btn-outline camp-cp-btn" data-cp-day="${d}" style="padding:3px 8px;font-size:11px;">${tr(L(`День ${d}`, `Day ${d}`), state.lang)}</button>`).join("")}
                  </div>
                </div>`;
              })()}
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;font-family:monospace;font-size:10.5px;color:#90A4AE;border-top:1px solid #2A332D;padding-top:8px;gap:6px;flex-wrap:wrap;">
            <span>Border Shift • <strong>${BUILD_VERSION}</strong></span>
            <div style="display:flex;gap:6px;">
              <button type="button" id="btn-reset-progress" class="btn-outline" style="padding:3px 8px;font-size:10px;color:${confirmResetArmed ? "#FF5252" : "#B0BEC5"};border-color:${confirmResetArmed ? "#FF5252" : "#455A64"};">${confirmResetArmed ? tr(L("⚠️ Точно скинути?", "⚠️ Confirm Wipe?"), state.lang) : tr(L("🗑️ Скинути", "🗑️ Reset"), state.lang)}</button>
              <button type="button" id="btn-force-refresh" class="btn-outline" style="padding:3px 8px;font-size:10px;">🔄 ${tr(L("Оновити", "Refresh"), state.lang)}</button>
            </div>
          </div>
        </div>
      `;

      startMenuPanoramaLoop();
      document.getElementById("menu-lang").addEventListener("click", () => { state.lang = state.lang === "UK" ? "EN" : "UK"; render(); });
      document.getElementById("menu-motion").addEventListener("click", () => { audio.playTap(); setMotionReduced(!isMotionReduced()); render(); });
      document.getElementById("menu-music").addEventListener("click", () => { audio.ensureCtx(); audio.musicEnabled = !audio.musicEnabled; render(); });
      if (canResume) document.getElementById("btn-resume").addEventListener("click", () => { audio.playApprove(); loadSavedGame(); });
      document.getElementById("btn-start-camp").addEventListener("click", () => { audio.playApprove(); requestGameStart(false); });
      document.getElementById("btn-start-sand").addEventListener("click", () => { audio.playApprove(); requestGameStart(true); });
      document.getElementById("btn-open-onboarding").addEventListener("click", () => {
        audio.playTap();
        markOnboardingSeen();
        state.pendingStartMode = null;
        state.onboardingTab = 0;
        state.phase = "ONBOARDING";
        render();
      });
      document.getElementById("btn-open-archive").addEventListener("click", () => { audio.playTap(); state.phase = "ARCHIVE"; render(); });
      document.getElementById("btn-reset-progress").addEventListener("click", () => {
        audio.playTap();
        if (!confirmResetArmed) {
          confirmResetArmed = true;
          render();
          return;
        }
        confirmResetArmed = false;
        try {
          localStorage.removeItem(SAVE_KEY);
          localStorage.removeItem(EPILOGUE_SAVE_KEY);
          localStorage.removeItem(SHYTOMYR_SAVE_KEY);
          localStorage.removeItem(STATS_SAVE_KEY);
          localStorage.removeItem(CAMPAIGN_CHECKPOINTS_KEY);
          localStorage.removeItem(AGENCY_BADGES_KEY);
          localStorage.removeItem(GAME_DISCOVERIES_KEY);
          localStorage.removeItem(ONBOARDING_SEEN_KEY);
        } catch (_) {}
        render();
      });
      document.getElementById("btn-force-refresh").addEventListener("click", () => {
        window.location.href = window.location.pathname + "?v=" + Date.now();
      });
      document.querySelectorAll(".camp-cp-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          audio.playApprove();
          restoreCampaignCheckpoint(Number(btn.getAttribute("data-cp-day")));
        });
      });
      return;
    }

    if (state.phase === "ONBOARDING") {
      const tab = state.onboardingTab || 0;
      const renderOnboardCard = (borderColor, iconHtml, titleObj, roleObj, bodyObj) => `
        <div class="onboard-agency-card" style="border-left-color:${borderColor};">
          <div class="onboard-agency-icon">${iconHtml}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:900;color:#FFE082;">${tr(titleObj, state.lang)}</div>
            <div style="font-size:10.5px;font-weight:700;color:#81C784;margin-top:1px;">${tr(roleObj, state.lang)}</div>
            <p style="font-size:11.5px;line-height:1.42;color:#CFD8DC;margin-top:4px;white-space:pre-line;">${tr(bodyObj, state.lang)}</p>
          </div>
        </div>
      `;

      let tabBody = "";
      if (tab === 0) {
        tabBody = [
          renderOnboardCard(
            "#E0B145", "🛂",
            L("Передісторія: КПП «Захід-04»", "Backstory: Checkpoint 'Zakhid-04'"),
            L("Країна Kraina • Воєнний стан • Твоя перша зміна", "State of Kraina • Martial Law • Your First Shift"),
            L("Попереднього інспектора забрали вночі оперативники НАБК після скандалу з фальшивими довідками. На ранок тебе терміново перевели на віддалений карпатський пункт «Захід-04».\n\nВдома чекає сім'я з купою рахунків, на КПП тиснуть контрабандисти й мажори, а на старті маєш лише 6 000 🪙.", "The previous inspector was arrested overnight by NABK over fake exit permits. You've been reassigned to remote mountain gate 'Zakhid-04'.\n\nAt home your family waits with rising bills; at the gate smugglers & VIPs push through — and you start with just 6,000 🪙.")
          ),
          renderOnboardCard(
            "#4CAF50", "🛤️",
            L("Три шляхи інспектора", "Three Inspector Paths"),
            L("Обирай свій стиль служби на кожному кроці", "Shape your career with every stamp"),
            L("1️⃣ Чесна служба: тримай устав ДПСК, допомагай розвідці ГУР/СБК та отримай офіційну подяку.\n2️⃣ Подвійний агент «Кордон-7»: завоюй довіру контррозвідки й піднімись до полковника під прикриттям.\n3️⃣ Великий куш та втеча: збирай баксіки 💵, відмивай гримники 🪙 та виїжджай за кордон через Толіка (15 000 💵 у Кампанії / 25 000 💵 у Вільній грі).", "1️⃣ Honest Service: follow SBGS directives, aid GUR/SBK, earn Kyiv commendations.\n2️⃣ Covert Agent 'Border-7': earn SBK trust and rise to undercover Colonel.\n3️⃣ Big Score & Escape: collect baksiky 💵 bribes, launder cash 🪙 and flee abroad via Tolik (15,000 💵 Story / 25,000 💵 Freeplay).")
          )
        ].join("");
      } else if (tab === 1) {
        tabBody = [
          renderOnboardCard(
            "#4CAF50", "🛂",
            L("ДПСК — Прикордонна служба", "SBGS — State Border Guard"),
            L("Офіційний статус • Зарплата 🪙 • Догани", "Official Status • Salary 🪙 • Reprimands"),
            L("Твоє основне відомство. Платить ставку за кожне оформлене авто й видає ранкові директиви.\n• Дотримання правил: +зарплата і ранг.\n• Помилка на шлагбаумі: штраф 🪙 та ризик догани (3 догани = звільнення!).", "Your primary command. Pays per traveler and sets daily directives.\n• Follow directives: +salary & rank perks.\n• Mistakes: 🪙 fines and reprimands (3 reprimands = fired!).")
          ),
          renderOnboardCard(
            "#42A5F5", "🕵️",
            L("СБК — Служба безпеки та контррозвідка", "SBK — Counter-Intelligence"),
            L("🎯 Розшук • 🚨 Арешти • Агент «Кордон-7»", "🎯 Wanted Dossiers • 🚨 Arrests • Agent 'Border-7'"),
            L("Контррозвідка на кордоні. Перед зміною видає 🎯 Довідник Розшуку з частковими зачіпками (фото, авто або прізвище) і наводки по рації.\n• Затримання злочинців: солідні премії (🪙 та 💵), репутація СБК і шанс завербуватись негласним агентом «Кордон-7».\n• Низька репутація СБК: підкуп дорожчає, зате при високій СБК прикриє в операціях.", "Fights spies & smugglers. Provides partial 🎯 Wanted Dossiers & radio alerts.\n• Arresting criminals pays 🪙 & 💵 bounties, boosts SBK trust, and unlocks the covert Agent 'Border-7' branch.")
          ),
          renderOnboardCard(
            "#FFA726", "🦅",
            L("ГУР-М — Воєнна розвідка", "GUR-M — Military Intelligence"),
            L("Спецконвої • Дрони на фронт • Відзнака «Сокіл»", "Secret Convoys • Drone Cargo • 'Falcon' Medal"),
            L("Проводить секретні вантажі через кордон («у темну» або з паролем). Перевозить FPV-дрони й РЕБ.\n• Допомога ГУР: відкриває відзнаку «Сокіл» (-2с часу огляду пса назавжди) та премії.", "Moves classified war supplies across the gate.\n• Helping GUR-M earns rewards and the 'Falcon' Medal (-2s faster dog inspection permanently).")
          ),
          renderOnboardCard(
            "#AB47BC", "🎖️",
            L("ВСП та Реєстр «Облік+»", "VSP & 'Oblik+' Registry"),
            L("Військовий правопорядок • Виїзд чоловіків • QR-код", "Military Law • Male Exit Rules • QR Scans"),
            L("Контролює законність виїзду військовозобов'язаних чоловіків та волонтерів.\n• Звіряй QR у «Облік+» кнопкою сканування, перевіряй довідки «Шлях» та документи супроводу.\n• Затримання ухилянтів з подвійним паспортом: подяка ВСП і +600 🪙 бонусу.", "Enforces martial law exit rules.\n• Scan QR in 'Oblik+' manually and check exemption permits.\n• Catching dual-citizen evaders unlocks the VSP Guard bonus (+600 🪙 per evader).")
          ),
          renderOnboardCard(
            "#EF5350", "⚖️",
            L("НАБК — Антикорупційне бюро", "NABK — Anti-Corruption Bureau"),
            L("Ризик викриття 0–100% • Підсадні агенти • Арешт", "Exposure Risk 0–100% • Sting Agents • Prison"),
            L("Полює на хабарників! Кожен взятий конверт або «ліві» баксіки піднімають шкалу НАБК%.\n• Підсадні агенти пропонують хабар із мікрокамерою та міченими купюрами (перевіряй 🔦 УФ-лампою і 🐕 псом!).\n• НАБК = 100%: негайний рейд і тюрма (Кінець гри).", "Hunts corrupt officers! Bribes raise NABK% risk.\n• Undercover stings carry lapel mics and marked UV bills — inspect with 🔦 UV & 🐕 dog!\n• Reach 100% NABK = instant raid & prison.")
          )
        ].join("");
      } else if (tab === 2) {
        tabBody = [
          renderOnboardCard(
            "#C9972C", `<canvas id="onboard-palych-c" width="52" height="52"></canvas>`,
            L("🧢 Пал Палич — Начальник поста", "🧢 Pal Palych — Shift Chief"),
            L("Вечірня частка ($) • Догани • Прикриття", "Nightly Cut ($) • Reprimands • Cover-Ups"),
            L("Хитрий начальник зміни. Щовечора приходить по «частку на генератор» (у 💵).\n• Платиш частку: росте довіра, знімає догани та закриває очі на дрібні проколи.\n• Відмовляєшся: економиш баксіки, але ризикуєш звільненням при помилках.", "Cunning station commander who demands an evening cut in 💵.\n• Paying builds loyalty and clears reprimands; refusing saves baksiky but risks firing.")
          ),
          renderOnboardCard(
            "#81C784", `<canvas id="onboard-tolik-c" width="52" height="52"></canvas>`,
            L("🚐 Толік «Бусик» — Тіньовий синдикат", "🚐 Tolik 'Busyk' — Smuggling Syndicate"),
            L("Курс валют • Відмивання • Нічна втеча за кордон", "Money Exchange • Laundering • Midnight Escape"),
            L("Тримає канали контрабанди та чорний обмінник.\n• Пропускай його «своїх» бусів — заробляй повагу Толіка і солідні конверти в 💵.\n• Увечері обмінює гримники 🪙 на 💵 та при високій довірі вивезе тебе за кордон.", "Runs smuggling convoys and shadow exchange.\n• Clearing his vans builds Tolik rep & baksiky income; high rep unlocks the escape corridor abroad.")
          ),
          renderOnboardCard(
            "#FF5252", `<canvas id="onboard-fsm-c" width="52" height="52"></canvas>`,
            L("🕷️ Агентура ФСМ (Диверсанти ворога)", "🕷️ FSM Operatives (Enemy Saboteurs)"),
            L("Шпигуни • Підроблені печатки • Вибухівка", "Spies • Forged Seals • Explosives"),
            L("Ворожа розвідка. Маскуються під волонтерів, священиків чи дипломатів із підробленим фото, штампом або схроном у авто.\n• Тільки 🚨 СБК / АРЕШТ! Якщо пропустиш диверсанта — отримаєш тяжкий штраф і удар по СБК.", "Enemy saboteurs disguised as travelers with forged docs, wrong photos or hidden weapons.\n• Always 🚨 SBK / ARREST! Letting them pass causes severe fines & SBK penalty.")
          ),
          renderOnboardCard(
            "#B39DDB", "🧦",
            L("Шитомирське братство", "The Shytomyr Brotherhood"),
            L("12 легенд • Реліквії в будку • Унікальні анімації", "12 Legends • Booth Relics • Live Effects"),
            L("Загадкові мандрівники з міста Шитомир (від директора Трикотажної Ложі до пілота М-06 і ловця Хвіжса).\n• Пропускай їх на КПП, щоб отримувати реліквії в будку (Кевларові термошкарпетки, Метеорит із Тетерівки, Золотий дерун, Дискета 404 тощо), унікальні анімації та бафи!", "Mysterious visitors from mythical Shytomyr! Approve them at the gate to collect animated booth relics (Kevlar Socks, Meteorite, Golden Derun, 404 Floppy) and lasting buffs!")
          )
        ].join("");
      } else {
        tabBody = [
          renderOnboardCard(
            "#E0B145", "💵",
            L("Дві валюти: 🪙 (Гримники) vs 💵 (Баксіки)", "Two Currencies: 🪙 (Hrymnyky) vs 💵 (Baksiky)"),
            L("Зарплата + Білий бізнес  |  Хабарі + Офшори", "Salary + Legal Biz  |  Bribes + Escape"),
            L("• 🪙 Гримники йдуть на побут сім'ї, інструменти будки, авто та «білі» кіоски/СТО (0% ризику НАБК).\n• 💵 Баксіки дають хабарі, премії спецслужб та валютний обмін — потрібні для частки Палича, елітних активів та фонду втечі.", "• 🪙 pays for family bills, booth gear, cars & clean businesses (0% NABK risk).\n• 💵 comes from envelopes, agency bounties & exchange — needed for Palych, luxury assets & the Escape Fund.")
          ),
          renderOnboardCard(
            "#4FC3F7", "🔍",
            L("Як проводити перевірку в будці", "How to Inspect at the Gate"),
            L("🔦 УФ-лампа • 📢 Нагримати • 🐕 Пес «Бавовна»", "🔦 UV Lamp • 📢 Knock • 🐕 Sniffer Dog"),
            L("1. Натисни на паспорт/довідку на столі — уважно звір ПІБ, вік, фото, термін і печатку.\n2. Клікни на вікно авто (або тег машини) — звір модель/колір/номер із техпаспортом.\n3. УВІМКНИ 🔦 УФ-лампу: вона підсвічує правлені поля прямо на бланку, секретні УФ-шифри з премією та сліди контрабанди на митній декларації (значно дешевший обшук псом).\n4. Тиск 📢 «Нагримати»: винний водій нервує, видає зачіпку в журналі й докладає +30% у конверт (або дістає заначку) — але обережно з чесними, бо скаржаться Паличу (-3) і скасовують чайові!", "1. Open documents on the desk to check name, age, photo, expiry and seal.\n2. Click the booth car or vehicle tag to match model/color/plates.\n3. Toggle 🔦 UV Lamp: highlights tampered document fields, secret bonus UV stamps & customs compartment prints (halves dog search cost).\n4. Use 📢 'Knock' carefully: guilty drivers panic, reveal clues & raise bribes by +30%, while clean drivers cancel coffee tips and complain to Palych (-3).")
          ),
          renderOnboardCard(
            "#81C784", "🎯",
            L("Три штампи рішення та часткові орієнтування", "Three Decision Stamps & Partial Alerts"),
            L("✔ ПРОПУСТИТИ  •  ✖ ВІДМОВИТИ  •  🚨 АРЕШТ", "✔ APPROVE  •  ✖ DENY  •  🚨 ARREST"),
            L("• 🎯 Розшук та Рація тепер дають лише часткову зачіпку (або фото, або авто, або прізвище) — перевіряй уважно!\n• ✔ ПРОПУСТИТИ — документи чисті (або взято конверт).\n• ✖ ВІДМОВИТИ — відсутня довідка, прострочений паспорт чи розбіжність у реєстрі.\n• 🚨 СБК / АРЕШТ — контрабанда, зброя, підроблене фото/печатка, агент НАБК/ФСМ або пропозиція хабаря.", "• 🎯 Wanted & Radio now give only ONE partial clue — verify carefully!\n• ✔ APPROVE — valid docs (or pocketed bribe).\n• ✖ DENY — missing permit, expired ID or registry mismatch.\n• 🚨 ARREST — contraband, fake seal/photo, spy or bribe attempt.")
          )
        ].join("");
      }

      root.innerHTML = `
        <div class="row-between">
          <button type="button" id="onboard-back" class="ctrl-pill">← ${tr(L("В меню", "Menu"), state.lang)}</button>
          <span style="color:#E0B145;font-family:monospace;font-weight:800;font-size:12.5px;">📖 ${tr(L(`ДОСЬЄ ІНСПЕКТОРА • ${tab + 1}/4`, `INSPECTOR DOSSIER • ${tab + 1}/4`), state.lang)}</span>
        </div>

        <div style="border-radius:8px;overflow:hidden;border:1px solid #354039;background:#101714;">
          <canvas id="onboarding-canvas" width="420" height="88" style="width:100%;height:auto;display:block;"></canvas>
        </div>

        <div class="onboard-tabs">
          <button type="button" id="onboard-tab-0" class="${tab === 0 ? "btn-mustard" : "btn-secondary"}" style="padding:7px 4px;font-size:11px;">📜 ${tr(L("Історія", "Story"), state.lang)}</button>
          <button type="button" id="onboard-tab-1" class="${tab === 1 ? "btn-mustard" : "btn-secondary"}" style="padding:7px 4px;font-size:11px;">🛡️ ${tr(L("Служби", "Agencies"), state.lang)}</button>
          <button type="button" id="onboard-tab-2" class="${tab === 2 ? "btn-mustard" : "btn-secondary"}" style="padding:7px 4px;font-size:11px;">🕶️ ${tr(L("Тінь", "Shadow"), state.lang)}</button>
          <button type="button" id="onboard-tab-3" class="${tab === 3 ? "btn-mustard" : "btn-secondary"}" style="padding:7px 4px;font-size:11px;">⚙️ ${tr(L("Будка", "Booth"), state.lang)}</button>
        </div>

        <div id="onboarding-content" class="onboard-scroll">${tabBody}</div>

        <div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;">
          <div style="display:flex;gap:6px;">
            ${tab > 0 ? `<button type="button" id="onboard-prev" class="btn-secondary" style="flex:1;padding:9px;">← ${tr(L("Назад", "Prev"), state.lang)}</button>` : ""}
            ${tab < 3 ? `<button type="button" id="onboard-next" class="btn-mustard" style="flex:1;padding:9px;">${tr(L("Далі →", "Next →"), state.lang)}</button>` : ""}
          </div>
          ${state.pendingStartMode ? `
            <button type="button" id="onboard-start-btn" class="btn-primary-green" style="padding:11px;">
              ${state.pendingStartMode === "SANDBOX" ? tr(L("♾️ ЗАСТУПИТИ У ВІЛЬНУ ГРУ →", "♾️ START ENDLESS SANDBOX →"), state.lang) : tr(L("🛂 ЗАСТУПИТИ НА ЗМІНУ КАМПАНІЇ →", "🛂 START CAMPAIGN SHIFT →"), state.lang)}
            </button>
          ` : (tab === 3 ? `
            <div style="display:flex;gap:6px;">
              <button type="button" id="onboard-start-camp" class="btn-primary-green" style="flex:1;padding:10px;font-size:12.5px;">🛂 ${tr(L("Почати Кампанію", "Start Campaign"), state.lang)}</button>
              <button type="button" id="onboard-start-sand" class="btn-primary-blue" style="flex:1;padding:10px;font-size:12.5px;">♾️ ${tr(L("Почати Вільну гру", "Start Freeplay"), state.lang)}</button>
            </div>
          ` : "")}
        </div>
      `;

      const obCanvas = document.getElementById("onboarding-canvas");
      if (window._phaseBannerRaf) { cancelAnimationFrame(window._phaseBannerRaf); window._phaseBannerRaf = null; }
      if (obCanvas) {
        let lastOb = 0;
        const tickOb = (ts) => {
          if (state.phase !== "ONBOARDING" || document.getElementById("onboarding-canvas") !== obCanvas) {
            window._phaseBannerRaf = null; return;
          }
          if (!lastOb || ts - lastOb >= 36) { lastOb = ts; drawOnboardingBanner(obCanvas, tab, (ts || Date.now()) * 0.001); }
          window._phaseBannerRaf = requestAnimationFrame(tickOb);
        };
        const reducedOb = isMotionReduced();
        drawOnboardingBanner(obCanvas, tab, reducedOb ? 0 : Date.now() * 0.001);
        if (!reducedOb && typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickOb);
      }

      if (tab === 2) {
        const palCanvas = document.getElementById("onboard-palych-c");
        if (palCanvas) drawPortrait(palCanvas.getContext("2d"), { gender: "M", skinTone: 2, faceShape: 2, hairStyle: 3, hairColor: 1, facialHair: 2, glasses: 1, headwear: 4, scarOrDetail: 0, expression: 1 }, 26, 51, 0.38);
        const tolCanvas = document.getElementById("onboard-tolik-c");
        if (tolCanvas) drawPortrait(tolCanvas.getContext("2d"), { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 2, glasses: 2, headwear: 1, scarOrDetail: 3, expression: 1, specialId: "TOLIK_SMUGGLER" }, 26, 51, 0.38);
        const fsmCanvas = document.getElementById("onboard-fsm-c");
        if (fsmCanvas) drawPortrait(fsmCanvas.getContext("2d"), { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 2, headwear: 5, scarOrDetail: 2, expression: 2 }, 26, 51, 0.38);
      }

      document.getElementById("onboard-back").addEventListener("click", () => { audio.playTap(); state.pendingStartMode = null; state.phase = "MAIN_MENU"; render(); });
      for (let ti = 0; ti < 4; ti++) {
        const tb = document.getElementById(`onboard-tab-${ti}`);
        if (tb) tb.addEventListener("click", () => { audio.playTap(); state.onboardingTab = ti; render(); });
      }
      const prevBtn = document.getElementById("onboard-prev");
      if (prevBtn) prevBtn.addEventListener("click", () => { audio.playTap(); state.onboardingTab = Math.max(0, tab - 1); render(); });
      const nextBtn = document.getElementById("onboard-next");
      if (nextBtn) nextBtn.addEventListener("click", () => { audio.playTap(); state.onboardingTab = Math.min(3, tab + 1); render(); });
      const startBtn = document.getElementById("onboard-start-btn");
      if (startBtn) startBtn.addEventListener("click", () => {
        audio.playApprove();
        const isSand = state.pendingStartMode === "SANDBOX";
        state.pendingStartMode = null;
        startNewGame(isSand);
      });
      const startCampBtn = document.getElementById("onboard-start-camp");
      if (startCampBtn) startCampBtn.addEventListener("click", () => { audio.playApprove(); markOnboardingSeen(); startNewGame(false); });
      const startSandBtn = document.getElementById("onboard-start-sand");
      if (startSandBtn) startSandBtn.addEventListener("click", () => { audio.playApprove(); markOnboardingSeen(); startNewGame(true); });
      return;
    }

    if (state.phase === "ARCHIVE") {
      const unlockedArch = loadUnlockedArchetypes();
      const unlockedShyt = loadUnlockedShytomyr();
      const badges = loadAgencyBadges();
      const discoveries = loadDiscoveries();
      const totalServDisc = AGENCY_BADGE_DEFS.length + GAME_DISCOVERY_DEFS.length;
      const openServDisc = badges.length + discoveries.length;
      const stats = loadCareerStats();

      root.innerHTML = `
        <div class="row-between">
          <button type="button" id="arch-back" class="ctrl-pill">← ${tr(L("Назад", "Back"), state.lang)}</button>
          <span style="color:#E0B145;font-family:monospace;font-weight:800;font-size:13px;">${tr(L("🗄️ АРХІВ ДПСК • КОЛЕКЦІЯ", "🗄️ SBGS ARCHIVE • COLLECTION"), state.lang)}</span>
        </div>

        <div class="archive-tabs">
          <button type="button" id="arch-tab-0" class="${state.archiveTab === 0 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11px;">🏆 ${tr(L(`Титули (${unlockedArch.length}/16)`, `Titles (${unlockedArch.length}/16)`), state.lang)}</button>
          <button type="button" id="arch-tab-1" class="${state.archiveTab === 1 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11px;">🧦 ${tr(L(`Шитомир (${unlockedShyt.length}/12)`, `Shytomyr (${unlockedShyt.length}/12)`), state.lang)}</button>
          <button type="button" id="arch-tab-3" class="${state.archiveTab === 3 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11px;">🛡️ ${tr(L(`Служби (${openServDisc}/${totalServDisc})`, `Agencies (${openServDisc}/${totalServDisc})`), state.lang)}</button>
          <button type="button" id="arch-tab-2" class="${state.archiveTab === 2 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11px;">📊 ${tr(L("Статистика", "Stats"), state.lang)}</button>
        </div>

        <div id="archive-content" class="archive-list"></div>
      `;

      document.getElementById("arch-back").addEventListener("click", () => { audio.playTap(); state.phase = "MAIN_MENU"; render(); });
      document.getElementById("arch-tab-0").addEventListener("click", () => { audio.playTap(); state.archiveTab = 0; render(); });
      document.getElementById("arch-tab-1").addEventListener("click", () => { audio.playTap(); state.archiveTab = 1; render(); });
      document.getElementById("arch-tab-2").addEventListener("click", () => { audio.playTap(); state.archiveTab = 2; render(); });
      document.getElementById("arch-tab-3").addEventListener("click", () => { audio.playTap(); state.archiveTab = 3; render(); });

      const wrap = document.getElementById("archive-content");
      if (state.archiveTab === 0) {
        Object.keys(ARCHETYPE_CATALOG).forEach(key => {
          const item = ARCHETYPE_CATALOG[key];
          const isOpen = unlockedArch.includes(key);
          const card = document.createElement("div");
          card.className = "archive-card" + (isOpen ? "" : " locked");
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;">${isOpen ? tr(item.title, state.lang) : "🔒 ???"}</div>
              <div style="font-size:11.5px;margin-top:3px;opacity:0.9;">
                ${isOpen ? tr(item.subtitle, state.lang) : tr(L(`Як відкрити: ${item.hint.uk}`, `Unlock hint: ${item.hint.en}`), state.lang)}
              </div>
            </div>
          `;
          wrap.appendChild(card);
        });
      } else if (state.archiveTab === 1) {
        SHYTOMYR_LEGENDS.forEach((leg, idx) => {
          const isOpen = unlockedShyt.includes(leg.tag);
          const card = document.createElement("div");
          card.className = "archive-card" + (isOpen ? "" : " locked");
          const canvasId = `arch-shyt-c-${idx}`;
          card.innerHTML = `
            <div class="archive-portrait-box">
              ${isOpen ? `<canvas id="${canvasId}" width="52" height="52"></canvas>` : "🧦"}
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;">
                ${isOpen ? `${tr(leg.name, state.lang)} (${leg.age})` : tr(L(`Таємничий гість #${idx + 1} (м. Шитомир)`, `Mystery Guest #${idx + 1} (Shytomyr)`), state.lang)}
              </div>
              <div style="font-size:11.5px;margin-top:2px;opacity:0.9;">
                ${isOpen ? `${tr(leg.role, state.lang)} • ${tr(leg.stories[0].model, state.lang)}` : tr(L(`Натяк: ${leg.role.uk} — пропусти на КПП`, `Hint: ${leg.role.en} — approve at gate`), state.lang)}
              </div>
              ${leg.gift ? `<div style="font-size:10.5px;margin-top:3px;color:${isOpen ? "#2E7D32" : "#E0B145"};font-weight:700;">${isOpen ? `${leg.gift.icon} ${tr(leg.gift.title, state.lang)} — ${tr(leg.gift.desc, state.lang)}` : tr(L(`🎁 Унікальний підгін: ${leg.gift.icon} ??? (Пропусти на КПП)`, `🎁 Unique Gift: ${leg.gift.icon} ??? (Approve to unlock)`), state.lang)}</div>` : ""}
            </div>
          `;
          wrap.appendChild(card);
          if (isOpen) {
            const c = document.getElementById(canvasId);
            if (c) drawPortrait(c.getContext("2d"), leg.portrait, 26, 51, 0.38);
          }
        });
      } else if (state.archiveTab === 3) {
        const hdrA = document.createElement("div");
        hdrA.style.cssText = "font-size:11.5px;font-weight:800;color:#E0B145;margin:2px 0;";
        hdrA.textContent = tr(L(`🛡️ ВІДЗНАКИ СПЕЦСЛУЖБ (${badges.length}/${AGENCY_BADGE_DEFS.length}):`, `🛡️ AGENCY DISTINCTIONS (${badges.length}/${AGENCY_BADGE_DEFS.length}):`), state.lang);
        wrap.appendChild(hdrA);
        AGENCY_BADGE_DEFS.forEach(b => {
          const unlocked = badges.includes(b.id);
          const card = document.createElement("div");
          card.className = "archive-card" + (unlocked ? "" : " locked");
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;">${unlocked ? "✅ " : "🔒 "}${b.icon} ${tr(b.title, state.lang)}</div>
              <div style="font-size:11.5px;margin-top:3px;opacity:0.9;">${tr(b.desc, state.lang)}</div>
            </div>
          `;
          wrap.appendChild(card);
        });

        const hdrD = document.createElement("div");
        hdrD.style.cssText = "font-size:11.5px;font-weight:800;color:#E0B145;margin:6px 0 2px;";
        hdrD.textContent = tr(L(`🕵️ СЛУЖБИ, ФРАКЦІЇ ТА ВІДКРИТТЯ ГРИ (${discoveries.length}/${GAME_DISCOVERY_DEFS.length}):`, `🕵️ AGENCIES, FACTIONS & GAME DISCOVERIES (${discoveries.length}/${GAME_DISCOVERY_DEFS.length}):`), state.lang);
        wrap.appendChild(hdrD);
        GAME_DISCOVERY_DEFS.forEach(dItem => {
          const unlocked = discoveries.includes(dItem.id);
          const card = document.createElement("div");
          card.className = "archive-card" + (unlocked ? "" : " locked");
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;">${unlocked ? `✅ ${dItem.icon} ${tr(dItem.title, state.lang)}` : `🔒 ${dItem.icon} ???`}</div>
              <div style="font-size:11.5px;margin-top:3px;opacity:0.9;">
                ${unlocked ? tr(dItem.desc, state.lang) : tr(L(`Як відкрити: ${dItem.hint.uk}`, `How to unlock: ${dItem.hint.en}`), state.lang)}
              </div>
            </div>
          `;
          wrap.appendChild(card);
        });

        const hdrM = document.createElement("div");
        hdrM.style.cssText = "font-size:11.5px;font-weight:800;color:#E0B145;margin:6px 0 2px;";
        hdrM.textContent = tr(L("⚡ МЕТА-ПЕРКИ АРХІВУ:", "⚡ ARCHIVE META-PERKS:"), state.lang);
        wrap.appendChild(hdrM);
        getActiveMetaPerks().forEach(p => {
          const card = document.createElement("div");
          card.className = "archive-card" + (p.unlocked ? "" : " locked");
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;">${p.unlocked ? "✅ " : "🔒 "}${tr(p.title, state.lang)} (${Math.min(p.progress, p.reqCount)}/${p.reqCount})</div>
              <div style="font-size:11.5px;margin-top:3px;opacity:0.9;">${tr(p.desc, state.lang)}</div>
            </div>
          `;
          wrap.appendChild(card);
        });
      } else {
        const box = document.createElement("div");
        box.className = "stat-grid";
        box.innerHTML = `
          <div class="stat-box"><div style="font-size:20px;font-weight:900;">${stats.gamesFinished}</div><div style="font-size:11px;">${tr(L("Завершено кар'єр", "Careers Completed"), state.lang)}</div></div>
          <div class="stat-box"><div style="font-size:20px;font-weight:900;">${stats.totalProcessed}</div><div style="font-size:11px;">${tr(L("Оформлено людей", "Travelers Processed"), state.lang)}</div></div>
          <div class="stat-box"><div style="font-size:20px;font-weight:900;">${stats.totalDetained}</div><div style="font-size:11px;">${tr(L("Затримано агентів/контрабанди", "Criminals Detained"), state.lang)}</div></div>
          <div class="stat-box"><div style="font-size:20px;font-weight:900;">${stats.bestCash} 🪙</div><div style="font-size:11px;">${tr(L("Рекорд кешу", "Best Cash"), state.lang)}</div></div>
          <div class="stat-box" style="grid-column:span 2;"><div style="font-size:17px;font-weight:900;">${unlockedArch.length + unlockedShyt.length + openServDisc} / ${16 + 12 + totalServDisc}</div><div style="font-size:11px;">${tr(L("Відкрито в Колекції (Титули + Шитомир + Служби)", "Collection Unlocked (Titles + Shytomyr + Agencies)"), state.lang)}</div></div>
          <div class="stat-box" style="grid-column:span 2;"><div style="font-size:17px;font-weight:900;">27 648</div><div style="font-size:11px;">${tr(L("Унікальних комбінацій досьє долі в грі", "Unique Epilogue Combinations"), state.lang)}</div></div>
        `;
        wrap.appendChild(box);
      }
      return;
    }

    if (state.phase === "MORNING_BRIEFING") {
      const d = state.daySpec;
      const rk = getRank();
      const activeMeta = getActiveMetaPerks().filter(p => p.unlocked);
      const cf = state.campaignFlags || {};
      const warNotes = [];
      if (state.sbkRep < 35) {
        warNotes.push(tr(L("• 👁️ СБК точить на тебе зуб (низька довіра) — підкуп коштуватиме дорожче і може зірватися!", "• 👁️ SBK suspects you (low trust) — bribing them is costlier and riskier!"), state.lang));
      }
      if (!state.isSandbox && d.dayNumber >= 2) {
        if (cf.letDeputyPass) warNotes.push(tr(L("• Мажор, якого ти пропустив, похвалився зв'язками — НАБК посилило нагляд (+ризик).", "• The VIP you let pass bragged — NABK heightened scrutiny."), state.lang));
        if (cf.caughtSpotter) warNotes.push(tr(L("• СБК відзначило арешт коригувальника — контррозвідка прикриває твій тил.", "• SBK commended your spotter arrest — intel has your back."), state.lang));
        if (cf.helpedHalya) warNotes.push(tr(L("• Тітка Галя передала домашні пиріжки й теплі шкарпетки для зміни.", "• Aunt Halya sent warm pies and socks to the booth."), state.lang));
        if (cf.refusedNabk) warNotes.push(tr(L("• У базі НАБК зафіксовано чисту відмову від провокації.", "• Clean refusal logged in NABK audit dossier."), state.lang));
      }
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <div style="border-radius:8px;overflow:hidden;border:1px solid #354039;background:#101714;">
            <canvas id="morning-canvas" width="420" height="84" style="width:100%;height:auto;display:block;"></canvas>
          </div>
          <p style="color:#E0B145;font-family:monospace;font-size:13px;">${tr(d.dateLabel, state.lang)}</p>
          <h1 style="font-size:21px;font-weight:800;">${tr(d.headline, state.lang)}</h1>
          <section class="card-radio">
            <h2 style="color:#E0B145;font-size:12px;margin-bottom:4px;">${tr(L("📻 РАДІОЕФІР РАНКУ", "📻 MORNING RADIO BROADCAST"), state.lang)}</h2>
            <p style="font-size:13px;color:#CFD8DC;">${tr(d.radioNews, state.lang)}</p>
          </section>
          ${(() => {
            const wKey = state.weather || "CLEAR";
            const wDef = (typeof WEATHER_DEFS !== "undefined" && WEATHER_DEFS[wKey]) || { icon: "🌙", title: L("Ясна ніч", "Clear Night"), effect: L("Стандартна видимість", "Standard visibility") };
            return `
              <section id="morning-weather-card" class="weather-briefing-card">
                <div style="font-size:12px;font-weight:800;color:#81D4FA;">${wDef.icon} ${tr(L("МЕТЕОЗВЕДЕННЯ ЗМІНИ:", "SHIFT WEATHER FORECAST:"), state.lang)} ${tr(wDef.title, state.lang)}</div>
                <div style="font-size:11.5px;color:#CFD8DC;margin-top:2px;">${tr(wDef.effect, state.lang)}</div>
              </section>
            `;
          })()}
          ${warNotes.length > 0 ? `
            <section class="card-slate" style="border-left:4px solid #E0B145;">
              <h2 style="color:#E0B145;font-size:12.5px;margin-bottom:4px;">${tr(L("📌 ВІЙНА І ЗМІНИ — НАСЛІДКИ РІШЕНЬ:", "📌 WAR & SHIFTS — CONSEQUENCES:"), state.lang)}</h2>
              ${warNotes.map(n => `<p style="font-size:12px;color:#CFD8DC;margin-bottom:2px;">${n}</p>`).join("")}
            </section>
          ` : ""}
          <section class="card-slate">
            <h2 style="color:#E0B145;font-size:13px;margin-bottom:4px;">${tr(L("🎖️ РАНГ І ПЕРКИ:", "🎖️ RANK & ACTIVE PERKS:"), state.lang)}</h2>
            <p style="font-size:12.5px;font-weight:700;color:#FFE082;">${tr(rk.title, state.lang)} (${rk.salary} 🪙/${tr(L("оформ.", "proc."), state.lang)})</p>
            <p style="font-size:11.5px;color:#B0BEC5;margin-top:2px;">${tr(rk.perkLabel, state.lang)}</p>
            ${activeMeta.length > 0 ? `<p style="font-size:11px;color:#81C784;margin-top:4px;">⚡ ${tr(L("Мета-перки Архіву:", "Archive Perks:"), state.lang)} ${activeMeta.map(p => tr(p.title, state.lang)).join(" • ")}</p>` : ""}
          </section>
          <section class="card-slate">
            <h2 style="color:#E0B145;font-size:13px;margin-bottom:4px;">${tr(L("🧢 НАРАДА У ПАЛ ПАЛИЧА:", "🧢 PAL PALYCH'S BRIEFING:"), state.lang)}</h2>
            <p style="font-size:13px;line-height:1.4;">${tr(d.bossBriefing, state.lang)}</p>
          </section>
          <section class="card-paper">
            <h2 style="font-size:14px;font-weight:800;margin-bottom:6px;">${tr(L("📋 ДИРЕКТИВА ДПСК НА ЗМІНУ:", "📋 TODAY'S BORDER DIRECTIVES:"), state.lang)}</h2>
            ${d.rulesList.map(r => `<p style="font-size:13px;margin-bottom:4px;">${tr(r, state.lang)}</p>`).join("")}
            ${d.wantedHint ? `<p style="color:#C62828;font-weight:700;font-size:13px;margin-top:4px;">🎯 ${tr(d.wantedHint, state.lang)}</p>` : ""}
          </section>
        </div>
        <button type="button" id="btn-enter-booth" class="btn-primary-green">${tr(L("ЗАСТУПИТИ НА ЗМІНУ В БУДКУ →", "ENTER CHECKPOINT BOOTH →"), state.lang)}</button>
      `;
      const mCanvas = document.getElementById("morning-canvas");
      if (window._phaseBannerRaf) { cancelAnimationFrame(window._phaseBannerRaf); window._phaseBannerRaf = null; }
      if (mCanvas) {
        let lastM = 0;
        const mWeather = state.weather || "CLEAR";
        const tickMorning = (ts) => {
          if (state.phase !== "MORNING_BRIEFING" || document.getElementById("morning-canvas") !== mCanvas) {
            window._phaseBannerRaf = null; return;
          }
          if (!lastM || ts - lastM >= 36) { lastM = ts; drawMorningBanner(mCanvas, d.dayNumber, (ts || Date.now()) * 0.001, mWeather); }
          window._phaseBannerRaf = requestAnimationFrame(tickMorning);
        };
        const reducedMorning = isMotionReduced();
        drawMorningBanner(mCanvas, d.dayNumber, reducedMorning ? 0 : Date.now() * 0.001, mWeather);
        if (!reducedMorning && typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickMorning);
      }
      document.getElementById("btn-enter-booth").addEventListener("click", () => { audio.playTap(); beginShift(); });
      return;
    }

    if (state.phase === "BOOTH_SHIFT") {
      const t = state.queue[state.travelerIdx];
      if (!t) { finishShift(); return; }
      const doc = t.documents[state.selectedDocIdx] || t.documents[0];
      const droneWarning = state.shiftHasSiren && !state.sirenResolved && !state.sirenActive && state.shiftSec > state.sirenTriggerSec && state.shiftSec <= state.sirenTriggerSec + 14;
      const spottedObjs = t.violations.filter(v => state.spottedCodes.includes(v.code));
      const needsArrest = spottedObjs.some(v => v.requiresDetention);
      const photoSpotted = state.spottedCodes.includes("PHOTO_MISMATCH");
      const rk = getRank();
      const gurFast = loadAgencyBadges().includes("GUR_FALCON") ? 2 : 0;
      const hasEndoscope = state.ownedAssets.includes("uv_endoscope");
      const dogSecCost = Math.max(2, rk.dogCost - gurFast - (hasEndoscope ? 3 : 0));
      const searchCost = `-${dogSecCost}s`;
      const bribeInfo = getComputedBribe(t.bribeOffer);
      const bribeVisible = Boolean(
        bribeInfo &&
        !state.bribeAccepted &&
        state.haggleState !== "FAILED" &&
        (bribeInfo.isInstant || state.vehicleInspected || state.spottedCodes.length > 0 || state.interrogated)
      );
      const bribeLocked = Boolean(state.bribeAccepted && (!t.bribeOffer || !t.bribeOffer.isFriendlyGift));
      const hasSbkTablet = state.ownedAssets.includes("sbk_database_tablet");
      const wKey = state.weather || "CLEAR";
      const wDef = (typeof WEATHER_DEFS !== "undefined" && WEATHER_DEFS[wKey]) || { icon: "🌙", shortTag: L("🌙 Ясно", "🌙 Clear") };
      const rawVehDesc = tr(t.vehicleDesc, state.lang);
      const maskedVehDesc = wKey === "SNOW" && !state.weatherCleared ? maskPlateInVehicleDesc(rawVehDesc) : rawVehDesc;
      const snowPlateMasked = Boolean(wKey === "SNOW" && !state.weatherCleared && maskedVehDesc !== rawVehDesc);
      const fogVehMasked = Boolean(wKey === "FOG" && !state.weatherCleared);
      const deskJustSlammed = Boolean(state.stampSlam && (Date.now() - (state.stampSlam.at || 0)) < 360);

      let tabletBadge = "";
      if (hasSbkTablet && t.storyTag === "INTEL_ALLY") {
        tabletBadge = `<div style="background:#1565C0;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 ТЕРМІНАЛ «ОБЕРІГ»: 🦅 Спецборт ГУР/СБК (пароль підтверджено)</div>`;
      }

      const phoneCallHtml = (state.activePhoneCall && !state.activePhoneCall.dismissed)
        ? (state.activePhoneCall.answered
          ? `<div id="phone-call-card" class="phone-call-bar active">
               <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                 <strong style="font-size:11.5px;color:#FFE082;">☎️ ${tr(state.activePhoneCall.caller, state.lang)}</strong>
                 <button type="button" id="btn-ignore-phone" class="btn-outline" style="padding:1px 6px;font-size:10px;">✕</button>
               </div>
               <p style="font-size:11px;line-height:1.3;color:#ECEFF1;margin:3px 0;">${tr(state.activePhoneCall.message, state.lang)}</p>
               <div style="font-size:10px;font-weight:800;color:#81C784;">📌 ${tr(state.activePhoneCall.rewardHint, state.lang)}</div>
             </div>`
          : `<div id="phone-call-card" class="phone-call-bar ringing">
               <div style="display:flex;align-items:center;gap:7px;flex:1;min-width:0;">
                 <span class="phone-ring-icon">☎️</span>
                 <div style="min-width:0;">
                   <div style="font-size:11.5px;font-weight:900;color:#FFE082;">${tr(L("ВХІДНИЙ ДЗВІНОК НА ПОСТ!", "INCOMING BOOTH CALL!"), state.lang)}</div>
                   <div style="font-size:10px;color:#CFD8DC;">${tr(state.activePhoneCall.caller, state.lang)}</div>
                 </div>
               </div>
               <div style="display:flex;gap:5px;flex-shrink:0;">
                 <button type="button" id="btn-answer-phone" class="btn-primary-green" style="padding:5px 9px;font-size:11px;">📞 ${tr(L("Відповісти", "Answer"), state.lang)}</button>
                 <button type="button" id="btn-ignore-phone" class="btn-outline" style="padding:5px 7px;font-size:11px;">🔇</button>
               </div>
             </div>`)
        : "";

      let activeSpeech = t.greeting;
      if (state.reactionState === "INTIMIDATED") activeSpeech = t.intimidateReply || t.interrogationReply;
      else if (state.reactionState === "COFFEE_GIVEN") activeSpeech = t.coffeeReply || t.greeting;
      else if (state.interrogated) activeSpeech = t.interrogationReply;
      if (activeSpeech && bribeInfo) {
        const syncText = (str) => String(str).replace(/\d[\d\s,]*\s*(💵|🪙)/g, bribeInfo.display);
        activeSpeech = { uk: syncText(activeSpeech.uk), en: syncText(activeSpeech.en) };
      }

      const topLogs = (state.shiftLogs || []).slice();
      if (droneWarning) {
        topLogs.unshift({ color: "#FF5252", text: L("⚠️ РАДАР ППО: У небі «мопед» на підльоті! Готуйтесь до сирени!", "⚠️ RADAR ALERT: Drone spotted in sky! Siren imminent!") });
      }
      const line1 = topLogs[0];
      const line2 = topLogs[1];

      root.innerHTML = `
        <div class="shift-log-box" id="shift-log-bar">
          <div class="shift-log-lines">
            <div class="shift-log-line" style="color:${line1 ? line1.color : "#78909C"};">${line1 ? tr(line1.text, state.lang) : "—"}</div>
            <div class="shift-log-line" style="color:${line2 ? line2.color : "#546E7A"};opacity:0.82;">${line2 ? tr(line2.text, state.lang) : ""}</div>
          </div>
          <button type="button" id="btn-toggle-logs" class="btn-outline" style="padding:3px 7px;font-size:10.5px;flex-shrink:0;">${state.logsExpanded ? "▴" : "▾"} ${topLogs.length}</button>
          <div class="shift-log-drawer" id="shift-log-drawer" style="display:${state.logsExpanded ? "flex" : "none"};">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #354039;padding-bottom:4px;font-size:11px;font-weight:800;color:#E0B145;">
              <span>📻 ${tr(L("ЖУРНАЛ ПОВІДОМЛЕНЬ ЗМІНИ", "SHIFT MESSAGE LOG"), state.lang)}</span>
              <button type="button" id="btn-close-logs" class="btn-outline" style="padding:1px 6px;font-size:10px;">✕</button>
            </div>
            ${topLogs.map(lg => `<div style="font-size:11px;line-height:1.3;color:${lg.color};border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:3px;">${tr(lg.text, state.lang)}</div>`).join("")}
          </div>
        </div>
        <header class="top-bar">
          <div class="row-between">
            <span id="hud-timer" style="color:${state.shiftSec < 40 ? "#FF8A80" : "#E0B145"};font-weight:700;font-size:12.5px;">${tr(L("День", "Day"), state.lang)} ${state.daySpec.dayNumber} • ⏱ ${state.shiftSec}s</span>
            <div class="${(Date.now() - (state.hudPopAt || 0)) < 450 && !isMotionReduced() ? "hud-val-pop" : ""}" style="display:flex;flex-direction:column;line-height:1.15;font-weight:800;font-size:12px;text-align:right;">
              <span style="color:#E0B145;">${state.money.toLocaleString("en-US")} 🪙</span>
              <span style="color:#81C784;">${state.usd.toLocaleString("en-US")} 💵</span>
            </div>
            <span style="font-size:11.5px;">${tr(L("Черга", "Queue"), state.lang)}: ${state.travelerIdx + 1}/${state.queue.length}</span>
            <div style="display:flex;gap:4px;">
              <button type="button" id="hud-music" class="btn-outline" style="padding:3px 6px;" aria-label="Toggle music">${audio.musicEnabled ? "🔊" : "🔇"}</button>
              <button type="button" id="hud-wanted" class="btn-outline" style="padding:3px 6px;border-color:#FF5252;color:#FFCDD2;">🎯 ${tr(L("Розшук", "Wanted"), state.lang)}</button>
              <button type="button" id="hud-rules" class="btn-outline" style="padding:3px 6px;">${tr(L("📋 Правила", "📋 Rules"), state.lang)}</button>
            </div>
          </div>
          <div class="row-between" style="font-size:11px;color:#B0BEC5;">
            <span style="color:${state.nabkRisk >= 60 || state.underSurveillance || state.reprimands > 0 ? "#FF5252" : "#B0BEC5"};">НАБК:${state.nabkRisk}%${state.reprimands > 0 ? ` | ⚠️${state.reprimands}/3` : ""}${state.underSurveillance ? " | 👁️НАГЛЯД" : ""}${state.isUndercoverSbkAgent ? ` | 🕵️(${state.spiesCaughtAsAgent}/4)` : ""}${(state.shiftCombo || 0) >= 2 ? ` | <span class="combo-pill">🔥 ${state.shiftCombo}${state.shiftCombo >= 8 ? " (x1.5)" : (state.shiftCombo >= 5 ? " (x1.3)" : (state.shiftCombo >= 3 ? " (x1.15)" : ""))}</span>` : ""}</span>
            <span style="display:flex;align-items:center;gap:5px;"><span id="hud-weather" class="weather-pill">${tr(wDef.shortTag, state.lang)}</span><span>${tr(L("Палич", "Palych"), state.lang)}:${state.palychRep} | ${tr(L("Толік", "Tolik"), state.lang)}:${state.tolikRep} | СБК:${state.sbkRep}</span></span>
          </div>
        </header>

        ${tabletBadge}
        ${phoneCallHtml}

        <section class="booth-row">
          <div id="booth-wrap" class="booth-canvas-wrap ${state.justShook ? "booth-shake" : ""}" title="${tr(L("Натисни, щоб звірити авто/обличчя", "Click to inspect vehicle & face"), state.lang)}">
            <canvas id="booth-canvas" width="200" height="172"></canvas>
          </div>
          <div class="dialogue-box">
            <div class="dialogue-scroll">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:2px;">
                <span style="color:#E0B145;font-weight:700;font-size:12.5px;">${tr(t.fullName, state.lang)} (${t.age})</span>
                <span style="background:${t.direction === "ENTRY" ? "#1B5E20" : "#8E0000"};color:#FFF;font-size:9.5px;font-weight:900;padding:2px 6px;border-radius:4px;letter-spacing:0.3px;">
                  ${t.direction === "ENTRY" ? tr(L("🟢 В'ЇЗД (Додому)", "🟢 ENTRY (Home)"), state.lang) : tr(L("🔴 ВИЇЗД (За кордон)", "🔴 EXIT (Abroad)"), state.lang)}
                </span>
              </div>
              <button type="button" id="booth-vehicle-info" class="booth-vehicle-tag" title="${tr(L("Натисни, щоб звірити авто", "Click to verify vehicle"), state.lang)}">${fogVehMasked ? `🌫️ ${tr(L("У тумані не видно колір/модель авто...", "Vehicle hidden in dense fog..."), state.lang)}` : `🚘 ${maskedVehDesc}`}</button>
              ${fogVehMasked ? `<button type="button" id="btn-weather-clear" class="weather-clear-btn">🔦 ${tr(L("Розвіяти туман (0s)", "Shine High-Beams (0s)"), state.lang)}</button>` : (snowPlateMasked ? `<button type="button" id="btn-weather-clear" class="weather-clear-btn">🧤 ${tr(L("Протерти засніжений номер (-1s)", "Wipe Frosted Plate (-1s)"), state.lang)}</button>` : "")}
              <p style="font-size:11.5px;line-height:1.35;">${tr(activeSpeech, state.lang)}</p>
            </div>
            ${bribeVisible ? `
              <div class="haggle-row">
                <button type="button" id="btn-take-bribe" style="background:${t.bribeOffer.isFriendlyGift ? "#1B5E20" : "#6D4C41"};color:#E0B145;padding:5px 8px;font-size:11px;flex:1;">
                  ${t.bribeOffer.isFriendlyGift ? tr(L(`🤝 ВЗЯТИ ПІДГОН НА КАВУ (+${bribeInfo.display})`, `🤝 ACCEPT GIFT (+${bribeInfo.display})`), state.lang) : tr(L(`✉️ ВЗЯТИ КОНВЕРТ (+${bribeInfo.display})`, `✉️ TAKE ENVELOPE (+${bribeInfo.display})`), state.lang)}${bribeInfo.boostedByIntimidate ? ` <span style="background:#FF8F00;color:#111;padding:1px 5px;border-radius:4px;font-size:9.5px;font-weight:900;">${tr(L("📢 +30% ВИБИТО", "📢 +30% SHAKEN"), state.lang)}</span>` : ""}${bribeInfo.boostedByHaggle ? ` <span style="background:#7B1FA2;color:#FFF;padding:1px 5px;border-radius:4px;font-size:9.5px;font-weight:900;">📈 +${bribeInfo.hagglePct}%</span>` : ""}
                </button>
                ${(!t.bribeOffer.isFriendlyGift && state.haggleState === "NONE") ? `<button type="button" id="btn-haggle-bribe" class="btn-haggle">📈 ${tr(L("Мало!", "More!"), state.lang)}</button>` : ""}
              </div>
              ${!t.bribeOffer.isFriendlyGift ? `<div style="font-size:10px;color:${state.nabkRisk >= 65 || state.underSurveillance ? "#FF5252" : "#FFAB91"};margin-top:2px;">${state.nabkRisk >= 65 || state.underSurveillance ? tr(L(`⚠️ НАБК ${state.nabkRisk}% — дуже небезпечно брати! Краще 🚨 Затримати`, `⚠️ NABK ${state.nabkRisk}% — risky! Better 🚨 Detain`), state.lang) : tr(L("⚖️ Пропозиція хабаря — кримінал (можна 🚨 Затримати)", "Offering a bribe is a crime (can 🚨 Detain)"), state.lang)}</div>` : ""}
            ` : (state.haggleState === "FAILED" && !state.bribeAccepted ? `<div id="haggle-failed-note" style="color:#FF8A80;font-size:10.5px;font-weight:800;margin-top:4px;">${tr(L("😤 Конверт сховано після торгу (спробу підкупу зафіксовано — можна 🚨 Затримати)", "😤 Driver pulled cash back after haggle (can 🚨 Detain)"), state.lang)}</div>` : (state.bribeAccepted ? `<div style="color:#81C784;font-size:11px;font-weight:700;margin-top:4px;">${tr(L("✔ У кишені (тисни ✔ ПРОПУСТИТИ)", "✔ Pocketed (press ✔ APPROVE)"), state.lang)}</div>` : ""))}
          </div>
        </section>

        <div class="reactions-bar">
          <button type="button" id="react-intimidate" class="reaction-btn ${state.reactionState === "INTIMIDATED" ? "done" : ""}">📢 ${tr(L("Нагримати", "Knock"), state.lang)}</button>
          <button type="button" id="react-coffee" class="reaction-btn ${state.reactionState === "COFFEE_GIVEN" ? "done" : ""}">☕ ${tr(L("Кава", "Coffee"), state.lang)}</button>
          <button type="button" id="react-uv" class="reaction-btn ${state.uvActive ? "uv-on" : ""}">🔦 ${tr(L(state.uvActive ? "УФ: ВКЛ" : "УФ-лампа", state.uvActive ? "UV: ON" : "UV Lamp"), state.lang)}</button>
          <button type="button" id="react-dog" class="reaction-btn ${state.vehicleInspected ? "done" : ""}" ${state.vehicleInspected ? "disabled" : ""}>🐕 ${state.vehicleInspected ? tr(L("Перевірено", "Checked"), state.lang) : tr(L(`Пес ${searchCost}`, `Dog ${searchCost}`), state.lang)}</button>
        </div>
        ${state.intimidateClueMsg ? `
          <div id="intimidate-tell-banner" class="intimidate-feedback-banner ${state.intimidateClueIsWarn ? "offended" : "tell"}">
            <span>${tr(state.intimidateClueMsg, state.lang)}</span>
          </div>
        ` : ""}
        ${state.trunkPanelOpen && !state.vehicleInspected ? (() => {
          const hasEndoscope = state.ownedAssets.includes("uv_endoscope");
          const checked = state.checkedZones || [];
          const zonesList = [
            { id: "TRUNK", icon: "🧳", name: L("Багажник", "Trunk") },
            { id: "SPARE", icon: "🛞", name: L("Запаска", "Spare") },
            { id: "GLOVE", icon: "🧤", name: L("Салон", "Cabin") }
          ];
          const stepCostText = hasEndoscope ? "-1s" : "-2s";
          return `
          <div id="trunk-search-panel" style="background:#1B221E;border:1.5px solid #E0B145;border-radius:6px;padding:7px;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#E0B145;font-weight:800;">
              <span>🐕 ${tr(L(`ОБШУК: Перевір будь-які відсіки (${stepCostText}/відсік):`, `DOG SEARCH: Check any compartments (${stepCostText}/zone):`), state.lang)}</span>
              ${hasEndoscope && state.dogTargetZone ? `<span style="color:#80DEEA;">🩻 🐾</span>` : (state.uvCompartmentRevealed && state.dogTargetZone ? `<span style="color:#00E5FF;">🧪 UV</span>` : "")}
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
              ${zonesList.map(z => {
                const isChecked = checked.includes(z.id);
                const hintScents = hasEndoscope && state.dogTargetZone === z.id;
                const uvZoneHit = state.uvCompartmentRevealed && state.dogTargetZone === z.id;
                const badge = isChecked ? " ✓" : (hintScents ? " 🐾" : (uvZoneHit ? " 🧪-1s" : ""));
                const extraStyle = isChecked
                  ? "opacity:0.55;border-color:#546E7A;color:#90A4AE;"
                  : (hintScents ? "border-color:#FF5252;color:#FFE082;" : (uvZoneHit ? "border-color:#00E5FF;color:#80F9FF;box-shadow:0 0 8px rgba(0,229,255,0.28);" : ""));
                return `<button type="button" id="trunk-zone-${z.id}" class="btn-outline trunk-zone-btn" data-zone="${z.id}" ${isChecked ? "disabled" : ""} style="padding:6px 4px;font-size:11px;${extraStyle}">${z.icon} ${tr(z.name, state.lang)}${badge}</button>`;
              }).join("")}
            </div>
            ${state.zoneCheckMsg ? `<div style="font-size:11px;color:#FFE082;font-weight:700;">🔎 ${tr(state.zoneCheckMsg, state.lang)}</div>` : ""}
            ${checked.length > 0 ? `<button type="button" id="btn-finish-dog-search" class="btn-outline" style="padding:4px 8px;font-size:11px;border-color:#66BB6A;color:#A5D6A7;">✅ ${tr(L("Завершити обшук (нічого не знайдено)", "Finish search (nothing found)"), state.lang)}</button>` : ""}
          </div>
          `;
        })() : ""}
        ${state.vehicleInspected ? (() => {
          const vehMism = t.violations.find(v => v.code === "VEHICLE_MISMATCH" && state.spottedCodes.includes(v.code));
          const isAlert = t.hasContraband || Boolean(vehMism);
          return `
            <div id="vehicle-search-report" style="background:${isAlert ? "#2B1416" : "#14261B"};border:1.5px solid ${isAlert ? "#E57373" : "#66BB6A"};border-radius:6px;padding:7px 9px;display:flex;flex-direction:column;gap:4px;">
              <div style="font-size:11px;font-weight:800;color:${isAlert ? "#FFCDD2" : "#C8E6C9"};line-height:1.3;">
                🐕 ${tr(t.vehicleSearchResult, state.lang)}
              </div>
              ${vehMism ? `<div style="font-size:10.5px;font-weight:700;color:#FFE082;">📌 ${tr(vehMism.hint, state.lang)}</div>` : ""}
            </div>
          `;
        })() : ""}

        <section class="desk-area ${state.inspectMode ? "inspect-mode" : ""} ${deskJustSlammed ? "desk-slam-shake" : ""}">
          ${(() => {
            const dr = state.daySpec && state.daySpec.dailyRule;
            const reqQr = state.daySpec && state.daySpec.requireOblikQr;
            const badges = [];
            if (dr === "MED_INSURANCE") badges.push(tr(L("🏥 ВИЇЗД: обов'язкова страховка", "🏥 EXIT: Med Insurance required"), state.lang));
            else if (dr === "TRANSIT_PERMIT") badges.push(tr(L("🛣️ ВИЇЗД: транзитний талон", "🛣️ EXIT: Transit Permit required"), state.lang));
            else if (dr === "STRICT_CLONES") badges.push(tr(L("🚗 Звіряйте авто й номери!", "🚗 Check cloned cars & plates!"), state.lang));
            if (reqQr) badges.push(tr(L("📱 Чол. 18–60: QR «Облік+»", "📱 M 18–60: Oblik+ QR"), state.lang));
            return badges.length > 0 ? `<div class="daily-rule-strip">${badges.join(" • ")}</div>` : "";
          })()}
          ${(() => {
            const titleStr = (doc.title && doc.title.uk ? doc.title.uk : "").toUpperCase();
            let docTheme = "doc-theme-cert";
            let headerBanner = "";
            if (doc.type === "PASSPORT") {
              if (titleStr.includes("ПОЛАНД") || titleStr.includes("ФРАНЦ")) {
                docTheme = "doc-theme-foreign-burgundy";
                headerBanner = tr(L("📕 ІНОЗЕМНИЙ ПАСПОРТ • ЄВРО-ЗРАЗОК", "📕 FOREIGN PASSPORT • EURO SERIES"), state.lang);
              } else if (titleStr.includes("БРИТАН") || titleStr.includes("КАРПАТ")) {
                docTheme = "doc-theme-foreign-green";
                headerBanner = tr(L("📗 ІНОЗЕМНИЙ ПАСПОРТ • ЗАКОРДОННИЙ", "📗 FOREIGN PASSPORT • OVERSEAS"), state.lang);
              } else if (titleStr.includes("ГЕРМАН")) {
                docTheme = "doc-theme-foreign-slate";
                headerBanner = tr(L("📓 ІНОЗЕМНИЙ ПАСПОРТ • ШТОС-СЕРІЯ", "📓 FOREIGN PASSPORT • SHTOS SERIES"), state.lang);
              } else {
                docTheme = "doc-theme-kraina";
                headerBanner = tr(L("🛡️ KRAINA • НАЦІОНАЛЬНИЙ ПАСПОРТ", "🛡️ KRAINA • NATIONAL PASSPORT"), state.lang);
              }
            } else if (doc.type === "MILITARY_ID") {
              docTheme = "doc-theme-oblik";
              headerBanner = tr(L("📱 ДЕРЖАВНИЙ РЕЄСТР «ОБЛІК+»", "📱 DIGITAL REGISTRY 'OBLIK+'"), state.lang);
            } else if (doc.type === "VEHICLE_CUSTOMS") {
              docTheme = "doc-theme-customs";
              headerBanner = tr(L("🚘 МИТНА ДЕКЛАРАЦІЯ ТА ТЕХПАСПОРТ", "🚘 CUSTOMS & VEHICLE REGISTRATION"), state.lang);
            } else {
              headerBanner = tr(L("📄 ОФІЦІЙНИЙ БЛАНК ДПСК", "📄 OFFICIAL BORDER FORM"), state.lang);
            }
            if (state.docFolded) {
              const openedArr = state.openedDocIndices || [];
              return `
                <div class="desk-table-surface" id="desk-table-grid">
                  ${t.documents.map((dItem, dIdx) => {
                    const dtTitle = (dItem.title && dItem.title.uk ? dItem.title.uk : "").toUpperCase();
                    let bg = "#FAF6EC", fg = "#1F1D1A", bdr = "#8D6E63", tag = tr(L("📄 ДОКУМЕНТ", "📄 DOCUMENT"), state.lang);
                    if (dItem.type === "PASSPORT") {
                      if (dtTitle.includes("ПОЛАНД") || dtTitle.includes("ФРАНЦ")) { bg = "#5D1A2B"; fg = "#FDE8E8"; bdr = "#E57373"; tag = "📕 PASSPORT"; }
                      else if (dtTitle.includes("БРИТАН") || dtTitle.includes("КАРПАТ")) { bg = "#1B4332"; fg = "#D8F3DC"; bdr = "#81C784"; tag = "📗 PASSPORT"; }
                      else if (dtTitle.includes("ГЕРМАН")) { bg = "#2B2D42"; fg = "#EDF2F4"; bdr = "#90A4AE"; tag = "📓 PASSPORT"; }
                      else { bg = "#102A43"; fg = "#FFE082"; bdr = "#E0B145"; tag = "🛡️ KRAINA"; }
                    } else if (dItem.type === "MILITARY_ID") {
                      bg = "#1B3B2B"; fg = "#A5D6A7"; bdr = "#66BB6A"; tag = "📱 ОБЛІК+";
                    } else if (dItem.type === "VEHICLE_CUSTOMS") {
                      bg = "#FFF3CD"; fg = "#3E2723"; bdr = "#B7811E"; tag = "🚘 ДЕКЛАРАЦІЯ";
                    }
                    const hasSpotted = (dItem.fields && dItem.fields.some(f => f.disc && state.spottedCodes.includes(f.disc.code)))
                      || (dItem.sealDisc && state.spottedCodes.includes(dItem.sealDisc.code));
                    const isChecked = openedArr.includes(dIdx);
                    const stateCls = hasSpotted ? " doc-spotted" : (isChecked ? " doc-checked" : "");
                    const dealCls = (!isMotionReduced() && (Date.now() - (state.travelerEnteredAt || 0)) < 650) ? " desk-doc-deal" : "";
                    const cornerBadge = hasSpotted
                      ? `<span class="desk-doc-badge spot">❗</span>`
                      : (isChecked ? `<span class="desk-doc-badge seen">👁️</span>` : "");
                    return `
                      <button type="button" id="desk-doc-${dIdx}" class="desk-doc-item${stateCls}${dealCls}" data-doc-idx="${dIdx}" style="--doc-delay:${dIdx * 45}ms;background:${bg};color:${fg};border:1.5px solid ${bdr};">
                        ${cornerBadge}
                        <span style="font-size:10px;font-weight:900;opacity:0.85;">${tag}</span>
                        <span style="font-size:12px;font-weight:800;line-height:1.2;">${tr(dItem.title, state.lang)}</span>
                        <span style="font-size:10px;opacity:0.75;">${tr(L("Натисни, щоб відкрити →", "Click to open →"), state.lang)}</span>
                      </button>
                    `;
                  }).join("")}
                </div>
              `;
            }
            const unfoldCls = state.justUnfoldedDoc ? "doc-unfold" : "";
            state.justUnfoldedDoc = false;
            return `
          <div id="doc-paper-el" class="doc-paper ${unfoldCls} ${docTheme} ${state.uvActive ? "uv-mode" : ""} ${state.uvActive && state.ownedAssets.includes("uv_spotlight") ? "uv-pro" : ""} ${wKey === "STORM" && !state.ownedAssets.includes("diesel_generator") && !state.uvActive ? "storm-flicker" : ""}">
            ${state.uvActive ? `<div class="uv-lens-overlay" id="uv-lens-overlay"></div>` : ""}
            <div class="doc-watermark-emblem" aria-hidden="true"></div>
            ${(doc.type === "PASSPORT" || doc.type === "MILITARY_ID") ? `<div class="doc-holo-strip" aria-hidden="true"></div>` : ""}
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.5px;font-weight:900;letter-spacing:0.5px;opacity:0.78;border-bottom:1px dashed rgba(0,0,0,0.18);padding-bottom:3px;">
              <span>${headerBanner}</span>
              <button type="button" id="btn-fold-doc" style="background:transparent;color:inherit;padding:0 4px;font-size:10px;opacity:0.75;">📂 ${tr(L("Скласти", "Fold"), state.lang)}</button>
            </div>
            <div class="row-between">
              <div>
                <div style="font-weight:800;font-size:14px;">${tr(doc.title, state.lang)}</div>
                <div style="color:${state.uvActive ? "#B39DDB" : "#5D4037"};font-size:11px;">${tr(doc.subtitle, state.lang)}</div>
              </div>
              ${doc.type === "PASSPORT" ? `
                <button type="button" id="btn-passport-photo" class="passport-photo-btn ${photoSpotted ? "spotted" : ""}" aria-label="Verify passport photo">
                  <canvas id="passport-mini-canvas" width="60" height="60" style="width:48px;height:48px;display:block;"></canvas>
                </button>
              ` : ""}
            </div>
            <hr style="border:none;border-top:1px solid ${state.uvActive ? "#5E35B1" : "#BCAAA4"};margin:2px 0;">
            <div id="doc-fields-list" style="display:flex;flex-direction:column;gap:3px;"></div>
            ${doc.type === "MILITARY_ID" ? (() => {
              const hasQrErr = t.violations.some(v => v.code === "INVALID_QR_CODE");
              const isFrozen = hasQrErr && state.oblikIsScreenshot;
              const nowTimeStr = new Date().toTimeString().slice(0, 8);
              return `
                <div class="oblik-qr-box" id="oblik-qr-box">
                  <canvas id="oblik-qr-canvas" class="oblik-qr-canvas" width="64" height="64"></canvas>
                  <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
                    <div style="font-size:10.5px;color:#C8E6C9;font-weight:700;display:flex;align-items:center;">
                      <span class="${isFrozen ? "oblik-frozen-dot" : "oblik-live-dot"}"></span>
                      <span id="oblik-live-clock">${isFrozen ? "11:42:07 (СКРІН)" : `LIVE ${nowTimeStr}`}</span>
                    </div>
                    ${state.oblikScanned ? `
                      <div style="font-size:11px;font-weight:800;color:${hasQrErr ? "#FF8A80" : "#69F0AE"};">
                        ${hasQrErr
                          ? tr(isFrozen ? L("⚠️ ПІДРОБКА: ЗАСТИГЛИЙ СКРІНШОТ!", "⚠️ FAKE: FROZEN SCREENSHOT!") : L("🚨 БАЗА: ВІЙСЬКОВИЙ РОЗШУК (ERR-409)!", "🚨 REGISTRY: WANTED (ERR-409)!"), state.lang)
                          : tr(L("✅ РЕЄСТР: ДІЙСНИЙ (ОНОВЛЕНО)", "✅ REGISTRY: VALID (UPDATED)"), state.lang)}
                      </div>
                    ` : `
                      <button type="button" id="btn-scan-oblik-qr" class="oblik-scan-btn">
                        <span class="oblik-scan-bar" id="oblik-scan-bar"></span>
                        <span style="position:relative;z-index:1;">📱 ${tr(L("Сканувати QR (тап / утримай)", "Scan QR (tap / hold)"), state.lang)}</span>
                      </button>
                    `}
                  </div>
                </div>
              `;
            })() : ""}
            ${state.uvActive ? (() => {
              const uvFindings = [];
              let uvColor = "#00E5FF";
              const hasFieldTamper = doc.fields && doc.fields.some(f => f.disc && !state.spottedCodes.includes(f.disc.code));
              if (hasFieldTamper) {
                uvColor = "#FF4081";
                uvFindings.push(L("🔦 UV: На підсвіченому полі видно правку! Натисни на підсвічений рядок вище.", "🔦 UV: Tampered ink revealed! Click the glowing field above."));
              }
              if (doc.sealDisc) {
                uvColor = "#FF4081";
                uvFindings.push(L("🔴 UV: Кустарний штамп, нуль захисних волокон! Клікни на печатку нижче.", "🔴 UV: Forged stamp, zero state security fibers! Click seal below."));
              }
              if (doc.type === "VEHICLE_CUSTOMS" && t.violations.some(v => v.code === "VEHICLE_MISMATCH")) {
                uvColor = "#FF4081";
                uvFindings.push(L("🚗 UV: На техпаспорті сліди перебитого VIN-номера та свіжої фарби!", "🚗 UV: Repainted hull & tampered VIN traces visible!"));
              }
              if (t.hasContraband && doc.type !== "VEHICLE_CUSTOMS") {
                if (uvColor === "#00E5FF") uvColor = "#76FF03";
                uvFindings.push(L("🧪 UV: На обкладинці сліди мазуту та бурштинового пилу — відкрий Митну декларацію під УФ або пускай пса!", "🧪 UV: Grease & amber dust — inspect Customs Declaration under UV or send the dog!"));
              }
              const uvSecret = getUvSecretAward(t);
              if (uvFindings.length === 0 && !uvSecret && !(doc.type === "VEHICLE_CUSTOMS" && state.dogTargetZone)) {
                const cleanNotes = [
                  L("✨ UV: Державні волокна ДПСК світяться чітко (+ жирна пляма від шаурми).", "✨ UV: State fibers OK (+ a faint shawarma grease stain)."),
                  L("✨ UV: Водяні знаки в нормі. На палітурці дитячий малюнок котика.", "✨ UV: Watermarks OK. Tiny UV-ink kitten drawn on cover."),
                  L("✨ UV: Захисна сітка ідеальна. Видно старий штамп «Оплачено 100 🪙».", "✨ UV: Security mesh clean. Old 'Paid 100 🪙' stamp visible."),
                  L("✨ UV: Усе чисто, лише сліди кави та стікер «Вимкнути праску».", "✨ UV: Clean! Only coffee rings & invisible 'Unplug iron' note.")
                ];
                const idx = Math.abs((t.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % cleanNotes.length;
                uvFindings.push(cleanNotes[idx]);
              }
              let customsTraceBtn = "";
              if (doc.type === "VEHICLE_CUSTOMS" && state.dogTargetZone) {
                const zoneLabels = {
                  TRUNK: L("🧳 БАГАЖНИК", "🧳 TRUNK"),
                  SPARE: L("🛞 ЗАПАСКА", "🛞 SPARE"),
                  GLOVE: L("🧤 САЛОН", "🧤 CABIN")
                };
                const zLabel = zoneLabels[state.dogTargetZone] || L("🧳 БАГАЖНИК", "🧳 TRUNK");
                customsTraceBtn = state.uvCompartmentRevealed
                  ? `<div style="padding:5px 8px;border-radius:6px;background:rgba(0,229,255,0.12);border:1px dashed #76FF03;color:#76FF03;font-size:11px;font-weight:800;">🧪 ${tr(L(`UV-СЛІД ЗАФІКСОВАНО: сліди мазуту ведуть у ${zLabel.uk} (Пес: -1s)!`, `UV TRACE LOCKED: grease smudge points to ${zLabel.en} (Dog: -1s)!`), state.lang)}</div>`
                  : `<button type="button" id="btn-uv-customs-trace" class="uv-interactive-btn" style="border-color:#76FF03;color:#B2FF59;"><span>🧪 ${tr(L(`UV-ВІДБИТКИ БІЛЯ СЛОВА: ${zLabel.uk}`, `UV PRINTS NEAR WORD: ${zLabel.en}`), state.lang)}</span><span>${tr(L("Вказати (-1s пес) →", "Lock Hint (-1s Dog) →"), state.lang)}</span></button>`;
              }
              let secretBtn = "";
              if (uvSecret) {
                const bonusTags = [];
                if (uvSecret.uah > 0) bonusTags.push(`+${uvSecret.uah.toLocaleString("en-US")} 🪙`);
                if (uvSecret.usd > 0) bonusTags.push(`+${uvSecret.usd.toLocaleString("en-US")} 💵`);
                if (uvSecret.riskDelta < 0) bonusTags.push(`${uvSecret.riskDelta}% НАБК`);
                if (uvSecret.sbkDelta > 0) bonusTags.push(`+${uvSecret.sbkDelta} СБК`);
                if (uvSecret.tolikDelta > 0) bonusTags.push(`+${uvSecret.tolikDelta} ${tr(L("Толік", "Tolik"), state.lang)}`);
                if (uvSecret.palychDelta > 0) bonusTags.push(`+${uvSecret.palychDelta} ${tr(L("Палич", "Palych"), state.lang)}`);
                if (uvSecret.timeDelta > 0) bonusTags.push(`+${uvSecret.timeDelta}s`);
                const bonusStr = bonusTags.join(" • ");
                secretBtn = state.uvSecretClaimed
                  ? `<button type="button" id="btn-uv-secret-stamp" class="uv-interactive-btn uv-claimed" disabled><span>${tr(uvSecret.title, state.lang)}</span><span>✅ ${tr(L("ЗАФІКСОВАНО", "CLAIMED"), state.lang)}</span></button>`
                  : `<button type="button" id="btn-uv-secret-stamp" class="uv-interactive-btn"><span>${tr(uvSecret.title, state.lang)}</span><span style="color:#FFD54F;">${bonusStr}</span></button>`;
              }
              return `
                <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px;">
                  ${uvFindings.length > 0 ? `<div class="uv-watermark" style="color:${uvColor};display:flex;flex-direction:column;gap:2px;align-self:stretch;">${uvFindings.map(item => `<div>${tr(item, state.lang)}</div>`).join("")}</div>` : ""}
                  ${customsTraceBtn}
                  ${secretBtn}
                </div>
              `;
            })() : ""}
            <button type="button" id="btn-doc-seal" class="seal-stamp ${doc.sealDisc && state.spottedCodes.includes(doc.sealDisc.code) ? "forged-spotted" : ""} ${state.uvActive && doc.sealDisc ? "forged-uv" : ""}">
              ✪ ${tr(doc.sealText, state.lang)}
            </button>
            ${(() => {
              const docSpotted = spottedObjs.filter(v => v.code !== "CONTRABAND_CARGO" && (doc.type === "VEHICLE_CUSTOMS" || v.code !== "VEHICLE_MISMATCH"));
              if (docSpotted.length === 0) return "";
              const docNeedsArrest = docSpotted.some(v => v.requiresDetention);
              return `
                <div style="padding:6px;border-radius:6px;background:${docNeedsArrest ? "#BBDEFB" : "#FFE0B2"};color:${docNeedsArrest ? "#1565C0" : "#E65100"};font-size:11px;font-weight:800;">
                  📌 ${tr(docSpotted[0].hint, state.lang)}
                </div>
              `;
            })()}
          </div>
            `;
          })()}
          <div id="inspect-hint-bar" class="inspect-hint-bar" style="display:${state.inspectMode ? "flex" : "none"};">
            <span id="inspect-hint-text">🎯 ${tr(L("Тисни на помилку: дату, ПІБ, фото, печатку або опис/вигляд авто!", "Click the issue: date, name, photo, seal, or vehicle!"), state.lang)}</span>
          </div>
          <div class="row-between">
            <button type="button" id="btn-interrogate" class="btn-outline" style="flex:1;background:${state.inspectMode ? "#5D1A1A" : "#3E2723"};border-color:${state.inspectMode ? "#FF5252" : "#4E5B53"};">${state.inspectMode ? tr(L("🎯 Скасувати вказування", "🎯 Cancel Pointing"), state.lang) : tr(L("🔍 Вказати на помилку", "🔍 Point Out Issue"), state.lang)}</button>
          </div>
        </section>

        <footer class="stamps-bar">
          <button type="button" id="stamp-approve" class="btn-primary-green" style="padding:11px 4px;font-size:12.5px;">${tr(L("✔ ПРОПУСТИТИ", "✔ APPROVE"), state.lang)}</button>
          <button type="button" id="stamp-deny" class="btn-primary-red" style="padding:11px 4px;font-size:12.5px;${bribeLocked ? "opacity:0.4;cursor:not-allowed;" : ""}" ${bribeLocked ? "disabled" : ""}>${bribeLocked ? tr(L("🔒 Взято", "🔒 Paid"), state.lang) : tr(L("✖ ВІДМОВИТИ", "✖ DENY"), state.lang)}</button>
          <button type="button" id="stamp-detain" class="btn-primary-blue" style="padding:11px 4px;font-size:12px;${bribeLocked ? "opacity:0.4;cursor:not-allowed;" : ""}" ${bribeLocked ? "disabled" : ""}>${bribeLocked ? tr(L("🔒 Взято", "🔒 Paid"), state.lang) : tr(L("🚨 СБК / АРЕШТ", "🚨 DETAIN"), state.lang)}</button>
        </footer>
      `;

      state.justShook = false;
      const boothCanvasEl = document.getElementById("booth-canvas");
      const reducedBooth = isMotionReduced();
      const boothSceneOpts = {
        portrait: t.portrait,
        transportShape: t.transportShape,
        colorHex: t.vehicleColorHex,
        roofHex: t.vehicleRoofHex,
        barrierState: state.barrierState,
        sirenActive: state.sirenActive,
        droneWarning,
        dayNumber: state.daySpec.dayNumber,
        reactionState: state.reactionState,
        uvActive: state.uvActive,
        snifferActive: state.vehicleInspected,
        hasContraband: t.hasContraband,
        hasPassenger: t.hasPassenger,
        storyTag: t.storyTag,
        shytomyrRelics: state.shytomyrRelics || [],
        ownedAssets: state.ownedAssets || [],
        lang: state.lang,
        weather: wKey,
        weatherCleared: Boolean(state.weatherCleared),
        hasCloneCar: t.violations.some(v => v.code === "VEHICLE_MISMATCH"),
        travelerEnteredAt: state.travelerEnteredAt || 0,
        speechAt: state.speechAt || 0,
        knockVfxAt: state.knockVfxAt || 0,
        coffeeVfxAt: state.coffeeVfxAt || 0,
        dogVfxAt: state.dogVfxAt || 0,
        reduceMotion: reducedBooth,
        nowMs: Date.now(),
        isLive: !reducedBooth
      };
      if (window._boothAnimRaf) {
        cancelAnimationFrame(window._boothAnimRaf);
        window._boothAnimRaf = null;
      }
      let lastBoothDraw = 0;
      function tickBoothAnim(nowTs) {
        if (state.phase !== "BOOTH_SHIFT" || document.getElementById("booth-canvas") !== boothCanvasEl || isMotionReduced()) {
          window._boothAnimRaf = null;
          return;
        }
        if (!document.hidden && (!lastBoothDraw || nowTs - lastBoothDraw >= 33)) {
          lastBoothDraw = nowTs;
          const nowWall = Date.now();
          boothSceneOpts.timeSec = (nowTs || nowWall) * 0.001;
          boothSceneOpts.nowMs = nowWall;
          boothSceneOpts.barrierState = state.barrierState;
          boothSceneOpts.sirenActive = state.sirenActive;
          boothSceneOpts.uvActive = state.uvActive;
          boothSceneOpts.reactionState = state.reactionState;
          boothSceneOpts.snifferActive = state.vehicleInspected;
          boothSceneOpts.shytomyrRelics = state.shytomyrRelics || [];
          boothSceneOpts.ownedAssets = state.ownedAssets || [];
          boothSceneOpts.lang = state.lang;
          boothSceneOpts.weather = state.weather || "CLEAR";
          boothSceneOpts.weatherCleared = Boolean(state.weatherCleared);
          boothSceneOpts.travelerEnteredAt = state.travelerEnteredAt || 0;
          boothSceneOpts.speechAt = state.speechAt || 0;
          boothSceneOpts.knockVfxAt = state.knockVfxAt || 0;
          boothSceneOpts.coffeeVfxAt = state.coffeeVfxAt || 0;
          boothSceneOpts.dogVfxAt = state.dogVfxAt || 0;
          boothSceneOpts.reduceMotion = false;
          boothSceneOpts.isLive = true;
          drawBoothScene(boothCanvasEl, boothSceneOpts);
          const oblikClk = document.getElementById("oblik-live-clock");
          if (oblikClk && !state.oblikIsScreenshot) {
            oblikClk.textContent = `LIVE ${new Date().toTimeString().slice(0, 8)}`;
          }
        }
        window._boothAnimRaf = requestAnimationFrame(tickBoothAnim);
      }
      boothSceneOpts.timeSec = reducedBooth ? 0 : Date.now() * 0.001;
      drawBoothScene(boothCanvasEl, boothSceneOpts);
      if (!reducedBooth && typeof requestAnimationFrame === "function") {
        window._boothAnimRaf = requestAnimationFrame(tickBoothAnim);
      }

      const miniC = document.getElementById("passport-mini-canvas");
      if (miniC) {
        const miniPrep = prepareHiDpiCanvas(miniC, 60, 60);
        if (miniPrep) drawPortrait(miniPrep.ctx, t.passportPortrait, 30, 58.8, 0.44);
      }

      const qrC = document.getElementById("oblik-qr-canvas");
      if (qrC) {
        const qctx = qrC.getContext("2d");
        qctx.fillStyle = "#FFFFFF";
        qctx.fillRect(0, 0, 64, 64);
        qctx.fillStyle = "#111111";
        // Deterministic pseudo-QR matrix
        const seed = (t.id || "TRV").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
        for (let gy = 0; gy < 8; gy++) {
          for (let gx = 0; gx < 8; gx++) {
            const isCorner = (gx < 2 && gy < 2) || (gx > 5 && gy < 2) || (gx < 2 && gy > 5);
            if (isCorner || ((gx * 7 + gy * 13 + seed) % 3 === 0)) {
              qctx.fillRect(4 + gx * 7, 4 + gy * 7, 6, 6);
            }
          }
        }
      }

      const scanQrBtn = document.getElementById("btn-scan-oblik-qr");
      if (scanQrBtn) {
        let holdTimer = null;
        const finishQrScan = () => {
          if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
          if (state.oblikScanned) return;
          audio.playTap();
          state.oblikScanned = true;
          if (t.violations.some(v => v.code === "INVALID_QR_CODE") && !state.spottedCodes.includes("INVALID_QR_CODE")) {
            state.spottedCodes.push("INVALID_QR_CODE");
            state.interrogated = true;
          }
          render();
        };
        if (scanQrBtn.addEventListener) {
          scanQrBtn.addEventListener("pointerdown", () => {
            const bar = document.getElementById("oblik-scan-bar");
            if (bar) bar.style.width = "100%";
            holdTimer = setTimeout(finishQrScan, 450);
          });
          scanQrBtn.addEventListener("pointerup", finishQrScan);
          scanQrBtn.addEventListener("click", finishQrScan);
        }
      }

      const docPaperEl = document.getElementById("doc-paper-el");
      if (docPaperEl && state.uvActive && docPaperEl.addEventListener) {
        const moveUvLens = (clientX, clientY) => {
          const r = docPaperEl.getBoundingClientRect();
          if (!r || !r.width || !r.height) return;
          const xPct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
          const yPct = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
          docPaperEl.style.setProperty("--uv-x", xPct.toFixed(1) + "%");
          docPaperEl.style.setProperty("--uv-y", yPct.toFixed(1) + "%");
        };
        docPaperEl.addEventListener("pointermove", (ev) => moveUvLens(ev.clientX, ev.clientY));
        docPaperEl.addEventListener("touchmove", (ev) => {
          if (ev.touches && ev.touches[0]) moveUvLens(ev.touches[0].clientX, ev.touches[0].clientY);
        }, { passive: true });
      }

      const deskSection = root.querySelector ? root.querySelector(".desk-area") : null;
      const boothWrapEl = document.getElementById("booth-wrap");
      const inspectHintBar = document.getElementById("inspect-hint-bar");
      const inspectHintText = document.getElementById("inspect-hint-text");
      const interrogateBtn = document.getElementById("btn-interrogate");

      function syncInspectUi() {
        if (deskSection) deskSection.classList.toggle("inspect-mode", !!state.inspectMode);
        if (boothWrapEl && boothWrapEl.parentElement) boothWrapEl.parentElement.classList.toggle("inspect-mode", !!state.inspectMode);
        if (inspectHintBar) inspectHintBar.style.display = state.inspectMode ? "flex" : "none";
        if (interrogateBtn) {
          interrogateBtn.style.background = state.inspectMode ? "#5D1A1A" : "#3E2723";
          interrogateBtn.style.borderColor = state.inspectMode ? "#FF5252" : "#4E5B53";
          interrogateBtn.textContent = state.inspectMode
            ? tr(L("🎯 Скасувати вказування", "🎯 Cancel Pointing"), state.lang)
            : tr(L("🔍 Вказати на помилку", "🔍 Point Out Issue"), state.lang);
        }
      }

      function reportCleanCheck(cleanMsg) {
        if (!state.inspectMode) return;
        audio.playDeny();
        const wrongCost = state.ownedAssets.includes("iphon_17_pro") ? 1 : 2;
        state.shiftSec = Math.max(5, state.shiftSec - wrongCost);
        const timerEl = document.getElementById("hud-timer");
        if (timerEl) {
          timerEl.textContent = `${tr(L("День", "Day"), state.lang)} ${state.daySpec.dayNumber} • ⏱ ${state.shiftSec}s`;
          timerEl.style.color = state.shiftSec < 40 ? "#FF8A80" : "#E0B145";
        }
        if (inspectHintText) inspectHintText.textContent = `${tr(cleanMsg, state.lang)} (-${wrongCost}s)`;
      }

      function reportAlreadySpotted() {
        if (!state.inspectMode) return;
        audio.playApprove();
        if (inspectHintText) inspectHintText.textContent = tr(L("✅ Цю помилку вже зафіксовано! Приймай рішення (✖ ВІДМОВИТИ або 🚨 СБК).", "✅ Issue already spotted! Make your decision (✖ DENY or 🚨 DETAIN)."), state.lang);
      }

      const photoBtn = document.getElementById("btn-passport-photo");
      if (photoBtn) {
        photoBtn.addEventListener("click", () => {
          audio.playTap();
          if (t.violations.some(v => v.code === "PHOTO_MISMATCH")) {
            if (!state.spottedCodes.includes("PHOTO_MISMATCH")) {
              state.spottedCodes.push("PHOTO_MISMATCH");
              state.interrogated = true;
              state.inspectMode = false;
              render();
            } else {
              reportAlreadySpotted();
            }
          } else {
            reportCleanCheck(L("❌ Фото в паспорті відповідає обличчю!", "❌ Passport photo matches!"));
          }
        });
      }

      function handleVehicleOrFaceCheck() {
        if (wKey === "FOG" && !state.weatherCleared && !state.inspectMode) {
          audio.playUvSwitch();
          state.weatherCleared = true;
          render();
          return;
        }
        audio.playTap();
        let foundVisual = false;
        let alreadyHadVisual = false;
        t.violations.forEach(v => {
          if (v.code === "VEHICLE_MISMATCH" || v.code === "PHOTO_MISMATCH") {
            if (!state.spottedCodes.includes(v.code)) {
              state.spottedCodes.push(v.code);
              foundVisual = true;
            } else {
              alreadyHadVisual = true;
            }
          }
        });
        if (foundVisual) {
          state.interrogated = true;
          state.inspectMode = false;
          render();
        } else if (alreadyHadVisual) {
          reportAlreadySpotted();
        } else {
          reportCleanCheck(L("❌ Авто та обличчя відповідають документам!", "❌ Vehicle and face match!"));
        }
      }

      boothWrapEl.addEventListener("click", handleVehicleOrFaceCheck);
      const vehInfoBtn = document.getElementById("booth-vehicle-info");
      if (vehInfoBtn) vehInfoBtn.addEventListener("click", handleVehicleOrFaceCheck);

      const weatherClearBtn = document.getElementById("btn-weather-clear");
      if (weatherClearBtn) {
        weatherClearBtn.addEventListener("click", () => {
          if (wKey === "SNOW") {
            audio.playWipeSnow();
            state.shiftSec = Math.max(5, state.shiftSec - 1);
            state.weatherCleared = true;
          } else {
            audio.playUvSwitch();
            state.weatherCleared = true;
          }
          render();
        });
      }

      const answerPhoneBtn = document.getElementById("btn-answer-phone");
      if (answerPhoneBtn && state.activePhoneCall) {
        answerPhoneBtn.addEventListener("click", () => {
          audio.playTap();
          state.activePhoneCall.answered = true;
          unlockDiscovery("DISC_PHONE_CALL");
          pushShiftLog("#FFD54F", state.activePhoneCall.logLine);
          render();
        });
      }
      const ignorePhoneBtn = document.getElementById("btn-ignore-phone");
      if (ignorePhoneBtn && state.activePhoneCall) {
        ignorePhoneBtn.addEventListener("click", () => {
          audio.playTap();
          state.activePhoneCall.dismissed = true;
          render();
        });
      }

      const foldBtn = document.getElementById("btn-fold-doc");
      if (foldBtn) foldBtn.addEventListener("click", () => { audio.playTap(); state.docFolded = true; render(); });
      document.querySelectorAll(".desk-doc-item").forEach(itemBtn => {
        itemBtn.addEventListener("click", () => {
          audio.playTap();
          const dIdx = Number(itemBtn.getAttribute("data-doc-idx")) || 0;
          state.selectedDocIdx = dIdx;
          if (!state.openedDocIndices) state.openedDocIndices = [];
          if (!state.openedDocIndices.includes(dIdx)) state.openedDocIndices.push(dIdx);
          state.docFolded = false;
          state.justUnfoldedDoc = true;
          render();
        });
      });
      const toggleLogsBtn = document.getElementById("btn-toggle-logs");
      const logsDrawer = document.getElementById("shift-log-drawer");
      if (toggleLogsBtn) toggleLogsBtn.addEventListener("click", () => {
        audio.playTap();
        state.logsExpanded = !state.logsExpanded;
        if (logsDrawer) logsDrawer.style.display = state.logsExpanded ? "flex" : "none";
        toggleLogsBtn.textContent = `${state.logsExpanded ? "▴" : "▾"} ${topLogs.length}`;
      });
      const closeLogsBtn = document.getElementById("btn-close-logs");
      if (closeLogsBtn) closeLogsBtn.addEventListener("click", () => {
        audio.playTap();
        state.logsExpanded = false;
        if (logsDrawer) logsDrawer.style.display = "none";
        if (toggleLogsBtn) toggleLogsBtn.textContent = `▾ ${topLogs.length}`;
      });

      const UV_FIELD_TAGS = {
        EXPIRED_DATE: L("🔦 UV: ВИПРАВЛЕНО ЛЕЗОМ", "🔦 UV: RAZOR-ALTERED"),
        NAME_MISMATCH: L("🔦 UV: ЧУЖЕ ЧОРНИЛО", "🔦 UV: OVERWRITTEN INK"),
        PHOTO_MISMATCH: L("🔦 UV: ПІДКЛЕЄНЕ ФОТО", "🔦 UV: GLUED PHOTO EDGE"),
        FAKE_ISSUER_SEAL: L("🔦 UV: ФАЛЬШИВИЙ ШТАМП", "🔦 UV: FAKE WATERMARK"),
        AGE_RESTRICTION_NO_PERMIT: L("🔦 UV: ПРАВКА ПІДСТАВИ", "🔦 UV: ALTERED BASIS"),
        CHILDREN_AGE_FRAUD: L("🔦 UV: ПЕРЕПИСАНИЙ ВІК", "🔦 UV: ALTERED AGE"),
        GUARDIAN_NO_PASSENGER: L("🔦 UV: КУСТАРНИЙ БЛАНК", "🔦 UV: FAKE FORM TRACE"),
        MISSING_DAILY_DOC: L("🔦 UV: ВІДСУТНІЙ ШТАМП УКАЗУ", "🔦 UV: MISSING DECREE STAMP")
      };

      const fieldsList = document.getElementById("doc-fields-list");
      if (fieldsList) doc.fields.forEach(f => {
        const isSpotted = f.disc && state.spottedCodes.includes(f.disc.code);
        const uvTampered = Boolean(state.uvActive && f.disc && !isSpotted);
        const uvTag = uvTampered ? (UV_FIELD_TAGS[f.disc.code] || L("🔦 UV: ХІМІЧНА ПРАВКА", "🔦 UV: CHEMICAL EDIT")) : null;
        const rowBtn = document.createElement("button");
        rowBtn.type = "button";
        rowBtn.className = "doc-field-row" + (isSpotted ? " spotted" : "") + (uvTampered ? " uv-tampered" : "");
        rowBtn.innerHTML = `
          <span style="color:#4E342E;font-size:12px;font-weight:600;flex:0 0 38%;">${tr(f.label, state.lang)}:</span>
          <span style="color:${isSpotted ? "#C62828" : "#1F1D1A"};font-size:12px;font-weight:700;flex:1;">${tr(f.value, state.lang)}${isSpotted ? " [❗]" : ""}${uvTag ? `<span class="uv-field-badge">${tr(uvTag, state.lang)}</span>` : ""}</span>
        `;
        rowBtn.addEventListener("click", () => {
          audio.playTap();
          if (f.disc) {
            if (!state.spottedCodes.includes(f.disc.code)) {
              state.spottedCodes.push(f.disc.code);
              state.interrogated = true;
              state.inspectMode = false;
              if (state.uvActive) {
                pushShiftLog("#FF4081", L(`🔦 UV: викрито підробку — ${f.disc.title.uk}`, `🔦 UV: spotted forgery — ${f.disc.title.en}`));
              }
              render();
            } else {
              reportAlreadySpotted();
            }
          } else {
            reportCleanCheck(L("❌ У цьому полі все чисто!", "❌ This field is clean!"));
          }
        });
        fieldsList.appendChild(rowBtn);
      });

      const sealBtn = document.getElementById("btn-doc-seal");
      if (sealBtn) sealBtn.addEventListener("click", () => {
        audio.playTap();
        if (doc.sealDisc) {
          if (!state.spottedCodes.includes(doc.sealDisc.code)) {
            state.spottedCodes.push(doc.sealDisc.code);
            state.interrogated = true;
            state.inspectMode = false;
            if (state.uvActive) {
              pushShiftLog("#FF4081", L(`🔦 UV: зафіксовано фальшиву печатку — ${doc.sealDisc.title.uk}`, `🔦 UV: spotted forged seal — ${doc.sealDisc.title.en}`));
            }
            render();
          } else {
            reportAlreadySpotted();
          }
        } else {
          reportCleanCheck(L("❌ Печатка справжня!", "❌ Seal is genuine!"));
        }
      });

      const uvCustomsBtn = document.getElementById("btn-uv-customs-trace");
      if (uvCustomsBtn) {
        uvCustomsBtn.addEventListener("click", () => {
          audio.playApprove();
          state.uvCompartmentRevealed = true;
          const zNames = { TRUNK: L("Багажник", "Trunk"), SPARE: L("Запаска", "Spare"), GLOVE: L("Салон", "Cabin") };
          const zn = zNames[state.dogTargetZone] || L("Багажник", "Trunk");
          pushShiftLog("#76FF03", L(`🧪 UV-відбитки на декларації вказують на «${zn.uk}» (перевірка псом: -1s)!`, `🧪 UV prints on declaration point to '${zn.en}' (dog search: -1s)!`));
          render();
        });
      }

      const uvSecretBtn = document.getElementById("btn-uv-secret-stamp");
      if (uvSecretBtn) {
        uvSecretBtn.addEventListener("click", () => {
          const uvSecret = getUvSecretAward(t);
          if (!uvSecret || state.uvSecretClaimed) return;
          audio.playApprove();
          state.uvSecretClaimed = true;
          if (uvSecret.uah > 0) { state.money += uvSecret.uah; state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + uvSecret.uah; }
          if (uvSecret.usd > 0) { state.usd += uvSecret.usd; state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + uvSecret.usd; }
          if (uvSecret.sbkDelta) state.sbkRep = Math.max(0, Math.min(100, state.sbkRep + uvSecret.sbkDelta));
          if (uvSecret.riskDelta) state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + uvSecret.riskDelta));
          if (uvSecret.palychDelta) state.palychRep = Math.max(0, Math.min(100, state.palychRep + uvSecret.palychDelta));
          if (uvSecret.tolikDelta) state.tolikRep = Math.max(0, Math.min(100, state.tolikRep + uvSecret.tolikDelta));
          if (uvSecret.timeDelta) state.shiftSec = Math.min(340, state.shiftSec + uvSecret.timeDelta);
          const rewUk = [], rewEn = [];
          if (uvSecret.uah > 0) { rewUk.push(`+${uvSecret.uah.toLocaleString("en-US")} 🪙`); rewEn.push(`+${uvSecret.uah.toLocaleString("en-US")} 🪙`); }
          if (uvSecret.usd > 0) { rewUk.push(`+${uvSecret.usd.toLocaleString("en-US")} 💵`); rewEn.push(`+${uvSecret.usd.toLocaleString("en-US")} 💵`); }
          if (uvSecret.sbkDelta) { rewUk.push(`+${uvSecret.sbkDelta} СБК`); rewEn.push(`+${uvSecret.sbkDelta} SBK`); }
          if (uvSecret.riskDelta) { rewUk.push(`${uvSecret.riskDelta}% НАБК`); rewEn.push(`${uvSecret.riskDelta}% NABK`); }
          if (uvSecret.tolikDelta) { rewUk.push(`+${uvSecret.tolikDelta} Толік`); rewEn.push(`+${uvSecret.tolikDelta} Tolik`); }
          if (uvSecret.palychDelta) { rewUk.push(`+${uvSecret.palychDelta} Палич`); rewEn.push(`+${uvSecret.palychDelta} Palych`); }
          if (uvSecret.timeDelta) { rewUk.push(`+${uvSecret.timeDelta}s`); rewEn.push(`+${uvSecret.timeDelta}s`); }
          const sUk = rewUk.length ? ` (${rewUk.join(", ")})` : "";
          const sEn = rewEn.length ? ` (${rewEn.join(", ")})` : "";
          if (uvSecret.uah > 0 || uvSecret.usd > 0) state.hudPopAt = Date.now();
          queueFxBurst([{ text: L("🔦 UV БОНУС!", "🔦 UV BONUS!"), tone: "cyan" }]);
          pushShiftLog("#00E5FF", L(`${uvSecret.logText.uk}${sUk}`, `${uvSecret.logText.en}${sEn}`));
          render();
        });
      }

      // Inspector Reactions Bar Events
      document.getElementById("react-intimidate").addEventListener("click", () => {
        audio.playKnock();
        state.justShook = true;
        state.knockVfxAt = Date.now();
        state.speechAt = Date.now();
        let knockedBribe = false;
        if (!state.intimidateUsed) {
          state.intimidateUsed = true;
          state.reactionState = "INTIMIDATED";
          if (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_CRYO_CONE")) {
            state.shiftSec = Math.min(340, state.shiftSec + 2);
          }
          const isGuilty = !t.shouldBeApproved || (t.violations && t.violations.length > 0) || t.hasContraband;
          if (isGuilty) {
            state.intimidateClueIsWarn = false;
            let shookBribe = false;
            if (t.bribeOffer && !t.bribeOffer.isFriendlyGift && !state.bribeAccepted) {
              state.intimidateBribeBoosted = true;
              state.interrogated = true;
              shookBribe = true;
            } else if (!t.bribeOffer && !state.bribeAccepted && t.storyTag !== "FSM_SPY" && t.storyTag !== "NABK_STING") {
              t.bribeOffer = {
                amount: 1150,
                currency: "UAH",
                reason: L("За мовчання (вибито тиском)", "Hush money (shaken down)"),
                instantOffer: true
              };
              state.intimidateBribeBoosted = true;
              state.interrogated = true;
              shookBribe = true;
            }
            knockedBribe = shookBribe;

            let tellPair;
            const codes = (t.violations || []).map(v => v.code);
            if (t.storyTag === "NABK_STING") {
              tellPair = L("💦 Занервував і машинально прикрив лацкан піджака — схоже на прихований мікрофон/НАБК!", "💦 Nervously covered jacket lapel — possible hidden NABK wire!");
            } else if (t.storyTag === "FSM_SPY" || codes.includes("WANTED_CRIMINAL_OR_SPY")) {
              tellPair = L("💦 Кинув переляканий погляд на довідник розшуку — звір орієнтування СБК!", "💦 Shot a panicked glance at the Wanted board — check SBK alerts!");
            } else if (t.hasContraband || t.storyTag === "DUAL_CITIZEN") {
              tellPair = L("💦 Різко зблід і скосив очі на авто — у машині схованка, пускай пса «Бавовну»!", "💦 Turned pale staring at the car — hidden stash inside, send dog 'Bavovna'!");
            } else if (codes.includes("GUARDIAN_NO_PASSENGER")) {
              tellPair = L("💦 Зам'явся і озирнувся на порожнє сидіння позаду — перевір, чи є підопічний у салоні!", "💦 Stammed looking at the empty back seat — check if disabled passenger is present!");
            } else if (codes.includes("PHOTO_MISMATCH")) {
              tellPair = L("💦 Інстинктивно прикрив пальцем фото в паспорті — звір обличчя!", "💦 Covered passport photo with his thumb — compare the face!");
            } else if (codes.includes("VEHICLE_MISMATCH")) {
              tellPair = L("💦 Смикнувся, коли ти глянув на машину за вікном — звір авто з техпаспортом!", "💦 Flinched when you eyed the car — compare vehicle against registration!");
            } else if (codes.includes("INVALID_QR_CODE")) {
              tellPair = L("💦 Квапливо притишив екран телефону з «Облік+» — обов'язково відскануй QR!", "💦 Quickly dimmed Oblik+ phone screen — scan that QR code!");
            } else if (codes.includes("FAKE_ISSUER_SEAL")) {
              tellPair = L("💦 Тремтячою рукою поправив печатку внизу бланка — перевір штамп!", "💦 Adjusted the bottom document seal with trembling hands — inspect the stamp!");
            } else {
              tellPair = L("💦 Почав плутатися в датах, ПІБ та підставах — проклікай рядки документа!", "💦 Started stammering over dates, name & permit — inspect the text fields!");
            }
            const bribeSuffixUk = shookBribe ? " 💸 З переляку витяг/доклав +30% у конверт!" : "";
            const bribeSuffixEn = shookBribe ? " 💸 Panicked & added +30% to the envelope!" : "";
            state.intimidateClueMsg = L(tellPair.uk + bribeSuffixUk, tellPair.en + bribeSuffixEn);
            pushShiftLog("#FFE082", L(`📢 Нагримав: ${state.intimidateClueMsg.uk}`, `📢 Knock: ${state.intimidateClueMsg.en}`));
          } else {
            state.intimidateClueIsWarn = true;
            t.coffeeTip = 0;
            state.coffeeTipGiven = true;
            state.palychRep = Math.max(0, state.palychRep - 3);
            state.intimidateClueMsg = L(
              "😡 Чесний громадянин образився на крик! Чайові за каву скасовано, Паличу пішла скарга (-3 Палич).",
              "😡 Honest traveler offended by yelling! Coffee tip canceled & Palych got a complaint (-3 Palych)."
            );
            pushShiftLog("#FF8A80", L(`📢 ${state.intimidateClueMsg.uk}`, `📢 ${state.intimidateClueMsg.en}`));
          }
        }
        if (knockedBribe) {
          queueFxBurst([{ text: L("💸 +30% ВИБИТО!", "💸 +30% SHAKEN!"), tone: "gold" }]);
        }
        render();
      });

      document.getElementById("react-coffee").addEventListener("click", () => {
        audio.playCoffee();
        state.coffeeVfxAt = Date.now();
        state.speechAt = Date.now();
        const firstCoffee = state.reactionState !== "COFFEE_GIVEN";
        state.reactionState = "COFFEE_GIVEN";
        if (firstCoffee && state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_GOLD_DERUN")) {
          state.shiftSec = Math.min(340, state.shiftSec + 2);
        }
        if (t.shouldBeApproved && !state.coffeeTipGiven) {
          state.familyMorale = Math.min(100, state.familyMorale + 2);
          if (t.storyTag === "INTEL_ALLY") state.sbkRep = Math.min(100, state.sbkRep + 3);
        }
        if (!state.coffeeTipGiven && t.coffeeTip > 0) {
          state.coffeeTipGiven = true;
          const meta = getMetaPerkFlags();
          const has = id => state.ownedAssets.includes(id);
          const weatherCoffeeMult = wKey === "SNOW" ? 1.50 : (wKey === "RAIN" ? 1.30 : 1.0);
          const cMult = (state.sandboxMod ? (state.sandboxMod.coffeeMult || 1) : 1) * (has("balenci_jacket") ? 1.35 : 1) * weatherCoffeeMult;
          const sockTip = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_KEVLAR_SOCKS")) ? 100 : 0;
          const tip = Math.round(t.coffeeTip * 2 * cMult) + (has("thermos_tray") ? 80 : 0) + (has("espresso_machine") ? 150 : 0) + (has("parrot_kesha") ? 150 : 0) + (has("addon_syrup_bar") ? 120 : 0) + (has("addon_gold_cage") ? 100 : 0) + sockTip + (meta.coffeeTipBonus * 2);
          state.money += tip;
          state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + tip;
          state.hudPopAt = Date.now();
          queueFxBurst([{ text: `+${tip} 🪙 ☕`, tone: "gold" }]);
          state.lastFeedback = {
            ok: true,
            title: L("☕ ЧАЙОВІ НА КАВУ", "☕ COFFEE TIP"),
            detail: L(`${t.fullName.uk} подякував за теплий прийом`, `${t.fullName.en} appreciated your hospitality`),
            moneyDelta: tip
          };
        }
        render();
      });

      document.getElementById("react-uv").addEventListener("click", () => {
        audio.playUvSwitch();
        state.uvActive = !state.uvActive;
        if (state.uvActive && wKey === "FOG" && !state.weatherCleared) {
          state.weatherCleared = true;
        }
        render();
      });

      document.getElementById("react-dog").addEventListener("click", () => {
        audio.playDogSniff();
        state.dogVfxAt = Date.now();
        if (state.ownedAssets.includes("uv_endoscope")) {
          state.shiftSec = Math.max(5, state.shiftSec - dogSecCost);
          state.trunkPanelOpen = false;
          state.vehicleInspected = true;
          state.zoneCheckMsg = null;
          if (t.hasContraband && !state.spottedCodes.includes("CONTRABAND_CARGO")) state.spottedCodes.push("CONTRABAND_CARGO");
          if (t.storyTag === "DUAL_CITIZEN" && !state.spottedCodes.includes("DUAL_CITIZENSHIP")) state.spottedCodes.push("DUAL_CITIZENSHIP");
          if (t.violations.some(v => v.code === "VEHICLE_MISMATCH") && !state.spottedCodes.includes("VEHICLE_MISMATCH")) {
            state.spottedCodes.push("VEHICLE_MISMATCH");
          }
          pushShiftLog(t.hasContraband ? "#EF5350" : "#81C784", L(`🩻🐕 ${t.vehicleSearchResult.uk}`, `🩻🐕 ${t.vehicleSearchResult.en}`));
        } else {
          state.trunkPanelOpen = true;
        }
        render();
      });

      document.querySelectorAll(".trunk-zone-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const zone = btn.getAttribute("data-zone");
          const hasEndoscope = state.ownedAssets.includes("uv_endoscope");
          const isUvZoneHit = Boolean(state.uvCompartmentRevealed && state.dogTargetZone === zone);
          audio.playDogSniff();
          state.dogVfxAt = Date.now();
          if (!state.checkedZones) state.checkedZones = [];
          if (!state.checkedZones.includes(zone)) state.checkedZones.push(zone);
          const stepSec = (hasEndoscope || isUvZoneHit) ? 1 : 2;
          if (stepSec > 0) state.shiftSec = Math.max(5, state.shiftSec - stepSec);

          if (state.dogTargetZone && state.dogTargetZone === zone) {
            state.trunkPanelOpen = false;
            state.vehicleInspected = true;
            state.zoneCheckMsg = null;
            if (t.hasContraband && !state.spottedCodes.includes("CONTRABAND_CARGO")) state.spottedCodes.push("CONTRABAND_CARGO");
            if (t.storyTag === "DUAL_CITIZEN" && !state.spottedCodes.includes("DUAL_CITIZENSHIP")) state.spottedCodes.push("DUAL_CITIZENSHIP");
            if (t.violations.some(v => v.code === "VEHICLE_MISMATCH") && !state.spottedCodes.includes("VEHICLE_MISMATCH")) {
              state.spottedCodes.push("VEHICLE_MISMATCH");
            }
            pushShiftLog(t.hasContraband ? "#EF5350" : "#81C784", L(`🐕 ${t.vehicleSearchResult.uk}`, `🐕 ${t.vehicleSearchResult.en}`));
          } else if (state.dogTargetZone) {
            state.zoneCheckMsg = L("Пусто! Тут лише особисті речі — перевір інший відсік.", "Empty! Only personal items — check another compartment.");
          } else if (state.checkedZones.length >= 3) {
            state.trunkPanelOpen = false;
            state.vehicleInspected = true;
            state.zoneCheckMsg = null;
            if (t.violations.some(v => v.code === "VEHICLE_MISMATCH") && !state.spottedCodes.includes("VEHICLE_MISMATCH")) {
              state.spottedCodes.push("VEHICLE_MISMATCH");
            }
            pushShiftLog("#81C784", L(`🐕 ${t.vehicleSearchResult.uk}`, `🐕 ${t.vehicleSearchResult.en}`));
          } else {
            state.zoneCheckMsg = L("Пусто! Схованки тут немає — можеш перевірити інший відсік або завершити.", "Empty here! Check another compartment or finish search.");
          }
          render();
        });
      });

      const finishDogBtn = document.getElementById("btn-finish-dog-search");
      if (finishDogBtn) {
        finishDogBtn.addEventListener("click", () => {
          audio.playTap();
          state.trunkPanelOpen = false;
          state.vehicleInspected = true;
          state.zoneCheckMsg = null;
          if (t.violations.some(v => v.code === "VEHICLE_MISMATCH") && !state.spottedCodes.includes("VEHICLE_MISMATCH")) {
            state.spottedCodes.push("VEHICLE_MISMATCH");
          }
          pushShiftLog("#81C784", L(`🐕 Огляд авто завершено: ${t.vehicleSearchResult.uk}`, `🐕 Vehicle search finished: ${t.vehicleSearchResult.en}`));
          render();
        });
      }

      document.getElementById("hud-music").addEventListener("click", () => { audio.ensureCtx(); audio.musicEnabled = !audio.musicEnabled; render(); });
      document.getElementById("hud-wanted").addEventListener("click", () => { audio.playTap(); openWantedDossierModal(); });
      document.getElementById("hud-rules").addEventListener("click", () => { audio.playTap(); openRulesModal(); });
      interrogateBtn.addEventListener("click", () => {
        audio.playTap();
        state.inspectMode = !state.inspectMode;
        if (inspectHintText) {
          inspectHintText.textContent = `🎯 ${tr(L("Тисни на помилку: дату, ПІБ, фото, печатку або опис/вигляд авто!", "Click the issue: date, name, photo, seal, or vehicle!"), state.lang)}`;
        }
        syncInspectUi();
      });

      const bribeBtn = document.getElementById("btn-take-bribe");
      if (bribeBtn && bribeInfo) {
        bribeBtn.addEventListener("click", () => {
          audio.playBribe();
          state.bribeAccepted = true;
          if (t.bribeOffer.isFriendlyGift) {
            state.money += bribeInfo.amount;
            state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + bribeInfo.amount;
            state.familyMorale = Math.min(100, state.familyMorale + 5);
            pushShiftLog("#81C784", L(`🤝 Земляцький підгін з м. Шитомир: +${bribeInfo.amount} 🪙 на каву (0% НАБК)!`, `🤝 Shytomyr friendly gift: +${bribeInfo.amount} 🪙 for coffee (0% NABK)!`));
          } else {
            state.shiftCombo = 0;
            state.shiftBribesCount = (state.shiftBribesCount || 0) + 1;
            const bribeUahEq = bribeInfo.currency === "USD" ? bribeInfo.amount * USD_UAH_RATE : bribeInfo.amount;
            if (bribeInfo.currency === "USD") {
              state.usd += bribeInfo.amount;
            } else {
              state.money += bribeInfo.amount;
            }
            state.shiftBribesTotal = (state.shiftBribesTotal || 0) + bribeUahEq;
            state.totalCareerBribes = (state.totalCareerBribes || 0) + bribeUahEq;
            const baseJump = (t.bribeOffer.nabkRiskJump || (t.bribeOffer.isStingTrap ? 35 : (t.bribeOffer.syndicateFavor ? 6 : 8))) + (state.haggleExtraRisk || 0);
            let riskJump = state.underSurveillance ? Math.round(baseJump * 1.5) : baseJump;
            if (state.ownedAssets.includes("addon_osint_app")) riskJump = Math.max(2, Math.round(riskJump * 0.8));
            state.nabkRisk = Math.min(100, state.nabkRisk + riskJump);
          }
          if (t.bribeOffer.syndicateFavor) state.tolikRep = Math.min(100, state.tolikRep + 20);
          state.hudPopAt = Date.now();
          queueFxBurst([{ text: `+${bribeInfo.display}`, tone: t.bribeOffer.isFriendlyGift ? "gold" : "usd" }]);
          render();
        });
      }

      const haggleBtn = document.getElementById("btn-haggle-bribe");
      if (haggleBtn && bribeInfo && t.bribeOffer && !t.bribeOffer.isFriendlyGift && state.haggleState === "NONE") {
        haggleBtn.addEventListener("click", () => {
          if (t.storyTag === "NABK_STING" || t.bribeOffer.isStingTrap) {
            state.haggleState = "FAILED";
            state.offeredBribeBeforeHaggleFail = true;
            state.nabkRisk = Math.min(100, state.nabkRisk + 12);
            audio.playHaggleFail();
            triggerHaptic([45, 30, 45]);
            queueFxBurst([{ text: L("🚨 ПАСТКА +12%", "🚨 TRAP +12%"), tone: "red" }]);
            pushShiftLog("#FF5252", L("🚨 ПАСТКА НАБК! Під час торгу зафіксовано вимагання (+12% НАБК)!", "🚨 NABK TRAP! Shakedown demand caught on wire (+12% NABK)!"));
            render();
            return;
          }
          const has = id => state.ownedAssets.includes(id);
          const winChance = Math.max(0.35, Math.min(0.85,
            0.62 + (has("balenci_jacket") ? 0.08 : 0) + (has("customs_seal_ring") ? 0.08 : 0) + (state.intimidateUsed ? 0.06 : 0) - (state.nabkRisk >= 60 ? 0.10 : 0)
          ));
          if (Math.random() < winChance) {
            state.haggleState = "WON";
            state.haggleMult = 1.30 + Math.floor(Math.random() * 16) / 100;
            state.haggleExtraRisk = 4;
            state.nabkRisk = Math.min(100, state.nabkRisk + 2);
            audio.playHaggleWin();
            triggerHaptic([18, 18, 28]);
            unlockDiscovery("DISC_HAGGLE_PRO");
            const pct = Math.round((state.haggleMult - 1) * 100);
            queueFxBurst([{ text: `📈 +${pct}%!`, tone: "combo" }]);
            pushShiftLog("#FFB300", L(`📈 Торг вдався! Конверт зріс на +${pct}% (+2% НАБК).`, `📈 Haggle won! Bribe raised +${pct}% (+2% NABK).`));
          } else {
            state.haggleState = "FAILED";
            state.offeredBribeBeforeHaggleFail = true;
            state.nabkRisk = Math.min(100, state.nabkRisk + 3);
            audio.playHaggleFail();
            triggerHaptic([40, 25, 40]);
            queueFxBurst([{ text: L("😤 СХОВАВ!", "😤 PULLED!"), tone: "red" }]);
            pushShiftLog("#FFAB91", L("😤 Водій сховав конверт після торгу (+3% НАБК)! Можна 🚨 Затримати.", "😤 Driver pulled cash back after haggle (+3% NABK)! Can still 🚨 Detain."));
          }
          render();
        });
      }

      document.getElementById("stamp-approve").addEventListener("click", () => { audio.playApprove(); makeDecision("APPROVE"); });
      document.getElementById("stamp-deny").addEventListener("click", () => { audio.playDeny(); makeDecision("DENY"); });
      document.getElementById("stamp-detain").addEventListener("click", () => { audio.playDetain(); makeDecision("DETAIN"); });
      return;
    }

    if (state.phase === "SHIFT_SUMMARY") {
      const hasShiftBribes = (state.shiftBribesCount || 0) > 0 || state.shiftBribesTotal > 0;
      const cutUsd = hasShiftBribes ? getEffectiveBossCut() : 0;
      const cutUahFallback = Math.round(cutUsd * USD_UAH_RATE * 1.1);
      const salary = state.shiftSalaryEarned || 0;
      const bounties = state.shiftBountiesEarned || 0;
      const extras = state.shiftExtrasEarned || 0;
      const earnedUsd = state.shiftEarnedUsd || 0;
      const grade = state.shiftGrade || "B";
      const survAlert = state.underSurveillance || state.nabkRisk >= 75;
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <h1 style="color:#E0B145;font-size:20px;">${tr(L(`ЗМІНУ ЗАВЕРШЕНО • ДЕНЬ ${state.daySpec.dayNumber}`, `SHIFT COMPLETE • DAY ${state.daySpec.dayNumber}`), state.lang)}</h1>
            <div class="shift-grade-badge grade-${grade}">${tr(L("РАНГ", "GRADE"), state.lang)}: ${grade}</div>
          </div>
          ${survAlert ? `
            <div style="background:#3A1216;border:1.5px solid #FF5252;border-radius:6px;padding:7px 9px;font-size:11.5px;color:#FFCDD2;font-weight:700;">
              👁️ ${tr(L(`УВАГА: Активний нагляд НАБК (${state.nabkRisk}%)! Хабарі вкрай небезпечні — зачистьте хвости ввечері або проведіть чисту зміну!`, `ALERT: Active NABK Surveillance (${state.nabkRisk}%)! Scrub audit tails tonight or work clean!`), state.lang)}
            </div>
          ` : ""}
          <section class="card-slate" style="display:flex;flex-direction:column;gap:5px;font-size:13px;">
            <div>${tr(L("Оформлено мандрівників", "Travelers Processed"), state.lang)}: <strong>${state.shiftProcessed}</strong>${(state.shiftBestCombo || 0) >= 3 ? ` • <span style="color:#FFB300;font-weight:800;">🔥 ${tr(L("Макс. серія", "Best Streak"), state.lang)}: ${state.shiftBestCombo}</span>` : ""}</div>
            <div style="color:#81C784;">${tr(L("Зарплата за правильні рішення", "Base Salary (Correct)"), state.lang)}: <strong>${state.shiftCorrect} (+${salary.toLocaleString("en-US")} 🪙)</strong></div>
            <div style="color:#64B5F6;">${tr(L("Премії СБК / ВСП за арешти", "SBK / VSP Detention Bounties"), state.lang)}: <strong>${state.shiftDetained} (+${bounties.toLocaleString("en-US")} 🪙${earnedUsd > 0 ? ` • +${earnedUsd.toLocaleString("en-US")} 💵` : ""})</strong></div>
            <div style="color:#FFE082;">${tr(L("Кава, УФ-шифри та бонус рангу", "Coffee, UV & Rank Bonus"), state.lang)}: <strong>+${extras.toLocaleString("en-US")} 🪙</strong>${state.shiftGradeBonus > 0 ? ` (${tr(L("Ідеальна зміна", "Perfect Shift"), state.lang)} +${state.shiftGradeBonus} 🪙!)` : ""}</div>
            <div style="color:#FF8A80;">${tr(L("Штрафи за помилки", "Protocol Fines"), state.lang)}: <strong>-${(state.shiftFinesTotal || 0).toLocaleString("en-US")} 🪙</strong></div>
            ${hasShiftBribes ? `<div style="color:#E0B145;">${tr(L("Брудні конверти", "Bribe Envelopes"), state.lang)}: <strong>${state.shiftBribesCount || 1} (+${state.shiftBribesTotal.toLocaleString("en-US")} 🪙 ${tr(L("екв.", "eq."), state.lang)})</strong></div>` : `<div style="color:#A5D6A7;">🛡️ ${tr(L("Чиста зміна: 0 брудних хабарів!", "Clean Shift: 0 dirty bribes!"), state.lang)}</div>`}
            <hr style="border:none;border-top:1px solid #555;margin:3px 0;">
            <div style="color:#E0B145;font-size:15.5px;font-weight:800;">${tr(L("У гаманці зараз", "Current Cash"), state.lang)}: ${state.money.toLocaleString("en-US")} 🪙 • <span style="color:#81C784;">${state.usd.toLocaleString("en-US")} 💵</span></div>
          </section>
          <section class="card-slate" style="background:#33291F;">
            <h2 style="color:#E0B145;font-size:15px;margin-bottom:5px;">${tr(hasShiftBribes ? L("🧢 ПАЛ ПАЛИЧ ЧЕКАЄ НА «ЧАСТКУ» (У 💵)", "🧢 PAL PALYCH EXPECTS HIS CUT (IN 💵)") : L("🧢 ПАЛ ПАЛИЧ: «Сьогодні без конвертів?»", "🧢 PAL PALYCH: 'Clean shift today?'"), state.lang)}</h2>
            <p style="font-size:12.5px;line-height:1.4;">${hasShiftBribes
              ? tr(L(
                  `«Поклади ${cutUsd} 💵 у шухляду — і я прикрию твої грішки перед штабом та НАБК!» ${state.ownedAssets.includes("rolex_watch") ? "(Знижка -50% завдяки твоєму золотому «Кролексу»!)" : ""}`,
                  `'Put ${cutUsd} 💵 in my drawer and I'll cover your slip-ups!' ${state.ownedAssets.includes("rolex_watch") ? "(50% discount from your Gold Krolex!)" : ""}`
                ), state.lang)
              : tr(L(
                  state.shiftMistakes === 0
                    ? "«Зразкова чиста зміна, інспекторе! Питань не маю, занось журнал та відпочивай!»"
                    : "«Конвертів сьогодні не брав, тож частки не вимагаю. Іди додому, але стеж за протоколами!»",
                  state.shiftMistakes === 0
                    ? "'Spotless clean shift, inspector! No cut needed, file the log and get some rest!'"
                    : "'No envelopes taken today, so I won't demand a cut. Go rest, just watch those protocols!'"
                ), state.lang)
            }</p>
          </section>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${hasShiftBribes ? `
            <button type="button" id="btn-pay-palych" class="btn-primary-green" ${state.usd < cutUsd ? "disabled" : ""}>${tr(L(`Занести Паличу ${cutUsd.toLocaleString("en-US")} 💵 (-8% НАБК, +12 Палич)`, `Pay Palych ${cutUsd.toLocaleString("en-US")} 💵 (-8% NABK, +12 Palych)`), state.lang)}</button>
            ${state.usd < cutUsd ? `<button type="button" id="btn-pay-palych-uah" class="btn-mustard" ${state.money < cutUahFallback ? "disabled" : ""} style="padding:11px;font-size:13px;">${tr(L(`Відкупитися гримниками ${cutUahFallback.toLocaleString("en-US")} 🪙 (з комісією +10%)`, `Pay in Hrymnyky ${cutUahFallback.toLocaleString("en-US")} 🪙 (+10% fee)`), state.lang)}</button>` : ""}
            <button type="button" id="btn-refuse-palych" class="btn-outline" style="width:100%;padding:12px;color:#FF8A80;border-color:#FF8A80;">${tr(L("Не платити Паличу (Ризик догани / нагляду!)", "Refuse Palych (Risk reprimand / surveillance!)"), state.lang)}</button>
          ` : `
            <button type="button" id="btn-refuse-palych" class="btn-primary-green">${tr(L("Завершити зміну (хабарів не брав) →", "Finish Shift (No Bribes) →"), state.lang)}</button>
          `}
        </div>
      `;
      const payPalychBtn = document.getElementById("btn-pay-palych");
      if (payPalychBtn) {
        payPalychBtn.addEventListener("click", () => {
          if (state.usd < cutUsd) return;
          audio.playBribe();
          state.usd -= cutUsd;
          state.palychRep = Math.min(100, state.palychRep + 12);
          state.nabkRisk = Math.max(0, state.nabkRisk - 8);
          state.purchasedExpensesToday = [];
          state.phase = "HOME_EVENING";
          saveStateToStorage();
          render();
        });
      }
      const payPalychUahBtn = document.getElementById("btn-pay-palych-uah");
      if (payPalychUahBtn) {
        payPalychUahBtn.addEventListener("click", () => {
          if (state.money < cutUahFallback) return;
          audio.playBribe();
          state.money -= cutUahFallback;
          state.palychRep = Math.min(100, state.palychRep + 10);
          state.nabkRisk = Math.max(0, state.nabkRisk - 6);
          state.purchasedExpensesToday = [];
          state.phase = "HOME_EVENING";
          saveStateToStorage();
          render();
        });
      }
      document.getElementById("btn-refuse-palych").addEventListener("click", () => {
        if (hasShiftBribes || state.shiftMistakes >= 5) {
          audio.playDeny();
          state.palychRep = Math.max(0, state.palychRep - (hasShiftBribes ? 15 : 8));
          state.nabkRisk = Math.min(100, state.nabkRisk + (hasShiftBribes ? 12 : 4));
          if (!state.isUndercoverSbkAgent || state.nabkRisk >= 60) {
            state.reprimands = (state.reprimands || 0) + 1;
            state.gotReprimandToday = true;
            state.underSurveillance = true;
            if (state.reprimands >= 3) {
              triggerEnding("WRITTEN_OFF_RESERVE");
              return;
            }
          }
        } else {
          audio.playApprove();
          if (state.shiftMistakes === 0 && state.shiftProcessed >= 5) {
            state.palychRep = Math.min(100, state.palychRep + 3);
          }
        }
        state.purchasedExpensesToday = [];
        state.phase = "HOME_EVENING";
        saveStateToStorage();
        render();
      });
      return;
    }

    if (state.phase === "HOME_EVENING") {
      const rent = getPassiveRent();
      const rentUsd = getPassiveUsd();
      const rk = getRank();
      const canRetire = state.isSandbox && state.daySpec.dayNumber >= 5;

      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <h1 style="color:#E0B145;font-size:20px;">${tr(L(`🌙 ВЕЧІР УДОМА (Після Дня ${state.daySpec.dayNumber})`, `🌙 EVENING AT HOME (After Day ${state.daySpec.dayNumber})`), state.lang)}</h1>
          <div style="border-radius:8px;overflow:hidden;border:1px solid #354039;background:#0D1318;">
            <canvas id="evening-canvas" width="420" height="88" style="width:100%;height:auto;display:block;"></canvas>
          </div>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:4px;font-size:13px;">
            <div style="display:flex;flex-direction:column;gap:2px;font-size:15px;font-weight:800;">
              <div style="color:#E0B145;">🪙 ${tr(L("Гримники", "Hrymnyky"), state.lang)}: ${state.money.toLocaleString("en-US")} 🪙</div>
              <div style="color:#81C784;">💵 ${tr(L("Баксіки", "Baksiky"), state.lang)}: ${state.usd.toLocaleString("en-US")} 💵</div>
            </div>
            ${(() => {
              const dir = state.exchDir || "USD_TO_UAH";
              const hasBiz = state.ownedAssets.includes("shawarma_kiosk") || state.ownedAssets.includes("cyprus_offshore");
              const capToday = DAILY_OBNAL_LIMIT_USD
                + (state.ownedAssets.includes("shawarma_kiosk") ? 4000 : 0)
                + (state.ownedAssets.includes("cyprus_offshore") ? 5000 : 0)
                + (state.ownedAssets.includes("addon_osint_app") ? 3000 : 0)
                + ((state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_404_FLOPPY")) ? 300 : 0);
              const launderFee = Math.max(0.05, (hasBiz ? 0.10 : 0.18) - (state.ownedAssets.includes("iphon_17_pro") ? 0.03 : 0));
              const feePct = Math.round(launderFee * 100);
              const remObnal = Math.max(0, capToday - (state.obnalUsedToday || 0));
              const maxUsd = dir === "USD_TO_UAH"
                ? Math.min(state.usd, remObnal)
                : Math.floor(state.money / USD_UAH_RATE);
              const step = maxUsd >= 500 ? 100 : (maxUsd >= 100 ? 50 : 10);
              const initVal = maxUsd > 0 ? Math.min(maxUsd, Math.max(step, Math.floor(maxUsd / 2 / step) * step || maxUsd)) : 0;
              const initUahOut = Math.round(Math.max(10, initVal) * USD_UAH_RATE * (1 - launderFee));
              return `
                <div style="background:rgba(0,0,0,0.22);border:1px solid #455A64;border-radius:6px;padding:7px;margin:3px 0;display:flex;flex-direction:column;gap:5px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                    <span style="font-size:11px;font-weight:800;color:#FFE082;">
                      ${dir === "USD_TO_UAH"
                        ? tr(L(`🧼 Відмивання 💵→🪙 (-${feePct}% комісія • Ліміт: ${remObnal.toLocaleString("en-US")}/${capToday.toLocaleString("en-US")} 💵)`, `🧼 Launder 💵→🪙 (-${feePct}% fee • Cap: ${remObnal.toLocaleString("en-US")}/${capToday.toLocaleString("en-US")} 💵)`), state.lang)
                        : tr(L("💱 Купити 💵 за 🪙 (Курс 41 🪙)", "💱 Buy 💵 with 🪙 (Rate 41 🪙)"), state.lang)}
                    </span>
                    <button type="button" id="btn-exch-flip" class="btn-outline" style="padding:2px 7px;font-size:10.5px;">⇄ ${dir === "USD_TO_UAH" ? "🪙→💵" : "💵→🪙"}</button>
                  </div>
                  ${maxUsd >= 10 ? `
                    <input type="range" id="exch-slider" min="10" max="${maxUsd}" step="${maxUsd >= 500 ? 100 : (maxUsd >= 50 ? 10 : 1)}" value="${Math.max(10, initVal)}" style="width:100%;accent-color:#E0B145;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                      <span id="exch-preview" style="font-size:11.5px;font-weight:700;color:#81C784;">
                        ${dir === "USD_TO_UAH" ? `${Math.max(10, initVal).toLocaleString("en-US")} 💵 → +${initUahOut.toLocaleString("en-US")} 🪙 (-${feePct}%)` : `${(Math.max(10, initVal) * USD_UAH_RATE).toLocaleString("en-US")} 🪙 → +${Math.max(10, initVal).toLocaleString("en-US")} 💵`}
                      </span>
                      <button type="button" id="btn-do-exchange" class="btn-mustard" style="padding:4px 10px;font-size:11px;">${dir === "USD_TO_UAH" ? tr(L("Відмити", "Launder"), state.lang) : tr(L("Купити 💵", "Buy 💵"), state.lang)}</button>
                    </div>
                  ` : `<div style="font-size:11px;color:#B0BEC5;">${dir === "USD_TO_UAH" ? (remObnal <= 0 ? tr(L("Денний ліміт відмивання вичерпано!", "Daily laundering cap reached!"), state.lang) : tr(L("Недостатньо 💵 (мін. 10 💵)", "Need at least 10 💵"), state.lang)) : tr(L("Недостатньо 🪙 (мін. 410 🪙)", "Need at least 410 🪙"), state.lang)}</div>`}
                </div>
              `;
            })()}
            ${(rent > 0 || rentUsd > 0) ? `<div style="color:#81C784;font-weight:700;">🏢 ${tr(L("Пасивний дохід та оклад СБК", "Passive & Covert Income"), state.lang)}: ${rent > 0 ? `+${rent.toLocaleString("en-US")} 🪙` : ""}${rentUsd > 0 ? ` +${rentUsd.toLocaleString("en-US")} 💵` : ""}/${tr(L("ранок", "morning"), state.lang)}</div>` : ""}
            <div style="color:#64B5F6;font-weight:700;">🎖️ ${tr(rk.title, state.lang)}${state.isUndercoverSbkAgent ? ` (${tr(L("Спіймано агентури", "Operatives caught"), state.lang)}: ${state.spiesCaughtAsAgent}/4)` : ""}</div>
            <div>🏠 ${tr(L("Настрій сім'ї", "Family Morale"), state.lang)}: ${state.familyMorale}% | 🕵️ НАБК: <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#FFF"};">${state.nabkRisk}%</span> | СБК: ${state.sbkRep}</div>
            <div style="color:#E0B145;font-weight:700;">🚐 ${tr(L("Фонд утечі", "Escape Fund"), state.lang)}: ${state.escapeFund.toLocaleString("en-US")} / ${getEscapeTarget().toLocaleString("en-US")} 💵 (${tr(L("Толік", "Tolik"), state.lang)}: ${state.tolikRep}/${getEscapeTolikRep()})</div>
          </section>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
            <button type="button" id="tab-home-0" class="${state.eveningTab === 0 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11.5px;">🏠 ${tr(L("Справи", "Choices"), state.lang)}</button>
            <button type="button" id="tab-home-2" class="${state.eveningTab === 2 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11.5px;">🤝 ${tr(L("Підкуп", "Bribes"), state.lang)}</button>
            <button type="button" id="tab-home-1" class="${state.eveningTab === 1 ? "btn-mustard" : "btn-secondary"}" style="padding:8px 4px;font-size:11.5px;">💎 ${tr(L(`Магазин (${ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).length}/${ASSET_UPGRADES.length})`, `Shop (${ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).length}/${ASSET_UPGRADES.length})`), state.lang)}</button>
          </div>

          <div id="evening-items-list" class="evening-scroll-list"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${canRetire ? `<button type="button" id="btn-retire-career" class="btn-outline" style="width:100%;padding:10px;">${tr(L("📜 ПІТИ У ВІДСТАВКУ ТА ПІДБИТИ ПІДСУМКИ КАР'ЄРИ", "📜 RETIRE & VIEW PERSONAL EPILOGUE"), state.lang)}</button>` : ""}
          <button type="button" id="btn-next-day" class="btn-primary-green">${tr(L("ЛЯГАТИ СПАТИ (ЗБЕРЕГТИ КЕШ) →", "SLEEP (KEEP REMAINING CASH) →"), state.lang)}</button>
        </div>
      `;

      document.getElementById("tab-home-0").addEventListener("click", () => { audio.playTap(); state.eveningTab = 0; render(); });
      document.getElementById("tab-home-1").addEventListener("click", () => { audio.playTap(); state.eveningTab = 1; render(); });
      document.getElementById("tab-home-2").addEventListener("click", () => { audio.playTap(); state.eveningTab = 2; render(); });
      document.getElementById("btn-exch-flip").addEventListener("click", () => {
        audio.playTap();
        state.exchDir = (state.exchDir === "UAH_TO_USD") ? "USD_TO_UAH" : "UAH_TO_USD";
        render();
      });
      const sliderEl = document.getElementById("exch-slider");
      const previewEl = document.getElementById("exch-preview");
      const doExchBtn = document.getElementById("btn-do-exchange");
      if (sliderEl && previewEl && doExchBtn) {
        const hasBiz = state.ownedAssets.includes("shawarma_kiosk") || state.ownedAssets.includes("cyprus_offshore");
        const capToday = DAILY_OBNAL_LIMIT_USD
          + (state.ownedAssets.includes("shawarma_kiosk") ? 4000 : 0)
          + (state.ownedAssets.includes("cyprus_offshore") ? 5000 : 0)
          + (state.ownedAssets.includes("addon_osint_app") ? 3000 : 0)
          + ((state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_404_FLOPPY")) ? 300 : 0);
        const launderFee = Math.max(0.05, (hasBiz ? 0.10 : 0.18) - (state.ownedAssets.includes("iphon_17_pro") ? 0.03 : 0));
        const feePct = Math.round(launderFee * 100);
        sliderEl.addEventListener("input", () => {
          const val = Number(sliderEl.value) || 0;
          const dir = state.exchDir || "USD_TO_UAH";
          previewEl.textContent = dir === "USD_TO_UAH"
            ? `${val.toLocaleString("en-US")} 💵 → +${Math.round(val * USD_UAH_RATE * (1 - launderFee)).toLocaleString("en-US")} 🪙 (-${feePct}%)`
            : `${(val * USD_UAH_RATE).toLocaleString("en-US")} 🪙 → +${val.toLocaleString("en-US")} 💵`;
        });
        doExchBtn.addEventListener("click", () => {
          const val = Number(sliderEl.value) || 0;
          if (val <= 0) return;
          const dir = state.exchDir || "USD_TO_UAH";
          if (dir === "USD_TO_UAH") {
            const rem = Math.max(0, capToday - (state.obnalUsedToday || 0));
            const take = Math.min(val, state.usd, rem);
            if (take > 0) {
              audio.playBribe();
              state.usd -= take;
              state.money += Math.round(take * USD_UAH_RATE * (1 - launderFee));
              state.obnalUsedToday = (state.obnalUsedToday || 0) + take;
              if (take >= 5000) state.nabkRisk = Math.min(100, state.nabkRisk + 3);
            }
          } else {
            const costUah = val * USD_UAH_RATE;
            if (state.money >= costUah) {
              audio.playBribe();
              state.money -= costUah;
              state.usd += val;
            }
          }
          saveStateToStorage();
          render();
        });
      }
      if (canRetire) {
        document.getElementById("btn-retire-career").addEventListener("click", () => { audio.playApprove(); triggerEnding(null); });
      }

      const listEl = document.getElementById("evening-items-list");
      const billsToShow = (state.tonightBills && state.tonightBills.length > 0) ? state.tonightBills : DYNAMIC_EVENING_BILLS.slice(0, 3);
      if (state.eveningTab === 2) {
        if (state.eveningToast) {
          const toastDiv = document.createElement("div");
          toastDiv.className = "toast-banner";
          toastDiv.style.background = state.eveningToast.ok ? "#1B5E20" : "#7F0000";
          toastDiv.innerHTML = `<span>${tr(state.eveningToast.text, state.lang)}</span>`;
          listEl.appendChild(toastDiv);
        }

        const shiftBribeUsd = Math.round((state.shiftBribesTotal || 0) / USD_UAH_RATE);
        const wealthFactor = Math.round(Math.min(1800, shiftBribeUsd * 0.12 + state.usd * 0.03));
        const gelikMult = state.ownedAssets.includes("gelik_v8") ? 0.85 : 1.0;

        if ((state.reprimands > 0 || state.underSurveillance || state.nabkRisk >= 25) && !state.purchasedExpensesToday.includes("krysha_bribe")) {
          const baseKUsd = Math.max(350, Math.round((350 + state.nabkRisk * 8 + (state.reprimands || 0) * 250 + wealthFactor * 0.5) * gelikMult));
          const kCostUsd = state.isUndercoverSbkAgent ? Math.round(baseKUsd * 0.65) : baseKUsd;
          const canK = state.usd >= kCostUsd;
          const kCard = document.createElement("div");
          kCard.className = "card-slate row-between";
          kCard.style.borderLeft = "4px solid #E0B145";
          kCard.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;color:#FFE082;">🤝 ${tr(L("Занести за «Кришу» (Зняти Догану / Нагляд / -25% НАБК)", "Pay 'Krysha' Protector (Clear Reprimand / Watch / -25% NABK)"), state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;">${tr(L(`Догани: ${state.reprimands}/3 • ${state.underSurveillance ? "👁️ Нагляд АКТИВНИЙ" : "Нагляду немає"}`, `Reprimands: ${state.reprimands}/3`), state.lang)}</div>
              <div style="color:#81C784;font-size:12px;font-weight:800;">${kCostUsd.toLocaleString("en-US")} 💵</div>
            </div>
          `;
          const kb = document.createElement("button");
          kb.type = "button";
          kb.className = "btn-mustard";
          kb.disabled = !canK;
          kb.textContent = tr(L("Занести", "Bribe"), state.lang);
          kb.addEventListener("click", () => {
            if (state.usd < kCostUsd) return;
            state.usd -= kCostUsd;
            state.purchasedExpensesToday.push("krysha_bribe");
            unlockDiscovery("DISC_KRYSHA");
            if (state.nabkRisk >= 70 && Math.random() < 0.25) {
              audio.playDeny();
              state.nabkRisk = Math.min(100, state.nabkRisk + 15);
              state.eveningToast = { ok: false, text: L("❌ «Криша» зірвалась при високому нагляді НАБК! (+15% ризику)", "❌ 'Krysha' backfired under high NABK heat! (+15% risk)") };
            } else {
              audio.playBribe();
              state.underSurveillance = false;
              state.reprimands = Math.max(0, (state.reprimands || 0) - 1);
              state.nabkRisk = Math.max(0, state.nabkRisk - 25);
              state.eveningToast = { ok: true, text: L("🤝 За «Кришу» занесено: -25% НАБК, знято нагляд і 1 догану!", "🤝 'Krysha' settled: -25% NABK, surveillance & 1 reprimand cleared!") };
            }
            saveStateToStorage();
            render();
          });
          kCard.appendChild(kb);
          listEl.appendChild(kCard);
        }

        const factionBribes = [
          {
            id: "bribe_sbk",
            icon: "🕵️",
            title: L("Підкупити куратора СБК (+24 СБК, -10% НАБК)", "Bribe SBK Handler (+24 SBK, -10% NABK)"),
            cost: Math.round(((state.sbkRep < 35 ? 800 : 450) + Math.round(wealthFactor * 0.45)) * gelikMult),
            chance: state.sbkRep < 35 ? 0.45 : (state.sbkRep < 60 ? 0.72 : 0.90),
            onSuccess: () => { state.sbkRep = Math.min(100, state.sbkRep + 24); state.nabkRisk = Math.max(0, state.nabkRisk - 10); },
            onFail: () => { state.sbkRep = Math.max(0, state.sbkRep - 10); state.nabkRisk = Math.min(100, state.nabkRisk + 12); }
          },
          {
            id: "bribe_palych",
            icon: "🧢",
            title: L("Підкупити Пал Палича (+22 Палич, -1 догана)", "Bribe Pal Palych (+22 Palych, -1 reprimand)"),
            cost: Math.round((((state.reprimands || 0) >= 2 ? 550 : 300) + Math.round(wealthFactor * 0.35)) * gelikMult),
            chance: (state.palychRep < 30 || (state.reprimands || 0) >= 2) ? 0.55 : 0.88,
            onSuccess: () => { state.palychRep = Math.min(100, state.palychRep + 22); state.reprimands = Math.max(0, (state.reprimands || 0) - 1); },
            onFail: () => { state.palychRep = Math.max(0, state.palychRep - 8); }
          },
          {
            id: "bribe_tolik",
            icon: "🚐",
            title: L("Задобрити Толіка (+25 Толік — ближче до втечі)", "Grease Tolik (+25 Tolik rep)"),
            cost: Math.round(((state.tolikRep < 30 ? 600 : 350) + Math.round(wealthFactor * 0.35)) * gelikMult),
            chance: state.tolikRep < 30 ? 0.50 : 0.88,
            onSuccess: () => { state.tolikRep = Math.min(100, state.tolikRep + 25); },
            onFail: () => { state.tolikRep = Math.max(0, state.tolikRep - 8); }
          },
          {
            id: "bribe_nabk",
            icon: "⚖️",
            title: L("Підмазати ревізора НАБК (-25% НАБК, зняти нагляд)", "Bribe NABK Auditor (-25% NABK, clear watch)"),
            cost: Math.round(((state.nabkRisk >= 65 ? 1100 : 650) + Math.round(wealthFactor * 0.6)) * gelikMult),
            chance: state.nabkRisk >= 70 ? 0.45 : (state.underSurveillance ? 0.60 : 0.80),
            onSuccess: () => { state.nabkRisk = Math.max(0, state.nabkRisk - 25); state.underSurveillance = false; },
            onFail: () => { state.nabkRisk = Math.min(100, state.nabkRisk + 15); }
          }
        ];
        const lawyerBoost = state.ownedAssets.includes("lawyer_retainer") ? 0.15 : 0;
        factionBribes.forEach(fb => {
          const effChance = Math.min(0.96, fb.chance + lawyerBoost);
          const used = state.purchasedExpensesToday.includes(fb.id);
          const pct = Math.round(effChance * 100);
          const row = document.createElement("div");
          row.className = "card-slate row-between";
          row.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:12.5px;font-weight:700;">${fb.icon} ${tr(fb.title, state.lang)}</div>
              <div style="font-size:11px;color:#CFD8DC;">${fb.cost.toLocaleString("en-US")} 💵 • ${tr(L(`Шанс успіху: ${pct}%`, `Success chance: ${pct}%`), state.lang)}</div>
            </div>
          `;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn-mustard";
          btn.style.fontSize = "11px";
          btn.disabled = used || state.usd < fb.cost;
          btn.textContent = used ? tr(L("Спроба була", "Tried"), state.lang) : tr(L("Підкупити", "Bribe"), state.lang);
          btn.addEventListener("click", () => {
            if (state.usd < fb.cost || used) return;
            state.usd -= fb.cost;
            state.purchasedExpensesToday.push(fb.id);
            if (Math.random() < effChance) {
              audio.playBribe();
              fb.onSuccess();
              state.eveningToast = { ok: true, text: L(`✅ Підкуп вдався (${fb.icon})! Домовленості оновлено.`, `✅ Bribe succeeded (${fb.icon})!`) };
            } else {
              audio.playDeny();
              fb.onFail();
              state.eveningToast = { ok: false, text: L(`❌ ПРОВАЛ підкупу (${fb.icon})! Гроші згоріли, стосунки погіршились.`, `❌ Bribe FAILED (${fb.icon})! Cash lost, relations dropped.`) };
            }
            saveStateToStorage();
            render();
          });
          row.appendChild(btn);
          listEl.appendChild(row);
        });
      } else if (state.eveningTab === 0) {
        if (state.escapeFund < getEscapeTarget()) {
          const escStep = 1500;
          const canEsc = state.usd >= escStep;
          const eCard = document.createElement("div");
          eCard.className = "card-slate row-between";
          eCard.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;color:#81C784;">🚐 ${tr(L("Фонд утечі через Толіка (+1 500 💵, +10 Толік)", "Tolik Escape Fund (+1,500 💵, +10 Tolik)"), state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;">${tr(L(`Зібрано: ${state.escapeFund.toLocaleString("en-US")} / ${getEscapeTarget().toLocaleString("en-US")} 💵`, `Saved: ${state.escapeFund.toLocaleString("en-US")} / ${getEscapeTarget().toLocaleString("en-US")} 💵`), state.lang)}</div>
              <div style="color:#E0B145;font-size:12px;font-weight:800;">1 500 💵</div>
            </div>
          `;
          const eb = document.createElement("button");
          eb.type = "button";
          eb.className = "btn-mustard";
          eb.disabled = !canEsc;
          eb.textContent = tr(L("Вкласти", "Fund"), state.lang);
          eb.addEventListener("click", () => {
            audio.playBribe();
            payForAsset({ currency: "USD", cost: escStep });
            state.escapeFund += escStep;
            state.tolikRep = Math.min(100, state.tolikRep + 10);
            saveStateToStorage();
            render();
          });
          eCard.appendChild(eb);
          listEl.appendChild(eCard);
        }
        billsToShow.forEach(exp => {
          const bought = state.purchasedExpensesToday.includes(exp.id);
          const isUsdExp = exp.currency === "USD";
          const canBuy = !bought && (isUsdExp ? state.usd >= exp.cost : state.money >= exp.cost);
          const priceStr = isUsdExp ? `${exp.cost.toLocaleString("en-US")} 💵` : `${exp.cost.toLocaleString("en-US")} 🪙`;
          const card = document.createElement("div");
          card.className = "card-slate row-between";
          if (exp.isRare && !bought) card.style.borderLeft = "4px solid #CE93D8";
          if (bought) card.style.backgroundColor = "#1B5E20";
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${tr(exp.title, state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;">${tr(exp.subtitle, state.lang)}</div>
              <div style="color:${isUsdExp ? "#81C784" : "#E0B145"};font-size:12px;font-weight:800;">${priceStr}</div>
            </div>
          `;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn-mustard";
          b.disabled = !canBuy;
          b.textContent = bought ? tr(L("Оплачено", "Paid"), state.lang) : tr(L("Оплатити", "Pay"), state.lang);
          b.addEventListener("click", () => {
            audio.playBribe();
            if (isUsdExp) payForAsset({ currency: "USD", cost: exp.cost });
            else state.money -= exp.cost;
            if (exp.usdReward) state.usd += exp.usdReward;
            if (exp.reprimandHeal) state.reprimands = Math.max(0, (state.reprimands || 0) - exp.reprimandHeal);
            if (exp.tolikDelta) state.tolikRep = Math.max(0, Math.min(100, state.tolikRep + exp.tolikDelta));
            if (exp.palychDelta) state.palychRep = Math.max(0, Math.min(100, state.palychRep + exp.palychDelta));
            if (exp.nextTimeBoost) state.nextTimeBoost = (state.nextTimeBoost || 0) + exp.nextTimeBoost;
            if (exp.nextBribeBoost) state.nextBribeBoost = (state.nextBribeBoost || 0) + exp.nextBribeBoost;
            if (exp.isRare) unlockDiscovery("DISC_NIGHT_RARE");
            state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + exp.morale));
            state.escapeFund += (exp.escape || 0);
            state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + exp.riskDelta));
            state.sbkRep = Math.max(0, Math.min(100, state.sbkRep + (exp.sbkDelta || 0)));
            state.purchasedExpensesToday.push(exp.id);
            saveStateToStorage();
            render();
          });
          card.appendChild(b);
          listEl.appendChild(card);
        });
      } else {
        const curCat = (state.shopCat && state.shopCat !== "ALL") ? state.shopCat : "TECH";
        const cats = [
          { id: "TECH", label: L("🔦 Техніка", "🔦 Gear") },
          { id: "AUTO", label: L("🚗 Авто", "🚗 Auto") },
          { id: "REALTY", label: L("🏠 Дім", "🏠 Realty") },
          { id: "LUXURY", label: L("🕶️ Тінь", "🕶️ Shadow") }
        ];
        const catBar = document.createElement("div");
        catBar.className = "shop-cat-grid";
        cats.forEach(c => {
          const cb = document.createElement("button");
          cb.type = "button";
          cb.className = curCat === c.id ? "btn-mustard" : "btn-secondary";
          cb.textContent = tr(c.label, state.lang);
          cb.addEventListener("click", () => { audio.playTap(); state.shopCat = c.id; render(); });
          catBar.appendChild(cb);
        });
        listEl.appendChild(catBar);

        const filteredAssets = ASSET_UPGRADES
          .filter(a => a.category === curCat)
          .sort((a, b) => Number(state.ownedAssets.includes(a.id)) - Number(state.ownedAssets.includes(b.id)));

        filteredAssets.forEach(asset => {
          const owned = state.ownedAssets.includes(asset.id);
          const isUsd = asset.currency === "USD";
          const canBuy = !owned && canAffordAsset(asset);
          const priceStr = isUsd
            ? `${asset.cost.toLocaleString("en-US")} 💵`
            : `${asset.cost.toLocaleString("en-US")} 🪙`;
          const card = document.createElement("div");
          card.className = "card-slate row-between";
          if (owned) card.style.backgroundColor = "#1B5E20";
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${asset.icon} ${tr(asset.title, state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;line-height:1.35;">${tr(asset.subtitle, state.lang)}</div>
              <div style="color:${isUsd ? "#81C784" : "#E0B145"};font-size:12px;font-weight:800;">${priceStr}</div>
            </div>
          `;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn-mustard";
          b.disabled = !canBuy;
          b.textContent = owned ? tr(L("Куплено", "Owned"), state.lang) : tr(L("Купити", "Buy"), state.lang);
          b.addEventListener("click", () => {
            audio.playBribe();
            payForAsset(asset);
            state.ownedAssets.push(asset.id);
            state.tolikRep = Math.min(100, state.tolikRep + (asset.tolikBoost || 0));
            state.palychRep = Math.min(100, state.palychRep + (asset.palychBoost || 0));
            state.familyMorale = Math.min(100, state.familyMorale + (asset.moraleBoost || 0));
            if (asset.sbkBoost) state.sbkRep = Math.min(100, state.sbkRep + asset.sbkBoost);
            queueFxBurst([{ text: `${asset.icon} ${tr(L("КУПЛЕНО!", "BOUGHT!"), state.lang)}`, tone: "gold" }]);
            saveStateToStorage();
            render();
          });
          card.appendChild(b);
          listEl.appendChild(card);

          // Render unlocked Add-ons (Pool with Crocs, OSINT App, Night Grill, etc.) if parent asset is owned!
          if (owned) {
            ASSET_ADDONS.filter(ad => ad.parentId === asset.id).forEach(addon => {
              const adOwned = state.ownedAssets.includes(addon.id);
              const adIsUsd = addon.currency === "USD";
              const adCanBuy = !adOwned && canAffordAsset(addon);
              const adPriceStr = adIsUsd
                ? `${addon.cost.toLocaleString("en-US")} 💵`
                : `${addon.cost.toLocaleString("en-US")} 🪙`;
              const adCard = document.createElement("div");
              adCard.className = "card-slate row-between";
              adCard.style.marginLeft = "14px";
              adCard.style.borderLeft = "3px solid #E0B145";
              if (adOwned) adCard.style.backgroundColor = "#1B5E20";
              adCard.innerHTML = `
                <div style="flex:1;">
                  <div style="font-size:12px;font-weight:800;color:#FFE082;">↳ ${addon.icon} ${tr(addon.title, state.lang)}</div>
                  <div style="color:#CFD8DC;font-size:10.5px;line-height:1.3;">${tr(addon.subtitle, state.lang)}</div>
                  <div style="color:${adIsUsd ? "#81C784" : "#E0B145"};font-size:11px;font-weight:800;">${adPriceStr}</div>
                </div>
              `;
              const ab = document.createElement("button");
              ab.type = "button";
              ab.className = "btn-mustard";
              ab.style.fontSize = "11px";
              ab.disabled = !adCanBuy;
              ab.textContent = adOwned ? tr(L("Встановлено", "Installed"), state.lang) : tr(L("Додати", "Add"), state.lang);
              ab.addEventListener("click", () => {
                audio.playBribe();
                payForAsset(addon);
                state.ownedAssets.push(addon.id);
                unlockDiscovery("DISC_SHOP_ADDON");
                state.tolikRep = Math.min(100, state.tolikRep + addon.tolikBoost);
                state.palychRep = Math.min(100, state.palychRep + addon.palychBoost);
                state.familyMorale = Math.min(100, state.familyMorale + addon.moraleBoost);
                queueFxBurst([{ text: `${addon.icon} ${tr(L("КУПЛЕНО!", "BOUGHT!"), state.lang)}`, tone: "gold" }]);
                saveStateToStorage();
                render();
              });
              adCard.appendChild(ab);
              listEl.appendChild(adCard);
            });
          }
        });
      }

      const evCanvas = document.getElementById("evening-canvas");
      if (window._phaseBannerRaf) { cancelAnimationFrame(window._phaseBannerRaf); window._phaseBannerRaf = null; }
      if (evCanvas) {
        let lastEv = 0;
        const tickEvening = (ts) => {
          if (state.phase !== "HOME_EVENING" || document.getElementById("evening-canvas") !== evCanvas || isMotionReduced()) {
            window._phaseBannerRaf = null; return;
          }
          if (!lastEv || ts - lastEv >= 40) { lastEv = ts; drawEveningBanner(evCanvas, state, (ts || Date.now()) * 0.001); }
          window._phaseBannerRaf = requestAnimationFrame(tickEvening);
        };
        const reducedEv = isMotionReduced();
        drawEveningBanner(evCanvas, state, reducedEv ? 0 : Date.now() * 0.001);
        if (!reducedEv && typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickEvening);
      }
      document.getElementById("btn-next-day").addEventListener("click", () => { audio.playTap(); advanceToNextDay(false); });
      return;
    }

    if (state.phase === "ENDING") {
      const epi = buildModularEpilogue(state);
      root.innerHTML = `
        <div style="margin:auto 0;display:flex;flex-direction:column;gap:12px;">
          <div class="epilogue-dossier">
            <div class="dossier-stamp-red">${tr(L("АРХІВ ДПСК", "ARCHIVED"), state.lang)}</div>
            <div style="padding-right:70px;">
              <div style="font-family:monospace;font-size:11px;color:#5C4B32;font-weight:800;">
                ${tr(L(`ДОСЬЄ #${epi.comboNumber.toLocaleString()} ІЗ ${epi.totalCombos.toLocaleString()}`, `DOSSIER #${epi.comboNumber.toLocaleString()} OF ${epi.totalCombos.toLocaleString()}`), state.lang)}
              </div>
              <h1 style="color:#8B1A1A;font-size:19px;font-weight:900;margin-top:3px;">${tr(epi.title, state.lang)}</h1>
              <p style="font-size:12.5px;font-weight:700;color:#3E2723;margin-top:3px;">${tr(epi.subtitle, state.lang)}</p>
            </div>

            <div class="epilogue-block">
              <div class="epilogue-block-title">💼 ${tr(L("Статки, Майно та Бізнес", "Wealth & Assets"), state.lang)}</div>
              <div>${tr(epi.assetText, state.lang)}</div>
            </div>
            <div class="epilogue-block">
              <div class="epilogue-block-title">🏠 ${tr(L("Сім'я та Тилове Життя", "Family & Home"), state.lang)}</div>
              <div>${tr(epi.famText, state.lang)}</div>
            </div>
            <div class="epilogue-block">
              <div class="epilogue-block-title">🤝 ${tr(L("Начальство та Синдикат", "Boss & Smugglers"), state.lang)}</div>
              <div>${tr(epi.bossText, state.lang)}</div>
            </div>
            <div class="epilogue-block">
              <div class="epilogue-block-title">🛡️ ${tr(L("СБК, Війна та Спадщина", "Intel & Legacy"), state.lang)}</div>
              <div>${tr(epi.legText, state.lang)}</div>
            </div>

            <div class="menu-stats-pill">
              <span>🏆 ${tr(L("Відкрито кінцівок", "Endings Discovered"), state.lang)}: <strong>${epi.unlockedCount}/16</strong></span>
              <span>💵 ${state.money} 🪙${state.usd > 0 ? ` • 💵 ${state.usd.toLocaleString("en-US")}` : ""} • СБК ${state.sbkRep}</span>
            </div>
          </div>

          ${(() => {
            const cps = loadCampaignCheckpoints();
            const days = [1, 2, 3, 4, 5, 6, 7].filter(d => cps["day_" + d]);
            if (days.length === 0) return "";
            return `<section class="card-slate" style="padding:10px;">
              <div style="font-size:12px;font-weight:800;color:#E0B145;margin-bottom:6px;">⏪ ${tr(L("ПОДАЛЬШІ ГІЛКИ — ПЕРЕГРАТИ З ДНЯ:", "REPLAY FROM CHECKPOINT DAY:"), state.lang)}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${days.map(d => `<button type="button" class="btn-outline end-cp-btn" data-cp-day="${d}" style="padding:6px 10px;font-size:12px;">${tr(L(`День ${d}`, `Day ${d}`), state.lang)}</button>`).join("")}
              </div>
            </section>`;
          })()}

          <button type="button" id="btn-share-result" class="stamp-action-btn stamp-action-gold">
            <span>${tr(L("📲 ПОДІЛИТИСЯ ДОСЬЄ З ДРУЗЯМИ", "📲 SHARE DOSSIER WITH FRIENDS"), state.lang)}</span>
            <span>📤</span>
          </button>
          <button type="button" id="btn-restart" class="stamp-action-btn stamp-action-green">
            <span>${tr(L("↺ ПОВЕРНУТИСЯ В ГОЛОВНЕ МЕНЮ", "↺ RETURN TO MAIN MENU"), state.lang)}</span>
            <span>▶</span>
          </button>
        </div>
      `;
      document.querySelectorAll(".end-cp-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          audio.playApprove();
          restoreCampaignCheckpoint(Number(btn.getAttribute("data-cp-day")));
        });
      });
      document.getElementById("btn-share-result").addEventListener("click", () => { audio.playTap(); shareResultCard(); });
      document.getElementById("btn-restart").addEventListener("click", () => { audio.playTap(); state.phase = "MAIN_MENU"; render(); });
    }
  }

  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("keydown", (e) => {
      if (state.phase !== "BOOTH_SHIFT" || state.sirenActive) return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      const openDlgs = ["rules-dialog", "wanted-dialog", "siren-dialog", "encounter-dialog"]
        .some(id => { const d = document.getElementById(id); return d && d.open; });
      if (openDlgs) return;
      const key = e.key;
      if (key >= "1" && key <= "4") {
        const idx = Number(key) - 1;
        const t = state.queue && state.queue[state.travelerIdx];
        if (t && t.documents && t.documents[idx]) {
          audio.playTap();
          state.selectedDocIdx = idx;
          if (!state.openedDocIndices) state.openedDocIndices = [];
          if (!state.openedDocIndices.includes(idx)) state.openedDocIndices.push(idx);
          state.docFolded = false;
          state.justUnfoldedDoc = true;
          render();
        }
      } else if (key === "Escape" && !state.docFolded) {
        const foldBtn = document.getElementById("btn-fold-doc");
        if (foldBtn) foldBtn.click();
      } else if (key === "u" || key === "U") {
        const btn = document.getElementById("react-uv");
        if (btn) btn.click();
      } else if (key === "k" || key === "K") {
        const btn = document.getElementById("react-intimidate");
        if (btn) btn.click();
      } else if (key === "c" || key === "C") {
        const btn = document.getElementById("react-coffee");
        if (btn) btn.click();
      } else if (key === "d" || key === "D") {
        const btn = document.getElementById("react-dog");
        if (btn && !btn.disabled) btn.click();
      }
    });
  }

  render();
