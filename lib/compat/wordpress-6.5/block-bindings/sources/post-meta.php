<?php
/**
 * Add the post_meta source to the block bindings API.
 *
 * @package gutenberg
 */
if ( function_exists( 'wp_block_bindings_register_source' ) ) {
	$post_meta_source_callback = function ( $source_attrs ) {
		// Use the postId attribute if available
		if ( isset( $source_attrs['postId'] ) ) {
			$post_id = $source_attrs['postId'];
		} else {
			// I tried using $block_instance->context['postId'] but it wasn't available in the image block.
			$post_id = get_the_ID();
		}

		return get_post_meta( $post_id, $source_attrs['value'], true );
	};
	wp_block_bindings_register_source(
		'post_meta',
		array(
			'label' => __( 'Post Meta' ),
			'apply' => $post_meta_source_callback,
		)
	);
}
