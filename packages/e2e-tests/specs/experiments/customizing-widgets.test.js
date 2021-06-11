/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	activateTheme,
	deactivatePlugin,
	visitAdminPage,
	showBlockToolbar,
	clickBlockToolbarButton,
} from '@wordpress/e2e-test-utils';

/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import { find } from 'puppeteer-testing-library';

describe( 'Widgets Customizer', () => {
	beforeEach( async () => {
		await cleanupWidgets();
		await visitAdminPage( 'customize.php' );
	} );

	beforeAll( async () => {
		// TODO: Ideally we can bundle our test theme directly in the repo.
		await activateTheme( 'twentytwenty' );
		await deactivatePlugin(
			'gutenberg-test-plugin-disables-the-css-animations'
		);
	} );

	afterAll( async () => {
		await activatePlugin(
			'gutenberg-test-plugin-disables-the-css-animations'
		);
		await activateTheme( 'twentytwentyone' );
	} );

	it( 'should add blocks', async () => {
		const widgetsPanel = await find( {
			role: 'heading',
			name: /Widgets/,
			level: 3,
		} );
		await widgetsPanel.click();

		const footer1Section = await find( {
			role: 'heading',
			name: /Footer #1/,
			level: 3,
		} );
		await footer1Section.click();

		await addBlock( 'Paragraph' );
		await page.keyboard.type( 'First Paragraph' );

		await waitForPreviewIframe();

		await addBlock( 'Heading' );
		await page.keyboard.type( 'My Heading' );

		const inlineAddBlockButton = await find( {
			role: 'combobox',
			name: 'Add block',
			haspopup: 'menu',
		} );
		await inlineAddBlockButton.click();

		const inlineInserterSearchBox = await find( {
			role: 'searchbox',
			name: 'Search for blocks and patterns',
		} );

		await expect( inlineInserterSearchBox ).toHaveFocus();

		await page.keyboard.type( 'Search' );

		const searchOption = await find( {
			role: 'option',
			name: 'Search',
		} );
		await searchOption.click();

		const addedSearchBlock = await find( {
			role: 'group',
			name: 'Block: Search',
		} );

		const searchTitle = await find(
			{
				role: 'textbox',
				name: 'Label text',
			},
			{ root: addedSearchBlock }
		);
		await searchTitle.focus();

		await page.keyboard.type( 'My ' );

		await waitForPreviewIframe();

		const findOptions = {
			root: await find( {
				name: 'Site Preview',
				selector: 'iframe',
			} ),
		};

		// Expect the paragraph to be found in the preview iframe.
		await expect( {
			text: 'First Paragraph',
			selector: '.widget-content p',
		} ).toBeFound( findOptions );

		// Expect the heading to be found in the preview iframe.
		await expect( {
			role: 'heading',
			name: 'My Heading',
			selector: '.widget-content *',
		} ).toBeFound( findOptions );

		// Expect the search box to be found in the preview iframe.
		await expect( {
			role: 'searchbox',
			name: 'My Search',
			selector: '.widget-content *',
		} ).toBeFound( findOptions );

		expect( console ).toHaveWarned(
			"The page delivered both an 'X-Frame-Options' header and a 'Content-Security-Policy' header with a 'frame-ancestors' directive. Although the 'X-Frame-Options' header alone would have blocked embedding, it has been ignored."
		);
	} );

	it( 'should open the inspector panel', async () => {
		const widgetsPanel = await find( {
			role: 'heading',
			name: /Widgets/,
			level: 3,
		} );
		await widgetsPanel.click();

		const footer1Section = await find( {
			role: 'heading',
			name: /Footer #1/,
			level: 3,
		} );
		await footer1Section.click();

		await addBlock( 'Paragraph' );
		await page.keyboard.type( 'First Paragraph' );

		await showBlockToolbar();
		await clickBlockToolbarButton( 'Options' );
		let showMoreSettingsButton = await find( {
			role: 'menuitem',
			name: 'Show more settings',
		} );
		await showMoreSettingsButton.click();

		const backButton = await find( {
			role: 'button',
			name: 'Back',
			focused: true,
		} );
		await expect( backButton ).toHaveFocus();

		// Expect the inspector panel to be found.
		let inspectorHeading = await find( {
			role: 'heading',
			name: 'Customizing ▸ Widgets ▸ Footer #1 Block Settings',
			level: 3,
		} );

		// Expect the block title to be found.
		await expect( {
			role: 'heading',
			name: 'Paragraph',
			level: 2,
		} ).toBeFound();

		await backButton.click();

		// Go back to the widgets editor.
		await find( {
			role: 'heading',
			name: 'Customizing ▸ Widgets Footer #1',
			level: 3,
		} );

		await expect( inspectorHeading ).not.toBeVisible();

		await clickBlockToolbarButton( 'Options' );
		showMoreSettingsButton = await find( {
			role: 'menuitem',
			name: 'Show more settings',
		} );
		await showMoreSettingsButton.click();

		// Expect the inspector panel to be found.
		inspectorHeading = await find( {
			role: 'heading',
			name: 'Customizing ▸ Widgets ▸ Footer #1 Block Settings',
			level: 3,
		} );

		// Press Escape to close the inspector panel.
		await page.keyboard.press( 'Escape' );

		// Go back to the widgets editor.
		await expect( {
			role: 'heading',
			name: 'Customizing ▸ Widgets Footer #1',
			level: 3,
		} ).toBeFound();

		await expect( inspectorHeading ).not.toBeVisible();

		expect( console ).toHaveWarned(
			"The page delivered both an 'X-Frame-Options' header and a 'Content-Security-Policy' header with a 'frame-ancestors' directive. Although the 'X-Frame-Options' header alone would have blocked embedding, it has been ignored."
		);
	} );

	it( 'should handle the inserter outer section', async () => {
		const widgetsPanel = await find( {
			role: 'heading',
			name: /Widgets/,
			level: 3,
		} );
		await widgetsPanel.click();

		const footer1Section = await find( {
			role: 'heading',
			name: /^Footer #1/,
			level: 3,
		} );
		await footer1Section.click();

		// We need to make some changes for the publish settings to appear.
		await addBlock( 'Paragraph' );
		await page.keyboard.type( 'First Paragraph' );

		await waitForPreviewIframe();

		const documentTools = await find( {
			role: 'toolbar',
			name: 'Document tools',
		} );

		// Open the inserter outer section.
		const addBlockButton = await find(
			{
				role: 'button',
				name: 'Add block',
			},
			{ root: documentTools }
		);
		await addBlockButton.click();

		// Expect the inserter outer section to be found.
		await expect( {
			role: 'heading',
			name: 'Add a block',
			level: 2,
		} ).toBeFound();

		// Expect to close the inserter outer section when pressing Escape.
		await page.keyboard.press( 'Escape' );

		// Open the inserter outer section again.
		await addBlockButton.click();

		// Expect the inserter outer section to be found again.
		const inserterHeading = await find( {
			role: 'heading',
			name: 'Add a block',
			level: 2,
		} );

		// Open the Publish Settings.
		const publishSettingsButton = await find( {
			role: 'button',
			name: 'Publish Settings',
		} );
		await publishSettingsButton.click();

		// Expect the Publish Settings outer section to be found.
		const publishSettings = await find( {
			selector: '#sub-accordion-section-publish_settings',
		} );

		// Expect the inserter outer section to be closed.
		await expect( inserterHeading ).not.toBeVisible();

		// Focus the block and start typing to hide the block toolbar.
		// Shouldn't be needed if we automatically hide the toolbar on blur.
		const paragraphBlock = await find( {
			role: 'group',
			name: 'Paragraph block',
		} );
		await paragraphBlock.focus();
		await page.keyboard.type( ' ' );

		// Open the inserter outer section.
		await addBlockButton.click();

		await expect( {
			role: 'heading',
			name: 'Add a block',
			level: 2,
		} ).toBeFound();

		// Expect the Publish Settings section to be closed.
		await expect( publishSettings ).not.toBeVisible();

		// Back to the widget areas panel.
		const backButton = await find( {
			role: 'button',
			name: 'Back',
		} );
		await backButton.click();

		// Expect the inserter outer section to be closed.
		await expect( {
			role: 'heading',
			name: 'Add a block',
			level: 2,
		} ).not.toBeFound();

		expect( console ).toHaveWarned(
			"The page delivered both an 'X-Frame-Options' header and a 'Content-Security-Policy' header with a 'frame-ancestors' directive. Although the 'X-Frame-Options' header alone would have blocked embedding, it has been ignored."
		);
	} );

	it( 'should move focus to the block', async () => {
		const widgetsPanel = await find( {
			role: 'heading',
			name: /Widgets/,
			level: 3,
		} );
		await widgetsPanel.click();

		const footer1Section = await find( {
			role: 'heading',
			name: /^Footer #1/,
			level: 3,
		} );
		await footer1Section.click();

		await addBlock( 'Paragraph' );
		await page.keyboard.type( 'First Paragraph' );

		await waitForPreviewIframe();

		await addBlock( 'Heading' );
		await page.keyboard.type( 'First Heading' );

		// Navigate back to the parent panel.
		const backButton = await find( { role: 'button', name: 'Back' } );
		await backButton.click();

		await waitForPreviewIframe();

		const iframe = await find( {
			name: 'Site Preview',
			selector: 'iframe',
		} );

		const paragraphWidget = await find(
			{
				text: /First Paragraph/,
				selector: '.widget',
			},
			{
				root: iframe,
			}
		);

		const editParagraphWidget = await find(
			{
				role: 'button',
				name: 'Click to edit this widget.',
			},
			{
				root: paragraphWidget,
			}
		);
		await editParagraphWidget.click();

		const firstParagraphBlock = await find( {
			role: 'group',
			name: 'Paragraph block',
			text: 'First Paragraph',
		} );
		await expect( firstParagraphBlock ).toHaveFocus();

		// Expect to focus on a already focused widget.
		await editParagraphWidget.click();
		await expect( firstParagraphBlock ).toHaveFocus();

		const headingWidget = await find(
			{
				text: /First Heading/,
				selector: '.widget',
			},
			{
				root: iframe,
			}
		);

		const editHeadingWidget = await find(
			{
				role: 'button',
				name: 'Click to edit this widget.',
			},
			{
				root: headingWidget,
			}
		);
		await editHeadingWidget.click();

		const headingBlock = await find( {
			role: 'group',
			name: 'Block: Heading',
			text: 'First Heading',
		} );
		await expect( headingBlock ).toHaveFocus();

		expect( console ).toHaveWarned(
			"The page delivered both an 'X-Frame-Options' header and a 'Content-Security-Policy' header with a 'frame-ancestors' directive. Although the 'X-Frame-Options' header alone would have blocked embedding, it has been ignored."
		);
	} );

	it( 'should clear block selection', async () => {
		const widgetsPanel = await find( {
			role: 'heading',
			name: /Widgets/,
			level: 3,
		} );
		await widgetsPanel.click();

		const footer1Section = await find( {
			role: 'heading',
			name: /^Footer #1/,
			level: 3,
		} );
		await footer1Section.click();

		const paragraphBlock = await addBlock( 'Paragraph' );
		await page.keyboard.type( 'First Paragraph' );
		await showBlockToolbar();

		const sectionHeading = await find( {
			role: 'heading',
			name: 'Customizing ▸ Widgets Footer #1',
			level: 3,
		} );
		await sectionHeading.click();

		// Expect clicking on the section title should clear the selection.
		await expect( {
			role: 'toolbar',
			name: 'Block tools',
		} ).not.toBeFound();

		await paragraphBlock.focus();
		await showBlockToolbar();

		const preview = await page.$( '#customize-preview' );
		await preview.click();

		// Expect clicking on the preview iframe should clear the selection.
		await expect( {
			role: 'toolbar',
			name: 'Block tools',
		} ).not.toBeFound();

		await paragraphBlock.focus();
		await showBlockToolbar();

		const editorContainer = await page.$(
			'#customize-control-sidebars_widgets-sidebar-1'
		);
		const { x, y, width, height } = await editorContainer.boundingBox();
		// Simulate Clicking on the empty space at the end of the editor.
		await page.mouse.click( x + width / 2, y + height + 10 );

		// Expect clicking on the empty space at the end of the editor
		// should clear the selection.
		await expect( {
			role: 'toolbar',
			name: 'Block tools',
		} ).not.toBeFound();

		expect( console ).toHaveWarned(
			"The page delivered both an 'X-Frame-Options' header and a 'Content-Security-Policy' header with a 'frame-ancestors' directive. Although the 'X-Frame-Options' header alone would have blocked embedding, it has been ignored."
		);
	} );
} );

