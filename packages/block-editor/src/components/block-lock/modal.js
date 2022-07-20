/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	Icon,
	Modal,
	ToggleControl,
} from '@wordpress/components';
import { lock as lockIcon, unlock as unlockIcon } from '@wordpress/icons';
import { useInstanceId } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { isReusableBlock, getBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import useBlockLock from './use-block-lock';
import useBlockDisplayInformation from '../use-block-display-information';
import { store as blockEditorStore } from '../../store';

function getTemplateLockValue( lock ) {
	// Prevents all operations.
	if ( lock.remove && lock.move ) {
		return 'all';
	}

	// Prevents inserting or removing blocks, but allows moving existing blocks.
	if ( lock.remove && ! lock.move ) {
		return 'insert';
	}

	return false;
}

export default function BlockLockModal( { clientId, onClose } ) {
	const [ lock, setLock ] = useState( { move: false, remove: false } );
	const { canEdit, canMove, canRemove } = useBlockLock( clientId );
	const { isReusable, templateLock, hasTemplateLock } = useSelect(
		( select ) => {
			const { getBlockName, getBlockAttributes } =
				select( blockEditorStore );
			const blockName = getBlockName( clientId );
			const blockType = getBlockType( blockName );

			return {
				isReusable: isReusableBlock( blockType ),
				templateLock: getBlockAttributes( clientId )?.templateLock,
				hasTemplateLock: !! blockType?.attributes?.templateLock,
			};
		},
		[ clientId ]
	);
	const [ applyTemplateLock, setApplyTemplateLock ] = useState(
		!! templateLock
	);
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const blockInformation = useBlockDisplayInformation( clientId );
	const instanceId = useInstanceId(
		BlockLockModal,
		'block-editor-block-lock-modal__options-title'
	);

	useEffect( () => {
		setLock( {
			move: ! canMove,
			remove: ! canRemove,
			...( isReusable ? { edit: ! canEdit } : {} ),
		} );
	}, [ canEdit, canMove, canRemove, isReusable ] );

	const isAllChecked = Object.values( lock ).every( Boolean );
	const isMixed = Object.values( lock ).some( Boolean ) && ! isAllChecked;

	return (
		<Modal
			title={ sprintf(
				/* translators: %s: Name of the block. */
				__( 'Lock %s' ),
				blockInformation.title
			) }
			overlayClassName="block-editor-block-lock-modal"
			closeLabel={ __( 'Close' ) }
			onRequestClose={ onClose }
		>
			<p>
				{ __(
					'Choose specific attributes to restrict or lock all available options.'
				) }
			</p>
			<form
				onSubmit={ ( event ) => {
					event.preventDefault();
					updateBlockAttributes( [ clientId ], {
						lock,
						templateLock: applyTemplateLock
							? getTemplateLockValue( lock )
							: undefined,
					} );
					onClose();
				} }
			>
				<div
					role="group"
					aria-labelledby={ instanceId }
					className="block-editor-block-lock-modal__options"
				>
					<CheckboxControl
						className="block-editor-block-lock-modal__options-title"
						label={
							<span id={ instanceId }>{ __( 'Lock all' ) }</span>
						}
						checked={ isAllChecked }
						indeterminate={ isMixed }
						onChange={ ( newValue ) =>
							setLock( {
								move: newValue,
								remove: newValue,
								...( isReusable ? { edit: newValue } : {} ),
							} )
						}
					/>
					<ul className="block-editor-block-lock-modal__checklist">
						{ isReusable && (
							<li className="block-editor-block-lock-modal__checklist-item">
								<CheckboxControl
									label={
										<>
											{ __( 'Restrict editing' ) }
											<Icon
												icon={
													lock.edit
														? lockIcon
														: unlockIcon
												}
											/>
										</>
									}
									checked={ !! lock.edit }
									onChange={ ( edit ) =>
										setLock( ( prevLock ) => ( {
											...prevLock,
											edit,
										} ) )
									}
								/>
							</li>
						) }
						<li className="block-editor-block-lock-modal__checklist-item">
							<CheckboxControl
								label={
									<>
										{ __( 'Disable movement' ) }
										<Icon
											icon={
												lock.move
													? lockIcon
													: unlockIcon
											}
										/>
									</>
								}
								checked={ lock.move }
								onChange={ ( move ) =>
									setLock( ( prevLock ) => ( {
										...prevLock,
										move,
									} ) )
								}
							/>
						</li>
						<li className="block-editor-block-lock-modal__checklist-item">
							<CheckboxControl
								label={
									<>
										{ __( 'Prevent removal' ) }
										<Icon
											icon={
												lock.remove
													? lockIcon
													: unlockIcon
											}
										/>
									</>
								}
								checked={ lock.remove }
								onChange={ ( remove ) =>
									setLock( ( prevLock ) => ( {
										...prevLock,
										remove,
									} ) )
								}
							/>
						</li>
					</ul>
					{ hasTemplateLock && (
						<ToggleControl
							className="block-editor-block-lock-modal__template-lock"
							label={ __( 'Apply to all blocks inside' ) }
							checked={ applyTemplateLock }
							disabled={ lock.move && ! lock.remove }
							onChange={ () =>
								setApplyTemplateLock( ! applyTemplateLock )
							}
						/>
					) }
				</div>
				<Flex
					className="block-editor-block-lock-modal__actions"
					justify="flex-end"
					expanded={ false }
				>
					<FlexItem>
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
					</FlexItem>
					<FlexItem>
						<Button variant="primary" type="submit">
							{ __( 'Apply' ) }
						</Button>
					</FlexItem>
				</Flex>
			</form>
		</Modal>
	);
}
