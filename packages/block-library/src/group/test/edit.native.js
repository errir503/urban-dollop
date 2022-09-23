/**
 * External dependencies
 */
import {
	addBlock,
	fireEvent,
	getEditorHtml,
	initializeEditor,
	within,
	getBlock,
	waitFor,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

const NESTED_GROUP_BLOCK = `<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:image -->
<figure class="wp-block-image"><img alt=""/></figure>
<!-- /wp:image -->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->`;

beforeAll( () => {
	// Register all core blocks
	registerCoreBlocks();
} );

afterAll( () => {
	// Clean up registered blocks
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Group block', () => {
	it( 'inserts block and adds a Heading block as an inner block', async () => {
		const screen = await initializeEditor();
		const { getByTestId, getByText } = screen;

		// Add block
		await addBlock( screen, 'Group' );

		// Get block
		const groupBlock = await getBlock( screen, 'Group' );
		fireEvent.press( groupBlock );

		// Append a block in the Group block
		const appenderButton =
			within( groupBlock ).getByTestId( 'appender-button' );
		fireEvent.press( appenderButton );

		// Look for a block in the inserter
		const blockList = getByTestId( 'InserterUI-Blocks' );

		// onScroll event used to force the FlatList to render all items
		fireEvent.scroll( blockList, {
			nativeEvent: {
				contentOffset: { y: 0, x: 0 },
				contentSize: { width: 100, height: 100 },
				layoutMeasurement: { width: 100, height: 100 },
			},
		} );

		// Add a block
		fireEvent.press( await waitFor( () => getByText( 'Heading' ) ) );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'ungroups inner blocks', async () => {
		const screen = await initializeEditor( {
			initialHtml: NESTED_GROUP_BLOCK,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		let groupBlock = await getBlock( screen, 'Group' );
		fireEvent.press( groupBlock );

		// Get Ungroup button
		let ungroupButton = getByA11yLabel( /Ungroup/ );
		fireEvent.press( ungroupButton );

		// Press Group block again
		groupBlock = await getBlock( screen, 'Group', { rowIndex: 2 } );
		fireEvent.press( groupBlock );

		// Ungroup last block
		ungroupButton = getByA11yLabel( /Ungroup/ );
		fireEvent.press( ungroupButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
