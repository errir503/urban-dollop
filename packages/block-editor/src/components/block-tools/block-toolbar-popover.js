/**
 * External dependencies
 */
import classnames from 'classnames';
/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
/**
 * Internal dependencies
 */
import BlockPopover from '../block-popover';
import useBlockToolbarPopoverProps from './use-block-toolbar-popover-props';
import useSelectedBlockToolProps from './use-selected-block-tool-props';
import { store as blockEditorStore } from '../../store';
import { PrivateBlockToolbar } from '../block-toolbar';

export default function BlockToolbarPopover( {
	clientId,
	isTyping,
	__unstableContentRef,
} ) {
	const { capturingClientId, isInsertionPointVisible, lastClientId } =
		useSelectedBlockToolProps( clientId );

	// Stores the active toolbar item index so the block toolbar can return focus
	// to it when re-mounting.
	const initialToolbarItemIndexRef = useRef();

	useEffect( () => {
		// Resets the index whenever the active block changes so this is not
		// persisted. See https://github.com/WordPress/gutenberg/pull/25760#issuecomment-717906169
		initialToolbarItemIndexRef.current = undefined;
	}, [ clientId ] );

	const { stopTyping } = useDispatch( blockEditorStore );
	const isToolbarForced = useRef( false );

	useShortcut( 'core/block-editor/focus-toolbar', () => {
		isToolbarForced.current = true;
		stopTyping( true );
	} );

	useEffect( () => {
		isToolbarForced.current = false;
	} );

	const popoverProps = useBlockToolbarPopoverProps( {
		contentElement: __unstableContentRef?.current,
		clientId,
	} );

	return (
		! isTyping && (
			<BlockPopover
				clientId={ capturingClientId || clientId }
				bottomClientId={ lastClientId }
				className={ classnames(
					'block-editor-block-list__block-popover',
					{
						'is-insertion-point-visible': isInsertionPointVisible,
					}
				) }
				resize={ false }
				{ ...popoverProps }
			>
				<PrivateBlockToolbar
					// If the toolbar is being shown because of being forced
					// it should focus the toolbar right after the mount.
					focusOnMount={ isToolbarForced.current }
					__experimentalInitialIndex={
						initialToolbarItemIndexRef.current
					}
					__experimentalOnIndexChange={ ( index ) => {
						initialToolbarItemIndexRef.current = index;
					} }
					variant="toolbar"
				/>
			</BlockPopover>
		)
	);
}
