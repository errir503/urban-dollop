/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	createNewPost,
	deactivatePlugin,
	insertBlock,
	pressKeyWithModifier,
	searchForBlock,
	openDocumentSettingsSidebar,
} from '@wordpress/e2e-test-utils';

const INSERTER_BUTTON_SELECTOR =
	'.block-editor-inserter__main-area .block-editor-block-types-list__item';
const INSERTER_ICON_WRAPPER_SELECTOR = `${ INSERTER_BUTTON_SELECTOR } .block-editor-block-types-list__item-icon`;
const INSERTER_ICON_SELECTOR = `${ INSERTER_BUTTON_SELECTOR } .block-editor-block-icon`;
const INSPECTOR_ICON_SELECTOR = '.edit-post-sidebar .block-editor-block-icon';

async function getInnerHTML( selector ) {
	return await page.$eval( selector, ( element ) => element.innerHTML );
}

async function getBackgroundColor( selector ) {
	return await page.$eval( selector, ( element ) => {
		return window.getComputedStyle( element ).backgroundColor;
	} );
}

async function getColor( selector ) {
	return await page.$eval( selector, ( element ) => {
		return window.getComputedStyle( element ).color;
	} );
}

async function getFirstInserterIcon() {
	return await getInnerHTML( INSERTER_ICON_SELECTOR );
}

async function selectFirstBlock() {
	await pressKeyWithModifier( 'access', 'o' );
	const navButtons = await page.$$(
		'.block-editor-block-navigation-block-select-button'
	);
	await navButtons[ 0 ].click();
}

describe( 'Correctly Renders Block Icons on Inserter and Inspector', () => {
	const dashIconRegex = /<span.*?class=".*?dashicons-cart.*?">.*?<\/span>/;
	const circleString =
		'<circle cx="10" cy="10" r="10" fill="red" stroke="blue" stroke-width="10"></circle>';
	const svgIcon = new RegExp(
		`<svg.*?viewBox="0 0 20 20".*?>${ circleString }</svg>`
	);

	const validateSvgIcon = ( iconHtml ) => {
		expect( iconHtml ).toMatch( svgIcon );
	};

	const validateDashIcon = ( iconHtml ) => {
		expect( iconHtml ).toMatch( dashIconRegex );
	};

	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-block-icons' );
	} );

	beforeEach( async () => {
		await createNewPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-block-icons' );
	} );

	function testIconsOfBlock( blockName, blockTitle, validateIcon ) {
		it( 'Renders correctly the icon in the inserter', async () => {
			await searchForBlock( blockTitle );
			validateIcon( await getFirstInserterIcon() );
		} );

		it( 'Can insert the block', async () => {
			await insertBlock( blockTitle );
			expect(
				await getInnerHTML(
					`[data-type="${ blockName }"] [data-type="core/paragraph"]`
				)
			).toEqual( blockTitle );
		} );

		it( 'Renders correctly the icon on the inspector', async () => {
			await insertBlock( blockTitle );
			await openDocumentSettingsSidebar();
			await selectFirstBlock();
			validateIcon( await getInnerHTML( INSPECTOR_ICON_SELECTOR ) );
		} );
	}

	describe( 'Block with svg icon', () => {
		const blockName = 'test/test-single-svg-icon';
		const blockTitle = 'TestSimpleSvgIcon';
		testIconsOfBlock( blockName, blockTitle, validateSvgIcon );
	} );

	describe( 'Block with dash icon', () => {
		const blockName = 'test/test-dash-icon';
		const blockTitle = 'TestDashIcon';
		testIconsOfBlock( blockName, blockTitle, validateDashIcon );
	} );

	describe( 'Block with function icon', () => {
		const blockName = 'test/test-function-icon';
		const blockTitle = 'TestFunctionIcon';
		testIconsOfBlock( blockName, blockTitle, validateSvgIcon );
	} );

	describe( 'Block with dash icon and background and foreground colors', () => {
		const blockTitle = 'TestDashIconColors';
		it( 'Renders the icon in the inserter with the correct colors', async () => {
			await searchForBlock( blockTitle );
			validateDashIcon( await getFirstInserterIcon() );
			expect(
				await getBackgroundColor( INSERTER_ICON_WRAPPER_SELECTOR )
			).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual(
				'rgb(254, 0, 0)'
			);
		} );

		it( 'Renders the icon in the inspector with the correct colors', async () => {
			await insertBlock( blockTitle );
			await openDocumentSettingsSidebar();
			await selectFirstBlock();
			validateDashIcon( await getInnerHTML( INSPECTOR_ICON_SELECTOR ) );
			expect(
				await getBackgroundColor( INSPECTOR_ICON_SELECTOR )
			).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSPECTOR_ICON_SELECTOR ) ).toEqual(
				'rgb(254, 0, 0)'
			);
		} );
	} );

	describe( 'Block with svg icon and background color', () => {
		const blockTitle = 'TestSvgIconBackground';
		it( 'Renders the icon in the inserter with the correct background color and an automatically compute readable foreground color', async () => {
			await searchForBlock( blockTitle );
			validateSvgIcon( await getFirstInserterIcon() );
			expect(
				await getBackgroundColor( INSERTER_ICON_WRAPPER_SELECTOR )
			).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSERTER_ICON_WRAPPER_SELECTOR ) ).toEqual(
				'rgb(248, 249, 249)'
			);
		} );

		it( 'Renders correctly the icon on the inspector', async () => {
			await insertBlock( blockTitle );
			await openDocumentSettingsSidebar();
			await selectFirstBlock();
			validateSvgIcon( await getInnerHTML( INSPECTOR_ICON_SELECTOR ) );
			expect(
				await getBackgroundColor( INSPECTOR_ICON_SELECTOR )
			).toEqual( 'rgb(1, 0, 0)' );
			expect( await getColor( INSPECTOR_ICON_SELECTOR ) ).toEqual(
				'rgb(248, 249, 249)'
			);
		} );
	} );
} );
