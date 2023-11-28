/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Block Renaming', () => {
	test.beforeEach( async ( { admin, page } ) => {
		await admin.createNewPost();

		// Registering block must be after creation of Post.
		await page.evaluate( () => {
			const registerBlockType = window.wp.blocks.registerBlockType;

			registerBlockType(
				'my-plugin/block-that-does-not-support-renaming',
				{
					title: 'No Rename Support Block',
					icon: 'smiley',
					supports: {
						renaming: false,
					},
					edit() {
						return null;
					},
					save() {
						return null;
					},
				}
			);
		} );
	} );

	test.describe( 'Dialog renaming', () => {
		test( 'allows renaming of blocks that support the feature via dialog-based UI', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			// Turn on block list view by default.
			await editor.setPreferences( 'core/edit-site', {
				showListViewByDefault: true,
			} );

			const listView = page.getByRole( 'treegrid', {
				name: 'Block navigation structure',
			} );

			await editor.insertBlock( {
				name: 'core/group',
				attributes: { content: 'First Paragraph' },
			} );

			// Select via keyboard.
			await pageUtils.pressKeys( 'primary+a' );

			// Convert to a Group block which supports renaming.
			await editor.clickBlockOptionsMenuItem( 'Group' );

			await editor.clickBlockOptionsMenuItem( 'Rename' );

			const renameMenuItem = page.getByRole( 'menuitem', {
				name: 'Rename',
				includeHidden: true, // the option is hidden behind modal but assertion is still valid.
			} );

			await expect( renameMenuItem ).toHaveAttribute(
				'aria-expanded',
				'true'
			);

			const renameModal = page.getByRole( 'dialog', {
				name: 'Rename',
			} );

			// Check the Modal is perceivable.
			await expect( renameModal ).toBeVisible();

			const nameInput = renameModal.getByRole( 'textbox', {
				name: 'Block name',
			} );

			// Check focus is transferred into the input within the Modal.
			await expect( nameInput ).toBeFocused();

			const saveButton = renameModal.getByRole( 'button', {
				name: 'Save',
				type: 'submit',
			} );

			await expect( saveButton ).toBeDisabled();

			await expect( nameInput ).toHaveAttribute( 'placeholder', 'Group' );

			await nameInput.fill( 'My new name' );

			await expect( saveButton ).toBeEnabled();

			await saveButton.click();

			await expect( renameModal ).toBeHidden();

			// Check that focus is transferred back to original "Rename" menu item.
			await expect( renameMenuItem ).toBeFocused();

			await expect( renameMenuItem ).toHaveAttribute(
				'aria-expanded',
				'false'
			);

			// Check custom name reflected in List View.
			listView.getByRole( 'link', {
				name: 'My new name',
			} );

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: 'My new name',
						},
					},
				},
			] );

			// Re-trigger the rename dialog.
			await renameMenuItem.click();

			// Expect modal input to contain the custom name.
			await expect( nameInput ).toHaveValue( 'My new name' );

			// Clear the input of text content.
			await nameInput.focus();
			await pageUtils.pressKeys( 'primary+a' );
			await page.keyboard.press( 'Delete' );

			// Check placeholder for input is the original block name.
			await expect( nameInput ).toHaveAttribute( 'placeholder', 'Group' );

			// It should be possible to submit empty.
			await expect( saveButton ).toBeEnabled();

			await saveButton.click();

			// Check the original block name to reflected in List View.
			listView.getByRole( 'link', {
				name: 'Group',
			} );

			// Expect block to have no custom name (i.e. it should be reset to the original block name).
			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: undefined,
						},
					},
				},
			] );
		} );

		test( 'does not allow renaming of blocks that do not support the feature', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await pageUtils.pressKeys( 'access+o' );

			const listView = page.getByRole( 'treegrid', {
				name: 'Block navigation structure',
			} );

			await editor.insertBlock( {
				name: 'my-plugin/block-that-does-not-support-renaming',
			} );

			// Select via keyboard.
			await pageUtils.pressKeys( 'primary+a' );

			const blockOptionsTrigger = listView.getByRole( 'button', {
				name: 'Options for No Rename Support Block',
			} );

			await blockOptionsTrigger.click();

			const renameMenuItem = page
				.getByRole( 'menu', {
					name: 'Options for No Rename Support Block',
				} )
				.getByRole( 'menuitem', {
					name: 'Rename',
				} );

			// Expect the Rename menu item not to exist at all.
			await expect( renameMenuItem ).toBeHidden();
		} );

		test( 'displays Rename option in related menu when block is not selected', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await pageUtils.pressKeys( 'access+o' );

			const listView = page.getByRole( 'treegrid', {
				name: 'Block navigation structure',
			} );

			await editor.insertBlock( {
				name: 'core/heading',
			} );

			await editor.insertBlock( {
				name: 'core/paragraph',
			} );

			// Select the Paragraph block.
			await listView
				.getByRole( 'link', {
					name: 'Paragraph',
				} )
				.click();

			// Trigger options menu for the Heading (not the selected block).
			const blockOptionsTrigger = listView.getByRole( 'button', {
				name: 'Options for Heading',
			} );

			await blockOptionsTrigger.click();

			const renameMenuItem = page
				.getByRole( 'menu', {
					name: 'Options for Heading',
				} )
				.getByRole( 'menuitem', {
					name: 'Rename',
				} );

			// Expect the Rename menu item not to exist at all.
			await expect( renameMenuItem ).toBeVisible();
		} );
	} );

	test.describe( 'Block inspector renaming', () => {
		test( 'allows renaming of blocks that support the feature via "Advanced" section of block inspector tools', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await editor.insertBlock( {
				name: 'core/group',
			} );

			// Select via keyboard.
			await pageUtils.pressKeys( 'primary+a' );

			// Convert to a Group block which supports renaming.
			await editor.clickBlockOptionsMenuItem( 'Group' );

			await editor.openDocumentSettingsSidebar();

			const advancedPanelToggle = page
				.getByRole( 'region', {
					name: 'Editor settings',
				} )
				.getByRole( 'button', {
					name: 'Advanced',
					expanded: false,
				} );

			await advancedPanelToggle.click();

			const nameInput = page.getByRole( 'textbox', {
				name: 'Block name',
			} );

			await expect( nameInput ).toBeEmpty();

			await nameInput.fill( 'My new name' );

			await expect( nameInput ).toHaveValue( 'My new name' );

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: 'My new name',
						},
					},
				},
			] );

			await nameInput.focus();
			await pageUtils.pressKeys( 'primary+a' );
			await page.keyboard.press( 'Delete' );

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: '',
						},
					},
				},
			] );
		} );

		test( 'does not allow renaming of blocks that do not support the feature', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await editor.insertBlock( {
				name: 'my-plugin/block-that-does-not-support-renaming',
			} );

			// Multiselect via keyboard.
			await pageUtils.pressKeys( 'primary+a' );

			await editor.openDocumentSettingsSidebar();

			const advancedPanelToggle = page
				.getByRole( 'region', {
					name: 'Editor settings',
				} )
				.getByRole( 'button', {
					name: 'Advanced',
					expanded: false,
				} );

			await advancedPanelToggle.click();

			// Expect the Rename control not to exist at all.
			await expect(
				page.getByRole( 'textbox', {
					name: 'Block name',
				} )
			).toBeHidden();
		} );
	} );
} );
