/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const wd = require( 'wd' );

/**
 * Internal dependencies
 */
const {
	doubleTap,
	isAndroid,
	isEditorVisible,
	setClipboard,
	setupDriver,
	stopDriver,
	swipeDown,
	swipeFromTo,
	swipeUp,
	tapPasteAboveElement,
	toggleHtmlMode,
	typeString,
	waitForVisible,
	clickIfClickable,
} = require( '../helpers/utils' );

const ADD_BLOCK_ID = isAndroid() ? 'Add block' : 'add-block-button';

const initializeEditorPage = async () => {
	const driver = await setupDriver();
	await isEditorVisible( driver );
	const initialValues = await setupInitialValues( driver );
	return new EditorPage( driver, initialValues );
};

// Stores initial values from the editor for different helpers.
const setupInitialValues = async ( driver ) => {
	const initialValues = {};
	const addButton = await driver.elementsByAccessibilityId( ADD_BLOCK_ID );

	if ( addButton.length !== 0 ) {
		initialValues.addButtonLocation = await addButton[ 0 ].getLocation();
	}

	return initialValues;
};

class EditorPage {
	driver;
	accessibilityIdKey;
	accessibilityIdXPathAttrib;
	paragraphBlockName = 'Paragraph';
	verseBlockName = 'Verse';
	orderedListButtonName = 'Ordered';

	constructor( driver, initialValues ) {
		this.driver = driver;
		this.accessibilityIdKey = 'name';
		this.accessibilityIdXPathAttrib = 'name';
		this.initialValues = initialValues;

		if ( isAndroid() ) {
			this.accessibilityIdXPathAttrib = 'content-desc';
			this.accessibilityIdKey = 'contentDescription';
		}
	}

	async getBlockList() {
		return await this.driver.hasElementByAccessibilityId( 'block-list' );
	}

	async getAddBlockButton() {
		const elements = await this.driver.elementsByAccessibilityId(
			ADD_BLOCK_ID
		);
		return elements[ 0 ];
	}

	// ===============================
	// Text blocks functions
	// E.g. Paragraph, Heading blocks
	// ===============================
	async getTextBlockAtPosition( blockName, position = 1 ) {
		// iOS needs a click to get the text element
		if ( ! isAndroid() ) {
			const textBlockLocator = `(//XCUIElementTypeButton[contains(@name, "${ blockName } Block. Row ${ position }")])`;

			await clickIfClickable( this.driver, textBlockLocator );
		}

		const blockLocator = isAndroid()
			? `//android.widget.Button[contains(@content-desc, "${ blockName } Block. Row ${ position }.")]//android.widget.EditText`
			: `//XCUIElementTypeButton[contains(@name, "${ blockName } Block. Row ${ position }.")]//XCUIElementTypeTextView`;

		return await waitForVisible( this.driver, blockLocator );
	}

	async typeTextToTextBlock( block, text, clear ) {
		await typeString( this.driver, block, text, clear );
	}

	// Finds the wd element for new block that was added and sets the element attribute
	// and accessibilityId attributes on this object and selects the block
	// position uses one based numbering.
	async getBlockAtPosition(
		blockName,
		position = 1,
		options = { autoscroll: false }
	) {
		const blockLocator = isAndroid()
			? `//android.widget.Button[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }")]`
			: `(//XCUIElementTypeOther[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }")])[2]`;

		await waitForVisible( this.driver, blockLocator );

		const elements = await this.driver.elementsByXPath( blockLocator );
		const lastElementFound = elements[ elements.length - 1 ];
		if ( elements.length === 0 && options.autoscroll ) {
			const firstBlockVisible = await this.getFirstBlockVisible();
			const lastBlockVisible = await this.getLastBlockVisible();
			// Exit if no block is found.
			if ( ! firstBlockVisible || ! lastBlockVisible ) {
				return lastElementFound;
			}
			const firstBlockAccessibilityId =
				await firstBlockVisible.getAttribute( this.accessibilityIdKey );
			const firstBlockRowMatch = /Row (\d+)\./.exec(
				firstBlockAccessibilityId
			);
			const firstBlockRow =
				firstBlockRowMatch && Number( firstBlockRowMatch[ 1 ] );
			const lastBlockAccessibilityId =
				await lastBlockVisible.getAttribute( this.accessibilityIdKey );
			const lastBlockRowMatch = /Row (\d+)\./.exec(
				lastBlockAccessibilityId
			);
			const lastBlockRow =
				lastBlockRowMatch && Number( lastBlockRowMatch[ 1 ] );
			if ( firstBlockRow && position < firstBlockRow ) {
				if ( firstBlockRow === 1 ) {
					// We're at the top already stop recursing.
					return lastElementFound;
				}
				// Scroll up.
				await swipeDown( this.driver );
			} else if ( lastBlockRow && position > lastBlockRow ) {
				// Scroll down.
				await swipeUp( this.driver );
			}
			return await this.getBlockAtPosition(
				blockName,
				position,
				options
			);
		}
		return lastElementFound;
	}

