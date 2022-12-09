/**
 * External dependencies
 */
import { fireEvent, initializeEditor, waitFor, within } from 'test/helpers';
/**
 * WordPress dependencies
 */
import { registerCoreBlocks } from '@wordpress/block-library';
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';

const unregisterBlocks = () => {
	const blocks = getBlockTypes();

	blocks.forEach( ( { name } ) => unregisterBlockType( name ) );
};

describe( '<SocialLinkEdit/>', () => {
	beforeAll( () => {
		registerCoreBlocks();
	} );

	afterAll( () => {
		unregisterBlocks();
	} );

	/**
	 * GIVEN an EDITOR is displayed;
	 * WHEN a SOCIAL ICONS BLOCK is selected from the BLOCK INSERTER;
	 */
	it( 'should display WORDPRESS, FACEBOOK, TWITTER, INSTAGRAM by default.', async () => {
		// Arrange
		const subject = await initializeEditor( {} );

		// Act
		fireEvent.press(
			await waitFor( () => subject.getByLabelText( 'Add block' ) )
		);
		fireEvent.changeText(
			await waitFor( () =>
				subject.getByPlaceholderText( 'Search blocks' )
			),
			'social icons'
		);
		fireEvent.press(
			await subject.findByLabelText( 'Social Icons block' )
		);
		const [ socialIconsBlock ] = subject.getAllByLabelText(
			/Social Icons Block. Row 1/
		);
		fireEvent(
			within( socialIconsBlock ).getByTestId( 'block-list-wrapper' ),
			'layout',
			{ nativeEvent: { layout: { width: 100 } } }
		);

		// Assert
		expect(
			await waitFor( () =>
				subject.getByLabelText( /WordPress social icon/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByLabelText( /Facebook social icon/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByLabelText( /Twitter social icon/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByLabelText( /Instagram social icon/ )
			)
		).toBeDefined();
	} );

	/**
	 * GIVEN an EDITOR is displayed;
	 * WHEN a SOCIAL ICONS BLOCK is selected from the BLOCK INSERTER;
	 */
	it( `should display WORDPRESS with a URL set by default
	     AND should display FACEBOOK, TWITTER, INSTAGRAM with NO URL set by default.`, async () => {
		// Arrange
		const subject = await initializeEditor( {} );

		// Act
		fireEvent.press(
			await waitFor( () => subject.getByLabelText( 'Add block' ) )
		);
		fireEvent.changeText(
			await waitFor( () =>
				subject.getByPlaceholderText( 'Search blocks' )
			),
			'social icons'
		);
		fireEvent.press(
			await subject.findByLabelText( 'Social Icons block' )
		);
		const [ socialIconsBlock ] = subject.getAllByLabelText(
			/Social Icons Block. Row 1/
		);
		fireEvent(
			within( socialIconsBlock ).getByTestId( 'block-list-wrapper' ),
			'layout',
			{ nativeEvent: { layout: { width: 100 } } }
		);

		// Assert
		expect(
			await waitFor( () =>
				subject.getByA11yHint( /WordPress has URL set/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByA11yHint( /Facebook has no URL set/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByA11yHint( /Twitter has no URL set/ )
			)
		).toBeDefined();
		expect(
			await waitFor( () =>
				subject.getByA11yHint( /Instagram has no URL set/ )
			)
		).toBeDefined();
	} );
} );
