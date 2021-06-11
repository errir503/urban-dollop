<?php
/**
 * Bootstraps Global Styles.
 *
 * @package gutenberg
 */

/**
 * Takes a tree adhering to the theme.json schema and generates
 * the corresponding stylesheet.
 *
 * @param WP_Theme_JSON $tree Input tree.
 * @param string        $type Type of stylesheet we want accepts 'all', 'block_styles', and 'css_variables'.
 *
 * @return string Stylesheet.
 */
function gutenberg_experimental_global_styles_get_stylesheet( $tree, $type = 'all' ) {
	// Check if we can use cached.
	$can_use_cached = (
		( 'all' === $type ) &&
		( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) &&
		( ! defined( 'SCRIPT_DEBUG' ) || ! SCRIPT_DEBUG ) &&
		( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) &&
		! is_admin()
	);

	if ( $can_use_cached ) {
		// Check if we have the styles already cached.
		$cached = get_transient( 'global_styles' );
		if ( $cached ) {
			return $cached;
		}
	}

	$stylesheet = $tree->get_stylesheet( $type );

	if ( $can_use_cached ) {
		// Cache for a minute.
		// This cache doesn't need to be any longer, we only want to avoid spikes on high-traffic sites.
		set_transient( 'global_styles', $stylesheet, MINUTE_IN_SECONDS );
	}

	return $stylesheet;
}

/**
 * Fetches the preferences for each origin (core, theme, user)
 * and enqueues the resulting stylesheet.
 */
function gutenberg_experimental_global_styles_enqueue_assets() {
	if (
		! get_theme_support( 'experimental-link-color' ) && // link color support needs the presets CSS variables regardless of the presence of theme.json file.
		! WP_Theme_JSON_Resolver::theme_has_support() ) {
		return;
	}

	$settings           = gutenberg_get_default_block_editor_settings();
	$theme_support_data = WP_Theme_JSON::get_from_editor_settings( $settings );

	$all = WP_Theme_JSON_Resolver::get_merged_data( $theme_support_data );

	$stylesheet = gutenberg_experimental_global_styles_get_stylesheet( $all );
	if ( empty( $stylesheet ) ) {
		return;
	}

	wp_register_style( 'global-styles', false, array(), true, true );
	wp_add_inline_style( 'global-styles', $stylesheet );
	wp_enqueue_style( 'global-styles' );
}

/**
 * Adds the necessary data for the Global Styles client UI to the block settings.
 *
 * This can be removed when plugin support requires WordPress 5.8.0+.
 *
 * @param array $settings Existing block editor settings.
 * @return array New block editor settings
 */
function gutenberg_experimental_global_styles_settings( $settings ) {
	$theme_support_data = WP_Theme_JSON::get_from_editor_settings( $settings );
	unset( $settings['colors'] );
	unset( $settings['disableCustomColors'] );
	unset( $settings['disableCustomFontSizes'] );
	unset( $settings['disableCustomGradients'] );
	unset( $settings['enableCustomLineHeight'] );
	unset( $settings['enableCustomUnits'] );
	unset( $settings['enableCustomSpacing'] );
	unset( $settings['fontSizes'] );
	unset( $settings['gradients'] );

	$origin = 'theme';
	if (
		WP_Theme_JSON_Resolver::theme_has_support() &&
		gutenberg_supports_block_templates()
	) {
		// Only lookup for the user data if we need it.
		$origin = 'user';
	}
	$tree = WP_Theme_JSON_Resolver::get_merged_data( $theme_support_data, $origin );

	// STEP 1: ADD FEATURES
	//
	// These need to be always added to the editor settings,
	// even for themes that don't support theme.json.
	// An example of this is that the presets are configured
	// from the theme support data.
	$settings['__experimentalFeatures'] = $tree->get_settings();

	// STEP 2 - IF EDIT-SITE, ADD DATA REQUIRED FOR GLOBAL STYLES SIDEBAR
	//
	// In the site editor, the user can change styles, so the client
	// needs the ability to create them. Hence, we pass it some data
	// for this: base styles (core+theme) and the ID of the user CPT.
	$screen = get_current_screen();
	if (
		! empty( $screen ) &&
		function_exists( 'gutenberg_is_edit_site_page' ) &&
		gutenberg_is_edit_site_page( $screen->id ) &&
		WP_Theme_JSON_Resolver::theme_has_support() &&
		gutenberg_supports_block_templates()
	) {
		$user_cpt_id = WP_Theme_JSON_Resolver::get_user_custom_post_type_id();
		$base_styles = WP_Theme_JSON_Resolver::get_merged_data( $theme_support_data, 'theme' )->get_raw_data();

		$settings['__experimentalGlobalStylesUserEntityId'] = $user_cpt_id;
		$settings['__experimentalGlobalStylesBaseStyles']   = $base_styles;
	} elseif (
		WP_Theme_JSON_Resolver::theme_has_support() ||
		get_theme_support( 'experimental-link-color' ) // link color support needs the presets CSS variables regardless of the presence of theme.json file.
	) {
		// STEP 3 - ADD STYLES IF THEME HAS SUPPORT
		//
		// If we are in a block editor context, but not in edit-site,
		// we add the styles via the settings, so the editor knows that
		// some of these should be added the wrapper class,
		// as if they were added via add_editor_styles.
		$settings['styles'][] = array(
			'css'                     => gutenberg_experimental_global_styles_get_stylesheet( $tree, 'css_variables' ),
			'__experimentalNoWrapper' => true,
		);
		$settings['styles'][] = array(
			'css' => gutenberg_experimental_global_styles_get_stylesheet( $tree, 'block_styles' ),
		);
	}

	return $settings;
}

