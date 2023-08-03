package com.gutenberg;

import android.app.Application;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.core.util.Consumer;

import com.facebook.react.ReactApplication;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.reactnativecommunity.clipboard.ClipboardPackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.devsupport.interfaces.DevOptionHandler;
import com.facebook.react.devsupport.interfaces.DevSupportManager;
import com.horcrux.svg.SvgPackage;
import org.linusu.RNGetRandomValuesPackage;
import com.dylanvann.fastimage.FastImageViewPackage;

import org.wordpress.mobile.ReactNativeAztec.ReactAztecPackage;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeInterface;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergWebViewActivity;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNMedia;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgePackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import org.reactnative.maskedview.RNCMaskedViewPackage;
import org.wordpress.mobile.WPAndroidGlue.Media;
import org.wordpress.mobile.WPAndroidGlue.MediaOption;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

import im.shimo.react.prompt.RNPromptPackage;

public class MainApplication extends Application implements ReactApplication, GutenbergBridgeInterface {

    private static final String TAG = "MainApplication";

    private ReactNativeHost mReactNativeHost;
    private RNReactNativeGutenbergBridgePackage mRnReactNativeGutenbergBridgePackage;
    private GutenbergBridgeJS2Parent.ReplaceUnsupportedBlockCallback mReplaceUnsupportedBlockCallback;

