/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { MenuItem } from '@wordpress/components';
import { createBlock, serialize } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import { symbolFilled } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import CreateTemplatePartModal from '../create-template-part-modal';
import { store as editSiteStore } from '../../store';
import {
	useExistingTemplateParts,
	getUniqueTemplatePartTitle,
	getCleanTemplatePartSlug,
} from '../../utils/template-part-create';

export default function ConvertToTemplatePart( { clientIds, blocks } ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const { replaceBlocks } = useDispatch( blockEditorStore );
	const { saveEntityRecord } = useDispatch( coreStore );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const existingTemplateParts = useExistingTemplateParts();

	const { canCreate } = useSelect( ( select ) => {
		const { supportsTemplatePartsMode } =
			select( editSiteStore ).getSettings();
		return {
			canCreate: ! supportsTemplatePartsMode,
		};
	}, [] );

	if ( ! canCreate ) {
		return null;
	}

	const onConvert = async ( { title, area } ) => {
		const uniqueTitle = getUniqueTemplatePartTitle(
			title,
			existingTemplateParts
		);
		const cleanSlug = getCleanTemplatePartSlug( uniqueTitle );

		const templatePart = await saveEntityRecord(
			'postType',
			'wp_template_part',
			{
				slug: cleanSlug,
				title: uniqueTitle,
				content: serialize( blocks ),
				area,
			}
		);
		replaceBlocks(
			clientIds,
			createBlock( 'core/template-part', {
				slug: templatePart.slug,
				theme: templatePart.theme,
			} )
		);
		createSuccessNotice( __( 'Template part created.' ), {
			type: 'snackbar',
		} );

		// The modal and this component will be unmounted because of `replaceBlocks` above,
		// so no need to call `closeModal` or `onClose`.
	};

	return (
		<>
			<BlockSettingsMenuControls>
				{ () => (
					<MenuItem
						icon={ symbolFilled }
						onClick={ () => {
							setIsModalOpen( true );
						} }
					>
						{ __( 'Create Template part' ) }
					</MenuItem>
				) }
			</BlockSettingsMenuControls>
			{ isModalOpen && (
				<CreateTemplatePartModal
					closeModal={ () => {
						setIsModalOpen( false );
					} }
					onCreate={ onConvert }
				/>
			) }
		</>
	);
}
