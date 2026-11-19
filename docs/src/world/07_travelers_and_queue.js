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
      coffeeReply: L("«Ой спасибі за кавусю! Тримай 50 🪙 на пиріжок і банку малинового варення для родини!»", "'Bless you for the coffee! Take 50 🪙 for pastries!'"),
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

  function generateDailyQueue(daySpec, count, isSandbox) {
    const q = [];
    const seenNames = new Set();
    const dNum = daySpec ? daySpec.dayNumber : 1;

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
      { tag: "STEPAN_2", minDay: 1, fn: () => createGrandpaStepan(dNum) },
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