    private ReactNativeHost createReactNativeHost() {
        mRnReactNativeGutenbergBridgePackage = new RNReactNativeGutenbergBridgePackage(new GutenbergBridgeJS2Parent() {
            @Override
            public void responseHtml(String title, String html, boolean changed, ReadableMap contentInfo) {
            }

            @Override
            public void requestMediaImport(String url, MediaSelectedCallback mediaSelectedCallback) {
            }

            @Override
            public void requestMediaPickerFromDeviceCamera(MediaSelectedCallback mediaSelectedCallback, MediaType mediaType) {
            }

            @Override
            public void requestMediaPickFromDeviceLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
            }

            @Override
            public void requestMediaPickFromMediaLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
                List<RNMedia> rnMediaList = new ArrayList<>();
                WritableNativeMap emptyMetadata = new WritableNativeMap();

                switch (mediaType) {
                    case IMAGE:
                        Media image = new Media(1, "https://cldup.com/cXyG__fTLN.jpg", "image", "Mountain", "", "A snow-capped mountain top in a cloudy sky with red-leafed trees in the foreground", emptyMetadata);
                        rnMediaList.add(image);
                        break;
                    case VIDEO:
                        WritableNativeMap metadata = new WritableNativeMap();
                        metadata.putString("extraID", "AbCdE");
                        Media video = new Media(2, "https://i.cloudup.com/YtZFJbuQCE.mov", "video", "Cloudup", "", "", metadata);
                        rnMediaList.add(video);
                        break;
                    case ANY:
                    case OTHER:
                        Media other = new Media(3, "https://wordpress.org/latest.zip", "zip", "WordPress latest version", "WordPress.zip", "", emptyMetadata);
                        rnMediaList.add(other);
                        break;
                    case AUDIO:
                        Media audio = new Media(5, "https://cldup.com/59IrU0WJtq.mp3", "audio", "Summer presto", "", "", emptyMetadata);
                        rnMediaList.add(audio);
                        break;
                }
                mediaSelectedCallback.onMediaFileSelected(rnMediaList);
            }


            @Override
            public void mediaUploadSync(MediaSelectedCallback mediaSelectedCallback) {
            }

            @Override
            public void mediaSaveSync(MediaSelectedCallback mediaSelectedCallback) {
            }

            @Override
            public void requestImageFailedRetryDialog(int mediaId) {
            }

            @Override
            public void requestImageUploadCancelDialog(int mediaId) {
            }

            @Override
            public void requestImageUploadCancel(int mediaId) {
            }

            @Override
            public void setFeaturedImage(int mediaId) {
            }

            @Override
            public void editorDidMount(ReadableArray unsupportedBlockNames) {
            }

            @Override
            public void editorDidAutosave() {
            }

            @Override
            public void getOtherMediaPickerOptions(OtherMediaOptionsReceivedCallback otherMediaOptionsReceivedCallback, MediaType mediaType) {
                if (mediaType == MediaType.ANY) {
                    ArrayList<MediaOption> mediaOptions = new ArrayList<>();
                    mediaOptions.add(new MediaOption("1", "Choose from device"));
                    otherMediaOptionsReceivedCallback.onOtherMediaOptionsReceived(mediaOptions);
                }
            }

            @Override
            public void requestMediaPickFrom(String mediaSource, MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection) {
                if (mediaSource.equals("1")) {
                    List<RNMedia> rnMediaList = new ArrayList<>();
                    Media pdf = new Media(1, "https://grad.illinois.edu/sites/default/files/pdfs/cvsamples.pdf", "other", "","cvsamples.pdf", "", new WritableNativeMap());
                    rnMediaList.add(pdf);
                    mediaSelectedCallback.onMediaFileSelected(rnMediaList);
                }
            }

            @Override
            public void requestImageFullscreenPreview(String mediaUrl) {

            }

            @Override
            public void requestEmbedFullscreenPreview(String content, String title) {

            }

            @Override
            public void requestMediaEditor(MediaSelectedCallback mediaSelectedCallback, String mediaUrl) {

            }

            @Override
            public void setFocalPointPickerTooltipShown(boolean tooltipShown) {
            }

            @Override
            public void requestFocalPointPickerTooltipShown(FocalPointPickerTooltipShownCallback focalPointPickerTooltipShownCallback) {
                focalPointPickerTooltipShownCallback.onRequestFocalPointPickerTooltipShown(false);
            }

            @Override
            public void editorDidEmitLog(String message, LogLevel logLevel) {
                switch (logLevel) {
                    case TRACE:
                        Log.d(TAG, message);
                        break;
                    case INFO:
                        Log.i(TAG, message);
                        break;
                    case WARN:
                        Log.w(TAG, message);
                        break;
                    case ERROR:
                        Log.e(TAG, message);
                        break;
                }
            }

            @Override
            public void performGetRequest(String path, boolean enableCaching, Consumer<String> onSuccess, Consumer<Bundle> onError) {}

            @Override
            public void performPostRequest(String path, ReadableMap data, Consumer<String> onSuccess, Consumer<Bundle> onError) {}

            @Override
            public void gutenbergDidRequestUnsupportedBlockFallback(ReplaceUnsupportedBlockCallback replaceUnsupportedBlockCallback,
                                                                    String content,
                                                                    String blockId,
                                                                    String blockName,
                                                                    String blockTitle) {
                mReplaceUnsupportedBlockCallback = replaceUnsupportedBlockCallback;
                openGutenbergWebView(content, blockId, blockTitle);
            }

            @Override
            public void onShowUserSuggestions(Consumer<String> onResult) {
                onResult.accept("matt");
            }

            @Override
            public void onShowXpostSuggestions(Consumer<String> onResult) {
                onResult.accept("ma.tt");
            }

            @Override
            public void requestMediaFilesEditorLoad(
                    ReadableArray mediaFiles,
                    String blockId
            ) {
                Toast.makeText(MainApplication.this, "requestMediaFilesEditorLoad called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void requestMediaFilesFailedRetryDialog(ReadableArray mediaFiles) {
                Toast.makeText(MainApplication.this, "requestMediaFilesFailedRetryDialog called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void requestMediaFilesUploadCancelDialog(ReadableArray mediaFiles) {
                Toast.makeText(MainApplication.this, "requestMediaFilesUploadCancelDialog called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void requestMediaFilesSaveCancelDialog(ReadableArray mediaFiles) {
                Toast.makeText(MainApplication.this, "requestMediaFilesSaveCancelDialog called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void mediaFilesBlockReplaceSync(
                    ReadableArray mediaFiles,
                    String blockId
            ) {
                Toast.makeText(MainApplication.this, "mediaFilesBlockReplaceSync called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void gutenbergDidSendButtonPressedAction(String buttonType) {

            }

            @Override
            public void requestPreview() {
                Toast.makeText(MainApplication.this, "requestPreview called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void requestBlockTypeImpressions(BlockTypeImpressionsCallback blockTypeImpressionsCallback) {
                ReadableMap impressions = Arguments.createMap();
                blockTypeImpressionsCallback.onRequestBlockTypeImpressions(impressions);
            }

            @Override
            public void setBlockTypeImpressions(ReadableMap impressions) {
                Log.d("BlockTypeImpressions", String.format("Gutenberg requested setting block type impression to %s.", impressions));
            }

            @Override
            public void requestContactCustomerSupport() {
                Toast.makeText(MainApplication.this, "requestContactCustomerSupport called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void requestGotoCustomerSupportOptions() {
                Toast.makeText(MainApplication.this, "requestGotoCustomerSupportOptions called", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void sendEventToHost(final String eventName, final ReadableMap properties) {
                Log.d("SendEventToHost", String.format("Gutenberg requested sending '%s' event to host with properties: %s", eventName, properties));
            }

            @Override
            public void toggleUndoButton(boolean isDisabled) {
                MainActivity mainActivity = MainActivity.getInstance();
                if (mainActivity != null) {
                    mainActivity.updateUndoItem(isDisabled);
                }
            }

            @Override
            public void toggleRedoButton(boolean isDisabled) {
                MainActivity mainActivity = MainActivity.getInstance();
                if (mainActivity != null) {
                    mainActivity.updateRedoItem(isDisabled);
                }
            }
        }, isDarkMode());

        return new DefaultReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
                return Arrays.asList(
                        new MainReactPackage(),
                        new ReactSliderPackage(),
                        new ReactVideoPackage(),
                        new SvgPackage(),
                        // passing null because we do not need log handlers in the demo app
                        new ReactAztecPackage(null, null),
                        new LinearGradientPackage(),
                        new RNGetRandomValuesPackage(),
                        new RNCMaskedViewPackage(),
                        new RNGestureHandlerPackage(),
                        new ReanimatedPackage(),
                        new SafeAreaContextPackage(),
                        new RNScreensPackage(),
                        new RNPromptPackage(),
                        new RNCWebViewPackage(),
                        new ClipboardPackage(),
                        new FastImageViewPackage(),
                        mRnReactNativeGutenbergBridgePackage);
            }

            @Override
            protected String getJSMainModuleName() {
                return "index";
            }

            @Override
            protected boolean isNewArchEnabled() {
                return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
            }
            @Override
            protected Boolean isHermesEnabled() {
                return BuildConfig.IS_HERMES_ENABLED;
            }
        };
    }

    private boolean isDarkMode() {
        Configuration configuration = getResources().getConfiguration();
        int currentNightMode = configuration.uiMode & Configuration.UI_MODE_NIGHT_MASK;

        return currentNightMode == Configuration.UI_MODE_NIGHT_YES;
    }

    public void toggleUndo() {
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().onUndoPressed();
    }

    public void toggleRedo() {
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().onRedoPressed();
    }

    private void openGutenbergWebView(String content,
                                      String blockId,
                                      String blockName) {
        Intent intent = new Intent(this, GutenbergWebViewActivity.class);
        intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_CONTENT, content);
        intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_ID, blockId);
        intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_NAME, blockName);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        if (mReactNativeHost == null) {
            mReactNativeHost = createReactNativeHost();
            createCustomDevOptions(mReactNativeHost);
        }

        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            DefaultNewArchitectureEntryPoint.load();
        }
        ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }

    private void createCustomDevOptions(ReactNativeHost reactNativeHost) {
        DevSupportManager devSupportManager = reactNativeHost.getReactInstanceManager().getDevSupportManager();

        devSupportManager.addCustomDevOption("Show html", new DevOptionHandler() {
            @Override
            public void onOptionSelected() {
                mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().toggleEditorMode();
            }
        });

        devSupportManager.addCustomDevOption("Help", new DevOptionHandler() {
            @Override
            public void onOptionSelected() {
                mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().showEditorHelp();
            }
        });
    }

    @Override
    public void saveContent(String content, String blockId) {
        if (mReplaceUnsupportedBlockCallback != null) {
            mReplaceUnsupportedBlockCallback.replaceUnsupportedBlock(content, blockId);
        }
    }
}
