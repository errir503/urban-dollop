/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	AutosaveMonitor,
	LocalAutosaveMonitor,
	UnsavedChangesWarning,
	EditorNotices,
	EditorKeyboardShortcutsRegister,
	EditorKeyboardShortcuts,
	EditorSnackbars,
	PostSyncStatusModal,
	store as editorStore,
} from '@wordpress/editor';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	BlockBreadcrumb,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import { Button, ScrollLock, Popover } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { PluginArea } from '@wordpress/plugins';
import { __, _x, sprintf } from '@wordpress/i18n';
import {
	ComplementaryArea,
	FullscreenMode,
	InterfaceSkeleton,
	store as interfaceStore,
} from '@wordpress/interface';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import TextEditor from '../text-editor';
import VisualEditor from '../visual-editor';
import EditPostKeyboardShortcuts from '../keyboard-shortcuts';
import KeyboardShortcutHelpModal from '../keyboard-shortcut-help-modal';
import EditPostPreferencesModal from '../preferences-modal';
import BrowserURL from '../browser-url';
import Header from '../header';
import InserterSidebar from '../secondary-sidebar/inserter-sidebar';
import ListViewSidebar from '../secondary-sidebar/list-view-sidebar';
import SettingsSidebar from '../sidebar/settings-sidebar';
import MetaBoxes from '../meta-boxes';
import WelcomeGuide from '../welcome-guide';
import ActionsPanel from './actions-panel';
import StartPageOptions from '../start-page-options';
import { store as editPostStore } from '../../store';
import { unlock } from '../../lock-unlock';

const { getLayoutStyles } = unlock( blockEditorPrivateApis );

const interfaceLabels = {
	/* translators: accessibility text for the editor top bar landmark region. */
	header: __( 'Editor top bar' ),
	/* translators: accessibility text for the editor content landmark region. */
	body: __( 'Editor content' ),
	/* translators: accessibility text for the editor settings landmark region. */
	sidebar: __( 'Editor settings' ),
	/* translators: accessibility text for the editor publish landmark region. */
	actions: __( 'Editor publish' ),
	/* translators: accessibility text for the editor footer landmark region. */
	footer: __( 'Editor footer' ),
};

