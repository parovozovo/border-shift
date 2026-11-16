package com.lucky.bordershift.core.sim

import com.lucky.bordershift.core.gen.CampaignData
import com.lucky.bordershift.core.gen.TravelerGenerator
import com.lucky.bordershift.core.model.*

enum class ScreenPhase {
    AGE_GATE,
    MAIN_MENU,
    MORNING_BRIEFING,
    BOOTH_SHIFT,
    SHIFT_SUMMARY,
    HOME_EVENING,
    ENDING
}

data class DecisionFeedback(
    val wasCorrect: Boolean,
    val title: LText,
    val detail: LText,
    val moneyDelta: Int,
    val riskDelta: Int
)

data class ShiftSummaryReport(
    val dayNumber: Int,
    val processedCount: Int,
    val correctCount: Int,
    val mistakesCount: Int,
    val detainedCount: Int,
    val salaryEarned: Int,
    val detentionBonuses: Int,
    val bribesCollected: Int,
    val finesDeducted: Int,
    val bossCutRequired: Int
)

data class GameState(
    val language: Language = Language.UK,
    val contentMode: ContentMode = ContentMode.FULL_18_PLUS,
    val ageConfirmed: Boolean = false,
    val phase: ScreenPhase = ScreenPhase.AGE_GATE,
    val isSandboxMode: Boolean = false,
    val currentDayIndex: Int = 0, // 0..4 for Act I
    val daySpec: DayRuleSpec = CampaignData.actOneDays.first(),
    val queue: List<Traveler> = emptyList(),
    val currentTravelerIndex: Int = 0,
    val shiftSecondsRemaining: Int = 180,
    val sirenActive: Boolean = false,
    val sirenResolvedForDay: Boolean = false,
    val vehicleInspectedForCurrent: Boolean = false,
    val interrogatedForCurrent: Boolean = false,
    val bribeAcceptedForCurrent: Boolean = false,
    val spottedDiscrepancies: Set<DiscrepancyType> = emptySet(),
    val lastFeedback: DecisionFeedback? = null,
    // Persistent campaign economy & reputation
    val money: Int = 350,
    val escapeFund: Int = 0,
    val familyMorale: Int = 75,     // 0..100
    val nabkRisk: Int = 10,         // 0..100
    val palychRep: Int = 50,        // 0..100
    val tolikRep: Int = 30,         // 0..100
    val sbkRep: Int = 50,           // 0..100
    // Shift counters
    val shiftProcessed: Int = 0,
    val shiftCorrect: Int = 0,
    val shiftMistakes: Int = 0,
    val shiftDetained: Int = 0,
    val shiftBribesTotal: Int = 0,
    val shiftFinesTotal: Int = 0,
    val pendingConsequences: List<DelayedConsequence> = emptyList(),
    val todayTriggeredConsequences: List<DelayedConsequence> = emptyList(),
    val shiftReport: ShiftSummaryReport? = null,
    val purchasedExpensesToday: Set<String> = emptySet(),
    val ownedAssets: Set<String> = emptySet(),
    val activeEncounter: MidShiftEncounter? = null,
    val encounterTriggeredForDay: Boolean = false,
    val barrierVisualState: BarrierVisualState = BarrierVisualState.CLOSED,
    val sandboxModifier: SandboxModifier = SandboxModifier.NONE,
    val totalCareerDetained: Int = 0,
    val activeEnding: EndingId? = null
) {
    val currentTraveler: Traveler?
        get() = queue.getOrNull(currentTravelerIndex)

    val currentRank: InspectorRank
        get() = if (isSandboxMode) InspectorRank.forDay(daySpec.dayNumber) else InspectorRank.JUNIOR

    val canClaimCustomsBaronEnding: Boolean
        get() = isSandboxMode && "euro_bmw" in ownedAssets && "kyivhrad_flat" in ownedAssets && money >= 2000

    val canClaimSbkColonelEnding: Boolean
        get() = isSandboxMode && sbkRep >= 85 && totalCareerDetained >= 6 && nabkRisk < 45

    val escapeFundTarget: Int
        get() = if (isSandboxMode) CampaignData.ESCAPE_FUND_SANDBOX_TARGET else CampaignData.ESCAPE_FUND_CAMPAIGN_TARGET

    val escapeTolikRepRequired: Int
        get() = if (isSandboxMode) 65 else 55

    val hasEspressoMachine: Boolean
        get() = "espresso_machine" in ownedAssets

    val hasFastUvScanner: Boolean
        get() = "uv_endoscope" in ownedAssets

    val hasSpainVilla: Boolean
        get() = "spain_villa" in ownedAssets

    val dailyPassiveRentIncome: Int
        get() = CampaignData.assetUpgrades
            .filter { it.id in ownedAssets }
            .sumOf { it.dailyPassiveIncome }

    val dailyAssetRiskIncrease: Int
        get() = CampaignData.assetUpgrades
            .filter { it.id in ownedAssets }
            .sumOf { it.dailyRiskIncrease }

    val droneApproachingSkyWarning: Boolean
        get() = daySpec.hasAirRaidSirenEvent &&
            !sirenResolvedForDay &&
            !sirenActive &&
            shiftSecondsRemaining in 201..218
}