	async getFirstBlockVisible() {
		const firstBlockLocator = `//*[contains(@${ this.accessibilityIdXPathAttrib }, " Block. Row ")]`;
		return await waitForVisible( this.driver, firstBlockLocator );
	}

	async getLastBlockVisible() {
		const firstBlockLocator = `//*[contains(@${ this.accessibilityIdXPathAttrib }, " Block. Row ")]`;
		return await waitForVisible(
			this.driver,
			firstBlockLocator,
			25,
			'lastElement'
		);
	}

	async hasBlockAtPosition( position = 1, blockName = '' ) {
		return (
			undefined !==
			( await this.getBlockAtPosition( blockName, position ) )
		);
	}

	async addParagraphBlockByTappingEmptyAreaBelowLastBlock() {
		const emptyAreaBelowLastBlock =
			await this.driver.elementByAccessibilityId( 'Add paragraph block' );
		await emptyAreaBelowLastBlock.click();
	}

	async getTitleElement( options = { autoscroll: false } ) {
		const titleElement = isAndroid()
			? 'Post title. Welcome to Gutenberg!'
			: 'post-title';

		if ( options.autoscroll ) {
			await swipeDown( this.driver );
		}

		const elements = await this.driver.elementsByAccessibilityId(
			titleElement
		);

		if (
			elements.length === 0 ||
			! ( await elements[ 0 ].isDisplayed() )
		) {
			return await this.getTitleElement( options );
		}
		return elements[ 0 ];
	}

	// iOS loads the block list more eagerly compared to Android.
	// This makes this function return elements without scrolling on iOS.
	// So we are keeping this Android only.
	async androidScrollAndReturnElement( accessibilityLabel ) {
		const elements = await this.driver.elementsByXPath(
			`//*[contains(@${ this.accessibilityIdXPathAttrib }, "${ accessibilityLabel }")]`
		);
		if ( elements.length === 0 ) {
			await swipeUp( this.driver, undefined, 100, 1 );
			return this.androidScrollAndReturnElement( accessibilityLabel );
		}
		return elements[ elements.length - 1 ];
	}

	// For iOS, depending on the content and how fast the block list
	// renders blocks, it won't need to scroll down as it would find
	// the block right away.
	async scrollAndReturnElementByAccessibilityId( id ) {
		const elements = await this.driver.elementsByAccessibilityId( id );

		if ( elements.length === 0 ) {
			await swipeUp( this.driver, undefined, 100, 1 );
			return this.scrollAndReturnElementByAccessibilityId( id );
		}
		return elements[ elements.length - 1 ];
	}

	async getLastElementByXPath( accessibilityLabel ) {
		const elements = await this.driver.elementsByXPath(
			`//*[contains(@${ this.accessibilityIdXPathAttrib }, "${ accessibilityLabel }")]`
		);
		return elements[ elements.length - 1 ];
	}

	async getTextViewForHtmlViewContent() {
		const accessibilityId = 'html-view-content';
		const htmlViewLocator = isAndroid()
			? `//*[@${ this.accessibilityIdXPathAttrib }="${ accessibilityId }"]`
			: `//XCUIElementTypeTextView[starts-with(@${ this.accessibilityIdXPathAttrib }, "${ accessibilityId }")]`;

		return await waitForVisible( this.driver, htmlViewLocator );
	}

