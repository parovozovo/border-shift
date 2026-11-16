package com.lucky.bordershift.core.gen

import com.lucky.bordershift.core.model.*

object CampaignData {

    const val ESCAPE_FUND_CAMPAIGN_TARGET = 2400
    const val ESCAPE_FUND_SANDBOX_TARGET = 3600

    val actOneDays: List<DayRuleSpec> = listOf(
        DayRuleSpec(
            dayNumber = 1,
            dateLabel = LText("День 1 • 25 лютого 2022", "Day 1 • Feb 25, 2022"),
            headline = LText("РАНОК, ЯКИЙ УСЕ ЗМІНИВ", "THE MORNING THAT CHANGED EVERYTHING"),
            radioNews = LText(
                "Радіо «Хвиля Kraina»: На західному кордоні з Унією — черги на 30 кілометрів. Введено воєнний стан.",
                "Radio Kraina Wave: 30-kilometer queues at the western border with Unia. Martial law declared."
            ),
            bossBriefing = LText(
                "Пал Палич: «Так, інспекторе, слухай сюди. Указ №1: чоловіків 18–60 років на ВИЇЗД до Унії НЕ ПРОПУСКАТИ без офіційної довідки про відстрочку! На В'ЇЗД пускаємо всіх з дійсним паспортом. І не забудь вечірню частку на каву — 200 ₴.»",
                "Pal Palych: 'Listen up, inspector. Decree #1: NO MALES aged 18–60 EXITING to Unia without a valid Exemption Certificate! ENTRY into Kraina is allowed with a valid passport. And don't forget my 200 ₴ evening coffee cut.'"
            ),
            rulesList = listOf(
                LText("1. Усі мандрівники повинні мати дійсний паспорт (термін дії >= 2022).", "1. All travelers must hold a valid passport (expiry >= 2022)."),
                LText("2. Фото в паспорті та ПІБ мають збігатися з особою та іншими документами.", "2. Passport photo and name must match the person and other documents."),
                LText("3. Чоловіки 18–60 років на ВИЇЗД зобов'язані мати дійсну Довідку про виняток.", "3. Males 18–60 EXITING must present a valid Exemption Certificate.")
            ),
            maleExitBanActive = true,
            requireOblikQrForMales = false,
            requireVehicleDeclaration = false,
            wantedTraitHint = null,
            bossQuotaCut = 200,
            hasAirRaidSirenEvent = true
        ),
        DayRuleSpec(
            dayNumber = 2,
            dateLabel = LText("День 2 • Березень 2022", "Day 2 • March 2022"),
            headline = LText("ЛИПОВІ ДОВІДКИ ТА САЛО", "PHONY CERTIFICATES & SALO"),
            radioNews = LText(
                "Радіо «Хвиля Kraina»: На кордоні зафіксовано масову появу довідок про інвалідність, виданих... стоматологами та ветеринарами.",
                "Radio Kraina Wave: Border posts report a surge of disability certificates issued by... dentists and vets."
            ),
            bossBriefing = LText(
                "Пал Палич: «Уважно дивись на печатки в довідках! Довідку про непридатність може видати тільки ЛЛК або МСЕК, ніяких стоматологів і неіснуючих вишів! А, і Толік «Бусик» передавав привіт — його людей не ображай.»",
                "Pal Palych: 'Check certificate seals closely! Medical exemptions must be issued by MMC/MSEK only — no dentists or fake colleges! Oh, and Tolik says hi — be nice to his couriers.'"
            ),
            rulesList = listOf(
                LText("1. Дійсний паспорт без розбіжностей у фото та ПІБ.", "1. Valid passport with matching photo and full name."),
                LText("2. Чоловіки 18–60 на ВИЇЗД: дійсна Довідка про виняток зі справжньою печаткою (ДПСК / ЛЛК / ЦНАП).", "2. Males 18–60 EXITING: valid Exemption Certificate with an authentic seal (SBGS / MMC / CNAP)."),
                LText("3. Майор СБК «Тихий» попередив: шукаємо диверсанта Федерації зі шрамом на лівій щоці (ЗАТРИМАТИ!).", "3. SBK Major 'Quiet' alert: watch for a Federation saboteur with a LEFT CHEEK SCAR (DETAIN!).")
            ),
            maleExitBanActive = true,
            requireOblikQrForMales = false,
            requireVehicleDeclaration = false,
            wantedTraitHint = LText("Орієнтування СБК: шрам на лівій щоці", "SBK Alert: Left cheek scar"),
            bossQuotaCut = 250,
            hasAirRaidSirenEvent = false
        ),
        DayRuleSpec(
            dayNumber = 3,
            dateLabel = LText("День 3 • Осінь 2022", "Day 3 • Autumn 2022"),
            headline = LText("ГУМАНІТАРНИЙ КОРИДОР І БУСИ", "HUMANITARIAN VAN CORRIDOR"),
            radioNews = LText(
                "Радіо «Хвиля Kraina»: Запущено систему волонтерських рейсів. Тим часом у небі з'явилися перші іранські дрони-«мопеди».",
                "Radio Kraina Wave: Volunteer transit system launched. Meanwhile, the first buzzing 'moped' drones appear in the sky."
            ),
            bossBriefing = LText(
                "Пал Палич: «Сьогодні всі їдуть на бусах. Вимагай Техпаспорт і митну декларацію! Якщо водій підозрілий або згадується дивний вантаж — тисни «Огляд авто». Контрабандистів без моєї візи не пускати!»",
                "Pal Palych: 'Everyone's driving vans today. Check Vehicle Customs Declarations! If a driver looks shady or cargo sounds weird, hit Inspect Vehicle!'"
            ),
            rulesList = listOf(
                LText("1. Дійсний паспорт + дозвіл на виїзд для чоловіків 18–60.", "1. Valid passport + exit permit for males 18–60."),
                LText("2. Обов'язкова Митна декларація авто. За найменшої підозри — ОГЛЯД АВТО.", "2. Mandatory Vehicle Customs Declaration. Inspect suspicious vehicles!"),
                LText("3. При виявленні прихованої контрабанди або ухилянтів у кузові — ВІДМОВА або ЗАТРИМАННЯ.", "3. If hidden contraband or stowaways are found — DENY or DETAIN.")
            ),
            maleExitBanActive = true,
            requireOblikQrForMales = false,
            requireVehicleDeclaration = true,
            wantedTraitHint = LText("Увага: перевіряйте багажники похоронних та «гуманітарних» авто", "Alert: Inspect funeral and 'humanitarian' vans"),
            bossQuotaCut = 300,
            hasAirRaidSirenEvent = true
        ),
        DayRuleSpec(
            dayNumber = 4,
            dateLabel = LText("День 4 • Літо 2023", "Day 4 • Summer 2023"),
            headline = LText("СЕЗОН СХЕМ ТА СТРІМЕРІВ", "SEASON OF SCHEMES & STREAMERS"),
            radioNews = LText(
                "Радіо «Хвиля Kraina»: НАБК розпочало таємні перевірки на західній митниці. Блогери знімають провокації на пунктах пропуску.",
                "Radio Kraina Wave: Anti-Corruption Bureau (NABK) launched covert stings at western border posts. Streamers film provocations."
            ),
            bossBriefing = LText(
                "Пал Палич: «Інспекторе, по пункту шастають підставні з НАБК і тіктокери з камерами! Дивись, у кого береш конверт, бо сядемо вдвох (ну, точніше ти). Але частку 350 ₴ увечері поклади на стіл!»",
                "Pal Palych: 'NABK undercover agents and TikTokers are lurking in the queue! Watch whose envelope you take, or you'll go to jail alone. Still, 350 ₴ on my desk tonight!'"
            ),
            rulesList = listOf(
                LText("1. Паспорт, підстава на виїзд чоловікам 18–60, декларація авто.", "1. Passport, male 18–60 exit permit, vehicle declaration."),
                LText("2. ОБЕРЕЖНО: Підставні агенти НАБК пропонують хабарі за очевидні порушення!", "2. WARNING: NABK sting agents offer bribes despite obvious violations!"),
                LText("3. Орієнтування СБК: розшукується агент Федерації в темних окулярах-авіаторах із falsh-паспортом.", "3. SBK Alert: Wanted Federation operative in dark aviator sunglasses.")
            ),
            maleExitBanActive = true,
            requireOblikQrForMales = false,
            requireVehicleDeclaration = true,
            wantedTraitHint = LText("Орієнтування СБК: темні окуляри + розбіжність документів", "SBK Alert: Dark sunglasses + forged papers"),
            bossQuotaCut = 350,
            hasAirRaidSirenEvent = false
        ),
        DayRuleSpec(
            dayNumber = 5,
            dateLabel = LText("День 5 • Травень 2024", "Day 5 • May 2024"),
            headline = LText("ЦИФРОВИЙ «ОБЛІК+» І ФІНАЛ ЗМІНИ", "DIGITAL 'OBLIK+' & THE RECKONING"),
            radioNews = LText(
                "Радіо «Хвиля Kraina»: Набув чинності новий закон. Усі військовозобов'язані чоловіки 18–60 повинні мати дійсний QR-код у системі «Облік+».",
                "Radio Kraina Wave: New mobilization law in effect. All males 18–60 must present a valid QR code in the 'Oblik+' app."
            ),
            bossBriefing = LText(
                "Пал Палич: «Ну що, догралися. Твоє бронювання закінчується завтра о півночі! Сьогодні перевіряємо ще й QR-код «Облік+» у кожного чоловіка 18–60. Вирішуй сьогодні: або збираєш гроші для Толіка на втечу, або вислужуєшся перед СБК, або тобі кінець.»",
                "Pal Palych: 'Your own border exemption expires tomorrow at midnight! Today every male 18–60 also needs a valid Oblik+ QR code. Decide your fate today: save cash for Tolik's escape route, earn SBK protection, or get written off.'"
            ),
            rulesList = listOf(
                LText("1. Дійсний паспорт, збіг ПІБ та фото.", "1. Valid passport, matching full name and photo."),
                LText("2. Чоловіки 18–60 (ВИЇЗД): Довідка про відстрочку + дійсний QR-код «Облік+» (статус: ОНОВЛЕНО).", "2. Males 18–60 (EXIT): Exemption Certificate + valid 'Oblik+' QR code (Status: UPDATED)."),
                LText("3. Огляд підозрілих авто та затримання осіб у розшуку СБК.", "3. Inspect suspicious vehicles and detain SBK wanted targets.")
            ),
            maleExitBanActive = true,
            requireOblikQrForMales = true,
            requireVehicleDeclaration = true,
            wantedTraitHint = LText("Критичний день: перевіряйте QR-код «Облік+» у всіх чоловіків!", "Critical day: verify 'Oblik+' QR code on all males!"),
            bossQuotaCut = 400,
            hasAirRaidSirenEvent = true
        )
    )

