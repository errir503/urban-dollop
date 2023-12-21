/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import {
	NavigableToolbar,
	ToolSelector,
	store as blockEditorStore,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import {
	EditorHistoryRedo,
	EditorHistoryUndo,
	store as editorStore,
} from '@wordpress/editor';
import { Button, ToolbarItem } from '@wordpress/components';
import { listView, plus } from '@wordpress/icons';
import { useRef, useCallback } from '@wordpress/element';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';
import { unlock } from '../../../lock-unlock';

const { useCanBlockToolbarBeFocused } = unlock( blockEditorPrivateApis );

const preventDefault = ( event ) => {
	event.preventDefault();
};

function HeaderToolbar( { hasFixedToolbar } ) {
	const inserterButton = useRef();
	const { setIsInserterOpened, setIsListViewOpened } =
		useDispatch( editorStore );
	const {
		isInserterEnabled,
		isInserterOpened,
		isTextModeEnabled,
		showIconLabels,
		isListViewOpen,
		listViewShortcut,
		listViewToggleRef,
	} = useSelect( ( select ) => {
		const { hasInserterItems, getBlockRootClientId, getBlockSelectionEnd } =
			select( blockEditorStore );
		const { getEditorSettings, isListViewOpened, getListViewToggleRef } =
			unlock( select( editorStore ) );
		const { getEditorMode, isFeatureActive } = select( editPostStore );
		const { getShortcutRepresentation } = select( keyboardShortcutsStore );

		return {
			// This setting (richEditingEnabled) should not live in the block editor's setting.
			isInserterEnabled:
				getEditorMode() === 'visual' &&
				getEditorSettings().richEditingEnabled &&
				hasInserterItems(
					getBlockRootClientId( getBlockSelectionEnd() )
				),
			isInserterOpened: select( editorStore ).isInserterOpened(),
			isTextModeEnabled: getEditorMode() === 'text',
			showIconLabels: isFeatureActive( 'showIconLabels' ),
			isListViewOpen: isListViewOpened(),
			listViewShortcut: getShortcutRepresentation(
				'core/editor/toggle-list-view'
			),
			listViewToggleRef: getListViewToggleRef(),
		};
	}, [] );

	const isLargeViewport = useViewportMatch( 'medium' );
	const isWideViewport = useViewportMatch( 'wide' );
	const blockToolbarCanBeFocused = useCanBlockToolbarBeFocused();

	/* translators: accessibility text for the editor toolbar */
	const toolbarAriaLabel = __( 'Document tools' );

	const toggleListView = useCallback(
		() => setIsListViewOpened( ! isListViewOpen ),
		[ setIsListViewOpened, isListViewOpen ]
	);
	const overflowItems = (
		<>
			<ToolbarItem
				as={ Button }
				className="edit-post-header-toolbar__document-overview-toggle"
				icon={ listView }
				disabled={ isTextModeEnabled }
				isPressed={ isListViewOpen }
				/* translators: button label text should, if possible, be under 16 characters. */
				label={ __( 'Document Overview' ) }
				onClick={ toggleListView }
				shortcut={ listViewShortcut }
				showTooltip={ ! showIconLabels }
				variant={ showIconLabels ? 'tertiary' : undefined }
				aria-expanded={ isListViewOpen }
				ref={ listViewToggleRef }
				size="compact"
			/>
		</>
	);
	const toggleInserter = useCallback( () => {
		if ( isInserterOpened ) {
			// Focusing the inserter button should close the inserter popover.
			// However, there are some cases it won't close when the focus is lost.
			// See https://github.com/WordPress/gutenberg/issues/43090 for more details.
			inserterButton.current.focus();
			setIsInserterOpened( false );
		} else {
			setIsInserterOpened( true );
		}
	}, [ isInserterOpened, setIsInserterOpened ] );

	/* translators: button label text should, if possible, be under 16 characters. */
	const longLabel = _x(
		'Toggle block inserter',
		'Generic label for block inserter button'
	);
	const shortLabel = ! isInserterOpened ? __( 'Add' ) : __( 'Close' );

	return (
		<NavigableToolbar
			className="edit-post-header-toolbar"
			aria-label={ toolbarAriaLabel }
			shouldUseKeyboardFocusShortcut={ ! blockToolbarCanBeFocused }
			variant="unstyled"
		>
			<div className="edit-post-header-toolbar__left">
				<ToolbarItem
					ref={ inserterButton }
					as={ Button }
					className="edit-post-header-toolbar__inserter-toggle"
					variant="primary"
					isPressed={ isInserterOpened }
					onMouseDown={ preventDefault }
					onClick={ toggleInserter }
					disabled={ ! isInserterEnabled }
					icon={ plus }
					label={ showIconLabels ? shortLabel : longLabel }
					showTooltip={ ! showIconLabels }
					aria-expanded={ isInserterOpened }
				/>
				{ ( isWideViewport || ! showIconLabels ) && (
					<>
						{ isLargeViewport && ! hasFixedToolbar && (
							<ToolbarItem
								as={ ToolSelector }
								showTooltip={ ! showIconLabels }
								variant={
									showIconLabels ? 'tertiary' : undefined
								}
								disabled={ isTextModeEnabled }
								size="compact"
							/>
						) }
						<ToolbarItem
							as={ EditorHistoryUndo }
							showTooltip={ ! showIconLabels }
							variant={ showIconLabels ? 'tertiary' : undefined }
							size="compact"
						/>
						<ToolbarItem
							as={ EditorHistoryRedo }
							showTooltip={ ! showIconLabels }
							variant={ showIconLabels ? 'tertiary' : undefined }
							size="compact"
						/>
						{ overflowItems }
					</>
				) }
			</div>
		</NavigableToolbar>
	);
}

export default HeaderToolbar;
