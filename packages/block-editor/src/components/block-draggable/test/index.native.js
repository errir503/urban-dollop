/**
 * External dependencies
 */
import {
	fireEvent,
	getEditorHtml,
	within,
	waitForStoreResolvers,
	withReanimatedTimer,
} from 'test/helpers';
import { getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import TextInputState from 'react-native/Libraries/Components/TextInput/TextInputState';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/jest-console';

/**
 * Internal dependencies
 */
import {
	initializeWithBlocksLayouts,
	fireLongPress,
	firePanGesture,
	TouchEventType,
	getDraggableChip,
} from './helpers';

// Mock throttle to allow updating the dragging position on every "onDragOver" event.
jest.mock( 'lodash', () => ( {
	...jest.requireActual( 'lodash' ),
	throttle: ( fn ) => {
		fn.cancel = jest.fn();
		return fn;
	},
} ) );

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

const TOUCH_EVENT_ID = 1;
const BLOCKS = [
	{
		name: 'Paragraph',
		html: `
		<!-- wp:paragraph -->
		<p>This is a paragraph.</p>
		<!-- /wp:paragraph -->`,
		layout: { x: 0, y: 0, width: 100, height: 100 },
	},
	{
		name: 'Image',
		html: `
		<!-- wp:image {"sizeSlug":"large"} -->
		<figure class="wp-block-image size-large"><img src="https://cldup.com/cXyG__fTLN.jpg" alt=""/></figure>
		<!-- /wp:image -->`,
		layout: { x: 0, y: 100, width: 100, height: 100 },
	},
	{
		name: 'Spacer',
		html: `
		<!-- wp:spacer -->
		<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
		<!-- /wp:spacer -->`,
		layout: { x: 0, y: 200, width: 100, height: 100 },
	},
	{
		name: 'Gallery',
		html: `
		<!-- wp:gallery {"linkTo":"none"} -->
		<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://cldup.com/cXyG__fTLN.jpg" alt=""/></figure>
		<!-- /wp:image -->

		<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://cldup.com/cXyG__fTLN.jpg" alt=""/></figure>
		<!-- /wp:image --></figure>
		<!-- /wp:gallery -->`,
		layout: { x: 0, y: 300, width: 100, height: 100 },
		nestedBlocks: [
			{ name: 'Image', layout: { x: 0, y: 300, width: 50, height: 50 } },
			{ name: 'Image', layout: { x: 50, y: 300, width: 50, height: 50 } },
		],
	},
];

describe( 'BlockDraggable', () => {
	describe( 'drag mode', () => {
		describe( 'Text block', () => {
			it( 'enables drag mode when unselected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;

					// Start dragging from block's content
					fireLongPress(
						getByA11yLabel( /Paragraph Block\. Row 1/ ),
						'draggable-trigger-content'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();

					// "firePanGesture" finishes the dragging gesture
					firePanGesture(
						getByGestureTestId( 'block-draggable-wrapper' )
					);
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'enables drag mode when selected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;
					const blockDraggableWrapper = getByGestureTestId(
						'block-draggable-wrapper'
					);

					const paragraphBlock = getByA11yLabel(
						/Paragraph Block\. Row 1/
					);
					fireEvent.press( paragraphBlock );

					// Start dragging from block's content
					fireLongPress(
						paragraphBlock,
						'draggable-trigger-content'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();

					// Start dragging from block's mobile toolbar
					fireLongPress(
						paragraphBlock,
						'draggable-trigger-mobile-toolbar'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'does not enable drag mode when selected and editing text', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;

					const paragraphBlock = getByA11yLabel(
						/Paragraph Block\. Row 1/
					);

					// Select Paragraph block and start editing text
					fireEvent.press( paragraphBlock );
					fireEvent(
						within( paragraphBlock ).getByPlaceholderText(
							'Start writing…'
						),
						'focus'
					);

					// Start dragging from block's content
					fireLongPress(
						paragraphBlock,
						'draggable-trigger-content',
						{ failed: true }
					);
					expect( getDraggableChip( screen ) ).not.toBeDefined();
					// Check that no text input has been unfocused to confirm
					// that editing text is still enabled.
					expect(
						TextInputState.blurTextInput
					).not.toHaveBeenCalled();
				} ) );

			it( 'finishes editing text and enables drag mode when long-pressing over a different block', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;

					const paragraphBlock = getByA11yLabel(
						/Paragraph Block\. Row 1/
					);
					const spacerBlock =
						getByA11yLabel( /Spacer Block\. Row 3/ );

					// Select Paragraph block and start editing text
					fireEvent.press( paragraphBlock );
					fireEvent(
						within( paragraphBlock ).getByPlaceholderText(
							'Start writing…'
						),
						'focus'
					);

					// Start dragging from a different block's content
					fireLongPress( spacerBlock, 'draggable-trigger-content' );
					expect( getDraggableChip( screen ) ).toBeVisible();
					// Check that any text input has been unfocused to confirm
					// that editing text finished.
					expect( TextInputState.blurTextInput ).toHaveBeenCalled();
				} ) );
		} );

		describe( 'Media block', () => {
			it( 'enables drag mode when unselected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getAllByA11yLabel } = screen;

					// We select the first Image block as the Gallery block
					// also contains Image blocks.
					const imageBlock =
						getAllByA11yLabel( /Image Block\. Row 2/ )[ 0 ];
					// Start dragging from block's content
					fireLongPress( imageBlock, 'draggable-trigger-content' );
					expect( getDraggableChip( screen ) ).toBeVisible();

					// "firePanGesture" finishes the dragging gesture
					firePanGesture(
						getByGestureTestId( 'block-draggable-wrapper' )
					);
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'enables drag mode when selected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getAllByA11yLabel } = screen;
					const blockDraggableWrapper = getByGestureTestId(
						'block-draggable-wrapper'
					);

					// We select the first Image block as the Gallery block
					// also contains Image blocks.
					const imageBlock =
						getAllByA11yLabel( /Image Block\. Row 2/ )[ 0 ];
					fireEvent.press( imageBlock );

					// Start dragging from block's content
					fireLongPress( imageBlock, 'draggable-trigger-content' );
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();

					// Start dragging from block's mobile toolbar
					fireLongPress(
						imageBlock,
						'draggable-trigger-mobile-toolbar'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );
		} );

		describe( 'Nested block', () => {
			it( 'enables drag mode when unselected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;

					// Start dragging from block's content, specifically the first
					// trigger index, which corresponds to the Gallery block content.
					fireLongPress(
						getByA11yLabel( /Gallery Block\. Row 4/ ),
						'draggable-trigger-content',
						{ triggerIndex: 0 }
					);
					expect( getDraggableChip( screen ) ).toBeVisible();

					// "firePanGesture" finishes the dragging gesture
					firePanGesture(
						getByGestureTestId( 'block-draggable-wrapper' )
					);
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'enables drag mode when selected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;
					const blockDraggableWrapper = getByGestureTestId(
						'block-draggable-wrapper'
					);

					const galleryBlock = getByA11yLabel(
						/Gallery Block\. Row 4/
					);
					await waitForStoreResolvers( () =>
						fireEvent.press( galleryBlock )
					);

					// Start dragging from block's content, specifically the first
					// trigger index, which corresponds to the Gallery block content.
					fireLongPress( galleryBlock, 'draggable-trigger-content', {
						triggerIndex: 0,
					} );
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();

					// Start dragging from block's mobile toolbar
					fireLongPress(
						galleryBlock,
						'draggable-trigger-mobile-toolbar'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'enables drag mode when nested block is selected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;
					const blockDraggableWrapper = getByGestureTestId(
						'block-draggable-wrapper'
					);

					const galleryBlock = getByA11yLabel(
						/Gallery Block\. Row 4/
					);
					const galleryItem =
						within( galleryBlock ).getByA11yLabel(
							/Image Block\. Row 2/
						);
					fireEvent.press( galleryBlock );
					fireEvent.press( galleryItem );

					// Start dragging from nested block's content
					fireLongPress( galleryItem, 'draggable-trigger-content' );
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();

					// After dropping the block, the gallery item gets automatically selected.
					// Hence, we have to select the gallery item again.
					fireEvent.press( galleryItem );

					// Start dragging from nested block's mobile toolbar
					fireLongPress(
						galleryItem,
						'draggable-trigger-mobile-toolbar'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );
		} );

		describe( 'Other block', () => {
			it( 'enables drag mode when unselected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;

					// Start dragging from block's content
					fireLongPress(
						getByA11yLabel( /Spacer Block\. Row 3/ ),
						'draggable-trigger-content'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();

					// "firePanGesture" finishes the dragging gesture
					firePanGesture(
						getByGestureTestId( 'block-draggable-wrapper' )
					);
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );

			it( 'enables drag mode when selected', async () =>
				withReanimatedTimer( async () => {
					const screen = await initializeWithBlocksLayouts( BLOCKS );
					const { getByA11yLabel } = screen;
					const blockDraggableWrapper = getByGestureTestId(
						'block-draggable-wrapper'
					);

					const spacerBlock =
						getByA11yLabel( /Spacer Block\. Row 3/ );
					await waitForStoreResolvers( () =>
						fireEvent.press( spacerBlock )
					);

					// Start dragging from block's content
					fireLongPress( spacerBlock, 'draggable-trigger-content' );
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();

					// Start dragging from block's mobile toolbar
					fireLongPress(
						spacerBlock,
						'draggable-trigger-mobile-toolbar'
					);
					expect( getDraggableChip( screen ) ).toBeVisible();
					// "firePanGesture" finishes the dragging gesture
					firePanGesture( blockDraggableWrapper );
					expect( getDraggableChip( screen ) ).not.toBeDefined();
				} ) );
		} );
	} );

	it( 'moves blocks', async () =>
		withReanimatedTimer( async () => {
			const { getByA11yLabel } = await initializeWithBlocksLayouts(
				BLOCKS
			);
			const blockDraggableWrapper = getByGestureTestId(
				'block-draggable-wrapper'
			);

			expect( getEditorHtml() ).toMatchSnapshot( 'Initial order' );

			// Move Paragraph block from first to second position
			fireLongPress(
				getByA11yLabel( /Paragraph Block\. Row 1/ ),
				'draggable-trigger-content'
			);
			firePanGesture( blockDraggableWrapper, [
				{
					id: TOUCH_EVENT_ID,
					eventType: TouchEventType.TOUCHES_DOWN,
					x: 0,
					y: 0,
				},
				{
					id: TOUCH_EVENT_ID,
					eventType: TouchEventType.TOUCHES_MOVE,
					x: 0,
					// Dropping position is in the second half of the second block's height.
					y: 180,
				},
			] );
			// Draggable Pan gesture uses the Gesture state manager to manually
			// activate the gesture. Since this not available in tests, the library
			// displays a warning message.
			expect( console ).toHaveWarnedWith(
				'[react-native-gesture-handler] You have to use react-native-reanimated in order to control the state of the gesture.'
			);
			expect( getEditorHtml() ).toMatchSnapshot(
				'Paragraph block moved from first to second position'
			);

			// Move Spacer block from third to first position
			fireLongPress(
				getByA11yLabel( /Spacer Block\. Row 3/ ),
				'draggable-trigger-content'
			);
			firePanGesture( blockDraggableWrapper, [
				{
					id: TOUCH_EVENT_ID,
					eventType: TouchEventType.TOUCHES_DOWN,
					x: 0,
					y: 250,
				},
				{
					id: TOUCH_EVENT_ID,
					eventType: TouchEventType.TOUCHES_MOVE,
					x: 0,
					y: 0,
				},
			] );
			// Draggable Pan gesture uses the Gesture state manager to manually
			// activate the gesture. Since this not available in tests, the library
			// displays a warning message.
			expect( console ).toHaveWarnedWith(
				'[react-native-gesture-handler] You have to use react-native-reanimated in order to control the state of the gesture.'
			);
			expect( getEditorHtml() ).toMatchSnapshot(
				'Spacer block moved from third to first position'
			);
		} ) );
} );
