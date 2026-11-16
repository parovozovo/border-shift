package com.lucky.bordershift.core.model

enum class Language {
    UK, EN
}

enum class ContentMode {
    FULL_18_PLUS,
    TONED_DOWN
}

data class LText(
    val uk: String,
    val en: String
) {
    fun get(lang: Language): String = when (lang) {
        Language.UK -> uk
        Language.EN -> en
    }
}

enum class Direction {
    EXIT_TO_UNIA,
    ENTRY_TO_KRAINA
}

enum class Gender {
    MALE,
    FEMALE
}

enum class HiddenRole {
    HONEST_CITIZEN,
    REFUGEE,
    DRAFT_DODGER_DENTIST,
    FAKE_FATHER_OF_THREE,
    FAKE_STUDENT_41,
    DISGUISED_AUNT_HALYA,
    COFFIN_SNEEZER,
    CAT_AMBER_SMUGGLER,
    VOLUNTEER_REAL,
    SHLYAKH_SMUGGLER,
    FEDERATION_SABOTEUR,
    SBK_UNDERCOVER,
    NABK_STING,
    DEPUTY_SON,
    LIVESTREAMER,
    STORY_STEPAN,
    STORY_TOLIK
}

enum class SpecialCharacterId {
    NONE,
    PALYCH_BOSS,
    TOLIK_SMUGGLER,
    MAJOR_TYKHYI,
    GRANDPA_STEPAN,
    VOLUNTEER_OLYA,
    DEPUTY_SON_MAJORS,
    AUNT_HALYA
}

data class PortraitSpec(
    val skinTone: Int = 0,          // 0..3
    val faceShape: Int = 0,         // 0..3 (round, square, long, chubby)
    val hairStyle: Int = 0,         // 0..5 (short, receding, bun, long, buzz, curly)
    val hairColor: Int = 0,         // 0..4 (dark, brown, grey, blonde, ginger)
    val facialHair: Int = 0,        // 0=none, 1=stubble, 2=mustache, 3=beard, 4=cossack mustache
    val glasses: Int = 0,           // 0=none, 1=round, 2=aviator sunglasses, 3=thick frames
    val headwear: Int = 0,          // 0=none, 1=flat cap, 2=headscarf, 3=hoodie, 4=officer cap, 5=priest hat
    val scarOrDetail: Int = 0,      // 0=none, 1=left cheek scar, 2=sweat drops, 3=gold chain, 4=bandaid
    val expression: Int = 0,        // 0=neutral, 1=sly smile, 2=nervous, 3=angry, 4=tired
    val specialId: SpecialCharacterId = SpecialCharacterId.NONE
)

enum class DocType {
    PASSPORT,
    MILITARY_ID,
    EXEMPTION_CERT,
    VEHICLE_CUSTOMS
}

