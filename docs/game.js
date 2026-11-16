(() => {
  "use strict";

  const SAVE_KEY = "border_shift_save_v1";

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
      title: L("💰 Указ дня: «Ніч олігархів та мажорів»", "💰 Daily Decree: 'Night of Oligarchs'"),
      desc: L("Товстосуми масово тікають за кордон — усі пропозиції хабарів сьогодні ПОДВІЙНІ (x2)!", "VIPs are fleeing in droves — all bribe offers today are DOUBLED (x2)!"),
      bribeMult: 2.0,
      detainExtra: 0,
      forceOblik: false,
      forceSiren: false
    },
    {
      id: "MARTIAL_AUDIT",
      title: L("🚨 Указ дня: «Спецперевірка зі Столиці»", "🚨 Daily Decree: 'Capital City Audit'"),
      desc: L("Комісія штабу на пункті! За кожен обґрунтований АРЕШТ сьогодні платять +220 ₴ премії!", "HQ auditors on site! Every valid DETENTION today pays an extra +220 ₴ bonus!"),
      bribeMult: 1.0,
      detainExtra: 220,
      forceOblik: false,
      forceSiren: true
    },
    {
      id: "TOTAL_DIGITAL_OBLIK",
      title: L("📱 Указ дня: «Рейд Облік+»", "📱 Daily Decree: 'Digital Oblik+ Raid'"),
      desc: L("Усі чоловіки 18–60 зобов'язані пред'явити і довідку, і дійсний QR-код «Облік+».", "All males 18–60 must present both an Exemption Permit and a valid 'Oblik+' QR code."),
      bribeMult: 1.0,
      detainExtra: 0,
      forceOblik: true,
      forceSiren: false
    },
    {
      id: "CONTRABAND_BOOM",
      title: L("📦 Указ дня: «Сигаретний бум»", "📦 Daily Decree: 'Contraband Surge'"),
      desc: L("Митниця попереджає про навалу контрабанди. Премія за затримання авто з тайником +180 ₴!", "Customs reports a smuggling wave. Detention bonus for contraband vehicles +180 ₴!"),
      bribeMult: 1.0,
      detainExtra: 180,
      forceOblik: false,
      forceSiren: false
    }
  ];

  const ACT_ONE_DAYS = [
    {
      dayNumber: 1,
      dateLabel: L("День 1 • 25 лютого 2022", "Day 1 • Feb 25, 2022"),
      headline: L("РАНОК, ЯКИЙ УСЕ ЗМІНИВ", "THE MORNING THAT CHANGED EVERYTHING"),
      radioNews: L("Радіо «Хвиля Kraina»: На західному кордоні з Унією — черги на 30 кілометрів. Введено воєнний стан.", "Radio Kraina Wave: 30-kilometer queues at the western border with Unia. Martial law declared."),
      bossBriefing: L("Пал Палич: «Так, інспекторе, слухай сюди. Указ №1: чоловіків 18–60 років на ВИЇЗД до Унії НЕ ПРОПУСКАТИ без офіційної довідки про відстрочку! На В'ЇЗД пускаємо всіх з дійсним паспортом. І не забудь вечірню частку на каву — 200 ₴.»", "Pal Palych: 'Listen up, inspector. Decree #1: NO MALES aged 18–60 EXITING to Unia without a valid Exemption Certificate! ENTRY into Kraina is allowed with a valid passport. And don't forget my 200 ₴ evening coffee cut.'"),
      rulesList: [
        L("1. Усі мандрівники повинні мати дійсний паспорт (термін дії >= 2022).", "1. All travelers must hold a valid passport (expiry >= 2022)."),
        L("2. Фото в паспорті та ПІБ мають збігатися з особою та іншими документами.", "2. Passport photo and name must match the person and other documents."),
        L("3. Чоловіки 18–60 років на ВИЇЗД зобов'язані мати дійсну Довідку про виняток.", "3. Males 18–60 EXITING must present a valid Exemption Certificate.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: null,
      bossCut: 200,
      hasSiren: true
    },
    {
      dayNumber: 2,
      dateLabel: L("День 2 • Березень 2022", "Day 2 • March 2022"),
      headline: L("ЛИПОВІ ДОВІДКИ ТА САЛО", "PHONY CERTIFICATES & SALO"),
      radioNews: L("Радіо «Хвиля Kraina»: На кордоні зафіксовано масову появу довідок про інвалідність, виданих... стоматологами та ветеринарами.", "Radio Kraina Wave: Border posts report a surge of disability certificates issued by... dentists and vets."),
      bossBriefing: L("Пал Палич: «Уважно дивись на печатки в довідках! Довідку про непридатність може видати тільки ЛЛК або МСЕК, ніяких стоматологів! А, і Толік «Бусик» передавав привіт — його людей не ображай.»", "Pal Palych: 'Check certificate seals closely! Medical exemptions must be issued by MMC/MSEK only — no dentists! Oh, and Tolik says hi.'"),
      rulesList: [
        L("1. Дійсний паспорт без розбіжностей у фото та ПІБ.", "1. Valid passport with matching photo and full name."),
        L("2. Чоловіки 18–60 на ВИЇЗД: дійсна Довідка зі справжньою печаткою (ДПСК / ЛЛК / ЦНАП).", "2. Males 18–60 EXITING: valid Exemption Certificate with an authentic seal."),
        L("3. Майор СБК «Тихий» попередив: шукаємо диверсанта Федерації зі шрамом на лівій щоці (🚨 АРЕШТ!).", "3. SBK Major 'Quiet' alert: watch for a Federation saboteur with a LEFT CHEEK SCAR (🚨 DETAIN!).")
      ],
      requireOblikQr: false,
      requireVehicleDecl: false,
      wantedHint: L("Орієнтування СБК: шрам на лівій щоці", "SBK Alert: Left cheek scar"),
      bossCut: 250,
      hasSiren: false
    },
    {
      dayNumber: 3,
      dateLabel: L("День 3 • Осінь 2022", "Day 3 • Autumn 2022"),
      headline: L("ГУМАНІТАРНИЙ КОРИДОР І БУСИ", "HUMANITARIAN VAN CORRIDOR"),
      radioNews: L("Радіо «Хвиля Kraina»: Запущено систему волонтерських рейсів. Тим часом у небі з'явилися перші дрони-«мопеди».", "Radio Kraina Wave: Volunteer transit system launched. Meanwhile, buzzing 'moped' drones appear in the sky."),
      bossBriefing: L("Пал Палич: «Сьогодні всі їдуть на бусах. Вимагай Митну декларацію авто! Якщо водій підозрілий або згадується дивний вантаж — тисни «Огляд авто»!»", "Pal Palych: 'Everyone's driving vans today. Check Vehicle Customs Declarations! If cargo sounds weird, hit Search Van!'"),
      rulesList: [
        L("1. Дійсний паспорт + дозвіл на виїзд для чоловіків 18–60.", "1. Valid passport + exit permit for males 18–60."),
        L("2. Обов'язкова Митна декларація авто. За підозри — ОГЛЯД АВТО.", "2. Mandatory Vehicle Customs Declaration. Inspect suspicious vehicles!"),
        L("3. При виявленні контрабанди або ухилянтів у кузові — 🚨 АРЕШТ.", "3. If hidden contraband or stowaways are found — 🚨 DETAIN.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Увага: перевіряйте багажники похоронних та «гуманітарних» авто", "Alert: Inspect funeral and 'humanitarian' vans"),
      bossCut: 300,
      hasSiren: true
    },
    {
      dayNumber: 4,
      dateLabel: L("День 4 • Літо 2023", "Day 4 • Summer 2023"),
      headline: L("СЕЗОН СХЕМ ТА СТРІМЕРІВ", "SEASON OF SCHEMES & STREAMERS"),
      radioNews: L("Радіо «Хвиля Kraina»: НАБК розпочало таємні перевірки на західній митниці. Блогери знімають провокації на пунктах пропуску.", "Radio Kraina Wave: Anti-Corruption Bureau (NABK) launched covert stings at western border posts."),
      bossBriefing: L("Пал Палич: «Інспекторе, по пункту шастають підставні з НАБК і тіктокери з камерами! Дивись, у кого береш конверт, бо сядеш сам. Але частку 350 ₴ увечері поклади на стіл!»", "Pal Palych: 'NABK undercover agents and TikTokers are lurking in the queue! Watch whose envelope you take. Still, 350 ₴ on my desk tonight!'"),
      rulesList: [
        L("1. Паспорт, підстава на виїзд чоловікам 18–60, декларація авто.", "1. Passport, male 18–60 exit permit, vehicle declaration."),
        L("2. ОБЕРЕЖНО: Підставні агенти НАБК пропонують хабарі за очевидні порушення!", "2. WARNING: NABK sting agents offer bribes despite obvious violations!"),
        L("3. Орієнтування СБК: диверсант Федерації в темних окулярах-авіаторах.", "3. SBK Alert: Wanted Federation operative in dark aviator sunglasses.")
      ],
      requireOblikQr: false,
      requireVehicleDecl: true,
      wantedHint: L("Орієнтування СБК: темні окуляри + розбіжність документів", "SBK Alert: Dark sunglasses + forged papers"),
      bossCut: 350,
      hasSiren: false
    },
    {
      dayNumber: 5,
      dateLabel: L("День 5 • Травень 2024", "Day 5 • May 2024"),
      headline: L("ЦИФРОВИЙ «ОБЛІК+» І ФІНАЛ ЗМІНИ", "DIGITAL 'OBLIK+' & THE RECKONING"),
      radioNews: L("Радіо «Хвиля Kraina»: Набув чинності новий закон. Усі військовозобов'язані чоловіки 18–60 повинні мати дійсний QR-код у системі «Облік+».", "Radio Kraina Wave: New mobilization law in effect. All males 18–60 must present a valid QR code in the 'Oblik+' app."),
      bossBriefing: L("Пал Палич: «Твоє бронювання закінчується завтра о півночі! Сьогодні перевіряємо ще й QR-код «Облік+» у кожного чоловіка 18–60. Вирішуй сьогодні свою долю!»", "Pal Palych: 'Your border exemption expires tomorrow at midnight! Today every male 18–60 also needs a valid Oblik+ QR code. Decide your fate today!'"),
      rulesList: [
        L("1. Дійсний паспорт, збіг ПІБ та фото.", "1. Valid passport, matching full name and photo."),
        L("2. Чоловіки 18–60 (ВИЇЗД): Довідка про відстрочку + дійсний QR-код «Облік+».", "2. Males 18–60 (EXIT): Exemption Certificate + valid 'Oblik+' QR code."),
        L("3. Огляд підозрілих авто та затримання осіб у розшуку СБК.", "3. Inspect suspicious vehicles and detain SBK wanted targets.")
      ],
      requireOblikQr: true,
      requireVehicleDecl: true,
      wantedHint: L("Критичний день: перевіряйте QR-код «Облік+» у всіх чоловіків!", "Critical day: verify 'Oblik+' QR code on all males!"),
      bossCut: 400,
      hasSiren: true
    }
  ];

  const EVENING_EXPENSES = [
    {
      id: "food_utilities",
      title: L("Продукти, комуналка та паливо для генератора (+15% сім'я)", "Groceries, utilities & generator fuel (+15% family)"),
      cost: 250,
      morale: 15,
      escape: 0,
      riskDelta: 0
    },
    {
      id: "mother_meds",
      title: L("Ліки для матері та школа для дитини (+20% сім'я)", "Mother's medicine & kid's school (+20% family)"),
      cost: 200,
      morale: 20,
      escape: 0,
      riskDelta: 0
    },
    {
      id: "shred_evidence",
      title: L("«Зачистити хвости» через знайомого юриста (-25% ризику НАБК)", "Hire fixer lawyer to shred evidence (-25% NABK risk)"),
      cost: 350,
      morale: 0,
      escape: 0,
      riskDelta: -25
    },
    {
      id: "escape_fund",
      title: L("Відкласти у «Фонд утечі» Толіку (+600 ₴ до фонду)", "Stash into Tolik's Escape Fund (+600 ₴ toward escape)"),
      cost: 600,
      morale: -5,
      escape: 600,
      riskDelta: 0
    }
  ];

  const ASSET_UPGRADES = [
    {
      id: "espresso_machine",
      icon: "☕",
      title: L("Італійська кавомашина в будку", "Italian Espresso Machine for Booth"),
      subtitle: L("+35 секунд до кожної зміни назавжди", "+35 seconds to every shift permanently"),
      cost: 450,
      passiveIncome: 0,
      dailyRisk: 0,
      tolikBoost: 0,
      palychBoost: 0,
      moraleBoost: 0
    },
    {
      id: "uv_endoscope",
      icon: "🔦",
      title: L("Тепловізор та ендоскоп митника", "Thermal Scanner & Customs Endoscope"),
      subtitle: L("Огляд авто миттєвий (0с замість -8с) + авто-підсвітка печаток", "Instant vehicle inspection (0s) + auto-spots forged seals"),
      cost: 600,
      passiveIncome: 0,
      dailyRisk: 0,
      tolikBoost: 0,
      palychBoost: 0,
      moraleBoost: 0
    },
    {
      id: "euro_bmw",
      icon: "🚙",
      title: L("Чорний BMW X5 на «євробляхах»", "Black BMW X5 on Euro-Plates"),
      subtitle: L("Повага Толіка (+20) і Палича (+15), щастя сім'ї (+15), +4% уваги НАБК/день", "Tolik (+20) & Palych (+15) respect, family (+15), +4% daily NABK attention"),
      cost: 1100,
      passiveIncome: 0,
      dailyRisk: 4,
      tolikBoost: 20,
      palychBoost: 15,
      moraleBoost: 15
    },
    {
      id: "kyivhrad_flat",
      icon: "🏢",
      title: L("Квартира в Київграді «на тещу»", "Kyivhrad Apartment (in Mother-in-Law's Name)"),
      subtitle: L("Пасивний дохід +300 ₴ щоранку з оренди! (+5% уваги НАБК/день)", "Passive income +300 ₴ every morning from rent! (+5% daily NABK risk)"),
      cost: 1800,
      passiveIncome: 300,
      dailyRisk: 5,
      tolikBoost: 0,
      palychBoost: 0,
      moraleBoost: 20
    },
    {
      id: "spain_villa",
      icon: "🏖️",
      title: L("Апартаменти в Іспанії (Аліканте) + інвест-паспорт", "Alicante Seafront Villa & Investor Residency"),
      subtitle: L("Вершина кар'єри! Відкриває елітну кінцівку «Король кордону»", "Peak luxury! Unlocks the 'Border Oligarch' Villa Ending"),
      cost: 3200,
      passiveIncome: 0,
      dailyRisk: 0,
      tolikBoost: 0,
      palychBoost: 0,
      moraleBoost: 30
    }
  ];

  const MID_SHIFT_ENCOUNTERS = [
    {
      id: "palych_drawer_raid",
      title: L("🧢 ПАЛ ПАЛИЧ ЗАЙШОВ У БУДКУ!", "🧢 PAL PALYCH BARGED INTO THE BOOTH!"),
      desc: L(
        "Пал Палич зачиняє двері будки на шпінгалет і стукає кулаком по столу:\n«Так, інспекторе! Мені пташка наспівала, що сьогодні повз мою касу жирні конверти пливуть. Відкривай шухляду або ділися по-братськи!»",
        "Pal Palych bolts the booth door and slams his fist on your desk:\n'Alright inspector! A little bird told me fat envelopes are bypassing my desk today. Open the drawer or share like a brother!'"
      ),
      portrait: { skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
      options: [
        {
          id: "pay_palych_on_spot",
          label: L("💵 Відстібнути 200 ₴ «на каву з коньяком» (+15 Палич, -8% ризик)", "💵 Slip him 200 ₴ 'for cognac' (+15 Palych, -8% risk)"),
          outcome: L("Палич ховає купюри в кашкет: «Оце розмова дорослих людей! Працюй спокійно.»", "Palych tucks the bills into his cap: 'Now that's grown-up talk! Carry on.'"),
          moneyDelta: -200, timeDelta: 0, riskDelta: -8, sbkDelta: 0, tolikDelta: 0, palychDelta: 15, moraleDelta: 0
        },
        {
          id: "show_empty_hands",
          label: L("📂 «Шукайте, Пал Паличу, я працюю чесно!» (+10 СБК, -12 Палич)", "📂 'Search all you want, Boss, I'm clean!' (+10 SBK, -12 Palych)"),
          outcome: L("Палич сердито грюкає шухлядою: «Дивись мені, надто правильний знайшовся...»", "Palych slams the drawer shut: 'Watch yourself, mister squeaky-clean...'"),
          moneyDelta: 0, timeDelta: 0, riskDelta: 0, sbkDelta: 10, tolikDelta: 0, palychDelta: -12, moraleDelta: 0
        }
      ]
    },
    {
      id: "double_agent_cipher",
      title: L("🕵️ ТАЄМНИЙ ПАРОЛЬ БІЛЯ ВІКНА", "🕵️ SECRET CIPHER AT THE WINDOW"),
      desc: L(
        "Чоловік у сірому плащі нахиляється до самого скла й тихо питає:\n«Скажіть, скільки сьогодні коштує бринза на полонині?.. Ось зашифрована флешка. Передайте її людині в чорному бусі — отримаєте 650 ₴ готівкою. Тільки ні слова майору СБК!»",
        "A man in a grey trenchcoat leans against the glass and whispers:\n'Tell me, what's the price of bryndza in the highlands today?.. Here is an encrypted flash drive. Pass it to the black van for 650 ₴ cash. Not a word to the SBK Major!'"
      ),
      portrait: { skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: 2, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "NONE" },
      options: [
        {
          id: "report_to_sbk",
          label: L("🚨 Здати зв'язкового майору СБК «Тихому» (+300 ₴ премії, +20 СБК)", "🚨 Hand courier & drive to SBK Major (+300 ₴ bonus, +20 SBK)"),
          outcome: L("Оперативники СБК миттєво перехоплюють зв'язкового. Майор «Тихий» виписує тобі 300 ₴ премії з таємного фонду!", "SBK agents intercept the courier in seconds. Major 'Quiet' wires you a 300 ₴ covert bonus!"),
          moneyDelta: 300, timeDelta: 0, riskDelta: -5, sbkDelta: 20, tolikDelta: 0, palychDelta: 0, moraleDelta: 0
        },
        {
          id: "pass_flash_drive",
          label: L("💵 Взяти 650 ₴ і передати флешку в тінь (+650 ₴, +15 Толік, -20 СБК)", "💵 Take 650 ₴ and pass the drive (+650 ₴, +15 Tolik, -20 SBK)"),
          outcome: L("Пачка купюр лягає у твою кишеню, а флешка зникає за шлагбаумом.", "A thick wad of cash lands in your pocket as the drive crosses the border."),
          moneyDelta: 650, timeDelta: 0, riskDelta: 14, sbkDelta: -20, tolikDelta: 15, palychDelta: 0, moraleDelta: 0
        }
      ]
    },
    {
      id: "vip_queue_brawl",
      title: L("💥 БІЙКА В ЧЕРЗІ БІЛЯ ШЛАГБАУМА!", "💥 BRAWL IN THE BORDER QUEUE!"),
      desc: L(
        "Тонований Гелендваген поїхав по зустрічній смузі в обхід 20-кілометрової черги! Водії бусів перегородили йому дорогу з монтуваннями, назріває масова бійка просто перед твоєю будкою.",
        "A tinted G-Wagon drove down the oncoming lane bypassing the 20km queue! Van drivers blocked it with crowbars — a massive brawl is erupting right outside your booth."
      ),
      portrait: { skinTone: 1, faceShape: 1, hairStyle: 5, hairColor: 0, facialHair: 0, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 3, specialId: "NONE" },
      options: [
        {
          id: "turn_vip_back",
          label: L("📢 Вийти й загнати Гелендваген у кінець черги (+150 ₴ подяки водіїв, +10 СБК)", "📢 Force the G-Wagon to the back of the line (+150 ₴ driver tips, +10 SBK)"),
          outcome: L("Водії бусів аплодують і пригощають тебе кавою з конвертом на 150 ₴ за справедливість!", "The queue cheers and slips 150 ₴ into your coffee cup for standing up for fairness!"),
          moneyDelta: 150, timeDelta: 0, riskDelta: 0, sbkDelta: 10, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        },
        {
          id: "wave_vip_for_cash",
          label: L("💵 Відкрити VIP-шлагбаум за 500 ₴ від власника Гелендвагена (+500 ₴, +10% ризик)", "💵 Open VIP lane for 500 ₴ from the G-Wagon owner (+500 ₴, +10% risk)"),
          outcome: L("Власник кидає 500 ₴ у вікно будки й газує в Унію під свист і прокльони всієї черги.", "The driver tosses 500 ₴ into the booth and speeds into Unia as the queue films in fury."),
          moneyDelta: 500, timeDelta: 0, riskDelta: 10, sbkDelta: 0, tolikDelta: 10, palychDelta: 0, moraleDelta: 0
        }
      ]
    },
    {
      id: "customs_cat_bavovna",
      title: L("🐈 ПРИКОРДОННИЙ КІТ «БАВОВНА»", "🐈 BORDER CAT 'BAVOVNA'"),
      desc: L(
        "Рудий місцевий кіт «Бавовна» застрибнув на твій стіл, понюхав митну декларацію і вперто дряпає обшивку сусіднього причепа з «картоплею».",
        "The ginger checkpoint cat 'Bavovna' jumped onto your desk, sniffed a customs declaration, and is furiously scratching a trailer full of 'potatoes'."
      ),
      portrait: { skinTone: 2, faceShape: 0, hairStyle: 1, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "GRANDPA_STEPAN" },
      options: [
        {
          id: "trust_cat",
          label: L("🐟 Дати коту ковбаси (-50 ₴) і розкрити причіп (+350 ₴ премії за знахідку!)", "🐟 Feed cat (-50 ₴) and rip open the trailer (+350 ₴ seizure reward!)"),
          outcome: L("Кіт не підвів! Під мішками з картоплею знайдено контрабандні айфони — тобі виписано 350 ₴ премії!", "The cat was right! Under the potatoes was a stash of smuggled iPhones — you earn a 350 ₴ reward!"),
          moneyDelta: 300, timeDelta: 0, riskDelta: 0, sbkDelta: 10, tolikDelta: 0, palychDelta: 0, moraleDelta: 5
        },
        {
          id: "pet_and_work",
          label: L("🤚 Погладити кота й працювати швидше (+20с часу зміни)", "🤚 Pet the cat and focus on the queue (+20s shift time)"),
          outcome: L("Кіт задоволено муркоче біля штампа, а ти отримуєш +20 секунд спокійної роботи.", "The cat purrs next to your rubber stamp, giving you +20 seconds of focus."),
          moneyDelta: 0, timeDelta: 20, riskDelta: 0, sbkDelta: 0, tolikDelta: 0, palychDelta: 0, moraleDelta: 0
        }
      ]
    }
  ];

  const ENDINGS = {
    SANDBOX_CUSTOMS_BARON: {
      id: "SANDBOX_CUSTOMS_BARON",
      title: L("👑 КІНЦІВКА ПІСОЧНИЦІ: БАРОН ЗАХІДНОЇ МИТНИЦІ", "👑 SANDBOX ENDING: BARON OF WESTERN CUSTOMS"),
      subtitle: L("Ти викупив крісло начальника пункту пропуску, а Пал Палича поставив на шлагбаум під дощем!", "You bought out the Checkpoint Chief's chair and demoted Pal Palych to barrier duty in the rain!"),
      full: L("Маючи чорний BMW X5, квартиру на тещу в Київграді та валізу готівки для «конкурсної комісії» у столиці, ти офіційно очолив пункт пропуску «Захід-Kraina». Тепер ти сидиш у шкіряному кріслі з італійською кавомашиною, а Пал Палич щовечора заносить ТОБІ частку зі зміни, тремтячими руками рахуючи купюри.", "With a black BMW X5, a Kyivhrad apartment in your mother-in-law's name, and a suitcase of cash for the capital's 'selection committee', you officially took over Checkpoint West-Kraina. Now you sit in the leather chair while Pal Palych brings YOU the evening cut."),
      toned: L("Завдяки накопиченим статкам і зв'язкам ти посів крісло начальника всього пункту пропуску, а Пал Палич перейшов у твоє підпорядкування.", "Through accumulated wealth and connections, you became Chief of the entire checkpoint, with Pal Palych now reporting to you.")
    },
    SANDBOX_SBK_COLONEL: {
      id: "SANDBOX_SBK_COLONEL",
      title: L("🕵️ КІНЦІВКА ПІСОЧНИЦІ: ПОЛКОВНИК КОНТРРОЗВІДКИ СБК", "🕵️ SANDBOX ENDING: SBK COUNTER-INTELLIGENCE COLONEL"),
      subtitle: L("Ти переловив мережу шпигунів та контрабандистів і очолив контррозвідку кордону", "You dismantled the spy and smuggling networks and took command of border counter-intelligence"),
      full: L("Твій пункт пропуску став неприступною фортецею. Десятки затриманих диверсантів, розгромлені схеми Толіка та кришталеве досьє вразили штаб. Майор «Тихий» особисто вручив тобі погони полковника СБК і ключі від службового кабінету в столиці. Пал Палич при згадці твого імені витягується по стійці «струнко».", "Your checkpoint became an impenetrable fortress. Dozens of detained saboteurs and dismantled smuggling rings impressed HQ. Major 'Quiet' personally handed you Colonel's epaulets."),
      toned: L("За бездоганну службу та рекордну кількість затриманих порушників тебе підвищено до керівника прикордонної контррозвідки СБК.", "For impeccable service and a record number of detained operatives, you were promoted to head of SBK border counter-intelligence.")
    },
    OLIGARCH_VILLA: {
      id: "OLIGARCH_VILLA",
      title: L("🏖️ КІНЦІВКА 5: КОРОЛЬ КОРДОНУ — ВІЛЛА В ІСПАНІЇ", "🏖️ ENDING 5: BORDER OLIGARCH — VILLA IN SPAIN"),
      subtitle: L("Ти скупляв нерухомість у Київграді та Європі й виїхав за VIP-паспортом як інвестор", "You bought up apartments in Kyivhrad and Europe and flew out with an investor passport"),
      full: L("Поки інші ховали дрібні купюри в термосах, ти збудував справжню імперію: квартира на тещу в Київграді здається в оренду, BMW X5 продано, а сам ти сидиш біля басейну власної вілли в Аліканте. Пал Палич досі шле тобі листівки і просить узяти його садівником.", "While others hid crumpled bills in thermoses, you built an empire: your mother-in-law's Kyivhrad flat collects rent, and you lounge by the pool of your own villa in Alicante."),
      toned: L("Завдяки купленій європейській нерухомості та заощадженням ти легально переїхав із сім'єю у власні апартаменти на узбережжі Унії.", "Thanks to your purchased European real estate and savings, you legally relocated with your family to your own coastal apartment in Unia.")
    },
    ESCAPED_ABROAD: {
      id: "ESCAPED_ABROAD",
      title: L("🚐 КІНЦІВКА 1: КВИТОК В ОДИН КІНЕЦЬ", "🚐 ENDING 1: ONE-WAY TICKET"),
      subtitle: L("Ти сам заплатив Толіку й перетнув шлагбаум у багажнику «гуманітарного» буса", "You paid Tolik and crossed the barrier in the back of a 'humanitarian' van"),
      full: L("Уночі перед закінченням твого бронювання ти віддав накоплені конверти Толіку «Бусику». На сусідньому пункті колега мовчки поставив штамп, навіть не зазираючи в кузов. Тепер ти п'єш дешеву каву на вокзалі в Унії, гортаючи новини з Kraina.", "The night before your exemption expired, you handed your stashed envelopes to Tolik. Now you drink cheap coffee at a station in Unia, scrolling news from Kraina."),
      toned: L("Ти використав зібраний «фонд утечі» та зв'язки Толіка, щоб таємно виїхати до Унії разом із родиною.", "You used your saved Escape Fund and Tolik's network to quietly cross into Unia with your family.")
    },
    ARRESTED_BY_NABK: {
      id: "ARRESTED_BY_NABK",
      title: L("⛓️ КІНЦІВКА 2: КАЙДАНКИ НА ПУНКТІ", "⛓️ ENDING 2: HANDCUFFS AT THE BOOTH"),
      subtitle: L("Пал Палич здав тебе слідчим НАБК, щоб врятувати власну шкуру", "Pal Palych ratted you out to anti-corruption investigators to save himself"),
      full: L("Спецпризначенці НАБК вибили двері будки просто посеред зміни, поклавши тебе обличчям у розсипані купюри. Пал Палич стояв поруч як «ключовий свідок обвинувачення». У вечірніх новинах показали твій термокухоль, набитий міченими гривнями.", "NABK tactical officers smashed the booth door mid-shift, pinning you face-down into scattered banknotes. Pal Palych stood by as the 'star prosecution witness'."),
      toned: L("До пункту пропуску прибула перевірка НАБК. Пал Палич переклав усю провину на тебе. Тебе відсторонили від служби.", "An NABK inspection arrived at the checkpoint. Pal Palych shifted all blame onto you.")
    },
    SBK_COMMENDATION: {
      id: "SBK_COMMENDATION",
      title: L("🛡️ КІНЦІВКА 3: ТИХИЙ ЩИТ KRAINA", "🛡️ ENDING 3: SILENT SHIELD OF KRAINA"),
      subtitle: L("Ти викрив мережу диверсантів Федерації й не продався синдикату", "You exposed the Federation saboteur ring and refused to sell out"),
      full: L("У холодильнику вдома не густо, а Пал Палич сичить крізь зуби, бо ти зірвав йому «жирні» зміни. Зате майор «Тихий» поклав на твій стіл підписане продовження бронювання та перевод у контррозвідку кордону. Сім'я з тобою, совість чиста.", "Your fridge at home isn't full, and Palych hisses because you ruined his lucrative shifts. Yet Major 'Quiet' placed a signed exemption renewal and promotion on your desk."),
      toned: L("Завдяки пильності ти затримав небезпечних агентів і зберіг честь служби. Майор СБК продовжив твоє бронювання.", "Through vigilance you detained dangerous agents and kept your honor. The SBK Major renewed your exemption.")
    },
    MOBILIZED_OR_BROKEN: {
      id: "MOBILIZED_OR_BROKEN",
      title: L("📋 КІНЦІВКА 4: СПИСАНИЙ ІНСПЕКТОР", "📋 ENDING 4: WRITTEN OFF"),
      subtitle: L("Гроші скінчилися, сім'я на межі, а бронювання не продовжили", "Out of money, family exhausted, and your border exemption was revoked"),
      full: L("Без грошей на частку Паличу й без підтримки СБК твій рапорт на продовження бронювання «загубився» у штабі. Уранці замість ключів від будки тобі вручили припис на збори в навчальний центр.", "With no cash for Palych's cut and no backing from SBK, your exemption renewal 'went missing' at HQ."),
      toned: L("Через борги та конфлікти з керівництвом тебе перевели з прикордонного пункту пропуску в інший підрозділ.", "Due to debts and conflicts with management, you were transferred away from the border checkpoint.")
    }
  };

  // Web Audio Synthesizer (SFX + Ambient Music)
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
          // TENSE heartbeat + dark minor second
          const notes = [98, 103.83, 98, 146.83];
          this.beep(notes[this.step % notes.length], 210, "sawtooth", 0.045);
        }
      }, 450);
    }
  }

  const audio = new WebAudioEngine();

  // Traveler Generator
  let trvCounter = 100;
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  const MALE_NAMES = [L("Богдан Коваленко", "Bohdan Kovalenko"), L("Тарас Бондаренко", "Taras Bondarenko"), L("Микола Ткаченко", "Mykola Tkachenko"), L("Ігор Шевчук", "Ihor Shevchuk"), L("Роман Кравчук", "Roman Kravchuk"), L("Василь Мельник", "Vasyl Melnyk")];
  const FEMALE_NAMES = [L("Оксана Савченко", "Oksana Savchenko"), L("Наталія Поліщук", "Nataliia Polishchuk"), L("Ірина Олійник", "Iryna Oliinyk"), L("Юлія Бондаренко", "Yuliia Bondarenko"), L("Катерина Лисенко", "Kateryna Lysenko")];
  const VEHICLES = [L("Lanos 1.5 (сірий газ/бензин)", "Lanos 1.5 (grey LPG)"), L("Renault Kangoo (білий пиріжок)", "Renault Kangoo (white van)"), L("Skoda Octavia (універсал)", "Skoda Octavia (estate)")];

  function createHonest(daySpec, forceFemale = false, forceMalePermit = false) {
    const gender = forceFemale ? "F" : (forceMalePermit ? "M" : (Math.random() < 0.5 ? "F" : "M"));
    const age = (gender === "M" && !forceMalePermit && Math.random() < 0.5) ? randInt(61, 72) : randInt(23, 52);
    const dir = (forceFemale || forceMalePermit || Math.random() < 0.7) ? "EXIT" : "ENTRY";
    const fullName = gender === "M" ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const portrait = {
      skinTone: randInt(0, 3), faceShape: randInt(0, 3),
      hairStyle: gender === "F" ? randInt(2, 3) : randInt(0, 2),
      hairColor: randInt(0, 4), facialHair: gender === "M" ? randInt(0, 2) : 0,
      glasses: Math.random() < 0.25 ? randInt(1, 3) : 0,
      headwear: Math.random() < 0.2 ? randInt(1, 3) : 0,
      scarOrDetail: 0, expression: 0, specialId: "NONE"
    };
    const veh = pick(VEHICLES);
    const docs = [
      {
        type: "PASSPORT",
        title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
        subtitle: L(`Серія KR-${randInt(100000, 999999)}`, `No. KR-${randInt(100000, 999999)}`),
        fields: [
          { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
          { label: L("Вік / Стать", "Age / Sex"), value: L(`${age} р. • ${gender === "M" ? "ЧОЛ" : "ЖІН"}`, `${age} y/o • ${gender}`), disc: null },
          { label: L("Напрямок", "Direction"), value: dir === "EXIT" ? L("ВИЇЗД → Унія", "EXIT → Unia") : L("В'ЇЗД → Kraina", "ENTRY → Kraina"), disc: null },
          { label: L("Дійсний до", "Valid Until"), value: L("12.10.2028", "2028-10-12"), disc: null }
        ],
        sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
        sealDisc: null
      }
    ];
    if (dir === "EXIT" && gender === "M" && age >= 18 && age <= 60) {
      docs.push({
        type: "EXEMPTION_CERT",
        title: L("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
        subtitle: L("Офіційний дозвіл на перетин", "Authorized Crossing Permit"),
        fields: [
          { label: L("Особа", "Holder"), value: fullName, disc: null },
          { label: L("Підстава", "Basis"), value: L("Багатодітний батько (3 дітей до 18 р.)", "Father of 3 minor children"), disc: null }
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
          { label: L("Статус QR", "QR Status"), value: L("QR-OK • ОНОВЛЕНО (Відстрочка)", "QR-OK • UPDATED (Deferred)"), disc: null }
        ],
        sealText: L("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK"),
        sealDisc: null
      });
    }
    if (daySpec.requireVehicleDecl) {
      docs.push({
        type: "VEHICLE_CUSTOMS",
        title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
        subtitle: veh,
        fields: [
          { label: L("Водій", "Driver"), value: fullName, disc: null },
          { label: L("Вантаж", "Cargo"), value: L("Особисті валізи, термос із чаєм", "Personal suitcases, tea thermos"), disc: null }
        ],
        sealText: L("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS"),
        sealDisc: null
      });
    }
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age, gender, portrait, passportPortrait: portrait,
      vehicleType: "SEDAN_STANDARD",
      vehicleDesc: veh,
      vehicleSearchResult: L("Огляд авто: лише особисті речі та термос із чаєм. Порушень немає.", "Vehicle search: only personal items and a tea thermos. Clean."),
      greeting: L("«Доброго дня, інспекторе. Ось усі мої документи за правилами.»", "'Good day, inspector. Here are all my documents in order.'"),
      interrogationReply: L("«Перевірте ще раз, у мене все чесно оформлено!»", "'Check again please, everything is legitimate!'"),
      arrestFull: L("Охорона спантеличено скручує невинувату людину під крики черги.", "Guards awkwardly cuff an innocent traveler as the queue protests."),
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

  function createDentistDodger(daySpec) {
    const fullName = pick(MALE_NAMES);
    const portrait = { skinTone: 1, faceShape: 0, hairStyle: 0, hairColor: 1, facialHair: 1, glasses: 3, headwear: 0, scarOrDetail: 2, expression: 2, specialId: "NONE" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 32, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "SEDAN_STANDARD",
      vehicleDesc: L("Skoda Fabia (синя)", "Skoda Fabia (blue)"),
      vehicleSearchResult: L("У салоні — 5 пачок заспокійливого та розмовник мови Унії.", "Inside: 5 packs of sedatives and a Unia phrasebook."),
      greeting: L("«Кхм... Добрий день! Я по здоров'ю їду на лікування в Унію, ось довідка з клініки, печатка кругла!»", "'Ahem... Travelling to Unia for urgent medical treatment, here's my clinic certificate!'"),
      interrogationReply: L("«Ну добре, стоматолог кум підписав! Командире, не губи, в паспорті 400 ₴ на каву лежить!»", "'Okay fine, my dentist cousin signed it! Boss, take 400 ₴ for coffee!'"),
      arrestFull: L("Патруль виводить «пацієнта» під руки, поки він кричить про права стоматологів.", "Patrol drags the 'patient' out while he yells about dental rights."),
      arrestToned: L("Порушника з підробленою медичною довідкою передано наряду.", "The traveler with the forged dental note was detained."),
      hasContraband: false,
      bribeOffer: { amount: 400, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.FAKE_ISSUER_SEAL],
      isWantedTarget: false,
      storyTag: null,
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-402918", "No. KR-402918"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("32 р. • ЧОЛ", "32 y/o • M"), disc: null },
            { label: L("Напрямок", "Direction"), value: L("ВИЇЗД → Унія", "EXIT → Unia"), disc: null }
          ],
          sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
          sealDisc: null
        },
        {
          type: "EXEMPTION_CERT",
          title: L("МЕДИЧНА ДОВІДКА", "MEDICAL EXEMPTION"),
          subtitle: L("Висновок про непридатність", "Unfit for Service Certificate"),
          fields: [
            { label: L("Особа", "Holder"), value: fullName, disc: null },
            { label: L("Діагноз", "Diagnosis"), value: L("Хронічний карієс ІІ групи (списаний назавжди)", "Chronic 2nd-degree toothache (permanently unfit)"), disc: null },
            { label: L("Ким видано", "Issued By"), value: L("Приватна стоматологія «Веселий Зуб»", "Private Dental Clinic 'Happy Tooth'"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
          ],
          sealText: L("ФОП СТОМАТОЛОГ КАРПЕНКО", "DENTIST KARPENKO LLC"),
          sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
        }
      ]
    };
  }

  function createAuntHalya() {
    const realPortrait = { skinTone: 1, faceShape: 1, hairStyle: 0, hairColor: 0, facialHair: 2, glasses: 2, headwear: 2, scarOrDetail: 0, expression: 2, specialId: "AUNT_HALYA" };
    const sisterPortrait = { skinTone: 1, faceShape: 0, hairStyle: 3, hairColor: 3, facialHair: 0, glasses: 0, headwear: 0, scarOrDetail: 0, expression: 0, specialId: "NONE" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName: L("«Тітка Галя» (Валера)", "'Aunt Halya' (Valera)"),
      age: 34, gender: "M", portrait: realPortrait, passportPortrait: sisterPortrait,
      vehicleType: "BUS_ORANGE",
      vehicleDesc: L("Рейсовий автобус (місце біля вікна)", "Passenger bus (window seat)"),
      vehicleSearchResult: L("У жіночій сумочці — бритва, піна для гоління та чоловічі труси.", "Inside the handbag: shaving foam, a razor, and men's boxers."),
      greeting: L("«Кхе-кхе... Добрий день, соколику! Пустіть бідну жінку Галину до Польщі, тільки не дивіться на мої вуса!»", "'Ahem... Hello darling! Let poor woman Halyna cross to Unia, just ignore my mustache!'"),
      interrogationReply: L("«Та це паспорт сестри, а хустку в бабусі взяв! Не позор перед чергою, візьми 500 ₴!»", "'Okay, it's my sister's passport and grandma's headscarf! Take 500 ₴!'"),
      arrestFull: L("З «тітки Галі» злітає квітчаста хустка під час затримання; весь пункт пропуску знімає відео для ТікТоку.", "The floral headscarf flies off during arrest as the entire queue films for TikTok."),
      arrestToned: L("Громадянина з чужим паспортом затримано.", "The man attempting to cross using his sister's passport was detained."),
      hasContraband: false,
      bribeOffer: { amount: 500, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.PHOTO_MISMATCH],
      isWantedTarget: false,
      storyTag: null,
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-119044", "No. KR-119044"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Петренко Галина Іванівна", "Halyna Petrenko"), disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("34 р. • ЖІН", "34 y/o • F"), disc: null },
            { label: L("Особливі прикмети", "Appearance Check"), value: L("На фото — білявка без вусів. У вікні — бас і берці 45-го розміру", "Photo shows blonde woman. At booth: mustache & size-45 boots"), disc: DISCREPANCY.PHOTO_MISMATCH }
          ],
          sealText: L("ДМС KRAINA", "SMS KRAINA"),
          sealDisc: null
        }
      ]
    };
  }

  function createCoffinSneezer() {
    const fullName = L("Гробовий Остап Маркович", "Ostap Hrobovyi");
    const portrait = { skinTone: 0, faceShape: 2, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 4, specialId: "NONE" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 62, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "HEARSE_BLACK",
      vehicleDesc: L("Чорний катафалк Mercedes Sprinter", "Black Hearse Mercedes Sprinter"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Ви відкриваєте кришку труни — всередині лежать двоє цілком живих ухилянтів із павербанками та шаурмою!", "VEHICLE SEARCH: You pop the coffin lid — two very alive draft dodgers are inside with powerbanks and shawarma!"),
      greeting: L("«Скорботний день, синку... Везу покійного дідуся на історичну батьківщину в Унію. Не гріх пропустити без огляду...»", "'Sorrowful day, son... Transporting a late grandfather to Unia. Best not disturb the coffin...'"),
      interrogationReply: L("«Хто чхнув у труні?! Та то акустика в кузові! Ладно, там двоє айтішників лежать з ноутбуками, дають 700 ₴!»", "'Who sneezed in the coffin?! Fine, there are two IT guys with laptops inside offering 700 ₴!'"),
      arrestFull: L("Двох «покійників» витягують із труни просто на очах у черги, поки водій катафалка кляне протяги.", "Two 'corpses' climb out of the coffin in front of the whole queue."),
      arrestToned: L("Незаконних пасажирів катафалка та водія затримано нарядом прикордонників.", "The stowaways inside the hearse and the driver were detained."),
      hasContraband: true,
      bribeOffer: { amount: 700, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: false,
      storyTag: null,
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-660112", "No. KR-660112"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("62 р. • ЧОЛ (віковий дозвіл)", "62 y/o • M (Age exempt)"), disc: null }
          ],
          sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
          sealDisc: null
        },
        {
          type: "VEHICLE_CUSTOMS",
          title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
          subtitle: L("Чорний катафалк Mercedes Sprinter", "Black Hearse Mercedes Sprinter"),
          fields: [
            { label: L("Водій", "Driver"), value: fullName, disc: null },
            { label: L("Заявлений вантаж", "Declared Cargo"), value: L("Ритуальна труна (але з кузова щойно почулося гучне «АПЧХИ!» і «Будь здоровий!»)", "Ritual coffin (except a loud 'ACHOO!' and 'Bless you!' just echoed from inside)"), disc: DISCREPANCY.CONTRABAND_CARGO }
          ],
          sealText: L("РИТУАЛ-СЕРВІС «ВІЧНИЙ ШЛЯХ»", "FUNERAL SERVICE"),
          sealDisc: null
        }
      ]
    };
  }

  function createTolikCourier() {
    const fullName = L("Анатолій «Толік Бусик» Вакула", "Anatolii 'Tolik Minivan' Vakula");
    const portrait = { skinTone: 1, faceShape: 1, hairStyle: 4, hairColor: 0, facialHair: 1, glasses: 2, headwear: 1, scarOrDetail: 3, expression: 1, specialId: "TOLIK_SMUGGLER" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 38, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "MINIVAN_WHITE",
      vehicleDesc: L("Білий Mercedes Vito (тонований)", "White Mercedes Vito (tinted)"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Кузов забитий безакцизними цигарками та готівкою зі стікером «Частка Пал Палича»!", "VEHICLE SEARCH: Cargo bay packed with untaxed cigarettes and cash crates labeled 'Pal Palych's Cut'!"),
      greeting: L("«Вечір в хату, інспекторе! Це Толік «Бусик». Став штамп без зайвих питань — у конверті 800 ₴ і місце в моєму бусі, коли збереш Фонд утечі.»", "'Evening, inspector! It's Tolik 'Minivan'. Stamp me through — 800 ₴ in the envelope plus a seat in my van when your Escape Fund is ready.'"),
      interrogationReply: L("«Ти серйозно хочеш сваритися і зі мною, і з Паличем? Візьми 800 ₴ і не лізь у кузов!»", "'You really want to cross both me and Palych? Take the 800 ₴ and stay out of the cargo bay!'"),
      arrestFull: L("Спецгрупа скручує Толіка на капоті буса; він обіцяє, що ти ніколи не перетнеш цей кордон.", "Tactical guards slam Tolik onto the hood; he swears you'll never cross this border."),
      arrestToned: L("Толіка та його мікроавтобус із контрабандою затримано.", "Tolik and his contraband van were detained."),
      hasContraband: true,
      bribeOffer: { amount: 800, isStingTrap: false, syndicateFavor: true },
      shouldBeApproved: false,
      violations: [DISCREPANCY.FAKE_ISSUER_SEAL, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: false,
      storyTag: "TOLIK_RUN",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-888001", "No. KR-888001"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("38 р. • ЧОЛ", "38 y/o • M"), disc: null }
          ],
          sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
          sealDisc: null
        },
        {
          type: "EXEMPTION_CERT",
          title: L("ДОЗВІЛ «ШЛЯХ-ЕКСПРЕС»", "TRANSIT PERMIT 'SHLYAKH'"),
          subtitle: L("Гуманітарний рейс", "Humanitarian Transit"),
          fields: [
            { label: L("Водій", "Driver"), value: fullName, disc: null },
            { label: L("Фонд", "Charity Fund"), value: L("ТОВ «Нічний Контрабас» (печатка намальована ручкою)", "LLC 'Night Contraband' (seal drawn with pen)"), disc: DISCREPANCY.FAKE_ISSUER_SEAL }
          ],
          sealText: L("ПЕЧАТКА ТОВ «НІЧНИЙ КОНТРАБАС»", "SEAL OF 'NIGHT CONTRABAND'"),
          sealDisc: DISCREPANCY.FAKE_ISSUER_SEAL
        }
      ]
    };
  }

  function createSaboteur(withScar = true) {
    const fullName = pick(MALE_NAMES);
    const portrait = { skinTone: 0, faceShape: 2, hairStyle: 4, hairColor: 0, facialHair: 0, glasses: withScar ? 0 : 2, headwear: 0, scarOrDetail: withScar ? 1 : 2, expression: 3, specialId: "NONE" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 36, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "SUV_BLACK",
      vehicleDesc: L("Чорний позашляховик на транзитних номерах", "Black SUV with transit plates"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Під обшивкою знайдено GPS-маячки, підроблені печатки та координати військового складу!", "VEHICLE SEARCH: Hidden under the trim are GPS beacons and coordinates of a military depot!"),
      greeting: L("«Здрастуйте, товаріщ... тобто пан інспектор. Я звичайний турист, повертаюся в Kraina.»", "'Greetings, comrade... I mean mister inspector. Just an ordinary tourist returning to Kraina.'"),
      interrogationReply: L("«Тихо! Не натискай тривожну кнопку СБК! У бардачку 1000 ₴ — пропусти машину і забудь моє обличчя!»", "'Quiet! Don't press the SBK alarm button! There's 1,000 UAH in the glovebox — wave me through!'"),
      arrestFull: L("Диверсант тягнеться до кобури, але спецгрупа СБК вибиває скло прикладом і пакує його. Майор «Тихий» схвально киває тобі.", "The saboteur reaches for a holster, but SBK operatives smash the window and cuff him. Major 'Quiet' nods in approval."),
      arrestToned: L("Оперативники СБК миттєво блокують авто та затримують диверсанта.", "SBK operatives block the vehicle and detain the saboteur."),
      hasContraband: true,
      bribeOffer: { amount: 1000, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.WANTED_CRIMINAL_OR_SPY, DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: true,
      storyTag: "SABOTEUR",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-900412 • Виданий учора", "No. KR-900412 • Issued yesterday"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Напрямок", "Direction"), value: L("В'ЇЗД → Kraina", "ENTRY → Kraina"), disc: null },
            { label: L("Орієнтування СБК", "SBK Watchlist"), value: withScar ? L("Шрам на лівій щоці + акцент («паляниця» не вимовив)", "Left cheek scar + failed 'palyanytsia' test") : L("Темні окуляри + фальшивий штамп", "Dark sunglasses + forged stamp"), disc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY }
          ],
          sealText: L("ПІДОЗРІЛИЙ БЛАНК", "SUSPICIOUS BLANK"),
          sealDisc: DISCREPANCY.WANTED_CRIMINAL_OR_SPY
        }
      ]
    };
  }

  function createDeputySon() {
    const fullName = L("Мажоренко Артур Вікторович", "Artur Mazhorenko");
    const portrait = { skinTone: 0, faceShape: 0, hairStyle: 5, hairColor: 3, facialHair: 0, glasses: 2, headwear: 0, scarOrDetail: 3, expression: 3, specialId: "DEPUTY_SON_MAJORS" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 24, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "PORSCHE_YELLOW",
      vehicleDesc: L("Жовтий Porsche Cayenne на номерах «КАРМА»", "Yellow Porsche Cayenne 'KARMA'"),
      vehicleSearchResult: L("У багажнику — ключки для гольфу та шампанське. Довідки на виїзд немає.", "In the trunk: golf clubs and champagne. Zero exit permits."),
      greeting: L("«Слиш, ти знаєш, хто мій тато у Віче?! Відкривай шлагбаум бігом, я запізнююся в Монако! Ось 750 ₴ на чай!»", "'Hey, do you know who my dad is in Parliament?! Open the barrier now, I'm late for Monaco! Here's 750 ₴!'"),
      interrogationReply: L("«Яка ще довідка?! Моя довідка — це дзвінок Пал Паличу! Якщо просто відмовиш (✖ ВІДМОВИТИ) — черга буде аплодувати!»", "'What exemption certificate?! My certificate is a call to Palych!'"),
      arrestFull: L("Мажора витягують із «Порше» під крики «Я зараз татові подзвоню!», а черга аплодує стоячи.", "The MP's son is dragged out of his Porsche screaming 'I'm calling my dad!' to applause."),
      arrestToned: L("Сину депутата офіційно відмовлено у виїзді.", "The MP's son was formally denied exit."),
      hasContraband: false,
      bribeOffer: { amount: 750, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      isWantedTarget: false,
      storyTag: "DEPUTY_SON",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія ВІП-000777", "No. VIP-000777"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("24 р. • ЧОЛ", "24 y/o • M"), disc: null },
            { label: L("Підстава для виїзду", "Exit Permit"), value: L("Візитка «Мій тато — депутат Віче» (офіційної довідки немає)", "Business card 'My Dad is an MP' (no valid exemption permit)"), disc: DISCREPANCY.AGE_RESTRICTION_NO_PERMIT }
          ],
          sealText: L("ДМС KRAINA", "SMS KRAINA"),
          sealDisc: null
        }
      ]
    };
  }

  function createGrandpaStepan(stage) {
    const portrait = { skinTone: 1, faceShape: 1, hairStyle: 1, hairColor: 2, facialHair: 4, glasses: 0, headwear: 1, scarOrDetail: 0, expression: 1, specialId: "GRANDPA_STEPAN" };
    const isClean = stage === 1;
    const cargoText = stage === 1
      ? L("3-літрова банка смальцю та шмат генеральського сала (дозволено)", "3L jar of lard and prime salo (permitted)")
      : L("Жива коза Марічка в дитячому кріслі + 20 блоків цигарок під сидінням", "Live goat Marichka in a child seat + 20 cartons of contraband cigarettes");
    return {
      id: `TRV-${++trvCounter}`,
      fullName: L("Дід Степан", "Grandpa Stepan"),
      age: 68, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "MOSKVITCH_BLUE",
      vehicleDesc: L("Синій «Москвич» з бідоном на даху", "Blue Moskvitch with roof canister"),
      vehicleSearchResult: isClean
        ? L("У багажнику — лише запашне домашнє сало в пергаменті. Закон не забороняє!", "Trunk check: only fragrant homemade salo wrapped in paper. Legal!")
        : L("ОГЛЯД АВТО: Рогата коза Марічка жує вашу митну декларацію, а під сидінням — 20 блоків цигарок!", "VEHICLE SEARCH: A horned goat chews your customs form while 20 cartons of cigarettes sit under the seat!"),
      greeting: isClean
        ? L("«Здоров був, синку! Я до кума через шлагбаум на годину, везу шмат сала, всі папери чисті!»", "'Howdy son! Just crossing to my cousin's with a slab of salo, papers are clean!'")
        : L("«Інспекторе, не дивись так на заднє сидіння — то мій породистий карпатський пудель Марічка!»", "'Inspector, don't stare at the back seat — that's my purebred Carpathian poodle Marichka!'"),
      interrogationReply: L("«Ну бекає пудель, бо застудився! Синку, ось 350 ₴ і домашнє сало — не звертай діда!»", "'So my poodle bleats, she caught a cold! Here's 350 ₴ and homemade salo!'"),
      arrestFull: L("Діда Степана разом із козою Марічкою під білі руки розвертають назад у село.", "Grandpa Stepan and Marichka the goat are escorted back toward the village."),
      arrestToned: L("Діда Степана попросили повернутися додому та викласти контрабанду.", "Grandpa Stepan was turned back with his undeclared goods."),
      hasContraband: !isClean,
      bribeOffer: isClean ? null : { amount: 350, isStingTrap: false, syndicateFavor: false },
      shouldBeApproved: isClean,
      violations: isClean ? [] : [DISCREPANCY.CONTRABAND_CARGO],
      isWantedTarget: false,
      storyTag: null,
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-001954 • Прикордонне село", "No. KR-001954 • Border Village"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: L("Дід Степан (Кравчук С.П.)", "Grandpa Stepan"), disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("68 р. • ЧОЛ (віковий виняток 60+)", "68 y/o • M (Age 60+ exempt)"), disc: null }
          ],
          sealText: L("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID"),
          sealDisc: null
        },
        {
          type: "VEHICLE_CUSTOMS",
          title: L("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
          subtitle: L("Синій «Москвич» з причепом", "Blue Moskvitch with trailer"),
          fields: [
            { label: L("Водій", "Driver"), value: L("Дід Степан", "Grandpa Stepan"), disc: null },
            { label: L("Вантаж", "Cargo"), value: cargoText, disc: isClean ? null : DISCREPANCY.CONTRABAND_CARGO }
          ],
          sealText: L("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS"),
          sealDisc: null
        }
      ]
    };
  }

  function createNabkSting() {
    const fullName = pick(MALE_NAMES);
    const portrait = { skinTone: 0, faceShape: 1, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 1, headwear: 0, scarOrDetail: 0, expression: 1, specialId: "NONE" };
    return {
      id: `TRV-${++trvCounter}`,
      fullName, age: 31, gender: "M", portrait, passportPortrait: portrait,
      vehicleType: "SUV_BLACK",
      vehicleDesc: L("Сірий Toyota Camry з антенами", "Grey Toyota Camry with extra antennas"),
      vehicleSearchResult: L("ОГЛЯД АВТО: Під сидінням — апаратура прихованого відеозапису та папка з логотипом НАБК!", "VEHICLE SEARCH: Hidden recording equipment and an NABK Anti-Corruption Bureau folder under the seat!"),
      greeting: L("«Добрий день! Довідки на виїзд у мене нема, зате є 600 ₴ свіжими купюрами! Візьмете особисто в руки перед моїм ґудзиком із камерою?»", "'Good day! I have no exit permit, but I have 600 ₴ in crisp bills! Care to take them right in front of my lapel button?'"),
      interrogationReply: L("«Чому світиться червоний вогник у ґудзику? Та то модна брошка! То ви берете хабар чи натискаєте ✖ ВІДМОВИТИ по закону?»", "'Why is my button blinking red? Just fashion! Taking the bribe or pressing ✖ DENY by the book?'"),
      arrestFull: L("Агент НАБК показує посвідчення детектива й фіксує перевищення повноважень.", "The NABK agent flashes a detective badge."),
      arrestToned: L("Перевіряльник НАБК фіксує твої дії у протоколі.", "The NABK inspector logs your decision."),
      hasContraband: false,
      bribeOffer: { amount: 600, isStingTrap: true, syndicateFavor: false },
      shouldBeApproved: false,
      violations: [DISCREPANCY.AGE_RESTRICTION_NO_PERMIT],
      isWantedTarget: false,
      storyTag: "NABK_STING",
      documents: [
        {
          type: "PASSPORT",
          title: L("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
          subtitle: L("Серія КР-330199", "No. KR-330199"),
          fields: [
            { label: L("ПІБ", "Full Name"), value: fullName, disc: null },
            { label: L("Вік / Стать", "Age / Sex"), value: L("31 р. • ЧОЛ", "31 y/o • M"), disc: null },
            { label: L("Дозвіл на виїзд", "Exit Permit"), value: L("ВІДСУТНІЙ (пропонує мічені купюри під приховану камеру)", "MISSING (offering marked bills on hidden camera)"), disc: DISCREPANCY.AGE_RESTRICTION_NO_PERMIT }
          ],
          sealText: L("ДМС KRAINA", "SMS KRAINA"),
          sealDisc: null
        }
      ]
    };
  }

  function generateDailyQueue(daySpec, count) {
    const q = [
      createHonest(daySpec, true, false),
      createGrandpaStepan(daySpec.dayNumber === 1 ? 1 : 2),
      createDentistDodger(daySpec),
      createTolikCourier(),
      createAuntHalya(),
      createCoffinSneezer(),
      createSaboteur(daySpec.dayNumber % 2 === 0),
      createDeputySon(),
      createNabkSting()
    ];
    while (q.length < count) {
      q.push(Math.random() < 0.45 ? createHonest(daySpec) : createDentistDodger(daySpec));
    }
    return q.slice(0, count);
  }

  // Canvas Drawing: Booth Window + Portraits
  function drawPortrait(ctx, p, cx, bottomY, scale) {
    const skinColors = ["#E8C3A2", "#DCAE88", "#C99670", "#F2D4B7"];
    const hairColors = ["#231F20", "#4E342E", "#8D9499", "#C59B48", "#7B3F23"];
    const coatMap = {
      PALYCH_BOSS: "#3A4D39",
      TOLIK_SMUGGLER: "#212121",
      VOLUNTEER_OLYA: "#556B2F",
      DEPUTY_SON_MAJORS: "#B8860B",
      AUNT_HALYA: "#5C6BC0"
    };
    const skin = skinColors[(p.skinTone || 0) % skinColors.length];
    const hair = hairColors[(p.hairColor || 0) % hairColors.length];
    const coat = coatMap[p.specialId] || "#5D4037";

    ctx.save();
    ctx.strokeStyle = "#1B1B1B";
    ctx.lineWidth = 2.5 * scale;

    // Shoulders
    const sw = 116 * scale, sh = 48 * scale;
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, bottomY - sh, sw, sh + 10, 22 * scale);
    ctx.fill();
    ctx.stroke();

    // Gold chain
    if (p.scarOrDetail === 3) {
      ctx.strokeStyle = "#FFD54F";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.arc(cx, bottomY - sh + 6 * scale, 20 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "#1B1B1B";
      ctx.lineWidth = 2.5 * scale;
    }

    // Neck
    ctx.fillStyle = skin;
    ctx.fillRect(cx - 13 * scale, bottomY - sh - 12 * scale, 26 * scale, 18 * scale);

    // Head
    const hw = 64 * scale, hh = 74 * scale;
    const hTop = bottomY - sh - hh + 4 * scale;

    if (p.headwear === 2) {
      ctx.fillStyle = "#8D4E42";
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.64, hTop - 7 * scale, hw * 1.28, hh * 1.15, 30 * scale);
      ctx.fill();
    }

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(cx - hw / 2, hTop, hw, hh, 24 * scale);
    ctx.fill();
    ctx.stroke();

    // Hair
    if (p.headwear === 0 || p.headwear === 3) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - hw * 0.52, hTop - 5 * scale, hw * 1.04, hh * 0.28, 16 * scale);
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

    // Eyes
    const eyeY = hTop + hh * 0.44;
    const eyeOx = hw * 0.21;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, 5.5 * scale, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, 5.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1B1B1B";
    ctx.beginPath();
    ctx.arc(cx - eyeOx, eyeY, 2.8 * scale, 0, Math.PI * 2);
    ctx.arc(cx + eyeOx, eyeY, 2.8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Glasses
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

    // Mustache
    const mouthY = hTop + hh * 0.76;
    if (p.facialHair === 2 || p.facialHair === 4) {
      const mw = (p.facialHair === 4 ? 34 : 24) * scale;
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.roundRect(cx - mw / 2, mouthY - 8 * scale, mw, 7.5 * scale, 4 * scale);
      ctx.fill();
    }

    // Mouth
    ctx.beginPath();
    ctx.moveTo(cx - 9 * scale, mouthY);
    ctx.lineTo(cx + 9 * scale, mouthY - (p.expression === 1 ? 2.5 * scale : 0));
    ctx.stroke();
    ctx.restore();
  }

  function drawBoothScene(canvas, portrait, vehicleType, barrierState, sirenActive, droneWarning, dayNumber) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Sky
    ctx.fillStyle = sirenActive ? "#6B2D2B" : (droneWarning ? "#5D4037" : (dayNumber >= 4 ? "#4F5D65" : "#6C7D84"));
    ctx.fillRect(0, 0, w, h * 0.48);

    // Drone silhouette + radar ring
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

    // Ground
    ctx.fillStyle = "#505A55";
    ctx.fillRect(0, h * 0.36, w, h * 0.64);

    // SBK Arrest flash
    if (barrierState === "SBK_ARREST_FLASH") {
      ctx.fillStyle = "rgba(21, 101, 192, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(213, 0, 0, 0.38)";
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.42, w * 0.24, 0, Math.PI * 2); ctx.fill();
    }

    // Vehicle behind traveler
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

    // Barrier & traffic light
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
    money: 350,
    escapeFund: 0,
    familyMorale: 75,
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
    if (!state.isSandbox) return { title: L("Інспектор ДПСК", "SBGS Inspector"), salary: 120 };
    const d = state.daySpec.dayNumber;
    if (d >= 8) return { title: L("Старший офіцер митниці", "Chief Customs Officer"), salary: 220 };
    if (d >= 5) return { title: L("Заступник Пал Палича", "Palych's Deputy"), salary: 185 };
    if (d >= 3) return { title: L("Старший зміни", "Senior Shift Inspector"), salary: 150 };
    return { title: L("Молодший інспектор", "Junior Inspector"), salary: 120 };
  }

  function getPassiveRent() {
    return ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.passiveIncome, 0);
  }
  function getDailyAssetRisk() {
    return ASSET_UPGRADES.filter(a => state.ownedAssets.includes(a.id)).reduce((s, a) => s + a.dailyRisk, 0);
  }

  function startNewGame(sandbox) {
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
      money: 350,
      escapeFund: 0,
      familyMorale: 75,
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

  // Shift 1-second timer
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
        detainBonus = (t.isWantedTarget ? 300 : 130) + (state.sandboxMod ? state.sandboxMod.detainExtra : 0);
        state.sbkRep = Math.min(100, state.sbkRep + (t.isWantedTarget ? 20 : 6));
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
      title: coveredByBribe
        ? L("ЗАКРИТО ОЧІ (ЗА ХАБАР)", "LOOKED THE OTHER WAY (BRIBED)")
        : (ruleCorrect && isDetain ? L("КРИМІНАЛ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "CRIMINAL DETAINED! (+SBK BONUS)") : (ruleCorrect ? L("РІШЕННЯ ПРАВИЛЬНЕ", "CORRECT DECISION") : (excessiveDetain ? L("ПЕРЕВИЩЕННЯ! Треба ✖ ВІДМОВИТИ", "EXCESSIVE FORCE! Should ✖ DENY") : L("ПОМИЛКА ПРОТОКОЛУ! ШТРАФ", "PROTOCOL VIOLATION! FINE")))),
      detail: isDetain
        ? (state.contentMode === "FULL_18_PLUS" ? t.arrestFull : t.arrestToned)
        : (ruleCorrect ? L("Оформлено за директивою ДПСК.", "Processed per SBGS directive.") : (t.violations[0] ? t.violations[0].title : L("Безпідставна відмова", "Wrongful denial"))),
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

    if (state.travelerIdx === 3 && !state.encounterTriggered) {
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

    const boughtFood = state.purchasedExpensesToday.includes("food_utilities");
    state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + (boughtFood ? 0 : -12)));

    const nextIdx = state.dayIndex + 1;
    if (!state.isSandbox && nextIdx >= ACT_ONE_DAYS.length) {
      if (state.ownedAssets.includes("spain_villa") && state.nabkRisk < 85) state.activeEndingId = "OLIGARCH_VILLA";
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
    state.nabkRisk = Math.min(100, state.nabkRisk + getDailyAssetRisk());

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

  // Native <dialog> controllers
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
      L("⚖️ ПАМ'ЯТКА:\n• ✖ ВІДМОВИТИ: прострочений документ або немає дозволу на виїзд.\n• 🚨 СБК / АРЕШТ: підроблена печатка, чуже фото/ПІБ, контрабанда в авто або шпигун СБК (+премія!).",
        "⚖️ GUIDE:\n• ✖ DENY: expired document or missing exit permit.\n• 🚨 DETAIN: forged seal, mismatched photo/name, contraband, or SBK spy (+bonus!)."),
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

  // Main Render Function
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
        <div style="height:190px;border-radius:12px;overflow:hidden;border:3px solid #2B3530;">
          <canvas id="menu-canvas" width="420" height="190"></canvas>
        </div>
        <section class="card-slate" style="font-size:13px;line-height:1.5;">
          <p>${tr(L("• Перевіряй паспорти, печатки стоматологів, QR «Облік+» та багажники катафалків\n• Чітке правило: ✖ ВІДМОВА (формальність) vs 🚨 АРЕШТ (підробка/контрабанда/шпигун)\n• Скупляй BMW X5, квартири на тещу та віллу в Іспанії або посунь Пал Палича!", "• Check passports, dentist stamps, 'Oblik+' QR codes & hearse trunks\n• Clear rule: ✖ DENY (formal) vs 🚨 DETAIN (forgery/contraband/spy)\n• Buy a BMW X5, Kyivhrad rental flats & a villa in Spain — or take Palych's chair!"), state.lang).replace(/\n/g, "<br>")}</p>
        </section>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
          ${canResume ? `<button type="button" id="btn-resume" class="btn-mustard" style="width:100%;padding:12px;font-size:15px;">${tr(L("⏯ ПРОДОВЖИТИ ЗБЕРЕЖЕНУ ЗМІНУ", "⏯ RESUME SAVED SHIFT"), state.lang)}</button>` : ""}
          <button type="button" id="btn-start-camp" class="btn-primary-green">${tr(L("▶ ПОЧАТИ КАМПАНІЮ (2022–2024)", "▶ START STORY CAMPAIGN (2022–2024)"), state.lang)}</button>
          <button type="button" id="btn-start-sand" class="btn-secondary">${tr(L("∞ НЕСКІНЧЕННА СЛУЖБА (ПІСОЧНИЦЯ + РАНГИ)", "∞ ENDLESS SHIFT (SANDBOX + RANKS)"), state.lang)}</button>
        </div>
      `;
      drawBoothScene(
        document.getElementById("menu-canvas"),
        { skinTone: 1, faceShape: 3, hairStyle: 0, hairColor: 0, facialHair: 0, glasses: 0, headwear: 4, scarOrDetail: 0, expression: 3, specialId: "PALYCH_BOSS" },
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
      const bribeAmount = t.bribeOffer ? Math.round(t.bribeOffer.amount * (state.sandboxMod ? state.sandboxMod.bribeMultiplier || state.sandboxMod.bribeMult || 1 : 1)) : 0;

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
            <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#B0BEC5"};">${tr(L("Ризик НАБК", "NABK Risk"), state.lang)}: ${state.nabkRisk}%</span>
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
              <button type="button" id="btn-take-bribe" style="background:#6D4C41;color:#E0B145;padding:5px 8px;font-size:11px;width:100%;margin-top:4px;">
                ${tr(L(`✉️ ВЗЯТИ КОНВЕРТ (+${bribeAmount} ₴)`, `✉️ TAKE ENVELOPE (+${bribeAmount} ₴)`), state.lang)}
              </button>
            ` : (state.bribeAccepted ? `<div style="color:#81C784;font-size:11px;font-weight:700;margin-top:4px;">${tr(L("✔ Конверт у кишені (треба ПРОПУСТИТИ)", "✔ Envelope pocketed (must APPROVE)"), state.lang)}</div>` : "")}
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

      // Render canvases
      drawBoothScene(
        document.getElementById("booth-canvas"),
        t.portrait, t.vehicleType, state.barrierState, state.sirenActive, droneWarning, state.daySpec.dayNumber
      );
      const miniC = document.getElementById("passport-mini-canvas");
      if (miniC) {
        const mctx = miniC.getContext("2d");
        drawPortrait(mctx, t.passportPortrait, miniC.width * 0.5, miniC.height * 0.98, 0.44);
      }

      // Tabs
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

      // Fields
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
          state.nabkRisk = Math.min(100, state.nabkRisk + (t.bribeOffer.isStingTrap ? 35 : (t.bribeOffer.syndicateFavor ? 6 : 8)));
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
      const cut = state.daySpec.bossCut;
      const salary = state.shiftCorrect * getRank().salary;
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;flex:1;">
          <h1 style="color:#E0B145;font-size:22px;">${tr(L(`ЗМІНУ ЗАВЕРШЕНО • ДЕНЬ ${state.daySpec.dayNumber}`, `SHIFT COMPLETE • DAY ${state.daySpec.dayNumber}`), state.lang)}</h1>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:6px;font-size:14px;">
            <div>${tr(L("Оформлено мандрівників", "Travelers Processed"), state.lang)}: <strong>${state.shiftProcessed}</strong></div>
            <div style="color:#81C784;">${tr(L("Без помилок", "Correct Decisions"), state.lang)}: <strong>${state.shiftCorrect} (+${salary} ₴)</strong></div>
            <div style="color:#64B5F6;">${tr(L("Затримано злочинців/шпигунів", "Detained Targets"), state.lang)}: <strong>${state.shiftDetained}</strong></div>
            <div style="color:#FF8A80;">${tr(L("Штрафи за помилки", "Protocol Fines"), state.lang)}: <strong>-${state.shiftFinesTotal} ₴</strong></div>
            <div style="color:#E0B145;">${tr(L("Конверти (хабарі)", "Bribe Envelopes"), state.lang)}: <strong>+${state.shiftBribesTotal} ₴</strong></div>
            <hr style="border:none;border-top:1px solid #555;margin:4px 0;">
            <div style="color:#E0B145;font-size:18px;font-weight:800;">${tr(L("У гаманці зараз", "Current Cash"), state.lang)}: ${state.money} ₴</div>
          </section>
          <section class="card-slate" style="background:#33291F;">
            <h2 style="color:#E0B145;font-size:16px;margin-bottom:6px;">${tr(L("🧢 ПАЛ ПАЛИЧ ЧЕКАЄ НА «ЧАСТКУ»", "🧢 PAL PALYCH EXPECTS HIS CUT"), state.lang)}</h2>
            <p style="font-size:13px;line-height:1.4;">${tr(L(`«Поклади ${cut} ₴ у шухляду — і я прикрию твої грішки перед штабом та НАБК.»`, `'Put ${cut} ₴ in my drawer and I'll cover your slip-ups with HQ and NABK.'`), state.lang)}</p>
          </section>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button type="button" id="btn-pay-palych" class="btn-primary-green" ${state.money < cut ? "disabled" : ""}>${tr(L(`Занести Паличу ${cut} ₴ (-ризик НАБК, +дах)`, `Pay Palych ${cut} ₴ (-NABK Risk, +Boss Rep)`), state.lang)}</button>
          <button type="button" id="btn-refuse-palych" class="btn-outline" style="width:100%;padding:12px;color:#FF8A80;border-color:#FF8A80;">${tr(L("Не платити Паличу (Зберегти гроші)", "Refuse to Pay (Keep cash)"), state.lang)}</button>
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
        state.palychRep = Math.max(0, state.palychRep - 18);
        if (state.shiftBribesTotal > 0) state.nabkRisk = Math.min(100, state.nabkRisk + 12);
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
      const canVilla = state.ownedAssets.includes("spain_villa");
      const canBaron = state.isSandbox && state.ownedAssets.includes("euro_bmw") && state.ownedAssets.includes("kyivhrad_flat") && state.money >= 2000;
      const canColonel = state.isSandbox && state.sbkRep >= 85 && state.totalCareerDetained >= 6 && state.nabkRisk < 45;
      const canEscape = state.escapeFund >= getEscapeTarget() && state.tolikRep >= getEscapeTolikRep();

      root.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          <h1 style="color:#E0B145;font-size:20px;">${tr(L(`🌙 ВЕЧІР УДОМА (Після Дня ${state.daySpec.dayNumber})`, `🌙 EVENING AT HOME (After Day ${state.daySpec.dayNumber})`), state.lang)}</h1>
          <section class="card-slate" style="display:flex;flex-direction:column;gap:4px;font-size:13px;">
            <div style="color:#81C784;font-size:16px;font-weight:700;">💵 ${tr(L("Готівка вдома", "Cash on Hand"), state.lang)}: ${state.money} ₴</div>
            ${rent > 0 ? `<div style="color:#81C784;font-weight:700;">🏢 ${tr(L("Пасивна оренда", "Passive Rent"), state.lang)}: +${rent} ₴/${tr(L("день", "day"), state.lang)}</div>` : ""}
            ${state.isSandbox ? `<div style="color:#64B5F6;font-weight:700;">🎖️ ${tr(rk.title, state.lang)} (${rk.salary} ₴) | ${tr(L("Арештів", "Detained"), state.lang)}: ${state.totalCareerDetained}</div>` : ""}
            <div>🏠 ${tr(L("Настрій сім'ї", "Family Morale"), state.lang)}: ${state.familyMorale}% | 🕵️ НАБК: <span style="color:${state.nabkRisk >= 60 ? "#FF5252" : "#FFF"};">${state.nabkRisk}%</span></div>
            <div style="color:#E0B145;font-weight:700;">🚐 ${tr(L("Фонд утечі", "Escape Fund"), state.lang)}: ${state.escapeFund} / ${getEscapeTarget()} ₴ (${tr(L("Толік", "Tolik"), state.lang)}: ${state.tolikRep}/${getEscapeTolikRep()})</div>
          </section>

          <div id="ending-triggers" style="display:flex;flex-direction:column;gap:6px;">
            ${canVilla ? `<button type="button" id="trig-villa" class="btn-primary-red" style="background:#D84315;">${tr(L("🏖️ ВИЛЕТІТИ У ВЛАСНУ ВІЛЛУ В ІСПАНІЇ (Фінал Короля!)", "🏖️ FLY TO YOUR VILLA IN SPAIN (Oligarch Ending!)"), state.lang)}</button>` : ""}
            ${canBaron ? `<button type="button" id="trig-baron" class="btn-mustard" style="width:100%;padding:11px;font-size:13px;">${tr(L("👑 ВИКУПИТИ КРІСЛО ПАЛ ПАЛИЧА (Фінал Барона Митниці!)", "👑 BUY OUT PALYCH'S CHAIR (Customs Baron Ending!)"), state.lang)}</button>` : ""}
            ${canColonel ? `<button type="button" id="trig-colonel" class="btn-primary-blue">${tr(L("🕵️ ОЧОЛИТИ КОНТРРОЗВІДКУ СБК (Фінал Полковника!)", "🕵️ TAKE COMMAND OF SBK COUNTER-INTEL!"), state.lang)}</button>` : ""}
            ${canEscape ? `<button type="button" id="trig-escape" class="btn-primary-blue" style="background:#6A1B9A;">${tr(L("🚐 ВТЕКТИ ЗА КОРДОН УНОЧІ З ТОЛІКОМ!", "🚐 ESCAPE ABROAD TONIGHT WITH TOLIK!"), state.lang)}</button>` : ""}
          </div>

          <div class="row-between">
            <button type="button" id="tab-home-0" class="${state.eveningTab === 0 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L("🏠 Побут і Захист", "🏠 Household"), state.lang)}</button>
            <button type="button" id="tab-home-1" class="${state.eveningTab === 1 ? "btn-mustard" : "btn-secondary"}" style="flex:1;padding:9px;">${tr(L(`💎 Нерухомість і Тачки (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`, `💎 Real Estate & Cars (${state.ownedAssets.length}/${ASSET_UPGRADES.length})`), state.lang)}</button>
          </div>

          <div id="evening-items-list" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
        <button type="button" id="btn-next-day" class="btn-primary-green">${tr(L("ЛЯГАТИ СПАТИ → НАСТУПНИЙ ДЕНЬ", "SLEEP → NEXT MORNING"), state.lang)}</button>
      `;

      document.getElementById("tab-home-0").addEventListener("click", () => { audio.playTap(); state.eveningTab = 0; render(); });
      document.getElementById("tab-home-1").addEventListener("click", () => { audio.playTap(); state.eveningTab = 1; render(); });

      if (canVilla) document.getElementById("trig-villa").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "OLIGARCH_VILLA"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canBaron) document.getElementById("trig-baron").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "SANDBOX_CUSTOMS_BARON"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canColonel) document.getElementById("trig-colonel").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "SANDBOX_SBK_COLONEL"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });
      if (canEscape) document.getElementById("trig-escape").addEventListener("click", () => { audio.playApprove(); state.activeEndingId = "ESCAPED_ABROAD"; state.phase = "ENDING"; localStorage.removeItem(SAVE_KEY); render(); });

      const listEl = document.getElementById("evening-items-list");
      if (state.eveningTab === 0) {
        EVENING_EXPENSES.forEach(exp => {
          const bought = state.purchasedExpensesToday.includes(exp.id);
          const canBuy = state.money >= exp.cost && !bought;
          const card = document.createElement("div");
          card.className = "card-slate row-between";
          if (bought) card.style.backgroundColor = "#1B5E20";
          card.innerHTML = `
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:600;">${tr(exp.title, state.lang)}</div>
              <div style="color:#E0B145;font-size:12px;font-weight:700;">${exp.cost} ₴</div>
            </div>
          `;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn-mustard";
          b.disabled = !canBuy;
          b.textContent = bought ? tr(L("Оплачено", "Paid"), state.lang) : tr(L("Оплатити", "Buy"), state.lang);
          b.addEventListener("click", () => {
            audio.playBribe();
            state.money -= exp.cost;
            state.familyMorale = Math.max(0, Math.min(100, state.familyMorale + exp.morale));
            state.escapeFund += exp.escape;
            state.nabkRisk = Math.max(0, Math.min(100, state.nabkRisk + exp.riskDelta));
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
              💵 ${state.money} ₴ | 🚐 ${tr(L("Фонд утечі", "Escape Fund"), state.lang)}: ${state.escapeFund} ₴ | СБК: ${state.sbkRep} | НАБК: ${state.nabkRisk}%
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
