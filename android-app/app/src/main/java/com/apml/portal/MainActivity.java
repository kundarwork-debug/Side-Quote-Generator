package com.apml.portal;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final String PORTAL_URL = "https://apmlportal.vercel.app/index.html";
    private static final int NAVY = Color.rgb(15, 27, 52);
    private static final int BLUE = Color.rgb(45, 105, 220);
    private static final int MUTED = Color.rgb(112, 125, 148);

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private ProgressBar progress;
    private TextView errorView;
    private FrameLayout contentFrame;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.WHITE);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        getWindow().setNavigationBarColor(Color.WHITE);
        buildNativeShell();
        configureWebView();
        if (state == null) webView.loadUrl(PORTAL_URL);
        else if (webView.restoreState(state) == null) webView.loadUrl(PORTAL_URL);
    }

    private void buildNativeShell() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(18), dp(12), dp(16), dp(12));
        header.setBackgroundColor(NAVY);

        TextView mark = new TextView(this);
        mark.setText("AP");
        mark.setTextColor(Color.WHITE);
        mark.setTextSize(16);
        mark.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        mark.setGravity(Gravity.CENTER);
        GradientDrawable markBg = new GradientDrawable();
        markBg.setColor(BLUE);
        markBg.setCornerRadius(dp(12));
        mark.setBackground(markBg);
        header.addView(mark, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout brand = new LinearLayout(this);
        brand.setOrientation(LinearLayout.VERTICAL);
        brand.setPadding(dp(12), 0, 0, 0);
        TextView title = new TextView(this);
        title.setText("APML Portal");
        title.setTextColor(Color.WHITE);
        title.setTextSize(17);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        TextView subtitle = new TextView(this);
        subtitle.setText("Admin workspace");
        subtitle.setTextColor(Color.rgb(190, 202, 222));
        subtitle.setTextSize(11);
        brand.addView(title);
        brand.addView(subtitle);
        header.addView(brand, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

        TextView refresh = actionText("↻", "Refresh portal");
        refresh.setTextSize(25);
        refresh.setTextColor(Color.WHITE);
        refresh.setOnClickListener(v -> reloadPortal());
        header.addView(refresh, new LinearLayout.LayoutParams(dp(44), dp(44)));
        root.addView(header);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(BLUE));
        progress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(232, 237, 245)));
        progress.setIndeterminate(false);
        root.addView(progress, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));

        contentFrame = new FrameLayout(this);
        webView = new WebView(this);
        contentFrame.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        errorView = new TextView(this);
        errorView.setVisibility(View.GONE);
        errorView.setGravity(Gravity.CENTER);
        errorView.setTextColor(NAVY);
        errorView.setTextSize(16);
        errorView.setPadding(dp(32), dp(32), dp(32), dp(32));
        errorView.setBackgroundColor(Color.WHITE);
        contentFrame.addView(errorView, new FrameLayout.LayoutParams(-1, -1));
        root.addView(contentFrame, new LinearLayout.LayoutParams(-1, 0, 1));

        setContentView(root);
    }

    private TextView actionText(String glyph, String description) {
        TextView t = new TextView(this);
        t.setText(glyph);
        t.setContentDescription(description);
        t.setGravity(Gravity.CENTER);
        t.setTextSize(21);
        t.setTextColor(NAVY);
        t.setClickable(true);
        t.setFocusable(true);
        return t;
    }

    private View navItem(String glyph, String label, View.OnClickListener listener) {
        LinearLayout item = new LinearLayout(this);
        item.setOrientation(LinearLayout.VERTICAL);
        item.setGravity(Gravity.CENTER);
        item.setClickable(true);
        item.setFocusable(true);
        TextView icon = new TextView(this);
        icon.setText(glyph);
        icon.setTextSize(23);
        icon.setTextColor(BLUE);
        icon.setGravity(Gravity.CENTER);
        TextView caption = new TextView(this);
        caption.setText(label);
        caption.setTextSize(11);
        caption.setTextColor(MUTED);
        caption.setGravity(Gravity.CENTER);
        item.addView(icon);
        item.addView(caption);
        item.setOnClickListener(listener);
        item.setContentDescription(label);
        item.setLayoutParams(new LinearLayout.LayoutParams(0, -1, 1));
        return item;
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost() == null ? "" : uri.getHost();
                if ("apmlportal.vercel.app".equalsIgnoreCase(host) ||
                    host.endsWith(".firebaseapp.com") || host.endsWith(".googleapis.com") ||
                    host.endsWith(".gstatic.com") || host.endsWith(".google.com")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (ActivityNotFoundException ignored) {}
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                errorView.setVisibility(View.GONE);
                progress.setVisibility(View.VISIBLE);
                progress.setProgress(5);
            }
            @Override public void onPageFinished(WebView view, String url) {
                // Keep the portal responsive inside the phone's available screen width.
                String responsiveFix = "(function(){"
                    + "var m=document.querySelector('meta[name=viewport]');"
                    + "if(!m){m=document.createElement('meta');m.name='viewport';m.content='width=device-width,initial-scale=1';document.head.appendChild(m);}"
                    + "var s=document.getElementById('apml-android-fit');"
                    + "if(!s){s=document.createElement('style');s.id='apml-android-fit';document.head.appendChild(s);}"
                    + "s.textContent='html{width:100%!important;max-width:100%!important;height:auto!important;min-height:100%;overflow-x:hidden!important;overflow-y:auto!important;-webkit-text-size-adjust:100%;}'"
                    + "+'body{width:100%!important;max-width:100%!important;height:auto!important;min-height:100vh;overflow-x:hidden!important;overflow-y:auto!important;}'"
                    + "+'body>*{max-width:100%;}'"
                    + "+'*,*:before,*:after{box-sizing:border-box;}'"
                    + "+'img,video,canvas,svg,iframe{max-width:100%;}'"
                    + "+'table{max-width:100%;}'"
                    + "+'@media(max-width:768px){main,.container,.page-container,.content,.drive-container,.gallery-container{max-width:100%!important;width:100%!important;} .page-head,.drive-head-bar,.gallery-head-bar{flex-wrap:wrap!important;} .grid,.kpis,.modules-grid{min-width:0!important;} #footer-container,footer,.site-footer{width:100%!important;max-width:100%!important;height:auto!important;min-height:0!important;flex-shrink:0!important;overflow:visible!important;} .sheet-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;} .sheet{max-width:100%!important;} }';"
                    + "})();";
                view.evaluateJavascript(responsiveFix, null);
                progress.setProgress(100);
                progress.postDelayed(() -> progress.setVisibility(View.GONE), 250);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame()) {
                    progress.setVisibility(View.GONE);
                    errorView.setText("Unable to connect to APML Portal\n\nCheck your internet connection and try again.\n\nTap here to retry.");
                    errorView.setVisibility(View.VISIBLE);
                    errorView.setOnClickListener(v -> reloadPortal());
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value);
                if (value >= 100) progress.setVisibility(View.GONE);
                else progress.setVisibility(View.VISIBLE);
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = params.createIntent();
                try { startActivityForResult(intent, FILE_CHOOSER_REQUEST); }
                catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "No file picker available", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimeType);
                request.addRequestHeader("User-Agent", userAgent);
                String cookie = CookieManager.getInstance().getCookie(url);
                if (cookie != null) request.addRequestHeader("Cookie", cookie);
                request.setTitle("APML Portal download");
                request.setDescription("Downloading file…");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "APML-" + System.currentTimeMillis());
                ((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(request);
                Toast.makeText(this, "Download started", Toast.LENGTH_SHORT).show();
            } catch (Exception e) { Toast.makeText(this, "Unable to download this file", Toast.LENGTH_LONG).show(); }
        });
    }

    private void reloadPortal() {
        errorView.setVisibility(View.GONE);
        webView.reload();
    }

    private int dp(int value) { return (int)(value * getResources().getDisplayMetrics().density + 0.5f); }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileCallback.onReceiveValue(results);
            fileCallback = null;
        }
    }

    @Override protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (webView != null) webView.saveState(out);
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
