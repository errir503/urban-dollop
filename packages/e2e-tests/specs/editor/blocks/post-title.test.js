/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	saveDraft,
} from '@wordpress/e2e-test-utils';

describe( 'Post Title block', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'Can edit the post title', async () => {
		// Create a block with some text that will trigger a list creation.
		await insertBlock( 'Post Title' );
		const editablePostTitleSelector =
			'.wp-block-post-title[contenteditable="true"]';
		await page.waitForSelector( editablePostTitleSelector );
		await page.focus( editablePostTitleSelector );

		// Create a second list item.
		await page.keyboard.type( 'Just tweaking the post title' );

		await saveDraft();
		await page.reload();
		await page.waitForSelector( '.edit-post-layout' );
		const title = await page.$eval(
			'.editor-post-title__input',
			( element ) => element.textContent
		);
		expect( title ).toEqual( 'Just tweaking the post title' );
	} );
} );