/**
 * TODO: Deleting widgets in the new widgets screen seems to be unreliable.
 * We visit the old widgets screen to delete them.
 * Refactor this to use real interactions in the new widgets screen once the bug is fixed.
 */
async function cleanupWidgets() {
	await visitAdminPage( 'widgets.php' );

	let widget = await page.$( '.widgets-sortables .widget' );

	// We have to do this one-by-one since there might be race condition when deleting multiple widgets at once.
	while ( widget ) {
		const deleteButton = await widget.$( 'button.widget-control-remove' );
		const id = await widget.evaluate( ( node ) => node.id );
		await deleteButton.evaluate( ( node ) => node.click() );
		// Wait for the widget to be removed from DOM.
		await page.waitForSelector( `#${ id }`, { hidden: true } );

		widget = await page.$( '.widgets-sortables .widget' );
	}
}

/**
 * Wait when there's only one preview iframe.
 * There could be a 2 iframes when it's changing from no widgets to
 * adding a first widget to the sidebar,
 */
async function waitForPreviewIframe() {
	await page.waitForFunction(
		() =>
			document.querySelectorAll( '[name^="customize-preview-"]' )
				.length === 1
	);
}

async function addBlock( blockName ) {
	const addBlockButton = await find(
		{
			role: 'button',
			name: 'Add block',
		},
		{
			root: await find( {
				role: 'toolbar',
				name: 'Document tools',
			} ),
		}
	);
	await addBlockButton.click();

	const blockOption = await find( {
		role: 'option',
		name: blockName,
	} );
	await blockOption.click();

	const addedBlock = await find( {
		role: 'group',
		selector: '.is-selected[data-block]',
	} );
	await addedBlock.focus();

	return addedBlock;
}