enum class DiscrepancyType(
    val title: LText,
    val requiresDetention: Boolean,
    val actionHint: LText
) {
    EXPIRED_DATE(
        title = LText("Прострочений документ", "Expired Document"),
        requiresDetention = false,
        actionHint = LText("Формальне порушення → ✖ ВІДМОВИТИ", "Formal violation → ✖ DENY")
    ),
    NAME_MISMATCH(
        title = LText("Розбіжність ПІБ у документах", "Name Mismatch Across Documents"),
        requiresDetention = true,
        actionHint = LText("Чужий документ (Кримінал) → 🚨 АРЕШТ", "Stolen/Fake ID (Crime) → 🚨 DETAIN")
    ),
    PHOTO_MISMATCH(
        title = LText("Чуже фото в паспорті", "Passport Photo Mismatch"),
        requiresDetention = true,
        actionHint = LText("Підміна особи (Кримінал) → 🚨 АРЕШТ", "Impersonation (Crime) → 🚨 DETAIN")
    ),
    FAKE_ISSUER_SEAL(
        title = LText("Підроблена печатка / ліва установа", "Forged Seal / Invalid Authority"),
        requiresDetention = true,
        actionHint = LText("Підробка документів (Кримінал) → 🚨 АРЕШТ", "Forged Seal (Crime) → 🚨 DETAIN")
    ),
    INVALID_QR_CODE(
        title = LText("Код «Облік+» недійсний / у розшуку", "Oblik+ QR Code Invalid / Wanted"),
        requiresDetention = true,
        actionHint = LText("Розшук у реєстрі → 🚨 АРЕШТ", "Registry Wanted → 🚨 DETAIN")
    ),
    AGE_RESTRICTION_NO_PERMIT(
        title = LText("Чоловік 18–60 на виїзд без підстави", "Male 18–60 Exiting Without Permit"),
        requiresDetention = false,
        actionHint = LText("Немає підстави на виїзд → ✖ ВІДМОВИТИ", "No exit permit → ✖ DENY")
    ),
    CONTRABAND_CARGO(
        title = LText("Контрабанда / порушення в авто", "Contraband / Hidden Cargo in Vehicle"),
        requiresDetention = true,
        actionHint = LText("Контрабанда / Тайник → 🚨 АРЕШТ", "Contraband / Stowaways → 🚨 DETAIN")
    ),
    WANTED_CRIMINAL_OR_SPY(
        title = LText("Особа з орієнтування СБК (шпигун/ДРГ)", "SBK Wanted Target / Saboteur"),
        requiresDetention = true,
        actionHint = LText("Особливо небезпечний (СБК) → 🚨 АРЕШТ!", "High-Value SBK Target → 🚨 DETAIN!")
    )
}

data class DocField(
    val key: String,
    val label: LText,
    val value: LText,
    val discrepancy: DiscrepancyType? = null
)

data class DocumentCard(
    val id: String,
    val type: DocType,
    val title: LText,
    val subtitle: LText,
    val fields: List<DocField>,
    val sealText: LText,
    val isSealAuthentic: Boolean = true,
    val sealDiscrepancy: DiscrepancyType? = null
)

data class BribeOffer(
    val amount: Int,
    val pitch: LText,
    val isStingTrap: Boolean = false,
    val syndicateFavor: Boolean = false
)

enum class VehicleVisualType {
    SEDAN_STANDARD,
    PORSCHE_YELLOW,
    HEARSE_BLACK,
    PICKUP_CAMO,
    MINIVAN_WHITE,
    SUV_BLACK,
    MOSKVITCH_BLUE,
    BUS_ORANGE
}

enum class BarrierVisualState {
    CLOSED,
    OPEN_APPROVED,
    SBK_ARREST_FLASH
}

data class Traveler(
    val id: String,
    val fullName: LText,
    val age: Int,
    val gender: Gender,
    val direction: Direction,
    val role: HiddenRole,
    val portrait: PortraitSpec,
    val passportPortrait: PortraitSpec,
    val documents: List<DocumentCard>,
    val greeting: LText,
    val interrogationReply: LText,
    val vehicleDescription: LText,
    val vehicleSearchResult: LText,
    val arrestSceneFull: LText,
    val arrestSceneTonedDown: LText,
    val hasHiddenContraband: Boolean,
    val bribeOffer: BribeOffer? = null,
    val shouldBeApproved: Boolean,
    val validViolations: Set<DiscrepancyType>,
    val isWantedTarget: Boolean = false,
    val storyTag: String? = null
) {
    val requiresCriminalDetention: Boolean
        get() = isWantedTarget || validViolations.any { it.requiresDetention }

    val vehicleVisualType: VehicleVisualType
        get() = when (role) {
            HiddenRole.DEPUTY_SON -> VehicleVisualType.PORSCHE_YELLOW
            HiddenRole.COFFIN_SNEEZER -> VehicleVisualType.HEARSE_BLACK
            HiddenRole.VOLUNTEER_REAL -> VehicleVisualType.PICKUP_CAMO
            HiddenRole.STORY_TOLIK, HiddenRole.SHLYAKH_SMUGGLER -> VehicleVisualType.MINIVAN_WHITE
            HiddenRole.FEDERATION_SABOTEUR, HiddenRole.NABK_STING -> VehicleVisualType.SUV_BLACK
            HiddenRole.STORY_STEPAN -> VehicleVisualType.MOSKVITCH_BLUE
            HiddenRole.DISGUISED_AUNT_HALYA -> VehicleVisualType.BUS_ORANGE
            else -> VehicleVisualType.SEDAN_STANDARD
        }
}