class GameEngine(seed: Long = 42L) {

    private val generator = TravelerGenerator(seed)

    var state: GameState = GameState()
        private set

    fun setLanguage(language: Language) {
        state = state.copy(language = language)
    }

    fun confirmAgeAndContentMode(contentMode: ContentMode) {
        state = state.copy(
            ageConfirmed = true,
            contentMode = contentMode,
            phase = ScreenPhase.MAIN_MENU
        )
    }

    fun toggleContentMode() {
        val next = if (state.contentMode == ContentMode.FULL_18_PLUS) {
            ContentMode.TONED_DOWN
        } else {
            ContentMode.FULL_18_PLUS
        }
        state = state.copy(contentMode = next)
    }

    fun startNewCampaign(sandbox: Boolean = false) {
        val baseFirstDay = CampaignData.actOneDays.first()
        val initialModifier = if (sandbox) SandboxModifier.OLIGARCH_EXODUS else SandboxModifier.NONE
        val firstDay = if (sandbox) {
            baseFirstDay.copy(
                dateLabel = LText("Пісочниця • День 1", "Sandbox • Day 1"),
                headline = initialModifier.title,
                radioNews = initialModifier.description,
                requireVehicleDeclaration = initialModifier.forceVehicleDecl
            )
        } else {
            baseFirstDay
        }
        val queueSize = if (sandbox) 12 else 9
        val shiftSec = if (sandbox) 300 else 270
        val queue = generator.generateDailyQueue(firstDay, count = queueSize)
        state = state.copy(
            phase = ScreenPhase.MORNING_BRIEFING,
            isSandboxMode = sandbox,
            currentDayIndex = 0,
            daySpec = firstDay,
            queue = queue,
            currentTravelerIndex = 0,
            shiftSecondsRemaining = shiftSec,
            sirenActive = false,
            sirenResolvedForDay = false,
            vehicleInspectedForCurrent = false,
            interrogatedForCurrent = false,
            bribeAcceptedForCurrent = false,
            spottedDiscrepancies = emptySet(),
            lastFeedback = null,
            money = 350,
            escapeFund = 0,
            familyMorale = 75,
            nabkRisk = 10,
            palychRep = 50,
            tolikRep = 30,
            sbkRep = 50,
            shiftProcessed = 0,
            shiftCorrect = 0,
            shiftMistakes = 0,
            shiftDetained = 0,
            shiftBribesTotal = 0,
            shiftFinesTotal = 0,
            pendingConsequences = emptyList(),
            todayTriggeredConsequences = emptyList(),
            shiftReport = null,
            purchasedExpensesToday = emptySet(),
            ownedAssets = emptySet(),
            activeEncounter = null,
            encounterTriggeredForDay = false,
            barrierVisualState = BarrierVisualState.CLOSED,
            sandboxModifier = initialModifier,
            totalCareerDetained = 0,
            activeEnding = null
        )
    }

