package com.lucky.bordershift.ui

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

class SoundAndHaptics(private val context: Context) {

    private val toneGen: ToneGenerator? = try {
        ToneGenerator(AudioManager.STREAM_MUSIC, 65)
    } catch (_: Throwable) {
        null
    }

    private fun vibrate(ms: Long) {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(ms)
            }
        } catch (_: Throwable) {
        }
    }

    fun playStampApprove() {
        vibrate(45)
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_ACK, 90)
        } catch (_: Throwable) {}
    }

    fun playStampDeny() {
        vibrate(65)
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_NACK, 120)
        } catch (_: Throwable) {}
    }

    fun playDetainAlarm() {
        vibrate(140)
        try {
            toneGen?.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 220)
        } catch (_: Throwable) {}
    }

    fun playBribeCash() {
        vibrate(35)
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_BEEP2, 110)
        } catch (_: Throwable) {}
    }

    fun playPaperTap() {
        vibrate(15)
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_BEEP, 35)
        } catch (_: Throwable) {}
    }

    fun playSirenAlert() {
        vibrate(200)
        try {
            toneGen?.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 350)
        } catch (_: Throwable) {}
    }
}
