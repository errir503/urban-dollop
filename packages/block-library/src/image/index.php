<?php
/**
 * Server-side rendering of the `core/image` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/image` block on the server,
 * adding a data-id attribute to the element if core/gallery has added on pre-render.
 *
 * @param  array    $attributes The block attributes.
 * @param  string   $content    The block content.
 * @param  WP_Block $block      The block object.
 * @return string Returns the block content with the data-id attribute added.
 */
function render_block_core_image( $attributes, $content, $block ) {

	$processor = new WP_HTML_Tag_Processor( $content );
	$processor->next_tag( 'img' );

	if ( $processor->get_attribute( 'src' ) === null ) {
		return '';
	}

	if ( isset( $attributes['data-id'] ) ) {
		// Add the data-id="$id" attribute to the img element
		// to provide backwards compatibility for the Gallery Block,
		// which now wraps Image Blocks within innerBlocks.
		// The data-id attribute is added in a core/gallery `render_block_data` hook.
		$processor->set_attribute( 'data-id', $attributes['data-id'] );
	}

	$lightbox_enabled  = false;
	$link_destination  = isset( $attributes['linkDestination'] ) ? $attributes['linkDestination'] : 'none';
	$lightbox_settings = block_core_image_get_lightbox_settings( $block->parsed_block );

	// If the lightbox is enabled and the image is not linked, flag the lightbox to be rendered.
	if ( isset( $lightbox_settings ) && 'none' === $link_destination ) {

		if ( isset( $lightbox_settings['enabled'] ) && true === $lightbox_settings['enabled'] ) {
			$lightbox_enabled = true;
		}
	}

	// If at least one block in the page has the lightbox, mark the block type as interactive.
	if ( $lightbox_enabled ) {
		$block->block_type->supports['interactivity'] = true;
	}

	// Determine whether the view script should be enqueued or not.
	$view_js_file = 'wp-block-image-view';
	if ( ! wp_script_is( $view_js_file ) ) {
		$script_handles = $block->block_type->view_script_handles;

		// If the script is not needed, and it is still in the `view_script_handles`, remove it.
		if ( ! $lightbox_enabled && in_array( $view_js_file, $script_handles, true ) ) {
			$block->block_type->view_script_handles = array_diff( $script_handles, array( $view_js_file ) );
		}
		// If the script is needed, but it was previously removed, add it again.
		if ( $lightbox_enabled && ! in_array( $view_js_file, $script_handles, true ) ) {
			$block->block_type->view_script_handles = array_merge( $script_handles, array( $view_js_file ) );
		}
	}

	if ( $lightbox_enabled ) {
		// This render needs to happen in a filter with priority 15 to ensure that it
		// runs after the duotone filter and that duotone styles are applied to the image
		// in the lightbox. We also need to ensure that the lightbox works with any plugins
		// that might use filters as well. We can consider removing this in the future if the
		// way the blocks are rendered changes, or if a new kind of filter is introduced.
		add_filter( 'render_block_core/image', 'block_core_image_render_lightbox', 15, 2 );
	}

	return $processor->get_updated_html();
}

/**
 * Add the lightboxEnabled flag to the block data.
 *
 * This is used to determine whether the lightbox should be rendered or not.
 *
 * @param  array $block Block data.
 * @return array        Filtered block data.
 */
function block_core_image_get_lightbox_settings( $block ) {
	// Get the lightbox setting from the block attributes.
	if ( isset( $block['attrs']['lightbox'] ) ) {
		$lightbox_settings = $block['attrs']['lightbox'];
		// If the lightbox setting is not set in the block attributes,
		// check the legacy lightbox settings that are set using the
		// `gutenberg_should_render_lightbox` filter.
		// We can remove this elseif statement when the legacy lightbox settings are removed.
	} elseif ( isset( $block['legacyLightboxSettings'] ) ) {
		$lightbox_settings = $block['legacyLightboxSettings'];
	}

	if ( ! isset( $lightbox_settings ) ) {
		$lightbox_settings = wp_get_global_settings( array( 'lightbox' ), array( 'block_name' => 'core/image' ) );

		// If not present in global settings, check the top-level global settings.
		//
		// NOTE: If no block-level settings are found, the previous call to
		// `wp_get_global_settings` will return the whole `theme.json`
		// structure in which case we can check if the "lightbox" key is present at
		// the top-level of the global settings and use its value.
		if ( isset( $lightbox_settings['lightbox'] ) ) {
			$lightbox_settings = wp_get_global_settings( array( 'lightbox' ) );
		}
	}

	return $lightbox_settings ?? null;
}

