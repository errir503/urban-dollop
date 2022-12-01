/**
 * Internal dependencies
 */
import { getTypographyClassesAndStyles } from '../use-typography-props';

describe( 'getTypographyClassesAndStyles', () => {
	it( 'should return styles and classes', () => {
		const attributes = {
			fontFamily: 'tofu',
			fontSize: 'large',
			style: {
				typography: {
					letterSpacing: '22px',
					fontSize: '2rem',
					textTransform: 'uppercase',
				},
			},
		};
		expect( getTypographyClassesAndStyles( attributes ) ).toEqual( {
			className: 'has-tofu-font-family has-large-font-size',
			style: {
				letterSpacing: '22px',
				fontSize: '2rem',
				textTransform: 'uppercase',
			},
		} );
	} );

	it( 'should return fluid font size styles', () => {
		const attributes = {
			fontFamily: 'tofu',
			style: {
				typography: {
					letterSpacing: '22px',
					fontSize: '2rem',
					textTransform: 'uppercase',
				},
			},
		};
		expect( getTypographyClassesAndStyles( attributes, true ) ).toEqual( {
			className: 'has-tofu-font-family',
			style: {
				letterSpacing: '22px',
				fontSize:
					'clamp(1.5rem, 1.5rem + ((1vw - 0.48rem) * 0.962), 2rem)',
				textTransform: 'uppercase',
			},
		} );
	} );
} );
