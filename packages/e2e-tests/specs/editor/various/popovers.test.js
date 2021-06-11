/**
 * WordPress dependencies
 */
import { createNewPost } from '@wordpress/e2e-test-utils';

describe( 'popovers', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	describe( 'dropdown', () => {
		it( 'toggles via click', async () => {
			const isMoreMenuOpen = async () =>
				!! ( await page.$( '.edit-post-more-menu__content' ) );

			expect( await isMoreMenuOpen() ).toBe( false );

			// Toggle opened.
			await page.click( '.edit-post-more-menu > button' );
			expect( await isMoreMenuOpen() ).toBe( true );

			// Toggle closed.
			await page.click( '.edit-post-more-menu > button' );
			expect( await isMoreMenuOpen() ).toBe( false );
		} );
	} );
} );
