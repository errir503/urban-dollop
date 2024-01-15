/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalHStack as HStack,
	SelectControl,
} from '@wordpress/components';
import { createInterpolateElement, memo } from '@wordpress/element';
import { sprintf, __, _x } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';

const Pagination = memo( function Pagination( {
	view,
	onChangeView,
	paginationInfo: { totalItems = 0, totalPages },
} ) {
	if ( ! totalItems || ! totalPages ) {
		return null;
	}
	return (
		!! totalItems &&
		totalPages !== 1 && (
			<HStack
				expanded={ false }
				spacing={ 6 }
				justify="end"
				className="dataviews-pagination"
			>
				<HStack justify="flex-start" expanded={ false } spacing={ 2 }>
					{ createInterpolateElement(
						sprintf(
							// translators: %s: Total number of pages.
							_x( 'Page <CurrenPageControl /> of %s', 'paging' ),
							totalPages
						),
						{
							CurrenPageControl: (
								<SelectControl
									aria-label={ __( 'Current page' ) }
									value={ view.page }
									options={ Array.from(
										Array( totalPages )
									).map( ( _, i ) => {
										const page = i + 1;
										return { value: page, label: page };
									} ) }
									onChange={ ( newValue ) => {
										onChangeView( {
											...view,
											page: +newValue,
										} );
									} }
									size={ 'compact' }
									__nextHasNoMarginBottom
								/>
							),
						}
					) }
				</HStack>
				<HStack expanded={ false } spacing={ 1 }>
					<Button
						onClick={ () =>
							onChangeView( { ...view, page: view.page - 1 } )
						}
						disabled={ view.page === 1 }
						__experimentalIsFocusable
						label={ __( 'Previous page' ) }
						icon={ chevronLeft }
						showTooltip
						size="compact"
						tooltipPosition="top"
					/>
					<Button
						onClick={ () =>
							onChangeView( { ...view, page: view.page + 1 } )
						}
						disabled={ view.page >= totalPages }
						__experimentalIsFocusable
						label={ __( 'Next page' ) }
						icon={ chevronRight }
						showTooltip
						size="compact"
						tooltipPosition="top"
					/>
				</HStack>
			</HStack>
		)
	);
} );

export default Pagination;
