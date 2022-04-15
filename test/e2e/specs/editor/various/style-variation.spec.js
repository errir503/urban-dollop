/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'adding blocks', () => {
	test( 'Should switch to the plain style of the quote block', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		// Inserting a quote block
		await pageUtils.insertBlock( {
			name: 'core/quote',
			attributes: { value: '<p>Quote content</p>' },
		} );

		await pageUtils.clickBlockToolbarButton( 'Quote' );

		await page.click( 'role=menuitem[name="Plain"i]' );

		// Check the content
		const content = await pageUtils.getEditedPostContent();
		expect( content ).toBe(
			`<!-- wp:quote {"className":"is-style-plain"} -->
<blockquote class="wp-block-quote is-style-plain"><p>Quote content</p></blockquote>
<!-- /wp:quote -->`
		);
	} );
} );
