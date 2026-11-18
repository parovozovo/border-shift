package com.lucky.bordershift

import android.annotation.SuppressLint
import android.graphics.Color as AndroidColor
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {
    private var gameWebView: WebView? = null

    private val backPressedCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            val view = gameWebView
            if (view == null) {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
                return
            }
            view.evaluateJavascript(
                "(function(){var d=document.querySelector('dialog[open]');if(d){d.close();return 'dialog';}return 'none';})();"
            ) { result ->
                if (result == "\"dialog\"") {
                    return@evaluateJavascript
                }
                if (view.canGoBack()) {
                    view.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(AndroidColor.parseColor("#0D110F")),
            navigationBarStyle = SystemBarStyle.dark(AndroidColor.parseColor("#0D110F"))
        )
        onBackPressedDispatcher.addCallback(this, backPressedCallback)

        setContent {
            MaterialTheme {
                AndroidView(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF0D110F))
                        .safeDrawingPadding(),
                    factory = { context ->
                        WebView(context).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            setBackgroundColor(AndroidColor.parseColor("#0D110F"))
                            overScrollMode = WebView.OVER_SCROLL_NEVER

                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                databaseEnabled = true
                                mediaPlaybackRequiresUserGesture = false
                                allowFileAccess = true
                                allowContentAccess = true
                                loadWithOverviewMode = true
                                useWideViewPort = true
                                setSupportZoom(false)
                                builtInZoomControls = false
                                displayZoomControls = false
                                cacheMode = WebSettings.LOAD_DEFAULT
                            }

                            webViewClient = WebViewClient()
                            webChromeClient = WebChromeClient()
                            loadUrl("file:///android_asset/index.html")
                            gameWebView = this
                        }
                    }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        gameWebView?.onResume()
    }

    override fun onPause() {
        gameWebView?.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        gameWebView?.let { view ->
            (view.parent as? ViewGroup)?.removeView(view)
            view.destroy()
        }
        gameWebView = null
        super.onDestroy()
    }
}
