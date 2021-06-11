/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import { Button, ToolbarItem, VisuallyHidden } from '@wordpress/components';
import {
	BlockNavigationDropdown,
	NavigableToolbar,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PinnedItems } from '@wordpress/interface';
import { plus } from '@wordpress/icons';
import { useRef } from '@wordpress/element';
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SaveButton from '../save-button';
import UndoButton from './undo-redo/undo';
import RedoButton from './undo-redo/redo';
import MoreMenu from '../more-menu';
import useLastSelectedWidgetArea from '../../hooks/use-last-selected-widget-area';
import { store as editWidgetsStore } from '../../store';

function Header() {
	const isMediumViewport = useViewportMatch( 'medium' );
	const inserterButton = useRef();
	const widgetAreaClientId = useLastSelectedWidgetArea();
	const isLastSelectedWidgetAreaOpen = useSelect(
		( select ) =>
			select( editWidgetsStore ).getIsWidgetAreaOpen(
				widgetAreaClientId
			),
		[ widgetAreaClientId ]
	);
	const isInserterOpened = useSelect( ( select ) =>
		select( editWidgetsStore ).isInserterOpened()
	);
	const { setIsWidgetAreaOpen, setIsInserterOpened } = useDispatch(
		editWidgetsStore
	);
	const { selectBlock } = useDispatch( blockEditorStore );
	const handleClick = () => {
		if ( isInserterOpened ) {
			// Focusing the inserter button closes the inserter popover
			inserterButton.current.focus();
		} else {
			if ( ! isLastSelectedWidgetAreaOpen ) {
				// Select the last selected block if hasn't already.
				selectBlock( widgetAreaClientId );
				// Open the last selected widget area when opening the inserter.
				setIsWidgetAreaOpen( widgetAreaClientId, true );
			}
			// The DOM updates resulting from selectBlock() and setIsInserterOpened() calls are applied the
			// same tick and pretty much in a random order. The inserter is closed if any other part of the
			// app receives focus. If selectBlock() happens to take effect after setIsInserterOpened() then
			// the inserter is visible for a brief moment and then gets auto-closed due to focus moving to
			// the selected block.
			window.requestAnimationFrame( () => setIsInserterOpened( true ) );
		}
	};

	return (
		<>
			<div className="edit-widgets-header">
				<div className="edit-widgets-header__navigable-toolbar-wrapper">
					{ isMediumViewport && (
						<h1 className="edit-widgets-header__title">
							{ __( 'Widgets' ) }
						</h1>
					) }
					{ ! isMediumViewport && (
						<VisuallyHidden
							as="h1"
							className="edit-widgets-header__title"
						>
							{ __( 'Widgets' ) }
						</VisuallyHidden>
					) }
					<NavigableToolbar
						className="edit-widgets-header-toolbar"
						aria-label={ __( 'Document tools' ) }
					>
						<ToolbarItem
							ref={ inserterButton }
							as={ Button }
							className="edit-widgets-header-toolbar__inserter-toggle"
							isPrimary
							isPressed={ isInserterOpened }
							onMouseDown={ ( event ) => {
								event.preventDefault();
							} }
							onClick={ handleClick }
							icon={ plus }
							/* translators: button label text should, if possible, be under 16
					characters. */
							label={ _x(
								'Add block',
								'Generic label for block inserter button'
							) }
						/>
						{ isMediumViewport && (
							<>
								<UndoButton />
								<RedoButton />
								<ToolbarItem as={ BlockNavigationDropdown } />
							</>
						) }
					</NavigableToolbar>
				</div>
				<div className="edit-widgets-header__actions">
					<SaveButton />
					<PinnedItems.Slot scope="core/edit-widgets" />
					<MoreMenu />
				</div>
			</div>
		</>
	);
}

export default Header;
