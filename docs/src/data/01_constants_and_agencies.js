  const SAVE_KEY = "border_shift_save_v3";
  const BUILD_VERSION = "v8.7";
  const DAILY_OBNAL_LIMIT_USD = 5000;
  let confirmResetArmed = false;

  // Fallback for older Safari lacking CanvasRenderingContext2D.roundRect
  if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) {
      this.rect(x, y, w, h);
    };
  }

  // Safari fallback for <dialog closedby="any"> per modern-web-guidance
  if (typeof HTMLDialogElement !== "undefined" && !("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener("pointerup", (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
    }
  }

  const L = (uk, en) => ({ uk, en });
  const tr = (obj, lang) => (obj ? (lang === "EN" ? obj.en : obj.uk) : "");

  const EPILOGUE_SAVE_KEY = "border_shift_epilogues_v1";
  const SHYTOMYR_SAVE_KEY = "border_shift_shytomyr_v1";
  const STATS_SAVE_KEY = "border_shift_stats_v1";
  const CAMPAIGN_CHECKPOINTS_KEY = "border_shift_campaign_checkpoints_v1";
  const AGENCY_BADGES_KEY = "border_shift_agency_badges_v1";
  const GAME_DISCOVERIES_KEY = "border_shift_discoveries_v1";
  const ONBOARDING_SEEN_KEY = "border_shift_onboarding_seen_v1";
  const USD_UAH_RATE = 41;

  function hasSeenOnboarding() {
    try { return localStorage.getItem(ONBOARDING_SEEN_KEY) === "1"; } catch (_) { return false; }
  }
  function markOnboardingSeen() {
    try { localStorage.setItem(ONBOARDING_SEEN_KEY, "1"); } catch (_) {}
  }

  const AGENCY_BADGE_DEFS = [
    {
      id: "SBK_SHIELD",
      icon: "🛡️",
      title: L("Медаль СБК «Чистий Рубіж»", "SBK Medal 'Clean Frontier'"),
      desc: L("Затримай 3+ шпигунів або контрабандистів — назавжди +600 🪙 до премії СБК за кожен арешт!", "Detain 3+ spies/smugglers — permanently +600 🪙 per SBK arrest!")
    },
    {
      id: "GUR_FALCON",
      icon: "🦅",
      title: L("Відзнака ГУР-М «Сокіл»", "GUR-M 'Falcon' Distinction"),
      desc: L("Допоможи спецбортам ГУР-М або впіймай шпигуна ФСМ — пес «Бавовна» працює на 2с швидше!", "Assist GUR-M or catch an FSM spy — Sniffer Dog is 2s faster!")
    },
    {
      id: "VSP_GUARD",
      icon: "🎖️",
      title: L("Подяка ВСП «Залізна Варта»", "VSP 'Iron Guard' Commendation"),
      desc: L("Викрий та затримай порушника з подвійним громадянством — +800 🪙 за затримання ухилянтів!", "Catch a dual-citizen evader — +800 🪙 bounty on evader arrests!")
    },
    {
      id: "NABK_CLEAN",
      icon: "🕵️",
      title: L("Імунітет НАБК «Чисті Руки»", "NABK 'Clean Hands' Immunity"),
      desc: L("Заверши зміну без хабарів у ДПСК — щодня знижує ризик НАБК на -5%!", "Finish a shift bribe-free — reduces daily NABK risk by -5%!")
    }
  ];

  const GAME_DISCOVERY_DEFS = [
    {
      id: "SERV_SBK_AGENT",
      icon: "🕵️",
      title: L("СБК: Таємний агент «Кордон-7»", "SBK: Covert Agent 'Border-7'"),
      desc: L("Підписано контракт негласного оперативника СБК під носом у Палича.", "Signed covert SBK operative contract right under Palych's nose."),
      hint: L("Затримай 2+ серйозних порушників і прийми пропозицію Майора «Тихого».", "Detain 2+ serious violators and accept Major 'Quiet's offer.")
    },
    {
      id: "SERV_SBK_COLONEL",
      icon: "🎖️",
      title: L("СБК: Полковник під прикриттям", "SBK: Undercover Colonel"),
      desc: L("Викрито 4 агентів на службі «Кордон-7» — отримано погони полковника СБК!", "Caught 4 operatives as 'Border-7' — earned SBK Colonel epaulets!"),
      hint: L("Будучи агентом «Кордон-7», затримай 4 шпигунів або контрабандистів.", "As Agent 'Border-7', detain 4 spies or smugglers.")
    },
    {
      id: "SERV_GUR_FINALE",
      icon: "🦅",
      title: L("ГУР-М: Операція «Перехват-7»", "GUR-M: Operation 'Intercept-7'"),
      desc: L("Успішна спільна спецоперація СБК та ГУР-М проти кортежу резидента ФСМ.", "Joint SBK & GUR-M operation against an armed FSM convoy."),
      hint: L("Заверши 5-й день із високою репутацією СБК (≥ 70).", "Finish Day 5 with high SBK reputation (≥ 70).")
    },
    {
      id: "SERV_TOLIK_FINALE",
      icon: "🚐",
      title: L("Синдикат Толіка: «Захід-Експрес»", "Tolik Syndicate: 'West-Express'"),
      desc: L("Вирішальна нічна справа контрабандистів на 3 фури до Варшавки.", "Decisive midnight smuggling convoy finale on the Varshavka route."),
      hint: L("Заверши 5-й день із високою довірою Толіка (≥ 60).", "Finish Day 5 with high Tolik trust (≥ 60).")
    },
    {
      id: "SERV_PALYCH_FINALE",
      icon: "🧢",
      title: L("Пал Палич: «Великий кошторис»", "Palych: 'The Grand Budget'"),
      desc: L("Пройдено фінальну перевірку генераторного бюджету перед ревізією з Києва.", "Cleared the grand generator-fund finale before the Kyiv audit."),
      hint: L("Заверши 5-й день із довірою Пал Палича (≥ 65).", "Finish Day 5 with Palych reputation (≥ 65).")
    },
    {
      id: "SERV_HONEST_FINALE",
      icon: "🏅",
      title: L("ДПСК: Державна подяка «Чесний рубіж»", "SBGS: 'Honorable Service' Commendation"),
      desc: L("Отримано офіційну подяку з Києва за дисципліну та порядок на КПП.", "Received official Kyiv commendation for honor and discipline."),
      hint: L("Заверши 5-й день без перекосу в кримінал чи корупцію.", "Finish Day 5 without leaning into corruption or smuggling.")
    },
    {
      id: "DISC_NABK_STING",
      icon: "🎙️",
      title: L("Провокація НАБК: Мічені купюри", "NABK Sting: Marked Bills"),
      desc: L("Виявлено або затримано підсадного агента НАБК із мікрокамерою на лацкані.", "Spotted or detained an undercover NABK sting with a lapel mic."),
      hint: L("Перевір УФ-лампою або бардачок водія з міченими купюрами і відмов / затримай.", "Scan with UV or check glovebox of a sting traveler and deny or detain.")
    },
    {
      id: "DISC_FSM_SPY",
      icon: "🕷️",
      title: L("Резидент ФСМ: Затримання", "FSM Resident: Captured"),
      desc: L("Знешкоджено ворожого агента розвідки на кордоні.", "Neutralized an enemy intelligence operative at the border."),
      hint: L("Вияви флуоресцентну мітку ФСМ або орієнтування і натисни 🚨 ЗАТРИМАТИ.", "Spot FSM clues or wanted dossier and press 🚨 DETAIN.")
    },
    {
      id: "DISC_VIP_CORRUPTOR",
      icon: "💼",
      title: L("Довідник розшуку: VIP-утікач", "Wanted Dossier: VIP Escapee"),
      desc: L("Опрацьовано фігуранта зі списку розшуку СБК (топ-корупціонер або депутат-утікач).", "Handled a target from the SBK Wanted Dossier."),
      hint: L("Звір обличчя у «📋 Довідник» та затримай VIP-порушника.", "Cross-check faces in Wanted Dossier and detain the VIP.")
    },
    {
      id: "DISC_KRYSHA",
      icon: "🤝",
      title: L("Тіньова «Криша» та Зам'яття", "Shadow 'Krysha' Cover"),
      desc: L("Скористався послугами зв'язків, щоб зняти догану або нагляд НАБК.", "Used shady connections to clear a reprimand or NABK watch."),
      hint: L("Отримавши догану чи високий ризик НАБК, занеси за «Кришу» ввечері.", "With a reprimand or high NABK risk, pay for 'Krysha' at night.")
    },
    {
      id: "DISC_SHOP_ADDON",
      icon: "💎",
      title: L("Елітний тюнінг активу", "Elite Asset Upgrade"),
      desc: L("Прокачано куплену нерухомість, авто або спецгаджет додатковим модулем.", "Upgraded an owned house, car, or gadget with an add-on."),
      hint: L("Купи будь-який актив у Магазині та додай до нього апгрейд.", "Buy any asset in the Shop and install an add-on.")
    },
    {
      id: "DISC_NIGHT_RARE",
      icon: "🌙",
      title: L("Рідкісна нічна пригода", "Rare Night Encounter"),
      desc: L("Пережито й оплачено одну з ексклюзивних випадкових вечірніх справ.", "Unlocked and paid for a rare random night event."),
      hint: L("Увечері впіймай рідкісну подію з фіолетовою рамкою та оплати її.", "Catch a rare purple-bordered night activity and pay for it.")
    }
  ];

  // Discrepancy catalog — factual findings only (no button-press spoilers!)
  const DISCREPANCY = {
    EXPIRED_DATE: {
      code: "EXPIRED_DATE",
      requiresDetention: false,
      title: L("Прострочений документ", "Expired Document"),
      hint: L("Виявлено: термін дії документа вичерпано.", "Finding: document expiry date is past.")
    },
    AGE_RESTRICTION_NO_PERMIT: {
      code: "AGE_RESTRICTION_NO_PERMIT",
      requiresDetention: false,
      title: L("Чоловік 18–60 на виїзд без підстави", "Male 18–60 Exiting Without Permit"),
      hint: L("Виявлено: відсутня підстава на виїзд 18–60.", "Finding: no valid 18–60 exit permit.")
    },
    NAME_MISMATCH: {
      code: "NAME_MISMATCH",
      requiresDetention: true,
      title: L("Розбіжність ПІБ у документах", "Name Mismatch Across Documents"),
      hint: L("Виявлено: ПІБ у документах не збігається.", "Finding: full name differs across documents.")
    },
    PHOTO_MISMATCH: {
      code: "PHOTO_MISMATCH",
      requiresDetention: true,
      title: L("Чуже фото в паспорті", "Passport Photo Mismatch"),
      hint: L("Виявлено: фото в паспорті не відповідає особі.", "Finding: passport photo does not match traveler.")
    },
    FAKE_ISSUER_SEAL: {
      code: "FAKE_ISSUER_SEAL",
      requiresDetention: true,
      title: L("Підроблена печатка / ліва установа", "Forged Seal / Invalid Authority"),
      hint: L("Виявлено: недійсна установа або підроблена печатка.", "Finding: bogus issuing authority or forged seal.")
    },
    INVALID_QR_CODE: {
      code: "INVALID_QR_CODE",
      requiresDetention: true,
      title: L("Код «Облік+» недійсний / у розшуку", "Oblik+ QR Code Invalid / Wanted"),
      hint: L("Виявлено: помилка синхронізації / статус у базі «Облік+».", "Finding: 'Oblik+' registry error / flagged.")
    },
    VEHICLE_MISMATCH: {
      code: "VEHICLE_MISMATCH",
      requiresDetention: true,
      title: L("Колір/модель авто не збігається з техпаспортом", "Vehicle Color/Model Registry Mismatch"),
      hint: L("Виявлено: авто у вікні не збігається з техпаспортом.", "Finding: parked vehicle does not match declaration.")
    },
    CONTRABAND_CARGO: {
      code: "CONTRABAND_CARGO",
      requiresDetention: true,
      title: L("Контрабанда / схованка в транспорті", "Contraband / Hidden Stash in Transport"),
      hint: L("Виявлено: незадекларований вантаж / схованка.", "Finding: undeclared cargo / hidden stash.")
    },
    WANTED_CRIMINAL_OR_SPY: {
      code: "WANTED_CRIMINAL_OR_SPY",
      requiresDetention: true,
      title: L("Підозріла особа / орієнтування спецслужб", "Suspicious Profile / Intel Alert"),
      hint: L("Виявлено: особа фігурує в орієнтуванні спецслужб.", "Finding: traveler matches intelligence alert.")
    },
    DUAL_CITIZENSHIP: {
      code: "DUAL_CITIZENSHIP",
      requiresDetention: true,
      title: L("Подвійне громадянство (прихований паспорт Kraina)", "Dual Citizenship (Hidden Kraina ID)"),
      hint: L("Виявлено: приховане громадянство Kraina у чоловіка 18–60.", "Finding: hidden Kraina citizenship on male 18–60.")
    },
    CHILDREN_AGE_FRAUD: {
      code: "CHILDREN_AGE_FRAUD",
      requiresDetention: false,
      title: L("Дитина в посвідченні вже повнолітня (18+)", "Child on permit is already 18+ adult"),
      hint: L("Виявлено: одна з трьох дітей вже повнолітня (18+) — відстрочка недійсна.", "Finding: one of the 3 children is 18+ — permit invalid.")
    },
    GUARDIAN_NO_PASSENGER: {
      code: "GUARDIAN_NO_PASSENGER",
      requiresDetention: false,
      title: L("Супровід без присутності підопічного в авто", "Guardian exiting without disabled relative present"),
      hint: L("Виявлено: у салоні авто відсутня особа, яку супроводжують!", "Finding: accompanied relative is missing from the vehicle!")
    }
  };

  const SANDBOX_MODIFIERS = [
    {
      id: "OLIGARCH_EXODUS",
      title: L("💰 Указ Віче: «Ніч олігархів та мажорів»", "💰 Daily Decree: 'Night of Oligarchs'"),
      desc: L("Багатії рвуться у напрямку Монаківки та Варшавки — усі конверти сьогодні +35%!", "VIPs are rushing toward Monakivka and Varshavka — all bribe offers today are +35%!"),
      bribeMult: 1.35, detainExtra: 0, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "MARTIAL_AUDIT",
      title: L("🚨 Указ Штабу: «Спецоперація Контррозвідки»", "🚨 Daily Decree: 'Counter-Intel Sweep'"),
      desc: L("Група СБК чергує на КПП! За кожен обґрунтований АРЕШТ сьогодні платять +900 🪙 премії!", "SBK team on site! Every valid DETENTION today pays an extra +900 🪙 bonus!"),
      bribeMult: 1.0, detainExtra: 900, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: true, twoWheelerBias: false, extraShytomyr: false, extraWar: true
    },
    {
      id: "TOTAL_DIGITAL_OBLIK",
      title: L("📱 Указ Віче: «Цифровий Рейд Облік+»", "📱 Daily Decree: 'Digital Oblik+ Raid'"),
      desc: L("Усі чоловіки 18–60 зобов'язані пред'явити і довідку, і дійсний QR-код «Облік+».", "All males 18–60 must present both an Exemption Permit and a valid 'Oblik+' QR code."),
      bribeMult: 1.0, detainExtra: 450, salaryMult: 1.1, coffeeMult: 1, shiftSecDelta: 0, forceOblik: true, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "CONTRABAND_BOOM",
      title: L("📦 Указ Митниці: «Полювання на двійників та тайники»", "📦 Daily Decree: 'Clone & Stash Hunt'"),
      desc: L("Звіряйте колір транспорту перед шлагбаумом із декларацією! Премія за АРЕШТ +700 🪙!", "Compare the parked vehicle color against papers! Detention bonus +700 🪙!"),
      bribeMult: 1.0, detainExtra: 700, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "NIGHT_CONVOY_SURGE",
      title: L("🔦 Спецрежим: «Смуга посиленого контролю»", "🔦 Special Shift: 'Tightened Security Lane'"),
      desc: L("Через трасу йдуть дипломатичні буси та велокур'єри. Конверти +30%, премія СБК +600 🪙!", "Heavy diplomatic vans & bike couriers on the highway. Bribes +30%, SBK bonus +600 🪙!"),
      bribeMult: 1.3, detainExtra: 600, salaryMult: 1.1, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "VELO_PEDAL_RUSH",
      title: L("🚲 Указ Траси: «Вело-самокатний штурм»", "🚲 Highway Decree: 'Two-Wheeler Rush'"),
      desc: L("Через чергу на авто масово лізуть на вєліках, самокатах і пішки! Премія за АРЕШТ +750 🪙!", "Travelers swarm on bikes, scooters & on foot to bypass traffic! +750 🪙 arrest bonus!"),
      bribeMult: 1.0, detainExtra: 750, salaryMult: 1.15, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: true, extraShytomyr: false, extraWar: false
    },
    {
      id: "DIPLOMATIC_SCANNER",
      title: L("🛂 Рейд ДПСК: «Перевірка липових диппаспортів»", "🛂 SBGS Raid: 'Fake Diplomatic Passports'"),
      desc: L("З'явились аферисти з фальшивими печатками. Премія за АРЕШТ +1 000 🪙, уважніше тисніть на печатки!", "Scammers flashing fake seals. +1 000 🪙 detention bounty — inspect stamps closely!"),
      bribeMult: 1.0, detainExtra: 1000, salaryMult: 1.05, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "CURFEW_BLITZ",
      title: L("⚡ Бліц-зміна: «Комендантський прорив»", "⚡ Blitz Shift: 'Curfew Surge'"),
      desc: L("Зміна коротша на 45с, зате ставка оформлення +40%! Швидкий темп — високий дохід!", "Shift is 45s shorter, but base salary per traveler is +40%! Fast pace, big payout!"),
      bribeMult: 1.15, detainExtra: 500, salaryMult: 1.4, coffeeMult: 1, shiftSecDelta: -45, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "NABK_UNDERCOVER_WAVE",
      title: L("🕵️ Тривога НАБК: «Тиждень прихованих камер»", "🕵️ NABK Alert: 'Hidden Camera Week'"),
      desc: L("Антикорупційне бюро на трасі! Хабарі менші (x0.8), зате чесна ставка +30% і +1 200 🪙 за СБК-арешт!", "NABK patrols active! Bribes x0.8, but honest salary +30% and +1 200 🪙 arrest bonus!"),
      bribeMult: 0.8, detainExtra: 1200, salaryMult: 1.3, coffeeMult: 1, shiftSecDelta: 0, forceOblik: true, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "BORDER_AMNESTY_COFFEE",
      title: L("☕ Акція КПП: «Ніч земляцької гостинності»", "☕ Checkpoint Vibe: 'Warm Thermos Night'"),
      desc: L("На вулиці завірюха! Чайові за каву ПОДВОЄНІ (x2), а чесні мандрівники щедріші!", "Blizzard at the gate! Coffee tips are DOUBLED (x2) and travelers are extra grateful!"),
      bribeMult: 1.2, detainExtra: 400, salaryMult: 1.0, coffeeMult: 2, shiftSecDelta: 15, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "SHYTOMYR_DELEGATION",
      title: L("🧦 Подія траси М-06: «Великий шитомирський караван»", "🧦 M-06 Event: 'Great Shytomyr Caravan'"),
      desc: L("Через КПП масово їдуть легенди з м. Шитомир! Більше унікальних земляків у черзі +300 🪙 за кожну трійку!", "Shytomyr legends are rolling through! Extra unique Shytomyr guests guaranteed today!"),
      bribeMult: 1.0, detainExtra: 500, salaryMult: 1.1, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: true, extraWar: false
    },
    {
      id: "DRONE_BLACKOUT",
      title: L("🛸 Ніч тривог: «Повітряна тривога і блекаут»", "🛸 Alert Night: 'Sirens & Blackout'"),
      desc: L("Над трасою мопеди, генератор гуде! Ставка +25%, премія СБК +950 🪙, сирена гарантована!", "Drones overhead! Base salary +25%, SBK bonus +950 🪙, air-raid siren active!"),
      bribeMult: 1.1, detainExtra: 950, salaryMult: 1.25, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: true, twoWheelerBias: false, extraShytomyr: false, extraWar: true
    },
    {
      id: "WEDDING_SEASON",
      title: L("💒 Сезон весіль: «Кортежі з бантиками»", "💒 Wedding Season: 'Ribbon Convoys'"),
      desc: L("Колони з повітряними кульками їдуть на весілля до Кракова. Ставка +10%, конверти +10%, премія за АРЕШТ +300 🪙, зміна довша на 10с.", "Ribboned wedding convoys heading to Krakiv. Salary +10%, bribes +10%, arrest bonus +300 🪙, shift +10s."),
      bribeMult: 1.1, detainExtra: 300, salaryMult: 1.1, coffeeMult: 1, shiftSecDelta: 10, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "TRUCKER_STRIKE",
      title: L("🚛 Страйк далекобійників: «Фури стали в чергу»", "🚛 Trucker Strike: 'Gridlock on M-06'"),
      desc: L("Водії фур нервують і радо «домовляються»: конверти +40%, премія за АРЕШТ +700 🪙, але зміна коротша на 20с.", "Nervous truckers love to 'negotiate': bribes +40%, arrest bonus +700 🪙, shift -20s."),
      bribeMult: 1.4, detainExtra: 700, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: -20, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "FOOTBALL_FANS",
      title: L("⚽ Матч у Кракові: «Фанатський прорив»", "⚽ Krakiv Match: 'Fan Surge'"),
      desc: L("Фанати їдуть на самокатах і пішки. Ставка +20%, премія за АРЕШТ +400 🪙, багато двоколісного транспорту.", "Fans swarm on scooters and on foot. Salary +20%, arrest bonus +400 🪙, tons of two-wheelers."),
      bribeMult: 1.0, detainExtra: 400, salaryMult: 1.2, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: true, extraShytomyr: false, extraWar: false
    },
    {
      id: "MINISTER_VISIT",
      title: L("🎩 Візит міністра: «Чисті руки, чистий шлагбаум»", "🎩 Minister's Visit: 'Clean Hands Day'"),
      desc: L("На пості столична комісія з камерами. Конверти x0.7, зате ставка +35% і премія за АРЕШТ +1 300 🪙. Обов'язковий «Облік+».", "Capital commission with cameras on site. Bribes x0.7, salary +35%, arrest bonus +1,300 🪙. Oblik+ enforced."),
      bribeMult: 0.7, detainExtra: 1300, salaryMult: 1.35, coffeeMult: 1, shiftSecDelta: 0, forceOblik: true, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "HARVEST_RUSH",
      title: L("🌾 Жнива: «Аграрний ажіотаж»", "🌾 Harvest Rush: 'Agro Frenzy'"),
      desc: L("Агро-барони женуть комбайни та зерновози. Конверти +25%, премія за АРЕШТ +500 🪙, зміна +20с.", "Agro barons rush harvesters and grain trucks. Bribes +25%, arrest bonus +500 🪙, shift +20s."),
      bribeMult: 1.25, detainExtra: 500, salaryMult: 1.0, coffeeMult: 1, shiftSecDelta: 20, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "BLACK_MARKET_FAIR",
      title: L("🕶️ Ярмарок «У тіні Варшавки»", "🕶️ 'In the Shadow of Varshavka' Fair"),
      desc: L("Чорний ринок їде на розпродаж! Конверти +60%, премія за АРЕШТ +800 🪙, але НАБК пильнує (зарплата -10%).", "The black market rolls to sell! Bribes +60%, arrest bonus +800 🪙, but NABK watches (salary -10%)."),
      bribeMult: 1.6, detainExtra: 800, salaryMult: 0.9, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "HOLIDAY_EVE",
      title: L("🎄 Переддень свят: «Передсвятковий потік»", "🎄 Holiday Eve: 'Festive Flow'"),
      desc: L("Усі їдуть додому з подарунками. Чайові за каву x2, премія за АРЕШТ +350 🪙, зміна +25с.", "Everyone drives home with gifts. Coffee tips x2, arrest bonus +350 🪙, shift +25s."),
      bribeMult: 1.0, detainExtra: 350, salaryMult: 1.0, coffeeMult: 2, shiftSecDelta: 25, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "GUR_QUIET_CORRIDOR",
      title: L("🦅 Операція ГУР-М: «Тихий коридор»", "🦅 GUR-M Operation: 'Quiet Corridor'"),
      desc: L("Розвідка веде свою гру на КПП: більше шпигунів і союзників. Премія за АРЕШТ +1 400 🪙, ставка +10%.", "Intel runs its own game: more spies and allies. Arrest bonus +1,400 🪙, salary +10%."),
      bribeMult: 1.0, detainExtra: 1400, salaryMult: 1.1, coffeeMult: 1, shiftSecDelta: 0, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: true
    },
    {
      id: "FOG_NIGHT",
      title: L("🌫️ Густий туман над трасою", "🌫️ Thick Fog over the Highway"),
      desc: L("Видимість нульова, черга повзе. Ставка +30%, конверти +10%, премія за АРЕШТ +600 🪙, зміна коротша на 30с.", "Zero visibility, queue crawls. Salary +30%, bribes +10%, arrest bonus +600 🪙, shift -30s."),
      bribeMult: 1.1, detainExtra: 600, salaryMult: 1.3, coffeeMult: 1, shiftSecDelta: -30, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: false, extraWar: false
    },
    {
      id: "SHYTOMYR_BORSCH_FEST",
      title: L("🧦 Фестиваль «Шитомирський борщ»", "🧦 'Shytomyr Borscht' Festival"),
      desc: L("Земляки везуть бідони борщу на фестиваль. Чайові за каву x2, багато шитомирців у черзі, премія за АРЕШТ +300 🪙.", "Shytomyr folks haul borscht cauldrons to the fest. Coffee tips x2, extra Shytomyr guests, arrest bonus +300 🪙."),
      bribeMult: 1.0, detainExtra: 300, salaryMult: 1.0, coffeeMult: 2, shiftSecDelta: 10, forceOblik: false, forceSiren: false, twoWheelerBias: false, extraShytomyr: true, extraWar: false
    }
  ];

  const SANDBOX_TWISTS = [
    {
      id: "SNOW_NIGHT",
      label: L("🎯 Орієнтування дня: Мете сніг — мандрівники вдячні за кожен ковток гарячої кави.", "🎯 Daily Alert: Snowstorm — travelers are grateful for every sip of hot coffee."),
      coffeeMult: 2
    },
    {
      id: "FSM_NETWORK",
      label: L("🎯 Орієнтування дня: Перехоплено шифровки ФСМ — на КПП очікуйте більше агентури!", "🎯 Daily Alert: FSM ciphers intercepted — expect extra operatives at the gate!"),
      extraWar: true
    },
    {
      id: "BIKE_PELOTON",
      label: L("🎯 Орієнтування дня: Велоколона проти черги — і контрабанда в рюкзаках!", "🎯 Daily Alert: Bike peloton dodging the queue — and smuggling in backpacks!"),
      twoWheelerBias: true
    },
    {
      id: "SEAL_SWEEP",
      label: L("🎯 Орієнтування дня: Печатки та QR під мікроскопом — підробки на потоці!", "🎯 Daily Alert: Seals & QR under the microscope — forgeries incoming!"),
      forceOblik: true
    },
    {
      id: "CLONE_FACTORY",
      label: L("🎯 Орієнтування дня: Підпільний цех перебиває VIN — двійників більше, ніж зазвичай!", "🎯 Daily Alert: A chop shop is re-stamping VINs — more cloned cars than usual!"),
      extraCloneChance: true
    },
    {
      id: "LEGEND_TOUR",
      label: L("🎯 Орієнтування дня: Земляцька делегація м. Шитомир — вітайте легенд і поповнюйте Архів!", "🎯 Daily Alert: Shytomyr delegation on the road — welcome the legends and fill the Archive!"),
      extraShytomyr: true
    },
    {
      id: "CLONE_HUNT",
      label: L("🎯 Орієнтування дня: Звіряйте КОЛІР та модель авто у вікні — активні авто-двійники!", "🎯 Daily Alert: Watch for CLONED cars — match vehicle color & model in window!"),
      extraCloneChance: true
    },
    {
      id: "TWO_WHEEL_SMUGGLE",
      label: L("🎯 Орієнтування дня: Сплеск вело- та самокатної контрабанди — не шкодуйте пса «Бавовну»!", "🎯 Daily Alert: Two-wheeler smuggling spike — send dog 'Bavovna' on suspicious riders!"),
      twoWheelerBias: true
    },
    {
      id: "QR_SPOT_CHECK",
      label: L("🎯 Орієнтування дня: Усі чоловіки 18–60 на виїзд проходять під прицілом «Облік+»!", "🎯 Daily Alert: Strict 'Oblik+' QR enforcement for all males 18–60 exiting!"),
      forceOblik: true
    },
    {
      id: "INTEL_CORRIDOR",
      label: L("🎯 Орієнтування дня: Через КПП йде 2 розвідувальні борти — чекайте і патріотів, і диверсантів!", "🎯 Daily Alert: Active intelligence corridor — expect both GUR allies and saboteurs!"),
      extraWar: true
    },
    {
      id: "THERMOS_MORALE",
      label: L("🎯 Орієнтування дня: Холодна ніч — люди радо дякують за каву та ввічливість.", "🎯 Daily Alert: Freezing night — travelers tip generously for warm coffee!"),
      coffeeMult: 2
    },
    {
      id: "SHYTOMYR_FLOW",
      label: L("🎯 Орієнтування дня: На трасі колона земляків з м. Шитомир — шанс швидко поповнити Архів!", "🎯 Daily Alert: Shytomyr convoy on highway — great chance to unlock Archive legends!"),
      extraShytomyr: true
    }
  ];

  const META_PERK_DEFS = [
    {
      id: "SHYTOMYR_SEED",
      reqType: "shytomyr",
      reqCount: 3,
      title: L("🧦 Земляки на старті", "🧦 Shytomyr Welcome Fund"),
      desc: L("Старт будь-якого нового забігу з +300 🪙 у кишені.", "Start every new run with +300 🪙 cash.")
    },
    {
      id: "SHYTOMYR_THERMOS",
      reqType: "shytomyr",
      reqCount: 6,
      title: L("☕ Термос по-шитомирськи", "☕ Shytomyr Thermos"),
      desc: L("+25 🪙 до кожних чайових за каву у будці.", "+25 🪙 bonus to every coffee tip in the booth.")
    },
    {
      id: "SHYTOMYR_CROWN",
      reqType: "shytomyr",
      reqCount: 12,
      title: L("👑 Орден Шитомира (12/12)", "👑 Order of Shytomyr (12/12)"),
      desc: L("Старт забігу з +800 🪙 та -15% стартового ризику НАБК!", "Start every run with +800 🪙 and -15% starting NABK risk!")
    },
    {
      id: "TITLE_VETERAN_1",
      reqType: "titles",
      reqCount: 3,
      title: L("🗄️ Досвідчений інспектор", "🗄️ Seasoned Inspector"),
      desc: L("Перша помилка протоколу за зміну коштує на 50% дешевше.", "First protocol mistake each shift costs 50% less.")
    },
    {
      id: "TITLE_VETERAN_2",
      reqType: "titles",
      reqCount: 6,
      title: L("⚡ Ветеран КПП", "⚡ Checkpoint Veteran"),
      desc: L("+30 секунд до таймера кожної зміни!", "+30 seconds added to every shift timer!")
    },
    {
      id: "TITLE_LEGEND",
      reqType: "titles",
      reqCount: 10,
      title: L("🦅 Легенда кордону", "🦅 Border Legend"),
      desc: L("+20% до зарплати за кожного оформленого мандрівника!", "+20% base salary per processed traveler!")
    }
  ];
