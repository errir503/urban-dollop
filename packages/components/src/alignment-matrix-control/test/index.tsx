/**
 * External dependencies
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import AlignmentMatrixControl from '..';

const getControl = () => {
	return screen.getByRole( 'grid' );
};

const getCell = ( name: string ) => {
	return within( getControl() ).getByRole( 'gridcell', { name } );
};

const renderAndInitCompositeStore = async (
	jsx: JSX.Element,
	focusedCell = 'center center'
) => {
	const view = render( jsx );
	await waitFor( () => {
		expect( getCell( focusedCell ) ).toHaveAttribute( 'tabindex', '0' );
	} );
	return view;
};

describe( 'AlignmentMatrixControl', () => {
	describe( 'Basic rendering', () => {
		it( 'should render', async () => {
			await renderAndInitCompositeStore( <AlignmentMatrixControl /> );

			expect( getControl() ).toBeInTheDocument();
		} );

		it( 'should be centered by default', async () => {
			const user = userEvent.setup();

			await renderAndInitCompositeStore( <AlignmentMatrixControl /> );

			await user.tab();

			expect( getCell( 'center center' ) ).toHaveFocus();
		} );
	} );

	describe( 'Should change value', () => {
		describe( 'with Mouse', () => {
			describe( 'on cell click', () => {
				it.each( [
					'top left',
					'top center',
					'top right',
					'center left',
					'center right',
					'bottom left',
					'bottom center',
					'bottom right',
				] )( '%s', async ( alignment ) => {
					const user = userEvent.setup();
					const spy = jest.fn();

					await renderAndInitCompositeStore(
						<AlignmentMatrixControl
							value="center"
							onChange={ spy }
						/>
					);

					const cell = getCell( alignment );

					await user.click( cell );

					expect( cell ).toHaveFocus();
					expect( spy ).toHaveBeenCalledWith( alignment );
				} );

				it( 'unless already focused', async () => {
					const user = userEvent.setup();
					const spy = jest.fn();

					await renderAndInitCompositeStore(
						<AlignmentMatrixControl
							value="center"
							onChange={ spy }
						/>
					);

					const cell = getCell( 'center center' );

					await user.click( cell );

					expect( cell ).toHaveFocus();
					expect( spy ).not.toHaveBeenCalled();
				} );
			} );
		} );

		describe( 'with Keyboard', () => {
			describe( 'on arrow press', () => {
				it.each( [
					[ 'ArrowUp', 'top center' ],
					[ 'ArrowLeft', 'center left' ],
					[ 'ArrowDown', 'bottom center' ],
					[ 'ArrowRight', 'center right' ],
				] )( '%s', async ( keyRef, cellRef ) => {
					const user = userEvent.setup();
					const spy = jest.fn();

					await renderAndInitCompositeStore(
						<AlignmentMatrixControl onChange={ spy } />
					);

					await user.tab();
					await user.keyboard( `[${ keyRef }]` );

					expect( getCell( cellRef ) ).toHaveFocus();
					expect( spy ).toHaveBeenCalledWith( cellRef );
				} );
			} );

			describe( 'but not at at edge', () => {
				it.each( [
					[ 'ArrowUp', 'top left' ],
					[ 'ArrowLeft', 'top left' ],
					[ 'ArrowDown', 'bottom right' ],
					[ 'ArrowRight', 'bottom right' ],
				] )( '%s', async ( keyRef, cellRef ) => {
					const user = userEvent.setup();
					const spy = jest.fn();

					await renderAndInitCompositeStore(
						<AlignmentMatrixControl onChange={ spy } />
					);

					const cell = getCell( cellRef );
					await user.click( cell );
					await user.keyboard( `[${ keyRef }]` );

					expect( cell ).toHaveFocus();
					expect( spy ).toHaveBeenCalledWith( cellRef );
				} );
			} );
		} );
	} );
} );
