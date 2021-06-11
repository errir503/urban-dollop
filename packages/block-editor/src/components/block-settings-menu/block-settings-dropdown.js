/**
 * External dependencies
 */
import { castArray, flow, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { moreVertical } from '@wordpress/icons';

import { Children, cloneElement, useCallback } from '@wordpress/element';
import { serialize } from '@wordpress/blocks';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { useCopyToClipboard } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockActions from '../block-actions';
import BlockModeToggle from './block-mode-toggle';
import BlockHTMLConvertButton from './block-html-convert-button';
import __experimentalBlockSettingsMenuFirstItem from './block-settings-menu-first-item';
import BlockSettingsMenuControls from '../block-settings-menu-controls';

const POPOVER_PROPS = {
	className: 'block-editor-block-settings-menu__popover',
	position: 'bottom right',
	isAlternate: true,
};

function CopyMenuItem( { blocks, onCopy } ) {
	const ref = useCopyToClipboard( () => serialize( blocks ), onCopy );
	return <MenuItem ref={ ref }>{ __( 'Copy' ) }</MenuItem>;
}

export function BlockSettingsDropdown( {
	clientIds,
	__experimentalSelectBlock,
	children,
	...props
} ) {
	const blockClientIds = castArray( clientIds );
	const count = blockClientIds.length;
	const firstBlockClientId = blockClientIds[ 0 ];

	const shortcuts = useSelect( ( select ) => {
		const { getShortcutRepresentation } = select( keyboardShortcutsStore );
		return {
			duplicate: getShortcutRepresentation(
				'core/block-editor/duplicate'
			),
			remove: getShortcutRepresentation( 'core/block-editor/remove' ),
			insertAfter: getShortcutRepresentation(
				'core/block-editor/insert-after'
			),
			insertBefore: getShortcutRepresentation(
				'core/block-editor/insert-before'
			),
		};
	}, [] );

	const updateSelection = useCallback(
		__experimentalSelectBlock
			? async ( clientIdsPromise ) => {
					const ids = await clientIdsPromise;
					if ( ids && ids[ 0 ] ) {
						__experimentalSelectBlock( ids[ 0 ] );
					}
			  }
			: noop,
		[ __experimentalSelectBlock ]
	);

	const removeBlockLabel =
		count === 1 ? __( 'Remove block' ) : __( 'Remove blocks' );

	return (
		<BlockActions
			clientIds={ clientIds }
			__experimentalUpdateSelection={ ! __experimentalSelectBlock }
		>
			{ ( {
				canDuplicate,
				canInsertDefaultBlock,
				isLocked,
				onDuplicate,
				onInsertAfter,
				onInsertBefore,
				onRemove,
				onCopy,
				onMoveTo,
				blocks,
			} ) => (
				<DropdownMenu
					icon={ moreVertical }
					label={ __( 'Options' ) }
					className="block-editor-block-settings-menu"
					popoverProps={ POPOVER_PROPS }
					noIcons
					{ ...props }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<__experimentalBlockSettingsMenuFirstItem.Slot
									fillProps={ { onClose } }
								/>
								{ count === 1 && (
									<BlockHTMLConvertButton
										clientId={ firstBlockClientId }
									/>
								) }
								<CopyMenuItem
									blocks={ blocks }
									onCopy={ onCopy }
								/>
								{ canDuplicate && (
									<MenuItem
										onClick={ flow(
											onClose,
											onDuplicate,
											updateSelection
										) }
										shortcut={ shortcuts.duplicate }
									>
										{ __( 'Duplicate' ) }
									</MenuItem>
								) }
								{ canInsertDefaultBlock && (
									<>
										<MenuItem
											onClick={ flow(
												onClose,
												onInsertBefore
											) }
											shortcut={ shortcuts.insertBefore }
										>
											{ __( 'Insert before' ) }
										</MenuItem>
										<MenuItem
											onClick={ flow(
												onClose,
												onInsertAfter
											) }
											shortcut={ shortcuts.insertAfter }
										>
											{ __( 'Insert after' ) }
										</MenuItem>
									</>
								) }
								{ ! isLocked && (
									<MenuItem
										onClick={ flow( onClose, onMoveTo ) }
									>
										{ __( 'Move to' ) }
									</MenuItem>
								) }
								{ count === 1 && (
									<BlockModeToggle
										clientId={ firstBlockClientId }
										onToggle={ onClose }
									/>
								) }
							</MenuGroup>
							<BlockSettingsMenuControls.Slot
								fillProps={ { onClose } }
								clientIds={ clientIds }
							/>
							{ typeof children === 'function'
								? children( { onClose } )
								: Children.map( ( child ) =>
										cloneElement( child, { onClose } )
								  ) }
							<MenuGroup>
								{ ! isLocked && (
									<MenuItem
										onClick={ flow(
											onClose,
											onRemove,
											updateSelection
										) }
										shortcut={ shortcuts.remove }
									>
										{ removeBlockLabel }
									</MenuItem>
								) }
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
			) }
		</BlockActions>
	);
}

export default BlockSettingsDropdown;
