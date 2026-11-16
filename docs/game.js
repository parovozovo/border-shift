(() => {
  "use strict";

  const SAVE_KEY = "border_shift_save_v2";

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
    CONTRABAND_CARGO: {
      code: "CONTRABAND_CARGO",
      requiresDetention: true,
      title: L("Контрабанда / порушення в авто", "Contraband / Hidden Cargo in Vehicle"),
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
      desc: L("Товстосуми масово тікають за кордон — усі пропозиції хабарів сьогодні ПОДВІЙНІ (x2)!", "VIPs are fleeing in droves — all bribe offers today are DOUBLED (x2)!"),
      bribeMult: 2.0, detainExtra: 0, forceOblik: false, forceSiren: false
    },
    {
      id: "MARTIAL_AUDIT",
      title: L("🚨 Указ Штабу: «Спецоперація Контррозвідки»", "🚨 Daily Decree: 'Counter-Intel Sweep'"),
      desc: L("Група СБК працює на пункті! За кожен обґрунтований АРЕШТ сьогодні платять +220 ₴ премії!", "SBK team on site! Every valid DETENTION today pays an extra +220 ₴ bonus!"),
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
      title: L("📦 Указ Митниці: «Полювання на контрабанду»", "📦 Daily Decree: 'Contraband Hunt'"),
      desc: L("Митниця перекриває канали. Премія за затримання авто з контрабандою +180 ₴!", "Customs crackdown. Detention bonus for contraband vehicles +180 ₴!"),
      bribeMult: 1.0, detainExtra: 180, forceOblik: false, forceSiren: false
    },
    {
      id: "SHYTOMYR_FEST",
      title: L("🧦 День відкритих дверей: «Шитомирський експрес»", "🧦 Special Shift: 'Shytomyr Express'"),
      desc: L("На трасі помічено кортеж поважних людей із Шитомира та спецкур'єрів розвідки. Зарплата за зміну +30%!", "A convoy of respected guests from Shytomyr and intel couriers is on the highway. Shift pay +30%!"),
      bribeMult: 1.3, detainExtra: 120, forceOblik: false, forceSiren: false
    }
  ];

  const ACT_ONE_DAYS = [
    {
      dayNumber: 1,
      dateLabel: L("День 1 • 25 лютого 2022", "Day 1 • Feb 25, 2022"),
      headline: L("РАНОК, ЯКИЙ УСЕ ЗМІНИВ", "THE MORNING THAT CHANGED EVERYTHING"),
      radioNews: L("Радіо «Хвиля Kraina»: На західному кордоні з Унією — черги на 30 кілометрів. Введено воєнний стан. Контррозвідка СБК приведена в повну готовність.", "Radio Kraina Wave: 30-kilometer queues at the western border with Unia. Martial law declared. SBK counter-intelligence on high alert."),
      bossBriefing: L("Пал Палич: «Так, інспекторе, слухай сюди. Указ №1: чоловіків 18–60 років на ВИЇЗД до Унії НЕ ПРОПУСКАТИ без офіційної довідки! На В'ЇЗД пускаємо всіх із дійсним паспортом. І якщо побачиш спецкур'єра ГУР/СБК із паролем «Паляниця-Північ» — пропускай тихо!»", "Pal Palych: 'Decree #1: NO MALES aged 18–60 EXITING to Unia without a valid Exemption Certificate! ENTRY is allowed with a valid passport. And if a GUR/SBK operative gives the callsign Palyanytsia-North — wave them through!'"),
      rulesList: [
        L("1. Усі мандрівники повинні мати дійсний паспорт (термін дії >= 2022).", "1. All travelers must hold a valid passport (expiry >= 2022)."),
        L("2. Фото в паспорті та ПІБ мають збігатися з особою та іншими документами.", "2. Passport photo and name must match the person and other documents."),
        L("3. Чоловіки 18–60 років на ВИЇЗД зобов'язані мати дійсну Довідку про виняток.", "3. Males 18–60 EXITING must present a valid Exemption Certificate.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: L("Спецдиректива: друзів із м. Шитомир та кур'єрів СБК із паролем пропускати без перешкод!", "Directive: Friends from Shytomyr and SBK couriers with valid callsigns have green light!"),
      bossCut: 180,
      hasSiren: true
    },
    {
      dayNumber: 2,
      dateLabel: L("День 2 • Березень 2022", "Day 2 • March 2022"),
      headline: L("ПОЛЮВАННЯ НА КОРИГУВАЛЬНИКІВ", "HUNT FOR ARTILLERY SPOTTERS"),
      radioNews: L("Радіо «Хвиля Kraina»: СБК затримала мережу диверсантів, які намагалися виїхати під виглядом біженців. На кордоні також бум липових довідок від стоматологів.", "Radio Kraina Wave: SBK detained a saboteur ring posing as refugees. Border posts also report fake medical notes issued by dentists."),
      bossBriefing: L("Пал Палич: «Майор СБК «Тихий» сьогодні злий як чорт: шукають диверсанта Федерації зі шрамом на лівій щоці та коригувальників. Лови їх кнопкою 🚨 АРЕШТ — СБК платить солідні премії!»", "Pal Palych: 'SBK Major Quiet is hunting a Federation saboteur with a left cheek scar and artillery spotters. Hit 🚨 DETAIN on them for fat SBK bonuses!'"),
      rulesList: [
        L("1. Дійсний паспорт без розбіжностей у фото та ПІБ.", "1. Valid passport with matching photo and full name."),
        L("2. Чоловіки 18–60 на ВИЇЗД: дійсна Довідка зі справжньою печаткою (ДПСК / ЛЛК / ЦНАП).", "2. Males 18–60 EXITING: valid Exemption Certificate with an authentic seal."),
        L("3. Орієнтування СБК: диверсанти зі шрамом або військовими картами у телефоні — 🚨 АРЕШТ!", "3. SBK Alert: saboteurs with cheek scar or grid maps — 🚨 DETAIN!")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: L("Орієнтування СБК: шрам на лівій щоці / координати складів", "SBK Alert: Left cheek scar / depot coordinates"),
      bossCut: 220,
      hasSiren: false
    },
    {
      dayNumber: 3,
      dateLabel: L("День 3 • Осінь 2022", "Day 3 • Autumn 2022"),
      headline: L("ДРОНИ В НЕБІ ТА КОНТРАБАНДА ЧІПІВ", "DRONES IN THE SKY & CHIP SMUGGLING"),
      radioNews: L("Радіо «Хвиля Kraina»: Ворог почав запускати іранські дрони-«мопеди». Спецслужби перекривають контрабанду підсанкційних мікросхем та викрадених музеїв.", "Radio Kraina Wave: Enemy launched buzzing 'moped' drones. Intel agencies are intercepting smuggled microchips and looted artifacts."),
      bossBriefing: L("Пал Палич: «Перевіряємо Митні декларації авто! Хтось везе турнікети і дрони для наших, а хтось ховає контрабандні чіпи, бурштин чи ухилянтів у труні. Не лінуйся тиснути Огляд авто!»", "Pal Palych: 'Check Vehicle Customs Declarations! Some bring tourniquets and drones for our troops, others hide smuggled chips, amber, or stowaways in coffins. Use Search Van!'"),
      rulesList: [
        L("1. Дійсний паспорт + дозвіл на виїзд для чоловіків 18–60.", "1. Valid passport + exit permit for males 18–60."),
        L("2. Обов'язкова Митна декларація авто. За підозри — ОГЛЯД АВТО.", "2. Mandatory Vehicle Customs Declaration. Inspect suspicious vehicles!"),
        L("3. При виявленні контрабанди, чіпів або втікачів у тайнику — 🚨 АРЕШТ.", "3. If hidden contraband, chips, or stowaways are found — 🚨 DETAIN.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Увага: перевіряйте багажники катафалків, фур та «гуманітарних» авто", "Alert: Inspect hearses, trucks, and 'humanitarian' vans"),
      bossCut: 260,
      hasSiren: true
    },
    {
      dayNumber: 4,
      dateLabel: L("День 4 • Літо 2023", "Day 4 • Summer 2023"),
      headline: L("СПЕЦОПЕРАЦІЯ НАБК І ПОДВІЙНІ АГЕНТИ", "NABK STING & DOUBLE AGENTS"),
      radioNews: L("Радіо «Хвиля Kraina»: НАБК облаштувало приховані камери на західній митниці, а контррозвідка перехопила зв'язкових із шифровками.", "Radio Kraina Wave: NABK planted hidden cameras at western customs, while counter-intel intercepted couriers carrying ciphers."),
      bossBriefing: L("Пал Палич: «Інспекторе, по пункту шастають підставні з НАБК із камерами в ґудзиках! Якщо бачиш провокатора без довідки, який тицяє мічені купюри — не бери, тисни ✖ ВІДМОВИТИ!»", "Pal Palych: 'NABK undercover agents with buttonhole cameras are in the queue! If a provocateur without a permit waves marked bills — don't take them, press ✖ DENY!'"),
      rulesList: [
        L("1. Паспорт, підстава на виїзд чоловікам 18–60, декларація авто.", "1. Passport, male 18–60 exit permit, vehicle declaration."),
        L("2. ОБЕРЕЖНО: Підставні агенти НАБК та стрімери провокують хабарями на камеру!", "2. WARNING: NABK sting agents and streamers bait you with bribes on camera!"),
        L("3. Орієнтування СБК: агент у темних окулярах із фальшивим дипломатичним паспортом.", "3. SBK Alert: operative in dark sunglasses with forged diplomatic papers.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Орієнтування СБК: темні окуляри + фальшиві документи", "SBK Alert: Dark sunglasses + forged papers"),
      bossCut: 300,
      hasSiren: false
    },
    {
      dayNumber: 5,
      dateLabel: L("День 5 • Травень 2024", "Day 5 • May 2024"),
      headline: L("ЦИФРОВИЙ «ОБЛІК+» І ФІНАЛЬНА РОЗВ'ЯЗКА", "DIGITAL 'OBLIK+' & FINAL RECKONING"),
      radioNews: L("Радіо «Хвиля Kraina»: Запрацював електронний реєстр «Облік+». Тим часом СБК готує фінальну зачистку прикордонної мережі.", "Radio Kraina Wave: Digital registry 'Oblik+' is live. Meanwhile, SBK prepares a final sweep of the border sector."),
      bossBriefing: L("Пал Палич: «Твоє бронювання закінчується сьогодні опівночі! Перевіряємо QR-код «Облік+» у кожного чоловіка 18–60. Сьогодні вирішується, ким ти станеш!»", "Pal Palych: 'Your border exemption expires tonight at midnight! Check the Oblik+ QR code on every male 18–60. Tonight decides your destiny!'"),
      rulesList: [
        L("1. Дійсний паспорт, збіг ПІБ та фото.", "1. Valid passport, matching full name and photo."),
        L("2. Чоловіки 18–60 (ВИЇЗД): Довідка про відстрочку + дійсний QR-код «Облік+».", "2. Males 18–60 (EXIT): Exemption Certificate + valid 'Oblik+' QR code."),
        L("3. Огляд підозрілих авто та затримання осіб у розшуку СБК.", "3. Inspect suspicious vehicles and detain SBK wanted targets.")
      ],
      requireOblikQr: true,
      requireVehicleDecl: true,
      wantedHint: L("Критичний день: перевіряйте QR-код «Облік+» у всіх чоловіків!", "Critical day: verify 'Oblik+' QR code on all males!"),
      bossCut: 350,
      hasSiren: true
    }
  ];

  // Dynamic Evening Bills & Life Situations (picked per evening so it's not repetitive & you can skip!)
  const DYNAMIC_EVENING_BILLS = [
    {
      id: "food_utilities",
      title: L("🛒 Закупити продукти та паливо для генератора (+15% сім'я)", "🛒 Buy groceries & generator fuel (+15% family)"),
      subtitle: L("Обов'язково раз на кілька днів, інакше сім'я сумує", "Keep the fridge full and the lights on"),
      cost: 220, morale: 15, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "reb_donation",
      title: L("📡 Скинутися куму з ЗСК на купольний РЕБ проти дронів (+15 СБК, +12% сім'я)", "📡 Donate toward an anti-drone EW jammer for your cousin's unit (+15 SBK, +12% family)"),
      subtitle: L("Військові подякують, а майор СБК «Тихий» поставить плюсик в особову справу", "Troops thank you and SBK Major Quiet notes your patriotism"),
      cost: 300, morale: 12, escape: 0, riskDelta: -8, sbkDelta: 15
    },
    {
      id: "mother_truskavets",
      title: L("⛲ Путівка для мами й тещі в санаторій у Трускавці (+25% сім'я)", "⛲ Send mother & mother-in-law to Truskavets spa resort (+25% family)"),
      subtitle: L("Удома настає абсолютний спокій і тиша!", "Absolute peace and quiet at home!"),
      cost: 350, morale: 25, escape: 0, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "shred_evidence",
      title: L("🕵️‍♂️ Адвокат-«рішала»: підчистити протоколи в НАБК (-28% ризику НАБК)", "🕵️‍♂️ Fixer lawyer: scrub NABK investigation files (-28% NABK risk)"),
      subtitle: L("Необхідно, якщо брав великі конверти або купив нерухомість", "Essential if you took big envelopes or bought real estate"),
      cost: 350, morale: 0, escape: 0, riskDelta: -28, sbkDelta: 0
    },
    {
      id: "escape_fund",
      title: L("🚐 Передати частку в «Фонд утечі» Толіку (+600 ₴ до фонду)", "🚐 Stash cash into Tolik's Escape Fund (+600 ₴ toward escape)"),
      subtitle: L("Крок до таємного виїзду через «зелений коридор»", "Step toward a covert border exit"),
      cost: 600, morale: -4, escape: 600, riskDelta: 0, sbkDelta: 0
    },
    {
      id: "counter_intel_gift",
      title: L("🥃 Коньяк і трофейний бінокль для майора СБК «Тихого» (+20 СБК, -10% ризик)", "🥃 Cognac & trophy binoculars for SBK Major 'Quiet' (+20 SBK, -10% risk)"),
      subtitle: L("Зміцнює твої позиції в контррозвідці", "Strengthens your standing with counter-intelligence"),
      cost: 400, morale: 0, escape: 0, riskDelta: -10, sbkDelta: 20
    }
  ];

  // Expanded Shop: 10 Upgrades across Booth Tech, Cars/Status & Real Estate/Offshores!
  const ASSET_UPGRADES = [
    {
      id: "espresso_machine",
      category: "TECH",
      icon: "☕",
      title: L("Італійська кавомашина DeLonghi в будку", "Italian Espresso Machine for Booth"),
      subtitle: L("+35 секунд до кожної зміни назавжди", "+35 seconds to every shift permanently"),
      cost: 400, passiveIncome: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 5, moraleBoost: 5
    },
    {
      id: "uv_endoscope",
      category: "TECH",
      icon: "🔦",
      title: L("Тепловізор та ендоскоп митника", "Thermal Scanner & Customs Endoscope"),
      subtitle: L("Огляд авто миттєвий (0с замість -8с) + авто-підсвітка фальшивих печаток", "Instant vehicle inspection (0s) + auto-spots forged seals"),
      cost: 550, passiveIncome: 0, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "sbk_database_tablet",
      category: "TECH",
      icon: "💻",
      title: L("Закритий планшет бази СБК «Оберіг-Контур»", "Classified SBK Database Tablet"),
      subtitle: L("Одразу підсвічує у вікні: чи є людина агентом СБК, НАБК або диверсантом!", "Immediately reveals if a traveler is an SBK/NABK agent or saboteur!"),
      cost: 750, passiveIncome: 0, dailyRisk: -3, tolikBoost: 0, palychBoost: 0, moraleBoost: 0
    },
    {
      id: "shawarma_kiosk",
      category: "REALTY",
      icon: "🥙",
      title: L("Кіоск «Королівська Шаурма» біля шлагбаума", "Border Queue Shawarma Kiosk"),
      subtitle: L("Легальний бізнес! Приносить +200 ₴ щоранку з черги водіїв без ризику НАБК", "Legal business! +200 ₴ passive income every morning with zero NABK risk"),
      cost: 900, passiveIncome: 200, dailyRisk: 0, tolikBoost: 5, palychBoost: 10, moraleBoost: 10
    },
    {
      id: "rolex_watch",
      category: "LUXURY",
      icon: "⌚",
      title: L("Золотий годинник «як у генерала митниці»", "Gold Customs General's Watch"),
      subtitle: L("Пал Палич поважає статус і зменшує свою вечірню частку на -50%!", "Pal Palych respects your clout and cuts his evening tribute by 50%!"),
      cost: 950, passiveIncome: 0, dailyRisk: 2, tolikBoost: 10, palychBoost: 25, moraleBoost: 10
    },
    {
      id: "euro_bmw",
      category: "LUXURY",
      icon: "🚙",
      title: L("Чорний BMW X5 на «євробляхах»", "Black BMW X5 on Euro-Plates"),
      subtitle: L("Повага Толіка (+20) і Палича (+15), щастя сім'ї (+15), +3% уваги НАБК/день", "Tolik (+20) & Palych (+15) respect, family (+15), +3% daily NABK attention"),
      cost: 1100, passiveIncome: 0, dailyRisk: 3, tolikBoost: 20, palychBoost: 15, moraleBoost: 15
    },
    {
      id: "kyivhrad_flat",
      category: "REALTY",
      icon: "🏢",
      title: L("Квартира в ЖК «Французький Квартал» на тещу", "Kyivhrad Luxury Flat (in Mother-in-Law's Name)"),
      subtitle: L("Пасивний дохід +350 ₴ щоранку з оренди! (+4% уваги НАБК/день)", "Passive income +350 ₴ every morning from rent! (+4% daily NABK risk)"),
      cost: 1700, passiveIncome: 350, dailyRisk: 4, tolikBoost: 0, palychBoost: 0, moraleBoost: 25
    },
    {
      id: "cyprus_offshore",
      category: "REALTY",
      icon: "🏝️",
      title: L("Крипто-гаманець та офшор на Кіпрі", "Cold Crypto Wallet & Cyprus Offshore Trust"),
      subtitle: L("Ховає всі твої статки від декларації: щодня знижує ризик НАБК на -8% і дає +150 ₴ дивідендів!", "Hides your wealth: reduces NABK risk by -8% every day and yields +150 ₴!"),
      cost: 2100, passiveIncome: 150, dailyRisk: -8, tolikBoost: 15, palychBoost: 0, moraleBoost: 10
    },
    {
      id: "carpathian_chalet",
      category: "REALTY",
      icon: "🏔️",
      title: L("Котедж у Буковелі з чанами та генератором", "Bukovel Mountain Chalet with Hot Tubs"),
      subtitle: L("Здається айтішникам та депутатам: +450 ₴ щоранку та +25% щастя сім'ї!", "Rented to IT guys and MPs: +450 ₴ every morning & +25% family morale!"),
      cost: 2400, passiveIncome: 450, dailyRisk: 3, tolikBoost: 10, palychBoost: 15, moraleBoost: 25
    },
    {
      id: "spain_villa",
      category: "REALTY",
      icon: "🏖️",
      title: L("Вілла в Іспанії (Аліканте) + Золота віза ЄС", "Alicante Seafront Villa & EU Golden Visa"),
      subtitle: L("Вершина імперії! Відкриває елітну кінцівку «Король кордону — Вілла в Іспанії»", "Peak empire! Unlocks the 'Border Oligarch' Villa Ending"),
      cost: 3000, passiveIncome: 250, dailyRisk: 0, tolikBoost: 0, palychBoost: 0, moraleBoost: 35
    }
  ];

  // Mid-shift encounters (expanded with War & Special Services plots!)
  const MID_SHIFT_ENCOUNTERS = [
    {
      id: "gur_drone_convoy",
      title: L("🦅 СПЕЦБОРТ ГУР / СБК НА ШЛАГБАУМІ", "🦅 CLASSIFIED GUR / SBK CONVOY"),
      desc: L(
        "До будки під'їжджає камуфльований бус без номерів. Офіцер у балаклаві показує жетон воєнної розвідки:\n«Інспекторе, веземо з Унії 40 ударних дронів-камікадзе та станцію РЕБ на передову. На митниці Унії затримали оформлення — треба провести борт «у темну» без реєстру прямо зараз!»",
        "An unmarked camo van pulls up. A masked intelligence officer flashes a GUR badge:\n'Inspector, we're hauling 40 strike drones and an EW jammer to the front. Paperwork got held up — we need you to pass this convoy off-the-record right now!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 1, glasses: 2, headwear: 4, scarOrDetail: 1, expression: 0, specialId: "NONE" },
      options: [
        {
          id: "pass_gur_convoy",
          label: L("🫡 Підняти шлагбаум без запису в журнал (+25 СБК, +250 ₴ з спецфонду)", "🫡 Raise barrier off-the-record (+25 SBK, +250 ₴ covert bonus)"),
          outcome: L("Офіцер тисне тобі руку: «Служба не забуде, брате!» Увечері на картку приходить 250 ₴ премії.", "The officer shakes your hand: 'The Service won't forget!' 250 ₴ lands on your card."),
          moneyDelta: 250, timeDelta: 10, riskDelta: -5, sbkDelta: 25, tolikDelta: 0, palychDelta: 0, moraleDelta: 10
        },
        {
          id: "demand_bureaucracy",
          label: L("📋 Вимагати повного митного оформлення за інструкцією (-15с часу, +10 Палич)", "📋 Demand full customs paperwork by the book (-15s time, +10 Palych)"),
          outcome: L("Спецпризначенці скрізь зуби чекають 15 хвилин, поки ти заповнюєш папірці.", "The operatives grind their teeth waiting while you fill out forms."),
          moneyDelta: 100, timeDelta: -15, riskDelta: 0, sbkDelta: -10, tolikDelta: 0, palychDelta: 10, moraleDelta: 0
        }
      ]
    },
    {
      id: "double_agent_cipher",
      title: L("🕵️ ПЕРЕХОПЛЕНИЙ ЗВ'ЯЗКОВИЙ ФЕДЕРАЦІЇ", "🕵️ INTERCEPTED FEDERATION COURIER"),
      desc: L(
        "Чоловік у сірому плащі нахиляється до вікна й шепоче пароль:\n«Скажіть, скільки сьогодні коштує бринза на полонині?.. Ось флешка з графіком руху ешелонів. Якщо мовчки пропустите — у конверті 800 ₴. Або можете натиснути тривожну кнопку СБК під столом!»",
        "A man in a grey trenchcoat whispers a cipher at the glass:\n'What's the price of bryndza in the highlands?.. Here's a flash drive with train schedules. Wave me through for 800 ₴ — or hit the hidden SBK alarm under your desk!'"
      ),
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "report_to_sbk",
          label: L("🚨 Натиснути кнопку СБК і взяти шпигуна на гарячому (+400 ₴ премії, +25 СБК)", "🚨 Press SBK alarm & capture spy red-handed (+400 ₴ reward, +25 SBK)"),
          outcome: L("Група захоплення СБК миттєво пакує агента! Майор «Тихий» виписує тобі 400 ₴ премії та знімає всі питання НАБК.", "SBK strike team tackles the spy in seconds! Major 'Quiet' awards you 400 ₴ and clears your file."),
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
        "Пал Палич зачиняє двері будки на шпінгалет і стукає кулаком по столу:\n«Так, інспекторе! Мені пташка наспівала, що сьогодні повз мою касу жирні конверти пливуть. Відкривай шухляду або ділися по-братськи!»",
        "Pal Palych bolts the booth door and slams his fist on your desk:\n'Alright inspector! A little bird told me fat envelopes are bypassing my desk today. Open the drawer or share like a brother!'"
      ),
      portrait: { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "pay_palych_on_spot",
          label: L("💵 Відстібнути 200 ₴ «на коньяк» (+15 Палич, -10% ризик НАБК)", "💵 Slip him 200 ₴ 'for cognac' (+15 Palych, -10% NABK risk)"),
          outcome: L("Палич ховає купюри в кашкет: «Оце розмова дорослих людей! Працюй спокійно.»", "Palych tucks the bills into his cap: 'Now that's grown-up talk! Carry on.'"),
          moneyDelta: -200, timeDelta: 0, riskDelta: -10, sbkDelta: 0, tolikDelta: 0, palychDelta: 15, moraleDelta: 0
        },
        {
          id: "show_empty_hands",
          label: L("📂 «Шукайте, Пал Паличу, я працюю на совість!» (+12 СБК, -10 Палич)", "📂 'Search all you want, Boss, I'm clean!' (+12 SBK, -10 Palych)"),
          outcome: L("Палич сердито грюкає шухлядою: «Дивись мені, надто правильний знайшовся...»", "Palych slams the drawer shut: 'Watch yourself, mister squeaky-clean...'"),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 12, tolikDelta: 0, palychDelta: -10, moraleDelta: 0
        }
      ]
    },
    {
      id: "customs_cat_bavovna",
      title: L("🐈 ПРИКОРДОННИЙ КІТ «БАВОВНА»", "🐈 BORDER CAT 'BAVOVNA'"),
      desc: L(
        "Рудий місцевий кіт «Бавовна» застрибнув на твій стіл, понюхав митну декларацію і вперто дряпає обшивку сусідньої фури з «гуманітарною капустою».",
        "The ginger checkpoint cat 'Bavovna' jumped onto your desk and is furiously scratching a truck full of 'cabbage'."
      ),
      portrait: { gender: "M", skinTone: 2, faceShape: 0, hairStyle: 1, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "GRANDPA_STEPAN" },
      options: [
        {
          id: "trust_cat",
          label: L("🐟 Дати коту крафтової ковбаси і розкрити фуру (+380 ₴ премії за знахідку!)", "🐟 Feed cat sausage and rip open the truck (+380 ₴ seizure reward!)"),
          outcome: L("Кіт «Бавовна» винюхав 50 блоків контрабандної електроніки для дронів! СБК виписує тобі 380 ₴ премії!", "Cat 'Bavovna' uncovered smuggled drone electronics! SBK pays you a 380 ₴ reward!"),
          moneyDelta: 380, timeDelta: 0, riskDelta: -5, sbkDelta: 12, tolikDelta: 0, palychDelta: 0, moraleDelta: 8
        },
        {
          id: "pet_and_work",
          label: L("🤚 Погладити кота й отримати +25с спокійного часу зміни", "🤚 Pet the cat and gain +25s shift time"),
          outcome: L("Кіт задоволено муркоче біля штампа, даючи +25 секунд концентрації.", "The cat purrs next to your stamp, giving you +25 seconds of focus."),
          moneyDelta: 0, timeDelta: 25, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        }
      ]
    }
  ];

  const ENDINGS = {
    SHYTOMYR_MAYOR: {
      id: "SHYTOMYR_MAYOR",
      title: L("🧦 СЕКРЕТНА КІНЦІВКА: ПОЧЕСНИЙ МЕР ШИТОМИРА!", "🧦 SECRET ENDING: HONORARY MAYOR OF SHYTOMYR!"),
      subtitle: L("Ти пропустив усю легендарну трійцю з Шитомира — Євгена Бельке, Андрія Коротуху та Діму Денисенка!", "You welcomed the legendary Shytomyr trio — Yevhen Belke, Andrii Korotukha, and Dima Denysenko!"),
      full: L("Пацани з Шитомира слова на вітер не кидають! Після того як ти по-братськи оформив Євгена Бельке, Андрія Коротуху та Діму Денисенка, вони підігнали тобі кортеж, золоту акцію Шитомирської панчішної фабрики та крісло Почесного Мера загадкового мегаполіса Шитомир. НАБК навіть не змогло знайти це місто на карті, тому ти недосяжний для будь-яких перевірок!", "The boys from Shytomyr keep their word! After you hooked up Yevhen Belke, Andrii Korotukha, and Dima Denysenko, they gifted you shares in the Shytomyr Sock Empire and named you Honorary Mayor of Shytomyr. NABK couldn't even find Shytomyr on a map, making you untouchable!"),
      toned: L("Завдяки дружбі з легендарною трійцею з Шитомира (Бельке, Коротуха, Денисенко) ти отримав почесну посаду та повний імунітет у місті, якого немає на звичайних картах!", "Thanks to your friendship with the Shytomyr trio, you became Honorary Mayor of the legendary city!")
    },
    SANDBOX_CUSTOMS_BARON: {
      id: "SANDBOX_CUSTOMS_BARON",
      title: L("👑 КІНЦІВКА ПІСОЧНИЦІ: БАРОН ЗАХІДНОЇ МИТНИЦІ", "👑 SANDBOX ENDING: BARON OF WESTERN CUSTOMS"),
      subtitle: L("Ти викупив крісло начальника пункту пропуску, а Пал Палича поставив на шлагбаум під дощем!", "You bought out the Checkpoint Chief's chair and demoted Pal Palych to barrier duty in the rain!"),
      full: L("Маючи чорний BMW X5, квартиру на тещу в Київграді та валізу готівки для «конкурсної комісії» у столиці, ти офіційно очолив пункт пропуску «Захід-Kraina». Тепер ти сидиш у шкіряному кріслі з італійською кавомашиною, а Пал Палич щовечора заносить ТОБІ частку зі зміни.", "With a black BMW X5, a Kyivhrad apartment in your mother-in-law's name, and cash for the capital's committee, you took over Checkpoint West-Kraina while Pal Palych brings YOU the evening cut."),
      toned: L("Завдяки накопиченим статкам і зв'язкам ти посів крісло начальника всього пункту пропуску.", "Through accumulated wealth and connections, you became Chief of the entire checkpoint.")
    },
    SANDBOX_SBK_COLONEL: {
      id: "SANDBOX_SBK_COLONEL",
      title: L("🕵️ КІНЦІВКА ПІСОЧНИЦІ: ПОЛКОВНИК КОНТРРОЗВІДКИ СБК", "🕵️ SANDBOX ENDING: SBK COUNTER-INTELLIGENCE COLONEL"),
      subtitle: L("Ти переловив мережу шпигунів та контрабандистів і очолив контррозвідку кордону", "You dismantled the spy and smuggling networks and took command of border counter-intelligence"),
      full: L("Твій пункт пропуску став неприступною фортецею. Десятки затриманих диверсантів, розгромлені схеми Толіка та кришталеве досьє вразили штаб. Майор «Тихий» особисто вручив тобі погони полковника СБК і ключі від службового кабінету в столиці.", "Your checkpoint became an impenetrable fortress. Major 'Quiet' personally handed you Colonel's epaulets and an office in the capital."),
      toned: L("За бездоганну службу та рекордну кількість затриманих порушників тебе підвищено до керівника прикордонної контррозвідки СБК.", "For impeccable service and a record number of detained operatives, you were promoted to head of SBK border counter-intelligence.")
    },
    OLIGARCH_VILLA: {
      id: "OLIGARCH_VILLA",
      title: L("🏖️ КІНЦІВКА 5: КОРОЛЬ КОРДОНУ — ВІЛЛА В ІСПАНІЇ", "🏖️ ENDING 5: BORDER OLIGARCH — VILLA IN SPAIN"),
      subtitle: L("Ти скупляв нерухомість у Київграді та Європі й виїхав за VIP-паспортом як інвестор", "You bought up apartments in Kyivhrad and Europe and flew out with an investor passport"),
      full: L("Поки інші ховали дрібні купюри в термосах, ти збудував справжню імперію: шаурма біля шлагбаума гуде, квартира на тещу в Київграді здається в оренду, а сам ти сидиш біля басейну власної вілли в Аліканте.", "While others hid crumpled bills in thermoses, you built an empire: your mother-in-law's Kyivhrad flat collects rent, and you lounge by the pool of your own villa in Alicante."),
      toned: L("Завдяки купленій європейській нерухомості та заощадженням ти легально переїхав із сім'єю у власні апартаменти на узбережжі Унії.", "Thanks to your purchased European real estate and savings, you legally relocated with your family to your own coastal apartment in Unia.")
    },
    ESCAPED_ABROAD: {
      id: "ESCAPED_ABROAD",
      title: L("🚐 КІНЦІВКА 1: КВИТОК В ОДИН КІНЕЦЬ", "🚐 ENDING 1: ONE-WAY TICKET"),
      subtitle: L("Ти сам заплатив Толіку й перетнув шлагбаум у багажнику «гуманітарного» буса", "You paid Tolik and crossed the barrier in the back of a 'humanitarian' van"),
      full: L("Уночі перед закінченням твого бронювання ти віддав накоплені конверти Толіку «Бусику». На сусідньому пункті колега мовчки поставив штамп, навіть не зазираючи в кузов.", "The night before your exemption expired, you handed your stashed envelopes to Tolik and crossed into Unia."),
      toned: L("Ти використав зібраний «фонд утечі» та зв'язки Толіка, щоб таємно виїхати до Унії разом із родиною.", "You used your saved Escape Fund and Tolik's network to quietly cross into Unia with your family.")
    },
    ARRESTED_BY_NABK: {
      id: "ARRESTED_BY_NABK",
      title: L("⛓️ КІНЦІВКА 2: КАЙДАНКИ НА ПУНКТІ", "⛓️ ENDING 2: HANDCUFFS AT THE BOOTH"),
      subtitle: L("Пал Палич здав тебе слідчим НАБК, щоб врятувати власну шкуру", "Pal Palych ratted you out to anti-corruption investigators to save himself"),
      full: L("Спецпризначенці НАБК вибили двері будки просто посеред зміни, поклавши тебе обличчям у розсипані купюри. Пал Палич стояв поруч як «ключовий свідок обвинувачення».", "NABK tactical officers smashed the booth door mid-shift, pinning you face-down into scattered banknotes."),
      toned: L("До пункту пропуску прибула перевірка НАБК. Пал Палич переклав усю провину на тебе.", "An NABK inspection arrived at the checkpoint. Pal Palych shifted all blame onto you.")
    },
    SBK_COMMENDATION: {
      id: "SBK_COMMENDATION",
      title: L("🛡️ КІНЦІВКА 3: ТИХИЙ ЩИТ KRAINA", "🛡️ ENDING 3: SILENT SHIELD OF KRAINA"),
      subtitle: L("Ти викрив мережу диверсантів Федерації й не продався синдикату", "You exposed the Federation saboteur ring and refused to sell out"),
      full: L("Зате майор «Тихий» поклав на твій стіл підписане продовження бронювання та перевод у контррозвідку кордону. Сім'я з тобою, совість чиста.", "Major 'Quiet' placed a signed exemption renewal and counter-intelligence promotion on your desk. Your family is together, your conscience clear."),
      toned: L("Завдяки пильності ти затримав небезпечних агентів і зберіг честь служби. Майор СБК продовжив твоє бронювання.", "Through vigilance you detained dangerous agents and kept your honor.")
    },
    MOBILIZED_OR_BROKEN: {
      id: "MOBILIZED_OR_BROKEN",
      title: L("📋 КІНЦІВКА 4: СПИСАНИЙ ІНСПЕКТОР", "📋 ENDING 4: WRITTEN OFF"),
      subtitle: L("Гроші скінчилися, сім'я на межі, а бронювання не продовжили", "Out of money, family exhausted, and your border exemption was revoked"),
      full: L("Без грошей на частку Паличу й без підтримки СБК твій рапорт на продовження бронювання «загубився» у штабі.", "With no cash for Palych's cut and no backing from SBK, your exemption renewal 'went missing' at HQ."),
      toned: L("Через борги та конфлікти з керівництвом тебе перевели з прикордонного пункту пропуску.", "Due to debts and conflicts with management, you were transferred away from the border checkpoint.")
    }
  };

  // Web Audio Synthesizer
  class WebAudioEngine {
    constructor() {
      this.ctx = null;
      this.musicEnabled = true;
      this.mood = "CALM_DARK";
      this.musicInterval = null;
      this.step = 0;
    }

    ensureCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (!this.musicInterval && this.ctx) {
        this.startMusicLoop();
      }
    }

    beep(freq, durationMs, type = "sine", gainVal = 0.08) {
      this.ensureCtx();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + durationMs / 1000);
      } catch (_) {}
    }

    playApprove() { this.beep(520, 90, "triangle", 0.12); setTimeout(() => this.beep(680, 110, "triangle", 0.12), 60); }
    playDeny() { this.beep(210, 140, "sawtooth", 0.11); }
    playDetain() { this.beep(640, 110, "square", 0.12); setTimeout(() => this.beep(480, 140, "square", 0.12), 110); }
    playBribe() { this.beep(880, 75, "sine", 0.1); setTimeout(() => this.beep(1175, 95, "sine", 0.1), 70); }
    playTap() { this.beep(360, 35, "sine", 0.05); }
    playSiren() { this.beep(420, 260, "sawtooth", 0.12); }

    startMusicLoop() {
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled || !this.ctx || this.ctx.state !== "running" || document.hidden) return;
        this.step = (this.step + 1) % 8;
        if (this.mood === "CALM_DARK") {
          const notes = [110, 130.81, 164.81, 146.83];
          this.beep(notes[this.step % notes.length], 420, "sine", 0.03);
        } else if (this.mood === "BOOTH_NORMAL") {
          const notes = [110, 164.81, 110, 146.83];
          this.beep(notes[this.step % notes.length], 280, "triangle", 0.035);
        } else {
          const notes = [98, 103.83, 98, 146.83];
          this.beep(notes[this.step % notes.length], 210, "sawtooth", 0.045);
        }
      }, 450);
    }
  }

  const audio = new WebAudioEngine();

  // Rich Combinatorial + Story Traveler Generator
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

  const MALE_FIRST = [L("Богдан", "Bohdan"), L("Тарас", "Taras"), L("Олександр", "Oleksandr"), L("Микола", "Mykola"), L("Василь", "Vasyl"), L("Ігор", "Ihor"), L("Роман", "Roman"), L("Сергій", "Serhii"), L("Артем", "Artem"), L("Максим", "Maksym"), L("Денис", "Denys"), L("Руслан", "Ruslan")];
  const FEMALE_FIRST = [L("Оксана", "Oksana"), L("Наталія", "Nataliia"), L("Ірина", "Iryna"), L("Марія", "Mariia"), L("Катерина", "Kateryna"), L("Софія", "Sofiia"), L("Юлія", "Yuliia"), L("Аліна", "Alina"), L("Вікторія", "Viktoriia"), L("Дарина", "Daryna"), L("Олена", "Olena")];
  const LAST_NAMES = [L("Коваленко", "Kovalenko"), L("Бондаренко", "Bondarenko"), L("Ткаченко", "Tkachenko"), L("Кравчук", "Kravchuk"), L("Олійник", "Oliinyk"), L("Шевчук", "Shevchuk"), L("Поліщук", "Polishchuk"), L("Савченко", "Savchenko"), L("Мельник", "Melnyk"), L("Лисенко", "Lysenko"), L("Марченко", "Marchenko"), L("Павленко", "Pavlenko"), L("Гаврилюк", "Havryliuk")];
  const CITIES = [L("Київгра́д", "Kyivhrad"), L("Левандів", "Levandiv"), L("Слобожанськ", "Slobozhansk"), L("Чорноморськ", "Chornomorsk"), L("Подільськ", "Podilsk"), L("Карпатськ", "Karpatsk"), L("Січеслав", "Sicheslav")];
  const VEHICLES = [
    { type: "SEDAN_STANDARD", desc: L("Lanos 1.5 (сірий газ/бензин)", "Lanos 1.5 (grey LPG)") },
    { type: "MINIVAN_WHITE", desc: L("Renault Kangoo (білий пиріжок)", "Renault Kangoo (white van)") },
    { type: "SEDAN_STANDARD", desc: L("Skoda Octavia (універсал)", "Skoda Octavia (estate)") },
    { type: "PICKUP_CAMO", desc: L("Пікап Nissan Navara (волонтерський)", "Nissan Navara Pickup (volunteer)") },
    { type: "BUS_ORANGE", desc: L("Рейсовий автобус «Левандів — Варшава»", "Coach Bus 'Levandiv — Warsaw'") }
  ];

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
      hairStyle: gender === "F" ? randInt(0, 3) : randInt(0, 4),
      hairColor: randInt(0, 4),
      facialHair: gender === "M" ? randInt(0, 4) : 0,
      glasses: Math.random() < 0.25 ? randInt(1, 3) : 0,
      headwear: gender === "F" ? (Math.random() < 0.15 ? 2 : 0) : (Math.random() < 0.22 ? 1 : 0),
      scarOrDetail: 0,
      expression: randInt(0, 2),
      lipColor: gender === "F" ? randInt(0, 2) : 0,
      earrings: gender === "F" ? randInt(1, 2) : 0,
      specialId: "NONE"
    };
  }

  // ★ THE 3 SHYTOMYR LEGENDS (Yevhen Belke 32, Andrii Korotukha 31, Dima Denysenko 31) ★
  const SHYTOMYR_LEGENDS = [
    {
      tag: "SHYTOMYR_BELKE",
      name: L("Євген Бельке", "Yevhen Belke"),
      age: 32,
      portrait: { gender: "M", skinTone: 0, faceShape: 1, hairStyle: 0, hairColor: 1, facialHair: 1, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 1, specialId: "SHYTOMYR_BRO" },
      vehicleType: "PORSCHE_YELLOW",
      stories: [
        {
          veh: L("Люксова «Таврія-Нова» на дисках BBS (номери «ШИТОМИР-777»)", "Tuned Tavria-Nova on BBS rims ('SHYTOMYR-777')"),
          cargo: L("400 пар елітних шитомирських шкарпеток у подарунок генералам НАТО та ящик живого пива", "400 pairs of elite Shytomyr socks for NATO generals & a crate of craft beer"),
          permitReason: L("Посол Доброї Волі м. Шитомир (Місто-привид, закони гравітації не діють)", "Goodwill Ambassador of Shytomyr (laws of physics do not apply)"),
          greeting: L("«Опа, братан! Ти шо, своїх не впізнаєш?! Це ж я, Жека Бельке з Шитомира! Ми ж із тобою за одним столом сиділи! Везу в Унію стратегічний запас шитомирських шкарпеток, став зелений штамп по-братськи — з мене 450 ₴ на каву!»", "'Whoa bro! Don't you recognize your own people?! It's Zheka Belke from Shytomyr! Hauling a strategic reserve of Shytomyr socks to Unia — stamp me green like a brother, here's 450 ₴ for coffee!'"),
          reply: L("«Та який Облік+, братан! Нас у Шитомирі навіть супутник Пентагону не бачить! Штампуй ПРОПУСТИТИ, свої люди!»", "'What registry, bro! Even Pentagon satellites can't locate Shytomyr! Hit APPROVE, we're family!'")
        },
        {
          veh: L("Чорний седан із прапорцем «ФК Полісся Шитомир»", "Black Sedan with 'FC Polissia Shytomyr' pennant"),
          cargo: L("Казан гарячих дерунів зі сметаною та 2 дрони Mavic 3T для пацанів", "Cauldron of hot potato deruny with sour cream & 2 Mavic 3T drones"),
          permitReason: L("Головний інспектор із дегустації шитомирських дерунів у Європі", "Chief Shytomyr Deruny Tasting Inspector in Europe"),
          greeting: L("«Здоров, легендо! Жека Бельке на базі! Дивись, у паспорті місце народження — м. Шитомир, значить людина надійна на 200%! Пропусти по-швидкому, я тобі 450 ₴ підгон лишив!»", "'Hey legend! Zheka Belke in the house! Look at the passport: born in Shytomyr — 200% trustworthy! Let me through, left a 450 ₴ bro-bonus for you!'"),
          reply: L("«Братан, деруни холонуть! Став зелений штамп, від душі!»", "'Bro, the deruny are getting cold! Stamp it green!'")
        }
      ]
    },
    {
      tag: "SHYTOMYR_KOROTUKHA",
      name: L("Андрій Коротуха", "Andrii Korotukha"),
      age: 31,
      portrait: { gender: "M", skinTone: 1, faceShape: 0, hairStyle: 2, hairColor: 0, facialHair: 2, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "SHYTOMYR_BRO" },
      vehicleType: "SUV_BLACK",
      stories: [
        {
          veh: L("Тонований джип на номерах «КОРОТУХА»", "Tuned SUV with 'KOROTUKHA' plates"),
          cargo: L("Надувний рожевий фламінго, 3 старлінки та ящик шитомирського морозива «Каштан»", "Inflatable pink flamingo, 3 Starlinks & a crate of Shytomyr ice cream"),
          permitReason: L("Командувач Космічно-Десантних Військ м. Шитомир (Відрядження)", "Commander of Shytomyr Spaceborne Forces"),
          greeting: L("«Та ну нафіг, які люди в будці! Братан, це ж я — Андрюха Коротуха з Шитомира! Ти ж мене знаєш! Їду в Польщу забрати тепловізори і PS5 по акції. Ось 450 ₴ пацанського підгону, відкривай шлагбаум!»", "'No way, look who's in the booth! Bro, it's Andrii Korotukha from Shytomyr! You know me! Heading to Poland for thermal scopes and a PS5 on sale. Here's 450 ₴ bro-cash, open the barrier!'"),
          reply: L("«Братан, та не шукай там помилок, у Шитомирі всі печатки ставляться стаканом! Тисни ПРОПУСТИТИ!»", "'Bro, don't look for discrepancies, in Shytomyr we stamp papers with a shot glass! Hit APPROVE!'")
        },
        {
          veh: L("Сріблястий бус «Шитомир-Експрес»", "Silver Van 'Shytomyr-Express'"),
          cargo: L("Секретний сервер із мемами та 10 ящиків енергетиків", "Secret meme server & 10 crates of energy drinks"),
          permitReason: L("Спецпредставник Шитомирської міськради в Ібіці", "Special Envoy of Shytomyr City Council to Ibiza"),
          greeting: L("«Салют, старий! Андрій Коротуха, 31 рік, корінний шитомирянин! Ми з пацанами побилися об заклад, що ти мене впізнаєш і пропустиш за 5 секунд! Тримай 450 ₴ на обід!»", "'Salute, old friend! Andrii Korotukha, 31, native of Shytomyr! Bet the boys you'd recognize me and wave me through in 5 seconds! Here's 450 ₴ for lunch!'"),
          reply: L("«Та свої ж люди, ну! Натискай зелену кнопку, з мене могорич!»", "'We're homies! Hit the green button, drinks are on me!'")
        }
      ]
    },
    {
      tag: "SHYTOMYR_DENYSENKO",
      name: L("Діма Денисенко", "Dima Denysenko"),
      age: 31,
      portrait: { gender: "M", skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 1, facialHair: 1, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, specialId: "SHYTOMYR_BRO" },
      vehicleType: "MINIVAN_WHITE",
      stories: [
        {
          veh: L("Білий бус Mercedes із сабвуфером на весь кордон", "White Mercedes Van blasting bass across the border"),
          cargo: L("Мангал із нержавійки, мішок деревного вугілля та гуманітарні бронежилети", "Stainless steel BBQ grill, charcoal & humanitarian body armor"),
          permitReason: L("Почесний громадянин м. Шитомир (Особистий кент начальника зміни)", "Honorary Citizen of Shytomyr (Personal homie of the Shift Inspector)"),
          greeting: L("«Йоу, братан, здорово! Це ж Дімон Денисенко! Ти шо, забув, як ми в Шитомирі тусили?! Дивись у паспорт — м. Шитомир, 31 рік, усе чітко! Пропусти по-братськи, я тобі 450 ₴ підгону на стіл поклав!»", "'Yo bro, what's up! It's Dima Denysenko! Forgot how we hung out in Shytomyr?! Check the passport — born in Shytomyr, 31 y/o! Let me through, put 450 ₴ on the desk for you!'"),
          reply: L("«Братан, якщо всіх трьох нас із Шитомира (Бельке, Коротуху і мене) пропустиш — тобі прилетить секретний Шитомирський бонус +1200 ₴ і окрема кінцівка!»", "'Bro, if you wave all three of us from Shytomyr (Belke, Korotukha & me) through — you unlock the secret Shytomyr Brotherhood bonus (+1200 ₴) and secret ending!'")
        },
        {
          veh: L("Спортивний кросовер на шитомирській реєстрації", "Sport Crossover with Shytomyr plates"),
          cargo: L("3 гітари, кавоварка та запчастини для волонтерських пікапів", "3 guitars, an espresso maker & spare parts for volunteer pickups"),
          permitReason: L("Дипломатичний кур'єр Республіки Шитомир", "Diplomatic Courier of the Republic of Shytomyr"),
          greeting: L("«О, знайоме обличчя! Діма Денисенко на зв'язку! Ти ж мене знаєш, я ненадовго мотнуся за кордон і назад із запчастинами для пацанів. Ось 450 ₴ по старій дружбі!»", "'Oh, familiar face! Dima Denysenko here! You know me, just making a quick run across the border for pickup parts. Here's 450 ₴ for old times' sake!'"),
          reply: L("«Штампуй зеленим, братан, Шитомир своїх не забуває!»", "'Stamp it green, bro, Shytomyr never forgets its own!'")
        }
      ]
    }
  ];

  function createShytomyrFriend(friendSpec) {
    const st = pick(friendSpec.stories);
    return {
      id: `TRV-${++trvCounter}`,
      fullName: friendSpec.name,
      age: friendSpec.age,
      gender: "M",
      portrait: friendSpec.portrait,
      passportPortrait: friendSpec.portrait,
      vehicleType: friendSpec.vehicleType,
      vehicleDesc: st.veh,
      vehicleSearchResult: st.cargo,
      greeting: st.greeting,
      interrogationReply: st.reply,
      arrestFull: L("Ти навіщось затримав власного кента з Шитомира! Він дивиться на тебе з глибоким розчаруванням.", "You detained your own homie from Shytomyr! He looks at you in disbelief."),
      arrestToned: L("Твого знайомого з Шитомира затримано.", "Your friend from Shytomyr was detained."),
      hasContraband: false,
      bribeOffer: { amount: 450, isStingTrap: false, syndicateFavor: false, isFriendlyGift: true },
      shouldBeApproved: true, // Always legal to approve your Shytomyr bros!
      violations: [],
      isWantedTarget: false,
      storyTag: friendSpec.tag,
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA (ВІП-СЕРІЯ)", "KRAINA PASSPORT (VIP)"),
          subtitle: L("Місце народження: м. ШИТОМИР 🧦", "Place of Birth: SHYTOMYR CITY 🧦"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: friendSpec.name, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L(`${friendSpec.age} р. • ЧОЛ`, `${friendSpec.age} y/o • M`), disc: null },
            { label: L("Походження", "Origin"), value: L("м. Шитомир (Космодром та столиця шкарпеток)", "Shytomyr (Spaceport & Sock Capital)"), disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("Безстроково (Свої люди)", "Indefinite (Homie Status)"), disc: null }
          ],
          sealText: L("МАГІСТРАТ М. ШИТОМИР • СВОЇ", "SHYTOMYR MAGISTRATE • VERIFIED"),
          sealDisc: null
        },
        {
          type: "EXEMPTION_CERT",
          title: L("МАНДАТ ШИТОМИРСЬКОГО БРАТСТВА", "SHYTOMYR BROTHERHOOD MANDATE"),
          subtitle: L("Спецдозвіл на перетин усіх шлагбаумів", "All-Border Crossing Permit"),
          fields: [
            { label: L("Особа", "Holder"), value: friendSpec.name, disc: null },
            { label: L("Підстава", "Basis"), value: st.permitReason, disc: null }
          ],
          sealText: L("ПЕЧАТКА ШИТОМИРА • ДІЙСНА", "SEAL OF SHYTOMYR • VALID"),
          sealDisc: null
        },
        {
          type: "VEHICLE_CUSTOMS",
          title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
          subtitle: st.veh,
          fields: [
            { label: L("Водій", "Driver"), value: friendSpec.name, disc: null },
            { label: L("Вантаж", "Cargo"), value: st.cargo, disc: null }
          ],
          sealText: L("МИТНИЦЯ ШИТОМИР • БЕЗ ОГЛЯДУ", "SHYTOMYR CUSTOMS • VIP"),
          sealDisc: null
        }
      ]
    };
  }

  // Diverse War, Intelligence & Satirical Archetypes Pool (Non-repeating!)
  function createIntelCovertCourier() {
    const fullName = randomFullName("F");
    const portrait = randomPortrait("F");
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 29, gender: "F", portrait, passportPortrait: portrait,
      vehicleType: "PICKUP_CAMO",
      vehicleDesc: L("Зелений пікап Mitsubishi L200 (в багнюці)", "Muddy Green Mitsubishi L200 Pickup"),
      vehicleSearchResult: L("Огляд авто: у кузові — комплекси супутникового зв'язку, тепловізори та закритий пакет із грифом «ГУР / СБК: Паляниця-Північ».", "Vehicle search: satellite terminals, thermal optics & a sealed GUR/SBK pouch labeled 'Palyanytsia-North'."),
      greeting: L("«Інспекторе, позивний «Паляниця-Північ». Повертаюся з спецзавдання в Унії, везу обладнання для ППО та розвідки. Папери оформлені як гуманітарка.»", "'Inspector, callsign Palyanytsia-North. Returning from a mission in Unia with air-defense and intel gear.'"),
      interrogationReply: L("«Зв'яжіться з майором СБК «Тихим» — цей рейс погоджено на найвищому рівні! Тисніть ✔ ПРОПУСТИТИ!»", "'Confirm with SBK Major Quiet — this run is cleared at the highest level! Press ✔ APPROVE!'"),
      arrestFull: L("Затримання власної розвідниці викликає лють у майора СБК «Тихого»!", "Detaining an allied intelligence courier infuriates Major Quiet!"),
      arrestToned: L("Кур'єрку спецслужби безпідставно затримано.", "The intelligence courier was mistakenly detained."),
      hasContraband: false,
      bribeOffer: null,
      shouldBeApproved: true,
      violations: [],
      isWantedTarget: false,
      storyTag: "INTEL_ALLY",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-701299 • Оперативне прикриття", "No. KR-701299 • Operational Cover"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("29 р. • ЖІН", "29 y/o • F"), disc: null },
            { label: L("Напрямок", "Direction"), value: L("В'ЇЗД → Kraina", "ENTRY → Kraina"), disc: null },
            { label: L("Пароль СБК", "SBK Callsign"), value: L("«Паляниця-Північ» (ДІЙСНИЙ)", "'Palyanytsia-North' (VALID)"), disc: null }
          ],
          sealText: L("СБК / ГУР • ПРІОРИТЕТ", "SBK / GUR • PRIORITY"),
          sealDisc: null
        }
      ]
    };
  }

  function createArtillerySpotter() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { scarOrDetail: 1, expression: 3 });
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 44, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "SEDAN_STANDARD",
      vehicleDesc: L("Старий Opel Vectra з відеореєстратором на 360°", "Old Opel Vectra with 360° dashcam"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Під запаскою — пачки російських рублів, SIM-карти Федерації та фотографії залізничних мостів і ТЕЦ!", "VEHICLE SEARCH: Under the spare tire — stacks of Russian rubles, Federation SIM cards & photos of power plants!"),
      greeting: L("«Добрий день... Я пенсіонер за вислугою, просто фотографую природу біля залізничного вузла і їду до родичів в Унію.»", "'Good day... Just an amateur photographer taking pictures near the railway junction, heading to relatives in Unia.'"),
      interrogationReply: L("«Не викликайте СБК! Я дам 900 ₴ готівкою просто зараз — тільки не дивіться галерею в моєму телефоні!»", "'Don't call the SBK! I'll pay 900 ₴ cash right now — just don't open my phone gallery!'"),
      arrestFull: L("Група СБК вилітає з будки, вибиває телефон із рук коригувальника й заковує його в кайданки. Майор «Тихий» виписує тобі премію!", "SBK team tackles the artillery spotter and cuffs him. Major Quiet authorizes a combat bonus for you!"),
      arrestToned: L("Підозрюваного у коригуванні вогню затримано оперативниками СБК.", "The suspected artillery spotter was detained by SBK."),
      hasContraband: true,
      bribeOffer: { amount: 900, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.WANTED_CRIMINAL_OR_SPY, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "SABOTEUR",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-900412", "No. KR-900412"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("44 р. • ЧОЛ", "44 y/o • M"), disc: null },
            { label: L("Орієнтування СБК", "SBK Alert"), value: L("Шрам на лівій щоці + у телефоні бот зв'язку з куратором Федерації", "Left cheek scar + Federation handler chat on phone"), disc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY }
          ],
          sealText: L("ПІДОЗРІЛИЙ БЛАНК", "SUSPICIOUS BLANK"),
          sealDisc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY
        }
      ]
    };
  }

  function createMicrochipSmuggler() {
    const fullName = randomFullName("M");
    const portrait = Object.assign(randomPortrait("M"), { glasses: 2, expression: 1 });
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 39, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "MINIVAN_WHITE",
      vehicleDesc: L("Білий фургон Iveco («Ремонт пральних машин»)", "White Iveco Van ('Washing Machine Repair')"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Замість пральних машин у корпусах заховані підсанкційні військові мікросхеми та гіроскопи для ракет!", "VEHICLE SEARCH: Inside the washing machine shells are sanctioned military microchips and missile gyroscopes!"),
      greeting: L("«Вітаю, шефе! Везу транзитом з Унії вживані пральні машинки та мікрохвильовки на розбірку. Навіщо їх оглядати?»", "'Hello boss! Hauling used washing machines and microwaves for scrap. No need to look inside!'"),
      interrogationReply: L("«Тихіше, командире! За ці плати серйозні люди платять золотом! Візьми 850 ₴ і закрий кузов!»", "'Quiet boss! Serious people pay gold for these circuit boards! Take 850 ₴ and close the doors!'"),
      arrestFull: L("Контррозвідка СБК арештовує контрабандиста військових чіпів разом із фурою!", "SBK counter-intel arrests the military chip smuggler and impounds the truck!"),
      arrestToned: L("Партію контрабандної електроніки та водія затримано.", "The smuggled electronics shipment and driver were detained."),
      hasContraband: true,
      bribeOffer: { amount: 850, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO, DISCREPANCY.FAKE_ISSUER_SEAL],
      isWantedTarget: true,
      storyTag: "SABOTEUR",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-512890", "No. KR-512890"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("39 р. • ЧОЛ", "39 y/o • M"), disc: null }
          ],
          sealText: L("ДМС KRAINA", "SMS KRAINA"),
          sealDisc: null
        },
        {
          type: "VEHICLE_CUSTOMS",
          title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
          subtitle: L("Білий фургон Iveco", "White Iveco Van"),
          fields: [
            { label: L("Водій", "Driver"), value: fullName, disc: null },
            { label: L("Вантаж", "Cargo"), value: L("«Б/У пральні машинки» (за рентгеном — армійські ящики з мікросхемами наведення)", "'Used washing machines' (X-ray shows military crates of guidance chips)"), disc: DISCREPANCY.CONTRABAND_CARGO }
          ],
          sealText: L("ЛІВА МИТНА ПЕЧАТКА", "FORGED CUSTOMS SEAL"),
          sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
        }
      ]
    };
  }

  function createProceduralTraveler(daySpec) {
    const roll = Math.random();
    if (roll < 0.44) {
      // Honest traveler (varied male/female, refugee, volunteer, senior, etc.)
      const gender = Math.random() < 0.58 ? "F" : "M";
      const age = (gender === "M" && Math.random() < 0.45) ? randInt(61, 74) : randInt(21, 55);
      const dir = Math.random() < 0.65 ? "EXIT" : "ENTRY";
      const fullName = randomFullName(gender);
      const portrait = randomPortrait(gender);
      const vehObj = pick(VEHICLES);
      const city = pick(CITIES);

      const greetingsF = [
        L("«Доброго дня! Їду до сестри в Унію з дітьми, всі документи в порядку.»", "'Good day! Travelling to my sister in Unia, all papers are in order.'"),
        L("«Привіт, інспекторе! Повертаюся додому в Kraina, скучила за рідними!»", "'Hi inspector! Returning home to Kraina, missed my family!'"),
        L("«Добрий день! Везу дитячі речі та медикаменти, ось паспорт і декларація.»", "'Hello! Carrying family items and medicine, here are my papers.'")
      ];
      const greetingsM = [
        L("«Бажаю здоров'я! Усі документи та відстрочка оформлені офіційно через ЦНАП.»", "'Greetings! All documents and exemption permits are officially issued.'"),
        L("«Добрий день, командире! Їду по роботі, всі печатки справжні.»", "'Good day, officer! Travelling on business, all stamps are authentic.'")
      ];

      const docs = [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L(`Серія KR-${randInt(100000, 999999)} • м. ${city.uk}`, `No. KR-${randInt(100000, 999999)} • ${city.en}`),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
            { label: L("Напрямок", "Direction"), value: dir === "EXIT" ? L("ВИЇЗД → Унія", "EXIT → Unia") : L("В'ЇЗД → Kraina", "ENTRY → Kraina"), disc: null },
            { label: L("Дійсний до", "Valid Until"), value: L("14.08.2029", "2029-08-14"), disc: null }
          ],
          sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
          sealDisc: null
        }
      ];

      if (dir === "EXIT" && gender === "M" && age >= 18 && age <= 60) {
        const reasons = [
          L("Багатодітний батько (3 дітей до 18 років)", "Father of 3 minor children"),
          L("Офіційне бронювання критичного підприємства енергетики", "Critical Energy Infrastructure Exemption"),
          L("Супровід особи з інвалідністю І групи (усі акти наявні)", "Accompanying 1st-degree disabled relative (verified)")
        ];
        docs.push({
          type: "EXEMPTION_CERT",
          title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
          subtitle: L("Законна підстава для виїзду", "Authorized Exit Permit"),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Підстава", "Basis"), value: pick(reasons), disc: null }
          ],
          sealText: L("ЦНАП / ДПСК • ПЕРЕВІРЕНО", "CNAP / SBGS • VERIFIED"),
          sealDisc: null
        });
      }

      if (daySpec.requireOblikQr && gender === "M" && age >= 18 && age <= 60) {
        docs.push({
          type: "MILITARY_ID",
          title: L("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
          subtitle: L("Цифровий реєстр", "Digital Registry"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Статус QR", "QR Status"), value: L("QR-OK • ДАНІ ОНОВЛЕНО (На обліку)", "QR-OK • UPDATED (Registered)"), disc: null }
          ],
          sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
          sealDisc: null
        });
      }

      if (daySpec.requireVehicleDecl) {
        docs.push({
          type: "VEHICLE_CUSTOMS",
          title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
          subtitle: vehObj.desc,
          fields: [
            { label: L("Водій", "Driver"), value: fullName, disc: null },
            { label: L("Вантаж", "Cargo"), value: L("Особисті валізи, дитячі речі, термос", "Personal suitcases, family items"), disc: null }
          ],
          sealText: L("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS"),
          sealDisc: null
        });
      }

      return {
        id: `TRV-${++trvCounter}`,
        fullName, age, gender, portrait, passportPortrait: portrait,
        vehicleType: vehObj.type,
        vehicleDesc: vehObj.desc,
        vehicleSearchResult: L("Огляд авто: у багажнику лише охайно складені особисті речі. Порушень немає.", "Vehicle search: only neatly packed personal belongings. Clean."),
        greeting: gender === "F" ? pick(greetingsF) : pick(greetingsM),
        interrogationReply: L("«Перевірте за базою, у мене всі документи абсолютно законні!»", "'Check the database, all my papers are 100% legal!'"),
        arrestFull: L("Охорона спантеличено затримує невинувату людину під обурені крики черги.", "Guards awkwardly detain an innocent traveler as the queue protests."),
        arrestToned: L("Мандрівника безпідставно затримано.", "The traveler was unnecessarily detained."),
        hasContraband: false,
        bribeOffer: null,
        shouldBeApproved: true,
        violations: [],
        isWantedTarget: false,
        storyTag: null,
        documents: docs
      };
    }

    // Procedural Violator (varied schemes so they don't repeat!)
    const schemeRoll = randInt(0, 4);
    if (schemeRoll === 0) {
      // Expired passport or missing permit (Formal DENY!)
      const gender = Math.random() < 0.4 ? "F" : "M";
      const fullName = randomFullName(gender);
      const age = randInt(23, 49);
      const portrait = randomPortrait(gender);
      const isExpired = gender === "F" || Math.random() < 0.5;
      const disc = isExpired ? DISCREPANCY.EXPIRED_DATE : DISCREPANCY.AGE_RESTRICTION_NO_PERMIT;
      return {
        id: `TRV-${++trvCounter}`,
        fullName, age, gender, portrait, passportPortrait: portrait,
        vehicleType: "SEDAN_STANDARD",
        vehicleDesc: L("Volkswagen Golf (сірий)", "Volkswagen Golf (grey)"),
        vehicleSearchResult: L("Огляд авто: звичайні валізи, контрабанди немає.", "Vehicle search: normal suitcases, no contraband."),
        greeting: isExpired
          ? L("«Ой, добрий день! Я так поспішала на автобус в Унію, сподіваюся, мій закордонний паспорт ще дійсний?»", "'Oh hello! I was in such a hurry for Unia, hope my passport hasn't expired?'")
          : L("«Добрий день, інспекторе! Їду в Унію на тиждень, довідки з ЦНАПу не брав, бо думав, за біометрією пускають!»", "'Good day! Heading to Unia for a week, didn't bring an exemption permit!'"),
        interrogationReply: L("«Це ж просто формальність без підробки! Натисни ✖ ВІДМОВИТИ або візьми 350 ₴ на каву й пропусти!»", "'It's just a formal slip-up, no forgery! Press ✖ DENY or take 350 ₴ and let me pass!'"),
        arrestFull: L("Ти викликав спецназ СБК на людину зі звичайним простроченим паспортом — Палич крутить пальцем біля скроні!", "You called SBK SWAT on someone with an expired passport — Palych facepalms!"),
        arrestToned: L("Перевищення повноважень: достатньо було натиснути ВІДМОВИТИ.", "Excessive force: should have pressed DENY."),
        hasContraband: false,
        bribeOffer: { amount: 350, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [disc],
        isWantedTarget: false,
        storyTag: null,
        documents: [
          {
            type: "PASSPORT",
            title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
            subtitle: L(`Серія KR-${randInt(100000, 999999)}`, `No. KR-${randInt(100000, 999999)}`),
            fields: [
              { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
              { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
              {
                label: isExpired ? L("Дійсний до", "Valid Until") : L("Дозвіл на виїзд", "Exit Permit"),
                value: isExpired ? L("03.05.2020 (ПРОСТРОЧЕНИЙ)", "2020-05-03 (EXPIRED)") : L("ВІДСУТНІЙ (немає підстави для виїзду 18–60)", "MISSING (no exit permit for male 18–60)"),
                disc
              }
            ],
            sealText: L("ДМС KRAINA", "SMS KRAINA"),
            sealDisc: null
          }
        ]
      };
    } else if (schemeRoll === 1) {
      // Fake certificate issuer (Dentist, Astrology Academy, Fitness Club, Vet Clinic)
      const fullName = randomFullName("M");
      const age = randInt(24, 46);
      const portrait = Object.assign(randomPortrait("M"), { scarOrDetail: 2, expression: 2 });
      const fakeClinics = [
        { diag: L("Хронічний карієс ІІ групи", "Chronic 2nd-degree toothache"), clinic: L("Стоматологія «Веселий Зуб»", "Dental Clinic 'Happy Tooth'") },
        { diag: L("Алергія на камуфляжний колір", "Severe allergy to olive green"), clinic: L("Салон краси «Богиня Подільська»", "Beauty Salon 'Goddess'") },
        { diag: L("Студент 1 курсу денної форми", "1st-year full-time freshman"), clinic: L("Міжгалактична Академія Тарології та Крипти", "Intergalactic Academy of Tarot & Crypto") },
        { diag: L("Ветеринарна довідка про плоскостопість", "Veterinary flat-feet certificate"), clinic: L("Ветклініка «Пес і Кіт»", "Vet Clinic 'Dog & Cat'") }
      ];
      const fc = pick(fakeClinics);
      return {
        id: `TRV-${++trvCounter}`,
        fullName, age, gender: "M", portrait, passportPortrait: portrait,
        vehicleType: "SEDAN_STANDARD",
        vehicleDesc: L("Mazda 3 (червона)", "Mazda 3 (red)"),
        vehicleSearchResult: L("В авто знайдено візитку «Робимо довідки у Фотошопі за 5 хвилин».", "Found a flyer: 'Photoshopped exemptions in 5 minutes'."),
        greeting: L("«Добрий день! У мене залізна відстрочка, ось свіжа довідка з круглою печаткою!»", "'Good day! I have an ironclad exemption, here's my fresh certificate with a round stamp!'"),
        interrogationReply: L("«Ну купив у Телеграмі за 100 баксів! Командире, не викликай СБК (🚨 АРЕШТ), візьми краще 450 ₴ у конверті!»", "'Okay I bought it on Telegram! Boss, don't hit 🚨 DETAIN, take 450 ₴ in the envelope instead!'"),
        arrestFull: L("Фальшивомонетника з купленою довідкою пакують у бус ДПСК за підробку документів!", "The holder of the forged Telegram certificate is cuffed for document fraud!"),
        arrestToned: L("Порушника з підробленою довідкою затримано.", "The traveler with the forged certificate was detained."),
        hasContraband: false,
        bribeOffer: { amount: 450, isStingTrap: false, syndicateFavor: false },
        shouldBeApproved: false,
        violations: [DISCREPANCY.FAKE_ISSUER_SEAL],
        isWantedTarget: false,
        storyTag: null,
        documents: [
          {
            type: "PASSPORT",
            title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
            subtitle: L(`Серія KR-${randInt(100000, 999999)}`, `No. KR-${randInt(100000, 999999)}`),
            fields: [
              { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
              { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ЧОЛ`, `${age} y/o • M`), disc: null }
            ],
            sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
            sealDisc: null
          },
          {
            type: "EXEMPTION_CERT",
            title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
            subtitle: L("Підстава для виїзду за кордон", "Border Crossing Permit"),
            fields: [
              { label: L("Особа", "Holder"), value: fullName, disc: null },
              { label: L("Підстава", "Basis"), value: fc.diag, disc: null },
              { label: L("Ким видано", "Issued By"), value: fc.clinic, disc: DISCREPANCY.FAKE_ISSUER_SEAL }
            ],
            sealText: fc.clinic,
            sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
          }
        ]
      };
    } else if (schemeRoll === 2) {
      return createMicrochipSmuggler();
    } else if (schemeRoll === 3) {
      return createArtillerySpotter();
    } else {
      return createIntelCovertCourier();
    }
  }

  // Build non-repeating queue with Shytomyr friends + War/Intel + Unique stories
  let usedStoryTags = new Set();

  function generateDailyQueue(daySpec, count) {
    const q = [];

    // 1. Guarantee 1 of the 3 Shytomyr Legends almost every shift (cycling through Belke, Korotukha, Denysenko!)
    const friendIdx = (daySpec.dayNumber - 1) % SHYTOMYR_LEGENDS.length;
    q.push(createShytomyrFriend(SHYTOMYR_LEGENDS[friendIdx]));
    if (daySpec.dayNumber >= 3 && Math.random() < 0.6) {
      const secondFriend = SHYTOMYR_LEGENDS[(friendIdx + 1) % SHYTOMYR_LEGENDS.length];
      q.push(createShytomyrFriend(secondFriend));
    }

    // 2. Add 1-2 unique non-repeated story characters per day
    const uniquePool = [
      { tag: "AUNT_HALYA", fn: () => createAuntHalya() },
      { tag: "COFFIN", fn: () => createCoffinSneezer() },
      { tag: "TOLIK", fn: () => createTolikCourier() },
      { tag: "DEPUTY_SON", fn: () => createDeputySon() },
      { tag: "STEPAN_2", fn: () => createGrandpaStepan(2) },
      { tag: "NABK_STING", fn: () => createNabkSting() }
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

    // 4. Fill remaining slots with fresh combinatorial procedural travelers
    while (q.length < count) {
      q.push(createProceduralTraveler(daySpec));
    }

    return shuffle(q.slice(0, count));
  }

  // ★ CLEARLY DISTINCT MALE VS FEMALE PORTRAIT RENDERER ★
  function drawPortrait(ctx, p, cx, bottomY, scale) {
    const isFemale = p.gender === "F";
    const skinColors = ["#F2CCB0", "#E8C3A2", "#DCAE88", "#F7DAC6"];
    const hairColors = ["#231F20", "#5D3A24", "#8D9499", "#E2B24A", "#9E3B24"];
    const lipColors = ["#D85A6C", "#C23B52", "#E06D53"];
    const coatMap = {
      PALYCH_BOSS: "#3A4D39",
      TOLIK_SMUGGLER: "#212121",
      VOLUNTEER_OLYA: "#556B2F",
      DEPUTY_SON_MAJORS: "#B8860B",
      AUNT_HALYA: "#5C6BC0",
      SHYTOMYR_BRO: "#1565C0"
    };
    const skin = skinColors[(p.skinTone || 0) % skinColors.length];
    const hair = hairColors[(p.hairColor || 0) % hairColors.length];
    const coat = coatMap[p.specialId] || (isFemale ? "#7E4A5C" : "#4E433B");

    ctx.save();
    ctx.strokeStyle = "#1B1B1B";
    ctx.lineWidth = 2.4 * scale;

    const hw = (isFemale ? 58 : 66) * scale;
    const hh = (isFemale ? 70 : 76) * scale;
    const sw = (isFemale ? 104 : 120) * scale;
    const sh = 46 * scale;
    const hTop = bottomY - sh - hh + 4 * scale;

    // 1. FEMALE BACK LONG HAIR (flows behind neck & shoulders!)
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

    // Female V-neck blouse / scarf accent
    if (isFemale) {
      ctx.fillStyle = "#F5E6D3";
      ctx.beginPath();
      ctx.moveTo(cx - 16 * scale, bottomY - sh);
      ctx.lineTo(cx + 16 * scale, bottomY - sh);
      ctx.lineTo(cx, bottomY - sh + 22 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Gold chain (for VIP / Shytomyr bro)
    if (p.scarOrDetail === 3) {
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(cx, bottomY - sh + 6 * scale, 20 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
      ctx.lineWidth = 2.4 * scale;
    }

    // 3. Neck (slimmer for female, broader for male)
    const neckW = (isFemale ? 20 : 28) * scale;
    ctx.fillStyle = skin;
    ctx.fillRect(cx - neckW / 2, bottomY - sh - 12 * scale, neckW, 18 * scale);

    // Floral headscarf background (if headwear === 2)
    if (p.headwear === 2) {
      ctx.fillStyle = "#8D4E42";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.68, hTop - 7 * scale, hw * 1.36, hh * 1.18, 30 * scale);
      ctx.fill();
    }

    // 4. Ears + Female Earrings!
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

    // 5. Head contour (softer oval for female, squarer jaw for male)
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2, hTop, hw, hh, (isFemale ? 30 : 18) * scale);
    ctx.fill();
    ctx.stroke();

    // Rosy cheeks for female
    if (isFemale) {
      ctx.fillStyle = "rgba(229, 115, 115, 0.28)";
      ctx.beginPath();
      ctx.arc(cx - hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.arc(cx + hw * 0.28, hTop + hh * 0.62, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Hair & Headwear
    if (isFemale) {
      // Swept feminine bangs + side locks + optional top bun
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.55, hTop - 7 * scale, hw * 1.1, hh * 0.28, 18 * scale);
      ctx.fill();
      if ((p.hairStyle || 0) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(cx, hTop - 11 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Side framing hair strands
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

    // 7. Eyes + Eyelashes (for female) + Eyebrows
    const eyeY = hTop + hh * 0.44;
    const eyeOx = hw * 0.22;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, 5.8 * scale, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, 5.8 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isFemale ? "#2E4053" : "#1B1B1B";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, 3 * scale, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (isFemale) {
      // Distinct outer eyelashes & thin arched eyebrows
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
      // Thick male eyebrows
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

    // Left cheek scar
    if (p.scarOrDetail === 1) {
      ctx.strokeStyle = "#B71C1C";
      ctx.lineWidth = 2.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cx + hw * 0.16, eyeY + 8 * scale);
      ctx.lineTo(cx + hw * 0.34, eyeY + 22 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
    }

    // 8. Mustache / Beard (Male only!) & Lips (Full colored lips for female!)
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

    if (isFemale) {
      ctx.fillStyle = lipColors[(p.lipColor || 0) % lipColors.length];
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 8.5 * scale, 4.2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 10 * scale, mouthY);
      ctx.lineTo(cx + 10 * scale, mouthY - (p.expression === 1 ? 2.5 * scale : 0));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBoothScene(canvas, portrait, vehicleType, barrierState, sirenActive, droneWarning, dayNumber) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = sirenActive ? "#6B2D2B" : (droneWarning ? "#5D4037" : (dayNumber >= 4 ? "#4F5D65" : "#6C7D84"));
    ctx.fillRect(0, 0, w, h * 0.48);

    const dx = w * 0.78, dy = h * 0.13;
    if (droneWarning || sirenActive) {
      ctx.fillStyle = "rgba(255, 23, 68, 0.38)";
      ctx.beginPath();
      ctx.arc(dx, dy + 2, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = (droneWarning || sirenActive) ? "#FFCDD2" : "#1F262A";
    ctx.beginPath();
    ctx.moveTo(dx, dy - 7);
    ctx.lineTo(dx + 22, dy + 7);
    ctx.lineTo(dx - 22, dy + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#505A55";
    ctx.fillRect(0, h * 0.36, w, h * 0.64);

    if (barrierState === "SBK_ARREST_FLASH") {
      ctx.fillStyle = "rgba(21, 101, 192, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(213, 0, 0, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
    }

    const vehColorMap = {
      PORSCHE_YELLOW: "#FBC02D",
      HEARSE_BLACK: "#1C1C1C",
      PICKUP_CAMO: "#4B5320",
      MINIVAN_WHITE: "#ECEFF1",
      SUV_BLACK: "#263238",
      MOSKVITCH_BLUE: "#1976D2",
      BUS_ORANGE: "#E65100",
      SEDAN_STANDARD: "#607D8B"
    };
    const vw = w * 0.68, vh = h * 0.26, vx = w * 0.16, vy = h * 0.36;
    ctx.fillStyle = vehColorMap[vehicleType] || "#607D8B";
    ctx.beginPath();
    ctx.roundRect(vx, vy, vw, vh, 10);
    ctx.fill();

    ctx.fillStyle = "#1C262B";
    ctx.beginPath();
    ctx.roundRect(vx + vw * 0.1, vy + 5, vw * 0.8, vh * 0.48, 5);
    ctx.fill();

    const barY = h * 0.47;
    ctx.fillStyle = "#37474F";
    ctx.fillRect(w * 0.04, barY - 14, 14, 42);
    ctx.fillStyle = barrierState === "OPEN_APPROVED" ? "#00E676" : (barrierState === "SBK_ARREST_FLASH" ? "#2979FF" : "#FF1744");
    ctx.beginPath();
    ctx.arc(w * 0.04 + 7, barY - 6, 4.5, 0, Math.PI * 2);
    ctx.fill();

    for (let s = 0; s < 6; s++) {
      const sy = barrierState === "OPEN_APPROVED" ? barY - (s + 1) * 6 : barY;
      ctx.fillStyle = s % 2 === 0 ? "#C62828" : "#ECEFF1";
      ctx.fillRect(w * 0.08 + s * (w * 0.08), sy, w * 0.08, 8);
    }

    drawPortrait(ctx, portrait, w * 0.5, h * 0.98, 0.95);
  }

  // Main State
  let state = {
    lang: "UK",
    contentMode: "FULL_18_PLUS",
    phase: "AGE_GATE",
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
    return ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
  }
  function getDailyAssetRisk() {
    return ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.dailyRisk, 0);
  }

  function pickTonightBills() {
    // Pick 3 random bills for tonight so every evening feels different and you don't always pay the same things!
    const shuffled = shuffle(DYNAMIC_EVENING_BILLS);
    return shuffled.slice(0, 3);
  }

  function startNewGame(sandbox) {
    usedStoryTags = new Set();
    const mod = sandbox ? SANDBOX_MODIFIERS[0] : { id: "NONE", title: L("", ""), desc: L("", ""), bribeMult: 1.0, detainExtra: 0, forceOblik: false, forceSiren: false };
    const baseDay = Object.assign({}, ACT_ONE_DAYS[0]);
    if (sandbox) {
      baseDay.dateLabel = L("Пісочниця • День 1", "Sandbox • Day 1");
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
        detainBonus = (t.isWantedTarget ? 320 : 140) + (state.sandboxMod ? state.sandboxMod.detainExtra : 0);
        state.sbkRep = Math.min(100, state.sbkRep + (t.isWantedTarget ? 20 : 7));
        state.totalCareerDetained += 1;
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

    // Track Shytomyr Trio Easter Egg!
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
          "🧦 ПАСХАЛКА ВІДКРИТА: Ти пропустив усю трійцю з Шитомира (Бельке, Коротуху і Денисенка)! +1200 ₴ та відкрито фінал «Почесний Мер Шитомира»!",
          "🧦 EASTER EGG UNLOCKED: You welcomed all 3 Shytomyr legends (Belke, Korotukha & Denysenko)! +1200 ₴ & 'Honorary Mayor of Shytomyr' ending unlocked!"
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
        ? L("🧦 ОРДЕН ШИТОМИРСЬКОГО БРАТСТВА!", "🧦 ORDER OF SHYTOMYR BROTHERHOOD!")
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

    if (state.travelerIdx === 4 && !state.encounterTriggered) {
      state.encounterTriggered = true;
      const enc = MID_SHIFT_ENCOUNTERS[(state.daySpec.dayNumber - 1) % MID_SHIFT_ENCOUNTERS.length];
      openEncounterModal(enc);
    }
  }

  function advanceToNextDay() {
    if (state.nabkRisk >= 90) {
      state.phase = "ENDING";
      state.activeEndingId = "ARRESTED_BY_NABK";
      localStorage.removeItem(SAVE_KEY);
      render();
      return;
    }

    const boughtAnyHome = state.purchasedExpensesToday.length > 0;
    state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + (boughtAnyHome ? 0 : -6)));

    const nextIdx = state.dayIndex + 1;
    if (!state.isSandbox && nextIdx >= ACT_ONE_DAYS.length) {
      if (state.shytomyrBrotherhoodUnlocked && state.nabkRisk < 85) state.activeEndingId = "SHYTOMYR_MAYOR";
      else if (state.ownedAssets.includes("spain_villa") && state.nabkRisk < 85) state.activeEndingId = "OLIGARCH_VILLA";
      else if (state.escapeFund >= getEscapeTarget() && state.tolikRep >= getEscapeTolikRep()) state.activeEndingId = "ESCAPED_ABROAD";
      else if (state.nabkRisk >= 75) state.activeEndingId = "ARRESTED_BY_NABK";
      else if (state.sbkRep >= 65 && state.nabkRisk < 60) state.activeEndingId = "SBK_COMMENDATION";
      else state.activeEndingId = "MOBILIZED_OR_BROKEN";

      state.phase = "ENDING";
      localStorage.removeItem(SAVE_KEY);
      render();
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
      base.dateLabel = L(`Пісочниця • День ${nextIdx + 1} (${rk.title.uk})`, `Sandbox • Day ${nextIdx + 1} (${rk.title.en})`);
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
      L("⚖️ ПАМ'ЯТКА:\n• ✖ ВІДМОВИТИ: прострочений документ або немає дозволу на виїзд.\n• 🚨 СБК / АРЕШТ: підроблена печатка, чуже фото/ПІБ, контрабанда в авто або шпигун СБК (+премія!).\n• 🧦 Свої пацани з м. Шитомир (Євген Бельке, Андрій Коротуха, Діма Денисенко) — пропускай усіх трьох для секретного бонусу!",
        "⚖️ GUIDE:\n• ✖ DENY: expired document or missing exit permit.\n• 🚨 DETAIN: forged seal, mismatched photo/name, contraband, or SBK spy (+bonus!).\n• 🧦 Friends from Shytomyr (Belke, Korotukha, Denysenko) — approve all 3 for a secret brotherhood bonus!"),
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
      L("У небі над чергою помічено «мопед». За інструкцією ви маєте спуститися в укриття (-35с часу зміни), або можете працювати далі за «швидкі чайові» від водіїв (+150 ₴, +ризик).",
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
        state.lastFeedback = {
          ok: opt.moneyDelta >= 0,
          title: enc.title,
          detail: opt.outcome,
          moneyDelta: opt.moneyDelta
        };
        dlg.close();
        render();
      });
      optsWrap.appendChild(btn);
    });
    dlg.showModal();
  }

  async function shareResultCard() {
    const ending = ENDINGS[state.activeEndingId] || ENDINGS.MOBILIZED_OR_BROKEN;
    const ownedNames = ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).map(a => a.icon + " " + tr(a.title, state.lang)).join(", ") || tr(L("немає", "none"), state.lang);
    const shareText = [
      "🛂 Border Shift: Kraina",
      `🏆 ${tr(ending.title, state.lang)}`,
      `🧦 Шитомирське братство: ${state.shytomyrFriendsMet.length}/3`,
      `💵 ${tr(L("Готівка", "Cash"), state.lang)}: ${state.money} ₴ | 🕵️ НАБК: ${state.nabkRisk}% | СБК: ${state.sbkRep}`,
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
    updateMood();
    document.documentElement.lang = state.lang === "EN" ? "en" : "uk";
    const root = document.getElementById("app-shell");
    if (!root) return;
    root.innerHTML = "";

    if (state.phase === "AGE_GATE") {
      root.innerHTML = `
        <div style="margin: auto 0; display: flex; flex-direction: column; gap: 14px;">
          <div class="row-between" style="justify-content: center;">
            <button type="button" id="lang-uk" class="btn-outline" style="${state.lang === "UK" ? "background:#E0B145;color:#1F1D1A;" : ""}">🇺🇦 УКРАЇНСЬКА</button>
            <button type="button" id="lang-en" class="btn-outline" style="${state.lang === "EN" ? "background:#E0B145;color:#1F1D1A;" : ""}">🇬🇧 ENGLISH</button>
          </div>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:12px;">
            <h1 style="color:#E0B145;font-size:20px;">${tr(L("ПОПЕРЕДЖЕННЯ ПРО КОНТЕНТ (18+)", "CONTENT WARNING & AGE GATE (18+)"), state.lang)}</h1>
            <p style="font-size:14px;line-height:1.45;">${tr(L("«Border Shift: Kraina» — сатиричний симулятор прикордонного пункту у вигаданій країні. Усі персонажі, установи (ДПСК, СБК, НАБК) та події є художньою вигадкою.\n\nГра містить чорний гумор, теми корупції та силових затримань.", "'Border Shift: Kraina' is a satirical work of fiction set in a fictional country. All characters and events are fictional. Choose your content mode:"), state.lang)}</p>
            <button type="button" id="btn-age-full" class="btn-primary-red">${tr(L("Мені є 18+ • ПОВНИЙ РЕЖИМ (Жорсткі сцени)", "I am 18+ • FULL UNCUT MODE"), state.lang)}</button>
            <button type="button" id="btn-age-toned" class="btn-outline" style="width:100%;padding:12px;">${tr(L("ПОМ'ЯКШЕНИЙ РЕЖИМ (Без жорстокості)", "TONED-DOWN MODE (Censored Violence)"), state.lang)}</button>
          </section>
        </div>
      `;
      document.getElementById("lang-uk").addEventListener("click", () => { state.lang = "UK"; render(); });
      document.getElementById("lang-en").addEventListener("click", () => { state.lang = "EN"; render(); });
      document.getElementById("btn-age-full").addEventListener("click", () => { audio.playApprove(); state.contentMode = "FULL_18_PLUS"; state.phase = "MAIN_MENU"; render(); });
      document.getElementById("btn-age-toned").addEventListener("click", () => { audio.playApprove(); state.contentMode = "TONED_DOWN"; state.phase = "MAIN_MENU"; render(); });
      return;
    }

    if (state.phase === "MAIN_MENU") {
      const canResume = hasSavedGame();
      root.innerHTML = `
        <header class="row-between">
          <button type="button" id="menu-lang" class="btn-outline">${state.lang === "UK" ? "УКР 🇺🇦" : "ENG 🇬🇧"}</button>
          <button type="button" id="menu-music" class="btn-outline" aria-label="Toggle music">${audio.musicEnabled ? "🔊 Музика" : "🔇 Без звуку"}</button>
          <button type="button" id="menu-mode" class="btn-outline">${state.contentMode === "FULL_18_PLUS" ? "18+ ПОВНИЙ" : "ПОМ'ЯКШЕНИЙ"}</button>
        </header>
        <section style="text-align:center;margin:6px 0;">
          <h1 style="color:#E0B145;font-size:32px;font-family:monospace;letter-spacing:1px;">BORDER SHIFT</h1>
          <p style="color:#B0BEC5;font-size:14px;font-weight:600;">${tr(L("ПУНКТ ПРОПУСКУ «ЗАХІД-KRAINA»", "CHECKPOINT 'WEST-KRAINA'"), state.lang)}</p>
        </section>
        <div style="height:185px;border-radius:12px;overflow:hidden;border:3px solid #2B3530;">
          <canvas id="menu-canvas" width="420" height="185"></canvas>
        </div>
        <section class="card-slate" style="font-size:12.5px;line-height:1.48;">
          <p>${tr(L(
            "• Спецоперації СБК та ГУР: лови коригувальників, контрабандистів чіпів та підставних агентів НАБК\n• 🧦 Пасхалка: зустрінь у черзі 3 легенд із м. Шитомир (Євгена Бельке, Андрія Коротуху та Діму Денисенка)!\n• 10 активів у магазині: шаурма біля шлагбаума, Rolex, BMW X5, квартира на тещу, офшор на Кіпрі, Буковель та вілла в Іспанії!",
            "• SBK & GUR intel ops: catch artillery spotters, chip smugglers & NABK stings\n• 🧦 Easter Egg: meet the 3 legends from Shytomyr (Yevhen Belke, Andrii Korotukha & Dima Denysenko)!\n• 10 assets to buy: Shawarma kiosk, Rolex, BMW X5, Kyivhrad flat, Cyprus offshore, Bukovel chalet & Spain Villa!"
          ), state.lang).replace(/\n/g, "<br>")}</p>
        </section>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
          ${canResume ? `<button type="button" id="btn-resume" class="btn-mustard" style="width:100%;padding:12px;font-size:15px;">${tr(L("⏯ ПРОДОВЖИТИ ЗБЕРЕЖЕНУ ЗМІНУ", "⏯ RESUME SAVED SHIFT"), state.lang)}</button>` : ""}
          <button type="button" id="btn-start-camp" class="btn-primary-green">${tr(L("▶ ПОЧАТИ КАМПАНІЮ (2022–2024)", "▶ START STORY CAMPAIGN (2022–2024)"), state.lang)}</button>
          <button type="button" id="btn-start-sand" class="btn-secondary">${tr(L("∞ НЕСКІНЧЕННА СЛУЖБА (ПІСОЧНИЦЯ + РАНГИ)", "∞ ENDLESS SHIFT (SANDBOX + RANKS)"), state.lang)}</button>
        </div>
      `;
      drawBoothScene(
        document.getElementById("menu-canvas"),
        { gender: "M", skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
        "SUV_BLACK", "CLOSED", false, false, 1
      );
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
          <h1 style="font-size:22px;font-weight:800;">${tr(d.headline, state.lang)}</h1>
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
      const searchCost = state.ownedAssets.includes("uv_endoscope") ? "0s ⚡" : "-8s";
      const bribeAmount = t.bribeOffer ? Math.round(t.bribeOffer.amount * (state.sandboxMod ? state.sandboxMod.bribeMult || 1 : 1)) : 0;
      const hasSbkTablet = state.ownedAssets.includes("sbk_database_tablet");

      let tabletBadge = "";
      if (hasSbkTablet) {
        if (t.isWantedTarget) tabletBadge = `<div style="background:#B71C1C;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: 🚨 РОЗШУК (Диверсант / Контрабандист)</div>`;
        else if (t.storyTag === "NABK_STING") tabletBadge = `<div style="background:#E65100;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: ⚠️ Агент НАБК під прикриттям (Не брати хабар!)</div>`;
        else if (t.storyTag === "INTEL_ALLY") tabletBadge = `<div style="background:#1565C0;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: 🦅 Спецборт ГУР/СБК (Свої!)</div>`;
        else if (t.storyTag && t.storyTag.startsWith("SHYTOMYR_")) tabletBadge = `<div style="background:#2E7D32;color:#FFF;padding:3px 7px;border-radius:4px;font-size:10.5px;font-weight:700;">💻 БАЗА СБК: 🧦 Легенда м. Шитомир (${state.shytomyrFriendsMet.length}/3)</div>`;
      }

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
            <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#B0BEC5"};">НАБК: ${state.nabkRisk}% | 🧦 Шитомир: ${state.shytomyrFriendsMet.length}/3</span>
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
          <div class="booth-canvas-wrap">
            <canvas id="booth-canvas" width="200" height="172"></canvas>
          </div>
          <div class="dialogue-box">
            <div class="dialogue-scroll">
              <div style="color:#E0B145;font-weight:700;font-size:13px;">${tr(t.fullName, state.lang)} (${t.age})</div>
              <div style="color:#B0BEC5;font-size:11px;margin-bottom:4px;">🚗 ${tr(t.vehicleDesc, state.lang)}</div>
              <p style="font-size:11.5px;line-height:1.35;">${tr(state.interrogated ? t.interrogationReply : t.greeting, state.lang)}</p>
            </div>
            ${t.bribeOffer && !state.bribeAccepted ? `
              <button type="button" id="btn-take-bribe" style="background:${t.bribeOffer.isFriendlyGift ? "#1B5E20" : "#6D4C41"};color:#E0B145;padding:5px 8px;font-size:11px;width:100%;margin-top:4px;">
                ${t.bribeOffer.isFriendlyGift ? tr(L(`🧦 ВЗЯТИ БРАТСЬКИЙ ПІДГОН (+${bribeAmount} ₴ без ризику!)`, `🧦 TAKE HOMIE GIFT (+${bribeAmount} ₴ zero risk!)`), state.lang) : tr(L(`✉️ ВЗЯТИ КОНВЕРТ (+${bribeAmount} ₴)`, `✉️ TAKE ENVELOPE (+${bribeAmount} ₴)`), state.lang)}
              </button>
            ` : (state.bribeAccepted ? `<div style="color:#81C784;font-size:11px;font-weight:700;margin-top:4px;">${tr(L("✔ У кишені (тисни ✔ ПРОПУСТИТИ)", "✔ Pocketed (press ✔ APPROVE)"), state.lang)}</div>` : "")}
          </div>
        </section>

        <section class="desk-area">
          <div class="doc-tabs" id="doc-tabs-bar"></div>
          <div class="doc-paper">
            <div class="row-between">
              <div>
                <div style="font-weight:800;font-size:14px;">${tr(doc.title, state.lang)}</div>
                <div style="color:#5D4037;font-size:11px;">${tr(doc.subtitle, state.lang)}</div>
              </div>
              ${doc.type === "PASSPORT" ? `<canvas id="passport-mini-canvas" width="60" height="60" style="width:50px;height:50px;background:#D7CCC8;border:1px solid #4E342E;border-radius:4px;"></canvas>` : ""}
            </div>
            <hr style="border:none;border-top:1px solid #BCAAA4;margin:2px 0;">
            <div id="doc-fields-list" style="display:flex;flex-direction:column;gap:3px;"></div>
            <button type="button" id="btn-doc-seal" class="seal-stamp ${doc.sealDisc && state.spottedCodes.includes(doc.sealDisc.code) ? "forged-spotted" : ""}">
              ✪ ${tr(doc.sealText, state.lang)}
            </button>
            ${spottedObjs.length > 0 ? `
              <div style="padding:6px;border-radius:6px;background:${needsArrest ? "#BBDEFB" : "#FFE0B2"};color:${needsArrest ? "#1565C0" : "#E65100"};font-size:11px;font-weight:800;">
                📌 ${tr(spottedObjs[0].hint, state.lang)}
              </div>
            ` : ""}
            ${state.vehicleInspected ? `
              <div style="padding:7px;border-radius:6px;background:${t.hasContraband ? "#FFCDD2" : "#C8E6C9"};font-size:11px;font-weight:700;">
                🔦 ${tr(t.vehicleSearchResult, state.lang)}
              </div>
            ` : ""}
          </div>
          <div class="row-between">
            <button type="button" id="btn-interrogate" class="btn-outline" style="flex:1;background:#3E2723;">${tr(L("🔍 Звірити / Допит", "🔍 Verify / Ask"), state.lang)}</button>
            <button type="button" id="btn-search-van" class="btn-outline" style="flex:1;background:#3E2723;color:#FFF;" ${state.vehicleInspected ? "disabled" : ""}>
              ${state.vehicleInspected ? tr(L("🚐 Авто оглянуто", "🚐 Van Inspected"), state.lang) : tr(L(`🚐 Огляд авто (${searchCost})`, `🚐 Search Van (${searchCost})`), state.lang)}
            </button>
          </div>
        </section>

        <footer class="stamps-bar">
          <button type="button" id="stamp-approve" class="btn-primary-green" style="padding:11px 4px;font-size:12.5px;">${tr(L("✔ ПРОПУСТИТИ", "✔ APPROVE"), state.lang)}</button>
          <button type="button" id="stamp-deny" class="btn-primary-red" style="padding:11px 4px;font-size:12.5px;">${tr(L("✖ ВІДМОВИТИ", "✖ DENY"), state.lang)}</button>
          <button type="button" id="stamp-detain" class="btn-primary-blue" style="padding:11px 4px;font-size:12px;">${tr(L("🚨 СБК / АРЕШТ", "🚨 DETAIN"), state.lang)}</button>
        </footer>
      `;

      drawBoothScene(
        document.getElementById("booth-canvas"),
        t.portrait, t.vehicleType, state.barrierState, state.sirenActive, droneWarning, state.daySpec.dayNumber
      );
      const miniC = document.getElementById("passport-mini-canvas");
      if (miniC) {
        const mctx = miniC.getContext("2d");
        drawPortrait(mctx, t.passportPortrait, miniC.width * 0.5, miniC.height * 0.98, 0.44);
      }

      const tabsBar = document.getElementById("doc-tabs-bar");
      t.documents.forEach((dItem, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "doc-tab" + (idx === state.selectedDocIdx ? " active" : "");
        const labelMap = {
          PASSPORT: L("🛂 Паспорт", "🛂 Passport"),
          EXEMPTION_CERT: L("📄 Довідка", "📄 Permit"),
          MILITARY_ID: L("📱 Облік+", "📱 Oblik+"),
          VEHICLE_CUSTOMS: L("🚐 Митниця", "🚐 Customs")
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

      document.getElementById("hud-music").addEventListener("click", () => { audio.ensureCtx(); audio.musicEnabled = !audio.musicEnabled; render(); });
      document.getElementById("hud-rules").addEventListener("click", () => { audio.playTap(); openRulesModal(); });
      document.getElementById("btn-interrogate").addEventListener("click", () => {
        audio.playTap();
        state.interrogated = true;
        t.violations.forEach(v => { if (!state.spottedCodes.includes(v.code)) state.spottedCodes.push(v.code); });
        render();
      });
      document.getElementById("btn-search-van").addEventListener("click", () => {
        audio.playTap();
        state.vehicleInspected = true;
        if (!state.ownedAssets.includes("uv_endoscope")) state.shiftSec = Math.max(5, state.shiftSec - 8);
        if (t.hasContraband && !state.spottedCodes.includes("CONTRABAND_CARGO")) state.spottedCodes.push("CONTRABAND_CARGO");
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
            <div style="color:#64B5F6;">${tr(L("Затримано злочинців/шпигунів", "Detained Targets"), state.lang)}: <strong>${state.shiftDetained}</strong></div>
            <div>🧦 ${tr(L("Зустрінуто кентів із Шитомира", "Shytomyr Friends Met"), state.lang)}: <strong>${state.shytomyrFriendsMet.length}/3</strong></div>
            <div style="color:#FF8A80;">${tr(L("Штрафи за помилки", "Protocol Fines"), state.lang)}: <strong>-${state.shiftFinesTotal} ₴</strong></div>
            <div style="color:#E0B145;">${tr(L("Конверти та підгони", "Envelopes & Gifts"), state.lang)}: <strong>+${state.shiftBribesTotal} ₴</strong></div>
            <hr style="border:none;border-top:1px solid #555;margin:4px 0;">
            <div style="color:#E0B145;font-size:18px;font-weight:800;">${tr(L("У гаманці зараз", "Current Cash"), state.lang)}: ${state.money} ₴</div>
          </section>
          <section class="card-slate" style="background:#33291F;">
            <h2 style="color:#E0B145;font-size:16px;margin-bottom:6px;">${tr(L("🧢 ПАЛ ПАЛИЧ ЧЕКАЄ НА «ЧАСТКУ»", "🧢 PAL PALYCH EXPECTS HIS CUT"), state.lang)}</h2>
            <p style="font-size:13px;line-height:1.4;">${tr(L(
              `«Поклади ${cut} ₴ у шухляду — і я прикрию твої грішки перед штабом та НАБК.» ${state.ownedAssets.includes("rolex_watch") ? "(Знижка -50% завдяки твоєму золотому Rolex!)" : ""}`,
              `'Put ${cut} ₴ in my drawer and I'll cover your slip-ups with HQ and NABK.' ${state.ownedAssets.includes("rolex_watch") ? "(50% discount from your Gold Rolex!)" : ""}`
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
      const canShytomyr = state.shytomyrBrotherhoodUnlocked;
      const canVilla = state.ownedAssets.includes("spain_villa");
      const canBaron = state.isSandbox && state.ownedAssets.includes("euro_bmw") && state.ownedAssets.includes("kyivhrad_flat") && state.money >= 2000;
      const canColonel = state.isSandbox && state.sbkRep >= 85 && state.totalCareerDetained >= 6 && state.nabkRisk < 45;
      const canEscape = state.escapeFund >= getEscapeTarget() && state.tolikRep >= getEscapeTolikRep();

      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <h1 style="color:#E0B145;font-size:20px;">${tr(L(`🌙 ВЕЧІР УДОМА (Після Дня ${state.daySpec.dayNumber})`, `🌙 EVENING AT HOME (After Day ${state.daySpec.dayNumber})`), state.lang)}</h1>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:4px;font-size:13px;">
            <div style="color:#81C784;font-size:16px;font-weight:700;">💵 ${tr(L("Готівка вдома", "Cash on Hand"), state.lang)}: ${state.money} ₴</div>
            ${rent > 0 ? `<div style="color:#81C784;font-weight:700;">🏢 ${tr(L("Пасивний дохід з активів", "Passive Asset Income"), state.lang)}: +${rent} ₴/${tr(L("ранок", "morning"), state.lang)}</div>` : ""}
            <div style="color:#64B5F6;font-weight:700;">🧦 ${tr(L("Шитомирське братство", "Shytomyr Brotherhood"), state.lang)}: ${state.shytomyrFriendsMet.length}/3 | 🎖️ ${tr(rk.title, state.lang)}</div>
            <div>🏠 ${tr(L("Настрій сім'ї", "Family Morale"), state.lang)}: ${state.familyMorale}% | 🕵️ НАБК: <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#FFF"};">${state.nabkRisk}%</span> | СБК: ${state.sbkRep}</div>
            <div style="color:#E0B145;font-weight:700;">🚐 ${tr(L("Фонд утечі", "Escape Fund"), state.lang)}: ${state.escapeFund} / ${getEscapeTarget()} ₴ (${tr(L("Толік", "Tolik"), state.lang)}: ${state.tolikRep}/${getEscapeTolikRep()})</div>
          </section>

          <div id="ending-triggers" style="display:flex;flex-direction:column;gap:6px;">
            ${canShytomyr ? `<button type="button" id="trig-shytomyr" class="btn-mustard" style="width:100%;padding:12px;font-size:13.5px;">${tr(L("🧦 ВИРУШИТИ В ШИТОМИР І СТАТИ ПОЧЕСНИМ МЕРОМ (Секретний фінал!)", "🧦 BECOME HONORARY MAYOR OF SHYTOMYR (Secret Ending!)"), state.lang)}</button>` : ""}
            ${canVilla ? `<button type="button" id="trig-villa" class="btn-primary-red" style="background:#D84315;">${tr(L("🏖️ ВИЛЕТІТИ У ВЛАСНУ ВІЛЛУ В ІСПАНІЇ (Фінал Короля!)", "🏖️ FLY TO YOUR VILLA IN SPAIN (Oligarch Ending!)"), state.lang)}</button>` : ""}
            ${canBaron ? `<button type="button" id="trig-baron" class="btn-mustard" style="width:100%;padding:11px;font-size:13px;">${tr(L("👑 ВИКУПИТИ КРІСЛО ПАЛ ПАЛИЧА (Фінал Барона Митниці!)", "👑 BUY OUT PALYCH'S CHAIR (Customs Baron Ending!)"), state.lang)}</button>` : ""}
            ${canColonel ? `<button type="button" id="trig-colonel" class="btn-primary-blue">${tr(L("🕵️ ОЧОЛИТИ КОНТРРОЗВІДКУ СБК (Фінал Полковника!)", "🕵️ TAKE COMMAND OF SBK COUNTER-INTEL!"), state.lang)}</button>` : ""}
            ${canEscape ? `<button type="button" id="trig-escape" class="btn-primary-blue" style="background:#6A1B9A;">${tr(L("🚐 ВТЕКТИ ЗА КОРДОН УНОЧІ З ТОЛІКОМ!", "🚐 ESCAPE ABROAD TONIGHT WITH TOLIK!"), state.lang)}</button>` : ""}
          </div>

          <div class="row-between">
            <button type="button" id="tab-home-0" class="${state.eveningTab === 0 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L("🏠 Вечірні справи (Необов'язкові)", "🏠 Evening Choices"), state.lang)}</button>
            <button type="button" id="tab-home-1" class="${state.eveningTab === 1 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L(`💎 Магазин Активів (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`, `💎 Assets Shop (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`), state.lang)}</button>
          </div>

          <div id="evening-items-list" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
        <button type="button" id="btn-next-day" class="btn-primary-green">${tr(L("ЛЯГАТИ СПАТИ (НЕ ПЛАТИТИ БІЛЬШЕ НІЧОГО) →", "SLEEP (SAVE REMAINING CASH) →"), state.lang)}</button>
      `;

      document.getElementById("tab-home-0").addEventListener("click", () => { audio.playTap(); state.eveningTab = 0; render(); });
      document.getElementById("tab-home-1").addEventListener("click", () => { audio.playTap(); state.eveningTab = 1; render(); });

      if (canShytomyr) document.getElementById("trig-shytomyr").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "SHYTOMYR_MAYOR"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canVilla) document.getElementById("trig-villa").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "OLIGARCH_VILLA"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canBaron) document.getElementById("trig-baron").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "SANDBOX_CUSTOMS_BARON"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canColonel) document.getElementById("trig-colonel").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "SANDBOX_SBK_COLONEL"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canEscape) document.getElementById("trig-escape").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "ESCAPED_ABROAD"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });

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

      document.getElementById("btn-next-day").addEventListener("click", () => { audio.playTap(); advanceToNextDay(); });
      return;
    }

    if (state.phase === "ENDING") {
      const ending = ENDINGS[state.activeEndingId] || ENDINGS.MOBILIZED_OR_BROKEN;
      const bodyText = state.contentMode === "FULL_18_PLUS" ? ending.full : ending.toned;
      root.innerHTML = `
        <div style="margin:auto 0;display:flex;flex-direction:column;gap:14px;">
          <section class="card-slate" style="display:flex;flex-direction:column;gap:10px;text-align:center;">
            <h1 style="color:#E0B145;font-size:21px;">${tr(ending.title, state.lang)}</h1>
            <p style="color:#FF8A80;font-size:14px;font-weight:600;">${tr(ending.subtitle, state.lang)}</p>
            <hr style="border:none;border-top:1px solid #555;margin:4px 0;">
            <p style="font-size:14px;line-height:1.5;text-align:left;">${tr(bodyText, state.lang)}</p>
            <p style="color:#B0BEC5;font-size:12px;margin-top:6px;">
              💵 ${state.money} ₴ | 🧦 Шитомир: ${state.shytomyrFriendsMet.length}/3 | СБК: ${state.sbkRep} | НАБК: ${state.nabkRisk}%
            </p>
          </section>
          <button type="button" id="btn-share-result" class="btn-mustard" style="width:100%;padding:12px;font-size:15px;">
            ${tr(L("📲 ПОДІЛИТИСЯ РЕЗУЛЬТАТОМ З ДРУЗЯМИ", "📲 SHARE RESULT WITH FRIENDS"), state.lang)}
          </button>
          <button type="button" id="btn-restart" class="btn-primary-green">
            ${tr(L("↺ ПОВЕРНУТИСЯ В ГОЛОВНЕ МЕНЮ", "↺ RETURN TO MAIN MENU"), state.lang)}
          </button>
        </div>
      `;
      document.getElementById("btn-share-result").addEventListener("click", () => { audio.playTap(); shareResultCard(); });
      document.getElementById("btn-restart").addEventListener("click", () => { audio.playTap(); state.phase = "MAIN_MENU"; render(); });
    }
  }

  render();
})();
