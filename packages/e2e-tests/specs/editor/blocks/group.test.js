/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	searchForBlock,
	getEditedPostContent,
	createNewPost,
	pressKeyWithModifier,
	transformBlockTo,
} from '@wordpress/e2e-test-utils';

describe( 'Group', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'can be created using the block inserter', async () => {
		await searchForBlock( 'Group' );
		await page.click( '.editor-block-list-item-group' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created using the slash inserter', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '/group' );
		await page.waitForXPath(
			`//*[contains(@class, "components-autocomplete__result") and contains(@class, "is-selected") and contains(text(), 'Group')]`
		);
		await page.keyboard.press( 'Enter' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can have other blocks appended to it using the button appender', async () => {
		await searchForBlock( 'Group' );
		await page.click( '.editor-block-list-item-group' );
		await page.click( '.block-editor-button-block-appender' );
		await page.click( '.editor-block-list-item-paragraph' );
		await page.keyboard.type( 'Group Block with a Paragraph' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can wrap in group and unwrap group', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '1' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '2' );
		await pressKeyWithModifier( 'shift', 'ArrowUp' );
		await transformBlockTo( 'Group' );

		expect( await getEditedPostContent() ).toMatchInlineSnapshot( `
			"<!-- wp:group -->
			<div class=\\"wp-block-group\\"><!-- wp:paragraph -->
			<p>1</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph -->
			<p>2</p>
			<!-- /wp:paragraph --></div>
			<!-- /wp:group -->"
		` );

		await transformBlockTo( 'Unwrap' );

		expect( await getEditedPostContent() ).toMatchInlineSnapshot( `
			"<!-- wp:paragraph -->
			<p>1</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph -->
			<p>2</p>
			<!-- /wp:paragraph -->"
		` );
	} );
} );
