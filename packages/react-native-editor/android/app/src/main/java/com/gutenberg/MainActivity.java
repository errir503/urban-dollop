package com.gutenberg;

import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

import org.wordpress.mobile.WPAndroidGlue.GutenbergProps;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "gutenberg";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Nullable
            @Override
            protected Bundle getLaunchOptions() {
                Bundle bundle = new Bundle();
                Bundle capabilities = new Bundle();
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_MENTIONS, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_XPOSTS, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_UNSUPPORTED_BLOCK_EDITOR, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_REUSABLE_BLOCK, false);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_IS_AUDIO_BLOCK_MEDIA_UPLOAD_ENABLED, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_FACEBOOK_EMBED_BLOCK, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_INSTAGRAM_EMBED_BLOCK, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_LOOM_EMBED_BLOCK, true);
                capabilities.putBoolean(GutenbergProps.PROP_CAPABILITIES_SMARTFRAME_EMBED_BLOCK, true);
                bundle.putBundle(GutenbergProps.PROP_CAPABILITIES, capabilities);
                return bundle;
            }
        };
    }
}
