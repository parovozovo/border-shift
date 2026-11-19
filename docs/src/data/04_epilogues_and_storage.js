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