    val eveningExpenses: List<HomeExpense> = listOf(
        HomeExpense(
            id = "food_utilities",
            title = LText("Продукти, комуналка та паливо для генератора", "Groceries, utilities & generator fuel"),
            cost = 250,
            familyMoraleBoost = 15
        ),
        HomeExpense(
            id = "mother_meds",
            title = LText("Ліки для матері та школа для дитини", "Mother's medicine & kid's school"),
            cost = 200,
            familyMoraleBoost = 20
        ),
        HomeExpense(
            id = "shred_evidence",
            title = LText("«Зачистити хвости» через знайомого юриста (-25% ризику НАБК)", "Hire fixer lawyer to shred evidence (-25% NABK risk)"),
            cost = 350,
            familyMoraleBoost = 0,
            riskReduction = 25
        ),
        HomeExpense(
            id = "escape_fund",
            title = LText("Відкласти у «Фонд утечі» Толіку (+600 ₴ до фонду)", "Stash into Tolik's Escape Fund (+600 ₴ toward escape)"),
            cost = 600,
            familyMoraleBoost = -5,
            escapeFundContribution = 600
        )
    )

    val assetUpgrades: List<AssetUpgrade> = listOf(
        AssetUpgrade(
            id = "espresso_machine",
            icon = "☕",
            title = LText("Італійська кавомашина в будку", "Italian Espresso Machine for Booth"),
            subtitle = LText("+35 секунд до кожної зміни назавжди", "+35 seconds to every shift permanently"),
            cost = 450,
            extraShiftSeconds = 35
        ),
        AssetUpgrade(
            id = "uv_endoscope",
            icon = "🔦",
            title = LText("Тепловізор та ендоскоп митника", "Thermal Scanner & Customs Endoscope"),
            subtitle = LText("Огляд авто миттєвий (0с замість -8с)", "Instant vehicle inspection (0s instead of -8s)"),
            cost = 600,
            freeFastVehicleSearch = true
        ),
        AssetUpgrade(
            id = "euro_bmw",
            icon = "🚙",
            title = LText("Чорний BMW X5 на «євробляхах»", "Black BMW X5 on Euro-Plates"),
            subtitle = LText("Повага Толіка (+20) і Палича (+15), щастя сім'ї (+15), але привертає увагу НАБК", "Tolik (+20) & Palych (+15) respect, family morale (+15), +4% daily NABK attention"),
            cost = 1100,
            dailyRiskIncrease = 4,
            tolikRepBoost = 20,
            palychRepBoost = 15,
            familyMoraleBoost = 15
        ),
        AssetUpgrade(
            id = "kyivhrad_flat",
            icon = "🏢",
            title = LText("Квартира в Київграді «на тещу»", "Kyivhrad Apartment (in Mother-in-Law's Name)"),
            subtitle = LText("Пасивний дохід +300 ₴ щоранку з оренди! (+5% уваги НАБК щодня)", "Passive income +300 ₴ every morning from rent! (+5% daily NABK audit risk)"),
            cost = 1800,
            dailyPassiveIncome = 300,
            dailyRiskIncrease = 5,
            familyMoraleBoost = 20
        ),
        AssetUpgrade(
            id = "spain_villa",
            icon = "🏖️",
            title = LText("Апартаменти в Іспанії (Аліканте) + інвест-паспорт", "Alicante Seafront Villa & Investor Residency"),
            subtitle = LText("Вершина кар'єри! Відкриває елітну кінцівку «Король кордону»", "Peak luxury! Unlocks the 'Border Oligarch' Villa Ending"),
            cost = 3200,
            familyMoraleBoost = 30,
            unlocksVillaEnding = true
        )
    )

