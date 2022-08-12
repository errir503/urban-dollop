<?php
/**
 * Tests script and style loading.
 *
 * @package Gutenberg
 */

class WP_Script_Loader_Test extends WP_UnitTestCase {
	/**
	 * Clean up global scope.
	 *
	 * @global WP_Scripts $wp_scripts
	 * @global WP_Styles $wp_styles
	 */
	public function clean_up_global_scope() {
		global $wp_styles;
		parent::clean_up_global_scope();
		$wp_styles = null;
	}
	/**
	 * Tests that stored CSS is enqueued.
	 */
	public function test_enqueue_stored_styles() {
		global $wp_styles;

		$core_styles_to_enqueue = array(
			array(
				'selector'     => '.saruman',
				'declarations' => array(
					'color'        => 'white',
					'height'       => '100px',
					'border-style' => 'solid',
				),
			),
		);

		// Enqueue a block supports (core styles).
		gutenberg_style_engine_get_stylesheet_from_css_rules(
			$core_styles_to_enqueue,
			array(
				'context' => 'block-supports',
				'enqueue' => true,
			)
		);

		$my_styles_to_enqueue = array(
			array(
				'selector'     => '.gandalf',
				'declarations' => array(
					'color'        => 'grey',
					'height'       => '90px',
					'border-style' => 'dotted',
				),
			),
		);

		// Enqueue some other styles.
		gutenberg_style_engine_get_stylesheet_from_css_rules(
			$my_styles_to_enqueue,
			array(
				'context' => 'my-styles',
				'enqueue' => true,
			)
		);

		gutenberg_enqueue_stored_styles();

		$this->assertEquals( array( '.saruman{color:white;height:100px;border-style:solid;}' ), $wp_styles->get_data( 'core-block-supports', 'after' ) );
		$this->assertEquals( array( '.gandalf{color:grey;height:90px;border-style:dotted;}' ), $wp_styles->get_data( 'wp-style-engine-my-styles', 'after' ) );
	}
}
