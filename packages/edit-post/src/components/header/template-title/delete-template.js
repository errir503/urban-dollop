/**
 * External dependencies
 */
import { pickBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	MenuGroup,
	MenuItem,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

export default function DeleteTemplate() {
	const { clearSelectedBlock } = useDispatch( blockEditorStore );
	const { setIsEditingTemplate } = useDispatch( editPostStore );
	const { getEditorSettings } = useSelect( editorStore );
	const { updateEditorSettings, editPost } = useDispatch( editorStore );
	const { deleteEntityRecord } = useDispatch( coreStore );
	const { template } = useSelect( ( select ) => {
		const { isEditingTemplate, getEditedPostTemplate } =
			select( editPostStore );
		const _isEditing = isEditingTemplate();
		return {
			template: _isEditing ? getEditedPostTemplate() : null,
		};
	}, [] );
	const [ showConfirmDialog, setShowConfirmDialog ] = useState( false );

	if ( ! template || ! template.wp_id ) {
		return null;
	}
	let templateTitle = template.slug;
	if ( template?.title ) {
		templateTitle = template.title;
	}

	const isRevertable = template?.has_theme_file;

	const onDelete = () => {
		clearSelectedBlock();
		setIsEditingTemplate( false );
		setShowConfirmDialog( false );

		editPost( {
			template: '',
		} );
		const settings = getEditorSettings();
		const newAvailableTemplates = pickBy(
			settings.availableTemplates,
			( _title, id ) => {
				return id !== template.slug;
			}
		);
		updateEditorSettings( {
			...settings,
			availableTemplates: newAvailableTemplates,
		} );
		deleteEntityRecord( 'postType', 'wp_template', template.id, {
			throwOnError: true,
		} );
	};

	return (
		<MenuGroup className="edit-post-template-top-area__second-menu-group">
			<>
				<MenuItem
					className="edit-post-template-top-area__delete-template-button"
					isDestructive={ ! isRevertable }
					onClick={ () => {
						setShowConfirmDialog( true );
					} }
					info={
						isRevertable
							? __( 'Use the template as supplied by the theme.' )
							: undefined
					}
				>
					{ isRevertable
						? __( 'Clear customizations' )
						: __( 'Delete template' ) }
				</MenuItem>
				<ConfirmDialog
					isOpen={ showConfirmDialog }
					onConfirm={ onDelete }
					onCancel={ () => {
						setShowConfirmDialog( false );
					} }
				>
					{ sprintf(
						/* translators: %s: template name */
						__(
							'Are you sure you want to delete the %s template? It may be used by other pages or posts.'
						),
						templateTitle
					) }
				</ConfirmDialog>
			</>
		</MenuGroup>
	);
}