/**
 * Add the directives and layout needed for the lightbox behavior.
 *
 * @param  string $block_content        Rendered block content.
 * @param  array  $block                Block object.
 * @return string                Filtered block content.
 */
function block_core_image_render_lightbox( $block_content, $block ) {
	$processor = new WP_HTML_Tag_Processor( $block_content );

	$aria_label = __( 'Enlarge image' );

	$alt_attribute = $processor->get_attribute( 'alt' );

	if ( null !== $alt_attribute ) {
		$alt_attribute = trim( $alt_attribute );
	}

	if ( $alt_attribute ) {
		/* translators: %s: Image alt text. */
		$aria_label = sprintf( __( 'Enlarge image: %s' ), $alt_attribute );
	}
	$content = $processor->get_updated_html();

	// Currently, we are only enabling the zoom animation.
	$lightbox_animation = 'zoom';

	// We want to store the src in the context so we can set it dynamically when the lightbox is opened.
	$z = new WP_HTML_Tag_Processor( $content );
	$z->next_tag( 'img' );

	if ( isset( $block['attrs']['id'] ) ) {
		$img_uploaded_src = wp_get_attachment_url( $block['attrs']['id'] );
		$img_metadata     = wp_get_attachment_metadata( $block['attrs']['id'] );
		$img_width        = $img_metadata['width'];
		$img_height       = $img_metadata['height'];
	} else {
		$img_uploaded_src = $z->get_attribute( 'src' );
		$img_width        = 'none';
		$img_height       = 'none';
	}

	if ( isset( $block['attrs']['scale'] ) ) {
		$scale_attr = $block['attrs']['scale'];
	} else {
		$scale_attr = false;
	}

	$w = new WP_HTML_Tag_Processor( $content );
	$w->next_tag( 'figure' );
	$w->add_class( 'wp-lightbox-container' );
	$w->set_attribute( 'data-wp-interactive', true );

	$w->set_attribute(
		'data-wp-context',
		sprintf(
			'{ "core":
				{ "image":
					{   "imageLoaded": false,
						"initialized": false,
						"lightboxEnabled": false,
						"hideAnimationEnabled": false,
						"preloadInitialized": false,
						"lightboxAnimation": "%s",
						"imageUploadedSrc": "%s",
						"imageCurrentSrc": "",
						"targetWidth": "%s",
						"targetHeight": "%s",
						"scaleAttr": "%s"
					}
				}
			}',
			$lightbox_animation,
			$img_uploaded_src,
			$img_width,
			$img_height,
			$scale_attr
		)
	);
	$w->next_tag( 'img' );
	$w->set_attribute( 'data-wp-init', 'effects.core.image.setCurrentSrc' );
	$w->set_attribute( 'data-wp-on--load', 'actions.core.image.handleLoad' );
	$w->set_attribute( 'data-wp-effect', 'effects.core.image.setButtonStyles' );
	$body_content = $w->get_updated_html();

	// Wrap the image in the body content with a button.
	$img = null;
	preg_match( '/<img[^>]+>/', $body_content, $img );
	$button       =
				'<button
					type="button"
					aria-haspopup="dialog"
					aria-label="' . esc_attr( $aria_label ) . '"
					data-wp-on--click="actions.core.image.showLightbox"
					data-wp-style--width="context.core.image.imageButtonWidth"
					data-wp-style--height="context.core.image.imageButtonHeight"
					data-wp-style--left="context.core.image.imageButtonLeft"
					data-wp-style--top="context.core.image.imageButtonTop"
				>
				</button>'
				. $img[0];
	$body_content = preg_replace( '/<img[^>]+>/', $button, $body_content );

	// We need both a responsive image and an enlarged image to animate
	// the zoom seamlessly on slow internet connections; the responsive
	// image is a copy of the one in the body, which animates immediately
	// as the lightbox is opened, while the enlarged one is a full-sized
	// version that will likely still be loading as the animation begins.
	$m = new WP_HTML_Tag_Processor( $content );
	$m->next_tag( 'figure' );
	$m->add_class( 'responsive-image' );
	$m->next_tag( 'img' );
	// We want to set the 'src' attribute to an empty string in the responsive image
	// because otherwise, as of this writing, the wp_filter_content_tags() function in
	// WordPress will automatically add a 'srcset' attribute to the image, which will at
	// times cause the incorrectly sized image to be loaded in the lightbox on Firefox.
	// Because of this, we bind the 'src' attribute explicitly the current src to reliably
	// use the exact same image as in the content when the lightbox is first opened while
	// we wait for the larger image to load.
	$m->set_attribute( 'src', '' );
	$m->set_attribute( 'data-wp-bind--src', 'context.core.image.imageCurrentSrc' );
	$m->set_attribute( 'data-wp-style--object-fit', 'selectors.core.image.lightboxObjectFit' );
	$initial_image_content = $m->get_updated_html();

	$q = new WP_HTML_Tag_Processor( $content );
	$q->next_tag( 'figure' );
	$q->add_class( 'enlarged-image' );
	$q->next_tag( 'img' );

	// We set the 'src' attribute to an empty string to prevent the browser from loading the image
	// on initial page load, then bind the attribute to a selector that returns the full-sized image src when
	// the lightbox is opened. We could use 'loading=lazy' in combination with the 'hidden' attribute to
	// accomplish the same behavior, but that approach breaks progressive loading of the image in Safari
	// and Chrome (see https://github.com/WordPress/gutenberg/pull/52765#issuecomment-1674008151). Until that
	// is resolved, manually setting the 'src' seems to be the best solution to load the large image on demand.
	$q->set_attribute( 'src', '' );
	$q->set_attribute( 'data-wp-bind--src', 'selectors.core.image.enlargedImgSrc' );
	$q->set_attribute( 'data-wp-style--object-fit', 'selectors.core.image.lightboxObjectFit' );
	$enlarged_image_content = $q->get_updated_html();

	$background_color = esc_attr( wp_get_global_styles( array( 'color', 'background' ) ) );

	$close_button_icon  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false"><path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.6 6.5 6.6 1-1z"></path></svg>';
	$close_button_color = esc_attr( wp_get_global_styles( array( 'color', 'text' ) ) );
	$dialog_label       = $alt_attribute ? esc_attr( $alt_attribute ) : esc_attr__( 'Image' );
	$close_button_label = esc_attr__( 'Close' );

	$lightbox_html = <<<HTML
        <div data-wp-body="" class="wp-lightbox-overlay $lightbox_animation"
            data-wp-bind--role="selectors.core.image.roleAttribute"
            aria-label="$dialog_label"
            data-wp-class--initialized="context.core.image.initialized"
            data-wp-class--active="context.core.image.lightboxEnabled"
            data-wp-class--hideAnimationEnabled="context.core.image.hideAnimationEnabled"
            data-wp-bind--aria-hidden="!context.core.image.lightboxEnabled"
            aria-hidden="true"
            data-wp-bind--aria-modal="context.core.image.lightboxEnabled"
            aria-modal="false"
            data-wp-effect="effects.core.image.initLightbox"
            data-wp-on--keydown="actions.core.image.handleKeydown"
            data-wp-on--touchstart="actions.core.image.handleTouchStart"
            data-wp-on--touchmove="actions.core.image.handleTouchMove"
            data-wp-on--touchend="actions.core.image.handleTouchEnd"
            data-wp-on--click="actions.core.image.hideLightbox"
            >
                <button type="button" aria-label="$close_button_label" style="fill: $close_button_color" class="close-button" data-wp-on--click="actions.core.image.hideLightbox">
                    $close_button_icon
                </button>
                <div class="lightbox-image-container">$initial_image_content</div>
				<div class="lightbox-image-container">$enlarged_image_content</div>
                <div class="scrim" style="background-color: $background_color"></div>
        </div>
HTML;

	return str_replace( '</figure>', $lightbox_html . '</figure>', $body_content );
}

/**
 * Ensure that the view script has the `wp-interactivity` dependency.
 *
 * @since 6.4.0
 *
 * @global WP_Scripts $wp_scripts
 */
function block_core_image_ensure_interactivity_dependency() {
	global $wp_scripts;
	if (
		isset( $wp_scripts->registered['wp-block-image-view'] ) &&
		! in_array( 'wp-interactivity', $wp_scripts->registered['wp-block-image-view']->deps, true )
	) {
		$wp_scripts->registered['wp-block-image-view']->deps[] = 'wp-interactivity';
	}
}

add_action( 'wp_print_scripts', 'block_core_image_ensure_interactivity_dependency' );

/**
 * Registers the `core/image` block on server.
 */
function register_block_core_image() {
	register_block_type_from_metadata(
		__DIR__ . '/image',
		array(
			'render_callback' => 'render_block_core_image',
		)
	);
}
add_action( 'init', 'register_block_core_image' );
