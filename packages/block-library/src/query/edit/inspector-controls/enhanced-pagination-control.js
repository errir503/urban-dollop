/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useUnsupportedBlocks } from '../../utils';

export default function EnhancedPaginationControl( {
	enhancedPagination,
	setAttributes,
	clientId,
} ) {
	const { hasUnsupportedBlocks } = useUnsupportedBlocks( clientId );

	let help = __( 'Browsing between pages requires a full page reload.' );
	if ( enhancedPagination ) {
		help = __(
			"Browsing between pages won't require a full page reload, unless non-compatible blocks are detected."
		);
	} else if ( hasUnsupportedBlocks ) {
		help = __(
			"Force page reload can't be disabled because there are non-compatible blocks inside the Query block."
		);
	}

	return (
		<>
			<ToggleControl
				label={ __( 'Force page reload' ) }
				help={ help }
				checked={ ! enhancedPagination }
				disabled={ hasUnsupportedBlocks }
				onChange={ ( value ) => {
					setAttributes( {
						enhancedPagination: ! value,
					} );
				} }
			/>
		</>
	);
}
