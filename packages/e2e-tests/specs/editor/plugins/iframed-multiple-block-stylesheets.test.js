/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	createNewPost,
	deactivatePlugin,
	insertBlock,
	canvas,
	createNewTemplate,
} from '@wordpress/e2e-test-utils';

async function getComputedStyle( context, property ) {
	await context.waitForSelector(
		'.wp-block-test-iframed-multiple-stylesheets'
	);
	return await context.evaluate( ( prop ) => {
		const container = document.querySelector(
			'.wp-block-test-iframed-multiple-stylesheets'
		);
		return window.getComputedStyle( container )[ prop ];
	}, property );
}

describe( 'iframed multiple block stylesheets', () => {
	beforeEach( async () => {
		await activatePlugin( 'gutenberg-test-iframed-multiple-stylesheets' );
		await createNewPost( { postType: 'page' } );
	} );

	afterEach( async () => {
		await deactivatePlugin( 'gutenberg-test-iframed-multiple-stylesheets' );
	} );

	it( 'should load multiple block stylesheets in iframe', async () => {
		await insertBlock( 'Iframed Multiple Stylesheets' );

		await canvas().waitForSelector(
			'.wp-block-test-iframed-multiple-stylesheets'
		);
		await createNewTemplate( 'Iframed Test' );

		// Style loaded from the main stylesheet.
		expect( await getComputedStyle( canvas(), 'border-style' ) ).toBe(
			'dashed'
		);

		// Style loaded from the additional stylesheet.
		expect( await getComputedStyle( canvas(), 'border-color' ) ).toBe(
			'rgb(255, 0, 0)'
		);

		// Style loaded from the a stylesheet using path instead of handle.
		expect( await getComputedStyle( canvas(), 'background-color' ) ).toBe(
			'rgb(0, 0, 0)'
		);
	} );
} );
