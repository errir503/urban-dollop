/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Copy/cut/paste', () => {
	test( 'should copy blocks when non textual elements are focused  (image, spacer)', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		await pageUtils.insertBlock( { name: 'core/spacer' } );
		// At this point the spacer wrapper should be focused.
		await pageUtils.pressKeyWithModifier( 'primary', 'c' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();

		// The block appender is only visible when there's no selection.
		await page.evaluate( () => {
			window.wp.data.dispatch( 'core/block-editor' ).clearSelectedBlock();
		} );
		await page.click( 'role=button[name="Add default block"i]' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should cut and paste individual non textual blocks', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		await pageUtils.insertBlock( { name: 'core/spacer' } );
		// At this point the spacer wrapper should be focused.
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();

		// The block appender is only visible when there's no selection.
		await page.evaluate( () => {
			window.wp.data.dispatch( 'core/block-editor' ).clearSelectedBlock();
		} );
		await page.click( 'role=button[name="Add default block"i]' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should respect inline copy when text is selected', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		await page.click( 'role=button[name="Add default block"i]' );

		await page.keyboard.type( 'First block' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second block' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowLeft' );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowLeft' );

		await pageUtils.pressKeyWithModifier( 'primary', 'c' );
		await page.keyboard.press( 'ArrowRight' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();

		await page.keyboard.press( 'Enter' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should respect inline copy in places like input fields and textareas', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		await pageUtils.insertBlock( { name: 'core/shortcode' } );
		await page.keyboard.type( '[my-shortcode]' );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowLeft' );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowLeft' );

		await pageUtils.pressKeyWithModifier( 'primary', 'c' );
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.press( 'ArrowRight' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();

		await pageUtils.insertBlock( { name: 'core/paragraph' } );
		await page.keyboard.type( 'Pasted: ' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should handle paste events once', async ( { page, pageUtils } ) => {
		await pageUtils.createNewPost();

		// Add group block with paragraph.
		await pageUtils.insertBlock( {
			name: 'core/group',
			innerBlocks: [
				{
					name: 'core/paragraph',
					attributes: { content: 'P' },
				},
			],
		} );
		// Cut group.
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		expect( await pageUtils.getEditedPostContent() ).toBe( '' );

		await page.keyboard.press( 'Enter' );

		await page.evaluate( () => {
			window.e2eTestPasteOnce = [];
			let oldBlocks = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks();
			window.wp.data.subscribe( () => {
				const blocks = window.wp.data
					.select( 'core/block-editor' )
					.getBlocks();
				if ( blocks !== oldBlocks ) {
					window.e2eTestPasteOnce.push(
						blocks.map( ( { clientId, name } ) => ( {
							clientId,
							name,
						} ) )
					);
				}
				oldBlocks = blocks;
			} );
		} );

		// Paste.
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );

		// Blocks should only be modified once, not twice with new clientIds on a single paste action.
		const blocksUpdated = await page.evaluate(
			() => window.e2eTestPasteOnce
		);

		expect( blocksUpdated.length ).toEqual( 1 );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'can copy group onto non textual element (image, spacer)', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();

		// Add group block with paragraph.
		await pageUtils.insertBlock( {
			name: 'core/group',
			innerBlocks: [
				{
					name: 'core/paragraph',
					attributes: { content: 'P' },
				},
			],
		} );
		// Cut group.
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		expect( await pageUtils.getEditedPostContent() ).toBe( '' );

		// Insert a non textual element (a spacer)
		await pageUtils.insertBlock( { name: 'core/spacer' } );
		// Spacer is focused.
		await page.evaluate( () => {
			window.e2eTestPasteOnce = [];
			let oldBlocks = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks();
			window.wp.data.subscribe( () => {
				const blocks = window.wp.data
					.select( 'core/block-editor' )
					.getBlocks();
				if ( blocks !== oldBlocks ) {
					window.e2eTestPasteOnce.push(
						blocks.map( ( { clientId, name } ) => ( {
							clientId,
							name,
						} ) )
					);
				}
				oldBlocks = blocks;
			} );
		} );

		await pageUtils.pressKeyWithModifier( 'primary', 'v' );

		// Paste should be handled on non-textual elements and only handled once.
		const blocksUpdated = await page.evaluate(
			() => window.e2eTestPasteOnce
		);

		expect( blocksUpdated.length ).toEqual( 1 );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
	test( 'should copy only partial selection of text blocks', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'A block' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'B block' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
		// Partial select from both blocks.
		await pageUtils.pressKeyTimes( 'ArrowLeft', 5 );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'c' );
		await pageUtils.pressKeyWithModifier( 'primary', 'ArrowLeft' );
		// Create a new block at the top of the document to paste there.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
	test( 'should copy/paste partial selection with other blocks in-between', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'A block' );
		await pageUtils.insertBlock( { name: 'core/spacer' } );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'B block' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
		// Partial select from outer blocks.
		await pageUtils.pressKeyTimes( 'ArrowLeft', 5 );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'c' );
		await pageUtils.pressKeyWithModifier( 'primary', 'ArrowLeft' );
		// Create a new block at the top of the document to paste there.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
	test( 'should cut partial selection of text blocks', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'A block' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'B block' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
		// Partial select from both blocks.
		await pageUtils.pressKeyTimes( 'ArrowLeft', 5 );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		await pageUtils.pressKeyWithModifier( 'primary', 'ArrowLeft' );
		// Create a new block at the top of the document to paste there.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
	test( 'should cut/paste partial selection with other blocks in-between', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( 'A block' );
		await pageUtils.insertBlock( { name: 'core/spacer' } );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'B block' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
		// Partial select from outer blocks.
		await pageUtils.pressKeyTimes( 'ArrowLeft', 5 );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		await pageUtils.pressKeyWithModifier( 'primary', 'ArrowLeft' );
		// Create a new block at the top of the document to paste there.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
	test( 'should cut partial selection and merge like a normal `delete` - not forward ', async ( {
		page,
		pageUtils,
	} ) => {
		await pageUtils.createNewPost();
		await pageUtils.insertBlock( { name: 'core/heading' } );
		await page.keyboard.type( 'Heading' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Paragraph' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
		// Partial select from outer blocks.
		await pageUtils.pressKeyTimes( 'ArrowLeft', 2 );
		await pageUtils.pressKeyWithModifier( 'shift', 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'x' );
		await pageUtils.pressKeyWithModifier( 'primary', 'ArrowLeft' );
		// Create a new block at the top of the document to paste there.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'ArrowUp' );
		await pageUtils.pressKeyWithModifier( 'primary', 'v' );
		expect( await pageUtils.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