    fun beginBoothShift() {
        val baseSec = if (state.isSandboxMode) 300 else 270
        val bonusSec = if (state.hasEspressoMachine) 35 else 0
        val firstTraveler = state.queue.firstOrNull()
        val autoSpotted = if (state.hasFastUvScanner && firstTraveler != null) {
            firstTraveler.validViolations.filter {
                it == DiscrepancyType.FAKE_ISSUER_SEAL || it == DiscrepancyType.INVALID_QR_CODE
            }.toSet()
        } else {
            emptySet()
        }
        state = state.copy(
            phase = ScreenPhase.BOOTH_SHIFT,
            shiftSecondsRemaining = baseSec + bonusSec,
            currentTravelerIndex = 0,
            vehicleInspectedForCurrent = false,
            interrogatedForCurrent = false,
            bribeAcceptedForCurrent = false,
            spottedDiscrepancies = autoSpotted,
            activeEncounter = null,
            encounterTriggeredForDay = false,
            barrierVisualState = BarrierVisualState.CLOSED,
            lastFeedback = null
        )
    }

    fun tickSecond() {
        if (state.phase != ScreenPhase.BOOTH_SHIFT) return
        val nextSec = (state.shiftSecondsRemaining - 1).coerceAtLeast(0)
        val shouldTriggerSiren = state.daySpec.hasAirRaidSirenEvent &&
            !state.sirenResolvedForDay &&
            !state.sirenActive &&
            nextSec == 200

        state = state.copy(
            shiftSecondsRemaining = nextSec,
            sirenActive = if (shouldTriggerSiren) true else state.sirenActive
        )

        if (nextSec == 0) {
            finishShift()
        }
    }

    fun resolveSiren(goToShelter: Boolean) {
        if (!state.sirenActive) return
        state = if (goToShelter) {
            state.copy(
                sirenActive = false,
                sirenResolvedForDay = true,
                shiftSecondsRemaining = (state.shiftSecondsRemaining - 35).coerceAtLeast(10),
                sbkRep = (state.sbkRep + 5).coerceIn(0, 100)
            )
        } else {
            // Stay in booth during siren: keep time + receive bonus "rush" tip, slight risk
            state.copy(
                sirenActive = false,
                sirenResolvedForDay = true,
                money = state.money + 150,
                shiftBribesTotal = state.shiftBribesTotal + 150,
                nabkRisk = (state.nabkRisk + 6).coerceIn(0, 100)
            )
        }
    }

    fun spotDiscrepancy(discrepancy: DiscrepancyType) {
        state = state.copy(
            spottedDiscrepancies = state.spottedDiscrepancies + discrepancy,
            interrogatedForCurrent = true
        )
    }

    fun interrogateTraveler() {
        val traveler = state.currentTraveler ?: return
        state = state.copy(
            interrogatedForCurrent = true,
            spottedDiscrepancies = state.spottedDiscrepancies + traveler.validViolations
        )
    }

    fun inspectVehicle() {
        val traveler = state.currentTraveler ?: return
        val newSpotted = if (traveler.hasHiddenContraband) {
            state.spottedDiscrepancies + DiscrepancyType.CONTRABAND_CARGO
        } else {
            state.spottedDiscrepancies
        }
        val timeCost = if (state.hasFastUvScanner) 0 else 8
        state = state.copy(
            vehicleInspectedForCurrent = true,
            spottedDiscrepancies = newSpotted,
            shiftSecondsRemaining = (state.shiftSecondsRemaining - timeCost).coerceAtLeast(5)
        )
    }

    fun resolveEncounter(optionId: String) {
        val encounter = state.activeEncounter ?: return
        val option = encounter.options.firstOrNull { it.id == optionId } ?: encounter.options.first()
        state = state.copy(
            activeEncounter = null,
            encounterTriggeredForDay = true,
            money = (state.money + option.moneyDelta).coerceAtLeast(0),
            shiftSecondsRemaining = (state.shiftSecondsRemaining + option.timeDeltaSeconds).coerceAtLeast(10),
            nabkRisk = (state.nabkRisk + option.riskDelta).coerceIn(0, 100),
            sbkRep = (state.sbkRep + option.sbkRepDelta).coerceIn(0, 100),
            tolikRep = (state.tolikRep + option.tolikRepDelta).coerceIn(0, 100),
            palychRep = (state.palychRep + option.palychRepDelta).coerceIn(0, 100),
            familyMorale = (state.familyMorale + option.familyMoraleDelta).coerceIn(0, 100),
            lastFeedback = DecisionFeedback(
                wasCorrect = option.moneyDelta >= 0 && option.riskDelta <= 10,
                title = encounter.title,
                detail = option.outcomeText,
                moneyDelta = option.moneyDelta,
                riskDelta = option.riskDelta
            )
        )
    }