	// Returns html content
	// Ensure to take additional steps to handle text being changed by auto correct.
	async getHtmlContent() {
		await toggleHtmlMode( this.driver, true );

		const htmlContentView = await this.getTextViewForHtmlViewContent();
		const text = await htmlContentView.text();

		await toggleHtmlMode( this.driver, false );
		return text;
	}

	// Set html editor content explicitly.
	async setHtmlContent( html ) {
		await toggleHtmlMode( this.driver, true );

		await setClipboard( this.driver, html );

		const htmlContentView = await this.getTextViewForHtmlViewContent();

		await htmlContentView.click();
		await doubleTap( this.driver, htmlContentView );
		await tapPasteAboveElement( this.driver, htmlContentView );

		await toggleHtmlMode( this.driver, false );
	}

	async dismissKeyboard() {
		const orientation = await this.driver.getOrientation();
		const keyboardShown = await this.driver.isKeyboardShown();
		if ( ! keyboardShown ) {
			return;
		}

		// On Android with the landspace orientation set, we use the
		// driver functionality to hide the keyboard.
		if ( isAndroid() && orientation === 'LANDSCAPE' ) {
			return await this.driver.hideDeviceKeyboard();
		}

		const hideKeyboardButton = isAndroid()
			? await this.waitForElementToBeDisplayedById( 'Hide keyboard' )
			: await this.waitForElementToBeDisplayedByXPath(
					'(//XCUIElementTypeOther[@name="Hide keyboard"])[1]'
			  );

		await hideKeyboardButton.click();
		await this.waitForKeyboardToBeHidden();
	}

	// Takes the add block button as reference for the keyboard to be
	// fully hidden.
	async waitForKeyboardToBeHidden() {
		const { addButtonLocation } = this.initialValues;
		const addButton = await this.getAddBlockButton();
		const location = await addButton.getLocation();
		let YLocation = addButtonLocation?.y;
		const currentOrientation = await this.driver.getOrientation();
		const isLandscape = currentOrientation === 'LANDSCAPE';

		if ( isLandscape ) {
			const windowSize = await this.driver.getWindowSize();
			const safeAreaOffset = 32;
			YLocation = Math.floor(
				( windowSize.height * YLocation ) / windowSize.width -
					safeAreaOffset
			);
		}

		if ( location.y < YLocation ) {
			await this.waitForKeyboardToBeHidden();
		}
	}

	async dismissAndroidClipboardSmartSuggestion() {
		if ( ! isAndroid() ) {
			return;
		}

		const dismissClipboardSmartSuggestionLocator = `//*[@${ this.accessibilityIdXPathAttrib }="Dismiss Smart Suggestion"]`;
		const smartSuggestions = await this.driver.elementsByXPath(
			dismissClipboardSmartSuggestionLocator
		);
		if ( smartSuggestions.length !== 0 ) {
			smartSuggestions[ 0 ].click();
		}
	}

	async swipeToolbarToElement( elementSelector, options ) {
		const { byId, swipeRight } = options || {};
		const offset = isAndroid() ? 300 : 50;
		const maxLocatorAttempts = 5;
		let locatorAttempts = 0;
		let element;

		const toolbar = await this.getToolbar();
		const toolbarLocation = await toolbar.getLocation();
		const toolbarSize = await toolbar.getSize();

		while ( locatorAttempts < maxLocatorAttempts ) {
			element = byId
				? await this.driver.elementsByAccessibilityId( elementSelector )
				: await this.driver.elementsByXPath( elementSelector );
			if ( await element[ 0 ]?.isDisplayed() ) {
				break;
			}

			swipeFromTo(
				this.driver,
				{
					x: ! swipeRight
						? toolbarSize.width - offset
						: toolbarSize.width / 2,
					y: toolbarLocation.y + toolbarSize.height / 2,
				},
				{
					x: ! swipeRight
						? toolbarSize.width / 2
						: toolbarSize.width - offset,
					y: toolbarLocation.y + toolbarSize.height / 2,
				},
				1000
			);
			locatorAttempts++;
		}
		return element;
	}

