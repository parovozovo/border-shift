(() => {
  "use strict";

  const SAVE_KEY = "border_shift_save_v3";

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

  // Discrepancy catalog with clear DENY vs DETAIN hints
  const DISCREPANCY = {
    EXPIRED_DATE: {
      code: "EXPIRED_DATE",
      requiresDetention: false,
      title: L("Прострочений документ", "Expired Document"),
      hint: L("Формальне порушення → ✖ ВІДМОВИТИ", "Formal violation → ✖ DENY")
    },
    AGE_RESTRICTION_NO_PERMIT: {
      code: "AGE_RESTRICTION_NO_PERMIT",
      requiresDetention: false,
      title: L("Чоловік 18–60 на виїзд без підстави", "Male 18–60 Exiting Without Permit"),
      hint: L("Немає підстави на виїзд → ✖ ВІДМОВИТИ", "No exit permit → ✖ DENY")
    },
    NAME_MISMATCH: {
      code: "NAME_MISMATCH",
      requiresDetention: true,
      title: L("Розбіжність ПІБ у документах", "Name Mismatch Across Documents"),
      hint: L("Чужий документ (Кримінал) → 🚨 АРЕШТ", "Stolen/Fake ID (Crime) → 🚨 DETAIN")
    },
    PHOTO_MISMATCH: {
      code: "PHOTO_MISMATCH",
      requiresDetention: true,
      title: L("Чуже фото в паспорті", "Passport Photo Mismatch"),
      hint: L("Підміна особи (Кримінал) → 🚨 АРЕШТ", "Impersonation (Crime) → 🚨 DETAIN")
    },
    FAKE_ISSUER_SEAL: {
      code: "FAKE_ISSUER_SEAL",
      requiresDetention: true,
      title: L("Підроблена печатка / ліва установа", "Forged Seal / Invalid Authority"),
      hint: L("Підробка документів (Кримінал) → 🚨 АРЕШТ", "Forged Seal (Crime) → 🚨 DETAIN")
    },
    INVALID_QR_CODE: {
      code: "INVALID_QR_CODE",
      requiresDetention: true,
      title: L("Код «Облік+» недійсний / у розшуку", "Oblik+ QR Code Invalid / Wanted"),
      hint: L("Розшук у реєстрі → 🚨 АРЕШТ", "Registry Wanted → 🚨 DETAIN")
    },
    VEHICLE_MISMATCH: {
      code: "VEHICLE_MISMATCH",
      requiresDetention: true,
      title: L("Колір/модель авто не збігається з техпаспортом", "Vehicle Color/Model Registry Mismatch"),
      hint: L("Перебиті номери / авто-двійник → 🚨 АРЕШТ", "Stolen clone / VIN mismatch → 🚨 DETAIN")
    },
    CONTRABAND_CARGO: {
      code: "CONTRABAND_CARGO",
      requiresDetention: true,
      title: L("Контрабанда / схованка в транспорті", "Contraband / Hidden Stash in Transport"),
      hint: L("Контрабанда / Тайник → 🚨 АРЕШТ", "Contraband / Stowaways → 🚨 DETAIN")
    },
    WANTED_CRIMINAL_OR_SPY: {
      code: "WANTED_CRIMINAL_OR_SPY",
      requiresDetention: true,
      title: L("Особа з орієнтування СБК (шпигун/ДРГ)", "SBK Wanted Target / Saboteur"),
      hint: L("Особливо небезпечний (СБК) → 🚨 АРЕШТ!", "High-Value SBK Target → 🚨 DETAIN!")
    }
  };

  const SANDBOX_MODIFIERS = [
    {
      id: "OLIGARCH_EXODUS",
      title: L("💰 Указ Віче: «Ніч олігархів та мажорів»", "💰 Daily Decree: 'Night of Oligarchs'"),
      desc: L("Багатії рвуться у напрямку Монаківки та Варшавки — усі конверти сьогодні ПОДВІЙНІ (x2)!", "VIPs are rushing toward Monakivka and Varshavka — all bribe offers today are DOUBLED (x2)!"),
      bribeMult: 2.0, detainExtra: 0, forceOblik: false, forceSiren: false
    },
    {
      id: "MARTIAL_AUDIT",
      title: L("🚨 Указ Штабу: «Спецоперація Контррозвідки»", "🚨 Daily Decree: 'Counter-Intel Sweep'"),
      desc: L("Група СБК чергує на КПП! За кожен обґрунтований АРЕШТ сьогодні платять +220 ₴ премії!", "SBK team on site! Every valid DETENTION today pays an extra +220 ₴ bonus!"),
      bribeMult: 1.0, detainExtra: 220, forceOblik: false, forceSiren: true
    },
    {
      id: "TOTAL_DIGITAL_OBLIK",
      title: L("📱 Указ Віче: «Цифровий Рейд Облік+»", "📱 Daily Decree: 'Digital Oblik+ Raid'"),
      desc: L("Усі чоловіки 18–60 зобов'язані пред'явити і довідку, і дійсний QR-код «Облік+».", "All males 18–60 must present both an Exemption Permit and a valid 'Oblik+' QR code."),
      bribeMult: 1.0, detainExtra: 0, forceOblik: true, forceSiren: false
    },
    {
      id: "CONTRABAND_BOOM",
      title: L("📦 Указ Митниці: «Полювання на двійників та тайники»", "📦 Daily Decree: 'Clone & Stash Hunt'"),
      desc: L("Звіряйте колір транспорту перед шлагбаумом із декларацією! Премія за АРЕШТ +180 ₴!", "Compare the parked vehicle color against papers! Detention bonus +180 ₴!"),
      bribeMult: 1.0, detainExtra: 180, forceOblik: false, forceSiren: false
    },
    {
      id: "NIGHT_CONVOY_SURGE",
      title: L("🔦 Спецрежим: «Смуга посиленого контролю»", "🔦 Special Shift: 'Tightened Security Lane'"),
      desc: L("Через трасу йдуть дипломатичні буси та велокур'єри. Ставка +30%, премія СБК +120 ₴!", "Heavy diplomatic vans & bike couriers on the highway. Base pay +30%, SBK bonus +120 ₴!"),
      bribeMult: 1.3, detainExtra: 120, forceOblik: false, forceSiren: false
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
    }
  ];

  // Dynamic Evening Bills & Life Situations (picked per evening so it's not repetitive & you can skip!)
  const DYNAMIC_EVENING_BILLS = [
    {
      id: "food_utilities",
      title: L("🛒 Закупити харчі, павербанки та бензин у генератор (+15% сім'я)", "🛒 Buy groceries, powerbanks & generator fuel (+15% family)"),
      subtitle: L("Дім у теплі й зі світлом — можна пропустити 1–2 вечори", "Keep home warm and lit — optional if savings are tight"),
      cost: 220, morale: 15, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "reb_donation",
      title: L("📡 Скинутися куму з ЗСК на купольний РЕБ проти «мопедів» (+15 СБК, +12% сім'я)", "📡 Chip in for an anti-drone EW jammer (+15 SBK, +12% family)"),
      subtitle: L("Військові дякують, а майор СБК «Тихий» ставить плюсик у досьє", "Troops thank you and SBK Major Quiet logs your support"),
      cost: 300, morale: 12, escape: 0, riskDelta: -8, sbkDelta: 15
    },
    {
      id: "mother_truskavets",
      title: L("⛲ Путівка для мами й тещі у Трускавецьк на мінеральні води (+25% сім'я)", "⛲ Send mom & mother-in-law to Truskavetsk mineral spa (+25% family)"),
      subtitle: L("Удома панує благословенна тиша на тиждень вперед!", "Blessed peace and quiet at home all week!"),
      cost: 350, morale: 25, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "shred_evidence",
      title: L("🕵️‍♂️ Адвокат-«рішала» з Кийграда: зачистити хвости в НАБК (-28% ризику НАБК)", "🕵️‍♂️ Kyihrad fixer lawyer: scrub NABK investigation tails (-28% NABK risk)"),
      subtitle: L("Порятунок, якщо брав товсті конверти або прикупив майно", "Lifesaver if you took fat envelopes or bought luxury assets"),
      cost: 350, morale: 0, escape: 0, riskDelta: -28, sbkDelta: 0
    },
    {
      id: "escape_fund",
      title: L("🚐 Відкласти частку Толіку на «нічний трансфер у Варшавку» (+600 ₴ до фонду)", "🚐 Put cash with Tolik for a midnight Varshavka transfer (+600 ₴ escape fund)"),
      subtitle: L("Кожна гривня наближає запасний вихід із країни", "Every bill brings your covert exit plan closer"),
      cost: 600, morale: -4, escape: 600, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "counter_intel_gift",
      title: L("🥃 Трофейний тепловізор-монокуляр для відділу СБК (+20 СБК, -10% ризик)", "🥃 Donate a thermal monocular to the local SBK team (+20 SBK, -10% risk)"),
      subtitle: L("Зміцнює твій авторитет у контррозвідці", "Boosts your counter-intelligence standing"),
      cost: 400, morale: 0, escape: 0, riskDelta: -10, sbkDelta: 20
    },
    {
      id: "bukovel_weekend",
      title: L("🎿 Сімейні вихідні в аквапарку Буковельська (+22% сім'я, -5% стресу НАБК)", "🎿 Family weekend at Bukovelsk spa resort (+22% family)"),
      subtitle: L("Справжнє перезавантаження між важкими змінами", "Real reset between intense shifts"),
      cost: 420, morale: 22, escape: 0, riskDelta: -5, sbkDelta: 5
    }
  ];

  // Expanded Shop: 10 Assets in GTA-Parody World!
  const ASSET_UPGRADES = [
    {
      id: "espresso_machine",
      category: "TECH",
      icon: "☕",
      title: L("Італійська кавомашина «ДеЛонгі-Люкс» у будку", "Italian 'DeLongi-Lux' Espresso Machine"),
      subtitle: L("+35 секунд до кожної зміни назавжди + краща реакція на частування кавою", "+35s to every shift permanently + boosted coffee tips"),
      cost: 400, passiveIncome: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "uv_endoscope",
      category: "TECH",
      icon: "🐕",
      title: L("Мобільний рентген-сканер + вітаміни для пса «Бавовни»", "Mobile X-Ray Scanner + Dog Treats for 'Bavovna'"),
      subtitle: L("Огляд транспорту миттєвий (0с замість -8с) + авто-підсвітка лівих печаток", "Instant transport search (0s vs -8s) + auto-spots fake seals"),
      cost: 550, passiveIncome: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "sbk_database_tablet",
      category: "TECH",
      icon: "💻",
      title: L("Закритий планшет розвідки «Оберіг-Контур»", "Classified Intel Tablet 'Oberig-Kontur'"),
      subtitle: L("Автоматично звіряє оперативні орієнтування прямо під час черги!", "Highlights active intelligence & sting profiles at the window!"),
      cost: 750, passiveIncome: 0, dailyRisk: -3, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "shawarma_kiosk",
      category: "REALTY",
      icon: "🥙",
      title: L("Кіоск «Шаурма Шлагбаум-Люкс» біля КПП", "'Barrier-Lux Shawarma' Kiosk outside Checkpoint"),
      subtitle: L("Білий бізнес! Приносить +220 ₴ щоранку з черги водіїв без уваги НАБК", "Legal business! Yields +220 ₴ every morning with zero NABK risk"),
      cost: 900, passiveIncome: 220, dailyRisk: 0, tolikBoost: 5, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "rolex_watch",
      category: "LUXURY",
      icon: "⌚",
      title: L("Золотий хронограф «Кролекс» (Як у генерала митниці)", "Gold 'Krolex' Chronograph"),
      subtitle: L("Пал Палич падає на коліна перед статусом і ріже свою вечірню частку на -50%!", "Pal Palych bows to the clout and halves his evening cut by 50%!"),
      cost: 950, passiveIncome: 0, dailyRisk: 2, tolikBoost: 10, palychBoost: 25, moraleBoost: 10
    },
    {
      id: "euro_bmw",
      category: "LUXURY",
      icon: "🚙",
      title: L("Чорна «Беха Х5» на литовських бляхах", "Black 'Beha X5' on Euro-Plates"),
      subtitle: L("Повага Толіка (+20) і Палича (+15), щастя сім'ї (+15), +3% уваги НАБК/день", "Tolik (+20) & Palych (+15) respect, family (+15), +3% daily NABK risk"),
      cost: 1100, passiveIncome: 0, dailyRisk: 3, tolikBoost: 20, palychBoost: 15, moraleBoost: 15
    },
    {
      id: "kyivhrad_flat",
      category: "REALTY",
      icon: "🏢",
      title: L("Пентхаус у ЖК «Липки-Гранд» (Кийград) на тещу", "Kyihrad Penthouse (in Mother-in-Law's Name)"),
      subtitle: L("Стабільна оренда +360 ₴ щоранку! (+4% уваги НАБК/день)", "Rental yield +360 ₴ every morning! (+4% daily NABK attention)"),
      cost: 1700, passiveIncome: 360, dailyRisk: 4, tolikBoost: 0, palychBoost: 0, moraleBoost: 25
    },
    {
      id: "cyprus_offshore",
      category: "REALTY",
      icon: "🏝️",
      title: L("Холодний крипто-гаманець та траст в Офшорії", "Cold Crypto Wallet & Ofshoria Offshore Trust"),
      subtitle: L("Ховає декларацію: щодня знижує ризик НАБК на -8% і дає +180 ₴ дивідендів!", "Shields your assets: cuts NABK risk by -8%/day & yields +180 ₴!"),
      cost: 2100, passiveIncome: 180, dailyRisk: -8, tolikBoost: 15, palychBoost: 0, moraleBoost: 10
    },
    {
      id: "carpathian_chalet",
      category: "REALTY",
      icon: "🏔️",
      title: L("Шале з чанами в Буковельську (Із вертолітним майданчиком)", "Bukovelsk Mountain Chalet with Hot Tubs"),
      subtitle: L("Повноцінний курорт: +460 ₴ щоранку та +25% щастя сім'ї!", "Booming resort income: +460 ₴ every morning & +25% family morale!"),
      cost: 2400, passiveIncome: 460, dailyRisk: 3, tolikBoost: 10, palychBoost: 15, moraleBoost: 25
    },
    {
      id: "spain_villa",
      category: "REALTY",
      icon: "🏖️",
      title: L("Вілла на березі Алікантово (Іспанщина) + Золотий паспорт", "Alikantovo Seafront Villa (Spainia) & Golden Visa"),
      subtitle: L("Вершина імперії нерухомості + пасивні +300 ₴ щоранку!", "Peak real-estate empire + 300 ₴ passive yield every morning!"),
      cost: 3000, passiveIncome: 300, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 35
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
          label: L("🫡 Підняти шлагбаум без запису в журнал (+25 СБК, +250 ₴ зі спецфонду)", "🫡 Raise barrier off-the-record (+25 SBK, +250 ₴ covert bonus)"),
          outcome: L("Офіцер тисне тобі руку: «Служба не забуде, брате!» Увечері на картку приходить 250 ₴ премії.", "The officer shakes your hand: 'The Service won't forget!' 250 ₴ lands on your card."),
          moneyDelta: 250, timeDelta: 10, riskDelta: -5, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 10
        },
        {
          id: "demand_bureaucracy",
          label: L("📋 Вимагати повного митного оформлення за інструкцією (-15с часу, +10 Палич)", "📋 Demand full customs paperwork by the book (-15s time, +10 Palych)"),
          outcome: L("Спецпризначенці крізь зуби чекають 15 хвилин, поки ти заповнюєш папірці.", "The operatives grind their teeth waiting while you fill out forms."),
          moneyDelta: 100, timeDelta: -15, riskDelta: 0, sbkDelta: -10, tolikDelta: 0, palychDelta: 10, moraleDelta: 0
        }
      ]
    },
    {
      id: "double_agent_cipher",
      title: L("🕵️ ПЕРЕХОПЛЕНИЙ ЗВ'ЯЗКОВИЙ ФЕДЕРАЦІЇ", "🕵️ INTERCEPTED FEDERATION COURIER"),
      desc: L(
        "Чоловік у сірому плащі нахиляється до вікна й шепоче пароль:\n«Скажіть, по чому сьогодні бринза в Буковельську?.. Ось флешка з графіком руху ешелонів. Мовчки пропустите — у конверті 800 ₴. Або тисніть тривожну кнопку СБК під столом!»",
        "A man in a grey trenchcoat whispers a cipher at the glass:\n'What is the price of cheese in Bukovelsk today?.. Here is a flash drive with train schedules. Wave me through for 800 ₴ — or hit the hidden SBK alarm under your desk!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "report_to_sbk",
          label: L("🚨 Натиснути кнопку СБК і взяти шпигуна на гарячому (+400 ₴ премії, +25 СБК)", "🚨 Press SBK alarm & capture spy red-handed (+400 ₴ reward, +25 SBK)"),
          outcome: L("Група захоплення СБК миттєво пакує агента! Майор «Тихий» виписує тобі 400 ₴ премії та знімає всі питання НАБК.", "SBK strike team tackles the spy in seconds! Major Quiet awards you 400 ₴ and clears your file."),
          moneyDelta: 400, timeDelta: 0, riskDelta: -12, sbkDelta: 25, tolikDelta: 0, palychDelta: 5, moraleDelta: 10
        },
        {
          id: "fake_double_game",
          label: L("🎭 Підмінити флешку на дезінформацію СБК і забрати його 800 ₴! (+800 ₴, +15 СБК)", "🎭 Swap drive with SBK disinfo AND pocket his 800 ₴! (+800 ₴, +15 SBK)"),
          outcome: L("Вищий пілотаж! Ворожа розвідка отримала фальшиві координати муляжів, а 800 ₴ залишилися у твоїй кишені!", "Masterclass! Enemy intel got decoy coordinates while you kept the 800 ₴ cash!"),
          moneyDelta: 800, timeDelta: -10, riskDelta: 5, sbkDelta: 15, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        }
      ]
    },
    {
      id: "palych_drawer_raid",
      title: L("🧢 ПАЛ ПАЛИЧ ПЕРЕВІРЯЄ ШУХЛЯДУ!", "🧢 PAL PALYCH BARGED INTO THE BOOTH!"),
      desc: L(
        "Пал Палич зачиняє двері будки на шпінгалет і стукає кулаком по столу:\n«Так, інспекторе! Мені сорока на хвості принесла, що сьогодні повз мою касу жирні конверти пливуть. Відкривай шухляду або ділися по-братськи!»",
        "Pal Palych bolts the booth door and slams his fist on your desk:\n'Alright inspector! A little bird told me fat envelopes are bypassing my desk today. Open the drawer or share like a brother!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "pay_palych_on_spot",
          label: L("💵 Відстібнути 200 ₴ «на коньяк» (+15 Палич, -10% ризик НАБК)", "💵 Slip him 200 ₴ 'for cognac' (+15 Palych, -10% NABK risk)"),
          outcome: L("Палич ховає купюри в кашкет: «Оце розмова дорослих людей! Працюй спокійно.»", "Palych tucks the bills into his cap: 'Now that is grown-up talk! Carry on.'"),
          moneyDelta: -200, timeDelta: 0, riskDelta: -10, sbkDelta: 0, tolikDelta: 0, palychDelta: 15, moraleDelta: 0
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
          label: L("🦴 Дати тваринам ковбаси й розкрити подвійне дно фури (+380 ₴ премії СБК!)", "🦴 Feed pets sausage & tear open the truck bed (+380 ₴ SBK reward!)"),
          outcome: L("У схованці під підлогою знайдено 50 блоків контрабандної електроніки! СБК виписує 380 ₴ премії!", "Hidden under the floor were 50 crates of smuggled electronics! SBK pays 380 ₴!"),
          moneyDelta: 380, timeDelta: 0, riskDelta: -5, sbkDelta: 12, tolikDelta: 0, palychDelta: 0, moraleDelta: 8
        },
        {
          id: "pet_and_work",
          label: L("🤚 Погладити чотирилапу зміну й отримати +25с спокійного часу", "🤚 Pet the four-legged crew and gain +25s shift time"),
          outcome: L("Тварини задоволено вкладаються біля будки, даючи +25 секунд концентрації.", "The duo curls up by your booth, giving you +25 seconds of focus."),
          moneyDelta: 0, timeDelta: 25, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        }
      ]
    }
  ];

  // ★ MODULAR EPILOGUE SYSTEM: 16 Archetypes × 8 Wealth × 6 Family × 6 Factions × 6 Legacy = 27,648 Unique Combinations! ★
  const ARCHETYPE_CATALOG = {
    SHYTOMYR_MAYOR: {
      idx: 0,
      title: L("🧦 ПОЧЕСНИЙ МЕР МІСТА ШИТОМИР", "🧦 HONORARY MAYOR OF SHYTOMYR CITY"),
      subtitle: L("Свої люди не підводять — братва відкрила тобі золоті двері в неіснуючий на картах мегаполіс!", "Your true homies hooked you up with the keys to a mythical megacity off every radar!")
    },
    SBK_SHADOW_COLONEL: {
      idx: 1,
      title: L("🕵️ ТАЄМНИЙ ПОЛКОВНИК СБК («КОРДОН-7»)", "🕵️ COVERT SBK COLONEL ('BORDER-7')"),
      subtitle: L("Ти викрив мережу резидентів зсередини й став невидимим господарем усього кордону.", "You dismantled the enemy spy ring from within and became the shadow commander of the border.")
    },
    NABK_PRISONER: {
      idx: 2,
      title: L("⛓️ ФІГУРАНТ ГУЧНОЇ СПРАВИ НАБК", "⛓️ HIGH-PROFILE NABK DETAINEE"),
      subtitle: L("Спецназ із камерами вибив двері будки просто під час перерахунку «чайових».", "Anti-corruption tactical officers raided your booth right as you counted the envelopes.")
    },
    ALIKANTOVO_OLIGARCH: {
      idx: 3,
      title: L("🏖️ КОРОЛЬ КОРДОНУ — ВІЛЛА В АЛІКАНТОВО", "🏖️ BORDER OLIGARCH — VILLA IN ALIKANTOVO"),
      subtitle: L("Від скромного шлагбаума до власного басейну в Іспанщині з золотим паспортом у кишені.", "From a cold checkpoint booth to your own seafront pool in Spainia.")
    },
    ESCAPED_IN_VAN: {
      idx: 4,
      title: L("🚐 НІЧНИЙ ПАСАЖИР «ЗЕЛЕНОГО КОРИДОРУ»", "🚐 PASSENGER OF THE 'GREEN CORRIDOR' VAN"),
      subtitle: L("Ти сам довірив долю Толіку й перетнув кордон у вантажному відсіку під брезентом.", "You trusted Tolik with your fate and crossed into Polandia hidden under a tarp.")
    },
    CUSTOMS_BARON: {
      idx: 5,
      title: L("👑 БАРОН ЗАХІДНОЇ МИТНИЦІ", "👑 BARON OF WESTERN CUSTOMS"),
      subtitle: L("Ти викупив посаду начальника КПП — тепер Пал Палич стоїть на шлагбаумі під дощем.", "You bought out the Checkpoint Chief's chair — now Palych freezes at the barrier.")
    },
    BUKOVEL_HETMAN: {
      idx: 6,
      title: L("🏔️ КАРПАТСЬКИЙ ГЕТЬМАН ІЗ БУКОВЕЛЬСЬКА", "🏔️ CARPATHIAN HETMAN OF BUKOVELSK"),
      subtitle: L("Поміняв форму інспектора на власні котеджі, карпатські чани та оренду для айтівців.", "Swapped your uniform for luxury mountain chalets and steady tourist cash.")
    },
    OFFSHORE_CRYPTO_GHOST: {
      idx: 7,
      title: L("🏝️ ПРИВИД ОФШОРІЇ ТА ХОЛОДНИХ ГАМАНЦІВ", "🏝️ GHOST OF OFSHORIA & CRYPTO TRUSTS"),
      subtitle: L("Усі твої декларації в Україні абсолютно порожні, поки в Офшорії ростуть відсотки.", "Your official filings look spotless while millions compound silently offshore.")
    },
    SHAWARMA_EMPEROR: {
      idx: 8,
      title: L("🥙 МАГНАТ ПРИКОРДОННОГО ФАСТФУДУ", "🥙 BORDER FAST-FOOD TYCOON"),
      subtitle: L("Твоя мережа кіосків біля 30-кілометрових черг годує пів країни й приносить стабільні статки.", "Your shawarma kiosks feeding endless border queues built an honest golden empire.")
    },
    DOUBLE_AGENT_MASTER: {
      idx: 9,
      title: L("🎭 ГРОСМЕЙСТЕР ПОДВІЙНОЇ ГРИ", "🎭 GRANDMASTER OF DOUBLE PLAY"),
      subtitle: L("Брав конверти з обох боків і примудрявся передавати шифровки в СБК!", "Collected envelopes from smugglers while covertly feeding leads to counter-intelligence!")
    },
    IRON_CERBERUS: {
      idx: 10,
      title: L("🛡️ ЗАЛІЗНИЙ ЦЕРБЕР ЗАХІДНОГО РУБЕЖУ", "🛡️ IRON CERBERUS OF THE WEST"),
      subtitle: L("Через твою зміну не проскочила жодна миша, а на стіні в штабі висить твоя подяка.", "Not a single mouse slipped past your lane; HQ framed your commendation.")
    },
    TOLIK_NIGHT_PARTNER: {
      idx: 11,
      title: L("🚕 КОМЕРЦІЙНИЙ ПАРТНЕР СИНДИКАТУ", "🚕 LOGISTICS PARTNER OF THE SYNDICATE"),
      subtitle: L("Не звільнившись із кордону, ти став тіньовим диспетчером усіх бусів Толіка.", "Still at the gate on paper, you became the shadow dispatcher for Tolik's entire fleet.")
    },
    PALYCH_GODSON: {
      idx: 12,
      title: L("🧢 ПРАВА РУКА ТА КУМ ПАЛ ПАЛИЧА", "🧢 PAL PALYCH'S RIGHT-HAND GODSON"),
      subtitle: L("Поділив кожну копійку зі старшим зміни і ввійшов до «недоторканної» касти митниці.", "Split every envelope down the middle and joined the untouchable customs inner circle.")
    },
    BORDER_ROBIN_HOOD: {
      idx: 13,
      title: L("💚 НАРОДНИЙ ЗАХИСНИК ЧЕРГИ", "💚 PEOPLE'S DEFENDER OF THE QUEUE"),
      subtitle: L("Не взявши жодного брудного хабаря, ти залишився людиною та опорою для власної родини.", "Refused every dirty bribe, stood by honest travelers, and kept your honor intact.")
    },
    HONEST_INSPECTOR: {
      idx: 14,
      title: L("🫡 ЗРАЗКОВИЙ ІНСПЕКТОР ДПСК", "🫡 EXEMPLARY BORDER INSPECTOR"),
      subtitle: L("Спокійна, чесна служба без скандалів, арештів і зайвого пафосу.", "Calm, principled duty free of scandals or handcuffs.")
    },
    WRITTEN_OFF_RESERVE: {
      idx: 15,
      title: L("📋 СПИСАНИЙ У ПОЛЬОВИЙ РЕЗЕРВ", "📋 WRITTEN OFF TO FIELD RESERVE"),
      subtitle: L("Каса спорожніла, стосунки з начальством згоріли — шлагбаум зачинився без тебе.", "Empty wallet, burned bridges with management — the barrier closed without you.")
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

  function resolveArchetypeId(st) {
    if (st.activeEndingId && ARCHETYPE_CATALOG[st.activeEndingId]) {
      return st.activeEndingId;
    }
    if (st.nabkRisk >= 80) return "NABK_PRISONER";
    if (st.shytomyrBrotherhoodUnlocked && st.nabkRisk < 85) return "SHYTOMYR_MAYOR";
    if (st.sbkColonelPromoted || (st.isUndercoverSbkAgent && st.spiesCaughtAsAgent >= 4 && st.nabkRisk < 75)) return "SBK_SHADOW_COLONEL";
    if (st.ownedAssets.includes("spain_villa")) return "ALIKANTOVO_OLIGARCH";
    if (st.escapeFund >= (st.isSandbox ? 3600 : 2400) && st.tolikRep >= (st.isSandbox ? 65 : 55)) return "ESCAPED_IN_VAN";
    if (st.ownedAssets.includes("euro_bmw") && st.ownedAssets.includes("kyivhrad_flat") && st.money >= 1500) return "CUSTOMS_BARON";
    if (st.ownedAssets.includes("carpathian_chalet")) return "BUKOVEL_HETMAN";
    if (st.ownedAssets.includes("cyprus_offshore")) return "OFFSHORE_CRYPTO_GHOST";
    if (st.ownedAssets.includes("shawarma_kiosk") && st.money >= 950) return "SHAWARMA_EMPEROR";
    if (st.isUndercoverSbkAgent && st.shiftBribesTotal > 0) return "DOUBLE_AGENT_MASTER";
    if (st.totalCareerDetained >= 5 && st.sbkRep >= 68) return "IRON_CERBERUS";
    if (st.tolikRep >= 70 && st.money >= 800) return "TOLIK_NIGHT_PARTNER";
    if (st.palychRep >= 75 && st.nabkRisk < 65) return "PALYCH_GODSON";
    if (st.familyMorale >= 82 && st.nabkRisk < 38 && st.shiftBribesTotal === 0) return "BORDER_ROBIN_HOOD";
    if (st.sbkRep >= 55 && st.nabkRisk < 55 && st.money >= 250) return "HONEST_INSPECTOR";
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
        `Ти зібрав повний джекпот: активи сховані в Офшорії, у Кийграді капає оренда, а ранок починається на терасі вілли в Алікантово. На рахунках залишилось ${st.money} ₴ живого кешу.`,
        `Full jackpot: offshore trusts in Ofshoria, rental cash flowing in, and mornings on your Alikantovo terrace with ${st.money} ₴ cash remaining.`
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
        `Кіоск «Шаурма Шлагбаум-Люкс» годує 30-кілометрову чергу до Варшавки й щодня відбиває інвестиції чистим кешем (${st.money} ₴ у сейфі).`,
        `Your Barrier-Lux Shawarma kiosk feeds endless Varshavka queues and turns crisp profits (${st.money} ₴ saved).`
      );
    } else if (has("espresso_machine") || has("uv_endoscope") || has("sbk_database_tablet")) {
      assetIdx = 5;
      assetText = L(
        `Уся зарплатня пішла не в люкс, а у професійне спорядження будки: кавомашину «ДеЛонгі», сканери й базу розвідки (${st.money} ₴ готівки).`,
        `You invested in booth tech — espresso gear, scanners, and intel tablets (${st.money} ₴ left on hand).`
      );
    } else if (st.money >= 1500) {
      assetIdx = 6;
      assetText = L(
        `Ти не витрачався на показові понти й назбирав солідний запас готівки (${st.money} ₴) у банці під підлогою.`,
        `You skipped flashy purchases and amassed a serious cash reserve (${st.money} ₴) under the floorboards.`
      );
    } else {
      assetIdx = 7;
      assetText = L(
        `Після всіх витрат і штрафів у кишені залишилося всього ${st.money} ₴ — доведеться жити на звичайну зарплату без особливих заощаджень.`,
        `After bills and fines, only ${st.money} ₴ stayed in your pocket — modest living ahead.`
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
    if (st.shytomyrBrotherhoodUnlocked) {
      legIdx = 0;
      legText = L(
        "Легендарна трійця з м. Шитомир — Євген Бельке (32), Андрій Коротуха (31) та Діма Денисенко (31) — досі гуляє на твоєму банкеті, привізши три багажники елітних шитомирських шкарпеток та дерунів!",
        "The legendary Shytomyr trio — Belke (32), Korotukha (31) & Denysenko (31) — threw you a legendary banquet with trunkloads of elite Shytomyr socks!"
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
        `Зустріч на пункті зі старими знайомими з м. Шитомир (${st.shytomyrFriendsMet.length}/3) залишила найтепліші спогади посеред важкої служби — наступного разу передаси привіт решті хлопців!`,
        `Running into old pals from Shytomyr (${st.shytomyrFriendsMet.length}/3) was the brightest moment of your shifts.`
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
      const chords = [
        [146.83, 220.00, 261.63, 329.63],
        [116.54, 174.61, 220.00, 293.66],
        [98.00,  146.83, 174.61, 261.63],
        [110.00, 164.81, 196.00, 277.18]
      ];

      const playPadSlice = () => {
        try {
          if (!this.musicEnabled || !this.ctx || this.ctx.state !== "running" || document.hidden) return;
          const chord = chords[this.chordStep % chords.length];
          this.chordStep = (this.chordStep + 1) % chords.length;

          const isTense = this.mood === "TENSE";
          const isBooth = this.mood === "BOOTH_NORMAL";
          const cutoff = isTense ? 520 : (isBooth ? 420 : 340);

          chord.forEach((freq, idx) => {
            const voiceGain = idx === 0 ? 0.022 : 0.011;
            this.playWarmNote(freq, 3.5, 1.3, cutoff, voiceGain, idx === 0 ? "sine" : "triangle");
          });

          if (isBooth || isTense) {
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
    L("Назар", "Nazar"), L("Віталій", "Vitalii"), L("Степан", "Stepan"), L("Юрій", "Yurii")
  ];
  const FEMALE_FIRST = [
    L("Оксана", "Oksana"), L("Наталія", "Nataliia"), L("Ірина", "Iryna"), L("Марія", "Mariia"),
    L("Катерина", "Kateryna"), L("Софія", "Sofiia"), L("Юлія", "Yuliia"), L("Аліна", "Alina"),
    L("Вікторія", "Viktoriia"), L("Дарина", "Daryna"), L("Олена", "Olena"), L("Соломія", "Solomiia"),
    L("Христина", "Khrystyna"), L("Людмила", "Liudmyla"), L("Тетяна", "Tetiana")
  ];
  const LAST_NAMES = [
    L("Коваленко", "Kovalenko"), L("Бондаренко", "Bondarenko"), L("Ткаченко", "Tkachenko"),
    L("Кравчук", "Kravchuk"), L("Олійник", "Oliinyk"), L("Шевчук", "Shevchuk"),
    L("Поліщук", "Polishchuk"), L("Савченко", "Savchenko"), L("Мельник", "Melnyk"),
    L("Лисенко", "Lysenko"), L("Марченко", "Marchenko"), L("Павленко", "Pavlenko"),
    L("Гаврилюк", "Havryliuk"), L("Захарчук", "Zakharchuk"), L("Гончаренко", "Honcharenko"),
    L("Демчук", "Demchuk"), L("Романюк", "Romaniuk"), L("Сидоренко", "Sydorenko")
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
      skinTone: randInt(0, 3),
      faceShape: gender === "F" ? randInt(0, 1) : randInt(1, 3),
      hairStyle: randInt(0, 4),
      hairColor: randInt(0, 4),
      facialHair: gender === "M" ? randInt(0, 4) : 0,
      glasses: Math.random() < 0.25 ? randInt(1, 3) : 0,
      headwear: gender === "F" ? (Math.random() < 0.16 ? 2 : 0) : (Math.random() < 0.22 ? 1 : 0),
      scarOrDetail: 0,
      expression: randInt(0, 2),
      lipColor: gender === "F" ? randInt(0, 2) : 0,
      earrings: gender === "F" ? randInt(1, 2) : 0,
      outfitStyle: randInt(0, 3),
      specialId: "NONE"
    };
  }

  // ★ THE 3 SHYTOMYR LEGENDS (Belke 32, Korotukha 31, Denysenko 31 — natural passport, NO spoilers!) ★
  const SHYTOMYR_LEGENDS = [
    {
      tag: "SHYTOMYR_BELKE",
      name: L("Євген Бельке", "Yevhen Belke"),
      age: 32,
      portrait: { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 0, hairColor: 1, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, outfitStyle: 1, specialId: "SHYTOMYR_BRO" },
      stories: [
        {
          shape: "RETRO", colorId: "YELLOW", plate: "ШТ 0777 ІТ",
          model: L("«Таврія-Нова Люкс» на титанах", "'Tavriya-Nova Lux'"),
          cargo: L("Три термоси кави, 40 пар фірмових шитомирських шкарпеток та запчастини для пікапів", "Thermoses, 40 pairs of Shytomyr socks & pickup spares"),
          permitReason: L("Водій гуманітарного волонтерського рейсу (наказ ОВА)", "Authorized Humanitarian Convoy Driver"),
          greeting: L("«Опа, братан! Ти шо, своїх не впізнаєш?! Це ж я, Жека Бельке! Дивись прописку — м. Шитомир! Ми ж за одним столом ще тоді сиділи. Пропустиш без черги?»", "'Whoa bro! Don't you recognize your own?! Zheka Belke from Shytomyr! Look at the birthplace — Shytomyr City! Let me roll through?'"),
          reply: L("«З документами повний ажур, все офіційно!»", "'Everything is 100% official!'"),
          intimidate: L("«Ей, ну ти чого стукаєш, свої ж люди! Я просто на Поландію за запчастинами й назад!»", "'Hey chill with the knocking, we are old pals! Heading to Polandia for parts!'"),
          coffee: L("«О, за гарячий еспресо на посту — респект! Тримай п'ятірку на каву!»", "'Respect for the hot coffee at the gate! Here is a small tip for the thermos!'")
        },
        {
          shape: "E_SCOOTER", colorId: "ORANGE", plate: "ПШ-777",
          model: L("Електросамокат «Вжух-Про 3000» з причепом", "'Vzhykh-Pro 3000' E-Scooter"),
          cargo: L("Рюкзак із павербанками, казан дерунів та супутникова тарілка «Зорелінк»", "Backpack with powerbanks, deruny cauldron & 'Zorelink' dish"),
          permitReason: L("Спецвідрядження інженера зв'язку (ДПСУ)", "Telecom Engineer Official Dispatch"),
          greeting: L("«Салют, шефе! Жека Бельке на зв'язку! Тільки з Шитомира вилетів на самокаті, акумулятор ще теплий! Став печатку, бо деруни холонуть!»", "'Salute boss! Zheka Belke rolling through from Shytomyr on the e-scooter! Stamp me quick before the deruny get cold!'"),
          reply: L("«Усе чітко, братан, можеш навіть заряд батареї перевірити!»", "'All clean bro, check the battery if you want!'"),
          intimidate: L("«Та шо ти лякаєш, у мене навіть шолом сертифікований!»", "'No need to yell, even my helmet is certified!'"),
          coffee: L("«О оце підігрів! Лови 100 ₴ на круасани до зміни!»", "'Now that hits the spot! Catch 100 ₴ for shift snacks!'")
        }
      ]
    },
    {
      tag: "SHYTOMYR_KOROTUKHA",
      name: L("Андрій Коротуха", "Andrii Korotukha"),
      age: 31,
      portrait: { gender: "M", skinTone: 1, faceShape: 0, hairStyle: 2, hairColor: 0, facialHair: 2, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, outfitStyle: 0, specialId: "SHYTOMYR_BRO" },
      stories: [
        {
          shape: "SUV", colorId: "BLACK", plate: "ШТ 0031 КР",
          model: L("Чорна «Беха Х5»", "Black 'Beha X5'"),
          cargo: L("Коробки з тепловізорами, 2 «Зорелінки» та ящик фірмового пломбіру", "Thermal scopes, 2 'Zorelinks' & ice cream crates"),
          permitReason: L("Представник благодійного фонду «Полісся-Тил»", "Charity Logistics Envoy"),
          greeting: L("«Та ну нафіг, знайомі обличчя в будці! Братан, це ж Андрюха Коротуха! Земляк із Шитомира! Їду у Варшавку за дронами «Жужик-3Т».»", "'No way, familiar face! Andrii Korotukha from Shytomyr! Rolling to Varshavka to pick up Zhuzyk-3T drones.'"),
          reply: L("«Дивись паспорт, довідку й декларацію — усе вилизано до коми!»", "'Check passport, permit and customs — clean down to the comma!'"),
          intimidate: L("«Та спокійніше ти! Ми ж із Шитомира, там усі свої, нічого лівого не везу!»", "'Take it easy man! Nothing shady in the trunk!'"),
          coffee: L("«Кавуся на кордоні — золото! Залишив 100 ₴ під штампом від душі!»", "'Booth coffee is gold! Slipped 100 ₴ by your stamp!'")
        },
        {
          shape: "MINIBUS", colorId: "SILVER", plate: "ШТ 1995 КН",
          model: L("«Мерс Спрінтер Бусик»", "'Mers Sprinter Van'"),
          cargo: L("Медичні аптечки, сухі пайки та генератори для пунктів незламності", "Medkits, rations & generators"),
          permitReason: L("Перевезення медико-гуманітарних вантажів (ЦНАП/ОВА)", "Certified Medical Cargo Transport"),
          greeting: L("«Здоров, старий! Андрій Коротуха, 31 рік! Ти шо, не пам'ятаєш, як ми на вокзалі каву пили? Глянь папери — все рівно!»", "'Hey old friend! Andrii Korotukha, 31! Papers are spotless — roll us through!'"),
          reply: L("«Абсолютно легальний гуманітарний рейс!»", "'100% legal humanitarian run!'"),
          intimidate: L("«Ого, строгий ти став на посту! Добре, поважаю порядок!»", "'Whoa, strict on duty! Respect!'"),
          coffee: L("«Дякую за каву, брате! З мене підгін на обід для зміни!»", "'Thanks for the coffee bro! Lunch is on me!'")
        }
      ]
    },
    {
      tag: "SHYTOMYR_DENYSENKO",
      name: L("Діма Денисенко", "Dima Denysenko"),
      age: 31,
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 1, facialHair: 1, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, outfitStyle: 2, specialId: "SHYTOMYR_BRO" },
      stories: [
        {
          shape: "G_WAGON", colorId: "WHITE", plate: "ШТ 3100 ДД",
          model: L("«Гелік-Кубик V8»", "'Gelik-Kubik V8'"),
          cargo: L("Мангал із нержавійки, гітара та комплектуючі для зарядних станцій", "Steel BBQ, guitar & charging station parts"),
          permitReason: L("Офіційне бронювання інженера критичної інфраструктури", "Critical Infrastructure Engineer Exemption"),
          greeting: L("«Йоу, здорово! Це ж Дімон Денисенко! Ти шо, забув наші тусовки в Шитомирі?! Дивись паспорт — усе по закону, а на стіл лови братський підгін на каву!»", "'Yo, what's up! Dima Denysenko here! Remember hanging out in Shytomyr? Papers are clean, and here is coffee money for the booth!'"),
          reply: L("«Та все чисто, як сльоза! Просто радий бачити знайомого!»", "'Squeaky clean! Just glad to see a friend!'"),
          intimidate: L("«Опа, перевірка на міцність? Та ми ж свої, дивись у техпаспорт — усе сходиться!»", "'Testing my nerves? Everything matches!'"),
          coffee: L("«Шитомирський респект за каву! Ось 100 ₴ ще зверху на круасани!»", "'Shytomyr respect for the coffee! Adding 100 ₴ for pastries!'")
        },
        {
          shape: "BICYCLE", colorId: "BLUE", plate: "ПШ-310",
          model: L("Велосипед «Україна-Спорт» з мішком на рамі", "'Ukraina' Bicycle (with sack)"),
          cargo: L("Мішок добірної шитомирської картоплі, ремкомплект та навушники", "Sack of elite Shytomyr potatoes & repair kit"),
          permitReason: L("Учасник міжнародного велопробігу підтримки кордону", "International Charity Bike Tour Participant"),
          greeting: L("«Спорт — сила! Діма Денисенко з Шитомира на двоколісному! Везу вітання хлопцям за кордон і мішок добірної бараболі!»", "'Sport is life! Dima Denysenko from Shytomyr on two wheels!'"),
          reply: L("«Навіть велосипед має офіційну декларацію!»", "'Even the bicycle has full customs papers!'"),
          intimidate: L("«Ей, педалі не відкручуй, усе чесно!»", "'Hey don't rattle my handlebars, I am legal!'"),
          coffee: L("«Гаряча кава велосипедисту під дощем — безцінно! Дякую!»", "'Hot coffee for a cyclist in the rain — priceless!'")
        }
      ]
    }
  ];

  function buildTravelerFromParts(cfg) {
    const trMeta = cfg.transport;
    const docs = [
      {
        type: "PASSPORT",
        title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
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
    const trMeta = makeTransportMeta({ shape: st.shape, name: st.model, isCar: st.shape !== "E_SCOOTER" && st.shape !== "BICYCLE" && st.shape !== "ON_FOOT" }, col, st.plate);
    return buildTravelerFromParts({
      fullName: friendSpec.name,
      age: friendSpec.age,
      gender: "M",
      portrait: friendSpec.portrait,
      transport: trMeta,
      passportSub: L(`Серія ШТ-${randInt(200100, 899900)} • м. Шитомир`, `No. SH-${randInt(200100, 899900)} • Shytomyr`),
      passportFields: [
        { label: L("ПІБ", "Full Name"), value: friendSpec.name, disc: null },
        { label: L("Вік / Стать", "Age / Sex"), value: L(`${friendSpec.age} р. • ЧОЛ`, `${friendSpec.age} y/o • M`), disc: null },
        { label: L("Місце народження", "Birthplace"), value: L("м. Шитомир", "Shytomyr City"), disc: null },
        { label: L("Дійсний до", "Valid Until"), value: L("19.08.2031", "2031-08-19"), disc: null }
      ],
      passportSeal: L("ДМС ШИТОМИР • ДІЙСНИЙ", "SMS SHYTOMYR • VALID"),
      extraDocs: [
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
      ],
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
      bribeOffer: { amount: 400, isStingTrap: false, syndicateFavor: false, isFriendlyGift: true },
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
      interrogationReply: L("«Та то я на паспорт фотографувалася ще до перукарні! Візьми 380 ₴ на шоколадку та став зелений штамп!»", "'I just took the photo before my hairdo! Take 380 ₴ for chocolate and stamp green!'"),
      intimidateReply: L("«*Хрипким басом* Ти шо кричиш?! Хустка ледь не злетіла...»", "'*Deep baritone cough* Why are you shouting?! My headscarf nearly slipped...'"),
      coffeeReply: L("«*Дмухає на каву, перука з'їжджає набік* Ой, гаряченька!»", "'*Blows on coffee, wig shifts slightly* Oh, nice and hot!'"),
      arrestFull: L("Коли хустку й біляву перуку зняли, з'ясувалося що «Тітка Галя» — це Петро Пасічник із Левгорода!", "Once the wig came off, 'Aunt Halya' turned out to be Petro from Levhorod!"),
      arrestToned: L("Порушника з чужим паспортом затримано.", "Impersonator detained."),
      bribeOffer: { amount: 380, isStingTrap: false, syndicateFavor: false },
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
      interrogationReply: L("«То... протяги в катафалку скриплять! Не кличте собаку, ось 650 ₴ за моральну шкоду!»", "'Just... creaky hinges! Don't bring the dog, take 650 ₴!'"),
      intimidateReply: L("«*Стук по склу — із труни панічно кричать: БУДЬ ЛАСКА, НЕ ВІДКРИВАЙТЕ, В МЕНЕ КЛАУСТРОФОБІЯ!*»", "'*From the coffin: PLEASE DON'T OPEN, I'M CLAUSTROPHOBIC!*"),
      coffeeReply: L("«О, дайте два стаканчики... другий для... е-е... охолодження радіатора!»", "'Give me two cups... second one is for the radiator!'"),
      arrestFull: L("Група СБК витягає із труни «небіжчика в ластах» та затримує водія катафалка!", "SBK pulls the 'deceased in swim fins' out of the coffin and cuffs the driver!"),
      arrestToned: L("Спроба незаконного переправлення особи у тайнику викрита.", "Stowaway smuggling attempt prevented."),
      hasContraband: true,
      bribeOffer: { amount: 650, isStingTrap: false, syndicateFavor: false },
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
      interrogationReply: L("«Слухай, у мене за спиною хлопці до Варшавки їдуть... Бери 700 ₴ у кишеню — і колись сам вивеземо вночі, як припече!»", "'Listen, carrying passengers in back... Take 700 ₴ and earn syndicate favors if you ever need a night exit!'"),
      intimidateReply: L("«Ой, не гарячкуй! Твої колеги на сусідній зміні спокійніше з Толіком працюють!»", "'Whoa easy there! Other shifts work smoothly with Tolik!'"),
      coffeeReply: L("«Дякую за каву, брате! Як буде треба тихо виїхати в Поландію — ти знаєш, де шукати Толіка!»", "'Thanks for the coffee brother! Whenever you need a quiet ride out, ask for Tolik!'"),
      arrestFull: L("Толіка «Бусика» беруть на гарячому — контрабандна мережа зазнала важких втрат!", "Tolik 'Busyk' is busted red-handed — smuggling syndicate takes a heavy hit!"),
      arrestToned: L("Перевізника з незадекларованим вантажем затримано.", "Carrier with undeclared contraband detained."),
      hasContraband: true,
      bribeOffer: { amount: 700, isStingTrap: false, syndicateFavor: true },
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
      interrogationReply: L("«Ой не напрягай. Ось 1 000 ₴ прямо на торпеді — або ж просто нажми ✖ ВІДМОВИТИ і втрачай шанс!»", "'Stop stressing me. Take 1,000 ₴ cash — or turn me down and stay broke!'"),
      intimidateReply: L("«ТИ НА КОГО ГАВКАЄШ?! Та мій батя цей шлагбаум завтра знесе! *руки тремтять на кермі*»", "'WHO DO YOU THINK YOU ARE YELLING AT?! My dad will demolish this booth!'"),
      coffeeReply: L("«Фу, та це ж розчинна з термоса? Ну... хоч гаряча, спасибі.»", "'Ugh, thermos coffee? Well... at least it is hot.'"),
      arrestFull: L("Мажор кричить у телефон «Батя, мене пакують за відмову виїзду!», але ти перестарався — достатньо було відмови!", "You detained a VIP over a missing permit when a simple DENY sufficed!"),
      arrestToned: L("Перевищення сили — достатньо було натиснути ✖ ВІДМОВИТИ.", "Excessive force — should have pressed DENY."),
      bribeOffer: { amount: 1000, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      storyTag: "DEPUTY_SON"
    });
  }

  function createGrandpaStepan(dayNum) {
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
      greeting: L("«Здоровенькі були, онучку! Бойко Степан, 68 років! Подивися на мої сиві вуса — їду провідати дочку й онуків!»", "'Good day, grandson! Stepan Boiko, 68 years old! Just visiting my grandkids!'"),
      interrogationReply: L("«Та чого там перевіряти, в мене й вік пенсійний, і документи як у космонавта!»", "'Nothing to worry about, senior age and clean papers!'"),
      intimidateReply: L("«Синочку, не кричи на діда, в мене ж тиск...»", "'Son, don't yell at an old man, my blood pressure...'"),
      coffeeReply: L("«Ой спасибі за кавусю! Тримай 50 ₴ на пиріжок і банку малинового варення для родини!»", "'Bless you for the coffee! Take 50 ₴ for pastries!'"),
      coffeeTip: 50,
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
      declaredCargo: L("Шкіряний портфель, диктофон", "Leather briefcase"),
      vehicleSearchResult: L("В бардачку лежать пусті протоколи вилучення готівки з шапкою НАБК!", "Glovebox holds blank NABK cash-seizure protocols!"),
      greeting: L("«Добрий день... Слухайте, довідку забув дома, а на зустріч у Варшавку запізнююся. Може, ось 500 ₴ — ніхто ж не бачить?..» *поправляє ґудзик піджака*", "'Hello... Forgot my permit at home. Here is 500 ₴ — nobody is watching, right?..' *adjusts lapel button*"),
      interrogationReply: L("«Та які камери, інспекторе?! Я звичайний менеджер, візьміть купюри в руки — швидше ж!»", "'What cameras?! Just touch the cash bills and stamp me!'"),
      intimidateReply: L("«*Різко блідне й прикриває рукою ґудзик на грудях* Е-е... не маєте права чіпати!»", "'*Goes pale and covers chest button* H-hey, hands off!'"),
      coffeeReply: L("«Дякую... тільки, будь ласка, не бризніть на лацкан піджака, там... чутлива електроніка!»", "'Thanks... please don't spill on my lapel, sensitive... fabric!'"),
      arrestFull: L("Ти затримав його, хоча він іще не вчинив злочину в межах документів — достатньо ✖ ВІДМОВИТИ!", "Should just press DENY without touching his marked bills!"),
      arrestToned: L("Агента не вдалося зловити на злочині — треба було ✖ ВІДМОВИТИ.", "Should press DENY cleanly."),
      bribeOffer: { amount: 500, isStingTrap: true, syndicateFavor: false },
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
      interrogationReply: L("«Ти шо, не поважаєш Князівство Монаківка?! Дам 900 ₴ — закрий очі на печатку!»", "'Disrespecting Monakivka?! Here is 900 ₴ — ignore the seal!'"),
      intimidateReply: L("«Ти... ти не смієш! В мене бронь... ну майже бронь...»", "'You... you wouldn't dare!'"),
      coffeeReply: L("«Хм, а непогана кава. У Монаківці така по 20 євро.»", "'Decent espresso. Costs 20 euros in Monakivka.'"),
      arrestFull: L("Контррозвідка СБК затримує псевдо-дипломата з липовим мандатом на «Геліку»!", "SBK arrests the fake diplomat with a bogus Duchy seal!"),
      arrestToned: L("Затримано особу з підробленим дипломатичним документом.", "Detained for forged diplomatic papers."),
      bribeOffer: { amount: 900, isStingTrap: false, syndicateFavor: false },
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
      interrogationReply: L("«Та все для армії, чесно! Ось 600 ₴ за швидкість оформлення без пса!»", "'All for charity, promise! Take 600 ₴ to skip the sniffer dog!'"),
      intimidateReply: L("«Стій, не тряси телефон! У мене прямий ефір зараз впаде!»", "'Stop shaking! My livestream is dropping frames!'"),
      coffeeReply: L("«Класний контент буде — п'ю каву з інспектором!»", "'Great vlog content — coffee with the guard!'"),
      arrestFull: L("Псевдоволонтера пакують у бус СБК під його ж власний стрім!", "The fake charity influencer gets cuffed on his own livestream!"),
      arrestToned: L("Затримано за комерційну контрабанду під виглядом гуманітарки.", "Detained for commercial smuggling under false charity guise."),
      hasContraband: true,
      bribeOffer: { amount: 600, isStingTrap: false, syndicateFavor: false },
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
      interrogationReply: isLegit ? L("«Перевіряйте по реєстру — я інженер кіберзахисту!»", "'Verify it — I am a cyber-defense engineer!'") : L("«Можу в USDT на крипто-гаманець кинути 450 ₴ еквівалентом?»", "'Can I send 450 ₴ in USDT to your wallet?'"),
      intimidateReply: isLegit ? L("«Ой, акуратно, не впустіть мій ноутбук!»", "'Careful, don't startle me with my laptop!'") : L("«Та ладно, невже печатка не виглядає солідно?!»", "'Come on, doesn't the stamp look legit?!'"),
      coffeeReply: L("«Дякую! Кофеїн + електросамокат = подвійна швидкість!»", "'Thanks! Caffeine + e-scooter = double speed!'"),
      coffeeTip: isLegit ? 60 : 0,
      arrestFull: L(isLegit ? "Ти затримав справжнього кіберінженера!" : "Шахрая з вигаданою крипто-печаткою затримано!", isLegit ? "You detained a real cyber engineer!" : "Detained for bogus crypto seal!"),
      arrestToned: L("Мандрівника на самокаті затримано.", "Scooter rider detained."),
      bribeOffer: isLegit ? null : { amount: 450, isStingTrap: false, syndicateFavor: false },
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
      coffeeReply: L("«Дякую, дитинко! Візьми 40 ₴ на гостинець та банку огірків на зміну!»", "'Thank you dear! Have 40 ₴ and a jar of pickles for the shift!'"),
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
      interrogationReply: L("«Не кличте СБК! Ось 900 ₴ просто зараз — тільки не перевіряйте багажник!»", "'Don't call SBK! 900 ₴ right now — just don't search the trunk!'"),
      intimidateReply: L("«*Різко пітніє* Я... я видалив усі фото! Простіше домовитись!»", "'*Sweating heavily* I... deleted the photos!'"),
      coffeeReply: L("«*Тремтячими руками тримає стакан* Д-дякую... а ви швидко штампуєте?»", "'*Hands shaking* Th-thanks... stamp quick?'"),
      arrestFull: L("Група СБК вилітає з будки й пакує коригувальника! Майор «Тихий» виписує тобі премію!", "SBK tackles the spotter and awards you a combat bonus!"),
      arrestToned: L("Підозрюваного у диверсійній діяльності затримано.", "Suspected saboteur detained."),
      hasContraband: true,
      bribeOffer: { amount: 900, isStingTrap: false, syndicateFavor: false },
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
      interrogationReply: L("«Тихіше! За ці плати серйозні люди платять золотом! Візьми 850 ₴ і закрий двері!»", "'Quiet! Gold awaits for those chips! Take 850 ₴!'"),
      intimidateReply: L("«*Озирається на кузов* Е-е... пралки звичайні, пломбу не чіпай!»", "'*Glances back nervously* Normal washers, don't break the seal!'"),
      coffeeReply: L("«Дякую за каву. Ось би ще штамп без затримок...»", "'Thanks for the coffee. Could really use a quick stamp...'"),
      arrestFull: L("Контррозвідка СБК арештовує контрабандиста військової електроніки разом із фургоном!", "SBK arrests the military chip smuggler and impounds the van!"),
      arrestToned: L("Контрабандну партію мікроелектроніки затримано.", "Smuggled military electronics seized."),
      hasContraband: true,
      bribeOffer: { amount: 850, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO, DISCREPANCY.FAKE_ISSUER_SEAL],
      isWantedTarget: true,
      storyTag: "SABOTEUR"
    });
  }

  // ★ DEEP COMBINATORIAL PROCEDURAL GENERATOR ★
  const HONEST_GREETINGS_F = [
    L("«Доброго дня! Їду до сестри у Варшавку з гостинцями, документи перевіряла двічі.»", "'Good day! Heading to my sister in Varshavka with gifts, papers checked twice.'"),
    L("«Привіт, інспекторе! Повертаюся додому в %CITY%, скучила за рідними!»", "'Hi inspector! Returning home to %CITY%, missed my family!'"),
    L("«Добрий день! Везу дитячі речі та медикаменти, ось мої папери.»", "'Hello! Carrying kids' clothes and medicine, here are my papers.'"),
    L("«Вітаю! Е-ех, і черга сьогодні на кордоні... Ось мій паспорт!»", "'Greetings! What a long border line today... Here is my passport!'")
  ];
  const HONEST_GREETINGS_M = [
    L("«Бажаю здоров'я! Усі довідки оформлені офіційно через ЦНАП м. %CITY%.»", "'Greetings! Official exemption issued in %CITY%.'"),
    L("«Добрий день, командире! Робочий рейс до Варшавки, усе в порядку.»", "'Good day! Business trip toward Varshavka, all clean.'"),
    L("«Вітаю! Везу волонтерський генератор хлопцям під Слобожанськ.»", "'Hello! Hauling a volunteer generator toward Slobozhansk.'")
  ];
  const HONEST_CARGOS = [
    L("Особисті валізи, термос, плед", "Personal suitcases, thermos & blanket"),
    L("Домашні закрутки, ноутбук, наплечник", "Homemade pickles, laptop, backpack"),
    L("Медична аптечка та дитячі іграшки", "First-aid kit & children's toys"),
    L("Бензопила, спальник і 2 павербанки", "Chainsaw, sleeping bag & 2 powerbanks"),
    L("Мед у трьохлітрових банках та рушники", "Honey jars & embroidered towels")
  ];
  const CONTRABAND_COVERS = [
    { decl: L("Старі дерев'яні меблі та килими", "Antique wooden furniture & rugs"), found: L("ПЕС «БАВОВНА» РОЗГРИЗ ОБШИВКУ: У ніжках столу сховано 50 блоків контрабандних сигарет!", "DOG SEARCH: Table legs packed with 50 smuggled cigarette cartons!") },
    { decl: L("Мішки з будівельним гіпсом та шпаклівкою", "Sacks of construction plaster"), found: L("ПЕС «БАВОВНА» РОЗКОПАВ ГІПС: Усередині мішків — каміння нелегального бурштину з Бурштинівки на $35 000!", "DOG SEARCH: Sacks hide $35,000 of raw Burshtynivka amber!") },
    { decl: L("Запасні автомобільні шини (4 шт.)", "Spare car tires (4 pcs)"), found: L("ПЕС «БАВОВНА» ГАВКАЄ НА ЗАПАСКУ: Всередині покришок заховані пачки нелегальної валюти та підроблені паспорти!", "DOG SEARCH: Tires stuffed with undeclared cash and forged passports!") }
  ];

  function createProceduralTraveler(daySpec) {
    const city = pick(CITIES);
    const trMeta = makeTransportMeta(null, null, generatePlate(city.code, true));

    if (Math.random() < 0.42) {
      // Honest traveler (high variety of genders, ages, bikes/scooters/on-foot/cars & cities!)
      const gender = Math.random() < 0.56 ? "F" : "M";
      const age = (gender === "M" && Math.random() < 0.45) ? randInt(61, 75) : randInt(20, 56);
      const dir = Math.random() < 0.65 ? "EXIT" : "ENTRY";
      const fullName = randomFullName(gender);
      const portrait = randomPortrait(gender);
      const cargo = pick(HONEST_CARGOS);
      const rawGreet = gender === "F" ? pick(HONEST_GREETINGS_F) : pick(HONEST_GREETINGS_M);
      const greeting = L(rawGreet.uk.replace("%CITY%", city.uk), rawGreet.en.replace("%CITY%", city.en));

      const extraDocs = [];
      if (dir === "EXIT" && gender === "M" && age >= 18 && age <= 60) {
        const reasons = [
          L("Багатодітний батько (3 дітей до 18 років)", "Father of 3 minor children"),
          L("Офіційне бронювання енергокомпанії «Кийград-Світло»", "Kyihrad Power Grid Critical Exemption"),
          L("Супровід особи з інвалідністю І групи", "Accompanying 1st-degree disabled relative")
        ];
        extraDocs.push({
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L(`ЦНАП м. ${city.uk}`, `CNAP ${city.en}`),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Підстава", "Basis"), value: pick(reasons), disc: null }
          ],
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
        fullName, age, gender, portrait, transport: trMeta,
        passportSub: L(`Серія ${city.code}-${randInt(100000, 999999)} • м. ${city.uk}`, `No. ${city.code}-${randInt(100000, 999999)} • ${city.en}`),
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Напрямок", "Direction"), value: dir === "EXIT" ? L("ВИЇЗД → Поландія", "EXIT → Polandia") : L(`В'ЇЗД → ${city.uk}`, `ENTRY → ${city.en}`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L(`${randInt(10, 28)}.0${randInt(1, 9)}.${randInt(2027, 2033)}`, `20${randInt(27, 33)}-0${randInt(1, 9)}-${randInt(10, 28)}`), disc: null }
        ],
        extraDocs,
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: cargo,
        greeting,
        interrogationReply: L("«Перевіряйте хоч двічі, усі печатки з мого міста справжні!»", "'Check twice if you wish, everything is genuine!'"),
        intimidateReply: L("«Ой... ну навіщо так гримати? Всі папери ж в порядку!»", "'Whoa... why bang on the window? All papers are clean!'"),
        coffeeReply: giveTip
          ? L("«О, золота ви людина! На вулиці дубак. Тримайте 50 ₴ на поповнення термоса!»", "'Thank you kindly! It's freezing out there — take 50 ₴ for the thermos!'")
          : L("«Дякую щиро за теплу каву, легкої зміни вам!»", "'Thank you for the warm coffee, have a smooth shift!'"),
        coffeeTip: giveTip ? 50 : 0,
        arrestFull: L("Ти заарештував абсолютно чесного мандрівника!", "Guards awkwardly detain an innocent traveler!"),
        arrestToned: L("Мандрівника помилково затримано.", "Innocent traveler detained."),
        shouldBeApproved: true
      });
    }

    // Procedural Violator (7 distinct schemes — zero text spoilers!)
    const maxScheme = daySpec.requireOblikQr ? 6 : (daySpec.requireVehicleDecl ? 5 : 3);
    const scheme = randInt(0, maxScheme);

    if (scheme === 0) {
      // Formal violation: Expired date (no "ПРОСТРОЧЕНИЙ" text!) OR Male 18-60 without permit
      const gender = Math.random() < 0.4 ? "F" : "M";
      const fullName = randomFullName(gender);
      const age = randInt(23, 49);
      const portrait = randomPortrait(gender);
      const isExpired = gender === "F" || Math.random() < 0.5;
      const disc = isExpired ? DISCREPANCY.EXPIRED_DATE : DISCREPANCY.AGE_RESTRICTION_NO_PERMIT;
      const expYear = pick(["2019", "2020", "2021"]);
      return buildTravelerFromParts({
        fullName, age, gender, portrait, transport: trMeta,
        passportSub: L(`Серія ${city.code}-${randInt(100000, 999999)} • м. ${city.uk}`, `No. ${city.code}-${randInt(100000, 999999)}`),
        passportFields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Варшавка", "EXIT → Varshavka"), disc: null },
          isExpired
            ? { label: L("Дійсний до", "Valid Until"), value: L(`03.05.${expYear}`, `${expYear}-05-03`), disc }
            : { label: L("Відстрочка 18–60", "Exit Permit"), value: L("Без оформленої підстави", "None submitted"), disc }
        ],
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: L("Валізи, плед", "Suitcases"),
        greeting: isExpired
          ? L(`«Ой, добрий день! Так поспішали з м. ${city.uk} на рейс до Варшавки!»`, `'Hello! Rushing from ${city.en} for Varshavka!'`)
          : L("«Добрий день! Їду на тиждень, думав, по біометричному без довідки пускають!»", "'Good day! Thought biometric passport was enough without a permit!'"),
        interrogationReply: L("«Та це ж дрібниця, не присікуйтеся... Може, 350 ₴ на каву вирішать питання?»", "'Just a minor slip-up... Maybe 350 ₴ solves it?'"),
        intimidateReply: L("«*Нервово ковтає* Та я ж тільки формальність проґавив, не кличте СБК!»", "'*Gulps* It's just a paperwork slip, don't call SBK!'"),
        coffeeReply: L("«Дякую за каву... ну то ви закриєте очі на папери?»", "'Thanks for the coffee... so we good?'"),
        arrestFull: L("Ти викликав спецназ за формальну помилку — достатньо було натиснути ✖ ВІДМОВИТИ!", "Overkill! A simple DENY stamp was required."),
        arrestToned: L("Перевищення сили — треба було ✖ ВІДМОВИТИ.", "Should have pressed DENY."),
        bribeOffer: { amount: 350, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [disc]
      });
    }

    if (scheme === 1) {
      // Fake issuer seal
      const fullName = randomFullName("M");
      const age = randInt(24, 48);
      const portrait = Object.assign(randomPortrait("M"), { scarOrDetail: 2, expression: 2 });
      const fakes = [
        { diag: L("Гострий карієс переднього зуба", "Acute toothache"), clinic: L("Стоматологія «Веселий Зуб»", "Dental 'Happy Tooth'") },
        { diag: L("Психосоматична алергія на зелену фарбу", "Green pigment allergy"), clinic: L("Студія краси «Нігтики Левгорода»", "Beauty Salon") },
        { diag: L("Денний бакалавр магії та тарології", "Bachelor of Tarot Studies"), clinic: L("Академія Крипти і Гороскопів", "Tarot & Crypto Academy") },
        { diag: L("Плоскостопість за висновком кінолога", "Flat feet per dog groomer"), clinic: L("Ветклініка «Пухнастий Хвіст»", "Vet Clinic 'Fluffy Tail'") },
        { diag: L("Станція техобслуговування", "Critical auto washing"), clinic: L("Автомийка «Піна-Люкс Офшорія»", "Carwash 'Foam-Lux'") }
      ];
      const fc = pick(fakes);
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: trMeta,
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
        interrogationReply: L("«Ну... в Телеграмі порадили! Візьми 480 ₴ у конверті — печатку ж ніхто не роздивиться!»", "'Bought it online! Take 480 ₴ — nobody inspects the seal!'"),
        intimidateReply: L("«*Виступає піт* Та директор клініки клявся, що довідка пройде! Даю 480 ₴!»", "'*Sweats* The clinic swore it would pass! Take 480 ₴!'"),
        coffeeReply: L("«Дякую за каву... тільки під УФ-лампу цю довідку не суньте, вона... екологічна!»", "'Thanks for coffee... please keep it out of UV light!'"),
        arrestFull: L("Власника липової довідки затримано за використання підробленої печатки!", "Forged seal user arrested!"),
        arrestToned: L("Порушника з фіктивною печаткою затримано.", "Forged seal traveler detained."),
        bribeOffer: { amount: 480, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.FAKE_ISSUER_SEAL]
      });
    }

    if (scheme === 2) {
      // Visual PHOTO_MISMATCH (no text spoiler — click mini passport photo or face row!)
      const gender = Math.random() < 0.5 ? "F" : "M";
      const fullName = randomFullName(gender);
      const age = randInt(25, 50);
      const realPortrait = randomPortrait(gender);
      const oppositeGender = gender === "F" ? "M" : "F";
      const fakePhoto = randomPortrait(oppositeGender);
      fakePhoto.hairColor = (realPortrait.hairColor + 2) % 5;
      fakePhoto.facialHair = oppositeGender === "M" ? 4 : 0;
      return buildTravelerFromParts({
        fullName, age, gender,
        portrait: realPortrait,
        passportPortrait: fakePhoto,
        transport: trMeta,
        passportFields: [
          { label: L("ПІБ (звірте фото!)", "Full Name (verify photo)"), value: fullName, disc: DISCREPANCY.PHOTO_MISMATCH },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("21.12.2030", "2030-12-21"), disc: null }
        ],
        includeDecl: daySpec.requireVehicleDecl,
        declaredCargo: L("Особисті речі", "Personal effects"),
        greeting: L("«Добрий день! Ось мій паспорт... я трохи змінився за останній рік після відпустки.»", "'Hello! Here is my passport... I look a bit different since last summer.'"),
        interrogationReply: L("«Ну взяв паспорт брата/сестри, бо свій загубив! Візьми 520 ₴ і закрий очі!»", "'Borrowed a relative's passport! Take 520 ₴!'"),
        intimidateReply: L("«*Очі бігають* Та пластична операція! Хто тепер у фото дивиться?!»", "'*Eyes dart* Had a makeover! Who even checks photos?!'"),
        coffeeReply: L("«Дякую за каву... перегорніть сторінку швидше!»", "'Thanks... please flip the passport page!'"),
        arrestFull: L("Підміна особи викрита — чужий паспорт вилучено, а водія затримано!", "Passport impersonation busted!"),
        arrestToned: L("Використано чужий документ — затримано.", "Stolen ID detained."),
        bribeOffer: { amount: 520, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.PHOTO_MISMATCH]
      });
    }

    if (scheme === 3) {
      // NAME_MISMATCH across Passport vs Exemption / Customs
      const fullName = randomFullName("M");
      const otherName = randomFullName("M");
      const age = randInt(26, 48);
      const portrait = randomPortrait("M");
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: trMeta,
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
        interrogationReply: L("«Тьфу, в друкарні прізвище переплутали! Бери 500 ₴, не присікуйся!»", "'Damn, typo in the name! Take 500 ₴ and let me roll!'"),
        intimidateReply: L("«*Тремтить* Це... це подвійне прізвище! Чи кума...»", "'*Stammers* It's my... second surname!'"),
        coffeeReply: L("«Спасибі за каву... і прізвище не звіряйте сильно, гаразд?»", "'Thanks... no need to compare surnames closely!'"),
        arrestFull: L("Чужа куплена довідка викрита — афериста пакує контррозвідка!", "Mismatched documents seized!"),
        arrestToned: L("Виявлено розбіжність ПІБ у документах.", "Name mismatch detained."),
        bribeOffer: { amount: 500, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.NAME_MISMATCH]
      });
    }

    if (scheme === 4 && daySpec.requireVehicleDecl) {
      // VEHICLE_MISMATCH (Car parked outside vs paper Declaration color/model mismatch!)
      const gender = Math.random() < 0.4 ? "F" : "M";
      const fullName = randomFullName(gender);
      const age = randInt(25, 52);
      const portrait = randomPortrait(gender);
      const realCol = pick([getColorById("RED"), getColorById("YELLOW"), getColorById("EMERALD")]);
      const fakeCol = getColorById("BLACK");
      const carOnly = pick(TRANSPORT_CATALOG.filter(m => m.isCar));
      const fakeCar = pick(TRANSPORT_CATALOG.filter(m => m.isCar && m.name.uk !== carOnly.name.uk));
      const realTr = makeTransportMeta(carOnly, realCol, generatePlate(city.code, true));

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
        fakeModelName: fakeCar.name,
        fakeColorName: fakeCol.name,
        vehMismatchDisc: DISCREPANCY.VEHICLE_MISMATCH,
        declaredCargo: L("Особисті речі водія", "Driver personal luggage"),
        vehicleSearchResult: L("Звірка VIN-коду: номери перебито болгаркою! Автомобіль у розшуку Інтерполу як «двійник»!", "VIN Check: Grinder marks on chassis! Stolen cloned car!"),
        greeting: L("«Вітаю, інспекторе! Переганяю машину по довіреності, колір... ну, під ліхтарем може здаватися іншим!»", "'Greetings! Driving on power-of-attorney, the paint... uh, looks different under streetlamps!'"),
        interrogationReply: L("«Слухай, на СТО пофарбували вчора й не вписали! Ось 650 ₴ — не перевіряй техпаспорт!»", "'Repainted it yesterday! Take 650 ₴ and ignore the title!'"),
        intimidateReply: L("«*Різко закриває вікно наполовину* Це... це плівка-хамелеон!»", "'*Rolls window halfway up* It's... chameleon wrap!'"),
        coffeeReply: L("«Дякую! Гаряча кава краще за будь-яке СТО!»", "'Thanks! Better than any mechanic!'"),
        arrestFull: L("Авто-двійника з перебитими номерами конфісковано, водія затримано!", "Cloned vehicle confiscated and driver arrested!"),
        arrestToned: L("Виявлено невідповідність транспорту техпаспорту.", "Vehicle mismatch detained."),
        bribeOffer: { amount: 650, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.VEHICLE_MISMATCH]
      });
    }

    if (scheme === 5 && daySpec.requireVehicleDecl) {
      // CONTRABAND_CARGO hidden behind plausible declaration (revealed on Dog Search!)
      const fullName = randomFullName("M");
      const age = randInt(28, 53);
      const portrait = randomPortrait("M");
      const cCase = pick(CONTRABAND_COVERS);
      return buildTravelerFromParts({
        fullName, age, gender: "M", portrait, transport: trMeta,
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
        greeting: L(`«Салют, шефе! Звичайні речі з м. ${city.uk}, усе по декларації!»`, `'Hello boss! Ordinary cargo from ${city.en}, all declared!'`),
        interrogationReply: L("«Навіщо пса кликати, він мені сумки подряпає! Лови 600 ₴!»", "'No need for the sniffer dog, it scratches my bags! Catch 600 ₴!'"),
        intimidateReply: L("«*Здригнувся, коли пес підійшов* Заберіть «Бавовну» від багажника!»", "'*Flinches as dog nears* Keep Bavovna away from the trunk!'"),
        coffeeReply: L("«Дякую... а собака вашу каву любить? Може, заберете її в будку?»", "'Thanks... keep your dog inside with the coffee, okay?'"),
        arrestFull: L("Контрабандиста взято на гарячому за допомогою пса «Бавовни»!", "Smuggler busted red-handed by sniffer dog Bavovna!"),
        arrestToned: L("Вилучено контрабандний вантаж.", "Contraband cargo seized."),
        hasContraband: true,
        bribeOffer: { amount: 600, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.CONTRABAND_CARGO]
      });
    }

    if (scheme === 6 && daySpec.requireOblikQr) {
      // INVALID_QR_CODE (Oblik+)
      const fullName = randomFullName("M");
      const age = randInt(23, 50);
      const portrait = randomPortrait("M");
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
        interrogationReply: L("«Та то база Облік+ зависла! Ось 700 ₴ — не натискай 🚨 АРЕШТ!»", "'The Oblik+ server must be down! Take 700 ₴ — don't press 🚨 DETAIN!'"),
        intimidateReply: L("«*Різко ховає телефон у кишеню* Батарея сіла, нічого сканувати!»", "'*Hides phone* Battery died, can't scan!'"),
        coffeeReply: L("«О, дякую... ви тільки інтернет на планшеті вимкніть!»", "'Thanks... maybe turn off tablet Wi-Fi!'"),
        arrestFull: L("Реєстр «Облік+» підтвердив статус у розшуку — порушника передано групі реагування!", "Oblik+ confirmed wanted status — detained!"),
        arrestToned: L("Затримано за недійсним кодом у реєстрі «Облік+».", "Detained for wanted Oblik+ code."),
        bribeOffer: { amount: 700, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.INVALID_QR_CODE]
      });
    }

    return Math.random() < 0.5 ? createMicrochipSmuggler() : createArtillerySpotter();
  }

  // Non-repeating queue builder across all Story + Shytomyr + War/Intel + Combinatorial travelers
  let usedStoryTags = new Set();

  function generateDailyQueue(daySpec, count) {
    const q = [];

    // 1. Cycle through the 3 Shytomyr legends organically (without repeating the exact same duo unnecessarily)
    const friendIdx = (daySpec.dayNumber - 1) % SHYTOMYR_LEGENDS.length;
    q.push(createShytomyrFriend(SHYTOMYR_LEGENDS[friendIdx]));
    if (daySpec.dayNumber >= 3 && Math.random() < 0.55) {
      const secondFriend = SHYTOMYR_LEGENDS[(friendIdx + 1) % SHYTOMYR_LEGENDS.length];
      q.push(createShytomyrFriend(secondFriend));
    }

    // 2. Pick 1-2 unique non-repeating story characters from the 10-character pool
    const uniquePool = [
      { tag: "AUNT_HALYA", fn: () => createAuntHalya() },
      { tag: "COFFIN", fn: () => createCoffinSneezer() },
      { tag: "TOLIK", fn: () => createTolikCourier() },
      { tag: "DEPUTY_SON", fn: () => createDeputySon() },
      { tag: "STEPAN_2", fn: () => createGrandpaStepan(daySpec.dayNumber) },
      { tag: "NABK_STING", fn: () => createNabkSting() },
      { tag: "MONACO_MP", fn: () => createMonacoBattalionMP() },
      { tag: "FAKE_BLOGGER", fn: () => createFakeVolunteerBlogger() },
      { tag: "CRYPTO_SCOOTER", fn: () => createCryptoStartupFounder(daySpec.dayNumber) },
      { tag: "GRANDMA_PICKLES", fn: () => createGrandmaPickles() }
    ];
    for (const item of shuffle(uniquePool)) {
      if (!usedStoryTags.has(item.tag) && q.length < count - 3) {
        usedStoryTags.add(item.tag);
        q.push(item.fn());
        if (q.length >= 4) break;
      }
    }

    // 3. Add 1 War/Intelligence encounter (Ally courier or Saboteur/Spotter)
    q.push(Math.random() < 0.5 ? createIntelCovertCourier() : createArtillerySpotter());

    // 4. Fill remaining slots with fresh combinatorial travelers
    while (q.length < count) {
      q.push(createProceduralTraveler(daySpec));
    }

    return shuffle(q.slice(0, count));
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

    // 1. Twilight Carpathian Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.66);
    sky.addColorStop(0, "#080D12");
    sky.addColorStop(0.55, "#152329");
    sky.addColorStop(1, "#2A3D36");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Subtle twinkling stars & Crescent Moon
    [[34, 18], [88, 32], [142, 14], [214, 26], [284, 16], [336, 30], [398, 22]].forEach(([sx, sy], i) => {
      const alpha = 0.45 + 0.4 * Math.sin(tSec * 1.8 + i * 1.3);
      ctx.fillStyle = `rgba(255, 248, 225, ${alpha.toFixed(2)})`;
      ctx.fillRect(sx, sy, 1.8, 1.8);
    });
    ctx.beginPath();
    ctx.arc(w * 0.87, 29, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#F4E9C9";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.87 + 4.5, 26, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#0F1A20";
    ctx.fill();

    // 2. Layered Carpathian Ridge + Pine Silhouette
    ctx.fillStyle = "#16201C";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.lineTo(w * 0.18, h * 0.44);
    ctx.lineTo(w * 0.42, h * 0.56);
    ctx.lineTo(w * 0.68, h * 0.41);
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(w, h * 0.64);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0D1411";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.63);
    for (let x = 0; x <= w; x += 15) {
      const peak = (x % 30 === 0) ? 22 : ((x % 45 === 0) ? 16 : 11);
      ctx.lineTo(x + 7.5, h * 0.63 - peak);
      ctx.lineTo(x + 15, h * 0.63);
    }
    ctx.closePath();
    ctx.fill();

    // 3. Animated Sweeping Searchlight Beam from Watchtower
    const towerX = 48, towerY = 42;
    const sweepOffset = Math.sin(tSec * 0.65) * 75;
    const beamTargetX = w * 0.62 + sweepOffset;
    const beamGrad = ctx.createLinearGradient(towerX, towerY, beamTargetX, h * 0.92);
    beamGrad.addColorStop(0, "rgba(255, 232, 140, 0.36)");
    beamGrad.addColorStop(1, "rgba(255, 232, 140, 0.0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(towerX + 6, towerY + 2);
    ctx.lineTo(beamTargetX + 52, h * 0.94);
    ctx.lineTo(beamTargetX - 48, h * 0.94);
    ctx.closePath();
    ctx.fill();

    // 4. Watchtower Silhouette (ВИШКА ДПСК)
    ctx.fillStyle = "#161B18";
    ctx.fillRect(towerX - 15, towerY - 12, 30, 18);
    ctx.fillRect(towerX - 19, towerY - 17, 38, 6);
    ctx.fillStyle = "#E0B145";
    ctx.fillRect(towerX - 8, towerY - 7, 16, 7);
    ctx.strokeStyle = "#161B18";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(towerX - 11, towerY + 6); ctx.lineTo(towerX - 20, h * 0.72);
    ctx.moveTo(towerX + 11, towerY + 6); ctx.lineTo(towerX + 20, h * 0.72);
    ctx.moveTo(towerX - 15, towerY + 34); ctx.lineTo(towerX + 15, towerY + 34);
    ctx.stroke();

    // 5. Wet Asphalt Frontier Highway
    ctx.fillStyle = "#1E2422";
    ctx.fillRect(0, h * 0.63, w, h * 0.37);
    ctx.fillStyle = "#141816";
    ctx.fillRect(0, h * 0.63, w, 4);
    ctx.strokeStyle = "#627068";
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.84); ctx.lineTo(w, h * 0.84);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Concrete Stele Sign ("KRAINA") on shoulder
    ctx.fillStyle = "#3E4A44";
    ctx.fillRect(w * 0.17, h * 0.50, 18, 28);
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(w * 0.17, h * 0.53, 18, 5);
    ctx.fillStyle = "#FBC02D";
    ctx.fillRect(w * 0.17, h * 0.58, 18, 5);

    // 7. Queued Vehicles on Road (front SUV + rear Sedan) with glowing headlights
    // Rear Sedan (subtle headlights)
    ctx.fillStyle = "#202A30";
    ctx.beginPath(); ctx.roundRect(w * 0.25, h * 0.60, 62, 22, 5); ctx.fill();
    ctx.fillStyle = "#151D22";
    ctx.beginPath(); ctx.roundRect(w * 0.28, h * 0.54, 40, 10, 4); ctx.fill();
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(w * 0.25 + 2, h * 0.66, 4, 4);
    ctx.fillStyle = "#FFF59D";
    ctx.beginPath(); ctx.arc(w * 0.25 + 58, h * 0.69, 3, 0, Math.PI * 2); ctx.fill();

    // Lead Black Beha SUV at Barrier
    ctx.fillStyle = "#14191C";
    ctx.beginPath(); ctx.roundRect(w * 0.45, h * 0.58, 96, 32, 6); ctx.fill();
    ctx.fillStyle = "#232F36";
    ctx.beginPath(); ctx.roundRect(w * 0.48, h * 0.49, 64, 15, 5); ctx.fill();
    // Wheels
    ctx.fillStyle = "#0B0D0E";
    [w * 0.49, w * 0.62].forEach(wx => {
      ctx.beginPath(); ctx.arc(wx, h * 0.58 + 30, 7, 0, Math.PI * 2); ctx.fill();
    });
    // Warm amber headlight cones on asphalt
    const headGrad = ctx.createLinearGradient(w * 0.67, h * 0.72, w * 0.80, h * 0.78);
    headGrad.addColorStop(0, "rgba(255, 243, 148, 0.36)");
    headGrad.addColorStop(1, "rgba(255, 243, 148, 0)");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.67, h * 0.70);
    ctx.lineTo(w * 0.80, h * 0.66);
    ctx.lineTo(w * 0.80, h * 0.83);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFF59D";
    ctx.beginPath(); ctx.arc(w * 0.45 + 90, h * 0.72, 3.8, 0, Math.PI * 2); ctx.fill();

    // 8. Inspector Booth (ПОСТ № 04) on Right + Pal Palych Standing at Gate
    ctx.fillStyle = "#26302B";
    ctx.fillRect(w * 0.77, h * 0.34, 86, 80);
    ctx.fillStyle = "#161E1A";
    ctx.fillRect(w * 0.75, h * 0.29, 94, 9);
    // Warm amber lit window + interior inspector silhouette
    ctx.fillStyle = "#DFAF42";
    ctx.fillRect(w * 0.80, h * 0.43, 48, 30);
    ctx.fillStyle = "#2A2018";
    ctx.beginPath(); ctx.arc(w * 0.85, h * 0.56, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(w * 0.825, h * 0.63, 17, 10);

    // Pal Palych standing outside beside the barrier post with clipboard
    const px = w * 0.72, py = h * 0.67;
    ctx.fillStyle = "#2E4032";
    ctx.fillRect(px - 6, py, 12, 20);
    ctx.fillStyle = "#DCAE88";
    ctx.beginPath(); ctx.arc(px, py - 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1E2D24";
    ctx.fillRect(px - 7, py - 11, 14, 4);

    // 9. Red-and-White Barrier Arm + Pulsing Beacon
    const barPostX = w * 0.30, barY = h * 0.65;
    ctx.fillStyle = "#37474F";
    ctx.fillRect(barPostX, h * 0.56, 12, 36);
    const pulse = 0.55 + 0.45 * Math.sin(tSec * 4.2);
    ctx.fillStyle = `rgba(255, 23, 68, ${pulse.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(barPostX + 6, h * 0.55, 4.5, 0, Math.PI * 2); ctx.fill();
    for (let s = 0; s < 10; s++) {
      ctx.fillStyle = s % 2 === 0 ? "#B82323" : "#ECEFF1";
      ctx.fillRect(barPostX + 12 + s * 17, barY, 17, 6);
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
    const skinColors = ["#F2CCB0", "#E8C3A2", "#DCAE88", "#F7DAC6"];
    const hairColors = ["#231F20", "#5D3A24", "#8D9499", "#E2B24A", "#9E3B24"];
    const lipColors = ["#D85A6C", "#C23B52", "#E06D53"];
    const outfitPalette = isFemale
      ? ["#7E4A5C", "#3949AB", "#2E7D32", "#5D4037"]
      : ["#4E433B", "#263238", "#37474F", "#4A553B"];
    const coatMap = {
      PALYCH_BOSS: "#3A4D39",
      TOLIK_SMUGGLER: "#1C1F22",
      VOLUNTEER_OLYA: "#556B2F",
      DEPUTY_SON_MAJORS: "#8D6E1F",
      AUNT_HALYA: "#5C6BC0",
      SHYTOMYR_BRO: "#1565C0",
      NABK_AGENT: "#2C353D"
    };
    const skin = skinColors[(p.skinTone || 0) % skinColors.length];
    const hair = hairColors[(p.hairColor || 0) % hairColors.length];
    const coat = coatMap[p.specialId] || outfitPalette[(p.outfitStyle || 0) % outfitPalette.length];

    ctx.save();
    ctx.strokeStyle = "#1B1B1B";
    ctx.lineWidth = 2.4 * scale;

    const hw = (isFemale ? 58 : 66) * scale;
    const hh = (isFemale ? 70 : 76) * scale;
    const sw = (isFemale ? 104 : 120) * scale;
    const sh = 46 * scale;
    const hTop = bottomY - sh - hh + 4 * scale;

    // 1. FEMALE BACK LONG HAIR
    if (isFemale && p.headwear !== 2) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.72, hTop + 6 * scale, hw * 1.44, hh + 28 * scale, 26 * scale);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Shoulders / Coat
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, bottomY - sh, sw, sh + 10, 22 * scale);
    ctx.fill();
    ctx.stroke();

    if (isFemale) {
      ctx.fillStyle = "#F5E6D3";
      ctx.beginPath();
      ctx.moveTo(cx - 16 * scale, bottomY - sh);
      ctx.lineTo(cx + 16 * scale, bottomY - sh);
      ctx.lineTo(cx, bottomY - sh + 22 * scale);
      ctx.closePath();
      ctx.fill();
    } else if (p.outfitStyle === 2 || p.specialId === "NABK_AGENT") {
      // Tie / shirt collar for suit look
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.moveTo(cx - 14 * scale, bottomY - sh);
      ctx.lineTo(cx + 14 * scale, bottomY - sh);
      ctx.lineTo(cx, bottomY - sh + 18 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Gold chain
    if (p.scarOrDetail === 3) {
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(cx, bottomY - sh + 6 * scale, 20 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
      ctx.lineWidth = 2.4 * scale;
    }

    // Secret NABK UV Camera Lapel Glint!
    if (opts.uvActive && p.specialId === "NABK_AGENT") {
      ctx.fillStyle = "#FF1744";
      ctx.beginPath();
      ctx.arc(cx - 22 * scale, bottomY - sh + 18 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FF80AB";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(cx - 22 * scale, bottomY - sh + 18 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
      ctx.lineWidth = 2.4 * scale;
    }

    // 3. Neck
    const neckW = (isFemale ? 20 : 28) * scale;
    ctx.fillStyle = skin;
    ctx.fillRect(cx - neckW / 2, bottomY - sh - 12 * scale, neckW, 18 * scale);

    // Floral headscarf background
    if (p.headwear === 2) {
      ctx.fillStyle = "#8D4E42";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.68, hTop - 7 * scale, hw * 1.36, hh * 1.18, 30 * scale);
      ctx.fill();
    }

    // 4. Ears + Female Earrings
    const earY = hTop + hh * 0.54;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx - hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.arc(cx + hw * 0.52, earY, 7 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (isFemale) {
      ctx.fillStyle = "#FFD54F";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.54, earY + 7 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.54, earY + 7 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Head contour
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2, hTop, hw, hh, (isFemale ? 30 : 18) * scale);
    ctx.fill();
    ctx.stroke();

    if (isFemale) {
      ctx.fillStyle = "rgba(229, 115, 115, 0.28)";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Hair & Headwear
    if (isFemale) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.55, hTop - 7 * scale, hw * 1.1, hh * 0.28, 18 * scale);
      ctx.fill();
      if ((p.hairStyle || 0) % 2 === 0 && p.headwear !== 2) {
        ctx.beginPath();
        ctx.arc(cx, hTop - 11 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillRect(cx - hw * 0.56, hTop + 8 * scale, 9 * scale, hh * 0.65);
      ctx.fillRect(cx + hw * 0.47, hTop + 8 * scale, 9 * scale, hh * 0.65);
    } else if (p.headwear === 0 || p.headwear === 3) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.52, hTop - 5 * scale, hw * 1.04, hh * 0.24, 12 * scale);
      ctx.fill();
    } else if (p.headwear === 1) {
      ctx.fillStyle = "#4E4B3E";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.58, hTop - 7 * scale, hw * 1.16, 20 * scale, 10 * scale);
      ctx.fill();
    } else if (p.headwear === 4) {
      ctx.fillStyle = "#2E473B";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.62, hTop - 12 * scale, hw * 1.24, 22 * scale, 7 * scale);
      ctx.fill();
      ctx.fillStyle = "#FFCA28";
      ctx.beginPath();
      ctx.arc(cx, hTop - 2 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Eyes + Eyelashes + Sweat drops if Intimidated
    const eyeY = hTop + hh * 0.44;
    const eyeOx = hw * 0.22;
    const eyeR = (opts.reactionState === "INTIMIDATED" ? 7.0 : 5.8) * scale;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    const pupR = (opts.reactionState === "INTIMIDATED" ? 2.1 : 3.0) * scale;
    ctx.fillStyle = isFemale ? "#2E4053" : "#1B1B1B";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, pupR, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, pupR, 0, Math.PI * 2);
    ctx.fill();

    if (isFemale) {
      ctx.strokeStyle = "#1B1B1B";
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
      ctx.beginPath();
      ctx.moveTo(cx - eyeOx - 8 * scale, eyeY - 9 * scale);
      ctx.lineTo(cx - eyeOx + 8 * scale, eyeY - 10 * scale);
      ctx.moveTo(cx + eyeOx - 8 * scale, eyeY - 10 * scale);
      ctx.lineTo(cx + eyeOx + 8 * scale, eyeY - 9 * scale);
      ctx.stroke();
    }

    // Glasses
    ctx.strokeStyle = "#1B1B1B";
    ctx.lineWidth = 2.2 * scale;
    if (p.glasses > 0) {
      ctx.fillStyle = p.glasses === 2 ? "rgba(16,32,39,0.82)" : "rgba(224,247,250,0.25)";
      ctx.beginPath();
      ctx.roundRect(cx - eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, 14 * scale, 4 * scale);
      ctx.roundRect(cx + eyeOx - 10 * scale, eyeY - 7 * scale, 20 * scale, 14 * scale, 4 * scale);
      ctx.fill();
      ctx.stroke();
    }

    // Left cheek scar (glows faintly under UV!)
    if (p.scarOrDetail === 1) {
      ctx.strokeStyle = opts.uvActive ? "#FF4081" : "#B71C1C";
      ctx.lineWidth = (opts.uvActive ? 3.4 : 2.8) * scale;
      ctx.beginPath();
      ctx.moveTo(cx + hw * 0.16, eyeY + 8 * scale);
      ctx.lineTo(cx + hw * 0.34, eyeY + 22 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
    }

    // Sweat drops when yelled at / intimidated!
    if (opts.reactionState === "INTIMIDATED") {
      ctx.fillStyle = "#4FC3F7";
      ctx.beginPath();
      ctx.ellipse(cx + hw * 0.38, eyeY - 10 * scale, 3 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - hw * 0.36, eyeY - 6 * scale, 2.5 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Mustache / Beard & Mouth (Smiles when Coffee Given, O-shape when Intimidated)
    const mouthY = hTop + hh * 0.77;
    if (!isFemale && (p.facialHair === 2 || p.facialHair === 4)) {
      const mw = (p.facialHair === 4 ? 36 : 25) * scale;
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - mw / 2, mouthY - 8 * scale, mw, 8 * scale, 4 * scale);
      ctx.fill();
    } else if (!isFemale && p.facialHair === 3) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.34, mouthY - 4 * scale, hw * 0.68, 18 * scale, 9 * scale);
      ctx.fill();
    }

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
  function drawTransportInBooth(ctx, w, h, shape, bodyColor, roofColor) {
    ctx.save();
    const cx = w * 0.54;
    const groundY = h * 0.62;

    if (shape === "ON_FOOT") {
      // Draw two iconic red-white-blue checkered bazaar bags "Мрія Перекупа"!
      [cx - 32, cx + 18].forEach((bx, idx) => {
        const bw = 24, bh = 22, by = groundY - bh + (idx * 2);
        ctx.fillStyle = "#1565C0";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "#C62828";
        ctx.fillRect(bx + 4, by, 5, bh);
        ctx.fillRect(bx + 14, by, 5, bh);
        ctx.fillStyle = "#ECEFF1";
        ctx.fillRect(bx, by + 6, bw, 4);
        ctx.fillRect(bx, by + 14, bw, 4);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by, 6, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    if (shape === "BICYCLE") {
      // Draw bicycle + burlap potato sack in bodyColor!
      const wr = 11;
      const lx = cx - 26, rx = cx + 22, wy = groundY - wr;
      ctx.strokeStyle = "#1B1B1B";
      ctx.lineWidth = 2.4;
      [lx, rx].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
      });
      // Painted frame
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(lx, wy); ctx.lineTo(cx - 2, wy); ctx.lineTo(rx - 6, wy - 18); ctx.lineTo(lx + 8, wy - 14); ctx.closePath();
      ctx.moveTo(rx, wy); ctx.lineTo(rx - 8, wy - 24); ctx.lineTo(rx - 15, wy - 25);
      ctx.stroke();
      // Burlap sack on rear rack
      ctx.fillStyle = "#C5A880";
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(lx + 4, wy - 14, 10, 7, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      return;
    }

    if (shape === "E_SCOOTER") {
      const lx = cx - 20, rx = cx + 18, wy = groundY - 6;
      ctx.fillStyle = "#1B1B1B";
      [lx, rx].forEach(wx => { ctx.beginPath(); ctx.arc(wx, wy, 5.5, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = bodyColor;
      ctx.fillRect(lx, wy - 5, rx - lx, 5);
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(rx - 2, wy - 4); ctx.lineTo(rx - 8, wy - 36); ctx.lineTo(rx - 14, wy - 36); ctx.stroke();
      // LED beam
      ctx.fillStyle = "#FFF59D";
      ctx.beginPath(); ctx.arc(rx - 3, wy - 33, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    // Cars / Buses / Vans / Hearses / Pickups painted dynamically in bodyColor & roofColor!
    const isTall = shape === "MINIBUS" || shape === "HEARSE" || shape === "BUS";
    const isSuv = shape === "SUV" || shape === "G_WAGON" || shape === "PICKUP";
    const vw = shape === "BUS" ? w * 0.78 : (isTall ? w * 0.72 : w * 0.68);
    const vh = shape === "BUS" ? 44 : (isTall ? 38 : (isSuv ? 34 : (shape === "SPORT" ? 26 : 30)));
    const vx = w * 0.16;
    const vy = groundY - vh - 6;

    // Lower body
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = "#14181A";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(vx, vy + (isTall ? 2 : 10), vw, vh - (isTall ? 2 : 10), shape === "G_WAGON" ? 3 : 8);
    ctx.fill();
    ctx.stroke();

    // Upper Cabin / Roof
    if (!isTall) {
      const cabX = shape === "PICKUP" ? vx + vw * 0.16 : vx + vw * 0.18;
      const cabW = shape === "PICKUP" ? vw * 0.44 : vw * 0.60;
      ctx.fillStyle = roofColor || bodyColor;
      ctx.beginPath();
      ctx.roundRect(cabX, vy, cabW, shape === "SPORT" ? 13 : 16, shape === "G_WAGON" ? 2 : 7);
      ctx.fill();
      ctx.stroke();
    }

    // Sport spoiler
    if (shape === "SPORT") {
      ctx.fillStyle = "#111";
      ctx.fillRect(vx + vw - 10, vy + 4, 11, 3);
    }
    // Retro roof rack
    if (shape === "RETRO") {
      ctx.strokeStyle = "#CFD8DC";
      ctx.lineWidth = 2;
      ctx.strokeRect(vx + vw * 0.25, vy - 5, vw * 0.42, 5);
    }
    // Hearse cross on side window
    if (shape === "HEARSE") {
      ctx.fillStyle = "#E0B145";
      ctx.fillRect(vx + vw * 0.74, vy + 10, 3, 13);
      ctx.fillRect(vx + vw * 0.74 - 4, vy + 14, 11, 3);
    }

    // Windows
    ctx.fillStyle = "#1B262C";
    if (shape === "BUS") {
      for (let wi = 0; wi < 4; wi++) {
        ctx.fillRect(vx + 10 + wi * (vw * 0.22), vy + 6, vw * 0.17, 14);
      }
    } else {
      ctx.beginPath();
      ctx.roundRect(vx + vw * 0.22, vy + 4, vw * (shape === "PICKUP" ? 0.34 : 0.48), 11, 3);
      ctx.fill();
    }

    // Wheels
    ctx.fillStyle = "#141618";
    [vx + vw * 0.2, vx + vw * 0.8].forEach(wx => {
      ctx.beginPath(); ctx.arc(wx, groundY - 5, isSuv ? 8 : 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#90A4AE";
      ctx.beginPath(); ctx.arc(wx, groundY - 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#141618";
    });

    // Headlight glow
    ctx.fillStyle = "#FFF59D";
    ctx.fillRect(vx + 2, groundY - 14, 5, 4);
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

    // Sky
    ctx.fillStyle = sirenActive ? "#6B2D2B" : (droneWarning ? "#5D4037" : (dayNumber >= 4 ? "#4F5D65" : "#6C7D84"));
    ctx.fillRect(0, 0, w, h * 0.46);

    // Radar drone dot/triangle
    const dx = w * 0.78, dy = h * 0.13;
    if (droneWarning || sirenActive) {
      ctx.fillStyle = "rgba(255, 23, 68, 0.38)";
      ctx.beginPath(); ctx.arc(dx, dy + 2, 22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = (droneWarning || sirenActive) ? "#FFCDD2" : "#1F262A";
    ctx.beginPath();
    ctx.moveTo(dx, dy - 7); ctx.lineTo(dx + 22, dy + 7); ctx.lineTo(dx - 22, dy + 7); ctx.closePath();
    ctx.fill();

    // Asphalt yard
    ctx.fillStyle = "#48524D";
    ctx.fillRect(0, h * 0.36, w, h * 0.64);

    if (barrierState === "SBK_ARREST_FLASH") {
      ctx.fillStyle = "rgba(21, 101, 192, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(213, 0, 0, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
    }

    // Draw actual transport parked behind traveler in its EXACT paint color & body type!
    drawTransportInBooth(ctx, w, h, opts.transportShape || "SEDAN", opts.colorHex || "#607D8B", opts.roofHex || "#455A64");

    // Barrier & Traffic light
    const barY = h * 0.49;
    ctx.fillStyle = "#37474F";
    ctx.fillRect(w * 0.04, barY - 14, 14, 42);
    ctx.fillStyle = barrierState === "OPEN_APPROVED" ? "#00E676" : (barrierState === "SBK_ARREST_FLASH" ? "#2979FF" : "#FF1744");
    ctx.beginPath(); ctx.arc(w * 0.04 + 7, barY - 6, 4.5, 0, Math.PI * 2); ctx.fill();

    for (let s = 0; s < 6; s++) {
      const sy = barrierState === "OPEN_APPROVED" ? barY - (s + 1) * 6 : barY;
      ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
      ctx.fillRect(w * 0.08 + s * (w * 0.08), sy, w * 0.08, 8);
    }

    // Traveler portrait
    drawPortrait(ctx, opts.portrait, w * 0.5, h * 0.98, 0.95, {
      reactionState: opts.reactionState,
      uvActive: opts.uvActive
    });

    // UV Spotlight Beam over booth window!
    if (opts.uvActive) {
      const uvGrad = ctx.createRadialGradient(w * 0.5, h * 0.55, 8, w * 0.5, h * 0.55, w * 0.65);
      uvGrad.addColorStop(0, "rgba(179, 136, 255, 0.34)");
      uvGrad.addColorStop(1, "rgba(49, 27, 146, 0.25)");
      ctx.fillStyle = uvGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Visual Coffee Cup on sill if COFFEE_GIVEN!
    if (opts.reactionState === "COFFEE_GIVEN") {
      const cx = w * 0.82, cy = h * 0.84;
      ctx.fillStyle = "#ECEFF1";
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx, cy, 14, 18);
      ctx.strokeRect(cx, cy, 14, 18);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(cx - 1, cy - 3, 16, 4);
      // Steam wisps
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.moveTo(cx + 4, cy - 6); ctx.lineTo(cx + 6, cy - 13); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 10, cy - 5); ctx.lineTo(cx + 11, cy - 14); ctx.stroke();
    }

    // Sniffer dog Bavovna peeking at bottom-left when inspected!
    if (opts.snifferActive) {
      const dogX = 24, dogY = h - 18;
      ctx.fillStyle = "#B87A42";
      ctx.strokeStyle = "#2E1E11";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(dogX, dogY, 13, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Dog ears
      ctx.fillStyle = "#6D4C2D";
      ctx.beginPath(); ctx.ellipse(dogX - 11, dogY - 4, 4, 9, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dogX + 11, dogY - 4, 4, 9, -0.2, 0, Math.PI * 2); ctx.fill();
      // Eyes & nose
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(dogX - 4, dogY - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(dogX + 4, dogY - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(dogX, dogY + 3, 3, 0, Math.PI * 2); ctx.fill();
      // Badge
      ctx.fillStyle = opts.hasContraband ? "#B71C1C" : "#1B5E20";
      ctx.fillRect(4, h - 42, 62, 14);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(opts.hasContraband ? "🐕 ТАЙНИК!" : "🐕 ЧИСТО", 8, h - 32);
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
    shytomyrBrotherhoodUnlocked: false,
    isUndercoverSbkAgent: false,
    sbkRecruitmentOffered: false,
    spiesCaughtAsAgent: 0,
    sbkColonelPromoted: false,
    tolikEscapeOffered: false,
    eveningTab: 0,
    encounterTriggered: false,
    activeEndingId: null
  };

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

  function getEscapeTarget() { return state.isSandbox ? 3600 : 2400; }
  function getEscapeTolikRep() { return state.isSandbox ? 65 : 55; }
  function getRank() {
    if (state.sbkColonelPromoted) return { title: L("🕵️ Таємний Полковник СБК («Кордон-7»)", "🕵️ Covert SBK Colonel ('Border-7')"), salary: 320 };
    if (state.isUndercoverSbkAgent) return { title: L("🕵️ Негласний агент СБК («Кордон-7»)", "🕵️ Undercover SBK Agent ('Border-7')"), salary: 210 };
    if (!state.isSandbox) return { title: L("Інспектор ДПСК", "SBGS Inspector"), salary: 130 };
    const d = state.daySpec.dayNumber;
    if (d >= 8) return { title: L("Старший офіцер митниці", "Chief Customs Officer"), salary: 230 };
    if (d >= 5) return { title: L("Заступник Пал Палича", "Palych's Deputy"), salary: 190 };
    if (d >= 3) return { title: L("Старший зміни", "Senior Shift Inspector"), salary: 160 };
    return { title: L("Молодший інспектор", "Junior Inspector"), salary: 130 };
  }

  function getEffectiveBossCut() {
    const base = state.daySpec.bossCut || 200;
    return state.ownedAssets.includes("rolex_watch") ? Math.round(base * 0.5) : base;
  }

  function getPassiveRent() {
    const assetRent = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
    const sbkCovertPay = state.isUndercoverSbkAgent ? (state.sbkColonelPromoted ? 350 : 180) : 0;
    return assetRent + sbkCovertPay;
  }
  function getDailyAssetRisk() {
    return ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.dailyRisk, 0);
  }

  function pickTonightBills() {
    return shuffle(DYNAMIC_EVENING_BILLS).slice(0, 3);
  }

  function startNewGame(sandbox) {
    usedStoryTags = new Set();
    const mod = sandbox ? SANDBOX_MODIFIERS[0] : { id: "NONE", title: L("", ""), desc: L("", ""), bribeMult: 1.0, detainExtra: 0, forceOblik: false, forceSiren: false };
    const baseDay = Object.assign({}, ACT_ONE_DAYS[0]);
    if (sandbox) {
      baseDay.dateLabel = L("Вільна служба • День 1", "Career Sandbox • Day 1");
      baseDay.headline = mod.title;
      baseDay.radioNews = mod.desc;
      baseDay.requireVehicleDecl = true;
    }
    state = Object.assign(state, {
      phase: "MORNING_BRIEFING",
      isSandbox: sandbox,
      dayIndex: 0,
      daySpec: baseDay,
      sandboxMod: mod,
      queue: generateDailyQueue(baseDay, sandbox ? 12 : 9),
      travelerIdx: 0,
      selectedDocIdx: 0,
      shiftSec: sandbox ? 300 : 270,
      sirenActive: false,
      sirenResolved: false,
      vehicleInspected: false,
      interrogated: false,
      bribeAccepted: false,
      reactionState: "NONE",
      coffeeTipGiven: false,
      uvActive: false,
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
      tonightBills: pickTonightBills(),
      shytomyrFriendsMet: [],
      shytomyrBrotherhoodUnlocked: false,
      isUndercoverSbkAgent: false,
      sbkRecruitmentOffered: false,
      spiesCaughtAsAgent: 0,
      sbkColonelPromoted: false,
      tolikEscapeOffered: false,
      eveningTab: 0,
      encounterTriggered: false,
      activeEndingId: null
    });
    saveStateToStorage();
    render();
  }

  function beginShift() {
    const baseSec = state.isSandbox ? 300 : 270;
    const bonusSec = state.ownedAssets.includes("espresso_machine") ? 35 : 0;
    state.phase = "BOOTH_SHIFT";
    state.shiftSec = baseSec + bonusSec;
    state.travelerIdx = 0;
    state.selectedDocIdx = 0;
    state.sirenActive = false;
    state.sirenResolved = false;
    state.encounterTriggered = false;
    state.barrierState = "CLOSED";
    state.lastFeedback = null;
    prepareCurrentTraveler();
    saveStateToStorage();
    render();
  }

  function prepareCurrentTraveler() {
    state.selectedDocIdx = 0;
    state.vehicleInspected = false;
    state.interrogated = false;
    state.bribeAccepted = false;
    state.reactionState = "NONE";
    state.coffeeTipGiven = false;
    state.justShook = false;
    state.spottedCodes = [];
    const t = state.queue[state.travelerIdx];
    if (t && state.ownedAssets.includes("uv_endoscope")) {
      for (const v of t.violations) {
        if (v.code === "FAKE_ISSUER_SEAL" || v.code === "INVALID_QR_CODE") {
          state.spottedCodes.push(v.code);
        }
      }
    }
  }

  setInterval(() => {
    if (state.phase !== "BOOTH_SHIFT" || state.sirenActive) return;
    const encDialog = document.getElementById("encounter-dialog");
    if (encDialog && encDialog.open) return;

    state.shiftSec = Math.max(0, state.shiftSec - 1);
    if (state.daySpec.hasSiren && !state.sirenResolved && !state.sirenActive && state.shiftSec === 200) {
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
    if (state.sirenActive || (state.phase === "BOOTH_SHIFT" && (state.shiftSec <= 45 || state.nabkRisk >= 65 || (t && t.isWantedTarget)))) {
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
    state.tonightBills = pickTonightBills();
    saveStateToStorage();
    render();
  }

  function makeDecision(decisionType) {
    const t = state.queue[state.travelerIdx];
    if (!t) return;

    const isApprove = decisionType === "APPROVE";
    const isDetain = decisionType === "DETAIN";
    const requiresDetain = t.isWantedTarget || t.violations.some(v => v.requiresDetention);
    const excessiveDetain = isDetain && !t.shouldBeApproved && !requiresDetain;

    let ruleCorrect = false;
    if (decisionType === "APPROVE") ruleCorrect = t.shouldBeApproved;
    else if (decisionType === "DENY") ruleCorrect = !t.shouldBeApproved && !t.isWantedTarget;
    else if (decisionType === "DETAIN") ruleCorrect = !t.shouldBeApproved && requiresDetain;

    const coveredByBribe = state.bribeAccepted && isApprove && !t.isWantedTarget;
    const rank = getRank();

    let salaryDelta = 0, fineDelta = 0, detainBonus = 0;
    if (ruleCorrect || coveredByBribe) {
      salaryDelta = rank.salary;
      if (isDetain && requiresDetain) {
        const undercoverBounty = state.isUndercoverSbkAgent ? 180 : 0;
        detainBonus = (t.isWantedTarget ? 320 : 140) + undercoverBounty + (state.sandboxMod ? state.sandboxMod.detainExtra : 0);
        state.sbkRep = Math.min(100, state.sbkRep + (t.isWantedTarget ? 20 : 7));
        state.totalCareerDetained += 1;
        if (state.isUndercoverSbkAgent) {
          state.spiesCaughtAsAgent += 1;
          state.nabkRisk = Math.max(0, state.nabkRisk - 8);
        }
      }
      state.shiftCorrect += 1;
    } else {
      fineDelta = excessiveDetain ? 40 : (state.shiftMistakes === 0 ? 50 : 150);
      state.palychRep = Math.max(0, state.palychRep - 4);
      if (t.isWantedTarget && isApprove) {
        state.sbkRep = Math.max(0, state.sbkRep - 25);
      }
      state.shiftMistakes += 1;
    }

    // Track Shytomyr Trio silently without spoiling in advance!
    let shytomyrBonusToast = null;
    if (t.storyTag && t.storyTag.startsWith("SHYTOMYR_") && isApprove) {
      if (!state.shytomyrFriendsMet.includes(t.storyTag)) {
        state.shytomyrFriendsMet.push(t.storyTag);
      }
      if (state.shytomyrFriendsMet.length >= 3 && !state.shytomyrBrotherhoodUnlocked) {
        state.shytomyrBrotherhoodUnlocked = true;
        detainBonus += 1200;
        state.nabkRisk = Math.max(0, state.nabkRisk - 25);
        shytomyrBonusToast = L(
          "🧦 ОРДЕН ШИТОМИРА: Пацани скинулися тобі на подяку (+1200 ₴ на картку та знято підозри)!",
          "🧦 SHYTOMYR BROTHERHOOD: The crew sent a massive thank-you (+1200 ₴)!"
        );
      }
    }

    if (t.storyTag === "INTEL_ALLY" && isApprove) {
      detainBonus += 200;
      state.sbkRep = Math.min(100, state.sbkRep + 15);
    }

    if (t.storyTag === "TOLIK_RUN") {
      if (isApprove) state.tolikRep = Math.min(100, state.tolikRep + 20);
      else if (isDetain) state.tolikRep = Math.max(0, state.tolikRep - 25);
    }

    const netMoney = salaryDelta + detainBonus - fineDelta;
    state.money += netMoney;
    state.shiftProcessed += 1;
    if (isDetain) state.shiftDetained += 1;
    state.shiftFinesTotal += fineDelta;

    state.barrierState = isApprove ? "OPEN_APPROVED" : (isDetain ? "SBK_ARREST_FLASH" : "CLOSED");
    state.lastFeedback = {
      ok: ruleCorrect || coveredByBribe,
      title: shytomyrBonusToast
        ? L("🧦 БРАТЕРСТВО М. ШИТОМИР!", "🧦 ORDER OF SHYTOMYR!")
        : (coveredByBribe
          ? L("ЗАКРИТО ОЧІ (ЗА ХАБАР)", "LOOKED THE OTHER WAY (BRIBED)")
          : (ruleCorrect && isDetain ? L("КРИМІНАЛ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "CRIMINAL DETAINED! (+SBK BONUS)") : (ruleCorrect ? L("РІШЕННЯ ПРАВИЛЬНЕ", "CORRECT DECISION") : (excessiveDetain ? L("ПЕРЕВИЩЕННЯ! Треба ✖ ВІДМОВИТИ", "EXCESSIVE FORCE! Should ✖ DENY") : L("ПОМИЛКА ПРОТОКОЛУ! ШТРАФ", "PROTOCOL VIOLATION! FINE"))))),
      detail: shytomyrBonusToast || (isDetain
        ? (state.contentMode === "FULL_18_PLUS" ? t.arrestFull : t.arrestToned)
        : (ruleCorrect ? L("Оформлено за директивою ДПСК.", "Processed per SBGS directive.") : (t.violations[0] ? t.violations[0].title : L("Безпідставна відмова", "Wrongful denial")))),
      moneyDelta: netMoney
    };

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

    if (state.travelerIdx === 4 && !state.encounterTriggered) {
      state.encounterTriggered = true;
      const enc = MID_SHIFT_ENCOUNTERS[(state.daySpec.dayNumber - 1) % MID_SHIFT_ENCOUNTERS.length];
      openEncounterModal(enc);
    }
  }

  function triggerEnding(explicitArchetypeId) {
    state.activeEndingId = explicitArchetypeId || null;
    state.phase = "ENDING";
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    render();
  }

  function advanceToNextDay(forceContinueFromCampaign) {
    if (state.nabkRisk >= 90) {
      triggerEnding("NABK_PRISONER");
      return;
    }

    const boughtAnyHome = state.purchasedExpensesToday.length > 0;
    state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + (boughtAnyHome ? 0 : -6)));

    if (state.escapeFund >= getEscapeTarget() && state.tolikRep >= getEscapeTolikRep() && !state.tolikEscapeOffered) {
      state.tolikEscapeOffered = true;
      openTolikEscapeOfferModal();
      return;
    }

    const nextIdx = state.dayIndex + 1;
    if (!state.isSandbox && nextIdx >= ACT_ONE_DAYS.length && !forceContinueFromCampaign) {
      openCampaignMilestoneModal();
      return;
    }

    state.dayIndex = nextIdx;
    state.money += getPassiveRent();
    state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + getDailyAssetRisk()));

    if (state.isSandbox) {
      const mod = SANDBOX_MODIFIERS[nextIdx % SANDBOX_MODIFIERS.length];
      state.sandboxMod = mod;
      const base = Object.assign({}, ACT_ONE_DAYS[nextIdx % ACT_ONE_DAYS.length]);
      base.dayNumber = nextIdx + 1;
      const rk = getRank();
      base.dateLabel = L(`Кар'єра • День ${nextIdx + 1} (${rk.title.uk})`, `Career • Day ${nextIdx + 1} (${rk.title.en})`);
      base.headline = mod.title;
      base.radioNews = mod.desc;
      base.requireOblikQr = base.requireOblikQr || mod.forceOblik;
      base.requireVehicleDecl = true;
      base.hasSiren = base.hasSiren || mod.forceSiren;
      state.daySpec = base;
    } else {
      state.daySpec = ACT_ONE_DAYS[nextIdx];
    }

    state.queue = generateDailyQueue(state.daySpec, state.isSandbox ? 12 : 9);
    state.shiftProcessed = 0;
    state.shiftCorrect = 0;
    state.shiftMistakes = 0;
    state.shiftDetained = 0;
    state.shiftBribesTotal = 0;
    state.shiftFinesTotal = 0;
    state.phase = "MORNING_BRIEFING";
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

  function openSirenModal() {
    const dlg = document.getElementById("siren-dialog");
    if (!dlg) return;
    document.getElementById("siren-dialog-title").textContent = tr(L("🚨 ПОВІТРЯНА ТРИВОГА НА ПУНКТІ!", "🚨 AIR-RAID SIREN AT CHECKPOINT!"), state.lang);
    document.getElementById("siren-dialog-desc").textContent = tr(
      L("У небі над чергою помічено «мопед». За інструкцією треба спуститися в укриття (-35с часу зміни), або можна продовжити роботу під «швидкі чайові» (+150 ₴, +ризик).",
        "A drone is buzzing over the queue. Go to the shelter (-35s shift time, +SBK rep) or keep working for express tips (+150 ₴, +risk)."),
      state.lang
    );
    const bShelter = document.getElementById("btn-siren-shelter");
    const bWork = document.getElementById("btn-siren-work");
    bShelter.textContent = tr(L("🛡 Піти в укриття (-35с, +повага СБК)", "🛡 Go to Shelter (-35s, +SBK Rep)"), state.lang);
    bWork.textContent = tr(L("💵 Працювати під сиреною (+150 ₴)", "💵 Keep Working Under Siren (+150 ₴)"), state.lang);

    bShelter.onclick = () => {
      audio.playTap();
      state.sirenActive = false;
      state.sirenResolved = true;
      state.shiftSec = Math.max(10, state.shiftSec - 35);
      state.sbkRep = Math.min(100, state.sbkRep + 5);
      dlg.close();
      render();
    };
    bWork.onclick = () => {
      audio.playBribe();
      state.sirenActive = false;
      state.sirenResolved = true;
      state.money += 150;
      state.shiftBribesTotal += 150;
      state.nabkRisk = Math.min(100, state.nabkRisk + 6);
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
    if (c) {
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      drawPortrait(ctx, enc.portrait, c.width * 0.5, c.height * 0.98, 0.58);
    }
    const optsWrap = document.getElementById("encounter-options");
    optsWrap.innerHTML = "";
    enc.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-secondary";
      btn.style.color = "#E0B145";
      btn.textContent = tr(opt.label, state.lang);
      btn.addEventListener("click", () => {
        audio.playBribe();
        state.money = Math.max(0, state.money + opt.moneyDelta);
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
        "Майор СБК «Тихий» заходить у будку через службовий вхід і кладе на стіл чорне посвідчення:\n«Інспекторе, ти взяв уже двох серйозних порушників. Нам потрібна своя негласна людина прямо в будці, під носом у Пал Палича та контрабандистів.\n\nПідписуй згоду як Негласний оперативник СБК «Кордон-7»: ти ПРОДОВЖУЄШ працювати на шлагбаумі під прикриттям, але отримуєш +180 ₴ таємного окладу щоранку, +180 ₴ премії за кожного спійманого шпигуна та імунітет від НАБК!»",
        "SBK Major 'Quiet' enters the booth and places a black folder on your desk:\n'Inspector, you have sharp eyes. We need an undercover operative right here in the booth under Palych's nose.\n\nSign on as Undercover Agent Border-7: you KEEP working the checkpoint under cover, earning +180 ₴ covert pay every morning, +180 ₴ extra bounty per spy detained, and NABK immunity!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "accept_sbk_agent",
          label: L("🕵️ Стати негласним агентом СБК «Кордон-7» і продовжити полювання! (+300 ₴ підйомних)", "🕵️ Become Undercover Agent 'Border-7' & keep hunting spies! (+300 ₴ bonus)"),
          outcome: L("Ти підписав таємну угоду! Тепер ти негласний агент СБК «Кордон-7». Продовжуй працювати в будці й виловлюй ворожих резидентів (ціль: 4 агенти)!", "You signed the covert agreement! You are now Undercover Agent 'Border-7'. Hunt 4 enemy operatives!"),
          moneyDelta: 300, timeDelta: 15, riskDelta: -15, sbkDelta: 20, tolikDelta: 0, palychDelta: 0, moraleDelta: 10,
          onSelect: () => { state.isUndercoverSbkAgent = true; }
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
    openEncounterModal({
      id: "sbk_colonel_climax",
      title: L("🎖️ СПЕЦОПЕРАЦІЯ УСПІШНА: ПОГОНИ ПОЛКОВНИКА СБК!", "🎖️ OPERATION COMPLETE: SBK COLONEL PROMOTION!"),
      desc: L(
        "Ти ліквідував цілу мережу шпигунів та контрабандистів, працюючи під прикриттям! Майор «Тихий» особисто вручає тобі коробку з погонами Полковника СБК та премію 1 500 ₴:\n\n«Агенте «Кордон-7», штаб у захваті! Ти можеш залишитися на пункті Таємним Куратором кордону (продовжувати гру зі ставкою 320 ₴/людину), або переїхати в Центральний Штаб у Кийграді!»",
        "You dismantled the spy ring while undercover! Major 'Quiet' hands you Colonel's epaulets and a 1,500 ₴ reward:\n\n'You can STAY at the checkpoint as Secret Sector Commander (keep playing at 320 ₴/traveler) or transfer to Central HQ in Kyihrad!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 4, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "stay_undercover_colonel",
          label: L("🕵️ Залишитися в будці Таємним Полковником і ПРОДОВЖУВАТИ ГРУ! (+1500 ₴, ставка 320 ₴)", "🕵️ Stay in booth as Covert Colonel & KEEP PLAYING! (+1500 ₴, 320 ₴ salary)"),
          outcome: L("Ти сховав погони полковника в сейф і залишився негласним господарем кордону!", "You locked the Colonel's epaulets in the safe and stayed as covert master of the border!"),
          moneyDelta: 1500, timeDelta: 30, riskDelta: -40, sbkDelta: 30, tolikDelta: 0, palychDelta: 0, moraleDelta: 25
        },
        {
          id: "retire_to_sbk_hq",
          label: L("🏛️ Очолити Центральний Штаб у Кийграді (Завершити службу — Персональне Досьє)", "🏛️ Lead Central HQ in Kyihrad (Finish Game — Epilogue Dossier)"),
          outcome: L("Ти передаєш ключі від будки й від'їжджаєш до столиці!", "You depart for Kyihrad!"),
          moneyDelta: 1500, timeDelta: 0, riskDelta: 0, sbkDelta: 30, tolikDelta: 0, palychDelta: 0, moraleDelta: 20,
          onSelect: () => { triggerEnding("SBK_SHADOW_COLONEL"); return true; }
        }
      ]
    });
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
      `💵 ${tr(L("Готівка", "Cash"), state.lang)}: ${state.money} ₴ | СБК: ${state.sbkRep} | НАБК: ${state.nabkRisk}%`,
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

  function render() {
    stopMenuAnimation();
    updateMood();
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
      root.innerHTML = `
        <div class="menu-control-strip">
          <button type="button" id="menu-lang" class="ctrl-pill">${state.lang === "UK" ? "🇺🇦 УКР" : "🇬🇧 ENG"}</button>
          <button type="button" id="menu-music" class="ctrl-pill" aria-label="Toggle music">${audio.musicEnabled ? tr(L("🔊 Звук ON", "🔊 Audio ON"), state.lang) : tr(L("🔇 Звук OFF", "🔇 Muted"), state.lang)}</button>
          <button type="button" id="menu-mode" class="ctrl-pill">${state.contentMode === "FULL_18_PLUS" ? tr(L("🔞 18+ Повний", "🔞 18+ Uncut"), state.lang) : tr(L("🛡 М'який", "🛡 Toned-Down"), state.lang)}</button>
        </div>

        <div class="menu-panorama-box">
          <canvas id="menu-canvas" width="436" height="186"></canvas>
          <div class="menu-panorama-badge">${tr(L("ДПСК • КПП «ЗАХІД-KRAINA» • ПОСТ №04", "SBGS • CHECKPOINT 'WEST-KRAINA' • GATE 04"), state.lang)}</div>
        </div>

        <div class="dossier-tab">${tr(L("ОСОБОВА СПРАВА № 04-КР", "PERSONNEL DOSSIER #04-KR"), state.lang)}</div>
        <section class="dossier-folder">
          <div class="dossier-stamp-red">${tr(L("ТАЄМНО", "CLASSIFIED"), state.lang)}</div>
          <div>
            <h1 style="font-size:25px;font-weight:900;letter-spacing:0.6px;color:#1B1916;font-family:Georgia, serif;">BORDER SHIFT: KRAINA</h1>
            <p style="font-size:12px;color:#5C4B32;font-weight:700;">${tr(L("Ситуаційний центр прикордонного контролю та контррозвідки", "Border Control & Counter-Intelligence Post Simulator"), state.lang)}</p>
          </div>

          <div class="dossier-order-card">
            <div class="dossier-order-header">
              <span>${tr(L("НАКАЗ ПРО ПРИЗНАЧЕННЯ", "ASSIGNMENT ORDER"), state.lang)}</span>
              <span>2022 — 2025</span>
            </div>
            <p style="font-size:12.5px;line-height:1.45;color:#2E2820;">
              ${tr(L(
                "Ти заступаєш на прикордонний шлагбаум країни Kraina. Звіряй документи, перевіряй транспорт біля вікна, реагуй на подорожніх — і сам обирай свій шлях.",
                "Take command of the checkpoint booth on Kraina's western frontier. Check IDs, inspect transport & luggage, read reactions — and forge your own fate."
              ), state.lang)}
            </p>
            <div class="menu-stats-pill">
              <span>🗄️ ${tr(L("Відкрито епілогів долі", "Unlocked Ending Titles"), state.lang)}:</span>
              <strong>${unlockedCount} / 16</strong>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-top:2px;">
            ${canResume ? `
              <button type="button" id="btn-resume" class="stamp-action-btn stamp-action-gold">
                <div class="stamp-btn-text">
                  <span>${tr(L("⏯ ПРОДОВЖИТИ ЗБЕРЕЖЕНУ ЗМІНУ", "⏯ RESUME SAVED SHIFT"), state.lang)}</span>
                  <span class="stamp-btn-sub">${tr(L("Повернутися на поточний день служби", "Continue your saved border progress"), state.lang)}</span>
                </div>
                <span>→</span>
              </button>
            ` : ""}
            <button type="button" id="btn-start-camp" class="stamp-action-btn stamp-action-green">
              <div class="stamp-btn-text">
                <span>${tr(L("▶ ПОЧАТИ КАМПАНІЮ (2022–2024)", "▶ START STORY CAMPAIGN"), state.lang)}</span>
                <span class="stamp-btn-sub">${tr(L("5 ключових етапів історії з вибором продовження", "5 pivotal shifts with career continuation option"), state.lang)}</span>
              </div>
              <span>✔</span>
            </button>
            <button type="button" id="btn-start-sand" class="stamp-action-btn stamp-action-ink">
              <div class="stamp-btn-text">
                <span>${tr(L("∞ ВІЛЬНА СЛУЖБА (ПІСОЧНИЦЯ + РАНГИ)", "∞ ENDLESS CAREER (SANDBOX)"), state.lang)}</span>
                <span class="stamp-btn-sub">${tr(L("Нескінченна кар'єра, випадкові укази й підвищення", "Endless shifts, daily decrees & rank promotions"), state.lang)}</span>
              </div>
              <span>♾</span>
            </button>
          </div>

          <p class="menu-disclaimer">
            ${tr(L("18+ Сатирична художня вигадка: установи, міста й події вигадані • Змінити тон можна вгорі", "18+ Satirical work of fiction: cities, names & agencies are fictional • Toggle mode above"), state.lang)}
          </p>
        </section>
      `;

      startMenuPanoramaLoop();
      document.getElementById("menu-lang").addEventListener("click", () => { state.lang = state.lang === "UK" ? "EN" : "UK"; render(); });
      document.getElementById("menu-music").addEventListener("click", () => { audio.ensureCtx(); audio.musicEnabled = !audio.musicEnabled; render(); });
      document.getElementById("menu-mode").addEventListener("click", () => { state.contentMode = state.contentMode === "FULL_18_PLUS" ? "TONED_DOWN" : "FULL_18_PLUS"; render(); });
      if (canResume) document.getElementById("btn-resume").addEventListener("click", () => { audio.playApprove(); loadSavedGame(); });
      document.getElementById("btn-start-camp").addEventListener("click", () => { audio.playApprove(); startNewGame(false); });
      document.getElementById("btn-start-sand").addEventListener("click", () => { audio.playApprove(); startNewGame(true); });
      return;
    }

    if (state.phase === "MORNING_BRIEFING") {
      const d = state.daySpec;
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <p style="color:#E0B145;font-family:monospace;font-size:13px;">${tr(d.dateLabel, state.lang)}</p>
          <h1 style="font-size:21px;font-weight:800;">${tr(d.headline, state.lang)}</h1>
          <section class="card-radio">
            <h2 style="color:#E0B145;font-size:12px;margin-bottom:4px;">${tr(L("📻 РАДІОЕФІР РАНКУ", "📻 MORNING RADIO BROADCAST"), state.lang)}</h2>
            <p style="font-size:13px;color:#CFD8DC;">${tr(d.radioNews, state.lang)}</p>
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
      document.getElementById("btn-enter-booth").addEventListener("click", () => { audio.playTap(); beginShift(); });
      return;
    }

    if (state.phase === "BOOTH_SHIFT") {
      const t = state.queue[state.travelerIdx];
      if (!t) { finishShift(); return; }
      const doc = t.documents[state.selectedDocIdx] || t.documents[0];
      const droneWarning = state.daySpec.hasSiren && !state.sirenResolved && !state.sirenActive && state.shiftSec >= 201 && state.shiftSec <= 218;
      const spottedObjs = t.violations.filter(v => state.spottedCodes.includes(v.code));
      const needsArrest = spottedObjs.some(v => v.requiresDetention);
      const photoSpotted = state.spottedCodes.includes("PHOTO_MISMATCH");
      const searchCost = state.ownedAssets.includes("uv_endoscope") ? "0s" : "-8s";
      const bribeAmount = t.bribeOffer ? Math.round(t.bribeOffer.amount * (state.sandboxMod ? state.sandboxMod.bribeMult || 1 : 1)) : 0;
      const hasSbkTablet = state.ownedAssets.includes("sbk_database_tablet");

      let tabletBadge = "";
      if (hasSbkTablet) {
        if (t.isWantedTarget) tabletBadge = `<div style="background:#B71C1C;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: 🚨 ОСОБА В РОЗШУКУ</div>`;
        else if (t.storyTag === "NABK_STING") tabletBadge = `<div style="background:#E65100;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: ⚠️ Виявлено мікрофон НАБК!</div>`;
        else if (t.storyTag === "INTEL_ALLY") tabletBadge = `<div style="background:#1565C0;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: 🦅 Допуск ГУР/СБК підтверджено</div>`;
      }

      let activeSpeech = t.greeting;
      if (state.reactionState === "INTIMIDATED") activeSpeech = t.intimidateReply || t.interrogationReply;
      else if (state.reactionState === "COFFEE_GIVEN") activeSpeech = t.coffeeReply || t.greeting;
      else if (state.interrogated) activeSpeech = t.interrogationReply;

      root.innerHTML = `
        <header class="top-bar">
          <div class="row-between">
            <span id="hud-timer" style="color:${state.shiftSec < 40 ? "#FF8A80" : "#E0B145"};font-weight:700;font-size:13px;">${tr(L("День", "Day"), state.lang)} ${state.daySpec.dayNumber} • ⏱ ${state.shiftSec}s</span>
            <span style="color:#81C784;font-weight:800;font-size:14px;">💵 ${state.money} ₴</span>
            <span style="font-size:12px;">${tr(L("Черга", "Queue"), state.lang)}: ${state.travelerIdx + 1}/${state.queue.length}</span>
            <div style="display:flex;gap:4px;">
              <button type="button" id="hud-music" class="btn-outline" style="padding:3px 7px;" aria-label="Toggle music">${audio.musicEnabled ? "🔊" : "🔇"}</button>
              <button type="button" id="hud-rules" class="btn-outline" style="padding:3px 7px;">${tr(L("📋 Правила", "📋 Rules"), state.lang)}</button>
            </div>
          </div>
          <div class="row-between" style="font-size:11px;color:#B0BEC5;">
            <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#B0BEC5"};">НАБК:${state.nabkRisk}%${state.isUndercoverSbkAgent ? ` | 🕵️Кордон-7 (${state.spiesCaughtAsAgent}/4)` : ""}</span>
            <span>${tr(L("Палич", "Palych"), state.lang)}:${state.palychRep} | ${tr(L("Толік", "Tolik"), state.lang)}:${state.tolikRep} | СБК:${state.sbkRep}</span>
          </div>
        </header>

        ${state.lastFeedback ? `
          <div class="toast-banner" style="background:${state.lastFeedback.ok ? "#1B5E20" : "#7F0000"};">
            <span><strong>${tr(state.lastFeedback.title, state.lang)}:</strong> ${tr(state.lastFeedback.detail, state.lang)}</span>
            <strong style="color:#E0B145;white-space:nowrap;">${state.lastFeedback.moneyDelta >= 0 ? "+" + state.lastFeedback.moneyDelta : state.lastFeedback.moneyDelta} ₴</strong>
          </div>
        ` : ""}

        ${droneWarning ? `<div class="radar-alert">${tr(L("⚠️ РАДАР ППО: У небі «мопед» на підльоті! Готуйтесь до сирени!", "⚠️ RADAR ALERT: Drone spotted in sky! Siren imminent!"), state.lang)}</div>` : ""}
        ${tabletBadge}

        <section class="booth-row">
          <div id="booth-wrap" class="booth-canvas-wrap ${state.justShook ? "booth-shake" : ""}" title="${tr(L("Натисни, щоб звірити авто/обличчя", "Click to inspect vehicle & face"), state.lang)}">
            <canvas id="booth-canvas" width="200" height="172"></canvas>
          </div>
          <div class="dialogue-box">
            <div class="dialogue-scroll">
              <div style="color:#E0B145;font-weight:700;font-size:13px;">${tr(t.fullName, state.lang)} (${t.age})</div>
              <div style="color:#B0BEC5;font-size:11px;margin-bottom:4px;">🚘 ${tr(t.vehicleDesc, state.lang)}</div>
              <p style="font-size:11.5px;line-height:1.35;">${tr(activeSpeech, state.lang)}</p>
            </div>
            ${t.bribeOffer && !state.bribeAccepted ? `
              <button type="button" id="btn-take-bribe" style="background:${t.bribeOffer.isFriendlyGift ? "#1B5E20" : "#6D4C41"};color:#E0B145;padding:5px 8px;font-size:11px;width:100%;margin-top:4px;">
                ${t.bribeOffer.isFriendlyGift ? tr(L(`🤝 ВЗЯТИ ПІДГОН НА КАВУ (+${bribeAmount} ₴)`, `🤝 ACCEPT GIFT (+${bribeAmount} ₴)`), state.lang) : tr(L(`✉️ ВЗЯТИ КОНВЕРТ (+${bribeAmount} ₴)`, `✉️ TAKE ENVELOPE (+${bribeAmount} ₴)`), state.lang)}
              </button>
            ` : (state.bribeAccepted ? `<div style="color:#81C784;font-size:11px;font-weight:700;margin-top:4px;">${tr(L("✔ У кишені (тисни ✔ ПРОПУСТИТИ)", "✔ Pocketed (press ✔ APPROVE)"), state.lang)}</div>` : "")}
          </div>
        </section>

        <div class="reactions-bar">
          <button type="button" id="react-intimidate" class="reaction-btn ${state.reactionState === "INTIMIDATED" ? "done" : ""}">📢 ${tr(L("Нагримати", "Knock"), state.lang)}</button>
          <button type="button" id="react-coffee" class="reaction-btn ${state.reactionState === "COFFEE_GIVEN" ? "done" : ""}">☕ ${tr(L("Кава", "Coffee"), state.lang)}</button>
          <button type="button" id="react-uv" class="reaction-btn ${state.uvActive ? "uv-on" : ""}">🔦 ${tr(L(state.uvActive ? "УФ: ВКЛ" : "УФ-лампа", state.uvActive ? "UV: ON" : "UV Lamp"), state.lang)}</button>
          <button type="button" id="react-dog" class="reaction-btn ${state.vehicleInspected ? "done" : ""}" ${state.vehicleInspected ? "disabled" : ""}>🐕 ${state.vehicleInspected ? tr(L("Перевірено", "Checked"), state.lang) : tr(L(`Пес ${searchCost}`, `Dog ${searchCost}`), state.lang)}</button>
        </div>

        <section class="desk-area">
          <div class="doc-tabs" id="doc-tabs-bar"></div>
          <div class="doc-paper ${state.uvActive ? "uv-mode" : ""}">
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
            ${state.uvActive ? `
              <div class="uv-watermark" style="color:${doc.sealDisc ? "#FF4081" : "#00E5FF"};">
                ${doc.sealDisc ? tr(L("UV-АНАЛІЗ: СЛАБКИЙ ДРУК / БЕЗ ВОЛОКОН!", "UV SCAN: NO WATERMARK / FAKE!"), state.lang) : tr(L("UV-АНАЛІЗ: ДЕРЖАВНІ ВОЛОКНА ОК", "UV SCAN: STATE FIBERS OK"), state.lang)}
              </div>
            ` : ""}
            <button type="button" id="btn-doc-seal" class="seal-stamp ${doc.sealDisc && state.spottedCodes.includes(doc.sealDisc.code) ? "forged-spotted" : ""} ${state.uvActive && doc.sealDisc ? "forged-uv" : ""}">
              ✪ ${tr(doc.sealText, state.lang)}
            </button>
            ${spottedObjs.length > 0 ? `
              <div style="padding:6px;border-radius:6px;background:${needsArrest ? "#BBDEFB" : "#FFE0B2"};color:${needsArrest ? "#1565C0" : "#E65100"};font-size:11px;font-weight:800;">
                📌 ${tr(spottedObjs[0].hint, state.lang)}
              </div>
            ` : ""}
            ${state.vehicleInspected ? `
              <div style="padding:7px;border-radius:6px;background:${t.hasContraband ? "#FFCDD2" : "#C8E6C9"};color:#1B1916;font-size:11px;font-weight:700;">
                🐕 ${tr(t.vehicleSearchResult, state.lang)}
              </div>
            ` : ""}
          </div>
          <div class="row-between">
            <button type="button" id="btn-interrogate" class="btn-outline" style="flex:1;background:#3E2723;">${tr(L("🔍 Звірити по базі / Допит", "🔍 Verify Papers / Ask"), state.lang)}</button>
          </div>
        </section>

        <footer class="stamps-bar">
          <button type="button" id="stamp-approve" class="btn-primary-green" style="padding:11px 4px;font-size:12.5px;">${tr(L("✔ ПРОПУСТИТИ", "✔ APPROVE"), state.lang)}</button>
          <button type="button" id="stamp-deny" class="btn-primary-red" style="padding:11px 4px;font-size:12.5px;">${tr(L("✖ ВІДМОВИТИ", "✖ DENY"), state.lang)}</button>
          <button type="button" id="stamp-detain" class="btn-primary-blue" style="padding:11px 4px;font-size:12px;">${tr(L("🚨 СБК / АРЕШТ", "🚨 DETAIN"), state.lang)}</button>
        </footer>
      `;

      state.justShook = false;
      drawBoothScene(document.getElementById("booth-canvas"), {
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
        hasContraband: t.hasContraband
      });

      const miniC = document.getElementById("passport-mini-canvas");
      if (miniC) {
        const mctx = miniC.getContext("2d");
        drawPortrait(mctx, t.passportPortrait, miniC.width * 0.5, miniC.height * 0.98, 0.44);
      }

      const photoBtn = document.getElementById("btn-passport-photo");
      if (photoBtn) {
        photoBtn.addEventListener("click", () => {
          audio.playTap();
          if (t.violations.some(v => v.code === "PHOTO_MISMATCH") && !state.spottedCodes.includes("PHOTO_MISMATCH")) {
            state.spottedCodes.push("PHOTO_MISMATCH");
            state.interrogated = true;
            render();
          }
        });
      }

      document.getElementById("booth-wrap").addEventListener("click", () => {
        audio.playTap();
        let foundVisual = false;
        t.violations.forEach(v => {
          if ((v.code === "VEHICLE_MISMATCH" || v.code === "PHOTO_MISMATCH") && !state.spottedCodes.includes(v.code)) {
            state.spottedCodes.push(v.code);
            foundVisual = true;
          }
        });
        if (foundVisual) render();
      });

      const tabsBar = document.getElementById("doc-tabs-bar");
      t.documents.forEach((dItem, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "doc-tab" + (idx === state.selectedDocIdx ? " active" : "");
        const labelMap = {
          PASSPORT: L("🛂 Паспорт", "🛂 Passport"),
          EXEMPTION_CERT: L("📄 Довідка", "📄 Permit"),
          MILITARY_ID: L("📱 Облік+", "📱 Oblik+"),
          VEHICLE_CUSTOMS: L("🚘 Техпаспорт", "🚘 Transport")
        };
        b.textContent = tr(labelMap[dItem.type] || dItem.title, state.lang);
        b.addEventListener("click", () => { audio.playTap(); state.selectedDocIdx = idx; render(); });
        tabsBar.appendChild(b);
      });

      const fieldsList = document.getElementById("doc-fields-list");
      doc.fields.forEach(f => {
        const isSpotted = f.disc && state.spottedCodes.includes(f.disc.code);
        const rowBtn = document.createElement("button");
        rowBtn.type = "button";
        rowBtn.className = "doc-field-row" + (isSpotted ? " spotted" : "");
        rowBtn.innerHTML = `
          <span style="color:#4E342E;font-size:12px;font-weight:600;flex:0 0 38%;">${tr(f.label, state.lang)}:</span>
          <span style="color:${isSpotted ? "#C62828" : "#1F1D1A"};font-size:12px;font-weight:700;flex:1;">${tr(f.value, state.lang)}${isSpotted ? " [❗]" : ""}</span>
        `;
        rowBtn.addEventListener("click", () => {
          audio.playTap();
          if (f.disc && !state.spottedCodes.includes(f.disc.code)) {
            state.spottedCodes.push(f.disc.code);
            state.interrogated = true;
            render();
          }
        });
        fieldsList.appendChild(rowBtn);
      });

      document.getElementById("btn-doc-seal").addEventListener("click", () => {
        audio.playTap();
        if (doc.sealDisc && !state.spottedCodes.includes(doc.sealDisc.code)) {
          state.spottedCodes.push(doc.sealDisc.code);
          state.interrogated = true;
          render();
        }
      });

      // Inspector Reactions Bar Events
      document.getElementById("react-intimidate").addEventListener("click", () => {
        audio.playKnock();
        state.reactionState = "INTIMIDATED";
        state.justShook = true;
        render();
      });

      document.getElementById("react-coffee").addEventListener("click", () => {
        audio.playCoffee();
        state.reactionState = "COFFEE_GIVEN";
        if (!state.coffeeTipGiven && t.coffeeTip > 0) {
          state.coffeeTipGiven = true;
          const tip = t.coffeeTip + (state.ownedAssets.includes("espresso_machine") ? 35 : 0);
          state.money += tip;
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
        render();
      });

      document.getElementById("react-dog").addEventListener("click", () => {
        audio.playDogSniff();
        state.vehicleInspected = true;
        if (!state.ownedAssets.includes("uv_endoscope")) state.shiftSec = Math.max(5, state.shiftSec - 8);
        if (t.hasContraband && !state.spottedCodes.includes("CONTRABAND_CARGO")) state.spottedCodes.push("CONTRABAND_CARGO");
        if (t.violations.some(v => v.code === "VEHICLE_MISMATCH") && !state.spottedCodes.includes("VEHICLE_MISMATCH")) {
          state.spottedCodes.push("VEHICLE_MISMATCH");
        }
        render();
      });

      document.getElementById("hud-music").addEventListener("click", () => { audio.ensureCtx(); audio.musicEnabled = !audio.musicEnabled; render(); });
      document.getElementById("hud-rules").addEventListener("click", () => { audio.playTap(); openRulesModal(); });
      document.getElementById("btn-interrogate").addEventListener("click", () => {
        audio.playTap();
        state.interrogated = true;
        state.reactionState = "NONE";
        t.violations.forEach(v => { if (!state.spottedCodes.includes(v.code)) state.spottedCodes.push(v.code); });
        render();
      });

      const bribeBtn = document.getElementById("btn-take-bribe");
      if (bribeBtn) {
        bribeBtn.addEventListener("click", () => {
          audio.playBribe();
          state.bribeAccepted = true;
          state.money += bribeAmount;
          state.shiftBribesTotal += bribeAmount;
          if (!t.bribeOffer.isFriendlyGift) {
            state.nabkRisk = Math.min(100, state.nabkRisk + (t.bribeOffer.isStingTrap ? 35 : (t.bribeOffer.syndicateFavor ? 6 : 8)));
          } else {
            state.familyMorale = Math.min(100, state.familyMorale + 5);
          }
          if (t.bribeOffer.syndicateFavor) state.tolikRep = Math.min(100, state.tolikRep + 20);
          render();
        });
      }

      document.getElementById("stamp-approve").addEventListener("click", () => { audio.playApprove(); makeDecision("APPROVE"); });
      document.getElementById("stamp-deny").addEventListener("click", () => { audio.playDeny(); makeDecision("DENY"); });
      document.getElementById("stamp-detain").addEventListener("click", () => { audio.playDetain(); makeDecision("DETAIN"); });
      return;
    }

    if (state.phase === "SHIFT_SUMMARY") {
      const cut = getEffectiveBossCut();
      const salary = state.shiftCorrect * getRank().salary;
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;flex:1;">
          <h1 style="color:#E0B145;font-size:22px;">${tr(L(`ЗМІНУ ЗАВЕРШЕНО • ДЕНЬ ${state.daySpec.dayNumber}`, `SHIFT COMPLETE • DAY ${state.daySpec.dayNumber}`), state.lang)}</h1>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:6px;font-size:14px;">
            <div>${tr(L("Оформлено мандрівників", "Travelers Processed"), state.lang)}: <strong>${state.shiftProcessed}</strong></div>
            <div style="color:#81C784;">${tr(L("Без помилок", "Correct Decisions"), state.lang)}: <strong>${state.shiftCorrect} (+${salary} ₴)</strong></div>
            <div style="color:#64B5F6;">${tr(L("Затримано порушників", "Detained Targets"), state.lang)}: <strong>${state.shiftDetained}</strong></div>
            <div style="color:#FF8A80;">${tr(L("Штрафи за помилки", "Protocol Fines"), state.lang)}: <strong>-${state.shiftFinesTotal} ₴</strong></div>
            <div style="color:#E0B145;">${tr(L("Конверти та підгони", "Envelopes & Tips"), state.lang)}: <strong>+${state.shiftBribesTotal} ₴</strong></div>
            <hr style="border:none;border-top:1px solid #555;margin:4px 0;">
            <div style="color:#E0B145;font-size:18px;font-weight:800;">${tr(L("У гаманці зараз", "Current Cash"), state.lang)}: ${state.money} ₴</div>
          </section>
          <section class="card-slate" style="background:#33291F;">
            <h2 style="color:#E0B145;font-size:16px;margin-bottom:6px;">${tr(L("🧢 ПАЛ ПАЛИЧ ЧЕКАЄ НА «ЧАСТКУ»", "🧢 PAL PALYCH EXPECTS HIS CUT"), state.lang)}</h2>
            <p style="font-size:13px;line-height:1.4;">${tr(L(
              `«Поклади ${cut} ₴ у шухляду — і я прикрию твої грішки перед штабом та НАБК.» ${state.ownedAssets.includes("rolex_watch") ? "(Знижка -50% завдяки твоєму золотому «Кролексу»!)" : ""}`,
              `'Put ${cut} ₴ in my drawer and I'll cover your slip-ups.' ${state.ownedAssets.includes("rolex_watch") ? "(50% discount from your Gold Krolex!)" : ""}`
            ), state.lang)}</p>
          </section>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button type="button" id="btn-pay-palych" class="btn-primary-green" ${state.money < cut ? "disabled" : ""}>${tr(L(`Занести Паличу ${cut} ₴ (-ризик НАБК, +дах)`, `Pay Palych ${cut} ₴ (-NABK Risk, +Boss Rep)`), state.lang)}</button>
          <button type="button" id="btn-refuse-palych" class="btn-outline" style="width:100%;padding:12px;color:#FF8A80;border-color:#FF8A80;">${tr(L("Послати Палича і залишити всі гроші собі!", "Skip paying Palych and keep all cash!"), state.lang)}</button>
        </div>
      `;
      document.getElementById("btn-pay-palych").addEventListener("click", () => {
        audio.playBribe();
        state.money -= cut;
        state.palychRep = Math.min(100, state.palychRep + 12);
        state.nabkRisk = Math.max(0, state.nabkRisk - 8);
        state.purchasedExpensesToday = [];
        state.phase = "HOME_EVENING";
        saveStateToStorage();
        render();
      });
      document.getElementById("btn-refuse-palych").addEventListener("click", () => {
        audio.playDeny();
        state.palychRep = Math.max(0, state.palychRep - 15);
        if (state.shiftBribesTotal > 0) state.nabkRisk = Math.min(100, state.nabkRisk + 10);
        state.purchasedExpensesToday = [];
        state.phase = "HOME_EVENING";
        saveStateToStorage();
        render();
      });
      return;
    }

    if (state.phase === "HOME_EVENING") {
      const rent = getPassiveRent();
      const rk = getRank();
      const canRetire = state.isSandbox && state.daySpec.dayNumber >= 5;

      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <h1 style="color:#E0B145;font-size:20px;">${tr(L(`🌙 ВЕЧІР УДОМА (Після Дня ${state.daySpec.dayNumber})`, `🌙 EVENING AT HOME (After Day ${state.daySpec.dayNumber})`), state.lang)}</h1>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:4px;font-size:13px;">
            <div style="color:#81C784;font-size:16px;font-weight:700;">💵 ${tr(L("Готівка вдома", "Cash on Hand"), state.lang)}: ${state.money} ₴</div>
            ${rent > 0 ? `<div style="color:#81C784;font-weight:700;">🏢 ${tr(L("Пасивний дохід та оклад СБК", "Passive & Covert Income"), state.lang)}: +${rent} ₴/${tr(L("ранок", "morning"), state.lang)}</div>` : ""}
            <div style="color:#64B5F6;font-weight:700;">🎖️ ${tr(rk.title, state.lang)}${state.isUndercoverSbkAgent ? ` (${tr(L("Спіймано агентури", "Operatives caught"), state.lang)}: ${state.spiesCaughtAsAgent}/4)` : ""}</div>
            <div>🏠 ${tr(L("Настрій сім'ї", "Family Morale"), state.lang)}: ${state.familyMorale}% | 🕵️ НАБК: <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#FFF"};">${state.nabkRisk}%</span> | СБК: ${state.sbkRep}</div>
            <div style="color:#E0B145;font-weight:700;">🚐 ${tr(L("Фонд утечі", "Escape Fund"), state.lang)}: ${state.escapeFund} / ${getEscapeTarget()} ₴ (${tr(L("Толік", "Tolik"), state.lang)}: ${state.tolikRep}/${getEscapeTolikRep()})</div>
          </section>

          <div class="row-between">
            <button type="button" id="tab-home-0" class="${state.eveningTab === 0 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L("🏠 Вечірні справи (Опційно)", "🏠 Evening Choices"), state.lang)}</button>
            <button type="button" id="tab-home-1" class="${state.eveningTab === 1 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L(`💎 Магазин Активів (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`, `💎 Assets Shop (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`), state.lang)}</button>
          </div>

          <div id="evening-items-list" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${canRetire ? `<button type="button" id="btn-retire-career" class="btn-outline" style="width:100%;padding:10px;">${tr(L("📜 ПІТИ У ВІДСТАВКУ ТА ПІДБИТИ ПІДСУМКИ КАР'ЄРИ", "📜 RETIRE & VIEW PERSONAL EPILOGUE"), state.lang)}</button>` : ""}
          <button type="button" id="btn-next-day" class="btn-primary-green">${tr(L("ЛЯГАТИ СПАТИ (ЗБЕРЕГТИ КЕШ) →", "SLEEP (KEEP REMAINING CASH) →"), state.lang)}</button>
        </div>
      `;

      document.getElementById("tab-home-0").addEventListener("click", () => { audio.playTap(); state.eveningTab = 0; render(); });
      document.getElementById("tab-home-1").addEventListener("click", () => { audio.playTap(); state.eveningTab = 1; render(); });
      if (canRetire) {
        document.getElementById("btn-retire-career").addEventListener("click", () => { audio.playApprove(); triggerEnding(null); });
      }

      const listEl = document.getElementById("evening-items-list");
      const billsToShow = (state.tonightBills && state.tonightBills.length > 0) ? state.tonightBills : DYNAMIC_EVENING_BILLS.slice(0, 3);
      if (state.eveningTab === 0) {
        billsToShow.forEach(exp => {
          const bought = state.purchasedExpensesToday.includes(exp.id);
          const canBuy = state.money >= exp.cost && !bought;
          const card = document.createElement("div");
          card.className = "card-slate row-between";
          if (bought) card.style.backgroundColor = "#1B5E20";
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${tr(exp.title, state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;">${tr(exp.subtitle, state.lang)}</div>
              <div style="color:#E0B145;font-size:12px;font-weight:800;">${exp.cost} ₴</div>
            </div>
          `;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn-mustard";
          b.disabled = !canBuy;
          b.textContent = bought ? tr(L("Оплачено", "Paid"), state.lang) : tr(L("Оплатити", "Pay"), state.lang);
          b.addEventListener("click", () => {
            audio.playBribe();
            state.money -= exp.cost;
            state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + exp.morale));
            state.escapeFund += exp.escape;
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
        ASSET_UPGRADES.forEach(asset => {
          const owned = state.ownedAssets.includes(asset.id);
          const canBuy = state.money >= asset.cost && !owned;
          const card = document.createElement("div");
          card.className = "card-slate row-between";
          if (owned) card.style.backgroundColor = "#1B5E20";
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${asset.icon} ${tr(asset.title, state.lang)}</div>
              <div style="color:#CFD8DC;font-size:11px;line-height:1.35;">${tr(asset.subtitle, state.lang)}</div>
              <div style="color:#E0B145;font-size:12px;font-weight:800;">${asset.cost} ₴</div>
            </div>
          `;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn-mustard";
          b.disabled = !canBuy;
          b.textContent = owned ? tr(L("Куплено", "Owned"), state.lang) : tr(L("Купити", "Buy"), state.lang);
          b.addEventListener("click", () => {
            audio.playBribe();
            state.money -= asset.cost;
            state.ownedAssets.push(asset.id);
            state.tolikRep = Math.min(100, state.tolikRep + asset.tolikBoost);
            state.palychRep = Math.min(100, state.palychRep + asset.palychBoost);
            state.familyMorale = Math.min(100, state.familyMorale + asset.moraleBoost);
            saveStateToStorage();
            render();
          });
          card.appendChild(b);
          listEl.appendChild(card);
        });
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
              <span>🏆 ${tr(L("Відкрито титулів", "Titles Discovered"), state.lang)}: <strong>${epi.unlockedCount}/16</strong></span>
              <span>💵 ${state.money} ₴ • СБК ${state.sbkRep}</span>
            </div>
          </div>

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
      document.getElementById("btn-share-result").addEventListener("click", () => { audio.playTap(); shareResultCard(); });
      document.getElementById("btn-restart").addEventListener("click", () => { audio.playTap(); state.phase = "MAIN_MENU"; render(); });
    }
  }

  render();
})();