    fun acceptBribe() {
        val traveler = state.currentTraveler ?: return
        val offer = traveler.bribeOffer ?: return
        if (state.bribeAcceptedForCurrent) return

        val riskJump = when {
            offer.isStingTrap -> 35
            offer.syndicateFavor -> 6
            else -> 8
        }
        val newConsequences = state.pendingConsequences.toMutableList()
        if (offer.isStingTrap) {
            newConsequences += DelayedConsequence(
                triggerDay = state.daySpec.dayNumber + 1,
                headline = LText("СКАНДАЛ: ЗАПИС ПРИХОВАНОЇ КАМЕРИ НА ПУНКТІ!", "SCandal: HIDDEN CAMERA FOOTAGE LEAKED!"),
                descriptionFull = LText(
                    "Твоє обличчя з конвертом у руках залетіло в рапорт НАБК та місцеві Телеграм-канали. Ризик арешту різко зріс!",
                    "Your face holding an envelope landed in an NABK dossier and local Telegram channels. Arrest risk surged!"
                ),
                descriptionTonedDown = LText(
                    "Факт отримання неправомірної вигоди зафіксовано перевіряльниками НАБК.",
                    "The bribe acceptance was recorded by anti-corruption monitors."
                ),
                moneyDelta = -200,
                riskDelta = 15
            )
        }

        val effectiveBribeAmount = (offer.amount * state.sandboxModifier.bribeMultiplier).toInt()
        state = state.copy(
            bribeAcceptedForCurrent = true,
            money = state.money + effectiveBribeAmount,
            shiftBribesTotal = state.shiftBribesTotal + effectiveBribeAmount,
            nabkRisk = (state.nabkRisk + riskJump).coerceIn(0, 100),
            tolikRep = if (offer.syndicateFavor) (state.tolikRep + 20).coerceIn(0, 100) else state.tolikRep,
            pendingConsequences = newConsequences
        )
    }

