/**
 * Internal dependencies
 */
import { blockNames } from './pages/editor-page';
import {
	clearClipboard,
	longPressMiddleOfElement,
	tapSelectAllAboveElement,
	tapCopyAboveElement,
	tapPasteAboveElement,
	toggleOrientation,
	isAndroid,
} from './helpers/utils';
import testData from './helpers/test-data';

describe( 'Gutenberg Editor Rotation tests', () => {
	it( 'should be able to add blocks , rotate device and continue adding blocks', async () => {
		await editorPage.initializeEditor();
		await editorPage.addNewBlock( blockNames.paragraph );
		let paragraphBlockElement = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph
		);

		await editorPage.typeTextToTextBlock(
			paragraphBlockElement,
			testData.mediumText
		);

		await toggleOrientation( editorPage.driver );
		// On Android the keyboard hides the add block button, let's hide it after rotation
		if ( isAndroid() ) {
			await editorPage.dismissKeyboard();
		}

		await editorPage.addNewBlock( blockNames.paragraph );

		if ( isAndroid() ) {
			await editorPage.dismissKeyboard();
		}

		paragraphBlockElement = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph,
			2
		);

		await editorPage.typeTextToTextBlock(
			paragraphBlockElement,
			testData.mediumText
		);
		await toggleOrientation( editorPage.driver );

		const html = await editorPage.getHtmlContent();

		expect( html.toLowerCase() ).toBe(
			testData.deviceRotationHtml.toLowerCase()
		);
	} );
} );

describe( 'Gutenberg Editor Paste tests', () => {
	// skip iOS for now
	if ( ! isAndroid() ) {
		it( 'skips the tests on any platform other than Android', async () => {
			expect( true ).toBe( true );
		} );
		return;
	}

	beforeAll( async () => {
		await clearClipboard( editorPage.driver );
	} );

	it.skip( 'copies plain text from one paragraph block and pastes in another', async () => {
		await editorPage.initializeEditor();
		await editorPage.addNewBlock( blockNames.paragraph );
		const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph
		);

		await editorPage.typeTextToTextBlock(
			paragraphBlockElement,
			testData.pastePlainText
		);

		// Copy content to clipboard.
		await longPressMiddleOfElement(
			editorPage.driver,
			paragraphBlockElement
		);
		await tapSelectAllAboveElement(
			editorPage.driver,
			paragraphBlockElement
		);
		await tapCopyAboveElement( editorPage.driver, paragraphBlockElement );

		// Create another paragraph block.
		await editorPage.addNewBlock( blockNames.paragraph );
		if ( isAndroid() ) {
			// On Andrdoid 10 a new auto-suggestion popup is appearing to let the user paste text recently put in the clipboard. Let's dismiss it.
			await editorPage.dismissAndroidClipboardSmartSuggestion();
		}
		const paragraphBlockElement2 = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph,
			2
		);

		// Paste into second paragraph block.
		await tapPasteAboveElement( editorPage.driver, paragraphBlockElement2 );

		const text = await editorPage.getTextForParagraphBlockAtPosition( 2 );
		expect( text ).toBe( testData.pastePlainText );
	} );

	it.skip( 'copies styled text from one paragraph block and pastes in another', async () => {
		// Create paragraph block with styled text by editing html.
		await editorPage.initializeEditor( {
			initialData: testData.pasteHtmlText,
		} );
		const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph
		);

		// Copy content to clipboard.
		await longPressMiddleOfElement(
			editorPage.driver,
			paragraphBlockElement
		);
		await tapSelectAllAboveElement(
			editorPage.driver,
			paragraphBlockElement
		);
		await tapCopyAboveElement( editorPage.driver, paragraphBlockElement );

		// Create another paragraph block.
		await editorPage.addNewBlock( blockNames.paragraph );
		if ( isAndroid() ) {
			// On Andrdoid 10 a new auto-suggestion popup is appearing to let the user paste text recently put in the clipboard. Let's dismiss it.
			await editorPage.dismissAndroidClipboardSmartSuggestion();
		}
		const paragraphBlockElement2 = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph,
			2
		);

		// Paste into second paragraph block.
		await tapPasteAboveElement( editorPage.driver, paragraphBlockElement2 );

		// Check styled text by verifying html contents.
		const html = await editorPage.getHtmlContent();

		expect( html.toLowerCase() ).toBe(
			testData.pasteHtmlTextResult.toLowerCase()
		);
	} );
} );
