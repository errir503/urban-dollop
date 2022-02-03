/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	fireEvent,
	waitFor,
	within,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

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

const GALLERY_WITH_ONE_IMAGE = `<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":1} -->
<figure class="wp-block-image"><img src="https://cldup.com/cXyG__fTLN.jpg" alt="" class="wp-image-1"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->`;

const addGalleryBlock = async () => {
	const screen = await initializeEditor();
	const { getByA11yLabel, getByTestId, getByText } = screen;

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

	fireEvent.press( await waitFor( () => getByText( 'Gallery' ) ) );

	return screen;
};

describe( 'Gallery block', () => {
	it( 'inserts block', async () => {
		const { getByA11yLabel } = await addGalleryBlock();

		const galleryBlock = await waitFor( () =>
			getByA11yLabel( /Gallery Block\. Row 1/ )
		);

		expect( galleryBlock ).toHaveProperty( 'type', 'View' );
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'selects a gallery item', async () => {
		const { getByA11yLabel } = await initializeEditor( {
			initialHtml: GALLERY_WITH_ONE_IMAGE,
		} );

		const galleryBlock = await waitFor( () =>
			getByA11yLabel( /Gallery Block\. Row 1/ )
		);
		fireEvent.press( galleryBlock );

		const innerBlockListWrapper = await waitFor( () =>
			within( galleryBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 100,
				},
			},
		} );

		const galleryItem = await waitFor( () =>
			getByA11yLabel( /Image Block\. Row 1/ )
		);
		fireEvent.press( galleryItem );

		expect( galleryItem ).toHaveProperty( 'type', 'View' );
	} );

	it( 'shows appender button when gallery has images', async () => {
		const { getByA11yLabel, getByText } = await initializeEditor( {
			initialHtml: GALLERY_WITH_ONE_IMAGE,
		} );

		const galleryBlock = await waitFor( () =>
			getByA11yLabel( /Gallery Block\. Row 1/ )
		);
		fireEvent.press( galleryBlock );

		const innerBlockListWrapper = await waitFor( () =>
			within( galleryBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 100,
				},
			},
		} );

		const appenderButton = await waitFor( () =>
			within( galleryBlock ).getByA11yLabel( /Gallery block\. Empty/ )
		);
		fireEvent.press( appenderButton );

		expect( getByText( 'Choose from device' ) ).toBeDefined();
		expect( getByText( 'Take a Photo' ) ).toBeDefined();
		expect( getByText( 'WordPress Media Library' ) ).toBeDefined();
	} );
} );
