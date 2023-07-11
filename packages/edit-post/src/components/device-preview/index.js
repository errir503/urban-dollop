/**
 * WordPress dependencies
 */
import { Icon, MenuGroup } from '@wordpress/components';
import { PostPreviewButton, store as editorStore } from '@wordpress/editor';
import { external } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { __experimentalPreviewOptions as PreviewOptions } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../store';

export default function DevicePreview() {
	const { hasActiveMetaboxes, isPostSaveable, isViewable, deviceType } =
		useSelect( ( select ) => {
			const { getEditedPostAttribute } = select( editorStore );
			const { getPostType } = select( coreStore );
			const postType = getPostType( getEditedPostAttribute( 'type' ) );

			return {
				hasActiveMetaboxes: select( editPostStore ).hasMetaBoxes(),
				isPostSaveable: select( editorStore ).isEditedPostSaveable(),
				isViewable: postType?.viewable ?? false,
				deviceType:
					select(
						editPostStore
					).__experimentalGetPreviewDeviceType(),
			};
		}, [] );
	const { __experimentalSetPreviewDeviceType: setPreviewDeviceType } =
		useDispatch( editPostStore );

	return (
		<PreviewOptions
			isEnabled={ isPostSaveable }
			className="edit-post-post-preview-dropdown"
			deviceType={ deviceType }
			setDeviceType={ setPreviewDeviceType }
			label={ __( 'Preview' ) }
		>
			{ ( { onClose } ) =>
				isViewable && (
					<MenuGroup>
						<div className="edit-post-header-preview__grouping-external">
							<PostPreviewButton
								className="edit-post-header-preview__button-external"
								role="menuitem"
								forceIsAutosaveable={ hasActiveMetaboxes }
								textContent={
									<>
										{ __( 'Preview in new tab' ) }
										<Icon icon={ external } />
									</>
								}
								onPreview={ onClose }
							/>
						</div>
					</MenuGroup>
				)
			}
		</PreviewOptions>
	);
}