	async openBlockSettings() {
		const settingsButtonElement = isAndroid()
			? '//android.widget.Button[@content-desc="Open Settings"]/android.view.ViewGroup'
			: '//XCUIElementTypeButton[@name="Open Settings"]';
		const settingsButton = await this.waitForElementToBeDisplayedByXPath(
			settingsButtonElement
		);

		await settingsButton.click();
	}

	async removeBlock() {
		const blockActionsButtonElement = isAndroid()
			? '//android.widget.Button[contains(@content-desc, "Open Block Actions Menu")]'
			: '//XCUIElementTypeButton[@name="Open Block Actions Menu"]';
		const blockActionsMenu = await this.swipeToolbarToElement(
			blockActionsButtonElement
		);
		await blockActionsMenu[ 0 ].click();

		const removeElement = 'Remove block';
		const removeBlockButton = await this.waitForElementToBeDisplayedById(
			removeElement,
			4000
		);
		return await removeBlockButton.click();
	}

	async dismissBottomSheet() {
		return await swipeDown( this.driver );
	}

	// =========================
	// Block toolbar functions
	// =========================

	async getToolbar() {
		return this.waitForElementToBeDisplayedById( 'Document tools', 4000 );
	}

	async addNewBlock( blockName, { skipInserterOpen = false } = {} ) {
		if ( ! skipInserterOpen ) {
			const addButton = await this.swipeToolbarToElement( ADD_BLOCK_ID, {
				byId: true,
				swipeRight: true,
			} );
			await addButton[ 0 ].click();
		}

		// Click on block of choice.
		const blockButton = await this.findBlockButton( blockName );

		if ( isAndroid() ) {
			await blockButton.click();
		} else {
			await this.driver.execute( 'mobile: tap', {
				element: blockButton,
				x: 10,
				y: 10,
			} );
		}
	}

	static getInserterPageHeight( screenHeight ) {
		// Rough estimate of a swipe distance required to scroll one page of blocks.
		return screenHeight * 0.82;
	}

	async waitForInserter() {
		const inserterElement = isAndroid()
			? 'Blocks menu'
			: 'InserterUI-Blocks';
		return await this.waitForElementToBeDisplayedById(
			inserterElement,
			4000
		);
	}

	static async isElementOutOfBounds( element, { width, height } = {} ) {
		const { x, y } = await element.getLocation();
		return x > width || y > height;
	}

	// Attempts to find the given block button in the block inserter control.
	async findBlockButton( blockName ) {
		await this.waitForInserter();
		const blockAccessibilityLabel = `${ blockName } block`;
		const blockAccessibilityLabelNewBlock = `${ blockAccessibilityLabel }, newly available`;

		if ( isAndroid() ) {
			const size = await this.driver.getWindowSize();
			const x = size.width / 2;
			// Checks if the Block Button is available, and if not will scroll to the second half of the available buttons.
			while (
				! ( await this.driver.hasElementByAccessibilityId(
					blockAccessibilityLabel
				) ) &&
				! ( await this.driver.hasElementByAccessibilityId(
					blockAccessibilityLabelNewBlock
				) )
			) {
				swipeFromTo(
					this.driver,
					{ x, y: size.height - 100 },
					{ x, y: EditorPage.getInserterPageHeight( size.height ) }
				);
			}

			if (
				await this.driver.hasElementByAccessibilityId(
					blockAccessibilityLabelNewBlock
				)
			) {
				return await this.driver.elementByAccessibilityId(
					blockAccessibilityLabelNewBlock
				);
			}

			return await this.driver.elementByAccessibilityId(
				blockAccessibilityLabel
			);
		}

		const blockButton = ( await this.driver.hasElementByAccessibilityId(
			blockAccessibilityLabelNewBlock
		) )
			? await this.driver.elementByAccessibilityId(
					blockAccessibilityLabelNewBlock
			  )
			: await this.driver.elementByAccessibilityId(
					blockAccessibilityLabel
			  );

		const size = await this.driver.getWindowSize();
		// The virtual home button covers the bottom 34 in portrait and 21 on landscape on iOS.
		// We start dragging a bit above it to not trigger home button.
		const height = size.height - 50;

		while (
			! ( await blockButton.isDisplayed() ) ||
			( await EditorPage.isElementOutOfBounds( blockButton, { height } ) )
		) {
			await this.driver.execute( 'mobile: dragFromToForDuration', {
				fromX: 50,
				fromY: height,
				toX: 50,
				toY: EditorPage.getInserterPageHeight( height ),
				duration: 0.5,
			} );
		}

		return blockButton;
	}

