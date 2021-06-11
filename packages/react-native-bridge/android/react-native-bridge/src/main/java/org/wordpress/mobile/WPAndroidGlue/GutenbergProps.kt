package org.wordpress.mobile.WPAndroidGlue

import android.os.Bundle

data class GutenbergProps @JvmOverloads constructor(
    val enableContactInfoBlock: Boolean,
    val enableMediaFilesCollectionBlocks: Boolean,
    val enableMentions: Boolean,
    val enableXPosts: Boolean,
    val enableUnsupportedBlockEditor: Boolean,
    val canEnableUnsupportedBlockEditor: Boolean,
    val enableAudioBlock: Boolean,
    val localeSlug: String,
    val postType: String,
    val featuredImageId: Int,
    val editorTheme: Bundle?,
    val translations: Bundle,
    val isDarkMode: Boolean,
    val htmlModeEnabled: Boolean
) {

    fun getInitialProps(bundle: Bundle?) = (bundle ?: Bundle()).apply {
        putString(PROP_INITIAL_DATA, "")
        putString(PROP_INITIAL_TITLE, "")
        putString(PROP_LOCALE, localeSlug)
        putString(PROP_POST_TYPE, postType)
        putInt(PROP_INITIAL_FEATURED_IMAGE_ID, featuredImageId)
        putBundle(PROP_TRANSLATIONS, translations)
        putBoolean(PROP_INITIAL_HTML_MODE_ENABLED, htmlModeEnabled)

        putBundle(PROP_CAPABILITIES, getUpdatedCapabilitiesProps())

        editorTheme?.also { theme ->
            theme.getSerializable(PROP_COLORS)?.let { putSerializable(PROP_COLORS, it) }
            theme.getSerializable(PROP_GRADIENTS)?.let { putSerializable(PROP_GRADIENTS, it) }
        }
    }

    fun getUpdatedCapabilitiesProps() = Bundle().apply {
        putBoolean(PROP_CAPABILITIES_MENTIONS, enableMentions)
        putBoolean(PROP_CAPABILITIES_XPOSTS, enableXPosts)
        putBoolean(PROP_CAPABILITIES_CONTACT_INFO_BLOCK, enableContactInfoBlock)
        putBoolean(PROP_CAPABILITIES_MEDIAFILES_COLLECTION_BLOCK, enableMediaFilesCollectionBlocks)
        putBoolean(PROP_CAPABILITIES_UNSUPPORTED_BLOCK_EDITOR, enableUnsupportedBlockEditor)
        putBoolean(PROP_CAPABILITIES_CAN_ENABLE_UNSUPPORTED_BLOCK_EDITOR, canEnableUnsupportedBlockEditor)
        putBoolean(PROP_CAPABILITIES_AUDIO_BLOCK, enableAudioBlock)
    }

    companion object {

        fun initContent(bundle: Bundle?, title: String?, content: String?) =
                (bundle ?: Bundle()).apply {
                    title?.let { putString(PROP_INITIAL_TITLE, it) }
                    content?.let { putString(PROP_INITIAL_DATA, it) }
                }

        private const val PROP_INITIAL_DATA = "initialData"
        private const val PROP_INITIAL_TITLE = "initialTitle"
        private const val PROP_INITIAL_HTML_MODE_ENABLED = "initialHtmlModeEnabled"
        private const val PROP_POST_TYPE = "postType"
        private const val PROP_INITIAL_FEATURED_IMAGE_ID = "featuredImageId"
        private const val PROP_LOCALE = "locale"
        private const val PROP_TRANSLATIONS = "translations"
        private const val PROP_COLORS = "colors"
        private const val PROP_GRADIENTS = "gradients"

        const val PROP_CAPABILITIES = "capabilities"
        const val PROP_CAPABILITIES_CONTACT_INFO_BLOCK = "contactInfoBlock"
        const val PROP_CAPABILITIES_MEDIAFILES_COLLECTION_BLOCK = "mediaFilesCollectionBlock"
        const val PROP_CAPABILITIES_MENTIONS = "mentions"
        const val PROP_CAPABILITIES_XPOSTS = "xposts"
        const val PROP_CAPABILITIES_UNSUPPORTED_BLOCK_EDITOR = "unsupportedBlockEditor"
        const val PROP_CAPABILITIES_CAN_ENABLE_UNSUPPORTED_BLOCK_EDITOR = "canEnableUnsupportedBlockEditor"
        const val PROP_CAPABILITIES_AUDIO_BLOCK = "audioBlock"
    }
}
