<?php
/**
 * Tests the Style Engine class and associated functionality.
 *
 * @package    Gutenberg
 * @subpackage style-engine
 */

require __DIR__ . '/../class-wp-style-engine.php';

/**
 * Tests for registering, storing and generating styles.
 */
class WP_Style_Engine_Test extends WP_UnitTestCase {
	/**
	 * Tests generating styles and classnames based on various manifestations of the $block_styles argument.
	 *
	 * @dataProvider data_generate_styles_fixtures
	 */
	function test_generate_styles( $block_styles, $options, $expected_output ) {
		$generated_styles = wp_style_engine_generate( $block_styles, $options );
		$this->assertSame( $expected_output, $generated_styles );
	}

	/**
	 * Data provider.
	 *
	 * @return array
	 */
	public function data_generate_styles_fixtures() {
		return array(
			'default_return_value'                         => array(
				'block_styles'    => array(),
				'options'         => null,
				'expected_output' => null,
			),

			'inline_invalid_block_styles_empty'            => array(
				'block_styles'    => 'hello world!',
				'options'         => null,
				'expected_output' => null,
			),

			'inline_invalid_block_styles_unknown_style'    => array(
				'block_styles'    => array(
					'pageBreakAfter' => 'verso',
				),
				'options'         => null,
				'expected_output' => array(),
			),

			'inline_invalid_block_styles_unknown_definition' => array(
				'block_styles'    => array(
					'pageBreakAfter' => 'verso',
				),
				'options'         => null,
				'expected_output' => array(),
			),

			'inline_invalid_block_styles_unknown_property' => array(
				'block_styles'    => array(
					'spacing' => array(
						'gap' => '1000vw',
					),
				),
				'options'         => null,
				'expected_output' => array(),
			),

			'valid_inline_css_and_classnames'              => array(
				'block_styles'    => array(
					'color'   => array(
						'text' => 'var:preset|color|texas-flood',
					),
					'spacing' => array(
						'margin'  => '111px',
						'padding' => '0',
					),
				),
				'options'         => array(),
				'expected_output' => array(
					'css'        => 'padding: 0; margin: 111px;',
					'classnames' => 'has-text-color has-texas-flood-color',
				),
			),

			'inline_valid_box_model_style'                 => array(
				'block_styles'    => array(
					'spacing' => array(
						'padding' => array(
							'top'    => '42px',
							'left'   => '2%',
							'bottom' => '44px',
							'right'  => '5rem',
						),
						'margin'  => array(
							'top'    => '12rem',
							'left'   => '2vh',
							'bottom' => '2px',
							'right'  => '10em',
						),
					),
				),
				'options'         => null,
				'expected_output' => array(
					'css' => 'padding-top: 42px; padding-left: 2%; padding-bottom: 44px; padding-right: 5rem; margin-top: 12rem; margin-left: 2vh; margin-bottom: 2px; margin-right: 10em;',
				),
			),

			'inline_valid_typography_style'                => array(
				'block_styles'    => array(
					'typography' => array(
						'fontSize'       => 'clamp(2em, 2vw, 4em)',
						'fontFamily'     => 'Roboto,Oxygen-Sans,Ubuntu,sans-serif',
						'fontStyle'      => 'italic',
						'fontWeight'     => '800',
						'lineHeight'     => '1.3',
						'textDecoration' => 'underline',
						'textTransform'  => 'uppercase',
						'letterSpacing'  => '2',
					),
				),
				'options'         => null,
				'expected_output' => array(
					'css' => 'font-family: Roboto,Oxygen-Sans,Ubuntu,sans-serif; font-style: italic; font-weight: 800; line-height: 1.3; text-decoration: underline; text-transform: uppercase; letter-spacing: 2;',
				),
			),

			'style_block_with_selector'                    => array(
				'block_styles'    => array(
					'spacing' => array(
						'padding' => array(
							'top'    => '42px',
							'left'   => '2%',
							'bottom' => '44px',
							'right'  => '5rem',
						),
					),
				),
				'options'         => array( 'selector' => '.wp-selector > p' ),
				'expected_output' => array(
					'css' => '.wp-selector > p { padding-top: 42px; padding-left: 2%; padding-bottom: 44px; padding-right: 5rem; }',
				),
			),

			'elements_with_css_var_value'                  => array(
				'block_styles'    => array(
					'color' => array(
						'text' => 'var:preset|color|my-little-pony',
					),
				),
				'options'         => array(
					'selector' => '.wp-selector',
					'css_vars' => true,
				),
				'expected_output' => array(
					'css'        => '.wp-selector { color: var(--wp--preset--color--my-little-pony); }',
					'classnames' => 'has-text-color has-my-little-pony-color',
				),
			),

			'elements_with_invalid_preset_style_property'  => array(
				'block_styles'    => array(
					'color' => array(
						'text' => 'var:preset|invalid_property|my-little-pony',
					),
				),
				'options'         => array( 'selector' => '.wp-selector' ),
				'expected_output' => array(
					'classnames' => 'has-text-color',
				),
			),

			'valid_classnames_deduped'                     => array(
				'block_styles'    => array(
					'color'      => array(
						'text'       => 'var:preset|color|copper-socks',
						'background' => 'var:preset|color|splendid-carrot',
						'gradient'   => 'var:preset|gradient|like-wow-dude',
					),
					'typography' => array(
						'fontSize'   => 'var:preset|font-size|fantastic',
						'fontFamily' => 'var:preset|font-family|totally-awesome',
					),
				),
				'options'         => array(),
				'expected_output' => array(
					'classnames' => 'has-text-color has-copper-socks-color has-background has-splendid-carrot-background-color has-like-wow-dude-gradient-background has-fantastic-font-size has-totally-awesome-font-family',
				),
			),

			'valid_classnames_and_css_vars'                => array(
				'block_styles'    => array(
					'color' => array(
						'text' => 'var:preset|color|teal-independents',
					),
				),
				'options'         => array( 'css_vars' => true ),
				'expected_output' => array(
					'css'        => 'color: var(--wp--preset--color--teal-independents);',
					'classnames' => 'has-text-color has-teal-independents-color',
				),
			),

			'valid_classnames_with_null_style_values'      => array(
				'block_styles'    => array(
					'color' => array(
						'text'       => '#fff',
						'background' => null,
					),
				),
				'options'         => array(),
				'expected_output' => array(
					'css'        => 'color: #fff;',
					'classnames' => 'has-text-color',
				),
			),

			'invalid_classnames_preset_value'              => array(
				'block_styles'    => array(
					'color'   => array(
						'text'       => 'var:cheese|color|fantastic',
						'background' => 'var:preset|fromage|fantastic',
					),
					'spacing' => array(
						'margin'  => 'var:cheese|spacing|margin',
						'padding' => 'var:preset|spacing|padding',
					),
				),
				'options'         => array(),
				'expected_output' => array(
					'classnames' => 'has-text-color has-background',
				),
			),

			'invalid_classnames_options'                   => array(
				'block_styles'    => array(
					'typography' => array(
						'fontSize'   => array(
							'tomodachi' => 'friends',
						),
						'fontFamily' => array(
							'oishii' => 'tasty',
						),
					),
				),
				'options'         => array(),
				'expected_output' => array(),
			),
		);
	}
}
