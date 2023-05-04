/**
 * WordPress dependencies
 */
import {
	BlockInspector,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { Platform } from '@wordpress/element';
import { isRTL, __ } from '@wordpress/i18n';
import { drawerLeft, drawerRight } from '@wordpress/icons';
import { store as interfaceStore } from '@wordpress/interface';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import SettingsHeader from '../settings-header';
import PostStatus from '../post-status';
import LastRevision from '../last-revision';
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import PostExcerpt from '../post-excerpt';
import DiscussionPanel from '../discussion-panel';
import PageAttributes from '../page-attributes';
import MetaBoxes from '../../meta-boxes';
import PluginDocumentSettingPanel from '../plugin-document-setting-panel';
import PluginSidebarEditPost from '../plugin-sidebar';
import TemplateSummary from '../template-summary';
import { store as editPostStore } from '../../../store';

const SIDEBAR_ACTIVE_BY_DEFAULT = Platform.select( {
	web: true,
	native: false,
} );

const SettingsSidebar = () => {
	const { sidebarName, keyboardShortcut, isTemplateMode } = useSelect(
		( select ) => {
			// The settings sidebar is used by the edit-post/document and edit-post/block sidebars.
			// sidebarName represents the sidebar that is active or that should be active when the SettingsSidebar toggle button is pressed.
			// If one of the two sidebars is active the component will contain the content of that sidebar.
			// When neither of the two sidebars is active we can not simply return null, because the PluginSidebarEditPost
			// component, besides being used to render the sidebar, also renders the toggle button. In that case sidebarName
			// should contain the sidebar that will be active when the toggle button is pressed. If a block
			// is selected, that should be edit-post/block otherwise it's edit-post/document.
			let sidebar = select( interfaceStore ).getActiveComplementaryArea(
				editPostStore.name
			);
			if (
				! [ 'edit-post/document', 'edit-post/block' ].includes(
					sidebar
				)
			) {
				if ( select( blockEditorStore ).getBlockSelectionStart() ) {
					sidebar = 'edit-post/block';
				}
				sidebar = 'edit-post/document';
			}
			const shortcut = select(
				keyboardShortcutsStore
			).getShortcutRepresentation( 'core/edit-post/toggle-sidebar' );
			return {
				sidebarName: sidebar,
				keyboardShortcut: shortcut,
				isTemplateMode: select( editPostStore ).isEditingTemplate(),
			};
		},
		[]
	);

	return (
		<PluginSidebarEditPost
			identifier={ sidebarName }
			header={ <SettingsHeader sidebarName={ sidebarName } /> }
			closeLabel={ __( 'Close Settings' ) }
			headerClassName="edit-post-sidebar__panel-tabs"
			/* translators: button label text should, if possible, be under 16 characters. */
			title={ __( 'Settings' ) }
			toggleShortcut={ keyboardShortcut }
			icon={ isRTL() ? drawerLeft : drawerRight }
			isActiveByDefault={ SIDEBAR_ACTIVE_BY_DEFAULT }
		>
			{ ! isTemplateMode && sidebarName === 'edit-post/document' && (
				<>
					<PostStatus />
					<PluginDocumentSettingPanel.Slot />
					<LastRevision />
					<PostTaxonomies />
					<FeaturedImage />
					<PostExcerpt />
					<DiscussionPanel />
					<PageAttributes />
					<MetaBoxes location="side" />
				</>
			) }
			{ isTemplateMode && sidebarName === 'edit-post/document' && (
				<TemplateSummary />
			) }
			{ sidebarName === 'edit-post/block' && <BlockInspector /> }
		</PluginSidebarEditPost>
	);
};

export default SettingsSidebar;
