/**
 * WordPress dependencies
 */
import {
	TextControl,
	Button,
	Modal,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';
import { serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { SYNC_TYPES, USER_PATTERN_CATEGORY } from '../page-patterns/utils';

export default function CreatePatternModal( {
	blocks = [],
	closeModal,
	onCreate,
	onError,
	title,
} ) {
	const [ name, setName ] = useState( '' );
	const [ syncType, setSyncType ] = useState( SYNC_TYPES.unsynced );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const onSyncChange = () => {
		setSyncType(
			syncType === SYNC_TYPES.full ? SYNC_TYPES.unsynced : SYNC_TYPES.full
		);
	};

	const { createErrorNotice } = useDispatch( noticesStore );
	const { saveEntityRecord } = useDispatch( coreStore );

	async function createPattern() {
		if ( ! name ) {
			createErrorNotice( __( 'Please enter a pattern name.' ), {
				type: 'snackbar',
			} );
			return;
		}

		try {
			const pattern = await saveEntityRecord(
				'postType',
				'wp_block',
				{
					title: name || __( 'Untitled Pattern' ),
					content: blocks?.length ? serialize( blocks ) : '',
					status: 'publish',
					meta:
						syncType === SYNC_TYPES.unsynced
							? { wp_pattern_sync_status: syncType }
							: undefined,
				},
				{ throwOnError: true }
			);

			onCreate( { pattern, categoryId: USER_PATTERN_CATEGORY } );
		} catch ( error ) {
			const errorMessage =
				error.message && error.code !== 'unknown_error'
					? error.message
					: __( 'An error occurred while creating the pattern.' );

			createErrorNotice( errorMessage, { type: 'snackbar' } );
			onError();
		}
	}

	return (
		<Modal
			title={ title || __( 'Create pattern' ) }
			onRequestClose={ closeModal }
			overlayClassName="edit-site-create-pattern-modal"
		>
			<form
				onSubmit={ async ( event ) => {
					event.preventDefault();
					if ( ! name ) {
						return;
					}
					setIsSubmitting( true );
					await createPattern();
				} }
			>
				<VStack spacing="4">
					<TextControl
						className="edit-site-create-pattern-modal__input"
						label={ __( 'Name' ) }
						onChange={ setName }
						placeholder={ __( 'My pattern' ) }
						required
						value={ name }
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Keep all pattern instances in sync' ) }
						onChange={ onSyncChange }
						help={ __(
							'Editing the original pattern will also update anywhere the pattern is used.'
						) }
						checked={ syncType === SYNC_TYPES.full }
					/>
					<HStack justify="right">
						<Button
							variant="tertiary"
							onClick={ () => {
								closeModal();
							} }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={ ! name }
							isBusy={ isSubmitting }
						>
							{ __( 'Create' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Modal>
	);
}
