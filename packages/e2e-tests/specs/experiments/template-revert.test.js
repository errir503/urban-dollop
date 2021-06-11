/**
 * WordPress dependencies
 */
import {
	insertBlock,
	trashAllPosts,
	activateTheme,
	switchUserToAdmin,
	switchUserToTest,
	visitAdminPage,
} from '@wordpress/e2e-test-utils';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { siteEditor } from '../../experimental-features';

const { visit: visitSiteEditor, getEditedPostContent } = siteEditor;

const assertSaveButtonIsDisabled = () =>
	page.waitForSelector(
		'.edit-site-save-button__button[aria-disabled="true"]'
	);

const assertSaveButtonIsEnabled = () =>
	page.waitForSelector(
		'.edit-site-save-button__button[aria-disabled="false"]'
	);

const waitForNotice = () => page.waitForSelector( '.components-snackbar' );

const clickButtonInNotice = async () => {
	const selector = '.components-snackbar button';
	await page.waitForSelector( selector );
	await page.click( selector );
};

const clickUndoInHeaderToolbar = () =>
	page.click( '.edit-site-header__toolbar button[aria-label="Undo"]' );

const clickRedoInHeaderToolbar = () =>
	page.click( '.edit-site-header__toolbar button[aria-label="Redo"]' );

const undoRevertInHeaderToolbar = async () => {
	await clickUndoInHeaderToolbar();
	await assertSaveButtonIsEnabled();
};

const undoRevertInNotice = async () => {
	await clickButtonInNotice();
	await assertSaveButtonIsEnabled();
};

const addDummyText = async () => {
	await insertBlock( 'Paragraph' );
	await page.keyboard.type( 'Test' );
};

const save = async () => {
	await page.click( '.edit-site-save-button__button' );
	await page.click( '.editor-entities-saved-states__save-button' );
	await page.waitForSelector(
		'.edit-site-save-button__button:not(.is-busy)'
	);
};

const revertTemplate = async () => {
	await page.click( '.edit-site-document-actions__get-info' );
	await page.click( '.edit-site-template-details__revert button' );
	await waitForNotice();
	await assertSaveButtonIsEnabled();
};

const assertTemplatesAreDeleted = async () => {
	await switchUserToAdmin();
	const query = addQueryArgs( '', {
		post_type: 'wp_template',
	} ).slice( 1 );
	await visitAdminPage( 'edit.php', query );
	const element = await page.waitForSelector( '#the-list .no-items' );
	expect( element ).toBeTruthy();
	await switchUserToTest();
};

describe( 'Template Revert', () => {
	beforeAll( async () => {
		await activateTheme( 'tt1-blocks' );
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
	} );
	afterAll( async () => {
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
		await activateTheme( 'twentytwentyone' );
	} );
	beforeEach( async () => {
		await trashAllPosts( 'wp_template' );
		await visitSiteEditor();
	} );

	it( 'should delete the template after saving the reverted template', async () => {
		await addDummyText();
		await save();
		await revertTemplate();
		await save();

		await assertTemplatesAreDeleted();
	} );

	it( 'should show the original content after revert', async () => {
		const contentBefore = await getEditedPostContent();

		await addDummyText();
		await save();
		await revertTemplate();
		await save();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the original content after revert and page reload', async () => {
		const contentBefore = await getEditedPostContent();

		await addDummyText();
		await save();
		await revertTemplate();
		await save();
		await visitSiteEditor();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the edited content after revert and clicking undo in the header toolbar', async () => {
		await addDummyText();
		await save();
		const contentBefore = await getEditedPostContent();

		await revertTemplate();
		await save();
		await undoRevertInHeaderToolbar();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the edited content after revert and clicking undo in the notice', async () => {
		await addDummyText();
		await save();
		const contentBefore = await getEditedPostContent();

		await revertTemplate();
		await save();
		await undoRevertInNotice();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the original content after revert, clicking undo then redo in the header toolbar', async () => {
		const contentBefore = await getEditedPostContent();

		await addDummyText();
		await save();
		await revertTemplate();
		await save();
		await undoRevertInHeaderToolbar();
		await clickRedoInHeaderToolbar();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the original content after revert, clicking undo in the notice then undo in the header toolbar', async () => {
		const contentBefore = await getEditedPostContent();

		await addDummyText();
		await save();
		await revertTemplate();
		await save();
		await undoRevertInNotice();
		await undoRevertInHeaderToolbar();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the edited content after revert, clicking undo in the header toolbar, save and reload', async () => {
		await addDummyText();
		await save();
		const contentBefore = await getEditedPostContent();

		await revertTemplate();
		await save();
		await clickUndoInHeaderToolbar();
		await save();
		await assertSaveButtonIsDisabled();
		await visitSiteEditor();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );

	it( 'should show the edited content after revert, clicking undo in the notice and reload', async () => {
		await addDummyText();
		await save();
		const contentBefore = await getEditedPostContent();

		await revertTemplate();
		await save();
		await undoRevertInNotice();
		await save();
		await visitSiteEditor();

		const contentAfter = await getEditedPostContent();
		expect( contentBefore ).toBe( contentAfter );
	} );
} );
