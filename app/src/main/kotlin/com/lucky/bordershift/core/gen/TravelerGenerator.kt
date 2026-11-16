package com.lucky.bordershift.core.gen

import com.lucky.bordershift.core.model.*
import kotlin.random.Random

class TravelerGenerator(seed: Long = 42L) {

    private val rng = Random(seed)
    private var counter = 100

    private val maleFirstNames = listOf(
        LText("Богдан", "Bohdan"),
        LText("Тарас", "Taras"),
        LText("Олександр", "Oleksandr"),
        LText("Микола", "Mykola"),
        LText("Василь", "Vasyl"),
        LText("Ігор", "Ihor"),
        LText("Роман", "Roman"),
        LText("Сергій", "Serhii"),
        LText("Андрій", "Andrii"),
        LText("Віктор", "Viktor")
    )

    private val femaleFirstNames = listOf(
        LText("Оксана", "Oksana"),
        LText("Наталія", "Nataliia"),
        LText("Ірина", "Iryna"),
        LText("Марія", "Mariia"),
        LText("Катерина", "Kateryna"),
        LText("Галина", "Halyna"),
        LText("Софія", "Sofiia"),
        LText("Юлія", "Yuliia")
    )

    private val lastNames = listOf(
        LText("Коваленко", "Kovalenko"),
        LText("Бондаренко", "Bondarenko"),
        LText("Ткаченко", "Tkachenko"),
        LText("Кравчук", "Kravchuk"),
        LText("Олійник", "Oliinyk"),
        LText("Шевчук", "Shevchuk"),
        LText("Поліщук", "Polishchuk"),
        LText("Савченко", "Savchenko"),
        LText("Мельник", "Melnyk"),
        LText("Лисенко", "Lysenko")
    )

    private val cities = listOf(
        LText("Київгра́д", "Kyivhrad"),
        LText("Левандів", "Levandiv"),
        LText("Слобожанськ", "Slobozhansk"),
        LText("Чорноморськ", "Chornomorsk"),
        LText("Подільськ", "Podilsk"),
        LText("Карпатськ", "Karpatsk")
    )

    private val vehicles = listOf(
        LText("Lanos 1.5 (сірий газ/бензин)", "Lanos 1.5 (grey LPG)"),
        LText("Renault Kangoo (білий пиріжок)", "Renault Kangoo (white cargo van)"),
        LText("VW Transporter T4 (бус)", "VW Transporter T4 (minivan)"),
        LText("Skoda Octavia (універсал)", "Skoda Octavia (estate)"),
        LText("Старий «Жигуль» з багажником на даху", "Old Zhiguli with roof rack")
    )

    fun generateDailyQueue(daySpec: DayRuleSpec, count: Int = 7): List<Traveler> {
        val list = mutableListOf<Traveler>()
        // Include signature memorable encounters per day + procedural mix
        when (daySpec.dayNumber) {
            1 -> {
                list += createHonestTraveler(daySpec, forceFemaleRefugee = true)
                list += createGrandpaStepan(daySpec, stage = 1)
                list += createDentistDodger(daySpec)
                list += createHonestTraveler(daySpec, forceMaleWithExemption = true)
                list += createAuntHalya(daySpec)
            }
            2 -> {
                list += createFakeFatherOfThree(daySpec)
                list += createFederationSaboteur(daySpec, withScar = true)
                list += createTolikCourier(daySpec)
                list += createHonestTraveler(daySpec)
                list += createCatAmberSmuggler(daySpec)
            }
            3 -> {
                list += createVolunteerOlya(daySpec)
                list += createCoffinSneezer(daySpec)
                list += createGrandpaStepan(daySpec, stage = 2)
                list += createShlyakhSmuggler(daySpec)
                list += createHonestTraveler(daySpec, forceMaleWithExemption = true)
            }
            4 -> {
                list += createLivestreamer(daySpec)
                list += createNabkStingAgent(daySpec)
                list += createDeputySon(daySpec)
                list += createFederationSaboteur(daySpec, withScar = false)
                list += createHonestTraveler(daySpec)
            }
            else -> {
                list += createFakeStudent41(daySpec)
                list += createTolikCourier(daySpec)
                list += createGrandpaStepan(daySpec, stage = 3)
                list += createNabkStingAgent(daySpec)
                list += createFederationSaboteur(daySpec, withScar = true)
            }
        }

        while (list.size < count) {
            val roll = rng.nextInt(100)
            list += when {
                roll < 42 -> createHonestTraveler(daySpec)
                roll < 56 -> createDentistDodger(daySpec)
                roll < 70 -> createFakeFatherOfThree(daySpec)
                roll < 84 -> createCatAmberSmuggler(daySpec)
                else -> createFakeStudent41(daySpec)
            }
        }
        return list.shuffled(rng)
    }

    fun generateSingleProcedural(daySpec: DayRuleSpec, forceHonest: Boolean? = null): Traveler {
        val honest = forceHonest ?: rng.nextBoolean()
        if (honest) return createHonestTraveler(daySpec)
        return when (rng.nextInt(6)) {
            0 -> createDentistDodger(daySpec)
            1 -> createFakeFatherOfThree(daySpec)
            2 -> createFakeStudent41(daySpec)
            3 -> createCatAmberSmuggler(daySpec)
            4 -> createAuntHalya(daySpec)
            else -> createCoffinSneezer(daySpec)
        }
    }

    private fun nextId(): String = "TRV-${++counter}"

    private fun randomName(gender: Gender): LText {
        val first = if (gender == Gender.MALE) maleFirstNames.random(rng) else femaleFirstNames.random(rng)
        val last = lastNames.random(rng)
        return LText("${first.uk} ${last.uk}", "${first.en} ${last.en}")
    }

    private fun randomPortrait(gender: Gender): PortraitSpec {
        return PortraitSpec(
            skinTone = rng.nextInt(4),
            faceShape = rng.nextInt(4),
            hairStyle = if (gender == Gender.FEMALE) rng.nextInt(2, 4) else rng.nextInt(0, 3),
            hairColor = rng.nextInt(5),
            facialHair = if (gender == Gender.MALE) rng.nextInt(0, 4) else 0,
            glasses = if (rng.nextInt(4) == 0) rng.nextInt(1, 4) else 0,
            headwear = if (rng.nextInt(5) == 0) rng.nextInt(1, 4) else 0,
            scarOrDetail = 0,
            expression = rng.nextInt(0, 3)
        )
    }

