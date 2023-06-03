/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Test Custom Post Types', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activatePlugin( 'gutenberg-test-custom-post-types' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deactivatePlugin(
			'gutenberg-test-custom-post-types'
		);
	} );

	test( 'should be able to create an hierarchical post without title support', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { postType: 'hierar-no-title' } );
		await editor.canvas.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'Parent Post' );
		await editor.publishPost();

		// Create a post that is a child of the previously created post.
		await admin.createNewPost( { postType: 'hierar-no-title' } );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'button', {
				name: 'Hierarchical No Title',
			} )
			.click();

		// Open the Document -> Page Attributes panel.
		const pageAttributes = page.getByRole( 'button', {
			name: 'Page Attributes',
		} );
		const isClosed =
			( await pageAttributes.getAttribute( 'aria-expanded' ) ) ===
			'false';
		if ( isClosed ) {
			await pageAttributes.click();
		}

		const parentPageLocator = page.getByRole( 'combobox', {
			name: 'Parent Page',
		} );

		await parentPageLocator.click();
		await page.getByRole( 'listbox' ).getByRole( 'option' ).first().click();
		const parentPage = await parentPageLocator.inputValue();

		await editor.canvas.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'Child Post' );
		await editor.publishPost();
		await page.reload();

		// Confirm parent page selection matches after reloading.
		await expect( parentPageLocator ).toHaveValue( parentPage );
	} );

	test( 'should create a cpt with a legacy block in its template without WSOD', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { postType: 'leg_block_in_tpl' } );
		await editor.canvas.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'Hello there' );

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				name: 'core/embed',
				attributes: { providerNameSlug: 'wordpress-tv' },
			},
			{
				name: 'core/paragraph',
				attributes: { content: 'Hello there' },
			},
		] );

		await editor.publishPost();
	} );
} );
