/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'adding patterns', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should insert a block pattern', async ( { page, editor } ) => {
		await page.click(
			'role=region[name="Editor top bar"i] >> role=button[name="Toggle block inserter"i]'
		);

		await page.fill(
			'role=region[name="Block Library"i] >> role=searchbox[name="Search for blocks and patterns"i]',
			'Social links with a shared background color'
		);

		await page.click(
			'role=option[name="Social links with a shared background color"i]'
		);
		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				name: 'core/social-links',
			},
		] );
	} );
} );