	async clickToolBarButton( buttonName ) {
		const toolBarButton = await this.driver.elementByAccessibilityId(
			buttonName
		);
		await toolBarButton.click();
	}

	async moveBlockSelectionUp( options = { toRoot: false } ) {
		let navigateUpElements = [];
		do {
			await this.driver.sleep( 2000 );
			navigateUpElements = await this.driver.elementsByAccessibilityId(
				'Navigate Up'
			);
			if ( navigateUpElements.length > 0 ) {
				await navigateUpElements[ 0 ].click();
			}
			if ( ! options.toRoot ) {
				break;
			}
		} while ( navigateUpElements.length > 0 );
	}

	// Adds a block by tapping on the appender button of blocks with inner blocks (e.g. Group block)
	async addBlockUsingAppender( block, blockName ) {
		const appenderButton = isAndroid()
			? await this.waitForElementToBeDisplayedByXPath(
					`//android.widget.Button[@resource-id="appender-button"]`
			  )
			: await this.waitForElementToBeDisplayedById( 'appender-button' );
		await appenderButton.click();

		// Click on block of choice.
		const blockButton = await this.findBlockButton( blockName );

		if ( isAndroid() ) {
			await blockButton.click();
		} else {
			await this.driver.execute( 'mobile: tap', {
				element: blockButton,
				x: 10,
				y: 10,
			} );
		}
	}

	// =========================
	// Inline toolbar functions
	// =========================

	// position of the block to move up.
	async moveBlockUpAtPosition( position, blockName = '' ) {
		if ( ! ( await this.hasBlockAtPosition( position, blockName ) ) ) {
			throw Error( `No Block at position ${ position }` );
		}

		const parentLocator = `//*[@${ this.accessibilityIdXPathAttrib }="${ blockName } Block. Row ${ position }."]`;
		let blockLocator = `${ parentLocator }/following-sibling::*`;
		blockLocator += isAndroid() ? '' : '//*';
		blockLocator += `[@${
			this.accessibilityIdXPathAttrib
		}="Move block up from row ${ position } to row ${ position - 1 }"]`;
		const moveUpButton = await this.driver.elementByXPath( blockLocator );
		await moveUpButton.click();
	}

	// position of the block to move down.
	async moveBlockDownAtPosition( position, blockName = '' ) {
		if ( ! ( await this.hasBlockAtPosition( position, blockName ) ) ) {
			throw Error( `No Block at position ${ position }` );
		}

		const parentLocator = `//*[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }.")]`;
		let blockLocator = `${ parentLocator }/following-sibling::*`;
		blockLocator += isAndroid() ? '' : '//*';
		blockLocator += `[@${
			this.accessibilityIdXPathAttrib
		}="Move block down from row ${ position } to row ${ position + 1 }"]`;
		const moveDownButton = await this.driver.elementByXPath( blockLocator );
		await moveDownButton.click();
	}

	// Position of the block to remove
	// Block will no longer be present if this succeeds.
	async removeBlockAtPosition( blockName = '', position = 1 ) {
		if ( ! ( await this.hasBlockAtPosition( position, blockName ) ) ) {
			throw Error( `No Block at position ${ position }` );
		}

		const buttonElementName = isAndroid()
			? '//*'
			: '//XCUIElementTypeButton';
		const blockActionsMenuButtonIdentifier = `Open Block Actions Menu`;
		const blockActionsMenuButtonLocator = `${ buttonElementName }[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockActionsMenuButtonIdentifier }")]`;
		if ( isAndroid() ) {
			const block = await this.getBlockAtPosition( blockName, position );
			let checkList = await this.driver.elementsByXPath(
				blockActionsMenuButtonLocator
			);
			while ( checkList.length === 0 ) {
				await swipeUp( this.driver, block ); // Swipe up to show remove icon at the bottom.
				checkList = await this.driver.elementsByXPath(
					blockActionsMenuButtonLocator
				);
			}
		}

		const blockActionsMenuButton = await waitForVisible(
			this.driver,
			blockActionsMenuButtonLocator
		);
		await blockActionsMenuButton.click();
		const removeActionButtonIdentifier = 'Remove block';
		const removeActionButtonLocator = `${ buttonElementName }[contains(@${ this.accessibilityIdXPathAttrib }, "${ removeActionButtonIdentifier }")]`;
		const removeActionButton = await waitForVisible(
			this.driver,
			removeActionButtonLocator
		);

		await removeActionButton.click();
	}

