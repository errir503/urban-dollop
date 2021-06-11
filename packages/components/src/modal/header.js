/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../button';

const ModalHeader = ( {
	icon,
	title,
	onClose,
	closeLabel,
	headingId,
	isDismissible,
} ) => {
	const label = closeLabel ? closeLabel : __( 'Close dialog' );

	return (
		<div className="components-modal__header">
			<div className="components-modal__header-heading-container">
				{ icon && (
					<span
						className="components-modal__icon-container"
						aria-hidden
					>
						{ icon }
					</span>
				) }
				{ title && (
					<h1
						id={ headingId }
						className="components-modal__header-heading"
					>
						{ title }
					</h1>
				) }
			</div>
			{ isDismissible && (
				<Button
					onClick={ onClose }
					icon={ closeSmall }
					label={ label }
				/>
			) }
		</div>
	);
};

export default ModalHeader;
