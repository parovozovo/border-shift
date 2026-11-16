package com.lucky.bordershift.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lucky.bordershift.core.gen.CampaignData
import com.lucky.bordershift.core.model.*
import com.lucky.bordershift.core.sim.GameEngine
import com.lucky.bordershift.core.sim.GameState
import com.lucky.bordershift.core.sim.ScreenPhase
import kotlinx.coroutines.delay

private val BgDarkOlive = Color(0xFF1E2420)
private val CardSlate = Color(0xFF2B332E)
private val DeskWood = Color(0xFF5A402A)
private val PaperCream = Color(0xFFF3ECD8)
private val PaperInk = Color(0xFF1F1D1A)
private val AccentMustard = Color(0xFFE0B145)
private val StampGreen = Color(0xFF2E7D32)
private val StampRed = Color(0xFFC62828)
private val SbkBlue = Color(0xFF1565C0)

@Composable
fun BorderShiftApp() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val fx = remember { SoundAndHaptics(context) }
    val music = remember { AmbientMusicPlayer() }
    val engine = remember { GameEngine(seed = System.currentTimeMillis()) }
    var state by remember { mutableStateOf(engine.state) }
    var musicEnabled by remember { mutableStateOf(true) }

    fun sync() {
        state = engine.state
    }

    DisposableEffect(lifecycleOwner) {
        music.start()
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE -> music.setPaused(true)
                Lifecycle.Event.ON_RESUME -> music.setPaused(false)
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            music.stop()
        }
    }

    LaunchedEffect(
        state.phase,
        state.sirenActive,
        state.shiftSecondsRemaining,
        state.nabkRisk,
        state.currentTraveler?.id
    ) {
        val traveler = state.currentTraveler
        val mood = when {
            state.sirenActive -> MusicMood.TENSE
            state.phase == ScreenPhase.BOOTH_SHIFT && (
                state.shiftSecondsRemaining <= 45 ||
                    state.nabkRisk >= 65 ||
                    traveler?.isWantedTarget == true ||
                    traveler?.bribeOffer?.isStingTrap == true
                ) -> MusicMood.TENSE
            state.phase == ScreenPhase.BOOTH_SHIFT -> MusicMood.BOOTH_NORMAL
            else -> MusicMood.CALM_DARK
        }
        music.setMood(mood)
    }

    // Real-time countdown timer during BOOTH_SHIFT
    LaunchedEffect(state.phase, state.sirenActive) {
        while (state.phase == ScreenPhase.BOOTH_SHIFT) {
            delay(1000L)
            if (!state.sirenActive) {
                engine.tickSecond()
                sync()
                if (state.sirenActive) {
                    fx.playSirenAlert()
                }
            }
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding(),
        color = BgDarkOlive
    ) {
        when (state.phase) {
            ScreenPhase.AGE_GATE -> AgeGateScreen(
                state = state,
                onSelectLanguage = {
                    engine.setLanguage(it)
                    sync()
                },
                onConfirm = { mode ->
                    fx.playStampApprove()
                    engine.confirmAgeAndContentMode(mode)
                    sync()
                }
            )

            ScreenPhase.MAIN_MENU -> MainMenuScreen(
                state = state,
                musicEnabled = musicEnabled,
                onToggleMusic = {
                    musicEnabled = !musicEnabled
                    music.setEnabled(musicEnabled)
                },
                onToggleLang = {
                    val next = if (state.language == Language.UK) Language.EN else Language.UK
                    engine.setLanguage(next)
                    sync()
                },
                onToggleContentMode = {
                    engine.toggleContentMode()
                    sync()
                },
                onStartCampaign = {
                    fx.playStampApprove()
                    engine.startNewCampaign(sandbox = false)
                    sync()
                },
                onStartSandbox = {
                    fx.playStampApprove()
                    engine.startNewCampaign(sandbox = true)
                    sync()
                }
            )

            ScreenPhase.MORNING_BRIEFING -> MorningBriefingScreen(
                state = state,
                onStartShift = {
                    fx.playPaperTap()
                    engine.beginBoothShift()
                    sync()
                }
            )

            ScreenPhase.BOOTH_SHIFT -> BoothShiftScreen(
                state = state,
                fx = fx,
                musicEnabled = musicEnabled,
                onToggleMusic = {
                    musicEnabled = !musicEnabled
                    music.setEnabled(musicEnabled)
                },
                onSpotDiscrepancy = { disc ->
                    fx.playPaperTap()
                    engine.spotDiscrepancy(disc)
                    sync()
                },
                onInterrogate = {
                    fx.playPaperTap()
                    engine.interrogateTraveler()
                    sync()
                },
                onInspectVehicle = {
                    fx.playPaperTap()
                    engine.inspectVehicle()
                    sync()
                },
                onAcceptBribe = {
                    fx.playBribeCash()
                    engine.acceptBribe()
                    sync()
                },
                onDecision = { decision ->
                    when (decision) {
                        DecisionType.APPROVE -> fx.playStampApprove()
                        DecisionType.DENY -> fx.playStampDeny()
                        DecisionType.DETAIN -> fx.playDetainAlarm()
                    }
                    engine.makeDecision(decision)
                    sync()
                },
                onResolveSiren = { shelter ->
                    fx.playPaperTap()
                    engine.resolveSiren(shelter)
                    sync()
                },
                onResolveEncounter = { optionId ->
                    fx.playBribeCash()
                    engine.resolveEncounter(optionId)
                    sync()
                }
            )

            ScreenPhase.SHIFT_SUMMARY -> ShiftSummaryScreen(
                state = state,
                onPayPalych = { pay ->
                    if (pay) fx.playBribeCash() else fx.playStampDeny()
                    engine.payBossCutAndGoHome(pay)
                    sync()
                }
            )

            ScreenPhase.HOME_EVENING -> HomeEveningScreen(
                state = state,
                onBuyExpense = { exp ->
                    fx.playBribeCash()
                    engine.buyHomeExpense(exp)
                    sync()
                },
                onBuyAsset = { asset ->
                    fx.playBribeCash()
                    engine.buyAssetUpgrade(asset)
                    sync()
                },
                onEscapeWithTolik = {
                    fx.playStampApprove()
                    engine.triggerImmediateEscapeWithTolik()
                    sync()
                },
                onClaimVillaEnding = {
                    fx.playStampApprove()
                    engine.triggerVillaEnding()
                    sync()
                },
                onClaimBaronEnding = {
                    fx.playStampApprove()
                    engine.triggerSandboxBaronEnding()
                    sync()
                },
                onClaimColonelEnding = {
                    fx.playStampApprove()
                    engine.triggerSandboxSbkColonelEnding()
                    sync()
                },
                onNextDay = {
                    fx.playPaperTap()
                    engine.advanceToNextDay()
                    sync()
                }
            )

            ScreenPhase.ENDING -> EndingScreen(
                state = state,
                onRestart = {
                    fx.playPaperTap()
                    engine.confirmAgeAndContentMode(state.contentMode)
                    sync()
                }
            )
        }
    }
}

