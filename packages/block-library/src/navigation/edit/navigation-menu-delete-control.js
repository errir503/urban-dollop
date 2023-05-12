/**
 * WordPress dependencies
 */
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import {
	store as coreStore,
	useEntityId,
	useEntityProp,
} from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

export default function NavigationMenuDeleteControl( { onDelete } ) {
	const [ isConfirmModalVisible, setIsConfirmModalVisible ] =
		useState( false );
	const id = useEntityId( 'postType', 'wp_navigation' );
	const [ title ] = useEntityProp( 'postType', 'wp_navigation', 'title' );
	const { deleteEntityRecord } = useDispatch( coreStore );

	return (
		<>
			<Button
				className="wp-block-navigation-delete-menu-button"
				variant="secondary"
				isDestructive
				onClick={ () => {
					setIsConfirmModalVisible( true );
				} }
			>
				{ __( 'Delete menu' ) }
			</Button>
			{ isConfirmModalVisible && (
				<Modal
					title={ sprintf(
						/* translators: %s: the name of a menu to delete */
						__( 'Delete %s' ),
						title
					) }
					onRequestClose={ () => setIsConfirmModalVisible( false ) }
				>
					<p>
						{ __(
							'Are you sure you want to delete this navigation menu?'
						) }
					</p>
					<HStack justify="right">
						<Button
							variant="tertiary"
							onClick={ () => {
								setIsConfirmModalVisible( false );
							} }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ () => {
								deleteEntityRecord(
									'postType',
									'wp_navigation',
									id,
									{ force: true }
								);
								onDelete( title );
							} }
						>
							{ __( 'Confirm' ) }
						</Button>
					</HStack>
				</Modal>
			) }
		</>
	);
}
