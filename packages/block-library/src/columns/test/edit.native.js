/**
 * External dependencies
 */
import {
	addBlock,
	fireEvent,
	getEditorHtml,
	initializeEditor,
	openBlockSettings,
	within,
	getBlock,
	waitFor,
	dismissModal,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

const TWO_COLUMNS_BLOCK_HTML = `<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column -->
<!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->`;

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

describe( 'Columns block', () => {
	it( 'inserts block', async () => {
		const screen = await initializeEditor();

		// Add block
		await addBlock( screen, 'Columns' );

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		expect( columnsBlock ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'adds a column block using the appender', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Add a new column
		const appenderButton =
			within( columnsBlock ).getByTestId( 'appender-button' );
		fireEvent.press( appenderButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	describe( 'when using the number of columns setting', () => {
		it( 'adds a column block when incrementing the value', async () => {
			const screen = await initializeEditor( {
				initialHtml: TWO_COLUMNS_BLOCK_HTML,
			} );
			const { getByA11yLabel } = screen;

			// Get block
			const columnsBlock = await getBlock( screen, 'Columns' );
			fireEvent.press( columnsBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Update the number of columns by adding one
			const columnsControl = getByA11yLabel( /Number of columns/ );
			fireEvent( columnsControl, 'accessibilityAction', {
				nativeEvent: { actionName: 'increment' },
			} );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'removes a column block when decrementing the value', async () => {
			const screen = await initializeEditor( {
				initialHtml: TWO_COLUMNS_BLOCK_HTML,
			} );
			const { getByA11yLabel } = screen;

			// Wait for the block to be created.
			const columnsBlock = await getBlock( screen, 'Columns' );
			fireEvent.press( columnsBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Update the number of columns by removing one
			const columnsControl = getByA11yLabel( /Number of columns/ );
			fireEvent( columnsControl, 'accessibilityAction', {
				nativeEvent: { actionName: 'decrement' },
			} );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'reaches the minimum limit of number of column blocks', async () => {
			const screen = await initializeEditor();
			const { getByA11yLabel, getByTestId } = screen;

			// Add block
			await addBlock( screen, 'Columns' );

			// Wait for the variations modal to be visible
			await waitFor(
				() => getByTestId( 'block-variation-modal' ).props.isVisible
			);

			// Select a column variation
			const blockVariationModal = getByTestId( 'block-variation-modal' );
			await waitFor( () => blockVariationModal.props.isVisible );
			const threeColumnLayout =
				within( blockVariationModal ).getByA11yLabel(
					/33 \/ 33 \/ 33 block/
				);
			fireEvent.press( threeColumnLayout );

			// Get block
			const columnsBlock = await getBlock( screen, 'Columns' );
			fireEvent.press( columnsBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Update the number of columns by adding one
			const columnsControl = getByA11yLabel( /Number of columns/ );
			fireEvent( columnsControl, 'accessibilityAction', {
				nativeEvent: { actionName: 'increment' },
			} );

			// Press the decrement button 5 times to remove all columns but one
			for ( let index = 0; index < 5; index++ ) {
				fireEvent( columnsControl, 'accessibilityAction', {
					nativeEvent: { actionName: 'decrement' },
				} );
			}

			expect( getEditorHtml() ).toMatchSnapshot();
		} );
	} );

	it( 'removes column with the remove button', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Get the first column
		const firstColumnBlock = await getBlock( screen, 'Column' );
		fireEvent.press( firstColumnBlock );

		// Open block actions menu
		const blockActionsButton = getByA11yLabel( /Open Block Actions Menu/ );
		fireEvent.press( blockActionsButton );

		// Delete block
		const deleteButton = getByA11yLabel( /Remove block/ );
		fireEvent.press( deleteButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'removes the only one left Column with the remove button', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Get the first column
		const firstColumnBlock = await getBlock( screen, 'Column' );
		fireEvent.press( firstColumnBlock );

		// Open block actions menu
		let blockActionsButton = getByA11yLabel( /Open Block Actions Menu/ );
		fireEvent.press( blockActionsButton );

		// Delete block
		let deleteButton = getByA11yLabel( /Remove block/ );
		fireEvent.press( deleteButton );

		// Get the only left column
		const lastColumnBlock = await getBlock( screen, 'Column' );
		fireEvent.press( lastColumnBlock );

		// Open block actions menu
		blockActionsButton = getByA11yLabel( /Open Block Actions Menu/ );
		fireEvent.press( blockActionsButton );

		// Delete block
		deleteButton = getByA11yLabel( /Remove block/ );
		fireEvent.press( deleteButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'changes vertical alignment on Columns', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Open vertical alignment menu
		const verticalAlignmentButton = getByA11yLabel(
			/Change vertical alignment/
		);
		fireEvent.press( verticalAlignmentButton );

		// Get Align top button
		const verticalTopAlignmentButton = getByA11yLabel( /Align top/ );
		fireEvent.press( verticalTopAlignmentButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'changes the vertical alignment on individual Column', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Open vertical alignment menu
		const verticalAlignmentButton = getByA11yLabel(
			/Change vertical alignment/
		);
		fireEvent.press( verticalAlignmentButton );

		// Get Align top button
		const verticalTopAlignmentButton = getByA11yLabel( /Align top/ );
		fireEvent.press( verticalTopAlignmentButton );

		// Get the first column
		const firstColumnBlock = await getBlock( screen, 'Column' );
		fireEvent.press( firstColumnBlock );

		// Open vertical alignment menu
		fireEvent.press( verticalAlignmentButton );

		// Get Align bottom button
		const verticalBottomAlignmentButton = getByA11yLabel( /Align bottom/ );
		fireEvent.press( verticalBottomAlignmentButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'sets current vertical alignment on new Columns', async () => {
		const screen = await initializeEditor( {
			initialHtml: TWO_COLUMNS_BLOCK_HTML,
		} );
		const { getByA11yLabel } = screen;

		// Get block
		const columnsBlock = await getBlock( screen, 'Columns' );
		fireEvent.press( columnsBlock );

		// Open vertical alignment menu
		const verticalAlignmentButton = getByA11yLabel(
			/Change vertical alignment/
		);
		fireEvent.press( verticalAlignmentButton );

		// Get Align top button
		const verticalTopAlignmentButton = getByA11yLabel( /Align top/ );
		fireEvent.press( verticalTopAlignmentButton );

		// Add a new column
		const appenderButton =
			within( columnsBlock ).getByTestId( 'appender-button' );
		fireEvent.press( appenderButton );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	describe( 'when using columns percentage mechanism', () => {
		it( "updates the slider's input value", async () => {
			const screen = await initializeEditor();
			const { getByA11yLabel, getByTestId } = screen;

			// Add block
			await addBlock( screen, 'Columns' );

			// Wait for the variations modal to be visible
			await waitFor(
				() => getByTestId( 'block-variation-modal' ).props.isVisible
			);

			// Select a column variation
			const blockVariationModal = getByTestId( 'block-variation-modal' );
			await waitFor( () => blockVariationModal.props.isVisible );
			const threeColumnLayout =
				within( blockVariationModal ).getByA11yLabel(
					/33 \/ 33 \/ 33 block/
				);
			fireEvent.press( threeColumnLayout );

			// Get the first column
			const firstColumnBlock = await getBlock( screen, 'Column' );
			fireEvent.press( firstColumnBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Get width control
			const widthControl = getByA11yLabel( /Width. Value is/ );
			fireEvent.press( within( widthControl ).getByText( '33.3' ) );
			const widthTextInput =
				within( widthControl ).getByDisplayValue( '33.3' );
			fireEvent.changeText( widthTextInput, '55.55555' );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'sets custom values correctly', async () => {
			const screen = await initializeEditor( {
				initialHtml: TWO_COLUMNS_BLOCK_HTML,
			} );
			const { getByA11yLabel, getByTestId } = screen;

			// Get block
			const columnsBlock = await getBlock( screen, 'Columns' );
			fireEvent.press( columnsBlock );

			// Get the first column
			const firstColumnBlock = await getBlock( screen, 'Column' );
			fireEvent.press( firstColumnBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Set custom width value for the first column
			let widthControl = getByA11yLabel( /Width. Value is/ );
			fireEvent.press( within( widthControl ).getByText( '50' ) );
			let widthTextInput =
				within( widthControl ).getByDisplayValue( '50' );
			fireEvent.changeText( widthTextInput, '90' );

			// Dismiss settings
			await dismissModal( getByTestId( 'block-settings-modal' ) );

			// Get the Second column
			const secondColumnBlock = await getBlock( screen, 'Column', {
				rowIndex: 2,
			} );
			fireEvent.press( secondColumnBlock );

			// Open block settings
			await openBlockSettings( screen );

			// Set custom width value for the second column
			widthControl = getByA11yLabel( /Width. Value is/ );
			fireEvent.press( within( widthControl ).getByText( '50' ) );
			widthTextInput = within( widthControl ).getByDisplayValue( '50' );
			fireEvent.changeText( widthTextInput, '55.5' );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );
	} );

	describe( 'when using the columns layout picker', () => {
		const testData = [
			[ '100 block' ],
			[ '50 / 50 block' ],
			[ '33 / 66 block' ],
			[ '66 / 33 block' ],
			[ '33 / 33 / 33 block' ],
			[ '25 / 50 / 25 block' ],
		];

		test.each( testData )(
			'sets the predefined percentages for %s',
			async ( layout ) => {
				const screen = await initializeEditor();
				const { getByTestId } = screen;

				// Add block
				await addBlock( screen, 'Columns' );

				// Wait for the variations modal to be visible
				await waitFor(
					() => getByTestId( 'block-variation-modal' ).props.isVisible
				);

				// Select a column variation
				const blockVariationModal = getByTestId(
					'block-variation-modal'
				);
				await waitFor( () => blockVariationModal.props.isVisible );
				const columnLayout =
					within( blockVariationModal ).getByA11yLabel( layout );
				fireEvent.press( columnLayout );

				expect( getEditorHtml() ).toMatchSnapshot();
			}
		);
	} );
} );
