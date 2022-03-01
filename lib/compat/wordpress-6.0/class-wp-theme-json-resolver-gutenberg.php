<?php
/**
 * WP_Theme_JSON_Resolver_Gutenberg class
 *
 * @package gutenberg
 */

/**
 * Class that abstracts the processing of the different data sources
 * for site-level config and offers an API to work with them.
 *
 * This class is for internal core usage and is not supposed to be used by extenders (plugins and/or themes).
 * This is a low-level API that may need to do breaking changes. Please,
 * use get_global_settings, get_global_styles, and get_global_stylesheet instead.
 *
 * @access private
 */
class WP_Theme_JSON_Resolver_Gutenberg extends WP_Theme_JSON_Resolver_5_9 {

	/**
	 * Returns the theme's data.
	 *
	 * Data from theme.json will be backfilled from existing
	 * theme supports, if any. Note that if the same data
	 * is present in theme.json and in theme supports,
	 * the theme.json takes precedence.
	 *
	 * @param array $deprecated Deprecated argument.
	 * @return WP_Theme_JSON_Gutenberg Entity that holds theme data.
	 */
	public static function get_theme_data( $deprecated = array() ) {
		if ( ! empty( $deprecated ) ) {
			_deprecated_argument( __METHOD__, '5.9' );
		}
		if ( null === static::$theme ) {
			$theme_json_data = static::read_json_file( static::get_file_path_from_theme( 'theme.json' ) );
			$theme_json_data = static::translate( $theme_json_data, wp_get_theme()->get( 'TextDomain' ) );
			$theme_json_data = gutenberg_add_registered_webfonts_to_theme_json( $theme_json_data );
			static::$theme   = new WP_Theme_JSON_Gutenberg( $theme_json_data );

			if ( wp_get_theme()->parent() ) {
				// Get parent theme.json.
				$parent_theme_json_data = static::read_json_file( static::get_file_path_from_theme( 'theme.json', true ) );
				$parent_theme_json_data = static::translate( $parent_theme_json_data, wp_get_theme()->parent()->get( 'TextDomain' ) );
				$parent_theme_json_data = gutenberg_add_registered_webfonts_to_theme_json( $parent_theme_json_data );
				$parent_theme           = new WP_Theme_JSON_Gutenberg( $parent_theme_json_data );

				// Merge the child theme.json into the parent theme.json.
				// The child theme takes precedence over the parent.
				$parent_theme->merge( static::$theme );
				static::$theme = $parent_theme;
			}
		}

		/*
		 * We want the presets and settings declared in theme.json
		 * to override the ones declared via theme supports.
		 * So we take theme supports, transform it to theme.json shape
		 * and merge the static::$theme upon that.
		 */
		$theme_support_data = WP_Theme_JSON_Gutenberg::get_from_editor_settings( get_default_block_editor_settings() );
		if ( ! static::theme_has_support() ) {
			if ( ! isset( $theme_support_data['settings']['color'] ) ) {
				$theme_support_data['settings']['color'] = array();
			}

			$default_palette = false;
			if ( current_theme_supports( 'default-color-palette' ) ) {
				$default_palette = true;
			}
			if ( ! isset( $theme_support_data['settings']['color']['palette'] ) ) {
				// If the theme does not have any palette, we still want to show the core one.
				$default_palette = true;
			}
			$theme_support_data['settings']['color']['defaultPalette'] = $default_palette;

			$default_gradients = false;
			if ( current_theme_supports( 'default-gradient-presets' ) ) {
				$default_gradients = true;
			}
			if ( ! isset( $theme_support_data['settings']['color']['gradients'] ) ) {
				// If the theme does not have any gradients, we still want to show the core ones.
				$default_gradients = true;
			}
			$theme_support_data['settings']['color']['defaultGradients'] = $default_gradients;
		}
		$with_theme_supports = new WP_Theme_JSON_Gutenberg( $theme_support_data );
		$with_theme_supports->merge( static::$theme );

		return $with_theme_supports;
	}
}
