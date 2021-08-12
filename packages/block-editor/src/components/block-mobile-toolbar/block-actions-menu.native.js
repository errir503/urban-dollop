/**
 * External dependencies
 */
import { Platform, findNodeHandle } from 'react-native';
import { partial, first, castArray, last, compact, every } from 'lodash';
/**
 * WordPress dependencies
 */
import {
	getClipboard,
	setClipboard,
	ToolbarButton,
	Picker,
} from '@wordpress/components';
import {
	getBlockType,
	getDefaultBlockName,
	hasBlockSupport,
	serialize,
	rawHandler,
	createBlock,
	isUnmodifiedDefaultBlock,
	isReusableBlock,
} from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';
import { moreHorizontalMobile } from '@wordpress/icons';
import { useRef, useState } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { store as reusableBlocksStore } from '@wordpress/reusable-blocks';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { getMoversSetup } from '../block-mover/mover-description';
import { store as blockEditorStore } from '../../store';
import BlockTransformationsMenu from '../block-switcher/block-transformations-menu';

const BlockActionsMenu = ( {
	// Select
	blockTitle,
	canInsertBlockType,
	getBlocksByClientId,
	isEmptyDefaultBlock,
	isLocked,
	canDuplicate,
	isFirst,
	isLast,
	isReusableBlockType,
	reusableBlock,
	rootClientId,
	selectedBlockClientId,
	selectedBlockPossibleTransformations,
	// Dispatch
	createSuccessNotice,
	convertToRegularBlocks,
	duplicateBlock,
	onMoveDown,
	onMoveUp,
	openGeneralSidebar,
	pasteBlock,
	removeBlocks,
	// Passed in
	anchorNodeRef,
	isStackedHorizontally,
	onDelete,
	wrapBlockMover,
	wrapBlockSettings,
} ) => {
	const [ clipboard, setCurrentClipboard ] = useState( getClipboard() );
	const blockActionsMenuPickerRef = useRef();
	const blockTransformationMenuPickerRef = useRef();
	const moversOptions = { keys: [ 'icon', 'actionTitle' ] };
	const clipboardBlock = clipboard && rawHandler( { HTML: clipboard } )[ 0 ];
	const isPasteEnabled =
		clipboardBlock &&
		canInsertBlockType( clipboardBlock.name, rootClientId );

	const {
		actionTitle: {
			backward: backwardButtonTitle,
			forward: forwardButtonTitle,
		},
	} = getMoversSetup( isStackedHorizontally, moversOptions );

	const allOptions = {
		settings: {
			id: 'settingsOption',
			label: __( 'Block settings' ),
			value: 'settingsOption',
			onSelect: openGeneralSidebar,
		},
		backwardButton: {
			id: 'backwardButtonOption',
			label: backwardButtonTitle,
			value: 'backwardButtonOption',
			disabled: isFirst,
			onSelect: onMoveUp,
		},
		forwardButton: {
			id: 'forwardButtonOption',
			label: forwardButtonTitle,
			value: 'forwardButtonOption',
			disabled: isLast,
			onSelect: onMoveDown,
		},
		delete: {
			id: 'deleteOption',
			label: __( 'Remove block' ),
			value: 'deleteOption',
			separated: true,
			disabled: isEmptyDefaultBlock,
			onSelect: () => {
				onDelete();
				createSuccessNotice(
					// translators: displayed right after the block is removed.
					__( 'Block removed' )
				);
			},
		},
		transformButton: {
			id: 'transformButtonOption',
			label: __( 'Transform block…' ),
			value: 'transformButtonOption',
			onSelect: () => {
				if ( blockTransformationMenuPickerRef.current ) {
					blockTransformationMenuPickerRef.current.presentPicker();
				}
			},
		},
		copyButton: {
			id: 'copyButtonOption',
			label: __( 'Copy block' ),
			value: 'copyButtonOption',
			onSelect: () => {
				const serializedBlock = serialize(
					getBlocksByClientId( selectedBlockClientId )
				);
				setCurrentClipboard( serializedBlock );
				setClipboard( serializedBlock );
				createSuccessNotice(
					// translators: displayed right after the block is copied.
					__( 'Block copied' )
				);
			},
		},
		cutButton: {
			id: 'cutButtonOption',
			label: __( 'Cut block' ),
			value: 'cutButtonOption',
			onSelect: () => {
				setClipboard(
					serialize( getBlocksByClientId( selectedBlockClientId ) )
				);
				removeBlocks( selectedBlockClientId );
				createSuccessNotice(
					// translators: displayed right after the block is cut.
					__( 'Block cut' )
				);
			},
		},
		pasteButton: {
			id: 'pasteButtonOption',
			label: __( 'Paste block after' ),
			value: 'pasteButtonOption',
			onSelect: () => {
				onPasteBlock();
				createSuccessNotice(
					// translators: displayed right after the block is pasted.
					__( 'Block pasted' )
				);
			},
		},
		duplicateButton: {
			id: 'duplicateButtonOption',
			label: __( 'Duplicate block' ),
			value: 'duplicateButtonOption',
			onSelect: () => {
				duplicateBlock();
				createSuccessNotice(
					// translators: displayed right after the block is duplicated.
					__( 'Block duplicated' )
				);
			},
		},
		convertToRegularBlocks: {
			id: 'convertToRegularBlocksOption',
			label: __( 'Convert to regular blocks' ),
			value: 'convertToRegularBlocksOption',
			onSelect: () => {
				createSuccessNotice(
					sprintf(
						/* translators: %s: name of the reusable block */
						__( '%s converted to regular blocks' ),
						reusableBlock?.title?.raw || blockTitle
					)
				);
				convertToRegularBlocks();
			},
		},
	};

	const options = compact( [
		wrapBlockMover && allOptions.backwardButton,
		wrapBlockMover && allOptions.forwardButton,
		wrapBlockSettings && allOptions.settings,
		! isLocked &&
			selectedBlockPossibleTransformations.length &&
			allOptions.transformButton,
		canDuplicate && allOptions.copyButton,
		canDuplicate && allOptions.cutButton,
		canDuplicate && isPasteEnabled && allOptions.pasteButton,
		canDuplicate && allOptions.duplicateButton,
		isReusableBlockType && allOptions.convertToRegularBlocks,
		! isLocked && allOptions.delete,
	] );

	// End early if there are no options to show.
	if ( ! options.length ) {
		return (
			<ToolbarButton
				title={ __( 'Open Block Actions Menu' ) }
				icon={ moreHorizontalMobile }
				disabled={ true }
			/>
		);
	}

	function onPasteBlock() {
		if ( ! clipboard ) {
			return;
		}

		pasteBlock( rawHandler( { HTML: clipboard } )[ 0 ] );
	}

	function onPickerSelect( value ) {
		const selectedItem = options.find( ( item ) => item.value === value );
		selectedItem.onSelect();
	}

	function onPickerPresent() {
		if ( blockActionsMenuPickerRef.current ) {
			blockActionsMenuPickerRef.current.presentPicker();
		}
	}

	const disabledButtonIndices = options
		.map( ( option, index ) => option.disabled && index + 1 )
		.filter( Boolean );

	const accessibilityHint =
		Platform.OS === 'ios'
			? __( 'Double tap to open Action Sheet with available options' )
			: __( 'Double tap to open Bottom Sheet with available options' );

	const getAnchor = () =>
		anchorNodeRef ? findNodeHandle( anchorNodeRef ) : undefined;

	return (
		<>
			<ToolbarButton
				title={ __( 'Open Block Actions Menu' ) }
				onClick={ onPickerPresent }
				icon={ moreHorizontalMobile }
				extraProps={ {
					hint: accessibilityHint,
				} }
			/>
			<Picker
				ref={ blockActionsMenuPickerRef }
				options={ options }
				onChange={ onPickerSelect }
				destructiveButtonIndex={ options.length }
				disabledButtonIndices={ disabledButtonIndices }
				hideCancelButton={ Platform.OS !== 'ios' }
				leftAlign={ true }
				getAnchor={ getAnchor }
				// translators: %s: block title e.g: "Paragraph".
				title={ sprintf( __( '%s block options' ), blockTitle ) }
			/>
			<BlockTransformationsMenu
				anchorNodeRef={ anchorNodeRef }
				blockTitle={ blockTitle }
				pickerRef={ blockTransformationMenuPickerRef }
				possibleTransformations={ selectedBlockPossibleTransformations }
				selectedBlock={ getBlocksByClientId( selectedBlockClientId ) }
				selectedBlockClientId={ selectedBlockClientId }
			/>
		</>
	);
};