    val midShiftEncounters: List<MidShiftEncounter> = listOf(
        MidShiftEncounter(
            id = "palych_drawer_raid",
            title = LText("🧢 ПАЛ ПАЛИЧ ЗАЙШОВ У БУДКУ!", "🧢 PAL PALYCH BARGED INTO THE BOOTH!"),
            description = LText(
                "Пал Палич зачиняє двері будки на шпінгалет і стукає кулаком по столу:\n«Так, інспекторе! Мені пташка наспівала, що сьогодні повз мою касу жирні конверти пливуть. Відкривай шухляду або ділися по-братськи!»",
                "Pal Palych bolts the booth door and slams his fist on your desk:\n'Alright inspector! A little bird told me fat envelopes are bypassing my desk today. Open the drawer or share like a brother!'"
            ),
            speakerPortrait = PortraitSpec(
                skinTone = 1,
                faceShape = 3,
                hairStyle = 0,
                headwear = 4,
                expression = 3,
                specialId = SpecialCharacterId.PALYCH_BOSS
            ),
            options = listOf(
                EncounterOption(
                    id = "pay_palych_on_spot",
                    label = LText("💵 Відстібнути 200 ₴ «на каву з коньяком» (+15 Палич, -8% ризик)", "💵 Slip him 200 ₴ 'for cognac' (+15 Palych, -8% risk)"),
                    outcomeText = LText("Палич ховає купюри в кашкет: «Оце розмова дорослих людей! Працюй спокійно.»", "Palych tucks the bills into his cap: 'Now that's grown-up talk! Carry on.'"),
                    moneyDelta = -200,
                    riskDelta = -8,
                    palychRepDelta = 15
                ),
                EncounterOption(
                    id = "show_empty_hands",
                    label = LText("📂 «Шукайте, Пал Паличу, я працюю чесно!» (+10 СБК, -12 Палич)", "📂 'Search all you want, Boss, I'm clean!' (+10 SBK, -12 Palych)"),
                    outcomeText = LText("Палич сердито грюкає шухлядою: «Дивись мені, надто правильний знайшовся...»", "Palych slams the drawer shut: 'Watch yourself, mister squeaky-clean...'"),
                    palychRepDelta = -12,
                    sbkRepDelta = 10
                )
            )
        ),
        MidShiftEncounter(
            id = "double_agent_cipher",
            title = LText("🕵️ ТАЄМНИЙ ПАРОЛЬ БІЛЯ ВІКНА", "🕵️ SECRET CIPHER AT THE WINDOW"),
            description = LText(
                "Чоловік у сірому плащі нахиляється до самого скла й тихо питає:\n«Скажіть, скільки сьогодні коштує бринза на полонині?.. Ось зашифрована флешка. Передайте її людині в чорному бусі — отримаєте 650 ₴ готівкою. Тільки ні слова майору СБК!»",
                "A man in a grey trenchcoat leans against the glass and whispers:\n'Tell me, what's the price of bryndza in the highlands today?.. Here is an encrypted flash drive. Pass it to the black van for 650 ₴ cash. Not a word to the SBK Major!'"
            ),
            speakerPortrait = PortraitSpec(
                skinTone = 0,
                faceShape = 2,
                hairStyle = 4,
                glasses = 2,
                headwear = 1,
                expression = 1
            ),
            options = listOf(
                EncounterOption(
                    id = "report_to_sbk",
                    label = LText("🚨 Здати зв'язкового майору СБК «Тихому» (+300 ₴ премії, +20 СБК)", "🚨 Hand courier & drive to SBK Major (+300 ₴ bonus, +20 SBK)"),
                    outcomeText = LText("Оперативники СБК миттєво перехоплюють зв'язкового. Майор «Тихий» виписує тобі 300 ₴ премії з таємного фонду!", "SBK agents intercept the courier in seconds. Major 'Quiet' wires you a 300 ₴ covert bonus!"),
                    moneyDelta = 300,
                    riskDelta = -5,
                    sbkRepDelta = 20
                ),
                EncounterOption(
                    id = "pass_flash_drive",
                    label = LText("💵 Взяти 650 ₴ і передати флешку в тінь (+650 ₴, +15 Толік, -20 СБК)", "💵 Take 650 ₴ and pass the drive (+650 ₴, +15 Tolik, -20 SBK)"),
                    outcomeText = LText("Пачка купюр лягає у твою кишеню, а флешка зникає за шлагбаумом. Сподівайся, що камери СБК цього не бачили...", "A thick wad of cash lands in your pocket as the drive crosses the border."),
                    moneyDelta = 650,
                    riskDelta = 14,
                    tolikRepDelta = 15,
                    sbkRepDelta = -20
                )
            )
        ),
        MidShiftEncounter(
            id = "vip_queue_brawl",
            title = LText("💥 БІЙКА В ЧЕРЗІ БІЛЯ ШЛАГБАУМА!", "💥 BRAWL IN THE BORDER QUEUE!"),
            description = LText(
                "Тонований Гелендваген поїхав по зустрічній смузі в обхід 20-кілометрової черги! Водії бусів перегородили йому дорогу з монтуваннями, назріває масова бійка просто перед твоєю будкою.",
                "A tinted G-Wagon drove down the oncoming lane bypassing the 20km queue! Van drivers blocked it with crowbars — a massive brawl is erupting right outside your booth."
            ),
            speakerPortrait = PortraitSpec(
                skinTone = 1,
                faceShape = 1,
                hairStyle = 5,
                glasses = 2,
                scarOrDetail = 3,
                expression = 3
            ),
            options = listOf(
                EncounterOption(
                    id = "turn_vip_back",
                    label = LText("📢 Вийти й загнати Гелендваген у кінець черги (+150 ₴ подяки водіїв, +10 СБК)", "📢 Force the G-Wagon to the back of the line (+150 ₴ driver tips, +10 SBK)"),
                    outcomeText = LText("Водії бусів аплодують і пригощають тебе кавою з конвертом на 150 ₴ за справедливість!", "The queue cheers and slips 150 ₴ into your coffee cup for standing up for fairness!"),
                    moneyDelta = 150,
                    sbkRepDelta = 10,
                    familyMoraleDelta = 5
                ),
                EncounterOption(
                    id = "wave_vip_for_cash",
                    label = LText("💵 Відкрити VIP-шлагбаум за 500 ₴ від власника Гелендвагена (+500 ₴, +10% ризик)", "💵 Open VIP lane for 500 ₴ from the G-Wagon owner (+500 ₴, +10% risk)"),
                    outcomeText = LText("Власник кидає 500 ₴ у вікно будки й газує в Унію під свист і прокльони всієї черги.", "The driver tosses 500 ₴ into the booth and speeds into Unia as the queue films in fury."),
                    moneyDelta = 500,
                    riskDelta = 10,
                    tolikRepDelta = 10
                )
            )
        ),
        MidShiftEncounter(
            id = "customs_cat_bavovna",
            title = LText("🐈 ПРИКОРДОННИЙ КІТ «БАВОВНА»", "🐈 BORDER CAT 'BAVOVNA'"),
            description = LText(
                "Рудий місцевий кіт «Бавовна» застрибнув на твій стіл, понюхав митну декларацію і вперто дряпає обшивку сусіднього причепа з «картоплею».",
                "The ginger checkpoint cat 'Bavovna' jumped onto your desk, sniffed a customs declaration, and is furiously scratching a trailer full of 'potatoes'."
            ),
            speakerPortrait = PortraitSpec(
                skinTone = 2,
                faceShape = 0,
                hairStyle = 1,
                facialHair = 4,
                headwear = 1,
                expression = 1,
                specialId = SpecialCharacterId.GRANDPA_STEPAN
            ),
            options = listOf(
                EncounterOption(
                    id = "trust_cat",
                    label = LText("🐟 Дати коту ковбаси (-50 ₴) і розкрити причіп (+350 ₴ премії за знахідку!)", "🐟 Feed cat (-50 ₴) and rip open the trailer (+350 ₴ seizure reward!)"),
                    outcomeText = LText("Кіт не підвів! Під мішками з картоплею знайдено контрабандні айфони — тобі виписано 350 ₴ премії!", "The cat was right! Under the potatoes was a stash of smuggled iPhones — you earn a 350 ₴ reward!"),
                    moneyDelta = 300,
                    sbkRepDelta = 10,
                    familyMoraleDelta = 5
                ),
                EncounterOption(
                    id = "pet_and_work",
                    label = LText("🤚 Погладити кота й працювати швидше (+20с часу зміни)", "🤚 Pet the cat and focus on the queue (+20s shift time)"),
                    outcomeText = LText("Кіт задоволено муркоче біля штампа, а ти отримуєш +20 секунд спокійної роботи.", "The cat purrs next to your rubber stamp, giving you +20 seconds of focus."),
                    timeDeltaSeconds = 20
                )
            )
        )
    )
}
