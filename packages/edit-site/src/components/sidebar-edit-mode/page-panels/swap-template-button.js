/**
 * WordPress dependencies
 */
import { useMemo, useState, useCallback } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { MenuItem, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { parse } from '@wordpress/blocks';
import { useAsyncList } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { useAvailableTemplates, useEditedPostContext } from './hooks';

export default function SwapTemplateButton( { onClick } ) {
	const [ showModal, setShowModal ] = useState( false );
	const availableTemplates = useAvailableTemplates();
	const onClose = useCallback( () => {
		setShowModal( false );
	}, [] );
	const { postType, postId } = useEditedPostContext();
	const { editEntityRecord } = useDispatch( coreStore );
	if ( ! availableTemplates?.length ) {
		return null;
	}
	const onTemplateSelect = async ( template ) => {
		editEntityRecord(
			'postType',
			postType,
			postId,
			{ template: template.name },
			{ undoIgnore: true }
		);
		onClose(); // Close the template suggestions modal first.
		onClick();
	};
	return (
		<>
			<MenuItem onClick={ () => setShowModal( true ) }>
				{ __( 'Swap template' ) }
			</MenuItem>
			{ showModal && (
				<Modal
					title={ __( 'Choose a template' ) }
					onRequestClose={ onClose }
					overlayClassName="edit-site-swap-template-modal"
					isFullScreen
				>
					<div className="edit-site-page-panels__swap-template__modal-content">
						<TemplatesList onSelect={ onTemplateSelect } />
					</div>
				</Modal>
			) }
		</>
	);
}

function TemplatesList( { onSelect } ) {
	const availableTemplates = useAvailableTemplates();
	const templatesAsPatterns = useMemo(
		() =>
			availableTemplates.map( ( template ) => ( {
				name: template.slug,
				blocks: parse( template.content.raw ),
				title: decodeEntities( template.title.rendered ),
				id: template.id,
			} ) ),
		[ availableTemplates ]
	);
	const shownTemplates = useAsyncList( templatesAsPatterns );
	return (
		<BlockPatternsList
			label={ __( 'Templates' ) }
			blockPatterns={ templatesAsPatterns }
			shownPatterns={ shownTemplates }
			onClickPattern={ onSelect }
		/>
	);
}
