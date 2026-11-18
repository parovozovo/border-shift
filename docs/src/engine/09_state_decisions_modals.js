  // Main State (starts directly on the atmospheric Checkpoint Main Menu!)
  let state = {
    lang: "UK",
    contentMode: "FULL_18_PLUS",
    phase: "MAIN_MENU",
    isSandbox: false,
    dayIndex: 0,
    daySpec: ACT_ONE_DAYS[0],
    sandboxMod: SANDBOX_MODIFIERS[0],
    queue: [],
    travelerIdx: 0,
    selectedDocIdx: 0,
    shiftSec: 270,
    sirenActive: false,
    sirenResolved: false,
    vehicleInspected: false,
    interrogated: false,
    bribeAccepted: false,
    reactionState: "NONE", // "NONE" | "INTIMIDATED" | "COFFEE_GIVEN"
    coffeeTipGiven: false,
    uvActive: false,
    intimidateUsed: false,
    intimidateBribeBoosted: false,
    intimidateClueMsg: null,
    intimidateClueIsWarn: false,
    uvCompartmentRevealed: false,
    uvSecretClaimed: false,
    currentUvEasterEgg: null,
    justShook: false,
    spottedCodes: [],
    lastFeedback: null,
    barrierState: "CLOSED",
    money: 400,
    escapeFund: 0,
    familyMorale: 80,
    nabkRisk: 10,
    palychRep: 50,
    tolikRep: 30,
    sbkRep: 50,
    shiftProcessed: 0,
    shiftCorrect: 0,
    shiftMistakes: 0,
    shiftDetained: 0,
    totalCareerDetained: 0,
    shiftBribesTotal: 0,
    shiftFinesTotal: 0,
    ownedAssets: [],
    purchasedExpensesToday: [],
    tonightBills: [],
    shytomyrFriendsMet: [],
    shytomyrRelics: [],
    shytomyrBrotherhoodUnlocked: false,
    isUndercoverSbkAgent: false,
    sbkRecruitmentOffered: false,
    spiesCaughtAsAgent: 0,
    sbkColonelPromoted: false,
    tolikEscapeOffered: false,
    eveningTab: 0,
    archiveTab: 0,
    onboardingTab: 0,
    pendingStartMode: null,
    encounterTriggered: false,
    activeEndingId: null,
    usd: 0,
    campaignFlags: {}
  };

  function loadCampaignCheckpoints() {
    try { return JSON.parse(localStorage.getItem(CAMPAIGN_CHECKPOINTS_KEY) || "{}"); } catch (_) { return {}; }
  }

  function saveCampaignCheckpoint(dayNum) {
    if (state.isSandbox || dayNum < 1 || dayNum > 7) return;
    try {
      const cps = loadCampaignCheckpoints();
      cps["day_" + dayNum] = JSON.parse(JSON.stringify(state));
      localStorage.setItem(CAMPAIGN_CHECKPOINTS_KEY, JSON.stringify(cps));
    } catch (_) {}
  }

  function restoreCampaignCheckpoint(dayNum) {
    try {
      const cps = loadCampaignCheckpoints();
      const snap = cps["day_" + dayNum];
      if (!snap) return false;
      state = Object.assign(state, snap);
      state.phase = "MORNING_BRIEFING";
      saveStateToStorage();
      render();
      return true;
    } catch (_) {
      return false;
    }
  }

  const UV_SECRET_STAMPS = [
    {
      id: "CODE_GUR_NIGHT",
      title: L("🦉 Шифр ГУР «Нічний Сокіл»", "🦉 GUR Cipher 'Night Falcon'"),
      logText: L("🦉 UV-знахідка: розшифровано мітку ГУР «Нічний Сокіл»!", "🦉 UV find: decoded GUR 'Night Falcon' mark!"),
      uah: 500, usd: 0, sbkDelta: 6, riskDelta: 0, palychDelta: 0, tolikDelta: 0, timeDelta: 0
    },
    {
      id: "NABK_MARKER",
      title: L("🎙️ Потайний штамп аудитора НАБК", "🎙️ Hidden NABK Auditor Stamp"),
      logText: L("🎙️ UV-знахідка: виявлено й знешкоджено мітку аудиту НАБК!", "🎙️ UV find: detected & neutralized hidden NABK audit stamp!"),
      uah: 400, usd: 0, sbkDelta: 0, riskDelta: -6, palychDelta: 0, tolikDelta: 0, timeDelta: 0
    },
    {
      id: "SYNDICATE_MARK",
      title: L("🕶️ Символ «Караван Варшавки»", "🕶️ 'Varshavka Caravan' Mark"),
      logText: L("🕶️ UV-знахідка: підтверджено таємний знак синдикату Толіка!", "🕶️ UV find: confirmed Tolik syndicate UV mark!"),
      uah: 400, usd: 0, sbkDelta: 0, riskDelta: 0, palychDelta: 0, tolikDelta: 6, timeDelta: 0
    },
    {
      id: "PALYCH_SEAL",
      title: L("🥃 Архівна мітка «Палич-Фонд 1998»", "🥃 Archive Stamp 'Palych-Fund 1998'"),
      logText: L("🥃 UV-знахідка: знайдено архівну печатку Палича!", "🥃 UV find: logged Palych archival UV stamp!"),
      uah: 350, usd: 0, sbkDelta: 0, riskDelta: 0, palychDelta: 6, tolikDelta: 0, timeDelta: 0
    },
    {
      id: "CYBER_CIPHER",
      title: L("🔐 Мікро-QR кібердепартаменту", "🔐 Cyber Dept Micro-QR"),
      logText: L("🔐 UV-знахідка: перехоплено прихований мікро-QR!", "🔐 UV find: intercepted hidden cyber micro-QR!"),
      uah: 600, usd: 0, sbkDelta: 5, riskDelta: 0, palychDelta: 0, tolikDelta: 0, timeDelta: 0
    },
    {
      id: "SHYTOMYR_RUNE",
      title: L("🛸 Люмінесцентний «Дерун-Енерджі»", "🛸 Glowing 'Derun-Energy' Stamp"),
      logText: L("🛸 UV-знахідка: магічний штамп шитомирських майстрів (+час і премія)!", "🛸 UV find: Shytomyr craftsman UV stamp (+time & bonus)!"),
      uah: 450, usd: 0, sbkDelta: 0, riskDelta: 0, palychDelta: 0, tolikDelta: 0, timeDelta: 2
    },
    {
      id: "OFFSHORE_WATERMARK",
      title: L("🌴 Невидима віза «Офшор-Монаківка»", "🌴 Invisible 'Monakivka Offshore' Visa"),
      logText: L("🌴 UV-знахідка: зафіксовано елітну офшорну водяну мітку!", "🌴 UV find: logged VIP offshore watermark!"),
      uah: 0, usd: 35, sbkDelta: 0, riskDelta: 0, palychDelta: 0, tolikDelta: 4, timeDelta: 0
    },
    {
      id: "VIP_CHANCELLERY",
      title: L("📜 Закрита резолюція «Без черги»", "📜 Secret Resolution 'VIP Lane'"),
      logText: L("📜 UV-знахідка: знайдено закриту візу канцелярії!", "📜 UV find: spotted VIP chancellery UV seal!"),
      uah: 0, usd: 25, sbkDelta: 0, riskDelta: 0, palychDelta: 4, tolikDelta: 0, timeDelta: 0
    }
  ];

  function getUvSecretAward(traveler) {
    if (!traveler) return null;
    const mult = (state.ownedAssets && state.ownedAssets.includes("uv_spotlight")) ? 1.5 : 1.0;
    let base = null;
    if (traveler.storyTag === "NABK_STING") {
      base = {
        id: "STORY_NABK_WIRE",
        title: L("🎙️ Мікрокамера НАБК та мічені купюри", "🎙️ NABK Micro-Cam & Marked Bills"),
        logText: L("🎙️ UV-викриття: зафіксовано мічені купюри й жучок НАБК!", "🎙️ UV catch: logged NABK wiretap & marked bills!"),
        uah: 700, usd: 0, sbkDelta: 8, riskDelta: -10, palychDelta: 0, tolikDelta: 0, timeDelta: 0
      };
    } else if (traveler.storyTag === "FSM_SPY") {
      base = {
        id: "STORY_FSM_INK",
        title: L("🕵️ Флуоресцентна фарба типографії ФСМ", "🕵️ Fluorescent FSM Print Ink"),
        logText: L("🕵️ UV-експертиза: знято пробу секретної фарби ФСМ!", "🕵️ UV forensic: sampled fluorescent FSM ink!"),
        uah: 900, usd: 0, sbkDelta: 10, riskDelta: 0, palychDelta: 0, tolikDelta: 0, timeDelta: 0
      };
    } else if (traveler.storyTag === "INTEL_ALLY") {
      base = {
        id: "STORY_GUR_TRIDENT",
        title: L("🦅 Невидимий тризуб-голограма ГУР-М", "🦅 Invisible GUR-M Trident Hologram"),
        logText: L("🦅 UV-підтвердження: активовано спецголограму ГУР-М!", "🦅 UV verify: activated covert GUR-M hologram!"),
        uah: 0, usd: 50, sbkDelta: 10, riskDelta: 0, palychDelta: 0, tolikDelta: 0, timeDelta: 0
      };
    } else if (state.currentUvEasterEgg) {
      base = state.currentUvEasterEgg;
    }
    if (!base) return null;
    return {
      ...base,
      uah: Math.round((base.uah || 0) * mult),
      usd: Math.round((base.usd || 0) * mult)
    };
  }

  function getComputedBribe(offer) {
    if (!offer) return null;
    const currency = offer.currency === "USD" ? "USD" : "UAH";
    const modMult = state.sandboxMod ? (state.sandboxMod.bribeMult || 1) : 1;
    const hasAsset = id => Boolean(state.ownedAssets && state.ownedAssets.includes(id));
    const jacketMult = hasAsset("balenci_jacket") ? 1.20 : 1.0;
    const ringMult = hasAsset("customs_seal_ring") ? 1.15 : 1.0;
    const audiMult = hasAsset("audi_q7_blyakha") ? 1.10 : 1.0;
    const prepMult = 1 + (state.nextBribeBoost || 0);
    const intimidateMult = (state.intimidateBribeBoosted && !offer.isFriendlyGift) ? 1.30 : 1.0;
    let rankScale = 1;
    if (currency === "USD" && !offer.isStingTrap) {
      const d = state.daySpec ? state.daySpec.dayNumber : 1;
      if (state.sbkColonelPromoted || d >= 7) rankScale = 1.25;
      else if (d >= 4) rankScale = 1.10;
      else rankScale = 1.0;
    }
    const baseAmt = currency === "USD" ? offer.amount : (offer.amount < 500 ? offer.amount * 5 : offer.amount);
    const amt = Math.round(baseAmt * rankScale * modMult * jacketMult * ringMult * audiMult * prepMult * intimidateMult);
    return {
      amount: amt,
      currency,
      symbol: currency === "USD" ? "💵" : "🪙",
      display: currency === "USD" ? `${amt.toLocaleString("en-US")} 💵` : `${amt.toLocaleString("en-US")} 🪙`,
      isInstant: Boolean(offer.instantOffer),
      requiresDiscovery: Boolean(offer.requiresDiscovery),
      boostedByIntimidate: Boolean(state.intimidateBribeBoosted && !offer.isFriendlyGift)
    };
  }

  function getAssetCostUah(asset) {
    return asset.currency === "USD" ? asset.cost * USD_UAH_RATE : asset.cost;
  }

  function isStrictUahAsset(asset) {
    return Boolean(asset.onlyUah || asset.category === "TECH" || asset.id === "shawarma_kiosk" || asset.id === "addon_night_grill" || asset.id === "addon_syrup_bar");
  }

  function canAffordAsset(asset) {
    if (asset.currency === "USD") return state.usd >= asset.cost;
    return state.money >= getAssetCostUah(asset);
  }

  function payForAsset(asset) {
    if (asset.currency === "USD") {
      state.usd = Math.max(0, state.usd - asset.cost);
    } else {
      state.money = Math.max(0, state.money - getAssetCostUah(asset));
    }
  }

  function saveStateToStorage() {
    try {
      if (state.phase !== "AGE_GATE" && state.phase !== "MAIN_MENU") {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      }
    } catch (_) {}
  }

  function hasSavedGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && parsed.phase && parsed.phase !== "AGE_GATE" && parsed.phase !== "MAIN_MENU";
    } catch (_) {
      return false;
    }
  }

  function loadSavedGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      state = Object.assign(state, JSON.parse(raw));
      render();
      return true;
    } catch (_) {
      return false;
    }
  }

  function getActiveMetaPerks() {
    const shytCount = loadUnlockedShytomyr().length;
    const titleCount = loadUnlockedArchetypes().length;
    return META_PERK_DEFS.map(p => {
      const curr = p.reqType === "shytomyr" ? shytCount : titleCount;
      return Object.assign({}, p, { unlocked: curr >= p.reqCount, progress: curr });
    });
  }

  function getMetaPerkFlags() {
    const shytCount = loadUnlockedShytomyr().length;
    const titleCount = loadUnlockedArchetypes().length;
    return {
      startCashBonus: (shytCount >= 12 ? 800 : 0) + (shytCount >= 3 ? 300 : 0),
      coffeeTipBonus: shytCount >= 6 ? 25 : 0,
      startNabkHeal: shytCount >= 12 ? 15 : 0,
      halfFirstFine: titleCount >= 3,
      shiftTimeBonus: titleCount >= 6 ? 30 : 0,
      salaryBonusMult: titleCount >= 10 ? 1.2 : 1.0
    };
  }

  let usedSandboxModIds = new Set();

  function buildRandomSandboxDay(dayNumber, rankTitleUk, rankTitleEn) {
    let pool = SANDBOX_MODIFIERS.filter(m => !usedSandboxModIds.has(m.id));
    if (pool.length === 0) {
      usedSandboxModIds.clear();
      pool = SANDBOX_MODIFIERS.slice();
    }
    const mod = pick(pool);
    usedSandboxModIds.add(mod.id);
    const twist = pick(SANDBOX_TWISTS);
    const dailyRule = dayNumber >= 2 ? pick(["MED_INSURANCE", "TRANSIT_PERMIT", "OBLIK_SURGE", "STRICT_CLONES"]) : "NONE";
    const requireOblikQr = Boolean(mod.forceOblik || twist.forceOblik || dailyRule === "OBLIK_SURGE" || (dayNumber >= 4 && Math.random() < 0.45));
    const hasSiren = Boolean(mod.forceSiren || Math.random() < 0.4);
    const twoWheelerBias = Boolean(mod.twoWheelerBias || twist.twoWheelerBias);
    const extraShytomyr = Boolean(mod.extraShytomyr || twist.extraShytomyr);
    const extraWar = Boolean(mod.extraWar || twist.extraWar);
    const extraCloneChance = Boolean(twist.extraCloneChance || mod.id === "CONTRABAND_BOOM" || dailyRule === "STRICT_CLONES");
    const coffeeMult = Math.max(mod.coffeeMult || 1, twist.coffeeMult || 1);

    const briefings = [
      L(
        `Пал Палич: «${rankTitleUk}, на зміні №${dayNumber} працює новий указ! Не розслабляйся: перевіряй транспорт у вікні, документи та лови контрабанду!»`,
        `Pal Palych: '${rankTitleEn}, shift #${dayNumber} has a fresh decree! Check vehicles in the booth window, IDs, and stop smugglers!'`
      ),
      L(
        `Пал Палич: «Сьогодні траса кипить! ${mod.desc.uk} Тримай печатку напоготові й не прогав агентів!»`,
        `Pal Palych: 'Highway is packed! ${mod.desc.en} Keep your stamp ready and watch for operatives!'`
      ),
      L(
        `Пал Палич: «Нічна ротація №${dayNumber}. Київ та СБК моніторять наш КПП. За чіткі арешти буде жирна премія!»`,
        `Pal Palych: 'Night rotation #${dayNumber}. Command & SBK are watching our post — sharp detentions pay big!'`
      )
    ];

    const rulesList = [
      L("1. Паспорт: фото, ПІБ і дата дії мають відповідати особі перед вікном.", "1. Passport: photo, name & expiry must match the traveler."),
      requireOblikQr
        ? L("2. Чоловіки 18–60 (ВИЇЗД): Довідка про відстрочку + дійсний QR-код «Облік+».", "2. Males 18–60 (EXIT): Exemption Permit + valid 'Oblik+' QR.")
        : L("2. Чоловіки 18–60 (ВИЇЗД): Обов'язкова дійсна Довідка про відстрочку.", "2. Males 18–60 (EXIT): Valid Exemption Certificate required."),
      L("3. Транспорт: модель, КОЛІР і держномер у декларації мають збігатися з авто у вікні.", "3. Transport: model, COLOR & plate must match what's at the gate.")
    ];
    if (dailyRule === "MED_INSURANCE") {
      rulesList.push(L("4. ОСОБЛИВЕ ПРАВИЛО ДНЯ: На ВИЇЗД обов'язкова 🏥 Санітарна страховка на столі.", "4. DAILY SPECIAL RULE: 🏥 Medical Insurance is required on EXIT."));
    } else if (dailyRule === "TRANSIT_PERMIT") {
      rulesList.push(L("4. ОСОБЛИВЕ ПРАВИЛО ДНЯ: На ВИЇЗД обов'язковий 🛣️ Транзитний талон на столі.", "4. DAILY SPECIAL RULE: 🛣️ Transit Permit is required on EXIT."));
    } else if (dailyRule === "STRICT_CLONES") {
      rulesList.push(L("4. ОСОБЛИВЕ ПРАВИЛО ДНЯ: Рейд на двійників — ретельно звіряйте держномер та колір авто!", "4. DAILY SPECIAL RULE: Cloned-car sweep — inspect plates & colors closely!"));
    }

    return {
      mod: Object.assign({}, mod, { coffeeMult }),
      daySpec: {
        dayNumber,
        dateLabel: L(`Вільна служба • День ${dayNumber} (${rankTitleUk})`, `Sandbox Career • Day ${dayNumber} (${rankTitleEn})`),
        headline: mod.title,
        radioNews: mod.desc,
        bossBriefing: pick(briefings),
        rulesList,
        requireOblikQr,
        requireVehicleDecl: true,
        dailyRule,
        wantedHint: twist.label,
        bossCut: Math.min(420, 170 + dayNumber * 20),
        hasSiren,
        twoWheelerBias,
        extraShytomyr,
        extraWar,
        extraCloneChance
      }
    };
  }

  function getEscapeTarget() { return state.isSandbox ? 25000 : 15000; }
  function getEscapeTolikRep() { return state.isSandbox ? 65 : 55; }
  function getRank() {
    if (state.sbkColonelPromoted) {
      return {
        id: "SBK_COLONEL",
        title: L("🕵️ Таємний Полковник СБК («Кордон-7»)", "🕵️ Covert SBK Colonel ('Border-7')"),
        salary: 1800,
        perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -8% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -8% NABK/day"),
        dogCost: 0,
        freeFirstMistake: true,
        dailyRiskHeal: 8
      };
    }
    if (state.isUndercoverSbkAgent) {
      return {
        id: "SBK_AGENT",
        title: L("🕵️ Негласний агент СБК («Кордон-7»)", "🕵️ Undercover SBK Agent ('Border-7')"),
        salary: 900,
        perkLabel: L("🔓 Перк: +1 500 🪙/арешт • Пес -4с", "🔓 Perk: +1,500 🪙/arrest • Dog -4s"),
        dogCost: 4,
        freeFirstMistake: false,
        dailyRiskHeal: 4
      };
    }
    if (!state.isSandbox) {
      return {
        id: "CAMPAIGN_INSPECTOR",
        title: L("Інспектор ДПСК", "SBGS Inspector"),
        salary: 480,
        perkLabel: L("Сюжетний режим (перки Архіву активні)", "Story mode (Archive perks active)"),
        dogCost: 8,
        freeFirstMistake: false,
        dailyRiskHeal: 0
      };
    }
    const d = state.daySpec.dayNumber;
    if (d >= 20) {
      return {
        id: "REGIONAL_CURATOR",
        title: L("Регіональний куратор ДПСК", "Regional SBGS Curator"),
        salary: 1800,
        perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -8% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -8% NABK/day"),
        dogCost: 0,
        freeFirstMistake: true,
        dailyRiskHeal: 8
      };
    }
    if (d >= 14) {
      return {
        id: "CHECKPOINT_CHIEF",
        title: L("Начальник КПП", "Checkpoint Chief"),
        salary: 1400,
        perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -6% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -6% NABK/day"),
        dogCost: 0,
        freeFirstMistake: true,
        dailyRiskHeal: 6
      };
    }
    if (d >= 8) {
      return {
        id: "CHIEF_CUSTOMS",
        title: L("Старший офіцер митниці", "Chief Customs Officer"),
        salary: 1100,
        perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -5% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -5% NABK/day"),
        dogCost: 0,
        freeFirstMistake: true,
        dailyRiskHeal: 5
      };
    }
    if (d >= 5) {
      return {
        id: "DEPUTY_PALYCH",
        title: L("Заступник Пал Палича", "Palych's Deputy"),
        salary: 800,
        perkLabel: L("🔓 Перки: 1-ша помилка 0 🪙 • Пес -4с", "🔓 Perks: 1st Mistake 0 🪙 • Dog -4s"),
        dogCost: 4,
        freeFirstMistake: true,
        dailyRiskHeal: 0
      };
    }
    if (d >= 3) {
      return {
        id: "SENIOR_SHIFT",
        title: L("Старший зміни", "Senior Shift Inspector"),
        salary: 600,
        perkLabel: L("🔓 Перк: Пес «Бавовна» витрачає 4с замість 8с", "🔓 Perk: Sniffer dog costs 4s instead of 8s"),
        dogCost: 4,
        freeFirstMistake: false,
        dailyRiskHeal: 0
      };
    }
    return {
      id: "JUNIOR",
      title: L("Молодший інспектор", "Junior Inspector"),
      salary: 450,
      perkLabel: L("Підніміться до Дня 3 для 1-го рангового перку!", "Reach Day 3 to unlock your first Rank Perk!"),
      dogCost: 8,
      freeFirstMistake: false,
      dailyRiskHeal: 0
    };
  }

  function getEffectiveBossCut() {
    const bribeUsd = state.shiftBribesTotal > 0 ? Math.round((state.shiftBribesTotal * 0.18) / USD_UAH_RATE) : 0;
    const baseUsd = Math.min(900, Math.max(80, 50 + bribeUsd));
    return state.ownedAssets.includes("rolex_watch") ? Math.max(40, Math.round(baseUsd * 0.5)) : baseUsd;
  }

  function getPassiveRent() {
    const assetRent = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
    const addonRent = ASSET_ADDONS.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
    const sbkCovertPay = state.isUndercoverSbkAgent ? (state.sbkColonelPromoted ? 12000 : 5500) : 0;
    return assetRent + addonRent + sbkCovertPay;
  }
  function getPassiveUsd() {
    const baseUsd = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + (a.passiveUsd || 0), 0);
    const addonUsd = ASSET_ADDONS.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + (a.passiveUsd || 0), 0);
    return baseUsd + addonUsd;
  }
  function getDailyAssetRisk() {
    const baseR = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.dailyRisk, 0);
    const addonR = ASSET_ADDONS.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.dailyRisk, 0);
    const floppyHeal = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_404_FLOPPY")) ? 3 : 0;
    return baseR + addonR - floppyHeal;
  }

  function pickTonightBills(dayNum) {
    const d = dayNum || (state.daySpec ? state.daySpec.dayNumber : 1);
    const unlocked = DYNAMIC_EVENING_BILLS.filter(item => (item.minDay || 1) <= d);
    const rolledRare = shuffle(unlocked.filter(item => item.isRare && Math.random() < (item.chance || 0.2)));
    const common = shuffle(unlocked.filter(item => !item.isRare && Math.random() < (item.chance || 1.0)));
    const combined = rolledRare.slice(0, 1).concat(common);
    return combined.slice(0, 4);
  }

  function startNewGame(sandbox) {
    usedStoryTags = new Set();
    usedShytomyrRun = new Set();
    usedEncounterIds = new Set();
    usedSandboxModIds = new Set();
    const meta = getMetaPerkFlags();

    let mod = { id: "NONE", title: L("", ""), desc: L("", ""), bribeMult: 1.0, detainExtra: 0, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false };
    let baseDay = Object.assign({}, ACT_ONE_DAYS[0]);
    if (sandbox) {
      const built = buildRandomSandboxDay(1, "Молодший інспектор", "Junior Inspector");
      mod = built.mod;
      baseDay = built.daySpec;
    }
    const baseSec = (sandbox ? 215 : 195) + (mod.shiftSecDelta || 0) + meta.shiftTimeBonus;
    state = Object.assign(state, {
      phase: "MORNING_BRIEFING",
      isSandbox: sandbox,
      dayIndex: 0,
      daySpec: baseDay,
      sandboxMod: mod,
      queue: generateDailyQueue(baseDay, sandbox ? 14 : 12),
      travelerIdx: 0,
      selectedDocIdx: 0,
      shiftSec: Math.max(150, baseSec),
      sirenActive: false,
      sirenResolved: false,
      vehicleInspected: false,
      interrogated: false,
      bribeAccepted: false,
      reactionState: "NONE",
      coffeeTipGiven: false,
      uvActive: false,
      intimidateUsed: false,
      intimidateBribeBoosted: false,
      intimidateClueMsg: null,
      intimidateClueIsWarn: false,
      uvCompartmentRevealed: false,
      uvSecretClaimed: false,
      currentUvEasterEgg: null,
      justShook: false,
      spottedCodes: [],
      lastFeedback: null,
      barrierState: "CLOSED",
      money: 6000 + meta.startCashBonus * 4,
      escapeFund: 0,
      familyMorale: 80,
      nabkRisk: Math.max(0, 10 - meta.startNabkHeal),
      palychRep: 50,
      tolikRep: 30,
      sbkRep: 50,
      shiftProcessed: 0,
      shiftCorrect: 0,
      shiftMistakes: 0,
      shiftDetained: 0,
      totalCareerDetained: 0,
      shiftBribesTotal: 0,
      shiftFinesTotal: 0,
      ownedAssets: [],
      purchasedExpensesToday: [],
      tonightBills: pickTonightBills(),
      shytomyrFriendsMet: [],
      shytomyrRelics: [],
      shytomyrBrotherhoodUnlocked: false,
      isUndercoverSbkAgent: false,
      sbkRecruitmentOffered: false,
      spiesCaughtAsAgent: 0,
      sbkColonelPromoted: false,
      tolikEscapeOffered: false,
      nextTimeBoost: 0,
      nextBribeBoost: 0,
      eveningTab: 0,
      encounterTriggered: false,
      activeEndingId: null,
      usd: 150,
      campaignFlags: {},
      factionFinaleDone: false,
      reprimands: 0,
      underSurveillance: false,
      obnalUsedToday: 0,
      exchDir: "USD_TO_UAH"
    });
    if (!sandbox) saveCampaignCheckpoint(1);
    saveStateToStorage();
    render();
  }

  function getShiftBonusSec() {
    const has = id => state.ownedAssets.includes(id);
    const bestCarSec = Math.max(
      0,
      has("monako_hypercar") ? 40 : 0,
      has("porsche_911") ? 35 : 0,
      has("gelik_v8") ? 31 : 0,
      has("euro_bmw") ? 28 : 0,
      has("audi_q7_blyakha") ? 25 : 0,
      has("skoda_octavia_rs") ? 24 : 0,
      has("camry_35") ? 21 : 0,
      has("lanos_sport") ? 18 : 0,
      has("steppe_ebike") ? 14 : 0
    );
    const coffeeSec = has("espresso_machine") ? 25 : 0;
    const thermosSec = has("thermos_tray") ? 10 : 0;
    const chairSec = has("heated_booth_seat") ? 14 : 0;
    const genSec = has("diesel_generator") ? 15 : 0;
    const sockRelicSec = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_KEVLAR_SOCKS")) ? 8 : 0;
    const bestAddonSec = Math.max(0, has("addon_nitro_spoiler") ? 15 : 0, has("addon_migalka") ? 12 : 0);
    return bestCarSec + coffeeSec + thermosSec + chairSec + genSec + sockRelicSec + bestAddonSec;
  }

  function beginShift() {
    const meta = getMetaPerkFlags();
    const baseSec = state.isSandbox ? 215 : 195;
    const modDelta = state.sandboxMod ? (state.sandboxMod.shiftSecDelta || 0) : 0;
    const bonusSec = getShiftBonusSec() + meta.shiftTimeBonus + modDelta + (state.nextTimeBoost || 0);
    state.nextTimeBoost = 0;
    state.phase = "BOOTH_SHIFT";
    state.shiftSec = Math.max(150, baseSec + bonusSec);
    state.travelerIdx = 0;
    state.selectedDocIdx = 0;
    state.sirenActive = false;
    state.sirenResolved = false;
    const sirenChance = (state.sandboxMod && state.sandboxMod.forceSiren)
      ? 1
      : (state.daySpec.dayNumber >= 4 ? 0.65 : 0.40);
    state.shiftHasSiren = Math.random() < sirenChance;
    state.sirenTriggerSec = state.shiftHasSiren ? (110 + Math.floor(Math.random() * 105)) : -1;
    state.sirenPauseSec = 18 + Math.floor(Math.random() * 15);
    state.encounterTriggered = false;
    state.gotReprimandToday = false;
    state.radioDispatch = null;
    state.shiftLogs = [
      { color: "#B0BEC5", text: L(`Зміна Дня ${state.daySpec.dayNumber} почалася. Перевіряйте документи й багажник.`, `Day ${state.daySpec.dayNumber} shift started. Inspect docs & trunks.`) }
    ];
    state.logsExpanded = false;
    state.barrierState = "CLOSED";
    state.lastFeedback = null;
    prepareCurrentTraveler();
    saveStateToStorage();
    render();
  }

  function pushShiftLog(color, text) {
    if (!state.shiftLogs) state.shiftLogs = [];
    state.shiftLogs.unshift({ color, text });
    if (state.shiftLogs.length > 25) state.shiftLogs.length = 25;
  }

  function prepareCurrentTraveler() {
    state.selectedDocIdx = 0;
    state.uvActive = false;
    state.uvCompartmentRevealed = false;
    state.uvSecretClaimed = false;
    state.docFolded = true;
    state.vehicleInspected = false;
    state.trunkPanelOpen = false;
    state.checkedZones = [];
    state.zoneCheckMsg = null;
    state.interrogated = false;
    state.bribeAccepted = false;
    state.reactionState = "NONE";
    state.coffeeTipGiven = false;
    state.intimidateUsed = false;
    state.intimidateBribeBoosted = false;
    state.intimidateClueMsg = null;
    state.intimidateClueIsWarn = false;
    state.justShook = false;
    state.spottedCodes = [];
    state.inspectMode = false;
    state.justUnfoldedDoc = false;
    state.oblikScanned = false;
    const t = state.queue[state.travelerIdx];
    state.oblikIsScreenshot = Boolean(t && t.violations.some(v => v.code === "INVALID_QR_CODE") && Math.random() < 0.5);
    const zones = ["TRUNK", "SPARE", "GLOVE"];
    state.dogTargetZone = (t && (t.hasContraband || t.storyTag === "DUAL_CITIZEN")) ? pick(zones) : null;
    if (t && !t.storyTag) {
      const h = Math.abs((t.id || "TRV").split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7));
      state.currentUvEasterEgg = (h % 2 === 0) ? UV_SECRET_STAMPS[h % UV_SECRET_STAMPS.length] : null;
    } else {
      state.currentUvEasterEgg = null;
    }
  }

  setInterval(() => {
    if (state.phase !== "BOOTH_SHIFT" || state.sirenActive) return;
    const encDialog = document.getElementById("encounter-dialog");
    if (encDialog && encDialog.open) return;

    state.shiftSec = Math.max(0, state.shiftSec - 1);
    if (state.shiftHasSiren && !state.sirenResolved && !state.sirenActive && state.shiftSec <= state.sirenTriggerSec) {
      state.sirenActive = true;
      audio.playSiren();
      openSirenModal();
    }
    if (state.shiftSec === 0) {
      finishShift();
      return;
    }
    updateMood();
    const timerEl = document.getElementById("hud-timer");
    if (timerEl) {
      timerEl.textContent = `${tr(L("День", "Day"), state.lang)} ${state.daySpec.dayNumber} • ⏱ ${state.shiftSec}s`;
    }
  }, 1000);

  function updateMood() {
    const t = state.queue[state.travelerIdx];
    if (state.phase === "MAIN_MENU" || state.phase === "ARCHIVE") {
      audio.mood = "MENU";
    } else if (state.phase === "HOME_EVENING" || state.phase === "SHIFT_SUMMARY") {
      audio.mood = "EVENING";
    } else if (state.phase === "ENDING") {
      audio.mood = "ENDING";
    } else if (state.sirenActive || (state.phase === "BOOTH_SHIFT" && (state.shiftSec <= 45 || state.nabkRisk >= 65 || (t && t.isWantedTarget)))) {
      audio.mood = "TENSE";
    } else if (state.phase === "BOOTH_SHIFT") {
      audio.mood = "BOOTH_NORMAL";
    } else {
      audio.mood = "CALM_DARK";
    }
  }

  function finishShift() {
    state.phase = "SHIFT_SUMMARY";
    state.sirenActive = false;
    state.nextBribeBoost = 0;
    if (state.shiftBribesTotal === 0 && state.shiftProcessed >= 5) {
      unlockAgencyBadge("NABK_CLEAN");
      state.underSurveillance = false;
    }
    state.tonightBills = pickTonightBills();
    saveStateToStorage();
    render();
  }

  function makeDecision(decisionType) {
    const t = state.queue[state.travelerIdx];
    if (!t) return;

    const isApprove = decisionType === "APPROVE";
    const isDetain = decisionType === "DETAIN";
    if (state.bribeAccepted && !isApprove && (!t.bribeOffer || !t.bribeOffer.isFriendlyGift)) {
      return;
    }
    const bribeOfferInfo = getComputedBribe(t.bribeOffer);
    const criminalBribeOffer = Boolean(
      t.bribeOffer &&
      !t.bribeOffer.isFriendlyGift &&
      !state.bribeAccepted &&
      bribeOfferInfo &&
      (bribeOfferInfo.isInstant || state.vehicleInspected || state.spottedCodes.length > 0 || state.interrogated)
    );
    const requiresDetain = t.isWantedTarget || t.violations.some(v => v.requiresDetention);
    const canDetain = requiresDetain || criminalBribeOffer;
    const excessiveDetain = isDetain && !t.shouldBeApproved && !canDetain;

    let ruleCorrect = false;
    let usdBonus = 0;
    if (decisionType === "APPROVE") ruleCorrect = t.shouldBeApproved;
    else if (decisionType === "DENY") ruleCorrect = !t.shouldBeApproved && !t.isWantedTarget;
    else if (decisionType === "DETAIN") ruleCorrect = (!t.shouldBeApproved || criminalBribeOffer) && canDetain;

    const bribedPass = state.bribeAccepted && isApprove;
    const isStingOrRaid = bribedPass && (t.storyTag === "NABK_STING" || (state.nabkRisk >= 75 && Math.random() < 0.35));
    const rank = getRank();
    const meta = getMetaPerkFlags();

    let salaryDelta = 0, fineDelta = 0, detainBonus = 0;
    if (bribedPass) {
      // Bribe pass: no official salary, no cash fine! Only sanctions (reprimand) if caught in a sting/raid!
      if (isStingOrRaid) {
        state.nabkRisk = Math.min(100, state.nabkRisk + 22);
        state.sbkRep = Math.max(0, state.sbkRep - 15);
        state.underSurveillance = true;
        if (!state.isUndercoverSbkAgent) {
          state.reprimands = (state.reprimands || 0) + 1;
          state.gotReprimandToday = true;
        }
      } else {
        if (t.isWantedTarget || t.storyTag === "FSM_SPY" || t.storyTag === "SABOTEUR" || t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE" || t.storyTag === "VIP_DIVERSE") {
          state.sbkRep = Math.max(0, state.sbkRep - 26);
        }
        if (state.ownedAssets.includes("laser_plate_reader")) {
          state.shiftSec += 3;
        }
        state.shiftCorrect += 1;
      }
    } else if (ruleCorrect) {
      const salMult = (state.sandboxMod && state.sandboxMod.salaryMult ? state.sandboxMod.salaryMult : 1.0) * meta.salaryBonusMult;
      const detectorBonus = state.ownedAssets.includes("money_detector") ? 120 : 0;
      salaryDelta = Math.round(rank.salary * salMult) + detectorBonus;
      if (isDetain && canDetain) {
        const badges = loadAgencyBadges();
        const undercoverBounty = state.isUndercoverSbkAgent ? 1500 : 0;
        const isHighValueSpyOrVip = t.isWantedTarget || t.storyTag === "FSM_SPY" || t.storyTag === "SABOTEUR" || t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE";
        const bountyDay = state.daySpec ? state.daySpec.dayNumber : 1;
        const bountyRamp = Math.min(1.4, 0.8 + 0.08 * (bountyDay - 1));
        const baseDetainBounty = Math.round((isHighValueSpyOrVip
          ? (4500 + Math.floor(Math.random() * 2501))
          : (1800 + Math.floor(Math.random() * 1201))) * bountyRamp);
        const badgeBonus = (badges.includes("SBK_SHIELD") ? 800 : 0) + (badges.includes("VSP_GUARD") && (t.storyTag === "DUAL_CITIZEN" || t.storyTag === "VIP_DIVERSE") ? 1200 : 0);
        const tabletBonus = state.ownedAssets.includes("sbk_database_tablet") ? Math.round(baseDetainBounty * 0.2) : 0;
        const amberBonus = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_AMBER_BEETLE")) ? Math.round(baseDetainBounty * 0.15) : 0;
        detainBonus = baseDetainBounty + undercoverBounty + badgeBonus + tabletBonus + amberBonus + (state.sandboxMod ? (state.sandboxMod.detainExtra || 0) : 0);
        if (isHighValueSpyOrVip) {
          usdBonus = Math.round((120 + Math.floor(Math.random() * 131)) * bountyRamp) + (state.isUndercoverSbkAgent ? 100 : 0);
        } else {
          usdBonus = 0;
        }
        state.usd += usdBonus;
        state.sbkRep = Math.min(100, state.sbkRep + (isHighValueSpyOrVip ? 14 : 4));
        state.totalCareerDetained += 1;
        if (state.totalCareerDetained >= 3) unlockAgencyBadge("SBK_SHIELD");
        if (t.storyTag === "FSM_SPY") { unlockAgencyBadge("GUR_FALCON"); unlockDiscovery("DISC_FSM_SPY"); }
        if (t.storyTag === "DUAL_CITIZEN") unlockAgencyBadge("VSP_GUARD");
        if (t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE" || t.isWantedTarget) {
          state.nabkRisk = Math.max(0, state.nabkRisk - 12);
          unlockDiscovery("DISC_VIP_CORRUPTOR");
        }
        if (state.isUndercoverSbkAgent) {
          state.spiesCaughtAsAgent += 1;
          state.nabkRisk = Math.max(0, state.nabkRisk - 8);
        }
      }
      if (state.ownedAssets.includes("laser_plate_reader")) {
        state.shiftSec += 3;
      }
      state.shiftCorrect += 1;
    } else {
      const isHighRiskTarget = t.isWantedTarget || t.storyTag === "FSM_SPY" || t.storyTag === "SABOTEUR" || t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE";
      if (isDetain && t.shouldBeApproved) {
        fineDelta = 1500;
        state.sbkRep = Math.max(0, state.sbkRep - 12);
        state.palychRep = Math.max(0, state.palychRep - 10);
      } else if (isApprove && !t.shouldBeApproved && isHighRiskTarget) {
        fineDelta = 3500;
        state.sbkRep = Math.max(0, state.sbkRep - 28);
        state.nabkRisk = Math.min(100, state.nabkRisk + 18);
        state.palychRep = Math.max(0, state.palychRep - 12);
      } else if (isApprove && !t.shouldBeApproved) {
        fineDelta = 1800;
        state.sbkRep = Math.max(0, state.sbkRep - 10);
        state.nabkRisk = Math.min(100, state.nabkRisk + 10);
        state.palychRep = Math.max(0, state.palychRep - 8);
      } else {
        fineDelta = excessiveDetain ? 650 : 800;
        if (state.shiftMistakes === 0 && rank.freeFirstMistake) {
          fineDelta = 0;
        } else if (state.shiftMistakes === 0 && meta.halfFirstFine) {
          fineDelta = Math.round(fineDelta * 0.5);
        }
        state.palychRep = Math.max(0, state.palychRep - 6);
      }
      if (state.ownedAssets.includes("tactical_vest")) fineDelta = Math.round(fineDelta * 0.75);
      else if (state.ownedAssets.includes("uv_spotlight")) fineDelta = Math.round(fineDelta * 0.90);
      if (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_TETERIV_METEOR")) fineDelta = Math.round(fineDelta * 0.92);
      state.shiftMistakes += 1;
    }

    // Add time per processed traveler so dynamic shifts reward pace!
    state.shiftSec = Math.min(320, state.shiftSec + ((ruleCorrect || (bribedPass && !isStingOrRaid)) ? 8 : 4));

    if (state.reprimands >= 3) {
      triggerEnding("FIRED_LOSER");
      return;
    }

    // Track all 12 Shytomyr Legends persistently + per run + award unique relics & gifts!
    let shytomyrBonusToast = null;
    if (t.storyTag && t.storyTag.startsWith("SHYTOMYR_") && isApprove) {
      if (!state.shytomyrFriendsMet.includes(t.storyTag)) {
        state.shytomyrFriendsMet.push(t.storyTag);
      }
      if (!state.shytomyrRelics) state.shytomyrRelics = [];
      const legSpec = SHYTOMYR_LEGENDS.find(s => s.tag === t.storyTag);
      if (legSpec && legSpec.gift) {
        const gf = legSpec.gift;
        if (gf.relicId && !state.shytomyrRelics.includes(gf.relicId)) {
          state.shytomyrRelics.push(gf.relicId);
          if (gf.relicId === "RELIC_AMBER_BEETLE") state.palychRep = Math.min(100, state.palychRep + 5);
        }
        if (gf.bonusMoney) detainBonus += gf.bonusMoney;
        if (gf.bonusUsd) { usdBonus += gf.bonusUsd; state.usd += gf.bonusUsd; }
        if (gf.bonusSec) state.shiftSec = Math.min(340, state.shiftSec + gf.bonusSec);
        if (gf.bonusSbk) state.sbkRep = Math.min(100, state.sbkRep + gf.bonusSbk);
        if (gf.bonusPalych) state.palychRep = Math.min(100, state.palychRep + gf.bonusPalych);
        if (gf.bonusRisk) state.nabkRisk = Math.max(0, state.nabkRisk + gf.bonusRisk);
        if (gf.bonusMorale) state.familyMorale = Math.min(100, state.familyMorale + gf.bonusMorale);
        shytomyrBonusToast = L(
          `${gf.icon} ШИТОМИРСЬКИЙ ПІДГІН: ${gf.title.uk} (${gf.desc.uk})!`,
          `${gf.icon} SHYTOMYR GIFT: ${gf.title.en} (${gf.desc.en})!`
        );
      }
      const globalShytomyr = recordUnlockedShytomyr(t.storyTag);
      if (globalShytomyr.length >= SHYTOMYR_LEGENDS.length && !state.shytomyrBrotherhoodUnlocked) {
        state.shytomyrBrotherhoodUnlocked = true;
        detainBonus += 1500;
        state.nabkRisk = Math.max(0, state.nabkRisk - 30);
        shytomyrBonusToast = L(
          "🧦 ОРДЕН ШИТОМИРА (12/12): Усі 12 легенд міста в зборі! +1500 🪙 на картку, імунітет і відкрито секретний титул Мера!",
          "🧦 ORDER OF SHYTOMYR (12/12): All 12 city legends welcomed! +1500 🪙 & Secret Mayor title unlocked!"
        );
      } else if (state.shytomyrFriendsMet.length > 0 && state.shytomyrFriendsMet.length % 3 === 0) {
        detainBonus += 300;
        shytomyrBonusToast = L(
          `🧦 ЗЕМЛЯЦЬКИЙ ПІДГІН (${globalShytomyr.length}/12): Громада Шитомира передала +300 🪙 на каву!`,
          `🧦 SHYTOMYR GIFT (${globalShytomyr.length}/12): +300 🪙 for shift coffee!`
        );
      }
    }

    if (t.storyTag === "INTEL_ALLY" && isApprove) {
      detainBonus += 200;
      usdBonus += 180;
      state.usd += 180;
      state.sbkRep = Math.min(100, state.sbkRep + 15);
      unlockAgencyBadge("GUR_FALCON");
    }

    if (t.storyTag === "TOLIK_RUN") {
      if (isApprove) state.tolikRep = Math.min(100, state.tolikRep + 20);
      else if (isDetain) state.tolikRep = Math.max(0, state.tolikRep - 25);
    }

    if (!state.campaignFlags) state.campaignFlags = {};
    if (t.storyTag === "DEPUTY_SON" && isApprove) state.campaignFlags.letDeputyPass = true;
    if (t.storyTag === "SABOTEUR" && isDetain && ruleCorrect) state.campaignFlags.caughtSpotter = true;
    if (t.storyTag === "AUNT_HALYA" && isApprove) state.campaignFlags.helpedHalya = true;
    if (t.storyTag === "NABK_STING" && !isApprove && !state.bribeAccepted) {
      state.campaignFlags.refusedNabk = true;
      unlockDiscovery("DISC_NABK_STING");
    }

    const netMoney = salaryDelta + detainBonus - fineDelta;
    state.money += netMoney;
    state.shiftProcessed += 1;
    if (isDetain) state.shiftDetained += 1;
    state.shiftFinesTotal += fineDelta;
    updateCareerStats({ processed: 1, detained: (isDetain && ruleCorrect) ? 1 : 0, cash: state.money });

    const bribeDetainMsg = (ruleCorrect && isDetain && !requiresDetain && criminalBribeOffer)
      ? (t.storyTag === "NABK_STING"
        ? L("Провокацію НАБК з міченими купюрами задокументовано! Спроба підкупу зафіксована.", "NABK marked-bill provocation documented! Bribery attempt recorded.")
        : L("Водій запропонував хабар службовій особі — оформлено кримінальний протокол (ст. 369)!", "Driver offered a bribe to an officer — criminal protocol filed!"))
      : null;

    state.barrierState = isApprove ? "OPEN_APPROVED" : (isDetain ? "SBK_ARREST_FLASH" : "CLOSED");
    state.lastFeedbackAt = Date.now();
    state.lastFeedback = {
      ok: ruleCorrect || (bribedPass && !isStingOrRaid),
      title: shytomyrBonusToast
        ? L("🧦 БРАТЕРСТВО М. ШИТОМИР!", "🧦 ORDER OF SHYTOMYR!")
        : (isStingOrRaid
          ? L("🚨 СПАЛИЛИ НА ХАБАРІ! (+1 ДОГАНА)", "🚨 BUSTED ON BRIBE! (+1 REPRIMAND)")
          : (bribedPass
            ? L("ЗАКРИТО ОЧІ (ЗА ХАБАР)", "LOOKED THE OTHER WAY (BRIBED)")
            : (bribeDetainMsg
              ? L("СПРОБУ ХАБАРЯ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "BRIBE ATTEMPT DETAINED! (+SBK BONUS)")
              : (ruleCorrect && isDetain ? L("КРИМІНАЛ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "CRIMINAL DETAINED! (+SBK BONUS)") : (ruleCorrect ? L("РІШЕННЯ ПРАВИЛЬНЕ", "CORRECT DECISION") : (excessiveDetain ? L("ПЕРЕВИЩЕННЯ! Треба ✖ ВІДМОВИТИ", "EXCESSIVE FORCE! Should ✖ DENY") : L("ПОМИЛКА ПРОТОКОЛУ! ШТРАФ", "PROTOCOL VIOLATION! FINE"))))))),
      detail: shytomyrBonusToast || (isStingOrRaid ? L("Ти впіймався на підставі! За 3 догани звільнять (зникає через день).", "Caught in a sting! 3 reprimands = fired (decays next clean day).") : null) || bribeDetainMsg || (isDetain
        ? (state.contentMode === "FULL_18_PLUS" ? t.arrestFull : t.arrestToned)
        : (bribedPass ? L("Без штрафу, але ризик НАБК зріс.", "No fine, but NABK risk increased.") : (ruleCorrect ? L("Оформлено за директивою ДПСК.", "Processed per SBGS directive.") : (t.violations[0] ? t.violations[0].title : L("Безпідставна відмова", "Wrongful denial"))))),
      moneyDelta: netMoney
    };
    if (!state.shiftLogs) state.shiftLogs = [];
    const uahPart = netMoney > 0 ? `+${netMoney} 🪙` : (netMoney < 0 ? `${netMoney} 🪙` : "");
    const usdPart = usdBonus > 0 ? `+${usdBonus} 💵` : "";
    const logSign = [uahPart, usdPart].filter(Boolean).join(" ");
    state.shiftLogs.unshift({
      color: state.lastFeedback.ok ? "#81C784" : "#FF8A80",
      text: L(
        `${state.lastFeedback.title.uk}${logSign ? " (" + logSign + ")" : ""} — ${state.lastFeedback.detail.uk}`,
        `${state.lastFeedback.title.en}${logSign ? " (" + logSign + ")" : ""} — ${state.lastFeedback.detail.en}`
      )
    });
    if (state.shiftLogs.length > 25) state.shiftLogs.length = 25;

    state.travelerIdx += 1;
    if (state.travelerIdx >= state.queue.length) {
      finishShift();
      return;
    }

    prepareCurrentTraveler();
    saveStateToStorage();
    render();

    if (state.totalCareerDetained >= 2 && !state.sbkRecruitmentOffered) {
      state.sbkRecruitmentOffered = true;
      saveStateToStorage();
      openSbkRecruitmentModal();
      return;
    }

    if (state.isUndercoverSbkAgent && state.spiesCaughtAsAgent >= 4 && !state.sbkColonelPromoted) {
      state.sbkColonelPromoted = true;
      saveStateToStorage();
      openSbkColonelPromotionModal();
      return;
    }

    if (state.travelerIdx === 2 && !state.radioDispatch) {
      const upcoming = state.queue.slice(state.travelerIdx).find(u => u && (u.isWantedTarget || u.storyTag === "FSM_SPY" || u.storyTag === "DUAL_CITIZEN" || u.storyTag === "VIP_DIVERSE"));
      if (upcoming) {
        state.radioDispatchAt = Date.now();
        const carShortUk = tr(upcoming.vehicleDesc, "UK").split("(")[0].trim();
        const carShortEn = tr(upcoming.vehicleDesc, "EN").split("(")[0].trim();
        const surnameUk = (upcoming.fullName.uk || "").split(" ").slice(-1)[0];
        const surnameEn = (upcoming.fullName.en || "").split(" ").slice(-1)[0];
        const useCarClue = ((state.daySpec ? state.daySpec.dayNumber : 1) % 2) === 1;
        state.radioDispatch = useCarClue
          ? L(
              `📞 РАЦІЯ СБК: «Увага! На під'їзді ${carShortUk} (номери уточнюються) — перевірте документи та багажник!»`,
              `📞 SBK RADIO: 'Alert! ${carShortEn} (plate unconfirmed) approaching — inspect docs & trunk!'`
            )
          : L(
              `📞 РАЦІЯ СБК: «Орієнтування на особу з прізвищем ${surnameUk} (транспорт невідомий) — перевірте папери уважно!»`,
              `📞 SBK RADIO: 'Partial alert for surname ${surnameEn} (vehicle unknown) — inspect docs carefully!'`
            );
        if (!state.shiftLogs) state.shiftLogs = [];
        state.shiftLogs.unshift({ color: "#64B5F6", text: state.radioDispatch });
        render();
      }
    }

    if (state.travelerIdx === 4 && !state.encounterTriggered) {
      state.encounterTriggered = true;
      let encPool = MID_SHIFT_ENCOUNTERS.filter(e => !usedEncounterIds.has(e.id));
      if (encPool.length === 0) {
        usedEncounterIds.clear();
        encPool = MID_SHIFT_ENCOUNTERS.slice();
      }
      const enc = pick(encPool);
      usedEncounterIds.add(enc.id);
      openEncounterModal(enc);
    }
  }

  function triggerEnding(explicitArchetypeId) {
    state.activeEndingId = explicitArchetypeId || null;
    state.phase = "ENDING";
    updateCareerStats({ gamesFinished: 1, cash: state.money });
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    render();
  }

  function advanceToNextDay(forceContinueFromCampaign) {
    const hasOffshoreShield = state.ownedAssets.includes("cyprus_offshore") || state.sbkColonelPromoted;
    if (!hasOffshoreShield && state.nabkRisk >= 75) {
      state.underSurveillance = true;
    }
    const bustedByCounterIntel = state.nabkRisk >= 100 || (!hasOffshoreShield && state.nabkRisk >= 95 && state.underSurveillance && state.shiftBribesTotal > 0);
    if (bustedByCounterIntel) {
      triggerEnding("NABK_PRISONER");
      return;
    }

    const boughtAnyHome = state.purchasedExpensesToday.length > 0;
    const yachtMorale = state.ownedAssets.includes("monako_yacht") ? 10 : 0;
    const derunMorale = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_GOLD_DERUN")) ? 6 : 0;
    state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + (boughtAnyHome ? 0 : -6) + yachtMorale + derunMorale));

    if (state.escapeFund >= getEscapeTarget() && state.tolikRep >= getEscapeTolikRep() && !state.tolikEscapeOffered) {
      state.tolikEscapeOffered = true;
      openTolikEscapeOfferModal();
      return;
    }

    const nextIdx = state.dayIndex + 1;
    if (!state.isSandbox && nextIdx >= ACT_ONE_DAYS.length && !forceContinueFromCampaign) {
      if (!state.factionFinaleDone) {
        state.factionFinaleDone = true;
        openFactionFinaleModal();
        return;
      }
      openCampaignMilestoneModal();
      return;
    }

    state.dayIndex = nextIdx;
    state.eveningToast = null;
    if ((state.reprimands || 0) > 0 && !state.gotReprimandToday) {
      state.reprimands = Math.max(0, state.reprimands - 1);
    }
    state.gotReprimandToday = false;
    state.money += getPassiveRent();
    state.usd += getPassiveUsd();
    const prevRank = getRank();
    const badgeHeal = loadAgencyBadges().includes("NABK_CLEAN") ? 5 : 0;
    state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + getDailyAssetRisk() - (prevRank.dailyRiskHeal || 0) - badgeHeal));

    if (state.isSandbox) {
      state.daySpec = Object.assign({}, state.daySpec, { dayNumber: nextIdx + 1 });
      const rk = getRank();
      const built = buildRandomSandboxDay(nextIdx + 1, rk.title.uk, rk.title.en);
      state.sandboxMod = built.mod;
      state.daySpec = built.daySpec;
    } else {
      state.daySpec = ACT_ONE_DAYS[nextIdx];
    }

    state.queue = generateDailyQueue(state.daySpec, state.isSandbox ? 14 : 12);
    state.shiftProcessed = 0;
    state.shiftCorrect = 0;
    state.shiftMistakes = 0;
    state.shiftDetained = 0;
    state.shiftBribesTotal = 0;
    state.shiftFinesTotal = 0;
    state.obnalUsedToday = 0;
    state.phase = "MORNING_BRIEFING";
    if (!state.isSandbox) saveCampaignCheckpoint(state.daySpec.dayNumber);
    saveStateToStorage();
    render();
  }

  function openRulesModal() {
    const dlg = document.getElementById("rules-dialog");
    const titleEl = document.getElementById("rules-dialog-title");
    const bodyEl = document.getElementById("rules-dialog-body");
    if (!dlg || !bodyEl) return;
    titleEl.textContent = tr(L(`Директиви на День ${state.daySpec.dayNumber}`, `Day ${state.daySpec.dayNumber} Directives`), state.lang);
    bodyEl.innerHTML = "";
    state.daySpec.rulesList.forEach(r => {
      const p = document.createElement("p");
      p.textContent = tr(r, state.lang);
      bodyEl.appendChild(p);
    });
    if (state.daySpec.wantedHint) {
      const w = document.createElement("p");
      w.style.color = "#FF5252";
      w.style.fontWeight = "700";
      w.textContent = "🎯 " + tr(state.daySpec.wantedHint, state.lang);
      bodyEl.appendChild(w);
    }
    const guide = document.createElement("div");
    guide.style.marginTop = "6px";
    guide.style.padding = "8px";
    guide.style.borderRadius = "6px";
    guide.style.backgroundColor = "rgba(21,101,192,0.22)";
    guide.textContent = tr(
      L("⚖️ СТАТУТ ДПСК:\n• ✖ ВІДМОВИТИ: прострочена дата документа або немає підстави виїзду для чоловіків 18–60.\n• 🚨 СБК / АРЕШТ: підроблена печатка, незбіг фото/ПІБ, невідповідність кольору/моделі транспорту, тайник із контрабандою або шпигун СБК.\n• 💡 Порада: користуйся УФ-ліхтарем, кавою, тиском по склу та псом «Бавовною».",
        "⚖️ SBGS CODE:\n• ✖ DENY: expired date or missing exit permit for males 18–60.\n• 🚨 DETAIN: forged seal, mismatched photo/name, vehicle color/model clone, hidden contraband or SBK target.\n• 💡 Tip: use UV beam, coffee, knocking on glass & sniffer dog Bavovna."),
      state.lang
    );
    guide.style.whiteSpace = "pre-line";
    bodyEl.appendChild(guide);
    dlg.showModal();
  }

  function openWantedDossierModal() {
    const dlg = document.getElementById("wanted-dialog");
    const listEl = document.getElementById("wanted-dialog-list");
    const titleEl = document.getElementById("wanted-dialog-title");
    const subEl = document.getElementById("wanted-dialog-sub");
    if (!dlg || !listEl) return;
    titleEl.textContent = tr(L("🎯 ДОВІДНИК РОЗШУКУ СБК / ВСП", "🎯 SBK / VSP WANTED DOSSIER"), state.lang);
    subEl.textContent = tr(
      L("Ці особи їдуть у поточній черзі. У них гарантовано є порушення в документах або контрабанда!",
        "These targets are in today's queue — all carry real document or smuggling violations!"),
      state.lang
    );
    listEl.innerHTML = "";
    const targets = state.queue.filter(t => t && t.isWantedTarget && !t.shouldBeApproved).slice(0, 3);
    if (targets.length === 0) {
      const p = document.createElement("p");
      p.style.fontSize = "12.5px";
      p.textContent = tr(L("Сьогодні особливих орієнтувань у черзі немає — перевіряйте загальні правила.", "No special wanted targets in this shift — follow standard directives."), state.lang);
      listEl.appendChild(p);
    } else {
      const hasTablet = state.ownedAssets.includes("sbk_database_tablet");
      targets.forEach((wt, idx) => {
        const clueMode = (idx + ((wt.id || "").charCodeAt(4) || 0)) % 3;
        const card = document.createElement("div");
        card.style.cssText = "display:flex;gap:10px;align-items:center;background:#263238;padding:8px;border-radius:8px;border:1px solid #FF5252;";
        const cid = `wanted-mug-${idx}`;
        const nameLine = clueMode === 2
          ? `${tr(L(`Ціль #${idx + 1}`, `Target #${idx + 1}`), state.lang)}: ${tr(wt.fullName, state.lang)}`
          : (clueMode === 1
            ? `${tr(L(`Ціль #${idx + 1}`, `Target #${idx + 1}`), state.lang)}: ${hasTablet ? tr(wt.fullName, state.lang).split(" ")[0] + " …" : tr(L("Особу не встановлено", "Unidentified"), state.lang)}`
            : `${tr(L(`Ціль #${idx + 1} (Фоторобот)`, `Target #${idx + 1} (Mugshot)`), state.lang)}: ${tr(L("Невідомо (чужі/підроблені документи)", "Unknown (stolen/fake ID)"), state.lang)}`);
        const vehLine = clueMode === 1
          ? tr(wt.vehicleDesc, state.lang)
          : (clueMode === 0
            ? (hasTablet ? tr(wt.vehicleDesc, state.lang).split("•")[0].trim() : tr(L("Транспорт не встановлено", "Vehicle unknown"), state.lang))
            : (hasTablet ? tr(wt.vehicleDesc, state.lang).split("(")[0].trim() : tr(L("Марку/номер не встановлено", "Unidentified vehicle"), state.lang)));
        card.innerHTML = `
          <canvas id="${cid}" width="64" height="64" style="width:56px;height:56px;background:#D7CCC8;border-radius:6px;flex-shrink:0;"></canvas>
          <div style="flex:1;font-size:12px;">
            <div style="color:#FF8A80;font-weight:800;">${nameLine}</div>
            <div style="color:#CFD8DC;margin-top:2px;">🚘 ${vehLine}</div>
            <div style="color:#FFE082;font-size:11px;margin-top:2px;">⚠️ ${tr(L("Орієнтування СБК: звіряйте прикмети, документи й багажник", "SBK Alert: verify traits, documents & trunk"), state.lang)}</div>
          </div>
        `;
        listEl.appendChild(card);
        const c = document.getElementById(cid);
        if (c) {
          const wctx = c.getContext("2d");
          if (clueMode === 0) {
            drawPortrait(wctx, wt.portrait, 32, 62, 0.44);
          } else {
            wctx.fillStyle = "#1E272C";
            wctx.fillRect(0, 0, 64, 64);
            wctx.fillStyle = "#455A64";
            wctx.beginPath(); wctx.arc(32, 24, 12, 0, Math.PI * 2); wctx.fill();
            wctx.beginPath(); wctx.arc(32, 58, 20, Math.PI, 0); wctx.fill();
            wctx.fillStyle = "#FFD54F";
            wctx.font = "bold 20px monospace";
            wctx.fillText("?", 26, 32);
          }
        }
      });
    }
    dlg.showModal();
  }

  function openSirenModal() {
    const dlg = document.getElementById("siren-dialog");
    if (!dlg) return;
    const pauseSec = state.sirenPauseSec || 24;
    const rebSec = Math.max(6, Math.round(pauseSec * 0.4));
    const hasSbkLink = state.sbkRep >= 45;
    const canPayFuel = state.money >= 200;

    document.getElementById("siren-dialog-title").textContent = tr(L("🚨 ПОВІТРЯНА ТРИВОГА: КПП ЗАКРИТО!", "🚨 AIR-RAID SIREN: CHECKPOINT CLOSED!"), state.lang);
    document.getElementById("siren-dialog-desc").textContent = tr(
      L(`Над пунктом кружляє «мопед»! Шлагбаум заблоковано, оформлення черги зупинено на ${pauseSec}с, поки ППО не дасть відбій.`,
        `A drone is circling over the checkpoint! Traffic is halted for ${pauseSec}s until air-defense clears the sky.`),
      state.lang
    );
    const bShelter = document.getElementById("btn-siren-shelter");
    const bWork = document.getElementById("btn-siren-work");
    bShelter.textContent = tr(L(`🛡 В укриття — перечекати (-${pauseSec}s, +5 СБК)`, `🛡 Take Shelter (-${pauseSec}s, +5 SBK)`), state.lang);
    bWork.disabled = !hasSbkLink && !canPayFuel;
    if (hasSbkLink) {
      bWork.textContent = tr(L(`📡 Викликати мобільне ППО/РЕБ (-${rebSec}s, зв'язки СБК)`, `📡 Call Mobile Air-Defense (-${rebSec}s, SBK link)`), state.lang);
    } else if (canPayFuel) {
      bWork.textContent = tr(L(`⛽ Запустити генератор РЕБ (-${rebSec}s, -200 🪙)`, `⛽ Run EW Jammer Generator (-${rebSec}s, -200 🪙)`), state.lang);
    } else {
      bWork.textContent = tr(L(`📡 РЕБ недоступний (треба СБК ≥ 45 або 200 🪙)`, `📡 Jammer unavailable (need SBK ≥ 45 or 200 🪙)`), state.lang);
    }

    bShelter.onclick = () => {
      audio.playTap();
      state.sirenActive = false;
      state.sirenResolved = true;
      state.shiftSec = Math.max(8, state.shiftSec - pauseSec);
      state.sbkRep = Math.min(100, state.sbkRep + 5);
      dlg.close();
      render();
    };
    bWork.onclick = () => {
      if (!hasSbkLink && !canPayFuel) return;
      audio.playTap();
      state.sirenActive = false;
      state.sirenResolved = true;
      state.shiftSec = Math.max(8, state.shiftSec - rebSec);
      if (!hasSbkLink) {
        state.money = Math.max(0, state.money - 200);
      }
      dlg.close();
      render();
    };
    dlg.showModal();
  }

  function openEncounterModal(enc) {
    const dlg = document.getElementById("encounter-dialog");
    if (!dlg) return;
    document.getElementById("encounter-dialog-title").textContent = tr(enc.title, state.lang);
    document.getElementById("encounter-dialog-desc").textContent = tr(enc.desc, state.lang);
    const c = document.getElementById("encounter-canvas");
    if (window._encounterAnimRaf) {
      cancelAnimationFrame(window._encounterAnimRaf);
      window._encounterAnimRaf = null;
    }
    if (c) {
      const ctx = c.getContext("2d");
      const encId = (enc.id || "").toLowerCase();
      const isAgency = encId.includes("sbk") || encId.includes("radar") || encId.includes("wanted") || encId.includes("gur");
      const isNightCrime = encId.includes("tolik") || encId.includes("bribe") || encId.includes("mafia") || encId.includes("nabk");
      const drawEncFrame = (tSec) => {
        const w = c.width, h = c.height;
        ctx.clearRect(0, 0, w, h);
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        if (isAgency) {
          bg.addColorStop(0, "#0A192F");
          bg.addColorStop(1, "#162C46");
        } else if (isNightCrime) {
          bg.addColorStop(0, "#1C1427");
          bg.addColorStop(1, "#2C1B1E");
        } else {
          bg.addColorStop(0, "#242A24");
          bg.addColorStop(1, "#3A3124");
        }
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        if (isAgency) {
          // Animated radar/police sweep glow
          const pulse = 0.25 + 0.2 * Math.sin(tSec * 4.5);
          ctx.fillStyle = `rgba(41, 121, 255, ${pulse.toFixed(2)})`;
          ctx.beginPath(); ctx.arc(w * 0.16, h * 0.22, 22, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(100, 181, 246, 0.35)";
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(w * 0.84, h * 0.26, 12 + (tSec * 12) % 16, 0, Math.PI * 2); ctx.stroke();
        } else if (isNightCrime) {
          const glow = 0.18 + 0.12 * Math.sin(tSec * 3.2);
          ctx.fillStyle = `rgba(224, 177, 69, ${glow.toFixed(2)})`;
          ctx.beginPath(); ctx.arc(w * 0.2, h * 0.78, 28, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(255, 224, 130, 0.15)";
          ctx.beginPath(); ctx.arc(w * 0.5, h * 0.32, 36 + Math.sin(tSec * 2) * 3, 0, Math.PI * 2); ctx.fill();
        }
        drawPortrait(ctx, enc.portrait, w * 0.5, h * 0.98, 0.58, { isLive: true, timeSec: tSec });
      };
      let lastEncDraw = 0;
      const tickEnc = (nowTs) => {
        if (!dlg.open) {
          window._encounterAnimRaf = null;
          return;
        }
        if (!lastEncDraw || nowTs - lastEncDraw >= 36) {
          lastEncDraw = nowTs;
          drawEncFrame((nowTs || Date.now()) * 0.001);
        }
        window._encounterAnimRaf = requestAnimationFrame(tickEnc);
      };
      drawEncFrame(Date.now() * 0.001);
      if (typeof requestAnimationFrame === "function") {
        window._encounterAnimRaf = requestAnimationFrame(tickEnc);
      }
    }
    const optsWrap = document.getElementById("encounter-options");
    optsWrap.innerHTML = "";
    enc.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-secondary";
      btn.style.color = "#E0B145";
      btn.textContent = tr(opt.label, state.lang);
      if (opt.usdDelta && opt.usdDelta < 0 && state.usd < Math.abs(opt.usdDelta)) {
        btn.disabled = true;
      }
      btn.addEventListener("click", () => {
        if (opt.tapSound) audio.playTap();
        else audio.playBribe();
        state.money = Math.max(0, state.money + opt.moneyDelta);
        if (opt.usdDelta) state.usd = Math.max(0, state.usd + opt.usdDelta);
        state.shiftSec = Math.max(10, state.shiftSec + opt.timeDelta);
        state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + opt.riskDelta));
        state.sbkRep = Math.max(0, Math.min(100, state.sbkRep + opt.sbkDelta));
        state.tolikRep = Math.max(0, Math.min(100, state.tolikRep + opt.tolikDelta));
        state.palychRep = Math.max(0, Math.min(100, state.palychRep + opt.palychDelta));
        state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + opt.moraleDelta));
        dlg.close();
        if (typeof opt.onSelect === "function") {
          const handledRender = opt.onSelect();
          if (handledRender === true) return;
        }
        state.lastFeedback = {
          ok: opt.moneyDelta >= 0,
          title: enc.title,
          detail: opt.outcome,
          moneyDelta: opt.moneyDelta
        };
        saveStateToStorage();
        render();
      });
      optsWrap.appendChild(btn);
    });
    dlg.showModal();
  }

  function openSbkRecruitmentModal() {
    openEncounterModal({
      id: "sbk_undercover_recruitment",
      title: L("🕵️ ВЕРБУВАННЯ СБК: ПОЗИВНИЙ «КОРДОН-7»", "🕵️ SBK RECRUITMENT: CALLSIGN 'BORDER-7'"),
      desc: L(
        "Майор СБК «Тихий» заходить у будку через службовий вхід і кладе на стіл чорне посвідчення:\n«Інспекторе, ти взяв уже двох серйозних порушників. Нам потрібна своя негласна людина прямо в будці, під носом у Пал Палича та контрабандистів.\n\nПідписуй згоду як Негласний оперативник «Кордон-7»: отримуєш +5 500 🪙 окладу щоранку, +1 500 🪙 премії за кожного шпигуна, імунітет від доган Палича та -35% ціни на «Кришу»! Для легенди можеш брати конверти, але не доводь НАБК до обшуків!»",
        "SBK Major 'Quiet' enters the booth and places a black folder on your desk:\n'Inspector, you have sharp eyes. Sign on as Undercover Agent Border-7: earn +5,500 🪙 covert pay every morning, +1,500 🪙 extra bounty per spy, protection from Palych's reprimands & -35% Krysha cost!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "accept_sbk_agent",
          label: L("🕵️ Стати негласним агентом СБК «Кордон-7»! (+2 500 🪙 +350 💵)", "🕵️ Become Undercover Agent 'Border-7'! (+2,500 🪙 +350 💵)"),
          outcome: L("Ти підписав таємну угоду! Тепер ти негласний агент СБК «Кордон-7» (ціль: 4 агенти)!", "You signed the covert agreement! Hunt 4 enemy operatives!"),
          moneyDelta: 2500, usdDelta: 350, timeDelta: 15, riskDelta: -15, sbkDelta: 20, tolikDelta: 0, palychDelta: 0, moraleDelta: 10,
          onSelect: () => { state.isUndercoverSbkAgent = true; unlockDiscovery("SERV_SBK_AGENT"); }
        },
        {
          id: "decline_sbk_agent",
          label: L("🙅‍♂️ Відмовитися («Я простий прикордонник, мені ці шпигунські ігри не треба»)", "🙅‍♂️ Decline ('Keep me out of spy games')"),
          outcome: L("Майор «Тихий» ховає папку: «Як знаєш, інспекторе. Але ми за тобою спостерігаємо.»", "Major 'Quiet' pockets the folder: 'Suit yourself, inspector.'"),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: -5, tolikDelta: 0, palychDelta: 5, moraleDelta: 0
        }
      ]
    });
  }

  function openSbkColonelPromotionModal() {
    unlockDiscovery("SERV_SBK_COLONEL");
    openEncounterModal({
      id: "sbk_colonel_climax",
      title: L("🎖️ СПЕЦОПЕРАЦІЯ УСПІШНА: ПОГОНИ ПОЛКОВНИКА СБК!", "🎖️ OPERATION COMPLETE: SBK COLONEL PROMOTION!"),
      desc: L(
        "Ти ліквідував цілу мережу шпигунів та контрабандистів, працюючи під прикриттям! Майор «Тихий» особисто вручає тобі коробку з погонами Полковника СБК та премію 6 500 🪙:\n\n«Агенте «Кордон-7», штаб у захваті! Ти можеш залишитися на пункті Таємним Куратором кордону (ставка 1 800 🪙/людину + 12 000 🪙 щоранку), або переїхати в Центральний Штаб у Кийграді!»",
        "You dismantled the spy ring while undercover! Major 'Quiet' hands you Colonel's epaulets and a 6,500 🪙 reward:\n\n'Stay at the checkpoint as Secret Sector Commander (1,800 🪙/traveler + 12,000 🪙/day) or transfer to Central HQ!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "stay_undercover_colonel",
          label: L("🕵️ Залишитися Таємним Полковником і ПРОДОВЖУВАТИ ГРУ! (+6 500 🪙 +1 500 💵)", "🕵️ Stay as Covert Colonel & KEEP PLAYING! (+6,500 🪙 +1,500 💵)"),
          outcome: L("Ти сховав погони полковника в сейф і залишився негласним господарем кордону!", "You locked the Colonel's epaulets in the safe and stayed as covert master of the border!"),
          moneyDelta: 6500, usdDelta: 1500, timeDelta: 30, riskDelta: -40, sbkDelta: 30, tolikDelta: 0, palychDelta: 0, moraleDelta: 25
        },
        {
          id: "retire_to_sbk_hq",
          label: L("🏛️ Очолити Центральний Штаб у Кийграді (+1 500 💵 премії — Досьє)", "🏛️ Lead Central HQ in Kyihrad (+1,500 💵 — Epilogue Dossier)"),
          outcome: L("Ти передаєш ключі від будки й від'їжджаєш до столиці!", "You depart for Kyihrad!"),
          moneyDelta: 6500, usdDelta: 1500, timeDelta: 0, riskDelta: 0, sbkDelta: 30, tolikDelta: 0, palychDelta: 0, moraleDelta: 20,
          onSelect: () => { triggerEnding("SBK_SHADOW_COLONEL"); return true; }
        }
      ]
    });
  }

  function openFactionFinaleModal() {
    let mission;
    if (state.sbkRep >= 70 && state.sbkRep >= state.tolikRep && state.sbkRep >= state.palychRep) {
      mission = {
        id: "faction_finale_sbk",
        title: L("🦅 ФІНАЛЬНА СПЕЦМІСІЯ СБК ТА ГУР-М: «ПЕРЕХВАТ-7»", "🦅 SBK & GUR-M FINALE: 'INTERCEPT-7'"),
        desc: L(
          "Твоя репутація у розвідки на максимумі! Майор «Тихий» пропонує фінальну операцію на Дені 7: затримати озброєний кортеж резидента ФСМ на сусідньому лісовому виїзді.",
          "Your intel standing is at its peak! Major 'Quiet' offers a final operation on Day 7: intercept an armed FSM resident convoy!"
        ),
        portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "NONE" },
        options: [
          {
            id: "finale_sbk_raid",
            label: L("🫡 Очолити штурм із ГУР-М (+4 000 🪙, +2 500 💵, +25 СБК)", "🫡 Lead the GUR-M raid (+4,000 🪙, +2,500 💵, +25 SBK)"),
            outcome: L("Блискуче захоплення! Спецслужби вручають нагороду та очищають досьє!", "Flawless capture! Intel awards you and clears your dossier!"),
            moneyDelta: 4000, timeDelta: 0, riskDelta: -25, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 15,
            onSelect: () => { state.usd += 2500; unlockAgencyBadge("GUR_FALCON"); unlockDiscovery("SERV_GUR_FINALE"); openCampaignMilestoneModal(); return true; }
          },
          {
            id: "finale_sbk_cover",
            label: L("📡 Прикрити операцію з КПП (+2 000 🪙, +10 СБК)", "📡 Provide checkpoint cover (+2,000 🪙, +10 SBK)"),
            outcome: L("Усе пройшло тихо й без втрат!", "Smooth and clean!"),
            moneyDelta: 2000, timeDelta: 0, riskDelta: -10, sbkDelta: 10, tolikDelta: 0, palychDelta: 0, moraleDelta: 10,
            onSelect: () => { unlockDiscovery("SERV_GUR_FINALE"); openCampaignMilestoneModal(); return true; }
          }
        ]
      };
    } else if (state.tolikRep >= 60 && state.tolikRep >= state.palychRep) {
      mission = {
        id: "faction_finale_tolik",
        title: L("🚐 ФІНАЛЬНА МІСІЯ СИНДИКАТУ ТОЛІКА: «ЗАХІД-ЕКСПРЕС»", "🚐 TOLIK SYNDICATE FINALE: 'WEST-EXPRESS'"),
        desc: L(
          "Толік довіряє тобі на всі 100%! Опівночі він жене 3 фури з контрабандою й просить підняти шлагбаум востаннє за частку в 5 000 💵.",
          "Tolik trusts you 100%! At midnight he's rolling 3 smuggling trucks through and offers a 5,000 💵 cut."
        ),
        portrait: { gender: "M", skinTone: 1, faceShape: 2, hairStyle: 1, hairColor: 1, facialHair: 2, glasses: 1, headwear: 3, scarOrDetail: 0, expression: 1, specialId: "TOLIK_COURIER" },
        options: [
          {
            id: "finale_tolik_pass",
            label: L("💵 Пропустити конвой Толіка (+5 000 💵, +22% НАБК)", "💵 Wave Tolik's convoy (+5,000 💵, +22% NABK)"),
            outcome: L("Фури пролетіли за хвилину, а в кишені хрустять пачки баксіків!", "Trucks cleared in a minute, pockets heavy with cash!"),
            moneyDelta: 0, timeDelta: 0, riskDelta: 22, sbkDelta: -15, tolikDelta: 30, palychDelta: 0, moraleDelta: 10,
            onSelect: () => { state.usd += 5000; unlockDiscovery("SERV_TOLIK_FINALE"); openCampaignMilestoneModal(); return true; }
          },
          {
            id: "finale_tolik_bust",
            label: L("🚨 Злити конвой СБК (+6 000 🪙, -25% НАБК)", "🚨 Tip off SBK (+6,000 🪙, -25% NABK)"),
            outcome: L("СБК перехоплює фури, Толік у люті, але твоя репутація чиста!", "SBK seizes the trucks! Tolik is furious, your record is spotless!"),
            moneyDelta: 6000, timeDelta: 0, riskDelta: -25, sbkDelta: 30, tolikDelta: -40, palychDelta: 0, moraleDelta: 0,
            onSelect: () => { unlockAgencyBadge("SBK_SHIELD"); unlockDiscovery("SERV_TOLIK_FINALE"); openCampaignMilestoneModal(); return true; }
          }
        ]
      };
    } else if (state.palychRep >= 65) {
      mission = {
        id: "faction_finale_palych",
        title: L("🧢 ФІНАЛЬНА МІСІЯ ПАЛ ПАЛИЧА: «ВЕЛИКИЙ КОШТОРИС»", "🧢 PALYCH FINALE: 'THE GRAND BUDGET'"),
        desc: L(
          "Пал Палич задоволений твоєю вірністю! Перед ревізією з Києва він пропонує тихо списати «генераторний бюджет» навпіл (+2 500 💵).",
          "Palych appreciates your loyalty! Before the Kyiv audit, he offers to split a 'generator fund' (+2,500 💵)."
        ),
        portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "PALYCH_BOSS" },
        options: [
          {
            id: "finale_palych_split",
            label: L("🤝 Розпилити бюджет із Паличем (+2 500 💵, +15% НАБК)", "🤝 Split budget with Palych (+2,500 💵, +15% NABK)"),
            outcome: L("Частка на руках, Палич тисне руку!", "Share pocketed, Palych salutes you!"),
            moneyDelta: 0, timeDelta: 0, riskDelta: 15, sbkDelta: 0, tolikDelta: 0, palychDelta: 25, moraleDelta: 15,
            onSelect: () => { state.usd += 2500; unlockDiscovery("SERV_PALYCH_FINALE"); openCampaignMilestoneModal(); return true; }
          },
          {
            id: "finale_palych_clean",
            label: L("📋 Відмовитися й подати чесний звіт (+3 500 🪙, -10% НАБК)", "📋 Refuse & file clean audit (+3,500 🪙, -10% NABK)"),
            outcome: L("Палич бурчить, але поважає принциповість.", "Palych grumbles but respects your spine."),
            moneyDelta: 3500, timeDelta: 0, riskDelta: -10, sbkDelta: 10, tolikDelta: 0, palychDelta: -15, moraleDelta: 10,
            onSelect: () => { unlockDiscovery("SERV_PALYCH_FINALE"); openCampaignMilestoneModal(); return true; }
          }
        ]
      };
    } else {
      mission = {
        id: "faction_finale_honest",
        title: L("🏠 ФІНАЛЬНА ПОДЯКА: «ЧЕСНИЙ РУБІЖ»", "🏠 FINALE: 'HONORABLE SERVICE'"),
        desc: L(
          "Інспекція з Києва відзначила твій КПП за витримку та порядок! Громада і командування вручають премію й подяку сім'ї.",
          "Kyiv command commends your checkpoint for discipline and honor!"
        ),
        portrait: { gender: "F", skinTone: 0, faceShape: 0, hairStyle: 2, hairColor: 3, facialHair: 0, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, specialId: "NONE" },
        options: [
          {
            id: "finale_honest_accept",
            label: L("🏅 Прийняти державну подяку (+7 500 🪙, -15% НАБК, +20% сім'я)", "🏅 Accept commendation (+7,500 🪙, -15% NABK, +20% family)"),
            outcome: L("Родина пишається тобою!", "Your family is proud of you!"),
            moneyDelta: 7500, timeDelta: 0, riskDelta: -15, sbkDelta: 15, tolikDelta: 0, palychDelta: 10, moraleDelta: 20,
            onSelect: () => { unlockAgencyBadge("NABK_CLEAN"); unlockDiscovery("SERV_HONEST_FINALE"); openCampaignMilestoneModal(); return true; }
          }
        ]
      };
    }
    openEncounterModal(mission);
  }

  function openCampaignMilestoneModal() {
    openEncounterModal({
      id: "campaign_day5_milestone",
      title: L("🏁 П'ЯТИДЕННА ВАХТА ДОБІГЛА КІНЦЯ", "🏁 FIVE-DAY CAMPAIGN COMPLETE"),
      desc: L(
        "Твій первинний контракт інспектора завершено. Але це далеко не кінець!\n\nМожеш підбити підсумки вже зараз і побачити своє Персональне Досьє Долі — або перейти у Відкриту Кар'єру (День 6+ зі всіма грошима, купленими активами, контактами та підвищеннями) і будувати власну імперію далі!",
        "Your 5-day campaign contract is complete! You can wrap up now for your Personalized Fate Dossier — or seamlessly transition into Open Career Mode (Day 6+ keeping all your cash, assets, ranks & story)!"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "continue_open_career",
          label: L("♾️ Продовжити службу у Відкритій Кар'єрі (День 6+ з усім майном!)", "♾️ Continue into Open Career Mode (Day 6+ with everything!)"),
          outcome: L("Твоє бронювання продовжено на невизначений термін! Відкривається кар'єра далі.", "Contract extended! Open career awaits."),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 5,
          onSelect: () => {
            state.isSandbox = true;
            advanceToNextDay(true);
            return true;
          }
        },
        {
          id: "finish_campaign_now",
          label: L("🏆 Підбити підсумки 5 днів (Відкрити Персональний Епілог)", "🏆 Finish Campaign (View Personal Epilogue Dossier)"),
          outcome: L("Підбиваємо підсумки твоєї служби на шлагбаумі...", "Compiling your final border dossier..."),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 0,
          onSelect: () => { triggerEnding(null); return true; }
        }
      ]
    });
  }

  function openTolikEscapeOfferModal() {
    openEncounterModal({
      id: "tolik_midnight_pickup",
      title: L("🚐 НІЧНИЙ ДЗВІНОК ТОЛІКА «БУСИКА»", "🚐 MIDNIGHT CALL FROM TOLIK 'BUSYK'"),
      desc: L(
        "О третій ночі біля твого під'їзду блимає фарами тонований «Мерс Спрінтер». Толік відчиняє дверцята:\n«Брате, усе готово: фонд переведено, колега на сусідньому переході проплачений. Стрибай із сім'єю у бус прямо зараз і за годину будемо у Варшавці — або залишайся на шлагбаумі ще качати касу!»",
        "At 3 AM a tinted Mers Sprinter flashes outside your apartment. Tolik leans out:\n'Brother, the midnight corridor to Varshavka is ready! Hop in with your family right now — or stay at the booth to keep stacking cash!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 2, glasses: 2, headwear: 1, scarOrDetail: 3, expression: 1, specialId: "TOLIK_SMUGGLER" },
      options: [
        {
          id: "escape_now_with_tolik",
          label: L("🚐 Виїхати до Поландії сьогодні вночі (Завершити історію)", "🚐 Cross into Polandia tonight (Trigger Escape Ending)"),
          outcome: L("Через дві години ти вже пив каву на заправці під Варшавкою.", "Two hours later you were sipping coffee outside Varshavka."),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 10, palychDelta: 0, moraleDelta: 10,
          onSelect: () => { triggerEnding("ESCAPED_ABROAD"); return true; }
        },
        {
          id: "stay_for_more",
          label: L("🛂 «Ще не час! Тримай гроші в резерві, я ще попрацюю!»", "🛂 'Not yet! Hold the fund, I am staying on shift!'"),
          outcome: L("Толік тисне на газ і шепоче: «Сигналиш, коли надумаєш.»", "Tolik hits the gas: 'Just say the word when you are ready.'"),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 5, palychDelta: 0, moraleDelta: 0,
          onSelect: () => { advanceToNextDay(true); return true; }
        }
      ]
    });
  }

  async function shareResultCard() {
    const epi = buildModularEpilogue(state);
    const ownedNames = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).map(a => a.icon + " " + tr(a.title, state.lang)).join(", ") || tr(L("немає", "none"), state.lang);
    const shareText = [
      "🛂 Border Shift: Kraina",
      `🏆 ${tr(epi.title, state.lang)}`,
      `🗄️ Досьє #${epi.comboNumber.toLocaleString()} / ${epi.totalCombos.toLocaleString()} (Титулів: ${epi.unlockedCount}/16)`,
      `💵 ${tr(L("Готівка", "Cash"), state.lang)}: ${state.money} 🪙 | СБК: ${state.sbkRep} | НАБК: ${state.nabkRisk}%`,
      `💎 ${tr(L("Майно", "Assets"), state.lang)}: ${ownedNames}`,
      `👉 ${window.location.href}`
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Border Shift: Kraina", text: shareText, url: window.location.href });
        return;
      } catch (_) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        const btn = document.getElementById("btn-share-result");
        if (btn) btn.textContent = tr(L("✔ Скопійовано для чату!", "✔ Copied to clipboard!"), state.lang);
      } catch (_) {}
    }
  }

  function requestGameStart(sandbox) {
    if (hasSeenOnboarding()) {
      startNewGame(sandbox);
      return;
    }
    openEncounterModal({
      id: "first_time_onboarding_offer",
      title: L("📖 ІНСТРУКТАЖ ТА ПЕРЕДІСТОРІЯ КПП «ЗАХІД-04»", "📖 CHECKPOINT 'ZAKHID-04' BRIEFING & LORE"),
      desc: L(
        "Ти вперше заступаєш на зміну! На кордоні діють різні відомства (ДПСК, СБК, ГУР-М, ВСП, НАБК) та тіньові гравці (Пал Палич, Толік «Бусик», агентура ФСМ).\n\nБажаєш пройти коротку передісторію та дізнатися, хто за що відповідає, перед початком зміни?",
        "This is your first shift! Multiple state agencies (SBGS, SBK, GUR-M, VSP, NABK) and shadow factions (Pal Palych, Tolik 'Busyk', FSM agents) operate at the border.\n\nWould you like to view the short backstory and agency guide before starting?"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 0, hairStyle: 1, hairColor: 2, facialHair: 1, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 0 },
      options: [
        {
          id: "view_onboarding",
          tapSound: true,
          label: L("📖 Пройти передісторію та інструктаж (Рекомендовано)", "📖 View Backstory & Agency Guide (Recommended)"),
          outcome: "",
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 0,
          onSelect: () => {
            markOnboardingSeen();
            state.pendingStartMode = sandbox ? "SANDBOX" : "CAMPAIGN";
            state.onboardingTab = 0;
            state.phase = "ONBOARDING";
            render();
            return true;
          }
        },
        {
          id: "skip_onboarding",
          tapSound: true,
          label: L("⚡ Пропустити — одразу заступити на зміну →", "⚡ Skip — Start Shift Immediately →"),
          outcome: "",
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 0,
          onSelect: () => {
            markOnboardingSeen();
            startNewGame(sandbox);
            return true;
          }
        }
      ]
    });
  }
