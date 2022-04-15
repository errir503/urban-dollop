/**
 * External dependencies
 */
import { render, fireEvent, screen } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import { formatLowercase, formatUppercase } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ToggleGroupControl,
	ToggleGroupControlOption,
	ToggleGroupControlOptionIcon,
} from '../index';

describe( 'ToggleGroupControl', () => {
	const options = (
		<>
			<ToggleGroupControlOption value="rigas" label="R" />
			<ToggleGroupControlOption value="jack" label="J" />
		</>
	);
	const optionsWithTooltip = (
		<>
			<ToggleGroupControlOption
				value="gnocchi"
				label="Delicious Gnocchi"
				aria-label="Click for Delicious Gnocchi"
				showTooltip={ true }
			/>
			<ToggleGroupControlOption
				value="caponata"
				label="Sumptuous Caponata"
				aria-label="Click for Sumptuous Caponata"
			/>
		</>
	);

	describe( 'should render correctly', () => {
		it( 'with text options', () => {
			const { container } = render(
				<ToggleGroupControl label="Test Toggle Group Control">
					{ options }
				</ToggleGroupControl>
			);

			expect( container.firstChild ).toMatchSnapshot();
		} );
		it( 'with icons', () => {
			const { container } = render(
				<ToggleGroupControl
					value="uppercase"
					label="Test Toggle Group Control"
				>
					<ToggleGroupControlOptionIcon
						value="uppercase"
						icon={ formatUppercase }
						showTooltip={ true }
						aria-label="Uppercase"
					/>
					<ToggleGroupControlOptionIcon
						value="lowercase"
						icon={ formatLowercase }
						showTooltip={ true }
						aria-label="Lowercase"
					/>
				</ToggleGroupControl>
			);

			expect( container.firstChild ).toMatchSnapshot();
		} );
	} );
	it( 'should call onChange with proper value', () => {
		const mockOnChange = jest.fn();

		render(
			<ToggleGroupControl
				value="jack"
				onChange={ mockOnChange }
				label="Test Toggle Group Control"
			>
				{ options }
			</ToggleGroupControl>
		);

		const firstRadio = screen.getByRole( 'radio', { name: 'R' } );

		fireEvent.click( firstRadio );

		expect( mockOnChange ).toHaveBeenCalledWith( 'rigas' );
	} );
	it( 'should render tooltip where `showTooltip` === `true`', () => {
		render(
			<ToggleGroupControl label="Test Toggle Group Control">
				{ optionsWithTooltip }
			</ToggleGroupControl>
		);

		const firstRadio = screen.getByLabelText(
			'Click for Delicious Gnocchi'
		);

		fireEvent.focus( firstRadio );

		expect(
			screen.getByText( 'Click for Delicious Gnocchi' )
		).toBeInTheDocument();
	} );

	it( 'should not render tooltip', () => {
		render(
			<ToggleGroupControl label="Test Toggle Group Control">
				{ optionsWithTooltip }
			</ToggleGroupControl>
		);

		const secondRadio = screen.getByLabelText(
			'Click for Sumptuous Caponata'
		);

		fireEvent.focus( secondRadio );

		expect(
			screen.queryByText( 'Click for Sumptuous Caponata' )
		).not.toBeInTheDocument();
	} );
} );