	// =========================
	// Formatting toolbar functions
	// =========================

	async toggleFormatting( formatting ) {
		const identifier = isAndroid()
			? `//android.widget.Button[@content-desc="${ formatting }"]/android.view.ViewGroup`
			: `//XCUIElementTypeButton[@name="${ formatting }"]`;
		const toggleElement = await this.swipeToolbarToElement( identifier );
		return await toggleElement[ 0 ].click();
	}

	async openLinkToSettings() {
		const element = await this.waitForElementToBeDisplayedById(
			'Link to, Search or type URL'
		);

		await element.click();
	}

	// =========================
	// Paragraph Block functions
	// =========================

	async sendTextToParagraphBlock( position, text, clear ) {
		const paragraphs = text.split( '\n' );
		for ( let i = 0; i < paragraphs.length; i++ ) {
			const block = await this.getTextBlockAtPosition(
				blockNames.paragraph,
				position + i
			);

			if ( isAndroid() ) {
				await block.click();
			}

			await this.typeTextToTextBlock( block, paragraphs[ i ], clear );
			if ( i !== paragraphs.length - 1 ) {
				await this.typeTextToTextBlock( block, '\n' );
			}
		}
	}

	async getTextForParagraphBlockAtPosition( position ) {
		const blockLocator = await this.getTextBlockAtPosition(
			blockNames.paragraph,
			position
		);

		return await blockLocator.text();
	}

	async getNumberOfParagraphBlocks() {
		const paragraphBlockLocator = isAndroid()
			? `//android.widget.Button[contains(@content-desc, "Paragraph Block. Row")]//android.widget.EditText`
			: `(//XCUIElementTypeButton[contains(@name, "Paragraph Block. Row")])`;

		const locator = await this.driver.elementsByXPath(
			paragraphBlockLocator
		);
		return locator.length;
	}

	async assertSlashInserterPresent() {
		let isPresent = false;
		const autocompleterElementId = isAndroid()
			? 'Slash inserter results'
			: 'autocompleter';
		const autocompleterElement =
			await this.driver.elementsByAccessibilityId(
				autocompleterElementId
			);

		if ( autocompleterElement?.[ 0 ] ) {
			isPresent = await autocompleterElement[ 0 ].isDisplayed();
		}

		return isPresent;
	}

	// =========================
	// List Block functions
	// =========================

	async getListBlockAtPosition(
		position = 1,
		options = { isEmptyBlock: false }
	) {
		// iOS needs a few extra steps to get the text element
		if ( ! isAndroid() ) {
			// Click the list in the correct position
			await clickIfClickable(
				this.driver,
				`(//XCUIElementTypeOther[contains(@name, "List Block. Row ${ position }")])[1]`
			);

			const listBlockLocator = options.isEmptyBlock
				? `(//XCUIElementTypeStaticText[contains(@name, "List")])`
				: `//XCUIElementTypeButton[contains(@name, "List")]`;

			await clickIfClickable( this.driver, listBlockLocator );
		}

		const listBlockTextLocatorIOS = options.isEmptyBlock
			? `(//XCUIElementTypeStaticText[contains(@name, "List")])`
			: `//XCUIElementTypeButton[contains(@name, "List")]//XCUIElementTypeTextView`;

		const listBlockTextLocator = isAndroid()
			? `//android.widget.Button[contains(@content-desc, "List Block. Row ${ position }")]//android.widget.EditText`
			: listBlockTextLocatorIOS;

		return await waitForVisible( this.driver, listBlockTextLocator );
	}

