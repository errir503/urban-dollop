/**
 * WordPress dependencies
 */
import {
	createNewPost,
	publishPost,
	publishPostWithPrePublishChecksDisabled,
	enablePrePublishChecks,
	disablePrePublishChecks,
	arePrePublishChecksEnabled,
	setBrowserViewport,
} from '@wordpress/e2e-test-utils';

describe( 'Publishing', () => {
	describe.each( [ 'post', 'page' ] )( 'a %s', ( postType ) => {
		let werePrePublishChecksEnabled;

		beforeEach( async () => {
			await createNewPost( postType );
			werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
			if ( ! werePrePublishChecksEnabled ) {
				await enablePrePublishChecks();
			}
		} );

		afterEach( async () => {
			if ( ! werePrePublishChecksEnabled ) {
				await disablePrePublishChecks();
			}
		} );

		it( `should publish the ${ postType } and close the panel once we start editing again.`, async () => {
			await page.type( '.editor-post-title__input', 'E2E Test Post' );

			await publishPost();

			// The post-publishing panel is visible.
			expect(
				await page.$( '.editor-post-publish-panel' )
			).not.toBeNull();

			// Start editing again.
			await page.type( '.editor-post-title__input', ' (Updated)' );

			// The post-publishing panel is not visible anymore.
			expect( await page.$( '.editor-post-publish-panel' ) ).toBeNull();
		} );
	} );

	describe.each( [ 'post', 'page' ] )(
		'a %s with pre-publish checks disabled',
		( postType ) => {
			let werePrePublishChecksEnabled;

			beforeEach( async () => {
				await createNewPost( postType );
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

			it( `should publish the ${ postType } without opening the post-publish sidebar.`, async () => {
				await page.type( '.editor-post-title__input', 'E2E Test Post' );

				// The "Publish" button should be shown instead of the "Publish..." toggle
				expect(
					await page.$( '.editor-post-publish-panel__toggle' )
				).toBeNull();
				expect(
					await page.$( '.editor-post-publish-button' )
				).not.toBeNull();

				await publishPostWithPrePublishChecksDisabled();

				// The post-publishing panel should have been not shown.
				expect(
					await page.$( '.editor-post-publish-panel' )
				).toBeNull();
			} );
		}
	);

	describe.each( [ 'post', 'page' ] )(
		'a %s in small viewports',
		( postType ) => {
			let werePrePublishChecksEnabled;

			beforeEach( async () => {
				await createNewPost( postType );
				werePrePublishChecksEnabled = await arePrePublishChecksEnabled();
				if ( werePrePublishChecksEnabled ) {
					await disablePrePublishChecks();
				}
				await setBrowserViewport( 'small' );
			} );

			afterEach( async () => {
				await setBrowserViewport( 'large' );
				if ( werePrePublishChecksEnabled ) {
					await enablePrePublishChecks();
				}
			} );

			it( `should ignore the pre-publish checks and show the Publish... toggle instead of the Publish button`, async () => {
				expect(
					await page.$( '.editor-post-publish-panel__toggle' )
				).not.toBeNull();
				expect(
					await page.$( '.editor-post-publish-button' )
				).toBeNull();
			} );
		}
	);
} );
