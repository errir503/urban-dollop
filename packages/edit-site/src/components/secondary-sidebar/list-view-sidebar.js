/**
 * WordPress dependencies
 */
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useFocusOnMount, useMergeRefs } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { ESCAPE } from '@wordpress/keycodes';
import { focus } from '@wordpress/dom';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { PrivateListView } = unlock( blockEditorPrivateApis );

export default function ListViewSidebar() {
	const { setIsListViewOpened } = useDispatch( editorStore );
	const { getListViewToggleRef } = unlock( useSelect( editorStore ) );

	// This hook handles focus when the sidebar first renders.
	const focusOnMountRef = useFocusOnMount( 'firstElement' );

	// When closing the list view, focus should return to the toggle button.
	const closeListView = useCallback( () => {
		setIsListViewOpened( false );
		getListViewToggleRef().current?.focus();
	}, [ getListViewToggleRef, setIsListViewOpened ] );

	const closeOnEscape = useCallback(
		( event ) => {
			if ( event.keyCode === ESCAPE && ! event.defaultPrevented ) {
				event.preventDefault();
				closeListView();
			}
		},
		[ closeListView ]
	);

	// Use internal state instead of a ref to make sure that the component
	// re-renders when the dropZoneElement updates.
	const [ dropZoneElement, setDropZoneElement ] = useState( null );

	// This ref refers to the sidebar as a whole.
	const sidebarRef = useRef();
	// This ref refers to the close button.
	const sidebarCloseButtonRef = useRef();
	// This ref refers to the list view application area.
	const listViewRef = useRef();

	/*
	 * Callback function to handle list view or close button focus.
	 *
	 * @return void
	 */
	function handleSidebarFocus() {
		// Either focus the list view or the sidebar close button. Must have a fallback because the list view does not render when there are no blocks.
		const listViewApplicationFocus = focus.tabbable.find(
			listViewRef.current
		)[ 0 ];
		const listViewFocusArea = sidebarRef.current.contains(
			listViewApplicationFocus
		)
			? listViewApplicationFocus
			: sidebarCloseButtonRef.current;
		listViewFocusArea.focus();
	}

	const handleToggleListViewShortcut = useCallback( () => {
		// If the sidebar has focus, it is safe to close.
		if (
			sidebarRef.current.contains(
				sidebarRef.current.ownerDocument.activeElement
			)
		) {
			closeListView();
		} else {
			// If the list view or close button does not have focus, focus should be moved to it.
			handleSidebarFocus();
		}
	}, [ closeListView ] );

	// This only fires when the sidebar is open because of the conditional rendering.
	// It is the same shortcut to open but that is defined as a global shortcut and only fires when the sidebar is closed.
	useShortcut( 'core/editor/toggle-list-view', handleToggleListViewShortcut );

	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			className="edit-site-editor__list-view-panel"
			onKeyDown={ closeOnEscape }
			ref={ sidebarRef }
		>
			<div className="edit-site-editor__list-view-panel-header">
				<strong>{ __( 'List View' ) }</strong>
				<Button
					icon={ closeSmall }
					label={ __( 'Close' ) }
					onClick={ closeListView }
					ref={ sidebarCloseButtonRef }
				/>
			</div>
			<div
				className="edit-site-editor__list-view-panel-content"
				ref={ useMergeRefs( [
					focusOnMountRef,
					setDropZoneElement,
					listViewRef,
				] ) }
			>
				<PrivateListView dropZoneElement={ dropZoneElement } />
			</div>
		</div>
	);
}
