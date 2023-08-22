<?php
/**
 * WP_Font_Face_Resolver class.
 *
 * @package    WordPress
 * @subpackage Fonts
 * @since      X.X.X
 */

if ( class_exists( 'WP_Font_Face_Resolver' ) ) {
	return;
}

/**
 * The Font Face Resolver abstracts the processing of different data sources
 * (such as theme.json) for processing within the Font Face.
 *
 * This class is for internal core usage and is not supposed to be used by
 * extenders (plugins and/or themes).
 *
 * @access private
 */
class WP_Font_Face_Resolver {

	/**
	 * Gets fonts defined in theme.json.
	 *
	 * @since X.X.X
	 *
	 * @return array Returns the font-families, each with their font-face variations.
	 */
	public static function get_fonts_from_theme_json() {
		$settings = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data()->get_settings();

		// Bail out early if there are no font settings.
		if ( empty( $settings['typography'] ) || empty( $settings['typography']['fontFamilies'] ) ) {
			return array();
		}

		return static::parse_settings( $settings );
	}

	/**
	 * Parse theme.json settings to extract font definitions with variations grouped by font-family.
	 *
	 * @since X.X.X
	 *
	 * @param array $settings Font settings to parse.
	 * @return array Returns an array of fonts, grouped by font-family.
	 */
	private static function parse_settings( array $settings ) {
		$fonts = array();

		foreach ( $settings['typography']['fontFamilies'] as $font_families ) {
			foreach ( $font_families as $definition ) {

				// Skip if font-family "name" is not defined.
				if ( empty( $definition['name'] ) ) {
					continue;
				}

				// Skip if "fontFace" is not defined, meaning there are no variations.
				if ( empty( $definition['fontFace'] ) ) {
					continue;
				}

				$font_family = $definition['name'];

				// Prepare the fonts array structure for this font-family.
				if ( ! array_key_exists( $font_family, $fonts ) ) {
					$fonts[ $font_family ] = array();
				}

				$fonts[ $font_family ] = static::convert_font_face_properties( $definition['fontFace'], $font_family );
			}
		}

		return $fonts;
	}

	/**
	 * Converts font-face properties from theme.json format.
	 *
	 * @since X.X.X
	 *
	 * @param array  $font_face_definition The font-face definitions to convert.
	 * @param string $font_family_property The value to store in the font-face font-family property.
	 * @return array Converted font-face properties.
	 */
	private static function convert_font_face_properties( array $font_face_definition, $font_family_property ) {
		$converted_font_faces = array();

		foreach ( $font_face_definition as $font_face ) {
			// Add the font-family property to the font-face.
			$font_face['font-family'] = $font_family_property;

			// Converts the "file:./" src placeholder into a theme font file URI.
			if ( ! empty( $font_face['src'] ) ) {
				$font_face['src'] = static::to_theme_file_uri( (array) $font_face['src'] );
			}

			// Convert camelCase properties into kebab-case.
			$font_face = static::to_kebab_case( $font_face );

			$converted_font_faces[] = $font_face;
		}

		return $converted_font_faces;
	}

	/**
	 * Converts each 'file:./' placeholder into a URI to the font file in the theme.
	 *
	 * The 'file:./' is specified in the theme's `theme.json` as a placeholder to be
	 * replaced with the URI to the font file's location in the theme. When a "src"
	 * beings with this placeholder, it is replaced, converting the src into a URI.
	 *
	 * @since X.X.X
	 *
	 * @param array $src An array of font file sources to process.
	 * @return array An array of font file src URI(s).
	 */
	private static function to_theme_file_uri( array $src ) {
		$placeholder = 'file:./';

		foreach ( $src as $src_key => $src_url ) {
			// Skip if the src doesn't start with the placeholder, as there's nothing to replace.
			if ( ! str_starts_with( $src_url, $placeholder ) ) {
				continue;
			}

			$src_file        = str_replace( $placeholder, '', $src_url );
			$src[ $src_key ] = get_theme_file_uri( $src_file );
		}

		return $src;
	}

	/**
	 * Converts all first dimension keys into kebab-case.
	 *
	 * @since X.X.X
	 *
	 * @param array $data The array to process.
	 * @return array Data with first dimension keys converted into kebab-case.
	 */
	private static function to_kebab_case( array $data ) {
		foreach ( $data as $key => $value ) {
			$kebab_case          = _wp_to_kebab_case( $key );
			$data[ $kebab_case ] = $value;
			if ( $kebab_case !== $key ) {
				unset( $data[ $key ] );
			}
		}

		return $data;
	}
}
