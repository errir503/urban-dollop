/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { formatLowercase, formatUppercase } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../../button';
import {
	ToggleGroupControl,
	ToggleGroupControlOption,
	ToggleGroupControlOptionIcon,
} from '../index';
import type { ToggleGroupControlProps } from '../types';
import cleanupTooltip from '../../tooltip/test/utils';

const ControlledToggleGroupControl = ( {
	value: valueProp,
	onChange,
	...props
}: ToggleGroupControlProps ) => {
	const [ value, setValue ] = useState( valueProp );

	return (
		<>
			<ToggleGroupControl
				{ ...props }
				onChange={ ( ...changeArgs ) => {
					setValue( ...changeArgs );
					onChange?.( ...changeArgs );
				} }
				value={ value }
			/>
			<Button onClick={ () => setValue( undefined ) }>Reset</Button>
		</>
	);
};
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

describe.each( [
	[ 'uncontrolled', ToggleGroupControl ],
	[ 'controlled', ControlledToggleGroupControl ],
] )( 'ToggleGroupControl %s', ( ...modeAndComponent ) => {
	const [ mode, Component ] = modeAndComponent;

	describe( 'should render correctly', () => {
		it( 'with text options', () => {
			const { container } = render(
				<Component label="Test Toggle Group Control">
					{ options }
				</Component>
			);

			expect( container ).toMatchSnapshot();
		} );

		it( 'with icons', () => {
			const { container } = render(
				<Component value="uppercase" label="Test Toggle Group Control">
					<ToggleGroupControlOptionIcon
						value="uppercase"
						icon={ formatUppercase }
						label="Uppercase"
					/>
					<ToggleGroupControlOptionIcon
						value="lowercase"
						icon={ formatLowercase }
						label="Lowercase"
					/>
				</Component>
			);

			expect( container ).toMatchSnapshot();
		} );
	} );
	it( 'should call onChange with proper value', async () => {
		const user = userEvent.setup();
		const mockOnChange = jest.fn();

		render(
			<Component
				value="jack"
				onChange={ mockOnChange }
				label="Test Toggle Group Control"
			>
				{ options }
			</Component>
		);

		await user.click( screen.getByRole( 'radio', { name: 'R' } ) );

		expect( mockOnChange ).toHaveBeenCalledWith( 'rigas' );
	} );

	it( 'should render tooltip where `showTooltip` === `true`', async () => {
		const user = userEvent.setup();
		render(
			<Component label="Test Toggle Group Control">
				{ optionsWithTooltip }
			</Component>
		);

		const firstRadio = screen.getByLabelText(
			'Click for Delicious Gnocchi'
		);

		await user.hover( firstRadio );

		const tooltip = await screen.findByText(
			'Click for Delicious Gnocchi'
		);

		await waitFor( () => expect( tooltip ).toBeVisible() );

		await cleanupTooltip( user );
	} );

	it( 'should not render tooltip', async () => {
		const user = userEvent.setup();
		render(
			<Component label="Test Toggle Group Control">
				{ optionsWithTooltip }
			</Component>
		);

		const secondRadio = screen.getByLabelText(
			'Click for Sumptuous Caponata'
		);

		await user.hover( secondRadio );

		await waitFor( () =>
			expect(
				screen.queryByText( 'Click for Sumptuous Caponata' )
			).not.toBeInTheDocument()
		);
	} );

	if ( mode === 'controlled' ) {
		it( 'should reset values correctly', async () => {
			const user = userEvent.setup();

			render(
				<Component label="Test Toggle Group Control">
					{ options }
				</Component>
			);

			const rigasOption = screen.getByRole( 'radio', { name: 'R' } );
			const jackOption = screen.getByRole( 'radio', { name: 'J' } );

			await user.click( rigasOption );

			expect( jackOption ).not.toBeChecked();
			expect( rigasOption ).toBeChecked();

			await user.keyboard( '[ArrowRight]' );

			expect( rigasOption ).not.toBeChecked();
			expect( jackOption ).toBeChecked();

			await user.click( screen.getByRole( 'button', { name: 'Reset' } ) );

			expect( rigasOption ).not.toBeChecked();
			expect( jackOption ).not.toBeChecked();
		} );
	}

	describe( 'isDeselectable', () => {
		describe( 'isDeselectable = false', () => {
			it( 'should not be deselectable', async () => {
				const mockOnChange = jest.fn();
				const user = userEvent.setup();

				render(
					<Component
						value="rigas"
						label="Test"
						onChange={ mockOnChange }
					>
						{ options }
					</Component>
				);

				const rigas = screen.getByRole( 'radio', {
					name: 'R',
					checked: true,
				} );
				await user.click( rigas );
				expect( mockOnChange ).toHaveBeenCalledTimes( 0 );
			} );

			it( 'should not tab to next radio option', async () => {
				const user = userEvent.setup();

				render(
					<Component value="rigas" label="Test">
						{ options }
					</Component>
				);

				const rigas = screen.getByRole( 'radio', {
					name: 'R',
				} );

				await user.tab();
				expect( rigas ).toHaveFocus();

				await user.tab();

				const expectedFocusTarget =
					mode === 'uncontrolled'
						? rigas.ownerDocument.body
						: screen.getByRole( 'button', { name: 'Reset' } );

				expect( expectedFocusTarget ).toHaveFocus();
			} );
		} );

		describe( 'isDeselectable = true', () => {
			it( 'should be deselectable', async () => {
				const mockOnChange = jest.fn();
				const user = userEvent.setup();

				render(
					<Component
						value="rigas"
						label="Test"
						onChange={ mockOnChange }
						isDeselectable
					>
						{ options }
					</Component>
				);

				await user.click(
					screen.getByRole( 'button', {
						name: 'R',
						pressed: true,
					} )
				);
				expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
				expect( mockOnChange ).toHaveBeenLastCalledWith( undefined );

				await user.click(
					screen.getByRole( 'button', {
						name: 'R',
						pressed: false,
					} )
				);
				expect( mockOnChange ).toHaveBeenCalledTimes( 2 );
				expect( mockOnChange ).toHaveBeenLastCalledWith( 'rigas' );
			} );

			it( 'should tab to the next option button', async () => {
				const user = userEvent.setup();

				render(
					<Component isDeselectable value="rigas" label="Test">
						{ options }
					</Component>
				);

				await user.tab();
				expect(
					screen.getByRole( 'button', {
						name: 'R',
						pressed: true,
					} )
				).toHaveFocus();

				await user.tab();
				expect(
					screen.getByRole( 'button', {
						name: 'J',
						pressed: false,
					} )
				).toHaveFocus();

				// Focus should not move with arrow keys
				await user.keyboard( '{ArrowLeft}' );
				expect(
					screen.getByRole( 'button', {
						name: 'J',
						pressed: false,
					} )
				).toHaveFocus();
			} );
		} );
	} );
} );
