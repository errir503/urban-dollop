/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import TestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';

/**
 * Internal dependencies
 */
import URLInput from '../';
import URLInputButton from '../button';

import '../../../store';

describe( 'URLInputButton', () => {
	const clickEditLink = ( wrapper ) =>
		wrapper
			.find( 'ForwardRef(Button).components-toolbar__control' )
			.simulate( 'click' );

	it( 'should have a valid class name in the wrapper tag', () => {
		const wrapper = shallow( <URLInputButton /> );
		expect( wrapper.hasClass( 'block-editor-url-input__button' ) ).toBe(
			true
		);
	} );
	it( 'should have isPressed props set to false when url prop not defined', () => {
		const wrapper = shallow( <URLInputButton /> );
		expect( wrapper.find( 'ForwardRef(Button)' ).prop( 'isPressed' ) ).toBe(
			false
		);
	} );
	it( 'should have isPressed prop set to true if url prop defined', () => {
		const wrapper = shallow( <URLInputButton url="https://example.com" /> );
		expect( wrapper.find( 'ForwardRef(Button)' ).prop( 'isPressed' ) ).toBe(
			true
		);
	} );
	it( 'should have hidden form by default', () => {
		const wrapper = shallow( <URLInputButton /> );
		expect( wrapper.find( 'form' ) ).toHaveLength( 0 );
		expect( wrapper.state().expanded ).toBe( false );
	} );
	it( 'should have visible form when Edit Link button clicked', () => {
		const wrapper = shallow( <URLInputButton /> );
		clickEditLink( wrapper );
		expect( wrapper.find( 'form' ) ).toHaveLength( 1 );
		expect( wrapper.state().expanded ).toBe( true );
	} );
	it( 'should call onChange function once when value changes once', () => {
		const onChangeMock = jest.fn();
		const wrapper = shallow( <URLInputButton onChange={ onChangeMock } /> );
		clickEditLink( wrapper );
		wrapper.find( URLInput ).simulate( 'change' );
		expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
	} );
	it( 'should call onChange function twice when value changes twice', () => {
		const onChangeMock = jest.fn();
		const wrapper = shallow( <URLInputButton onChange={ onChangeMock } /> );
		clickEditLink( wrapper );
		wrapper.find( URLInput ).simulate( 'change' );
		wrapper.find( URLInput ).simulate( 'change' );
		expect( onChangeMock ).toHaveBeenCalledTimes( 2 );
	} );
	it( 'should close the form when user clicks Close button', () => {
		const wrapper = shallow( <URLInputButton /> );
		clickEditLink( wrapper );
		expect( wrapper.state().expanded ).toBe( true );
		wrapper.find( '.block-editor-url-input__back' ).simulate( 'click' );
		expect( wrapper.state().expanded ).toBe( false );
	} );
	it( 'should close the form when user submits it', () => {
		const wrapper = TestUtils.renderIntoDocument( <URLInputButton /> );
		const buttonElement = () =>
			TestUtils.scryRenderedDOMComponentsWithClass(
				wrapper,
				'components-toolbar__control'
			);
		const formElement = () =>
			TestUtils.scryRenderedDOMComponentsWithTag( wrapper, 'form' );
		TestUtils.Simulate.click( buttonElement().shift() );
		expect( wrapper.state.expanded ).toBe( true );
		TestUtils.Simulate.submit( formElement().shift() );
		expect( wrapper.state.expanded ).toBe( false );
		ReactDOM.unmountComponentAtNode(
			// eslint-disable-next-line react/no-find-dom-node
			ReactDOM.findDOMNode( wrapper ).parentNode
		);
	} );
} );
