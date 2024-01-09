<?php
/**
 * Test WP_REST_Font_Families_Controller::install_fonts().
 *
 * @package WordPress
 * @subpackage Font Library
 *
 * @group fonts
 * @group font-library
 *
 * @covers WP_REST_Font_Families_Controller::install_fonts
 */

class Tests_Fonts_WPRESTFontFamiliesController_InstallFonts extends WP_REST_Font_Families_Controller_UnitTestCase {

	/**
	 *
	 * @dataProvider data_install_fonts
	 *
	 * @param array $font_families     Font families to install in theme.json format.
	 * @param array $files             Font files to install.
	 * @param array $expected_response Expected response data.
	 */
	public function test_install_fonts( $font_family_settings, $files, $expected_response ) {
		$install_request  = new WP_REST_Request( 'POST', '/wp/v2/font-families' );
		$font_family_json = json_encode( $font_family_settings );
		$install_request->set_param( 'font_family_settings', $font_family_json );
		$install_request->set_file_params( $files );
		$response = rest_get_server()->dispatch( $install_request );
		$data     = $response->get_data();
		$this->assertSame( 200, $response->get_status(), 'The response status is not 200.' );
		$this->assertCount( count( $expected_response['successes'] ), $data['successes'], 'Not all the font families were installed correctly.' );

		// Checks that the font families were installed correctly.
		for ( $family_index = 0; $family_index < count( $data['successes'] ); $family_index++ ) {
			$installed_font = $data['successes'][ $family_index ];
			$expected_font  = $expected_response['successes'][ $family_index ];

			if ( isset( $installed_font['fontFace'] ) || isset( $expected_font['fontFace'] ) ) {
				for ( $face_index = 0; $face_index < count( $installed_font['fontFace'] ); $face_index++ ) {
					// Checks that the font asset were created correctly.
					if ( isset( $installed_font['fontFace'][ $face_index ]['src'] ) ) {
						$this->assertStringEndsWith( $expected_font['fontFace'][ $face_index ]['src'], $installed_font['fontFace'][ $face_index ]['src'], 'The src of the fonts were not updated as expected.' );
					}
					// Removes the src from the response to compare the rest of the data.
					unset( $installed_font['fontFace'][ $face_index ]['src'] );
					unset( $expected_font['fontFace'][ $face_index ]['src'] );
					unset( $installed_font['fontFace'][ $face_index ]['uploadedFile'] );
				}
			}

			// Compares if the rest of the data is the same.
			$this->assertEquals( $expected_font, $installed_font, 'The endpoint answer is not as expected.' );
		}
	}

