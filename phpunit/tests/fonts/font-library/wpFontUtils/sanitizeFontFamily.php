<?php
/**
 * Test WP_Font_Utils::sanitize_font_family().
 *
 * @package WordPress
 * @subpackage Font Library
 *
 * @group fonts
 * @group font-library
 *
 * @covers WP_Font_Utils::sanitize_font_family
 */
class Tests_Fonts_WpFontUtils_SanitizeFontFamily extends WP_UnitTestCase {

	/**
	 * @dataProvider data_should_sanitize_font_family
	 *
	 * @param string $font_family Font family to test.
	 * @param string $expected    Expected family.
	 */
	public function test_should_sanitize_font_family( $font_family, $expected ) {
		$this->assertSame(
			$expected,
			WP_Font_Utils::sanitize_font_family(
				$font_family
			)
		);
	}

	/**
	 * Data provider.
	 *
	 * @return array
	 */
	public function data_should_sanitize_font_family() {
		return array(
			'data_families_with_spaces_and_numbers' => array(
				'font_family' => 'Rock 3D , Open Sans,serif',
				'expected'    => '"Rock 3D", "Open Sans", serif',
			),
			'data_single_font_family'               => array(
				'font_family' => 'Rock 3D',
				'expected'    => '"Rock 3D"',
			),
			'data_no_spaces'                        => array(
				'font_family' => 'Rock3D',
				'expected'    => 'Rock3D',
			),
			'data_many_spaces_and_existing_quotes'  => array(
				'font_family' => 'Rock 3D serif, serif,sans-serif, "Open Sans"',
				'expected'    => '"Rock 3D serif", serif, sans-serif, "Open Sans"',
			),
			'data_empty_family'                     => array(
				'font_family' => ' ',
				'expected'    => '',
			),
			'data_font_family_with_whitespace_tags_new_lines' => array(
				'font_family' => "   Rock      3D</style><script>alert('XSS');</script>\n    ",
				'expected'    => '"Rock 3D"',
			),
		);
	}
}
