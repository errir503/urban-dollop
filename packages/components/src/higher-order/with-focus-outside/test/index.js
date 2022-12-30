/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withFocusOutside from '../';

jest.useFakeTimers();

let onFocusOutside;

describe( 'withFocusOutside', () => {
	let origHasFocus;

	const EnhancedComponent = withFocusOutside(
		class extends Component {
			handleFocusOutside() {
				this.props.onFocusOutside();
			}

			render() {
				return (
					<div>
						<input type="text" />
						<input type="button" />
					</div>
				);
			}
		}
	);

	class TestComponent extends Component {
		render() {
			return <EnhancedComponent { ...this.props } />;
		}
	}

	beforeEach( () => {
		// Mock document.hasFocus() to always be true for testing
		// note: we overide this for some tests.
		origHasFocus = document.hasFocus;
		document.hasFocus = () => true;

		onFocusOutside = jest.fn();
	} );

	afterEach( () => {
		document.hasFocus = origHasFocus;
	} );

	it( 'should not call handler if focus shifts to element within component', () => {
		render( <TestComponent onFocusOutside={ onFocusOutside } /> );

		const input = screen.getByRole( 'textbox' );
		const button = screen.getByRole( 'button' );

		input.focus();
		input.blur();
		button.focus();

		jest.runAllTimers();

		expect( onFocusOutside ).not.toHaveBeenCalled();
	} );

	it( 'should not call handler if focus transitions via click to button', async () => {
		const user = userEvent.setup( {
			advanceTimers: jest.advanceTimersByTime,
		} );
		render( <TestComponent onFocusOutside={ onFocusOutside } /> );

		const input = screen.getByRole( 'textbox' );
		const button = screen.getByRole( 'button' );

		input.focus();
		await user.click( button );

		jest.runAllTimers();

		expect( onFocusOutside ).not.toHaveBeenCalled();
	} );

	it( 'should call handler if focus doesn’t shift to element within component', () => {
		render( <TestComponent onFocusOutside={ onFocusOutside } /> );

		const input = screen.getByRole( 'textbox' );
		input.focus();
		input.blur();

		jest.runAllTimers();

		expect( onFocusOutside ).toHaveBeenCalled();
	} );

	it( 'should not call handler if focus shifts outside the component when the document does not have focus', () => {
		render( <TestComponent onFocusOutside={ onFocusOutside } /> );

		// Force document.hasFocus() to return false to simulate the window/document losing focus
		// See https://developer.mozilla.org/en-US/docs/Web/API/Document/hasFocus.
		document.hasFocus = () => false;

		const input = screen.getByRole( 'textbox' );
		input.focus();
		input.blur();

		jest.runAllTimers();

		expect( onFocusOutside ).not.toHaveBeenCalled();
	} );

	it( 'should cancel check when unmounting while queued', () => {
		const { rerender } = render(
			<TestComponent onFocusOutside={ onFocusOutside } />
		);

		const input = screen.getByRole( 'textbox' );
		input.focus();
		input.blur();

		rerender( <div /> );

		jest.runAllTimers();

		expect( onFocusOutside ).not.toHaveBeenCalled();
	} );
} );
