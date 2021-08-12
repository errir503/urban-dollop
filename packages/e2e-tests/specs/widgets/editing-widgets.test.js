/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	activateTheme,
	clickBlockToolbarButton,
	deactivatePlugin,
	showBlockToolbar,
	visitAdminPage,
	deleteAllWidgets,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import { find, findAll } from 'puppeteer-testing-library';
import { groupBy, mapValues } from 'lodash';

describe( 'Widgets screen', () => {
	beforeEach( async () => {
		await visitWidgetsScreen();

		// Disable welcome guide if it is enabled.
		const isWelcomeGuideActive = await page.evaluate( () =>
			wp.data
				.select( 'core/edit-widgets' )
				.__unstableIsFeatureActive( 'welcomeGuide' )
		);
		if ( isWelcomeGuideActive ) {
			await page.evaluate( () =>
				wp.data
					.dispatch( 'core/edit-widgets' )
					.__unstableToggleFeature( 'welcomeGuide' )
			);
		}

		// Wait for the widget areas to load.
		await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );
	} );

	afterEach( async () => {
		await deleteAllWidgets();
	} );

	beforeAll( async () => {
		// TODO: Ideally we can bundle our test theme directly in the repo.
		await activateTheme( 'twentytwenty' );
		await deactivatePlugin(
			'gutenberg-test-plugin-disables-the-css-animations'
		);
		await deleteAllWidgets();
	} );

	afterAll( async () => {
		await activatePlugin(
			'gutenberg-test-plugin-disables-the-css-animations'
		);
		await activateTheme( 'twentytwentyone' );
	} );

	async function getBlockInGlobalInserter( blockName ) {
		const addBlockButton = await find( {
			role: 'button',
			name: 'Add block',
			pressed: false,
		} );
		await addBlockButton.click();

		const blockLibrary = await find( {
			role: 'region',
			name: 'Block Library',
		} );

		// Check that there are categorizations in the inserter (#26329).
		const categoryHeaders = await findAll(
			{
				role: 'heading',
				level: 2,
			},
			{
				root: blockLibrary,
			}
		);
		expect( categoryHeaders.length > 0 ).toBe( true );

		const searchBox = await find( {
			role: 'searchbox',
			name: 'Search for blocks and patterns',
		} );
		await searchBox.type( blockName );

		const addBlock = await find(
			{
				role: 'option',
				name: blockName,
			},
			{
				root: blockLibrary,
			}
		);

		return addBlock;
	}

	async function expectInsertionPointIndicatorToBeBelowLastBlock(
		widgetArea
	) {
		const childBlocks = await findAll(
			{ selector: '[data-block]' },
			{ root: widgetArea }
		);
		const lastBlock = childBlocks[ childBlocks.length - 1 ];
		const lastBlockBoundingBox = await lastBlock.boundingBox();

		// TODO: Probably need a more accessible way to select this, maybe a test ID or data attribute.
		const insertionPointIndicator = await find( {
			selector: '.block-editor-block-list__insertion-point-indicator',
		} );
		const insertionPointIndicatorBoundingBox = await insertionPointIndicator.boundingBox();

		expect(
			insertionPointIndicatorBoundingBox.y > lastBlockBoundingBox.y
		).toBe( true );
	}

	it( 'Should insert content using the global inserter', async () => {
		const updateButton = await find( {
			role: 'button',
			name: 'Update',
		} );

		// Update button should start out disabled.
		expect(
			await updateButton.evaluate( ( button ) => button.disabled )
		).toBe( true );

		const widgetAreas = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );
		const [ firstWidgetArea, secondWidgetArea ] = widgetAreas;

		let addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.hover();

		// FIXME: The insertion point indicator is not showing when the widget area has no blocks.
		// await expectInsertionPointIndicatorToBeBelowLastBlock(
		// 	firstWidgetArea
		// );

		await addParagraphBlock.click();

		// Adding content should enable the Update button.
		expect(
			await updateButton.evaluate( ( button ) => button.disabled )
		).toBe( false );

		let addedParagraphBlockInFirstWidgetArea = await find(
			{
				name: /^Empty block/,
				selector: '[data-block][data-type="core/paragraph"]',
			},
			{
				root: firstWidgetArea,
			}
		);

		await addedParagraphBlockInFirstWidgetArea.focus();

		await page.keyboard.type( 'First Paragraph' );

		addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.hover();

		await expectInsertionPointIndicatorToBeBelowLastBlock(
			firstWidgetArea
		);
		await addParagraphBlock.focus();
		await addParagraphBlock.click();

		addedParagraphBlockInFirstWidgetArea = await firstWidgetArea.$(
			'[data-block][data-type="core/paragraph"][aria-label^="Empty block"]'
		);
		await addedParagraphBlockInFirstWidgetArea.focus();
		await page.keyboard.type( 'Second Paragraph' );

		const addShortCodeBlock = await getBlockInGlobalInserter( 'Shortcode' );
		await addShortCodeBlock.click();

		const shortCodeInput = await page.waitForSelector(
			'textarea[aria-label="Shortcode text"]'
		);
		await shortCodeInput.focus();
		// The famous Big Buck Bunny video.
		await shortCodeInput.type(
			'[video src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"]'
		);

		// Add to the second widget area.
		await secondWidgetArea.click();

		addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.click();

		const addedParagraphBlockInSecondWidgetArea = await secondWidgetArea.$(
			'[data-block][data-type="core/paragraph"][aria-label^="Empty block"]'
		);
		await addedParagraphBlockInSecondWidgetArea.focus();
		await page.keyboard.type( 'Third Paragraph' );

		await saveWidgets();

		// The Update button should be disabled again after saving.
		expect(
			await updateButton.evaluate( ( button ) => button.disabled )
		).toBe( true );

		const serializedWidgetAreas = await getSerializedWidgetAreas();
		expect( serializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>
		<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>Second Paragraph</p>
		</div></div>
		<div class=\\"widget widget_block\\"><div class=\\"widget-content\\"><p><div style=\\"width: 580px;\\" class=\\"wp-video\\"><!--[if lt IE 9]><script>document.createElement('video');</script><![endif]-->
		<video class=\\"wp-video-shortcode\\" id=\\"video-0-1\\" width=\\"580\\" height=\\"326\\" preload=\\"metadata\\" controls=\\"controls\\"><source type=\\"video/mp4\\" src=\\"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?_=1\\" /><a href=\\"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\\">http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4</a></video></div></p>
		</div></div>",
		  "sidebar-2": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>Third Paragraph</p>
		</div></div>",
		}
	` );
	} );

	it( 'Should insert content using the inline inserter', async () => {
		const [ firstWidgetArea ] = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );

		// Scroll to the end of the first widget area.
		await firstWidgetArea.evaluate( ( node ) =>
			node.scrollIntoView( { block: 'end' } )
		);

		const firstWidgetAreaBoundingBox = await firstWidgetArea.boundingBox();

		// Click near the end of the widget area to select it.
		await page.mouse.click(
			firstWidgetAreaBoundingBox.x + firstWidgetAreaBoundingBox.width / 2,
			firstWidgetAreaBoundingBox.y +
				firstWidgetAreaBoundingBox.height -
				10
		);

		let inlineInserterButton = await find( {
			role: 'combobox',
			name: 'Add block',
		} );
		await inlineInserterButton.click();

		let inlineQuickInserter = await find( {
			role: 'listbox',
			name: 'Blocks',
		} );

		const paragraphBlock = await find(
			{
				role: 'option',
				name: 'Paragraph',
			},
			{
				root: inlineQuickInserter,
			}
		);
		await paragraphBlock.click();

		const firstParagraphBlock = await find(
			{
				name: /^Empty block/,
				selector: '[data-block][data-type="core/paragraph"]',
			},
			{
				root: firstWidgetArea,
			}
		);

		await firstParagraphBlock.focus();
		await page.keyboard.type( 'First Paragraph' );

		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second Paragraph' );

		const secondParagraphBlock = await page.evaluateHandle(
			() => document.activeElement
		);
		await expect( secondParagraphBlock ).not.toBeElement(
			firstParagraphBlock
		);

		const secondParagraphBlockBoundingBox = await secondParagraphBlock.boundingBox();

		// Click outside the block to move the focus back to the widget area.
		await page.mouse.click(
			secondParagraphBlockBoundingBox.x +
				firstWidgetAreaBoundingBox.width / 2,
			secondParagraphBlockBoundingBox.y +
				secondParagraphBlockBoundingBox.height +
				10
		);

		// Hover above the last block to trigger the inline inserter between blocks.
		await page.mouse.move(
			secondParagraphBlockBoundingBox.x +
				secondParagraphBlockBoundingBox.width / 2,
			secondParagraphBlockBoundingBox.y - 10
		);

		// There will be 2 matches here.
		// One is the in-between inserter,
		// and the other one is the button block appender.
		[ inlineInserterButton ] = await findAll( {
			role: 'combobox',
			name: 'Add block',
		} );
		await inlineInserterButton.click();

		const inserterSearchBox = await find( {
			role: 'searchbox',
			name: 'Search for blocks and patterns',
		} );
		await expect( inserterSearchBox ).toHaveFocus();

		await page.keyboard.type( 'Heading' );

		inlineQuickInserter = await find( {
			role: 'listbox',
			name: 'Blocks',
		} );
		const headingBlockOption = await find(
			{
				role: 'option',
				name: 'Heading',
			},
			{
				root: inlineQuickInserter,
			}
		);
		await headingBlockOption.click();

		// Get the added heading block as second last block.
		const addedHeadingBlock = await secondParagraphBlock.evaluateHandle(
			( node ) => node.previousSibling
		);

		await expect( addedHeadingBlock ).toHaveFocus();

		await page.keyboard.type( 'My Heading' );

		await expect( addedHeadingBlock ).toMatchQuery( {
			name: 'Block: Heading',
			level: 2,
			value: 'My Heading',
		} );

		await saveWidgets();
		const serializedWidgetAreas = await getSerializedWidgetAreas();
		expect( serializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>
		<div class=\\"widget widget_block\\"><div class=\\"widget-content\\">
		<h2>My Heading</h2>
		</div></div>
		<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>Second Paragraph</p>
		</div></div>",
		}
	` );
	} );

	describe( 'Function widgets', () => {
		async function addMarquee( nbExpectedMarquees ) {
			const marqueeBlock = await getBlockInGlobalInserter(
				'Marquee Greeting'
			);
			await marqueeBlock.click();
			await page.waitForFunction(
				( expectedMarquees ) => {
					return (
						document.querySelectorAll(
							'[data-testid="marquee-greeting"]'
						).length === expectedMarquees
					);
				},
				{},
				nbExpectedMarquees
			);
		}

		async function deleteExistingMarquees() {
			const widgetAreasHoldingMarqueeWidgets = await page.$x(
				'//input[@data-testid="marquee-greeting"]/ancestor::div[@aria-label="Block: Widget Area"]'
			);
			for ( const widgetArea of widgetAreasHoldingMarqueeWidgets ) {
				const closedPanelBody = await widgetArea.$(
					'.components-panel__body:not(.is-opened)'
				);
				if ( closedPanelBody ) {
					await closedPanelBody.focus();
					await closedPanelBody.click();
				}

				const [ existingMarqueeWidgets ] = await widgetArea.$x(
					'//input[@data-testid="marquee-greeting"]/ancestor::div[@data-block][contains(@class, "wp-block-legacy-widget")]'
				);
				if ( existingMarqueeWidgets ) {
					await existingMarqueeWidgets.focus();
					await pressKeyWithModifier( 'access', 'z' );
				}
			}
		}

		beforeAll( async () => {
			await activatePlugin( 'gutenberg-test-marquee-widget' );
		} );

		beforeEach( async () => {
			await deleteExistingMarquees();
		} );

		afterAll( async () => {
			await deactivatePlugin( 'gutenberg-test-marquee-widget' );
		} );

		it( 'Should add and save the marquee widget', async () => {
			await addMarquee( 1 );

			const [ marqueeInput ] = await page.$x(
				'//input[@data-testid="marquee-greeting"]'
			);
			await marqueeInput.focus();
			await marqueeInput.type( 'Howdy' );

			// The first marquee is saved after clicking the form save button.
			const [ marqueeSaveButton ] = await marqueeInput.$x(
				'//input/ancestor::div[@data-block][contains(@class, "wp-block-legacy-widget")]//button[@type="submit"]'
			);
			await marqueeSaveButton.click();

			await saveWidgets();

			let editedSerializedWidgetAreas = await getSerializedWidgetAreas();
			await expect( editedSerializedWidgetAreas ).toMatchInlineSnapshot( `
						Object {
						  "sidebar-1": "<marquee>Howdy</marquee>",
						}
					` );

			await page.reload();

			editedSerializedWidgetAreas = await getSerializedWidgetAreas();
			await expect( editedSerializedWidgetAreas ).toMatchInlineSnapshot( `
						Object {
						  "sidebar-1": "<marquee>Howdy</marquee>",
						}
					` );

			await addMarquee( 2 );

			const marqueeInputs = await page.$$(
				'[data-testid="marquee-greeting"]'
			);

			expect( marqueeInputs ).toHaveLength( 2 );
			await marqueeInputs[ 0 ].focus();
			await marqueeInputs[ 0 ].type( 'first howdy' );

			await marqueeInputs[ 1 ].focus();
			await marqueeInputs[ 1 ].type( 'Second howdy' );

			// No marquee should be changed without clicking on their "save" button.
			// The second marquee shouldn't be stored as a widget.
			// See #32978 for more info.
			await saveWidgets();
			editedSerializedWidgetAreas = await getSerializedWidgetAreas();
			await expect( editedSerializedWidgetAreas ).toMatchInlineSnapshot( `
						Object {
						  "sidebar-1": "<marquee>Howdy</marquee>",
						}
					` );

			await page.reload();
			const marqueesAfter = await findAll( {
				selector: '[data-testid="marquee-greeting"]',
			} );
			expect( marqueesAfter ).toHaveLength( 1 );
		} );
	} );

	it( 'Should duplicate the widgets', async () => {
		let [ firstWidgetArea ] = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );

		const addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.click();

		let firstParagraphBlock = await find(
			{
				role: 'group',
				name: /^Empty block/,
			},
			{ root: firstWidgetArea }
		);
		await firstParagraphBlock.focus();
		await page.keyboard.type( 'First Paragraph' );

		await saveWidgets();
		await page.reload();
		// Wait for the widget areas to load.
		[ firstWidgetArea ] = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );

		const initialSerializedWidgetAreas = await getSerializedWidgetAreas();
		expect( initialSerializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>",
		}
	` );
		const initialWidgets = await getWidgetAreaWidgets();
		expect( initialWidgets[ 'sidebar-1' ].length ).toBe( 1 );

		firstParagraphBlock = await firstWidgetArea.$(
			'[data-block][data-type="core/paragraph"]'
		);
		await firstParagraphBlock.focus();

		await showBlockToolbar();
		await clickBlockToolbarButton( 'Options' );
		const duplicateButton = await find( {
			role: 'menuitem',
			name: /^Duplicate/,
		} );
		await duplicateButton.click();

		await page.waitForFunction(
			( paragraph ) =>
				paragraph.nextSibling &&
				paragraph.nextSibling.matches( '[data-block]' ),
			{},
			firstParagraphBlock
		);
		const duplicatedParagraphBlock = await firstParagraphBlock.evaluateHandle(
			( paragraph ) => paragraph.nextSibling
		);

		const firstParagraphBlockClientId = await firstParagraphBlock.evaluate(
			( node ) => node.dataset.block
		);
		const duplicatedParagraphBlockClientId = await duplicatedParagraphBlock.evaluate(
			( node ) => node.dataset.block
		);

		expect( firstParagraphBlockClientId ).not.toBe(
			duplicatedParagraphBlockClientId
		);
		await expect( duplicatedParagraphBlock ).toMatchQuery( {
			text: 'First Paragraph',
		} );
		await expect( duplicatedParagraphBlock ).toHaveFocus();

		await saveWidgets();
		const editedSerializedWidgetAreas = await getSerializedWidgetAreas();
		expect( editedSerializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>
		<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>",
		}
	` );
		const editedWidgets = await getWidgetAreaWidgets();
		expect( editedWidgets[ 'sidebar-1' ].length ).toBe( 2 );
		expect( editedWidgets[ 'sidebar-1' ][ 0 ] ).toBe(
			initialWidgets[ 'sidebar-1' ][ 0 ]
		);
	} );

	it( 'Should display legacy widgets', async () => {
		/**
		 * Using the classic widgets screen to simulate creating legacy widgets.
		 */
		await activatePlugin( 'gutenberg-test-classic-widgets' );
		await visitAdminPage( 'widgets.php' );

		const searchWidget = await find(
			{
				role: 'heading',
				name: 'Search',
				level: 3,
			},
			{
				root: await page.$( '#widget-list' ),
			}
		);
		await searchWidget.click();

		const addWidgetButton = await find( {
			role: 'button',
			name: 'Add Widget',
		} );
		await addWidgetButton.click();

		// Wait for the changes to be saved.
		// TODO: Might have better ways to do this.
		await page.waitForFunction( () => {
			const addedSearchWidget = document.querySelector(
				'#widgets-right .widget'
			);
			const spinner = addedSearchWidget.querySelector( '.spinner' );

			return (
				addedSearchWidget.classList.contains( 'open' ) &&
				! spinner.classList.contains( 'is-active' )
			);
		} );
		// FIXME: For some reasons, waiting for the spinner to disappear is not enough.
		// eslint-disable-next-line no-restricted-syntax
		await page.waitForTimeout( 500 );

		await deactivatePlugin( 'gutenberg-test-classic-widgets' );
		await visitWidgetsScreen();

		// Wait for the Legacy Widget block's preview iframe to load.
		const frame = await new Promise( ( resolve ) => {
			const checkFrame = async ( candidateFrame ) => {
				const url = await candidateFrame.url();
				if ( url.includes( 'legacy-widget-preview' ) ) {
					page.off( 'frameattached', checkFrame );
					page.off( 'framenavigated', checkFrame );
					resolve( candidateFrame );
				}
			};
			page.on( 'frameattached', checkFrame );
			page.on( 'framenavigated', checkFrame );
		} );

		// Expect to have search input.
		await find(
			{
				role: 'searchbox',
			},
			{
				page: frame,
			}
		);

		// Focus the Legacy Widget block.
		const legacyWidget = await find( {
			role: 'group',
			name: 'Block: Legacy Widget',
		} );
		await legacyWidget.focus();

		// There should be a title at the top of the widget form.
		const legacyWidgetName = await find(
			{
				role: 'heading',
				level: 3,
			},
			{
				root: legacyWidget,
			}
		);
		expect( legacyWidgetName ).toMatchQuery( { text: 'Search' } );

		// Update the widget form.
		// TODO: Convert to find() API from puppeteer-testing-library.
		const titleInput = await page.waitForSelector(
			`#widget-search-1-title`
		);
		await titleInput.type( 'Search Title' );

		// Switch to Navigation mode.
		await page.keyboard.press( 'Escape' );

		// Wait for the preview to update.
		await frame.waitForNavigation();

		// Expect to have search title.
		await find(
			{
				role: 'heading',
				name: 'Search Title',
			},
			{
				page: frame,
			}
		);

		await saveWidgets();
		const serializedWidgetAreas = await getSerializedWidgetAreas();
		expect( serializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_search\\"><div class=\\"widget-content\\"><h2 class=\\"widget-title subheading heading-size-3\\">Search Title</h2><form role=\\"search\\"  method=\\"get\\" class=\\"search-form\\" action=\\"http://localhost:8889/\\">
			<label for=\\"search-form-1\\">
				<span class=\\"screen-reader-text\\">Search for:</span>
				<input type=\\"search\\" id=\\"search-form-1\\" class=\\"search-field\\" placeholder=\\"Search &hellip;\\" value=\\"\\" name=\\"s\\" />
			</label>
			<input type=\\"submit\\" class=\\"search-submit\\" value=\\"Search\\" />
		</form>
		</div></div>",
		}
	` );
	} );

	it( 'allows widgets to be moved between widget areas using the dropdown in the block toolbar', async () => {
		const widgetAreas = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );
		const [ firstWidgetArea, secondWidgetArea ] = widgetAreas;

		// Insert a paragraph it should be in the first widget area.
		const inserterParagraphBlock = await getBlockInGlobalInserter(
			'Paragraph'
		);
		await inserterParagraphBlock.hover();
		await inserterParagraphBlock.click();
		const addedParagraphBlockInFirstWidgetArea = await find(
			{
				role: 'group',
				name: /^Empty block/,
			},
			{ root: firstWidgetArea }
		);
		await addedParagraphBlockInFirstWidgetArea.focus();
		await page.keyboard.type( 'First Paragraph' );

		// Check that the block exists in the first widget area.
		await find(
			{
				role: 'group',
				name: 'Paragraph block',
				value: 'First Paragraph',
			},
			{
				root: firstWidgetArea,
			}
		);

		// Move the block to the second widget area.
		await showBlockToolbar();
		await clickBlockToolbarButton( 'Move to widget area' );
		const widgetAreaButton = await find( {
			role: 'menuitemradio',
			name: /^Footer #2/,
		} );
		await widgetAreaButton.click();

		// Check that the block exists in the second widget area.
		await find(
			{
				role: 'group',
				name: 'Paragraph block',
				value: 'First Paragraph',
			},
			{
				root: secondWidgetArea,
			}
		);

		// Assert that the serialized widget areas shows the block as in the second widget area.
		await saveWidgets();
		const serializedWidgetAreas2 = await getSerializedWidgetAreas();
		expect( serializedWidgetAreas2 ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-2": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>",
		}
	` );
	} );

	it( 'Allows widget deletion to be undone', async () => {
		const [ firstWidgetArea ] = await findAll( {
			role: 'group',
			name: 'Block: Widget Area',
		} );

		let addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.click();

		let addedParagraphBlockInFirstWidgetArea = await find(
			{
				name: /^Empty block/,
				selector: '[data-block][data-type="core/paragraph"]',
			},
			{
				root: firstWidgetArea,
			}
		);
		await addedParagraphBlockInFirstWidgetArea.focus();
		await page.keyboard.type( 'First Paragraph' );

		addParagraphBlock = await getBlockInGlobalInserter( 'Paragraph' );
		await addParagraphBlock.click();

		addedParagraphBlockInFirstWidgetArea = await firstWidgetArea.$(
			'[data-block][data-type="core/paragraph"][aria-label^="Empty block"]'
		);
		await addedParagraphBlockInFirstWidgetArea.focus();
		await page.keyboard.type( 'Second Paragraph' );

		await saveWidgets();

		// Delete the last block and save again.
		await pressKeyWithModifier( 'access', 'z' );
		await saveWidgets();

		// Undo block deletion and save again
		await pressKeyWithModifier( 'primary', 'z' );
		await saveWidgets();

		// Reload the page to make sure changes were actually saved.
		await page.reload();

		const serializedWidgetAreas = await getSerializedWidgetAreas();
		expect( serializedWidgetAreas ).toMatchInlineSnapshot( `
		Object {
		  "sidebar-1": "<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>First Paragraph</p>
		</div></div>
		<div class=\\"widget widget_block widget_text\\"><div class=\\"widget-content\\">
		<p>Second Paragraph</p>
		</div></div>",
		}
	` );
	} );
} );

