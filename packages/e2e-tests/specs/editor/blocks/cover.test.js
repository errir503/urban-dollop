/**
 * External dependencies
 */
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuid } from 'uuid';

/**
 * WordPress dependencies
 */
import {
	insertBlock,
	createNewPost,
	openDocumentSettingsSidebar,
	switchBlockInspectorTab,
	transformBlockTo,
} from '@wordpress/e2e-test-utils';

async function upload( selector ) {
	const inputElement = await page.waitForSelector(
		`${ selector } input[type="file"]`
	);
	const testImagePath = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'assets',
		'10x10_e2e_test_image_z9T8jK.png'
	);
	const filename = uuid();
	const tmpFileName = path.join( os.tmpdir(), filename + '.png' );
	fs.copyFileSync( testImagePath, tmpFileName );
	await inputElement.uploadFile( tmpFileName );
	await page.waitForSelector( `${ selector } img[src$="${ filename }.png"]` );
	return filename;
}

describe( 'Cover', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'can set background image using image upload on block placeholder', async () => {
		await insertBlock( 'Cover' );
		// Create the block using uploaded image.
		const sourceImageFilename = await upload( '.wp-block-cover' );
		// Get the block's background image URL.
		const blockImage = await page.waitForSelector( '.wp-block-cover img' );
		const blockImageUrl = await blockImage.evaluate( ( el ) => el.src );

		expect( blockImageUrl ).toContain( sourceImageFilename );
	} );

	it( 'dims background image down by 50% by default', async () => {
		await insertBlock( 'Cover' );
		// Create the block using uploaded image.
		await upload( '.wp-block-cover' );
		// Get the block's background dim color and its opacity.
		const backgroundDim = await page.waitForSelector(
			'.wp-block-cover .has-background-dim'
		);
		const [ backgroundDimColor, backgroundDimOpacity ] =
			await page.evaluate( ( el ) => {
				const computedStyle = window.getComputedStyle( el );
				return [ computedStyle.backgroundColor, computedStyle.opacity ];
			}, backgroundDim );

		expect( backgroundDimColor ).toBe( 'rgb(0, 0, 0)' );
		expect( backgroundDimOpacity ).toBe( '0.5' );
	} );

	it( 'can be resized using drag & drop', async () => {
		await insertBlock( 'Cover' );
		// Close the inserter.
		await page.click( '.edit-post-header-toolbar__inserter-toggle' );
		// Open the sidebar.
		await openDocumentSettingsSidebar();
		// Choose the first solid color as the background of the cover.
		await page.click(
			'.components-circular-option-picker__option-wrapper:first-child button'
		);

		// Select the cover block. By default the child paragraph gets selected.
		await page.click(
			'.edit-post-header-toolbar__document-overview-toggle'
		);
		await page.click(
			'.block-editor-list-view-block__contents-container a'
		);

		switchBlockInspectorTab( 'Styles' );
		const heightInputHandle = await page.waitForSelector(
			'input[id*="block-cover-height-input"]'
		);

		// Verify the height of the cover is not defined.
		expect(
			await page.evaluate( ( { value } ) => value, heightInputHandle )
		).toBe( '' );

		const resizeButton = await page.$(
			'.components-resizable-box__handle-bottom'
		);
		const boundingBoxResizeButton = await resizeButton.boundingBox();
		const coordinatesResizeButton = {
			x: boundingBoxResizeButton.x + boundingBoxResizeButton.width / 2,
			y: boundingBoxResizeButton.y + boundingBoxResizeButton.height / 2,
		};

		// Move the  mouse to the position of the resize button.
		await page.mouse.move(
			coordinatesResizeButton.x,
			coordinatesResizeButton.y
		);

		// Trigger a mousedown event against the resize button.
		// Using page.mouse.down does not works because it triggers a global event,
		// not an event for that element.
		page.evaluate( ( { x, y } ) => {
			const element = document.querySelector(
				'.components-resizable-box__handle-bottom'
			);
			event = document.createEvent( 'CustomEvent' );
			event.initCustomEvent( 'mousedown', true, true, null );
			event.clientX = x;
			event.clientY = y;
			element.dispatchEvent( event );
		}, coordinatesResizeButton );

		// Move the mouse to resize the cover.
		await page.mouse.move(
			coordinatesResizeButton.x,
			coordinatesResizeButton.y + 100,
			{ steps: 10 }
		);

		// Release the mouse.
		await page.mouse.up();

		// Verify the height of the cover has changed.
		expect(
			await page.evaluate(
				( { value } ) => Number.parseInt( value ),
				heightInputHandle
			)
		).toBeGreaterThan( 100 );
	} );

	it( 'dims the background image down by 50% when transformed from the Image block', async () => {
		await insertBlock( 'Image' );
		// Upload image and transform to the Cover block.
		const filename = await upload( '.wp-block-image' );
		await page.waitForSelector(
			`.wp-block-image img[src$="${ filename }.png"]`
		);

		// Focus the block wrapper before trying to convert to make sure figcaption toolbar is not obscuring
		// the block toolbar.
		await page.focus( '.wp-block-image' );
		await transformBlockTo( 'Cover' );

		// Get the block's background dim color and its opacity.
		const backgroundDim = await page.waitForSelector(
			'.wp-block-cover .has-background-dim'
		);
		const [ backgroundDimColor, backgroundDimOpacity ] =
			await page.evaluate( ( el ) => {
				const computedStyle = window.getComputedStyle( el );
				return [ computedStyle.backgroundColor, computedStyle.opacity ];
			}, backgroundDim );

		expect( backgroundDimColor ).toBe( 'rgb(0, 0, 0)' );
		expect( backgroundDimOpacity ).toBe( '0.5' );
	} );
} );
