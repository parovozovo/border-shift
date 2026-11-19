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