enum class DecisionType {
    APPROVE,
    DENY,
    DETAIN
}

enum class FactionId(val title: LText) {
    PALYCH(LText("Пал Палич (Начальник)", "Pal Palych (Shift Boss)")),
    TOLIK(LText("Толік «Бусик» (Синдикат)", "Tolik 'Minivan' (Syndicate)")),
    SBK(LText("Майор «Тихий» (СБК)", "Major 'Quiet' (SBK Counter-Intel)"))
}

data class DayRuleSpec(
    val dayNumber: Int,
    val dateLabel: LText,
    val headline: LText,
    val radioNews: LText,
    val bossBriefing: LText,
    val rulesList: List<LText>,
    val maleExitBanActive: Boolean = true,
    val requireOblikQrForMales: Boolean = false,
    val requireVehicleDeclaration: Boolean = false,
    val wantedTraitHint: LText? = null,
    val bossQuotaCut: Int = 200,
    val hasAirRaidSirenEvent: Boolean = false
)

data class DelayedConsequence(
    val triggerDay: Int,
    val headline: LText,
    val descriptionFull: LText,
    val descriptionTonedDown: LText,
    val moneyDelta: Int = 0,
    val riskDelta: Int = 0,
    val sbkRepDelta: Int = 0,
    val tolikRepDelta: Int = 0,
    val palychRepDelta: Int = 0,
    val familyMoraleDelta: Int = 0
)

data class HomeExpense(
    val id: String,
    val title: LText,
    val cost: Int,
    val familyMoraleBoost: Int,
    val escapeFundContribution: Int = 0,
    val riskReduction: Int = 0
)

data class AssetUpgrade(
    val id: String,
    val icon: String,
    val title: LText,
    val subtitle: LText,
    val cost: Int,
    val dailyPassiveIncome: Int = 0,
    val dailyRiskIncrease: Int = 0,
    val extraShiftSeconds: Int = 0,
    val freeFastVehicleSearch: Boolean = false,
    val tolikRepBoost: Int = 0,
    val palychRepBoost: Int = 0,
    val familyMoraleBoost: Int = 0,
    val unlocksVillaEnding: Boolean = false
)

data class EncounterOption(
    val id: String,
    val label: LText,
    val outcomeText: LText,
    val moneyDelta: Int = 0,
    val timeDeltaSeconds: Int = 0,
    val riskDelta: Int = 0,
    val sbkRepDelta: Int = 0,
    val tolikRepDelta: Int = 0,
    val palychRepDelta: Int = 0,
    val familyMoraleDelta: Int = 0
)

data class MidShiftEncounter(
    val id: String,
    val title: LText,
    val description: LText,
    val speakerPortrait: PortraitSpec,
    val options: List<EncounterOption>
)

