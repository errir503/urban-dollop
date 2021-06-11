/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import {
	useThrottle,
	__experimentalUseDropZone as useDropZone,
} from '@wordpress/compose';

/**
 * Internal dependencies
 */
import useOnBlockDrop from '../use-on-block-drop';
import { getDistanceToNearestEdge } from '../../utils/math';
import { store as blockEditorStore } from '../../store';

/** @typedef {import('../../utils/math').WPPoint} WPPoint */

/**
 * The orientation of a block list.
 *
 * @typedef {'horizontal'|'vertical'|undefined} WPBlockListOrientation
 */

/**
 * Given a list of block DOM elements finds the index that a block should be dropped
 * at.
 *
 * @param {Element[]}              elements    Array of DOM elements that represent each block in a block list.
 * @param {WPPoint}                position    The position of the item being dragged.
 * @param {WPBlockListOrientation} orientation The orientation of a block list.
 *
 * @return {number|undefined} The block index that's closest to the drag position.
 */
export function getNearestBlockIndex( elements, position, orientation ) {
	const allowedEdges =
		orientation === 'horizontal'
			? [ 'left', 'right' ]
			: [ 'top', 'bottom' ];

	let candidateIndex;
	let candidateDistance;

	elements.forEach( ( element, index ) => {
		// Ensure the element is a block. It should have the `wp-block` class.
		if ( ! element.classList.contains( 'wp-block' ) ) {
			return;
		}

		const rect = element.getBoundingClientRect();
		const [ distance, edge ] = getDistanceToNearestEdge(
			position,
			rect,
			allowedEdges
		);

		if ( candidateDistance === undefined || distance < candidateDistance ) {
			// If the user is dropping to the trailing edge of the block
			// add 1 to the index to represent dragging after.
			const isTrailingEdge = edge === 'bottom' || edge === 'right';
			let offset = isTrailingEdge ? 1 : 0;

			// If the target is the dragged block itself and another 1 to
			// index as the dragged block is set to `display: none` and
			// should be skipped in the calculation.
			const isTargetDraggedBlock =
				isTrailingEdge &&
				elements[ index + 1 ] &&
				elements[ index + 1 ].classList.contains( 'is-dragging' );
			offset += isTargetDraggedBlock ? 1 : 0;

			// Update the currently known best candidate.
			candidateDistance = distance;
			candidateIndex = index + offset;
		}
	} );

	return candidateIndex;
}

/**
 * @typedef  {Object} WPBlockDropZoneConfig
 * @property {string} rootClientId The root client id for the block list.
 */

/**
 * A React hook that can be used to make a block list handle drag and drop.
 *
 * @param {WPBlockDropZoneConfig} dropZoneConfig configuration data for the drop zone.
 */
export default function useBlockDropZone( {
	// An undefined value represents a top-level block. Default to an empty
	// string for this so that `targetRootClientId` can be easily compared to
	// values returned by the `getRootBlockClientId` selector, which also uses
	// an empty string to represent top-level blocks.
	rootClientId: targetRootClientId = '',
} = {} ) {
	const [ targetBlockIndex, setTargetBlockIndex ] = useState( null );

	const { isLockedAll, orientation } = useSelect(
		( select ) => {
			const { getBlockListSettings, getTemplateLock } = select(
				blockEditorStore
			);
			return {
				isLockedAll: getTemplateLock( targetRootClientId ) === 'all',
				orientation: getBlockListSettings( targetRootClientId )
					?.orientation,
			};
		},
		[ targetRootClientId ]
	);

	const { showInsertionPoint, hideInsertionPoint } = useDispatch(
		'core/block-editor'
	);

	const onBlockDrop = useOnBlockDrop( targetRootClientId, targetBlockIndex );
	const throttled = useThrottle(
		useCallback( ( event, currentTarget ) => {
			const blockElements = Array.from( currentTarget.children );
			const targetIndex = getNearestBlockIndex(
				blockElements,
				{ x: event.clientX, y: event.clientY },
				orientation
			);

			setTargetBlockIndex( targetIndex === undefined ? 0 : targetIndex );

			if ( targetIndex !== null ) {
				showInsertionPoint( targetRootClientId, targetIndex );
			}
		}, [] ),
		200
	);

	return useDropZone( {
		isDisabled: isLockedAll,
		onDrop: onBlockDrop,
		onDragOver( event ) {
			// `currentTarget` is only available while the event is being
			// handled, so get it now and pass it to the thottled function.
			// https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget
			throttled( event, event.currentTarget );
		},
		onDragEnd() {
			throttled.cancel();
			hideInsertionPoint();
			setTargetBlockIndex( null );
		},
	} );
}
