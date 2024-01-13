/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import {
	store as preferencesStore,
	privateApis as preferencesPrivateApis,
} from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import EnablePanelOption from './enable-panel';
import EnablePluginDocumentSettingPanelOption from './enable-plugin-document-setting-panel';
import BlockManager from '../block-manager';
import PostTaxonomies from '../post-taxonomies';
import PostFeaturedImageCheck from '../post-featured-image/check';
import PostExcerptCheck from '../post-excerpt/check';
import PageAttributesCheck from '../page-attributes/check';
import PostTypeSupportCheck from '../post-type-support-check';
import { store as editorStore } from '../../store';
import { unlock } from '../../lock-unlock';

const {
	PreferencesModal,
	PreferencesModalTabs,
	PreferencesModalSection,
	PreferenceToggleControl,
} = unlock( preferencesPrivateApis );

export default function EditorPreferencesModal( {
	extraSections = {},
	isActive,
	onClose,
} ) {
	const isLargeViewport = useViewportMatch( 'medium' );
	const { showBlockBreadcrumbsOption } = useSelect(
		( select ) => {
			const { getEditorSettings } = select( editorStore );
			const { get } = select( preferencesStore );
			const isRichEditingEnabled = getEditorSettings().richEditingEnabled;
			const isDistractionFreeEnabled = get( 'core', 'distractionFree' );
			return {
				showBlockBreadcrumbsOption:
					! isDistractionFreeEnabled &&
					isLargeViewport &&
					isRichEditingEnabled,
			};
		},
		[ isLargeViewport ]
	);

	const { setIsListViewOpened, setIsInserterOpened } =
		useDispatch( editorStore );
	const { set: setPreference } = useDispatch( preferencesStore );

	const toggleDistractionFree = () => {
		setPreference( 'core', 'fixedToolbar', true );
		setIsInserterOpened( false );
		setIsListViewOpened( false );
		// Todo: Check sidebar when closing/opening distraction free.
	};

	const turnOffDistractionFree = () => {
		setPreference( 'core', 'distractionFree', false );
	};

	const sections = useMemo(
		() => [
			{
				name: 'general',
				tabLabel: __( 'General' ),
				content: (
					<>
						<PreferencesModalSection title={ __( 'Interface' ) }>
							<PreferenceToggleControl
								scope="core"
								featureName="showListViewByDefault"
								help={ __(
									'Opens the block list view sidebar by default.'
								) }
								label={ __( 'Always open list view' ) }
							/>
							{ showBlockBreadcrumbsOption && (
								<PreferenceToggleControl
									scope="core"
									featureName="showBlockBreadcrumbs"
									help={ __(
										'Display the block hierarchy trail at the bottom of the editor.'
									) }
									label={ __( 'Show block breadcrumbs' ) }
								/>
							) }
							<PreferenceToggleControl
								scope="core"
								featureName="allowRightClickOverrides"
								help={ __(
									'Allows contextual list view menus via right-click, overriding browser defaults.'
								) }
								label={ __(
									'Allow right-click contextual menus'
								) }
							/>
						</PreferencesModalSection>
						<PreferencesModalSection
							title={ __( 'Document settings' ) }
							description={ __(
								'Select what settings are shown in the document panel.'
							) }
						>
							<EnablePluginDocumentSettingPanelOption.Slot />
							<PostTaxonomies
								taxonomyWrapper={ ( content, taxonomy ) => (
									<EnablePanelOption
										label={ taxonomy.labels.menu_name }
										panelName={ `taxonomy-panel-${ taxonomy.slug }` }
									/>
								) }
							/>
							<PostFeaturedImageCheck>
								<EnablePanelOption
									label={ __( 'Featured image' ) }
									panelName="featured-image"
								/>
							</PostFeaturedImageCheck>
							<PostExcerptCheck>
								<EnablePanelOption
									label={ __( 'Excerpt' ) }
									panelName="post-excerpt"
								/>
							</PostExcerptCheck>
							<PostTypeSupportCheck
								supportKeys={ [ 'comments', 'trackbacks' ] }
							>
								<EnablePanelOption
									label={ __( 'Discussion' ) }
									panelName="discussion-panel"
								/>
							</PostTypeSupportCheck>
							<PageAttributesCheck>
								<EnablePanelOption
									label={ __( 'Page attributes' ) }
									panelName="page-attributes"
								/>
							</PageAttributesCheck>
						</PreferencesModalSection>
						{ extraSections?.general }
					</>
				),
			},
			{
				name: 'appearance',
				tabLabel: __( 'Appearance' ),
				content: (
					<PreferencesModalSection
						title={ __( 'Appearance' ) }
						description={ __(
							'Customize the editor interface to suit your needs.'
						) }
					>
						<PreferenceToggleControl
							scope="core"
							featureName="fixedToolbar"
							onToggle={ turnOffDistractionFree }
							help={ __(
								'Access all block and document tools in a single place.'
							) }
							label={ __( 'Top toolbar' ) }
						/>
						<PreferenceToggleControl
							scope="core"
							featureName="distractionFree"
							onToggle={ toggleDistractionFree }
							help={ __(
								'Reduce visual distractions by hiding the toolbar and other elements to focus on writing.'
							) }
							label={ __( 'Distraction free' ) }
						/>
						<PreferenceToggleControl
							scope="core"
							featureName="focusMode"
							help={ __(
								'Highlights the current block and fades other content.'
							) }
							label={ __( 'Spotlight mode' ) }
						/>
						{ extraSections?.appearance }
					</PreferencesModalSection>
				),
			},
			{
				name: 'accessibility',
				tabLabel: __( 'Accessibility' ),
				content: (
					<>
						<PreferencesModalSection
							title={ __( 'Navigation' ) }
							description={ __(
								'Optimize the editing experience for enhanced control.'
							) }
						>
							<PreferenceToggleControl
								scope="core"
								featureName="keepCaretInsideBlock"
								help={ __(
									'Keeps the text cursor within the block boundaries, aiding users with screen readers by preventing unintentional cursor movement outside the block.'
								) }
								label={ __(
									'Contain text cursor inside block'
								) }
							/>
						</PreferencesModalSection>
						<PreferencesModalSection title={ __( 'Interface' ) }>
							<PreferenceToggleControl
								scope="core"
								featureName="showIconLabels"
								label={ __( 'Show button text labels' ) }
								help={ __(
									'Show text instead of icons on buttons across the interface.'
								) }
							/>
						</PreferencesModalSection>
					</>
				),
			},
			{
				name: 'blocks',
				tabLabel: __( 'Blocks' ),
				content: (
					<>
						<PreferencesModalSection title={ __( 'Inserter' ) }>
							<PreferenceToggleControl
								scope="core"
								featureName="mostUsedBlocks"
								help={ __(
									'Adds a category with the most frequently used blocks in the inserter.'
								) }
								label={ __( 'Show most used blocks' ) }
							/>
						</PreferencesModalSection>
						<PreferencesModalSection
							title={ __( 'Manage block visibility' ) }
							description={ __(
								"Disable blocks that you don't want to appear in the inserter. They can always be toggled back on later."
							) }
						>
							<BlockManager />
						</PreferencesModalSection>
					</>
				),
			},
		],
		[ isLargeViewport, showBlockBreadcrumbsOption, extraSections ]
	);

	if ( ! isActive ) {
		return null;
	}

	return (
		<PreferencesModal closeModal={ onClose }>
			<PreferencesModalTabs sections={ sections } />
		</PreferencesModal>
	);
}
