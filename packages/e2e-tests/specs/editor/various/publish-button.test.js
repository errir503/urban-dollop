/**
 * WordPress dependencies
 */
import {
	arePrePublishChecksEnabled,
	disablePrePublishChecks,
	enablePrePublishChecks,
	createNewPost,
	canvas,
} from '@wordpress/e2e-test-utils';

describe( 'PostPublishButton', () => {
	let werePrePublishChecksEnabled;
	beforeEach( async () => {
		await createNewPost();
		werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
		if ( werePrePublishChecksEnabled ) {
			await disablePrePublishChecks();
		}
	} );

	afterEach( async () => {
		if ( werePrePublishChecksEnabled ) {
			await enablePrePublishChecks();
		}
	} );

	it( 'should be disabled when post is not saveable', async () => {
		const publishButton = await page.$(
			'.editor-post-publish-button[aria-disabled="true"]'
		);
		expect( publishButton ).not.toBeNull();
	} );

	it( 'should be disabled when post is being saved', async () => {
		await canvas().type( '.editor-post-title__input', 'E2E Test Post' ); // Make it saveable.
		expect(
			await page.$( '.editor-post-publish-button[aria-disabled="true"]' )
		).toBeNull();

		await page.click( '.editor-post-save-draft' );
		expect(
			await page.$( '.editor-post-publish-button[aria-disabled="true"]' )
		).not.toBeNull();
	} );
} );