enum class SandboxModifier(
    val title: LText,
    val description: LText,
    val bribeMultiplier: Double = 1.0,
    val detentionBonusExtra: Int = 0,
    val forceOblikQr: Boolean = false,
    val forceVehicleDecl: Boolean = true,
    val forceSiren: Boolean = false
) {
    NONE(
        title = LText("Звичайний режим служби", "Standard Border Shift"),
        description = LText("Стандартні тарифи та перевірки на пункті пропуску.", "Standard checkpoint tariffs and inspections.")
    ),
    OLIGARCH_EXODUS(
        title = LText("💰 Указ дня: «Ніч олігархів та мажорів»", "💰 Daily Decree: 'Night of Oligarchs'"),
        description = LText("Товстосуми масово тікають за кордон — усі пропозиції хабарів сьогодні ПОДВІЙНІ (x2)!", "VIPs are fleeing in droves — all bribe offers today are DOUBLED (x2)!"),
        bribeMultiplier = 2.0,
        forceVehicleDecl = true
    ),
    MARTIAL_AUDIT(
        title = LText("🚨 Указ дня: «Спецперевірка зі Столиці»", "🚨 Daily Decree: 'Capital City Audit'"),
        description = LText("Комісія штабу на пункті! За кожен обґрунтований АРЕШТ сьогодні платять +220 ₴ премії!", "HQ auditors on site! Every valid DETENTION today pays an extra +220 ₴ bonus!"),
        detentionBonusExtra = 220,
        forceVehicleDecl = true,
        forceSiren = true
    ),
    TOTAL_DIGITAL_OBLIK(
        title = LText("📱 Указ дня: «Рейд Облік+»", "📱 Daily Decree: 'Digital Oblik+ Raid'"),
        description = LText("Усі чоловіки 18–60 зобов'язані пред'явити і довідку, і дійсний QR-код «Облік+».", "All males 18–60 must present both an Exemption Permit and a valid 'Oblik+' QR code."),
        forceOblikQr = true,
        forceVehicleDecl = true
    ),
    CONTRABAND_BOOM(
        title = LText("📦 Указ дня: «Сигаретний бум»", "📦 Daily Decree: 'Contraband Surge'"),
        description = LText("Митниця попереджає про навалу контрабанди. Премія за затримання авто з тайником +180 ₴!", "Customs reports a smuggling wave. Detention bonus for contraband vehicles +180 ₴!"),
        detentionBonusExtra = 180,
        forceVehicleDecl = true
    )
}

enum class InspectorRank(
    val minDay: Int,
    val title: LText,
    val salaryPerTraveler: Int
) {
    JUNIOR(1, LText("Молодший інспектор", "Junior Inspector"), 120),
    SENIOR(3, LText("Старший зміни", "Senior Shift Inspector"), 150),
    DEPUTY(5, LText("Заступник Пал Палича", "Palych's Deputy"), 185),
    CHIEF(8, LText("Старший офіцер митниці", "Chief Customs Officer"), 220);

    companion object {
        fun forDay(dayNumber: Int): InspectorRank =
            entries.lastOrNull { dayNumber >= it.minDay } ?: JUNIOR
    }
}

