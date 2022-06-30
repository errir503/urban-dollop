/**
 * External dependencies
 */
import { first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { __unstableUseBlockRef as useBlockRef } from '../block-list/use-block-props/use-block-refs';

function selector( select ) {
	const {
		isMultiSelecting,
		getMultiSelectedBlockClientIds,
		hasMultiSelection,
		getSelectedBlockClientId,
		getSelectedBlocksInitialCaretPosition,
		__unstableIsFullySelected,
	} = select( blockEditorStore );

	return {
		isMultiSelecting: isMultiSelecting(),
		multiSelectedBlockClientIds: getMultiSelectedBlockClientIds(),
		hasMultiSelection: hasMultiSelection(),
		selectedBlockClientId: getSelectedBlockClientId(),
		initialPosition: getSelectedBlocksInitialCaretPosition(),
		isFullSelection: __unstableIsFullySelected(),
	};
}

export default function useMultiSelection() {
	const {
		initialPosition,
		isMultiSelecting,
		multiSelectedBlockClientIds,
		hasMultiSelection,
		selectedBlockClientId,
		isFullSelection,
	} = useSelect( selector, [] );
	const selectedRef = useBlockRef( selectedBlockClientId );
	// These must be in the right DOM order.
	const startRef = useBlockRef( first( multiSelectedBlockClientIds ) );
	const endRef = useBlockRef( last( multiSelectedBlockClientIds ) );

	/**
	 * When the component updates, and there is multi selection, we need to
	 * select the entire block contents.
	 */
	return useRefEffect(
		( node ) => {
			const { ownerDocument } = node;
			const { defaultView } = ownerDocument;

			// Allow initialPosition to bypass focus behavior. This is useful
			// for the list view or other areas where we don't want to transfer
			// focus to the editor canvas.
			if ( initialPosition === undefined || initialPosition === null ) {
				return;
			}

			if ( ! hasMultiSelection || isMultiSelecting ) {
				if ( ! selectedBlockClientId || isMultiSelecting ) {
					return;
				}

				const selection = defaultView.getSelection();

				if ( selection.rangeCount && ! selection.isCollapsed ) {
					const blockNode = selectedRef.current;
					const { startContainer, endContainer } =
						selection.getRangeAt( 0 );

					if (
						!! blockNode &&
						( ! blockNode.contains( startContainer ) ||
							! blockNode.contains( endContainer ) )
					) {
						selection.removeAllRanges();
					}
				}

				return;
			}

			const { length } = multiSelectedBlockClientIds;

			if ( length < 2 ) {
				return;
			}

			if ( ! isFullSelection ) {
				return;
			}

			// Allow cross contentEditable selection by temporarily making
			// all content editable. We can't rely on using the store and
			// React because re-rending happens too slowly. We need to be
			// able to select across instances immediately.
			node.contentEditable = true;

			// For some browsers, like Safari, it is important that focus happens
			// BEFORE selection.
			node.focus();

			// The block refs might not be immediately available
			// when dragging blocks into another block.
			if ( ! startRef.current || ! endRef.current ) {
				return;
			}

			const selection = defaultView.getSelection();
			const range = ownerDocument.createRange();

			// These must be in the right DOM order.
			range.setStartBefore( startRef.current );
			range.setEndAfter( endRef.current );

			selection.removeAllRanges();
			selection.addRange( range );
		},
		[
			hasMultiSelection,
			isMultiSelecting,
			multiSelectedBlockClientIds,
			selectedBlockClientId,
			initialPosition,
			isFullSelection,
		]
	);
}
