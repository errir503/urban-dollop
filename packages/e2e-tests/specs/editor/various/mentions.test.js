/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	createNewPost,
	createUser,
	deleteUser,
	getEditedPostContent,
	pressKeyTimes,
} from '@wordpress/e2e-test-utils';

describe( 'autocomplete mentions', () => {
	beforeAll( async () => {
		await createUser( 'testuser', { firstName: 'Jane', lastName: 'Doe' } );
	} );

	beforeEach( async () => {
		await createNewPost();
	} );

	afterAll( async () => {
		await deleteUser( 'testuser' );
	} );

	it( 'should insert mention', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'I am @a' );
		await page.waitForSelector( '.components-autocomplete__result' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '.' );
		expect( await getEditedPostContent() ).toMatchInlineSnapshot( `
			"<!-- wp:paragraph -->
			<p>I am @admin.</p>
			<!-- /wp:paragraph -->"
		` );
	} );

	it( 'should insert mention between two other words', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'Stuck in the middle with you.' );
		await pressKeyTimes( 'ArrowLeft', 'you.'.length );
		await page.keyboard.type( '@j' );
		await page.waitForSelector( '.components-autocomplete__result' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( ' ' );
		expect( await getEditedPostContent() ).toMatchInlineSnapshot( `
			"<!-- wp:paragraph -->
			<p>Stuck in the middle with @testuser you.</p>
			<!-- /wp:paragraph -->"
		` );
	} );

	it( 'should insert two subsequent mentions', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'I am @j' );
		await page.waitForSelector( '.components-autocomplete__result' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( ' @a' );
		await page.waitForSelector( '.components-autocomplete__result' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '.' );
		expect( await getEditedPostContent() ).toMatchInlineSnapshot( `
			"<!-- wp:paragraph -->
			<p>I am @testuser @admin.</p>
			<!-- /wp:paragraph -->"
		` );
	} );
} );
