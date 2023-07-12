/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { Draggable } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockDraggableChip from './draggable-chip';
import useScrollWhenDragging from './use-scroll-when-dragging';
import { store as blockEditorStore } from '../../store';

const BlockDraggable = ( {
	children,
	clientIds,
	cloneClassname,
	onDragStart,
	onDragEnd,
} ) => {
	const { srcRootClientId, isDraggable, icon } = useSelect(
		( select ) => {
			const {
				canMoveBlocks,
				getBlockRootClientId,
				getBlockName,
				getBlockAttributes,
			} = select( blockEditorStore );
			const { getBlockType, getActiveBlockVariation } =
				select( blocksStore );
			const rootClientId = getBlockRootClientId( clientIds[ 0 ] );
			const blockName = getBlockName( clientIds[ 0 ] );
			const variation = getActiveBlockVariation(
				blockName,
				getBlockAttributes( clientIds[ 0 ] )
			);

			return {
				srcRootClientId: rootClientId,
				isDraggable: canMoveBlocks( clientIds, rootClientId ),
				icon: variation?.icon || getBlockType( blockName )?.icon,
			};
		},
		[ clientIds ]
	);
	const isDragging = useRef( false );
	const [ startScrolling, scrollOnDragOver, stopScrolling ] =
		useScrollWhenDragging();

	const { startDraggingBlocks, stopDraggingBlocks } =
		useDispatch( blockEditorStore );

	// Stop dragging blocks if the block draggable is unmounted.
	useEffect( () => {
		return () => {
			if ( isDragging.current ) {
				stopDraggingBlocks();
			}
		};
	}, [] );

	if ( ! isDraggable ) {
		return children( { draggable: false } );
	}

	const transferData = {
		type: 'block',
		srcClientIds: clientIds,
		srcRootClientId,
	};

	return (
		<Draggable
			cloneClassname={ cloneClassname }
			__experimentalTransferDataType="wp-blocks"
			transferData={ transferData }
			onDragStart={ ( event ) => {
				// Defer hiding the dragged source element to the next
				// frame to enable dragging.
				window.requestAnimationFrame( () => {
					startDraggingBlocks( clientIds );
					isDragging.current = true;

					startScrolling( event );

					if ( onDragStart ) {
						onDragStart();
					}
				} );
			} }
			onDragOver={ scrollOnDragOver }
			onDragEnd={ () => {
				stopDraggingBlocks();
				isDragging.current = false;

				stopScrolling();

				if ( onDragEnd ) {
					onDragEnd();
				}
			} }
			__experimentalDragComponent={
				<BlockDraggableChip count={ clientIds.length } icon={ icon } />
			}
		>
			{ ( { onDraggableStart, onDraggableEnd } ) => {
				return children( {
					draggable: true,
					onDragStart: onDraggableStart,
					onDragEnd: onDraggableEnd,
				} );
			} }
		</Draggable>
	);
};

export default BlockDraggable;
