/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { hasBlockSupport } from '@wordpress/blocks';
import {
	__experimentalTreeGridCell as TreeGridCell,
	__experimentalTreeGridItem as TreeGridItem,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { moreVertical } from '@wordpress/icons';
import {
	useState,
	useRef,
	useEffect,
	useCallback,
	memo,
} from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ListViewLeaf from './leaf';
import {
	BlockMoverUpButton,
	BlockMoverDownButton,
} from '../block-mover/button';
import ListViewBlockContents from './block-contents';
import BlockSettingsDropdown from '../block-settings-menu/block-settings-dropdown';
import { useListViewContext } from './context';
import { getBlockPositionDescription } from './utils';
import { store as blockEditorStore } from '../../store';
import useBlockDisplayInformation from '../use-block-display-information';
import { useBlockLock } from '../block-lock';

function ListViewBlock( {
	block,
	isDragged,
	isSelected,
	isBranchSelected,
	selectBlock,
	position,
	level,
	rowCount,
	siblingBlockCount,
	showBlockMovers,
	path,
	isExpanded,
	selectedClientIds,
	preventAnnouncement,
} ) {
	const cellRef = useRef( null );
	const [ isHovered, setIsHovered ] = useState( false );
	const { clientId } = block;
	const isFirstSelectedBlock =
		isSelected && selectedClientIds[ 0 ] === clientId;
	const isLastSelectedBlock =
		isSelected &&
		selectedClientIds[ selectedClientIds.length - 1 ] === clientId;

	const { toggleBlockHighlight } = useDispatch( blockEditorStore );

	const blockInformation = useBlockDisplayInformation( clientId );
	const blockName = useSelect(
		( select ) => select( blockEditorStore ).getBlockName( clientId ),
		[ clientId ]
	);

	// When a block hides its toolbar it also hides the block settings menu,
	// since that menu is part of the toolbar in the editor canvas.
	// List View respects this by also hiding the block settings menu.
	const showBlockActions = hasBlockSupport(
		blockName,
		'__experimentalToolbar',
		true
	);
	const { isLocked } = useBlockLock( clientId );
	const instanceId = useInstanceId( ListViewBlock );
	const descriptionId = `list-view-block-select-button__${ instanceId }`;
	const blockPositionDescription = getBlockPositionDescription(
		position,
		siblingBlockCount,
		level
	);

	let blockAriaLabel = __( 'Link' );
	if ( blockInformation ) {
		blockAriaLabel = isLocked
			? sprintf(
					// translators: %s: The title of the block. This string indicates a link to select the locked block.
					__( '%s link (locked)' ),
					blockInformation.title
			  )
			: sprintf(
					// translators: %s: The title of the block. This string indicates a link to select the block.
					__( '%s link' ),
					blockInformation.title
			  );
	}

	const settingsAriaLabel = blockInformation
		? sprintf(
				// translators: %s: The title of the block.
				__( 'Options for %s block' ),
				blockInformation.title
		  )
		: __( 'Options' );

	const { isTreeGridMounted, expand, collapse } = useListViewContext();

	const hasSiblings = siblingBlockCount > 0;
	const hasRenderedMovers = showBlockMovers && hasSiblings;
	const moverCellClassName = classnames(
		'block-editor-list-view-block__mover-cell',
		{ 'is-visible': isHovered || isSelected }
	);

	const listViewBlockSettingsClassName = classnames(
		'block-editor-list-view-block__menu-cell',
		{ 'is-visible': isHovered || isFirstSelectedBlock }
	);

	// If ListView has experimental features related to the Persistent List View,
	// only focus the selected list item on mount; otherwise the list would always
	// try to steal the focus from the editor canvas.
	useEffect( () => {
		if ( ! isTreeGridMounted && isSelected ) {
			cellRef.current.focus();
		}
	}, [] );

	const onMouseEnter = useCallback( () => {
		setIsHovered( true );
		toggleBlockHighlight( clientId, true );
	}, [ clientId, setIsHovered, toggleBlockHighlight ] );
	const onMouseLeave = useCallback( () => {
		setIsHovered( false );
		toggleBlockHighlight( clientId, false );
	}, [ clientId, setIsHovered, toggleBlockHighlight ] );

	const selectEditorBlock = useCallback(
		( event ) => {
			selectBlock( event, clientId );
			event.preventDefault();
		},
		[ clientId, selectBlock ]
	);

	const updateSelection = useCallback(
		( newClientId ) => {
			selectBlock( undefined, newClientId );
		},
		[ selectBlock ]
	);

	const toggleExpanded = useCallback(
		( event ) => {
			// Prevent shift+click from opening link in a new window when toggling.
			event.preventDefault();
			event.stopPropagation();
			if ( isExpanded === true ) {
				collapse( clientId );
			} else if ( isExpanded === false ) {
				expand( clientId );
			}
		},
		[ clientId, expand, collapse, isExpanded ]
	);

	let colSpan;
	if ( hasRenderedMovers ) {
		colSpan = 2;
	} else if ( ! showBlockActions ) {
		colSpan = 3;
	}

	const classes = classnames( {
		'is-selected': isSelected,
		'is-first-selected': isFirstSelectedBlock,
		'is-last-selected': isLastSelectedBlock,
		'is-branch-selected': isBranchSelected,
		'is-dragging': isDragged,
		'has-single-cell': ! showBlockActions,
	} );

	// Only include all selected blocks if the currently clicked on block
	// is one of the selected blocks. This ensures that if a user attempts
	// to alter a block that isn't part of the selection, they're still able
	// to do so.
	const dropdownClientIds = selectedClientIds.includes( clientId )
		? selectedClientIds
		: [ clientId ];

	return (
		<ListViewLeaf
			className={ classes }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
			onFocus={ onMouseEnter }
			onBlur={ onMouseLeave }
			level={ level }
			position={ position }
			rowCount={ rowCount }
			path={ path }
			id={ `list-view-block-${ clientId }` }
			data-block={ clientId }
			isExpanded={ isExpanded }
			aria-selected={ !! isSelected }
		>
			<TreeGridCell
				className="block-editor-list-view-block__contents-cell"
				colSpan={ colSpan }
				ref={ cellRef }
				aria-label={ blockAriaLabel }
				aria-selected={ !! isSelected }
				aria-expanded={ isExpanded }
				aria-describedby={ descriptionId }
			>
				{ ( { ref, tabIndex, onFocus } ) => (
					<div className="block-editor-list-view-block__contents-container">
						<ListViewBlockContents
							block={ block }
							onClick={ selectEditorBlock }
							onToggleExpanded={ toggleExpanded }
							isSelected={ isSelected }
							position={ position }
							siblingBlockCount={ siblingBlockCount }
							level={ level }
							ref={ ref }
							tabIndex={ tabIndex }
							onFocus={ onFocus }
							isExpanded={ isExpanded }
							selectedClientIds={ selectedClientIds }
							preventAnnouncement={ preventAnnouncement }
						/>
						<div
							className="block-editor-list-view-block-select-button__description"
							id={ descriptionId }
						>
							{ blockPositionDescription }
						</div>
					</div>
				) }
			</TreeGridCell>
			{ hasRenderedMovers && (
				<>
					<TreeGridCell
						className={ moverCellClassName }
						withoutGridItem
					>
						<TreeGridItem>
							{ ( { ref, tabIndex, onFocus } ) => (
								<BlockMoverUpButton
									orientation="vertical"
									clientIds={ [ clientId ] }
									ref={ ref }
									tabIndex={ tabIndex }
									onFocus={ onFocus }
								/>
							) }
						</TreeGridItem>
						<TreeGridItem>
							{ ( { ref, tabIndex, onFocus } ) => (
								<BlockMoverDownButton
									orientation="vertical"
									clientIds={ [ clientId ] }
									ref={ ref }
									tabIndex={ tabIndex }
									onFocus={ onFocus }
								/>
							) }
						</TreeGridItem>
					</TreeGridCell>
				</>
			) }

			{ showBlockActions && (
				<TreeGridCell
					className={ listViewBlockSettingsClassName }
					aria-selected={ !! isSelected }
				>
					{ ( { ref, tabIndex, onFocus } ) => (
						<BlockSettingsDropdown
							clientIds={ dropdownClientIds }
							icon={ moreVertical }
							label={ settingsAriaLabel }
							toggleProps={ {
								ref,
								className: 'block-editor-list-view-block__menu',
								tabIndex,
								onFocus,
							} }
							disableOpenOnArrowDown
							__experimentalSelectBlock={ updateSelection }
						/>
					) }
				</TreeGridCell>
			) }
		</ListViewLeaf>
	);
}

export default memo( ListViewBlock );
