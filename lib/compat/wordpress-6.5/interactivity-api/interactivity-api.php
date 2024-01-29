<?php
/**
 * Interactivity API: Functions and hooks
 *
 * @package WordPress
 * @subpackage Interactivity API
 */

if ( ! function_exists( 'wp_interactivity_process_directives_of_interactive_blocks' ) ) {
	/**
	 * Processes the directives on the rendered HTML of the interactive blocks.
	 *
	 * This processes only one root interactive block at a time because the
	 * rendered HTML of that block contains the rendered HTML of all its inner
	 * blocks, including any interactive block. It does so by ignoring all the
	 * interactive inner blocks until the root interactive block is processed.
	 *
	 * @since 6.5.0
	 *
	 * @param array $parsed_block The parsed block.
	 * @return array The same parsed block.
	 */
	function wp_interactivity_process_directives_of_interactive_blocks( $parsed_block ) {
		static $root_interactive_block = null;

		/*
		 * Checks whether a root interactive block is already annotated for
		 * processing, and if it is, it ignores the subsequent ones.
		 */
		if ( null === $root_interactive_block ) {
			$block_name = $parsed_block['blockName'];
			$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

			if ( isset( $block_name ) && isset( $block_type->supports['interactivity'] ) && $block_type->supports['interactivity'] ) {
				// Annotates the root interactive block for processing.
				$root_interactive_block = array( $block_name, md5( serialize( $parsed_block ) ) );

				/*
				 * Adds a filter to process the root interactive block once it has
				 * finished rendering.
				 */
				$process_interactive_blocks = static function ( $content, $parsed_block ) use ( &$root_interactive_block, &$process_interactive_blocks ) {
					// Checks whether the current block is the root interactive block.
					list($root_block_name, $root_block_md5) = $root_interactive_block;
					if ( $root_block_name === $parsed_block['blockName'] && md5( serialize( $parsed_block ) ) === $root_block_md5 ) {
						// The root interactive blocks has finished rendering, process it.
						$content = wp_interactivity_process_directives( $content );
						// Removes the filter and reset the root interactive block.
						remove_filter( 'render_block', $process_interactive_blocks );
						$root_interactive_block = null;
					}
					return $content;
				};

				/*
				 * Uses a priority of 20 to ensure that other filters can add additional
				 * directives before the processing starts.
				 */
				add_filter( 'render_block', $process_interactive_blocks, 20, 2 );
			}
		}

		return $parsed_block;
	}
	add_filter( 'render_block_data', 'wp_interactivity_process_directives_of_interactive_blocks', 10, 1 );
}

if ( ! function_exists( 'wp_interactivity' ) ) {
	/**
	 * Retrieves the main WP_Interactivity_API instance.
	 *
	 * It provides access to the WP_Interactivity_API instance, creating one if it
	 * doesn't exist yet. It also registers the hooks and necessary script
	 * modules.
	 *
	 * @since 6.5.0
	 *
	 * @return WP_Interactivity_API The main WP_Interactivity_API instance.
	 */
	function wp_interactivity() {
		static $instance = null;
		if ( is_null( $instance ) ) {
			$instance = new WP_Interactivity_API();
			$instance->add_hooks();
			$instance->register_script_modules();
		}
		return $instance;
	}
}

if ( ! function_exists( 'wp_interactivity_process_directives' ) ) {
	/**
	 * Processes the interactivity directives contained within the HTML content
	 * and updates the markup accordingly.
	 *
	 * @since 6.5.0
	 *
	 * @param string $html The HTML content to process.
	 * @return string The processed HTML content. It returns the original content when the HTML contains unbalanced tags.
	 */
	function wp_interactivity_process_directives( $html ) {
		return wp_interactivity()->process_directives( $html );
	}
}

if ( ! function_exists( 'wp_interactivity_state' ) ) {
	/**
	 * Gets and/or sets the initial state of an Interactivity API store for a
	 * given namespace.
	 *
	 * If state for that store namespace already exists, it merges the new
	 * provided state with the existing one.
	 *
	 * @since 6.5.0
	 *
	 * @param string $store_namespace The unique store namespace identifier.
	 * @param array  $state           Optional. The array that will be merged with the existing state for the specified
	 *                                store namespace.
	 * @return array The current state for the specified store namespace.
	 */
	function wp_interactivity_state( $store_namespace, $state = null ) {
		return wp_interactivity()->state( $store_namespace, $state );
	}
}

if ( ! function_exists( 'wp_interactivity_config' ) ) {
	/**
	 * Gets and/or sets the configuration of the Interactivity API for a given
	 * store namespace.
	 *
	 * If configuration for that store namespace exists, it merges the new
	 * provided configuration with the existing one.
	 *
	 * @since 6.5.0
	 *
	 * @param string $store_namespace The unique store namespace identifier.
	 * @param array  $config          Optional. The array that will be merged with the existing configuration for the
	 *                                specified store namespace.
	 * @return array The current configuration for the specified store namespace.
	 */
	function wp_interactivity_config( $store_namespace, $initial_state = null ) {
		return wp_interactivity()->config( $store_namespace, $initial_state );
	}
}