/**
 * Visit the widgets screen via link clicking. The widgets screen currently
 * has different URLs during the integration to core.
 * We should be able to refactor it once it's fully merged into core.
 */
async function visitWidgetsScreen() {
	// Visit the Appearance page.
	await visitAdminPage( 'themes.php' );

	// Go to the Widgets page.
	const appearanceMenu = await page.$( '#menu-appearance' );
	await appearanceMenu.hover();
	const widgetsLink = await find(
		{ role: 'link', name: 'Widgets' },
		{ root: appearanceMenu }
	);
	await Promise.all( [
		page.waitForNavigation(),
		// Click on the link no matter if it's visible or not.
		widgetsLink.evaluate( ( link ) => {
			link.click();
		} ),
	] );
}

async function saveWidgets() {
	const updateButton = await find( {
		role: 'button',
		name: 'Update',
	} );
	await updateButton.click();

	await findAll( {
		text: 'Widgets saved.',
	} );

	// FIXME: The snackbar above is enough for the widget areas to get saved,
	// but not enough for the widgets to get saved.
	// eslint-disable-next-line no-restricted-syntax
	await page.waitForTimeout( 500 );
}

async function getSerializedWidgetAreas() {
	const widgets = await page.evaluate( () =>
		wp.data.select( 'core' ).getWidgets( { _embed: 'about' } )
	);

	const serializedWidgetAreas = mapValues(
		groupBy( widgets, 'sidebar' ),
		( sidebarWidgets ) =>
			sidebarWidgets
				.map( ( widget ) => widget.rendered )
				.filter( Boolean )
				.join( '\n' )
	);

	return serializedWidgetAreas;
}

async function getWidgetAreaWidgets() {
	const widgets = await page.evaluate( () => {
		const widgetAreas = wp.data
			.select( 'core/edit-widgets' )
			.getWidgetAreas();
		const sidebars = {};

		for ( const widgetArea of widgetAreas ) {
			sidebars[ widgetArea.id ] = widgetArea.widgets;
		}

		return sidebars;
	} );

	return widgets;
}