    fun makeDecision(decision: DecisionType) {
        val traveler = state.currentTraveler ?: return

        val isApproval = decision == DecisionType.APPROVE
        val isDetention = decision == DecisionType.DETAIN

        // Evaluate rule correctness with clear distinction between DENY (formal) and DETAIN (criminal/security)
        val excessiveDetentionOnFormalOnly = isDetention &&
            !traveler.shouldBeApproved &&
            !traveler.requiresCriminalDetention

        val ruleCorrect = when (decision) {
            DecisionType.APPROVE -> traveler.shouldBeApproved
            DecisionType.DENY -> !traveler.shouldBeApproved && !traveler.isWantedTarget
            DecisionType.DETAIN -> !traveler.shouldBeApproved && traveler.requiresCriminalDetention
        }

        // If player took a bribe to wave through an invalid traveler (not a saboteur), Palych/Tolik cover the fine, but NABK risk stays
        val coveredByBribe = state.bribeAcceptedForCurrent && isApproval && !traveler.isWantedTarget

        var salaryDelta = 0
        var fineDelta = 0
        var detentionBonus = 0
        var riskDelta = 0
        var sbkDelta = 0
        var tolikDelta = 0
        var palychDelta = 0
        val newConsequences = state.pendingConsequences.toMutableList()

        if (ruleCorrect || coveredByBribe) {
            salaryDelta = state.currentRank.salaryPerTraveler
            if (isDetention && traveler.requiresCriminalDetention) {
                val baseBonus = if (traveler.isWantedTarget) 300 else 130
                detentionBonus = baseBonus + state.sandboxModifier.detentionBonusExtra
                sbkDelta += if (traveler.isWantedTarget) 20 else 6
            }
        } else {
            // Mistake! Costs a fine and hurts boss/SBK standing (NABK risk only comes from bribery)
            fineDelta = if (excessiveDetentionOnFormalOnly) 40 else if (state.shiftMistakes == 0) 50 else 150
            palychDelta -= 4
            if (traveler.isWantedTarget && isApproval) {
                sbkDelta -= 25
                newConsequences += DelayedConsequence(
                    triggerDay = state.daySpec.dayNumber + 1,
                    headline = LText("НАСЛІДОК: ДИВЕРСІЯ В ПРИКОРДОННІЙ ЗОНІ", "CONSEQUENCE: SABOTAGE IN BORDER ZONE"),
                    descriptionFull = LText(
                        "Диверсант Федерації, якого ти пропустив учора, підірвав релейну шафу на залізниці. Майор СБК «Тихий» лютує і підняв особові справи всієї зміни.",
                        "The Federation saboteur you waved through yesterday blew up a railway relay cabinet. SBK Major 'Quiet' is furious and auditing your shift."
                    ),
                    descriptionTonedDown = LText(
                        "Пропущений порушник виявився агентом Федерації. СБК розпочала службове розслідування щодо твоєї зміни.",
                        "The traveler you approved turned out to be a Federation operative. SBK opened an inquiry into your shift."
                    ),
                    moneyDelta = -200,
                    riskDelta = 0,
                    sbkRepDelta = -15
                )
            }
        }

        // Story-specific consequences
        when (traveler.storyTag) {
            "TOLIK_RUN" -> {
                if (isApproval) {
                    tolikDelta += 20
                    palychDelta += 10
                    newConsequences += DelayedConsequence(
                        triggerDay = state.daySpec.dayNumber + 1,
                        headline = LText("ПОСИЛКА ВІД ТОЛІКА «БУСИКА»", "PARCEL FROM TOLIK 'MINIVAN'"),
                        descriptionFull = LText(
                            "Толік передав через водія термос із кавою, на дні якого лежало ще 250 ₴ і записка: «Місце в бусі за тобою заброньовано».",
                            "Tolik sent a coffee thermos with 250 ₴ at the bottom and a note: 'Your seat in the van is reserved.'"
                        ),
                        descriptionTonedDown = LText(
                            "Толік подякував за лояльність і переказав 250 ₴ бонусу.",
                            "Tolik thanked you for your loyalty and sent a 250 ₴ bonus."
                        ),
                        moneyDelta = 250,
                        tolikRepDelta = 10
                    )
                } else if (isDetention) {
                    tolikDelta -= 30
                    palychDelta -= 15
                    sbkDelta += 15
                }
            }
            "DEPUTY_SON" -> {
                if (!isApproval) {
                    palychDelta -= 10
                    sbkDelta += 10
                    newConsequences += DelayedConsequence(
                        triggerDay = state.daySpec.dayNumber + 1,
                        headline = LText("ВІРУСНИЙ ПОСТ: «ПРИКОРДОННИК ЗАВЕРНУВ МАЖОРА!»", "VIRAL POST: 'GUARD TURNED BACK MP'S SON!'"),
                        descriptionFull = LText(
                            "Волонтерка Оля виклала відео, як жовтий Porsche депутата розвернули на твоєму шлагбаумі. Колеги тиснули тобі руку, а громада скинула 200 ₴ на премію!",
                            "Volunteer Olya posted footage of the MP's yellow Porsche getting turned back at your booth. Locals sent a 200 ₴ thank-you bonus!"
                        ),
                        descriptionTonedDown = LText(
                            "Твоя принциповість у випадку з сином депутата отримала підтримку суспільства (+200 ₴ премії).",
                            "Your principled stand against the MP's son earned public praise (+200 ₴ bonus)."
                        ),
                        moneyDelta = 200,
                        familyMoraleDelta = 10
                    )
                }
            }
        }

        val netMoney = salaryDelta + detentionBonus - fineDelta
        val feedback = DecisionFeedback(
            wasCorrect = ruleCorrect || coveredByBribe,
            title = when {
                coveredByBribe -> LText("ЗАКРИТО ОЧІ (ЗА ХАБАР)", "LOOKED THE OTHER WAY (BRIBED)")
                ruleCorrect && isDetention -> LText("КРИМІНАЛ ЗАТРИМАНО! (+ПРЕМІЯ СБК)", "CRIMINAL DETAINED! (+SBK BONUS)")
                ruleCorrect -> LText("РІШЕННЯ ПРАВИЛЬНЕ", "CORRECT DECISION")
                excessiveDetentionOnFormalOnly -> LText("ПЕРЕВИЩЕННЯ! Треба ВІДМОВИТИ, а не АРЕШТ", "EXCESSIVE FORCE! Should DENY, not DETAIN")
                else -> LText("ПОМИЛКА ПРОТОКОЛУ! ШТРАФ", "PROTOCOL VIOLATION! FINE")
            },
            detail = when {
                excessiveDetentionOnFormalOnly -> LText(
                    "Це формальне порушення без підробки чи контрабанди — достатньо було натиснути ✖ ВІДМОВИТИ.",
                    "Formal violation without forgery or contraband — should have pressed ✖ DENY."
                )
                isDetention -> if (state.contentMode == ContentMode.FULL_18_PLUS) traveler.arrestSceneFull else traveler.arrestSceneTonedDown
                ruleCorrect -> LText("Оформлення проведено згідно з розпорядженням ДПСК.", "Processed in accordance with SBGS directives.")
                coveredByBribe -> LText("Шлагбаум піднято без зайвих питань. Конверт у кишені.", "Barrier raised without questions. Envelope pocketed.")
                else -> {
                    val missed = traveler.validViolations.firstOrNull()?.title ?: LText("Безпідставна відмова чесному громадянину", "Wrongful denial of a legal traveler")
                    missed
                }
            },
            moneyDelta = netMoney,
            riskDelta = riskDelta
        )

        val nextIdx = state.currentTravelerIndex + 1
        val newBarrierState = when (decision) {
            DecisionType.APPROVE -> BarrierVisualState.OPEN_APPROVED
            DecisionType.DETAIN -> BarrierVisualState.SBK_ARREST_FLASH
            DecisionType.DENY -> BarrierVisualState.CLOSED
        }

        state = state.copy(
            money = state.money + netMoney,
            nabkRisk = (state.nabkRisk + riskDelta).coerceIn(0, 100),
            sbkRep = (state.sbkRep + sbkDelta).coerceIn(0, 100),
            tolikRep = (state.tolikRep + tolikDelta).coerceIn(0, 100),
            palychRep = (state.palychRep + palychDelta).coerceIn(0, 100),
            shiftProcessed = state.shiftProcessed + 1,
            shiftCorrect = state.shiftCorrect + if (ruleCorrect || coveredByBribe) 1 else 0,
            shiftMistakes = state.shiftMistakes + if (ruleCorrect || coveredByBribe) 0 else 1,
            shiftDetained = state.shiftDetained + if (isDetention) 1 else 0,
            totalCareerDetained = state.totalCareerDetained + if (isDetention && ruleCorrect) 1 else 0,
            shiftFinesTotal = state.shiftFinesTotal + fineDelta,
            pendingConsequences = newConsequences,
            barrierVisualState = newBarrierState,
            lastFeedback = feedback
        )

        if (nextIdx >= state.queue.size) {
            finishShift()
        } else {
            val nextTraveler = state.queue[nextIdx]
            val autoSpotted = if (state.hasFastUvScanner) {
                nextTraveler.validViolations.filter {
                    it == DiscrepancyType.FAKE_ISSUER_SEAL || it == DiscrepancyType.INVALID_QR_CODE
                }.toSet()
            } else {
                emptySet()
            }
            val shouldTriggerEncounter = nextIdx == 3 && !state.encounterTriggeredForDay
            val encounterToTrigger = if (shouldTriggerEncounter) {
                val list = CampaignData.midShiftEncounters
                list[(state.daySpec.dayNumber - 1) % list.size]
            } else {
                null
            }
            state = state.copy(
                currentTravelerIndex = nextIdx,
                vehicleInspectedForCurrent = false,
                interrogatedForCurrent = false,
                bribeAcceptedForCurrent = false,
                spottedDiscrepancies = autoSpotted,
                activeEncounter = encounterToTrigger,
                encounterTriggeredForDay = state.encounterTriggeredForDay || shouldTriggerEncounter
            )
        }
    }