@Composable
private fun AgeGateScreen(
    state: GameState,
    onSelectLanguage: (Language) -> Unit,
    onConfirm: (ContentMode) -> Unit
) {
    val lang = state.language
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            FilterChip(
                selected = lang == Language.UK,
                onClick = { onSelectLanguage(Language.UK) },
                label = { Text("🇺🇦 УКРАЇНСЬКА", color = Color.White) }
            )
            FilterChip(
                selected = lang == Language.EN,
                onClick = { onSelectLanguage(Language.EN) },
                label = { Text("🇬🇧 ENGLISH", color = Color.White) }
            )
        }

        Spacer(Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = CardSlate),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = LText("ПОПЕРЕДЖЕННЯ ПРО КОНТЕНТ (18+)", "CONTENT WARNING & AGE GATE (18+)").get(lang),
                    color = AccentMustard,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = LText(
                        "«Border Shift: Kraina» — це сатиричний художній симулятор прикордонного пункту у вигаданій країні. Усі персонажі, установи (ДПСК, СБК, НАБК) та події є художньою вигадкою.\n\nГра містить чорний гумор, теми корупції, шантажу та силових затримань. Оберіть комфортний режим:",
                        "'Border Shift: Kraina' is a satirical work of fiction set in a fictional country. All characters, agencies, and events are fictional.\n\nThe game contains dark humor, corruption themes, and forceful detentions. Choose your preferred content mode:"
                    ).get(lang),
                    color = Color(0xFFE0E0E0),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
                Spacer(Modifier.height(18.dp))

                Button(
                    onClick = { onConfirm(ContentMode.FULL_18_PLUS) },
                    colors = ButtonDefaults.buttonColors(containerColor = StampRed),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("Мені є 18+ • ПОВНИЙ РЕЖИМ (Жорсткі сцени)", "I am 18+ • FULL UNCUT MODE").get(lang),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                }

                Spacer(Modifier.height(10.dp))

                OutlinedButton(
                    onClick = { onConfirm(ContentMode.TONED_DOWN) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("ПОМ'ЯКШЕНИЙ РЕЖИМ (Без жорстокості)", "TONED-DOWN MODE (Censored Violence)").get(lang),
                        color = AccentMustard,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun MainMenuScreen(
    state: GameState,
    musicEnabled: Boolean,
    onToggleMusic: () -> Unit,
    onToggleLang: () -> Unit,
    onToggleContentMode: () -> Unit,
    onStartCampaign: () -> Unit,
    onStartSandbox: () -> Unit
) {
    val lang = state.language
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(onClick = onToggleLang, contentPadding = PaddingValues(horizontal = 10.dp)) {
                Text(
                    text = if (lang == Language.UK) "УКР 🇺🇦" else "ENG 🇬🇧",
                    color = Color.White,
                    fontSize = 12.sp
                )
            }
            OutlinedButton(onClick = onToggleMusic, contentPadding = PaddingValues(horizontal = 10.dp)) {
                Text(
                    text = if (musicEnabled) "🔊" else "🔇",
                    color = AccentMustard,
                    fontSize = 14.sp
                )
            }
            OutlinedButton(onClick = onToggleContentMode, contentPadding = PaddingValues(horizontal = 10.dp)) {
                Text(
                    text = if (state.contentMode == ContentMode.FULL_18_PLUS) {
                        LText("18+ ПОВНИЙ", "18+ FULL").get(lang)
                    } else {
                        LText("ПОМ'ЯКШЕНИЙ", "TONED-DOWN").get(lang)
                    },
                    color = AccentMustard,
                    fontSize = 12.sp
                )
            }
        }

        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "BORDER SHIFT",
                color = AccentMustard,
                fontSize = 34.sp,
                fontWeight = FontWeight.ExtraBold,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = LText("ПУНКТ ПРОПУСКУ «ЗАХІД-KRAINA»", "CHECKPOINT 'WEST-KRAINA'").get(lang),
                color = Color(0xFFB0BEC5),
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(Modifier.height(14.dp))

            BoothWindowScene(
                portrait = PortraitSpec(
                    skinTone = 1,
                    faceShape = 3,
                    hairStyle = 0,
                    facialHair = 0,
                    headwear = 4,
                    expression = 3,
                    specialId = SpecialCharacterId.PALYCH_BOSS
                ),
                sirenActive = false,
                dayNumber = 1,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
            )

            Spacer(Modifier.height(14.dp))

            Card(
                colors = CardDefaults.cardColors(containerColor = CardSlate),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = LText(
                            "• 2022–2025: від перших черг до цифрового «Обліку+»\n• Перевіряй документи, печатки стоматологів та багажники катафалків\n• Лавіруй між Пал Паличем, контрабандистом Толіком, СБК та НАБК\n• Збери «Фонд утечі» й виїдь сам — або стань щитом кордону!",
                            "• 2022–2025: from the first border queues to digital 'Oblik+' QR codes\n• Spot dentist exemption stamps, sneezing coffins & hidden amber\n• Balance Boss Palych, smuggler Tolik, SBK counter-intel & NABK stings\n• Save up your own Escape Fund or become the Shield of Kraina!"
                        ).get(lang),
                        color = Color(0xFFECEFF1),
                        fontSize = 13.sp,
                        lineHeight = 19.sp
                    )
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(
                onClick = onStartCampaign,
                colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = LText("▶ ПОЧАТИ КАМПАНІЮ (АКТ I: 2022–2024)", "▶ START STORY CAMPAIGN (ACT I)").get(lang),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }

            Button(
                onClick = onStartSandbox,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = LText("∞ НЕСКІНЧЕННА ЗМІНА (ПІСОЧНИЦЯ)", "∞ ENDLESS SHIFT (SANDBOX MODE)").get(lang),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }
        }
    }
}