	async clickOrderedListToolBarButton() {
		const toolBarLocator = isAndroid()
			? `//android.widget.Button[@content-desc="${ this.orderedListButtonName }"]`
			: `//XCUIElementTypeButton[@name="${ this.orderedListButtonName }"]`;

		await waitForVisible( this.driver, toolBarLocator );
		await this.clickToolBarButton( this.orderedListButtonName );
	}

	// =========================
	// Cover Block functions
	// For iOS only
	// =========================

	async clickAddMediaFromCoverBlock() {
		const mediaSection = await waitForVisible(
			this.driver,
			'//XCUIElementTypeOther[@name="Media Add image or video"]'
		);
		const addMediaButton = await mediaSection.elementByAccessibilityId(
			'Add image or video'
		);
		await addMediaButton.click();
	}

	async replaceMediaImage() {
		await clickIfClickable(
			this.driver,
			'(//XCUIElementTypeButton[@name="Edit image"])[1]'
		);
		await clickIfClickable(
			this.driver,
			'//XCUIElementTypeButton[@name="Replace"]'
		);
	}

	// =========================
	// Image Block functions
	// =========================

	async selectEmptyImageBlock( block ) {
		const accessibilityId = await block.getAttribute(
			this.accessibilityIdKey
		);
		const blockLocator = `//*[@${ this.accessibilityIdXPathAttrib }="${ accessibilityId }"]//XCUIElementTypeButton[@name="Image block. Empty"]`;
		const imageBlockInnerElement = await this.driver.elementByXPath(
			blockLocator
		);
		await imageBlockInnerElement.click();
	}

	async chooseMediaLibrary() {
		const mediaLibraryLocator = isAndroid()
			? `//android.widget.Button[@content-desc="WordPress Media Library"]`
			: `//XCUIElementTypeButton[@name="WordPress Media Library"]`;

		await clickIfClickable( this.driver, mediaLibraryLocator );
	}

	async enterCaptionToSelectedImageBlock( caption, clear = true ) {
		const imageBlockCaptionField = await this.driver.elementByXPath(
			'//XCUIElementTypeButton[starts-with(@name, "Image caption.")]'
		);
		await imageBlockCaptionField.click();
		await typeString( this.driver, imageBlockCaptionField, caption, clear );
	}

	async closePicker() {
		if ( isAndroid() ) {
			// Wait for media block picker to load before closing
			const locator =
				'//android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup';
			await waitForVisible( this.driver, locator );

			await swipeDown( this.driver );
		} else {
			await clickIfClickable(
				this.driver,
				'//XCUIElementTypeButton[@name="Cancel"]'
			);
		}
	}

	// =============================
	// Search Block functions
	// =============================

	async getSearchBlockTextElement( testID ) {
		const child = await this.driver.elementByAccessibilityId( testID );

		if ( isAndroid() ) {
			// Get the child EditText element of the ViewGroup returned by
			// elementByAccessibilityId.
			return await child.elementByClassName( 'android.widget.EditText' );
		}

		return child;
	}

	async sendTextToSearchBlockChild( testID, text ) {
		const textViewElement = await this.getSearchBlockTextElement( testID );
		return await typeString( this.driver, textViewElement, text );
	}

	async toggleHideSearchLabelSetting() {
		await this.openBlockSettings();

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeOther';

		const hideSearchHeadingToggleLocator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Hide search heading")]`;
		return await clickIfClickable(
			this.driver,
			hideSearchHeadingToggleLocator
		);
	}

	async changeSearchButtonPositionSetting( buttonPosition ) {
		await this.openBlockSettings();

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeButton';

		const optionMenuLocator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Button position")]`;
		await clickIfClickable( this.driver, optionMenuLocator );

		const optionMenuButtonLocator = `${ elementName }[contains(@${ this.accessibilityIdXPathAttrib }, "${ buttonPosition }")]`;
		return await clickIfClickable( this.driver, optionMenuButtonLocator );
	}

	async toggleSearchIconOnlySetting() {
		await this.openBlockSettings();

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeOther';

		const useIconButtonLocator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Use icon button")]`;
		return await clickIfClickable( this.driver, useIconButtonLocator );
	}

	async isSearchSettingsVisible() {
		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeButton';
		const buttonPositionLocator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Button position")]`;

		return await waitForVisible( this.driver, buttonPositionLocator );
	}

