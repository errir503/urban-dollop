/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * We can't just use <BlockSelectionClearer> because the customizer has
 * many root nodes rather than just one in the post editor.
 * We need to listen to the focus events in all those roots, and also in
 * the preview iframe.
 * This hook will clear the selected block when focusing outside the editor,
 * with a few exceptions:
 * 1. Focusing on popovers.
 * 2. Focusing on the inspector.
 * 3. Focusing on any modals/dialogs.
 * These cases are normally triggered by user interactions from the editor,
 * not by explicitly focusing outside the editor, hence no need for clearing.
 *
 * @param {Object} sidebarControl The sidebar control instance.
 * @param {Object} popoverRef     The ref object of the popover node container.
 */
export default function useClearSelectedBlock( sidebarControl, popoverRef ) {
	const { hasSelectedBlock, hasMultiSelection } =
		useSelect( blockEditorStore );
	const { clearSelectedBlock } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( popoverRef.current && sidebarControl ) {
			const inspector = sidebarControl.inspector;
			const container = sidebarControl.container[ 0 ];
			const ownerDocument = container.ownerDocument;
			const ownerWindow = ownerDocument.defaultView;

			function handleClearSelectedBlock( element ) {
				if (
					// 1. Make sure there are blocks being selected.
					( hasSelectedBlock() || hasMultiSelection() ) &&
					// 2. The element should exist in the DOM (not deleted).
					element &&
					ownerDocument.contains( element ) &&
					// 3. It should also not exist in the container, the popover, nor the dialog.
					! container.contains( element ) &&
					! popoverRef.current.contains( element ) &&
					! element.closest( '[role="dialog"]' ) &&
					// 4. The inspector should not be opened.
					! inspector.expanded()
				) {
					clearSelectedBlock();
				}
			}

			// Handle mouse down in the same document.
			function handleMouseDown( event ) {
				handleClearSelectedBlock( event.target );
			}
			// Handle focusing outside the current document, like to iframes.
			function handleBlur() {
				handleClearSelectedBlock( ownerDocument.activeElement );
			}

			ownerDocument.addEventListener( 'mousedown', handleMouseDown );
			ownerWindow.addEventListener( 'blur', handleBlur );

			return () => {
				ownerDocument.removeEventListener(
					'mousedown',
					handleMouseDown
				);
				ownerWindow.removeEventListener( 'blur', handleBlur );
			};
		}
	}, [
		popoverRef,
		sidebarControl,
		hasSelectedBlock,
		hasMultiSelection,
		clearSelectedBlock,
	] );
}
