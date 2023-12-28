<?php
/**
 * Test Case for WP_REST_Font_Families_Controller tests.
 *
 * @package WordPress
 * @subpackage Font Library
 */
abstract class WP_REST_Font_Families_Controller_UnitTestCase extends WP_UnitTestCase {

	/**
	 * Fonts directory.
	 *
	 * @var string
	 */
	protected static $fonts_dir;


	public function set_up() {
		parent::set_up();

		static::$fonts_dir = WP_Font_Library::get_fonts_dir();

		// Create a user with administrator role.
		$admin_id = $this->factory->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $admin_id );
	}

	/**
	 * Tear down each test method.
	 */
	public function tear_down() {
		parent::tear_down();

		// Clean up the /fonts directory.
		foreach ( $this->files_in_dir( static::$fonts_dir ) as $file ) {
			@unlink( $file );
		}
	}
}
