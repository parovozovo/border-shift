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