export default compose(
	withSelect( ( select, { clientIds } ) => {
		const {
			getBlockIndex,
			getBlockRootClientId,
			getBlockOrder,
			getBlockName,
			getBlockTransformItems,
			getBlock,
			getBlocksByClientId,
			getSelectedBlockClientIds,
			canInsertBlockType,
			getTemplateLock,
		} = select( blockEditorStore );
		const normalizedClientIds = castArray( clientIds );
		const block = getBlock( normalizedClientIds );
		const blockName = getBlockName( normalizedClientIds );
		const blockType = getBlockType( blockName );
		const blockTitle = blockType?.title;
		const firstClientId = first( normalizedClientIds );
		const rootClientId = getBlockRootClientId( firstClientId );
		const blockOrder = getBlockOrder( rootClientId );

		const firstIndex = getBlockIndex( firstClientId, rootClientId );
		const lastIndex = getBlockIndex(
			last( normalizedClientIds ),
			rootClientId
		);

		const innerBlocks = getBlocksByClientId( clientIds );

		const canDuplicate = every( innerBlocks, ( innerBlock ) => {
			return (
				!! innerBlock &&
				hasBlockSupport( innerBlock.name, 'multiple', true ) &&
				canInsertBlockType( innerBlock.name, rootClientId )
			);
		} );

		const isDefaultBlock = blockName === getDefaultBlockName();
		const isEmptyContent = block?.attributes.content === '';
		const isExactlyOneBlock = blockOrder.length === 1;
		const isEmptyDefaultBlock =
			isExactlyOneBlock && isDefaultBlock && isEmptyContent;
		const isLocked = !! getTemplateLock( rootClientId );

		const selectedBlockClientId = first( getSelectedBlockClientIds() );
		const selectedBlock = selectedBlockClientId
			? first( getBlocksByClientId( selectedBlockClientId ) )
			: undefined;
		const selectedBlockPossibleTransformations = selectedBlock
			? getBlockTransformItems( [ selectedBlock ], rootClientId )
			: [];

		const isReusableBlockType = block ? isReusableBlock( block ) : false;
		const reusableBlock = isReusableBlockType
			? select( coreStore ).getEntityRecord(
					'postType',
					'wp_block',
					block?.attributes.ref
			  )
			: undefined;

		return {
			blockTitle,
			canInsertBlockType,
			currentIndex: firstIndex,
			getBlocksByClientId,
			isEmptyDefaultBlock,
			isLocked,
			canDuplicate,
			isFirst: firstIndex === 0,
			isLast: lastIndex === blockOrder.length - 1,
			isReusableBlockType,
			reusableBlock,
			rootClientId,
			selectedBlockClientId,
			selectedBlockPossibleTransformations,
		};
	} ),
	withDispatch(
		(
			dispatch,
			{ clientIds, rootClientId, currentIndex, selectedBlockClientId },
			{ select }
		) => {
			const {
				moveBlocksDown,
				moveBlocksUp,
				duplicateBlocks,
				removeBlocks,
				insertBlock,
				replaceBlocks,
				clearSelectedBlock,
			} = dispatch( blockEditorStore );
			const { openGeneralSidebar } = dispatch( 'core/edit-post' );
			const { getBlockSelectionEnd, getBlock } = select(
				blockEditorStore
			);
			const { createSuccessNotice } = dispatch( noticesStore );

			const {
				__experimentalConvertBlockToStatic: convertBlockToStatic,
			} = dispatch( reusableBlocksStore );

			return {
				createSuccessNotice,
				convertToRegularBlocks() {
					clearSelectedBlock();
					// Convert action is executed at the end of the current JavaScript execution block
					// to prevent issues related to undo/redo actions.
					setImmediate( () =>
						convertBlockToStatic( selectedBlockClientId )
					);
				},
				duplicateBlock() {
					return duplicateBlocks( clientIds );
				},
				onMoveDown: partial( moveBlocksDown, clientIds, rootClientId ),
				onMoveUp: partial( moveBlocksUp, clientIds, rootClientId ),
				openGeneralSidebar: () =>
					openGeneralSidebar( 'edit-post/block' ),
				pasteBlock: ( clipboardBlock ) => {
					const canReplaceBlock = isUnmodifiedDefaultBlock(
						getBlock( getBlockSelectionEnd() )
					);

					if ( ! canReplaceBlock ) {
						const insertedBlock = createBlock(
							clipboardBlock.name,
							clipboardBlock.attributes,
							clipboardBlock.innerBlocks
						);

						insertBlock(
							insertedBlock,
							currentIndex + 1,
							rootClientId
						);
					} else {
						replaceBlocks( clientIds, clipboardBlock );
					}
				},
				removeBlocks,
			};
		}
	),
	withInstanceId
)( BlockActionsMenu );
