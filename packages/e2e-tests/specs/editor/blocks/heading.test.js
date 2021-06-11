/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	createNewPost,
	getEditedPostContent,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

describe( 'Heading', () => {
	const CUSTOM_COLOR_TEXT = 'Custom color';
	const CUSTOM_COLOR_BUTTON_X_SELECTOR = `//button[contains(text(),'${ CUSTOM_COLOR_TEXT }')]`;
	const COLOR_INPUT_FIELD_SELECTOR =
		'.components-color-palette__picker .components-text-control__input';
	const COLOR_PANEL_TOGGLE_X_SELECTOR =
		"//button[./span[contains(text(),'Color')]]";

	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'can be created by prefixing number sign and a space', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '### 3' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by prefixing existing content with number signs and a space', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '4' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.type( '#### ' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should not work with the list input rule', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '## 1. H' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should work with the format input rules', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '## `code`' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should create a paragraph block above when pressing enter at the start', async () => {
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '## a' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'Enter' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should create a paragraph block below when pressing enter at the end', async () => {
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '## a' );
		await page.keyboard.press( 'Enter' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should correctly apply custom colors', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '### Heading' );
		const colorPanelToggle = await page.waitForXPath(
			COLOR_PANEL_TOGGLE_X_SELECTOR
		);
		await colorPanelToggle.click();

		const customTextColorButton = await page.waitForXPath(
			CUSTOM_COLOR_BUTTON_X_SELECTOR
		);

		await customTextColorButton.click();
		await page.waitForSelector( COLOR_INPUT_FIELD_SELECTOR );
		await page.click( COLOR_INPUT_FIELD_SELECTOR );
		await pressKeyWithModifier( 'primary', 'A' );
		await page.keyboard.type( '#7700ff' );
		await page.click( 'h3[data-type="core/heading"]' );
		await page.waitForSelector(
			'.component-color-indicator[aria-label="(Color: #7700ff)"]'
		);
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should correctly apply named colors', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '## Heading' );
		const [ colorPanelToggle ] = await page.$x(
			COLOR_PANEL_TOGGLE_X_SELECTOR
		);
		await colorPanelToggle.click();

		const colorButtonSelector = `//button[@aria-label='Color: Luminous vivid orange']`;
		const [ colorButton ] = await page.$x( colorButtonSelector );
		await colorButton.click();
		await page.click( 'h2[data-type="core/heading"]' );
		await page.waitForXPath(
			`${ colorButtonSelector }[@aria-pressed='true']`
		);
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
