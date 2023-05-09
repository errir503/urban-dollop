/**
 * Internal dependencies
 */
import {
	areGlobalStyleConfigsEqual,
	getPresetVariableFromValue,
	getValueFromVariable,
} from '../utils';

describe( 'editor utils', () => {
	const themeJson = {
		version: 1,
		settings: {
			color: {
				palette: {
					theme: [
						{
							slug: 'primary',
							color: '#007cba',
							name: 'Primary',
						},
						{
							slug: 'secondary',
							color: '#006ba1',
							name: 'Secondary',
						},
					],
					custom: [
						{
							slug: 'primary',
							color: '#007cba',
							name: 'Primary',
						},
						{
							slug: 'secondary',
							color: '#a65555',
							name: 'Secondary',
						},
					],
				},
				custom: true,
				customDuotone: true,
				customGradient: true,
				link: true,
			},
			custom: {
				color: {
					primary: 'var(--wp--preset--color--primary)',
					secondary: 'var(--wp--preset--color--secondary)',
				},
			},
		},
		isGlobalStylesUserThemeJSON: true,
	};

	describe( 'getPresetVariableFromValue', () => {
		const context = 'root';
		const propertyName = 'color.text';
		const value = '#007cba';

		describe( 'when a provided global style (e.g. fontFamily, color,etc.) does not exist', () => {
			it( 'returns the originally provided value', () => {
				const actual = getPresetVariableFromValue(
					themeJson.settings,
					context,
					'fakePropertyName',
					value
				);
				expect( actual ).toBe( value );
			} );
		} );

		describe( 'when a global style is cleared by the user', () => {
			it( 'returns an undefined preset variable', () => {
				const actual = getPresetVariableFromValue(
					themeJson.settings,
					context,
					propertyName,
					undefined
				);
				expect( actual ).toBe( undefined );
			} );
		} );

		describe( 'when a global style is selected by the user', () => {
			describe( 'and it is not a preset value (e.g. custom color)', () => {
				it( 'returns the originally provided value', () => {
					const customValue = '#6e4545';
					const actual = getPresetVariableFromValue(
						themeJson.settings,
						context,
						propertyName,
						customValue
					);
					expect( actual ).toBe( customValue );
				} );
			} );

			describe( 'and it is a preset value', () => {
				it( 'returns the preset variable', () => {
					const actual = getPresetVariableFromValue(
						themeJson.settings,
						context,
						propertyName,
						value
					);
					expect( actual ).toBe( 'var:preset|color|primary' );
				} );
			} );
		} );
	} );

	describe( 'getValueFromVariable', () => {
		describe( 'when provided an invalid variable', () => {
			it( 'returns the originally provided value', () => {
				const actual = getValueFromVariable(
					themeJson,
					'root',
					undefined
				);

				expect( actual ).toBe( undefined );
			} );
		} );

		describe( 'when provided a preset variable', () => {
			it( 'retrieves the correct preset value', () => {
				const actual = getValueFromVariable(
					themeJson,
					'root',
					'var:preset|color|primary'
				);

				expect( actual ).toBe( '#007cba' );
			} );
		} );

		describe( 'when provided a custom variable', () => {
			it( 'retrieves the correct custom value', () => {
				const actual = getValueFromVariable(
					themeJson,
					'root',
					'var(--wp--custom--color--secondary)'
				);

				expect( actual ).toBe( '#a65555' );
			} );
		} );

		describe( 'when provided a dynamic reference', () => {
			it( 'retrieves the referenced value', () => {
				const stylesWithRefs = {
					...themeJson,
					styles: {
						color: {
							background: {
								ref: 'styles.color.text',
							},
							text: 'purple-rain',
						},
					},
				};
				const actual = getValueFromVariable( stylesWithRefs, 'root', {
					ref: 'styles.color.text',
				} );

				expect( actual ).toBe( stylesWithRefs.styles.color.text );
			} );

			it( 'returns the originally provided value where value is dynamic reference and reference does not exist', () => {
				const stylesWithRefs = {
					...themeJson,
					styles: {
						color: {
							text: {
								ref: 'styles.background.text',
							},
						},
					},
				};
				const actual = getValueFromVariable( stylesWithRefs, 'root', {
					ref: 'styles.color.text',
				} );

				expect( actual ).toBe( stylesWithRefs.styles.color.text );
			} );

			it( 'returns the originally provided value where value is dynamic reference', () => {
				const stylesWithRefs = {
					...themeJson,
					styles: {
						color: {
							background: {
								ref: 'styles.color.text',
							},
							text: {
								ref: 'styles.background.text',
							},
						},
					},
				};
				const actual = getValueFromVariable( stylesWithRefs, 'root', {
					ref: 'styles.color.text',
				} );

				expect( actual ).toBe( stylesWithRefs.styles.color.text );
			} );
		} );
	} );

	describe( 'areGlobalStyleConfigsEqual', () => {
		test.each( [
			{ original: null, variation: null, expected: true },
			{ original: {}, variation: {}, expected: true },
			{ original: {}, variation: undefined, expected: false },
			{
				original: {
					styles: {
						color: { text: 'var(--wp--preset--color--red)' },
					},
				},
				variation: {
					styles: {
						color: { text: 'var(--wp--preset--color--blue)' },
					},
				},
				expected: false,
			},
			{ original: {}, variation: undefined, expected: false },
			{
				original: {
					styles: {
						color: { text: 'var(--wp--preset--color--red)' },
					},
					settings: {
						typography: {
							fontSize: true,
						},
					},
				},
				variation: {
					styles: {
						color: { text: 'var(--wp--preset--color--red)' },
					},
					settings: {
						typography: {
							fontSize: true,
						},
					},
				},
				expected: true,
			},
		] )(
			'.areGlobalStyleConfigsEqual( $original, $variation )',
			( { original, variation, expected } ) => {
				expect(
					areGlobalStyleConfigsEqual( original, variation )
				).toBe( expected );
			}
		);
	} );
} );