	/**
	 * Data provider for test_install_fonts
	 */
	public function data_install_fonts() {

		$temp_file_path1 = wp_tempnam( 'Piazzola1-' );
		copy( __DIR__ . '/../../../data/fonts/Merriweather.ttf', $temp_file_path1 );

		$temp_file_path2 = wp_tempnam( 'Monteserrat-' );
		copy( __DIR__ . '/../../../data/fonts/Merriweather.ttf', $temp_file_path2 );

		return array(

			'google_fonts_to_download'      => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'slug'       => 'piazzolla',
					'name'       => 'Piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily'      => 'Piazzolla',
							'fontStyle'       => 'normal',
							'fontWeight'      => '400',
							'src'             => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
							'downloadFromUrl' => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
						),
					),
				),
				'files'                => array(),
				'expected_response'    => array(
					'successes' => array(
						array(
							'fontFamily' => 'Piazzolla',
							'slug'       => 'piazzolla',
							'name'       => 'Piazzolla',
							'fontFace'   => array(
								array(
									'fontFamily' => 'Piazzolla',
									'fontStyle'  => 'normal',
									'fontWeight' => '400',
									'src'        => '/wp-content/fonts/piazzolla_normal_400.ttf',
								),
							),
						),
					),
					'errors'    => array(),
				),
			),

			'google_fonts_to_use_as_is'     => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'slug'       => 'piazzolla',
					'name'       => 'Piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily' => 'Piazzolla',
							'fontStyle'  => 'normal',
							'fontWeight' => '400',
							'src'        => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
						),
					),
				),
				'files'                => array(),
				'expected_response'    => array(
					'successes' => array(
						array(
							'fontFamily' => 'Piazzolla',
							'slug'       => 'piazzolla',
							'name'       => 'Piazzolla',
							'fontFace'   => array(
								array(
									'fontFamily' => 'Piazzolla',
									'fontStyle'  => 'normal',
									'fontWeight' => '400',
									'src'        => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
								),
							),
						),
					),
					'errors'    => array(),
				),
			),

			'fonts_without_font_faces'      => array(
				'font_family_settings' => array(
					'fontFamily' => 'Arial',
					'slug'       => 'arial',
					'name'       => 'Arial',
				),
				'files'                => array(),
				'expected_response'    => array(
					'successes' => array(
						array(
							'fontFamily' => 'Arial',
							'slug'       => 'arial',
							'name'       => 'Arial',
						),
					),
					'errors'    => array(),
				),
			),

			'fonts_with_local_fonts_assets' => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'slug'       => 'piazzolla',
					'name'       => 'Piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily'   => 'Piazzolla',
							'fontStyle'    => 'normal',
							'fontWeight'   => '400',
							'uploadedFile' => 'files0',
						),
					),
				),
				'files'                => array(
					'files0' => array(
						'name'     => 'piazzola1.ttf',
						'type'     => 'font/ttf',
						'tmp_name' => $temp_file_path1,
						'error'    => 0,
						'size'     => 123,
					),
					'files1' => array(
						'name'     => 'montserrat1.ttf',
						'type'     => 'font/ttf',
						'tmp_name' => $temp_file_path2,
						'error'    => 0,
						'size'     => 123,
					),
				),
				'expected_response'    => array(
					'successes' => array(
						array(
							'fontFamily' => 'Piazzolla',
							'slug'       => 'piazzolla',
							'name'       => 'Piazzolla',
							'fontFace'   => array(
								array(
									'fontFamily' => 'Piazzolla',
									'fontStyle'  => 'normal',
									'fontWeight' => '400',
									'src'        => '/wp-content/fonts/piazzolla_normal_400.ttf',
								),
							),
						),
					),
					'errors'    => array(),
				),
			),
		);
	}

	/**
	 * Tests failure when fonfaces has improper inputs
	 *
	 * @dataProvider data_install_with_improper_inputs
	 *
	 * @param array $font_families Font families to install in theme.json format.
	 * @param array $files         Font files to install.
	 */
	public function test_install_with_improper_inputs( $font_families, $files = array() ) {
		$install_request    = new WP_REST_Request( 'POST', '/wp/v2/font-families' );
		$font_families_json = json_encode( $font_families );
		$install_request->set_param( 'font_families', $font_families_json );
		$install_request->set_file_params( $files );

		$response = rest_get_server()->dispatch( $install_request );
		$this->assertSame( 400, $response->get_status() );
	}

	/**
	 * Data provider for test_install_with_improper_inputs
	 */
	public function data_install_with_improper_inputs() {
		$temp_file_path1 = wp_tempnam( 'Piazzola1-' );
		file_put_contents( $temp_file_path1, 'Mocking file content' );

		return array(
			'not a font families array'        => array(
				'font_family_settings' => 'This is not an array',
			),

			'empty array'                      => array(
				'font_family_settings' => array(),
			),

			'without slug'                     => array(
				'font_family_settings' => array(
					array(
						'fontFamily' => 'Piazzolla',
						'name'       => 'Piazzolla',
					),
				),
			),

			'with improper font face property' => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'name'       => 'Piazzolla',
					'slug'       => 'piazzolla',
					'fontFace'   => 'This is not an array',
				),
			),

			'with empty font face property'    => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'name'       => 'Piazzolla',
					'slug'       => 'piazzolla',
					'fontFace'   => array(),
				),
			),

			'fontface referencing uploaded file without uploaded files' => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'name'       => 'Piazzolla',
					'slug'       => 'piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily'   => 'Piazzolla',
							'fontStyle'    => 'normal',
							'fontWeight'   => '400',
							'uploadedFile' => 'files0',
						),
					),
				),
				'files'                => array(),
			),

			'fontface referencing uploaded file without uploaded files' => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'name'       => 'Piazzolla',
					'slug'       => 'piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily'   => 'Piazzolla',
							'fontStyle'    => 'normal',
							'fontWeight'   => '400',
							'uploadedFile' => 'files666',
						),
					),
				),
				'files'                => array(
					'files0' => array(
						'name'     => 'piazzola1.ttf',
						'type'     => 'font/ttf',
						'tmp_name' => $temp_file_path1,
						'error'    => 0,
						'size'     => 123,
					),
				),
			),

			'fontface with incompatible properties (downloadFromUrl and uploadedFile together)' => array(
				'font_family_settings' => array(
					'fontFamily' => 'Piazzolla',
					'slug'       => 'piazzolla',
					'name'       => 'Piazzolla',
					'fontFace'   => array(
						array(
							'fontFamily'      => 'Piazzolla',
							'fontStyle'       => 'normal',
							'fontWeight'      => '400',
							'src'             => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
							'downloadFromUrl' => 'http://fonts.gstatic.com/s/piazzolla/v33/N0b72SlTPu5rIkWIZjVgI-TckS03oGpPETyEJ88Rbvi0_TzOzKcQhZqx3gX9BRy5m5M.ttf',
							'uploadedFile'    => 'files0',
						),
					),
				),
			),
		);
	}
}