    fun createHonestTraveler(
        daySpec: DayRuleSpec,
        forceFemaleRefugee: Boolean = false,
        forceMaleWithExemption: Boolean = false
    ): Traveler {
        val gender = when {
            forceFemaleRefugee -> Gender.FEMALE
            forceMaleWithExemption -> Gender.MALE
            else -> if (rng.nextBoolean()) Gender.FEMALE else Gender.MALE
        }
        val age = if (gender == Gender.MALE && !forceMaleWithExemption && rng.nextBoolean()) {
            rng.nextInt(61, 74)
        } else {
            rng.nextInt(22, 54)
        }
        val direction = if (forceFemaleRefugee || forceMaleWithExemption) {
            Direction.EXIT_TO_UNIA
        } else if (rng.nextInt(10) < 7) {
            Direction.EXIT_TO_UNIA
        } else {
            Direction.ENTRY_TO_KRAINA
        }

        val fullName = randomName(gender)
        val portrait = randomPortrait(gender)
        val passportNumber = "KR-${rng.nextInt(100000, 999999)}"
        val city = cities.random(rng)
        val docs = mutableListOf<DocumentCard>()

        docs += DocumentCard(
            id = "${passportNumber}-PASS",
            type = DocType.PASSPORT,
            title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
            subtitle = LText("Серія $passportNumber • м. ${city.uk}", "No. $passportNumber • ${city.en}"),
            fields = listOf(
                DocField("name", LText("ПІБ", "Full Name"), fullName),
                DocField("age", LText("Вік / Стать", "Age / Sex"), LText("$age р. • ${if (gender == Gender.MALE) "ЧОЛ" else "ЖІН"}", "$age y/o • ${if (gender == Gender.MALE) "M" else "F"}")),
                DocField("dir", LText("Напрямок", "Direction"), if (direction == Direction.EXIT_TO_UNIA) LText("ВИЇЗД → Унія", "EXIT → Unia") else LText("В'ЇЗД → Kraina", "ENTRY → Kraina")),
                DocField("exp", LText("Дійсний до", "Valid Until"), LText("12.10.2028", "2028-10-12"))
            ),
            sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
        )

        val needsMalePermit = daySpec.maleExitBanActive &&
            direction == Direction.EXIT_TO_UNIA &&
            gender == Gender.MALE &&
            age in 18..60

        if (needsMalePermit) {
            docs += DocumentCard(
                id = "${passportNumber}-EXEMPT",
                type = DocType.EXEMPTION_CERT,
                title = LText("ДОВІДКА ПРО ВІДСТРОЧКУ", "EXEMPTION CERTIFICATE"),
                subtitle = LText("Підстава для перетину кордону", "Authorized Border Crossing Permit"),
                fields = listOf(
                    DocField("holder", LText("Особа", "Holder"), fullName),
                    DocField("reason", LText("Підстава", "Exemption Basis"), LText("Багатодітний батько (3 дітей до 18 р.)", "Father of 3 minor children")),
                    DocField("valid", LText("Термін дії", "Valid Until"), LText("31.12.2025", "2025-12-31"))
                ),
                sealText = LText("ЦНАП / ДПСК • ПЕРЕВІРЕНО", "CNAP / SBGS • VERIFIED")
            )
        }

        if (daySpec.requireOblikQrForMales && gender == Gender.MALE && age in 18..60) {
            docs += DocumentCard(
                id = "${passportNumber}-OBLIK",
                type = DocType.MILITARY_ID,
                title = LText("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
                subtitle = LText("Цифровий реєстр військовозобов'язаних", "Digital Conscription Registry"),
                fields = listOf(
                    DocField("holder", LText("ПІБ", "Full Name"), fullName),
                    DocField("status", LText("Статус QR", "QR Status"), LText("QR-OK • НА ОБЛІКУ (Відстрочка)", "QR-OK • REGISTERED (Deferred)"))
                ),
                sealText = LText("МІНОБОРОНИ KRAINA • QR-OK", "MOD KRAINA • QR-OK")
            )
        }

        val vehicle = vehicles.random(rng)
        if (daySpec.requireVehicleDeclaration) {
            docs += DocumentCard(
                id = "${passportNumber}-VEH",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = vehicle,
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField("cargo", LText("Заявлений вантаж", "Declared Cargo"), LText("Особисті валізи, дитячі речі", "Personal suitcases, family items"))
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        }

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = age,
            gender = gender,
            direction = direction,
            role = if (forceFemaleRefugee) HiddenRole.REFUGEE else HiddenRole.HONEST_CITIZEN,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = if (forceFemaleRefugee) {
                LText("«Добрий день... Ми з дитиною до сестри в Унію, ось усі документи.»", "'Hello... Going to my sister in Unia with my child, here are all our papers.'")
            } else {
                LText("«Доброго дня, інспекторе. Прошу, всі папери за правилами.»", "'Good day, inspector. Here are all my documents in order.'")
            },
            interrogationReply = LText("«Перевірте ще раз, у мене все чесно оформлено через ЦНАП!»", "'Check again please, everything was legitimately issued!'"),
            vehicleDescription = vehicle,
            vehicleSearchResult = LText("Огляд авто: у багажнику лише старі валізи, термос із чаєм та плед. Порушень немає.", "Vehicle search: only old suitcases, a tea thermos, and a blanket. Clean."),
            arrestSceneFull = LText("Охорона спантеличено скручує невинувату людину під крики черги.", "Guards awkwardly cuff an innocent traveler as the queue shouts in protest."),
            arrestSceneTonedDown = LText("Мандрівника безпідставно затримано для з'ясування обставин.", "The traveler was unnecessarily detained for questioning."),
            hasHiddenContraband = false,
            bribeOffer = null,
            shouldBeApproved = true,
            validViolations = emptySet()
        )
    }

    fun createDentistDodger(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.MALE)
        val age = rng.nextInt(25, 44)
        val portrait = PortraitSpec(
            skinTone = 1,
            faceShape = 0,
            hairStyle = 0,
            hairColor = 1,
            facialHair = 1,
            glasses = 3,
            scarOrDetail = 2, // sweat drops
            expression = 2    // nervous
        )
        val docs = mutableListOf(
            DocumentCard(
                id = "PASS-DENT",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-402918", "No. KR-402918"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("$age р. • ЧОЛ", "$age y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("04.08.2029", "2029-08-04"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "EXEMPT-DENT",
                type = DocType.EXEMPTION_CERT,
                title = LText("МЕДИЧНА ДОВІДКА", "MEDICAL EXEMPTION"),
                subtitle = LText("Висновок про непридатність", "Unfit for Service Certificate"),
                fields = listOf(
                    DocField("holder", LText("Особа", "Holder"), fullName),
                    DocField("reason", LText("Діагноз", "Diagnosis"), LText("Хронічний карієс ІІ групи (списаний назавжди)", "Chronic 2nd-degree toothache (permanently unfit)")),
                    DocField(
                        "issuer",
                        LText("Ким видано", "Issued By"),
                        LText("Приватна стоматологія «Веселий Зуб»", "Private Dental Clinic 'Happy Tooth'"),
                        discrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
                    )
                ),
                sealText = LText("ФОП СТОМАТОЛОГ КАРПЕНКО", "DENTIST KARPENKO LLC"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
            )
        )

        if (daySpec.requireOblikQrForMales) {
            docs += DocumentCard(
                id = "OBLIK-DENT",
                type = DocType.MILITARY_ID,
                title = LText("Е-ДОКУМЕНТ «ОБЛІК+»", "E-MILITARY ID 'OBLIK+'"),
                subtitle = LText("Цифровий реєстр", "Digital Registry"),
                fields = listOf(
                    DocField("holder", LText("ПІБ", "Full Name"), fullName),
                    DocField(
                        "status",
                        LText("Статус QR", "QR Status"),
                        LText("ПОМИЛКА 404: ДАНІ ЗІ СТОМАТОЛОГІЇ НЕ ПРИЙНЯТО", "ERROR 404: DENTAL RECORDS NOT ACCEPTED"),
                        discrepancy = DiscrepancyType.INVALID_QR_CODE
                    )
                ),
                sealText = LText("НЕДІЙСНИЙ QR", "INVALID QR"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.INVALID_QR_CODE
            )
        }

        if (daySpec.requireVehicleDeclaration) {
            docs += DocumentCard(
                id = "VEH-DENT",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Skoda Fabia (синя)", "Skoda Fabia (blue)"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField("cargo", LText("Вантаж", "Cargo"), LText("Один наплічник та подушка", "One backpack and a pillow"))
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        }

        val violations = mutableSetOf(DiscrepancyType.FAKE_ISSUER_SEAL)
        if (daySpec.requireOblikQrForMales) violations += DiscrepancyType.INVALID_QR_CODE

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = age,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.DRAFT_DODGER_DENTIST,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Кхм... Добрий день! Я по здоров'ю їду на лікування в Унію, ось довідка з клініки, печатка кругла!»",
                "'Ahem... Good day! Travelling to Unia for urgent medical treatment, here's my clinic certificate with a round stamp!'"
            ),
            interrogationReply = LText(
                "«Ну добре, стоматолог кум підписав! Командире, не губи, в паспорті 400 гривень на каву лежить!»",
                "'Okay fine, my dentist cousin signed it! Boss, don't ruin me, there's 400 UAH tucked in the passport for coffee!'"
            ),
            vehicleDescription = LText("Skoda Fabia (синя)", "Skoda Fabia (blue)"),
            vehicleSearchResult = LText("У салоні — 5 пачок заспокійливого та розмовник мови Унії.", "Inside the cabin: 5 packs of sedatives and a Unia phrasebook."),
            arrestSceneFull = LText("Патруль виводить «пацієнта» під руки, поки він кричить про права стоматологів.", "Patrol drags the 'patient' out by the arms while he yells about dental rights."),
            arrestSceneTonedDown = LText("Порушника з підробленою медичною довідкою передано наряду поліції.", "The traveler with the forged dental note was handed over to police."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 400,
                pitch = LText("«Візьми 400 ₴ і не вдивляйся в печатку стоматолога, га?»", "'Take 400 ₴ and ignore the dentist stamp, deal?'")
            ),
            shouldBeApproved = false,
            validViolations = violations
        )
    }

    fun createFakeFatherOfThree(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.MALE)
        val fakeCertName = LText("Петренко Степан Іванович", "Stepan Petrenko")
        val age = rng.nextInt(28, 45)
        val portrait = randomPortrait(Gender.MALE).copy(expression = 1, scarOrDetail = 2)

        val docs = mutableListOf(
            DocumentCard(
                id = "PASS-3KIDS",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-773120", "No. KR-773120"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("$age р. • ЧОЛ", "$age y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("15.05.2027", "2027-05-15"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "EXEMPT-3KIDS",
                type = DocType.EXEMPTION_CERT,
                title = LText("ПОСВІДЧЕННЯ БАГАТОДІТНОГО", "MULTI-CHILD PARENT PERMIT"),
                subtitle = LText("Троє дітей: Миколка, Миколка-2, Миколка-3", "Three children: Mykolka, Mykolka-2, Mykolka-3"),
                fields = listOf(
                    DocField(
                        "holder",
                        LText("Батько (ПІБ)", "Father (Full Name)"),
                        fakeCertName,
                        discrepancy = DiscrepancyType.NAME_MISMATCH
                    ),
                    DocField(
                        "reason",
                        LText("Примітка", "Note"),
                        LText("На всіх 3 свідоцтвах фото тієї самої дитини в різних шапках", "All 3 birth certificates show the same kid in different hats"),
                        discrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
                    )
                ),
                sealText = LText("КСЕРОКОПІЯ НА КОЛЬОРОВОМУ ПРИНТЕРІ", "COLOR PRINTER PHOTOCOPY"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
            )
        )

        if (daySpec.requireVehicleDeclaration) {
            docs += DocumentCard(
                id = "VEH-3KIDS",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Daewoo Lanos (вишневий)", "Daewoo Lanos (cherry)"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField("cargo", LText("Вантаж", "Cargo"), LText("Три порожні дитячі автокрісла без дітей", "Three empty child car seats, zero children"))
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        }

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = age,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.FAKE_FATHER_OF_THREE,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Здоровенькі були! Я багатодітний тато-герой, їду до дітей, ось посвідчення!»",
                "'Greetings! I'm a proud father of three, heading out to join my kids, here's my certificate!'"
            ),
            interrogationReply = LText(
                "«Чому прізвище інше і діти однакові?.. Та то трійнята від першого шлюбу кума! Давай за 500 ₴ закриємо питання!»",
                "'Why is the surname different and the kids identical?! Triplets from my cousin's marriage! Let's settle this for 500 ₴!'"
            ),
            vehicleDescription = LText("Daewoo Lanos (вишневий)", "Daewoo Lanos (cherry)"),
            vehicleSearchResult = LText("У салоні стоять три порожні дитячі крісла з цінниками з магазину.", "Inside: three brand-new empty child seats with store price tags still attached."),
            arrestSceneFull = LText("«Багатодітного тата» пакують у бус ДПСК під регіт усієї черги.", "The 'father of three' is loaded into a border patrol van as the queue bursts out laughing."),
            arrestSceneTonedDown = LText("Пред'явника чужого посвідчення багатодітного батька знято з рейсу.", "The holder of another person's multi-child permit was turned back."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 500,
                pitch = LText("«Друже, 500 ₴ готівкою — і вважаємо, що Миколки справжні!»", "'Friend, 500 ₴ cash and we pretend the three Mykolkas are real!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.NAME_MISMATCH, DiscrepancyType.FAKE_ISSUER_SEAL)
        )
    }

    fun createFakeStudent41(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.MALE)
        val portrait = PortraitSpec(
            skinTone = 0,
            faceShape = 3,
            hairStyle = 1, // receding hairline
            hairColor = 2, // greying
            facialHair = 2,
            glasses = 1,
            expression = 1
        )
        val docs = mutableListOf(
            DocumentCard(
                id = "PASS-STUD",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-551902", "No. KR-551902"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("41 р. • ЧОЛ", "41 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField(
                        "exp",
                        LText("Дійсний до", "Valid Until"),
                        LText("01.02.2021 (ПРОСТРОЧЕНИЙ)", "2021-02-01 (EXPIRED)"),
                        discrepancy = DiscrepancyType.EXPIRED_DATE
                    )
                ),
                sealText = LText("ДМС KRAINA", "SMS KRAINA")
            ),
            DocumentCard(
                id = "EXEMPT-STUD",
                type = DocType.EXEMPTION_CERT,
                title = LText("СТУДЕНТСЬКИЙ КВИТОК", "STUDENT ADMISSION CARD"),
                subtitle = LText("1-й курс денної форми навчання", "1st-Year Full-Time Freshman"),
                fields = listOf(
                    DocField("holder", LText("Студент", "Student"), fullName),
                    DocField(
                        "uni",
                        LText("Заклад", "University"),
                        LText("Міжгалактична Академія Кріптовалют та Бджільництва м. Варшава", "Intergalactic Academy of Crypto & Beekeeping"),
                        discrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
                    )
                ),
                sealText = LText("ДЕКАНАТ ТЕЛЕГРАМ-КАНАЛУ", "TELEGRAM DEAN'S OFFICE"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 41,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.FAKE_STUDENT_41,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Йоу, бро! Я першокурсник, їду гризти граніт науки в Унію на сесію!»",
                "'Yo bro! I'm a 41-year-old freshman heading to Unia for my first semester exams!'"
            ),
            interrogationReply = LText(
                "«Ну так, паспорт прострочений, а універ я купив у Телеграмі за 100 баксів. Візьми 450 ₴ і відпусти на пари!»",
                "'Alright, my passport expired in 2021 and I bought the college letter on Telegram. Take 450 ₴ and let me study!'"
            ),
            vehicleDescription = LText("Пішки з самокатом", "On foot with an electric scooter"),
            vehicleSearchResult = LText("Огляд речей: замість підручників — мангал і вудка.", "Baggage check: instead of textbooks, a BBQ grill and a fishing rod."),
            arrestSceneFull = LText("«Першокурсника» затримують просто з самокатом.", "The 'freshman' is escorted away along with his scooter."),
            arrestSceneTonedDown = LText("Особу з простроченим паспортом та недійсним студентським повернуто назад.", "The traveler with an expired passport and fake student card was denied exit."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 450,
                pitch = LText("«450 ₴ на розвиток прикордонної науки — і я поїхав!»", "'450 ₴ for border science and I'm on my way!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.EXPIRED_DATE, DiscrepancyType.FAKE_ISSUER_SEAL)
        )
    }

    fun createAuntHalya(daySpec: DayRuleSpec): Traveler {
        val realPortrait = PortraitSpec(
            skinTone = 1,
            faceShape = 1,
            hairStyle = 0,
            hairColor = 0,
            facialHair = 2, // noticeable mustache!
            glasses = 2,
            headwear = 2,   // floral headscarf
            expression = 2,
            specialId = SpecialCharacterId.AUNT_HALYA
        )
        val sisterPassportPortrait = PortraitSpec(
            skinTone = 1,
            faceShape = 0,
            hairStyle = 3,
            hairColor = 3,
            facialHair = 0, // no mustache in sister's photo
            glasses = 0,
            headwear = 0,
            expression = 0
        )

        val docs = listOf(
            DocumentCard(
                id = "PASS-HALYA",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-119044", "No. KR-119044"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), LText("Петренко Галина Іванівна", "Halyna Petrenko")),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("34 р. • ЖІН", "34 y/o • F")),
                    DocField(
                        "photo_note",
                        LText("Особливі прикмети", "Appearance Check"),
                        LText("На фото — білявка без вусів. У вікні — бас і берці 45-го розміру", "Photo shows blonde woman. At booth: baritone voice, mustache & size-45 boots"),
                        discrepancy = DiscrepancyType.PHOTO_MISMATCH
                    ),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("20.09.2028", "2028-09-20"))
                ),
                sealText = LText("ДМС KRAINA", "SMS KRAINA")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = LText("«Тітка Галя» (Валера)", "'Aunt Halya' (Valera)"),
            age = 34,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.DISGUISED_AUNT_HALYA,
            portrait = realPortrait,
            passportPortrait = sisterPassportPortrait,
            documents = docs,
            greeting = LText(
                "«Кхе-кхе... Добрий день, соколику! Пустіть бідну жінку Галину до Польщі, тільки не дивіться на мої вуса!»",
                "'Ahem... Hello darling! Let poor woman Halyna cross to Unia, just ignore my five-o'clock shadow!'"
            ),
            interrogationReply = LText(
                "«Та це паспорт сестри, а хустку в бабусі взяв! Не позор перед чергою, візьми 500 ₴!»",
                "'Okay, it's my sister's passport and grandma's headscarf! Don't embarrass me in front of the queue, take 500 ₴!'"
            ),
            vehicleDescription = LText("Рейсовий автобус (місце біля вікна)", "Passenger bus (window seat)"),
            vehicleSearchResult = LText("У жіночій сумочці — бритва, піна для гоління та чоловічі труси.", "Inside the handbag: shaving foam, a razor, and men's boxers."),
            arrestSceneFull = LText("З «тітки Галі» злітає квітчаста хустка під час затримання; весь пункт пропуску знімає відео для ТікТоку.", "The floral headscarf flies off during arrest as the entire queue films for TikTok."),
            arrestSceneTonedDown = LText("Громадянина, який намагався перетнути кордон за паспортом сестри, затримано.", "The man attempting to cross using his sister's passport was detained."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 500,
                pitch = LText("«Соколику, 500 ₴ у квітчастій хустині — і тітка Галя поїхала!»", "'500 ₴ folded in a floral handkerchief and Aunt Halya rolls on!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.PHOTO_MISMATCH, DiscrepancyType.AGE_RESTRICTION_NO_PERMIT)
        )
    }

    fun createCoffinSneezer(daySpec: DayRuleSpec): Traveler {
        val fullName = LText("Гробовий Остап Маркович", "Ostap Hrobovyi")
        val portrait = PortraitSpec(
            skinTone = 0,
            faceShape = 2,
            hairStyle = 0,
            hairColor = 0,
            facialHair = 0,
            headwear = 1,
            expression = 4
        )
        val docs = listOf(
            DocumentCard(
                id = "PASS-COFFIN",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-660112", "No. KR-660112"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("62 р. • ЧОЛ (віковий дозвіл)", "62 y/o • M (Age exempt)")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("10.10.2029", "2029-10-10"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "VEH-COFFIN",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Чорний катафалк Mercedes Sprinter", "Black Hearse Mercedes Sprinter"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField(
                        "cargo",
                        LText("Заявлений вантаж", "Declared Cargo"),
                        LText("Ритуальна труна (але з кузова щойно почулося гучне «АПЧХИ!» і «Будь здоровий!»)", "Ritual coffin (except a loud 'ACHOO!' and 'Bless you!' just echoed from inside)"),
                        discrepancy = DiscrepancyType.CONTRABAND_CARGO
                    )
                ),
                sealText = LText("РИТУАЛ-СЕРВІС «ВІЧНИЙ ШЛЯХ»", "FUNERAL SERVICE 'ETERNAL WAY'")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 62,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.COFFIN_SNEEZER,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Скорботний день, синку... Везу покійного дідуся на історичну батьківщину в Унію. Не гріх пропустити без огляду...»",
                "'Sorrowful day, son... Transporting a late grandfather to his homeland in Unia. Best not disturb the coffin...'"
            ),
            interrogationReply = LText(
                "«Хто чхнув у труні?! Та то... акустика в кузові! Ладно, там двоє айтішників лежать з ноутбуками, дають 700 ₴!»",
                "'Who sneezed in the coffin?! Just... van acoustics! Fine, there are two IT guys with laptops inside offering 700 ₴!'"
            ),
            vehicleDescription = LText("Чорний катафалк Mercedes Sprinter", "Black Hearse Mercedes Sprinter"),
            vehicleSearchResult = LText(
                "ОГЛЯД АВТО: Ви відкриваєте кришку труни — всередині лежать двоє цілком живих ухилянтів із павербанками та шаурмою!",
                "VEHICLE SEARCH: You pop the coffin lid — two very alive draft dodgers are inside with powerbanks and shawarma!"
            ),
            arrestSceneFull = LText("Двох «покійників» витягують із труни просто на очах у черги, поки водій катафалка кляне протяги.", "Two 'corpses' climb out of the coffin in front of the whole queue while the driver curses the draft."),
            arrestSceneTonedDown = LText("Незаконних пасажирів катафалка та водія затримано нарядом прикордонників.", "The stowaways inside the hearse and the driver were detained by border guards."),
            hasHiddenContraband = true,
            bribeOffer = BribeOffer(
                amount = 700,
                pitch = LText("«700 ₴ з «покійників» — і ми тихо їдемо на цвинтар у Варшаву!»", "'700 ₴ from the 'deceased' and we quietly roll on!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.CONTRABAND_CARGO)
        )
    }

    fun createCatAmberSmuggler(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.FEMALE)
        val portrait = randomPortrait(Gender.FEMALE).copy(expression = 1)
        val docs = listOf(
            DocumentCard(
                id = "PASS-CAT",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-309811", "No. KR-309811"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("29 р. • ЖІН", "29 y/o • F")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("11.11.2028", "2028-11-11"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "VEH-CAT",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Nissan Leaf + переноска з котом", "Nissan Leaf + Cat Carrier"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField(
                        "cargo",
                        LText("Вантаж", "Declared Cargo"),
                        LText("Кіт «Мурчик» (вага переноски за рентгеном — 24 кг, подвійне дно)", "Cat 'Murchyk' (carrier weighs 24 kg on X-ray, false bottom)"),
                        discrepancy = DiscrepancyType.CONTRABAND_CARGO
                    )
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 29,
            gender = Gender.FEMALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.CAT_AMBER_SMUGGLER,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Добрий день! Я тільки з котиком Мурчиком до ветеринара в Унію, він у мене просто трошки важкенький!»",
                "'Hello! Just taking my kitty Murchyk to a vet in Unia, he's just a little chonky!'")
            ,
            interrogationReply = LText(
                "«Чому переноска важить 24 кілограми?! Ну гаразд, під матрасиком у Мурчика 3 кг поліського бурштину! Ось 400 ₴ коту на корм!»",
                "'Why does the carrier weigh 24 kilos?! Fine, Murchyk is sitting on 3 kg of raw amber! Here's 400 ₴!'"
            ),
            vehicleDescription = LText("Nissan Leaf (зелений)", "Nissan Leaf (green)"),
            vehicleSearchResult = LText(
                "ОГЛЯД АВТО: Кіт Мурчик обурено шипить, а під подвійним дном переноски знайдено 3 кг необробленого бурштину-сирцю!",
                "VEHICLE SEARCH: Murchyk the cat hisses as you uncover 3 kg of raw smuggled amber under the carrier's false bottom!"
            ),
            arrestSceneFull = LText("Бурштин конфіскують під нявкання Мурчика, а контрабандистку оформлюють за протоколом.", "The amber is seized as Murchyk meows loudly and the smuggler is booked."),
            arrestSceneTonedDown = LText("Незадекларований бурштин вилучено, у перетині кордону відмовлено.", "Undeclared amber confiscated, border crossing denied."),
            hasHiddenContraband = true,
            bribeOffer = BribeOffer(
                amount = 400,
                pitch = LText("«400 ₴ — і не тривожимо котика Мурчика!»", "'400 ₴ and we don't disturb kitty Murchyk!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.CONTRABAND_CARGO)
        )
    }

    fun createGrandpaStepan(daySpec: DayRuleSpec, stage: Int): Traveler {
        val portrait = PortraitSpec(
            skinTone = 1,
            faceShape = 1,
            hairStyle = 1,
            hairColor = 2,
            facialHair = 4, // thick Cossack mustache
            headwear = 1,   // flat cap
            expression = 1,
            specialId = SpecialCharacterId.GRANDPA_STEPAN
        )
        val cargoDesc = when (stage) {
            1 -> LText("3-літрова банка смальцю та шмат генеральського сала (дозволено)", "3L jar of lard and prime salo (permitted)")
            2 -> LText("Бідон домашнього «карпатського чаю» 70 градусів та 20 блоків цигарок у запасці", "Canister of 70-proof moonshine & 20 cartons of cigarettes in spare tire")
            else -> LText("Жива коза Марічка в дитячому кріслі з підробленим ветпаспортом пуделя", "Live goat Marichka in a child seat with a forged poodle passport")
        }
        val isClean = stage == 1
        val docs = listOf(
            DocumentCard(
                id = "PASS-STEPAN-$stage",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-001954 • Прикордонне село", "No. KR-001954 • Border Village"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), LText("Дід Степан (Кравчук С.П.)", "Grandpa Stepan (Kravchuk S.P.)")),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("68 р. • ЧОЛ (віковий виняток)", "68 y/o • M (Age 60+ exempt)")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("Безстроково", "Indefinite"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "VEH-STEPAN-$stage",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Синій «Москвич» з причепом", "Blue Moskvitch with trailer"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), LText("Дід Степан (Кравчук С.П.)", "Grandpa Stepan")),
                    DocField(
                        "cargo",
                        LText("Вантаж", "Cargo"),
                        cargoDesc,
                        discrepancy = if (isClean) null else DiscrepancyType.CONTRABAND_CARGO
                    )
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = LText("Дід Степан", "Grandpa Stepan"),
            age = 68,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.STORY_STEPAN,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = when (stage) {
                1 -> LText("«Здоров був, синку! Я до кума через шлагбаум на годину, везу шмат сала, всі папери чисті!»", "'Howdy son! Just crossing to my cousin's for an hour with a slab of salo, papers are clean!'")
                2 -> LText("«Синку, це знову я! Там у багажнику тільки «свячена вода» у бідоні, їй-богу!»", "'Son, it's me again! Just 'holy water' in the canister in the trunk, I swear!'")
                else -> LText("«Інспекторе, не дивись так на заднє сидіння — то мій породистий карпатський пудель Марічка!»", "'Inspector, don't stare at the back seat — that's my purebred Carpathian poodle Marichka!'")
            },
            interrogationReply = LText(
                "«Ну бекає пудель, бо застудився! Синку, ось 300 ₴ і шмат копченої ковбаси — не звертай діда!»",
                "'So my poodle bleats, she caught a cold! Here's 300 ₴ and smoked sausage, let an old man through!'"
            ),
            vehicleDescription = LText("Синій «Москвич» з причепом", "Blue Moskvitch with trailer"),
            vehicleSearchResult = if (isClean) {
                LText("У багажнику — лише запашне домашнє сало в пергаменті. Закон не забороняє!", "Trunk check: only fragrant homemade salo wrapped in paper. Perfectly legal!")
            } else {
                LText("ОГЛЯД АВТО: Замість пуделя з вікна виглядає рогата коза Марічка і жує вашу митну декларацію, а під сидінням — 20 блоків цигарок!", "VEHICLE SEARCH: A horned goat chews your customs form while 20 cartons of contraband cigarettes sit under the seat!")
            },
            arrestSceneFull = LText("Діда Степана разом із козою Марічкою під білі руки розвертають назад у село.", "Grandpa Stepan and Marichka the goat are escorted back toward the village."),
            arrestSceneTonedDown = LText("Діда Степана попросили повернутися додому та викласти контрабанду.", "Grandpa Stepan was turned back with his undeclared goods."),
            hasHiddenContraband = !isClean,
            bribeOffer = if (isClean) null else BribeOffer(
                amount = 300,
                pitch = LText("«Синку, 300 ₴ на гостинець і домашнє сало!»", "'Son, 300 ₴ and homemade salo for your family!'")
            ),
            shouldBeApproved = isClean,
            validViolations = if (isClean) emptySet() else setOf(DiscrepancyType.CONTRABAND_CARGO),
            storyTag = "STEPAN_$stage"
        )
    }

    fun createTolikCourier(daySpec: DayRuleSpec): Traveler {
        val portrait = PortraitSpec(
            skinTone = 1,
            faceShape = 1,
            hairStyle = 4,
            hairColor = 0,
            facialHair = 1,
            glasses = 2,
            headwear = 1,
            scarOrDetail = 3, // gold chain
            expression = 1,
            specialId = SpecialCharacterId.TOLIK_SMUGGLER
        )
        val fullName = LText("Анатолій «Толік Бусик» Вакула", "Anatolii 'Tolik Minivan' Vakula")
        val docs = listOf(
            DocumentCard(
                id = "PASS-TOLIK",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-888001", "No. KR-888001"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("38 р. • ЧОЛ", "38 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("19.12.2030", "2030-12-19"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "EXEMPT-TOLIK",
                type = DocType.EXEMPTION_CERT,
                title = LText("ВОЛОНТЕРСЬКИЙ ДОЗВІЛ «ШЛЯХ-ЕКСПРЕС»", "TRANSIT PERMIT 'SHLYAKH-EXPRESS'"),
                subtitle = LText("Перевезення гуманітарного вантажу", "Humanitarian Cargo Transit"),
                fields = listOf(
                    DocField("holder", LText("Водій", "Driver"), fullName),
                    DocField(
                        "issuer",
                        LText("Благодійний фонд", "Charity Fund"),
                        LText("ТОВ «Нічний Контрабас» (печатка намальована ручкою)", "LLC 'Night Contraband' (seal drawn with ballpoint pen)"),
                        discrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
                    )
                ),
                sealText = LText("ПЕЧАТКА ТОВ «НІЧНИЙ КОНТРАБАС»", "SEAL OF 'NIGHT CONTRABAND' LLC"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.FAKE_ISSUER_SEAL
            ),
            DocumentCard(
                id = "VEH-TOLIK",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Білий Mercedes Vito (тонований)", "White Mercedes Vito (tinted)"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField(
                        "cargo",
                        LText("Вантаж", "Cargo"),
                        LText("«Порожні коробки» (бус просів до асфальту від ящиків)", "'Empty boxes' (van suspension sagging from heavy crates)"),
                        discrepancy = DiscrepancyType.CONTRABAND_CARGO
                    )
                ),
                sealText = LText("БЕЗ МИТНОГО ОГЛЯДУ", "UNINSPECTED")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 38,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.STORY_TOLIK,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Вечір в хату, інспекторе! Це Толік «Бусик». Пал Палич мав попередити. Став штамп без зайвих питань — у конверті 800 ₴ і моя повага. Коли захочеш сам виїхати з Kraina — я організую.»",
                "'Evening, inspector! It's Tolik 'Minivan'. Palych told you about me. Stamp me through — 800 ₴ in the envelope plus my favor when YOU need a ride out of Kraina.'"
            ),
            interrogationReply = LText(
                "«Ти серйозно хочеш сваритися і зі мною, і з Паличем? Візьми 800 ₴ і не лізь у кузов!»",
                "'You really want to cross both me and Palych? Take the 800 ₴ and stay out of the cargo bay!'"
            ),
            vehicleDescription = LText("Білий Mercedes Vito (тонований)", "White Mercedes Vito (tinted)"),
            vehicleSearchResult = LText(
                "ОГЛЯД АВТО: Кузов забитий безакцизними цигарками та готівкою, а на коробках — стікер «Частка для Пал Палича»!",
                "VEHICLE SEARCH: Cargo bay packed with untaxed cigarettes and cash crates labeled 'Pal Palych's Cut'!"
            ),
            arrestSceneFull = LText("Спецгрупа скручує Толіка на капоті буса; він плює під ноги й обіцяє, що ти ніколи не перетнеш цей кордон живим.", "Tactical guards slam Tolik onto the hood; he spits and swears you'll never cross this border."),
            arrestSceneTonedDown = LText("Толіка та його мікроавтобус із контрабандою затримано для передачі слідчим.", "Tolik and his contraband van were detained and handed over to investigators."),
            hasHiddenContraband = true,
            bribeOffer = BribeOffer(
                amount = 800,
                pitch = LText("«800 ₴ у конверті + місце в моєму бусі, коли збереш Фонд утечі!»", "'800 ₴ cash + a seat in my van when your Escape Fund is ready!'"),
                syndicateFavor = true
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.FAKE_ISSUER_SEAL, DiscrepancyType.CONTRABAND_CARGO),
            storyTag = "TOLIK_RUN"
        )
    }

    fun createFederationSaboteur(daySpec: DayRuleSpec, withScar: Boolean): Traveler {
        val fullName = randomName(Gender.MALE)
        val portrait = PortraitSpec(
            skinTone = 0,
            faceShape = 2,
            hairStyle = 4, // buzzcut
            hairColor = 0,
            facialHair = 0,
            glasses = if (withScar) 0 else 2,
            scarOrDetail = if (withScar) 1 else 2, // 1 = left cheek scar!
            expression = 3
        )
        val docs = listOf(
            DocumentCard(
                id = "PASS-SPY",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-900412 • Виданий учора", "No. KR-900412 • Issued yesterday"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("36 р. • ЧОЛ", "36 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("В'ЇЗД → Kraina", "ENTRY → Kraina")),
                    DocField(
                        "trait",
                        LText("Орієнтування СБК", "SBK Watchlist Match"),
                        if (withScar) {
                            LText("Шрам на лівій щоці + акцент («паляниця» вимовити не зміг)", "Left cheek scar + heavy accent (failed 'palyanytsia' test)")
                        } else {
                            LText("Темні окуляри + фальшивий штамп перетину кордону Федерації", "Dark sunglasses + forged Federation border stamp")
                        },
                        discrepancy = DiscrepancyType.WANTED_CRIMINAL_OR_SPY
                    )
                ),
                sealText = LText("ДМС • ПІДОЗРІЛИЙ БЛАНК", "SUSPICIOUS BLANK"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.WANTED_CRIMINAL_OR_SPY
            ),
            DocumentCard(
                id = "VEH-SPY",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Чорний позашляховик на транзитних номерах", "Black SUV with transit plates"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField(
                        "cargo",
                        LText("Вантаж", "Cargo"),
                        LText("Туристичне спорядження (під сидінням — рація та карти підстанцій)", "Camping gear (under seat: encrypted radio & power grid maps)"),
                        discrepancy = DiscrepancyType.WANTED_CRIMINAL_OR_SPY
                    )
                ),
                sealText = LText("ТРАНЗИТ", "TRANSIT")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 36,
            gender = Gender.MALE,
            direction = Direction.ENTRY_TO_KRAINA,
            role = HiddenRole.FEDERATION_SABOTEUR,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Здрастуйте, товаріщ... тобто пан інспектор. Я звичайний турист, повертаюся додому в Kraina.»",
                "'Greetings, comrade... I mean mister inspector. Just an ordinary tourist returning to Kraina.'"
            ),
            interrogationReply = LText(
                "«Тихо! Не натискай тривожну кнопку СБК! У бардачку 1000 гривень — пропусти машину і забудь моє обличчя!»",
                "'Quiet! Don't press the SBK alarm button! There's 1,000 UAH in the glovebox — wave me through and forget my face!'"
            ),
            vehicleDescription = LText("Чорний позашляховик", "Black SUV"),
            vehicleSearchResult = LText(
                "ОГЛЯД АВТО: Під обшивкою знайдено GPS-маячки, підроблені печатки та координати військового складу!",
                "VEHICLE SEARCH: Hidden under the trim are GPS beacons, forged stamps, and coordinates of a military depot!"
            ),
            arrestSceneFull = LText(
                "Диверсант тягнеться до кобури, але спецгрупа СБК вибиває скло прикладом, заламує його на асфальті й одягає мішок на голову. Майор «Тихий» схвально киває тобі.",
                "The saboteur reaches for a holster, but SBK operatives smash the window with a rifle butt, pin him to the asphalt, and bag him. Major 'Quiet' nods to you in approval."
            ),
            arrestSceneTonedDown = LText(
                "Оперативники СБК миттєво блокують авто та затримують підозрюваного в диверсійній діяльності. Майор «Тихий» дякує за пильність.",
                "SBK operatives block the vehicle and detain the suspected saboteur. Major 'Quiet' commends your vigilance."
            ),
            hasHiddenContraband = true,
            bribeOffer = BribeOffer(
                amount = 1000,
                pitch = LText("«1000 ₴ готівкою просто зараз — тільки не викликай СБК!»", "'1,000 ₴ cash right now — just don't call the SBK!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.WANTED_CRIMINAL_OR_SPY, DiscrepancyType.CONTRABAND_CARGO),
            isWantedTarget = true,
            storyTag = "SABOTEUR"
        )
    }

    fun createNabkStingAgent(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.MALE)
        val portrait = randomPortrait(Gender.MALE).copy(glasses = 1, expression = 1)
        val docs = listOf(
            DocumentCard(
                id = "PASS-NABK",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-330199", "No. KR-330199"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("31 р. • ЧОЛ", "31 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField(
                        "permit",
                        LText("Дозвіл на виїзд", "Exit Permit"),
                        LText("ВІДСУТНІЙ (пропонує мічені купюри під приховану камеру в ґудзику)", "MISSING (offering marked bills while a buttonhole camera records)"),
                        discrepancy = DiscrepancyType.AGE_RESTRICTION_NO_PERMIT
                    )
                ),
                sealText = LText("ДМС KRAINA", "SMS KRAINA")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 31,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.NABK_STING,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Добрий день, панове прикордонники! Довідки в мене нема, зате є 600 ₴ свіжими купюрами! Візьмете особисто в руки під запис... тобто на каву?»",
                "'Good day, officer! I have no exit permit, but I have 600 ₴ in crisp bills! Care to take them right in front of my lapel button?'"
            ),
            interrogationReply = LText(
                "«Чому у мене світиться червоний вогник у ґудзику куртки? Та то модна брошка! То ви берете хабар чи відмовляєте по закону?»",
                "'Why is my jacket button blinking red? Just fashion! So are you taking the bribe or denying me by the book?'"
            ),
            vehicleDescription = LText("Сірий Toyota Camry з антенами", "Grey Toyota Camry with extra antennas"),
            vehicleSearchResult = LText("ОГЛЯД АВТО: Під сидінням — апаратура прихованого відеозапису та папка з логотипом НАБК!", "VEHICLE SEARCH: Hidden recording equipment and an NABK Anti-Corruption Bureau folder under the seat!"),
            arrestSceneFull = LText("Ти намагаєшся затримати агента НАБК, але він тицяє у вікно посвідчення детектива й їде геть.", "You try to detain the NABK agent, but he flashes a detective badge and drives off."),
            arrestSceneTonedDown = LText("Перевіряльник НАБК фіксує твої дії у протоколі та повертається назад.", "The NABK inspector logs your decision and turns around."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 600,
                pitch = LText("«Візьміть 600 ₴ міченими купюрами й проговоріть суму в мікрофон!»", "'Take 600 ₴ in marked bills and speak clearly toward my collar!'"),
                isStingTrap = true
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.AGE_RESTRICTION_NO_PERMIT),
            storyTag = "NABK_STING"
        )
    }

    fun createVolunteerOlya(daySpec: DayRuleSpec): Traveler {
        val fullName = LText("Ковальчук Ольга Сергіївна", "Olha Kovalchuk")
        val portrait = PortraitSpec(
            skinTone = 0,
            faceShape = 0,
            hairStyle = 2, // bun
            hairColor = 1,
            headwear = 3,  // hoodie
            expression = 4, // tired
            specialId = SpecialCharacterId.VOLUNTEER_OLYA
        )
        val docs = listOf(
            DocumentCard(
                id = "PASS-OLYA",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-204115", "No. KR-204115"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("27 р. • ЖІН", "27 y/o • F")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("В'ЇЗД → Kraina", "ENTRY → Kraina")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("01.09.2030", "2030-09-01"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "VEH-OLYA",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("ГУМАНІТАРНА ДЕКЛАРАЦІЯ", "HUMANITARIAN CARGO DECLARATION"),
                subtitle = LText("Зелений пікап L200 для Збройних Сил Kraina", "Green L200 Pickup for Kraina Defense Forces"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField("cargo", LText("Вантаж", "Cargo"), LText("Турнікети, генератори, маскувальні сітки (усі акти в наявності)", "Tourniquets, generators, camo nets (all paperwork complete)"))
                ),
                sealText = LText("ВОЛОНТЕРСЬКИЙ ШТАБ • ПЕРЕВІРЕНО", "VOLUNTEER HUB • VERIFIED")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 27,
            gender = Gender.FEMALE,
            direction = Direction.ENTRY_TO_KRAINA,
            role = HiddenRole.VOLUNTEER_REAL,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Привіт! Третю добу без сну жену пікап з турнікетами з Унії. Усі накладні на столі, пропусти швидше, будь ласка!»",
                "'Hi! Driving this pickup full of medical kits from Unia on zero sleep. All customs forms are on the desk, please clear me quickly!'"
            ),
            interrogationReply = LText(
                "«Усі печатки справжні, кожна коробка підписана підрозділом!»",
                "'Every stamp is authentic, every box is addressed to a unit!'"
            ),
            vehicleDescription = LText("Зелений пікап Mitsubishi L200", "Green Mitsubishi L200 Pickup"),
            vehicleSearchResult = LText("Огляд авто: пікап під зав'язку завантажений аптечками та генераторами згідно з накладною. Порушень немає.", "Vehicle search: loaded with medical kits and generators matching the manifest."),
            arrestSceneFull = LText("Затримання справжньої волонтерки викликає обурення всієї черги та скандал у новинах.", "Detaining a genuine volunteer sparks outrage across the queue and in the news."),
            arrestSceneTonedDown = LText("Волонтерський пікап безпідставно затримано на пункті пропуску.", "The volunteer pickup was unnecessarily delayed at the checkpoint."),
            hasHiddenContraband = false,
            bribeOffer = null,
            shouldBeApproved = true,
            validViolations = emptySet(),
            storyTag = "VOLUNTEER_OLYA"
        )
    }

    fun createShlyakhSmuggler(daySpec: DayRuleSpec): Traveler {
        val fullName = randomName(Gender.MALE)
        val portrait = randomPortrait(Gender.MALE).copy(expression = 1, scarOrDetail = 2)
        val docs = listOf(
            DocumentCard(
                id = "PASS-SHLYAKH",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-712004", "No. KR-712004"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("33 р. • ЧОЛ", "33 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("14.03.2028", "2028-03-14"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            ),
            DocumentCard(
                id = "EXEMPT-SHLYAKH",
                type = DocType.EXEMPTION_CERT,
                title = LText("ВИТЯГ ІЗ СИСТЕМИ «ШЛЯХ»", "SHLYAKH TRANSIT EXTRACT"),
                subtitle = LText("Водій гуманітарного рейсу (виїзд в один бік)", "Humanitarian Driver (one-way trip)"),
                fields = listOf(
                    DocField("holder", LText("Водій", "Driver"), fullName),
                    DocField(
                        "exp",
                        LText("Термін дозволу", "Permit Expiry"),
                        LText("Прострочено 4 місяці тому (попередні 3 водії цього фонду не повернулися)", "Expired 4 months ago (previous 3 drivers never returned)"),
                        discrepancy = DiscrepancyType.EXPIRED_DATE
                    )
                ),
                sealText = LText("ДОЗВІЛ ПРОСТРОЧЕНО", "PERMIT EXPIRED"),
                isSealAuthentic = false,
                sealDiscrepancy = DiscrepancyType.EXPIRED_DATE
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 33,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.SHLYAKH_SMUGGLER,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Доброго дня! Я волонтер за системою «Шлях», їду в Іспанію за касками! Повернуся чесне слово!»",
                "'Good day! I'm a Shlyakh volunteer driver heading to Spain for helmets! I'll totally come back, pinky swear!'"
            ),
            interrogationReply = LText(
                "«Чому в багажнику плавки, ласти й диплом програміста, а дозвіл прострочений?! Командире, ось 550 ₴, не псуй відпустку!»",
                "'Why do I have swim trunks, flippers, and an IT diploma in the trunk with an expired permit?! Boss, here's 550 ₴!'"
            ),
            vehicleDescription = LText("Білий Renault Master", "White Renault Master"),
            vehicleSearchResult = LText("Огляд авто: у вантажному відсіку — надувний фламінго, 6 валіз та квитки на літак із Варшави до Маямі.", "Vehicle search: an inflatable flamingo, 6 suitcases, and flight tickets to Miami."),
            arrestSceneFull = LText("Псевдо-волонтера висаджують із буса просто разом із надувним фламінго.", "The fake volunteer is escorted out of the van along with his inflatable flamingo."),
            arrestSceneTonedDown = LText("Водія з простроченим волонтерським дозволом не допущено до перетину кордону.", "The driver with an expired transit permit was denied exit."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 550,
                pitch = LText("«550 ₴ — і я привезу тобі магнітик з Барселони!»", "'550 ₴ and I'll send you a postcard from Barcelona!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.EXPIRED_DATE)
        )
    }

    fun createDeputySon(daySpec: DayRuleSpec): Traveler {
        val fullName = LText("Мажоренко Артур Вікторович", "Artur Mazhorenko")
        val portrait = PortraitSpec(
            skinTone = 0,
            faceShape = 0,
            hairStyle = 5,
            hairColor = 3,
            glasses = 2, // aviator sunglasses
            scarOrDetail = 3, // gold chain
            expression = 3,
            specialId = SpecialCharacterId.DEPUTY_SON_MAJORS
        )
        val docs = listOf(
            DocumentCard(
                id = "PASS-DEPUTY",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія ВІП-000777", "No. VIP-000777"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("24 р. • ЧОЛ", "24 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("ВИЇЗД → Унія", "EXIT → Unia")),
                    DocField(
                        "permit",
                        LText("Підстава для виїзду", "Exit Permit"),
                        LText("Візитка «Мій тато — депутат Віче» (офіційної довідки немає)", "Business card 'My Dad is an MP' (no valid exemption certificate)"),
                        discrepancy = DiscrepancyType.AGE_RESTRICTION_NO_PERMIT
                    )
                ),
                sealText = LText("ДМС KRAINA", "SMS KRAINA")
            )
        )

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 24,
            gender = Gender.MALE,
            direction = Direction.EXIT_TO_UNIA,
            role = HiddenRole.DEPUTY_SON,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Слиш, ти знаєш, хто мій тато у Віче?! Відкривай шлагбаум бігом, я запізнююся в Монако на вечірку! Ось 750 ₴ на чай і не біси мене!»",
                "'Hey, do you know who my dad is in Parliament?! Open the barrier now, I'm late for Monaco! Here's 750 ₴ tip, don't annoy me!'"
            ),
            interrogationReply = LText(
                "«Яка ще довідка?! Моя довідка — це дзвінок Пал Паличу! Пропускай або завтра стоятимеш на шлагбаумі в болоті!»",
                "'What exemption certificate?! My certificate is one phone call to Pal Palych! Let me pass or regret it!'"
            ),
            vehicleDescription = LText("Жовтий Porsche Cayenne на номерах «КАРМА»", "Yellow Porsche Cayenne 'KARMA'"),
            vehicleSearchResult = LText("У багажнику — ключки для гольфу та шампанське.", "In the trunk: golf clubs and champagne."),
            arrestSceneFull = LText("Мажора витягують із «Порше» під крики «Я зараз татові подзвоню!», а черга аплодує стоячи.", "The MP's son is dragged out of his Porsche screaming 'I'm calling my dad!' to standing applause from the queue."),
            arrestSceneTonedDown = LText("Сину депутата офіційно відмовлено у виїзді через відсутність законних підстав.", "The MP's son was formally denied exit due to lack of legal grounds."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 750,
                pitch = LText("«750 ₴ — і мій тато замовить за тебе слівце перед Паличем!»", "'750 ₴ and my dad puts in a good word with Palych!'")
            ),
            shouldBeApproved = false,
            validViolations = setOf(DiscrepancyType.AGE_RESTRICTION_NO_PERMIT),
            storyTag = "DEPUTY_SON"
        )
    }

    fun createLivestreamer(daySpec: DayRuleSpec): Traveler {
        val fullName = LText("Блогерчук Максим («ПравдаКордону»)", "Maksym Bloggerchuk ('BorderTruth')")
        val portrait = randomPortrait(Gender.MALE).copy(glasses = 3, headwear = 3, expression = 1)
        val docs = mutableListOf(
            DocumentCard(
                id = "PASS-STREAM",
                type = DocType.PASSPORT,
                title = LText("ПАСПОРТ KRAINA", "KRAINA PASSPORT"),
                subtitle = LText("Серія КР-612090", "No. KR-612090"),
                fields = listOf(
                    DocField("name", LText("ПІБ", "Full Name"), fullName),
                    DocField("age", LText("Вік / Стать", "Age / Sex"), LText("26 р. • ЧОЛ", "26 y/o • M")),
                    DocField("dir", LText("Напрямок", "Direction"), LText("В'ЇЗД → Kraina", "ENTRY → Kraina")),
                    DocField("exp", LText("Дійсний до", "Valid Until"), LText("18.06.2029", "2029-06-18"))
                ),
                sealText = LText("ДМС KRAINA • ДІЙСНИЙ", "SMS KRAINA • VALID")
            )
        )
        if (daySpec.requireVehicleDeclaration) {
            docs += DocumentCard(
                id = "VEH-STREAM",
                type = DocType.VEHICLE_CUSTOMS,
                title = LText("МИТНА ДЕКЛАРАЦІЯ АВТО", "VEHICLE CUSTOMS DECLARATION"),
                subtitle = LText("Червоний Ford Focus з селфі-палкою", "Red Ford Focus with selfie stick"),
                fields = listOf(
                    DocField("driver", LText("Водій", "Driver"), fullName),
                    DocField("cargo", LText("Вантаж", "Cargo"), LText("Кільцева лампа, мікрофон та 24 тисячі глядачів у прямому ефірі", "Ring light, microphone & 24,000 live viewers"))
                ),
                sealText = LText("МИТНИЦЯ KRAINA", "KRAINA CUSTOMS")
            )
        }

        return Traveler(
            id = nextId(),
            fullName = fullName,
            age = 26,
            gender = Gender.MALE,
            direction = Direction.ENTRY_TO_KRAINA,
            role = HiddenRole.LIVESTREAMER,
            portrait = portrait,
            passportPortrait = portrait,
            documents = docs,
            greeting = LText(
                "«Чат, привіт! Ми на кордоні Kraina! Інспекторе, я повертаюся ДОДОМУ на в'їзд, документи чисті, але я спеціально поклав 300 ₴ у паспорт — берете на камеру?!»",
                "'What's up chat! I'm ENTERING Kraina with 100% legal papers, but I put 300 ₴ in my passport as a social experiment — will the inspector take it on live stream?!'"
            ),
            interrogationReply = LText(
                "«Чат, дивіться, він читає мої папери! У мене всі документи законні, я їду НА В'ЇЗД! Головне — не беріть гроші на стрімі!»",
                "'Chat look, he's checking my papers! Everything is legal, I'm entering the country — just don't take the bait money on stream!'"
            ),
            vehicleDescription = LText("Червоний Ford Focus", "Red Ford Focus"),
            vehicleSearchResult = LText("У машині три штативи та наліпка «Знімаю корупцію».", "Inside: three tripods and a 'Filming Corruption' bumper sticker."),
            arrestSceneFull = LText("Ти скручуєш законного мандрівника прямо в прямому ефірі на 24 000 глядачів! Ролик миттєво залітає в тренди НАБК.", "You arrest a legal traveler live in front of 24,000 viewers! The clip goes viral at NABK."),
            arrestSceneTonedDown = LText("Безпідставна відмова блогеру в прямому ефірі викликала резонанс у соцмережах.", "Wrongfully denying the livestreamer went viral on social media."),
            hasHiddenContraband = false,
            bribeOffer = BribeOffer(
                amount = 300,
                pitch = LText("«Ось 300 ₴ під прицілом 24 000 глядачів у ТікТоці! Візьмете?!»", "'Here's 300 ₴ in front of 24,000 TikTok viewers! Gonna take it?!'"),
                isStingTrap = true
            ),
            shouldBeApproved = true,
            validViolations = emptySet(),
            storyTag = "LIVESTREAMER"
        )
    }
}