@Composable
private fun MorningBriefingScreen(
    state: GameState,
    onStartShift: () -> Unit
) {
    val lang = state.language
    val day = state.daySpec

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = day.dateLabel.get(lang),
                color = AccentMustard,
                fontSize = 14.sp,
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = day.headline.get(lang),
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold
            )

            // Radio news card
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF263238))) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = LText("📻 РАДІОЕФІР РАНКУ", "📻 MORNING RADIO BROADCAST").get(lang),
                        color = AccentMustard,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = day.radioNews.get(lang),
                        color = Color(0xFFCFD8DC),
                        fontSize = 13.sp
                    )
                }
            }

            // Triggered delayed consequences from earlier days!
            for (consequence in state.todayTriggeredConsequences) {
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF4A1C1C))) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "⚡ " + consequence.headline.get(lang),
                            color = Color(0xFFFFCA28),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(Modifier.height(4.dp))
                        val desc = if (state.contentMode == ContentMode.FULL_18_PLUS) {
                            consequence.descriptionFull.get(lang)
                        } else {
                            consequence.descriptionTonedDown.get(lang)
                        }
                        Text(text = desc, color = Color.White, fontSize = 12.sp)
                    }
                }
            }

            // Boss Palych briefing
            Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = LText("🧢 НАРАДА У ПАЛ ПАЛИЧА:", "🧢 PAL PALYCH'S BRIEFING:").get(lang),
                        color = AccentMustard,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = day.bossBriefing.get(lang),
                        color = Color.White,
                        fontSize = 13.sp
                    )
                }
            }

            // Rules checklist on cream paper
            Card(colors = CardDefaults.cardColors(containerColor = PaperCream)) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = LText("📋 ДИРЕКТИВА ДПСК НА ЗМІНУ:", "📋 TODAY'S BORDER DIRECTIVES:").get(lang),
                        color = PaperInk,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(Modifier.height(6.dp))
                    day.rulesList.forEach { rule ->
                        Text(
                            text = rule.get(lang),
                            color = PaperInk,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(vertical = 2.dp)
                        )
                    }
                    if (day.wantedTraitHint != null) {
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text = "🎯 " + day.wantedTraitHint.get(lang),
                            color = StampRed,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        Button(
            onClick = onStartShift,
            colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = LText("ЗАСТУПИТИ НА ЗМІНУ В БУДКУ →", "ENTER CHECKPOINT BOOTH →").get(lang),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun BoothShiftScreen(
    state: GameState,
    fx: SoundAndHaptics,
    musicEnabled: Boolean,
    onToggleMusic: () -> Unit,
    onSpotDiscrepancy: (DiscrepancyType) -> Unit,
    onInterrogate: () -> Unit,
    onInspectVehicle: () -> Unit,
    onAcceptBribe: () -> Unit,
    onDecision: (DecisionType) -> Unit,
    onResolveSiren: (Boolean) -> Unit,
    onResolveEncounter: (String) -> Unit
) {
    val lang = state.language
    val traveler = state.currentTraveler ?: return
    var selectedDocIndex by remember(traveler.id) { mutableStateOf(0) }
    var showRulesDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Top Status Bar
            Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${LText("День", "Day").get(lang)} ${state.daySpec.dayNumber} • ⏱ ${state.shiftSecondsRemaining}s",
                            color = if (state.shiftSecondsRemaining < 35) Color(0xFFFF8A80) else AccentMustard,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Text(
                            text = "💵 ${state.money} ₴",
                            color = Color(0xFF81C784),
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "${LText("Черга", "Queue").get(lang)}: ${state.currentTravelerIndex + 1}/${state.queue.size}",
                            color = Color.White,
                            fontSize = 12.sp
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TextButton(
                                onClick = onToggleMusic,
                                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp),
                                modifier = Modifier.widthIn(min = 28.dp)
                            ) {
                                Text(text = if (musicEnabled) "🔊" else "🔇", fontSize = 13.sp)
                            }
                            TextButton(
                                onClick = {
                                    fx.playPaperTap()
                                    showRulesDialog = true
                                },
                                contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp)
                            ) {
                                Text(
                                    text = LText("📋 Правила", "📋 Rules").get(lang),
                                    color = AccentMustard,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${LText("Ризик НАБК", "NABK Risk").get(lang)}: ${state.nabkRisk}%",
                            color = if (state.nabkRisk >= 60) Color(0xFFFF5252) else Color(0xFFB0BEC5),
                            fontSize = 11.sp
                        )
                        Text(
                            text = "${LText("Палич", "Palych") .get(lang)}:${state.palychRep} | ${LText("Толік", "Tolik").get(lang)}:${state.tolikRep} | СБК:${state.sbkRep}",
                            color = Color(0xFFB0BEC5),
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // Last decision toast banner
            state.lastFeedback?.let { fb ->
                val bg = if (fb.wasCorrect) Color(0xFF1B5E20) else Color(0xFF7F0000)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp)
                        .background(bg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = fb.title.get(lang) + ": " + fb.detail.get(lang),
                        color = Color.White,
                        fontSize = 11.sp,
                        maxLines = 2,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = (if (fb.moneyDelta >= 0) "+${fb.moneyDelta}" else "${fb.moneyDelta}") + " ₴",
                        color = AccentMustard,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Sky radar warning 18s before Air-Raid Siren!
            if (state.droneApproachingSkyWarning) {
                Text(
                    text = LText("⚠️ РАДАР ППО: У небі помічено «мопед» на підльоті! Готуйтесь до сирени!", "⚠️ RADAR ALERT: Drone spotted in the sky! Siren imminent!").get(lang),
                    color = Color(0xFFFF8A80),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 2.dp)
                        .background(Color(0xFF4A1C1C), RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // 2. Booth Window + Traveler Portrait & Dialogue Bubble
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(168.dp)
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BoothWindowScene(
                    portrait = traveler.portrait,
                    sirenActive = state.sirenActive,
                    dayNumber = state.daySpec.dayNumber,
                    vehicleType = traveler.vehicleVisualType,
                    barrierState = state.barrierVisualState,
                    droneWarning = state.droneApproachingSkyWarning,
                    modifier = Modifier
                        .weight(0.42f)
                        .fillMaxHeight()
                )

                Column(
                    modifier = Modifier
                        .weight(0.58f)
                        .fillMaxHeight()
                        .background(CardSlate, RoundedCornerShape(10.dp))
                        .padding(8.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = traveler.fullName.get(lang) + " (${traveler.age})",
                            color = AccentMustard,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Text(
                            text = "🚗 " + traveler.vehicleDescription.get(lang),
                            color = Color(0xFFB0BEC5),
                            fontSize = 11.sp
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = if (state.interrogatedForCurrent) {
                                traveler.interrogationReply.get(lang)
                            } else {
                                traveler.greeting.get(lang)
                            },
                            color = Color.White,
                            fontSize = 11.sp,
                            lineHeight = 14.sp
                        )
                    }

                    // Bribe offer banner if traveler offers an envelope
                    val bribe = traveler.bribeOffer
                    if (bribe != null && !state.bribeAcceptedForCurrent) {
                        val effectiveAmount = (bribe.amount * state.sandboxModifier.bribeMultiplier).toInt()
                        Button(
                            onClick = onAcceptBribe,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6D4C41)),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(30.dp)
                        ) {
                            Text(
                                text = LText("✉️ ВЗЯТИ КОНВЕРТ (+$effectiveAmount ₴)", "✉️ TAKE ENVELOPE (+$effectiveAmount ₴)").get(lang),
                                color = AccentMustard,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else if (state.bribeAcceptedForCurrent) {
                        Text(
                            text = LText("✔ Конверт у кишені (треба ПРОПУСТИТИ)", "✔ Envelope pocketed (must APPROVE)").get(lang),
                            color = Color(0xFF81C784),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // 3. Inspector Wooden Desk with Documents & Tools
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(DeskWood, RoundedCornerShape(12.dp))
                    .border(2.dp, Color(0xFF3E2723), RoundedCornerShape(12.dp))
                    .padding(8.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Document Tabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    traveler.documents.forEachIndexed { idx, doc ->
                        val selected = idx == selectedDocIndex
                        val tabLabel = when (doc.type) {
                            DocType.PASSPORT -> LText("🛂 Паспорт", "🛂 Passport").get(lang)
                            DocType.EXEMPTION_CERT -> LText("📄 Довідка", "📄 Permit").get(lang)
                            DocType.MILITARY_ID -> LText("📱 Облік+", "📱 Oblik+").get(lang)
                            DocType.VEHICLE_CUSTOMS -> LText("🚐 Митниця", "🚐 Customs").get(lang)
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (selected) PaperCream else Color(0xFF3E2723))
                                .clickable {
                                    fx.playPaperTap()
                                    selectedDocIndex = idx
                                }
                                .padding(horizontal = 8.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = tabLabel,
                                color = if (selected) PaperInk else Color(0xFFD7CCC8),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Active Document Card on Cream Paper
                val currentDoc = traveler.documents.getOrElse(selectedDocIndex) { traveler.documents.first() }
                Card(
                    colors = CardDefaults.cardColors(containerColor = PaperCream),
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(10.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = currentDoc.title.get(lang),
                                    color = PaperInk,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = currentDoc.subtitle.get(lang),
                                    color = Color(0xFF5D4037),
                                    fontSize = 11.sp
                                )
                            }
                            if (currentDoc.type == DocType.PASSPORT) {
                                MiniPassportPhoto(
                                    portrait = traveler.passportPortrait,
                                    modifier = Modifier.size(52.dp)
                                )
                            }
                        }

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 6.dp),
                            color = Color(0xFFBCAAA4)
                        )

                        currentDoc.fields.forEach { field ->
                            val isSpotted = field.discrepancy != null && field.discrepancy in state.spottedDiscrepancies
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 3.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (isSpotted) Color(0x33C62828) else Color.Transparent)
                                    .clickable {
                                        if (field.discrepancy != null) {
                                            onSpotDiscrepancy(field.discrepancy)
                                        } else {
                                            fx.playPaperTap()
                                        }
                                    }
                                    .padding(horizontal = 4.dp, vertical = 2.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = field.label.get(lang) + ":",
                                    color = Color(0xFF4E342E),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.weight(0.38f)
                                )
                                Text(
                                    text = field.value.get(lang) + if (isSpotted) " [❗]" else "",
                                    color = if (isSpotted) StampRed else PaperInk,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(0.62f)
                                )
                            }
                        }

                        Spacer(Modifier.height(6.dp))

                        // Official Seal Stamp Box (clickable to verify seal authenticity)
                        val sealColor = if (!currentDoc.isSealAuthentic && currentDoc.sealDiscrepancy in state.spottedDiscrepancies) {
                            StampRed
                        } else {
                            Color(0xFF1565C0)
                        }
                        Box(
                            modifier = Modifier
                                .align(Alignment.End)
                                .border(2.dp, sealColor, RoundedCornerShape(6.dp))
                                .clickable {
                                    currentDoc.sealDiscrepancy?.let { onSpotDiscrepancy(it) }
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "✪ " + currentDoc.sealText.get(lang),
                                color = sealColor,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Clear DENY vs DETAIN action hint when discrepancies are spotted!
                        if (state.spottedDiscrepancies.isNotEmpty()) {
                            val needsArrest = state.spottedDiscrepancies.any { it.requiresDetention }
                            val firstDisc = state.spottedDiscrepancies.first()
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp)
                                    .background(
                                        if (needsArrest) Color(0xFFBBDEFB) else Color(0xFFFFE0B2),
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(6.dp)
                            ) {
                                Text(
                                    text = "📌 " + firstDisc.actionHint.get(lang),
                                    color = if (needsArrest) SbkBlue else Color(0xFFE65100),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                        }

                        // Vehicle search result if inspected
                        AnimatedVisibility(visible = state.vehicleInspectedForCurrent) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 8.dp)
                                    .background(
                                        if (traveler.hasHiddenContraband) Color(0xFFFFCDD2) else Color(0xFFC8E6C9),
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(8.dp)
                            ) {
                                Text(
                                    text = "🔦 " + traveler.vehicleSearchResult.get(lang),
                                    color = PaperInk,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Inspector Desk Tools Row (Magnifier / Interrogate & Vehicle Search)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onInterrogate,
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFF3E2723)),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(34.dp)
                    ) {
                        Text(
                            text = LText("🔍 Звірити / Допит", "🔍 Verify / Ask").get(lang),
                            color = AccentMustard,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    OutlinedButton(
                        onClick = onInspectVehicle,
                        enabled = !state.vehicleInspectedForCurrent,
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFF3E2723)),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(34.dp)
                    ) {
                        val searchCostLabel = if (state.hasFastUvScanner) "0s ⚡" else "-8s"
                        Text(
                            text = if (state.vehicleInspectedForCurrent) {
                                LText("🚐 Авто оглянуто", "🚐 Van Inspected").get(lang)
                            } else {
                                LText("🚐 Огляд авто ($searchCostLabel)", "🚐 Search Van ($searchCostLabel)").get(lang)
                            },
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(Modifier.height(6.dp))

            // 4. Bottom Rubber Stamps Bar (APPROVE / DENY / DETAIN)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { onDecision(DecisionType.APPROVE) },
                    colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
                    contentPadding = PaddingValues(vertical = 10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = LText("✔ ПРОПУСТИТИ", "✔ APPROVE").get(lang),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp
                    )
                }

                Button(
                    onClick = { onDecision(DecisionType.DENY) },
                    colors = ButtonDefaults.buttonColors(containerColor = StampRed),
                    contentPadding = PaddingValues(vertical = 10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = LText("✖ ВІДМОВИТИ", "✖ DENY").get(lang),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp
                    )
                }

                Button(
                    onClick = { onDecision(DecisionType.DETAIN) },
                    colors = ButtonDefaults.buttonColors(containerColor = SbkBlue),
                    contentPadding = PaddingValues(vertical = 10.dp),
                    modifier = Modifier.weight(0.9f)
                ) {
                    Text(
                        text = LText("🚨 СБК / АРЕШТ", "🚨 DETAIN").get(lang),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Air-Raid Siren Modal Overlay
        if (state.sirenActive) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xCC3E1010))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = LText("🚨 ПОВІТРЯНА ТРИВОГА НА ПУНКТІ!", "🚨 AIR-RAID SIREN AT CHECKPOINT!").get(lang),
                            color = Color(0xFFFF5252),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(10.dp))
                        Text(
                            text = LText(
                                "У небі над чергою помічено «мопед». За інструкцією ви маєте зупинити оформлення та спуститися в укриття (втрата 35 секунд зміни), або можете працювати далі за «швидкі чайові» від водіїв (+150 ₴, але росте ризик).",
                                "A drone is buzzing over the queue. Protocol says halt processing and go to the shelter (-35s shift time), or keep the booth open for 'express tips' (+150 ₴, +risk)."
                            ).get(lang),
                            color = Color.White,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = { onResolveSiren(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = SbkBlue),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = LText("🛡 Піти в укриття (-35с, +повага СБК)", "🛡 Go to Shelter (-35s, +SBK Rep)").get(lang),
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = { onResolveSiren(false) },
                            colors = ButtonDefaults.buttonColors(containerColor = StampRed),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = LText("💵 Працювати під сиреною (+150 ₴)", "💵 Keep Working Under Siren (+150 ₴)").get(lang),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // Special Mid-Shift Encounter Modal Overlay
        state.activeEncounter?.let { enc ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xDD121815))
                    .padding(18.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                    Column(
                        modifier = Modifier
                            .padding(18.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = enc.title.get(lang),
                            color = AccentMustard,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(10.dp))
                        MiniPassportPhoto(
                            portrait = enc.speakerPortrait,
                            modifier = Modifier.size(76.dp)
                        )
                        Spacer(Modifier.height(10.dp))
                        Text(
                            text = enc.description.get(lang),
                            color = Color.White,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                        Spacer(Modifier.height(14.dp))
                        enc.options.forEach { opt ->
                            Button(
                                onClick = { onResolveEncounter(opt.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F)),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                            ) {
                                Text(
                                    text = opt.label.get(lang),
                                    color = AccentMustard,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }
        }

        // Rules popup dialog
        if (showRulesDialog) {
            AlertDialog(
                onDismissRequest = { showRulesDialog = false },
                title = {
                    Text(
                        text = LText("Директиви на День ${state.daySpec.dayNumber}", "Day ${state.daySpec.dayNumber} Directives").get(lang),
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        state.daySpec.rulesList.forEach { r ->
                            Text(text = r.get(lang), fontSize = 13.sp)
                        }
                        state.daySpec.wantedTraitHint?.let { hint ->
                            Text(
                                text = "🎯 " + hint.get(lang),
                                color = StampRed,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                        Text(
                            text = LText(
                                "⚖️ ПАМ'ЯТКА: ВІДМОВА чи АРЕШТ?\n• ✖ ВІДМОВИТИ: прострочений документ або немає довідки на виїзд (без підробки).\n• 🚨 СБК / АРЕШТ: підроблена печатка, чуже фото/ПІБ, контрабанда в авто або шпигун СБК (+премія!).",
                                "⚖️ GUIDE: DENY vs DETAIN?\n• ✖ DENY: expired document or missing exit permit (no forgery).\n• 🚨 DETAIN: forged seal, mismatched photo/name, contraband in van, or SBK spy (+bonus!)."
                            ).get(lang),
                            color = SbkBlue,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showRulesDialog = false }) {
                        Text(LText("Зрозуміло", "Got it").get(lang))
                    }
                }
            )
        }
    }
}

@Composable
private fun ShiftSummaryScreen(
    state: GameState,
    onPayPalych: (Boolean) -> Unit
) {
    val lang = state.language
    val report = state.shiftReport ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = LText("ЗМІНУ ЗАВЕРШЕНО • ДЕНЬ ${report.dayNumber}", "SHIFT COMPLETE • DAY ${report.dayNumber}").get(lang),
                color = AccentMustard,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold
            )

            Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("${LText("Оформлено мандрівників", "Travelers Processed").get(lang)}: ${report.processedCount}", color = Color.White)
                    Text("${LText("Без помилок", "Correct Decisions").get(lang)}: ${report.correctCount} (+${report.salaryEarned} ₴)", color = Color(0xFF81C784))
                    Text("${LText("Затримано порушників/шпигунів", "Detained Targets").get(lang)}: ${report.detainedCount}", color = Color(0xFF64B5F6))
                    Text("${LText("Штрафи за помилки", "Protocol Fines").get(lang)}: -${report.finesDeducted} ₴", color = Color(0xFFFF8A80))
                    Text("${LText("Лівий дохід (конверти)", "Bribe Envelopes").get(lang)}: +${report.bribesCollected} ₴", color = AccentMustard)
                    HorizontalDivider(color = Color.Gray, modifier = Modifier.padding(vertical = 4.dp))
                    Text(
                        text = "${LText("У гаманці зараз", "Current Cash").get(lang)}: ${state.money} ₴",
                        color = AccentMustard,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF33291F))) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = LText("🧢 ПАЛ ПАЛИЧ ЧЕКАЄ НА «ЧАСТКУ»", "🧢 PAL PALYCH EXPECTS HIS CUT").get(lang),
                        color = AccentMustard,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = LText(
                            "«Ну що, інспекторе, зміна видалася гаряча! Поклади ${report.bossCutRequired} ₴ у шухляду — і я прикрию твої грішки перед штабом та НАБК.»",
                            "'Hot shift today, inspector! Put ${report.bossCutRequired} ₴ in my drawer and I'll cover your slip-ups with HQ and NABK.'"
                        ).get(lang),
                        color = Color.White,
                        fontSize = 13.sp
                    )
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(
                onClick = { onPayPalych(true) },
                enabled = state.money >= report.bossCutRequired,
                colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = LText("Занести Паличу ${report.bossCutRequired} ₴ (-ризик НАБК, +дах)", "Pay Palych ${report.bossCutRequired} ₴ (-NABK Risk, +Boss Rep)").get(lang),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }

            OutlinedButton(
                onClick = { onPayPalych(false) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = LText("Не платити Паличу (Зберегти гроші, але Палич злиться)", "Refuse to Pay (Keep cash, Palych gets angry)").get(lang),
                    color = Color(0xFFFF8A80),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }
        }
    }
}

@Composable
private fun HomeEveningScreen(
    state: GameState,
    onBuyExpense: (HomeExpense) -> Unit,
    onBuyAsset: (AssetUpgrade) -> Unit,
    onEscapeWithTolik: () -> Unit,
    onClaimVillaEnding: () -> Unit,
    onClaimBaronEnding: () -> Unit,
    onClaimColonelEnding: () -> Unit,
    onNextDay: () -> Unit
) {
    val lang = state.language
    var selectedTab by remember { mutableStateOf(0) } // 0 = Daily Expenses, 1 = Real Estate & Luxury

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(18.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = LText("🌙 ВЕЧІР УДОМА (Після Дня ${state.daySpec.dayNumber})", "🌙 EVENING AT HOME (After Day ${state.daySpec.dayNumber})").get(lang),
                color = AccentMustard,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold
            )

            // Status summary
            Card(colors = CardDefaults.cardColors(containerColor = CardSlate)) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text("💵 ${LText("Готівка вдома", "Cash on Hand").get(lang)}: ${state.money} ₴", color = Color(0xFF81C784), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    if (state.dailyPassiveRentIncome > 0) {
                        Text("🏢 ${LText("Пасивна оренда (від нерухомості)", "Passive Rent Income").get(lang)}: +${state.dailyPassiveRentIncome} ₴/${LText("день", "day").get(lang)}", color = Color(0xFF81C784), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    if (state.isSandboxMode) {
                        Text("🎖️ ${LText("Звання", "Rank").get(lang)}: ${state.currentRank.title.get(lang)} (${state.currentRank.salaryPerTraveler} ₴/${LText("оформлення", "traveler").get(lang)}) | ${LText("Арештів", "Detained").get(lang)}: ${state.totalCareerDetained}", color = Color(0xFF64B5F6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Text("🏠 ${LText("Настрій сім'ї", "Family Morale").get(lang)}: ${state.familyMorale}%", color = Color.White, fontSize = 13.sp)
                    Text("🕵️ ${LText("Підозра НАБК", "NABK Investigation Risk").get(lang)}: ${state.nabkRisk}%", color = if (state.nabkRisk >= 60) Color(0xFFFF5252) else Color.White, fontSize = 13.sp)
                    Text("🚐 ${LText("Фонд утечі за кордон", "Escape Abroad Fund").get(lang)}: ${state.escapeFund} / ${state.escapeFundTarget} ₴ (${LText("Толік", "Tolik").get(lang)}: ${state.tolikRep}/${state.escapeTolikRepRequired})", color = AccentMustard, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }

            // Special Ending Claim Buttons!
            if (state.hasSpainVilla) {
                Button(
                    onClick = onClaimVillaEnding,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD84315)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("🏖️ ВИЛЕТІТИ У ВЛАСНУ ВІЛЛУ В ІСПАНІЇ (Кінцівка Короля Кордону!)", "🏖️ FLY TO YOUR VILLA IN SPAIN (Oligarch Ending!)").get(lang),
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            if (state.canClaimCustomsBaronEnding) {
                Button(
                    onClick = onClaimBaronEnding,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF9A825)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("👑 ВИКУПИТИ КРІСЛО ПАЛ ПАЛИЧА (Кінцівка Барона Митниці!)", "👑 BUY OUT PALYCH'S CHAIR (Customs Baron Ending!)").get(lang),
                        color = PaperInk,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            if (state.canClaimSbkColonelEnding) {
                Button(
                    onClick = onClaimColonelEnding,
                    colors = ButtonDefaults.buttonColors(containerColor = SbkBlue),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("🕵️ ОЧОЛИТИ КОНТРРОЗВІДКУ СБК (Кінцівка Полковника СБК!)", "🕵️ TAKE COMMAND OF SBK COUNTER-INTEL (Colonel Ending!)").get(lang),
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            if (state.escapeFund >= state.escapeFundTarget && state.tolikRep >= state.escapeTolikRepRequired) {
                Button(
                    onClick = onEscapeWithTolik,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6A1B9A)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = LText("🚐 ВТЕКТИ ЗА КОРДОН УНОЧІ З ТОЛІКОМ (Секретний фінал!)", "🚐 ESCAPE ABROAD TONIGHT WITH TOLIK (Secret Ending!)").get(lang),
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            // Tabs: Household vs Real Estate & Luxury Assets
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { selectedTab = 0 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == 0) AccentMustard else CardSlate
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = LText("🏠 Побут і Захист", "🏠 Household").get(lang),
                        color = if (selectedTab == 0) PaperInk else Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
                Button(
                    onClick = { selectedTab = 1 },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == 1) AccentMustard else CardSlate
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = LText("💎 Нерухомість і Тачки (${state.ownedAssets.size}/${CampaignData.assetUpgrades.size})", "💎 Real Estate & Cars (${state.ownedAssets.size}/${CampaignData.assetUpgrades.size})").get(lang),
                        color = if (selectedTab == 1) PaperInk else Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            if (selectedTab == 0) {
                CampaignData.eveningExpenses.forEach { exp ->
                    val bought = exp.id in state.purchasedExpensesToday
                    val canAfford = state.money >= exp.cost && !bought
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (bought) Color(0xFF1B5E20) else CardSlate
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = exp.title.get(lang),
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "${exp.cost} ₴",
                                    color = AccentMustard,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Button(
                                onClick = { onBuyExpense(exp) },
                                enabled = canAfford,
                                colors = ButtonDefaults.buttonColors(containerColor = AccentMustard)
                            ) {
                                Text(
                                    text = if (bought) LText("Оплачено", "Paid").get(lang) else LText("Оплатити", "Buy").get(lang),
                                    color = PaperInk,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            } else {
                CampaignData.assetUpgrades.forEach { asset ->
                    val owned = asset.id in state.ownedAssets
                    val canAfford = state.money >= asset.cost && !owned
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (owned) Color(0xFF1B5E20) else CardSlate
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = "${asset.icon} ${asset.title.get(lang)}",
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = asset.subtitle.get(lang),
                                    color = Color(0xFFCFD8DC),
                                    fontSize = 11.sp,
                                    lineHeight = 14.sp
                                )
                                Text(
                                    text = "${asset.cost} ₴",
                                    color = AccentMustard,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                            Button(
                                onClick = { onBuyAsset(asset) },
                                enabled = canAfford,
                                colors = ButtonDefaults.buttonColors(containerColor = AccentMustard)
                            ) {
                                Text(
                                    text = if (owned) LText("Куплено", "Owned").get(lang) else LText("Купити", "Buy").get(lang),
                                    color = PaperInk,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        Button(
            onClick = onNextDay,
            colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = LText("ЛЯГАТИ СПАТИ → НАСТУПНИЙ ДЕНЬ", "SLEEP → NEXT MORNING").get(lang),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun EndingScreen(
    state: GameState,
    onRestart: () -> Unit
) {
    val lang = state.language
    val ending = state.activeEnding ?: EndingId.MOBILIZED_OR_BROKEN
    val body = if (state.contentMode == ContentMode.FULL_18_PLUS) {
        ending.epilogueFull.get(lang)
    } else {
        ending.epilogueTonedDown.get(lang)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(22.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = CardSlate),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = ending.title.get(lang),
                    color = AccentMustard,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = ending.subtitle.get(lang),
                    color = Color(0xFFFF8A80),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp), color = Color.Gray)
                Text(
                    text = body,
                    color = Color.White,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    text = "${LText("Фінальний баланс", "Final Cash").get(lang)}: ${state.money} ₴ | ${LText("Фонд утечі", "Escape Fund").get(lang)}: ${state.escapeFund} ₴\nСБК: ${state.sbkRep} | Толік: ${state.tolikRep} | НАБК Ризик: ${state.nabkRisk}%",
                    color = Color(0xFFB0BEC5),
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(Modifier.height(20.dp))

        Button(
            onClick = onRestart,
            colors = ButtonDefaults.buttonColors(containerColor = StampGreen),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = LText("↺ ПОВЕРНУТИСЯ В ГОЛОВНЕ МЕНЮ", "↺ RETURN TO MAIN MENU").get(lang),
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}