	// =============================
	// Unsupported Block functions
	// =============================

	async getUnsupportedBlockHelpButton() {
		const accessibilityId = 'Help button';
		const blockLocator = isAndroid()
			? `//android.widget.Button[starts-with(@content-desc, "${ accessibilityId }")]`
			: `//XCUIElementTypeButton[@name="${ accessibilityId }"]`;

		return await waitForVisible( this.driver, blockLocator );
	}

	async getUnsupportedBlockBottomSheetEditButton() {
		const accessibilityId = 'Edit using web editor';
		const blockLocator = isAndroid()
			? `//android.widget.Button[@content-desc="${ accessibilityId }"]`
			: `//XCUIElementTypeButton[@name="${ accessibilityId }"]`;

		return await waitForVisible( this.driver, blockLocator );
	}

	async getUnsupportedBlockWebView() {
		const blockLocator = isAndroid()
			? '//android.webkit.WebView'
			: '//XCUIElementTypeWebView';

		return await waitForVisible( this.driver, blockLocator );
	}

	async stopDriver() {
		await stopDriver( this.driver );
	}

	async sauceJobStatus( allPassed ) {
		await this.driver.sauceJobStatus( allPassed );
	}

	// =========================
	// Shortcode Block functions
	// =========================

	async getShortBlockTextInputAtPosition( blockName, position = 1 ) {
		// iOS needs a click to get the text element
		if ( ! isAndroid() ) {
			const textBlockLocator = `(//XCUIElementTypeButton[contains(@name, "Shortcode Block. Row ${ position }")])`;

			const textBlock = await waitForVisible(
				this.driver,
				textBlockLocator
			);
			await textBlock.click();
		}

		const blockLocator = isAndroid()
			? `//android.widget.Button[@content-desc="Shortcode Block. Row ${ position }"]//android.widget.EditText`
			: `//XCUIElementTypeButton[contains(@name, "Shortcode Block. Row ${ position }")]//XCUIElementTypeTextView`;

		return await waitForVisible( this.driver, blockLocator );
	}

	// =========================
	// Button Block functions
	// =========================

	async getButtonBlockTextInputAtPosition( position = 1 ) {
		const blockLocator = isAndroid()
			? `//android.widget.Button[@content-desc="Button Block. Row ${ position }"]//android.widget.EditText`
			: `//XCUIElementTypeButton[contains(@name, "Button Block. Row ${ position }")]//XCUIElementTypeTextView`;

		return await this.waitForElementToBeDisplayedByXPath( blockLocator );
	}

	async addButtonWithInlineAppender( position = 1 ) {
		const appenderButton = isAndroid()
			? await this.waitForElementToBeDisplayedByXPath(
					`//android.widget.Button[@content-desc="Buttons Block. Row 1"]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[${ position }]/android.view.ViewGroup/android.widget.Button`
			  )
			: await this.waitForElementToBeDisplayedById( 'appender-button' );
		await appenderButton.click();
	}

	async waitForElementToBeDisplayedById( id, timeout = 2000 ) {
		return await this.driver.waitForElementByAccessibilityId(
			id,
			wd.asserters.isDisplayed,
			timeout
		);
	}

	async waitForElementToBeDisplayedByXPath( id, timeout = 2000 ) {
		return await this.driver.waitForElementByXPath(
			id,
			wd.asserters.isDisplayed,
			timeout
		);
	}
}

const blockNames = {
	audio: 'Audio',
	columns: 'Columns',
	cover: 'Cover',
	embed: 'Embed',
	file: 'File',
	gallery: 'Gallery',
	heading: 'Heading',
	image: 'Image',
	latestPosts: 'Latest Posts',
	list: 'List',
	listItem: 'List item',
	more: 'More',
	paragraph: 'Paragraph',
	search: 'Search',
	separator: 'Separator',
	spacer: 'Spacer',
	verse: 'Verse',
	shortcode: 'Shortcode',
	group: 'Group',
	buttons: 'Buttons',
	button: 'Button',
	preformatted: 'Preformatted',
	unsupported: 'Unsupported',
};

module.exports = { initializeEditorPage, blockNames };
