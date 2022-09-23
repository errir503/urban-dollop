/**
 * External dependencies
 */
import {
	fireEvent,
	waitFor,
	getEditorHtml,
	within,
	getBlock,
	initializeEditor,
	changeTextOfRichText,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

// Mock debounce to prevent potentially belated state updates.
jest.mock( 'lodash', () => ( {
	...jest.requireActual( 'lodash' ),
	debounce: ( fn ) => {
		fn.cancel = jest.fn();
		return fn;
	},
} ) );

const BUTTONS_HTML = `<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button /--></div>
<!-- /wp:buttons -->`;

beforeAll( () => {
	// Register all core blocks.
	registerCoreBlocks();
} );

afterAll( () => {
	// Clean up registered blocks.
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Buttons block', () => {
	describe( 'when a button is shown', () => {
		it( 'adjusts the border radius', async () => {
			const initialHtml = `<!-- wp:buttons -->
			<div class="wp-block-buttons"><!-- wp:button {"style":{"border":{"radius":"5px"}}} -->
			<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" style="border-radius:5px" >Hello</a></div>
			<!-- /wp:button --></div>
			<!-- /wp:buttons -->`;
			const { getByA11yLabel } = await initializeEditor( {
				initialHtml,
			} );

			const buttonsBlock = await waitFor( () =>
				getByA11yLabel( /Buttons Block\. Row 1/ )
			);
			fireEvent.press( buttonsBlock );

			// onLayout event has to be explicitly dispatched in BlockList component,
			// otherwise the inner blocks are not rendered.
			const innerBlockListWrapper = await waitFor( () =>
				within( buttonsBlock ).getByTestId( 'block-list-wrapper' )
			);
			fireEvent( innerBlockListWrapper, 'layout', {
				nativeEvent: {
					layout: {
						width: 100,
					},
				},
			} );

			const buttonInnerBlock = await waitFor( () =>
				within( buttonsBlock ).getByA11yLabel( /Button Block\. Row 1/ )
			);
			fireEvent.press( buttonInnerBlock );

			const settingsButton = await waitFor( () =>
				getByA11yLabel( 'Open Settings' )
			);
			fireEvent.press( settingsButton );

			const radiusStepper = await waitFor( () =>
				getByA11yLabel( /Border Radius/ )
			);

			const incrementButton = await waitFor( () =>
				within( radiusStepper ).getByTestId( 'Increment' )
			);
			fireEvent( incrementButton, 'onPressIn' );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'adds another button using the inline appender', async () => {
			const screen = await initializeEditor( {
				initialHtml: BUTTONS_HTML,
			} );
			const { getByA11yLabel } = screen;

			// Get block
			const buttonsBlock = await getBlock( screen, 'Buttons' );

			// Trigger inner blocks layout
			const innerBlockListWrapper = await waitFor( () =>
				within( buttonsBlock ).getByTestId( 'block-list-wrapper' )
			);
			fireEvent( innerBlockListWrapper, 'layout', {
				nativeEvent: {
					layout: {
						width: 300,
					},
				},
			} );

			// Get inner button block
			const buttonBlock = await getBlock( screen, 'Button' );
			fireEvent.press( buttonBlock );

			// Add another Button using the inline appender
			const appenderButton =
				within( buttonsBlock ).getByTestId( 'appender-button' );
			fireEvent.press( appenderButton );

			// Check for new button
			const secondButtonBlock = await waitFor( () =>
				within( buttonsBlock ).getByA11yLabel( /Button Block\. Row 2/ )
			);
			expect( secondButtonBlock ).toBeVisible();

			// Add a Paragraph block using the empty placeholder at the bottom
			const paragraphPlaceholder = await waitFor( () =>
				getByA11yLabel( 'Add paragraph block' )
			);
			fireEvent.press( paragraphPlaceholder );

			// Check for inline appenders
			const appenderButtons =
				within( buttonsBlock ).queryAllByTestId( 'appender-button' );
			expect( appenderButtons.length ).toBe( 0 );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'adds another button using the inserter', async () => {
			const screen = await initializeEditor( {
				initialHtml: BUTTONS_HTML,
			} );
			const {
				getByA11yLabel,
				getByTestId,
				queryAllByA11yLabel,
				getByText,
			} = screen;

			// Get block
			const buttonsBlock = await getBlock( screen, 'Buttons' );
			fireEvent.press( buttonsBlock );

			// Trigger inner blocks layout
			const innerBlockListWrapper = await waitFor( () =>
				within( buttonsBlock ).getByTestId( 'block-list-wrapper' )
			);
			fireEvent( innerBlockListWrapper, 'layout', {
				nativeEvent: {
					layout: {
						width: 300,
					},
				},
			} );

			// Get inner button block
			const buttonBlock = await getBlock( screen, 'Button' );
			fireEvent.press( buttonBlock );

			// Open the block inserter
			fireEvent.press( getByA11yLabel( 'Add block' ) );

			const blockList = getByTestId( 'InserterUI-Blocks' );
			// onScroll event used to force the FlatList to render all items
			fireEvent.scroll( blockList, {
				nativeEvent: {
					contentOffset: { y: 0, x: 0 },
					contentSize: { width: 100, height: 100 },
					layoutMeasurement: { width: 100, height: 100 },
				},
			} );

			// Check the Add block here placeholder is not visible
			const addBlockHerePlaceholders =
				queryAllByA11yLabel( 'ADD BLOCK HERE' );
			expect( addBlockHerePlaceholders.length ).toBe( 0 );

			// Add a new Button block
			fireEvent.press( await waitFor( () => getByText( 'Button' ) ) );

			// Get new button
			const secondButtonBlock = await getBlock( screen, 'Button', {
				rowIndex: 2,
			} );
			const secondButtonInput =
				within( secondButtonBlock ).getByA11yLabel(
					'Text input. Empty'
				);
			changeTextOfRichText( secondButtonInput, 'Hello!' );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		describe( 'removing button along with buttons block', () => {
			it( 'removes the button and buttons block when deleting the block using the block delete action', async () => {
				const screen = await initializeEditor( {
					initialHtml: BUTTONS_HTML,
				} );
				const { getByA11yLabel } = screen;

				// Get block
				const buttonsBlock = await getBlock( screen, 'Buttons' );

				// Trigger inner blocks layout
				const innerBlockListWrapper = await waitFor( () =>
					within( buttonsBlock ).getByTestId( 'block-list-wrapper' )
				);
				fireEvent( innerBlockListWrapper, 'layout', {
					nativeEvent: {
						layout: {
							width: 300,
						},
					},
				} );

				// Get inner button block
				const buttonBlock = await getBlock( screen, 'Button' );
				fireEvent.press( buttonBlock );

				// Open block actions menu
				const blockActionsButton = getByA11yLabel(
					/Open Block Actions Menu/
				);
				fireEvent.press( blockActionsButton );

				// Delete block
				const deleteButton = getByA11yLabel( /Remove block/ );
				fireEvent.press( deleteButton );

				expect( getEditorHtml() ).toMatchSnapshot();
			} );
		} );
	} );

	describe( 'justify content', () => {
		[
			'Justify items left',
			'Justify items center',
			'Justify items right',
		].forEach( ( justificationOption ) =>
			it( `sets ${ justificationOption } option`, async () => {
				const initialHtml = `<!-- wp:buttons -->
				<div class="wp-block-buttons"><!-- wp:button /--></div>
				<!-- /wp:buttons -->`;
				const { getByA11yLabel, getByText } = await initializeEditor( {
					initialHtml,
				} );

				const block = await waitFor( () =>
					getByA11yLabel( /Buttons Block\. Row 1/ )
				);
				fireEvent.press( block );

				fireEvent.press(
					getByA11yLabel( 'Change items justification' )
				);

				// Select alignment option.
				fireEvent.press(
					await waitFor( () => getByText( justificationOption ) )
				);

				expect( getEditorHtml() ).toMatchSnapshot();
			} )
		);
	} );
} );
