<?php

class Gutenberg_REST_Global_Styles_Controller_Test extends WP_Test_REST_Controller_Testcase {
	/**
	 * @var int
	 */
	protected static $admin_id;

	/**
	 * @var int
	 */
	protected static $global_styles_id;

	private function find_and_normalize_global_styles_by_id( $global_styles, $id ) {
		foreach ( $global_styles as $style ) {
			if ( $style['id'] === $id ) {
				unset( $style['_links'] );
				return $style;
			}
		}

		return null;
	}

	public function set_up() {
		parent::set_up();
		switch_theme( 'tt1-blocks' );
	}

	/**
	 * Create fake data before our tests run.
	 *
	 * @param WP_UnitTest_Factory $factory Helper that lets us create fake data.
	 */
	public static function wpSetupBeforeClass( $factory ) {
		self::$admin_id = $factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		// This creates the global styles for the current theme.
		self::$global_styles_id = wp_insert_post(
			array(
				'post_content' => '{"version": ' . WP_Theme_JSON_Gutenberg::LATEST_SCHEMA . ', "isGlobalStylesUserThemeJSON": true }',
				'post_status'  => 'publish',
				'post_title'   => __( 'Custom Styles', 'default' ),
				'post_type'    => 'wp_global_styles',
				'post_name'    => 'wp-global-styles-tt1-blocks',
				'tax_input'    => array(
					'wp_theme' => 'tt1-blocks',
				),
			),
			true
		);
	}

	public function test_register_routes() {
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/wp/v2/global-styles/(?P<id>[\/\w-]+)', $routes );
	}

	public function test_context_param() {
		// TODO: Implement test_context_param() method.
		$this->markTestIncomplete();
	}

	public function test_get_items() {
		$this->markTestIncomplete();
	}

	public function test_get_item() {
		wp_set_current_user( self::$admin_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/global-styles/' . self::$global_styles_id );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		unset( $data['_links'] );

		$this->assertEquals(
			array(
				'id'       => self::$global_styles_id,
				'title'    => array(
					'raw'      => 'Custom Styles',
					'rendered' => 'Custom Styles',
				),
				'settings' => new stdClass(),
				'styles'   => new stdClass(),
			),
			$data
		);
	}

	public function test_create_item() {
		$this->markTestIncomplete();
	}

	public function test_update_item() {
		wp_set_current_user( self::$admin_id );
		$request = new WP_REST_Request( 'PUT', '/wp/v2/global-styles/' . self::$global_styles_id );
		$request->set_body_params(
			array(
				'title' => 'My new global styles title',
			)
		);
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertEquals( 'My new global styles title', $data['title']['raw'] );
	}

	public function test_delete_item() {
		$this->markTestIncomplete();
	}

	public function test_prepare_item() {
		// TODO: Implement test_prepare_item() method.
		$this->markTestIncomplete();
	}

	public function test_get_item_schema() {
		// TODO: Implement test_get_item_schema() method.
		$this->markTestIncomplete();
	}
}
