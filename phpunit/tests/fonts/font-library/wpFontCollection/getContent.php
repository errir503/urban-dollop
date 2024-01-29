<?php
/**
 * Test WP_Font_Collection::get_content().
 *
 * @package WordPress
 * @subpackage Font Library
 *
 * @group fonts
 * @group font-library
 *
 * @covers WP_Font_Collection::get_content
 */
class Tests_Fonts_WpFontCollection_GetContent extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();

		// Mock the wp_remote_request() function.
		add_filter( 'pre_http_request', array( $this, 'mock_request' ), 10, 3 );
	}

	public function tear_down() {
		// Remove the mock to not affect other tests.
		remove_filter( 'pre_http_request', array( $this, 'mock_request' ) );

		parent::tear_down();
	}

	public function mock_request( $preempt, $args, $url ) {
		// if the URL is not the URL you want to mock, return false.
		if ( 'https://localhost/fonts/mock-font-collection.json' !== $url ) {
			return false;
		}

		// Mock the response body.
		$mock_collection_data = array(
			'font_families' => array( 'mock' ),
			'categories'    => array( 'mock' ),
		);

		return array(
			'body'     => json_encode( $mock_collection_data ),
			'response' => array(
				'code' => 200,
			),
		);
	}

	/**
	 * @dataProvider data_should_get_content
	 *
	 * @param array $config Font collection config options.
	 * @param array $expected_data Expected output data.
	 */
	public function test_should_get_content( $config, $expected_data ) {
		$collection = new WP_Font_Collection( $config );
		$this->assertSame( $expected_data, $collection->get_content() );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_should_get_content() {
		$mock_file = wp_tempnam( 'my-collection-data-' );
		file_put_contents( $mock_file, '{"font_families":[ "mock" ], "categories":[ "mock" ] }' );

		return array(
			'with a file'                           => array(
				'config'        => array(
					'slug'        => 'my-collection',
					'name'        => 'My Collection',
					'description' => 'My collection description',
					'src'         => $mock_file,
				),
				'expected_data' => array(
					'font_families' => array( 'mock' ),
					'categories'    => array( 'mock' ),
				),
			),
			'with a url'                            => array(
				'config'        => array(
					'slug'        => 'my-collection-with-url',
					'name'        => 'My Collection with URL',
					'description' => 'My collection description',
					'src'         => 'https://localhost/fonts/mock-font-collection.json',
				),
				'expected_data' => array(
					'font_families' => array( 'mock' ),
					'categories'    => array( 'mock' ),
				),
			),
			'with font_families and categories'     => array(
				'config'        => array(
					'slug'          => 'my-collection',
					'name'          => 'My Collection',
					'description'   => 'My collection description',
					'font_families' => array( 'mock' ),
					'categories'    => array( 'mock' ),
				),
				'expected_data' => array(
					'font_families' => array( 'mock' ),
					'categories'    => array( 'mock' ),
				),
			),
			'with font_families without categories' => array(
				'config'        => array(
					'slug'          => 'my-collection',
					'name'          => 'My Collection',
					'description'   => 'My collection description',
					'font_families' => array( 'mock' ),
				),
				'expected_data' => array(
					'font_families' => array( 'mock' ),
					'categories'    => array(),
				),
			),
		);
	}
}
