/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * WordPress dependencies
 */
import { trashAllPosts, activateTheme } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import { siteEditor } from '../../experimental-features';

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
		await activateTheme( 'tt1-blocks' );
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
	} );

	afterAll( async () => {
		await activateTheme( 'twentytwentyone' );
	} );

	beforeEach( async () => {
		await siteEditor.visit();
	} );

	it( 'clicking export should download edit-site-export.zip file', async () => {
		const directory = fs.mkdtempSync(
			path.join( os.tmpdir(), 'test-edit-site-export-' )
		);
		await page._client.send( 'Page.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath: directory,
		} );

		await siteEditor.clickOnMoreMenuItem( 'Export' );
		const filePath = path.join( directory, 'edit-site-export.zip' );
		await waitForFileExists( filePath );
		expect( fs.existsSync( filePath ) ).toBe( true );
		fs.unlinkSync( filePath );
	} );
} );
