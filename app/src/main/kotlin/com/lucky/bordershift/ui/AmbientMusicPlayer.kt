package com.lucky.bordershift.ui

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.concurrent.thread
import kotlin.math.PI
import kotlin.math.sin

enum class MusicMood {
    CALM_DARK,
    BOOTH_NORMAL,
    TENSE
}

class AmbientMusicPlayer {

    @Volatile
    private var enabled = true

    @Volatile
    private var paused = false

    @Volatile
    private var mood = MusicMood.CALM_DARK

    @Volatile
    private var running = false

    private var workerThread: Thread? = null

    fun setMood(newMood: MusicMood) {
        mood = newMood
    }

    fun isEnabled(): Boolean = enabled

    fun setEnabled(isEnabled: Boolean) {
        enabled = isEnabled
    }

    fun setPaused(isPaused: Boolean) {
        paused = isPaused
    }

    fun start() {
        if (running) return
        running = true
        workerThread = thread(isDaemon = true, name = "BorderShiftMusic") {
            runAudioLoop()
        }
    }

    fun stop() {
        running = false
        try {
            workerThread?.join(300)
        } catch (_: InterruptedException) {
        }
        workerThread = null
    }

    private fun runAudioLoop() {
        val sampleRate = 22050
        val minBuf = AudioTrack.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        ).coerceAtLeast(4096)

        val track = try {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(minBuf)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()
        } catch (_: Throwable) {
            return
        }

        val chunkSize = 1024
        val buffer = ShortArray(chunkSize)
        var sampleIndex = 0L

        // A minor / D minor dark atmospheric frequencies
        val calmChord = doubleArrayOf(110.0, 164.81, 220.0, 261.63)       // Am (A2, E3, A3, C4)
        val tenseChord = doubleArrayOf(98.0, 146.83, 207.65, 293.66)     // Dark dissonant Gm/F# feel

        try {
            track.play()
            while (running) {
                if (!enabled || paused) {
                    buffer.fill(0)
                    track.write(buffer, 0, chunkSize)
                    Thread.sleep(40)
                    continue
                }

                val currentMood = mood
                val twoPi = 2.0 * PI

                for (i in 0 until chunkSize) {
                    val t = (sampleIndex + i).toDouble() / sampleRate
                    val sampleValue = when (currentMood) {
                        MusicMood.CALM_DARK -> {
                            // Slow breathing drone
                            val lfo = 0.55 + 0.45 * sin(twoPi * 0.14 * t)
                            val bass = sin(twoPi * calmChord[0] * t) * 0.35
                            val fifth = sin(twoPi * calmChord[1] * t) * 0.18 * lfo
                            val minorThird = sin(twoPi * calmChord[3] * t) * 0.12 * (1.0 - lfo * 0.5)
                            (bass + fifth + minorThird) * 0.28
                        }

                        MusicMood.BOOTH_NORMAL -> {
                            // Steady low drone + subtle 1.5 Hz paperwork pulse
                            val pulse = 0.5 + 0.5 * sin(twoPi * 1.5 * t)
                            val bass = sin(twoPi * 110.0 * t) * (0.28 + 0.12 * pulse)
                            val mid = sin(twoPi * 164.81 * t) * 0.14
                            val high = sin(twoPi * 329.63 * t) * 0.06 * sin(twoPi * 0.25 * t)
                            (bass + mid + high) * 0.28
                        }

                        MusicMood.TENSE -> {
                            // Urgent double-heartbeat pulse + low minor second tension
                            val beatPhase = (t * 2.2) % 1.0
                            val heartbeat = if (beatPhase < 0.15) 1.0 else if (beatPhase in 0.22..0.34) 0.7 else 0.15
                            val bass = sin(twoPi * tenseChord[0] * t) * 0.42 * heartbeat
                            val tension = sin(twoPi * tenseChord[2] * t) * 0.18
                            val sirenHum = sin(twoPi * (290.0 + 18.0 * sin(twoPi * 0.6 * t)) * t) * 0.09
                            (bass + tension + sirenHum) * 0.36
                        }
                    }

                    val clamped = (sampleValue * Short.MAX_VALUE).toInt()
                        .coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt())
                    buffer[i] = clamped.toShort()
                }

                sampleIndex += chunkSize
                track.write(buffer, 0, chunkSize)
            }
        } catch (_: Throwable) {
        } finally {
            try {
                track.stop()
                track.release()
            } catch (_: Throwable) {
            }
        }
    }
}
