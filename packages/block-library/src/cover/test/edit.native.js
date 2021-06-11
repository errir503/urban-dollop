/**
 * External dependencies
 */
import { AccessibilityInfo, Image } from 'react-native';
import { act, render, fireEvent } from '@testing-library/react-native';

/**
 * WordPress dependencies
 */
import { BottomSheetSettings, BlockEdit } from '@wordpress/block-editor';
import { SlotFillProvider } from '@wordpress/components';
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import {
	requestMediaPicker,
	requestMediaEditor,
} from '@wordpress/react-native-bridge';

/**
 * Internal dependencies
 */
import { IMAGE_BACKGROUND_TYPE } from '../shared';
import { metadata, settings, name } from '../index';

// Avoid errors due to mocked stylesheet files missing required selectors
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	withPreferredColorScheme: jest.fn( ( Component ) => ( props ) => (
		<Component
			{ ...props }
			preferredColorScheme={ {} }
			getStylesFromColorScheme={ jest.fn( () => ( {} ) ) }
		/>
	) ),
} ) );

// Simplified tree to render Cover edit within slot
const CoverEdit = ( props ) => (
	<SlotFillProvider>
		<BlockEdit isSelected name={ name } clientId={ 0 } { ...props } />
		<BottomSheetSettings isVisible />
	</SlotFillProvider>
);

const setAttributes = jest.fn();
const attributes = {
	backgroundType: IMAGE_BACKGROUND_TYPE,
	focalPoint: { x: '0.25', y: '0.75' },
	hasParallax: false,
	overlayColor: { color: '#000000' },
	url: 'mock-url',
};

const isScreenReaderEnabled = Promise.resolve( true );
beforeAll( () => {
	// Mock Image.getSize to avoid failed attempt to size non-existant image
	const getSizeSpy = jest.spyOn( Image, 'getSize' );
	getSizeSpy.mockImplementation( ( _url, callback ) => callback( 300, 200 ) );

	// Mock async native module to avoid act warning
	AccessibilityInfo.isScreenReaderEnabled = jest.fn(
		() => isScreenReaderEnabled
	);

	// Register required blocks
	registerBlockType( name, {
		...metadata,
		...settings,
	} );
	registerBlockType( 'core/paragraph', {
		category: 'text',
		title: 'Paragraph',
		edit: () => {},
		save: () => {},
	} );
} );

afterAll( () => {
	// Restore mocks
	Image.getSize.mockRestore();

	// Clean up registered blocks
	unregisterBlockType( name );
	unregisterBlockType( 'core/paragraph' );
} );

describe( 'when no media is attached', () => {
	it( 'adds an image or video', async () => {
		const { getByText, findByText } = render(
			<CoverEdit
				attributes={ {
					...attributes,
					url: undefined,
					backgroundType: undefined,
				} }
				setAttributes={ setAttributes }
			/>
		);
		fireEvent.press( getByText( 'Add image or video' ) );
		const mediaLibraryButton = await findByText(
			'WordPress Media Library'
		);
		fireEvent.press( mediaLibraryButton );

		expect( requestMediaPicker ).toHaveBeenCalled();
	} );
} );

describe( 'when an image is attached', () => {
	// The skipped tests below pass but are currently skipped because multiple
	// async findBy* queries currently cause errors in test output
	// https://git.io/JYYGE

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'edits the image', async () => {
		const { getByLabelText, findByText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByLabelText( 'Edit image' ) );
		const editButton = await findByText( 'Edit' );
		fireEvent.press( editButton );

		expect( requestMediaEditor ).toHaveBeenCalled();
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'replaces the image', async () => {
		const { getByLabelText, findByText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByLabelText( 'Edit image' ) );
		const replaceButton = await findByText( 'Replace' );
		fireEvent.press( replaceButton );
		const mediaLibraryButton = await findByText(
			'WordPress Media Library'
		);
		fireEvent.press( mediaLibraryButton );

		expect( requestMediaPicker ).toHaveBeenCalled();
	} );

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'clears the image within image edit button', async () => {
		const { getByLabelText, findAllByText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByLabelText( 'Edit image' ) );
		const clearMediaButton = await findAllByText( 'Clear Media' );
		fireEvent.press( clearMediaButton[ 0 ] );

		expect( setAttributes ).toHaveBeenCalledWith(
			expect.objectContaining( {
				focalPoint: undefined,
				hasParallax: undefined,
				id: undefined,
				url: undefined,
			} )
		);
	} );

	it( 'toggles a fixed background', async () => {
		const { getByText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByText( 'Fixed background' ) );

		expect( setAttributes ).toHaveBeenCalledWith(
			expect.objectContaining( {
				hasParallax: ! attributes.hasParallax,
			} )
		);
	} );

	it( 'edits the focal point with a slider', async () => {
		const { getByText, getByLabelText, getByTestId } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByText( 'Edit focal point' ) );
		fireEvent(
			getByTestId( 'Slider Y-Axis Position' ),
			'valueChange',
			'52'
		);
		fireEvent.press( getByLabelText( 'Apply' ) );

		expect( setAttributes ).toHaveBeenCalledWith(
			expect.objectContaining( {
				focalPoint: { ...attributes.focalPoint, y: '0.52' },
			} )
		);
	} );

	it( 'edits the focal point with a text input', async () => {
		const { getByText, getByLabelText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByText( 'Edit focal point' ) );
		fireEvent.press(
			getByText( ( attributes.focalPoint.x * 100 ).toString() )
		);
		fireEvent.changeText( getByLabelText( 'X-Axis Position' ), '99' );
		fireEvent.press( getByLabelText( 'Apply' ) );

		expect( setAttributes ).toHaveBeenCalledWith(
			expect.objectContaining( {
				focalPoint: { ...attributes.focalPoint, x: '0.99' },
			} )
		);
	} );

	it( 'discards canceled focal point changes', async () => {
		const { getByText, getByLabelText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByText( 'Edit focal point' ) );
		fireEvent.press(
			getByText( ( attributes.focalPoint.x * 100 ).toString() )
		);
		fireEvent.changeText( getByLabelText( 'X-Axis Position' ), '80' );
		fireEvent.press( getByLabelText( 'Go back' ) );

		expect( setAttributes ).not.toHaveBeenCalledWith(
			expect.objectContaining( {
				focalPoint: { ...attributes.focalPoint, x: '0.80' },
			} )
		);
	} );

	it( 'clears the media within cell button', async () => {
		const { getByText } = render(
			<CoverEdit
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
		// Await async update to component state to avoid act warning
		await act( () => isScreenReaderEnabled );
		fireEvent.press( getByText( 'Clear Media' ) );

		expect( setAttributes ).toHaveBeenCalledWith(
			expect.objectContaining( {
				focalPoint: undefined,
				hasParallax: undefined,
				id: undefined,
				url: undefined,
			} )
		);
	} );
} );
