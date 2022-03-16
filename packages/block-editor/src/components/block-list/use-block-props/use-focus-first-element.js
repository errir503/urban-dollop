/**
 * External dependencies
 */
import { first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';
import { focus, isTextField, placeCaretAtHorizontalEdge } from '@wordpress/dom';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { isInsideRootBlock } from '../../../utils/dom';
import { store as blockEditorStore } from '../../../store';
import { setContentEditableWrapper } from './use-multi-selection';

/** @typedef {import('@wordpress/element').RefObject} RefObject */

/**
 * Returns the initial position if the block needs to be focussed, `undefined`
 * otherwise. The initial position is either 0 (start) or -1 (end).
 *
 * @param {string} clientId Block client ID.
 *
 * @return {number} The initial position, either 0 (start) or -1 (end).
 */
function useInitialPosition( clientId ) {
	return useSelect(
		( select ) => {
			const {
				getSelectedBlocksInitialCaretPosition,
				isMultiSelecting,
				isNavigationMode,
				isBlockSelected,
			} = select( blockEditorStore );

			if ( ! isBlockSelected( clientId ) ) {
				return;
			}

			if ( isMultiSelecting() || isNavigationMode() ) {
				return;
			}

			// If there's no initial position, return 0 to focus the start.
			return getSelectedBlocksInitialCaretPosition();
		},
		[ clientId ]
	);
}

function isFormElement( element ) {
	const { tagName } = element;
	return (
		tagName === 'INPUT' ||
		tagName === 'BUTTON' ||
		tagName === 'SELECT' ||
		tagName === 'TEXTAREA'
	);
}

/**
 * Transitions focus to the block or inner tabbable when the block becomes
 * selected and an initial position is set.
 *
 * @param {string} clientId Block client ID.
 *
 * @return {RefObject} React ref with the block element.
 */
export function useFocusFirstElement( clientId ) {
	const ref = useRef();
	const initialPosition = useInitialPosition( clientId );

	useEffect( () => {
		if ( initialPosition === undefined || initialPosition === null ) {
			return;
		}

		if ( ! ref.current ) {
			return;
		}

		const { ownerDocument } = ref.current;

		// Do not focus the block if it already contains the active element.
		if ( ref.current.contains( ownerDocument.activeElement ) ) {
			return;
		}

		// Find all tabbables within node.
		const textInputs = focus.tabbable
			.find( ref.current )
			.filter( ( node ) => isTextField( node ) );

		// If reversed (e.g. merge via backspace), use the last in the set of
		// tabbables.
		const isReverse = -1 === initialPosition;
		const target =
			( isReverse ? last : first )( textInputs ) || ref.current;

		if ( ! isInsideRootBlock( ref.current, target ) ) {
			ref.current.focus();
			return;
		}

		// Check to see if element is focussable before a generic caret insert.
		if ( ! target.getAttribute( 'contenteditable' ) ) {
			const focusElement = focus.tabbable.findNext( target );
			// Make sure focusElement is valid, form field, and within the current target element.
			// Ensure is not block inserter trigger, don't want to focus that in the event of the group block which doesn't contain any other focussable elements.
			if (
				focusElement &&
				isFormElement( focusElement ) &&
				target.contains( focusElement ) &&
				! focusElement.classList.contains(
					'block-editor-button-block-appender'
				)
			) {
				focusElement.focus();
				return;
			}
		}

		setContentEditableWrapper( ref.current, false );

		placeCaretAtHorizontalEdge( target, isReverse );
	}, [ initialPosition ] );

	return ref;
}