function Layout() {
	const isMobileViewport = useViewportMatch( 'medium', '<' );
	const isHugeViewport = useViewportMatch( 'huge', '>=' );
	const isLargeViewport = useViewportMatch( 'large' );
	const { openGeneralSidebar, closeGeneralSidebar, setIsInserterOpened } =
		useDispatch( editPostStore );
	const { createErrorNotice } = useDispatch( noticesStore );
	const {
		mode,
		isFullscreenActive,
		isRichEditingEnabled,
		sidebarIsOpened,
		hasActiveMetaboxes,
		hasFixedToolbar,
		previousShortcut,
		nextShortcut,
		hasBlockSelected,
		isInserterOpened,
		isListViewOpened,
		showIconLabels,
		isDistractionFree,
		showBlockBreadcrumbs,
		isTemplateMode,
		documentLabel,
		styles,
	} = useSelect( ( select ) => {
		const { getEditorSettings, getPostTypeLabel } = select( editorStore );
		const { isFeatureActive } = select( editPostStore );
		const editorSettings = getEditorSettings();
		const postTypeLabel = getPostTypeLabel();
		const hasThemeStyles = isFeatureActive( 'themeStyles' );

		const themeStyles = [];
		const presetStyles = [];
		editorSettings.styles?.forEach( ( style ) => {
			if ( ! style.__unstableType || style.__unstableType === 'theme' ) {
				themeStyles.push( style );
			} else {
				presetStyles.push( style );
			}
		} );

		const defaultEditorStyles = [
			...editorSettings.defaultEditorStyles,
			...presetStyles,
		];

		// If theme styles are not present or displayed, ensure that
		// base layout styles are still present in the editor.
		if (
			! editorSettings.disableLayoutStyles &&
			! ( hasThemeStyles && themeStyles.length )
		) {
			defaultEditorStyles.push( {
				css: getLayoutStyles( {
					style: {},
					selector: 'body',
					hasBlockGapSupport: false,
					hasFallbackGapSupport: true,
					fallbackGapValue: '0.5em',
				} ),
			} );
		}

		return {
			isTemplateMode: select( editPostStore ).isEditingTemplate(),
			hasFixedToolbar:
				select( editPostStore ).isFeatureActive( 'fixedToolbar' ),
			sidebarIsOpened: !! (
				select( interfaceStore ).getActiveComplementaryArea(
					editPostStore.name
				) || select( editPostStore ).isPublishSidebarOpened()
			),
			isFullscreenActive:
				select( editPostStore ).isFeatureActive( 'fullscreenMode' ),
			isInserterOpened: select( editPostStore ).isInserterOpened(),
			isListViewOpened: select( editPostStore ).isListViewOpened(),
			mode: select( editPostStore ).getEditorMode(),
			isRichEditingEnabled: editorSettings.richEditingEnabled,
			hasActiveMetaboxes: select( editPostStore ).hasMetaBoxes(),
			previousShortcut: select(
				keyboardShortcutsStore
			).getAllShortcutKeyCombinations( 'core/edit-post/previous-region' ),
			nextShortcut: select(
				keyboardShortcutsStore
			).getAllShortcutKeyCombinations( 'core/edit-post/next-region' ),
			showIconLabels:
				select( editPostStore ).isFeatureActive( 'showIconLabels' ),
			isDistractionFree:
				select( editPostStore ).isFeatureActive( 'distractionFree' ),
			showBlockBreadcrumbs: select( editPostStore ).isFeatureActive(
				'showBlockBreadcrumbs'
			),
			// translators: Default label for the Document in the Block Breadcrumb.
			documentLabel: postTypeLabel || _x( 'Document', 'noun' ),
			styles:
				hasThemeStyles && themeStyles.length
					? editorSettings.styles
					: defaultEditorStyles,
		};
	}, [] );

	const openSidebarPanel = () =>
		openGeneralSidebar(
			hasBlockSelected ? 'edit-post/block' : 'edit-post/document'
		);

	// Inserter and Sidebars are mutually exclusive
	useEffect( () => {
		if ( sidebarIsOpened && ! isHugeViewport ) {
			setIsInserterOpened( false );
		}
	}, [ sidebarIsOpened, isHugeViewport ] );
	useEffect( () => {
		if ( isInserterOpened && ! isHugeViewport ) {
			closeGeneralSidebar();
		}
	}, [ isInserterOpened, isHugeViewport ] );

	// Local state for save panel.
	// Note 'truthy' callback implies an open panel.
	const [ entitiesSavedStatesCallback, setEntitiesSavedStatesCallback ] =
		useState( false );
	const closeEntitiesSavedStates = useCallback(
		( arg ) => {
			if ( typeof entitiesSavedStatesCallback === 'function' ) {
				entitiesSavedStatesCallback( arg );
			}
			setEntitiesSavedStatesCallback( false );
		},
		[ entitiesSavedStatesCallback ]
	);

	const className = classnames( 'edit-post-layout', 'is-mode-' + mode, {
		'is-sidebar-opened': sidebarIsOpened,
		'has-fixed-toolbar': hasFixedToolbar,
		'has-metaboxes': hasActiveMetaboxes,
		'show-icon-labels': showIconLabels,
		'is-distraction-free': isDistractionFree && isLargeViewport,
		'is-entity-save-view-open': !! entitiesSavedStatesCallback,
	} );

	const secondarySidebarLabel = isListViewOpened
		? __( 'Document Overview' )
		: __( 'Block Library' );

	const secondarySidebar = () => {
		if ( mode === 'visual' && isInserterOpened ) {
			return <InserterSidebar />;
		}
		if ( mode === 'visual' && isListViewOpened ) {
			return <ListViewSidebar />;
		}

		return null;
	};

	function onPluginAreaError( name ) {
		createErrorNotice(
			sprintf(
				/* translators: %s: plugin name */
				__(
					'The "%s" plugin has encountered an error and cannot be rendered.'
				),
				name
			)
		);
	}

	return (
		<>
			<FullscreenMode isActive={ isFullscreenActive } />
			<BrowserURL />
			<UnsavedChangesWarning />
			<AutosaveMonitor />
			<LocalAutosaveMonitor />
			<EditPostKeyboardShortcuts />
			<EditorKeyboardShortcutsRegister />
			<EditorKeyboardShortcuts />
			<SettingsSidebar />
			<InterfaceSkeleton
				isDistractionFree={ isDistractionFree && isLargeViewport }
				className={ className }
				labels={ {
					...interfaceLabels,
					secondarySidebar: secondarySidebarLabel,
				} }
				header={
					<Header
						setEntitiesSavedStatesCallback={
							setEntitiesSavedStatesCallback
						}
					/>
				}
				editorNotices={ <EditorNotices /> }
				secondarySidebar={ secondarySidebar() }
				sidebar={
					( ! isMobileViewport || sidebarIsOpened ) && (
						<>
							{ ! isMobileViewport && ! sidebarIsOpened && (
								<div className="edit-post-layout__toggle-sidebar-panel">
									<Button
										variant="secondary"
										className="edit-post-layout__toggle-sidebar-panel-button"
										onClick={ openSidebarPanel }
										aria-expanded={ false }
									>
										{ hasBlockSelected
											? __( 'Open block settings' )
											: __( 'Open document settings' ) }
									</Button>
								</div>
							) }
							<ComplementaryArea.Slot scope="core/edit-post" />
						</>
					)
				}
				notices={ <EditorSnackbars /> }
				content={
					<>
						{ ! isDistractionFree && <EditorNotices /> }
						{ ( mode === 'text' || ! isRichEditingEnabled ) && (
							<TextEditor />
						) }
						{ isRichEditingEnabled && mode === 'visual' && (
							<VisualEditor styles={ styles } />
						) }
						{ ! isDistractionFree && ! isTemplateMode && (
							<div className="edit-post-layout__metaboxes">
								<MetaBoxes location="normal" />
								<MetaBoxes location="advanced" />
							</div>
						) }
						{ isMobileViewport && sidebarIsOpened && (
							<ScrollLock />
						) }
					</>
				}
				footer={
					! isDistractionFree &&
					! isMobileViewport &&
					showBlockBreadcrumbs &&
					isRichEditingEnabled &&
					mode === 'visual' && (
						<div className="edit-post-layout__footer">
							<BlockBreadcrumb rootLabelText={ documentLabel } />
						</div>
					)
				}
				actions={
					<ActionsPanel
						closeEntitiesSavedStates={ closeEntitiesSavedStates }
						isEntitiesSavedStatesOpen={
							entitiesSavedStatesCallback
						}
						setEntitiesSavedStatesCallback={
							setEntitiesSavedStatesCallback
						}
					/>
				}
				shortcuts={ {
					previous: previousShortcut,
					next: nextShortcut,
				} }
			/>
			<EditPostPreferencesModal />
			<KeyboardShortcutHelpModal />
			<WelcomeGuide />
			<PostSyncStatusModal />
			<StartPageOptions />
			<Popover.Slot />
			<PluginArea onError={ onPluginAreaError } />
		</>
	);
}

export default Layout;
