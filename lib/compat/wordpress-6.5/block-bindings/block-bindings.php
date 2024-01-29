<?php
/**
 * Block Bindings API
 *
 * This file contains functions for managing block bindings in WordPress.
 *
 * @since 17.6.0
 * @package gutenberg
 */

/**
 * Retrieves the singleton instance of WP_Block_Bindings.
 *
 * @return WP_Block_Bindings The WP_Block_Bindings instance.
 */
if ( ! function_exists( 'wp_block_bindings' ) ) {
	function wp_block_bindings() {
		static $instance = null;
		if ( is_null( $instance ) ) {
			$instance = new WP_Block_Bindings();
		}
		return $instance;
	}
}

/**
 * Registers a new source for block bindings.
 *
 * @param string   $source_name The name of the source.
 * @param array    $source_properties   The array of arguments that are used to register a source. The array has two elements:
 *                                1. string   $label        The label of the source.
 *                                2. callback $apply        A callback
 *                                executed when the source is processed during
 *                                block rendering. The callback should have the
 *                                following signature:
 *
 *                                  `function (object $source_attrs, object $block_instance, string $attribute_name): string`
 *                                          - @param object $source_attrs: Object containing source ID used to look up the override value, i.e. {"value": "{ID}"}.
 *                                          - @param object $block_instance: The block instance.
 *                                          - @param string $attribute_name: The name of an attribute used to retrieve an override value from the block context.
 *                                 The callback should return a string that will be used to override the block's original value.
 *
 * @return void
 */
if ( ! function_exists( 'wp_block_bindings_register_source' ) ) {
	function wp_block_bindings_register_source( $source_name, array $source_properties ) {
		wp_block_bindings()->register_source( $source_name, $source_properties );
	}
}

/**
 * Retrieves the list of registered block sources.
 *
 * @return array The list of registered block sources.
 */
if ( ! function_exists( 'wp_block_bindings_get_sources' ) ) {
	function wp_block_bindings_get_sources() {
		return wp_block_bindings()->get_sources();
	}
}

/**
 * Replaces the HTML content of a block based on the provided source value.
 *
 * @param string $block_content Block Content.
 * @param string $block_name The name of the block to process.
 * @param string $block_attr The attribute of the block we want to process.
 * @param string $source_value The value used to replace the HTML.
 * @return string The modified block content.
 */
function gutenberg_block_bindings_replace_html( $block_content, $block_name, $block_attr, $source_value ) {
			$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block_name );
	if ( null === $block_type ) {
		return;
	}

	// Depending on the attribute source, the processing will be different.
	switch ( $block_type->attributes[ $block_attr ]['source'] ) {
		case 'html':
		case 'rich-text':
			$block_reader = new WP_HTML_Tag_Processor( $block_content );

			// TODO: Support for CSS selectors whenever they are ready in the HTML API.
			// In the meantime, support comma-separated selectors by exploding them into an array.
			$selectors = explode( ',', $block_type->attributes[ $block_attr ]['selector'] );
			// Add a bookmark to the first tag to be able to iterate over the selectors.
			$block_reader->next_tag();
			$block_reader->set_bookmark( 'iterate-selectors' );

			// TODO: This shouldn't be needed when the `set_inner_html` function is ready.
			// Store the parent tag and its attributes to be able to restore them later in the button.
			// The button block has a wrapper while the paragraph and heading blocks don't.
			if ( 'core/button' === $block_name ) {
				$button_wrapper                 = $block_reader->get_tag();
				$button_wrapper_attribute_names = $block_reader->get_attribute_names_with_prefix( '' );
				$button_wrapper_attrs           = array();
				foreach ( $button_wrapper_attribute_names as $name ) {
					$button_wrapper_attrs[ $name ] = $block_reader->get_attribute( $name );
				}
			}

			foreach ( $selectors as $selector ) {
				// If the parent tag, or any of its children, matches the selector, replace the HTML.
				if ( strcasecmp( $block_reader->get_tag( $selector ), $selector ) === 0 || $block_reader->next_tag(
					array(
						'tag_name' => $selector,
					)
				) ) {
					$block_reader->release_bookmark( 'iterate-selectors' );

					// TODO: Use `set_inner_html` method whenever it's ready in the HTML API.
					// Until then, it is hardcoded for the paragraph, heading, and button blocks.
					// Store the tag and its attributes to be able to restore them later.
					$selector_attribute_names = $block_reader->get_attribute_names_with_prefix( '' );
					$selector_attrs           = array();
					foreach ( $selector_attribute_names as $name ) {
						$selector_attrs[ $name ] = $block_reader->get_attribute( $name );
					}
					$selector_markup = "<$selector>" . wp_kses_post( $source_value ) . "</$selector>";
					$amended_content = new WP_HTML_Tag_Processor( $selector_markup );
					$amended_content->next_tag();
					foreach ( $selector_attrs as $attribute_key => $attribute_value ) {
						$amended_content->set_attribute( $attribute_key, $attribute_value );
					}
					if ( 'core/paragraph' === $block_name || 'core/heading' === $block_name ) {
						return $amended_content->get_updated_html();
					}
					if ( 'core/button' === $block_name ) {
						$button_markup  = "<$button_wrapper>{$amended_content->get_updated_html()}</$button_wrapper>";
						$amended_button = new WP_HTML_Tag_Processor( $button_markup );
						$amended_button->next_tag();
						foreach ( $button_wrapper_attrs as $attribute_key => $attribute_value ) {
							$amended_button->set_attribute( $attribute_key, $attribute_value );
						}
						return $amended_button->get_updated_html();
					}
				} else {
					$block_reader->seek( 'iterate-selectors' );
				}
			}
			$block_reader->release_bookmark( 'iterate-selectors' );
			return $block_content;

		case 'attribute':
			$amended_content = new WP_HTML_Tag_Processor( $block_content );
			if ( ! $amended_content->next_tag(
				array(
					// TODO: build the query from CSS selector.
					'tag_name' => $block_type->attributes[ $block_attr ]['selector'],
				)
			) ) {
				return $block_content;
			}
			$amended_content->set_attribute( $block_type->attributes[ $block_attr ]['attribute'], esc_attr( $source_value ) );
			return $amended_content->get_updated_html();
			break;

		default:
			return $block_content;
			break;
	}
	return;
}
