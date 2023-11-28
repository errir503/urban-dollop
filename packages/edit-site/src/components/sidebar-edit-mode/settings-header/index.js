/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../../../store/constants';
import { SIDEBAR_BLOCK, SIDEBAR_TEMPLATE } from '../constants';
import { store as editSiteStore } from '../../../store';
import { POST_TYPE_LABELS, TEMPLATE_POST_TYPE } from '../../../utils/constants';

const SettingsHeader = ( { sidebarName } ) => {
	const { isEditingPage, entityType } = useSelect( ( select ) => {
		const { getEditedPostType, isPage } = select( editSiteStore );
		const { getRenderingMode } = select( editorStore );

		return {
			isEditingPage: isPage() && getRenderingMode() !== 'template-only',
			entityType: getEditedPostType(),
		};
	} );

	const entityLabel =
		POST_TYPE_LABELS[ entityType ] ||
		POST_TYPE_LABELS[ TEMPLATE_POST_TYPE ];

	const { enableComplementaryArea } = useDispatch( interfaceStore );
	const openTemplateSettings = () =>
		enableComplementaryArea( STORE_NAME, SIDEBAR_TEMPLATE );
	const openBlockSettings = () =>
		enableComplementaryArea( STORE_NAME, SIDEBAR_BLOCK );

	let templateAriaLabel;
	if ( isEditingPage ) {
		templateAriaLabel =
			sidebarName === SIDEBAR_TEMPLATE
				? // translators: ARIA label for the Template sidebar tab, selected.
				  __( 'Page (selected)' )
				: // translators: ARIA label for the Template Settings Sidebar tab, not selected.
				  __( 'Page' );
	} else {
		templateAriaLabel =
			sidebarName === SIDEBAR_TEMPLATE
				? // translators: ARIA label for the Template sidebar tab, selected.
				  sprintf( __( '%s (selected)' ), entityLabel )
				: // translators: ARIA label for the Template Settings Sidebar tab, not selected.
				  entityLabel;
	}

	/* Use a list so screen readers will announce how many tabs there are. */
	return (
		<ul>
			<li>
				<Button
					onClick={ openTemplateSettings }
					className={ classnames(
						'edit-site-sidebar-edit-mode__panel-tab',
						{
							'is-active': sidebarName === SIDEBAR_TEMPLATE,
						}
					) }
					aria-label={ templateAriaLabel }
					data-label={ isEditingPage ? __( 'Page' ) : entityLabel }
				>
					{ isEditingPage ? __( 'Page' ) : entityLabel }
				</Button>
			</li>
			<li>
				<Button
					onClick={ openBlockSettings }
					className={ classnames(
						'edit-site-sidebar-edit-mode__panel-tab',
						{
							'is-active': sidebarName === SIDEBAR_BLOCK,
						}
					) }
					aria-label={
						sidebarName === SIDEBAR_BLOCK
							? // translators: ARIA label for the Block Settings Sidebar tab, selected.
							  __( 'Block (selected)' )
							: // translators: ARIA label for the Block Settings Sidebar tab, not selected.
							  __( 'Block' )
					}
					data-label={ __( 'Block' ) }
				>
					{ __( 'Block' ) }
				</Button>
			</li>
		</ul>
	);
};

export default SettingsHeader;
