<?php
/**
 * Test WP_Font_Library::register_font_collection().
 *
 * @package WordPress
 * @subpackage Font Library
 *
 * @group fonts
 * @group font-library
 *
 * @covers WP_Font_Library::register_font_collection
 */
class Tests_Fonts_WpFontLibrary_RegisterFontCollection extends WP_Font_Library_UnitTestCase {

	public function test_should_register_font_collection() {
		$config     = array(
			'slug'        => 'my-collection',
			'name'        => 'My Collection',
			'description' => 'My Collection Description',
			'src'         => 'my-collection-data.json',
		);
		$collection = WP_Font_Library::register_font_collection( $config );
		$this->assertInstanceOf( 'WP_Font_Collection', $collection );
	}

	public function test_should_return_error_if_slug_is_missing() {
		$config = array(
			'name'        => 'My Collection',
			'description' => 'My Collection Description',
			'src'         => 'my-collection-data.json',
		);
		$this->setExpectedIncorrectUsage( 'WP_Font_Collection::is_config_valid' );
		$collection = WP_Font_Library::register_font_collection( $config );
		$this->assertWPError( $collection, 'A WP_Error should be returned.' );
	}

	public function test_should_return_error_if_name_is_missing() {
		$config = array(
			'slug'        => 'my-collection',
			'description' => 'My Collection Description',
			'src'         => 'my-collection-data.json',
		);
		$this->setExpectedIncorrectUsage( 'WP_Font_Collection::is_config_valid' );
		$collection = WP_Font_Library::register_font_collection( $config );
		$this->assertWPError( $collection, 'A WP_Error should be returned.' );
	}

	public function test_should_return_error_if_config_is_empty() {
		$config = array();
		$this->setExpectedIncorrectUsage( 'WP_Font_Collection::is_config_valid' );
		$collection = WP_Font_Library::register_font_collection( $config );
		$this->assertWPError( $collection, 'A WP_Error should be returned.' );
	}

	public function test_should_return_error_if_slug_is_repeated() {
		$config1 = array(
			'slug'        => 'my-collection-1',
			'name'        => 'My Collection 1',
			'description' => 'My Collection 1 Description',
			'src'         => 'my-collection-1-data.json',
		);
		$config2 = array(
			'slug'        => 'my-collection-1',
			'name'        => 'My Collection 2',
			'description' => 'My Collection 2 Description',
			'src'         => 'my-collection-2-data.json',
		);

		// Register first collection.
		$collection1 = WP_Font_Library::register_font_collection( $config1 );
		$this->assertInstanceOf( 'WP_Font_Collection', $collection1, 'A collection should be registered.' );

		// Expects a _doing_it_wrong notice.
		$this->setExpectedIncorrectUsage( 'WP_Font_Library::register_font_collection' );
		// Try to register a second collection with same slug.
		$collection2 = WP_Font_Library::register_font_collection( $config2 );
		$this->assertWPError( $collection2, 'A WP_Error should be returned.' );
	}
}
