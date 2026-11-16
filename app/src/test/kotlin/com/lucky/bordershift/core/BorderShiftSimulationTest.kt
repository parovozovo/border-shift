package com.lucky.bordershift.core

import com.lucky.bordershift.core.gen.CampaignData
import com.lucky.bordershift.core.gen.TravelerGenerator
import com.lucky.bordershift.core.model.*
import com.lucky.bordershift.core.sim.GameEngine
import com.lucky.bordershift.core.sim.ScreenPhase
import org.junit.Assert.*
import org.junit.Test

class BorderShiftSimulationTest {

    @Test
    fun `10000 generated travelers satisfy honesty and detectable discrepancy invariants`() {
        val gen = TravelerGenerator(seed = 2026L)
        val days = CampaignData.actOneDays

        for (i in 0 until 10_000) {
            val day = days[i % days.size]
            val honest = (i % 2 == 0)
            val traveler = gen.generateSingleProcedural(day, forceHonest = honest)

            if (traveler.shouldBeApproved) {
                assertTrue(
                    "Honest traveler ${traveler.id} (${traveler.role}) must have no violations",
                    traveler.validViolations.isEmpty()
                )
            } else {
                assertFalse(
                    "Invalid traveler ${traveler.id} (${traveler.role}) must have at least one detectable violation",
                    traveler.validViolations.isEmpty()
                )
            }
            assertTrue("Traveler must carry at least a passport", traveler.documents.isNotEmpty())
        }
    }

