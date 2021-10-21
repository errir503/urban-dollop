/**
 * WordPress dependencies
 */
import { __experimentalToolsPanel as ToolsPanel } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { cleanEmptyObject } from '../../hooks/utils';

export default function BlockSupportToolsPanel( { children, group, label } ) {
	const { clientId, attributes } = useSelect( ( select ) => {
		const { getBlockAttributes, getSelectedBlockClientId } = select(
			blockEditorStore
		);
		const selectedBlockClientId = getSelectedBlockClientId();

		return {
			clientId: selectedBlockClientId,
			attributes: getBlockAttributes( selectedBlockClientId ),
		};
	}, [] );
	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	const resetAll = ( resetFilters = [] ) => {
		const { style } = attributes;
		let newAttributes = { style };

		resetFilters.forEach( ( resetFilter ) => {
			newAttributes = {
				...newAttributes,
				...resetFilter( newAttributes ),
			};
		} );

		// Enforce a cleaned style object.
		newAttributes = {
			...newAttributes,
			style: cleanEmptyObject( newAttributes.style ),
		};

		updateBlockAttributes( clientId, newAttributes );
	};

	return (
		<ToolsPanel
			className={ `${ group }-block-support-panel` }
			label={ label }
			resetAll={ resetAll }
			key={ clientId }
			panelId={ clientId }
			hasInnerWrapper={ true }
			shouldRenderPlaceholderItems={ true } // Required to maintain fills ordering.
		>
			{ children }
		</ToolsPanel>
	);
}
