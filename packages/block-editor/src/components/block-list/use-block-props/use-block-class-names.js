/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { isReusableBlock, getBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../../store';

/**
 * Returns the class names used for the different states of the block.
 *
 * @param {string} clientId The block client ID.
 *
 * @return {string} The class names.
 */
export function useBlockClassNames( clientId ) {
	return useSelect(
		( select ) => {
			const {
				isBlockBeingDragged,
				isBlockHighlighted,
				isBlockSelected,
				isBlockMultiSelected,
				getBlockName,
				getSettings,
				hasSelectedInnerBlock,
				isTyping,
				__unstableIsFullySelected,
			} = select( blockEditorStore );
			const { outlineMode } = getSettings();
			const isDragging = isBlockBeingDragged( clientId );
			const isSelected = isBlockSelected( clientId );
			const name = getBlockName( clientId );
			const checkDeep = true;
			// "ancestor" is the more appropriate label due to "deep" check.
			const isAncestorOfSelectedBlock = hasSelectedInnerBlock(
				clientId,
				checkDeep
			);
			const isMultiSelected = isBlockMultiSelected( clientId );
			return classnames( {
				'is-selected': isSelected,
				'is-highlighted': isBlockHighlighted( clientId ),
				'is-multi-selected': isMultiSelected,
				'is-partially-selected':
					isMultiSelected && ! __unstableIsFullySelected(),
				'is-reusable': isReusableBlock( getBlockType( name ) ),
				'is-dragging': isDragging,
				'has-child-selected': isAncestorOfSelectedBlock,
				'remove-outline': isSelected && outlineMode && isTyping(),
			} );
		},
		[ clientId ]
	);
}
