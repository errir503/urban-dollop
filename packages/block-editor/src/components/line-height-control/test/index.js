/**
 * External dependencies
 */
import { act, fireEvent, render, screen } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { UP, DOWN } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import LineHeightControl from '../';
import { BASE_DEFAULT_VALUE, SPIN_FACTOR, STEP } from '../utils';

const SPIN = STEP * SPIN_FACTOR;

const ControlledLineHeightControl = () => {
	const [ value, setValue ] = useState();
	return (
		<LineHeightControl
			value={ value }
			onChange={ setValue }
			__nextHasNoMarginBottom={ true }
		/>
	);
};

describe( 'LineHeightControl', () => {
	it( 'should immediately step up from the default value if up-arrowed from an unset state', () => {
		render( <ControlledLineHeightControl /> );
		const input = screen.getByRole( 'spinbutton' );
		act( () => input.focus() );
		fireEvent.keyDown( input, { keyCode: UP } );
		expect( input ).toHaveValue( BASE_DEFAULT_VALUE + SPIN );
	} );

	it( 'should immediately step down from the default value if down-arrowed from an unset state', () => {
		render( <ControlledLineHeightControl /> );
		const input = screen.getByRole( 'spinbutton' );
		act( () => input.focus() );
		fireEvent.keyDown( input, { keyCode: DOWN } );
		expect( input ).toHaveValue( BASE_DEFAULT_VALUE - SPIN );
	} );

	it( 'should immediately step up from the default value if spin button up was clicked from an unset state', () => {
		render( <ControlledLineHeightControl /> );
		const input = screen.getByRole( 'spinbutton' );
		act( () => input.focus() );
		fireEvent.change( input, { target: { value: 0.1 } } ); // simulates click on spin button up
		expect( input ).toHaveValue( BASE_DEFAULT_VALUE + SPIN );
	} );

	it( 'should immediately step down from the default value if spin button down was clicked from an unset state', () => {
		render( <ControlledLineHeightControl /> );
		const input = screen.getByRole( 'spinbutton' );
		act( () => input.focus() );
		fireEvent.change( input, { target: { value: 0 } } ); // simulates click on spin button down
		expect( input ).toHaveValue( BASE_DEFAULT_VALUE - SPIN );
	} );
} );
