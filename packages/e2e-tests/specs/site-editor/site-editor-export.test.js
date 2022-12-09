/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WordPress dependencies
 */
import {
	deleteAllTemplates,
	activateTheme,
	visitSiteEditor,
	enterEditMode,
	clickOnMoreMenuItem,
} from '@wordpress/e2e-test-utils';

async function waitForFileExists( filePath, timeout = 10000 ) {
	const start = Date.now();
	while ( ! fs.existsSync( filePath ) ) {
		// Puppeteer doesn't have an API for managing file downloads.
		// We are using `waitForTimeout` to add delays between check of file existence.
		// eslint-disable-next-line no-restricted-syntax
		await page.waitForTimeout( 1000 );
		if ( Date.now() - start > timeout ) {
			throw Error( 'waitForFileExists timeout' );
		}
	}
}

describe( 'Site Editor Templates Export', () => {
	beforeAll( async () => {
		await activateTheme( 'emptytheme' );
		await deleteAllTemplates( 'wp_template' );
		await deleteAllTemplates( 'wp_template_part' );
	} );

	afterAll( async () => {
		await activateTheme( 'twentytwentyone' );
	} );

	beforeEach( async () => {
		await visitSiteEditor();
		await enterEditMode();
	} );

	it( 'clicking export should download emptytheme.zip file', async () => {
		const directory = fs.mkdtempSync(
			path.join( os.tmpdir(), 'test-edit-site-export-' )
		);
		await page._client.send( 'Page.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath: directory,
		} );

		await clickOnMoreMenuItem( 'Export', 'site-editor' );
		const filePath = path.join( directory, 'emptytheme.zip' );
		await waitForFileExists( filePath );
		expect( fs.existsSync( filePath ) ).toBe( true );
		fs.unlinkSync( filePath );
	} );
} );