/**
 * Register CPT to store/access user data.
 *
 * @return array|undefined
 */
function gutenberg_experimental_global_styles_register_user_cpt() {
	if ( ! WP_Theme_JSON_Resolver::theme_has_support() ) {
		return;
	}

	WP_Theme_JSON_Resolver::register_user_custom_post_type();
}

add_action( 'init', 'gutenberg_experimental_global_styles_register_user_cpt' );
// This can be removed when plugin support requires WordPress 5.8.0+.
if ( function_exists( 'get_block_editor_settings' ) ) {
	add_filter( 'block_editor_settings_all', 'gutenberg_experimental_global_styles_settings', PHP_INT_MAX );
} else {
	add_filter( 'block_editor_settings', 'gutenberg_experimental_global_styles_settings', PHP_INT_MAX );

}
add_action( 'wp_enqueue_scripts', 'gutenberg_experimental_global_styles_enqueue_assets' );


/**
 * Sanitizes global styles user content removing unsafe rules.
 *
 * @param string $content Post content to filter.
 * @return string Filtered post content with unsafe rules removed.
 */
function gutenberg_global_styles_filter_post( $content ) {
	$decoded_data        = json_decode( stripslashes( $content ), true );
	$json_decoding_error = json_last_error();
	if (
		JSON_ERROR_NONE === $json_decoding_error &&
		is_array( $decoded_data ) &&
		isset( $decoded_data['isGlobalStylesUserThemeJSON'] ) &&
		$decoded_data['isGlobalStylesUserThemeJSON']
	) {
		unset( $decoded_data['isGlobalStylesUserThemeJSON'] );
		$theme_json = new WP_Theme_JSON( $decoded_data );
		$theme_json->remove_insecure_properties();
		$data_to_encode                                = $theme_json->get_raw_data();
		$data_to_encode['isGlobalStylesUserThemeJSON'] = true;
		return wp_json_encode( $data_to_encode );
	}
	return $content;
}

/**
 * Adds the filters to filter global styles user theme.json.
 */
function gutenberg_global_styles_kses_init_filters() {
	add_filter( 'content_save_pre', 'gutenberg_global_styles_filter_post' );
}

/**
 * Removes the filters to filter global styles user theme.json.
 */
function gutenberg_global_styles_kses_remove_filters() {
	remove_filter( 'content_save_pre', 'gutenberg_global_styles_filter_post' );
}

/**
 * Register global styles kses filters if the user does not have unfiltered_html capability.
 *
 * @uses render_block_core_navigation()
 * @throws WP_Error An WP_Error exception parsing the block definition.
 */
function gutenberg_global_styles_kses_init() {
	gutenberg_global_styles_kses_remove_filters();
	if ( ! current_user_can( 'unfiltered_html' ) ) {
		gutenberg_global_styles_kses_init_filters();
	}
}

/**
 * This filter is the last being executed on force_filtered_html_on_import.
 * If the input of the filter is true it means we are in an import situation and should
 * enable kses, independently of the user capabilities.
 * So in that case we call gutenberg_global_styles_kses_init_filters;
 *
 * @param string $arg Input argument of the filter.
 * @return string Exactly what was passed as argument.
 */
function gutenberg_global_styles_force_filtered_html_on_import_filter( $arg ) {
	// force_filtered_html_on_import is true we need to init the global styles kses filters.
	if ( $arg ) {
		gutenberg_global_styles_kses_init_filters();
	}
	return $arg;
}

/**
 * This filter is the last being executed on force_filtered_html_on_import.
 * If the input of the filter is true it means we are in an import situation and should
 * enable kses, independently of the user capabilities.
 * So in that case we call gutenberg_global_styles_kses_init_filters;
 *
 * @param bool $allow_css       Whether the CSS in the test string is considered safe.
 * @param bool $css_test_string The CSS string to test..
 * @return bool If $allow_css is true it returns true.
 * If $allow_css is false and the CSS rule is referencing a WordPress css variable it returns true.
 * Otherwise the function return false.
 */
function gutenberg_global_styles_include_support_for_wp_variables( $allow_css, $css_test_string ) {
	if ( $allow_css ) {
		return $allow_css;
	}
	$allowed_preset_attributes = array(
		'background',
		'background-color',
		'border-color',
		'color',
		'font-family',
		'font-size',
	);
	$parts                     = explode( ':', $css_test_string, 2 );

	if ( ! in_array( trim( $parts[0] ), $allowed_preset_attributes, true ) ) {
		return $allow_css;
	}
	return ! ! preg_match( '/^var\(--wp-[a-zA-Z0-9\-]+\)$/', trim( $parts[1] ) );
}


add_action( 'init', 'gutenberg_global_styles_kses_init' );
add_action( 'set_current_user', 'gutenberg_global_styles_kses_init' );
add_filter( 'force_filtered_html_on_import', 'gutenberg_global_styles_force_filtered_html_on_import_filter', 999 );
add_filter( 'safecss_filter_attr_allow_css', 'gutenberg_global_styles_include_support_for_wp_variables', 10, 2 );
// This filter needs to be executed last.

