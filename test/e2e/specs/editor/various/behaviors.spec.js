/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.use( {
	behaviorUtils: async ( { page, requestUtils }, use ) => {
		await use( new BehaviorUtils( { page, requestUtils } ) );
	},
} );

const filename = '1024x768_e2e_test_image_size.jpeg';

test.describe( 'Testing behaviors functionality', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
		await requestUtils.deleteAllPosts();
	} );
	test.beforeEach( async ( { admin, page, requestUtils } ) => {
		await requestUtils.deleteAllMedia();
		await admin.visitAdminPage(
			'/admin.php',
			'page=gutenberg-experiments'
		);

		await page
			.locator( `#gutenberg-interactivity-api-core-blocks` )
			.setChecked( true );
		await page.locator( `input[name="submit"]` ).click();
		await page.waitForLoadState();
	} );

	test.afterEach( async ( { admin, page, requestUtils } ) => {
		await requestUtils.deleteAllMedia();
		await admin.visitAdminPage(
			'/admin.php',
			'page=gutenberg-experiments'
		);

		await page
			.locator( `#gutenberg-interactivity-api-core-blocks` )
			.setChecked( false );
		await page.locator( `input[name="submit"]` ).click();
		await page.waitForLoadState();
	} );

	test( '`No Behaviors` should be the default as defined in the core theme.json', async ( {
		admin,
		editor,
		requestUtils,
		page,
		behaviorUtils,
	} ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
		await admin.createNewPost();
		const media = await behaviorUtils.createMedia();
		await editor.insertBlock( {
			name: 'core/image',
			attributes: {
				alt: filename,
				id: media.id,
				url: media.source_url,
			},
		} );

		await editor.openDocumentSettingsSidebar();
		const editorSettings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await editorSettings
			.getByRole( 'button', { name: 'Advanced' } )
			.click();
		const select = editorSettings.getByRole( 'combobox', {
			name: 'Behavior',
		} );

		// By default, no behaviors should be selected.
		await expect( select ).toHaveValue( '' );

		// By default, you should be able to select the Lightbox behavior.
		await expect( select.getByRole( 'option' ) ).toHaveCount( 2 );
	} );

	test( 'Behaviors UI can be disabled in the `theme.json`', async ( {
		admin,
		editor,
		requestUtils,
		page,
		behaviorUtils,
	} ) => {
		// { "lightbox": true } is the default behavior setting, so we activate the
		// `behaviors-ui-disabled` theme where it is disabled by default. Change if we change
		// the default value in the core theme.json file.
		await requestUtils.activateTheme( 'behaviors-ui-disabled' );
		await admin.createNewPost();
		const media = await behaviorUtils.createMedia();

		await editor.insertBlock( {
			name: 'core/image',
			attributes: {
				alt: filename,
				id: media.id,
				url: media.source_url,
			},
		} );

		await editor.openDocumentSettingsSidebar();
		const editorSettings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await editorSettings
			.getByRole( 'button', { name: 'Advanced' } )
			.click();

		// No behaviors dropdown should be present.
		await expect(
			editorSettings.getByRole( 'combobox', {
				name: 'Behavior',
			} )
		).toBeHidden();
	} );

	test( "Block's value for behaviors takes precedence over the theme's value", async ( {
		admin,
		editor,
		requestUtils,
		page,
		behaviorUtils,
	} ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
		await admin.createNewPost();
		const media = await behaviorUtils.createMedia();

		await editor.insertBlock( {
			name: 'core/image',
			attributes: {
				alt: filename,
				id: media.id,
				url: media.source_url,
				// Explicitly set the value for behaviors to true.
				behaviors: { lightbox: true },
			},
		} );

		await editor.openDocumentSettingsSidebar();
		const editorSettings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await editorSettings
			.getByRole( 'button', { name: 'Advanced' } )
			.click();
		const select = editorSettings.getByRole( 'combobox', {
			name: 'Behavior',
		} );

		// The lightbox should be selected because the value from the block's
		// attributes takes precedence over the theme's value.
		await expect( select ).toHaveValue( 'lightbox' );

		// There should be 2 options available: `No behaviors` and `Lightbox`.
		await expect( select.getByRole( 'option' ) ).toHaveCount( 2 );

		// We can change the value of the behaviors dropdown to `No behaviors`.
		await select.selectOption( { label: 'No behaviors' } );
		await expect( select ).toHaveValue( '' );

		// Here we should also check that the block renders on the frontend with the
		// lightbox even though the theme.json has it set to false.
	} );

	test( 'You can set the default value for the behaviors in the theme.json', async ( {
		admin,
		editor,
		requestUtils,
		page,
		behaviorUtils,
	} ) => {
		// In this theme, the default value for settings.behaviors.blocks.core/image.lightbox is `true`.
		await requestUtils.activateTheme( 'behaviors-enabled' );
		await admin.createNewPost();
		const media = await behaviorUtils.createMedia();

		await editor.insertBlock( {
			name: 'core/image',
			attributes: {
				alt: filename,
				id: media.id,
				url: media.source_url,
			},
		} );

		await editor.openDocumentSettingsSidebar();
		const editorSettings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await editorSettings
			.getByRole( 'button', { name: 'Advanced' } )
			.click();
		const select = editorSettings.getByRole( 'combobox', {
			name: 'Behavior',
		} );

		// The behaviors dropdown should be present and the value should be set to
		// `lightbox`.
		await expect( select ).toHaveValue( 'lightbox' );

		// There should be 2 options available: `No behaviors` and `Lightbox`.
		await expect( select.getByRole( 'option' ) ).toHaveCount( 2 );

		// We can change the value of the behaviors dropdown to `No behaviors`.
		await select.selectOption( { label: 'No behaviors' } );
		await expect( select ).toHaveValue( '' );
	} );

	test( 'Lightbox behavior is disabled if the Image has a link', async ( {
		admin,
		editor,
		requestUtils,
		page,
		behaviorUtils,
	} ) => {
		// In this theme, the default value for settings.behaviors.blocks.core/image.lightbox is `true`.
		await requestUtils.activateTheme( 'behaviors-enabled' );
		await admin.createNewPost();
		const media = await behaviorUtils.createMedia();

		await editor.insertBlock( {
			name: 'core/image',
			attributes: {
				alt: filename,
				id: media.id,
				url: media.source_url,
				linkDestination: 'custom',
			},
		} );

		await editor.openDocumentSettingsSidebar();
		const editorSettings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await editorSettings
			.getByRole( 'button', { name: 'Advanced' } )
			.click();
		const select = editorSettings.getByRole( 'combobox', {
			name: 'Behavior',
		} );

		// The behaviors dropdown should be present but disabled.
		await expect( select ).toBeDisabled();
	} );
} );

class BehaviorUtils {
	constructor( { page, requestUtils } ) {
		this.page = page;
		this.requestUtils = requestUtils;

		this.TEST_IMAGE_FILE_PATH = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'assets',
			filename
		);
	}

	async createMedia() {
		const media = await this.requestUtils.uploadMedia(
			this.TEST_IMAGE_FILE_PATH
		);
		return media;
	}
}
