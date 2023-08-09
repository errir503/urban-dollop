/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useRef } from '@wordpress/element';
import { useViewportMatch } from '@wordpress/compose';
import {
	getBlockType,
	hasBlockSupport,
	isReusableBlock,
	isTemplatePart,
} from '@wordpress/blocks';
import { ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockMover from '../block-mover';
import BlockParentSelector from '../block-parent-selector';
import BlockSwitcher from '../block-switcher';
import BlockControls from '../block-controls';
import __unstableBlockToolbarLastItem from './block-toolbar-last-item';
import BlockSettingsMenu from '../block-settings-menu';
import { BlockLockToolbar } from '../block-lock';
import { BlockGroupToolbar } from '../convert-to-group-buttons';
import BlockEditVisuallyButton from '../block-edit-visually-button';
import { useShowHoveredOrFocusedGestures } from './utils';
import { store as blockEditorStore } from '../../store';
import __unstableBlockNameContext from './block-name-context';

const BlockToolbar = ( { hideDragHandle } ) => {
	const { blockClientIds, blockType, isValid, isVisual, blockEditingMode } =
		useSelect( ( select ) => {
			const {
				getBlockName,
				getBlockMode,
				getSelectedBlockClientIds,
				isBlockValid,
				getBlockRootClientId,
				getBlockEditingMode,
			} = select( blockEditorStore );
			const selectedBlockClientIds = getSelectedBlockClientIds();
			const selectedBlockClientId = selectedBlockClientIds[ 0 ];
			const blockRootClientId = getBlockRootClientId(
				selectedBlockClientId
			);
			return {
				blockClientIds: selectedBlockClientIds,
				blockType:
					selectedBlockClientId &&
					getBlockType( getBlockName( selectedBlockClientId ) ),
				rootClientId: blockRootClientId,
				isValid: selectedBlockClientIds.every( ( id ) =>
					isBlockValid( id )
				),
				isVisual: selectedBlockClientIds.every(
					( id ) => getBlockMode( id ) === 'visual'
				),
				blockEditingMode: getBlockEditingMode( selectedBlockClientId ),
			};
		}, [] );

	const toolbarWrapperRef = useRef( null );

	// Handles highlighting the current block outline on hover or focus of the
	// block type toolbar area.
	const nodeRef = useRef();
	const showHoveredOrFocusedGestures = useShowHoveredOrFocusedGestures( {
		ref: nodeRef,
	} );

	const isLargeViewport = ! useViewportMatch( 'medium', '<' );

	if ( blockType ) {
		if ( ! hasBlockSupport( blockType, '__experimentalToolbar', true ) ) {
			return null;
		}
	}

	if ( blockClientIds.length === 0 ) {
		return null;
	}

	const shouldShowVisualToolbar = isValid && isVisual;
	const isMultiToolbar = blockClientIds.length > 1;
	const isSynced =
		isReusableBlock( blockType ) || isTemplatePart( blockType );

	const classes = classnames( 'block-editor-block-toolbar', {
		'is-synced': isSynced,
	} );

	return (
		<div className={ classes } ref={ toolbarWrapperRef }>
			{ ! isMultiToolbar &&
				isLargeViewport &&
				blockEditingMode === 'default' && <BlockParentSelector /> }
			{ ( shouldShowVisualToolbar || isMultiToolbar ) &&
				blockEditingMode === 'default' && (
					<div ref={ nodeRef } { ...showHoveredOrFocusedGestures }>
						<ToolbarGroup className="block-editor-block-toolbar__block-controls">
							<BlockSwitcher clientIds={ blockClientIds } />
							{ ! isMultiToolbar && (
								<BlockLockToolbar
									clientId={ blockClientIds[ 0 ] }
									wrapperRef={ toolbarWrapperRef }
								/>
							) }
							<BlockMover
								clientIds={ blockClientIds }
								hideDragHandle={ hideDragHandle }
							/>
						</ToolbarGroup>
					</div>
				) }
			{ shouldShowVisualToolbar && isMultiToolbar && (
				<BlockGroupToolbar />
			) }
			{ shouldShowVisualToolbar && (
				<>
					<BlockControls.Slot
						group="parent"
						className="block-editor-block-toolbar__slot"
					/>
					<BlockControls.Slot
						group="block"
						className="block-editor-block-toolbar__slot"
					/>
					<BlockControls.Slot className="block-editor-block-toolbar__slot" />
					<BlockControls.Slot
						group="inline"
						className="block-editor-block-toolbar__slot"
					/>
					<BlockControls.Slot
						group="other"
						className="block-editor-block-toolbar__slot"
					/>
					<__unstableBlockNameContext.Provider
						value={ blockType?.name }
					>
						<__unstableBlockToolbarLastItem.Slot />
					</__unstableBlockNameContext.Provider>
				</>
			) }
			<BlockEditVisuallyButton clientIds={ blockClientIds } />
			{ blockEditingMode === 'default' && (
				<BlockSettingsMenu clientIds={ blockClientIds } />
			) }
		</div>
	);
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-toolbar/README.md
 */
export default BlockToolbar;
