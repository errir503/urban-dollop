/**
 * External dependencies
 */
import { mount, shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import ColorPalette from '../';

describe( 'ColorPalette', () => {
	const colors = [
		{ name: 'red', color: '#f00' },
		{ name: 'white', color: '#fff' },
		{ name: 'blue', color: '#00f' },
	];
	const currentColor = '#f00';
	const onChange = jest.fn();

	const wrapper = mount(
		<ColorPalette
			colors={ colors }
			value={ currentColor }
			onChange={ onChange }
		/>
	);
	const buttons = wrapper.find( 'Option button' );

	beforeEach( () => {
		onChange.mockClear();
	} );

	test( 'should render a dynamic toolbar of colors', () => {
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render three color button options', () => {
		expect( buttons ).toHaveLength( 3 );
	} );

	test( 'should call onClick on an active button with undefined', () => {
		const activeButton = buttons.findWhere( ( button ) =>
			button.hasClass( 'is-pressed' )
		);
		activeButton.simulate( 'click' );

		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( onChange ).toHaveBeenCalledWith( undefined );
	} );

	test( 'should call onClick on an inactive button', () => {
		const inactiveButton = buttons
			.findWhere( ( button ) => ! button.hasClass( 'is-pressed' ) )
			.first();
		inactiveButton.simulate( 'click' );

		expect( onChange ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should call onClick with undefined, when the clearButton onClick is triggered', () => {
		const clearButton = wrapper.find( 'ButtonAction button' );

		expect( clearButton ).toHaveLength( 1 );

		clearButton.simulate( 'click' );

		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( onChange ).toHaveBeenCalledWith( undefined );
	} );

	test( 'should allow disabling custom color picker', () => {
		expect(
			shallow(
				<ColorPalette
					colors={ colors }
					disableCustomColors={ true }
					value={ currentColor }
					onChange={ onChange }
				/>
			)
		).toMatchSnapshot();
	} );

	describe( 'Dropdown', () => {
		const dropdown = wrapper.find( 'Dropdown' );

		test( 'should render it correctly', () => {
			expect( dropdown ).toMatchSnapshot();
		} );

		describe( '.renderToggle', () => {
			const isOpen = true;
			const onToggle = jest.fn();

			const renderedToggleButton = mount(
				dropdown.props().renderToggle( { isOpen, onToggle } )
			);

			test( 'should render dropdown content', () => {
				expect( renderedToggleButton ).toMatchSnapshot();
			} );

			test( 'should call onToggle on click.', () => {
				renderedToggleButton.find( 'button' ).simulate( 'click' );

				expect( onToggle ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( '.renderContent', () => {
			const renderedContent = shallow( dropdown.props().renderContent() );

			test( 'should render dropdown content', () => {
				expect( renderedContent ).toMatchSnapshot();
			} );
		} );
	} );
} );
