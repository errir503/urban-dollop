/**
 * WordPress dependencies
 */
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	FlexBlock,
	Placeholder,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import FieldActions from './field-actions';

export function ViewGrid( { data, fields, view, actions } ) {
	const mediaField = fields.find(
		( field ) => field.id === view.layout.mediaField
	);
	const visibleFields = fields.filter(
		( field ) =>
			! view.hiddenFields.includes( field.id ) &&
			field.id !== view.layout.mediaField
	);
	return (
		<Grid gap={ 8 } columns={ 2 } alignment="top">
			{ data.map( ( item, index ) => {
				return (
					<VStack key={ index }>
						<div className="dataviews-view-grid__media">
							{ mediaField?.render( { item, view } ) || (
								<Placeholder
									withIllustration
									style={ {
										width: '100%',
										minHeight: '200px',
									} }
								/>
							) }
						</div>

						<HStack justify="space-between" alignment="top">
							<FlexBlock>
								<VStack>
									{ visibleFields.map( ( field ) => (
										<div key={ field.id }>
											{ field.render( { item, view } ) }
										</div>
									) ) }
								</VStack>
							</FlexBlock>
							<FieldActions item={ item } actions={ actions } />
						</HStack>
					</VStack>
				);
			} ) }
		</Grid>
	);
}