    @Test
    fun `1000 simulated campaign and sandbox runs verify all 7 endings and real estate upgrades`() {
        val reachedEndings = mutableSetOf<EndingId>()

        for (run in 0 until 1000) {
            val strategy = run % 6
            // Strategies:
            // 0 = Campaign Honest SBK (SBK_COMMENDATION)
            // 1 = Campaign Reckless Bribe-Taker (ARRESTED_BY_NABK)
            // 2 = Campaign Escape Schemer with Tolik (ESCAPED_ABROAD)
            // 3 = Campaign Sloppy Inspector (MOBILIZED_OR_BROKEN)
            // 4 = Sandbox Customs Baron + Spain Villa (SANDBOX_CUSTOMS_BARON / OLIGARCH_VILLA)
            // 5 = Sandbox SBK Counter-Intel Colonel (SANDBOX_SBK_COLONEL)

            val isSandbox = strategy == 4 || strategy == 5
            val engine = GameEngine(seed = 1000L + run)
            engine.confirmAgeAndContentMode(if (run % 2 == 0) ContentMode.FULL_18_PLUS else ContentMode.TONED_DOWN)
            engine.startNewCampaign(sandbox = isSandbox)

            var safetySteps = 0
            while (engine.state.phase != ScreenPhase.ENDING && safetySteps < 25) {
                safetySteps++
                assertEquals(ScreenPhase.MORNING_BRIEFING, engine.state.phase)
                engine.beginBoothShift()

                while (engine.state.phase == ScreenPhase.BOOTH_SHIFT) {
                    // Resolve mid-shift encounter if active
                    engine.state.activeEncounter?.let { enc ->
                        val chosenOption = when (strategy) {
                            0, 5 -> enc.options.first().id
                            else -> enc.options.last().id
                        }
                        engine.resolveEncounter(chosenOption)
                    }

                    val t = engine.state.currentTraveler ?: break
                    if (t.hasHiddenContraband && (strategy == 0 || strategy == 5)) {
                        engine.inspectVehicle()
                    }
                    when (strategy) {
                        0, 5 -> {
                            val decision = when {
                                t.shouldBeApproved -> DecisionType.APPROVE
                                t.requiresCriminalDetention -> DecisionType.DETAIN
                                else -> DecisionType.DENY
                            }
                            engine.makeDecision(decision)
                        }
                        1 -> {
                            if (t.bribeOffer != null) {
                                engine.acceptBribe()
                                engine.makeDecision(DecisionType.APPROVE)
                            } else {
                                engine.makeDecision(DecisionType.APPROVE)
                            }
                        }
                        2, 4 -> {
                            if (t.bribeOffer != null && !t.bribeOffer.isStingTrap && !t.isWantedTarget) {
                                engine.acceptBribe()
                                engine.makeDecision(DecisionType.APPROVE)
                            } else if (t.shouldBeApproved) {
                                engine.makeDecision(DecisionType.APPROVE)
                            } else if (t.requiresCriminalDetention) {
                                engine.makeDecision(DecisionType.DETAIN)
                            } else {
                                engine.makeDecision(DecisionType.DENY)
                            }
                        }
                        else -> {
                            val wrong = if (t.shouldBeApproved) DecisionType.DENY else DecisionType.APPROVE
                            engine.makeDecision(wrong)
                        }
                    }
                }

                assertEquals(ScreenPhase.SHIFT_SUMMARY, engine.state.phase)
                engine.payBossCutAndGoHome(payPalych = (strategy != 3))

                assertEquals(ScreenPhase.HOME_EVENING, engine.state.phase)
                when (strategy) {
                    2 -> {
                        val escapeExpense = CampaignData.eveningExpenses.first { it.id == "escape_fund" }
                        engine.buyHomeExpense(escapeExpense)
                        if (engine.state.nabkRisk >= 60) {
                            val lawyer = CampaignData.eveningExpenses.first { it.id == "shred_evidence" }
                            engine.buyHomeExpense(lawyer)
                        }
                        if (engine.triggerImmediateEscapeWithTolik()) break
                    }
                    4 -> {
                        // Buy lawyer if risk gets high
                        if (engine.state.nabkRisk >= 55) {
                            val lawyer = CampaignData.eveningExpenses.first { it.id == "shred_evidence" }
                            engine.buyHomeExpense(lawyer)
                        }
                        val flat = CampaignData.assetUpgrades.first { it.id == "kyivhrad_flat" }
                        val bmw = CampaignData.assetUpgrades.first { it.id == "euro_bmw" }
                        val villa = CampaignData.assetUpgrades.first { it.id == "spain_villa" }

                        if ((run / 6) % 2 == 0) {
                            engine.buyAssetUpgrade(flat)
                            engine.buyAssetUpgrade(bmw)
                            if (engine.triggerSandboxBaronEnding()) break
                        } else {
                            engine.buyAssetUpgrade(flat)
                            engine.buyAssetUpgrade(villa)
                            if (engine.triggerVillaEnding()) break
                        }
                    }
                    5 -> {
                        if (engine.triggerSandboxSbkColonelEnding()) break
                    }
                    0 -> {
                        val foodExpense = CampaignData.eveningExpenses.first { it.id == "food_utilities" }
                        engine.buyHomeExpense(foodExpense)
                    }
                }

                engine.advanceToNextDay()
            }

            assertEquals("Run $run (strategy=$strategy) must reach ENDING", ScreenPhase.ENDING, engine.state.phase)
            val ending = engine.state.activeEnding
            assertNotNull(ending)
            reachedEndings += ending!!
        }

        assertTrue("ESCAPED_ABROAD must be reachable", EndingId.ESCAPED_ABROAD in reachedEndings)
        assertTrue("ARRESTED_BY_NABK must be reachable", EndingId.ARRESTED_BY_NABK in reachedEndings)
        assertTrue("SBK_COMMENDATION must be reachable", EndingId.SBK_COMMENDATION in reachedEndings)
        assertTrue("MOBILIZED_OR_BROKEN must be reachable", EndingId.MOBILIZED_OR_BROKEN in reachedEndings)
        assertTrue("OLIGARCH_VILLA must be reachable", EndingId.OLIGARCH_VILLA in reachedEndings)
        assertTrue("SANDBOX_CUSTOMS_BARON must be reachable", EndingId.SANDBOX_CUSTOMS_BARON in reachedEndings)
        assertTrue("SANDBOX_SBK_COLONEL must be reachable", EndingId.SANDBOX_SBK_COLONEL in reachedEndings)
    }
}
