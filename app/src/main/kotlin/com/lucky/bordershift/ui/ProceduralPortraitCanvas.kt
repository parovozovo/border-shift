package com.lucky.bordershift.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.lucky.bordershift.core.model.BarrierVisualState
import com.lucky.bordershift.core.model.PortraitSpec
import com.lucky.bordershift.core.model.SpecialCharacterId
import com.lucky.bordershift.core.model.VehicleVisualType

@Composable
fun BoothWindowScene(
    portrait: PortraitSpec,
    sirenActive: Boolean,
    dayNumber: Int,
    vehicleType: VehicleVisualType = VehicleVisualType.SEDAN_STANDARD,
    barrierState: BarrierVisualState = BarrierVisualState.CLOSED,
    droneWarning: Boolean = false,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .border(3.dp, Color(0xFF2B3530), RoundedCornerShape(10.dp))
    ) {
        val w = size.width
        val h = size.height

        // 1. Sky background (reddish tint during air-raid siren, duskier in later days)
        val skyColor = when {
            sirenActive -> Color(0xFF6B2D2B)
            droneWarning -> Color(0xFF5D4037)
            dayNumber >= 4 -> Color(0xFF4F5D65)
            else -> Color(0xFF6C7D84)
        }
        drawRect(color = skyColor, size = Size(w, h * 0.48f))

        // Distant clouds
        drawRoundRect(
            color = Color(0x33FFFFFF),
            topLeft = Offset(w * 0.08f, h * 0.07f),
            size = Size(w * 0.32f, h * 0.06f),
            cornerRadius = CornerRadius(16f, 16f)
        )
        drawRoundRect(
            color = Color(0x28FFFFFF),
            topLeft = Offset(w * 0.55f, h * 0.12f),
            size = Size(w * 0.28f, h * 0.05f),
            cornerRadius = CornerRadius(16f, 16f)
        )

        // Drone silhouette in the upper right sky (glows red if droneWarning or sirenActive)
        val droneX = w * 0.78f
        val droneY = h * 0.12f
        if (droneWarning || sirenActive) {
            drawCircle(
                color = Color(0x66FF1744),
                radius = 28f,
                center = Offset(droneX, droneY + 2f)
            )
            drawCircle(
                color = Color(0xFFFF5252),
                radius = 22f,
                center = Offset(droneX, droneY + 2f),
                style = Stroke(width = 2.5f)
            )
        }
        val dronePath = Path().apply {
            moveTo(droneX, droneY - 8f)
            lineTo(droneX + 26f, droneY + 8f)
            lineTo(droneX + 6f, droneY + 5f)
            lineTo(droneX, droneY + 11f)
            lineTo(droneX - 6f, droneY + 5f)
            lineTo(droneX - 26f, droneY + 8f)
            close()
        }
        drawPath(dronePath, color = if (droneWarning || sirenActive) Color(0xFFFFCDD2) else Color(0xFF1F262A))

        // 2. Ground & road with queue of cars and red-white border barrier
        drawRect(
            color = Color(0xFF505A55),
            topLeft = Offset(0f, h * 0.36f),
            size = Size(w, h * 0.64f)
        )

        // SBK arrest tactical lights on background when DETAIN was triggered
        if (barrierState == BarrierVisualState.SBK_ARREST_FLASH) {
            drawCircle(
                color = Color(0x551565C0),
                radius = w * 0.25f,
                center = Offset(w * 0.22f, h * 0.42f)
            )
            drawCircle(
                color = Color(0x55D50000),
                radius = w * 0.25f,
                center = Offset(w * 0.78f, h * 0.42f)
            )
        }

        // Current Traveler's Distinctive Vehicle parked right behind them!
        val vehBodyColor = when (vehicleType) {
            VehicleVisualType.PORSCHE_YELLOW -> Color(0xFFFBC02D)
            VehicleVisualType.HEARSE_BLACK -> Color(0xFF1C1C1C)
            VehicleVisualType.PICKUP_CAMO -> Color(0xFF4B5320)
            VehicleVisualType.MINIVAN_WHITE -> Color(0xFFECEFF1)
            VehicleVisualType.SUV_BLACK -> Color(0xFF263238)
            VehicleVisualType.MOSKVITCH_BLUE -> Color(0xFF1976D2)
            VehicleVisualType.BUS_ORANGE -> Color(0xFFE65100)
            VehicleVisualType.SEDAN_STANDARD -> Color(0xFF607D8B)
        }
        val vehW = w * 0.66f
        val vehH = h * 0.26f
        val vehX = w * 0.17f
        val vehY = h * 0.36f

        drawRoundRect(
            color = vehBodyColor,
            topLeft = Offset(vehX, vehY),
            size = Size(vehW, vehH),
            cornerRadius = CornerRadius(12f, 12f)
        )
        // Windshield
        drawRoundRect(
            color = Color(0xFF1C262B),
            topLeft = Offset(vehX + vehW * 0.1f, vehY + 6f),
            size = Size(vehW * 0.8f, vehH * 0.48f),
            cornerRadius = CornerRadius(6f, 6f)
        )
        // Headlights
        val headlightColor = if (vehicleType == VehicleVisualType.PORSCHE_YELLOW) Color(0xFFFFF59D) else Color(0xFFE0E0E0)
        drawCircle(color = headlightColor, radius = 6f, center = Offset(vehX + 14f, vehY + vehH * 0.74f))
        drawCircle(color = headlightColor, radius = 6f, center = Offset(vehX + vehW - 14f, vehY + vehH * 0.74f))

        // Special vehicle roof details (Hearse cross, Moskvitch canister, SUV antenna)
        if (vehicleType == VehicleVisualType.HEARSE_BLACK) {
            drawLine(
                color = Color(0xFFFFD54F),
                start = Offset(w * 0.5f, vehY - 12f),
                end = Offset(w * 0.5f, vehY + 2f),
                strokeWidth = 3f
            )
            drawLine(
                color = Color(0xFFFFD54F),
                start = Offset(w * 0.5f - 5f, vehY - 7f),
                end = Offset(w * 0.5f + 5f, vehY - 7f),
                strokeWidth = 3f
            )
        } else if (vehicleType == VehicleVisualType.MOSKVITCH_BLUE) {
            // Roof rack canister
            drawRoundRect(
                color = Color(0xFF8D6E63),
                topLeft = Offset(w * 0.42f, vehY - 9f),
                size = Size(w * 0.16f, 9f),
                cornerRadius = CornerRadius(3f, 3f)
            )
        }

        // Red-and-white border barrier bar + traffic light post
        val barY = h * 0.47f
        drawRect(
            color = Color(0xFF37474F),
            topLeft = Offset(w * 0.04f, barY - 16f),
            size = Size(18f, 48f)
        )
        // Traffic light indicator (Green when OPEN_APPROVED, Blue/Red on arrest, Red when closed)
        val lightColor = when (barrierState) {
            BarrierVisualState.OPEN_APPROVED -> Color(0xFF00E676)
            BarrierVisualState.SBK_ARREST_FLASH -> Color(0xFF2979FF)
            BarrierVisualState.CLOSED -> Color(0xFFFF1744)
        }
        drawCircle(
            color = lightColor,
            radius = 5.5f,
            center = Offset(w * 0.04f + 9f, barY - 8f)
        )

        for (seg in 0 until 6) {
            val segY = if (barrierState == BarrierVisualState.OPEN_APPROVED) {
                barY - (seg + 1) * 7f
            } else {
                barY
            }
            drawRect(
                color = if (seg % 2 == 0) Color(0xFFC62828) else Color(0xFFECEFF1),
                topLeft = Offset(w * 0.08f + seg * (w * 0.08f), segY),
                size = Size(w * 0.08f, 9f)
            )
        }

        // 3. Draw the Traveler in the middle-bottom of the booth window
        drawPortraitInRegion(
            portrait = portrait,
            centerX = w * 0.5f,
            bottomY = h * 0.98f,
            scale = (h / 250f).coerceIn(0.75f, 1.5f)
        )

        // 4. Booth window mullions / frame
        val frameColor = Color(0xFF3E4A44)
        drawLine(
            color = frameColor,
            start = Offset(0f, h * 0.34f),
            end = Offset(w, h * 0.34f),
            strokeWidth = 6f
        )
        drawRect(
            color = Color(0xFF5D6B63),
            topLeft = Offset(0f, h - 10f),
            size = Size(w, 10f)
        )
    }
}

