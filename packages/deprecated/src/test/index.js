/**
 * WordPress dependencies
 */
import { didAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import deprecated, { logged } from '../';

describe( 'deprecated', () => {
	afterEach( () => {
		for ( const key in logged ) {
			delete logged[ key ];
		}
	} );

	it( 'should show a deprecation warning', () => {
		deprecated( 'Eating meat' );

		expect( console ).toHaveWarnedWith( 'Eating meat is deprecated.' );
	} );

	it( 'should show a deprecation warning with a since', () => {
		deprecated( 'Eating meat', { since: '2019.01.01' } );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated since version 2019.01.01.'
		);
	} );

	it( 'should show a deprecation warning with a version', () => {
		deprecated( 'Eating meat', { version: '2020.01.01' } );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated and will be removed in version 2020.01.01.'
		);
	} );

	it( 'should show a deprecation warning with an alternative', () => {
		deprecated( 'Eating meat', {
			since: '2019.01.01',
			version: '2020.01.01',
			alternative: 'vegetables',
		} );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated since version 2019.01.01 and will be removed in version 2020.01.01. Please use vegetables instead.'
		);
	} );

	it( 'should show a deprecation warning with an alternative specific to a plugin', () => {
		deprecated( 'Eating meat', {
			version: '2020.01.01',
			alternative: 'vegetables',
			plugin: 'the earth',
		} );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated and will be removed from the earth in version 2020.01.01. Please use vegetables instead.'
		);
	} );

	it( 'should show a deprecation warning with a link', () => {
		deprecated( 'Eating meat', {
			version: '2020.01.01',
			alternative: 'vegetables',
			plugin: 'the earth',
			link: 'https://en.wikipedia.org/wiki/Vegetarianism',
		} );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated and will be removed from the earth in version 2020.01.01. Please use vegetables instead. See: https://en.wikipedia.org/wiki/Vegetarianism'
		);
	} );

	it( 'should show a deprecation warning with a hint', () => {
		deprecated( 'Eating meat', {
			since: '2019.01.01',
			version: '2020.01.01',
			alternative: 'vegetables',
			plugin: 'the earth',
			hint: 'You may find it beneficial to transition gradually.',
		} );

		expect( console ).toHaveWarnedWith(
			'Eating meat is deprecated since version 2019.01.01 and will be removed from the earth in version 2020.01.01. Please use vegetables instead. Note: You may find it beneficial to transition gradually.'
		);
	} );

	it( 'should show a message once', () => {
		deprecated( 'Eating meat' );
		deprecated( 'Eating meat' );

		expect( console ).toHaveWarned();
		// eslint-disable-next-line no-console
		expect( console.warn ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should do an action', () => {
		deprecated( 'turkey', { alternative: 'tofurky' } );

		expect( console ).toHaveWarned();
		expect( didAction( 'deprecated' ) ).toBeTruthy();
	} );
} );
