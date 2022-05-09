/**
 * Internal dependencies
 */
const {
	setupDriver,
	stopDriver,
	isAndroid,
	swipeUp,
	swipeDown,
	typeString,
	toggleHtmlMode,
	swipeFromTo,
	longPressMiddleOfElement,
	doubleTap,
	isEditorVisible,
	waitForVisible,
} = require( '../helpers/utils' );

const initializeEditorPage = async () => {
	const driver = await setupDriver();
	await isEditorVisible( driver );
	return new EditorPage( driver );
};

class EditorPage {
	driver;
	accessibilityIdKey;
	accessibilityIdXPathAttrib;
	paragraphBlockName = 'Paragraph';
	verseBlockName = 'Verse';
	orderedListButtonName = 'Ordered';

	constructor( driver ) {
		this.driver = driver;
		this.accessibilityIdKey = 'name';
		this.accessibilityIdXPathAttrib = 'name';

		if ( isAndroid() ) {
			this.accessibilityIdXPathAttrib = 'content-desc';
			this.accessibilityIdKey = 'contentDescription';
		}
	}

	async getBlockList() {
		return await this.driver.hasElementByAccessibilityId( 'block-list' );
	}

	// For text blocks, e.g. Paragraph, Heading
	async getTextBlockAtPosition( blockName, position = 1 ) {
		// iOS needs a click before
		if ( ! isAndroid() ) {
			const textBlockLocator = `(//XCUIElementTypeButton[contains(@name, "${ blockName } Block. Row ${ position }")])`;
			const textBlock = await waitForVisible(
				this.driver,
				textBlockLocator
			);
			await textBlock.click();
		}

		const blockLocator = isAndroid()
			? `//android.view.ViewGroup[contains(@content-desc, "${ blockName } Block. Row ${ position }.")]/android.widget.EditText`
			: `//XCUIElementTypeButton[contains(@name, "${ blockName } Block. Row ${ position }.")]//XCUIElementTypeTextView`;

		return await waitForVisible( this.driver, blockLocator );
	}

