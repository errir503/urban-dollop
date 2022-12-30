/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import {
	registerCoreBlocks,
	__experimentalRegisterExperimentalCoreBlocks,
} from '@wordpress/block-library';
import { render, unmountComponentAtNode } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { store as preferencesStore } from '@wordpress/preferences';
import { registerLegacyWidgetBlock } from '@wordpress/widgets';

/**
 * Internal dependencies
 */
import './hooks';
import './plugins';
import Editor from './editor';
import { store as editPostStore } from './store';

/**
 * Reinitializes the editor after the user chooses to reboot the editor after
 * an unhandled error occurs, replacing previously mounted editor element using
 * an initial state from prior to the crash.
 *
 * @param {Object}  postType     Post type of the post to edit.
 * @param {Object}  postId       ID of the post to edit.
 * @param {Element} target       DOM node in which editor is rendered.
 * @param {?Object} settings     Editor settings object.
 * @param {Object}  initialEdits Programmatic edits to apply initially, to be
 *                               considered as non-user-initiated (bypass for
 *                               unsaved changes prompt).
 */
export function reinitializeEditor(
	postType,
	postId,
	target,
	settings,
	initialEdits
) {
	unmountComponentAtNode( target );
	const reboot = reinitializeEditor.bind(
		null,
		postType,
		postId,
		target,
		settings,
		initialEdits
	);

	render(
		<Editor
			settings={ settings }
			onError={ reboot }
			postId={ postId }
			postType={ postType }
			initialEdits={ initialEdits }
			recovery
		/>,
		target
	);
}

/**
 * Initializes and returns an instance of Editor.
 *
 * @param {string}  id           Unique identifier for editor instance.
 * @param {string}  postType     Post type of the post to edit.
 * @param {Object}  postId       ID of the post to edit.
 * @param {?Object} settings     Editor settings object.
 * @param {Object}  initialEdits Programmatic edits to apply initially, to be
 *                               considered as non-user-initiated (bypass for
 *                               unsaved changes prompt).
 */
export function initializeEditor(
	id,
	postType,
	postId,
	settings,
	initialEdits
) {
	const target = document.getElementById( id );
	const reboot = reinitializeEditor.bind(
		null,
		postType,
		postId,
		target,
		settings,
		initialEdits
	);

	dispatch( preferencesStore ).setDefaults( 'core/edit-post', {
		editorMode: 'visual',
		fixedToolbar: false,
		fullscreenMode: true,
		hiddenBlockTypes: [],
		inactivePanels: [],
		isPublishSidebarEnabled: true,
		openPanels: [ 'post-status' ],
		preferredStyleVariations: {},
		showBlockBreadcrumbs: true,
		showIconLabels: false,
		showListViewByDefault: false,
		themeStyles: true,
		welcomeGuide: true,
		welcomeGuideTemplate: true,
	} );

	dispatch( blocksStore ).__experimentalReapplyBlockTypeFilters();

	// Check if the block list view should be open by default.
	if ( select( editPostStore ).isFeatureActive( 'showListViewByDefault' ) ) {
		dispatch( editPostStore ).setIsListViewOpened( true );
	}

	registerCoreBlocks();
	registerLegacyWidgetBlock( { inserter: false } );
	if ( process.env.IS_GUTENBERG_PLUGIN ) {
		__experimentalRegisterExperimentalCoreBlocks( {
			enableFSEBlocks: settings.__unstableEnableFullSiteEditingBlocks,
		} );
	}

	/*
	 * Prevent adding template part in the post editor.
	 * Only add the filter when the post editor is initialized, not imported.
	 * Also only add the filter(s) after registerCoreBlocks()
	 * so that common filters in the block library are not overwritten.
	 */
	addFilter(
		'blockEditor.__unstableCanInsertBlockType',
		'removeTemplatePartsFromInserter',
		( canInsert, blockType ) => {
			if (
				! select( editPostStore ).isEditingTemplate() &&
				blockType.name === 'core/template-part'
			) {
				return false;
			}
			return canInsert;
		}
	);

	// Show a console log warning if the browser is not in Standards rendering mode.
	const documentMode =
		document.compatMode === 'CSS1Compat' ? 'Standards' : 'Quirks';
	if ( documentMode !== 'Standards' ) {
		// eslint-disable-next-line no-console
		console.warn(
			"Your browser is using Quirks Mode. \nThis can cause rendering issues such as blocks overlaying meta boxes in the editor. Quirks Mode can be triggered by PHP errors or HTML code appearing before the opening <!DOCTYPE html>. Try checking the raw page source or your site's PHP error log and resolving errors there, removing any HTML before the doctype, or disabling plugins."
		);
	}

	// This is a temporary fix for a couple of issues specific to Webkit on iOS.
	// Without this hack the browser scrolls the mobile toolbar off-screen.
	// Once supported in Safari we can replace this in favor of preventScroll.
	// For details see issue #18632 and PR #18686
	// Specifically, we scroll `interface-interface-skeleton__body` to enable a fixed top toolbar.
	// But Mobile Safari forces the `html` element to scroll upwards, hiding the toolbar.

	const isIphone = window.navigator.userAgent.indexOf( 'iPhone' ) !== -1;
	if ( isIphone ) {
		window.addEventListener( 'scroll', ( event ) => {
			const editorScrollContainer = document.getElementsByClassName(
				'interface-interface-skeleton__body'
			)[ 0 ];
			if ( event.target === document ) {
				// Scroll element into view by scrolling the editor container by the same amount
				// that Mobile Safari tried to scroll the html element upwards.
				if ( window.scrollY > 100 ) {
					editorScrollContainer.scrollTop =
						editorScrollContainer.scrollTop + window.scrollY;
				}
				// Undo unwanted scroll on html element, but only in the visual editor.
				if (
					document.getElementsByClassName( 'is-mode-visual' )[ 0 ]
				) {
					window.scrollTo( 0, 0 );
				}
			}
		} );
	}

	// Prevent the default browser action for files dropped outside of dropzones.
	window.addEventListener( 'dragover', ( e ) => e.preventDefault(), false );
	window.addEventListener( 'drop', ( e ) => e.preventDefault(), false );

	render(
		<Editor
			settings={ settings }
			onError={ reboot }
			postId={ postId }
			postType={ postType }
			initialEdits={ initialEdits }
		/>,
		target
	);
}

export { default as PluginBlockSettingsMenuItem } from './components/block-settings-menu/plugin-block-settings-menu-item';
export { default as PluginDocumentSettingPanel } from './components/sidebar/plugin-document-setting-panel';
export { default as PluginMoreMenuItem } from './components/header/plugin-more-menu-item';
export { default as PluginPostPublishPanel } from './components/sidebar/plugin-post-publish-panel';
export { default as PluginPostStatusInfo } from './components/sidebar/plugin-post-status-info';
export { default as PluginPrePublishPanel } from './components/sidebar/plugin-pre-publish-panel';
export { default as PluginSidebar } from './components/sidebar/plugin-sidebar';
export { default as PluginSidebarMoreMenuItem } from './components/header/plugin-sidebar-more-menu-item';
export { default as __experimentalFullscreenModeClose } from './components/header/fullscreen-mode-close';
export { default as __experimentalMainDashboardButton } from './components/header/main-dashboard-button';
export { store } from './store';