    fun finishShift() {
        val salary = state.shiftCorrect * 120
        val detentions = state.shiftDetained * 100
        val report = ShiftSummaryReport(
            dayNumber = state.daySpec.dayNumber,
            processedCount = state.shiftProcessed,
            correctCount = state.shiftCorrect,
            mistakesCount = state.shiftMistakes,
            detainedCount = state.shiftDetained,
            salaryEarned = salary,
            detentionBonuses = detentions,
            bribesCollected = state.shiftBribesTotal,
            finesDeducted = state.shiftFinesTotal,
            bossCutRequired = state.daySpec.bossQuotaCut
        )
        state = state.copy(
            phase = ScreenPhase.SHIFT_SUMMARY,
            sirenActive = false,
            shiftReport = report
        )
    }

    fun payBossCutAndGoHome(payPalych: Boolean) {
        val cut = state.daySpec.bossQuotaCut
        state = if (payPalych && state.money >= cut) {
            state.copy(
                money = state.money - cut,
                palychRep = (state.palychRep + 12).coerceIn(0, 100),
                nabkRisk = (state.nabkRisk - 8).coerceIn(0, 100),
                phase = ScreenPhase.HOME_EVENING,
                purchasedExpensesToday = emptySet()
            )
        } else {
            val bossSnitchRisk = if (state.shiftBribesTotal > 0) 12 else 0
            state.copy(
                palychRep = (state.palychRep - 18).coerceIn(0, 100),
                nabkRisk = (state.nabkRisk + bossSnitchRisk).coerceIn(0, 100),
                phase = ScreenPhase.HOME_EVENING,
                purchasedExpensesToday = emptySet()
            )
        }
    }

