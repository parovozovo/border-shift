(() => {
  "use strict";

  const SAVE_KEY = "border_shift_save_v3";
  const BUILD_VERSION = "v8.9";
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
      desc: L("Затримай 3+ шпигунів або контрабандистів — назавжди +400 🪙 до премії СБК за кожен арешт!", "Detain 3+ spies/smugglers — permanently +400 🪙 per SBK arrest!")
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
      desc: L("Викрий та затримай порушника з подвійним громадянством — +600 🪙 за затримання ухилянтів!", "Catch a dual-citizen evader — +600 🪙 bounty on evader arrests!")
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
      hint: L("З Дня 3+, затримай 5+ порушників при репутації СБК ≥ 65 і прийми пропозицію Майора «Тихого».", "From Day 3+, detain 5+ violators with SBK rep ≥ 65 and accept Major 'Quiet's offer.")
    },
    {
      id: "SERV_SBK_COLONEL",
      icon: "🎖️",
      title: L("СБК: Полковник під прикриттям", "SBK: Undercover Colonel"),
      desc: L("Викрито 4 небезпечних агентів чи VIP-утікачів на службі «Кордон-7» — отримано погони полковника СБК!", "Caught 4 high-value operatives as 'Border-7' — earned SBK Colonel epaulets!"),
      hint: L("Будучи агентом «Кордон-7», затримай 4 небезпечних шпигунів, диверсантів або розшукуваних VIP.", "As Agent 'Border-7', detain 4 spies, saboteurs or wanted VIPs.")
    },
    {
      id: "SERV_GUR_FINALE",
      icon: "🦅",
      title: L("ГУР-М: Операція «Перехват-7»", "GUR-M: Operation 'Intercept-7'"),
      desc: L("Успішна спільна спецоперація СБК та ГУР-М проти кортежу резидента ФСМ.", "Joint SBK & GUR-M operation against an armed FSM convoy."),
      hint: L("Заверши 7-й день із високою репутацією СБК (≥ 70).", "Finish Day 7 with high SBK reputation (≥ 70).")
    },
    {
      id: "SERV_TOLIK_FINALE",
      icon: "🚐",
      title: L("Синдикат Толіка: «Захід-Експрес»", "Tolik Syndicate: 'West-Express'"),
      desc: L("Вирішальна нічна справа контрабандистів на 3 фури до Варшавки.", "Decisive midnight smuggling convoy finale on the Varshavka route."),
      hint: L("Заверши 7-й день із високою довірою Толіка (≥ 60).", "Finish Day 7 with high Tolik trust (≥ 60).")
    },
    {
      id: "SERV_PALYCH_FINALE",
      icon: "🧢",
      title: L("Пал Палич: «Великий кошторис»", "Palych: 'The Grand Budget'"),
      desc: L("Пройдено фінальну перевірку генераторного бюджету перед ревізією з Києва.", "Cleared the grand generator-fund finale before the Kyiv audit."),
      hint: L("Заверши 7-й день із довірою Пал Палича (≥ 65).", "Finish Day 7 with Palych reputation (≥ 65).")
    },
    {
      id: "SERV_HONEST_FINALE",
      icon: "🏅",
      title: L("ДПСК: Державна подяка «Чесний рубіж»", "SBGS: 'Honorable Service' Commendation"),
      desc: L("Отримано офіційну подяку з Києва за дисципліну та порядок на КПП.", "Received official Kyiv commendation for honor and discipline."),
      hint: L("Заверши 7-й день без перекосу в кримінал чи корупцію.", "Finish Day 7 without leaning into corruption or smuggling.")
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
    },
    {
      id: "DISC_VASYA_ARC",
      icon: "🎭",
      title: L("Василь «Хамелеон»: Фінал історії", "Vasyl 'Chameleon': Story Finale"),
      desc: L("Пройдено всі 4 акти історії маскувальника Василя Підпільного — від перуки до фіналу.", "Completed all 4 chapters of master-of-disguise Vasyl Pidpilnyi."),
      hint: L("Зустрінь Василя 4 рази за кар'єру чи вільну гру й доведи його історію до кінця.", "Meet Vasyl 4 times in a run to reach his finale.")
    },
    {
      id: "DISC_PHONE_CALL",
      icon: "☎️",
      title: L("Дзвінок зверху", "Call from Above"),
      desc: L("Прийнято та опрацьовано терміновий службовий чи тіньовий дзвінок на пост.", "Answered a live mid-inspection hotline or syndicate phone call."),
      hint: L("Підійми слухавку, коли телефон на посту задзвонить під час перевірки.", "Answer the desk phone when it rings mid-inspection.")
    },
    {
      id: "DISC_HAGGLE_PRO",
      icon: "📈",
      title: L("Майстер торгу", "Master Haggler"),
      desc: L("Успішно виторговано більшу суму в конверті прямо на КПП.", "Successfully squeezed a bigger bribe out of a nervous traveler."),
      hint: L("Коли побачиш брудний конверт, натисни «📈 Мало!» й успішно дотисни водія.", "Click '📈 More!' on a dirty bribe offer and win the haggle.")
    }
  ];

  const WEATHER_DEFS = {
    CLEAR: {
      id: "CLEAR",
      icon: "🌙",
      title: L("Ясна зоряна ніч", "Clear Starry Night"),
      effect: L("Стандартна видимість — жодних перешкод на смузі.", "Clear visibility — standard booth conditions."),
      shortTag: L("🌙 Ясно", "🌙 Clear")
    },
    RAIN: {
      id: "RAIN",
      icon: "🌧️",
      title: L("Нічна злива", "Heavy Night Rain"),
      effect: L("Злива б'є по даху будки — гаряча ☕ кава дає +30% чайових!", "Pouring rain — hot ☕ coffee yields +30% extra tips!"),
      shortTag: L("🌧️ Злива (+30%☕)", "🌧️ Rain (+30%☕)")
    },
    FOG: {
      id: "FOG",
      icon: "🌫️",
      title: L("Густий туман", "Dense Highway Fog"),
      effect: L("Колір і модель авто в тумані! Вмикай 🔦 дальнє світло або УФ, щоб розгледіти машину.", "Vehicles shrouded in mist! Shine high-beams or UV (0s) to clear!"),
      shortTag: L("🌫️ Туман", "🌫️ Fog")
    },
    SNOW: {
      id: "SNOW",
      icon: "❄️",
      title: L("Хуртовина та заметіль", "Snowstorm & Blizzard"),
      effect: L("Номери заліплює снігом (🧤 протерти -1s або Лазер/Підігрів 0s) • Чайові ☕ +50%!", "License plates frosted (🧤 wipe -1s or Laser/Heated Seat 0s) • ☕ +50% tips!"),
      shortTag: L("❄️ Сніг (+50%☕)", "❄️ Snow (+50%☕)")
    },
    STORM: {
      id: "STORM",
      icon: "⛈️",
      title: L("Гроза та шквал", "Thunderstorm"),
      effect: L("Світло блимає на паперах без ⛽ генератора «Хонда-КПП» • Доплата +10% до ставки!", "Booth lights flicker without ⛽ generator • +10% hazard salary bonus!"),
      shortTag: L("⛈️ Гроза (+10%🪙)", "⛈️ Storm (+10%🪙)")
    }
  };

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
    },
    MISSING_DAILY_DOC: {
      code: "MISSING_DAILY_DOC",
      requiresDetention: false,
      title: L("Відсутній обов'язковий документ дня", "Missing Mandatory Daily Document"),
      hint: L("Виявлено: відсутня обов'язкова страховка або транзитний талон за указом дня.", "Finding: missing required daily insurance or transit permit.")
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
      desc: L("Старт будь-якого нового забігу з +1 200 🪙 у кишені.", "Start every new run with +1,200 🪙 cash.")
    },
    {
      id: "SHYTOMYR_THERMOS",
      reqType: "shytomyr",
      reqCount: 6,
      title: L("☕ Термос по-шитомирськи", "☕ Shytomyr Thermos"),
      desc: L("+50 🪙 до кожних чайових за каву у будці.", "+50 🪙 bonus to every coffee tip in the booth.")
    },
    {
      id: "SHYTOMYR_CROWN",
      reqType: "shytomyr",
      reqCount: 12,
      title: L("👑 Орден Шитомира (12/12)", "👑 Order of Shytomyr (12/12)"),
      desc: L("Старт забігу з +3 200 🪙 (додатково) та -15% стартового ризику НАБК!", "Start every run with +3,200 🪙 extra and -15% starting NABK risk!")
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

  const ACT_ONE_DAYS = [
    {
      dayNumber: 1,
      dateLabel: L("День 1 • 25 лютого 2022", "Day 1 • Feb 25, 2022"),
      headline: L("РАНОК, ЯКИЙ УСЕ ЗМІНИВ", "THE MORNING THAT CHANGED EVERYTHING"),
      radioNews: L("Радіо «Хвиля Kraina»: На виїзді з Кийграда та під Левгородом затори на десятки кілометрів у бік Поландії. Введено воєнний стан. Контррозвідка СБК приведена в бойову готовність.", "Radio Kraina Wave: Massive traffic jams from Kyihrad and Levhorod toward Polandia. Martial law declared. SBK counter-intelligence on high alert."),
      bossBriefing: L("Пал Палич: «Так, інспекторе, слухай сюди. Указ №1: чоловіків 18–60 років на ВИЇЗД до Поландії та Унії НЕ ПРОПУСКАТИ без офіційної довідки! На В'ЇЗД пускаємо всіх із дійсним паспортом. І якщо під'їде спецборт ГУР із паролем «Паляниця-Північ» — пропускай без затримок.»", "Pal Palych: 'Decree #1: NO MALES aged 18–60 EXITING to Polandia/Unia without an Exemption Certificate! ENTRY is allowed with a valid passport. And if a GUR operative gives callsign Palyanytsia-North — wave them through.'"),
      rulesList: [
        L("1. Усі мандрівники повинні мати дійсний паспорт (термін дії від 2022 року і пізніше).", "1. All travelers must hold a valid passport (expiry 2022 or later)."),
        L("2. Фото в паспорті та ПІБ мають збігатися з особою перед вікном.", "2. Passport photo and name must match the person at the booth window."),
        L("3. Чоловіки 18–60 років на ВИЇЗД зобов'язані мати дійсну Довідку про відстрочку.", "3. Males 18–60 EXITING must present a valid Exemption Certificate.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: L("Орієнтування ДПСК: уважно звіряйте фотографії в паспортах та дати дії документів.", "SBGS Alert: carefully compare passport photos and expiry dates."),
      bossCut: 180,
      hasSiren: true
    },
    {
      dayNumber: 2,
      dateLabel: L("День 2 • Березень 2022", "Day 2 • March 2022"),
      headline: L("ПОЛЮВАННЯ НА КОРИГУВАЛЬНИКІВ", "HUNT FOR ARTILLERY SPOTTERS"),
      radioNews: L("Радіо «Хвиля Kraina»: СБК викрила мережу навідників на трасі Слобожанськ — Левгород. На КПП масово везуть липові довідки від фіктивних клінік.", "Radio Kraina Wave: SBK exposed an artillery spotter network along the Slobozhansk — Levhorod highway. Fake clinic exemptions flooding checkpoints."),
      bossBriefing: L("Пал Палич: «Майор СБК «Тихий» шукає ворожого коригувальника зі шрамом на щоці та фальшивомонетників із липовими печатками. Побачиш фальшиву установу або шпигуна — тисни 🚨 СБК / АРЕШТ!»", "Pal Palych: 'SBK Major Quiet is hunting an enemy spotter with a cheek scar and forgery buyers. Spot a bogus issuer or operative — hit 🚨 DETAIN!'"),
      rulesList: [
        L("1. Дійсний паспорт без розбіжностей у фото та ПІБ.", "1. Valid passport with matching photo and full name."),
        L("2. Чоловіки 18–60 на ВИЇЗД: Довідка зі справжньою державною печаткою (ЦНАП / ДПСК / ВЛК).", "2. Males 18–60 EXITING: Exemption Certificate with an authentic state seal."),
        L("3. Підозрілих осіб перевіряй УФ-ліхтарем та кнопкою «Нагримати» — небезпечних затримуй через 🚨 АРЕШТ.", "3. Test suspects with UV flashlight & Knock — press 🚨 DETAIN on criminals.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: L("Орієнтування СБК: особи зі шрамом або підробленими печатками", "SBK Alert: Individuals with cheek scar or forged issuer stamps"),
      bossCut: 220,
      hasSiren: false
    },
    {
      dayNumber: 3,
      dateLabel: L("День 3 • Осінь 2022", "Day 3 • Autumn 2022"),
      headline: L("ДРОНИ, «ДВІЙНИКИ» ТА КОНТРАБАНДА ЧІПІВ", "DRONES, CLONED CARS & CHIP SMUGGLING"),
      radioNews: L("Радіо «Хвиля Kraina»: Над західними магістралями зафіксовано проліт «мопедів». Посилено контроль авто, велотранспорту та багажу на виїзд до Варшавки.", "Radio Kraina Wave: Drones spotted along western highways. Tightened inspection of vehicles, bikes, and luggage heading to Varshavka."),
      bossBriefing: L("Пал Палич: «Відсьогодні вимагаємо Декларацію транспорту і багажу! Дивись у вікно: якщо там стоїть вишнева «Беха», а в паперах написано синій «Занос» — це авто-двійник, одразу 🚨 АРЕШТ! І пускай пса «Бавовну» на підозрілі буси!»", "Pal Palych: 'Transport Declarations are mandatory! Check the window: if a cherry-red SUV is outside while papers say silver sedan — that is a cloned car, hit 🚨 DETAIN! And send sniffer dog Bavovna to check cargo!'"),
      rulesList: [
        L("1. Дійсний паспорт + підстава на виїзд чоловікам 18–60.", "1. Valid passport + exit permit for males 18–60."),
        L("2. Транспортна декларація: модель, КОЛІР і держномер у папері мають збігатися з тим, що стоїть біля шлагбаума!", "2. Transport Declaration: model, COLOR, and plate must match what is outside the window!"),
        L("3. За підозри на контрабанду чи тайник — пускай пса «Бавовну» (🐕 Огляд).", "3. Suspicious cargo or bags? Use sniffer dog 'Bavovna' (🐕 Search).")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Увага: звіряй колір транспорту у вікні з техпаспортом та перевіряй тайники псом", "Alert: Match parked transport color with papers and check stashes with the dog"),
      bossCut: 260,
      hasSiren: true
    },
    {
      dayNumber: 4,
      dateLabel: L("День 4 • Літо 2023", "Day 4 • Summer 2023"),
      headline: L("СПЕЦОПЕРАЦІЯ НАБК І БАТАЛЬЙОН «МОНАКІВКА»", "NABK STINGS & BATTALION 'MONAKIVKA'"),
      radioNews: L("Радіо «Хвиля Kraina»: Антикорупційне бюро НАБК проводить приховані рейди з мікрокамерами. Паралельно через кордон прориваються ділки з липовими диппаспортами в Монаківку.", "Radio Kraina Wave: Anti-corruption agency NABK launched hidden camera stings while VIPs forge diplomatic passes for Monakivka."),
      bossBriefing: L("Пал Палич: «Інспекторе, не спи! По черзі бродять провокатори НАБК із камерами в ґудзиках! Посвіти на нахабного хабародавця 🔦 УФ-ліхтарем або нагримай — камера себе видасть. І не бери в них мічених грошей!»", "Pal Palych: 'Stay sharp! NABK sting operatives with lapel cameras are testing inspectors! Shine your 🔦 UV flashlight on suspicious bribers and NEVER touch their marked cash!'"),
      rulesList: [
        L("1. Паспорт, підстава на виїзд чоловікам 18–60, збіг транспорту й декларації.", "1. Passport, male 18–60 permit, transport color/plate match."),
        L("2. ОБЕРЕЖНО: Підставні агенти НАБК сунуть хабар на камеру!", "2. WARNING: Undercover NABK agents film bribe attempts!"),
        L("3. При виявленні фальшивих диппаспортів або контрабанди — 🚨 АРЕШТ.", "3. Fake diplomatic papers or contraband — 🚨 DETAIN.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Тактика: УФ-ліхтар (🔦) та тиск (📢) допомагають викрити підставних агентів і підробки", "Tactic: UV Flashlight (🔦) and Intimidate (📢) expose hidden stings and forgeries"),
      bossCut: 300,
      hasSiren: false
    },
    {
      dayNumber: 5,
      dateLabel: L("День 5 • Травень 2024", "Day 5 • May 2024"),
      headline: L("ЦИФРОВИЙ «ОБЛІК+» І ФІНАЛЬНИЙ РУБІЖ", "DIGITAL 'OBLIK+' & CRUCIAL SHIFT"),
      radioNews: L("Радіо «Хвиля Kraina»: Запрацював єдиний електронний реєстр «Облік+». Тим часом контррозвідка готує масштабну ротацію прикордонних змін.", "Radio Kraina Wave: 'Oblik+' digital registry is live across all checkpoints ahead of major border rotations."),
      bossBriefing: L("Пал Палич: «Первинне бронювання закінчується сьогодні! Перевіряємо QR-код «Облік+» у кожного чоловіка 18–60. Від цієї зміни залежить твій подальший шлях!»", "Pal Palych: 'Initial contracts expire tonight! Verify the Oblik+ QR code on every male 18–60. Tonight shapes your career path!'"),
      rulesList: [
        L("1. Дійсний паспорт, збіг фото й ПІБ.", "1. Valid passport, matching photo and full name."),
        L("2. Чоловіки 18–60 (ВИЇЗД): Довідка про відстрочку + дійсний QR-код «Облік+».", "2. Males 18–60 (EXIT): Exemption Certificate + valid 'Oblik+' QR code."),
        L("3. Звірка транспорту, УФ-перевірка печаток та виявлення агентури.", "3. Transport verification, UV seal check, and spy detention.")
      ],
      requireOblikQr: true,
      requireVehicleDecl: true,
      wantedHint: L("Перевіряйте QR-код «Облік+» у всіх військовозобов'язаних чоловіків!", "Verify 'Oblik+' QR status on all eligible males!"),
      bossCut: 350,
      hasSiren: true
    },
    {
      dayNumber: 6,
      dateLabel: L("День 6 • Осінь 2024", "Day 6 • Autumn 2024"),
      headline: L("ОПЕРАЦІЯ КОНТРНАСТУП І ПОЛЮВАННЯ НА ВТІКАЧІВ", "COUNTEROFFENSIVE & FUGITIVE HUNT"),
      radioNews: L("Радіо «Хвиля Kraina»: Військова Поліція (ВСП) та ГУР-М проводять спільний рейд на західних КПП: викривають ухилянтів із подвійним громадянством та агентів ФСМ.", "Radio Kraina Wave: VSP Military Police & GUR-M launch joint checkpoint sweeps targeting dual-citizenship evaders & FSM spies."),
      bossBriefing: L("Пал Палич: «Сьогодні через пост рвуться топові втікачі й подвійні громадяни! Іноземців пропускаємо, але якщо є прихований паспорт Kraina — клич ВСП (🚨 АРЕШТ)!»", "Pal Palych: 'High-profile fugitives & dual citizens incoming! Clean foreigners pass, hidden Kraina passport — call Military Police (🚨 DETAIN)!'"),
      rulesList: [
        L("1. Іноземці (Франція-Люкс, Поландія, Британіка...) без паспорта Kraina — ПРОПУСК.", "1. Pure foreign citizens without Kraina citizenship — APPROVE."),
        L("2. Подвійне громадянство у чоловіка 18–60 або шпигун ФСМ — 🚨 АРЕШТ / ВСП.", "2. Dual citizenship on male 18–60 or FSM spy — 🚨 DETAIN / VSP."),
        L("3. Обов'язковий QR «Облік+» і звірка транспорту.", "3. Oblik+ QR & vehicle declaration mandatory.")
      ],
      requireOblikQr: true,
      requireVehicleDecl: true,
      wantedHint: L("Стежте за подвійним громадянством та терміновими дзвінками по рації!", "Watch for hidden dual citizenship and urgent radio dispatches!"),
      bossCut: 420,
      hasSiren: true
    },
    {
      dayNumber: 7,
      dateLabel: L("День 7 • Зима 2025", "Day 7 • Winter 2025"),
      headline: L("ФІНАЛЬНИЙ РУБІЖ: ВІЙНА І ЗМІНИ", "FINAL FRONTIER: WAR & SHIFTS"),
      radioNews: L("Радіо «Хвиля Kraina»: Завершується вирішальний тиждень на КПП. ГУР-М, СБК та НАБК підбивають підсумки твоєї служби за всі 7 днів.", "Radio Kraina Wave: The decisive week concludes. GUR-M, SBK & NABK compile your 7-day service dossier."),
      bossBriefing: L("Пал Палич: «Остання вахта Кампанії! Усе, що ти зробив за ці дні — кого пропустив, кого затримав і чи брав конверти — сьогодні вирішить твою долю!»", "Pal Palych: 'Final Campaign shift! Every call you made this week shapes your fate tonight!'"),
      rulesList: [
        L("1. Повний контроль: паспорт, фото, підстава 18–60, «Облік+», авто й багажник.", "1. Full inspection: ID, photo, 18–60 permit, Oblik+, transport & trunk."),
        L("2. Реагуйте на термінові орієнтування по рації СБК.", "2. Act on urgent SBK radio dispatches."),
        L("3. Після зміни підіб'ємо підсумки 7 днів або перейдемо у Вільну Кар'єру.", "3. After shift: claim Campaign Dossier or continue into Open Career.")
      ],
      requireOblikQr: true,
      requireVehicleDecl: true,
      wantedHint: L("Вирішальна зміна — кожна дрібниця має значення!", "Crucial shift — every detail counts!"),
      bossCut: 500,
      hasSiren: true
    }
  ];

  // Dynamic Evening Bills, Progressive Activities & Rare Night Events (UAH & USD)
  const DYNAMIC_EVENING_BILLS = [
    {
      id: "food_utilities",
      minDay: 1, chance: 1.0, currency: "UAH",
      title: L("🛒 Закупити харчі, павербанки та бензин у генератор (+15% сім'я)", "🛒 Buy groceries, powerbanks & generator fuel (+15% family)"),
      subtitle: L("Дім у теплі й зі світлом — можна пропустити 1–2 вечори", "Keep home warm and lit — optional if savings are tight"),
      cost: 1800, morale: 15, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "reb_donation",
      minDay: 1, chance: 1.0, currency: "UAH",
      title: L("📡 Скинутися куму з ЗСК на купольний РЕБ проти «мопедів» (+15 СБК, +12% сім'я)", "📡 Chip in for an anti-drone EW jammer (+15 SBK, +12% family)"),
      subtitle: L("Військові дякують, а майор СБК «Тихий» ставить плюсик у досьє", "Troops thank you and SBK Major Quiet logs your support"),
      cost: 2500, morale: 12, escape: 0, riskDelta: -8, sbkDelta: 15
    },
    {
      id: "mother_truskavets",
      minDay: 1, chance: 0.85, currency: "UAH",
      title: L("⛲ Путівка для мами й тещі у Трускавецьк на мінеральні води (+25% сім'я)", "⛲ Send mom & mother-in-law to Truskavetsk mineral spa (+25% family)"),
      subtitle: L("Удома панує благословенна тиша на тиждень вперед!", "Blessed peace and quiet at home all week!"),
      cost: 3200, morale: 25, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "dog_vet_spa",
      minDay: 1, chance: 0.9, currency: "UAH",
      title: L("🐕 СПА та вітаміни для пса «Бавовни» (+10 СБК, +10% сім'я)", "🐕 Vet Spa & Vitamins for Sniffer Dog 'Bavovna' (+10 SBK, +10% family)"),
      subtitle: L("Пес радісно махає хвостом і краще чує контрабанду", "Happy sniffer dog stays sharp at the gate"),
      cost: 1500, morale: 10, escape: 0, riskDelta: 0, sbkDelta: 10
    },
    {
      id: "shred_evidence",
      minDay: 2, chance: 0.75, currency: "USD",
      title: L("🕵️‍♂️ Адвокат-«рішала» з Кийграда: зачистити хвости в НАБК (-25% ризику НАБК)", "🕵️‍♂️ Kyihrad fixer lawyer: scrub NABK investigation tails (-25% NABK risk)"),
      subtitle: L("Порятунок, якщо брав товсті конверти або прикупив майно", "Lifesaver if you took fat envelopes or bought luxury assets"),
      cost: 950, morale: 0, escape: 0, riskDelta: -25, sbkDelta: 0
    },
    {
      id: "smuggler_poker",
      minDay: 2, chance: 0.55, currency: "USD",
      title: L("🃏 Закритий покер із перевізниками Толіка (+18 Толік, +12% сім'я)", "🃏 Backroom Poker with Tolik's Crew (+18 Tolik, +12% family)"),
      subtitle: L("Живі зв'язки з синдикатом та шанс зірвати банк (+6% НАБК)", "Build syndicate trust (+6% NABK risk)"),
      cost: 550, morale: 12, escape: 0, riskDelta: 6, sbkDelta: 0, tolikDelta: 18
    },
    {
      id: "crypto_signal_vip",
      minDay: 3, chance: 0.45, currency: "USD",
      title: L("📈 Вкластися в закритий крипто-інсайд «Шитомир-Коїн» (+2 100 💵!)", "📈 Join 'Shytomyr-Coin' Crypto Insider Pool (+2,100 💵!)"),
      subtitle: L("Поступово відкривається з Дня 3+ — множить вкладені 850 💵 у ~2.5 рази!", "Unlocks Day 3+ — turns 850 💵 into 2,100 💵!"),
      cost: 850, morale: 8, escape: 0, riskDelta: 4, sbkDelta: 0, usdReward: 2100
    },
    {
      id: "secret_shytomyr_party",
      minDay: 2, chance: 0.22, isRare: true, currency: "USD",
      title: L("🧦 Таємна вечірка «Підземний Шитомир» (+35% сім'я, -10% НАБК)", "🧦 Secret 'Underground Shytomyr' Party (+35% family, -10% NABK)"),
      subtitle: L("✨ Рідкісна нічна подія (22% шанс): земляки накривають стіл!", "✨ Rare night event (22% chance): Shytomyr legends host a feast!"),
      cost: 500, morale: 35, escape: 0, riskDelta: -10, sbkDelta: 0, tolikDelta: 15
    },
    {
      id: "witch_fortune",
      minDay: 3, chance: 0.18, isRare: true, currency: "UAH",
      title: L("🔮 Карпатська мольфарка: зняти «порчу НАБК» (-20% НАБК, +18% сім'я)", "🔮 Carpathian Mystic: Cleanse 'NABK Hex' (-20% NABK, +18% family)"),
      subtitle: L("✨ Рідкісна подія (18% шанс): димить травами прямо над декларацією!", "✨ Rare event (18% chance): herbal smoke clears your audit karma!"),
      cost: 4200, morale: 18, escape: 0, riskDelta: -20, sbkDelta: 5
    },
    {
      id: "shady_kazino_night",
      minDay: 2, chance: 0.24, isRare: true, currency: "USD",
      title: L("🎰 Підпільне «Казино КПП-777» (Виграй +1 800 💵!)", "🎰 Underground 'Gate-777 Casino' (Win +1,800 💵!)"),
      subtitle: L("✨ Рідкісна подія (24% шанс): крутиш рулетку за 450 💵!", "✨ Rare event (24% chance): spin the midnight wheel for 450 💵!"),
      cost: 450, morale: 15, escape: 0, riskDelta: 5, sbkDelta: 0, usdReward: 1800
    },
    {
      id: "black_market_drone_lens",
      minDay: 3, chance: 0.20, isRare: true, currency: "USD",
      title: L("🛸 Нічний аукціон трофейної оптики для ГУР-М (+30 СБК, -12% НАБК)", "🛸 Midnight Trophy Optics Auction for GUR-M (+30 SBK, -12% NABK)"),
      subtitle: L("✨ Рідкісна подія (20% шанс): розвідка цінує такий підгін!", "✨ Rare event (20% chance): GUR-M remembers top-grade optics!"),
      cost: 1300, morale: 0, escape: 0, riskDelta: -12, sbkDelta: 30
    },
    {
      id: "diplomat_banquet",
      minDay: 4, chance: 0.16, isRare: true, currency: "USD",
      title: L("🥂 Закритий банкет консулів Франції-Люкс (+25 Палич, +25 СБК, -15% НАБК)", "🥂 Francia-Lux Consuls Banquet (+25 Palych, +25 SBK, -15% NABK)"),
      subtitle: L("✨ Елітна подія Дня 4+ (16% шанс): найвищі зв'язки на кордоні!", "✨ Rare Day 4+ event (16% chance): elite diplomatic connections!"),
      cost: 1500, morale: 20, escape: 0, riskDelta: -15, sbkDelta: 25, palychDelta: 25
    },
    {
      id: "bukovel_weekend",
      minDay: 1, chance: 0.9, currency: "UAH",
      title: L("🎿 Сімейні вихідні в аквапарку Буковельська (+22% сім'я, -5% стресу НАБК)", "🎿 Family weekend at Bukovelsk spa resort (+22% family)"),
      subtitle: L("Справжнє перезавантаження між важкими змінами", "Real reset between intense shifts"),
      cost: 2800, morale: 22, escape: 0, riskDelta: -5, sbkDelta: 5
    },
    {
      id: "midnight_shawarma_crawl",
      minDay: 1, chance: 0.85, currency: "UAH",
      title: L("🥙 Нічний рейд по шаурмі з псом «Бавовною» (+12% сім'я, +5 СБК)", "🥙 Midnight Shawarma Run with Bavovna (+12% family, +5 SBK)"),
      subtitle: L("Смачно, ситно й пес у захваті!", "Tasty, filling, and Bavovna approves!"),
      cost: 1500, morale: 12, escape: 0, riskDelta: 0, sbkDelta: 5
    },
    {
      id: "midnight_fishing",
      minDay: 2, chance: 0.65, currency: "UAH",
      title: L("🎣 Нічна рибалка на Тетереві з Пал Паличем (+20 Палич, -8% НАБК)", "🎣 Night Fishing with Pal Palych (+20 Palych, -8% NABK)"),
      subtitle: L("Спільна юшка на березі зближує краще за будь-який звіт", "Riverbank fish soup beats any paperwork"),
      cost: 2200, morale: 8, escape: 0, riskDelta: -8, sbkDelta: 0, palychDelta: 20
    },
    {
      id: "donate_drones_crew",
      minDay: 2, chance: 0.6, currency: "UAH",
      title: L("🚁 Нічний збір на FPV-рій для розвідки ГУР-М (+28 СБК, -10% НАБК)", "🚁 Fund FPV Drone Swarm for GUR-M (+28 SBK, -10% NABK)"),
      subtitle: L("Хлопці на передку передають подяку й прикривають твій тил", "Frontline scouts appreciate the gear"),
      cost: 4500, morale: 15, escape: 0, riskDelta: -10, sbkDelta: 28
    },
    {
      id: "underground_mma",
      minDay: 2, chance: 0.5, currency: "USD",
      title: L("🥊 Підпільні бої «Митниця vs Контрабас» (+22 Толік, +12% сім'я)", "🥊 Underground Fight Night: Customs vs Smugglers (+22 Tolik)"),
      subtitle: L("Ставиш на Толікового бійця — повага в синдикаті зростає (+5% НАБК)", "Syndicate street cred rises (+5% NABK)"),
      cost: 400, morale: 12, escape: 0, riskDelta: 5, sbkDelta: 0, tolikDelta: 22
    },
    {
      id: "fake_auction_painting",
      minDay: 3, chance: 0.45, currency: "USD",
      title: L("🖼️ Купити картину «Козак Мамай на крипто-полотні» (+30% сім'я)", "🖼️ Buy 'Kozak Mamai on Crypto-Canvas' (+30% family)"),
      subtitle: L("Дружина в захваті, а критики кажуть, що це чистий авангард", "Wife loves it, critics call it pure avant-garde"),
      cost: 1000, morale: 30, escape: 0, riskDelta: -6, sbkDelta: 0
    },
    {
      id: "vip_sauna_delegates",
      minDay: 3, chance: 0.22, isRare: true, currency: "USD",
      title: L("🧖 VIP-сауна з делегатами Карпатії (+25 Палич, +15 Толік, +15% сім'я)", "🧖 VIP Sauna with Karpatia Delegates (+25 Palych, +15 Tolik)"),
      subtitle: L("✨ Рідкісна нічна подія (22% шанс): усі важливі питання вирішуються в парі!", "✨ Rare event (22% chance): deals sealed in steam!"),
      cost: 900, morale: 15, escape: 0, riskDelta: 4, sbkDelta: 0, palychDelta: 25, tolikDelta: 15
    },
    {
      id: "hack_registry_night",
      minDay: 4, chance: 0.19, isRare: true, currency: "USD",
      title: L("💻 Замовити «Сірого Хакера» почистити логи КПП (-35% НАБК, -1 Догана!)", "💻 Hire 'Gray Hacker' to wipe checkpoint logs (-35% NABK, -1 Reprimand!)"),
      subtitle: L("✨ Рідкісна подія Дня 4+ (19% шанс): зникають навіть старі догани!", "✨ Rare Day 4+ event (19% chance): even reprimands vanish!"),
      cost: 1200, morale: 0, escape: 0, riskDelta: -35, sbkDelta: 0, reprimandHeal: 1
    },
    {
      id: "smuggler_treasure_map",
      minDay: 4, chance: 0.17, isRare: true, currency: "USD",
      title: L("🗺️ Купити в Толіка «карту забутого складу» (+3 200 💵 заначки!)", "🗺️ Buy 'Forgotten Stash Map' from Tolik (+3,200 💵 haul!)"),
      subtitle: L("✨ Рідкісна подія Дня 4+ (17% шанс): за 900 💵 відкопуєш старий сейф!", "✨ Rare Day 4+ event (17% chance): dig up an old stash!"),
      cost: 900, morale: 10, escape: 0, riskDelta: 8, sbkDelta: 0, usdReward: 3200
    },
    {
      id: "extra_k9_handler",
      minDay: 1, chance: 0.85, currency: "UAH",
      title: L("🐕 Додатковий інструктор для «Бавовни» (+20с часу на наступну зміну)", "🐕 Extra K9 Trainer for 'Bavovna' (+20s next shift)"),
      subtitle: L("Тактична підготовка пса до завтрашньої черги", "Prep your sniffer dog for tomorrow's rush"),
      cost: 2400, morale: 5, escape: 0, riskDelta: 0, sbkDelta: 5, nextTimeBoost: 20
    },
    {
      id: "customs_broker_tip",
      minDay: 2, chance: 0.65, currency: "USD",
      title: L("💼 Інсайд митного брокера на завтра (+25% до конвертів наступної зміни)", "💼 Customs Broker Insider (+25% bribe offers next shift)"),
      subtitle: L("Попередить жирних клієнтів про твою зміну (+4% НАБК)", "Steers richer VIPs to your booth (+4% NABK)"),
      cost: 700, morale: 5, escape: 0, riskDelta: 4, sbkDelta: 0, nextBribeBoost: 0.25
    },
    {
      id: "frontier_charity_cup",
      minDay: 2, chance: 0.70, currency: "UAH",
      title: L("🏆 Спонсорувати кубок прикордонників (+18 Палич, +15 СБК, -10% НАБК)", "🏆 Sponsor Border Guard Cup (+18 Palych, +15 SBK, -10% NABK)"),
      subtitle: L("Зміцнює авторитет серед керівництва та контррозвідки", "Builds goodwill with both Palych and SBK"),
      cost: 3500, morale: 10, escape: 0, riskDelta: -10, sbkDelta: 15, palychDelta: 18
    }
  ];

  // Rebalanced Realistic Shop: 41 Main Assets + 12 Add-ons (53 Total) — Honest Tools/Biz in Hrymnyky (🪙), Clout/Luxury in Baksiky (💵)!
  const ASSET_UPGRADES = [
    {
      id: "thermos_tray",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "🥐",
      title: L("Набір термосів та підігрівач круасанів у будку", "Thermos & Croissant Warmer Set"),
      subtitle: L("+10с до кожної зміни назавжди та +80 🪙 до чайових за каву", "+10s shift time permanently & +80 🪙 coffee tips"),
      cost: 5500, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "espresso_machine",
      category: "TECH",
      currency: "UAH",
      icon: "☕",
      title: L("Італійська кавомашина «Еспресо-Магнат» у будку", "Italian 'Espresso-Magnat' Machine"),
      subtitle: L("+25 секунд до кожної зміни назавжди + +150 🪙 до чайових за каву", "+25s to every shift permanently + +150 🪙 coffee tips"),
      cost: 12000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "parrot_kesha",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "🦜",
      title: L("Говорящий папуга «Майор Кеша» у будку", "Talking Parrot 'Major Kesha' in Booth"),
      subtitle: L("Розважає водіїв (+150 🪙 до чайових за каву), -3% НАБК/день +10% сім'ї!", "Entertains drivers (+150 🪙 coffee tips), -3% daily NABK +10% family!"),
      cost: 16000, passiveIncome: 0, passiveUsd: 0, dailyRisk: -3, tolikBoost: 0, palychBoost: 5, moraleBoost: 10
    },
    {
      id: "heated_booth_seat",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "🪑",
      title: L("Ортопедичне крісло «Шеф-Комфорт» із підігрівом", "Heated Ergonomic Chair 'Chef-Comfort'"),
      subtitle: L("Менше втоми взимку: +14 секунд до кожної зміни назавжди!", "Less fatigue on cold shifts: +14s to every shift permanently!"),
      cost: 18000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "money_detector",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "🔎",
      title: L("Детектор купюр та оптична лупа «Спектр-УФ»", "Banknote Detector & Optical Loupe 'Spektr-UV'"),
      subtitle: L("+120 🪙 премії ДПСК за кожне правильне рішення в будці!", "+120 🪙 SBGS bonus on every correct booth decision!"),
      cost: 22000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "uv_spotlight",
      category: "TECH",
      currency: "UAH",
      icon: "🔦",
      title: L("Потужний стаціонарний УФ-прожектор «Сова-М»", "Heavy UV Spotlight 'Sova-M'"),
      subtitle: L("Широкий промінь УФ-лампи + +50% премій за секретні УФ-шифри та -10% штрафів за помилки", "Wide UV beam + +50% bonuses from secret UV ciphers & -10% protocol fines"),
      cost: 24000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "iphon_17_pro",
      category: "TECH",
      currency: "UAH",
      icon: "📱",
      title: L("Смартфон «ЯблуФон 17 Про» (Швидкий довідник)", "Phone 'YabloPhon 17 Pro'"),
      subtitle: L("Помилковий клік при вказуванні коштує -1с замість -2с + -3% комісії обміну!", "Wrong inspect click costs -1s instead of -2s + -3% exchange fee!"),
      cost: 28000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 5, moraleBoost: 15
    },
    {
      id: "laser_plate_reader",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "📡",
      title: L("Лазерний зчитувач номерів «Рубіж-Сканер»", "Optical Plate Reader 'Rubizh-Scan'"),
      subtitle: L("Прискорює оформлення в журналі: +3 секунди за кожне правильне рішення!", "Speeds up logging: +3s added on every correct decision!"),
      cost: 30000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 0
    },
    {
      id: "uv_endoscope",
      category: "TECH",
      currency: "UAH",
      icon: "🐕",
      title: L("Мобільний рентген-сканер + вітаміни для пса «Бавовни»", "Mobile X-Ray Scanner + Dog Treats for 'Bavovna'"),
      subtitle: L("Миттєвий рентген авто за 1 клік (-3с до вартості пса, мін. 2с)", "Instant 1-click vehicle X-Ray search (-3s dog cost, min 2s)"),
      cost: 34000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "diesel_generator",
      category: "TECH",
      currency: "UAH",
      onlyUah: true,
      icon: "⚡",
      title: L("Безшумний інверторний генератор «Хонда-КПП 5 кВт»", "Silent Inverter Generator 'Honda-KPP 5kW'"),
      subtitle: L("Світло й тепло без перебоїв: +15с до кожної зміни назавжди + 10 Паличу й сім'ї!", "Nonstop booth power: +15s every shift permanently & +10 Palych/family!"),
      cost: 38000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "sbk_database_tablet",
      category: "TECH",
      currency: "UAH",
      icon: "💻",
      title: L("Закритий планшет розвідки «Оберіг-Контур»", "Classified Intel Tablet 'Oberig-Kontur'"),
      subtitle: L("Додаткова часткова підказка в досьє розшуку + +20% до премій за арешт!", "Extra partial clue in Wanted Dossier + +20% SBK arrest bounties!"),
      cost: 45000, passiveIncome: 0, passiveUsd: 0, dailyRisk: -3, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "tactical_vest",
      category: "TECH",
      currency: "UAH",
      icon: "🦺",
      title: L("Тактичний бронежилет ДПСК «Кордон-Про»", "Tactical Armor Vest 'Border-Pro'"),
      subtitle: L("Солідний вигляд: -25% штрафів за помилки (діє найкращий захист) + 10 СБК", "Authority look: -25% protocol fines (best-only) & +10 SBK rep"),
      cost: 55000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5, sbkBoost: 10
    },
    {
      id: "steppe_ebike",
      category: "AUTO",
      currency: "UAH",
      onlyUah: true,
      icon: "🏍️",
      title: L("Електро-байк «Степовий Вітер»", "Electric Bike 'Steppe Wind'"),
      subtitle: L("+14с до кожної зміни (найкраще авто в гаражі), 0% ризику НАБК!", "+14s shift time (best ride only), 0% NABK risk!"),
      cost: 28000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 5, moraleBoost: 10
    },
    {
      id: "lanos_sport",
      category: "AUTO",
      currency: "UAH",
      onlyUah: true,
      icon: "🚗",
      title: L("«Ланос-Спорт 1.6» (Чесна робоча конячка)", "'Lanos-Sport 1.6' Workhorse"),
      subtitle: L("+18с до зміни (діє найкраще авто в гаражі) +10 сім'ї та Паличу, 0% НАБК!", "+18s shift time (best car only), +10 family & Palych, 0% NABK!"),
      cost: 65000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "camry_35",
      category: "AUTO",
      currency: "UAH",
      onlyUah: true,
      icon: "🚘",
      title: L("«Тайота Кемрі 3.5» (Солідна класика)", "'Tayota Kemri 3.5' Classic Sedan"),
      subtitle: L("+21с до зміни (найкраще авто), +12 Паличу та +10 Толіку, 0% НАБК!", "+21s shift time (best car), +12 Palych & +10 Tolik, 0% NABK!"),
      cost: 150000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 10, palychBoost: 12, moraleBoost: 12
    },
    {
      id: "skoda_octavia_rs",
      category: "AUTO",
      currency: "UAH",
      onlyUah: true,
      icon: "🚙",
      title: L("«Шкоднік Октавія RS» (Універсал бізнес-класу)", "'Shkodnik Octavia RS' Estate"),
      subtitle: L("+24с до зміни (найкраще авто), комфортна поїздка +12% сім'ї та +10 Паличу!", "+24s shift time (best car), +12% family & +10 Palych, 0% NABK!"),
      cost: 230000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 10, moraleBoost: 12
    },
    {
      id: "audi_q7_blyakha",
      category: "AUTO",
      currency: "USD",
      icon: "🚙",
      title: L("«Ауді Q7» на дипломатичних номерах", "'Audi Q7' on Diplomatic Plates"),
      subtitle: L("+25с до зміни (найкраще авто), +15 Толіку та +10% до суми всіх конвертів!", "+25s shift time (best car), +15 Tolik & +10% larger bribe envelopes!"),
      cost: 4200, passiveIncome: 0, passiveUsd: 0, dailyRisk: 2, tolikBoost: 15, palychBoost: 10, moraleBoost: 12
    },
    {
      id: "euro_bmw",
      category: "AUTO",
      currency: "USD",
      icon: "🚙",
      title: L("Чорна «Беха Х5» (Повний фарш)", "Black 'Beha X5' Executive"),
      subtitle: L("+28с до зміни (найкраще авто), повага Толіка (+20) і Палича (+15), +4% НАБК/день", "+28s shift (best car), Tolik (+20) & Palych (+15), +4% daily NABK risk"),
      cost: 7500, passiveIncome: 0, passiveUsd: 0, dailyRisk: 4, tolikBoost: 20, palychBoost: 15, moraleBoost: 15
    },
    {
      id: "gelik_v8",
      category: "AUTO",
      currency: "USD",
      icon: "🚐",
      title: L("Броньований «Гелік-Кубик V8 AMG»", "Armored 'Gelik-Kubik V8 AMG'"),
      subtitle: L("+31с до зміни, +25 Паличу і Толіку, та -15% ціни вечірніх підкупів!", "+31s shift (best car), +25 Palych & Tolik, -15% evening bribe costs!"),
      cost: 13500, passiveIncome: 0, passiveUsd: 0, dailyRisk: 5, tolikBoost: 25, palychBoost: 25, moraleBoost: 20
    },
    {
      id: "porsche_911",
      category: "AUTO",
      currency: "USD",
      icon: "🏎️",
      title: L("Спорткар «Стріла 911 Турбо»", "Sports Car 'Strila 911 Turbo'"),
      subtitle: L("+35с до кожної зміни назавжди +25 поваги Толіка та +20 щастя сім'ї!", "+35s to every shift permanently +25 Tolik rep & +20 family morale!"),
      cost: 21000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 4, tolikBoost: 25, palychBoost: 10, moraleBoost: 20
    },
    {
      id: "monako_hypercar",
      category: "AUTO",
      currency: "USD",
      icon: "🏎️",
      title: L("Гіперкар «Фурія-V12 Монаківка»", "Hypercar 'Furia-V12 Monakivka'"),
      subtitle: L("+40с до кожної зміни, +35 Толіку, +25 Паличу та +25% сім'ї!", "+40s shift time, +35 Tolik, +25 Palych & +25% family!"),
      cost: 35000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 5, tolikBoost: 35, palychBoost: 25, moraleBoost: 25
    },
    {
      id: "coffee_vending",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🥤",
      title: L("Кавомат самообслуговування перед шлагбаумом", "Self-Service Coffee Kiosk at Gate"),
      subtitle: L("Білий мікро-бізнес! +3 800 🪙 гримників щоранку без уваги НАБК!", "Clean micro-biz! +3,800 🪙 hrymnyky every morning, 0% NABK!"),
      cost: 32000, passiveIncome: 3800, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 8
    },
    {
      id: "shawarma_kiosk",
      category: "REALTY",
      currency: "UAH",
      icon: "🥙",
      title: L("Кіоск «Шаурма Шлагбаум-Люкс» біля КПП", "'Barrier-Lux Shawarma' Kiosk outside Checkpoint"),
      subtitle: L("Білий бізнес! Приносить +7 200 🪙 щоранку та знижує комісію відмивання!", "Legal business! +7,200 🪙 every morning & lowers laundering fee!"),
      cost: 60000, passiveIncome: 7200, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "car_wash_lux",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🧼",
      title: L("Автомийка самообслуговування «Піна-Кордон»", "Self-Serve Car Wash 'Foam-Border'"),
      subtitle: L("Черга миє авто перед митницею: +10 500 🪙 щоранку, 0% ризику НАБК!", "Drivers wash up before customs: +10,500 🪙 every morning, 0% NABK!"),
      cost: 90000, passiveIncome: 10500, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 8, moraleBoost: 10
    },
    {
      id: "tire_service_sto",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🔧",
      title: L("Шиномонтаж і СТО «Шлагбаум-Сервіс»", "Highway Tire Shop & Garage 'Barrier-Service'"),
      subtitle: L("Білий бізнес на трасі! +15 000 🪙 щоранку без уваги НАБК (+5% сім'я)", "Clean road business! +15,000 🪙 every morning, 0% NABK risk"),
      cost: 125000, passiveIncome: 15000, passiveUsd: 0, dailyRisk: 0, tolikBoost: 10, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "blogger_minivan",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🚐",
      title: L("Медіа-студія та мінівен «Тік-Ток Блогер-Мобіль»", "'Tik-Tok Blogger-Mobile' Media Studio"),
      subtitle: L("Реклама прикордонних лайфхаків: +19 000 🪙 щоранку +15% щастя сім'ї!", "Ad revenue: +19,000 🪙 every morning +15% family morale!"),
      cost: 160000, passiveIncome: 19000, passiveUsd: 0, dailyRisk: 0, tolikBoost: 10, palychBoost: 0, moraleBoost: 15
    },
    {
      id: "suburban_brick_house",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🏡",
      title: L("Котедж у передмісті з теплицею та сонячними панелями", "Suburban Cottage with Solar Panels"),
      subtitle: L("Біла нерухомість! +26 000 🪙 щоранку та +20% щастя сім'ї (0% НАБК).", "Clean home! +26,000 🪙 every morning & +20% family morale (0% NABK)."),
      cost: 240000, passiveIncome: 26000, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 20
    },
    {
      id: "border_hotel",
      category: "REALTY",
      currency: "UAH",
      onlyUah: true,
      icon: "🏨",
      title: L("Готель-комплекс «Нічний Шлагбаум» біля траси", "'Night Barrier' Highway Hotel Complex"),
      subtitle: L("Білий бізнес! +38 000 🪙 щоранку і +18% щастя сім'ї (0% НАБК)", "Clean business! +38,000 🪙 every morning & +18% family morale (0% NABK)"),
      cost: 350000, passiveIncome: 38000, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 18
    },
    {
      id: "duty_free_share",
      category: "REALTY",
      currency: "USD",
      icon: "🛍️",
      title: L("Частка в магазині «Д'юті-Фрі Захід-04»", "Stake in 'Duty-Free Zakhid-04'"),
      subtitle: L("Тіньова торгівля алкоголем і сигаретами: +950 💵 щоранку +15 Паличу!", "Border duty-free dividends: +950 💵 every morning & +15 Palych!"),
      cost: 5500, passiveIncome: 0, passiveUsd: 950, dailyRisk: 3, tolikBoost: 10, palychBoost: 15, moraleBoost: 10
    },
    {
      id: "kyivhrad_flat",
      category: "REALTY",
      currency: "USD",
      icon: "🏢",
      title: L("Пентхаус у ЖК «Липки-Гранд» (Кийград) на тещу", "Kyihrad Penthouse (in Mother-in-Law's Name)"),
      subtitle: L("Елітна оренда +28 000 🪙 та +800 💵 щоранку! (+5% уваги НАБК/день)", "Rental yield +28,000 🪙 & +800 💵 every morning! (+5% daily NABK)"),
      cost: 15000, passiveIncome: 28000, passiveUsd: 800, dailyRisk: 5, tolikBoost: 0, palychBoost: 0, moraleBoost: 25
    },
    {
      id: "carpathian_chalet",
      category: "REALTY",
      currency: "USD",
      icon: "🏔️",
      title: L("Шале з чанами в Буковельську (Із вертолітним майданчиком)", "Bukovelsk Mountain Chalet with Helipad"),
      subtitle: L("Курортний бізнес: +36 000 🪙 та +1 500 💵 щоранку + 25% щастя сім'ї!", "Resort income: +36,000 🪙 & +1,500 💵 every morning +25% family!"),
      cost: 24000, passiveIncome: 36000, passiveUsd: 1500, dailyRisk: 4, tolikBoost: 10, palychBoost: 15, moraleBoost: 25
    },
    {
      id: "spain_villa",
      category: "REALTY",
      currency: "USD",
      icon: "🏖️",
      title: L("Вілла на березі Алікантово (Іспанщина) + Золотий паспорт", "Alikantovo Seafront Villa (Spainia) & Golden Visa"),
      subtitle: L("Імперія нерухомості + пасивні +45 000 🪙 і +2 600 💵 щоранку!", "Real-estate empire + 45,000 🪙 & 2,600 💵 passive yield every morning!"),
      cost: 42000, passiveIncome: 45000, passiveUsd: 2600, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 35
    },
    {
      id: "dnipro_mansion",
      category: "REALTY",
      currency: "USD",
      icon: "🏰",
      title: L("Маєток на березі Дніпра (Із причалом та бункером)", "Riverfront Estate with Private Pier & Bunker"),
      subtitle: L("+3 800 💵 оренди щоранку та +35% щастя сім'ї!", "+3,800 💵 yield every morning & +35% family morale!"),
      cost: 55000, passiveIncome: 0, passiveUsd: 3800, dailyRisk: 5, tolikBoost: 15, palychBoost: 15, moraleBoost: 35
    },
    {
      id: "balenci_jacket",
      category: "LUXURY",
      currency: "UAH",
      icon: "🧥",
      title: L("Бренд-куртка «Баляга-Шок Піксель»", "Luxury Jacket 'Balyaga-Shok Pixel'"),
      subtitle: L("+35% до всіх чайових за каву та +20% до конвертів від порушників!", "+35% coffee tips & +20% larger bribe envelopes!"),
      cost: 42000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 1, tolikBoost: 10, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "customs_seal_ring",
      category: "LUXURY",
      currency: "USD",
      icon: "💍",
      title: L("Золотий перстень «Ветеран Митниці»", "Gold 'Customs Veteran' Signet Ring"),
      subtitle: L("Авторитет у темноті: +15% до суми всіх конвертів та +12 Паличу і Толіку!", "Instant clout: +15% larger bribe envelopes & +12 Palych/Tolik!"),
      cost: 1200, passiveIncome: 0, passiveUsd: 0, dailyRisk: 2, tolikBoost: 12, palychBoost: 12, moraleBoost: 5
    },
    {
      id: "rolex_watch",
      category: "LUXURY",
      currency: "USD",
      icon: "⌚",
      title: L("Золотий хронограф «Кролекс» (Як у генерала митниці)", "Gold 'Krolex' Chronograph"),
      subtitle: L("Пал Палич падає на коліна перед статусом і ріже свою вечірню частку на -50%!", "Pal Palych bows to the clout and halves his evening cut by 50%!"),
      cost: 2800, passiveIncome: 0, passiveUsd: 0, dailyRisk: 3, tolikBoost: 10, palychBoost: 25, moraleBoost: 10
    },
    {
      id: "fake_diplomat_id",
      category: "LUXURY",
      currency: "USD",
      icon: "🛂",
      title: L("Дипломатичний паспорт «Офшорія-VIP»", "Diplomatic Passport 'Ofshoria-VIP'"),
      subtitle: L("Прикриття статусом: пасивно -6% ризику НАБК щоранку та +15 Паличу", "Immunity cover: passively -6% NABK risk every morning & +15 Palych"),
      cost: 3800, passiveIncome: 0, passiveUsd: 0, dailyRisk: -6, tolikBoost: 5, palychBoost: 15, moraleBoost: 10
    },
    {
      id: "lawyer_retainer",
      category: "LUXURY",
      currency: "USD",
      icon: "⚖️",
      title: L("Абонемент топ-адвоката з Кийграда", "Top Kyihrad Defense Lawyer Retainer"),
      subtitle: L("-6% НАБК щоранку та +15% шансу успіху всіх вечірніх підкупів!", "-6% daily NABK risk & +15% success chance on all evening bribes!"),
      cost: 5200, passiveIncome: 0, passiveUsd: 0, dailyRisk: -6, tolikBoost: 5, palychBoost: 10, moraleBoost: 5
    },
    {
      id: "simba_zoo",
      category: "LUXURY",
      currency: "USD",
      icon: "🦁",
      title: L("Міні-зоопарк із ручним левом «Сімба» на дачі", "Backyard Mini-Zoo with Pet Lion 'Simba'"),
      subtitle: L("Приносить +32 000 🪙 щоранку від VIP-екскурсій +30% щастя сім'ї!", "Yields +32,000 🪙 ticket income every morning +30% family!"),
      cost: 9000, passiveIncome: 32000, passiveUsd: 0, dailyRisk: 3, tolikBoost: 15, palychBoost: 10, moraleBoost: 30
    },
    {
      id: "cyprus_offshore",
      category: "LUXURY",
      currency: "USD",
      icon: "🏝️",
      title: L("Холодний крипто-гаманець та траст в Офшорії", "Cold Crypto Wallet & Ofshoria Offshore Trust"),
      subtitle: L("Ховає декларацію: -8% НАБК щодня, +5 000 💵 ліміту відмивання і +1 800 💵 щоранку!", "Shields assets: -8% daily NABK, +5,000 💵 cap & +1,800 💵/morning!"),
      cost: 12500, passiveIncome: 0, passiveUsd: 1800, dailyRisk: -8, tolikBoost: 15, palychBoost: 0, moraleBoost: 10
    },
    {
      id: "monako_yacht",
      category: "LUXURY",
      currency: "USD",
      icon: "🚤",
      title: L("Яхта «Хвиля Монаківки» (Стоїть на причалі)", "Yacht 'Monakivka Wave'"),
      subtitle: L("Здається туристам: +2 400 💵 щоранку та +10% щастя сім'ї щодня!", "Charter income: +2,400 💵 every morning & +10% daily family morale!"),
      cost: 28000, passiveIncome: 0, passiveUsd: 2400, dailyRisk: 3, tolikBoost: 15, palychBoost: 10, moraleBoost: 25
    }
  ];

  // 12 Add-ons & Upgrades unlocked once you own the base asset!
  const ASSET_ADDONS = [
    {
      id: "addon_syrup_bar",
      parentId: "espresso_machine",
      currency: "UAH",
      icon: "🍯",
      title: L("Сироп-бар та круасани у будці", "Syrup Bar & Croissants"),
      subtitle: L("+120 🪙 до кожних чайових за каву!", "+120 🪙 bonus to every coffee tip!"),
      cost: 8000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "addon_gold_cage",
      parentId: "parrot_kesha",
      currency: "UAH",
      icon: "🎙️",
      title: L("Золота клітка + мікрофон для «Кеші»", "Gold Cage & Mic for 'Kesha'"),
      subtitle: L("+100 🪙 до кожних чайових за каву (Кеша розважає чергу)!", "+100 🪙 coffee tip bonus (Kesha entertains the line)!"),
      cost: 10000, passiveIncome: 0, passiveUsd: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 10
    },
    {
      id: "addon_osint_app",
      parentId: "iphon_17_pro",
      currency: "UAH",
      icon: "🛰️",
      title: L("Захищений VPN-канал «Тінь-Контур»", "Encrypted VPN 'Shadow-Kontur'"),
      subtitle: L("-20% стрибка ризику НАБК при взятті конвертів + +3 000 💵 до ліміту відмивання!", "-20% NABK jump when taking bribes + +3,000 💵 daily laundering cap!"),
      cost: 20000, passiveIncome: 0, passiveUsd: 0, dailyRisk: -2, tolikBoost: 0, palychBoost: 0, moraleBoost: 5
    },
    {
      id: "addon_night_grill",
      parentId: "shawarma_kiosk",
      currency: "UAH",
      icon: "🔥",
      title: L("Цілодобовий нічний гриль + чебуреки", "24/7 Night Grill Extension"),
      subtitle: L("+5 500 🪙 чистого білого прибутку щоранку!", "+5,500 🪙 legal profit every morning!"),
      cost: 28000, passiveIncome: 5500, passiveUsd: 0, dailyRisk: 0, tolikBoost: 5, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "addon_tire_import",
      parentId: "tire_service_sto",
      currency: "UAH",
      icon: "🛞",
      title: L("Склад європейської гуми та дисків без розмитнення", "Un-cleared Euro Tire & Rim Depot"),
      subtitle: L("+9 500 🪙 та +250 💵 пасивно щоранку!", "+9,500 🪙 & +250 💵 every morning!"),
      cost: 52000, passiveIncome: 9500, passiveUsd: 250, dailyRisk: 2, tolikBoost: 10, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "addon_hotel_casino",
      parentId: "border_hotel",
      currency: "USD",
      icon: "🎰",
      title: L("Підпільна VIP-кімната покеру в підвалі готелю", "Underground Hotel Poker Room"),
      subtitle: L("+700 💵 тіньового прибутку щоранку!", "+700 💵 underground income every morning!"),
      cost: 3200, passiveIncome: 0, passiveUsd: 700, dailyRisk: 3, tolikBoost: 15, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "addon_migalka",
      parentId: "euro_bmw",
      currency: "USD",
      icon: "🚨",
      title: L("Стробоскопи та «блатні» номери КР 0001", "VIP Strobes & KR 0001 Plates"),
      subtitle: L("+12с до кожної зміни (доїзд без пробок) + 15 поваги Толіка і Палича!", "+12s shift time + 15 Tolik & Palych rep!"),
      cost: 1500, passiveIncome: 0, passiveUsd: 0, dailyRisk: 3, tolikBoost: 15, palychBoost: 15, moraleBoost: 5
    },
    {
      id: "addon_croc_pool",
      parentId: "kyivhrad_flat",
      currency: "USD",
      icon: "🐊",
      title: L("Басейн на даху з ручним крокодилом «Гена»", "Rooftop Pool with Pet Crocodile 'Gena'"),
      subtitle: L("+15 000 🪙 оренди за VIP-вечірки щоранку + 20% щастя сім'ї!", "+15,000 🪙 VIP party rent every morning + 20% family morale!"),
      cost: 3600, passiveIncome: 15000, passiveUsd: 0, dailyRisk: 3, tolikBoost: 10, palychBoost: 10, moraleBoost: 20
    },
    {
      id: "addon_heli_pad",
      parentId: "carpathian_chalet",
      currency: "USD",
      icon: "🚁",
      title: L("Персональний гелікоптер «Бджілка-М»", "Private Helicopter 'Bdzhilka-M'"),
      subtitle: L("+1 000 💵 чартеру щоранку та -6% ризику НАБК щодня!", "+1,000 💵 charter every morning & -6% daily NABK risk!"),
      cost: 6000, passiveIncome: 0, passiveUsd: 1000, dailyRisk: -6, tolikBoost: 10, palychBoost: 10, moraleBoost: 15
    },
    {
      id: "addon_gold_jacuzzi",
      parentId: "monako_yacht",
      currency: "USD",
      icon: "🛁",
      title: L("Золоте джакузі на верхній палубі", "Gold Deck Jacuzzi"),
      subtitle: L("+900 💵 чартерного доходу щоранку!", "+900 💵 extra charter income every morning!"),
      cost: 5000, passiveIncome: 0, passiveUsd: 900, dailyRisk: 2, tolikBoost: 10, palychBoost: 5, moraleBoost: 15
    },
    {
      id: "addon_nitro_spoiler",
      parentId: "monako_hypercar",
      currency: "USD",
      icon: "🔥",
      title: L("Нітро-турбіна та карбоновий спойлер", "Nitro Turbine & Carbon Spoiler"),
      subtitle: L("Ще +15с до кожної зміни та +15 поваги Толіка!", "Extra +15s shift time & +15 Tolik rep!"),
      cost: 4500, passiveIncome: 0, passiveUsd: 0, dailyRisk: 2, tolikBoost: 15, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "addon_vineyard",
      parentId: "spain_villa",
      currency: "USD",
      icon: "🍷",
      title: L("Власний виноградник та бункер на березі", "Private Vineyard & Coastal Bunker"),
      subtitle: L("+1 400 💵 прибутку щоранку та -4% НАБК!", "+1,400 💵 passive yield every morning & -4% NABK!"),
      cost: 8500, passiveIncome: 0, passiveUsd: 1400, dailyRisk: -4, tolikBoost: 0, palychBoost: 0, moraleBoost: 20
    }
  ];

  // Mid-shift encounters (War, Special Services & Border Drama)
  const MID_SHIFT_ENCOUNTERS = [
    {
      id: "gur_drone_convoy",
      title: L("🦅 СПЕЦБОРТ ГУР / СБК НА ШЛАГБАУМІ", "🦅 CLASSIFIED GUR / SBK CONVOY"),
      desc: L(
        "До будки під'їжджає камуфльований «Пікап Ніссан Навара» без номерів. Офіцер у балаклаві показує жетон воєнної розвідки:\n«Інспекторе, веземо з Поландії 40 ударних FPV-дронів та РЕБ під Січеслав. На митниці Варшавки затримали оформлення — треба провести борт «у темну» без реєстру прямо зараз!»",
        "An unmarked camo pickup pulls up. A masked GUR officer flashes an intelligence badge:\n'Inspector, hauling 40 strike drones and EW gear toward Sicheslav. Varshavka customs stalled the paperwork — wave this convoy off-the-record right now!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 1, glasses: 2, headwear: 4, scarOrDetail: 1, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "pass_gur_convoy",
          label: L("🫡 Підняти шлагбаум без запису в журнал (+25 СБК, +2 000 🪙 зі спецфонду)", "🫡 Raise barrier off-the-record (+25 SBK, +2,000 🪙 covert bonus)"),
          outcome: L("Офіцер тисне тобі руку: «Служба не забуде, брате!» Увечері на картку приходить 2 000 🪙 премії.", "The officer shakes your hand: 'The Service won't forget!' 2,000 🪙 lands on your card."),
          moneyDelta: 2000, timeDelta: 10, riskDelta: -5, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 10
        },
        {
          id: "demand_bureaucracy",
          label: L("📋 Вимагати повного митного оформлення за інструкцією (-15с часу, +10 Палич)", "📋 Demand full customs paperwork by the book (-15s time, +10 Palych)"),
          outcome: L("Спецпризначенці крізь зуби чекають 15 хвилин, поки ти заповнюєш папірці.", "The operatives grind their teeth waiting while you fill out forms."),
          moneyDelta: 0, timeDelta: -15, riskDelta: 0, sbkDelta: -10, tolikDelta: 0, palychDelta: 10, moraleDelta: 0
        }
      ]
    },
    {
      id: "double_agent_cipher",
      title: L("🕵️ ПЕРЕХОПЛЕНИЙ ЗВ'ЯЗКОВИЙ ФЕДЕРАЦІЇ", "🕵️ INTERCEPTED FEDERATION COURIER"),
      desc: L(
        "Чоловік у сірому плащі нахиляється до вікна й шепоче пароль:\n«Скажіть, по чому сьогодні бринза в Буковельську?.. Ось флешка з графіком руху ешелонів. Мовчки пропустите — у конверті 1 200 💵. Або тисніть тривожну кнопку СБК під столом!»",
        "A man in a grey trenchcoat whispers a cipher at the glass:\n'What is the price of cheese in Bukovelsk today?.. Here is a flash drive with train schedules. Wave me through for 1,200 💵 — or hit the hidden SBK alarm under your desk!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "report_to_sbk",
          label: L("🚨 Натиснути кнопку СБК і взяти шпигуна на гарячому (+1 800 🪙 премії, +25 СБК)", "🚨 Press SBK alarm & capture spy red-handed (+1,800 🪙 reward, +25 SBK)"),
          outcome: L("Група захоплення СБК миттєво пакує агента! Майор «Тихий» виписує тобі 1 800 🪙 премії та знімає всі питання НАБК.", "SBK strike team tackles the spy in seconds! Major Quiet awards you 1,800 🪙 and clears your file."),
          moneyDelta: 1800, timeDelta: 0, riskDelta: -12, sbkDelta: 25, tolikDelta: 0, palychDelta: 5, moraleDelta: 10
        },
        {
          id: "fake_double_game",
          label: L("💵 Взяти його 1 200 💵 і тихо пропустити (+1 200 💵, +18% НАБК, -10 СБК)", "💵 Take his 1,200 💵 and wave him through (+1,200 💵, +18% NABK, -10 SBK)"),
          outcome: L("Ти сховав зелені купюри в кишеню, а шпигун зник за шлагбаумом. СБК косо поглядає на камери...", "You pocketed the greenbacks as the spy slipped past. SBK eyes the CCTV..."),
          moneyDelta: 0, usdDelta: 1200, timeDelta: -5, riskDelta: 18, sbkDelta: -10, tolikDelta: 0, palychDelta: 5, moraleDelta: 0
        }
      ]
    },
    {
      id: "palych_drawer_raid",
      title: L("🧢 ПАЛ ПАЛИЧ ПЕРЕВІРЯЄ ШУХЛЯДУ!", "🧢 PAL PALYCH BARGED INTO THE BOOTH!"),
      desc: L(
        "Пал Палич зачиняє двері будки на шпінгалет і стукає кулаком по столу:\n«Так, інспекторе! Мені сорока на хвості принесла, що сьогодні повз мою касу жирні конверти пливуть. Занось 50 💵 або показуй порожню шухляду!»",
        "Pal Palych bolts the booth door and slams his fist on your desk:\n'Alright inspector! A little bird told me fat envelopes are bypassing my desk today. Slip me 50 💵 or show me an empty drawer!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "pay_palych_on_spot",
          label: L("💵 Відстібнути 50 💵 «на коньяк» (+15 Палич, -10% ризик НАБК)", "💵 Slip him 50 💵 'for cognac' (+15 Palych, -10% NABK risk)"),
          outcome: L("Палич ховає зелений папірець у кашкет: «Оце розмова дорослих людей! Працюй спокійно.»", "Palych tucks the bill into his cap: 'Now that is grown-up talk! Carry on.'"),
          moneyDelta: 0, usdDelta: -50, timeDelta: 0, riskDelta: -10, sbkDelta: 0, tolikDelta: 0, palychDelta: 15, moraleDelta: 0
        },
        {
          id: "show_empty_hands",
          label: L("📂 «Шукайте, Пал Паличу, я працюю на совість!» (+12 СБК, -10 Палич)", "📂 'Search all you want, Boss, I am clean!' (+12 SBK, -10 Palych)"),
          outcome: L("Палич сердито грюкає шухлядою: «Дивись мені, надто правильний знайшовся...»", "Palych slams the drawer shut: 'Watch yourself, mister squeaky-clean...'"),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 12, tolikDelta: 0, palychDelta: -10, moraleDelta: 0
        }
      ]
    },
    {
      id: "customs_cat_bavovna",
      title: L("🐈 ПРИКОРДОННИЙ КІТ І ПЕС «БАВОВНА» НА СЛІДУ", "🐈 BORDER CAT & DOG 'BAVOVNA' ON THE SCENT"),
      desc: L(
        "Рудий кіт пункту пропуску стрибнув на капот сусідньої фури з Бурштинівки й дряпає обшивку разом із нашим псом «Бавовною». Водій нервово пропонує тобі «заспокійливого»...",
        "The ginger checkpoint cat and sniffer dog 'Bavovna' are scratching at a truck from Burshtynivka. The nervous driver slides up to your window..."
      ),
      portrait: { gender: "M", skinTone: 2, faceShape: 0, hairStyle: 1, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "GRANDPA_STEPAN" },
      options: [
        {
          id: "trust_cat",
          label: L("🦴 Дати тваринам ковбаси й розкрити подвійне дно фури (+1 600 🪙 премії СБК!)", "🦴 Feed pets sausage & tear open the truck bed (+1,600 🪙 SBK reward!)"),
          outcome: L("У схованці під підлогою знайдено 50 блоків контрабандної електроніки! СБК виписує 1 600 🪙 премії!", "Hidden under the floor were 50 crates of smuggled electronics! SBK pays 1,600 🪙!"),
          moneyDelta: 1600, timeDelta: 0, riskDelta: -5, sbkDelta: 12, tolikDelta: 0, palychDelta: 0, moraleDelta: 8
        },
        {
          id: "pet_and_work",
          label: L("🤚 Погладити чотирилапу зміну й отримати +25с спокійного часу", "🤚 Pet the four-legged crew and gain +25s shift time"),
          outcome: L("Тварини задоволено вкладаються біля будки, даючи +25 секунд концентрації.", "The duo curls up by your booth, giving you +25 seconds of focus."),
          moneyDelta: 0, timeDelta: 25, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        }
      ]
    },
    {
      id: "showbiz_bus_tour",
      title: L("🎤 ТУР-АВТОБУС «ЗІРКИ ВАРШАВКИ» БЕЗ ДОЗВОЛІВ", "🎤 'VARSHAVKA STARS' TOUR BUS WITHOUT PERMITS"),
      desc: L(
        "Під'їжджає розмальований гастрольний автобус. Продюсер висувається у вікно з окулярами-зірочками:\n«Братику, у нас благодійний корпоратив у Кракові за 2 години! Половина балету забула довідки... Замкни очі — даємо 400 💵 і квитки на VIP-ложу!»",
        "A flashy tour bus rolls up. The producer leans out in star-shaped shades:\n'Bro, charity corporate gig in Krakiv in 2 hours! Half the crew forgot permits... Take 400 💵 and VIP tickets!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 3, hairColor: 3, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "showbiz_bribe",
          label: L("💵 Взяти 400 💵 й махнути «Їдьте з богом!» (+400 💵, +12% НАБК, -8 СБК)", "💵 Take 400 💵 and wave them through (+400 💵, +12% NABK, -8 SBK)"),
          outcome: L("Автобус мчить із гучною музикою, а ти ховаєш 400 💵!", "Tour bus blasts away while you pocket 400 💵!"),
          moneyDelta: 0, usdDelta: 400, timeDelta: 0, riskDelta: 12, sbkDelta: -8, tolikDelta: 0, palychDelta: 5, moraleDelta: 10
        },
        {
          id: "showbiz_strict",
          label: L("✖ Розвернути тур-автобус за законом (+1 200 🪙 премії СБК, +12 СБК)", "✖ Turn the tour bus back per protocol (+1,200 🪙 SBK bonus, +12 SBK)"),
          outcome: L("Продюсер лається в сторіз, але керівництво хвалить за принциповість!", "Producer rants on livestream, but HQ praises your discipline!"),
          moneyDelta: 1200, timeDelta: 0, riskDelta: -5, sbkDelta: 12, tolikDelta: 0, palychDelta: -5, moraleDelta: 0
        }
      ]
    },
    {
      id: "prosecutor_fishing_trip",
      title: L("🎣 ПРОКУРОР ОБЛАСТІ «НА РИБАЛКУ В КАРПАТІЮ»", "🎣 REGIONAL PROSECUTOR 'FISHING TRIP'"),
      desc: L(
        "На тонованому Крузері підкочує поважний чолов'яга у камуфляжі з вудками:\n«Синочку, я на коропа в Карпатію. Паспорт є, а от реєстр «Облік+» у мене... засекречений! Не затримуй держслужбовця.»",
        "A tinted Cruiser rolls up with a VIP in fishing camo:\n'Son, heading to Karpatia for carp. My Oblik+ status is... classified! Don't stall a prosecutor.'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 2, hairColor: 4, facialHair: 2, glasses: 1, headwear: 1, scarOrDetail: 0, expression: 2, specialId: "NONE" },
      options: [
        {
          id: "prosecutor_pass",
          label: L("🤝 Пропустити прокурора (+600 💵 «на снасті», +15 Палич, +14% НАБК)", "🤝 Wave prosecutor through (+600 💵 'for tackle', +15 Palych, +14% NABK)"),
          outcome: L("Прокурор кидає на панель 600 💵: «Якщо НАБК дзвонитиме — скажи, що я твій дядько.»", "He tosses 600 💵 on the desk: 'If NABK calls, say I am your uncle.'"),
          moneyDelta: 0, usdDelta: 600, timeDelta: 0, riskDelta: 14, sbkDelta: -10, tolikDelta: 0, palychDelta: 15, moraleDelta: 0
        },
        {
          id: "prosecutor_nabk",
          label: L("⚖️ Вимагати документи й злити в НАБК (+1 500 🪙, -12% НАБК, +15 СБК)", "⚖️ Demand docs & tip off NABK (+1,500 🪙, -12% NABK, +15 SBK)"),
          outcome: L("НАБК миттєво фіксує «рибалку»! Ти чистий перед законом і маєш премію!", "NABK logs the stunt! Clean record and bonus!"),
          moneyDelta: 1500, timeDelta: 0, riskDelta: -12, sbkDelta: 15, tolikDelta: 0, palychDelta: -10, moraleDelta: 5
        }
      ]
    },
    {
      id: "lost_diplomatic_case",
      title: L("💼 ЗАБУТА ДИПЛОМАТИЧНА ВАЛІЗА БІЛЯ ШЛАГБАУМА", "💼 UNATTENDED DIPLOMATIC CASE AT BARRIER"),
      desc: L(
        "Після проїзду кортежу на узбіччі залишився сріблястий кейс без наклейок. Всередині чути тикання... або просто пахне новими купюрами.",
        "After a convoy passed, a silver case sits unattended by the barrier. Looks expensive — or suspicious."
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "case_sbk",
          label: L("🛡️ Передати кейс саперам СБК (+1 400 🪙, +15 СБК, -8% НАБК)", "🛡️ Hand case to SBK EOD team (+1,400 🪙, +15 SBK, -8% NABK)"),
          outcome: L("Усередині були секретні документи посла! Тобі виписують премію за пильність!", "Inside were embassy docs! Bounty awarded for vigilance!"),
          moneyDelta: 1400, timeDelta: -5, riskDelta: -8, sbkDelta: 15, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        },
        {
          id: "case_peek",
          label: L("💰 Тихо відкрити кейс (+900 💵, -10с, +15% НАБК)", "💰 Peek inside quietly (+900 💵, -10s, +15% NABK)"),
          outcome: L("У кейсі лежало 900 💵 готівкою — ти встиг забрати до приїзду охорони!", "900 💵 cash inside — pocketed before security returned!"),
          moneyDelta: 0, usdDelta: 900, timeDelta: -10, riskDelta: 15, sbkDelta: -5, tolikDelta: 0, palychDelta: 0, moraleDelta: 0
        }
      ]
    },
    {
      id: "wounded_evac_ambulance",
      title: L("🚑 ТЕРМІНОВИЙ МЕДЕВАК ІЗ ПОРАНЕННИМИ", "🚑 URGENT MEDEVAC AMBULANCE"),
      desc: L(
        "Сирени швидкої розрізають тишу перед КПП. Фельдшер просить миттєво відкрити зелений коридор до клініки в Поландії — папери заповнені лише частково через обстріл.",
        "An ambulance with flashing lights races to the barrier. The medic begs for an immediate green corridor to Polandia — paperwork is half-done due to shelling."
      ),
      portrait: { gender: "F", skinTone: 1, faceShape: 0, hairStyle: 1, hairColor: 1, facialHair: 0, glasses: 0, headwear: 0, scarOrDetail: 0, expression: 2, outfitStyle: 1, specialId: "NONE" },
      options: [
        {
          id: "evac_green",
          label: L("🟢 Відкрити зелений коридор негайно (+1 500 🪙 +200 💵 премії, +20 СБК, +10с)", "🟢 Open green corridor immediately (+1,500 🪙 +200 💵 bonus, +20 SBK, +10s)"),
          outcome: L("Волонтерський штаб та ГУР-М дякують за врятовані хвилини!", "HQ and medics thank you for saving crucial minutes!"),
          moneyDelta: 1500, usdDelta: 200, timeDelta: 10, riskDelta: -5, sbkDelta: 20, tolikDelta: 0, palychDelta: 0, moraleDelta: 15
        },
        {
          id: "evac_paperwork",
          label: L("📋 Вимагати повного оформлення кожної печатки (-10с, +10 Палич)", "📋 Demand full stamp protocol (-10s, +10 Palych)"),
          outcome: L("Бюрократія перемогла: втрачено дорогоцінний час, зате Палич задоволений звітом.", "Bureaucracy wins: precious time lost, though Palych likes the paperwork."),
          moneyDelta: 0, timeDelta: -10, riskDelta: 0, sbkDelta: -8, tolikDelta: 0, palychDelta: 10, moraleDelta: -5
        }
      ]
    },
    {
      id: "interpol_red_notice",
      title: L("🇪🇺 ТЕРМІНОВИЙ ЗАПИТ ІНТЕРПОЛУ", "🇪🇺 URGENT INTERPOL LIAISON ALERT"),
      desc: L(
        "Офіцер зв'язку з Варшавки передає по закритій лінії: до твого шлагбаума наближається викрадений кортеж із банківською готівкою. СБК просить перехоплення, а Толік шепоче в рацію про «відкат».",
        "Varshavka liaison warns on the encrypted line: a stolen VIP cash van is approaching your post. SBK asks for an intercept while Tolik whispers about a cut."
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 0, hairColor: 2, facialHair: 2, glasses: 1, headwear: 4, scarOrDetail: 0, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "interpol_help",
          label: L("🚨 Спільне перехоплення з СБК та поляками (+1 800 🪙 +300 💵, +20 СБК, -10% НАБК)", "🚨 Joint intercept with SBK & Polish border patrol (+1,800 🪙 +300 💵, +20 SBK)"),
          outcome: L("Ідеальна координація! Міжнародна премія вже в кишені!", "Flawless coordination! International bounty awarded!"),
          moneyDelta: 1800, usdDelta: 300, timeDelta: 5, riskDelta: -10, sbkDelta: 20, tolikDelta: -8, palychDelta: 5, moraleDelta: 10
        },
        {
          id: "interpol_leak",
          label: L("🚐 Попередити Толіка, щоб кортеж звернув у ліс (+1 100 💵, +18 Толік, +14% НАБК)", "🚐 Tip off Tolik's crew to detour (+1,100 💵, +18 Tolik, +14% NABK)"),
          outcome: L("Кортеж зник у лісосмузі, а на сидінні з'явився грубий конверт.", "The convoy vanished onto dirt roads, leaving a thick envelope."),
          moneyDelta: 0, usdDelta: 1100, timeDelta: 0, riskDelta: 14, sbkDelta: -12, tolikDelta: 18, palychDelta: 0, moraleDelta: 0
        }
      ]
    },
    {
      id: "journalist_livestream",
      title: L("📸 РЕЙД ЖУРНАЛІСТІВ-РОЗСЛІДУВАЧІВ", "📸 INVESTIGATIVE PRESS AT THE GATE"),
      desc: L(
        "Знімальна група під'їжджає до віконця з камерами: «Знімаємо репортаж про чесність на кордоні Kraina! Покажете, як працює ваша будка?»",
        "A film crew approaches with cameras: 'Shooting a report on border integrity in Kraina! Care to show how your booth operates?'"
      ),
      portrait: { gender: "F", skinTone: 3, faceShape: 0, hairStyle: 2, hairColor: 3, facialHair: 0, glasses: 3, headwear: 0, scarOrDetail: 0, expression: 1, outfitStyle: 2, specialId: "NONE" },
      options: [
        {
          id: "press_open",
          label: L("🎥 Відкрито показати зразкову роботу (-15% НАБК, +1 200 🪙, +12 СБК)", "🎥 Showcase clean inspection (-15% NABK, +1,200 🪙, +12 SBK)"),
          outcome: L("Сюжет виходить у вечірніх новинах — НАБК знімає частину підозр!", "Prime-time report boosts your spotless reputation and eases NABK heat!"),
          moneyDelta: 1200, timeDelta: 0, riskDelta: -15, sbkDelta: 12, tolikDelta: 0, palychDelta: 5, moraleDelta: 12
        },
        {
          id: "press_palych",
          label: L("🧢 Викликати Палича «забороненою зоною» та вирізати кадри (+500 💵, +15 Палич)", "🧢 Have Palych block filming as 'restricted zone' (+500 💵, +15 Palych)"),
          outcome: L("Палич затулив об'єктив і сунув подяку за тишу: «Менше камер — спокійніша каса!»", "Palych blocked the lens and slipped you hush cash."),
          moneyDelta: 0, usdDelta: 500, timeDelta: 0, riskDelta: 10, sbkDelta: -5, tolikDelta: 5, palychDelta: 15, moraleDelta: 0
        }
      ]
    },
    {
      id: "blackout_generator_surge",
      title: L("⚡ АВАРІЙНИЙ БЛЕКАУТ НА МАГІСТРАЛІ", "⚡ HIGHWAY CHECKPOINT BLACKOUT"),
      desc: L(
        "Трансформатор біля КПП іскрить і гасне! Термінал «Облік+» завис, а на під'їзді стоїть фура Толіка з потужним дизель-генератором на причепі.",
        "The checkpoint transformer sparks out! Terminals flicker while Tolik's truck idles nearby with a heavy diesel generator."
      ),
      portrait: { gender: "M", skinTone: 2, faceShape: 1, hairStyle: 1, hairColor: 1, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 2, outfitStyle: 3, specialId: "NONE" },
      options: [
        {
          id: "power_battery",
          label: L("🔋 Перейти на резервний інвертор ДПСК (+1 000 🪙 премії, +15с, +10 СБК)", "🔋 Switch to SBGS backup inverter (+1,000 🪙 bonus, +15s, +10 SBK)"),
          outcome: L("Усі системи знову онлайн! Командування відзначає автономність поста.", "Systems back online! HQ commends your post readiness."),
          moneyDelta: 1000, timeDelta: 15, riskDelta: -4, sbkDelta: 10, tolikDelta: 0, palychDelta: 5, moraleDelta: 5
        },
        {
          id: "power_tolik",
          label: L("🔌 Кинути кабель від фури Толіка в обмін на швидкий проїзд (+750 💵, +15 Толік)", "🔌 Hook up Tolik's generator for a quick wave-through (+750 💵, +15 Tolik)"),
          outcome: L("Світло є, фура пішла без огляду, а на столі з'явилися купюри.", "Lights restored, truck waved past, cash left on desk."),
          moneyDelta: 0, usdDelta: 750, timeDelta: 5, riskDelta: 8, sbkDelta: -6, tolikDelta: 15, palychDelta: 0, moraleDelta: 0
        }
      ]
    },
    {
      id: "tolik_midnight_tender",
      title: L("🚐 НІЧНИЙ «ЗЕЛЕНИЙ ТЕНДЕР» СИНДИКАТУ", "🚐 SYNDICATE MIDNIGHT CORRIDOR BID"),
      desc: L(
        "Кур'єр Толіка «Бусика» підсовує під скло шифровану пропозицію: вимкнути УФ-сканер на останні 3 машини зміни за королівський бонус — або здати шифровку в СБК.",
        "Tolik's courier slides an encrypted note under the glass: shut off your UV scanner for the last 3 cars for a royal payout — or hand the note to SBK."
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 5, hairColor: 0, facialHair: 6, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, specialId: "TOLIK_SMUGGLER" },
      options: [
        {
          id: "tender_sbk",
          label: L("🛡️ Передати шифровку майору СБК (+2 000 🪙 +350 💵, +22 СБК, -12% НАБК)", "🛡️ Hand cipher to SBK Major (+2,000 🪙 +350 💵, +22 SBK, -12% NABK)"),
          outcome: L("Розвідка перехопила весь канал контрабанди! Премія СБК вже на рахунку!", "Intel intercepted the smuggling channel! SBK bounty credited!"),
          moneyDelta: 2000, usdDelta: 350, timeDelta: 0, riskDelta: -12, sbkDelta: 22, tolikDelta: -10, palychDelta: 0, moraleDelta: 10
        },
        {
          id: "tender_accept",
          label: L("💵 Прийняти умови синдикату (+1 600 💵, +22 Толік, +16% НАБК)", "💵 Accept syndicate bid (+1,600 💵, +22 Tolik, +16% NABK)"),
          outcome: L("Толік цінує надійних людей: 1 600 💵 гріють кишеню.", "Tolik values reliable insiders: 1,600 💵 warms your pocket."),
          moneyDelta: 0, usdDelta: 1600, timeDelta: 0, riskDelta: 16, sbkDelta: -14, tolikDelta: 22, palychDelta: 5, moraleDelta: 0
        }
      ]
    }
  ];

  // ★ MODULAR EPILOGUE SYSTEM: 16 Archetypes × 8 Wealth × 6 Family × 6 Factions × 6 Legacy = 27,648 Unique Combinations! ★
  const ARCHETYPE_CATALOG = {
    SHYTOMYR_MAYOR: {
      idx: 0,
      title: L("🧦 ПОЧЕСНИЙ МЕР МІСТА ШИТОМИР", "🧦 HONORARY MAYOR OF SHYTOMYR CITY"),
      subtitle: L("Ти пропустив усіх 12 вихідців із таємничого міста, якого немає на карті — і отримав золоті ключі!", "You welcomed all 12 legends from the mythical hidden city and earned the golden keys!"),
      hint: L("Зустрінь і пропусти всіх 12 унікальних мандрівників із м. Шитомир.", "Meet and approve all 12 unique travelers from Shytomyr City.")
    },
    SBK_SHADOW_COLONEL: {
      idx: 1,
      title: L("🕵️ ТАЄМНИЙ ПОЛКОВНИК СБК («КОРДОН-7»)", "🕵️ COVERT SBK COLONEL ('BORDER-7')"),
      subtitle: L("Ти викрив мережу резидентів зсередини й став невидимим господарем усього кордону.", "You dismantled the enemy spy ring from within and became the shadow commander of the border."),
      hint: L("Стань негласним агентом СБК «Кордон-7» та перелови щонайменше 4 шпигунів.", "Become Undercover SBK Agent 'Border-7' and detain 4 spies.")
    },
    NABK_PRISONER: {
      idx: 2,
      title: L("⛓️ ФІГУРАНТ ГУЧНОЇ СПРАВИ НАБК", "⛓️ HIGH-PROFILE NABK DETAINEE"),
      subtitle: L("Спецназ із камерами вибив двері будки просто під час перерахунку «чайових».", "Anti-corruption tactical officers raided your booth right as you counted the envelopes."),
      hint: L("Доведи ризик уваги НАБК до критичного рівня (95%+).", "Let NABK scrutiny climb into the red zone (95%+).")
    },
    ALIKANTOVO_OLIGARCH: {
      idx: 3,
      title: L("🏖️ КОРОЛЬ КОРДОНУ — ВІЛЛА В АЛІКАНТОВО", "🏖️ BORDER OLIGARCH — VILLA IN ALIKANTOVO"),
      subtitle: L("Від скромного шлагбаума до власного басейну в Іспанщині з золотим паспортом у кишені.", "From a cold checkpoint booth to your own seafront pool in Spainia."),
      hint: L("Накопич 42 000 💵 і купи віллу в Алікантово в магазині активів.", "Save 42,000 💵 and buy the Alikantovo Villa.")
    },
    ESCAPED_IN_VAN: {
      idx: 4,
      title: L("🚐 НІЧНИЙ ПАСАЖИР «ЗЕЛЕНОГО КОРИДОРУ»", "🚐 PASSENGER OF THE 'GREEN CORRIDOR' VAN"),
      subtitle: L("Ти сам довірив долю Толіку й перетнув кордон у вантажному відсіку під брезентом.", "You trusted Tolik with your fate and crossed into Polandia hidden under a tarp."),
      hint: L("Потоваришуй із Толіком і накопич кошти у «Фонді утечі».", "Befriend Tolik and fill the Escape Fund.")
    },
    CUSTOMS_BARON: {
      idx: 5,
      title: L("👑 БАРОН ЗАХІДНОЇ МИТНИЦІ", "👑 BARON OF WESTERN CUSTOMS"),
      subtitle: L("Ти викупив посаду начальника КПП — тепер Пал Палич стоїть на шлагбаумі під дощем.", "You bought out the Checkpoint Chief's chair — now Palych freezes at the barrier."),
      hint: L("Купи «Беху Х5», пентхаус у Кийграді та май запас кешу (25 000 🪙 або 1 500 💵).", "Own Beha X5, Kyihrad Penthouse, and cash reserves (25,000 🪙 or 1,500 💵).")
    },
    BUKOVEL_HETMAN: {
      idx: 6,
      title: L("🏔️ КАРПАТСЬКИЙ ГЕТЬМАН ІЗ БУКОВЕЛЬСЬКА", "🏔️ CARPATHIAN HETMAN OF BUKOVELSK"),
      subtitle: L("Поміняв форму інспектора на власні котеджі, карпатські чани та оренду для айтівців.", "Swapped your uniform for luxury mountain chalets and steady tourist cash."),
      hint: L("Придбай шале з чанами в Буковельську.", "Purchase the Mountain Chalet in Bukovelsk.")
    },
    OFFSHORE_CRYPTO_GHOST: {
      idx: 7,
      title: L("🏝️ ПРИВИД ОФШОРІЇ ТА ХОЛОДНИХ ГАМАНЦІВ", "🏝️ GHOST OF OFSHORIA & CRYPTO TRUSTS"),
      subtitle: L("Усі твої декларації в Україні абсолютно порожні, поки в Офшорії ростуть відсотки.", "Your official filings look spotless while millions compound silently offshore."),
      hint: L("Відкрий крипто-гаманець та траст в Офшорії.", "Buy the Cold Crypto Wallet & Ofshoria Trust.")
    },
    SHAWARMA_EMPEROR: {
      idx: 8,
      title: L("🥙 МАГНАТ ПРИКОРДОННОГО ФАСТФУДУ", "🥙 BORDER FAST-FOOD TYCOON"),
      subtitle: L("Твоя мережа кіосків біля 30-кілометрових черг годує пів країни й приносить стабільні статки.", "Your shawarma kiosks feeding endless border queues built an honest golden empire."),
      hint: L("Купи кіоск «Шаурма Шлагбаум-Люкс» і утримуй запас кешу.", "Buy the Shawarma Kiosk and hold steady cash reserves.")
    },
    DOUBLE_AGENT_MASTER: {
      idx: 9,
      title: L("🎭 ГРОСМЕЙСТЕР ПОДВІЙНОЇ ГРИ", "🎭 GRANDMASTER OF DOUBLE PLAY"),
      subtitle: L("Брав конверти з обох боків і примудрявся передавати шифровки в СБК!", "Collected envelopes from smugglers while covertly feeding leads to counter-intelligence!"),
      hint: L("Працюй на СБК як «Кордон-7» і водночас не гребуй конвертами.", "Serve as 'Border-7' while still pocketing bribes.")
    },
    IRON_CERBERUS: {
      idx: 10,
      title: L("🛡️ ЗАЛІЗНИЙ ЦЕРБЕР ЗАХІДНОГО РУБЕЖУ", "🛡️ IRON CERBERUS OF THE WEST"),
      subtitle: L("Через твою зміну не проскочила жодна миша, а на стіні в штабі висить твоя подяка.", "Not a single mouse slipped past your lane; HQ framed your commendation."),
      hint: L("Затримай 5+ небезпечних порушників із високою репутацією СБК.", "Detain 5+ criminals with high SBK reputation.")
    },
    TOLIK_NIGHT_PARTNER: {
      idx: 11,
      title: L("🚕 КОМЕРЦІЙНИЙ ПАРТНЕР СИНДИКАТУ", "🚕 LOGISTICS PARTNER OF THE SYNDICATE"),
      subtitle: L("Не звільнившись із кордону, ти став тіньовим диспетчером усіх бусів Толіка.", "Still at the gate on paper, you became the shadow dispatcher for Tolik's entire fleet."),
      hint: L("Підніми репутацію у Толіка до 70+ та накопич 1 500 💵 (або 25 000 🪙).", "Reach 70+ Tolik rep with 1,500 💵 (or 25,000 🪙).")
    },
    PALYCH_GODSON: {
      idx: 12,
      title: L("🧢 ПРАВА РУКА ТА КУМ ПАЛ ПАЛИЧА", "🧢 PAL PALYCH'S RIGHT-HAND GODSON"),
      subtitle: L("Поділив кожну копійку зі старшим зміни і ввійшов до «недоторканної» касти митниці.", "Split every envelope down the middle and joined the untouchable customs inner circle."),
      hint: L("Справно ділися з Пал Паличем (75+ репутації).", "Keep Pal Palych happy (75+ Boss rep).")
    },
    BORDER_ROBIN_HOOD: {
      idx: 13,
      title: L("💚 НАРОДНИЙ ЗАХИСНИК ЧЕРГИ", "💚 PEOPLE'S DEFENDER OF THE QUEUE"),
      subtitle: L("Не взявши жодного брудного хабаря, ти залишився людиною та опорою для власної родини.", "Refused every dirty bribe, stood by honest travelers, and kept your honor intact."),
      hint: L("Заверши службу без хабарів, із щасливою сім'єю (82%+) та низьким ризиком.", "Finish bribe-free with high family morale (82%+).")
    },
    HONEST_INSPECTOR: {
      idx: 14,
      title: L("🫡 ЗРАЗКОВИЙ ІНСПЕКТОР ДПСК", "🫡 EXEMPLARY BORDER INSPECTOR"),
      subtitle: L("Спокійна, чесна служба без скандалів, арештів і зайвого пафосу.", "Calm, principled duty free of scandals or handcuffs."),
      hint: L("Пройди службу без скандалів та із позитивним балансом.", "Complete shifts cleanly with positive cash.")
    },
    WRITTEN_OFF_RESERVE: {
      idx: 15,
      title: L("📋 СПИСАНИЙ У ПОЛЬОВИЙ РЕЗЕРВ", "📋 WRITTEN OFF TO FIELD RESERVE"),
      subtitle: L("Каса спорожніла, стосунки з начальством згоріли — шлагбаум зачинився без тебе.", "Empty wallet, burned bridges with management — the barrier closed without you."),
      hint: L("Залишся без грошей, підтримки СБК та сім'ї.", "Run out of funds and backing.")
    }
  };

  function loadUnlockedArchetypes() {
    try {
      const raw = localStorage.getItem(EPILOGUE_SAVE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function recordUnlockedArchetype(id) {
    try {
      const current = loadUnlockedArchetypes();
      if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(EPILOGUE_SAVE_KEY, JSON.stringify(current));
      }
    } catch (_) {}
  }

  function loadUnlockedShytomyr() {
    try {
      const raw = localStorage.getItem(SHYTOMYR_SAVE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function recordUnlockedShytomyr(tag) {
    try {
      const current = loadUnlockedShytomyr();
      if (!current.includes(tag)) {
        current.push(tag);
        localStorage.setItem(SHYTOMYR_SAVE_KEY, JSON.stringify(current));
      }
      return current;
    } catch (_) {
      return [];
    }
  }

  function loadAgencyBadges() {
    try {
      const raw = localStorage.getItem(AGENCY_BADGES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function unlockAgencyBadge(id) {
    try {
      const cur = loadAgencyBadges();
      if (!cur.includes(id)) {
        cur.push(id);
        localStorage.setItem(AGENCY_BADGES_KEY, JSON.stringify(cur));
      }
      return cur;
    } catch (_) {
      return [];
    }
  }

  function loadDiscoveries() {
    try {
      const raw = localStorage.getItem(GAME_DISCOVERIES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function unlockDiscovery(id) {
    try {
      const cur = loadDiscoveries();
      if (!cur.includes(id)) {
        cur.push(id);
        localStorage.setItem(GAME_DISCOVERIES_KEY, JSON.stringify(cur));
      }
      return cur;
    } catch (_) {
      return [];
    }
  }

  function loadCareerStats() {
    try {
      const raw = localStorage.getItem(STATS_SAVE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return Object.assign({ gamesFinished: 0, totalProcessed: 0, totalDetained: 0, bestCash: 0 }, obj);
    } catch (_) {
      return { gamesFinished: 0, totalProcessed: 0, totalDetained: 0, bestCash: 0 };
    }
  }

  function updateCareerStats(patch) {
    try {
      const cur = loadCareerStats();
      const next = {
        gamesFinished: cur.gamesFinished + (patch.gamesFinished || 0),
        totalProcessed: cur.totalProcessed + (patch.processed || 0),
        totalDetained: cur.totalDetained + (patch.detained || 0),
        bestCash: Math.max(cur.bestCash, patch.cash || 0)
      };
      localStorage.setItem(STATS_SAVE_KEY, JSON.stringify(next));
    } catch (_) {}
  }

  function resolveArchetypeId(st) {
    if (st.activeEndingId && ARCHETYPE_CATALOG[st.activeEndingId]) {
      return st.activeEndingId;
    }
    if (st.nabkRisk >= 95) return "NABK_PRISONER";
    if (st.shytomyrBrotherhoodUnlocked && st.nabkRisk < 85) return "SHYTOMYR_MAYOR";
    if (st.ownedAssets.includes("spain_villa")) return "ALIKANTOVO_OLIGARCH";
    if (st.escapeFund >= getEscapeTarget() && st.tolikRep >= getEscapeTolikRep()) return "ESCAPED_IN_VAN";
    if (st.isUndercoverSbkAgent && (st.totalCareerBribes || 0) > 0) return "DOUBLE_AGENT_MASTER";
    if (st.sbkColonelPromoted || (st.isUndercoverSbkAgent && st.spiesCaughtAsAgent >= 4 && st.nabkRisk < 75)) return "SBK_SHADOW_COLONEL";
    if (st.ownedAssets.includes("euro_bmw") && st.ownedAssets.includes("kyivhrad_flat") && (st.money >= 25000 || st.usd >= 1500)) return "CUSTOMS_BARON";
    if (st.ownedAssets.includes("carpathian_chalet")) return "BUKOVEL_HETMAN";
    if (st.ownedAssets.includes("cyprus_offshore")) return "OFFSHORE_CRYPTO_GHOST";
    if (st.ownedAssets.includes("shawarma_kiosk") && st.money >= 20000) return "SHAWARMA_EMPEROR";
    if (st.totalCareerDetained >= 5 && st.sbkRep >= 68) return "IRON_CERBERUS";
    if (st.tolikRep >= 70 && (st.usd >= 1500 || st.money >= 25000)) return "TOLIK_NIGHT_PARTNER";
    if (st.palychRep >= 75 && st.nabkRisk < 65) return "PALYCH_GODSON";
    if (st.familyMorale >= 82 && st.nabkRisk < 38 && (st.totalCareerBribes || 0) === 0) return "BORDER_ROBIN_HOOD";
    if (st.sbkRep >= 55 && st.nabkRisk < 55 && st.money >= 5000) return "HONEST_INSPECTOR";
    return "WRITTEN_OFF_RESERVE";
  }

  function buildModularEpilogue(st) {
    const archId = resolveArchetypeId(st);
    const arch = ARCHETYPE_CATALOG[archId] || ARCHETYPE_CATALOG.WRITTEN_OFF_RESERVE;
    recordUnlockedArchetype(archId);

    const has = (id) => st.ownedAssets.includes(id);

    // Module A: Wealth & Assets (8 variants)
    let assetIdx = 0;
    let assetText;
    if (has("spain_villa") && has("cyprus_offshore")) {
      assetIdx = 0;
      assetText = L(
        `Ти зібрав повний джекпот: активи сховані в Офшорії, у Кийграді капає оренда, а ранок починається на терасі вілли в Алікантово. На рахунках залишилось ${st.money} 🪙 живого кешу.`,
        `Full jackpot: offshore trusts in Ofshoria, rental cash flowing in, and mornings on your Alikantovo terrace with ${st.money} 🪙 cash remaining.`
      );
    } else if (has("spain_villa")) {
      assetIdx = 1;
      assetText = L(
        `Поки інші рахували копійки в термосах, ти викупив резиденцію в Алікантово (${st.ownedAssets.length} активів у власності).`,
        `While others hid cash in thermoses, you secured a seafront estate in Alikantovo (${st.ownedAssets.length} owned assets).`
      );
    } else if (has("carpathian_chalet") || has("kyivhrad_flat")) {
      assetIdx = 2;
      assetText = L(
        `Твоя нерухомість у Буковельську та столичному Кийграді стабільно приносить щоденну ренту навіть без твоєї появи на посту.`,
        `Your properties in Bukovelsk and Kyihrad generate effortless daily rent even away from the booth.`
      );
    } else if (has("euro_bmw") && has("rolex_watch")) {
      assetIdx = 3;
      assetText = L(
        `Під постом стоїть чорна «Беха Х5» на бляхах, на руці виблискує золотий «Кролекс» — кожен перевізник вітається з тобою першим.`,
        `Your black Beha X5 sits outside while the gold Krolex gleams on your wrist — smugglers salute before you ask.`
      );
    } else if (has("shawarma_kiosk")) {
      assetIdx = 4;
      assetText = L(
        `Кіоск «Шаурма Шлагбаум-Люкс» годує 30-кілометрову чергу до Варшавки й щодня відбиває інвестиції чистим кешем (${st.money} 🪙 у сейфі).`,
        `Your Barrier-Lux Shawarma kiosk feeds endless Varshavka queues and turns crisp profits (${st.money} 🪙 saved).`
      );
    } else if (has("espresso_machine") || has("uv_endoscope") || has("sbk_database_tablet")) {
      assetIdx = 5;
      assetText = L(
        `Уся зарплатня пішла не в люкс, а у професійне спорядження будки: кавомашину «Еспресо-Магнат», сканери й базу розвідки (${st.money} 🪙 готівки).`,
        `You invested in booth tech — espresso gear, scanners, and intel tablets (${st.money} 🪙 left on hand).`
      );
    } else if (st.money >= 35000 || st.usd >= 1500) {
      assetIdx = 6;
      assetText = L(
        `Ти не витрачався на показові понти й назбирав солідний запас готівки (${st.money} 🪙) у банці під підлогою.`,
        `You skipped flashy purchases and amassed a serious cash reserve (${st.money} 🪙) under the floorboards.`
      );
    } else {
      assetIdx = 7;
      assetText = L(
        `Після всіх витрат і штрафів у кишені залишилося всього ${st.money} 🪙 — доведеться жити на звичайну зарплату без особливих заощаджень.`,
        `After bills and fines, only ${st.money} 🪙 stayed in your pocket — modest living ahead.`
      );
    }

    // Module B: Family & Home Fate (6 variants)
    let famIdx = 0;
    let famText;
    if (st.familyMorale >= 90 && (has("spain_villa") || has("carpathian_chalet"))) {
      famIdx = 0;
      famText = L(
        "Сім'я у захваті: теща більше не бурчить завдяки санаторіям у Трускавецьку, а діти щодня надсилають фото з курорту.",
        "Your family is thrilled: peaceful Truskavetsk spas for grandma and resort sunsets for the kids."
      );
    } else if (st.familyMorale >= 80) {
      famIdx = 1;
      famText = L(
        "Удома панують тепло, підтримка і затишок. Генератор заправлений, холодильник повний — родина пишається твоєю витримкою.",
        "Warmth and support at home. The generator runs smoothly and your family respects your resilience."
      );
    } else if (st.familyMorale >= 60) {
      famIdx = 2;
      famText = L(
        "Родина звикла до твоїх нічних чергувань і тривог. Інколи сварилися через брак уваги, але тримаєтеся разом.",
        "Your family adapted to tense night shifts and sirens. Occasional arguments, but still together."
      );
    } else if (st.familyMorale >= 40) {
      famIdx = 3;
      famText = L(
        "Через постійні затримки на роботі та економію на побуті дружина почала натякати, що шлагбаум тобі дорожчий за дім.",
        "Long shifts and skipped home bills strained your marriage — home feels cold whenever you return."
      );
    } else if (archId === "NABK_PRISONER") {
      famIdx = 4;
      famText = L(
        "Дружина терміново наймає адвоката в Кийграді, продаючи техніку з дому, аби внести за тебе заставу в суді.",
        "Your spouse is frantically pawning appliances in Kyihrad to post your court bail."
      );
    } else {
      famIdx = 5;
      famText = L(
        "Після чергового конфлікту вдома тобі довелося ночувати просто на розкладачці в будці біля теплої кавоварки.",
        "After exhausting home arguments, you ended up crashing on a cot inside the checkpoint booth."
      );
    }

    // Module C: Boss Palych & Syndicate Fate (6 variants)
    let bossIdx = 0;
    let bossText;
    if (archId === "NABK_PRISONER") {
      bossIdx = 0;
      bossText = L(
        "Пал Палич особисто дав свідчення проти тебе слідчим НАБК, зробивши вигляд, що «вперше бачить твою шухляду».",
        "Pal Palych testified against you to NABK investigators, claiming he 'never saw your drawer'."
      );
    } else if (has("rolex_watch") && st.palychRep >= 70) {
      bossIdx = 1;
      bossText = L(
        "Пал Палич тепер заглядає тобі в рот, погладжує твій золотий «Кролекс» поглядом і сам приносить гарячий чай у зміну.",
        "Pal Palych stares in awe at your gold Krolex and personally brings hot tea to your booth."
      );
    } else if (st.tolikRep >= 70 && st.palychRep < 40) {
      bossIdx = 2;
      bossText = L(
        "Ти відкрито плюнув на забаганки Пал Палича й домовився напряму з Толіком «Бусиком» — нічні фури йдуть за твоїм дзвінком.",
        "You ditched Palych's cut and teamed up directly with Tolik's smuggling ring on night runs."
      );
    } else if (st.palychRep >= 70) {
      bossIdx = 3;
      bossText = L(
        "З Пал Паличем у вас залізобетонний тандем: жодна перевірка зі столиці не змогла пробити ваш прикритий протокол.",
        "You and Pal Palych forged an unbreakable pact — HQ audits bounce right off your shared paperwork."
      );
    } else if (st.tolikRep <= 20) {
      bossIdx = 4;
      bossText = L(
        "Місцеві перевізники й Толік «Бусик» об'їжджають твій КПП десятою дорогою, бо знають — тут номер не пройде.",
        "Local smugglers and Tolik detour miles around your booth knowing bribes never fly with you."
      );
    } else {
      bossIdx = 5;
      bossText = L(
        "Стосунки з Паличем і перевізниками залишилися на рівні обережного нейтралітету: без зайвої дружби, але й без ножа в спину.",
        "Professional neutrality with Palych and the drivers — no warm hugs, no knives in the back."
      );
    }

    // Module D: War, Intel & Shytomyr Legacy (6 variants)
    let legIdx = 0;
    let legText;
    const shytomyrTotal = loadUnlockedShytomyr().length;
    if (st.shytomyrBrotherhoodUnlocked || shytomyrTotal >= 12) {
      legIdx = 0;
      legText = L(
        "Усі 12 колоритних легенд із таємничого м. Шитомир — від директорів панчішних фабрик і заводів морозива «Шинка-Рудь» до інженерів космодрому — влаштували на твою честь парад на Тетерівці!",
        "All 12 colorful legends from mythical Shytomyr — from sock tycoons to spaceport engineers — threw a grand parade in your honor!"
      );
    } else if (st.sbkColonelPromoted || st.isUndercoverSbkAgent) {
      legIdx = 1;
      legText = L(
        `Як негласний агент СБК «Кордон-7», ти переловив ${st.spiesCaughtAsAgent} ворожих резидентів та агентури. Навіть старі архіви СБК грифовані під твоїм позивним.`,
        `As Undercover Agent 'Border-7', you captured ${st.spiesCaughtAsAgent} enemy operatives. Even your agency archives remain classified.`
      );
    } else if (st.shytomyrFriendsMet.length > 0) {
      legIdx = 2;
      legText = L(
        `Зустрічі на КПП із вихідцями загадкового м. Шитомир (${shytomyrTotal}/12 у колекції) стали найтеплішою частиною зміни — дехто досі сперечається, чи існує це місто на карті!`,
        `Meeting travelers from mysterious Shytomyr (${shytomyrTotal}/12 collected) brightened your shifts — people still debate if that city exists on maps!`
      );
    } else if (st.totalCareerDetained >= 5) {
      legIdx = 3;
      legText = L(
        `На твоєму особистому рахунку ${st.totalCareerDetained} гучних затримань злочинців, двійників авто й диверсантів. Контррозвідка досі приходить до тебе за порадами.`,
        `With ${st.totalCareerDetained} high-profile arrests and cloned cars seized, counter-intel officers still ask for your advice.`
      );
    } else if (st.sbkRep < 35) {
      legIdx = 4;
      legText = L(
        "У відділі контррозвідки до тебе поставилися з підозрою через нехтування орієнтуваннями, тож грифовані канали зв'язку для тебе закрили.",
        "Counter-intelligence flagged your indifference to alerts and cut your security clearance."
      );
    } else {
      legIdx = 5;
      legText = L(
        "Ти чесно провів десятки цивільних, волонтерських пікапів та родин крізь важкі прикордонні роки, ставши живим свідком історії Kraina.",
        "You faithfully processed families, volunteer pickups, and travelers through historic times at Kraina's western gate."
      );
    }

    const comboNumber = (arch.idx * 1728) + (assetIdx * 216) + (famIdx * 36) + (bossIdx * 6) + legIdx + 1;
    const totalCombos = 16 * 8 * 6 * 6 * 6; // 27,648

    return {
      archId,
      title: arch.title,
      subtitle: arch.subtitle,
      assetText,
      famText,
      bossText,
      legText,
      comboNumber,
      totalCombos,
      unlockedCount: loadUnlockedArchetypes().length
    };
  }

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

    playStampSlam(kind) {
      const isBad = kind === "error" || kind === "warn";
      this.playNoiseBurst(0.055, "lowpass", 360, 1.8, 0.28);
      this.playWarmNote(isBad ? 72 : 98, 0.09, 0.003, 210, 0.16, "sine");
      setTimeout(() => this.playNoiseBurst(0.03, "bandpass", 720, 2.2, 0.12), 28);
    }

    playPhoneRing() {
      const ringBurst = (offsetMs) => {
        setTimeout(() => {
          this.playWarmNote(680, 0.08, 0.004, 1500, 0.055, "triangle");
          setTimeout(() => this.playWarmNote(820, 0.08, 0.004, 1600, 0.055, "triangle"), 65);
        }, offsetMs);
      };
      ringBurst(0);
      ringBurst(240);
    }

    playHaggleWin() {
      this.playNoiseBurst(0.05, "highpass", 1500, 1.4, 0.12);
      this.playWarmNote(440.0, 0.14, 0.01, 1300, 0.055, "triangle");
      setTimeout(() => this.playWarmNote(659.25, 0.22, 0.015, 1600, 0.06, "sine"), 75);
    }

    playHaggleFail() {
      this.playWarmNote(280, 0.14, 0.008, 750, 0.06, "triangle");
      setTimeout(() => this.playWarmNote(190, 0.22, 0.01, 550, 0.06, "triangle"), 95);
    }

    playWipeSnow() {
      this.playNoiseBurst(0.11, "bandpass", 1800, 1.4, 0.18);
    }

    playThunder() {
      this.playNoiseBurst(0.55, "lowpass", 140, 0.9, 0.22);
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

  // ★ RICH COMBINATORIAL GENERATOR (GTA-STYLE PARODY CITIES, CARS & NON-CARS) ★
  let trvCounter = 100;
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const MALE_FIRST = [
    L("Богдан", "Bohdan"), L("Тарас", "Taras"), L("Олександр", "Oleksandr"), L("Микола", "Mykola"),
    L("Василь", "Vasyl"), L("Ігор", "Ihor"), L("Роман", "Roman"), L("Сергій", "Serhii"),
    L("Артем", "Artem"), L("Максим", "Maksym"), L("Денис", "Denys"), L("Руслан", "Ruslan"),
    L("Назар", "Nazar"), L("Віталій", "Vitalii"), L("Степан", "Stepan"), L("Юрій", "Yurii"),
    L("Остап", "Ostap"), L("Ярослав", "Yaroslav"), L("Дмитро", "Dmytro"), L("Андрій", "Andrii"),
    L("Вадим", "Vadym"), L("Павло", "Pavlo"), L("Гліб", "Hlib"), L("Тимофій", "Tymofii")
  ];
  const FEMALE_FIRST = [
    L("Оксана", "Oksana"), L("Наталія", "Nataliia"), L("Ірина", "Iryna"), L("Марія", "Mariia"),
    L("Катерина", "Kateryna"), L("Софія", "Sofiia"), L("Юлія", "Yuliia"), L("Аліна", "Alina"),
    L("Вікторія", "Viktoriia"), L("Дарина", "Daryna"), L("Олена", "Olena"), L("Соломія", "Solomiia"),
    L("Христина", "Khrystyna"), L("Людмила", "Liudmyla"), L("Тетяна", "Tetiana"),
    L("Злата", "Zlata"), L("Мирослава", "Myroslava"), L("Вероніка", "Veronika"), L("Анна", "Anna"),
    L("Діана", "Diana"), L("Лариса", "Larysa"), L("Світлана", "Svitlana"), L("Божена", "Bozhena")
  ];
  const LAST_NAMES = [
    L("Коваленко", "Kovalenko"), L("Бондаренко", "Bondarenko"), L("Ткаченко", "Tkachenko"),
    L("Кравчук", "Kravchuk"), L("Олійник", "Oliinyk"), L("Шевчук", "Shevchuk"),
    L("Поліщук", "Polishchuk"), L("Савченко", "Savchenko"), L("Мельник", "Melnyk"),
    L("Лисенко", "Lysenko"), L("Марченко", "Marchenko"), L("Павленко", "Pavlenko"),
    L("Гаврилюк", "Havryliuk"), L("Захарчук", "Zakharchuk"), L("Гончаренко", "Honcharenko"),
    L("Демчук", "Demchuk"), L("Романюк", "Romaniuk"), L("Сидоренко", "Sydorenko"),
    L("Мороз", "Moroz"), L("Коваль", "Koval"), L("Литвин", "Lytvyn"),
    L("Сорока", "Soroka"), L("Вовк", "Vovk"), L("Крамар", "Kramar"),
    L("Бабій", "Babii"), L("Гнатюк", "Hnatiuk"), L("Чумак", "Chumak"), L("Мазур", "Mazur")
  ];

  // 24 GTA-style Parody Cities & Places (m. Шитомир reserved exclusively for the 3 legends!)
  const CITIES = [
    { uk: "Кийград", en: "Kyihrad", code: "КГ" },
    { uk: "Левгород", en: "Levhorod", code: "ЛГ" },
    { uk: "Перлинівка-Мама", en: "Perlynivka-Mama", code: "ПМ" },
    { uk: "Слобожанськ", en: "Slobozhansk", code: "СБ" },
    { uk: "Січеслав", en: "Sicheslav", code: "СЧ" },
    { uk: "Файно-Тернопільськ", en: "Faino-Ternopilsk", code: "ФТ" },
    { uk: "Станіславівка", en: "Stanislavivka", code: "СТ" },
    { uk: "Буковельськ", en: "Bukovelsk", code: "БК" },
    { uk: "Трускавецьк", en: "Truskavetsk", code: "ТК" },
    { uk: "Бурштинівка-Поліська", en: "Burshtynivka", code: "БР" },
    { uk: "Закарпатськ-Уж", en: "Zakarpatsk", code: "ЗК" },
    { uk: "Подільськ-на-Бузі", en: "Podilsk-na-Buzi", code: "ПД" },
    { uk: "Полтавка-Галушківка", en: "Poltavka", code: "ПЛ" },
    { uk: "Хмельницьк-Базарний", en: "Khmelnytsk-Bazar", code: "ХМ" },
    { uk: "Мукачевськ", en: "Mukachevsk", code: "МК" },
    { uk: "Чорноморськ-Портовий", en: "Chornomorsk", code: "ЧМ" },
    { uk: "Козацьк-Запорозький", en: "Kozatsk", code: "КЗ" },
    { uk: "Луцьк-Волинський", en: "Lutsk-Volyn", code: "ЛЦ" },
    { uk: "Черешнівка", en: "Chereshnivka", code: "ЧР" },
    { uk: "Варшавка (Поландія)", en: "Varshavka (Polandia)", code: "ВР" },
    { uk: "Краків-Малопольський", en: "Krakiv-Pl", code: "КР" },
    { uk: "Монаківка", en: "Monakivka", code: "МН" },
    { uk: "Алікантово (Іспанщина)", en: "Alikantovo (Spainia)", code: "АЛ" },
    { uk: "Офшорія", en: "Ofshoria", code: "ОФ" }
  ];

  const VEHICLE_COLORS = [
    { id: "RED", hex: "#C62828", roofHex: "#8E1919", name: L("Вишневий", "Cherry Red") },
    { id: "BLUE", hex: "#1565C0", roofHex: "#0D47A1", name: L("Синій металік", "Metallic Blue") },
    { id: "YELLOW", hex: "#FBC02D", roofHex: "#F57F17", name: L("Жовтий", "Yellow") },
    { id: "BLACK", hex: "#23272A", roofHex: "#141618", name: L("Чорний матовий", "Matte Black") },
    { id: "WHITE", hex: "#ECEFF1", roofHex: "#CFD8DC", name: L("Білий", "White") },
    { id: "SILVER", hex: "#90A4AE", roofHex: "#607D8B", name: L("Сріблястий", "Silver") },
    { id: "OLIVE", hex: "#4B5320", roofHex: "#363D16", name: L("Оливковий піксель", "Olive Camo") },
    { id: "ORANGE", hex: "#E65100", roofHex: "#BF360C", name: L("Помаранчевий", "Orange") },
    { id: "EMERALD", hex: "#2E7D32", roofHex: "#1B5E20", name: L("Смарагдовий", "Emerald") }
  ];

  function getColorById(id) {
    return VEHICLE_COLORS.find(c => c.id === id) || VEHICLE_COLORS[5];
  }

  // 22 Vehicles + 3 Non-Car Modes = 25 Distinct Transport Models across 12 Visual Shapes!
  const TRANSPORT_CATALOG = [
    { shape: "SEDAN", name: L("«Занос 1.5» (Газ/Бензин)", "'Zanos 1.5' (LPG)"), isCar: true },
    { shape: "SEDAN", name: L("«Тайота Кемрі 3.5»", "'Tayota Kemri 3.5'"), isCar: true },
    { shape: "SEDAN", name: L("«Фолькс Пассат Б5»", "'Folks Passat B5'"), isCar: true },
    { shape: "SEDAN", name: L("«Шкоднік Октавія» (Універсал)", "'Shkodnik Octavia'"), isCar: true },
    { shape: "SEDAN", name: L("«Ауді А6 Бляха»", "'Audi A6 Euro-Plate'"), isCar: true },
    { shape: "RETRO", name: L("«Таврія-Нова Люкс»", "'Tavriya-Nova Lux'"), isCar: true },
    { shape: "RETRO", name: L("«Москвич-412» (Карбюраторний)", "'Moskvich-412'"), isCar: true },
    { shape: "RETRO", name: L("«Жигуль-Шістка» з багажником", "'Zhigul-06 Roof-Rack'"), isCar: true },
    { shape: "SUV", name: L("«Беха Х5» (Тонована)", "'Beha X5' (Tinted)"), isCar: true },
    { shape: "SUV", name: L("«Тайота Кукурузер 200»", "'Tayota Kukuruzer 200'"), isCar: true },
    { shape: "SUV", name: L("«Міцубісі Паджеро»", "'Mitsubisi Pajero'"), isCar: true },
    { shape: "G_WAGON", name: L("«Гелік-Кубик V8»", "'Gelik-Kubik V8'"), isCar: true },
    { shape: "SPORT", name: L("«Порш Кабан Турбо»", "'Porsh Kaban Turbo'"), isCar: true },
    { shape: "SPORT", name: L("«Тесла Модел Ш» (На автопілоті)", "'Tesla Model Sh'"), isCar: true },
    { shape: "MINIBUS", name: L("«Мерс Спрінтер Бусик»", "'Mers Sprinter Van'"), isCar: true },
    { shape: "MINIBUS", name: L("«Мерс Вітьок»", "'Mers Vityok'"), isCar: true },
    { shape: "MINIBUS", name: L("«Рено Кенгурятник» (Пиріжок)", "'Reno Kenguriatnyk'"), isCar: true },
    { shape: "MINIBUS", name: L("«Фургон Івеко Карго»", "'Iveko Cargo Van'"), isCar: true },
    { shape: "PICKUP", name: L("«Пікап Міцубісі Л200»", "'Pickup L200'"), isCar: true },
    { shape: "PICKUP", name: L("«Пікап Ніссан Навара»", "'Pickup Navara'"), isCar: true },
    { shape: "BUS", name: L("«Ікарус-Міжнародний»", "'Ikarus Express Coach'"), isCar: true },
    { shape: "TRUCK", name: L("Фура «ДАФ Магістраль 480»", "'DAF Highway 480' Semi-Truck"), isCar: true },
    { shape: "ARMORED", name: L("Броньовик «Інкасатор-Спец»", "'Armored Cash-Van'"), isCar: true },
    { shape: "MOTORCYCLE", name: L("Мотоцикл «Ява-350 Люкс»", "'Jawa-350 Lux' Motorcycle"), isCar: false },
    { shape: "BICYCLE", name: L("Велосипед «Україна-Спорт» з мішком картоплі", "'Ukraina' Bicycle (with potato sack)"), isCar: false },
    { shape: "E_SCOOTER", name: L("Електросамокат «Вжух-Про 3000» з павербанком", "'Vzhykh-Pro 3000' E-Scooter"), isCar: false },
    { shape: "ON_FOOT", name: L("Пішки з двома баулами «Мрія Перекупа»", "On Foot with Bazaar Plaid Bags"), isCar: false }
  ];

  function generatePlate(cityCode, isCar) {
    if (!isCar) return `ПШ-${randInt(100, 999)}`;
    const letters = ["АА", "ВХ", "КМ", "ОІ", "РТ", "МР", "СК"];
    return `${cityCode || "КГ"} ${randInt(1000, 9999)} ${pick(letters)}`;
  }

  function makeTransportMeta(specOverride, colorOverride, plateOverride) {
    const model = specOverride || pick(TRANSPORT_CATALOG);
    const col = colorOverride || pick(VEHICLE_COLORS);
    const plate = plateOverride || generatePlate(pick(CITIES).code, model.isCar);
    const labelUk = model.isCar ? `${model.name.uk} • ${col.name.uk} (${plate})` : `${model.name.uk} • ${col.name.uk}`;
    const labelEn = model.isCar ? `${model.name.en} • ${col.name.en} (${plate})` : `${model.name.en} • ${col.name.en}`;
    return {
      shape: model.shape,
      isCar: model.isCar,
      modelName: model.name,
      colorId: col.id,
      colorName: col.name,
      colorHex: col.hex,
      roofHex: col.roofHex,
      plate,
      desc: L(labelUk, labelEn)
    };
  }

  function randomFullName(gender) {
    const f = gender === "M" ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
    const l = pick(LAST_NAMES);
    return L(`${f.uk} ${l.uk}`, `${f.en} ${l.en}`);
  }

  function randomPortrait(gender) {
    return {
      gender,
      skinTone: randInt(0, 5),
      faceShape: gender === "F" ? randInt(0, 2) : randInt(1, 4),
      hairStyle: randInt(0, 7),
      hairColor: randInt(0, 6),
      facialHair: gender === "M" ? randInt(0, 6) : 0,
      glasses: Math.random() < 0.28 ? randInt(1, 4) : 0,
      headwear: gender === "F" ? (Math.random() < 0.22 ? pick([2, 5]) : 0) : (Math.random() < 0.26 ? pick([1, 3, 4, 5]) : 0),
      scarOrDetail: Math.random() < 0.14 ? randInt(1, 3) : 0,
      expression: randInt(0, 3),
      lipColor: gender === "F" ? randInt(0, 3) : 0,
      earrings: gender === "F" ? randInt(1, 3) : 0,
      outfitStyle: randInt(0, 5),
      freckles: Math.random() < 0.18,
      specialId: "NONE"
    };
  }

  // ★ 12 REWRITTEN SHYTOMYR LEGENDS WITH COLLECTIBLE BOOTH RELICS & UNIQUE GIFTS ★
  const SHYTOMYR_LEGENDS = [
    {
      tag: "SHYTOMYR_SOCKS",
      name: L("Кузьма «Титан» Панчішний", "Kuzma 'Titan' Panchishnyi"),
      age: 37, gender: "M",
      role: L("Магістр Трикотажної Ложі", "Grandmaster of Knitwear Lodge"),
      portrait: { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 0, hairColor: 1, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, outfitStyle: 1, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_KEVLAR_SOCKS", icon: "🧦",
        title: L("Кевларові термошкарпетки Ложі", "Kevlar Thermal Socks"),
        desc: L("Реліквія в будку: +8с до кожної зміни та +30 🪙 до чайових за каву", "Booth Relic: +8s shift time & +30 🪙 coffee tips")
      },
      stories: [{
        shape: "RETRO", colorId: "YELLOW", plate: "ШТ 0001 ШК",
        model: L("«Таврія-Нова Люкс» на титанах", "'Tavriya-Nova Lux'"),
        cargo: L("800 пар кевларових термошкарпеток «Броня-Нога» та термос карпатського чаю", "800 pairs of kevlar thermal socks & thermos"),
        permitReason: L("Секретне замовлення Трикотажної Ложі (ОВА)", "Secret Lodge Winter Supply"),
        greeting: L("«Салют, брате! Кузьма Панчішний, Магістр шкарпетковий! На картах нас не шукають, а мої кевларові носки навіть уламки спиняють! Став штамп — піджену ексклюзив у будку!»", "'Salute, bro! Kuzma the Sock Grandmaster! Maps deny we exist, yet my kevlar socks stop shrapnel! Clear me and take a booth relic!'"),
        reply: L("«Усі нитки й накладні зашиті бездоганно!»", "'Every thread and manifest is stitched tight!'"),
        intimidate: L("«Тихше! Розбудиш дух старого ткацького верстата!»", "'Easy! You'll wake the sacred loom!'"),
        coffee: L("«Краса! Лови 100 🪙 гримників на печиво!»", "'Nice! Catch 100 🪙 hrymnyky for biscuits!'")
      }]
    },
    {
      tag: "SHYTOMYR_COSMOS",
      name: L("Професорка Соломія Орбітальна", "Prof. Solomiia Orbitalna"),
      age: 30, gender: "F",
      role: L("Директорка Підземного Космодрому «Тетерів-9»", "Director of 'Teteriv-9' Underground Spaceport"),
      portrait: { gender: "F", skinTone: 0, faceShape: 0, hairStyle: 2, hairColor: 3, facialHair: 0, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, lipColor: 1, earrings: 2, outfitStyle: 1, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_TETERIV_METEOR", icon: "☄️",
        title: L("Левітуючий метеорит із Тетерівки", "Levitating Teterivka Meteorite"),
        desc: L("Реліквія в будку: -8% штрафів за помилки та космічне сяйво на столі", "Booth Relic: -8% protocol fines & cosmic desk glow")
      },
      stories: [{
        shape: "E_SCOOTER", colorId: "EMERALD", plate: "ШТ-ОРБІТА",
        model: L("Іонний самокат «Тетерів-Вояджер»", "'Teteriv-Voyager' Ion Scooter"),
        cargo: L("Фрагмент метеорита в магнітному футлярі та креслення ліфта на Місяць", "Levitating meteorite core & lunar elevator plans"),
        permitReason: L("Експедиція космічного центру", "Spaceport Research Mission"),
        greeting: L("«На зв'язку «Тетерів-9»! Поки світ сперечається, чи є Шитомир, наш космодром уже запустив супутник над Варшавкою! Пропустиш із вітерцем?»", "'Teteriv-9 calling! While outsiders doubt Shytomyr, we launched a satellite over Varshavka! Clear for takeoff?'"),
        reply: L("«Орбітальна точність — жодного відхилення в паперах!»", "'Orbital precision — zero paper drift!'"),
        intimidate: L("«Обережніше з магнітом, бо шлагбаум сам підніметься на орбіту!»", "'Careful with the magnet or the barrier will lift into orbit!'"),
        coffee: L("«Паливо на рівні! Тримай 75 🪙 гримників!»", "'Fuel levels nominal! Take 75 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_ICECREAM",
      name: L("Орест Пломбірович Крижень", "Orest Plombirovych Kryzhen"),
      age: 46, gender: "M",
      role: L("Кріо-інженер «Рудь-Антарктида»", "Cryo-Engineer 'Rud-Antarctica'"),
      portrait: { gender: "M", skinTone: 1, faceShape: 2, hairStyle: 1, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, outfitStyle: 0, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_CRYO_CONE", icon: "🍦",
        title: L("Нетанучий Кріо-Пломбір -40°C", "Unmelting Cryo-Ice Cream"),
        desc: L("Реліквія в будку: +2с часу при першому «Нагримати» на водія", "Booth Relic: +2s shift time on first 'Knock' per driver")
      },
      stories: [{
        shape: "MINIBUS", colorId: "WHITE", plate: "ШТ 1978 МР",
        model: L("Кріо-фургон «Мерс Пломбір-Турбо»", "'Mers Plombir-Turbo' Cryo Van"),
        cargo: L("Дослідний кріо-пломбір -40°C та рідкий азот зі смаком суниці", "Experimental -40C cryo-ice cream crates"),
        permitReason: L("Стратегічний кріо-експорт (ОВА)", "Strategic Cryo-Export Corridor"),
        greeting: L("«Брр, свіжість у будку! Орест Крижень, завод «Рудь»! Везу нетанучий пломбір, який заморожує навіть погляд ревізора. Документи кришталеві!»", "'Fresh chill! Orest from the cryo-plant! Carrying unmelting ice cream that freezes even auditor stares!'"),
        reply: L("«Температура -40°C, пломби й накладні ідеальні!»", "'-40°C locked, seals and manifests spotless!'"),
        intimidate: L("«Охолоньте, інспекторе — краще візьміть ріжок!»", "'Chill out officer — better take a cone!'"),
        coffee: L("«Контраст вогняний! +85 🪙 гримників у касу!»", "'Fire & ice! +85 🪙 hrymnyky for the booth!'")
      }]
    },
    {
      tag: "SHYTOMYR_RIVER",
      name: L("Капітанша Богдана «Сонар» Тетерівська", "Capt. Bohdana 'Sonar' Teterivska"),
      age: 32, gender: "F",
      role: L("Командирка підводного човна р. Тетерів", "Teteriv Submarine Flotilla Commander"),
      portrait: { gender: "F", skinTone: 1, faceShape: 1, hairStyle: 3, hairColor: 0, facialHair: 0, glasses: 2, headwear: 0, scarOrDetail: 0, expression: 1, lipColor: 0, earrings: 1, outfitStyle: 2, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusMoney: 250, bonusSbk: 6, icon: "🧭",
        title: L("Сонарний компас флотилії Тетерева", "Teteriv Submarine Compass"),
        desc: L("Підгін: миттєво +250 🪙 гримників та +6 до репутації СБК", "Gift: instant +250 🪙 & +6 SBK rep")
      },
      stories: [{
        shape: "SEDAN", colorId: "BLUE", plate: "ШТ 0404 РТ",
        model: L("«Фолькс Пассат Б5» (Перископ-Едішн)", "'Folks Passat B5' (Periscope Ed.)"),
        cargo: L("Титановий перископ, 2 сонари та секретна карта фарватеру Тетерева", "Titanium periscope, 2 sonars & river chart"),
        permitReason: L("Спецрейс річкової гідророзвідки", "River Hydro-Recon Mission"),
        greeting: L("«Пінг-пінг! Богдана «Сонар», командую підводним флотом Тетерева! Кажуть, річка мілка — а ми звідти до самого Балтійського виходимо. Глянеш папери?»", "'Ping-ping! Bohdana Sonar, commanding Teteriv's sub fleet! We navigate straight out to the Baltic!'"),
        reply: L("«Усі глибини й сертифікати проскановано сонаром!»", "'All depths and certificates sonar-verified!'"),
        intimidate: L("«На підводному човні не такими стуками лякали!»", "'Depth charges rattle louder than your knock!'"),
        coffee: L("«За бадьорий кофеїн — +80 🪙 гримників!»", "'Thanks for the caffeine — +80 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_QUARRY",
      name: L("Дід Гнат «Гранітний Голем»", "Grandpa Hnat 'Granite Golem'"),
      age: 56, gender: "M",
      role: L("Хранитель Соколовського розлому", "Guardian of Sokolovskyi Fault"),
      portrait: { gender: "M", skinTone: 2, faceShape: 3, hairStyle: 4, hairColor: 2, facialHair: 3, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 0, outfitStyle: 3, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusMoney: 250, bonusPalych: 8, icon: "🪨",
        title: L("Базальтовий штамп-оберіг", "Basalt Quarry Seal"),
        desc: L("Підгін: миттєво +250 🪙 гримників та +8 до поваги Пал Палича", "Gift: instant +250 🪙 & +8 Palych respect")
      },
      stories: [{
        shape: "G_WAGON", colorId: "BLACK", plate: "ШТ 8888 ГР",
        model: L("Броньований «Гелік-Граніт V8»", "'Gelik-Granite V8'"),
        cargo: L("Шмат чорного лабрадориту вагою в півтонни й базальтова печатка", "Half-ton black labradorite slab & basalt seal"),
        permitReason: L("Поставка броньованого каменю для рубежів", "Border Fortification Stone Supply"),
        greeting: L("«Здоров будь, внучку! Дід Гнат із Соколовського розлому! Наш камінь кулі відбиває, а документи вибиті в базальті. Передаш привіт Паличу!»", "'Good health, son! Grandpa Hnat from Sokolovskyi fault! Our stone stops bullets and my papers are carved clean!'"),
        reply: L("«Міцніше за базальт — жодної тріщини в документах!»", "'Solid as basalt — zero cracks in papers!'"),
        intimidate: L("«Та хоч кувалдою бий — граніт не здригнеться!»", "'Swing a sledgehammer — granite won't blink!'"),
        coffee: L("«Гаряча, як камінь у липні! +95 🪙 гримників!»", "'Hot like quarry stone in July! +95 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_DERUN",
      name: L("Баба Марфа «Алхімік Дерунів»", "Granny Marfa 'Derun Alchemist'"),
      age: 42, gender: "F",
      role: L("Магістр Чавунної Пательні 98-го октану", "Master of the 98-Octane Cast Skillet"),
      portrait: { gender: "F", skinTone: 0, faceShape: 0, hairStyle: 0, hairColor: 4, facialHair: 0, glasses: 0, headwear: 2, scarOrDetail: 0, expression: 1, lipColor: 2, earrings: 2, outfitStyle: 0, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_GOLD_DERUN", icon: "🥞",
        title: L("Золотий Дерун у сметанному вакуумі", "Golden Vacuum Derun"),
        desc: L("Реліквія в будку: +6% настрою сім'ї щовечора та +2с за пригощання кавою", "Booth Relic: +6% evening family morale & +2s on coffee")
      },
      stories: [{
        shape: "SEDAN", colorId: "RED", plate: "ШТ 2024 ДР",
        model: L("«Занос 1.5» (На картопляному біодизелі)", "'Zanos 1.5' (Potato Biodiesel)"),
        cargo: L("Кована чавунна сковорода, золотий дерун у вакуумі й 20 літрів сметани", "Cast skillet, golden vacuum derun & sour cream"),
        permitReason: L("Гастро-дипломатія та благодійний ярмарок", "Gastro-Diplomacy Fair"),
        greeting: L("«Доброго вечорочка, соколику! Марфа з Польової-Авеню! Мої деруни надихають так, що навіть НАБК про корупцію забуває. Пропускай до Варшавки!»", "'Evening dear! Marfa from Polova Ave! My deruny taste so heavenly even auditors forget their checklists!'"),
        reply: L("«Папери підрум'янені з обох боків, усе законно!»", "'Papers browned evenly on both sides!'"),
        intimidate: L("«Ой не шуми, бо тісто осяде!»", "'Hush dear, you'll deflate the batter!'"),
        coffee: L("«Солоденький ти мій! Лови 70 🪙 гримників і золоту скоринку!»", "'Sweetheart! Take 70 🪙 hrymnyky!'")
      }]
    },
    {
      tag: "SHYTOMYR_PHANTOM",
      name: L("Ілля «Помилка 404» Богунський", "Illia 'Error 404' Bohunskyi"),
      age: 29, gender: "M",
      role: L("Архітектор Матриці Шитомира", "Architect of Shytomyr Matrix"),
      portrait: { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 2, hairColor: 1, facialHair: 1, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, outfitStyle: 1, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_404_FLOPPY", icon: "💾",
        title: L("Голографічна дискета «404: Місто-Привид»", "Holographic '404' Floppy"),
        desc: L("Реліквія в будку: -3% ризику НАБК щоранку та +300 💵 до ліміту відмивання", "Booth Relic: -3% daily NABK risk & +300 💵 laundering cap")
      },
      stories: [{
        shape: "SPORT", colorId: "SILVER", plate: "ШТ 0404 ІР",
        model: L("«Тесла Модел Ш» (Стелс-прошивка)", "'Tesla Model Sh' (Stealth OS)"),
        cargo: L("Серверний кластер «Богунія», глушник радарів і дискета 404", "Server rack, radar cloak & '404' floppy"),
        permitReason: L("Кіберзахист прикордонної мережі", "Critical Cyber Network Exemption"),
        greeting: L("«Здоров, адміне шлагбаума! Це я стер Шитомир із супутникових карт, щоб ворог заблукав. Маю папери й дискету, яка ховає сліди від НАБК!»", "'Sup gatekeeper! I'm the guy who erased Shytomyr from satellite maps! Take this 404 disk to cloak your trail!'"),
        reply: L("«Хеш-сума, QR і бронь зійшлися до байта!»", "'Hash, QR and exemption match to the bit!'"),
        intimidate: L("«Фаєрвол витримав, паніки 0%!»", "'Firewall held steady, 0% packet loss!'"),
        coffee: L("«Кращий апгрейд за зміну! +90 🪙 гримників!»", "'Best shift patch! +90 🪙 hrymnyky!'")
      }]
    },
    {
      tag: "SHYTOMYR_ARTIST",
      name: L("Зоряна «Міраж» Чуднівська", "Zoriana 'Mirage' Chudnivska"),
      age: 26, gender: "F",
      role: L("Художниця оптичного камуфляжу на мосту", "Optical Camo Artist"),
      portrait: { gender: "F", skinTone: 3, faceShape: 0, hairStyle: 1, hairColor: 1, facialHair: 0, glasses: 0, headwear: 0, scarOrDetail: 0, expression: 1, lipColor: 0, earrings: 1, outfitStyle: 3, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusMoney: 220, bonusRisk: -6, icon: "🎨",
        title: L("3D-камуфляж від ревізорів", "3D Inspector Camouflage"),
        desc: L("Підгін: миттєво -6% ризику НАБК та +220 🪙 гримників", "Gift: instant -6% NABK risk & +220 🪙")
      },
      stories: [{
        shape: "BICYCLE", colorId: "YELLOW", plate: "ПШ-АРТ",
        model: L("Велосипед «Міраж-Чуднів» із мольбертом", "'Mirage' Bicycle & Easel"),
        cargo: L("Голографічні банери-приманки та набір флуоресцентних фарб", "Decoy camo banners & fluorescent paints"),
        permitReason: L("Міжнародна арт-резиденція маскування", "Camouflage Art Residency"),
        greeting: L("«Привіт! Малюю такі мурали на Чуднівському мосту, що навіть супутники думають, ніби там чисте поле. Підфарбую твою репутацію від перевірок!»", "'Hi! I paint murals so real even satellites see an empty field. Let me paint over your audit trail!'"),
        reply: L("«Жодних підмальовок — паспорт оригінальний на 100%!»", "'Zero touch-ups — 100% original passport!'"),
        intimidate: L("«Тсс, не розмажте акрил у повітрі!»", "'Careful, don't smudge the wet canvas!'"),
        coffee: L("«Натхнення в чашці! +65 🪙 гримників!»", "'Inspiration in a cup! +65 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_M06",
      name: L("Віталій «Гіперлуп М-06» Трасовий", "Vitalii 'Hyperloop M-06'"),
      age: 41, gender: "M",
      role: L("Пілот реактивного пікапа Кийград–Шитомир", "M-06 Jet-Pickup Pilot"),
      portrait: { gender: "M", skinTone: 1, faceShape: 2, hairStyle: 3, hairColor: 0, facialHair: 2, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 0, outfitStyle: 0, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusMoney: 200, bonusSec: 12, icon: "⚡",
        title: L("Ракетна присадка «Траса М-06»", "M-06 Rocket Fuel Additive"),
        desc: L("Підгін: миттєво +12 секунд до поточної зміни та +200 🪙 гримників", "Gift: instant +12s shift time & +200 🪙")
      },
      stories: [{
        shape: "PICKUP", colorId: "OLIVE", plate: "ШТ 0606 МТ",
        model: L("Турбо-пікап «L200 Гіперлуп»", "'L200 Hyperloop' Jet Pickup"),
        cargo: L("Турбо-нагнітач, присадка октан-120 та два тепловізори для хлопців", "Rocket booster additive & 2 thermals"),
        permitReason: L("Екстрений волонтерський гіпер-перегін (Шлях)", "Express Volunteer Convoy"),
        greeting: L("«Вжух! Із Кийграда до Шитомира за 22 хвилини — ось це називається логістика! Підкину тобі ракетної присадки в каву, щоб черга летіла!»", "'Whoosh! Kyihrad to Shytomyr in 22 minutes! Here's some rocket fuel to speed up your shift queue!'"),
        reply: L("«Гальма димлять, а довідка Шляху бездоганна!»", "'Brakes smoking, exit permit spotless!'"),
        intimidate: L("«Я на 240 км/год ями об'їжджаю, не злякаєш!»", "'I dodge potholes at 240 km/h, you can't rattle me!'"),
        coffee: L("«Ракета! +90 🪙 гримників на таймер!»", "'Rocket boost! +90 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_PARK",
      name: L("Пані Леся «Ключниця Шодуара»", "Lady Lesia 'Shoduar Keykeeper'"),
      age: 63, gender: "F",
      role: L("Хранителька підземель Шодуарівського парку", "Keeper of Shoduar Park Tunnels"),
      portrait: { gender: "F", skinTone: 2, faceShape: 1, hairStyle: 2, hairColor: 2, facialHair: 0, glasses: 1, headwear: 2, scarOrDetail: 0, expression: 1, lipColor: 1, earrings: 1, outfitStyle: 0, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusMoney: 250, bonusMorale: 10, icon: "🍯",
        title: L("Медовий еліксир Барона Шодуара", "Baron Shoduar's Honey Balm"),
        desc: L("Підгін: миттєво +10% щастя сім'ї та +250 🪙 гримників", "Gift: instant +10% family morale & +250 🪙")
      },
      stories: [{
        shape: "ON_FOOT", colorId: "BLUE", plate: "ПШ-ПАРК",
        model: L("Пішки зі старовинною зв'язкою ключів", "On Foot with Vintage Keyring"),
        cargo: L("Трав'яний еліксир Барона, медові пряники й ліхтар підземель", "Baron's honey elixir, gingerbread & lantern"),
        permitReason: L("Приватний візит", "Private Family Visit"),
        greeting: L("«Щастя в хату, дитинко! Я під Шодуарівським парком три тунелі знаю, де ще старий трамвай ховається. Несу онукам мед, а твоїй родині — добрий гостинець!»", "'Blessings dear! I guard three secret tunnels beneath Shoduar Park! Carrying honey to grandkids — and a treat for your family!'"),
        reply: L("«Паспорт свіжий, усе по поличках!»", "'Fresh passport, everything neat!'"),
        intimidate: L("«На ключницю Шодуара ще ніхто голос не підвищував!»", "'Nobody yells at Shoduar's keykeeper!'"),
        coffee: L("«Дякую, миленький! +60 🪙 гримників!»", "'Thank you dear! +60 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_HVIZHS",
      name: L("Назар «Ловець Поліського Хвіжса»", "Nazar 'Polissia Khvizhs Hunter'"),
      age: 24, gender: "M",
      role: L("Криптозоолог і нічний стрімер із Крошні", "Cryptozoologist & Night Streamer"),
      portrait: { gender: "M", skinTone: 0, faceShape: 0, hairStyle: 1, hairColor: 3, facialHair: 0, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, outfitStyle: 1, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: null, bonusUsd: 150, icon: "📹",
        title: L("Вірусний донат зі стріму з Хвіжсом", "Viral Khvizhs Stream Donation"),
        desc: L("Підгін: миттєво +150 💵 чистих баксіків без ризику НАБК!", "Gift: instant +150 💵 clean baksiky with 0% NABK risk!")
      },
      stories: [{
        shape: "SUV", colorId: "ORANGE", plate: "ШТ 4040 НТ",
        model: L("«Беха Х5» (Сафарі на Хвіжса)", "'Beha X5' (Khvizhs Safari)"),
        cargo: L("Клітка-приманка для Поліського Хвіжса, екшн-камера й 2 FPV-дрони", "Polissia Khvizhs trap, action cam & 2 FPV drones"),
        permitReason: L("Акредитована прес-волонтерська експедиція", "Accredited Press-Volunteer Safari"),
        greeting: L("«Йоу, чат! Ми нарешті впіймали на дах справжнього Поліського Хвіжса з Крошні! Стрім зірвав мільйон переглядів — пропустиш без шуму, закину 150 💵 донату в баксіках!»", "'Yo chat! We caught a real Polissia Khvizhs on our roof! Clear us quietly and take a 150 💵 viral donation!'"),
        reply: L("«Уся прес-акредитація в базі світиться зеленим!»", "'Press accreditation glowing green in registry!'"),
        intimidate: L("«Опа! Хвіжс на даху ледь камеру не з'їв!»", "'Whoa! You startled the Khvizhs on the roof!'"),
        coffee: L("«Чат оцінив! +110 🪙 гримників у банку!»", "'Chat loved that! +110 🪙!'")
      }]
    },
    {
      tag: "SHYTOMYR_STELA",
      name: L("Вікторія Бурштинова-Стела", "Viktoriia Amber-Stela"),
      age: 35, gender: "F",
      role: L("Хранителька Поліського Клондайку", "Keeper of Polissia Amber Klondike"),
      portrait: { gender: "F", skinTone: 0, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 0, lipColor: 2, earrings: 2, outfitStyle: 2, specialId: "SHYTOMYR_BRO" },
      gift: {
        relicId: "RELIC_AMBER_BEETLE", icon: "🔶",
        title: L("Бурштиновий кристал із древнім жуком", "Amber Crystal with Ancient Beetle"),
        desc: L("Реліквія в будку: +15% до премій СБК за арешти та +5 поваги Палича", "Booth Relic: +15% SBK arrest bounties & +5 Palych rep")
      },
      stories: [{
        shape: "SPORT", colorId: "BLACK", plate: "ШТ 7700 СТ",
        model: L("«Порш Кабан Бурштин-Едішн»", "'Porsh Kaban Amber Ed.'"),
        cargo: L("Зразки ювелірного поліського бурштину з древнім жуком і 3D-макет стели", "Polissia amber crystal & monument blueprint"),
        permitReason: L("Державний проєкт прикордонної стели", "State Monument Design Project"),
        greeting: L("«Вітаю, інспекторе! Вікторія з Корбутівки! Везу проект нової стели й поліський бурштин із мільйонрічним жуком — кажуть, він притягує премії за шпигунів!»", "'Hello inspector! Viktoriia from Korbutivka! Bringing our new monument plans and a million-year amber beetle lucky charm!'"),
        reply: L("«Кошторис, підписи й QR перевірені до крапки!»", "'Blueprints, signatures & QR spotless!'"),
        intimidate: L("«Кричите голосно, зате акустика біля стели буде супер!»", "'Loud shout — great acoustic test!'"),
        coffee: L("«Аромат дорогий! Тримай +95 🪙 гримників!»", "'Rich roast! Take +95 🪙!'")
      }]
    }
  ];

  function buildTravelerFromParts(cfg) {
    const trMeta = cfg.transport;
    const docs = [
      {
        type: "PASSPORT",
        title: cfg.passportTitle || L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
        subtitle: cfg.passportSub || L(`Серія KR-${randInt(100000, 999999)} • м. ${pick(CITIES).uk}`, `No. KR-${randInt(100000, 999999)} • ${pick(CITIES).en}`),
        fields: cfg.passportFields,
        sealText: cfg.passportSeal || L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
        sealDisc: cfg.passportSealDisc || null
      }
    ];
    if (cfg.extraDocs) {
      cfg.extraDocs.forEach(d => docs.push(d));
    }
    if (cfg.includeDecl && !docs.some(d => d.type === "VEHICLE_CUSTOMS")) {
      const shownModel = cfg.fakeModelName || trMeta.modelName;
      const shownColor = cfg.fakeColorName || trMeta.colorName;
      const shownPlate = cfg.fakePlate || trMeta.plate;
      docs.push({
        type: "VEHICLE_CUSTOMS",
        title: L("ДЕКЛАРАЦІЯ ТРАНСПОРТУ ТА БАГАЖУ", "TRANSPORT & LUGGAGE DECLARATION"),
        subtitle: trMeta.isCar ? shownModel : L("Особистий транспорт / Багаж", "Personal Transport / Luggage"),
        fields: [
          { label: L("Власник / Водій", "Owner / Driver"), value: cfg.driverNameOnDecl || cfg.fullName, disc: cfg.declNameDisc || null },
          {
            label: trMeta.isCar ? L("Авто / Колір / №", "Car / Color / Plate") : L("Транспорт / Колір", "Transport / Color"),
            value: trMeta.isCar
              ? L(`${shownModel.uk} • ${shownColor.uk} • ${shownPlate}`, `${shownModel.en} • ${shownColor.en} • ${shownPlate}`)
              : L(`${shownModel.uk} • ${shownColor.uk}`, `${shownModel.en} • ${shownColor.en}`),
            disc: cfg.vehMismatchDisc || null
          },
          { label: L("Заявлений вантаж", "Declared Cargo"), value: cfg.declaredCargo, disc: null }
        ],
        sealText: cfg.declSeal || L("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS"),
        sealDisc: cfg.declSealDisc || null
      });
    }

    return {
      id: `TRV-${++trvCounter}`,
      fullName: cfg.fullName,
      age: cfg.age,
      gender: cfg.gender,
      direction: cfg.direction || (JSON.stringify(cfg.passportFields || []).includes("В'ЇЗД") ? "ENTRY" : "EXIT"),
      portrait: cfg.portrait,
      passportPortrait: cfg.passportPortrait || cfg.portrait,
      transportShape: trMeta.shape,
      vehicleColorHex: trMeta.colorHex,
      vehicleRoofHex: trMeta.roofHex,
      vehicleDesc: trMeta.desc,
      vehicleSearchResult: cfg.vehicleSearchResult || L("Огляд псом «Бавовною»: заборонених предметів чи схованок не виявлено.", "Dog 'Bavovna' sniffed thoroughly: clean, no hidden stashes."),
      greeting: cfg.greeting,
      interrogationReply: cfg.interrogationReply || L("«Усі документи заповнені вірно!»", "'All documents are filled out correctly!'"),
      intimidateReply: cfg.intimidateReply || L("«Е-е... не стукайте так по склу! Я все показав!»", "'Uh... don't bang on the glass like that!'"),
      coffeeReply: cfg.coffeeReply || L("«Ой, щиро дякую за гарячу каву, аж на душі потеплішало!»", "'Oh, thank you so much for the hot coffee!'"),
      coffeeTip: cfg.coffeeTip || 0,
      arrestFull: cfg.arrestFull,
      arrestToned: cfg.arrestToned,
      hasContraband: !!cfg.hasContraband,
      hasPassenger: !!cfg.hasPassenger,
      bribeOffer: cfg.bribeOffer || null,
      shouldBeApproved: !!cfg.shouldBeApproved,
      violations: cfg.violations || [],
      isWantedTarget: !!cfg.isWantedTarget,
      storyTag: cfg.storyTag || null,
      documents: docs
    };
  }

  function createShytomyrFriend(friendSpec) {
    const st = pick(friendSpec.stories);
    const col = getColorById(st.colorId);
    const g = friendSpec.gender || "M";
    const trMeta = makeTransportMeta({ shape: st.shape, name: st.model, isCar: st.shape !== "E_SCOOTER" && st.shape !== "BICYCLE" && st.shape !== "ON_FOOT" }, col, st.plate);
    return buildTravelerFromParts({
      fullName: friendSpec.name,
      age: friendSpec.age,
      gender: g,
      portrait: friendSpec.portrait,
      transport: trMeta,
      passportSub: L(`Серія ШТ-${randInt(200100, 899900)} • м. Шитомир`, `No. SH-${randInt(200100, 899900)} • Shytomyr`),
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: friendSpec.name, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L(`${friendSpec.age} р. • ${g === "F" ? "ЖІН" : "ЧОЛ"}`, `${friendSpec.age} y/o • ${g}`), disc: null },
        { label: L("Місце народження", "Birthplace"), value: L("м. Шитомир", "Shytomyr City"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("19.08.2031", "2031-08-19"), disc: null }
      ],
      passportSeal: L("ДМС ШИТОМИР • ДІЙСНИЙ", "SMS SHYTOMYR • VALID"),
      extraDocs: (g === "M" && friendSpec.age <= 60) ? [
        {
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L("Державний дозвіл на виїзд", "Official Border Exit Permit"),
          fields: [
            { label: L("Особа", "Holder"), value: friendSpec.name, disc: null },
            { label: L("Підстава", "Basis"), value: st.permitReason, disc: null }
          ],
          sealText: L("ЦНАП м. Шитомир • ПЕРЕВІРЕНО", "CNAP Shytomyr • VERIFIED"),
          sealDisc: null
        },
        {
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: friendSpec.name, disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        }
      ] : [],
      includeDecl: true,
      declaredCargo: st.cargo,
      vehicleSearchResult: L(`Огляд псом «Бавовною»: чисто! (${st.cargo.uk})`, `Dog search clean! (${st.cargo.en})`),
      greeting: st.greeting,
      interrogationReply: st.reply,
      intimidateReply: st.intimidate,
      coffeeReply: st.coffee,
      coffeeTip: 100,
      arrestFull: L("Ти затримав старого знайомого з Шитомира! Він дивиться на тебе крізь ґрати з повним нерозумінням.", "You detained an old pal from Shytomyr!"),
      arrestToned: L("Мандрівника з м. Шитомир безпідставно затримано.", "The traveler from Shytomyr was detained."),
      bribeOffer: { amount: 500, currency: "UAH", instantOffer: true, isStingTrap: false, syndicateFavor: false, isFriendlyGift: true },
      shouldBeApproved: true,
      storyTag: friendSpec.tag
    });
  }

  // ★ 10 UNIQUE STORY CHARACTERS (No spoilers in fields!) ★
  function createAuntHalya() {
    const trMeta = makeTransportMeta({ shape: "SEDAN", name: L("«Занос 1.5» (Газ/Бензин)", "'Zanos 1.5'"), isCar: true }, getColorById("RED"), "ЛГ 4412 АХ");
    const manWigPortrait = { gender: "F", skinTone: 2, faceShape: 2, hairStyle: 1, hairColor: 3, facialHair: 0, glasses: 1, headwear: 2, scarOrDetail: 0, expression: 2, lipColor: 1, earrings: 1, outfitStyle: 0, specialId: "AUNT_HALYA" };
    const realPassportPortrait = { gender: "M", skinTone: 2, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 4, glasses: 0, headwear: 0, scarOrDetail: 0, expression: 0, outfitStyle: 1, specialId: "NONE" };
    return buildTravelerFromParts({
      fullName: L("Галина Дмитрівна Пасічник", "Halyna Pasichnyk"),
      age: 58, gender: "F",
      portrait: manWigPortrait,
      passportPortrait: realPassportPortrait,
      transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Пасічник Галина Дмитрівна", "Pasichnyk Halyna"), disc: null },
        { label: L("Стать / Вік", "Sex / Age"), value: L("58 р. • ЖІН", "58 y/o • F"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: DISCREPANCY.PHOTO_MISMATCH },
        { label: L("Дійсний до", "Valid Until"), value: L("11.11.2028", "2028-11-11"), disc: null }
      ],
      includeDecl: true,
      declaredCargo: L("Пиріжки, хустки, банка меду", "Pastries, scarves & jar of honey"),
      vehicleSearchResult: L("Під пасажирським сидінням знайдено чоловічу бритву та гель для гоління.", "Found a men's razor and shaving foam under the seat."),
      greeting: L("«Ой, синочку! Їду в Поландію до онуків... трохи голос охрип, бо протягло в автобусі!»", "'Oh sonny! Heading to Polandia to see my grandkids... caught a deep frog in my throat!'"),
      interrogationReply: L("«Та то я на паспорт фотографувалася ще до перукарні! Візьми 80 💵 на шоколадку та став зелений штамп!»", "'I just took the photo before my hairdo! Take 80 💵 for chocolate and stamp green!'"),
      intimidateReply: L("«*Хрипким басом* Ти шо кричиш?! Хустка ледь не злетіла...»", "'*Deep baritone cough* Why are you shouting?! My headscarf nearly slipped...'"),
      coffeeReply: L("«*Дмухає на каву, перука з'їжджає набік* Ой, гаряченька!»", "'*Blows on coffee, wig shifts slightly* Oh, nice and hot!'"),
      arrestFull: L("Коли хустку й біляву перуку зняли, з'ясувалося що «Тітка Галя» — це Петро Пасічник із Левгорода!", "Once the wig came off, 'Aunt Halya' turned out to be Petro from Levhorod!"),
      arrestToned: L("Порушника з чужим паспортом затримано.", "Impersonator detained."),
      bribeOffer: { amount: 80, currency: "USD", isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.PHOTO_MISMATCH],
      storyTag: "AUNT_HALYA"
    });
  }

  function createCoffinSneezer() {
    const fullName = L("Степан Гриб", "Stepan Hryb");
    const trMeta = makeTransportMeta({ shape: "HEARSE", name: L("«Катафалк Ритуал-Люкс»", "'Ritual-Lux Hearse'"), isCar: true }, getColorById("BLACK"), "ТК 0666 РТ");
    const portrait = { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 3, hairColor: 0, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 0, expression: 2, outfitStyle: 2, specialId: "NONE" };
    return buildTravelerFromParts({
      fullName, age: 49, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("49 р. • ЧОЛ", "49 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("04.04.2029", "2029-04-04"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("ДОЗВІЛ СПЕЦТРАНСПОРТУ", "SPECIAL VEHICLE PERMIT"),
        subtitle: L("Ритуальне бюро «Вічний Подих»", "'Eternal Breath' Funeral Co."),
        fields: [
          { label: L("Водій", "Driver"), value: fullName, disc: null },
          { label: L("Підстава", "Basis"), value: L("Перевезення дубового гробу на реставрацію", "Oak casket transport for repair"), disc: null }
        ],
        sealText: L("ЦНАП • РИТУАЛ-СЕРВІС", "CNAP • FUNERAL SERVICE"),
        sealDisc: null
      }],
      includeDecl: true,
      declaredCargo: L("Пуста дубова труна (без вкладення), 2 вінки", "Empty oak casket, 2 wreaths"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» РОЗКРИВ ТРУНУ: Усередині сидить живий кум у ластах із телефоном і банкою консервів!", "DOG SEARCH: Inside the coffin sits a live cousin in swim fins eating canned food!"),
      greeting: L("«Скорботний рейс, командире... Везу пусту антикварну труну... *ІЗ КУЗОВА ЛУНАЄ ГУЧНЕ: АПЧХИ!*»", "'Solemn run, officer... Just hauling an empty casket... *LOUD SNEEZE FROM THE BACK!*"),
      interrogationReply: L("«То... протяги в катафалку скриплять! Не кличте собаку, ось 750 💵 за живого пасажира!»", "'Just... creaky hinges! Don't bring the dog, take 750 💵 for the stowaway!'"),
      intimidateReply: L("«*Стук по склу — із труни панічно кричать: БУДЬ ЛАСКА, НЕ ВІДКРИВАЙТЕ, В МЕНЕ КЛАУСТРОФОБІЯ!*»", "'*From the coffin: PLEASE DON'T OPEN, I'M CLAUSTROPHOBIC!*"),
      coffeeReply: L("«О, дайте два стаканчики... другий для... е-е... охолодження радіатора!»", "'Give me two cups... second one is for the radiator!'"),
      arrestFull: L("Група СБК витягає із труни «небіжчика в ластах» та затримує водія катафалка!", "SBK pulls the 'deceased in swim fins' out of the coffin and cuffs the driver!"),
      arrestToned: L("Спроба незаконного переправлення особи у тайнику викрита.", "Stowaway smuggling attempt prevented."),
      hasContraband: true,
      bribeOffer: { amount: 750, currency: "USD", isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO],
      storyTag: "COFFIN"
    });
  }

  function createTolikCourier() {
    const trMeta = makeTransportMeta({ shape: "MINIBUS", name: L("«Мерс Спрінтер Бусик»", "'Mers Sprinter Van'"), isCar: true }, getColorById("WHITE"), "МК 7007 ТЛ");
    const portrait = { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 2, glasses: 2, headwear: 1, scarOrDetail: 3, expression: 1, outfitStyle: 1, specialId: "TOLIK_SMUGGLER" };
    return buildTravelerFromParts({
      fullName: L("Анатолій «Бусик» Сидоренко", "Anatolii 'Busyk' Sydorenko"),
      age: 37, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Сидоренко Анатолій Ігорович", "Sydorenko Anatolii"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("37 р. • ЧОЛ", "37 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("25.07.2030", "2030-07-25"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ВОДІЯ-ВОЛОНТЕРА", "VOLUNTEER DRIVER PERMIT"),
        subtitle: L("Реєстр «Шлях-Транс»", "'Shlyakh-Trans' Registry"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Сидоренко Анатолій Ігорович", "Sydorenko Anatolii"), disc: null },
          { label: L("Підстава", "Basis"), value: L("Міжнародні перевезення вантажів", "International Cargo Driver"), disc: null }
        ],
        sealText: L("УКТРАНС • ПЕРЕВІРЕНО", "UKTRANS • VERIFIED"),
        sealDisc: null
      }],
      includeDecl: true,
      declaredCargo: L("Коробки з теплими шкарпетками та крупою (120 кг)", "Boxes of warm socks & buckwheat (120 kg)"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» ЗНАЙШОВ СХОВАНКУ: За фальшивою стінкою буса — 40 блоків контрабандних цигарок і 2 пасажири без квитків!", "DOG SEARCH: False bulkhead hides 40 cigarette cartons and 2 unticketed stowaways!"),
      greeting: L("«Здорово, командире! Свій рейс! Толік везе «гуманітарку» до Варшавки. Можемо по-діловому порішати — і будемо друзями на майбутнє!»", "'Hey boss! Tolik running a friendly load to Varshavka. Let's make a business deal for future favors!'"),
      interrogationReply: L("«Слухай, у мене за спиною двоє хлопців до Варшавки їдуть... Бери 850 💵 у кишеню — і колись сам вивеземо вночі, як припече!»", "'Listen, carrying 2 guys in back... Take 850 💵 and earn syndicate favors if you ever need a night exit!'"),
      intimidateReply: L("«Ой, не гарячкуй! Твої колеги на сусідній зміні спокійніше з Толіком працюють!»", "'Whoa easy there! Other shifts work smoothly with Tolik!'"),
      coffeeReply: L("«Дякую за каву, брате! Як буде треба тихо виїхати в Поландію — ти знаєш, де шукати Толіка!»", "'Thanks for the coffee brother! Whenever you need a quiet ride out, ask for Tolik!'"),
      arrestFull: L("Толіка «Бусика» беруть на гарячому — контрабандна мережа зазнала важких втрат!", "Tolik 'Busyk' is busted red-handed — smuggling syndicate takes a heavy hit!"),
      arrestToned: L("Перевізника з незадекларованим вантажем затримано.", "Carrier with undeclared contraband detained."),
      hasContraband: true,
      bribeOffer: { amount: 850, currency: "USD", isStingTrap: false, syndicateFavor: true },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO],
      storyTag: "TOLIK_RUN"
    });
  }

  function createDeputySon() {
    const trMeta = makeTransportMeta({ shape: "SPORT", name: L("«Порш Кабан Турбо»", "'Porsh Kaban Turbo'"), isCar: true }, getColorById("YELLOW"), "КГ 0001 ВР");
    const portrait = { gender: "M", skinTone: 0, faceShape: 0, hairStyle: 3, hairColor: 3, facialHair: 0, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 2, outfitStyle: 2, specialId: "DEPUTY_SON_MAJORS" };
    return buildTravelerFromParts({
      fullName: L("Едуард Задніпровський", "Eduard Zadniprovskyi"),
      age: 26, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Задніпровський Едуард Олегович", "Zadniprovskyi Eduard"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("26 р. • ЧОЛ", "26 y/o • M"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Монаківка", "EXIT → Monakivka"), disc: null },
        { label: L("Довідка / Відстрочка", "Exit Permit"), value: L("Без підстави (Загальний виїзд)", "None presented"), disc: DISCREPANCY.AGE_RESTRICTION_NO_PERMIT }
      ],
      includeDecl: true,
      declaredCargo: L("Валізи Louis Vuitton, золотий ланцюг", "Designer suitcases"),
      greeting: L("«Чуєш, ти знаєш, хто мій батя?! Я лечу на бізнес-конференцію в Монаківку! Які довідки?! Став штамп бігом!»", "'Do you know who my dad is?! Heading to Monakivka! What permit?! Stamp it NOW!'"),
      interrogationReply: L("«Ой не напрягай. Ось 1 100 💵 прямо на торпеді — або ж просто нажми ✖ ВІДМОВИТИ і втрачай шанс!»", "'Stop stressing me. Take 1,100 💵 cash — or turn me down and stay broke!'"),
      intimidateReply: L("«ТИ НА КОГО ГАВКАЄШ?! Та мій батя цей шлагбаум завтра знесе! *руки тремтять на кермі*»", "'WHO DO YOU THINK YOU ARE YELLING AT?! My dad will demolish this booth!'"),
      coffeeReply: L("«Фу, та це ж розчинна з термоса? Ну... хоч гаряча, спасибі.»", "'Ugh, thermos coffee? Well... at least it is hot.'"),
      arrestFull: L("Мажор кричить у телефон «Батя, мене пакують за відмову виїзду!», але ти перестарався — достатньо було відмови!", "You detained a VIP over a missing permit when a simple DENY sufficed!"),
      arrestToned: L("Перевищення сили — достатньо було натиснути ✖ ВІДМОВИТИ.", "Excessive force — should have pressed DENY."),
      bribeOffer: { amount: 1100, currency: "USD", instantOffer: true, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      storyTag: "DEPUTY_SON"
    });
  }

  function createGrandpaStepan(dayNum, stepanMet) {
    const met = stepanMet || 0;
    const isBike = Math.random() < 0.45;
    const trMeta = isBike
      ? makeTransportMeta({ shape: "BICYCLE", name: L("Велосипед «Україна-Спорт» з мішком", "'Ukraina' Bicycle"), isCar: false }, getColorById("BLUE"), "ПШ-067")
      : makeTransportMeta({ shape: "RETRO", name: L("«Москвич-412» (Дідусів звір)", "'Moskvich-412'"), isCar: true }, getColorById("BLUE"), "ПД 1965 ДД");
    const portrait = { gender: "M", skinTone: 2, faceShape: 1, hairStyle: 4, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, outfitStyle: 0, specialId: "GRANDPA_STEPAN" };
    return buildTravelerFromParts({
      fullName: L("Степан Петрович Бойко", "Stepan Boiko"),
      age: 68, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Бойко Степан Петрович", "Boiko Stepan"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("68 р. • ЧОЛ", "68 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("15.09.2033", "2033-09-15"), disc: null }
      ],
      includeDecl: dayNum >= 3,
      declaredCargo: L("2 мішки картоплі, домашнє сало та ліки онукам", "2 potato sacks, homemade lard & medicine"),
      vehicleSearchResult: L("Пес «Бавовна» облизує діда Степана — в багажнику картопля й банка малинового варення!", "Bavovna wags his tail — only potatoes and raspberry jam!"),
      greeting: met >= 1
        ? L("«О, та це ж мій знайомий інспектор! Здоров будь, онучку! Дякую за минулий теплий прийом — везу знову свіжого варення онукам!»", "'Oh, it's my favorite inspector! Good health, grandson! Thank you for last time — bringing fresh jam to the grandkids again!'")
        : L("«Здоровенькі були, онучку! Бойко Степан, 68 років! Подивися на мої сиві вуса — їду провідати дочку й онуків!»", "'Good day, grandson! Stepan Boiko, 68 years old! Just visiting my grandkids!'"),
      interrogationReply: met >= 1
        ? L("«Та ми ж уже як рідні! І вік пенсійний, і документи ті ж самі, кришталево чисті!»", "'We practically know each other by now! Clean senior papers!'")
        : L("«Та чого там перевіряти, в мене й вік пенсійний, і документи як у космонавта!»", "'Nothing to worry about, senior age and clean papers!'"),
      intimidateReply: L("«Синочку, не кричи на діда, в мене ж тиск...»", "'Son, don't yell at an old man, my blood pressure...'"),
      coffeeReply: met >= 1
        ? L("«От золота людина! Твоя кава як бальзам на душу! Лови 80 🪙 на пиріжки!»", "'Golden heart! Your coffee warms the soul! Take 80 🪙 for pastries!'")
        : L("«Ой спасибі за кавусю! Тримай 50 🪙 на пиріжок і банку малинового варення для родини!»", "'Bless you for the coffee! Take 50 🪙 for pastries!'"),
      coffeeTip: met >= 1 ? 80 : 50,
      arrestFull: L("Черга в шоці — ти навіщось затримав доброго дідуся на пенсії!", "The entire queue boos as you detain an innocent 68-year-old grandfather!"),
      arrestToned: L("Пенсіонера помилково затримано.", "Innocent retiree mistakenly detained."),
      shouldBeApproved: true,
      storyTag: `STEPAN_${dayNum}`
    });
  }

  function createNabkSting() {
    const trMeta = makeTransportMeta({ shape: "SEDAN", name: L("«Шкоднік Октавія»", "'Shkodnik Octavia'"), isCar: true }, getColorById("SILVER"), "КГ 8120 АА");
    const portrait = { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 0, hairColor: 1, facialHair: 0, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 2, outfitStyle: 2, specialId: "NABK_AGENT" };
    return buildTravelerFromParts({
      fullName: L("Олег Вікторович Соколов", "Oleh Sokolov"),
      age: 34, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Соколов Олег Вікторович", "Sokolov Oleh"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЧОЛ", "34 y/o • M"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: null },
        { label: L("Відстрочка 18–60", "Exit Permit"), value: L("Без підстави", "Not provided"), disc: DISCREPANCY.AGE_RESTRICTION_NO_PERMIT }
      ],
      includeDecl: true,
      declaredCargo: L("Шкіряний портфель, папки з договорами", "Leather briefcase, contract folders"),
      vehicleSearchResult: L("В бардачку лежать пусті протоколи вилучення готівки з шапкою НАБК!", "Glovebox holds blank NABK cash-seizure protocols!"),
      greeting: L("«Добрий день... Слухайте, довідку забув дома, а на ділову зустріч запізнююся. Може, порішаємо за 300 💵 — швидко й без черги?»", "'Hello... Forgot my permit at home and late for a meeting. Can we settle for 300 💵 quickly?'"),
      interrogationReply: L("«Та які питання, інспекторе?! Я звичайний менеджер, беріть конверт — мені реально горить!»", "'What questions?! I am a regular manager, just take the envelope — I am in a rush!'"),
      intimidateReply: L("«*Спокійно поправляє краватку* Е-е... давайте без різких рухів, не затримуйте бізнес!»", "'*Adjusts tie calmly* H-hey, no sudden moves, don't hold up business!'"),
      coffeeReply: L("«Дякую за каву... то як щодо зеленого штампа?»", "'Thanks for the coffee... so how about a green stamp?'"),
      arrestFull: L("Ти затримав його, хоча він іще не вчинив злочину в межах документів — достатньо ✖ ВІДМОВИТИ!", "Should just press DENY without touching his marked bills!"),
      arrestToned: L("Агента не вдалося зловити на злочині — треба було ✖ ВІДМОВИТИ.", "Should press DENY cleanly."),
      bribeOffer: { amount: 300, currency: "USD", instantOffer: true, isStingTrap: true, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      storyTag: "NABK_STING"
    });
  }

  function createMonacoBattalionMP() {
    const trMeta = makeTransportMeta({ shape: "G_WAGON", name: L("«Гелік-Кубик V8»", "'Gelik-Kubik V8'"), isCar: true }, getColorById("BLACK"), "КГ 7777 ВР");
    const portrait = { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 3, hairColor: 2, facialHair: 2, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 2, outfitStyle: 2, specialId: "DEPUTY_SON_MAJORS" };
    return buildTravelerFromParts({
      fullName: L("Ростислав Микитович Баксов", "Rostyslav Baksov"),
      age: 52, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Баксов Ростислав Микитович", "Baksov Rostyslav"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("52 р. • ЧОЛ", "52 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("01.10.2030", "2030-10-01"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("ДИПЛОМАТИЧНА ПЕРЕПУСТКА", "DIPLOMATIC PASS"),
        subtitle: L("Почесне Консульство", "Honorary Consulate"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Баксов Ростислав Микитович", "Baksov Rostyslav"), disc: null },
          { label: L("Видавець", "Issued By"), value: L("«Батальйон Монаківка • Князівство Офшорія»", "'Monakivka Battalion • Duchy of Ofshoria'"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
        ],
        sealText: L("КНЯЗІВСТВО МОНАКІВКА", "DUCHY OF MONAKIVKA"),
        sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
      }],
      includeDecl: true,
      declaredCargo: L("Годинники «Кролекс», готівка в дипломаті", "Krolex watches & briefcase"),
      vehicleSearchResult: L("В багажнику знайдено принтер для друку пластикових посвідчень!", "Found a fake ID card printer in the trunk!"),
      greeting: L("«Термінова дипломатична місія у справах офшорів! Ось посвідчення Почесного Консула Монаківки!»", "'Urgent diplomatic mission! Behold my Honorary Consul pass of Monakivka!'"),
      interrogationReply: L("«Ти шо, не поважаєш Князівство Монаківка?! Дам 450 💵 — закрий очі на печатку!»", "'Disrespecting Monakivka?! Here is 450 💵 — ignore the seal!'"),
      intimidateReply: L("«Ти... ти не смієш! В мене бронь... ну майже бронь...»", "'You... you wouldn't dare!'"),
      coffeeReply: L("«Хм, а непогана кава. У Монаківці така по 20 євро.»", "'Decent espresso. Costs 20 euros in Monakivka.'"),
      arrestFull: L("Контррозвідка СБК затримує псевдо-дипломата з липовим мандатом на «Геліку»!", "SBK arrests the fake diplomat with a bogus Duchy seal!"),
      arrestToned: L("Затримано особу з підробленим дипломатичним документом.", "Detained for forged diplomatic papers."),
      bribeOffer: { amount: 450, currency: "USD", instantOffer: true, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.FAKE_ISSUER_SEAL],
      isWantedTarget: true,
      storyTag: "MONACO_MP"
    });
  }

  function createFakeVolunteerBlogger() {
    const trMeta = makeTransportMeta({ shape: "SUV", name: L("«Беха Х5» (Тонована)", "'Beha X5'"), isCar: true }, getColorById("RED"), "ЛГ 2024 БГ");
    const portrait = randomPortrait("M");
    portrait.glasses = 2; portrait.hairStyle = 1;
    return buildTravelerFromParts({
      fullName: L("Тімур Лайк-Маркетолог", "Timur Like-Marketoloh"),
      age: 27, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Тімур Лайк-Маркетолог", "Timur Like-Marketoloh"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("27 р. • ЧОЛ", "27 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("12.05.2029", "2029-05-12"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ВОЛОНТЕРА", "VOLUNTEER PERMIT"),
        subtitle: L("Державна адміністрація", "Regional Admin"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Тімур Лайк-Маркетолог", "Timur Like-Marketoloh"), disc: null },
          { label: L("Підстава", "Basis"), value: L("Закупівля оптичних засобів для підрозділів", "Tactical optics procurement"), disc: null }
        ],
        sealText: L("ОВА / ШЛЯХ • ДІЙСНИЙ", "ADMIN / SHLYAKH • VALID"),
        sealDisc: null
      }],
      includeDecl: true,
      declaredCargo: L("Коробки з маскувальними сітками та бронеплитами", "Camouflage nets & armor plates"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» РОЗГРИЗ КОРОБКИ: Жодних сіток — 30 нових смартфонів, брендові сумочки та елітний алкоголь на перепродаж!", "DOG SEARCH: Zero camo nets — 30 new phones, designer handbags & luxury liquor for resale!"),
      greeting: L("«Йоу підписники! Я знімаю сторіз для донатів — їдемо в Поландію, пропускай, шефе!»", "'Yo followers! Shooting a livestream, heading to Polandia, roll us out!'"),
      interrogationReply: L("«Та все для армії, чесно! Ось 500 💵 за швидкість оформлення без пса!»", "'All for charity, promise! Take 500 💵 to skip the sniffer dog!'"),
      intimidateReply: L("«Стій, не тряси телефон! У мене прямий ефір зараз впаде!»", "'Stop shaking! My livestream is dropping frames!'"),
      coffeeReply: L("«Класний контент буде — п'ю каву з інспектором!»", "'Great vlog content — coffee with the guard!'"),
      arrestFull: L("Псевдоволонтера пакують у бус СБК під його ж власний стрім!", "The fake charity influencer gets cuffed on his own livestream!"),
      arrestToned: L("Затримано за комерційну контрабанду під виглядом гуманітарки.", "Detained for commercial smuggling under false charity guise."),
      hasContraband: true,
      bribeOffer: { amount: 500, currency: "USD", requiresDiscovery: true, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO],
      storyTag: "FAKE_BLOGGER"
    });
  }

  function createCryptoStartupFounder(dayNum) {
    const trMeta = makeTransportMeta({ shape: "E_SCOOTER", name: L("Електросамокат «Вжух-Про 3000»", "'Vzhykh-Pro 3000' E-Scooter"), isCar: false }, getColorById("YELLOW"), "ПШ-902");
    const portrait = randomPortrait("M");
    portrait.glasses = 1;
    const isLegit = dayNum <= 2 || Math.random() < 0.45;
    return buildTravelerFromParts({
      fullName: L("Арсеній Блокчейнко", "Arsenii Blokcheinko"),
      age: 25, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Блокчейнко Арсеній", "Blokcheinko Arsenii"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("25 р. • ЧОЛ", "25 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("20.02.2032", "2032-02-20"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
        subtitle: isLegit ? L("Реєстр критичної інфраструктури", "Critical Tech Registry") : L("Космо-Біржа ТОВ", "Space-Exchange LLC"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Блокчейнко Арсеній", "Blokcheinko Arsenii"), disc: null },
          { label: L("Підстава", "Basis"), value: isLegit ? L("Кіберзахист енергомереж Kraina", "National Cyber Defense") : L("Терміновий мінт токенів у Кракові", "Urgent token minting"), disc: null },
          { label: L("Ким видано", "Issued By"), value: isLegit ? L("Мінцифри / ЦНАП", "MinDigital / CNAP") : L("Клуб «Крипто-Вовк Офшорія»", "Club 'Crypto-Wolf'"), disc: isLegit ? null : DISCREPANCY.FAKE_ISSUER_SEAL }
        ],
        sealText: isLegit ? L("ДПСК / КІБЕР • ДІЙСНИЙ", "SBGS / CYBER • VALID") : L("КРИПТО-МАГІСТРАТ", "CRYPTO-MAGISTRATE"),
        sealDisc: isLegit ? null : DISCREPANCY.FAKE_ISSUER_SEAL
      }],
      includeDecl: true,
      declaredCargo: L("Макбук, 2 павербанки, рюкзак", "Laptop, 2 powerbanks, backpack"),
      greeting: L("«Вітаю! Я на електросамокаті до Варшавки — заряджаюся в кожному селі. Ось документи!»", "'Hi! Taking my e-scooter to Varshavka — charging at every village!'"),
      interrogationReply: isLegit ? L("«Перевіряйте по реєстру — я інженер кіберзахисту!»", "'Verify it — I am a cyber-defense engineer!'") : L("«Можу в USDT на крипто-гаманець кинути 120 💵 еквівалентом?»", "'Can I send 120 💵 in USDT to your wallet?'"),
      intimidateReply: isLegit ? L("«Ой, акуратно, не впустіть мій ноутбук!»", "'Careful, don't startle me with my laptop!'") : L("«Та ладно, невже печатка не виглядає солідно?!»", "'Come on, doesn't the stamp look legit?!'"),
      coffeeReply: L("«Дякую! Кофеїн + електросамокат = подвійна швидкість!»", "'Thanks! Caffeine + e-scooter = double speed!'"),
      coffeeTip: isLegit ? 60 : 0,
      arrestFull: L(isLegit ? "Ти затримав справжнього кіберінженера!" : "Шахрая з вигаданою крипто-печаткою затримано!", isLegit ? "You detained a real cyber engineer!" : "Detained for bogus crypto seal!"),
      arrestToned: L("Мандрівника на самокаті затримано.", "Scooter rider detained."),
      bribeOffer: isLegit ? null : { amount: 120, currency: "USD", isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: isLegit,
      violations: isLegit ? [] : [DISCREPANCY.FAKE_ISSUER_SEAL],
      storyTag: `CRYPTO_${dayNum}`
    });
  }

  function createGrandmaPickles() {
    const trMeta = makeTransportMeta({ shape: "ON_FOOT", name: L("Пішки з двома баулами «Мрія Перекупа»", "On Foot with Bazaar Plaid Bags"), isCar: false }, getColorById("BLUE"), "ПШ-001");
    const portrait = { gender: "F", skinTone: 1, faceShape: 0, hairStyle: 2, hairColor: 2, facialHair: 0, glasses: 1, headwear: 2, scarOrDetail: 0, expression: 1, lipColor: 0, earrings: 1, outfitStyle: 0, specialId: "VOLUNTEER_OLYA" };
    return buildTravelerFromParts({
      fullName: L("Марія Іванівна Кожушко", "Mariia Kozhushko"),
      age: 64, gender: "F", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: L("Кожушко Марія Іванівна", "Kozhushko Mariia"), disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("64 р. • ЖІН", "64 y/o • F"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("17.04.2031", "2031-04-17"), disc: null }
      ],
      includeDecl: true,
      declaredCargo: L("Пиріжки з вишнею, 4 банки малосольних огірків та в'язані шкарпетки", "Cherry pies, 4 pickle jars & knitted socks"),
      vehicleSearchResult: L("Пес «Бавовна» сів просити пиріжка. Всередині сумок дійсно теплі шкарпетки й банки з огірками!", "Bavovna begs for a pie. Truly only socks and pickle jars!"),
      greeting: L("«Дай Боже здоров'я, синку! Я пішки з самої Чернівців... ой, із Левгорода з двома картатими сумками до доньки!»", "'Bless you, sonny! Walking from Levhorod with two plaid bazaar bags to see my daughter!'"),
      interrogationReply: L("«Та заглядай у сумку, тільки пиріжки не подави!»", "'Go ahead and peek in the bags, just don't squish my pies!'"),
      intimidateReply: L("«Ох ти ж батюшки, злякав стару! Чого грюкаєш?»", "'Oh goodness, you scared an old woman!'"),
      coffeeReply: L("«Дякую, дитинко! Візьми 40 🪙 на гостинець та банку огірків на зміну!»", "'Thank you dear! Have 40 🪙 and a jar of pickles for the shift!'"),
      coffeeTip: 40,
      arrestFull: L("Навіщо ти заарештував бабусю з пиріжками?!", "Why did you arrest a sweet grandma carrying pies?!"),
      arrestToned: L("Похилу мандрівницю помилково затримано.", "Elderly traveler mistakenly detained."),
      shouldBeApproved: true,
      storyTag: "GRANDMA_PICKLES"
    });
  }

  function createIntelCovertCourier() {
    const fullName = randomFullName("F");
    const portrait = Object.assign(randomPortrait("F"), { outfitStyle: 3 });
    const trMeta = makeTransportMeta({ shape: "PICKUP", name: L("«Пікап Міцубісі Л200»", "'Pickup L200'"), isCar: true }, getColorById("OLIVE"), "ЗС 0411 БП");
    return buildTravelerFromParts({
      fullName, age: 29, gender: "F", portrait, transport: trMeta,
      passportSub: L("Серія КР-701299 • Оперативне прикриття", "No. KR-701299 • Operational Cover"),
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("29 р. • ЖІН", "29 y/o • F"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("В'ЇЗД → Кийград", "ENTRY → Kyihrad"), disc: null },
        { label: L("Пароль СБК", "SBK Callsign"), value: L("«Паляниця-Північ»", "'Palyanytsia-North'"), disc: null }
      ],
      passportSeal: L("СБК / ГУР • ПРІОРИТЕТ", "SBK / GUR • PRIORITY"),
      includeDecl: true,
      declaredCargo: L("Запчастини ППО, станції зв'язку (Гриф ДСК)", "Air-defense spares & comms"),
      vehicleSearchResult: L("Спецпакет із голограмою ГУР / СБК — статус підтверджено!", "Sealed GUR/SBK hologram pouch — status confirmed!"),
      greeting: L("«Інспекторе, позивний «Паляниця-Північ». Повертаюся з завдання в Поландії, везу обладнання для ППО.»", "'Inspector, callsign Palyanytsia-North. Returning from a mission in Polandia with air-defense gear.'"),
      interrogationReply: L("«Зв'яжіться з майором СБК «Тихим» — рейс погоджено на найвищому рівні!»", "'Confirm with Major Quiet — cleared at highest command!'"),
      intimidateReply: L("«*Спокійно дивиться просто в очі* Не витрачайте час зміни, інспекторе. Пароль названо.»", "'*Calmly locks eyes* Don't waste shift time, Inspector.'"),
      coffeeReply: L("«Дякую. На передовій такої кави бракує.»", "'Thank you. Good coffee is rare at the front.'"),
      arrestFull: L("Затримання власної розвідниці викликає лють у майора СБК «Тихого»!", "Detaining an allied intelligence courier infuriates Major Quiet!"),
      arrestToned: L("Кур'єрку спецслужби безпідставно затримано.", "Intelligence courier detained mistakenly."),
      shouldBeApproved: true,
      storyTag: "INTEL_ALLY"
    });
  }

  function createArtillerySpotter() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { scarOrDetail: 1, expression: 3 });
    const trMeta = makeTransportMeta({ shape: "SEDAN", name: L("«Фолькс Пассат Б5»", "'Folks Passat B5'"), isCar: true }, getColorById("SILVER"), "СБ 9004 ОТ");
    return buildTravelerFromParts({
      fullName, age: 44, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("44 р. • ЧОЛ", "44 y/o • M"), disc: null },
        { label: L("Мітки реєстру", "Registry Note"), value: L("Особлива прикмета: шрам на лівій щоці", "Distinguishing feature: left cheek scar"), disc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY },
        { label: L("Дійсний до", "Valid Until"), value: L("18.02.2028", "2028-02-18"), disc: null }
      ],
      passportSeal: L("ПЕРЕВІРИТИ БАЗУ СБК", "CHECK SBK ALERT"),
      passportSealDisc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY,
      includeDecl: true,
      declaredCargo: L("Фотоапарат, бінокль туриста", "Camera & binoculars"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» ЗНАЙШОВ СХОВАНКУ: Під запаскою — пачки рублів, чужі SIM-карти та фото підстанцій Кийграда і Левгорода!", "DOG SEARCH: Spare wheel hides rubles, foreign SIM cards & substation coordinates!"),
      greeting: L("«Добрий день... Я фотограф-любитель, фотографую мости й колії та їду до родичів у Поландію.»", "'Hello... Amateur photographer shooting railways, heading to relatives in Polandia.'"),
      interrogationReply: L("«Не кличте СБК! Ось 600 💵 просто зараз — тільки не перевіряйте багажник!»", "'Don't call SBK! 600 💵 right now — just don't search the trunk!'"),
      intimidateReply: L("«*Різко пітніє* Я... я видалив усі фото! Простіше домовитись!»", "'*Sweating heavily* I... deleted the photos!'"),
      coffeeReply: L("«*Тремтячими руками тримає стакан* Д-дякую... а ви швидко штампуєте?»", "'*Hands shaking* Th-thanks... stamp quick?'"),
      arrestFull: L("Група СБК вилітає з будки й пакує коригувальника! Майор «Тихий» виписує тобі премію!", "SBK tackles the spotter and awards you a combat bonus!"),
      arrestToned: L("Підозрюваного у диверсійній діяльності затримано.", "Suspected saboteur detained."),
      hasContraband: true,
      bribeOffer: { amount: 600, currency: "USD", requiresDiscovery: true, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.WANTED_CRIMINAL_OR_SPY, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "SABOTEUR"
    });
  }

  function createMicrochipSmuggler() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { glasses: 2, expression: 1 });
    const trMeta = makeTransportMeta({ shape: "MINIBUS", name: L("«Фургон Івеко Карго»", "'Iveko Cargo Van'"), isCar: true }, getColorById("WHITE"), "ВР 5128 СК");
    return buildTravelerFromParts({
      fullName, age: 39, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("39 р. • ЧОЛ", "39 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("09.06.2029", "2029-06-09"), disc: null }
      ],
      includeDecl: true,
      declaredCargo: L("Вживані пральні машинки «Індезіт» на запчастини (8 шт.)", "Used washing machines for parts (8 pcs)"),
      declSeal: L("МИТНИЦЯ ОФШОРІЇ • ТРАНЗИТ", "OFSHORIA CUSTOMS"),
      declSealDisc: DISCREPANCY.FAKE_ISSUER_SEAL,
      vehicleSearchResult: L("ПЕС «БАВОВНА» І РЕНТГЕН: Усередині барабанів пралок сховані підсанкційні військові мікрочіпи та гіроскопи!", "DOG & X-RAY: Washing drums conceal sanctioned missile microchips & gyroscopes!"),
      greeting: L("«Вітаю, шефе! Везу транзитом з Офшорії старі пральні машини на розбірку. Там лише металобрухт!»", "'Hey boss! Hauling old washing machines from Ofshoria for scrap!'"),
      interrogationReply: L("«Тихіше! За ці плати серйозні люди платять золотом! Візьми 950 💵 і закрий двері!»", "'Quiet! Gold awaits for those chips! Take 950 💵!'"),
      intimidateReply: L("«*Озирається на кузов* Е-е... пралки звичайні, пломбу не чіпай!»", "'*Glances back nervously* Normal washers, don't break the seal!'"),
      coffeeReply: L("«Дякую за каву. Ось би ще штамп без затримок...»", "'Thanks for the coffee. Could really use a quick stamp...'"),
      arrestFull: L("Контррозвідка СБК арештовує контрабандиста військової електроніки разом із фургоном!", "SBK arrests the military chip smuggler and impounds the van!"),
      arrestToned: L("Контрабандну партію мікроелектроніки затримано.", "Smuggled military electronics seized."),
      hasContraband: true,
      bribeOffer: { amount: 950, currency: "USD", requiresDiscovery: true, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO, DISCREPANCY.FAKE_ISSUER_SEAL],
      isWantedTarget: true,
      storyTag: "SABOTEUR"
    });
  }

  function createItEvaderVip() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { glasses: 2, hairStyle: 1, outfitStyle: 2 });
    const trMeta = makeTransportMeta({ shape: "SPORT", name: L("«Електро-Комета GT»", "'Electro-Comet GT'"), isCar: true }, getColorById("RED"), "КА 8844 ІТ");
    return buildTravelerFromParts({
      fullName, age: 31, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("31 р. • ЧОЛ", "31 y/o • M"), disc: null },
        { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: null },
        { label: L("Підстава 18–60", "Exit Permit"), value: L("«Бізнес-конференція Web3» (Без броні)", "Tech Conference (No permit)"), disc: DISCREPANCY.AGE_RESTRICTION_NO_PERMIT }
      ],
      includeDecl: true,
      declaredCargo: L("Макбук Про, крипто-флешка Ledger, валіза", "MacBook Pro, Ledger wallet, suitcase"),
      greeting: L("«Бро, я сеньйор-архітектор! На 3 дні на мітап у Варшавку — маю віддалений реліз. Не затримуй!»", "'Bro, I'm a Senior Architect! Off to a 3-day meetup in Varshavka, let's keep it smooth!'"),
      interrogationReply: L("«Слухай, у мене контракт горить. Закину 1 200 💵 чистими прямо зараз — забудь про довідку!»", "'Look, my contract is burning. Here's 1,200 💵 cash right now — forget the permit!'"),
      intimidateReply: L("«*Знімає брендові окуляри* Та я податки плачу, нащо так кричати?!»", "'*Takes off shades* Hey I pay taxes, no need to yell!'"),
      coffeeReply: L("«О, фільтр-кава є? Можу накинути на каву, якщо піднімеш шлагбаум!»", "'Nice filter coffee! Raise the barrier and I'll tip big!'"),
      arrestFull: L("За відсутність відстрочки достатньо було натиснути ✖ ВІДМОВИТИ — а не пакувати айтішника!", "Should have pressed ✖ DENY instead of full detention!"),
      arrestToned: L("Перевищення сили — треба було ✖ ВІДМОВИТИ.", "Should have pressed DENY."),
      bribeOffer: { amount: 1200, currency: "USD", instantOffer: true, nabkRiskJump: 10, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      storyTag: "IT_VIP"
    });
  }

  function createDeputyEscapee() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { hairStyle: 3, facialHair: 2, outfitStyle: 2, expression: 2 });
    const trMeta = makeTransportMeta({ shape: "SEDAN", name: L("«Майбах-Лімузин S680»", "'Maybakh Limo S680'"), isCar: true }, getColorById("BLACK"), "АА 0007 ВР");
    return buildTravelerFromParts({
      fullName, age: 49, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("49 р. • ЧОЛ", "49 y/o • M"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("19.12.2031", "2031-12-19"), disc: null }
      ],
      extraDocs: [{
        type: "EXEMPTION_CERT",
        title: L("СЛУЖБОВЕ ВІДРЯДЖЕННЯ", "OFFICIAL MISSION"),
        subtitle: L("Комітет з питань відпочинку", "Committee of Leisure"),
        fields: [
          { label: L("Особа", "Holder"), value: fullName, disc: null },
          { label: L("Ким видано", "Issued By"), value: L("Приватний фонд «Монаківка-Еліт»", "Private Fund 'Monakivka-Elite'"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
        ],
        sealText: L("МОНАКІВКА-VIP • БЕЗ ЧЕРГИ", "MONAKIVKA-VIP • PRIORITY"),
        sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
      }],
      includeDecl: true,
      declaredCargo: L("Сейфові кейси з «документами комітету»", "Armored briefcases with 'committee docs'"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» І СКАНЕР: У кейсах 400 000 💵 готівкою в банківських стрічках і 3 закордонні паспорти!", "DOG & X-RAY: Briefcases stuffed with 400,000 💵 cash and 3 foreign passports!"),
      greeting: L("«Ти знаєш, з ким розмовляєш? Народний обранець їде на саміт у Монаківку! Шлагбаум вгору!»", "'Do you know who I am?! MP heading to Monakivka summit! Barrier UP!'"),
      interrogationReply: L("«Не псуй собі кар'єру, синку. Ось тобі 1 800 💵 у пакеті — мовчи й натискай зелений!»", "'Don't ruin your career, son. Here's 1,800 💵 in a bag — press green!'"),
      intimidateReply: L("«*Червоніє від люті* Завтра твій начальник у мене на килимі стоятиме!»", "'*Turns red with rage* Your boss will answer to me tomorrow!'"),
      coffeeReply: L("«Коньяк до кави є? Хоча гаразд, штампуй вже.»", "'Got cognac for the coffee? Whatever, stamp it.'"),
      arrestFull: L("Контррозвідка СБК та НАБК блокують Майбах депутата-втікача! Тобі виписують премію СБК!", "SBK & NABK block the fleeing MP's Maybach! Massive bounty awarded!"),
      arrestToned: L("Затримано посадовця з підробленим відрядженням.", "Official detained with forged travel order."),
      hasContraband: true,
      bribeOffer: { amount: 1800, currency: "USD", instantOffer: true, nabkRiskJump: 12, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.FAKE_ISSUER_SEAL, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "DEPUTY_ESCAPEE"
    });
  }

  function createTopCorruptor() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { scarOrDetail: 1, expression: 3, outfitStyle: 2 });
    const trMeta = makeTransportMeta({ shape: "G_WAGON", name: L("«Броньований Гелік G63»", "'Armored G-Wagon G63'"), isCar: true }, getColorById("BLACK"), "КВ 0001 КР");
    return buildTravelerFromParts({
      fullName, age: 54, gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L("54 р. • ЧОЛ", "54 y/o • M"), disc: null },
        { label: L("Мітки реєстру", "Registry Note"), value: L("Службова примітка №77-А", "Service Note #77-A"), disc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY },
        { label: L("Дійсний до", "Valid Until"), value: L("11.11.2030", "2030-11-11"), disc: null }
      ],
      passportSeal: L("ОРІЄНТУВАННЯ НАБК / СБК", "NABK / SBK ALERT"),
      passportSealDisc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY,
      includeDecl: true,
      declaredCargo: L("Спортивні сумки з тенісними ракетками", "Sports bags with tennis rackets"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» ЗІРВАВ ДНО БАГАЖНИКА: Дві спортивні сумки набиті пачками 100 💵 купюр і золотими злитками!", "DOG SEARCH: False trunk floor packed with 100 💵 bill bricks & gold bars!"),
      greeting: L("«Тихо, командире... Обшуки в Києві почалися годину тому. Мені треба зникнути до світанку.»", "'Quiet, commander... Raids started in Kyiv an hour ago. I must vanish before dawn.'"),
      interrogationReply: L("«Слухай уважно: 2 500 💵 тобі на руки просто зараз! Тільки пропусти!»", "'Listen closely: 2,500 💵 cash in your hand right now! Just let me pass!'"),
      intimidateReply: L("«*Холодно дивиться* Гроші або куля в спину від моїх людей — обирай мудро.»", "'*Cold stare* Take the cash or face my people — choose wisely.'"),
      coffeeReply: L("«В останній раз таку каву пив на заправці під Києвом...»", "'Last time I had coffee like this was outside Kyiv...'"),
      arrestFull: L("СПЕЦОПЕРАЦІЯ РОКУ! Ти затримав топ-корупціонера з мільйонами в багажнику! СБК в захваті!", "ARREST OF THE YEAR! You caught the top corrupt official fleeing with millions!"),
      arrestToned: L("Топ-фігуранта кримінального розшуку затримано на кордоні.", "High-profile wanted official detained at border."),
      hasContraband: true,
      bribeOffer: { amount: 2500, currency: "USD", requiresDiscovery: true, nabkRiskJump: 15, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.WANTED_CRIMINAL_OR_SPY, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "TOP_CORRUPTOR"
    });
  }

  // ★ DEEP COMBINATORIAL PROCEDURAL GENERATOR ★
  const HONEST_GREETINGS_F = [
    L("«Доброго дня! Їду до сестри у Варшавку з гостинцями, документи перевіряла двічі.»", "'Good day! Heading to my sister in Varshavka with gifts, papers checked twice.'"),
    L("«Привіт, інспекторе! Повертаюся додому в %CITY%, скучила за рідними!»", "'Hi inspector! Returning home to %CITY%, missed my family!'"),
    L("«Добрий день! Везу дитячі речі та медикаменти, ось мої папери.»", "'Hello! Carrying kids' clothes and medicine, here are my papers.'"),
    L("«Вітаю! Везу рудого кота до ветеринара в Поландії — він уже весь салон подряпав!»", "'Greetings! Taking my orange cat to a vet in Polandia!'"),
    L("«Добрий вечір! Їдемо з оркестром на благодійний концерт, у багажнику контрабас!»", "'Good evening! Orchestra heading to a charity concert, double bass in the trunk!'"),
    L("«Ой, тримайте папери! Поспішаю на весілля племінниці — там триповерховий торт на задньому сидінні!»", "'Here are my papers! Rushing to a wedding with a 3-tier cake in back!'"),
    L("«Повертаюся з Польщі додому в %CITY%, везу гуманітарні павербанки та турнікети!»", "'Returning home to %CITY%, bringing powerbanks & tourniquets!'"),
    L("«Вітаю! Їду забирати маму з вокзалу в Поландії, ось усі документи!»", "'Hello! Picking up mom at the station, all documents ready!'"),
    L("«Добрий день! Їду на конференцію вчителів з м. %CITY%, ось запрошення.»", "'Good day! Heading to a teachers conference from %CITY%.'"),
    L("«Вітаю, інспекторе! Перевожу притулкових котиків до нової родини, ветпаспорти є!»", "'Hi inspector! Taking shelter cats to a new family, vet passports ready!'"),
    L("«Я кондитер із %CITY%, везу торт на весілля племінниці в Кракові!»", "'Pastry chef from %CITY% delivering a wedding cake to Krakiv!'")
  ];
  const HONEST_GREETINGS_M = [
    L("«Бажаю здоров'я! Усі довідки оформлені офіційно через ЦНАП м. %CITY%.»", "'Greetings! Official exemption issued in %CITY%.'"),
    L("«Добрий день, командире! Робочий рейс до Варшавки, усе в порядку.»", "'Good day! Business trip toward Varshavka, all clean.'"),
    L("«Вітаю! Везу волонтерський генератор хлопцям під Слобожанськ.»", "'Hello! Hauling a volunteer generator toward Slobozhansk.'"),
    L("«Добрий вечір! Повертаюся з рейсу додому в %CITY%, везу запчастини на трактор!»", "'Good evening! Returning home to %CITY% with tractor spare parts!'"),
    L("«Їду на міжнародну виставку в Унію, багатодітний батько — усі 3 свідоцтва маю!»", "'Heading to an expo in Unia — father of 3, all papers ready!'"),
    L("«Супроводжую батька на лікування до Карпатії, ось офіційний висновок ЛКК.»", "'Escorting my father for treatment in Karpatia, official medical papers here.'"),
    L("«Повертаюсь із-за кордону, везу старлінки та спальники для громади!»", "'Returning from abroad with Starlinks and sleeping bags for our town!'"),
    L("«Бажаю спокійної зміни! Везу насіння та саджанці яблунь додому в %CITY%.»", "'Quiet shift to you! Bringing apple tree saplings home to %CITY%.'"),
    L("«Їду на ремонтний завод у Поландію по офіційному бронюванню, ось витяг!»", "'Heading to a repair plant in Polandia on official critical exemption!'"),
    L("«Дід уже на пенсії, їду до онуків у гості з м. %CITY% — паспорти в ідеалі!»", "'Retired grandpa visiting grandkids from %CITY% — papers spotless!'"),
    L("«Везу комплектуючі до сонячних станцій для лікарні в %CITY%, документи чисті.»", "'Hauling solar station parts for %CITY% hospital, all docs clean!'")
  ];
  const HONEST_CARGOS = [
    L("Особисті валізи, термос, плед", "Personal suitcases, thermos & blanket"),
    L("Домашні закрутки, ноутбук, наплечник", "Homemade pickles, laptop, backpack"),
    L("Медична аптечка та дитячі іграшки", "First-aid kit & children's toys"),
    L("Бензопила, спальник і 2 павербанки", "Chainsaw, sleeping bag & 2 powerbanks"),
    L("Мед у трьохлітрових банках та рушники", "Honey jars & embroidered towels"),
    L("Генератор 3 кВт, подовжувачі, ліхтарики", "3kW generator, cables & flashlights"),
    L("Скрипка, контрабас та сценічні костюми", "Violin, double bass & stage outfits"),
    L("Переноска з рудим котом, корм, ветпаспорт", "Cat carrier, pet food & vet passport"),
    L("Бабусине сало в банках (20 шт.) та часник", "20 jars of homemade salo & garlic"),
    L("Весільна сукня та триповерховий торт", "Wedding dress & 3-tier cake"),
    L("Запчастини до трактора, ключі, домкрат", "Tractor parts, wrenches & jack"),
    L("Рибальські вудки, човен та термос", "Fishing rods, inflatable boat & thermos"),
    L("Колекція вінілових платівок та програвач", "Vinyl record collection & turntable"),
    L("Медичні шини, турнікети та бинти (гуманітарка)", "Medical splints, tourniquets & bandages"),
    L("Кавомолка, зерна кави та стаканчики", "Coffee grinder, beans & cups"),
    L("2 спортивні велосипеди та шоломи", "2 road bicycles & helmets"),
    L("Коробки з українськими книжками для діаспори", "Boxes of books for diaspora"),
    L("Ігровий ПК, 2 монітори та механічна клавіатура", "Gaming PC, 2 monitors & keyboard"),
    L("Саджанці яблунь, лопати та добрива", "Apple tree saplings, shovels & fertilizer"),
    L("Термінал «Зоряний-Лінк» та сонячна панель", "Satellite terminal & solar panel"),
    L("Валіза парфумів, 4 капелюшки та фен", "Perfume case, 4 hats & hairdryer"),
    L("Лижне спорядження, термобілизна, окуляри", "Ski gear, thermal wear & goggles"),
    L("Мішок картоплі з тещиного городу та кабачки", "Sack of potatoes & zucchini"),
    L("Фотоштативи, дрон DJI-Іграшка (дитячий) та рюкзак", "Tripods, toy drone & backpack")
  ];
  const CONTRABAND_COVERS = [
    { decl: L("Старі дерев'яні меблі та килими", "Antique wooden furniture & rugs"), found: L("ПЕС «БАВОВНА» РОЗГРИЗ ОБШИВКУ: У ніжках столу сховано 50 блоків контрабандних сигарет!", "DOG SEARCH: Table legs packed with 50 smuggled cigarette cartons!"), bribeAmount: 320, currency: "USD" },
    { decl: L("Мішки з будівельним гіпсом та шпаклівкою", "Sacks of construction plaster"), found: L("ПЕС «БАВОВНА» РОЗКОПАВ ГІПС: Усередині мішків — каміння нелегального бурштину з Бурштинівки!", "DOG SEARCH: Sacks hide raw Burshtynivka amber!"), bribeAmount: 480, currency: "USD" },
    { decl: L("Запасні автомобільні шини (4 шт.)", "Spare car tires (4 pcs)"), found: L("ПЕС «БАВОВНА» ГАВКАЄ НА ЗАПАСКУ: Всередині покришок заховані пачки нелегальної валюти та чужі паспорти!", "DOG SEARCH: Tires stuffed with undeclared cash and forged passports!"), bribeAmount: 850, currency: "USD" },
    { decl: L("Паливні баки та запчастини до фур", "Fuel cans & truck spare parts"), found: L("ПЕС «БАВОВНА» ЗНАЙШОВ ТАЙНИК: Під сидінням 400 л краденого дизелю та паливні талони!", "DOG SEARCH: Stolen diesel & black-market fuel coupons under the seat!"), bribeAmount: 280, currency: "USD" },
    { decl: L("Коробки з «гуманітарним одягом»", "Boxes of 'humanitarian clothes'"), found: L("ПЕС «БАВОВНА» ПОРВАВ СКОТЧ: У коробках сховані підсанкційні мікрочіпи й комплектуючі до дронів!", "DOG SEARCH: Boxes hide sanctioned microchips & drone parts!"), bribeAmount: 1000, currency: "USD" },
    { decl: L("Рулони килимів від бабусі", "Rolled vintage carpets"), found: L("ПЕС «БАВОВНА» ЗНАЙШОВ СХОВАНКУ: Усередині рулонів — старовинні ікони та срібні монети на вивіз!", "DOG SEARCH: Rolled carpets conceal antique icons & silver coins!"), bribeAmount: 720, currency: "USD" },
    { decl: L("Металобрухт на переробку", "Scrap metal for recycling"), found: L("ПЕС «БАВОВНА» ГАВКАЄ НА БАГАЖНИК: Під лахміттям вирізані автокаталізатори та бухти мідного кабелю!", "DOG SEARCH: Stolen catalytic converters & copper cables under rags!"), bribeAmount: 300, currency: "USD" },
    { decl: L("Подарункові кошики з шоколадом", "Gift baskets with chocolate"), found: L("ПЕС «БАВОВНА» ЗІРВАВ ФАЛЬШ-ДНО: Під цукерками — ящики безакцизного алкоголю та вейпів!", "DOG SEARCH: False bottom packed with untaxed liquor & vapes!"), bribeAmount: 360, currency: "USD" },
    { decl: L("Тубуси з «дитячими малюнками»", "Tubes with 'kids drawings'"), found: L("ПЕС «БАВОВНА» ПОРВАВ ТУБУСИ: Викрадені музейні полотна XIX століття без декларації!", "DOG SEARCH: Stolen 19th-century museum paintings!"), bribeAmount: 1200, currency: "USD" },
    { decl: L("Холодильник для риби та льоду", "Cooler for fish & ice"), found: L("ПЕС «БАВОВНА» ВІДКРИВ ХОЛОДИЛЬНИК: 18 кг нелегальної чорної ікри та раритетних молюсків!", "DOG SEARCH: 18kg of smuggled black caviar!"), bribeAmount: 640, currency: "USD" },
    { decl: L("Туристичні намети й каремати", "Camping tents & mats"), found: L("ПЕС «БАВОВНА» ЗНАЙШОВ У НАМЕТАХ: 6 тепловізорів подвійного призначення без документів!", "DOG SEARCH: 6 undeclared thermal optics inside tent rolls!"), bribeAmount: 1100, currency: "USD" },
    { decl: L("Книжки з кулінарії та журнали", "Cookbooks & magazines"), found: L("ПЕС «БАВОВНА» ВИРВАВ ОБКЛАДИНКУ: Порожнисті томи набиті контрабандними золотими ланцюжками!", "DOG SEARCH: Hollowed books stuffed with gold chains!"), bribeAmount: 800, currency: "USD" },
    { decl: L("Пластикові каністри з водою", "Plastic water jerrycans"), found: L("ПЕС «БАВОВНА» ГАВКАЄ НА КАНИСТРИ: Замість води — 60 літрів підпільного спирту!", "DOG SEARCH: 60 liters of bootleg spirit inside water cans!"), bribeAmount: 260, currency: "USD" },
    { decl: L("Акваріумні фільтри та трубки", "Aquarium filters & tubes"), found: L("ПЕС «БАВОВНА» ЗНАЙШОВ ТЕРАРІУМ: Контрабанда екзотичних хамелеонів та рідкісних папуг!", "DOG SEARCH: Smuggled exotic chameleons & rare parrots!"), bribeAmount: 420, currency: "USD" },
    { decl: L("Мікрохвильовки на ремонт (4 шт.)", "Broken microwaves for repair"), found: L("ПЕС «БАВОВНА» РОЗКРИВ КОРПУСИ: Усередині мікрохвильовок сховані 10 ігрових відеокарт RTX!", "DOG SEARCH: Microwave shells hide 10 high-end RTX GPUs!"), bribeAmount: 950, currency: "USD" },
    { decl: L("Спальні мішки та туристичні каремати", "Sleeping bags & camp mats"), found: L("ПЕС «БАВОВНА» ГАВКАЄ НА СПАЛЬНИКИ: Під купою речей ховаються двоє нелегалів без документів!", "DOG SEARCH: 2 undocumented stowaways hiding under sleeping bags!"), bribeAmount: 1150, currency: "USD" },
    { decl: L("Консервована тушонка домашня (3 ящики)", "Homemade canned stew (3 crates)"), found: L("ПЕС «БАВОВНА» ПОЧУВ ПОРОХ: У банках під жиром — набої та мисливські гільзи!", "DOG SEARCH: Stew cans conceal undeclared ammo!"), bribeAmount: 450, currency: "USD" },
    { decl: L("Футляри для спортивного взуття", "Sneaker boxes"), found: L("ПЕС «БАВОВНА» ЗНАЙШОВ ПІДРОБКИ: 80 пар палених кросівок без акцизу та мита!", "DOG SEARCH: 80 pairs of counterfeit designer sneakers!"), bribeAmount: 300, currency: "USD" },
    { decl: L("Скринька з «дідівськими нагородами»", "Box of 'grandpa trinkets'"), found: L("ПЕС «БАВОВНА» РОЗКУСИВ КЕЙС: Викрадене скіфське золото та античні амфори!", "DOG SEARCH: Looted Scythian gold & ancient amphoras!"), bribeAmount: 1200, currency: "USD" },
    { decl: L("Упаковки прального порошку (12 пачок)", "Laundry detergent packs (12 pcs)"), found: L("ПЕС «БАВОВНА» ЗАЧХАВ: У пачках порошку — підпільні стимулятори та заборонені пігулки!", "DOG SEARCH: Detergent bags hide illicit narcotics!"), bribeAmount: 1050, currency: "USD" },
    { decl: L("Коробки з сувенірними годинниками", "Souvenir watch boxes"), found: L("ПЕС «БАВОВНА» ПІДНЯВ ОБШИВКУ: 15 оригінальних швейцарських хронометрів на 100к+!", "DOG SEARCH: 15 luxury Swiss watches hidden in lining!"), bribeAmount: 1100, currency: "USD" },
    { decl: L("Баки з-під тосолу та антифризу", "Antifreeze canisters"), found: L("ПЕС «БАВОВНА» ВИЯВИВ ДВОСТІННІ БАКИ: Контрабандне срібло в гранулах (12 кг)!", "DOG SEARCH: Double-walled cans packed with 12kg silver pellets!"), bribeAmount: 750, currency: "USD" },
    { decl: L("Клітки для перевезення голубів", "Pigeon transport cages"), found: L("ПЕС «БАВОВНА» ПІДНЯВ БРЕЗЕНТ: 4 рідкісні соколи-балобани для арабських шейхів!", "DOG SEARCH: 4 smuggled rare falcons for collectors!"), bribeAmount: 1150, currency: "USD" },
    { decl: L("Старий розібраний мопед на запчастини", "Disassembled old moped parts"), found: L("ПЕС «БАВОВНА» ПОГРИЗ РАМУ: У бензобаку сховані 15 блоків електронних цигарок!", "DOG SEARCH: Fuel tank stuffed with 15 cartons of illicit vapes!"), bribeAmount: 180, currency: "USD" },
    { decl: L("Музичні колонки концертної сцени", "Concert stage speakers"), found: L("ПЕС «БАВОВНА» ЗІРВАВ СІТКУ КОЛОНКИ: Усередині сабвуфера сидить ухилянт із рюкзаком!", "DOG SEARCH: Hollowed subwoofer hides an evader with a backpack!"), bribeAmount: 900, currency: "USD" },
    { decl: L("Коробки з телевізійними антенами", "TV antenna boxes"), found: L("ПЕС «БАВОВНА» РОЗДЕР КАРТОН: 5 нелегальних терміналів супутникового зв'язку на продаж!", "DOG SEARCH: 5 undeclared satellite terminals for resale!"), bribeAmount: 680, currency: "USD" }
  ];

  // ★ RICH TRAVELER ARCHETYPES (Appearance + Matched Transport + Persona Dialogues!) ★
  const TRAVELER_ARCHETYPES = {
    PENSIONER: {
      shapes: ["RETRO", "BICYCLE", "BUS", "ON_FOOT", "SEDAN"],
      cargos: [
        L("Домашні закрутки, мед у банках та теплі шкарпетки", "Homemade jars, honey & wool socks"),
        L("Мішок картоплі, часник та бабусине сало", "Sack of potatoes, garlic & homemade salo"),
        L("Ліки від тиску, термос із ромашкою та плед", "Blood pressure meds, chamomile tea & blanket"),
        L("Саджанці яблунь, лопати та старі фотоальбоми", "Apple saplings, shovels & old photo albums")
      ],
      greetings: [
        L("«Доброго здоров'я, синку! Їду з м. %CITY% до онуків, усе по-старому й по закону!»", "'Good health, son! Heading from %CITY% to my grandkids, all legal!'"),
        L("«Ой, зачекайте, зараз окуляри знайду... Ось паспорт із %CITY%, гляньте, будь ласка!»", "'Wait, let me find my glasses... Here is my passport from %CITY%!'"),
        L("«Їду на базар у Варшавку — там сир, мед і консервація, усе своє, домашнє!»", "'Going to Varshavka market with homemade cheese, honey & pickles!'"),
        L("«Здоров, прикордоннику! Дід уже 40 років за кермом своєї ластівки, жодного штрафу!»", "'Hello officer! 40 years behind the wheel of this beauty, zero tickets!'"),
        L("«Слава Богу, черга рухається! Їду з м. %CITY% до сестри на ювілей.»", "'Thank goodness the line moves! Heading from %CITY% to my sister's birthday.'")
      ],
      interrogations: [
        L("«Та перевіряйте хоч лупою, синку, в нашому ЦНАПі в %CITY% усе чітко штампують!»", "'Check with a magnifying glass if you want, everything is official!'"),
        L("«Ой, та я ще вчора ввечері всі папери в папку склав, усе там зійшлося!»", "'I packed all papers neatly last night, everything matches!'")
      ],
      intimidates: [
        L("«Ох ти ж батюшки, чого так гримати на стару людину?! Тиск же підскочить!»", "'Oh goodness, why bang on the glass at an elder?! My blood pressure!'"),
        L("«Не кричи, синку, я погано чую, але документи в мене чистіші за сльозу!»", "'Don't shout son, I'm hard of hearing, but my papers are spotless!'")
      ],
      coffees: [
        L("«Дай Боже здоров'я за гарячу каву! Візьми 50 🪙 онукам на цукерки... тобто тобі на каву!»", "'God bless you for the hot coffee! Take 50 🪙 for yourself!'"),
        L("«Спасибі, добрий чоловіче! Пахне як вдома в %CITY%. Легкої тобі зміни!»", "'Thank you kindly! Smells like home. Have an easy shift!'")
      ]
    },
    GLAM_LADY: {
      shapes: ["SPORT", "SUV", "E_SCOOTER", "SEDAN"],
      cargos: [
        L("Валіза парфумів, 4 капелюшки, фен та сукні", "Perfume case, 4 hats, hairdryer & dresses"),
        L("Переноска з рудим котом, корм та ветпаспорт", "Cat carrier with orange cat, food & vet passport"),
        L("Весільна сукня та триповерховий торт", "Wedding dress & 3-tier cake"),
        L("Кільцева лампа, косметичка та 2 пари туфель", "Ring light, makeup bag & 2 pairs of heels")
      ],
      greetings: [
        L("«Привітик, інспекторе! Спізнююсь на літак із Варшавки, подивіться папери швиденько!»", "'Hi inspector! Late for my flight in Varshavka, please check fast!'"),
        L("«Добрий день! Їду з м. %CITY% на б'юті-форум, усе в повному порядку, дивіться!»", "'Good day! Heading from %CITY% to a beauty expo, all clean!'"),
        L("«Ой, а ви такий серйозний! Ось мій паспорт, там навіть фото вдале, правда?»", "'Oh, you look so serious! Here is my passport — cute photo, right?'"),
        L("«Вітаю! Везу свого котика до грумера за кордон, ветпаспорт і документи на місці!»", "'Hello! Taking my kitty to a groomer abroad, all docs ready!'"),
        L("«Повертаюся з шопінгу додому в %CITY%, везу подарунки подругам!»", "'Returning from shopping to %CITY% with gifts for friends!'")
      ],
      interrogations: [
        L("«Та все там ідеально, я перед виїздом у салоні й паспорт оновила, і манікюр зробила!»", "'Everything is flawless, I checked my passport right before my manicure!'"),
        L("«Можете перевіряти хоч тричі, у мене кожна буквочка за законом!»", "'Check three times if you like, every letter is legal!'")
      ],
      intimidates: [
        L("«Ей! Обережніше зі склом, це ж тонування преміум-класу!»", "'Hey! Careful with the glass, that's premium tint!'"),
        L("«Фу, навіщо так кричати? Я ж не злочинниця якась, дивіться нормально!»", "'Ugh, why yell like that? I'm not a criminal!'")
      ],
      coffees: [
        L("«О, латешка! Ви прямо джентльмен! Ловіть 50 🪙 на сиропчик!»", "'Ooh, coffee! What a gentleman! Catch 50 🪙 for syrup!'"),
        L("«Мерсі за каву! Якби всі на КПП були такі милі!»", "'Merci for the coffee! Wish everyone at the border was this sweet!'")
      ]
    },
    MAJOR_VIP: {
      shapes: ["G_WAGON", "SPORT", "SUV", "ARMORED"],
      cargos: [
        L("Шкіряний кейс із контрактами, ноутбук та гольф-ключки", "Leather briefcase, laptop & golf clubs"),
        L("Елітний костюм-трійка та коробка сигар", "Tailored 3-piece suit & cigar box"),
        L("Охоронний кейс із документами інвестфонду", "Locked investment fund briefcase"),
        L("Карбоновий шосейник та брендова сумка", "Carbon road bike & designer duffle")
      ],
      greetings: [
        L("«Швидше оформлюй, командире, у мене через годину переговори в Поландії!»", "'Process it fast, commander, I have negotiations in Polandia in an hour!'"),
        L("«Здоров! Офіційне бронювання, їду з %CITY% по держконтракту — не затримуй кортеж.»", "'Hey! Official critical exemption from %CITY%, don't hold up the ride.'"),
        L("«Добрий день. Усе оформлено через юристів, комар носа не підточить.»", "'Good day. Everything cleared by my lawyers, spotless.'"),
        L("«Я тут рідко в черзі стою, але правила є правила — тримай документи.»", "'Rarely wait in lines, but rules are rules — here are the papers.'")
      ],
      interrogations: [
        L("«У мене найкращі адвокати в %CITY%, там жодної коми зайвої немає!»", "'I have the best lawyers in %CITY%, not a single typo in there!'"),
        L("«Перевіряй скільки влізе, час — гроші, а в мене все чисто.»", "'Check all you want, time is money, and I'm clean.'")
      ],
      intimidates: [
        L("«Ти по капоту не стукай, ця тачка коштує як твій КПП за рік!»", "'Don't bang on my hood, this car costs more than your post!'"),
        L("«Спокійніше, інспекторе, не псуй нерви ні собі, ні мені.»", "'Easy there, inspector, save your nerves.'")
      ],
      coffees: [
        L("«О, еспресо не завадить! Тримай 50 🪙, повага за сервіс.»", "'Espresso hits the spot! Take 50 🪙, respect for the service.'"),
        L("«Дякую за каву, норм сервіс на кордоні!»", "'Thanks for the coffee, solid border service!'")
      ]
    },
    WORKER_DRIVER: {
      shapes: ["MINIBUS", "TRUCK", "PICKUP", "SEDAN"],
      cargos: [
        L("Запчастини до трактора, ключі, домкрат та каністра", "Tractor spare parts, wrenches & jack"),
        L("Генератор 3 кВт, подовжувачі та будматеріали", "3kW generator, cables & building supplies"),
        L("Медичні шини, турнікети та гуманітарні коробки", "Medical splints, tourniquets & aid boxes"),
        L("Пластикові ящики порожні на закупку товару", "Empty crates for cargo pickup")
      ],
      greetings: [
        L("«Здоров, братан! Третю добу за баранкою з %CITY%, усе по накладній чітко!»", "'Hey bro! Third day behind the wheel from %CITY%, manifest is clean!'"),
        L("«Доброго вечора! Везу волонтерський генератор і будінструмент, ось папери.»", "'Evening! Hauling a volunteer generator and tools, here are the papers.'"),
        L("«Бажаю здоров'я! Їду порожняком за запчастинами у Варшавку, усе легально.»", "'Greetings! Driving empty to Varshavka for spare parts, all legal.'"),
        L("«Салют, командире! Робочий рейс з %CITY%, нехай зміна летить швидко!»", "'Salute, boss! Work run from %CITY%, hope your shift flies by!'"),
        L("«Ось дозвіл на міжнародні перевезення і техпаспорт — усе звіряв на базі!»", "'Here is my carrier permit and registration — checked at the depot!'")
      ],
      interrogations: [
        L("«Та кажу тобі, сам у диспетчера двічі перевіряв, печатка мокра й свіжа!»", "'Telling you, checked twice with dispatch, stamp is fresh!'"),
        L("«Крути хоч до ранку, братан, у мене все біле-прозоре!»", "'Inspect till morning bro, I'm 100% legit!'")
      ],
      intimidates: [
        L("«Тихіше по дверях, вона ще в кредиті! Усе ж нормально по доках!»", "'Easy on the door, still paying off the loan! Papers are fine!'"),
        L("«Ну чого галасувати, ми ж люди робочі, усе по закону везу!»", "'Why shout, we're working folks, hauling everything legally!'")
      ],
      coffees: [
        L("«Оце по-братськи! Зігрів душу! На 50 🪙 на нормальний бутерброд!»", "'That's brotherly! Warmed my soul! Take 50 🪙 for a sandwich!'"),
        L("«Дякую за каву, командире! Ні цвяха ні жезла тобі на зміні!»", "'Thanks for the coffee, boss! Smooth shift to you!'")
      ]
    },
    IT_VOLUNTEER: {
      shapes: ["E_SCOOTER", "BICYCLE", "SEDAN", "MINIBUS", "MOTORCYCLE"],
      cargos: [
        L("Ігровий ноутбук, 2 павербанки та термінал зв'язку", "Gaming laptop, 2 powerbanks & sat-terminal"),
        L("Коробки з українськими книжками та павербанками", "Boxes of books & powerbanks"),
        L("Фотоштативи, рюкзак та дрон-іграшка для гуртка", "Tripods, backpack & school toy drone"),
        L("Волонтерські аптечки, грілки та спальники", "Volunteer medkits, hand-warmers & sleeping bags")
      ],
      greetings: [
        L("«Привіт! Їду з м. %CITY% на техконференцію — документи й QR в «Облік+» свіжі!»", "'Hi! Heading from %CITY% to a tech conf — docs and QR updated!'"),
        L("«Добрий день! Везу павербанки та аптечки з %CITY%, ось усі накладні.»", "'Good day! Bringing powerbanks and medkits from %CITY%, all invoices ready.'"),
        L("«Вітаю! Зараз такий час, що простіше самокатом/велом без черги — тримайте паспорт!»", "'Hello! Faster on two wheels than waiting in line — here is my ID!'"),
        L("«Добрий день, інспекторе! Перевірте, будь ласка, документи, усе в реєстрі синхронізовано.»", "'Good day inspector! Everything is synced in the registry.'")
      ],
      interrogations: [
        L("«У мене навіть цифрова копія в телефоні є, усе сходиться до цифри!»", "'Got a digital backup too, every digit matches!'"),
        L("«Можемо звірити по базі — там 100% валідний запис!»", "'Check the database — 100% valid record!'")
      ],
      intimidates: [
        L("«Оу, навіщо така агресія? Я просто волонтер/айтішник, усе ж легально!»", "'Whoa, why the aggression? Everything is legal!'"),
        L("«Спокійно, я не тікаю, просто покажіть, що вам звірити!»", "'Relax, I'm not running, just tell me what to show!'")
      ],
      coffees: [
        L("«О, фільтр-кава на кордоні — це топ! Задоначу 50 🪙 у банку вашого поста!»", "'Filter coffee at the border is top tier! Catch 50 🪙 for the post!'"),
        L("«Дякую за каву, дуже вчасно! Гарної зміни!»", "'Thanks for the coffee, right on time! Good shift!'")
      ]
    },
    BIKER_TRAVELER: {
      shapes: ["MOTORCYCLE", "PICKUP", "SUV", "BICYCLE"],
      cargos: [
        L("Рибальські вудки, намет, каремат та термос", "Fishing rods, tent, sleeping pad & thermos"),
        L("Лижне спорядження, термобілизна та окуляри", "Ski gear, thermal wear & goggles"),
        L("Колекція вінілу, гітара та кофр із інструментом", "Vinyl records, guitar & tool roll"),
        L("Спортивний рюкзак, спальник та ліхтарик", "Sport backpack, sleeping bag & flashlight")
      ],
      greetings: [
        L("«Салют, друже! Дорога кличе, їду з %CITY% у гори — папери в рюкзаку сухі й чисті!»", "'Salute friend! Road calls, riding from %CITY% to the mountains — papers clean!'"),
        L("«Вітаю на посту! Вибрався на риболовлю до Карпатії, ось паспорт і техпаспорт.»", "'Greetings! Heading fishing toward Karpatia, here are my docs.'"),
        L("«Здоров! Вітер у лице, але документи тримаю в порядку — гляньте!»", "'Hey! Wind in my face, but my paperwork is tight — take a look!'"),
        L("«Добрий вечір! Їду в тур Європою на своєму залізному коні, усе офіційно!»", "'Evening! Touring Europe on my iron horse, all official!'")
      ],
      interrogations: [
        L("«На трасі без паперів далеко не заїдеш, тож у мене все залізним порядком!»", "'Can't ride far without clean papers, so mine are rock solid!'"),
        L("«Дивись скільки треба, друже, мені приховувати нічого!»", "'Take your time buddy, nothing to hide!'")
      ],
      intimidates: [
        L("«Ей, по баку не бий! Ми на трасі поважаємо один одного!»", "'Hey, don't bang on the tank! Respect the ride!'"),
        L("«Крутий характер, інспекторе, але папери в мене справжні!»", "'Tough attitude, inspector, but my papers are real!'")
      ],
      coffees: [
        L("«Оце тема після вітру на трасі! Тримай 50 🪙 на заправку термоса!»", "'Just what I needed after the highway wind! Catch 50 🪙!'"),
        L("«Спасибі за гарячу каву, друже! Бережи себе на посту!»", "'Thanks for the hot coffee, friend! Stay safe on duty!'")
      ]
    },
    CLERGY_ARTIST: {
      shapes: ["SEDAN", "MINIBUS", "RETRO"],
      cargos: [
        L("Скрипка, контрабас та сценічні костюми", "Violin, double bass & stage outfits"),
        L("Колекція вінілових платівок, ноти та плед", "Vinyl records, sheet music & blanket"),
        L("Церковні книги, свічки та гуманітарні пакунки", "Prayer books, candles & aid parcels")
      ],
      greetings: [
        L("«Мир вам, інспекторе! Їдемо з %CITY% на благодійний концерт, ось запрошення!»", "'Peace to you! Heading from %CITY% to a charity concert, here is our invite!'"),
        L("«Доброго дня! Супроводжую духовну місію з м. %CITY%, усі папери в порядку.»", "'Good day! Accompanying a chaplaincy mission from %CITY%, all papers ready.'"),
        L("«Вітаю! Везу інструменти на фестиваль до Поландії — гляньте документи, будь ласка.»", "'Greetings! Taking instruments to a festival in Polandia — please check.'")
      ],
      interrogations: [
        L("«Усе чесно й прозоро, маємо офіційний лист від філармонії м. %CITY%!»", "'All honest and transparent, official letter from %CITY% philharmonic!'"),
        L("«Перевіряйте скільки потрібно, мистецтво не боїться світла!»", "'Check all you want, art fears no light!'")
      ],
      intimidates: [
        L("«Спокійніше, пане інспекторе, в багажнику ж крихка скрипка!»", "'Easy there, inspector, there is a fragile violin in the trunk!'"),
        L("«Бог свідок — у мене кожен документ справжній!»", "'Heaven as my witness — every paper is real!'")
      ],
      coffees: [
        L("«Дякую за тепло душевне й каву! Візьміть 50 🪙 на потреби поста!»", "'Thank you for the warmth and coffee! Take 50 🪙!'"),
        L("«Благословенної вам зміни, інспекторе!»", "'Have a blessed shift, inspector!'")
      ]
    },
    MEDIC_RESCUER: {
      shapes: ["MINIBUS", "SUV", "SEDAN"],
      cargos: [
        L("Медичні шини, турнікети, дефібрилятор та аптечки", "Medical splints, tourniquets & AED"),
        L("Ліки, інсулін у термоконтейнері та халати", "Medicine, insulin cooler & scrubs"),
        L("Ноші складні, перев'язувальний матеріал та вода", "Folding stretchers & bandages")
      ],
      greetings: [
        L("«Доброго дня! Їду на медичний симпозіум з м. %CITY%, документи чисті.»", "'Good day! Heading to a medical symposium from %CITY%, docs clean.'"),
        L("«Вітаю, колего! Везу партію аптечок для реабілітаційного центру, ось папери.»", "'Hello! Delivering medkits for a rehab center, here are my papers.'"),
        L("«Салют! Повертаюся з навчання з тактичної медицини додому в %CITY%.»", "'Salute! Returning from tactical medicine training home to %CITY%.'")
      ],
      interrogations: [
        L("«У нас у клініці в %CITY% облік суворий — кожна печатка звірена!»", "'Strict accounting at our %CITY% clinic — every stamp verified!'"),
        L("«Готовий хоч зараз відкрити все, там тільки медицина!»", "'Ready to open everything right now, only medical gear!'")
      ],
      intimidates: [
        L("«Ей, не стукайте так — у салоні термобокс із вакцинами!»", "'Hey, easy — there's a vaccine cooler inside!'"),
        L("«Спокійно, тиск і так високий, дивіться папери!»", "'Calm down, my blood pressure is high enough, check the papers!'")
      ],
      coffees: [
        L("«Після нічного чергування кава — це порятунок! Тримай 50 🪙!»", "'After night shift, coffee is a lifesaver! Catch 50 🪙!'"),
        L("«Дякую за каву й бережіть здоров'я на посту!»", "'Thanks for the coffee and stay healthy!'")
      ]
    },
    BLOGGER_INFLUENCER: {
      shapes: ["SPORT", "E_SCOOTER", "SEDAN"],
      cargos: [
        L("Кільцева лампа, екшн-камера, петлички та ноутбук", "Ring light, action cam, mics & laptop"),
        L("Коробка мерчу, штатив та 3 павербанки", "Merch box, tripod & 3 powerbanks"),
        L("Дитячий дрон-іграшка, окуляри та селфі-палка", "Toy drone, sunglasses & selfie stick")
      ],
      greetings: [
        L("«Всім хай! Ой, інспекторе, я з %CITY% на колабу їду — зараз все покажу!»", "'Hey everyone! Heading from %CITY% for a collab — showing all docs!'"),
        L("«Привітик! Знімаю влог про подорож без фільтрів, ось паспорт, лайк за сервіс!»", "'Hi! Filming a travel vlog, here is my passport, thumbs up!'"),
        L("«Салют! Спізнююсь на стрім у Варшавку, гляньте швиденько документи!»", "'Salute! Late for a stream in Varshavka, quick check please!'")
      ],
      interrogations: [
        L("«Усе легально, бро, я ж не хочу хейту в коментарях — дивіться!»", "'All legal bro, don't want hate in comments — look!'"),
        L("«Там усе по поличках, навіть підписники перевіряли!»", "'Everything is organized, even my followers checked!'")
      ],
      intimidates: [
        L("«Оу, оце контент! Але по склу не стукай, камера на панелі!»", "'Whoa, what content! Don't bang the glass, dashcam is rolling!'"),
        L("«Ей, без агресії, ми ж у прямому ефірі... жартую, не знімаю!»", "'Hey, no aggression, we are live... kidding, not recording!'")
      ],
      coffees: [
        L("«Топчик! Кава 10 з 10! Лови 50 🪙 донату!»", "'Top tier! Coffee 10/10! Catch a 50 🪙 donation!'"),
        L("«Дякую за каву, найкращий КПП у регіоні!»", "'Thanks for the coffee, best checkpoint in the region!'")
      ]
    },
    FARMER_AGRO: {
      shapes: ["PICKUP", "TRUCK", "RETRO", "BICYCLE"],
      cargos: [
        L("Мішки насіння соняшнику, добрива та запчастини до сівалки", "Sunflower seed bags, fertilizer & seeder parts"),
        L("Мед у бідонах, яблука та саджанці груші", "Honey cans, apples & pear saplings"),
        L("Плуг-окучник, домкрат і робочі чоботи", "Plow parts, jack & work boots")
      ],
      greetings: [
        L("«Здоров, козаче! Їду з господарства під %CITY% за запчастинами до трактора.»", "'Hey Cossack! Heading from my farm near %CITY% for tractor parts.'"),
        L("«Добрий день! Посівна на носі, везу зразки зерна на виставку — ось документи!»", "'Good day! Planting season soon, taking grain samples to an expo!'"),
        L("«Слава праці! Повертаюся з поля додому в %CITY%, усе по паперах чисто.»", "'Greetings! Heading home to %CITY% from the fields, papers clean.'")
      ],
      interrogations: [
        L("«У нас на землі все чесно — що заробив, те й везу, дивись документи!»", "'Everything is honest on the farm — check my papers!'"),
        L("«Довідку в %CITY% ще минулого тижня виписали, усе сходиться!»", "'Permit issued in %CITY% last week, all matches!'")
      ],
      intimidates: [
        L("«Не грюкай, синку, в кузові розсада — поб'єш горщики!»", "'Don't bang, son, seedlings in the bed — you'll break the pots!'"),
        L("«Та куди мені ховатися, руки в мозолях, усе по закону!»", "'Nothing to hide, honest farmer here!'")
      ],
      coffees: [
        L("«Оце по-нашому! Дякую за каву, ось 50 🪙 до зарплати!»", "'That's our way! Thanks for coffee, take 50 🪙!'"),
        L("«Дай Боже врожаю і тобі спокійної зміни!»", "'Good harvest and a calm shift to you!'")
      ]
    }
  };

  function pickTransportForShapes(shapes, cityCode, twoWheelerBias) {
    let pool = TRANSPORT_CATALOG.filter(m => shapes.includes(m.shape));
    if (twoWheelerBias && Math.random() < 0.45) {
      const tw = TRANSPORT_CATALOG.filter(m => m.shape === "BICYCLE" || m.shape === "E_SCOOTER" || m.shape === "ON_FOOT" || m.shape === "MOTORCYCLE");
      if (tw.length > 0) pool = tw;
    }
    if (pool.length === 0) pool = TRANSPORT_CATALOG;
    const spec = pick(pool);
    return makeTransportMeta(spec, null, generatePlate(cityCode, spec.isCar));
  }

  function buildArchetypePortrait(archKey, gender) {
    const p = randomPortrait(gender);
    if (archKey === "PENSIONER") {
      p.hairColor = pick([2, 5]); // silver/grey
      p.outfitStyle = pick([1, 3, 4]);
      if (gender === "M") {
        p.facialHair = pick([2, 3, 4, 5]);
        p.headwear = Math.random() < 0.55 ? 3 : 0; // knit beanie
      } else {
        p.headwear = Math.random() < 0.65 ? 2 : 0; // floral headscarf
      }
      if (Math.random() < 0.55) p.glasses = pick([1, 3]);
    } else if (archKey === "GLAM_LADY") {
      p.headwear = Math.random() < 0.25 ? 5 : 0;
      p.lipColor = randInt(0, 3);
      p.earrings = randInt(1, 3);
      if (Math.random() < 0.4) p.glasses = pick([2, 4]);
    } else if (archKey === "MAJOR_VIP") {
      p.outfitStyle = 2; // suit & tie
      p.headwear = 0;
      p.glasses = Math.random() < 0.6 ? pick([2, 4]) : 0;
      if (Math.random() < 0.55) p.scarOrDetail = 3; // gold chain
    } else if (archKey === "WORKER_DRIVER") {
      p.outfitStyle = pick([0, 1, 3]);
      p.headwear = Math.random() < 0.55 ? pick([1, 3]) : 0;
      if (gender === "M") p.facialHair = pick([1, 2, 4, 6]);
    } else if (archKey === "IT_VOLUNTEER") {
      p.outfitStyle = pick([0, 4]);
      p.glasses = Math.random() < 0.5 ? pick([1, 3]) : 0;
      p.headwear = Math.random() < 0.25 ? 1 : 0;
    } else if (archKey === "BIKER_TRAVELER") {
      p.outfitStyle = 5; // jacket
      p.glasses = Math.random() < 0.65 ? 2 : 0; // dark aviators
      if (gender === "M") p.facialHair = pick([3, 5, 6]);
      if (Math.random() < 0.3) p.scarOrDetail = 1;
    } else if (archKey === "CLERGY_ARTIST") {
      p.outfitStyle = pick([1, 2, 4]);
      p.headwear = Math.random() < 0.45 ? 5 : 0;
      if (gender === "M") p.facialHair = pick([0, 3, 6]);
    } else if (archKey === "MEDIC_RESCUER") {
      p.outfitStyle = 1;
      p.headwear = 0;
      p.glasses = Math.random() < 0.45 ? 1 : 0;
    } else if (archKey === "BLOGGER_INFLUENCER") {
      p.outfitStyle = 0;
      p.headwear = Math.random() < 0.4 ? 1 : 0;
      p.glasses = Math.random() < 0.55 ? pick([2, 3, 4]) : 0;
    } else if (archKey === "FARMER_AGRO") {
      p.outfitStyle = pick([3, 4]);
      p.headwear = Math.random() < 0.65 ? pick([1, 3]) : 0;
      if (gender === "M") p.facialHair = pick([2, 4, 5]);
    }
    return p;
  }

  function createProceduralTraveler(daySpec) {
    const city = pick(CITIES);

    if (Math.random() < 0.60) {
      // Honest traveler matched to one of 10 rich archetypes!
      const archKeys = ["PENSIONER", "GLAM_LADY", "MAJOR_VIP", "WORKER_DRIVER", "IT_VOLUNTEER", "BIKER_TRAVELER", "CLERGY_ARTIST", "MEDIC_RESCUER", "BLOGGER_INFLUENCER", "FARMER_AGRO"];
      const archKey = pick(archKeys);
      const arch = TRAVELER_ARCHETYPES[archKey];
      let gender = "M";
      let age = randInt(24, 52);
      if (archKey === "GLAM_LADY") {
        gender = "F";
        age = randInt(21, 38);
      } else if (archKey === "PENSIONER") {
        gender = Math.random() < 0.5 ? "F" : "M";
        age = randInt(61, 76);
      } else if (archKey === "IT_VOLUNTEER" || archKey === "BLOGGER_INFLUENCER") {
        gender = Math.random() < 0.45 ? "F" : "M";
        age = randInt(20, 36);
      } else if (archKey === "MEDIC_RESCUER" || archKey === "CLERGY_ARTIST") {
        gender = Math.random() < 0.45 ? "F" : "M";
        age = randInt(26, 54);
      } else if (archKey === "MAJOR_VIP") {
        gender = Math.random() < 0.2 ? "F" : "M";
        age = randInt(27, 49);
      } else if (archKey === "BIKER_TRAVELER") {
        gender = Math.random() < 0.2 ? "F" : "M";
        age = randInt(24, 46);
      } else {
        gender = Math.random() < 0.14 ? "F" : "M";
        age = randInt(28, 56);
      }

      const dir = Math.random() < 0.65 ? "EXIT" : "ENTRY";
      const fullName = randomFullName(gender);
      const portrait = buildArchetypePortrait(archKey, gender);
      const trMeta = pickTransportForShapes(arch.shapes, city.code, daySpec && daySpec.twoWheelerBias);
      const cargo = pick(arch.cargos);
      const rawGreet = pick(arch.greetings);
      const greeting = L(rawGreet.uk.replace(/%CITY%/g, city.uk), rawGreet.en.replace(/%CITY%/g, city.en));
      const rawInterr = pick(arch.interrogations);
      const interrogationReply = L(rawInterr.uk.replace(/%CITY%/g, city.uk), rawInterr.en.replace(/%CITY%/g, city.en));
      const intimidateReply = pick(arch.intimidates);
      const rawCoffee = pick(arch.coffees);
      const coffeeReply = L(rawCoffee.uk.replace(/%CITY%/g, city.uk), rawCoffee.en.replace(/%CITY%/g, city.en));

      const extraDocs = [];
      if (daySpec.dailyRule === "MED_INSURANCE" && dir === "EXIT") {
        extraDocs.push({
          type: "EXEMPTION_CERT",
          title: L("🏥 САНІТАРНА СТРАХОВКА", "🏥 MEDICAL INSURANCE"),
          subtitle: L("Міжнародний поліс", "International Policy"),
          fields: [
            { label: L("Застрахований", "Insured"), value: fullName, disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L(`18.10.${randInt(2027, 2030)}`, `20${randInt(27, 30)}-10-18`), disc: null }
          ],
          sealText: L("МЕД-СТРАХ KRAINA • ДІЙСНИЙ", "MED-INSURE KRAINA • VALID"),
          sealDisc: null
        });
      } else if (daySpec.dailyRule === "TRANSIT_PERMIT" && dir === "EXIT") {
        extraDocs.push({
          type: "EXEMPTION_CERT",
          title: L("🛣️ ТРАНЗИТНИЙ ТАЛОН", "🛣️ TRANSIT PERMIT"),
          subtitle: L(`Маршрут з м. ${city.uk}`, `Route from ${city.en}`),
          fields: [
            { label: L("Водій / Пасажир", "Holder"), value: fullName, disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L(`25.11.${randInt(2027, 2030)}`, `20${randInt(27, 30)}-11-25`), disc: null }
          ],
          sealText: L("МІНТРАНС KRAINA • ДОЗВІЛ", "TRANSIT AUTH • VALID"),
          sealDisc: null
        });
      }
      let honestHasPassenger = false;
      if (dir === "EXIT" && gender === "M" && age >= 18 && age <= 60) {
        const reasons = archKey === "MAJOR_VIP"
          ? [
              L("Офіційне відрядження стратегічного інвестфонду", "Strategic Investment Mission Permit"),
              L("Бронювання керівного складу «Укр-Енерго-Люкс»", "Critical Executive Exemption")
            ]
          : (archKey === "WORKER_DRIVER"
            ? [
                L("Ліцензований водій міжнародних вантажів «Шлях»", "Licensed International Carrier Driver"),
                L("Бронювання критичної інфраструктури (енергетика)", "Critical Infrastructure Driver Exemption")
              ]
            : (trMeta.isCar
              ? [
                  L("Багатодітний батько (3 дітей до 18 років)", "Father of 3 minor children"),
                  L("Офіційне бронювання енергокомпанії «Кийград-Світло»", "Kyihrad Power Grid Critical Exemption"),
                  L("Супровід особи з інвалідністю І групи", "Accompanying 1st-degree disabled relative")
                ]
              : [
                  L("Багатодітний батько (3 дітей до 18 років)", "Father of 3 minor children"),
                  L("Офіційне бронювання енергокомпанії «Кийград-Світло»", "Kyihrad Power Grid Critical Exemption")
                ]));
        const chosenBasis = pick(reasons);
        const certFields = [
          { label: L("Особа", "Holder"), value: fullName, disc: null },
          { label: L("Підстава", "Basis"), value: chosenBasis, disc: null }
        ];
        if (chosenBasis.uk.includes("Багатодітний батько")) {
          const y1 = randInt(2010, 2013), y2 = randInt(2014, 2017), y3 = randInt(2018, 2021);
          certFields.push({ label: L("Діти (р.н.)", "Children (YoB)"), value: L(`${y1}, ${y2}, ${y3} (усі до 18 р.)`, `${y1}, ${y2}, ${y3} (all under 18)`), disc: null });
        } else if (chosenBasis.uk.includes("Супровід особи") && trMeta.isCar) {
          honestHasPassenger = true;
          certFields.push({ label: L("Присутність у салоні", "In Vehicle Cabin"), value: L("Підопічний присутній (МСЕК І гр.)", "Relative present in cabin"), disc: null });
        }
        extraDocs.push({
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L(`ЦНАП м. ${city.uk}`, `CNAP ${city.en}`),
          fields: certFields,
          sealText: L(`ЦНАП / ДПСК • ${city.uk.toUpperCase()}`, `CNAP / SBGS • VALID`),
          sealDisc: null
        });
      }
      if (daySpec.requireOblikQr && gender === "M" && age >= 18 && age <= 60) {
        extraDocs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }

      const giveTip = Math.random() < 0.35;
      return buildTravelerFromParts({
        fullName, age, gender, direction: dir, portrait, transport: trMeta,
        hasPassenger: honestHasPassenger,
        passportSub: L(`Серія ${city.code}-${randInt(100000, 999999)} • м. ${city.uk}`, `No. ${city.code}-${randInt(100000, 999999)} • ${city.en}`),
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Напрямок", "Direction"), value: dir === "EXIT" ? pick([
            L("ВИЇЗД → Поландія (КПП «Ягодин-Люкс»)", "EXIT → Polandia ('Yahodyn-Lux')"),
            L("ВИЇЗД → Карпатія (КПП «Тиса-Драйв»)", "EXIT → Karpatia ('Tysa-Drive')"),
            L("ВИЇЗД → Унія (КПП «Шегині-Спрінт»)", "EXIT → Unia ('Shehyni-Sprint')"),
            L("ВИЇЗД → Буковина (КПП «Порубне-Експрес»)", "EXIT → Bukovyna ('Porubne')"),
            L("ВИЇЗД → Молдавія (КПП «Паланка-Південь»)", "EXIT → Moldavia ('Palanka')")
          ]) : L(`В'ЇЗД → м. ${city.uk}`, `ENTRY → ${city.en}`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L(`${randInt(10, 28)}.0${randInt(1, 9)}.${randInt(2027, 2033)}`, `20${randInt(27, 33)}-0${randInt(1, 9)}-${randInt(10, 28)}`), disc: null }
        ],
        extraDocs,
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: cargo,
        greeting,
        interrogationReply,
        intimidateReply,
        coffeeReply,
        coffeeTip: giveTip ? 50 : 0,
        arrestFull: L("Ти заарештував абсолютно чесного мандрівника!", "Guards awkwardly detain an innocent traveler!"),
        arrestToned: L("Мандрівника помилково затримано.", "Innocent traveler detained."),
        shouldBeApproved: true
      });
    }

    // Fallback transport for violator schemes (refined per scheme below!)
    const trMeta = pickTransportForShapes(["SEDAN", "MINIBUS", "SUV", "RETRO", "PICKUP"], city.code, daySpec && daySpec.twoWheelerBias);

    // Procedural Violator (7 distinct schemes — zero text spoilers!)
    const dayNumber = daySpec ? daySpec.dayNumber : 1;
    const availSchemes = [0, 2, 3];
    if (dayNumber >= 2) availSchemes.push(1);
    if (daySpec.requireVehicleDecl) availSchemes.push(4, 5);
    if (daySpec.requireOblikQr) availSchemes.push(6);

    let scheme;
    if (Math.random() < 0.38) {
      scheme = 0;
    } else if (daySpec && daySpec.extraCloneChance && daySpec.requireVehicleDecl && Math.random() < 0.45) {
      scheme = 4;
    } else {
      const nonFormal = availSchemes.filter(s => s !== 0);
      scheme = pick(nonFormal.length ? nonFormal : availSchemes);
    }

    if (scheme === 0) {
      // Formal violation (requiresDetention: false — DENY or small bribe!):
      // Missing Daily Rule Doc (38% when MED_INSURANCE/TRANSIT_PERMIT), Girl/Elderly expired, Male no permit, OR adult-child / absent-guardian!
      const dailyMissingEligible = daySpec && (daySpec.dailyRule === "MED_INSURANCE" || daySpec.dailyRule === "TRANSIT_PERMIT");
      if (dailyMissingEligible && Math.random() < 0.38) {
        const gender = Math.random() < 0.45 ? "F" : "M";
        const age = gender === "F" ? randInt(22, 54) : pick([randInt(25, 48), randInt(62, 74)]);
        const fullName = randomFullName(gender);
        const s0Arch = gender === "F" ? pick(["GLAM_LADY", "MEDIC_RESCUER", "BLOGGER_INFLUENCER"]) : (age > 60 ? "PENSIONER" : pick(["WORKER_DRIVER", "IT_VOLUNTEER", "FARMER_AGRO"]));
        const portrait = buildArchetypePortrait(s0Arch, gender);
        const s0Tr = pickTransportForShapes(TRAVELER_ARCHETYPES[s0Arch].shapes, city.code, daySpec && daySpec.twoWheelerBias);
        const isMed = daySpec.dailyRule === "MED_INSURANCE";
        const missingLabel = isMed ? L("🏥 Санітарна страховка", "🏥 Medical Insurance") : L("🛣️ Транзитний талон", "🛣️ Transit Permit");
        const missingVal = isMed ? L("Відсутня (не оформлена)", "Missing (not issued)") : L("Відсутній (не оформлений)", "Missing (not issued)");
        const offerDailyBribe = Math.random() < 0.55;
        const dailyBribeObj = offerDailyBribe
          ? (Math.random() < 0.5
            ? { amount: randInt(7, 13) * 10, currency: "USD", requiresDiscovery: true, nabkRiskJump: 6, isStingTrap: false, syndicateFavor: false }
            : { amount: randInt(12, 22) * 100, currency: "UAH", requiresDiscovery: true, nabkRiskJump: 5, isStingTrap: false, syndicateFavor: false })
          : null;
        const dailyBribeStr = dailyBribeObj ? (dailyBribeObj.currency === "USD" ? `${dailyBribeObj.amount} 💵` : `${dailyBribeObj.amount} 🪙`) : "";
        const mExtraDocs = [];
        if (gender === "M" && age >= 18 && age <= 60) {
          mExtraDocs.push({
            type: "EXEMPTION_CERT",
            title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
            subtitle: L(`ЦНАП м. ${city.uk}`, `CNAP ${city.en}`),
            fields: [
              { label: L("Особа", "Holder"), value: fullName, disc: null },
              { label: L("Підстава", "Basis"), value: L("Офіційне бронювання критичної інфраструктури", "Critical Infrastructure Exemption"), disc: null }
            ],
            sealText: L(`ЦНАП / ДПСК • ${city.uk.toUpperCase()}`, "CNAP / SBGS • VALID"),
            sealDisc: null
          });
          if (daySpec.requireOblikQr) {
            mExtraDocs.push({
              type: "MILITARY_ID",
              title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
              subtitle: L("Цифровий реєстр", "Digital Registry"),
              fields: [
                { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
                { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
              ],
              sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
              sealDisc: null
            });
          }
        }
        return buildTravelerFromParts({
          fullName, age, gender, direction: "EXIT", portrait, transport: s0Tr,
          passportSub: L(`Серія ${city.code}-${randInt(100000, 999999)} • м. ${city.uk}`, `No. ${city.code}-${randInt(100000, 999999)}`),
          passportFields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("15.10.2030", "2030-10-15"), disc: null },
            { label: missingLabel, value: missingVal, disc: DISCREPANCY.MISSING_DAILY_DOC }
          ],
          extraDocs: mExtraDocs,
          includeDecl: daySpec.requireVehicleDecl,
          declaredCargo: L("Особисті речі, валізи", "Personal luggage"),
          greeting: L(
            `«Вітаю! Їду з м. ${city.uk} — паспорт є, усе гаразд... А хіба сьогодні ще якийсь додатковий папірець вимагають?»`,
            `'Hello! Traveling from ${city.en} — ID clean... Wait, do I really need that extra daily document today?'`
          ),
          interrogationReply: offerDailyBribe
            ? L(`«Та йой, не знав про новий указ дня! Ось ${dailyBribeStr} на каву — випустіть без того бланку!»`, `'Had no idea about today's decree! Take ${dailyBribeStr} and wave me through!'`)
            : L("«От халепа, ніхто не попередив про обов'язковий документ на сьогодні! Пропустіть по-людськи!»", "'Oh no, nobody warned me about today's extra document! Please let me pass!'"),
          intimidateReply: L("«*Хапається за папку* То це сьогоднішній указ?! Я просто забув оформити!»", "'*Checks folder* Forgot to get today's required permit!'"),
          coffeeReply: L("«Дякую за каву... може, закриєте очі на відсутній талон?»", "'Thanks for coffee... skip the missing permit?'"),
          arrestFull: L("За відсутність обов'язкового бланка дня достатньо було натиснути ✖ ВІДМОВИТИ!", "Should have pressed ✖ DENY for missing daily document!"),
          arrestToned: L("Перевищення сили — треба було ✖ ВІДМОВИТИ.", "Should have pressed DENY."),
          bribeOffer: dailyBribeObj,
          shouldBeApproved: false,
          violations: [DISCREPANCY.MISSING_DAILY_DOC]
        });
      }

      const rollType = Math.random();
      const isGirl = rollType < 0.28;
      const isOldMan = !isGirl && rollType < 0.52;
      const isParentOrGuardianFraud = !isGirl && !isOldMan && rollType < 0.76;
      const isAdultChildFraud = isParentOrGuardianFraud && Math.random() < 0.5;
      const gender = isGirl ? "F" : "M";
      const fullName = randomFullName(gender);
      const age = isOldMan ? randInt(62, 76) : randInt(24, 49);
      const scheme0Arch = isGirl ? "GLAM_LADY" : (isOldMan ? "PENSIONER" : pick(["WORKER_DRIVER", "IT_VOLUNTEER", "FARMER_AGRO"]));
      const portrait = buildArchetypePortrait(scheme0Arch, gender);
      const carOnlyPool = TRANSPORT_CATALOG.filter(m => m.isCar && TRAVELER_ARCHETYPES[scheme0Arch].shapes.includes(m.shape));
      const scheme0Tr = isParentOrGuardianFraud
        ? makeTransportMeta(pick(carOnlyPool.length ? carOnlyPool : TRANSPORT_CATALOG.filter(m => m.isCar)), null, generatePlate(city.code, true))
        : pickTransportForShapes(TRAVELER_ARCHETYPES[scheme0Arch].shapes, city.code, daySpec && daySpec.twoWheelerBias);
      const isExpired = !isParentOrGuardianFraud && (isGirl || isOldMan || Math.random() < 0.55);
      const disc = isParentOrGuardianFraud
        ? (isAdultChildFraud ? DISCREPANCY.CHILDREN_AGE_FRAUD : DISCREPANCY.GUARDIAN_NO_PASSENGER)
        : (isExpired ? DISCREPANCY.EXPIRED_DATE : DISCREPANCY.AGE_RESTRICTION_NO_PERMIT);
      const expYear = pick(["2019", "2020", "2021"]);
      const offersSmallBribe = Math.random() < 0.55;
      const smallBribeObj = offersSmallBribe
        ? (Math.random() < 0.5
          ? { amount: randInt(7, 14) * 10, currency: "USD", requiresDiscovery: true, nabkRiskJump: 6, isStingTrap: false, syndicateFavor: false }
          : { amount: randInt(12, 24) * 100, currency: "UAH", requiresDiscovery: true, nabkRiskJump: 5, isStingTrap: false, syndicateFavor: false })
        : null;
      const bribeDisplayStr = smallBribeObj
        ? (smallBribeObj.currency === "USD" ? `${smallBribeObj.amount} 💵` : `${smallBribeObj.amount} 🪙`)
        : "";
      const s0ExtraDocs = isParentOrGuardianFraud ? [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
        subtitle: L(`ЦНАП м. ${city.uk}`, `CNAP ${city.en}`),
        fields: isAdultChildFraud ? [
          { label: L("Особа", "Holder"), value: fullName, disc: null },
          { label: L("Підстава", "Basis"), value: L("Багатодітний батько (3 дітей до 18 років)", "Father of 3 minor children"), disc: null },
          { label: L("Діти (р.н.)", "Children (YoB)"), value: L("2004 (22 р.), 2013, 2017", "2004 (22 y/o), 2013, 2017"), disc: DISCREPANCY.CHILDREN_AGE_FRAUD }
        ] : [
          { label: L("Особа", "Holder"), value: fullName, disc: null },
          { label: L("Підстава", "Basis"), value: L("Супровід особи з інвалідністю І групи", "Accompanying 1st-degree disabled relative"), disc: null },
          { label: L("Присутність у салоні", "In Vehicle Cabin"), value: L("Водій їде САМ (підопічний відсутній)", "Driver ALONE (relative absent)"), disc: DISCREPANCY.GUARDIAN_NO_PASSENGER }
        ],
        sealText: L(`ЦНАП / ДПСК • ${city.uk.toUpperCase()}`, `CNAP / SBGS • VALID`),
        sealDisc: null
      }] : [];
      return buildTravelerFromParts({
        fullName, age, gender, direction: "EXIT", portrait, transport: scheme0Tr,
        hasPassenger: false,
        passportSub: L(`Серія ${city.code}-${randInt(100000, 999999)} • м. ${city.uk}`, `No. ${city.code}-${randInt(100000, 999999)}`),
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: null },
          isParentOrGuardianFraud
            ? { label: L("Дійсний до", "Valid Until"), value: L("19.08.2030", "2030-08-19"), disc: null }
            : (isExpired
              ? { label: L("Дійсний до", "Valid Until"), value: L(`03.05.${expYear}`, `${expYear}-05-03`), disc }
              : { label: L("Відстрочка 18–60", "Exit Permit"), value: L("Без оформленої підстави", "None submitted"), disc })
        ],
        extraDocs: s0ExtraDocs,
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: isOldMan ? L("Домашня консервація, плед", "Homemade jars, blanket") : L("Валізи, одяг", "Suitcases, clothes"),
        greeting: isParentOrGuardianFraud
          ? (isAdultChildFraud
            ? L("«Добрий день! Маю трьох дітей, усе офіційно — ось посвідчення!»", "'Good day! Father of 3 kids, all official — check my permit!'")
            : L("«Вітаю! Везу... тобто їду забирати маму з інвалідністю прямо за кордоном, вона там чекає!»", "'Hello! Driving to... pick up my disabled mom waiting just across the border!'"))
          : (isGirl
            ? L(`«Привіт! Ой, так спізнилась на автобус у Варшавку з м. ${city.uk}... гляньте швиденько!»`, `'Hi! Running late for my bus from ${city.en}... quick check please!'`)
            : (isOldMan
              ? L(`«Доброго здоров'я, синку! Дід їде до онуків з м. ${city.uk}, усе по-старому!»`, `'Good health, son! Grandpa heading to visit grandkids from ${city.en}!'`)
              : (isExpired
                ? L(`«Ой, добрий день! Так поспішали з м. ${city.uk} на рейс до Варшавки!»`, `'Hello! Rushing from ${city.en} for Varshavka!'`)
                : L("«Добрий день! Їду на тиждень, думав, по біометричному без довідки пускають!»", "'Good day! Thought biometric passport was enough without a permit!'")))),
        interrogationReply: offersSmallBribe
          ? (isParentOrGuardianFraud
            ? (isAdultChildFraud
              ? L(`«Та старшому тільки виповнилося, тиснути на серце не треба! Ось ${bribeDisplayStr} — не присікуйся до року народження!»`, `'Oldest just turned 18! Here is ${bribeDisplayStr} — ignore the birth year!'`)
              : L(`«Мама вже на тій стороні на вокзалі! Візьми ${bribeDisplayStr} — я миттю туди й назад!»`, `'Mom is waiting across the gate! Take ${bribeDisplayStr} — quick round trip!'`))
            : (isGirl
              ? L(`«Ой, серйозно прострочений?! Ну не розвертайте мене! Ось ${bribeDisplayStr} на каву з круасаном — не помічайте дату!»`, `'Seriously expired?! Don't turn me back! Here is ${bribeDisplayStr} for coffee — ignore the date!'`)
              : (isOldMan
                ? L(`«От халепа, старий забув оновити! Візьми, синку, ${bribeDisplayStr} на бензин і пропусти діда!»`, `'Darn, forgot to renew! Take ${bribeDisplayStr} for gas and let grandpa pass!'`)
                : L(`«Та йой, дрібна формальність! Тримай ${bribeDisplayStr} зверху — не псуй людям поїздку!»`, `'Just a small slip! Take ${bribeDisplayStr} — don't ruin the trip!'`))))
          : L("«Будь ласка, пане інспекторе! По-доброму прошу — квитки згоряють, пропустіть по-людськи!»", "'Please, Inspector! Asking kindly — our tickets expire, let us through!'"),
        intimidateReply: L("«*Нервово ковтає* Та це ж дрібна формальність у паперах, не кличте СБК!»", "'*Gulps* It's just a paperwork slip, don't call SBK!'"),
        coffeeReply: L("«Дякую за каву... будь ласка, увійдіть у становище!»", "'Thanks for the coffee... please understand my situation!'"),
        arrestFull: L("Ти викликав спецназ за формальну помилку — достатньо було натиснути ✖ ВІДМОВИТИ!", "Overkill! A simple DENY stamp was required."),
        arrestToned: L("Перевищення сили — треба було ✖ ВІДМОВИТИ.", "Should have pressed DENY."),
        bribeOffer: smallBribeObj,
        shouldBeApproved: false,
        violations: [disc]
      });
    }

    if (scheme === 1) {
      // Fake issuer seal (diverse archetypes so it's never obvious!)
      const s1Arch = pick(["MAJOR_VIP", "WORKER_DRIVER", "IT_VOLUNTEER", "BLOGGER_INFLUENCER", "FARMER_AGRO"]);
      const fullName = randomFullName("M");
      const age = randInt(24, 48);
      const portrait = Object.assign(buildArchetypePortrait(s1Arch, "M"), { scarOrDetail: 2, expression: 2 });
      const s1Tr = pickTransportForShapes(TRAVELER_ARCHETYPES[s1Arch].shapes, city.code, false);
      const fakes = [
        { diag: L("Гострий карієс переднього зуба", "Acute toothache"), clinic: L("Стоматологія «Веселий Зуб»", "Dental 'Happy Tooth'") },
        { diag: L("Психосоматична алергія на зелену фарбу", "Green pigment allergy"), clinic: L("Студія краси «Нігтики Левгорода»", "Beauty Salon") },
        { diag: L("Денний бакалавр магії та тарології", "Bachelor of Tarot Studies"), clinic: L("Академія Крипти і Гороскопів", "Tarot & Crypto Academy") },
        { diag: L("Плоскостопість за висновком кінолога", "Flat feet per dog groomer"), clinic: L("Ветклініка «Пухнастий Хвіст»", "Vet Clinic 'Fluffy Tail'") },
        { diag: L("Станція техобслуговування", "Critical auto washing"), clinic: L("Автомийка «Піна-Люкс Офшорія»", "Carwash 'Foam-Lux'") },
        { diag: L("Спадковий маг 7-го рівня", "7th-tier hereditary mage"), clinic: L("Інститут Астрології і Чакр", "Astrology & Chakra Inst.") },
        { diag: L("Критичний дегустатор шаурми", "Critical shawarma taster"), clinic: L("Мережа «Лаваш-Імперія»", "Lavash Empire LLC") },
        { diag: L("Курси підвищення кваліфікації в Мальдівах", "Maldives upskilling course"), clinic: L("Турфірма «Втеча-Люкс»", "Travel Agency 'Escape-Lux'") },
        { diag: L("Хронічна непереносимість черг", "Chronic queue intolerance"), clinic: L("Масажний салон «Тай-Блаженство»", "Spa 'Thai-Bliss'") }
      ];
      const fc = pick(fakes);
      const offerBribe1 = Math.random() < 0.5;
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: s1Tr,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ЧОЛ`, `${age} y/o • M`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("12.09.2029", "2029-09-12"), disc: null }
        ],
        extraDocs: [{
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L("Медичний / освітній висновок", "Medical / Academic Permit"),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Підстава", "Basis"), value: fc.diag, disc: null },
            { label: L("Ким видано", "Issued By"), value: fc.clinic, disc: DISCREPANCY.FAKE_ISSUER_SEAL }
          ],
          sealText: fc.clinic,
          sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
        }],
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: L("Спортивна сумка, одяг", "Gym bag, clothes"),
        greeting: L("«Вітаю! Ось свіженька довідка з круглою мокрою печаткою!»", "'Hello! Fresh exemption certificate with a wet round seal!'"),
        interrogationReply: offerBribe1
          ? L("«Ну... в Телеграмі порадили! Візьми 250 💵 у конверті — печатку ж ніхто не роздивиться!»", "'Bought it online! Take 250 💵 — nobody inspects the seal!'")
          : L("«Клянусь, мені цю довідку юрист пообіцяв як офіційну! Пропустіть по-доброму, я сам став жертвою!»", "'I swear a lawyer told me this was valid! Please let me pass, I was scammed!'"),
        intimidateReply: L("«*Виступає піт* Та директор клініки клявся, що довідка справжня!»", "'*Sweats* The clinic swore it was real!'"),
        coffeeReply: L("«Дякую за каву... тільки під УФ-лампу цю довідку не суньте, вона... екологічна!»", "'Thanks for coffee... please keep it out of UV light!'"),
        arrestFull: L("Власника липової довідки затримано за використання підробленої печатки!", "Forged seal user arrested!"),
        arrestToned: L("Порушника з фіктивною печаткою затримано.", "Forged seal traveler detained."),
        bribeOffer: offerBribe1 ? { amount: 250, currency: "USD", requiresDiscovery: true, nabkRiskJump: 8, isStingTrap: false, syndicateFavor: false } : null,
        shouldBeApproved: false,
        violations: [DISCREPANCY.FAKE_ISSUER_SEAL]
      });
    }

    if (scheme === 2) {
      // Visual PHOTO_MISMATCH (diverse archetypes!)
      const s2Arch = pick(["GLAM_LADY", "WORKER_DRIVER", "BLOGGER_INFLUENCER", "PENSIONER", "CLERGY_ARTIST"]);
      const gender = s2Arch === "GLAM_LADY" ? "F" : (Math.random() < 0.5 ? "F" : "M");
      const fullName = randomFullName(gender);
      const age = s2Arch === "PENSIONER" ? randInt(61, 74) : randInt(25, 50);
      const realPortrait = buildArchetypePortrait(s2Arch, gender);
      const s2Tr = pickTransportForShapes(TRAVELER_ARCHETYPES[s2Arch].shapes, city.code, false);
      const oppositeGender = gender === "F" ? "M" : "F";
      const fakePhoto = randomPortrait(oppositeGender);
      fakePhoto.hairColor = (realPortrait.hairColor + 2) % 5;
      fakePhoto.facialHair = oppositeGender === "M" ? 4 : 0;
      const offerBribe2 = Math.random() < 0.45;
      return buildTravelerFromParts({
        fullName, age, gender,
        portrait: realPortrait,
        passportPortrait: fakePhoto,
        transport: s2Tr,
        passportFields: [
          { label: L("ПІБ (звірте фото!)", "Full Name (verify photo)"), value: fullName, disc: DISCREPANCY.PHOTO_MISMATCH },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("21.12.2030", "2030-12-21"), disc: null }
        ],
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: L("Особисті речі", "Personal effects"),
        greeting: L("«Добрий день! Ось мій паспорт... я трохи змінився за останній рік після відпустки.»", "'Hello! Here is my passport... I look a bit different since last summer.'"),
        interrogationReply: offerBribe2
          ? L("«Ну взяв паспорт родича, бо свій загубив! Візьми 400 💵 і закрий очі!»", "'Borrowed a relative's passport! Take 400 💵!'")
          : L("«Будь ласка, свій паспорт згорів у пожежі, узяв документ брата/сестри! Зрозумійте по-людськи!»", "'Please, my own passport burned, I took my sibling's! Have mercy!'"),
        intimidateReply: L("«*Очі бігають* Та пластична операція! Хто тепер у фото дивиться?!»", "'*Eyes dart* Had a makeover! Who even checks photos?!'"),
        coffeeReply: L("«Дякую за каву... перегорніть сторінку швидше!»", "'Thanks... please flip the passport page!'"),
        arrestFull: L("Підміна особи викрита — чужий паспорт вилучено, а водія затримано!", "Passport impersonation busted!"),
        arrestToned: L("Використано чужий документ — затримано.", "Stolen ID detained."),
        bribeOffer: offerBribe2 ? { amount: 400, currency: "USD", requiresDiscovery: true, nabkRiskJump: 10, isStingTrap: false, syndicateFavor: false } : null,
        shouldBeApproved: false,
        violations: [DISCREPANCY.PHOTO_MISMATCH]
      });
    }

    if (scheme === 3) {
      // NAME_MISMATCH across Passport vs Exemption / Customs
      const s3Arch = pick(["WORKER_DRIVER", "MAJOR_VIP", "FARMER_AGRO", "IT_VOLUNTEER", "MEDIC_RESCUER"]);
      const fullName = randomFullName("M");
      const otherName = randomFullName("M");
      const age = randInt(26, 48);
      const portrait = buildArchetypePortrait(s3Arch, "M");
      const s3Tr = pickTransportForShapes(TRAVELER_ARCHETYPES[s3Arch].shapes, city.code, false);
      const offerBribe3 = Math.random() < 0.4;
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: s3Tr,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ЧОЛ`, `${age} y/o • M`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("14.07.2030", "2030-07-14"), disc: null }
        ],
        extraDocs: [{
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L(`ЦНАП м. ${city.uk}`, `CNAP ${city.en}`),
          fields: [
            { label: L("Особа", "Holder"), value: otherName, disc: DISCREPANCY.NAME_MISMATCH },
            { label: L("Підстава", "Basis"), value: L("Опікунство над родичем І групи", "Legal guardian permit"), disc: null }
          ],
          sealText: L("ЦНАП • ДІЙСНИЙ", "CNAP • VALID"),
          sealDisc: null
        }],
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: L("Ліки, валіза", "Medicine, suitcase"),
        greeting: L("«Добрий день! Довідку зробили прямо перед виїздом — усе легально!»", "'Hello! Permit issued right before departure — all legal!'"),
        interrogationReply: offerBribe3
          ? L("«Тьфу, в друкарні прізвище переплутали! Бери 300 💵, не присікуйся!»", "'Damn, typo in the name! Take 300 💵 and let me roll!'")
          : L("«Вибачте, у ЦНАП помилково вписали інше прізвище! Пропустіть по-доброму, я звичайний водій!»", "'Sorry, clerk made a typo in my surname! Please let me pass, just a regular driver!'"),
        intimidateReply: L("«*Тремтить* Це... це подвійне прізвище! Чи кума...»", "'*Stammers* It's my... second surname!'"),
        coffeeReply: L("«Спасибі за каву... і прізвище не звіряйте сильно, гаразд?»", "'Thanks... no need to compare surnames closely!'"),
        arrestFull: L("Чужа куплена довідка викрита — афериста пакує контррозвідка!", "Mismatched documents seized!"),
        arrestToned: L("Виявлено розбіжність ПІБ у документах.", "Name mismatch detained."),
        bribeOffer: offerBribe3 ? { amount: 300, currency: "USD", requiresDiscovery: true, nabkRiskJump: 8, isStingTrap: false, syndicateFavor: false } : null,
        shouldBeApproved: false,
        violations: [DISCREPANCY.NAME_MISMATCH]
      });
    }

    if (scheme === 4 && daySpec.requireVehicleDecl) {
      // VEHICLE_MISMATCH: realistic mismatch — Plate (35%), Color (35%), or Same-Class Model (30%)!
      const s4Arch = pick(["WORKER_DRIVER", "MAJOR_VIP", "GLAM_LADY", "BIKER_TRAVELER", "FARMER_AGRO"]);
      const gender = s4Arch === "GLAM_LADY" ? "F" : (Math.random() < 0.35 ? "F" : "M");
      const fullName = randomFullName(gender);
      const age = randInt(25, 52);
      const portrait = buildArchetypePortrait(s4Arch, gender);

      const s4Cars = TRANSPORT_CATALOG.filter(m => m.isCar && TRAVELER_ARCHETYPES[s4Arch].shapes.includes(m.shape));
      const carOnly = pick(s4Cars.length ? s4Cars : TRANSPORT_CATALOG.filter(m => m.isCar));
      const realCol = pick(VEHICLE_COLORS);
      const realPlate = generatePlate(city.code, true);
      const realTr = makeTransportMeta(carOnly, realCol, realPlate);

      const mismatchKind = pick(["PLATE", "COLOR", "MODEL"]);
      let fakeModelName = null;
      let fakeColorName = null;
      let fakePlate = null;
      let greetMsg, interrMsg;

      if (mismatchKind === "PLATE") {
        fakePlate = generatePlate(pick(CITIES).code, true);
        if (fakePlate === realPlate) fakePlate = "КГ 9941 ВХ";
        greetMsg = L("«Вітаю, інспекторе! Переганяю авто після перереєстрації, усе на місці!»", "'Greetings! Driving after re-registration, everything is in order!'");
        interrMsg = L("«Та в МРЕО одну літеру на номерах переплутали! Пропустіть, будь ласка!»", "'DMV mixed up a digit on the plate! Please let me pass!'");
      } else if (mismatchKind === "COLOR") {
        const otherCols = VEHICLE_COLORS.filter(c => c.id !== realCol.id);
        fakeColorName = pick(otherCols).name;
        greetMsg = L("«Добрий день! Машина після свіжого детейлінгу — на світлі колір трохи грає!»", "'Good day! Fresh detailing — the paint shifts shade in the light!'");
        interrMsg = L("«Слухай, на СТО перефарбували вчора й не вписали в техпаспорт!»", "'Repainted it at the shop yesterday and forgot to update the title!'");
      } else {
        const sameClass = TRANSPORT_CATALOG.filter(m => m.isCar && m.shape === carOnly.shape && m.name.uk !== carOnly.name.uk);
        const fakeCar = sameClass.length ? pick(sameClass) : pick(TRANSPORT_CATALOG.filter(m => m.isCar && m.name.uk !== carOnly.name.uk));
        fakeModelName = fakeCar.name;
        greetMsg = L("«Вітаю! Ось техпаспорт на авто, усе перевіряли перед виїздом!»", "'Hello! Here is the car registration, checked before departure!'");
        interrMsg = L("«Ой, переплутав техпаспорт із другою машиною брата в гаражі!»", "'Oops, grabbed my brother's similar car registration from the garage!'");
      }

      const offersSeriousBribe4 = Math.random() < 0.45;
      const bribe4Amt = randInt(5, 8) * 100;
      if (offersSeriousBribe4) {
        interrMsg = L(`«Тихіше, інспекторе... тачка «гаряча», візьми ${bribe4Amt.toLocaleString("en-US")} 💵 і забудь про техпаспорт!»`, `'Easy, inspector... car is hot, take ${bribe4Amt.toLocaleString("en-US")} 💵 and forget the title!'`);
      }

      return buildTravelerFromParts({
        fullName, age, gender, portrait, transport: realTr,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("08.11.2029", "2029-11-08"), disc: null }
        ],
        extraDocs: (gender === "M") ? [{
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L("Державна служба", "State Service"),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Підстава", "Basis"), value: L("Робота водієм міжнародних рейсів", "International Driver"), disc: null }
          ],
          sealText: L("ДПСК / ОВА • ПЕРЕВІРЕНО", "SBGS / ADMIN"),
          sealDisc: null
        }] : [],
        includeDecl: true,
        fakeModelName,
        fakeColorName,
        fakePlate,
        vehMismatchDisc: DISCREPANCY.VEHICLE_MISMATCH,
        declaredCargo: L("Особисті речі водія", "Driver personal luggage"),
        vehicleSearchResult: L("Звірка VIN-коду: номери перебито болгаркою! Автомобіль у розшуку Інтерполу як «двійник»!", "VIN Check: Grinder marks on chassis! Stolen cloned car!"),
        greeting: greetMsg,
        interrogationReply: interrMsg,
        intimidateReply: L("«*Різко закриває вікно наполовину* Це... це помилка бази сервісного центру!»", "'*Rolls window halfway up* It's... a registry typo!'"),
        coffeeReply: L("«Дякую! Гаряча кава краще за будь-яке СТО!»", "'Thanks! Better than any mechanic!'"),
        arrestFull: L("Авто-двійника з перебитими номерами конфісковано, водія затримано!", "Cloned vehicle confiscated and driver arrested!"),
        arrestToned: L("Виявлено невідповідність транспорту техпаспорту.", "Vehicle mismatch detained."),
        bribeOffer: offersSeriousBribe4 ? { amount: bribe4Amt, currency: "USD", requiresDiscovery: true, nabkRiskJump: 10, isStingTrap: false, syndicateFavor: false } : null,
        shouldBeApproved: false,
        violations: [DISCREPANCY.VEHICLE_MISMATCH]
      });
    }

    if (scheme === 5 && daySpec.requireVehicleDecl) {
      // CONTRABAND_CARGO hidden behind plausible declaration (diverse archetypes: driver, farmer, VIP, artist!)
      const s5Arch = pick(["WORKER_DRIVER", "FARMER_AGRO", "MAJOR_VIP", "CLERGY_ARTIST"]);
      const fullName = randomFullName("M");
      const age = randInt(28, 54);
      const portrait = buildArchetypePortrait(s5Arch, "M");
      const cCase = pick(CONTRABAND_COVERS);
      const s5Pool = TRANSPORT_CATALOG.filter(m => m.isCar && TRAVELER_ARCHETYPES[s5Arch].shapes.includes(m.shape));
      const carOnlyMeta = makeTransportMeta(pick(s5Pool.length ? s5Pool : TRANSPORT_CATALOG.filter(m => m.isCar)), null, generatePlate(city.code, true));
      const smugglerGreets = [
        L(`«Салют, шефе! Звичайні речі з м. ${city.uk}, усе по декларації!»`, `'Hello boss! Ordinary cargo from ${city.en}, all declared!'`),
        L(`«Добрий вечір, командире! Везем запчастини та речі в Поландію, поспішаємо на паром!»`, `'Good evening! Hauling spare parts & luggage, rushing for the ferry!'`),
        L(`«Вітаю, інспекторе! Перевіряйте папери — я вже третю годину в черзі стою!»`, `'Hi inspector! Check the papers, been waiting in line for three hours!'`),
        L(`«Здоровенькі були! З м. ${city.uk} на ярмарок везу товар, усе чисто і по чеках!»`, `'Greetings! Taking market goods from ${city.en}, all receipts clean!'`),
        L(`«Та там нічого цікавого — коробки, ганчір'я, особисті речі. Пропускайте!»`, `'Nothing interesting back there — just boxes and rags. Wave me through!'`),
        L(`«Спокійної зміни, пане офіцере! Усе заповнено як треба, без затримок!»`, `'Quiet shift, officer! Everything is filled out properly!'`)
      ];
      const smugglerInterrogations = [
        L("«Навіщо пса кликати, він мені сумки подряпає! Домовимось по-тихому!»", "'No need for the sniffer dog, it scratches my bags! Let's settle quietly!'"),
        L("«Слухай, у мене під обшивкою делікатний товар... може не будемо будити Бавовну?»", "'Listen, fragile cargo inside... let's not wake the sniffer dog, okay?'"),
        L("«Та які перевірки вночі? Давай я краще віддячу за швидке оформлення!»", "'Why inspect at night? Let me thank you for fast clearance instead!'"),
        L("«Тихіше, інспекторе... там у багажнику дещо не для протоколу. Поговоримо по-діловому?»", "'Quiet, inspector... something off-record in the trunk. Talk business?'"),
        L("«Ех, бачу ти окатий... скільки коштує закрити очі на один багажник?»", "'Ah, sharp eyes... what does it cost to skip the trunk check?'")
      ];
      const smugglerIntimidates = [
        L("«*Здригнувся, коли пес підійшов* Заберіть «Бавовну» від багажника!»", "'*Flinches as dog nears* Keep Bavovna away from the trunk!'"),
        L("«*Нервово стискає кермо* Не треба лізти в обшивку, я скаргу на гарячу лінію напишу!»", "'*Grips wheel nervously* Don't touch the lining, I will complain!'"),
        L("«*Пітніє* Там усе заварено з заводу, немає чого туди світити!»", "'*Sweating* It is factory-welded, nothing to see there!'"),
        L("«*Озирається на пса* У мене алергія на собак, відведіть його!»", "'*Glances at dog* I am allergic to dogs, take it away!'")
      ];
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: carOnlyMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ЧОЛ`, `${age} y/o • M`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("24.08.2030", "2030-08-24"), disc: null }
        ],
        extraDocs: [{
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L("Комерційні перевезення", "Commercial Cargo"),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Підстава", "Basis"), value: L("Ліцензійний перевізник", "Licensed Carrier"), disc: null }
          ],
          sealText: L("УКРТРАНС • ДІЙСНИЙ", "UKTRANS • VALID"),
          sealDisc: null
        }],
        includeDecl: true,
        declaredCargo: cCase.decl,
        vehicleSearchResult: cCase.found,
        greeting: pick(smugglerGreets),
        interrogationReply: pick(smugglerInterrogations),
        intimidateReply: pick(smugglerIntimidates),
        coffeeReply: L("«Дякую... а собака вашу каву любить? Може, заберете її в будку?»", "'Thanks... keep your dog inside with the coffee, okay?'"),
        arrestFull: L("Контрабандиста взято на гарячому за допомогою пса «Бавовни»!", "Smuggler busted red-handed by sniffer dog Bavovna!"),
        arrestToned: L("Вилучено контрабандний вантаж.", "Contraband cargo seized."),
        hasContraband: true,
        bribeOffer: { amount: cCase.bribeAmount, currency: cCase.currency, requiresDiscovery: true, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.CONTRABAND_CARGO]
      });
    }

    if (scheme === 6 && daySpec.requireOblikQr) {
      // INVALID_QR_CODE (Oblik+)
      const fullName = randomFullName("M");
      const age = randInt(23, 50);
      const portrait = randomPortrait("M");
        const offerBribe6 = Math.random() < 0.5;
        return buildTravelerFromParts({
          fullName, age, gender: "M", portrait, transport: trMeta,
          passportFields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ЧОЛ`, `${age} y/o • M`), disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("05.05.2030", "2030-05-05"), disc: null }
          ],
          extraDocs: [
            {
              type: "EXEMPTION_CERT",
              title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
              subtitle: L("Державна установа", "State Authority"),
              fields: [
                { label: L("Особа", "Holder"), value: fullName, disc: null },
                { label: L("Підстава", "Basis"), value: L("Бронювання підприємства", "Enterprise Exemption"), disc: null }
              ],
              sealText: L("ЦНАП / ДПСК", "CNAP / SBGS"),
              sealDisc: null
            },
            {
              type: "MILITARY_ID",
              title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
              subtitle: L("Цифровий реєстр", "Digital Registry"),
              fields: [
                { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
                { label: L("Статус QR", "QR Status"), value: L("QR-ERR-409 • ВІЙСЬКОВИЙ РОЗШУК", "QR-ERR-409 • REGISTRY WANTED"), disc: DISCREPANCY.INVALID_QR_CODE }
              ],
              sealText: L("ЗБОЙ СИНХРОНІЗАЦІЇ", "SYNC FAILED"),
              sealDisc: DISCREPANCY.INVALID_QR_CODE
            }
          ],
          includeDecl: daySpec.requireVehicleDecl,
          declaredCargo: L("Рюкзак, документи", "Backpack"),
          greeting: L("«Добрий день! З телефоном щось глючить — але ось паперова довідка, чесно!»", "'Hello! Phone app is glitching — but here is my paper permit!'"),
          interrogationReply: offerBribe6
            ? L("«Та то база Облік+ зависла! Ось 350 💵 — не натискай 🚨 АРЕШТ!»", "'The Oblik+ server must be down! Take 350 💵 — don't press 🚨 DETAIN!'")
            : L("«Це помилка сервера Облік+, клянусь! У мене ж паперова довідка на руках — пропустіть по-доброму!»", "'It's an Oblik+ server glitch, I swear! Look at my paper permit — please!'"),
          intimidateReply: L("«*Різко ховає телефон у кишеню* Батарея сіла, нічого сканувати!»", "'*Hides phone* Battery died, can't scan!'"),
          coffeeReply: L("«О, дякую... ви тільки інтернет на планшеті вимкніть!»", "'Thanks... maybe turn off tablet Wi-Fi!'"),
          arrestFull: L("Реєстр «Облік+» підтвердив статус у розшуку — порушника передано групі реагування!", "Oblik+ confirmed wanted status — detained!"),
          arrestToned: L("Затримано за недійсним кодом у реєстрі «Облік+».", "Detained for wanted Oblik+ code."),
          bribeOffer: offerBribe6 ? { amount: 350, currency: "USD", requiresDiscovery: true, nabkRiskJump: 9, isStingTrap: false, syndicateFavor: false } : null,
        shouldBeApproved: false,
        violations: [DISCREPANCY.INVALID_QR_CODE]
      });
    }

    return Math.random() < 0.5 ? createMicrochipSmuggler() : createArtillerySpotter();
  }

  const FOREIGN_COUNTRIES = [
    { name: L("Франція-Люкс", "Francia-Lux"), code: "FRL", car: L("«Рено-Люкс Меган»", "'Reno-Lux Megan'"), namesM: [L("П'єр Дюваль", "Pierre Duval"), L("Жан-Люк Моро", "Jean-Luc Moreau")], namesF: [L("Софі Лоран", "Sophie Laurent"), L("Клер Дюпон", "Claire Dupont")] },
    { name: L("Поландія", "Polandia"), code: "PLD", car: L("«Шкода-Варшава»", "'Shkoda-Varshava'"), namesM: [L("Марек Ковальський", "Marek Kowalski"), L("Пьотр Новак", "Piotr Nowak")], namesF: [L("Агнєшка Зелінська", "Agnieszka Zielinska"), L("Кася Войцік", "Kasia Wojcik")] },
    { name: L("Германія-Штос", "Germania-Shtos"), code: "GRS", car: L("«Фолькс Гольф-Берлін»", "'Folks Golf-Berlin'"), namesM: [L("Ганс Вебер", "Hans Weber"), L("Лукас Мюллер", "Lukas Muller")], namesF: [L("Ханна Шмідт", "Hannah Schmidt"), L("Емма Бекер", "Emma Becker")] },
    { name: L("Британіка", "Britanika"), code: "BRT", car: L("«Ленд Ровер-Лондон»", "'Land Rover-London'"), namesM: [L("Олівер Сміт", "Oliver Smith"), L("Джеймс Браун", "James Brown")], namesF: [L("Емілі Кларк", "Emily Clark"), L("Шарлотта Тейлор", "Charlotte Taylor")] },
    { name: L("Карпатія", "Karpatia"), code: "KRP", car: L("«Сузукі-Тиса»", "'Suzuki-Tysa'"), namesM: [L("Ласло Ковач", "Laszlo Kovacs"), L("Золтан Надь", "Zoltan Nagy")], namesF: [L("Ілона Тот", "Ilona Toth"), L("Аніко Варга", "Aniko Varga")] }
  ];

  function createForeignTraveler() {
    const fc = pick(FOREIGN_COUNTRIES);
    const isDualCitizen = Math.random() < 0.34;
    const gender = isDualCitizen ? "M" : (Math.random() < 0.52 ? "F" : "M");
    const age = isDualCitizen ? randInt(24, 52) : randInt(21, 68);
    const fullName = isDualCitizen
      ? randomFullName("M")
      : (gender === "F" ? pick(fc.namesF) : pick(fc.namesM));
    const portrait = randomPortrait(gender);
    const trMeta = makeTransportMeta({ shape: Math.random() < 0.5 ? "SEDAN" : "SUV", name: fc.car, isCar: true }, null, `${fc.code} ${randInt(1000, 9999)}`);
    const dir = isDualCitizen ? "EXIT" : (Math.random() < 0.5 ? "ENTRY" : "EXIT");

    if (!isDualCitizen) {
      return buildTravelerFromParts({
        fullName, age, gender, direction: dir, portrait, transport: trMeta,
        hasPassenger: false,
        passportTitle: L(`ПАСПОРТ: ${fc.name.uk.toUpperCase()}`, `PASSPORT: ${fc.name.en.toUpperCase()}`),
        passportSub: L(`Іноземний громадянин • ${fc.code}-${randInt(10000, 99999)}`, `Foreign Citizen • ${fc.code}-${randInt(10000, 99999)}`),
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Громадянство", "Citizenship"), value: fc.name, disc: null },
          { label: L("Напрямок", "Direction"), value: dir === "EXIT" ? L(`ВИЇЗД → ${fc.name.uk}`, `EXIT → ${fc.name.en}`) : L("В'ЇЗД → Kraina (Волонтер/Гість)", "ENTRY → Kraina (Guest)"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("15.09.2031", "2031-09-15"), disc: null }
        ],
        passportSeal: L(`МІД ${fc.name.uk.toUpperCase()} • ДІЙСНИЙ`, `${fc.code} FOREIGN OFFICE • VALID`),
        includeDecl: true,
        declaredCargo: L("Медикаменти, кава, особисті валізи", "Medicine, coffee, suitcases"),
        greeting: L(`«Бонжур / Вітаю! Я громадянин(ка) ${fc.name.uk}, везу допомогу й повертаюсь додому!»`, `'Hello! Citizen of ${fc.name.en}, papers in order!'`),
        interrogationReply: L(`«Мій паспорт ${fc.name.uk} абсолютно офіційний, громадянства Kraina не маю!»`, `'My ${fc.name.en} passport is completely valid, no Kraina citizenship!'`),
        intimidateReply: L("«О, мон дьйо! Навіщо так голосно? У нас у Європі так не приймають!»", "'Whoa, why so loud?! Check my passport calmly!'"),
        coffeeReply: L("«Мерсі! Чудова кава на вашому кордоні!»", "'Thank you! Great border coffee!'"),
        coffeeTip: 60,
        arrestFull: L("Ти безпідставно затримав чистого іноземця — назріває дипломатичний скандал!", "Wrongfully detained a clean foreign citizen!"),
        arrestToned: L("Іноземного громадянина помилково затримано.", "Foreign citizen detained mistakenly."),
        shouldBeApproved: true,
        storyTag: "FOREIGN_CLEAN"
      });
    }

    // Dual-citizenship evader pretending to be a pure foreigner!
    return buildTravelerFromParts({
      fullName, age, gender: "M", portrait, transport: trMeta,
      passportTitle: L(`ПАСПОРТ: ${fc.name.uk.toUpperCase()}`, `PASSPORT: ${fc.name.en.toUpperCase()}`),
      passportSub: L(`Серія ${fc.code}-${randInt(10000, 99999)}`, `No. ${fc.code}-${randInt(10000, 99999)}`),
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Заявлено", "Claimed"), value: fc.name, disc: null },
        { label: L("Реєстр ДПСК", "SBGS Registry"), value: L("Відмітка перетину №904", "Crossing Stamp #904"), disc: DISCREPANCY.DUAL_CITIZENSHIP },
        { label: L("Дійсний до", "Valid Until"), value: L("22.04.2030", "2030-04-22"), disc: null }
      ],
      passportSeal: L(`ПЕРЕВІРИТИ ПОДВІЙНЕ ГРОМАДЯНСТВО`, `CHECK DUAL CITIZENSHIP`),
      passportSealDisc: DISCREPANCY.DUAL_CITIZENSHIP,
      includeDecl: true,
      declaredCargo: L("Особисті речі, другий гаманець", "Personal bags"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» І СКАНЕР: Під килимком водія сховано синій закордонний паспорт громадянина KRAINA!", "DOG SEARCH: Hidden KRAINA passport found under floor mat!"),
      greeting: L(`«Пардон, я іноземець з ${fc.name.uk}! Які обмеження?! Пропускайте мерщій!»`, `'Pardon, I am from ${fc.name.en}! Let me exit right now!'`),
      interrogationReply: L("«Тихіше! Ну так, у мене є ще паспорт Kraina... Візьми 900 💵 і не викликай Військову Поліцію!»", "'Quiet! Okay I also hold a Kraina passport... Take 900 💵 and don't call Military Police!'"),
      intimidateReply: L("«*Ховає другий паспорт у кишеню* Я громадянин іншої держави, не чіпайте мене!»", "'*Hides second passport* I am a foreign national!'"),
      coffeeReply: L("«Дякую... а Військова Поліція сьогодні на зміні?..»", "'Thanks... is Military Police on duty tonight?..'"),
      arrestFull: L("Викликано Військову Поліцію (ВСП)! Ухилянта з подвійним громадянством затримано!", "Military Police (VSP) arrived and detained the dual-citizen evader!"),
      arrestToned: L("Порушника з подвійним громадянством передано Військовій Поліції.", "Dual-citizen violator handed over to Military Police."),
      hasContraband: true,
      bribeOffer: { amount: 900, currency: "USD", requiresDiscovery: true, nabkRiskJump: 10, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.DUAL_CITIZENSHIP],
      isWantedTarget: true,
      storyTag: "DUAL_CITIZEN"
    });
  }

  function createFsmSleeperSpy() {
    const fc = pick(FOREIGN_COUNTRIES);
    const fullName = pick(fc.namesM);
    const portrait = Object.assign(randomPortrait("M"), { glasses: 1, scarOrDetail: 2, expression: 1 });
    const trMeta = makeTransportMeta({ shape: "SEDAN", name: fc.car, isCar: true }, getColorById("SILVER"), `${fc.code} 4040 XX`);
    return buildTravelerFromParts({
      fullName, age: 42, gender: "M", portrait, transport: trMeta,
      passportTitle: L(`ПАСПОРТ: ${fc.name.uk.toUpperCase()}`, `PASSPORT: ${fc.name.en.toUpperCase()}`),
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Мета", "Purpose"), value: L("В'ЇЗД → «Туризм біля військових частин»", "ENTRY → 'Tourism near bases'"), disc: null },
        { label: L("Орієнтування ГУР-М", "Registry Note"), value: L("Прес-акредитація №404-М", "Press Pass #404-M"), disc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY }
      ],
      passportSeal: L(`МІД ${fc.name.uk.toUpperCase()} • ПРЕСА`, `${fc.code} PRESS SEAL`),
      passportSealDisc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY,
      includeDecl: true,
      declaredCargo: L("Туристичний намет, павербанки", "Camping tent, powerbanks"),
      vehicleSearchResult: L("ПЕС «БАВОВНА» ЗНАЙШОВ СХОВАНКУ: Супутниковий маячок «ФСМ», шифроблокнот і карта ТЕЦ!", "DOG SEARCH: Enemy FSM satellite beacon, cipher pad & power-grid map!"),
      greeting: L(`«Вітаю! Я незалежний журналіст з ${fc.name.uk}, їду знімати ваші пейзажі та підстанції!»`, `'Hello! Independent journalist from ${fc.name.en}, filming landscapes!'`),
      interrogationReply: L("«Не треба кликати ГУР-М чи СБК! Ось 1 600 💵 — забудь про багажник!»", "'Don't call GUR-M or SBK! Take 1,600 💵 and forget the trunk!'"),
      intimidateReply: L("«*Холодно посміхається* Ви ще пошкодуєте про такий тон...»", "'*Cold smile* You'll regret that tone...'"),
      coffeeReply: L("«Дякую. У нас у відомстві кава гірша.»", "'Thanks. Our agency serves worse coffee.'"),
      arrestFull: L("СПЕЦОПЕРАЦІЯ ГУР-М І СБК! Ти взяв кадрового шпигуна ворожої «ФСМ»!", "GUR-M & SBK joint sting! Enemy FSM sleeper agent captured!"),
      arrestToned: L("Агента ворожої розвідки «ФСМ» затримано.", "Enemy FSM intelligence operative detained."),
      hasContraband: true,
      bribeOffer: { amount: 1600, currency: "USD", requiresDiscovery: true, nabkRiskJump: 15, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.WANTED_CRIMINAL_OR_SPY, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "FSM_SPY"
    });
  }

  const VIP_CATEGORY_PRESETS = [
    { cat: "Будівництво", shape: "SUV", car: L("«Крузак-Піраміда 300»", "'Kruzak-Pyramid 300'"), cargo: L("Макети елітних ЖК, папки з дозвіллям", "Luxury condo blueprints"), usd: 1400, risk: 11, greet: L("«Шефе, я забудовник! У мене 400 обманутих вкладників під мерією, треба терміново на відпочинок!»", "'Boss, I'm a developer! Need urgent rest abroad!'") },
    { cat: "Освіта", shape: "SEDAN", car: L("«Мерс-Аспірант Е350»", "'Mers-Aspirant E350'"), cargo: L("300 дипломів магістрів та печатка", "300 blank master diplomas"), usd: 1000, risk: 9, greet: L("«Вітаю, колего! Ректор Академії Таро та Крипти їде на симпозіум до Франції-Люкс!»", "'Greetings! Rector of Tarot Academy heading to a symposium!'") },
    { cat: "Митниця", shape: "SUV", car: L("«Беха Х7 Конфіскат»", "'Beha X7 Confiscate'"), cargo: L("Коробки з конфіскованими гаджетами", "Seized gadget crates"), usd: 1800, risk: 12, greet: L("«Свій до свого! Я зі складу митниці, їду в Монаківку інвентаризувати фури!»", "'One of yours! Customs warehouse chief off to Monakivka!'") },
    { cat: "Фінанси", shape: "SPORT", car: L("«Стріла-Купе GT»", "'Strila-Coupe GT'"), cargo: L("Апаратні крипто-гаманці та сервери", "Hardware crypto wallets"), usd: 2300, risk: 14, greet: L("«Слухай, у мого банку завтра забирають ліцензію — мені кров з носу треба за кордон!»", "'Listen, my bank loses its license tomorrow — I gotta cross tonight!'") },
    { cat: "Феміда", shape: "SUV", car: L("«Лексус-Крейсер LX»", "'Leksus-Cruiser LX'"), cargo: L("Мантія та кейс з «вироками»", "Judge robe & briefcase"), usd: 2000, risk: 13, greet: L("«Я недоторканний суддя у відставці! Куди ти дивишся? Шлагбаум вгору!»", "'Retired high judge! Raise the barrier at once!'") },
    { cat: "Силовики", shape: "G_WAGON", car: L("«Гелік-Прокурор 500»", "'Gelik-Prosecutor 500'"), cargo: L("Справи на олігархів (усе «закрито»)", "Closed oligarch case files"), usd: 2400, risk: 15, greet: L("«Екс-прокурор району на зв'язку! Краще не перевіряй мій техпаспорт — домовимось!»", "'Ex-district prosecutor here! Better not inspect too closely!'") },
    { cat: "Шоу-біз", shape: "SPORT", car: L("«Електро-Комета Стрім»", "'Electro-Comet Stream'"), cargo: L("Кільцева лампа і гайд «Як стати мільйонером»", "Ring light & course guides"), usd: 1100, risk: 9, greet: L("«Йоу! Я топ-коуч успішного успіху! Лечу знімати рілси в Поландію!»", "'Yo! Top success coach flying to shoot reels!'") },
    { cat: "МСЕК-Еліт", shape: "SUV", car: L("«Порш Кабан S»", "'Porsh Kaban S'"), cargo: L("Пачки чистих бланків довідок та печатки", "Blank disability forms & seals"), usd: 2100, risk: 14, greet: L("«Тихо, колего! Я голова комісії МСЕК — їду в Алікантово на реабілітацію!»", "'Quiet! Head of medical board heading to Alikantovo for rehab!'") },
    { cat: "Енергетика", shape: "G_WAGON", car: L("«Гелік-Кубик V8»", "'Gelik-Kubik V8'"), cargo: L("Кейс із тендерними контрактами", "Rigged grid tender files"), usd: 2500, risk: 15, greet: L("«У мене завтра аудит НАБК по трансформаторах — не тримай на шлагбаумі!»", "'NABK audit on transformers tomorrow — open the gate!'") },
    { cat: "Агро-Барон", shape: "PICKUP", car: L("«Рам-Трактор 1500»", "'Ram-Tractor 1500'"), cargo: L("Зернові накладні й мішки готівки", "Grain invoices & cash bags"), usd: 1600, risk: 12, greet: L("«Я половину області засіяв! Їду в Поландію купувати комбайн!»", "'I planted half the region! Heading to Polandia for a harvester!'") },
    { cat: "Політтехнолог", shape: "SEDAN", car: L("«Ауді А8 Броня»", "'Audi A8 Armor'"), cargo: L("Ботоферма в багажнику, 50 смартфонів", "Bot-farm in trunk, 50 phones"), usd: 1750, risk: 13, greet: L("«Без зайвого шуму — вибори скоро, лечу до шефа на стратегічну нараду!»", "'Keep it quiet — flying to the boss for campaign strategy!'") }
  ];

  function createDiverseVipEscapee() {
    const vp = pick(VIP_CATEGORY_PRESETS);
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { glasses: 2, outfitStyle: 2, expression: 2 });
    const trMeta = makeTransportMeta({ shape: vp.shape, name: vp.car, isCar: true }, getColorById("BLACK"), `VIP ${randInt(100, 999)}`);
    return buildTravelerFromParts({
      fullName, age: randInt(32, 56), gender: "M", portrait, transport: trMeta,
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
        { label: L("Категорія", "Category"), value: L(vp.cat, vp.cat), disc: null },
        { label: L("Підстава 18–60", "Exit Permit"), value: L("Липова бронь VIP-клубу", "Bogus VIP club exemption"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
      ],
      passportSeal: L("КЛУБ «МОНАКІВКА»", "CLUB 'MONAKIVKA'"),
      passportSealDisc: DISCREPANCY.FAKE_ISSUER_SEAL,
      includeDecl: true,
      declaredCargo: vp.cargo,
      vehicleSearchResult: L("ПЕС «БАВОВНА» ЗНАЙШОВ СХОВАНКУ: Подвійне дно з пачками готівки на вивіз!", "DOG SEARCH: False bottom packed with undeclared cash!"),
      greeting: vp.greet,
      interrogationReply: L(`«Не ускладнюй! Тримай ${vp.usd.toLocaleString("en-US")} 💵 без зайвих записів!»`, `'Keep it simple! Here is ${vp.usd.toLocaleString("en-US")} 💵!'`),
      intimidateReply: L("«Та в мене адвокати кращі за твій КПП! Беріть гроші й не затримуйте!»", "'My lawyers own this road! Take the cash!'"),
      coffeeReply: L("«О, еспресо? Дякую, але давай ближче до справи!»", "'Espresso? Nice, now let's talk business!'"),
      arrestFull: L(`СБК та ВСП затримали VIP-ухилянта (${vp.cat}) з липовою печаткою!`, `SBK & VSP detained VIP (${vp.cat}) with forged seal!`),
      arrestToned: L(`Затримано VIP-порушника (${vp.cat}) за підробленою перепусткою.`, `VIP violator (${vp.cat}) detained.`),
      hasContraband: true,
      bribeOffer: { amount: vp.usd, currency: "USD", instantOffer: true, nabkRiskJump: vp.risk, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.FAKE_ISSUER_SEAL, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "VIP_DIVERSE"
    });
  }

  function createRecurringVasya(vasyaArc, daySpec) {
    const stage = (vasyaArc && vasyaArc.stage) || 0;
    const lastOutcome = vasyaArc && vasyaArc.lastOutcome;
    const caught = (vasyaArc && vasyaArc.caught) || 0;
    const approved = (vasyaArc && vasyaArc.approved) || 0;
    const needOblik = Boolean(daySpec && daySpec.requireOblikQr);

    if (stage === 0) {
      const trMeta = makeTransportMeta({ shape: "RETRO", name: L("«Занос 1.5» (У наклейках)", "'Zanos 1.5'"), isCar: true }, getColorById("EMERALD"), "ВН 0101 ХМ");
      const wigPortrait = { gender: "F", skinTone: 1, faceShape: 1, hairStyle: 1, hairColor: 4, facialHair: 0, glasses: 1, headwear: 2, scarOrDetail: 0, expression: 2, lipColor: 2, earrings: 1, outfitStyle: 0, specialId: "NONE" };
      const extraDocs = [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
        subtitle: L("Салон-ательє «Гламур»", "Glamour Hair Studio"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Підстава", "Basis"), value: L("Стиліст-візажист першої категорії", "Master Hairstylist"), disc: null },
          { label: L("Ким видано", "Issued By"), value: L("«Клуб перукарок Карпатії»", "'Carpathian Wigs Club'"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
        ],
        sealText: L("ПЕРУКАР-МАГІСТРАТ", "HAIR-GUILD SEAL"),
        sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
      }];
      if (needOblik) {
        extraDocs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }
      return buildTravelerFromParts({
        fullName: L("Василь «Тьотя Вася» Підпільний", "Vasyl 'Auntie' Pidpilnyi"),
        age: 34, gender: "M", portrait: wigPortrait, transport: trMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЧОЛ", "34 y/o • M"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("14.08.2030", "2030-08-14"), disc: null }
        ],
        extraDocs,
        includeDecl: true,
        declaredCargo: L("Перуки, лак для волосся, фен (для подруги)", "Wigs, hairspray & hairdryer"),
        vehicleSearchResult: L("На задньому сидінні запасна руда перука та книга «100 перевтілень».", "Back seat holds a spare ginger wig and '100 Disguises' book."),
        greeting: L("«Хелоу, красунчику! Я стиліст Василь... ну тобто Вася! Вдягнув перуку на конкурс краси в Кракові, ось довідка!»", "'Hello handsome! Vasyl the stylist... just wearing a wig for a contest in Krakiv!'"),
        interrogationReply: L("«Тс-с! Не прискіпуйся до печатки перукарні — ось 180 💵 на каву, запам'ятай Васька!»", "'Shh! Ignore the hair-guild stamp — take 180 💵 and remember Vasyl!'"),
        intimidateReply: L("«Ой! *поправляє перуку басом* Та не гримай, шиньйон сповзає!»", "'Whoa! *adjusts wig in deep voice* Careful, it slips!'"),
        coffeeReply: L("«Ммм, латте-арт! Як ти ставишся до творчих людей на кордоні?»", "'Love the coffee! Ready to help an artist cross?'"),
        arrestFull: L("Василь «Тьотя Вася» знімає біляву перуку перед камерою СБК: «Ще побачимося на твоїй зміні, командире!»", "Vasyl pulls off the wig for SBK cameras: 'We will meet again on your shift!'"),
        arrestToned: L("Мандрівника з підробленою печаткою перукарні затримано.", "Detained for bogus hair-guild seal."),
        bribeOffer: { amount: 180, currency: "USD", requiresDiscovery: true, nabkRiskJump: 7, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.FAKE_ISSUER_SEAL],
        storyTag: "VASYA_ACT_1"
      });
    }

    if (stage === 1) {
      const trMeta = makeTransportMeta({ shape: "PICKUP", name: L("«Пікап Міцубісі Л200» (Пасіка)", "'Pickup L200' (Apiary)"), isCar: true }, getColorById("YELLOW"), "ВН 0202 ХМ");
      const beePortrait = { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 3, hairColor: 1, facialHair: 2, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 1, outfitStyle: 3, specialId: "NONE" };
      const extraDocs = [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА АГРАРІЯ", "AGRI EXPORTER PERMIT"),
        subtitle: L("Облпродспілка", "Regional Agri-Union"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Підстава", "Basis"), value: L("Вивезення вуликів на медовий ярмарок", "Honey Fair Beehives Transport"), disc: null }
        ],
        sealText: L("МІНАГРО / ДПСК • ДІЙСНИЙ", "AGRI / SBGS • VALID"),
        sealDisc: null
      }];
      if (needOblik) {
        extraDocs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }
      const greetCallback = lastOutcome === "APPROVED"
        ? L("«Бз-з-з! Вітаю знову, бро! Минулого разу в перуці файно спрацювалися, тепер я пасічник Василь! Не чіпай вулики — бджоли злі!»", "'Bzz! Good to see you again, bro! Last time in a wig worked smoothly — now I'm Beekeeper Vasyl!'")
        : L("«Бз-з-з! Пам'ятаєш «Тьотю Васю»? То був артистичний експеримент! Тепер я поважний пасічник із чистими паперами... але без пса!»", "'Bzz! Remember Auntie Vasyl? That was art! Now I'm a clean beekeeper... just keep the dog away!'");
      return buildTravelerFromParts({
        fullName: L("Василь «Пасічник» Підпільний", "Vasyl 'Beekeeper' Pidpilnyi"),
        age: 34, gender: "M", portrait: beePortrait, transport: trMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЧОЛ", "34 y/o • M"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("14.08.2030", "2030-08-14"), disc: null }
        ],
        extraDocs,
        includeDecl: true,
        declaredCargo: L("3 вулики бджіл та діжка липового меду", "3 beehives & barrel of lime honey"),
        vehicleSearchResult: L("ПЕС «БАВОВНА» РОЗГРИЗ ВУЛИК: Жодної бджоли — під сотами 18 коробок годинників «Кролекс» і блоки контрабанди!", "DOG SEARCH: Zero bees — beehives packed with 18 Krolex boxes & smuggled cartons!"),
        greeting: greetCallback,
        interrogationReply: L("«Тихіше, погризе! Не треба розкривати вулики — тримай 280 💵 і липовий медок!»", "'Quiet, they'll sting! Skip the beehive inspection — take 280 💵!'"),
        intimidateReply: L("«Ай! Бджоли гудять... *із вулика чути цокання швейцарських годинників*!»", "'Careful! *mechanical watch ticking sounds from inside the beehive*!'"),
        coffeeReply: L("«Ех, до кави б мого меду... але ти ж песa не пустиш, правда?»", "'Honey goes great with coffee... skip the dog, yeah?'"),
        arrestFull: L("Василя знімають у масці пасічника: «Ти знову знайшов мій тайник! Але третій образ тебе здивує!»", "Vasyl cuffed in beekeeper gear: 'You busted me again! Wait till you see Act 3!'"),
        arrestToned: L("Контрабанду у фальшивих вуликах викрито.", "Contraband hidden inside fake beehives seized."),
        hasContraband: true,
        bribeOffer: { amount: 280, currency: "USD", requiresDiscovery: true, nabkRiskJump: 8, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.CONTRABAND_CARGO],
        storyTag: "VASYA_ACT_2"
      });
    }

    if (stage === 2) {
      const trMeta = makeTransportMeta({ shape: "E_SCOOTER", name: L("Електросамокат «Вжух-Х3»", "'Vzhykh-X3' E-Scooter"), isCar: false }, getColorById("BLUE"), "ПШ-303");
      const hipPortrait = { gender: "M", skinTone: 0, faceShape: 0, hairStyle: 2, hairColor: 3, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 0, expression: 2, outfitStyle: 2, specialId: "NONE" };
      const stolenPhoto = { gender: "M", skinTone: 2, faceShape: 3, hairStyle: 4, hairColor: 0, facialHair: 4, glasses: 0, headwear: 0, scarOrDetail: 1, expression: 0, outfitStyle: 0, specialId: "NONE" };
      const extraDocs = [{
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ІТ-АРХІТЕКТОРА", "IT ARCHITECT PERMIT"),
        subtitle: L("Державний Техно-Хаб", "National Tech Hub"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Підстава", "Basis"), value: L("Розгортання супутникової мережі", "Satellite Network Rollout"), disc: null }
        ],
        sealText: L("МІНЦИФРИ / ДПСК • ДІЙСНИЙ", "MINDIGITAL / SBGS • VALID"),
        sealDisc: null
      }];
      if (needOblik) {
        extraDocs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }
      const greetTxt = approved >= 2
        ? L("«Салют, старий партнере! То я, Вася-Хамелеон! Їду вже як ІТ-шник на самокаті — паспорт трохи чужою фоткою блиснув, то фігня, ти ж свій!»", "'Hey old partner! It's Vasyl Chameleon on a scooter! Passport photo looks weird, no big deal right?'")
        : L("«Вітаю знову, інспекторе! Після перуки й пасіки я пішов в ІТ-стартап на самокаті! Фото в паспорті — то після пластичної операції, не дивись!»", "'Hello again, Inspector! After wigs & bees I went tech on a scooter! Passport photo was pre-makeover!'");
      return buildTravelerFromParts({
        fullName: L("Василь «Ілон» Підпільний", "Vasyl 'Elon' Pidpilnyi"),
        age: 34, gender: "M", portrait: hipPortrait, passportPortrait: stolenPhoto, transport: trMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Фотокартка", "Photo ID"), value: L("Цифровий знімок (вклеєно)", "Digital Photo Match"), disc: DISCREPANCY.PHOTO_MISMATCH },
          { label: L("Дійсний до", "Valid Until"), value: L("14.08.2030", "2030-08-14"), disc: null }
        ],
        extraDocs,
        includeDecl: true,
        declaredCargo: L("Макбук-Муляж, окуляри для рейву, рюкзак", "Mock laptop, rave shades, backpack"),
        vehicleSearchResult: L("У рюкзаку знайдено чужий закордонний паспорт із переклеєною обкладинкою.", "Found a foreign passport with an unglued photo page inside his backpack."),
        greeting: greetTxt,
        interrogationReply: L("«Та схуд просто на дієті! Ось 360 💵 — ти ж розумієш, як важко стати стартапером!»", "'Lost weight on a diet! Take 360 💵 — overlook the photo glitch!'"),
        intimidateReply: L("«Е-е, не світи в очі! Фотку у Фотошопі за п'ять хвилин робили!»", "'Hey! I spent whole minutes photoshopping that mugshot!'"),
        coffeeReply: L("«Капучино на мигдальному? Справжній європейський сервіс!»", "'Oat cappuccino? Pure European service!'"),
        arrestFull: L("Василь зітхає біля самоката: «Три рази мене розкусив... Ну вчетверте я прийду вже по-справжньому!»", "Vasyl sighs beside his scooter: 'Three times busted... Next time I come back different!'"),
        arrestToned: L("Афериста з чужим фото в паспорті затримано.", "Detained for passport photo mismatch."),
        bribeOffer: { amount: 360, currency: "USD", requiresDiscovery: true, nabkRiskJump: 9, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.PHOTO_MISMATCH],
        storyTag: "VASYA_ACT_3"
      });
    }

    // Act 4 Finale (Branches cleanly from your previous treatment of Vasyl!)
    const isReformed = caught >= 2 || caught >= approved;
    if (isReformed) {
      const trMeta = makeTransportMeta({ shape: "MINIBUS", name: L("«Мерс Спрінтер Волонтер»", "'Mers Sprinter Volunteer'"), isCar: true }, getColorById("BLUE"), "ВН 0404 ВЛ");
      const cleanPortrait = { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 3, hairColor: 1, facialHair: 1, glasses: 0, headwear: 0, scarOrDetail: 0, expression: 1, outfitStyle: 1, specialId: "NONE" };
      return buildTravelerFromParts({
        fullName: L("Василь «Волонтер» Підпільний", "Vasyl 'Volunteer' Pidpilnyi"),
        age: 34, gender: "M", portrait: cleanPortrait, transport: trMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЧОЛ", "34 y/o • M"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("14.08.2032", "2032-08-14"), disc: null }
        ],
        extraDocs: [{
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ВОЛОНТЕРА", "VOLUNTEER PERMIT"),
          subtitle: L("Офіційний реєстр «Шлях»", "Official 'Shlyakh' Registry"),
          fields: [
            { label: L("Особа", "Holder"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
            { label: L("Підстава", "Basis"), value: L("Доставка FPV-дронів та оптики для фронту", "FPV Drone & Optics Supply"), disc: null }
          ],
          sealText: L("ЦНАП / ДПСК • ПЕРЕВІРЕНО", "CNAP / SBGS • VERIFIED"),
          sealDisc: null
        }],
        includeDecl: true,
        declaredCargo: L("Медичні аптечки IFAK, турнікети, спальники (офіційна накладна)", "IFAK trauma kits, tourniquets & sleeping bags (manifested)"),
        vehicleSearchResult: L("Огляд псом «Бавовною»: 100% чисто! Все суворо за накладною волонтерського фонду!", "Dog search clean! Everything strictly matches the volunteer manifest!"),
        greeting: L("«Пане інспекторе! Пам'ятаєш перуку, вулики й самокат? Ти мене тричі навернув на розум — я зав'язав з аферами і тепер чесно возжу допомогу армії. Перевіряй — тут усе як у книзі!»", "'Inspector! Remember the wig, bees & scooter? Your discipline reformed me — now I run real charity supplies legally. Check everything!'"),
        interrogationReply: L("«Жодних конвертів і жодних махінацій! Кожен папірець справжній, дякую тобі за науку!»", "'Zero bribes, zero tricks! Every seal is 100% legit — thank you for straightening me out!'"),
        intimidateReply: L("«*Усміхається спокійно* Більше не боюся стуку по склу — совість тепер чиста!»", "'*Smiles calmly* Not afraid of the booth glass anymore — clean conscience!'"),
        coffeeReply: L("«О, за гарячу каву на трасі низький уклін! Лови 100 🪙 у банку будки!»", "'Bless you for the hot coffee! Take 100 🪙 for the booth fund!'"),
        coffeeTip: 100,
        arrestFull: L("Ти затримав Василя саме тоді, коли він чесно став на шлях волонтера — навіть пес розгублено скавчить!", "You detained Reformed Vasyl when his papers were finally 100% spotless!"),
        arrestToned: L("Чесного волонтера помилково затримано.", "Reformed volunteer wrongly detained."),
        shouldBeApproved: true,
        storyTag: "VASYA_FINALE_CLEAN"
      });
    } else {
      const trMeta = makeTransportMeta({ shape: "G_WAGON", name: L("«Гелік-Хамелеон V8»", "'Chameleon G-Wagon V8'"), isCar: true }, getColorById("BLACK"), "КГ 7777 ХМ");
      const bossPortrait = { gender: "M", skinTone: 1, faceShape: 2, hairStyle: 3, hairColor: 1, facialHair: 2, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, outfitStyle: 2, specialId: "NONE" };
      const extraDocs = [{
        type: "EXEMPTION_CERT",
        title: L("ЗОЛОТИЙ МАНДАТ «ХАМЕЛЕОН»", "GOLD 'CHAMELEON' MANDATE"),
        subtitle: L("Клуб Офшор-Транзит", "Offshore Transit Club"),
        fields: [
          { label: L("Особа", "Holder"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Ким видано", "Issued By"), value: L("«Асоціація Тіньового Імпорту»", "'Shadow Import Syndicate'"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
        ],
        sealText: L("ХАМЕЛЕОН • ОФШОР-VIP", "CHAMELEON • OFFSHORE VIP"),
        sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
      }];
      if (needOblik) {
        extraDocs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }
      return buildTravelerFromParts({
        fullName: L("Василь «Хамелеон» Підпільний (VIP)", "Vasyl 'Chameleon' Pidpilnyi (VIP)"),
        age: 34, gender: "M", portrait: bossPortrait, transport: trMeta,
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: L("Підпільний Василь Тарасович", "Pidpilnyi Vasyl"), disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЧОЛ", "34 y/o • M"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("14.08.2032", "2032-08-14"), disc: null }
        ],
        extraDocs,
        includeDecl: true,
        declaredCargo: L("Елітний кейс з антикваріатом", "Luxury antique case"),
        vehicleSearchResult: L("ПЕС «БАВОВНА» ЗНАЙШОВ ДНО БАГАЖНИКА: Сейф із пачками готівки та підробленими паспортами!", "DOG SEARCH: False trunk floor hides cash bricks and blank passports!"),
        greeting: L("«Братику, пам'ятаєш, як я колись в перуці їхав?! Завдяки тобі я піднявся до «Геліка» і керую караванами! Тримай царську подяку — 950 💵!»", "'Brother! Remember when I wore a wig?! Thanks to you I climbed to a G-Wagon! Take 950 💵 VIP cut!'"),
        interrogationReply: L("«Навіщо нам ті печатки? Ти зробив мене королем траси — забирай 950 💵 і піднімай шлагбаум!»", "'Forget seals — you made me king of this highway! Grab 950 💵!'"),
        intimidateReply: L("«Ха-ха, не грайся в суворого — ми ж обоє в темі з першого дня!»", "'Haha relax partner — we've been in business since Act 1!'"),
        coffeeReply: L("«Конаєш над старим термосом? Купуй свій острів за мої гроші!»", "'Still pouring thermos coffee? Take my cash and buy a yacht!'"),
        arrestFull: L("Василя «Хамелеона» скрутили прямо біля чорного «Геліка» — фінал великої тіньової кар'єри!", "Vasyl Chameleon cuffed right beside his black G-Wagon — end of a shadow empire!"),
        arrestToned: L("Голову тіньового трафіку затримано на кордоні.", "Shadow smuggling boss detained."),
        hasContraband: true,
        bribeOffer: { amount: 950, currency: "USD", instantOffer: true, nabkRiskJump: 14, isStingTrap: false, syndicateFavor: true },
        shouldBeApproved: false,
        violations: [DISCREPANCY.FAKE_ISSUER_SEAL, DISCREPANCY.CONTRABAND_CARGO],
        isWantedTarget: true,
        storyTag: "VASYA_FINALE_BOSS"
      });
    }
  }

  function ensureRequiredDocsForDay(trv, daySpec) {
    if (!trv || !trv.shouldBeApproved || !daySpec) return;
    if (daySpec.requireVehicleDecl && !trv.documents.some(d => d.type === "VEHICLE_CUSTOMS")) {
      trv.documents.push({
        type: "VEHICLE_CUSTOMS",
        title: L("ДЕКЛАРАЦІЯ ТРАНСПОРТУ ТА БАГАЖУ", "TRANSPORT & LUGGAGE DECLARATION"),
        subtitle: trv.vehicleDesc,
        fields: [
          { label: L("Власник / Водій", "Owner / Driver"), value: trv.fullName, disc: null },
          { label: L("Транспорт / Колір / №", "Transport / Color / Plate"), value: trv.vehicleDesc, disc: null },
          { label: L("Заявлений вантаж", "Declared Cargo"), value: L("Особисті речі", "Personal luggage"), disc: null }
        ],
        sealText: L("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS"),
        sealDisc: null
      });
    }
    const isForeignClean = trv.storyTag === "FOREIGN_CLEAN";
    if (daySpec.requireOblikQr && !isForeignClean && trv.direction === "EXIT" && trv.gender === "M" && trv.age >= 18 && trv.age <= 60) {
      if (!trv.documents.some(d => d.type === "MILITARY_ID")) {
        trv.documents.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: trv.fullName, disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАТА ОНОВЛЕНА", "QR-OK • UPDATED"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }
    }
    if (daySpec.dailyRule === "MED_INSURANCE" && trv.direction === "EXIT") {
      if (!trv.documents.some(d => d.title && d.title.uk && d.title.uk.includes("СТРАХОВКА"))) {
        trv.documents.push({
          type: "EXEMPTION_CERT",
          title: L("🏥 САНІТАРНА СТРАХОВКА", "🏥 MEDICAL INSURANCE"),
          subtitle: L("Міжнародний поліс", "International Policy"),
          fields: [
            { label: L("Застрахований", "Insured"), value: trv.fullName, disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("18.10.2029", "2029-10-18"), disc: null }
          ],
          sealText: L("МЕД-СТРАХ KRAINA • ДІЙСНИЙ", "MED-INSURE KRAINA • VALID"),
          sealDisc: null
        });
      }
    } else if (daySpec.dailyRule === "TRANSIT_PERMIT" && trv.direction === "EXIT") {
      if (!trv.documents.some(d => d.title && d.title.uk && d.title.uk.includes("ТРАНЗИТНИЙ ТАЛОН"))) {
        trv.documents.push({
          type: "EXEMPTION_CERT",
          title: L("🛣️ ТРАНЗИТНИЙ ТАЛОН", "🛣️ TRANSIT PERMIT"),
          subtitle: L("Транзитний дозвіл", "Transit Route"),
          fields: [
            { label: L("Водій / Пасажир", "Holder"), value: trv.fullName, disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("25.11.2029", "2029-11-25"), disc: null }
          ],
          sealText: L("МІНТРАНС KRAINA • ДОЗВІЛ", "TRANSIT AUTH • VALID"),
          sealDisc: null
        });
      }
    }
  }

  // Non-repeating queue builder across all Story + 12 Shytomyr Legends + War/Intel + Combinatorial travelers
  let usedStoryTags = new Set();
  let usedShytomyrRun = new Set();
  let usedEncounterIds = new Set();

  function generateDailyQueue(daySpec, count, isSandbox, recurringArcs) {
    const q = [];
    const seenNames = new Set();
    const dNum = daySpec ? daySpec.dayNumber : 1;
    const arcs = recurringArcs || null;
    const stepanMetCount = arcs ? (arcs.stepanMet || 0) : 0;

    // 0. Recurring Multi-Day Client Mini-Arc (Василь «Хамелеон» Підпільний — 4 acts)
    if (arcs && arcs.vasya && !arcs.vasya.completed && (arcs.vasya.stage || 0) < 4) {
      const vasyaScheduled = isSandbox
        ? (dNum >= 2 && dNum % 2 === 0)
        : (dNum === 2 || dNum === 4 || dNum === 6 || dNum === 7);
      if (vasyaScheduled) {
        const vTrv = createRecurringVasya(arcs.vasya, daySpec);
        seenNames.add(vTrv.fullName.uk);
        q.push(vTrv);
      }
    }

    // 1. Prioritize unseen Shytomyr legends (so player discovers all 12 without frustrating repeats!)
    const globalSeen = new Set(loadUnlockedShytomyr());
    let availShytomyr = SHYTOMYR_LEGENDS.filter(s => !usedShytomyrRun.has(s.tag));
    if (availShytomyr.length === 0) {
      usedShytomyrRun.clear();
      availShytomyr = SHYTOMYR_LEGENDS.slice();
    }
    const unseenGlobally = shuffle(availShytomyr.filter(s => !globalSeen.has(s.tag)));
    const restPool = shuffle(availShytomyr.filter(s => globalSeen.has(s.tag)));
    const orderedShytomyr = unseenGlobally.concat(restPool);

    const pickCount = daySpec.extraShytomyr ? 2 : (Math.random() < 0.45 ? 1 : 0);
    for (let i = 0; i < Math.min(pickCount, orderedShytomyr.length); i++) {
      const leg = orderedShytomyr[i];
      usedShytomyrRun.add(leg.tag);
      const trv = createShytomyrFriend(leg);
      seenNames.add(trv.fullName.uk);
      q.push(trv);
    }

    // 2. Story characters paced to match Campaign Briefings (unrestricted in Sandbox)
    const uniquePool = [
      { tag: "AUNT_HALYA", minDay: 1, fn: () => createAuntHalya() },
      { tag: "DEPUTY_SON", minDay: 1, fn: () => createDeputySon() },
      { tag: "STEPAN_2", minDay: 1, fn: () => createGrandpaStepan(dNum, stepanMetCount) },
      { tag: "GRANDMA_PICKLES", minDay: 1, fn: () => createGrandmaPickles() },
      { tag: "CRYPTO_SCOOTER", minDay: 2, fn: () => createCryptoStartupFounder(dNum) },
      { tag: "COFFIN", minDay: 3, fn: () => createCoffinSneezer() },
      { tag: "TOLIK", minDay: 3, fn: () => createTolikCourier() },
      { tag: "FAKE_BLOGGER", minDay: 3, fn: () => createFakeVolunteerBlogger() },
      { tag: "NABK_STING", minDay: 4, fn: () => createNabkSting() },
      { tag: "MONACO_MP", minDay: 4, fn: () => createMonacoBattalionMP() }
    ].filter(item => isSandbox || item.minDay <= dNum);

    if (uniquePool.filter(item => !usedStoryTags.has(item.tag)).length === 0) {
      usedStoryTags.clear();
    }
    let addedStory = 0;
    for (const item of shuffle(uniquePool)) {
      if (!usedStoryTags.has(item.tag) && q.length < count - 3 && addedStory < 2) {
        usedStoryTags.add(item.tag);
        const stTrv = item.fn();
        seenNames.add(stTrv.fullName.uk);
        q.push(stTrv);
        addedStory++;
      }
    }

    // Warm repeat-visit memory for Grandpa Stepan on Day 6 Campaign if met earlier
    if (!isSandbox && dNum === 6 && stepanMetCount >= 1 && q.length < count - 2 && !seenNames.has("Степан Петрович Бойко")) {
      const repStepan = createGrandpaStepan(dNum, stepanMetCount);
      seenNames.add(repStepan.fullName.uk);
      q.push(repStepan);
    }

    // 3. War/Intelligence encounters (paced by Campaign Day, full mix in Sandbox)
    const warCount = daySpec.extraWar ? 2 : 1;
    for (let w = 0; w < warCount && q.length < count - 2; w++) {
      let warTrv;
      if (w === 0 && daySpec.extraWar) {
        warTrv = createIntelCovertCourier();
      } else if (!isSandbox && dNum === 1) {
        warTrv = createIntelCovertCourier();
      } else if (!isSandbox && dNum === 2) {
        warTrv = Math.random() < 0.35 ? createIntelCovertCourier() : createArtillerySpotter();
      } else if (!isSandbox && dNum <= 5) {
        const rWar = Math.random();
        warTrv = rWar < 0.25 ? createIntelCovertCourier() : (rWar < 0.60 ? createArtillerySpotter() : createMicrochipSmuggler());
      } else {
        const rWar = Math.random();
        warTrv = rWar < 0.25 ? createIntelCovertCourier() : (rWar < 0.5 ? createArtillerySpotter() : (rWar < 0.75 ? createMicrochipSmuggler() : createFsmSleeperSpy()));
      }
      seenNames.add(warTrv.fullName.uk);
      q.push(warTrv);
    }

    // 3a. Foreign Travelers (Day 6+ in Campaign, always in Sandbox)
    if (isSandbox || dNum >= 6) {
      const fCount = Math.random() < 0.6 ? 2 : 1;
      for (let f = 0; f < fCount && q.length < count - 1; f++) {
        const fTrv = createForeignTraveler();
        if (!seenNames.has(fTrv.fullName.uk)) {
          seenNames.add(fTrv.fullName.uk);
          q.push(fTrv);
        }
      }
    }

    // 3b. High-Stakes VIP Escapees (Day 4+ in Campaign, always in Sandbox)
    if ((isSandbox || dNum >= 4) && q.length < count - 1 && Math.random() < (dNum >= 3 ? 0.42 : 0.28)) {
      const rVip = Math.random();
      const vipTrv = rVip < 0.2 ? createItEvaderVip() : (rVip < 0.38 ? createDeputyEscapee() : (rVip < 0.52 ? createTopCorruptor() : createDiverseVipEscapee()));
      if (!seenNames.has(vipTrv.fullName.uk)) {
        seenNames.add(vipTrv.fullName.uk);
        q.push(vipTrv);
      }
    }

    // 4. Fill remaining slots with fresh combinatorial travelers
    let safety = 0;
    while (q.length < count && safety < 40) {
      safety++;
      const proc = createProceduralTraveler(daySpec);
      if (!seenNames.has(proc.fullName.uk) || safety > 25) {
        seenNames.add(proc.fullName.uk);
        q.push(proc);
      }
    }

    const finalQueue = q.slice(0, count);
    finalQueue.forEach(trv => ensureRequiredDocsForDay(trv, daySpec));
    return shuffle(finalQueue);
  }

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
    const weather = opts.weather || "CLEAR";
    const weatherCleared = opts.weatherCleared !== false;
    const hasGenerator = (opts.ownedAssets || []).includes("diesel_generator");

    // Sky gradient + dynamic weather tint & lightning flashes
    const skyTopMap = { CLEAR: "#131D26", RAIN: "#1A232A", FOG: "#2A3437", SNOW: "#1E2C3A", STORM: "#101522" };
    const skyBotMap = { CLEAR: "#2E4352", RAIN: "#37474F", FOG: "#607177", SNOW: "#546E7A", STORM: "#263248" };
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.44);
    skyGrad.addColorStop(0, sirenActive ? "#5A1F1E" : (droneWarning ? "#4E342E" : (skyTopMap[weather] || (dayNumber >= 4 ? "#1E282E" : "#2D3C45"))));
    skyGrad.addColorStop(1, sirenActive ? "#7D2C2B" : (droneWarning ? "#6D4C41" : (skyBotMap[weather] || "#546E7A")));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.44);

    // Clear starry night sparkles vs Storm lightning bolt
    if (weather === "CLEAR" && !sirenActive) {
      for (let si = 0; si < 14; si++) {
        const sx = (si * 37 + 9) % Math.floor(w * 0.53);
        const sy = 5 + ((si * 19 + 3) % Math.floor(h * 0.24));
        const alpha = 0.35 + (isLive ? 0.35 * Math.abs(Math.sin(tSec * 1.8 + si)) : 0.2);
        ctx.fillStyle = `rgba(255, 250, 220, ${alpha.toFixed(2)})`;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
    } else if (weather === "STORM" && isLive && Math.sin(tSec * 1.9 + 0.5) > 0.965) {
      ctx.fillStyle = "rgba(220, 240, 255, 0.34)";
      ctx.fillRect(0, 0, w * 0.55, h * 0.44);
      ctx.strokeStyle = "#FFFDE7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.19, 2);
      ctx.lineTo(w * 0.16, h * 0.14);
      ctx.lineTo(w * 0.21, h * 0.16);
      ctx.lineTo(w * 0.15, h * 0.31);
      ctx.stroke();
    }

    // Drifting clouds
    ctx.fillStyle = weather === "STORM" ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.08)";
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

    // Asphalt yard & wet/snowy surface accents
    ctx.fillStyle = weather === "RAIN" || weather === "STORM" ? "#2E3739" : (weather === "SNOW" ? "#455259" : "#3A423E");
    ctx.fillRect(0, h * 0.43, w, h * 0.57);
    if (weather === "RAIN" || weather === "STORM") {
      ctx.fillStyle = "rgba(128, 203, 196, 0.12)";
      ctx.beginPath(); ctx.ellipse(w * 0.28, h * 0.85, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
    } else if (weather === "SNOW") {
      ctx.fillStyle = "rgba(240, 248, 255, 0.42)";
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
      const dropCount = weather === "STORM" ? 28 : 20;
      const spd = weather === "STORM" ? 135 : 95;
      ctx.strokeStyle = "rgba(176, 216, 235, 0.48)";
      ctx.lineWidth = 1.1;
      for (let pi = 0; pi < dropCount; pi++) {
        const px = ((pi * 23 + tSec * 34) % (w * 0.54));
        const py = ((pi * 17 + tSec * spd) % h);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 3.5, py + 7.5);
        ctx.stroke();
      }
    } else if (weather === "SNOW") {
      ctx.fillStyle = "rgba(245, 250, 255, 0.82)";
      for (let pi = 0; pi < 24; pi++) {
        const px = ((pi * 19 + tSec * 14 + Math.sin(tSec * 2 + pi) * 4) % (w * 0.54));
        const py = ((pi * 15 + tSec * 28) % h);
        ctx.beginPath();
        ctx.arc(Math.abs(px), py, (pi % 2) + 1.2, 0, Math.PI * 2);
        ctx.fill();
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

    // Fog occlusion over vehicle lane until cleared (or subtle parted mist when cleared!)
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
        ctx.fillText(opts.lang === "EN" ? "🌫️ DENSE FOG" : "🌫️ ТУМАН", 8, h - 10);
      } else {
        const beam = ctx.createLinearGradient(w * 0.54, h * 0.45, w * 0.04, h * 0.85);
        beam.addColorStop(0, "rgba(255, 249, 196, 0.26)");
        beam.addColorStop(1, "rgba(255, 249, 196, 0.02)");
        ctx.fillStyle = beam;
        ctx.fillRect(0, h * 0.42, w * 0.54, h * 0.56);
      }
    }

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

    // Storm booth power flicker unless diesel generator is owned
    if (weather === "STORM" && !hasGenerator && !opts.uvActive && isLive && Math.sin(tSec * 2.7) > 0.88 && Math.sin(tSec * 23) > 0) {
      ctx.fillStyle = "rgba(8, 12, 18, 0.34)";
      ctx.fillRect(w * 0.55, 0, w * 0.45, h);
    }

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
    totalCareerBribes: 0,
    shiftBribesTotal: 0,
    shiftBribesCount: 0,
    shiftFinesTotal: 0,
    shiftSalaryEarned: 0,
    shiftBountiesEarned: 0,
    shiftExtrasEarned: 0,
    shiftEarnedUsd: 0,
    shiftCombo: 0,
    shiftBestCombo: 0,
    shiftGrade: null,
    shiftGradeBonus: 0,
    openedDocIndices: [],
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
    campaignFlags: {},
    weather: "CLEAR",
    weatherCleared: true,
    haggleState: "NONE",
    haggleMult: 1.0,
    haggleExtraRisk: 0,
    offeredBribeBeforeHaggleFail: false,
    activePhoneCall: null,
    shiftPhoneCallUsed: false,
    stampSlam: null,
    stampSlamSeq: 0,
    stampSlamRenderedSeq: 0,
    recurringArcs: { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 }
  };

  function triggerHaptic(pattern) {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  }

  function rollDailyWeather(daySpec, sandboxMod, isSandbox) {
    const dNum = daySpec ? daySpec.dayNumber : 1;
    const mId = sandboxMod && sandboxMod.id ? sandboxMod.id : "";
    const hintUk = daySpec && daySpec.wantedHint && daySpec.wantedHint.uk ? daySpec.wantedHint.uk.toLowerCase() : "";
    if (mId === "FOG_NIGHT") return "FOG";
    if (mId === "DRONE_BLACKOUT") return "STORM";
    if (mId === "BORDER_AMNESTY_COFFEE" || hintUk.includes("сніг")) return "SNOW";
    if (!isSandbox) {
      if (dNum === 1) return "CLEAR";
      if (dNum === 2) return "RAIN";
      if (dNum === 3) return "FOG";
      if (dNum === 4) return "SNOW";
      if (dNum === 5 || dNum === 7) return "STORM";
      if (dNum === 6) return pick(["RAIN", "FOG", "SNOW", "STORM"]);
    }
    return pick(["CLEAR", "RAIN", "FOG", "SNOW", "STORM"]);
  }

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
      if (!state.recurringArcs) state.recurringArcs = { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 };
      if (!state.weather) state.weather = "CLEAR";
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
    const baseAmt = (currency === "USD" || offer.isFriendlyGift) ? offer.amount : (offer.amount < 500 ? offer.amount * 5 : offer.amount);
    const haggleMult = (!offer.isFriendlyGift && state.haggleState === "WON" && state.haggleMult) ? state.haggleMult : 1.0;
    const amt = Math.round(baseAmt * rankScale * modMult * jacketMult * ringMult * audiMult * prepMult * intimidateMult * haggleMult);
    return {
      amount: amt,
      currency,
      symbol: currency === "USD" ? "💵" : "🪙",
      display: currency === "USD" ? `${amt.toLocaleString("en-US")} 💵` : `${amt.toLocaleString("en-US")} 🪙`,
      isInstant: Boolean(offer.instantOffer),
      requiresDiscovery: Boolean(offer.requiresDiscovery),
      boostedByIntimidate: Boolean(state.intimidateBribeBoosted && !offer.isFriendlyGift),
      boostedByHaggle: Boolean(!offer.isFriendlyGift && state.haggleState === "WON"),
      hagglePct: Math.round((haggleMult - 1) * 100)
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
      if (!state.recurringArcs) state.recurringArcs = { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 };
      if (!state.weather) state.weather = "CLEAR";
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
    let base;
    if (!state.isSandbox) {
      base = {
        id: "CAMPAIGN_INSPECTOR",
        title: L("Інспектор ДПСК", "SBGS Inspector"),
        salary: 480,
        perkLabel: L("Сюжетний режим (перки Архіву активні)", "Story mode (Archive perks active)"),
        dogCost: 8,
        freeFirstMistake: false,
        dailyRiskHeal: 0
      };
    } else {
      const d = state.daySpec ? state.daySpec.dayNumber : 1;
      if (d >= 20) {
        base = {
          id: "REGIONAL_CURATOR",
          title: L("Регіональний куратор ДПСК", "Regional SBGS Curator"),
          salary: 1800,
          perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -8% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -8% NABK/day"),
          dogCost: 0,
          freeFirstMistake: true,
          dailyRiskHeal: 8
        };
      } else if (d >= 14) {
        base = {
          id: "CHECKPOINT_CHIEF",
          title: L("Начальник КПП", "Checkpoint Chief"),
          salary: 1400,
          perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -6% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -6% NABK/day"),
          dogCost: 0,
          freeFirstMistake: true,
          dailyRiskHeal: 6
        };
      } else if (d >= 8) {
        base = {
          id: "CHIEF_CUSTOMS",
          title: L("Старший офіцер митниці", "Chief Customs Officer"),
          salary: 1100,
          perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -5% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -5% NABK/day"),
          dogCost: 0,
          freeFirstMistake: true,
          dailyRiskHeal: 5
        };
      } else if (d >= 5) {
        base = {
          id: "DEPUTY_PALYCH",
          title: L("Заступник Пал Палича", "Palych's Deputy"),
          salary: 800,
          perkLabel: L("🔓 Перки: 1-ша помилка 0 🪙 • Пес -4с", "🔓 Perks: 1st Mistake 0 🪙 • Dog -4s"),
          dogCost: 4,
          freeFirstMistake: true,
          dailyRiskHeal: 0
        };
      } else if (d >= 3) {
        base = {
          id: "SENIOR_SHIFT",
          title: L("Старший зміни", "Senior Shift Inspector"),
          salary: 600,
          perkLabel: L("🔓 Перк: Пес «Бавовна» витрачає 4с замість 8с", "🔓 Perk: Sniffer dog costs 4s instead of 8s"),
          dogCost: 4,
          freeFirstMistake: false,
          dailyRiskHeal: 0
        };
      } else {
        base = {
          id: "JUNIOR",
          title: L("Молодший інспектор", "Junior Inspector"),
          salary: 450,
          perkLabel: L("Підніміться до Дня 3 для 1-го рангового перку!", "Reach Day 3 to unlock your first Rank Perk!"),
          dogCost: 8,
          freeFirstMistake: false,
          dailyRiskHeal: 0
        };
      }
    }
    if (state.sbkColonelPromoted) {
      return {
        id: "SBK_COLONEL",
        title: L("🕵️ Таємний Полковник СБК («Кордон-7»)", "🕵️ Covert SBK Colonel ('Border-7')"),
        salary: Math.max(1300, base.salary),
        perkLabel: L("🔓 Перки: Пес 0с • 1-ша помилка 0 🪙 • -6% НАБК/день", "🔓 Perks: Dog 0s • 1st Mistake 0 🪙 • -6% NABK/day"),
        dogCost: 0,
        freeFirstMistake: true,
        dailyRiskHeal: Math.max(6, base.dailyRiskHeal)
      };
    }
    if (state.isUndercoverSbkAgent) {
      return {
        id: "SBK_AGENT",
        title: L("🕵️ Негласний агент СБК («Кордон-7»)", "🕵️ Undercover SBK Agent ('Border-7')"),
        salary: Math.max(700, base.salary + 150),
        perkLabel: L("🔓 Перк: +600 🪙/арешт • Пес -4с", "🔓 Perk: +600 🪙/arrest • Dog -4s"),
        dogCost: Math.min(4, base.dogCost),
        freeFirstMistake: base.freeFirstMistake,
        dailyRiskHeal: Math.max(3, base.dailyRiskHeal)
      };
    }
    return base;
  }

  function getEffectiveBossCut() {
    const bribeUsd = state.shiftBribesTotal > 0 ? Math.round((state.shiftBribesTotal * 0.18) / USD_UAH_RATE) : 0;
    const baseUsd = Math.min(900, Math.max(80, 50 + bribeUsd));
    return state.ownedAssets.includes("rolex_watch") ? Math.max(40, Math.round(baseUsd * 0.5)) : baseUsd;
  }

  function getPassiveRent() {
    const assetRent = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
    const addonRent = ASSET_ADDONS.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
    const sbkCovertPay = state.isUndercoverSbkAgent ? (state.sbkColonelPromoted ? 4500 : 2200) : 0;
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
    const freshArcs = { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 };
    const startWeather = rollDailyWeather(baseDay, mod, sandbox);
    state = Object.assign(state, {
      phase: "MORNING_BRIEFING",
      isSandbox: sandbox,
      dayIndex: 0,
      daySpec: baseDay,
      sandboxMod: mod,
      weather: startWeather,
      weatherCleared: true,
      haggleState: "NONE",
      haggleMult: 1.0,
      haggleExtraRisk: 0,
      offeredBribeBeforeHaggleFail: false,
      activePhoneCall: null,
      shiftPhoneCallUsed: false,
      stampSlam: null,
      stampSlamSeq: 0,
      stampSlamRenderedSeq: 0,
      recurringArcs: freshArcs,
      queue: generateDailyQueue(baseDay, sandbox ? 14 : 12, sandbox, freshArcs),
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
      totalCareerBribes: 0,
      shiftBribesTotal: 0,
      shiftBribesCount: 0,
      shiftFinesTotal: 0,
      shiftSalaryEarned: 0,
      shiftBountiesEarned: 0,
      shiftExtrasEarned: 0,
      shiftEarnedUsd: 0,
      shiftCombo: 0,
      shiftBestCombo: 0,
      shiftGrade: null,
      shiftGradeBonus: 0,
      openedDocIndices: [],
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
    state.shiftPhoneCallUsed = false;
    state.activePhoneCall = null;
    state.stampSlam = null;
    const wDef = (typeof WEATHER_DEFS !== "undefined" && WEATHER_DEFS[state.weather || "CLEAR"]) || { shortTag: L("🌙 Ясно", "🌙 Clear") };
    state.shiftLogs = [
      { color: "#B0BEC5", text: L(`Зміна Дня ${state.daySpec.dayNumber} почалася (${wDef.shortTag.uk}). Перевіряйте документи й багажник.`, `Day ${state.daySpec.dayNumber} shift started (${wDef.shortTag.en}). Inspect docs & trunks.`) }
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

  function maybeSpawnLivePhoneCall(t) {
    if (state.shiftPhoneCallUsed || !t) return;
    const dNum = state.daySpec ? state.daySpec.dayNumber : 1;
    if (!state.isSandbox && dNum < 2) return;
    if (state.travelerIdx === 0 || state.travelerIdx === 4) return;
    const tag = t.storyTag || "";
    if (tag === "NABK_STING" || tag === "INTEL_ALLY" || tag.startsWith("SHYTOMYR_") || tag.startsWith("VASYA_")) return;
    const chance = state.travelerIdx >= 6 ? 1.0 : 0.38;
    if (Math.random() >= chance) return;

    const pool = [];
    const reqDet = Boolean(t.isWantedTarget || (t.violations && t.violations.some(v => v.requiresDetention)));
    if (!t.shouldBeApproved && tag !== "FSM_SPY" && tag !== "SABOTEUR" && !t.isWantedTarget) {
      pool.push({
        type: "PALYCH_FAVOR",
        caller: L("🧢 Пал Палич (Пряма лінія)", "🧢 Pal Palych (Direct Line)"),
        message: L(
          "«Слухай уважно, інспекторе! За цього мандрівника люди зверху попросили. Натискай ✔ ПРОПУСТИТИ без штрафів — матимеш +250 💵 і +18 до моєї поваги!»",
          "'Listen closely! Brass asked a favor for this traveler. Press ✔ APPROVE — zero fine, +250 💵 & +18 my rep!'"
        ),
        rewardHint: L("Умова: ✔ ПРОПУСТИТИ → +250 💵, +18 Палич, без штрафу (+8% НАБК)", "Order: ✔ APPROVE → +250 💵, +18 Palych, zero fine (+8% NABK)"),
        logLine: L("☎️ Пал Палич (телефон): «Пропусти цього клієнта — +250 💵 і +18 поваги!»", "☎️ Palych (Phone): 'Wave this traveler through — +250 💵 & +18 rep!'")
      });
    }
    if (!t.shouldBeApproved && (t.hasContraband || t.bribeOffer) && tag !== "FSM_SPY" && tag !== "SABOTEUR") {
      pool.push({
        type: "TOLIK_FAVOR",
        caller: L("🚐 Толік «Бусик» (Закритий канал)", "🚐 Tolik 'Busyk' (Encrypted Line)"),
        message: L(
          "«Бро, на лінії свій борт! Пропусти цю машину прямо зараз без шмону — скину +400 💵 у бардачок і +22 довіри синдикату!»",
          "'Bro, that ride is ours! Wave them ✔ APPROVE right now — +400 💵 & +22 Syndicate trust!'"
        ),
        rewardHint: L("Умова: ✔ ПРОПУСТИТИ → +400 💵, +22 Толік, -10 СБК (+10% НАБК)", "Order: ✔ APPROVE → +400 💵, +22 Tolik, -10 SBK (+10% NABK)"),
        logLine: L("☎️ Толік (телефон): «Мій борт на смузі — пропусти за +400 💵 і +22 довіри!»", "☎️ Tolik (Phone): 'My crew at gate — approve for +400 💵 & +22 trust!'")
      });
    }
    if (!t.shouldBeApproved && reqDet) {
      pool.push({
        type: "SBK_URGENT",
        caller: L("🦅 Майор СБК «Тихий» (Терміново)", "🦅 SBK Major 'Quiet' (Urgent)"),
        message: L(
          "«КПП, тримайте суб'єкта на смузі! Оперативна група вже поруч — оформлюй 🚨 СБК / АРЕШТ негайно: зверху +1 800 🪙 і +10 СБК!»",
          "'Gate, hold this subject! Quick-response squad inbound — hit 🚨 DETAIN for +1,800 🪙 & +10 SBK!'"
        ),
        rewardHint: L("Умова: 🚨 СБК / АРЕШТ → +1 800 🪙 премії та +10 СБК", "Order: 🚨 DETAIN → +1,800 🪙 extra bounty & +10 SBK"),
        logLine: L("☎️ СБК (телефон): «Терміновий арешт фігуранта — +1 800 🪙 і +10 СБК!»", "☎️ SBK (Phone): 'Urgent arrest order — +1,800 🪙 & +10 SBK!'")
      });
    }
    pool.push({
      type: "NABK_AUDIT",
      caller: L("🕵️ Гаряча лінія ДПСК / НАБК", "🕵️ SBGS / NABK Spot Audit Line"),
      message: L(
        "«Контрольний аудит поста по камерах! Оформіть цього мандрівника суворо за статутом (без хабарів) — знімемо -10% ризику НАБК і дамо +800 🪙 премії!»",
        "'Live camera audit! Process this traveler strictly per protocol — removes -10% NABK risk & awards +800 🪙!'"
      ),
      rewardHint: L("Умова: Правильно за статутом (без конвертів) → -10% НАБК, +800 🪙", "Order: Strict protocol (no bribes) → -10% NABK, +800 🪙"),
      logLine: L("☎️ Аудит НАБК (телефон): «Оформіть суворо за законом — -10% НАБК і +800 🪙!»", "☎️ NABK Audit (Phone): 'Process strictly by rules — -10% NABK & +800 🪙!'")
    });

    const chosen = pick(pool);
    state.shiftPhoneCallUsed = true;
    state.activePhoneCall = Object.assign({}, chosen, { answered: false, dismissed: false });
    audio.playPhoneRing();
    triggerHaptic([35, 50, 35]);
    pushShiftLog("#FFD54F", L("☎️ Вхідний дзвінок на пост! Підійми слухавку біля вікна!", "☎️ Desk phone ringing! Answer the line at the booth!"));
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
    state.openedDocIndices = [];
    state.haggleState = "NONE";
    state.haggleMult = 1.0;
    state.haggleExtraRisk = 0;
    state.offeredBribeBeforeHaggleFail = false;
    state.activePhoneCall = null;
    if (state.weather === "FOG") {
      state.weatherCleared = Boolean(state.ownedAssets && state.ownedAssets.includes("uv_spotlight"));
    } else if (state.weather === "SNOW") {
      state.weatherCleared = Boolean(state.ownedAssets && (state.ownedAssets.includes("laser_plate_reader") || state.ownedAssets.includes("heated_booth_seat")));
    } else {
      state.weatherCleared = true;
    }
    const t = state.queue[state.travelerIdx];
    state.oblikIsScreenshot = Boolean(t && t.violations.some(v => v.code === "INVALID_QR_CODE") && Math.random() < 0.5);
    const zones = ["TRUNK", "SPARE", "GLOVE"];
    if (t && t.storyTag === "NABK_STING") {
      state.dogTargetZone = "GLOVE";
    } else {
      state.dogTargetZone = (t && (t.hasContraband || t.storyTag === "DUAL_CITIZEN")) ? pick(zones) : null;
    }
    if (t && !t.storyTag) {
      const h = Math.abs((t.id || "TRV").split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7));
      state.currentUvEasterEgg = (h % 2 === 0) ? UV_SECRET_STAMPS[h % UV_SECRET_STAMPS.length] : null;
    } else {
      state.currentUvEasterEgg = null;
    }
    maybeSpawnLivePhoneCall(t);
  }

  setInterval(() => {
    if (state.phase !== "BOOTH_SHIFT" || state.sirenActive) return;
    const encDialog = document.getElementById("encounter-dialog");
    if (encDialog && encDialog.open) return;

    state.shiftSec = Math.max(0, state.shiftSec - 1);
    if (state.weather === "STORM" && state.shiftSec > 0 && state.shiftSec % 23 === 0) {
      audio.playThunder();
    }
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
    state.activePhoneCall = null;
    state.nextBribeBoost = 0;
    const noBribes = (state.shiftBribesCount || 0) === 0 && (state.shiftBribesTotal || 0) === 0;
    if (noBribes && state.shiftProcessed >= 5) {
      unlockAgencyBadge("NABK_CLEAN");
      state.underSurveillance = false;
    }
    state.shiftGradeBonus = 0;
    if (state.shiftProcessed >= 8 && state.shiftMistakes === 0 && noBribes) {
      state.shiftGrade = "S";
      state.shiftGradeBonus = 800;
      state.money += 800;
      state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + 800;
    } else if (state.shiftProcessed >= 6 && state.shiftMistakes <= 1) {
      state.shiftGrade = "A";
    } else if (state.shiftMistakes <= 2 && state.shiftCorrect >= Math.ceil(state.shiftProcessed * 0.5)) {
      state.shiftGrade = "B";
    } else if (state.shiftMistakes <= 4) {
      state.shiftGrade = "C";
    } else {
      state.shiftGrade = "D";
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
    const isFriendlyGift = Boolean(t.bribeOffer && t.bribeOffer.isFriendlyGift);
    if (state.bribeAccepted && !isApprove && !isFriendlyGift) {
      return;
    }
    const bribeOfferInfo = getComputedBribe(t.bribeOffer);
    const criminalBribeOffer = Boolean(
      t.bribeOffer &&
      !isFriendlyGift &&
      !state.bribeAccepted &&
      bribeOfferInfo &&
      (bribeOfferInfo.isInstant || state.vehicleInspected || state.spottedCodes.length > 0 || state.interrogated || state.offeredBribeBeforeHaggleFail)
    );
    const requiresDetain = t.isWantedTarget || t.violations.some(v => v.requiresDetention);
    const canDetain = requiresDetain || criminalBribeOffer;
    const excessiveDetain = isDetain && !t.shouldBeApproved && !canDetain;
    const missedArrest = decisionType === "DENY" && !t.shouldBeApproved && requiresDetain;

    let ruleCorrect = false;
    let usdBonus = 0;
    if (decisionType === "APPROVE") ruleCorrect = t.shouldBeApproved;
    else if (decisionType === "DENY") ruleCorrect = !t.shouldBeApproved && !requiresDetain;
    else if (decisionType === "DETAIN") ruleCorrect = (!t.shouldBeApproved || criminalBribeOffer) && canDetain;

    const bribedPass = state.bribeAccepted && isApprove && !isFriendlyGift;
    const isStingOrRaid = bribedPass && (t.storyTag === "NABK_STING" || (state.nabkRisk >= 75 && Math.random() < 0.35));
    const answeredCall = (state.activePhoneCall && state.activePhoneCall.answered) ? state.activePhoneCall : null;
    const phoneFavorPass = Boolean(answeredCall && (answeredCall.type === "PALYCH_FAVOR" || answeredCall.type === "TOLIK_FAVOR") && isApprove);
    const rank = getRank();
    const meta = getMetaPerkFlags();

    let salaryDelta = 0, fineDelta = 0, detainBonus = 0;
    let comboMultUsed = 1.0;
    if (bribedPass) {
      // Bribe pass: resets honest streak, does NOT increment shiftCorrect; sanctions apply if sting/raid!
      state.shiftCombo = 0;
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
      }
    } else if (ruleCorrect) {
      state.shiftCombo = (state.shiftCombo || 0) + 1;
      state.shiftBestCombo = Math.max(state.shiftBestCombo || 0, state.shiftCombo);
      comboMultUsed = state.shiftCombo >= 8 ? 1.5 : (state.shiftCombo >= 5 ? 1.3 : (state.shiftCombo >= 3 ? 1.15 : 1.0));
      if (state.shiftCombo === 3 || state.shiftCombo === 5 || state.shiftCombo === 8) {
        audio.playComboChime(state.shiftCombo);
      }
      const weatherSalMult = state.weather === "STORM" ? 1.10 : 1.0;
      const salMult = (state.sandboxMod && state.sandboxMod.salaryMult ? state.sandboxMod.salaryMult : 1.0) * meta.salaryBonusMult * comboMultUsed * weatherSalMult;
      const detectorBonus = state.ownedAssets.includes("money_detector") ? 120 : 0;
      salaryDelta = Math.round(rank.salary * salMult) + detectorBonus;
      if (isDetain && canDetain) {
        const badges = loadAgencyBadges();
        const undercoverBounty = state.isUndercoverSbkAgent ? 600 : 0;
        const isHighValueSpyOrVip = t.isWantedTarget || t.storyTag === "FSM_SPY" || t.storyTag === "SABOTEUR" || t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE" || t.storyTag === "DUAL_CITIZEN";
        const bountyDay = state.daySpec ? state.daySpec.dayNumber : 1;
        const bountyRamp = Math.min(1.4, 0.8 + 0.08 * (bountyDay - 1));
        const baseDetainBounty = Math.round((isHighValueSpyOrVip
          ? (2400 + Math.floor(Math.random() * 1201))
          : (900 + Math.floor(Math.random() * 501))) * bountyRamp);
        const badgeBonus = (badges.includes("SBK_SHIELD") ? 400 : 0) + (badges.includes("VSP_GUARD") && (t.storyTag === "DUAL_CITIZEN" || t.storyTag === "VIP_DIVERSE") ? 600 : 0);
        const tabletBonus = state.ownedAssets.includes("sbk_database_tablet") ? Math.round(baseDetainBounty * 0.2) : 0;
        const amberBonus = (state.shytomyrRelics && state.shytomyrRelics.includes("RELIC_AMBER_BEETLE")) ? Math.round(baseDetainBounty * 0.15) : 0;
        detainBonus = baseDetainBounty + undercoverBounty + badgeBonus + tabletBonus + amberBonus + (state.sandboxMod ? (state.sandboxMod.detainExtra || 0) : 0);
        if (isHighValueSpyOrVip) {
          usdBonus = Math.round((60 + Math.floor(Math.random() * 51)) * bountyRamp) + (state.isUndercoverSbkAgent ? 50 : 0);
        } else {
          usdBonus = 0;
        }
        state.usd += usdBonus;
        state.sbkRep = Math.min(100, state.sbkRep + (isHighValueSpyOrVip ? 12 : 4));
        state.totalCareerDetained += 1;
        if (state.totalCareerDetained >= 3) unlockAgencyBadge("SBK_SHIELD");
        if (t.storyTag === "FSM_SPY") { unlockAgencyBadge("GUR_FALCON"); unlockDiscovery("DISC_FSM_SPY"); }
        if (t.storyTag === "DUAL_CITIZEN") unlockAgencyBadge("VSP_GUARD");
        if (t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE" || t.isWantedTarget) {
          state.nabkRisk = Math.max(0, state.nabkRisk - 10);
          unlockDiscovery("DISC_VIP_CORRUPTOR");
        }
        if (state.isUndercoverSbkAgent && isHighValueSpyOrVip) {
          state.spiesCaughtAsAgent += 1;
          state.nabkRisk = Math.max(0, state.nabkRisk - 6);
        }
      }
      if (state.ownedAssets.includes("laser_plate_reader")) {
        state.shiftSec += 3;
      }
      state.shiftCorrect += 1;
      state.shiftSalaryEarned = (state.shiftSalaryEarned || 0) + salaryDelta;
      state.shiftBountiesEarned = (state.shiftBountiesEarned || 0) + detainBonus;
      state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + usdBonus;
    } else if (phoneFavorPass) {
      // Mid-inspection Phone Directive favor: waives fine safely in exchange for rep/NABK risk
      state.shiftCombo = 0;
    } else {
      state.shiftCombo = 0;
      const isHighRiskTarget = t.isWantedTarget || t.storyTag === "FSM_SPY" || t.storyTag === "SABOTEUR" || t.storyTag === "TOP_CORRUPTOR" || t.storyTag === "DEPUTY_ESCAPEE";
      if (missedArrest) {
        audio.playWarn();
        fineDelta = 450;
        if (state.shiftMistakes === 0 && rank.freeFirstMistake) {
          fineDelta = 0;
        } else if (state.shiftMistakes === 0 && meta.halfFirstFine) {
          fineDelta = Math.round(fineDelta * 0.5);
        }
        state.sbkRep = Math.max(0, state.sbkRep - 6);
        state.palychRep = Math.max(0, state.palychRep - 4);
      } else if (isDetain && t.shouldBeApproved) {
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

    // Apply answered Live Desk Phone Call outcomes
    let phoneCallToast = null;
    if (answeredCall) {
      if (answeredCall.type === "PALYCH_FAVOR") {
        if (isApprove && !isStingOrRaid) {
          state.usd += 250;
          usdBonus += 250;
          state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + 250;
          state.palychRep = Math.min(100, state.palychRep + 18);
          state.nabkRisk = Math.min(100, state.nabkRisk + 8);
          phoneCallToast = L("☎️ НАКАЗ ПАЛИЧА ВИКОНАНО: +250 💵, +18 Палич!", "☎️ PALYCH FAVOR DONE: +250 💵, +18 Palych!");
        } else if (!isApprove) {
          state.palychRep = Math.max(0, state.palychRep - 8);
        }
      } else if (answeredCall.type === "TOLIK_FAVOR") {
        if (isApprove && !isStingOrRaid) {
          state.usd += 400;
          usdBonus += 400;
          state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + 400;
          state.tolikRep = Math.min(100, state.tolikRep + 22);
          state.sbkRep = Math.max(0, state.sbkRep - 10);
          state.nabkRisk = Math.min(100, state.nabkRisk + 10);
          phoneCallToast = L("☎️ РЕЙС ТОЛІКА ПРОЙШОВ: +400 💵, +22 Толік!", "☎️ TOLIK FAVOR DONE: +400 💵, +22 Tolik!");
        } else if (!isApprove) {
          state.tolikRep = Math.max(0, state.tolikRep - 10);
        }
      } else if (answeredCall.type === "SBK_URGENT" && isDetain && ruleCorrect) {
        detainBonus += 1800;
        state.shiftBountiesEarned = (state.shiftBountiesEarned || 0) + 1800;
        state.sbkRep = Math.min(100, state.sbkRep + 10);
        phoneCallToast = L("☎️ ОПЕРАТИВНИЙ АРЕШТ СБК: +1 800 🪙, +10 СБК!", "☎️ SBK HOTLINE ARREST: +1,800 🪙, +10 SBK!");
      } else if (answeredCall.type === "NABK_AUDIT") {
        if (ruleCorrect && !bribedPass) {
          detainBonus += 800;
          state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + 800;
          state.nabkRisk = Math.max(0, state.nabkRisk - 10);
          phoneCallToast = L("☎️ АУДИТ НАБК ПРОЙДЕНО: -10% НАБК, +800 🪙!", "☎️ NABK AUDIT PASSED: -10% NABK, +800 🪙!");
        } else if (bribedPass) {
          state.nabkRisk = Math.min(100, state.nabkRisk + 15);
        }
      }
    }

    // Add time per processed traveler so dynamic shifts reward pace!
    state.shiftSec = Math.min(320, state.shiftSec + ((ruleCorrect || ((bribedPass || phoneFavorPass) && !isStingOrRaid)) ? 8 : 4));

    if (state.reprimands >= 3) {
      triggerEnding((isStingOrRaid || state.nabkRisk >= 85) ? "NABK_PRISONER" : "WRITTEN_OFF_RESERVE");
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
        if (gf.bonusMoney) { detainBonus += gf.bonusMoney; state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + gf.bonusMoney; }
        if (gf.bonusUsd) { usdBonus += gf.bonusUsd; state.usd += gf.bonusUsd; state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + gf.bonusUsd; }
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
        state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + 1500;
        state.nabkRisk = Math.max(0, state.nabkRisk - 30);
        shytomyrBonusToast = L(
          "🧦 ОРДЕН ШИТОМИРА (12/12): Усі 12 легенд міста в зборі! +1500 🪙, імунітет і відкрито секретний титул Мера!",
          "🧦 ORDER OF SHYTOMYR (12/12): All 12 city legends welcomed! +1500 🪙 & Secret Mayor title unlocked!"
        );
      } else if (state.shytomyrFriendsMet.length > 0 && state.shytomyrFriendsMet.length % 3 === 0) {
        detainBonus += 300;
        state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + 300;
        const setMsgUk = `🧦 +300 🪙 бонусу громади (${globalShytomyr.length}/12)`;
        const setMsgEn = `🧦 +300 🪙 community bonus (${globalShytomyr.length}/12)`;
        shytomyrBonusToast = shytomyrBonusToast
          ? L(`${shytomyrBonusToast.uk} + ${setMsgUk}`, `${shytomyrBonusToast.en} + ${setMsgEn}`)
          : L(setMsgUk, setMsgEn);
      }
    }

    if (t.storyTag === "INTEL_ALLY" && isApprove) {
      detainBonus += 500;
      usdBonus += 75;
      state.usd += 75;
      state.shiftBountiesEarned = (state.shiftBountiesEarned || 0) + 500;
      state.shiftEarnedUsd = (state.shiftEarnedUsd || 0) + 75;
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
    if (t.storyTag === "NABK_STING" && !isApprove && !bribedPass) {
      state.campaignFlags.refusedNabk = true;
      unlockDiscovery("DISC_NABK_STING");
    }

    // Track Recurring Client Mini-Arcs (Vasyl 'Chameleon' 4-act arc + Grandpa Stepan memory)
    if (!state.recurringArcs) {
      state.recurringArcs = { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 };
    }
    let vasyaToast = null;
    if (t.storyTag && t.storyTag.startsWith("VASYA_")) {
      const vArc = state.recurringArcs.vasya || (state.recurringArcs.vasya = { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false });
      vArc.lastOutcome = isApprove ? "APPROVED" : (isDetain ? "DETAINED" : "DENIED");
      if (t.storyTag !== "VASYA_FINALE_CLEAN" && t.storyTag !== "VASYA_FINALE_BOSS") {
        if (isApprove) vArc.approved = (vArc.approved || 0) + 1;
        else vArc.caught = (vArc.caught || 0) + 1;
        vArc.stage = Math.min(3, (vArc.stage || 0) + 1);
      } else {
        vArc.stage = 4;
        vArc.completed = true;
        unlockDiscovery("DISC_VASYA_ARC");
        if (t.storyTag === "VASYA_FINALE_CLEAN" && isApprove) {
          detainBonus += 1200;
          state.shiftExtrasEarned = (state.shiftExtrasEarned || 0) + 1200;
          state.familyMorale = Math.min(100, state.familyMorale + 12);
          state.sbkRep = Math.min(100, state.sbkRep + 8);
          vasyaToast = L("🎭 ФІНАЛ ВАСИЛЯ: Твоя строгість виправила афериста — тепер він чесний волонтер! (+1 200 🪙, +12% сім'я)", "🎭 VASYL FINALE: Reformed trickster is now an honest volunteer! (+1,200 🪙, +12% family)");
        } else if (t.storyTag === "VASYA_FINALE_BOSS" && isDetain && ruleCorrect) {
          detainBonus += 1500;
          state.shiftBountiesEarned = (state.shiftBountiesEarned || 0) + 1500;
          vasyaToast = L("🎭 ФІНАЛ ВАСИЛЯ: Спіймано VIP-контрабандиста Хамелеона! (+1 500 🪙 премії)", "🎭 VASYL FINALE: Captured Chameleon Kingpin! (+1,500 🪙 bounty)");
        }
      }
    }
    if (t.storyTag && t.storyTag.startsWith("STEPAN_") && isApprove) {
      state.recurringArcs.stepanMet = (state.recurringArcs.stepanMet || 0) + 1;
    }

    const netMoney = salaryDelta + detainBonus - fineDelta;
    state.money = Math.max(0, state.money + netMoney);
    state.shiftProcessed += 1;
    if (isDetain) state.shiftDetained += 1;
    state.shiftFinesTotal += fineDelta;
    updateCareerStats({ processed: 1, detained: (isDetain && ruleCorrect) ? 1 : 0, cash: state.money });

    const bribeDetainMsg = (ruleCorrect && isDetain && !requiresDetain && criminalBribeOffer)
      ? (t.storyTag === "NABK_STING"
        ? L("Провокацію НАБК з міченими купюрами задокументовано! Спроба підкупу зафіксована.", "NABK marked-bill provocation documented! Bribery attempt recorded.")
        : L("Водій запропонував хабар службовій особі — оформлено кримінальний протокол (ст. 369)!", "Driver offered a bribe to an officer — criminal protocol filed!"))
      : null;

    let slamKind = "error";
    let slamLabel = L("❌ ПОМИЛКА!", "❌ MISTAKE!");
    if (isStingOrRaid) { slamKind = "error"; slamLabel = L("🚨 СПАЛЕНО!", "🚨 BUSTED!"); }
    else if (phoneFavorPass) { slamKind = "bribe"; slamLabel = L("☎️ ДЗВІНОК ЗВЕРХУ", "☎️ DIRECT ORDER"); }
    else if (bribedPass) { slamKind = "bribe"; slamLabel = L("✉️ ДОМОВЛЕНО", "✉️ BRIBED"); }
    else if (ruleCorrect && isDetain) { slamKind = "detain"; slamLabel = L("🚨 СБК АРЕШТ", "🚨 SBK ARREST"); }
    else if (ruleCorrect && isApprove) { slamKind = "approve"; slamLabel = L("✔ ПРОПУЩЕНО", "✔ APPROVED"); }
    else if (ruleCorrect) { slamKind = "deny"; slamLabel = L("✖ ВІДМОВЛЕНО", "✖ DENIED"); }
    else if (missedArrest) { slamKind = "warn"; slamLabel = L("⚠️ УТІК!", "⚠️ ESCAPED!"); }
    state.stampSlamSeq = (state.stampSlamSeq || 0) + 1;
    state.stampSlam = { kind: slamKind, label: slamLabel, at: Date.now(), seq: state.stampSlamSeq };
    audio.playStampSlam(slamKind);
    triggerHaptic(slamKind === "error" || slamKind === "warn" ? [45, 30, 45] : (slamKind === "detain" ? [30, 20, 40] : 22));

    state.barrierState = isApprove ? "OPEN_APPROVED" : (isDetain ? "SBK_ARREST_FLASH" : "CLOSED");
    state.lastFeedbackAt = Date.now();
    state.lastFeedback = {
      ok: ruleCorrect || ((bribedPass || phoneFavorPass) && !isStingOrRaid),
      title: shytomyrBonusToast
        ? L("🧦 БРАТЕРСТВО М. ШИТОМИР!", "🧦 ORDER OF SHYTOMYR!")
        : (vasyaToast
          ? L("🎭 ІСТОРІЯ ВАСИЛЯ ХАМЕЛЕОНА", "🎭 VASYL CHAMELEON ARC")
          : (phoneCallToast && (phoneFavorPass || (ruleCorrect && !bribedPass))
            ? L("☎️ ВКАЗІВКУ ПО ТЕЛЕФОНУ ВИКОНАНО", "☎️ PHONE DIRECTIVE COMPLETED")
            : (isStingOrRaid
              ? L("🚨 СПАЛИЛИ НА ХАБАРІ! (+1 ДОГАНА)", "🚨 BUSTED ON BRIBE! (+1 REPRIMAND)")
              : (phoneFavorPass
                ? L("☎️ ПРОПУЩЕНО ЗА ДЗВІНКОМ", "☎️ WAVED BY PHONE ORDER")
                : (bribedPass
                  ? L("ЗАКРИТО ОЧІ (ЗА ХАБАР)", "LOOKED THE OTHER WAY (BRIBED)")
                  : (bribeDetainMsg
                    ? L("СПРОБУ ХАБАРЯ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "BRIBE ATTEMPT DETAINED! (+SBK BONUS)")
                    : (ruleCorrect && isDetain ? L("КРИМІНАЛ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "CRIMINAL DETAINED! (+SBK BONUS)") : (ruleCorrect ? L("РІШЕННЯ ПРАВИЛЬНЕ", "CORRECT DECISION") : (missedArrest ? L("⚠️ ПОРУШНИК УТІК! Треба 🚨 СБК / АРЕШТ", "⚠️ CRIMINAL ESCAPED! Should 🚨 DETAIN") : (excessiveDetain ? L("ПЕРЕВИЩЕННЯ! Треба ✖ ВІДМОВИТИ", "EXCESSIVE FORCE! Should ✖ DENY") : L("ПОМИЛКА ПРОТОКОЛУ! ШТРАФ", "PROTOCOL VIOLATION! FINE"))))))))))),
      detail: shytomyrBonusToast || vasyaToast || phoneCallToast || (isStingOrRaid ? L("Ти впіймався на підставі! За 3 догани звільнять (зникає через день).", "Caught in a sting! 3 reprimands = fired (decays next clean day).") : null) || bribeDetainMsg || (isDetain
        ? (state.contentMode === "FULL_18_PLUS" ? t.arrestFull : t.arrestToned)
        : (phoneFavorPass ? L("Без штрафу за розпорядженням по телефону.", "No fine per direct phone directive.") : (bribedPass ? L("Без штрафу, але ризик НАБК зріс.", "No fine, but NABK risk increased.") : (ruleCorrect ? L("Оформлено за директивою ДПСК.", "Processed per SBGS directive.") : (missedArrest ? L("Порушник із фальшивкою/контрабандою розвернувся і зник у черзі — його слід було затримати!", "Criminal with forgery/contraband bolted from the lane — detention was required!") : (t.violations[0] ? t.violations[0].title : L("Безпідставна відмова", "Wrongful denial"))))))),
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

    if ((state.daySpec ? state.daySpec.dayNumber : 1) >= 3 && state.totalCareerDetained >= 5 && state.sbkRep >= 65 && !state.sbkRecruitmentOffered) {
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
    const hasOffshoreShield = state.ownedAssets.includes("cyprus_offshore");
    if (!hasOffshoreShield && state.nabkRisk >= 75) {
      state.underSurveillance = true;
    }
    const bustedByCounterIntel = state.nabkRisk >= 100 || (!hasOffshoreShield && state.nabkRisk >= 95 && state.underSurveillance && (state.shiftBribesCount > 0 || state.shiftBribesTotal > 0));
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

    if (!state.recurringArcs) {
      state.recurringArcs = { vasya: { stage: 0, lastOutcome: null, approved: 0, caught: 0, completed: false }, stepanMet: 0 };
    }
    state.weather = rollDailyWeather(state.daySpec, state.sandboxMod, state.isSandbox);
    state.queue = generateDailyQueue(state.daySpec, state.isSandbox ? 14 : 12, state.isSandbox, state.recurringArcs);
    state.shiftProcessed = 0;
    state.shiftCorrect = 0;
    state.shiftMistakes = 0;
    state.shiftDetained = 0;
    state.shiftBribesTotal = 0;
    state.shiftBribesCount = 0;
    state.shiftFinesTotal = 0;
    state.shiftSalaryEarned = 0;
    state.shiftBountiesEarned = 0;
    state.shiftExtrasEarned = 0;
    state.shiftEarnedUsd = 0;
    state.shiftCombo = 0;
    state.shiftBestCombo = 0;
    state.shiftGrade = null;
    state.shiftGradeBonus = 0;
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
        "Майор СБК «Тихий» заходить у будку через службовий вхід і кладе на стіл чорне посвідчення:\n«Інспекторе, ти взяв уже не одного серйозного порушника. Нам потрібна своя негласна людина прямо в будці, під носом у Пал Палича та контрабандистів.\n\nПідписуй згоду як Негласний оперативник «Кордон-7»: отримуєш +2 200 🪙 окладу щоранку, +600 🪙 премії за кожного шпигуна, імунітет від доган Палича та -35% ціни на «Кришу»! Для легенди можеш брати конверти, але не доводь НАБК до обшуків!»",
        "SBK Major 'Quiet' enters the booth and places a black folder on your desk:\n'Inspector, you have sharp eyes. Sign on as Undercover Agent Border-7: earn +2,200 🪙 covert pay every morning, +600 🪙 extra bounty per spy, protection from Palych's reprimands & -35% Krysha cost!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "accept_sbk_agent",
          label: L("🕵️ Стати негласним агентом СБК «Кордон-7»! (+1 800 🪙 +150 💵)", "🕵️ Become Undercover Agent 'Border-7'! (+1,800 🪙 +150 💵)"),
          outcome: L("Ти підписав таємну угоду! Тепер ти негласний агент СБК «Кордон-7» (ціль: 4 небезпечні цілі)!", "You signed the covert agreement! Hunt 4 high-value operatives!"),
          moneyDelta: 1800, usdDelta: 150, timeDelta: 15, riskDelta: -15, sbkDelta: 15, tolikDelta: 0, palychDelta: 0, moraleDelta: 10,
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
        "Ти ліквідував цілу мережу шпигунів та контрабандистів, працюючи під прикриттям! Майор «Тихий» особисто вручає тобі коробку з погонами Полковника СБК та премію 4 000 🪙:\n\n«Агенте «Кордон-7», штаб у захваті! Ти можеш залишитися на пункті Таємним Куратором кордону (ставка від 1 300 🪙/людину + 4 500 🪙 щоранку), або переїхати в Центральний Штаб у Кийграді!»",
        "You dismantled the spy ring while undercover! Major 'Quiet' hands you Colonel's epaulets and a 4,000 🪙 reward:\n\n'Stay at the checkpoint as Secret Sector Commander (1,300 🪙+/traveler + 4,500 🪙/day) or transfer to Central HQ!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "stay_undercover_colonel",
          label: L("🕵️ Залишитися Таємним Полковником і ПРОДОВЖУВАТИ ГРУ! (+4 000 🪙 +400 💵)", "🕵️ Stay as Covert Colonel & KEEP PLAYING! (+4,000 🪙 +400 💵)"),
          outcome: L("Ти сховав погони полковника в сейф і залишився негласним господарем кордону!", "You locked the Colonel's epaulets in the safe and stayed as covert master of the border!"),
          moneyDelta: 4000, usdDelta: 400, timeDelta: 30, riskDelta: -30, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 20
        },
        {
          id: "retire_to_sbk_hq",
          label: L("🏛️ Очолити Центральний Штаб у Кийграді (+400 💵 премії — Досьє)", "🏛️ Lead Central HQ in Kyihrad (+400 💵 — Epilogue Dossier)"),
          outcome: L("Ти передаєш ключі від будки й від'їжджаєш до столиці!", "You depart for Kyihrad!"),
          moneyDelta: 4000, usdDelta: 400, timeDelta: 0, riskDelta: 0, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 20,
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
      title: L("🏁 СЕМИДЕННА ВАХТА ДОБІГЛА КІНЦЯ", "🏁 SEVEN-DAY CAMPAIGN COMPLETE"),
      desc: L(
        "Твій первинний 7-денний контракт інспектора завершено. Але це далеко не кінець!\n\nМожеш підбити підсумки вже зараз і побачити своє Персональне Досьє Долі — або перейти у Відкриту Кар'єру (День 8+ зі всіма грошима, купленими активами, контактами та підвищеннями) і будувати власну імперію далі!",
        "Your 7-day campaign contract is complete! You can wrap up now for your Personalized Fate Dossier — or seamlessly transition into Open Career Mode (Day 8+ keeping all your cash, assets, ranks & story)!"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "continue_open_career",
          label: L("♾️ Продовжити службу у Відкритій Кар'єрі (День 8+ з усім майном!)", "♾️ Continue into Open Career Mode (Day 8+ with everything!)"),
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
          label: L("🏆 Підбити підсумки 7 днів (Відкрити Персональний Епілог)", "🏆 Finish Campaign (View Personal Epilogue Dossier)"),
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
          onSelect: () => { triggerEnding("ESCAPED_IN_VAN"); return true; }
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

  function render() {
    stopMenuAnimation();
    updateMood();
    syncStampSlamHost();
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
        drawOnboardingBanner(obCanvas, tab, Date.now() * 0.001);
        if (typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickOb);
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
        const tickMorning = (ts) => {
          if (state.phase !== "MORNING_BRIEFING" || document.getElementById("morning-canvas") !== mCanvas) {
            window._phaseBannerRaf = null; return;
          }
          if (!lastM || ts - lastM >= 36) { lastM = ts; drawMorningBanner(mCanvas, d.dayNumber, (ts || Date.now()) * 0.001); }
          window._phaseBannerRaf = requestAnimationFrame(tickMorning);
        };
        drawMorningBanner(mCanvas, d.dayNumber, Date.now() * 0.001);
        if (typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickMorning);
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
            <div style="display:flex;flex-direction:column;line-height:1.15;font-weight:800;font-size:12px;text-align:right;">
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
                    const cornerBadge = hasSpotted
                      ? `<span class="desk-doc-badge spot">❗</span>`
                      : (isChecked ? `<span class="desk-doc-badge seen">👁️</span>` : "");
                    return `
                      <button type="button" id="desk-doc-${dIdx}" class="desk-doc-item${stateCls}" data-doc-idx="${dIdx}" style="background:${bg};color:${fg};border:1.5px solid ${bdr};">
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
        isLive: true
      };
      if (window._boothAnimRaf) {
        cancelAnimationFrame(window._boothAnimRaf);
        window._boothAnimRaf = null;
      }
      let lastBoothDraw = 0;
      function tickBoothAnim(nowTs) {
        if (state.phase !== "BOOTH_SHIFT" || document.getElementById("booth-canvas") !== boothCanvasEl) {
          window._boothAnimRaf = null;
          return;
        }
        if (!document.hidden && (!lastBoothDraw || nowTs - lastBoothDraw >= 33)) {
          lastBoothDraw = nowTs;
          boothSceneOpts.timeSec = (nowTs || Date.now()) * 0.001;
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
          drawBoothScene(boothCanvasEl, boothSceneOpts);
          const oblikClk = document.getElementById("oblik-live-clock");
          if (oblikClk && !state.oblikIsScreenshot) {
            oblikClk.textContent = `LIVE ${new Date().toTimeString().slice(0, 8)}`;
          }
        }
        window._boothAnimRaf = requestAnimationFrame(tickBoothAnim);
      }
      boothSceneOpts.timeSec = Date.now() * 0.001;
      drawBoothScene(boothCanvasEl, boothSceneOpts);
      window._boothAnimRaf = requestAnimationFrame(tickBoothAnim);

      const miniC = document.getElementById("passport-mini-canvas");
      if (miniC) {
        const mctx = miniC.getContext("2d");
        drawPortrait(mctx, t.passportPortrait, miniC.width * 0.5, miniC.height * 0.98, 0.44);
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
          pushShiftLog("#00E5FF", L(`${uvSecret.logText.uk}${sUk}`, `${uvSecret.logText.en}${sEn}`));
          render();
        });
      }

      // Inspector Reactions Bar Events
      document.getElementById("react-intimidate").addEventListener("click", () => {
        audio.playKnock();
        state.justShook = true;
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
        render();
      });

      document.getElementById("react-coffee").addEventListener("click", () => {
        audio.playCoffee();
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
            pushShiftLog("#FFB300", L(`📈 Торг вдався! Конверт зріс на +${pct}% (+2% НАБК).`, `📈 Haggle won! Bribe raised +${pct}% (+2% NABK).`));
          } else {
            state.haggleState = "FAILED";
            state.offeredBribeBeforeHaggleFail = true;
            state.nabkRisk = Math.min(100, state.nabkRisk + 3);
            audio.playHaggleFail();
            triggerHaptic([40, 25, 40]);
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
          if (state.phase !== "HOME_EVENING" || document.getElementById("evening-canvas") !== evCanvas) {
            window._phaseBannerRaf = null; return;
          }
          if (!lastEv || ts - lastEv >= 40) { lastEv = ts; drawEveningBanner(evCanvas, state, (ts || Date.now()) * 0.001); }
          window._phaseBannerRaf = requestAnimationFrame(tickEvening);
        };
        drawEveningBanner(evCanvas, state, Date.now() * 0.001);
        if (typeof requestAnimationFrame === "function") window._phaseBannerRaf = requestAnimationFrame(tickEvening);
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
})();