	// Finds the wd element for new block that was added and sets the element attribute
	// and accessibilityId attributes on this object and selects the block
	// position uses one based numbering.
	async getBlockAtPosition(
		blockName,
		position = 1,
		options = { autoscroll: false, useWaitForVisible: false }
	) {
		let blockLocator;

		// Make it optional to use waitForVisible() so we can handle this test by test.
		// This condition can be removed once we have gone through all test cases.
		if ( options.useWaitForVisible ) {
			let elementType;
			switch ( blockName ) {
				case blockNames.cover:
					elementType = 'XCUIElementTypeButton';
					break;
				default:
					elementType = 'XCUIElementTypeOther';
					break;
			}

			blockLocator = isAndroid()
				? `//android.view.ViewGroup[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }")]`
				: `(//${ elementType }[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }")])[1]`;

			await waitForVisible( this.driver, blockLocator );
		} else {
			blockLocator = `//*[contains(@${ this.accessibilityIdXPathAttrib }, "${ blockName } Block. Row ${ position }")]`;
		}
		const elements = await this.driver.elementsByXPath( blockLocator );
		const lastElementFound = elements[ elements.length - 1 ];
		if ( elements.length === 0 && options.autoscroll ) {
			const firstBlockVisible = await this.getFirstBlockVisible();
			const lastBlockVisible = await this.getLastBlockVisible();
			// Exit if no block is found.
			if ( ! firstBlockVisible || ! lastBlockVisible ) {
				return lastElementFound;
			}
			const firstBlockAccessibilityId = await firstBlockVisible.getAttribute(
				this.accessibilityIdKey
			);
			const firstBlockRowMatch = /Row (\d+)\./.exec(
				firstBlockAccessibilityId
			);
			const firstBlockRow =
				firstBlockRowMatch && Number( firstBlockRowMatch[ 1 ] );
			const lastBlockAccessibilityId = await lastBlockVisible.getAttribute(
				this.accessibilityIdKey
			);
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
		const elements = await this.driver.elementsByXPath( firstBlockLocator );
		return elements[ 0 ];
	}

	async getLastBlockVisible() {
		const firstBlockLocator = `//*[contains(@${ this.accessibilityIdXPathAttrib }, " Block. Row ")]`;
		const elements = await this.driver.elementsByXPath( firstBlockLocator );
		return elements[ elements.length - 1 ];
	}

	async hasBlockAtPosition( position = 1, blockName = '' ) {
		return (
			undefined !==
			( await this.getBlockAtPosition( blockName, position, {
				useWaitForVisible: true,
			} ) )
		);
	}

	async addParagraphBlockByTappingEmptyAreaBelowLastBlock() {
		const emptyAreaBelowLastBlock = await this.driver.elementByAccessibilityId(
			'Add paragraph block'
		);
		await emptyAreaBelowLastBlock.click();
	}

	async getTitleElement( options = { autoscroll: false } ) {
		// TODO: Improve the identifier for this element
		const elements = await this.driver.elementsByXPath(
			`//*[contains(@${ this.accessibilityIdXPathAttrib }, "Post title.")]`
		);
		if ( elements.length === 0 && options.autoscroll ) {
			await swipeDown( this.driver );
			return this.getTitleElement( options );
		}
		return elements[ elements.length - 1 ];
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

		const base64String = Buffer.from( html ).toString( 'base64' );

		await this.driver.setClipboard( base64String, 'plaintext' );

		const htmlContentView = await this.getTextViewForHtmlViewContent();

		if ( isAndroid() ) {
			// Attention! On Android `.type()` replaces the content of htmlContentView instead of appending
			// contrary to what iOS is doing. On Android tried calling `driver.pressKeycode( 279 ) // KEYCODE_PASTE`
			// before to paste, but for some reason it didn't work on GitHub Actions but worked only on Sauce Labs
			await htmlContentView.type( html );
		} else {
			await htmlContentView.click();
			await doubleTap( this.driver, htmlContentView );
			// Sometimes double tap is not enough for paste menu to appear, so we also long press.
			await longPressMiddleOfElement( this.driver, htmlContentView );

			const pasteButton = this.driver.elementByXPath(
				'//XCUIElementTypeMenuItem[@name="Paste"]'
			);

			await pasteButton.click();
			await this.driver.sleep( 3000 ); // Wait for paste notification to disappear.
		}

		await toggleHtmlMode( this.driver, false );
	}

	async dismissKeyboard() {
		await this.driver.sleep( 1000 ); // Wait for any keyboard animations.
		const keyboardShown = await this.driver.isKeyboardShown();
		if ( ! keyboardShown ) {
			return;
		}
		if ( isAndroid() ) {
			return await this.driver.hideDeviceKeyboard();
		}
		const hideKeyboardToolbarButton = await this.driver.elementByXPath(
			'//XCUIElementTypeButton[@name="Hide keyboard"]'
		);
		await hideKeyboardToolbarButton.click();
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

	async openBlockSettings( block ) {
		await block.click();

		const settingsButton = await block.elementByAccessibilityId(
			'Open Settings'
		);
		await settingsButton.click();
	}

	async dismissBottomSheet() {
		return await swipeDown( this.driver );
	}

	// =========================
	// Block toolbar functions
	// =========================

	async addNewBlock( blockName, relativePosition ) {
		const addBlockButtonLocator = isAndroid()
			? '//android.widget.Button[@content-desc="Add block, Double tap to add a block"]'
			: '//XCUIElementTypeButton[@name="add-block-button"]';

		const addButton = await waitForVisible(
			this.driver,
			addBlockButtonLocator
		);

		if ( relativePosition === 'before' ) {
			await longPressMiddleOfElement( this.driver, addButton );
			const addBlockBeforeButtonLocator = isAndroid()
				? '//android.widget.Button[@content-desc="Add Block Before"]'
				: '//XCUIElementTypeButton[@name="Add Block Before"]';

			const addBlockBeforeButton = await waitForVisible(
				this.driver,
				addBlockBeforeButtonLocator
			);
			await addBlockBeforeButton.click();
		} else {
			await addButton.click();
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

	// Attempts to find the given block button in the block inserter control.
	async findBlockButton( blockName ) {
		// Wait for the first block, Paragraph block, to load before looking for other blocks
		const paragraphBlockLocator = isAndroid()
			? '//android.widget.Button[@content-desc="Paragraph block"]/android.widget.TextView'
			: '//XCUIElementTypeButton[@name="Paragraph block"]';

		await waitForVisible( this.driver, paragraphBlockLocator );
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

		while ( ! ( await blockButton.isDisplayed() ) ) {
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
		const blockActionsMenuButton = await waitForVisible(
			this.driver,
			blockActionsMenuButtonLocator
		);
		if ( isAndroid() ) {
			const block = await this.getBlockAtPosition( blockName, position, {
				useWaitForVisible: true,
			} );
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
	// Paragraph Block functions
	// =========================

	async typeTextToParagraphBlock( block, text, clear ) {
		await typeString( this.driver, block, text, clear );
	}

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

			await this.typeTextToParagraphBlock(
				block,
				paragraphs[ i ],
				clear
			);
			if ( i !== paragraphs.length - 1 ) {
				await this.typeTextToParagraphBlock( block, '\n', false );
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

	// =========================
	// List Block functions
	// =========================

	async getTextViewForListBlock( block ) {
		let textViewElementName = 'XCUIElementTypeTextView';
		if ( isAndroid() ) {
			textViewElementName = 'android.widget.EditText';
		}

		const accessibilityId = await block.getAttribute(
			this.accessibilityIdKey
		);
		const blockLocator = `//*[@${
			this.accessibilityIdXPathAttrib
		}=${ JSON.stringify( accessibilityId ) }]//${ textViewElementName }`;
		return await this.driver.elementByXPath( blockLocator );
	}

	async sendTextToListBlock( block, text ) {
		const textViewElement = await this.getTextViewForListBlock( block );

		// Cannot clear list blocks because it messes up the list bullet.
		const clear = false;

		return await typeString( this.driver, textViewElement, text, clear );
	}

	async clickOrderedListToolBarButton() {
		await this.clickToolBarButton( this.orderedListButtonName );
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

		const mediaLibraryButton = await waitForVisible(
			this.driver,
			mediaLibraryLocator
		);
		await mediaLibraryButton.click();
	}

	async enterCaptionToSelectedImageBlock( caption, clear = true ) {
		const imageBlockCaptionField = await this.driver.elementByXPath(
			'//XCUIElementTypeButton[starts-with(@name, "Image caption.")]'
		);
		await imageBlockCaptionField.click();
		await typeString( this.driver, imageBlockCaptionField, caption, clear );
	}

	// =========================
	// Heading Block functions
	// =========================

	// Inner element changes on iOS if Heading Block is empty
	async getTextViewForHeadingBlock( block, empty ) {
		let textViewElementName = empty
			? 'XCUIElementTypeStaticText'
			: 'XCUIElementTypeTextView';
		if ( isAndroid() ) {
			textViewElementName = 'android.widget.EditText';
		}

		const accessibilityId = await block.getAttribute(
			this.accessibilityIdKey
		);
		const blockLocator = `//*[@${ this.accessibilityIdXPathAttrib }="${ accessibilityId }"]//${ textViewElementName }`;
		return await this.driver.elementByXPath( blockLocator );
	}

	async sendTextToHeadingBlock( block, text, clear = true ) {
		const textViewElement = await this.getTextViewForHeadingBlock(
			block,
			true
		);
		return await typeString( this.driver, textViewElement, text, clear );
	}

	async closePicker() {
		if ( isAndroid() ) {
			// Wait for media block picker to load before closing
			const locator =
				'//android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup';
			await waitForVisible( this.driver, locator );

			await swipeDown( this.driver );
		} else {
			const cancelButton = await waitForVisible(
				this.driver,
				'//XCUIElementTypeButton[@name="Cancel"]'
			);
			await cancelButton.click();
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

	async toggleHideSearchLabelSetting( block ) {
		await this.openBlockSettings( block );

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeOther';

		const locator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Hide search heading")]`;
		return await this.driver
			.elementByXPath( locator )
			.click()
			.sleep( isAndroid() ? 200 : 0 );
	}

	async changeSearchButtonPositionSetting( block, buttonPosition ) {
		await this.openBlockSettings( block );

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeButton';

		const locator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Button position")]`;
		await this.driver.elementByXPath( locator ).click();

		const optionMenuButtonLocator = `${ elementName }[contains(@${ this.accessibilityIdXPathAttrib }, "${ buttonPosition }")]`;
		return await this.driver
			.elementByXPath( optionMenuButtonLocator )
			.click()
			.sleep( isAndroid() ? 600 : 200 ); // sleep a little longer due to multiple menus.
	}

	async toggleSearchIconOnlySetting( block ) {
		await this.openBlockSettings( block );

		const elementName = isAndroid() ? '//*' : '//XCUIElementTypeOther';

		const locator = `${ elementName }[starts-with(@${ this.accessibilityIdXPathAttrib }, "Use icon button")]`;
		return await this.driver
			.elementByXPath( locator )
			.click()
			.sleep( isAndroid() ? 200 : 0 );
	}

	// =============================
	// Unsupported Block functions
	// =============================

	async getUnsupportedBlockHelpButton() {
		const accessibilityId = 'Help button';
		let blockLocator =
			'//android.widget.Button[@content-desc="Help button, Tap here to show help"]';

		if ( ! isAndroid() ) {
			blockLocator = `//XCUIElementTypeButton[@name="${ accessibilityId }"]`;
		}
		return await this.driver.elementByXPath( blockLocator );
	}

	async getUnsupportedBlockBottomSheetEditButton() {
		const accessibilityId = 'Edit using web editor';
		let blockLocator =
			'//android.widget.Button[@content-desc="Edit using web editor"]';

		if ( ! isAndroid() ) {
			blockLocator = `//XCUIElementTypeButton[@name="${ accessibilityId }"]`;
		}
		return await this.driver.elementByXPath( blockLocator );
	}

	async getUnsupportedBlockWebView() {
		let blockLocator = '//android.webkit.WebView';

		if ( ! isAndroid() ) {
			blockLocator = '//XCUIElementTypeWebView';
		}

		this.driver.setImplicitWaitTimeout( 20000 );
		const element = await this.driver.elementByXPath( blockLocator );
		this.driver.setImplicitWaitTimeout( 5000 );
		return element;
	}

	async stopDriver() {
		await stopDriver( this.driver );
	}

	async sauceJobStatus( allPassed ) {
		await this.driver.sauceJobStatus( allPassed );
	}

	async getNumberOfParagraphBlocks() {
		const paragraphBlockLocator = isAndroid()
			? `//android.view.ViewGroup[contains(@content-desc, "Paragraph Block. Row")]/android.widget.EditText`
			: `(//XCUIElementTypeButton[contains(@name, "Paragraph Block. Row")])`;
		const locator = await this.driver.elementsByXPath(
			paragraphBlockLocator
		);
		return locator.length;
	}
}

const blockNames = {
	paragraph: 'Paragraph',
	gallery: 'Gallery',
	columns: 'Columns',
	cover: 'Cover',
	heading: 'Heading',
	image: 'Image',
	latestPosts: 'Latest Posts',
	list: 'List',
	more: 'More',
	separator: 'Separator',
	spacer: 'Spacer',
	verse: 'Verse',
	file: 'File',
	audio: 'Audio',
	search: 'Search',
};

module.exports = { initializeEditorPage, blockNames };
