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