enum class EndingId(
    val title: LText,
    val subtitle: LText,
    val epilogueFull: LText,
    val epilogueTonedDown: LText
) {
    SANDBOX_CUSTOMS_BARON(
        title = LText("КІНЦІВКА ПІСОЧНИЦІ: БАРОН ЗАХІДНОЇ МИТНИЦІ", "SANDBOX ENDING: BARON OF WESTERN CUSTOMS"),
        subtitle = LText("Ти викупив крісло начальника пункту пропуску, а Пал Палича поставив на шлагбаум під дощем!", "You bought out the Checkpoint Chief's chair and demoted Pal Palych to barrier duty in the rain!"),
        epilogueFull = LText(
            "Маючи чорний BMW X5, квартиру на тещу в Київграді та валізу готівки для «конкурсної комісії» у столиці, ти офіційно очолив пункт пропуску «Захід-Kraina». Тепер ти сидиш у шкіряному кріслі з італійською кавомашиною, а Пал Палич щовечора заносить ТОБІ частку зі зміни, тремтячими руками рахуючи купюри.",
            "With a black BMW X5, a Kyivhrad apartment in your mother-in-law's name, and a suitcase of cash for the capital's 'selection committee', you officially took over Checkpoint West-Kraina. Now you sit in the leather chair while Pal Palych brings YOU the evening cut with trembling hands."
        ),
        epilogueTonedDown = LText(
            "Завдяки накопиченим статкам і зв'язкам ти посів крісло начальника всього пункту пропуску, а Пал Палич перейшов у твоє підпорядкування.",
            "Through accumulated wealth and connections, you became Chief of the entire checkpoint, with Pal Palych now reporting to you."
        )
    ),
    SANDBOX_SBK_COLONEL(
        title = LText("КІНЦІВКА ПІСОЧНИЦІ: ПОЛКОВНИК КОНТРРОЗВІДКИ СБК", "SANDBOX ENDING: SBK COUNTER-INTELLIGENCE COLONEL"),
        subtitle = LText("Ти переловив мережу шпигунів та контрабандистів і очолив контррозвідку кордону", "You dismantled the spy and smuggling networks and took command of border counter-intelligence"),
        epilogueFull = LText(
            "Твій пункт пропуску став неприступною фортецею. Десятки затриманих диверсантів, розгромлені схеми Толіка та кришталеве досьє вразили штаб. Майор «Тихий» особисто вручив тобі погони полковника СБК і ключі від службового кабінету в столиці. Пал Палич при згадці твого імені витягується по стійці «струнко».",
            "Your checkpoint became an impenetrable fortress. Dozens of detained saboteurs and dismantled smuggling rings impressed HQ. Major 'Quiet' personally handed you Colonel's epaulets and an office in the capital. Pal Palych stands at attention whenever your name is mentioned."
        ),
        epilogueTonedDown = LText(
            "За бездоганну службу та рекордну кількість затриманих порушників тебе підвищено до керівника прикордонної контррозвідки СБК.",
            "For impeccable service and a record number of detained operatives, you were promoted to head of SBK border counter-intelligence."
        )
    ),
    OLIGARCH_VILLA(
        title = LText("КІНЦІВКА 5: КОРОЛЬ КОРДОНУ — ВІЛЛА В ІСПАНІЇ", "ENDING 5: BORDER OLIGARCH — VILLA IN SPAIN"),
        subtitle = LText("Ти скупляв нерухомість у Київграді та Європі й виїхав за VIP-паспортом як інвестор", "You bought up apartments in Kyivhrad and Europe and flew out with an investor passport"),
        epilogueFull = LText(
            "Поки інші ховали дрібні купюри в термосах, ти збудував справжню імперію: квартира на тещу в Київграді здається в оренду, BMW X5 продано, а сам ти сидиш біля басейну власної вілли в Аліканте. Пал Палич досі шле тобі листівки і просить узяти його садівником.",
            "While others hid crumpled bills in thermoses, you built an empire: your mother-in-law's Kyivhrad flat collects rent, the BMW X5 is sold, and you lounge by the pool of your own villa in Alicante. Pal Palych still texts asking if you need a gardener."
        ),
        epilogueTonedDown = LText(
            "Завдяки купленій європейській нерухомості та заощадженням ти легально переїхав із сім'єю у власні апартаменти на узбережжі Унії.",
            "Thanks to your purchased European real estate and savings, you legally relocated with your family to your own coastal apartment in Unia."
        )
    ),
    ESCAPED_ABROAD(
        title = LText("КІНЦІВКА 1: КВИТОК В ОДИН КІНЕЦЬ", "ENDING 1: ONE-WAY TICKET"),
        subtitle = LText("Ти сам заплатив Толіку й перетнув шлагбаум у багажнику «гуманітарного» буса", "You paid Tolik and crossed the barrier in the back of a 'humanitarian' van"),
        epilogueFull = LText(
            "Уночі перед закінченням твого бронювання ти віддав накоплені конверти Толіку «Бусику». На сусідньому пункті колега мовчки поставив штамп, навіть не зазираючи в кузов. Тепер ти п'єш дешеву каву на вокзалі в Унії, гортаючи новини з Kraina.",
            "The night before your exemption expired, you handed your stashed envelopes to Tolik. At the neighboring post, a colleague stamped the papers without looking inside. Now you drink cheap coffee at a station in Unia, scrolling news from Kraina."
        ),
        epilogueTonedDown = LText(
            "Ти використав зібраний «фонд утечі» та зв'язки Толіка, щоб таємно виїхати до Унії разом із родиною перед тим, як закінчилося твоє бронювання.",
            "You used your saved Escape Fund and Tolik's network to quietly cross into Unia with your family before your exemption expired."
        )
    ),
    ARRESTED_BY_NABK(
        title = LText("КІНЦІВКА 2: КАЙДАНКИ НА ПУНКТІ", "ENDING 2: HANDCUFFS AT THE BOOTH"),
        subtitle = LText("Пал Палич здав тебе слідчим НАБК, щоб врятувати власну шкуру", "Pal Palych ratted you out to anti-corruption investigators to save himself"),
        epilogueFull = LText(
            "Спецпризначенці НАБК вибили двері будки просто посеред зміни, поклавши тебе обличчям у розсипані купюри. Пал Палич стояв поруч як «ключовий свідок обвинувачення». У вечірніх новинах показали твій термокухоль, набитий міченими гривнями.",
            "NABK tactical officers smashed the booth door mid-shift, pinning you face-down into scattered banknotes. Pal Palych stood by as the 'star prosecution witness'. Evening news showed your thermos stuffed with marked bills."
        ),
        epilogueTonedDown = LText(
            "До пункту пропуску прибула перевірка НАБК. Пал Палич переклав усю провину на тебе. Тебе відсторонили від служби та передали справу до суду.",
            "An NABK inspection arrived at the checkpoint. Pal Palych shifted all blame onto you. You were suspended and referred to court."
        )
    ),
    SBK_COMMENDATION(
        title = LText("КІНЦІВКА 3: ТИХИЙ ЩИТ KRAINA", "ENDING 3: SILENT SHIELD OF KRAINA"),
        subtitle = LText("Ти викрив мережу диверсантів Федерації й не продався синдикату", "You exposed the Federation saboteur ring and refused to sell out"),
        epilogueFull = LText(
            "У холодильнику вдома не густо, а Пал Палич сичить крізь зуби, бо ти зірвав йому «жирні» зміни. Зате майор «Тихий» поклав на твій стіл підписане продовження бронювання та перевод у контррозвідку кордону. Сім'я з тобою, совість чиста.",
            "Your fridge at home isn't full, and Palych hisses because you ruined his lucrative shifts. Yet Major 'Quiet' placed a signed exemption renewal and a counter-intelligence promotion on your desk. Your family is together, your conscience clear."
        ),
        epilogueTonedDown = LText(
            "Завдяки пильності ти затримав небезпечних агентів і зберіг честь служби. Майор СБК продовжив твоє бронювання та представив до нагороди.",
            "Through vigilance you detained dangerous agents and kept your honor. The SBK Major renewed your exemption and recommended you for a medal."
        )
    ),
    MOBILIZED_OR_BROKEN(
        title = LText("КІНЦІВКА 4: СПИСАНИЙ ІНСПЕКТОР", "ENDING 4: WRITTEN OFF"),
        subtitle = LText("Гроші скінчилися, сім'я на межі, а бронювання не продовжили", "Out of money, family exhausted, and your border exemption was revoked"),
        epilogueFull = LText(
            "Без грошей на частку Паличу й без підтримки СБК твій рапорт на продовження бронювання «загубився» у штабі. Уранці замість ключів від будки тобі вручили припис на збори в навчальний центр.",
            "With no cash for Palych's cut and no backing from SBK, your exemption renewal 'went missing' at HQ. In the morning, instead of booth keys, you were handed transfer orders to a training camp."
        ),
        epilogueTonedDown = LText(
            "Через борги та конфлікти з керівництвом тебе перевели з прикордонного пункту пропуску в інший підрозділ.",
            "Due to debts and conflicts with management, you were transferred away from the border checkpoint."
        )
    )
}
