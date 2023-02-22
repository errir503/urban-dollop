/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.use( {
	styleBook: async ( { page }, use ) => {
		await use( new StyleBook( { page } ) );
	},
} );

test.describe( 'Style Book', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.beforeEach( async ( { admin, editor, styleBook, page } ) => {
		await admin.visitSiteEditor();
		await editor.canvas.click( 'body' );
		await styleBook.open();
		await expect(
			page.locator( 'role=region[name="Style Book"i]' )
		).toBeVisible();
	} );

	test( 'should disable toolbar butons when open', async ( { page } ) => {
		await expect(
			page.locator( 'role=button[name="Toggle block inserter"i]' )
		).not.toBeVisible();
		await expect(
			page.locator( 'role=button[name="Tools"i]' )
		).not.toBeVisible();
		await expect(
			page.locator( 'role=button[name="Undo"i]' )
		).not.toBeVisible();
		await expect(
			page.locator( 'role=button[name="Redo"i]' )
		).not.toBeVisible();
		await expect(
			page.locator( 'role=button[name="Show template details"i]' )
		).not.toBeVisible();
		await expect(
			page.locator( 'role=button[name="View"i]' )
		).not.toBeVisible();
	} );

	test( 'should have tabs containing block examples', async ( { page } ) => {
		await expect( page.locator( 'role=tab[name="Text"i]' ) ).toBeVisible();
		await expect( page.locator( 'role=tab[name="Media"i]' ) ).toBeVisible();
		await expect(
			page.locator( 'role=tab[name="Design"i]' )
		).toBeVisible();
		await expect(
			page.locator( 'role=tab[name="Widgets"i]' )
		).toBeVisible();
		await expect( page.locator( 'role=tab[name="Theme"i]' ) ).toBeVisible();

		await expect(
			page.locator(
				'role=button[name="Open Headings styles in Styles panel"i]'
			)
		).toBeVisible();
		await expect(
			page.locator(
				'role=button[name="Open Paragraph styles in Styles panel"i]'
			)
		).toBeVisible();

		await page.click( 'role=tab[name="Media"i]' );

		await expect(
			page.locator(
				'role=button[name="Open Image styles in Styles panel"i]'
			)
		).toBeVisible();
		await expect(
			page.locator(
				'role=button[name="Open Gallery styles in Styles panel"i]'
			)
		).toBeVisible();
	} );

	test( 'should open correct Global Styles panel when example is clicked', async ( {
		page,
	} ) => {
		await page.click(
			'role=button[name="Open Headings styles in Styles panel"i]'
		);

		await expect(
			page.locator(
				'role=region[name="Editor settings"i] >> role=heading[name="Heading"i]'
			)
		).toBeVisible();
	} );

	test( 'should allow to return Global Styles root when example is clicked', async ( {
		page,
	} ) => {
		await page.click( 'role=button[name="Blocks styles"]' );
		await page.click( 'role=button[name="Heading block styles"]' );
		await page.click( 'role=button[name="Typography styles"]' );

		await page.click(
			'role=button[name="Open Quote styles in Styles panel"i]'
		);

		await page.click( 'role=button[name="Navigate to the previous view"]' );
		await page.click( 'role=button[name="Navigate to the previous view"]' );

		await expect(
			page.locator( 'role=button[name="Blocks styles"]' )
		).toBeVisible();
	} );

	test( 'should disappear when closed via click event or Escape key', async ( {
		page,
	} ) => {
		const styleBookRegion = page.getByRole( 'region', {
			name: 'Style Book',
		} );

		// Close Style Book via click event.
		await styleBookRegion
			.getByRole( 'button', { name: 'Close Style Book' } )
			.click();

		await expect(
			styleBookRegion,
			'should close when close button is clicked'
		).not.toBeVisible();

		// Open Style Book again.
		await page.getByRole( 'button', { name: 'Style Book' } ).click();
		await expect(
			styleBookRegion,
			'style book should be visible'
		).toBeVisible();

		// Close Style Book via Escape key.
		await page.keyboard.press( 'Escape' );
		await expect(
			styleBookRegion,
			'should close when Escape key is pressed'
		).not.toBeVisible();
	} );
} );

class StyleBook {
	constructor( { page } ) {
		this.page = page;
	}

	async disableWelcomeGuide() {
		// Turn off the welcome guide.
		await this.page.evaluate( () => {
			window.wp.data
				.dispatch( 'core/preferences' )
				.set( 'core/edit-site', 'welcomeGuideStyles', false );
		} );
	}

	async open() {
		await this.disableWelcomeGuide();
		await this.page.click( 'role=button[name="Styles"i]' );
		await this.page.click( 'role=button[name="Style Book"i]' );
	}
}