    fun buyHomeExpense(expense: HomeExpense) {
        if (expense.id in state.purchasedExpensesToday) return
        if (state.money < expense.cost) return

        state = state.copy(
            money = state.money - expense.cost,
            familyMorale = (state.familyMorale + expense.familyMoraleBoost).coerceIn(0, 100),
            escapeFund = state.escapeFund + expense.escapeFundContribution,
            nabkRisk = (state.nabkRisk - expense.riskReduction).coerceIn(0, 100),
            purchasedExpensesToday = state.purchasedExpensesToday + expense.id
        )
    }

    fun buyAssetUpgrade(asset: AssetUpgrade) {
        if (asset.id in state.ownedAssets) return
        if (state.money < asset.cost) return

        state = state.copy(
            money = state.money - asset.cost,
            ownedAssets = state.ownedAssets + asset.id,
            tolikRep = (state.tolikRep + asset.tolikRepBoost).coerceIn(0, 100),
            palychRep = (state.palychRep + asset.palychRepBoost).coerceIn(0, 100),
            familyMorale = (state.familyMorale + asset.familyMoraleBoost).coerceIn(0, 100)
        )
    }

    fun triggerVillaEnding(): Boolean {
        if (state.hasSpainVilla) {
            state = state.copy(
                phase = ScreenPhase.ENDING,
                activeEnding = EndingId.OLIGARCH_VILLA
            )
            return true
        }
        return false
    }

    fun triggerSandboxBaronEnding(): Boolean {
        if (state.canClaimCustomsBaronEnding) {
            state = state.copy(
                phase = ScreenPhase.ENDING,
                activeEnding = EndingId.SANDBOX_CUSTOMS_BARON
            )
            return true
        }
        return false
    }

    fun triggerSandboxSbkColonelEnding(): Boolean {
        if (state.canClaimSbkColonelEnding) {
            state = state.copy(
                phase = ScreenPhase.ENDING,
                activeEnding = EndingId.SANDBOX_SBK_COLONEL
            )
            return true
        }
        return false
    }

    fun triggerImmediateEscapeWithTolik(): Boolean {
        if (state.escapeFund >= state.escapeFundTarget && state.tolikRep >= state.escapeTolikRepRequired) {
            state = state.copy(
                phase = ScreenPhase.ENDING,
                activeEnding = EndingId.ESCAPED_ABROAD
            )
            return true
        }
        return false
    }

