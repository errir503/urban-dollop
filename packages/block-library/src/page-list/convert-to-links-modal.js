/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const convertDescription = __(
	"This navigation menu displays your website's pages. Editing it will enable you to add, delete, or reorder pages. However, new pages will no longer be added automatically."
);

export function ConvertToLinksModal( { onClick, onClose, disabled } ) {
	return (
		<Modal
			onRequestClose={ onClose }
			title={ __( 'Edit Page List' ) }
			className={ 'wp-block-page-list-modal' }
			aria={ {
				describedby: 'wp-block-page-list-modal__description',
			} }
		>
			<p id={ 'wp-block-page-list-modal__description' }>
				{ convertDescription }
			</p>
			<div className="wp-block-page-list-modal-buttons">
				<Button variant="tertiary" onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					disabled={ disabled }
					onClick={ onClick }
				>
					{ __( 'Edit' ) }
				</Button>
			</div>
		</Modal>
	);
}