@Composable
fun MiniPassportPhoto(
    portrait: PortraitSpec,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .background(Color(0xFFD7CCC8), RoundedCornerShape(4.dp))
            .border(1.dp, Color(0xFF4E342E), RoundedCornerShape(4.dp))
    ) {
        drawPortraitInRegion(
            portrait = portrait,
            centerX = size.width * 0.5f,
            bottomY = size.height * 0.98f,
            scale = (size.height / 165f).coerceAtLeast(0.32f)
        )
    }
}

private fun DrawScope.drawPortraitInRegion(
    portrait: PortraitSpec,
    centerX: Float,
    bottomY: Float,
    scale: Float
) {
    val skinColors = listOf(
        Color(0xFFE8C3A2),
        Color(0xFFDCAE88),
        Color(0xFFC99670),
        Color(0xFFF2D4B7)
    )
    val hairColors = listOf(
        Color(0xFF231F20),
        Color(0xFF4E342E),
        Color(0xFF8D9499),
        Color(0xFFC59B48),
        Color(0xFF7B3F23)
    )
    val coatColors = when (portrait.specialId) {
        SpecialCharacterId.PALYCH_BOSS -> Color(0xFF3A4D39)
        SpecialCharacterId.TOLIK_SMUGGLER -> Color(0xFF212121)
        SpecialCharacterId.VOLUNTEER_OLYA -> Color(0xFF556B2F)
        SpecialCharacterId.DEPUTY_SON_MAJORS -> Color(0xFFB8860B)
        SpecialCharacterId.AUNT_HALYA -> Color(0xFF5C6BC0)
        SpecialCharacterId.SHYTOMYR_BRO -> Color(0xFF1565C0)
        else -> if (portrait.isFemale) Color(0xFF7E4A5C) else Color(0xFF5D4037)
    }

    val skin = skinColors[portrait.skinTone % skinColors.size]
    val hair = hairColors[portrait.hairColor % hairColors.size]
    val outline = Color(0xFF1B1B1B)

    // Shoulders / Coat
    val shoulderW = (if (portrait.isFemale) 114f else 128f) * scale
    val shoulderH = 54f * scale

    // Head dimensions
    val headW = if (portrait.isFemale) {
        64f * scale
    } else {
        when (portrait.faceShape % 4) {
            1 -> 74f * scale
            2 -> 66f * scale
            3 -> 80f * scale
            else -> 72f * scale
        }
    }
    val headH = (if (portrait.isFemale) 76f else 82f) * scale
    val headTop = bottomY - shoulderH - headH + 4f * scale

    // Long flowing back hair for females
    if (portrait.isFemale && portrait.headwear != 2) {
        drawRoundRect(
            color = hair,
            topLeft = Offset(centerX - headW * 0.72f, headTop + 6f * scale),
            size = Size(headW * 1.44f, headH + 30f * scale),
            cornerRadius = CornerRadius(28f * scale, 28f * scale)
        )
    }

    drawRoundRect(
        color = coatColors,
        topLeft = Offset(centerX - shoulderW / 2f, bottomY - shoulderH),
        size = Size(shoulderW, shoulderH + 10f),
        cornerRadius = CornerRadius(26f * scale, 26f * scale)
    )
    drawRoundRect(
        color = outline,
        topLeft = Offset(centerX - shoulderW / 2f, bottomY - shoulderH),
        size = Size(shoulderW, shoulderH + 10f),
        cornerRadius = CornerRadius(26f * scale, 26f * scale),
        style = Stroke(width = 3f * scale)
    )

    // Gold chain if present
    if (portrait.scarOrDetail == 3) {
        drawArc(
            color = Color(0xFFFFD54F),
            startAngle = 15f,
            sweepAngle = 150f,
            useCenter = false,
            topLeft = Offset(centerX - 24f * scale, bottomY - shoulderH - 4f * scale),
            size = Size(48f * scale, 32f * scale),
            style = Stroke(width = 4.5f * scale)
        )
    }

    // Neck
    val neckW = (if (portrait.isFemale) 22f else 30f) * scale
    drawRect(
        color = skin,
        topLeft = Offset(centerX - neckW / 2f, bottomY - shoulderH - 14f * scale),
        size = Size(neckW, 22f * scale)
    )

    // Floral headscarf background (if headwear == 2)
    if (portrait.headwear == 2) {
        drawRoundRect(
            color = Color(0xFF8D4E42),
            topLeft = Offset(centerX - headW * 0.64f, headTop - 8f * scale),
            size = Size(headW * 1.28f, headH * 1.18f),
            cornerRadius = CornerRadius(36f * scale, 36f * scale)
        )
    }

    // Ears + Female Earrings
    drawCircle(
        color = skin,
        radius = 8.5f * scale,
        center = Offset(centerX - headW * 0.52f, headTop + headH * 0.52f)
    )
    drawCircle(
        color = skin,
        radius = 8.5f * scale,
        center = Offset(centerX + headW * 0.52f, headTop + headH * 0.52f)
    )
    if (portrait.isFemale) {
        drawCircle(
            color = Color(0xFFFFD54F),
            radius = 4.2f * scale,
            center = Offset(centerX - headW * 0.54f, headTop + headH * 0.62f)
        )
        drawCircle(
            color = Color(0xFFFFD54F),
            radius = 4.2f * scale,
            center = Offset(centerX + headW * 0.54f, headTop + headH * 0.62f)
        )
    }

    // Head base
    val headCorner = (if (portrait.isFemale) 34f else 22f) * scale
    drawRoundRect(
        color = skin,
        topLeft = Offset(centerX - headW / 2f, headTop),
        size = Size(headW, headH),
        cornerRadius = CornerRadius(headCorner, headCorner)
    )
    drawRoundRect(
        color = outline,
        topLeft = Offset(centerX - headW / 2f, headTop),
        size = Size(headW, headH),
        cornerRadius = CornerRadius(headCorner, headCorner),
        style = Stroke(width = 3f * scale)
    )

    // Hair (if no full cap covering)
    if (portrait.headwear == 0 || portrait.headwear == 3) {
        drawRoundRect(
            color = hair,
            topLeft = Offset(centerX - headW * 0.54f, headTop - 6f * scale),
            size = Size(headW * 1.08f, headH * 0.30f),
            cornerRadius = CornerRadius(20f * scale, 20f * scale)
        )
        if (portrait.isFemale) {
            drawRect(
                color = hair,
                topLeft = Offset(centerX - headW * 0.56f, headTop + 8f * scale),
                size = Size(9f * scale, headH * 0.64f)
            )
            drawRect(
                color = hair,
                topLeft = Offset(centerX + headW * 0.47f, headTop + 8f * scale),
                size = Size(9f * scale, headH * 0.64f)
            )
        }
        if (portrait.hairStyle == 2 || portrait.isFemale) {
            // Top bun
            drawCircle(
                color = hair,
                radius = 14f * scale,
                center = Offset(centerX, headTop - 10f * scale)
            )
        }
    }

    // Headwear (1 = flat cap, 4 = officer peaked cap)
    if (portrait.headwear == 1) {
        drawRoundRect(
            color = Color(0xFF4E4B3E),
            topLeft = Offset(centerX - headW * 0.58f, headTop - 8f * scale),
            size = Size(headW * 1.16f, 24f * scale),
            cornerRadius = CornerRadius(12f * scale, 12f * scale)
        )
    } else if (portrait.headwear == 4) {
        drawRoundRect(
            color = Color(0xFF2E473B),
            topLeft = Offset(centerX - headW * 0.62f, headTop - 14f * scale),
            size = Size(headW * 1.24f, 26f * scale),
            cornerRadius = CornerRadius(8f * scale, 8f * scale)
        )
        drawCircle(
            color = Color(0xFFFFCA28),
            radius = 5f * scale,
            center = Offset(centerX, headTop - 2f * scale)
        )
    }

    // Eyes & Eyebrows
    val eyeY = headTop + headH * 0.44f
    val eyeOffsetX = headW * 0.21f
    drawCircle(color = Color.White, radius = 6.5f * scale, center = Offset(centerX - eyeOffsetX, eyeY))
    drawCircle(color = Color.White, radius = 6.5f * scale, center = Offset(centerX + eyeOffsetX, eyeY))
    drawCircle(color = outline, radius = 3.2f * scale, center = Offset(centerX - eyeOffsetX, eyeY))
    drawCircle(color = outline, radius = 3.2f * scale, center = Offset(centerX + eyeOffsetX, eyeY))

    // Eyebrows
    drawLine(
        color = hair,
        start = Offset(centerX - eyeOffsetX - 8f * scale, eyeY - 9f * scale),
        end = Offset(centerX - eyeOffsetX + 8f * scale, eyeY - 11f * scale),
        strokeWidth = 3.2f * scale
    )
    drawLine(
        color = hair,
        start = Offset(centerX + eyeOffsetX - 8f * scale, eyeY - 11f * scale),
        end = Offset(centerX + eyeOffsetX + 8f * scale, eyeY - 9f * scale),
        strokeWidth = 3.2f * scale
    )

    // Glasses (1=round, 2=dark aviators, 3=thick frames)
    if (portrait.glasses > 0) {
        val lensColor = if (portrait.glasses == 2) Color(0xCC102027) else Color(0x33E0F7FA)
        drawRoundRect(
            color = lensColor,
            topLeft = Offset(centerX - eyeOffsetX - 11f * scale, eyeY - 8f * scale),
            size = Size(22f * scale, 16f * scale),
            cornerRadius = CornerRadius(5f * scale, 5f * scale)
        )
        drawRoundRect(
            color = lensColor,
            topLeft = Offset(centerX + eyeOffsetX - 11f * scale, eyeY - 8f * scale),
            size = Size(22f * scale, 16f * scale),
            cornerRadius = CornerRadius(5f * scale, 5f * scale)
        )
        drawRoundRect(
            color = outline,
            topLeft = Offset(centerX - eyeOffsetX - 11f * scale, eyeY - 8f * scale),
            size = Size(22f * scale, 16f * scale),
            cornerRadius = CornerRadius(5f * scale, 5f * scale),
            style = Stroke(width = 2.5f * scale)
        )
        drawRoundRect(
            color = outline,
            topLeft = Offset(centerX + eyeOffsetX - 11f * scale, eyeY - 8f * scale),
            size = Size(22f * scale, 16f * scale),
            cornerRadius = CornerRadius(5f * scale, 5f * scale),
            style = Stroke(width = 2.5f * scale)
        )
    }

    // Nose
    val noseY = headTop + headH * 0.58f
    drawLine(
        color = outline,
        start = Offset(centerX, eyeY + 2f * scale),
        end = Offset(centerX - 4f * scale, noseY),
        strokeWidth = 2.5f * scale
    )
    drawLine(
        color = outline,
        start = Offset(centerX - 4f * scale, noseY),
        end = Offset(centerX + 5f * scale, noseY + 2f * scale),
        strokeWidth = 2.5f * scale
    )

    // Left cheek scar (if scarOrDetail == 1)
    if (portrait.scarOrDetail == 1) {
        drawLine(
            color = Color(0xFFB71C1C),
            start = Offset(centerX + headW * 0.18f, eyeY + 10f * scale),
            end = Offset(centerX + headW * 0.34f, noseY + 14f * scale),
            strokeWidth = 3f * scale
        )
    }

    // Sweat drops (if scarOrDetail == 2)
    if (portrait.scarOrDetail == 2) {
        drawCircle(
            color = Color(0xFF4FC3F7),
            radius = 4f * scale,
            center = Offset(centerX - headW * 0.34f, eyeY - 14f * scale)
        )
        drawCircle(
            color = Color(0xFF4FC3F7),
            radius = 3.5f * scale,
            center = Offset(centerX + headW * 0.36f, eyeY - 6f * scale)
        )
    }

    // Mustache / Facial Hair & Lips
    val mouthY = headTop + headH * 0.76f
    if (!portrait.isFemale && (portrait.facialHair == 2 || portrait.facialHair == 4)) {
        val mWidth = if (portrait.facialHair == 4) 38f * scale else 26f * scale
        drawRoundRect(
            color = hair,
            topLeft = Offset(centerX - mWidth / 2f, mouthY - 9f * scale),
            size = Size(mWidth, 9f * scale),
            cornerRadius = CornerRadius(6f * scale, 6f * scale)
        )
    } else if (!portrait.isFemale && portrait.facialHair == 3) {
        drawRoundRect(
            color = hair,
            topLeft = Offset(centerX - headW * 0.36f, mouthY - 6f * scale),
            size = Size(headW * 0.72f, 22f * scale),
            cornerRadius = CornerRadius(12f * scale, 12f * scale)
        )
    }

    if (portrait.isFemale) {
        // Eyelashes
        drawLine(
            color = outline,
            start = Offset(centerX - eyeOffsetX - 5f * scale, eyeY - 3f * scale),
            end = Offset(centerX - eyeOffsetX - 9f * scale, eyeY - 7f * scale),
            strokeWidth = 2.2f * scale
        )
        drawLine(
            color = outline,
            start = Offset(centerX + eyeOffsetX + 5f * scale, eyeY - 3f * scale),
            end = Offset(centerX + eyeOffsetX + 9f * scale, eyeY - 7f * scale),
            strokeWidth = 2.2f * scale
        )
        // Full rose lips
        drawRoundRect(
            color = Color(0xFFD85A6C),
            topLeft = Offset(centerX - 9f * scale, mouthY - 4f * scale),
            size = Size(18f * scale, 8.5f * scale),
            cornerRadius = CornerRadius(6f * scale, 6f * scale)
        )
    } else {
        drawLine(
            color = outline,
            start = Offset(centerX - 11f * scale, mouthY),
            end = Offset(centerX + 11f * scale, mouthY - if (portrait.expression == 1) 3f * scale else 0f),
            strokeWidth = 2.8f * scale
        )
    }
}
