/**
 * WordPress dependencies
 */
import {
	hasBlockSupport,
	isReusableBlock,
	createBlock,
	serialize,
} from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useState, useCallback } from '@wordpress/element';
import { MenuItem } from '@wordpress/components';
import { symbol } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
/**
 * Internal dependencies
 */
import { store as patternsStore } from '../store';
import CreatePatternModal from './create-pattern-modal';
import { unlock } from '../lock-unlock';

/**
 * Menu control to convert block(s) to a pattern block.
 *
 * @param {Object}   props              Component props.
 * @param {string[]} props.clientIds    Client ids of selected blocks.
 * @param {string}   props.rootClientId ID of the currently selected top-level block.
 * @return {import('@wordpress/element').WPComponent} The menu control or null.
 */
export default function PatternConvertButton( { clientIds, rootClientId } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { replaceBlocks } = useDispatch( blockEditorStore );
	// Ignore reason: false positive of the lint rule.
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return
	const { setEditingPattern } = unlock( useDispatch( patternsStore ) );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const canConvert = useSelect(
		( select ) => {
			const { canUser } = select( coreStore );
			const {
				getBlocksByClientId,
				canInsertBlockType,
				getBlockRootClientId,
			} = select( blockEditorStore );

			const rootId =
				rootClientId ||
				( clientIds.length > 0
					? getBlockRootClientId( clientIds[ 0 ] )
					: undefined );

			const blocks = getBlocksByClientId( clientIds ) ?? [];

			const isReusable =
				blocks.length === 1 &&
				blocks[ 0 ] &&
				isReusableBlock( blocks[ 0 ] ) &&
				!! select( coreStore ).getEntityRecord(
					'postType',
					'wp_block',
					blocks[ 0 ].attributes.ref
				);

			const _canConvert =
				// Hide when this is already a synced pattern.
				! isReusable &&
				// Hide when patterns are disabled.
				canInsertBlockType( 'core/block', rootId ) &&
				blocks.every(
					( block ) =>
						// Guard against the case where a regular block has *just* been converted.
						!! block &&
						// Hide on invalid blocks.
						block.isValid &&
						// Hide when block doesn't support being made into a pattern.
						hasBlockSupport( block.name, 'reusable', true )
				) &&
				// Hide when current doesn't have permission to do that.
				!! canUser( 'create', 'blocks' );

			return _canConvert;
		},
		[ clientIds, rootClientId ]
	);
	const { getBlocksByClientId } = useSelect( blockEditorStore );
	const getContent = useCallback(
		() => serialize( getBlocksByClientId( clientIds ) ),
		[ getBlocksByClientId, clientIds ]
	);

	if ( ! canConvert ) {
		return null;
	}

	const handleSuccess = ( { pattern } ) => {
		const newBlock = createBlock( 'core/block', {
			ref: pattern.id,
		} );

		replaceBlocks( clientIds, newBlock );
		setEditingPattern( newBlock.clientId, true );

		createSuccessNotice(
			pattern.wp_pattern_sync_status === 'unsynced'
				? sprintf(
						// translators: %s: the name the user has given to the pattern.
						__( 'Unsynced Pattern created: %s' ),
						pattern.title.raw
				  )
				: sprintf(
						// translators: %s: the name the user has given to the pattern.
						__( 'Synced Pattern created: %s' ),
						pattern.title.raw
				  ),
			{
				type: 'snackbar',
				id: 'convert-to-pattern-success',
			}
		);
		setIsModalOpen( false );
	};
	return (
		<>
			<MenuItem
				icon={ symbol }
				onClick={ () => setIsModalOpen( true ) }
				aria-expanded={ isModalOpen }
				aria-haspopup="dialog"
			>
				{ __( 'Create pattern' ) }
			</MenuItem>
			{ isModalOpen && (
				<CreatePatternModal
					content={ getContent }
					onSuccess={ ( pattern ) => {
						handleSuccess( pattern );
					} }
					onError={ () => {
						setIsModalOpen( false );
					} }
					onClose={ () => {
						setIsModalOpen( false );
					} }
				/>
			) }
		</>
	);
}
