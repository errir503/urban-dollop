<?php
/**
 * Block Editor API.
 *
 * @package Gutenberg
 * @subpackage Editor
 * @since 10.5.0
 */

/**
 * Returns the list of default categories for block types.
 *
 * This is a temporary solution until the Gutenberg plugin sets
 * the required WordPress version to 5.8.
 *
 * @see https://core.trac.wordpress.org/ticket/52920
 *
 * @since 10.5.0.
 *
 * @return array[] Array of categories for block types.
 */
function gutenberg_get_default_block_categories() {
	return array(
		array(
			'slug'  => 'text',
			'title' => _x( 'Text', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'media',
			'title' => _x( 'Media', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'design',
			'title' => _x( 'Design', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'widgets',
			'title' => _x( 'Widgets', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'theme',
			'title' => _x( 'Theme', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'embed',
			'title' => _x( 'Embeds', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'reusable',
			'title' => _x( 'Reusable Blocks', 'block category', 'gutenberg' ),
			'icon'  => null,
		),
	);
}

/**
 * Returns all the categories for block types that will be shown in the block editor.
 *
 * This is a temporary solution until the Gutenberg plugin sets
 * the required WordPress version to 5.8.
 *
 * @see https://core.trac.wordpress.org/ticket/52920
 *
 * @since 10.5.0
 *
 * @param string|WP_Post $editor_name_or_post The name of the editor (e.g. 'post-editor')
 *                                            or the post object.
 *
 * @return array[] Array of categories for block types.
 */
function gutenberg_get_block_categories( $editor_name_or_post ) {
	// Assume the post editor when the WP_Post object passed.
	$editor_name        = is_object( $editor_name_or_post ) ? 'post-editor' : $editor_name_or_post;
	$default_categories = gutenberg_get_default_block_categories();

	/**
	 * Filters the default array of categories for block types.
	 *
	 * @since 5.8.0
	 *
	 * @param array[] $default_categories Array of categories for block types.
	 */
	$block_categories = apply_filters( 'block_categories_all', $default_categories );
	if ( 'post-editor' === $editor_name ) {
		$post = is_object( $editor_name_or_post ) ? $editor_name_or_post : get_post();

		/**
		 * Filters the default array of categories for block types.
		 *
		 * @since 5.0.0
		 * @deprecated 5.8.0 The hook transitioned to support also screens that don't contain the $post instance.
		 *
		 * @param array[] $block_categories Array of categories for block types.
		 * @param WP_Post $post             Post being loaded.
		 */
		$block_categories = apply_filters_deprecated( 'block_categories', array( $block_categories, $post ), '5.8.0', 'block_categories_all' );
	}

	return $block_categories;
}

/**
 * Gets the list of allowed block types to use in the block editor.
 *
 * This is a temporary solution until the Gutenberg plugin sets
 * the required WordPress version to 5.8.
 *
 * @see https://core.trac.wordpress.org/ticket/52920
 *
 * @since 10.5.0
 *
 * @param string $editor_name The name of the editor (e.g. 'post-editor').
 *
 * @return bool|array Array of block type slugs, or boolean to enable/disable all.
 */
function gutenberg_get_allowed_block_types( $editor_name ) {
	$allowed_block_types = true;

	/**
	 * Filters the allowed block types for the given editor, defaulting to true (all
	 * registered block types supported).
	 *
	 * @since 5.8.0
	 *
	 * @param bool|array $allowed_block_types Array of block type slugs, or
	 *                                        boolean to enable/disable all.
	 */
	$allowed_block_types = apply_filters( 'allowed_block_types_all', $allowed_block_types );
	if ( 'post-editor' === $editor_name ) {
		$post = get_post();

		/**
		 * Filters the allowed block types for the editor, defaulting to true (all
		 * block types supported).
		 *
		 * @since 5.0.0
		 * @deprecated 5.8.0 The hook transitioned to support also screens that don't contain $post instance.
		 *
		 * @param bool|array $allowed_block_types Array of block type slugs, or
		 *                                        boolean to enable/disable all.
		 * @param WP_Post    $post                The post resource data.
		 */
		$allowed_block_types = apply_filters_deprecated( 'allowed_block_types', array( $allowed_block_types, $post ), '5.8.0', 'allowed_block_types_all' );
	}

	return $allowed_block_types;
}

/**
 * Returns the default block editor settings.
 *
 * This is a temporary solution until the Gutenberg plugin sets
 * the required WordPress version to 5.8.
 *
 * @see https://core.trac.wordpress.org/ticket/52920
 *
 * @since 10.5.0
 *
 * @return array The default block editor settings.
 */
function gutenberg_get_default_block_editor_settings() {
	// Media settings.
	$max_upload_size = wp_max_upload_size();
	if ( ! $max_upload_size ) {
		$max_upload_size = 0;
	}

	/** This filter is documented in wp-admin/includes/media.php */
	$image_size_names = apply_filters(
		'image_size_names_choose',
		array(
			'thumbnail' => __( 'Thumbnail', 'gutenberg' ),
			'medium'    => __( 'Medium', 'gutenberg' ),
			'large'     => __( 'Large', 'gutenberg' ),
			'full'      => __( 'Full Size', 'gutenberg' ),
		)
	);

	$available_image_sizes = array();
	foreach ( $image_size_names as $image_size_slug => $image_size_name ) {
		$available_image_sizes[] = array(
			'slug' => $image_size_slug,
			'name' => $image_size_name,
		);
	}

	$default_size       = get_option( 'image_default_size', 'large' );
	$image_default_size = in_array( $default_size, array_keys( $image_size_names ), true ) ? $default_size : 'large';

	$image_dimensions = array();
	$all_sizes        = wp_get_registered_image_subsizes();
	foreach ( $available_image_sizes as $size ) {
		$key = $size['slug'];
		if ( isset( $all_sizes[ $key ] ) ) {
			$image_dimensions[ $key ] = $all_sizes[ $key ];
		}
	}

	$editor_settings = array(
		'__unstableEnableFullSiteEditingBlocks' => gutenberg_supports_block_templates(),
		'alignWide'                             => get_theme_support( 'align-wide' ),
		'allowedBlockTypes'                     => true,
		'allowedMimeTypes'                      => get_allowed_mime_types(),
		'blockCategories'                       => gutenberg_get_default_block_categories(),
		'disableCustomColors'                   => get_theme_support( 'disable-custom-colors' ),
		'disableCustomFontSizes'                => get_theme_support( 'disable-custom-font-sizes' ),
		'disableCustomGradients'                => get_theme_support( 'disable-custom-gradients' ),
		'enableCustomLineHeight'                => get_theme_support( 'custom-line-height' ),
		'enableCustomSpacing'                   => get_theme_support( 'custom-spacing' ),
		'enableCustomUnits'                     => get_theme_support( 'custom-units' ),
		'isRTL'                                 => is_rtl(),
		'imageDefaultSize'                      => $image_default_size,
		'imageDimensions'                       => $image_dimensions,
		'imageEditing'                          => true,
		'imageSizes'                            => $available_image_sizes,
		'maxUploadFileSize'                     => $max_upload_size,
	);

	// Theme settings.
	$color_palette = current( (array) get_theme_support( 'editor-color-palette' ) );
	if ( false !== $color_palette ) {
		$editor_settings['colors'] = $color_palette;
	}

	$font_sizes = current( (array) get_theme_support( 'editor-font-sizes' ) );
	if ( false !== $font_sizes ) {
		$editor_settings['fontSizes'] = $font_sizes;
	}

	$gradient_presets = current( (array) get_theme_support( 'editor-gradient-presets' ) );
	if ( false !== $gradient_presets ) {
		$editor_settings['gradients'] = $gradient_presets;
	}

	return $editor_settings;
}

/**
 * Returns the contextualized block editor settings settings for a selected editor type.
 *
 * This is a temporary solution until the Gutenberg plugin sets
 * the required WordPress version to 5.8.
 *
 * @see https://core.trac.wordpress.org/ticket/52920
 *
 * @since 10.5.0
 *
 * @param string $editor_name     The name of the editor (e.g. 'post-editor').
 * @param array  $custom_settings Optional custom settings to use with the editor type.
 *
 * @return array The contextualized block editor settings.
 */
function gutenberg_get_block_editor_settings( $editor_name, $custom_settings = array() ) {
	$editor_settings = array_merge(
		gutenberg_get_default_block_editor_settings( $editor_name ),
		array(
			'allowedBlockTypes' => gutenberg_get_allowed_block_types( $editor_name ),
			'blockCategories'   => gutenberg_get_block_categories( $editor_name ),
		),
		$custom_settings
	);

	/**
	 * Filters the settings to pass to the block editor for all editor types.
	 *
	 * @since 5.8.0
	 *
	 * @param array $editor_settings Default editor settings.
	 */
	$editor_settings = apply_filters( 'block_editor_settings_all', $editor_settings );
	if ( 'post-editor' === $editor_name ) {
		$post = get_post();

		/**
		 * Filters the settings to pass to the block editor.
		 *
		 * @since 5.0.0
		 * @deprecated 5.8.0 The hook transitioned to support also screens that don't contain $post instance.
		 *
		 * @param array   $editor_settings Default editor settings.
		 * @param WP_Post $post            Post being edited.
		 */
		$editor_settings = apply_filters_deprecated( 'block_editor_settings', array( $editor_settings, $post ), '5.8.0', 'block_editor_settings_all' );
	}

	return $editor_settings;
}