    fun advanceToNextDay() {
        // Check immediate arrest condition
        if (state.nabkRisk >= 90) {
            state = state.copy(
                phase = ScreenPhase.ENDING,
                activeEnding = EndingId.ARRESTED_BY_NABK
            )
            return
        }

        // Passive nightly family drain if groceries weren't bought
        val boughtFood = "food_utilities" in state.purchasedExpensesToday
        val moraleAfterNight = (state.familyMorale + if (boughtFood) 0 else -12).coerceIn(0, 100)

        val nextIndex = state.currentDayIndex + 1
        if (!state.isSandboxMode && nextIndex >= CampaignData.actOneDays.size) {
            // Campaign finale reached! Determine ending
            val ending = when {
                state.hasSpainVilla && state.nabkRisk < 85 -> EndingId.OLIGARCH_VILLA
                state.escapeFund >= state.escapeFundTarget && state.tolikRep >= state.escapeTolikRepRequired -> EndingId.ESCAPED_ABROAD
                state.nabkRisk >= 75 -> EndingId.ARRESTED_BY_NABK
                state.sbkRep >= 65 && state.nabkRisk < 60 -> EndingId.SBK_COMMENDATION
                else -> EndingId.MOBILIZED_OR_BROKEN
            }
            state = state.copy(
                familyMorale = moraleAfterNight,
                phase = ScreenPhase.ENDING,
                activeEnding = ending
            )
            return
        }

        val nextModifier = if (state.isSandboxMode) {
            val mods = SandboxModifier.entries.filter { it != SandboxModifier.NONE }
            mods[nextIndex % mods.size]
        } else {
            SandboxModifier.NONE
        }

        val targetDaySpec = if (state.isSandboxMode) {
            val base = CampaignData.actOneDays[nextIndex % CampaignData.actOneDays.size]
            val rank = InspectorRank.forDay(nextIndex + 1)
            base.copy(
                dayNumber = nextIndex + 1,
                dateLabel = LText("Пісочниця • День ${nextIndex + 1} (${rank.title.uk})", "Sandbox • Day ${nextIndex + 1} (${rank.title.en})"),
                headline = nextModifier.title,
                radioNews = nextModifier.description,
                requireOblikQrForMales = base.requireOblikQrForMales || nextModifier.forceOblikQr,
                requireVehicleDeclaration = base.requireVehicleDeclaration || nextModifier.forceVehicleDecl,
                hasAirRaidSirenEvent = base.hasAirRaidSirenEvent || nextModifier.forceSiren
            )
        } else {
            CampaignData.actOneDays[nextIndex]
        }

        // Process delayed consequences scheduled for this day
        val triggered = state.pendingConsequences.filter { it.triggerDay <= targetDaySpec.dayNumber }
        val remaining = state.pendingConsequences.filter { it.triggerDay > targetDaySpec.dayNumber }

        var newMoney = state.money + state.dailyPassiveRentIncome
        var newRisk = (state.nabkRisk + state.dailyAssetRiskIncrease).coerceIn(0, 100)
        var newSbk = state.sbkRep
        var newTolik = state.tolikRep
        var newPalych = state.palychRep
        var newMorale = moraleAfterNight

        for (c in triggered) {
            newMoney += c.moneyDelta
            newRisk = (newRisk + c.riskDelta).coerceIn(0, 100)
            newSbk = (newSbk + c.sbkRepDelta).coerceIn(0, 100)
            newTolik = (newTolik + c.tolikRepDelta).coerceIn(0, 100)
            newPalych = (newPalych + c.palychRepDelta).coerceIn(0, 100)
            newMorale = (newMorale + c.familyMoraleDelta).coerceIn(0, 100)
        }

        val queueSize = if (state.isSandboxMode) 12 else 9
        val shiftSec = if (state.isSandboxMode) 300 else 270
        val queue = generator.generateDailyQueue(targetDaySpec, count = queueSize)

        state = state.copy(
            phase = ScreenPhase.MORNING_BRIEFING,
            currentDayIndex = nextIndex,
            daySpec = targetDaySpec,
            queue = queue,
            currentTravelerIndex = 0,
            shiftSecondsRemaining = shiftSec,
            sirenActive = false,
            sirenResolvedForDay = false,
            vehicleInspectedForCurrent = false,
            interrogatedForCurrent = false,
            bribeAcceptedForCurrent = false,
            spottedDiscrepancies = emptySet(),
            lastFeedback = null,
            money = newMoney,
            nabkRisk = newRisk,
            sbkRep = newSbk,
            tolikRep = newTolik,
            palychRep = newPalych,
            familyMorale = newMorale,
            shiftProcessed = 0,
            shiftCorrect = 0,
            shiftMistakes = 0,
            shiftDetained = 0,
            shiftBribesTotal = 0,
            shiftFinesTotal = 0,
            pendingConsequences = remaining,
            todayTriggeredConsequences = triggered,
            sandboxModifier = nextModifier,
            encounterTriggeredForDay = false,
            activeEncounter = null
        )
    }
}
