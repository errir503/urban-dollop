/**
 * WordPress dependencies
 */
import {
	clickButton,
	clickOnMoreMenuItem,
	createJSONResponse,
	createNewPost,
	createMenu as createClassicMenu,
	deleteAllMenus as deleteAllClassicMenus,
	insertBlock,
	setUpResponseMocking,
	pressKeyWithModifier,
	saveDraft,
	showBlockToolbar,
	openPreviewPage,
	ensureSidebarOpened,
	__experimentalRest as rest,
	publishPost,
	createUser,
	loginUser,
	deleteUser,
	switchUserToAdmin,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import menuItemsFixture from '../fixtures/menu-items-request-fixture.json';

const POSTS_ENDPOINT = '/wp/v2/posts';
const PAGES_ENDPOINT = '/wp/v2/pages';
const NAVIGATION_MENUS_ENDPOINT = '/wp/v2/navigation';

async function mockSearchResponse( items ) {
	const mappedItems = items.map( ( { title, slug }, index ) => ( {
		id: index + 1,
		subtype: 'page',
		title,
		type: 'post',
		url: `https://this/is/a/test/search/${ slug }`,
	} ) );

	await setUpResponseMocking( [
		{
			match: ( request ) =>
				request.url().includes( `rest_route` ) &&
				request.url().includes( `search` ),
			onRequestMatch: createJSONResponse( mappedItems ),
		},
	] );
}

/**
 * Interacts with the LinkControl to perform a search and select a returned suggestion
 *
 * @param {Object} link       link object to be tested
 * @param {string} link.url   What will be typed in the search input
 * @param {string} link.label What the resulting label will be in the creating Link Block after the block is created.
 * @param {string} link.type  What kind of suggestion should be clicked, ie. 'url', 'create', or 'entity'
 */
async function updateActiveNavigationLink( { url, label, type } ) {
	const typeClasses = {
		create: 'block-editor-link-control__search-create',
		entity: 'is-entity',
		url: 'is-url',
	};

	if ( url ) {
		const input = await page.waitForSelector(
			'input[placeholder="Search or type url"]'
		);
		await input.type( url );

		const suggestionPath = `//button[contains(@class, 'block-editor-link-control__search-item') and contains(@class, '${ typeClasses[ type ] }')]/span/span[@class='block-editor-link-control__search-item-title']/mark[text()="${ url }"]`;

		// Wait for the autocomplete suggestion item to appear.
		await page.waitForXPath( suggestionPath );
		// Set the suggestion
		const suggestion = await page.waitForXPath( suggestionPath );

		// Select it (so we're clicking the right one, even if it's further down the list)
		await suggestion.click();
	}

	if ( label ) {
		// Wait for rich text editor input to be focused before we start typing the label
		await page.waitForSelector( ':focus.rich-text' );

		// With https://github.com/WordPress/gutenberg/pull/19686, we're auto-selecting the label if the label is URL-ish.
		// In this case, it means we have to select and delete the label if it's _not_ the url.
		if ( label !== url ) {
			// Ideally this would be `await pressKeyWithModifier( 'primary', 'a' )`
			// to select all text like other tests do.
			// Unfortunately, these tests don't seem to pass on Travis CI when
			// using that approach, while using `Home` and `End` they do pass.
			await page.keyboard.press( 'Home' );
			await pressKeyWithModifier( 'shift', 'End' );
			await page.keyboard.press( 'Backspace' );
		}

		await page.keyboard.type( label );
	}
}

async function selectClassicMenu( optionText ) {
	const dropdown = await page.waitForXPath(
		"//*[contains(@class, 'wp-block-navigation-placeholder__actions__dropdown')]"
	);
	await dropdown.click();
	const theOption = await page.waitForXPath(
		`//*[contains(@class, 'components-menu-item__item')][ text()="${ optionText }" ]`
	);
	await theOption.click();
}

const PLACEHOLDER_ACTIONS_CLASS = 'wp-block-navigation-placeholder__actions';
const PLACEHOLDER_ACTIONS_XPATH = `//*[contains(@class, '${ PLACEHOLDER_ACTIONS_CLASS }')]`;
const START_EMPTY_XPATH = `${ PLACEHOLDER_ACTIONS_XPATH }//button[text()='Start empty']`;
const ADD_ALL_PAGES_XPATH = `${ PLACEHOLDER_ACTIONS_XPATH }//button[text()='Add all pages']`;
const SELECT_MENU_XPATH = `${ PLACEHOLDER_ACTIONS_XPATH }//button[text()='Select menu']`;

/**
 * Delete all items for the given REST resources using the REST API.
 *
 * @param {*} endpoints The endpoints of the resources to delete.
 */
async function deleteAll( endpoints ) {
	for ( const path of endpoints ) {
		const items = await rest( { path } );

		for ( const item of items ) {
			await rest( {
				method: 'DELETE',
				path: `${ path }/${ item.id }?force=true`,
			} );
		}
	}
}

/**
 * Create a set of pages using the REST API.
 *
 * @param {Array} pages An array of page objects.
 */
async function createPages( pages ) {
	for ( const page of pages ) {
		await rest( {
			method: 'POST',
			path: PAGES_ENDPOINT,
			data: {
				status: 'publish',
				...page,
			},
		} );
	}
}

/**
 * Replace unique ids in nav block content, since these won't be consistent
 * between test runs.
 *
 * @param {string} content HTML block content, either raw or rendered.
 *
 * @return {string} HTML block content with stripped ids
 */
function stripPageIds( content ) {
	return content
		.replace( /page_id=\d+/gm, 'page_id=[number]' )
		.replace( /"id":\d+/gm, '"id":[number]' );
}

/**
 * Check navigation block content by fetching the navigation menu.
 *
 * @return {string} Menu content.
 */
async function getNavigationMenuRawContent() {
	const menuRef = await page.evaluate( () => {
		const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
		const navigationBlock = blocks.find(
			( block ) => block.name === 'core/navigation'
		);

		return navigationBlock.attributes.ref;
	} );

	if ( ! menuRef ) {
		throw 'getNavigationMenuRawContent was unable to find a ref attribute on the first navigation block';
	}

	const response = await rest( {
		method: 'GET',
		path: `/wp/v2/navigation/${ menuRef }?context=edit`,
	} );

	return stripPageIds( response.content.raw );
}

// Disable reason - these tests are to be re-written.
// eslint-disable-next-line jest/no-disabled-tests
describe( 'Navigation', () => {
	beforeEach( async () => {
		await deleteAll( [
			POSTS_ENDPOINT,
			PAGES_ENDPOINT,
			NAVIGATION_MENUS_ENDPOINT,
		] );
		await deleteAllClassicMenus();
	} );

	afterEach( async () => {
		await setUpResponseMocking( [] );
	} );

	afterAll( async () => {
		await deleteAll( [
			POSTS_ENDPOINT,
			PAGES_ENDPOINT,
			NAVIGATION_MENUS_ENDPOINT,
		] );
		await deleteAllClassicMenus();
	} );

	describe( 'placeholder', () => {
		it( 'allows a navigation block to be created using existing pages', async () => {
			await createPages( [
				{
					title: 'About',
					menu_order: 0,
				},
				{
					title: 'Contact Us',
					menu_order: 1,
				},
				{
					title: 'FAQ',
					menu_order: 2,
				},
			] );

			await createNewPost();

			// Add the navigation block.
			await insertBlock( 'Navigation' );
			const allPagesButton = await page.waitForXPath(
				ADD_ALL_PAGES_XPATH
			);
			await allPagesButton.click();

			// Wait for the page list block to be present
			await page.waitForSelector( 'ul[aria-label="Block: Page List"]' );

			expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
		} );

		it( 'allows a navigation block to be created from existing menus', async () => {
			await createClassicMenu( { name: 'Test Menu 1' } );
			await createClassicMenu(
				{ name: 'Test Menu 2' },
				menuItemsFixture
			);

			await createNewPost();
			await insertBlock( 'Navigation' );
			await selectClassicMenu( 'Test Menu 2' );

			// Wait for a navigation link block before making assertion.
			await page.waitForSelector( '*[aria-label="Block: Custom Link"]' );
			expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
		} );

		it( 'creates an empty navigation block when the selected existing menu is also empty', async () => {
			await createClassicMenu( { name: 'Test Menu 1' } );
			await createNewPost();
			await insertBlock( 'Navigation' );
			await selectClassicMenu( 'Test Menu 1' );

			// Wait for the appender so that we know the navigation menu was created.
			await page.waitForSelector(
				'nav[aria-label="Block: Navigation"] button[aria-label="Add block"]'
			);
			expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
		} );

		it( 'does not display the options to create from pages or menus if there are none', async () => {
			await createNewPost();

			await insertBlock( 'Navigation' );
			await page.waitForXPath( START_EMPTY_XPATH );

			const placeholderActionsLength = await page.$$eval(
				`.${ PLACEHOLDER_ACTIONS_CLASS } button`,
				( els ) => els.length
			);

			// Should only be showing "Start empty".
			expect( placeholderActionsLength ).toEqual( 1 );
		} );
	} );

	it( 'allows an empty navigation block to be created and manually populated using a mixture of internal and external links', async () => {
		await createNewPost();
		await insertBlock( 'Navigation' );
		const startEmptyButton = await page.waitForXPath( START_EMPTY_XPATH );
		await startEmptyButton.click();

		const appender = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appender.click();

		// Add a link to the Link block.
		await updateActiveNavigationLink( {
			url: 'https://wordpress.org',
			label: 'WP',
			type: 'url',
		} );

		// Select the parent navigation block to show the appender.
		await showBlockToolbar();
		await page.click( 'button[aria-label="Select Navigation"]' );

		const appenderAgain = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appenderAgain.click();

		// After adding a new block, search input should be shown immediately.
		// Verify that Escape would close the popover.
		// Regression: https://github.com/WordPress/gutenberg/pull/19885
		// Wait for URL input to be focused
		await page.waitForSelector(
			'input.block-editor-url-input__input:focus'
		);

		// After adding a new block, search input should be shown immediately.
		const isInURLInput = await page.evaluate(
			() =>
				!! document.activeElement.matches(
					'input.block-editor-url-input__input'
				)
		);
		expect( isInURLInput ).toBe( true );
		await page.keyboard.press( 'Escape' );

		// Click the link placeholder.
		const placeholder = await page.waitForSelector(
			'.wp-block-navigation-link__placeholder'
		);
		await placeholder.click();

		// For the second nav link block use an existing internal page.
		// Mock the api response so that it's consistent.
		await mockSearchResponse( [
			{ title: 'Get in Touch', slug: 'get-in-touch' },
		] );

		// Add a link to the default Link block.
		await updateActiveNavigationLink( {
			url: 'Get in Touch',
			label: 'Contact',
			type: 'entity',
		} );

		await publishPost();

		// Expect a Navigation Block with two Links in the snapshot.
		expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
	} );

	it( 'encodes URL when create block if needed', async () => {
		await createNewPost();
		await insertBlock( 'Navigation' );
		const startEmptyButton = await page.waitForXPath( START_EMPTY_XPATH );
		await startEmptyButton.click();

		const appender = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appender.click();

		// Add a link to the Link block.
		await updateActiveNavigationLink( {
			url: 'https://wordpress.org/шеллы',
			type: 'url',
		} );

		await showBlockToolbar();
		await page.click( 'button[aria-label="Select Navigation"]' );

		const appenderAgain = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appenderAgain.click();

		// Wait for URL input to be focused
		await page.waitForSelector(
			'input.block-editor-url-input__input:focus'
		);

		// After adding a new block, search input should be shown immediately.
		const isInURLInput = await page.evaluate(
			() =>
				!! document.activeElement.matches(
					'input.block-editor-url-input__input'
				)
		);
		expect( isInURLInput ).toBe( true );
		await page.keyboard.press( 'Escape' );

		// Click the link placeholder
		const placeholder = await page.waitForSelector(
			'.wp-block-navigation-link__placeholder'
		);
		await placeholder.click();

		// Mocked response for internal page.
		// We are encoding the slug/url in order
		// that we can assert it is not double encoded by the block.
		await mockSearchResponse( [
			{ title: 'お問い合わせ', slug: encodeURI( 'お問い合わせ' ) },
		] );

		// Select the mocked internal page above.
		await updateActiveNavigationLink( {
			url: 'お問い合わせ',
			type: 'entity',
		} );

		await publishPost();

		// Expect a Navigation Block with two Links in the snapshot.
		// The 2nd link should not be double encoded.
		expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
	} );

	it( 'allows pages to be created from the navigation block and their links added to menu', async () => {
		// The URL Details endpoint 404s for the created page, since it will
		// be a draft that is inaccessible publicly. To avoid this we mock
		// out the endpoint response to be empty which will be handled gracefully
		// in the UI whilst avoiding any 404s.
		await setUpResponseMocking( [
			{
				match: ( request ) =>
					request.url().includes( `rest_route` ) &&
					request.url().includes( `url-details` ),
				onRequestMatch: createJSONResponse( [] ),
			},
		] );

		await createNewPost();
		await insertBlock( 'Navigation' );
		const startEmptyButton = await page.waitForXPath( START_EMPTY_XPATH );
		await startEmptyButton.click();
		const appender = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appender.click();

		// Wait for URL input to be focused
		// Insert name for the new page.
		const pageTitle = 'A really long page name that will not exist';
		const input = await page.waitForSelector(
			'input.block-editor-url-input__input:focus'
		);
		await input.type( pageTitle );

		// Wait for the create button to appear and click it.
		const createPageButton = await page.waitForSelector(
			'.block-editor-link-control__search-create'
		);
		await createPageButton.click();

		const draftLink = await page.waitForSelector(
			'.wp-block-navigation-item__content'
		);
		await draftLink.click();

		// Creating a draft is async, so wait for a sign of completion. In this
		// case the link that shows in the URL popover once a link is added.
		await page.waitForXPath(
			`//a[contains(@class, "block-editor-link-control__search-item-title") and contains(., "${ pageTitle }")]`
		);

		await publishPost();

		// Expect a Navigation Block with a link for "A really long page name that will not exist".
		expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
	} );

	it( 'renders buttons for the submenu opener elements when the block is set to open on click instead of hover', async () => {
		await createClassicMenu( { name: 'Test Menu 2' }, menuItemsFixture );
		await createNewPost();
		await insertBlock( 'Navigation' );
		await selectClassicMenu( 'Test Menu 2' );

		await ensureSidebarOpened();
		const openOnClickButton = await page.waitForXPath(
			'//label[contains(text(),"Open on click")]'
		);

		await openOnClickButton.click();

		await saveDraft();

		// Scope element selector to the Editor's "Content" region as otherwise it picks up on
		// block previews.
		const navSubmenuSelector =
			'[aria-label="Editor content"][role="region"] [aria-label="Block: Submenu"]';

		await page.waitForSelector( navSubmenuSelector );

		const navSubmenusLength = await page.$$eval(
			navSubmenuSelector,
			( els ) => els.length
		);

		const navButtonTogglesSelector =
			'[aria-label="Editor content"][role="region"] [aria-label="Block: Submenu"] button.wp-block-navigation-item__content';

		await page.waitForSelector( navButtonTogglesSelector );

		const navButtonTogglesLength = await page.$$eval(
			navButtonTogglesSelector,
			( els ) => els.length
		);

		// Assert the correct number of button toggles are present.
		expect( navSubmenusLength ).toEqual( navButtonTogglesLength );
	} );

	it( 'Shows the quick inserter when the block contains non-navigation specific blocks', async () => {
		await createNewPost();
		await insertBlock( 'Navigation' );
		const startEmptyButton = await page.waitForXPath( START_EMPTY_XPATH );
		await startEmptyButton.click();

		const appender = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appender.click();

		// Add a link to the Link block.
		await updateActiveNavigationLink( {
			url: 'https://wordpress.org',
			label: 'WP',
			type: 'url',
		} );

		// Now add a different block type.
		await insertBlock( 'Site Title' );

		await showBlockToolbar();
		await page.click( 'button[aria-label="Select Navigation"]' );
		const appenderAgain = await page.waitForSelector(
			'.wp-block-navigation .block-list-appender'
		);
		await appenderAgain.click();

		const quickInserter = await page.waitForSelector(
			'.block-editor-inserter__quick-inserter'
		);

		// Expect the quick inserter to be truthy, which it will be because we
		// waited for it. It's nice to end a test with an assertion though.
		expect( quickInserter ).toBeTruthy();
	} );

	it( 'supports navigation blocks that have inner blocks within their markup and converts them to wp_navigation posts', async () => {
		// Insert 'old-school' inner blocks via the code editor.
		await createNewPost();
		await clickOnMoreMenuItem( 'Code editor' );
		const codeEditorInput = await page.waitForSelector(
			'.editor-post-text-editor'
		);
		await codeEditorInput.click();
		const markup =
			'<!-- wp:navigation --><!-- wp:page-list /--><!-- /wp:navigation -->';
		await page.keyboard.type( markup );
		await clickButton( 'Exit code editor' );
		const navBlock = await page.waitForSelector(
			'nav[aria-label="Block: Navigation"]'
		);
		// Select the block to convert to a wp_navigation and publish.
		// The select menu button shows up when saving is complete.
		await navBlock.click();
		await page.waitForSelector( 'button[aria-label="Select Menu"]' );
		await publishPost();

		// Check that the wp_navigation post has the page list block.
		expect( await getNavigationMenuRawContent() ).toMatchSnapshot();
	} );

	describe( 'Creating and restarting', () => {
		const NAV_ENTITY_SELECTOR =
			'//div[@class="entities-saved-states__panel"]//label//strong[contains(text(), "Navigation")]';

		async function populateNavWithOneItem() {
			// Add a Link block first.
			const appender = await page.waitForSelector(
				'.wp-block-navigation .block-list-appender'
			);
			await appender.click();
			// Add a link to the Link block.
			await updateActiveNavigationLink( {
				url: 'https://wordpress.org',
				label: 'WP',
				type: 'url',
			} );
		}

		async function resetNavBlockToInitialState() {
			const selectMenuDropdown = await page.waitForSelector(
				'[aria-label="Select Menu"]'
			);
			await selectMenuDropdown.click();
			const newMenuButton = await page.waitForXPath(
				'//span[text()="Create new menu"]'
			);
			newMenuButton.click();
		}

		it( 'does not retain uncontrolled inner blocks when creating a new entity', async () => {
			await createNewPost();
			await clickOnMoreMenuItem( 'Code editor' );
			const codeEditorInput = await page.waitForSelector(
				'.editor-post-text-editor'
			);
			await codeEditorInput.click();
			const markup =
				'<!-- wp:navigation --><!-- wp:page-list /--><!-- /wp:navigation -->';
			await page.keyboard.type( markup );
			await clickButton( 'Exit code editor' );
			const navBlock = await page.waitForSelector(
				'nav[aria-label="Block: Navigation"]'
			);

			// Select the block to convert to a wp_navigation and publish.
			// The select menu button shows up when saving is complete.
			await navBlock.click();
			await page.waitForSelector( 'button[aria-label="Select Menu"]' );

			// Reset the nav block to create a new entity.
			await resetNavBlockToInitialState();
			const startEmptyButton = await page.waitForXPath(
				START_EMPTY_XPATH
			);
			await startEmptyButton.click();
			await populateNavWithOneItem();

			// Confirm that only the last menu entity was updated.
			const publishPanelButton2 = await page.waitForSelector(
				'.editor-post-publish-button__button:not([aria-disabled="true"])'
			);
			await publishPanelButton2.click();

			await page.waitForXPath( NAV_ENTITY_SELECTOR );
			expect( await page.$x( NAV_ENTITY_SELECTOR ) ).toHaveLength( 1 );
		} );

		it( 'only updates a single entity currently linked with the block', async () => {
			await createNewPost();
			await insertBlock( 'Navigation' );

			const startEmptyButton = await page.waitForXPath(
				START_EMPTY_XPATH
			);
			await startEmptyButton.click();
			await populateNavWithOneItem();

			// Confirm that the menu entity was updated.
			const publishPanelButton = await page.waitForSelector(
				'.editor-post-publish-panel__toggle:not([aria-disabled="true"])'
			);
			await publishPanelButton.click();

			await page.waitForXPath( NAV_ENTITY_SELECTOR );
			expect( await page.$x( NAV_ENTITY_SELECTOR ) ).toHaveLength( 1 );

			// Publish the post
			const entitySaveButton = await page.waitForSelector(
				'.editor-entities-saved-states__save-button'
			);
			await entitySaveButton.click();
			const publishButton = await page.waitForSelector(
				'.editor-post-publish-button:not([aria-disabled="true"])'
			);
			await publishButton.click();

			// A success notice should show up.
			await page.waitForSelector( '.components-snackbar' );

			// Now try inserting another Link block via the quick inserter.
			await page.click( 'nav[aria-label="Block: Navigation"]' );

			await resetNavBlockToInitialState();
			const startEmptyButton2 = await page.waitForXPath(
				START_EMPTY_XPATH
			);
			await startEmptyButton2.click();
			await populateNavWithOneItem();

			// Confirm that only the last menu entity was updated.
			const publishPanelButton2 = await page.waitForSelector(
				'.editor-post-publish-button__button:not([aria-disabled="true"])'
			);
			await publishPanelButton2.click();

			await page.waitForXPath( NAV_ENTITY_SELECTOR );
			expect( await page.$x( NAV_ENTITY_SELECTOR ) ).toHaveLength( 1 );
		} );
	} );

	it( 'does not load the frontend script if no navigation blocks are present', async () => {
		await createNewPost();
		await insertBlock( 'Paragraph' );
		await page.waitForSelector( 'p[data-title="Paragraph"]:focus' );
		await page.keyboard.type( 'Hello' );

		const previewPage = await openPreviewPage();
		await previewPage.bringToFront();
		await previewPage.waitForNetworkIdle();

		const isScriptLoaded = await previewPage.evaluate(
			() =>
				null !==
				document.querySelector(
					'script[src*="navigation/view.min.js"]'
				)
		);

		expect( isScriptLoaded ).toBe( false );
	} );

	it( 'loads the frontend script only once even when multiple navigation blocks are present', async () => {
		await createNewPost();
		await insertBlock( 'Navigation' );
		await insertBlock( 'Navigation' );

		const previewPage = await openPreviewPage();
		await previewPage.bringToFront();
		await previewPage.waitForNetworkIdle();

		const tagCount = await previewPage.evaluate(
			() =>
				document.querySelectorAll(
					'script[src*="navigation/view.min.js"]'
				).length
		);

		expect( tagCount ).toBe( 1 );
	} );

	describe( 'Permission based restrictions', () => {
		const contributorUsername = 'contributoruser';
		let contributorPassword;

		beforeAll( async () => {
			contributorPassword = await createUser( contributorUsername, {
				role: 'contributor',
			} );
		} );

		afterEach( async () => {
			await switchUserToAdmin();
		} );

		afterAll( async () => {
			await deleteUser( contributorUsername );
		} );

		it( 'shows a warning if user does not have permission to edit or update navigation menus', async () => {
			await createNewPost();
			await insertBlock( 'Navigation' );

			const startEmptyButton = await page.waitForXPath(
				START_EMPTY_XPATH
			);

			// This creates an empty Navigation post type entity.
			await startEmptyButton.click();

			// Publishing the Post ensures the Navigation entity is saved.
			// The Post itself is irrelevant.
			await publishPost();

			// Switch to a Contributor role user - they should not have
			// permission to update Navigation menus.
			await loginUser( contributorUsername, contributorPassword );

			await createNewPost();

			await insertBlock( 'Navigation' );

			// Select the Navigation post created by the Admin early
			// in the test.
			const navigationPostCreatedByAdminName = 'Navigation';
			const dropdown = await page.waitForXPath( SELECT_MENU_XPATH );
			await dropdown.click();
			const theOption = await page.waitForXPath(
				`//*[contains(@class, 'components-menu-item__item')][ text()="${ navigationPostCreatedByAdminName }" ]`
			);
			await theOption.click();

			// Make sure the snackbar error shows up
			await page.waitForXPath(
				`//*[contains(@class, 'components-snackbar__content')][ text()="You do not have permission to edit this Menu. Any changes made will not be saved." ]`
			);

			// Expect a console 403 for request to Navigation Areas for lower permission users.
			// This is because reading requires the `edit_theme_options` capability
			// which the Contributor level user does not have.
			// See: https://github.com/WordPress/gutenberg/blob/4cedaf0c4abb0aeac4bfd4289d63e9889efe9733/lib/class-wp-rest-block-navigation-areas-controller.php#L81-L91.
			// Todo: removed once Nav Areas are removed from the Gutenberg Plugin.
			expect( console ).toHaveErrored();
		} );

		it( 'shows a warning if user does not have permission to create navigation menus', async () => {
			const noticeText =
				'You do not have permission to create Navigation Menus.';
			// Switch to a Contributor role user - they should not have
			// permission to update Navigations.
			await loginUser( contributorUsername, contributorPassword );

			await createNewPost();
			await insertBlock( 'Navigation' );

			// Make sure the snackbar error shows up
			await page.waitForXPath(
				`//*[contains(@class, 'components-snackbar__content')][ text()="${ noticeText }" ]`
			);

			// Expect a console 403 for request to Navigation Areas for lower permission users.
			// This is because reading requires the `edit_theme_options` capability
			// which the Contributor level user does not have.
			// See: https://github.com/WordPress/gutenberg/blob/4cedaf0c4abb0aeac4bfd4289d63e9889efe9733/lib/class-wp-rest-block-navigation-areas-controller.php#L81-L91.
			// Todo: removed once Nav Areas are removed from the Gutenberg Plugin.
			expect( console ).toHaveErrored();
		} );
	} );
} );
