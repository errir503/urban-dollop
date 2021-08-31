/**
 * External dependencies
 */
import { castArray, reduce } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { apiFetch } from '@wordpress/data-controls';
import { store as interfaceStore } from '@wordpress/interface';
import { controls, select, subscribe, dispatch } from '@wordpress/data';
import { speak } from '@wordpress/a11y';
import { store as noticesStore } from '@wordpress/notices';
import { store as coreStore } from '@wordpress/core-data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { getMetaBoxContainer } from '../utils/meta-boxes';
import { store as editPostStore } from '.';
/**
 * Returns an action object used in signalling that the user opened an editor sidebar.
 *
 * @param {?string} name Sidebar name to be opened.
 *
 * @yield {Object} Action object.
 */
export function* openGeneralSidebar( name ) {
	yield controls.dispatch(
		interfaceStore,
		'enableComplementaryArea',
		editPostStore.name,
		name
	);
}

/**
 * Returns an action object signalling that the user closed the sidebar.
 *
 * @yield {Object} Action object.
 */
export function* closeGeneralSidebar() {
	yield controls.dispatch(
		interfaceStore,
		'disableComplementaryArea',
		editPostStore.name
	);
}

/**
 * Returns an action object used in signalling that the user opened a modal.
 *
 * @param {string} name A string that uniquely identifies the modal.
 *
 * @return {Object} Action object.
 */
export function openModal( name ) {
	return {
		type: 'OPEN_MODAL',
		name,
	};
}

/**
 * Returns an action object signalling that the user closed a modal.
 *
 * @return {Object} Action object.
 */
export function closeModal() {
	return {
		type: 'CLOSE_MODAL',
	};
}

/**
 * Returns an action object used in signalling that the user opened the publish
 * sidebar.
 *
 * @return {Object} Action object
 */
export function openPublishSidebar() {
	return {
		type: 'OPEN_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used in signalling that the user closed the
 * publish sidebar.
 *
 * @return {Object} Action object.
 */
export function closePublishSidebar() {
	return {
		type: 'CLOSE_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used in signalling that the user toggles the publish sidebar.
 *
 * @return {Object} Action object
 */
export function togglePublishSidebar() {
	return {
		type: 'TOGGLE_PUBLISH_SIDEBAR',
	};
}

/**
 * Returns an action object used to enable or disable a panel in the editor.
 *
 * @param {string} panelName A string that identifies the panel to enable or disable.
 *
 * @return {Object} Action object.
 */
export function toggleEditorPanelEnabled( panelName ) {
	return {
		type: 'TOGGLE_PANEL_ENABLED',
		panelName,
	};
}

/**
 * Returns an action object used to open or close a panel in the editor.
 *
 * @param {string} panelName A string that identifies the panel to open or close.
 *
 * @return {Object} Action object.
 */
export function toggleEditorPanelOpened( panelName ) {
	return {
		type: 'TOGGLE_PANEL_OPENED',
		panelName,
	};
}

/**
 * Returns an action object used to remove a panel from the editor.
 *
 * @param {string} panelName A string that identifies the panel to remove.
 *
 * @return {Object} Action object.
 */
export function removeEditorPanel( panelName ) {
	return {
		type: 'REMOVE_PANEL',
		panelName,
	};
}

/**
 * Triggers an action used to toggle a feature flag.
 *
 * @param {string} feature Feature name.
 */
export function* toggleFeature( feature ) {
	yield controls.dispatch(
		interfaceStore.name,
		'toggleFeature',
		'core/edit-post',
		feature
	);
}

export function* switchEditorMode( mode ) {
	yield {
		type: 'SWITCH_MODE',
		mode,
	};

	// Unselect blocks when we switch to the code editor.
	if ( mode !== 'visual' ) {
		yield controls.dispatch( blockEditorStore, 'clearSelectedBlock' );
	}

	const message =
		mode === 'visual'
			? __( 'Visual editor selected' )
			: __( 'Code editor selected' );
	speak( message, 'assertive' );
}

/**
 * Triggers an action object used to toggle a plugin name flag.
 *
 * @param {string} pluginName Plugin name.
 */
export function* togglePinnedPluginItem( pluginName ) {
	const isPinned = yield controls.select(
		interfaceStore,
		'isItemPinned',
		'core/edit-post',
		pluginName
	);

	yield controls.dispatch(
		interfaceStore,
		isPinned ? 'unpinItem' : 'pinItem',
		'core/edit-post',
		pluginName
	);
}

/**
 * Returns an action object used in signalling that block types by the given
 * name(s) should be hidden.
 *
 * @param {string[]} blockNames Names of block types to hide.
 *
 * @return {Object} Action object.
 */
export function hideBlockTypes( blockNames ) {
	return {
		type: 'HIDE_BLOCK_TYPES',
		blockNames: castArray( blockNames ),
	};
}

/**
 * Returns an action object used in signaling that a style should be auto-applied when a block is created.
 *
 * @param {string}  blockName  Name of the block.
 * @param {?string} blockStyle Name of the style that should be auto applied. If undefined, the "auto apply" setting of the block is removed.
 *
 * @return {Object} Action object.
 */
export function updatePreferredStyleVariations( blockName, blockStyle ) {
	return {
		type: 'UPDATE_PREFERRED_STYLE_VARIATIONS',
		blockName,
		blockStyle,
	};
}

/**
 * Returns an action object used in signalling that the editor should attempt
 * to locally autosave the current post every `interval` seconds.
 *
 * @param {number} interval The new interval, in seconds.
 * @return {Object} Action object.
 */
export function __experimentalUpdateLocalAutosaveInterval( interval ) {
	return {
		type: 'UPDATE_LOCAL_AUTOSAVE_INTERVAL',
		interval,
	};
}

/**
 * Returns an action object used in signalling that block types by the given
 * name(s) should be shown.
 *
 * @param {string[]} blockNames Names of block types to show.
 *
 * @return {Object} Action object.
 */
export function showBlockTypes( blockNames ) {
	return {
		type: 'SHOW_BLOCK_TYPES',
		blockNames: castArray( blockNames ),
	};
}

/**
 * Returns an action object used in signaling
 * what Meta boxes are available in which location.
 *
 * @param {Object} metaBoxesPerLocation Meta boxes per location.
 *
 * @yield {Object} Action object.
 */
export function* setAvailableMetaBoxesPerLocation( metaBoxesPerLocation ) {
	yield {
		type: 'SET_META_BOXES_PER_LOCATIONS',
		metaBoxesPerLocation,
	};
}

/**
 * Returns an action object used to request meta box update.
 *
 * @yield {Object} Action object.
 */
export function* requestMetaBoxUpdates() {
	yield {
		type: 'REQUEST_META_BOX_UPDATES',
	};

	// Saves the wp_editor fields
	if ( window.tinyMCE ) {
		window.tinyMCE.triggerSave();
	}

	// Additional data needed for backward compatibility.
	// If we do not provide this data, the post will be overridden with the default values.
	const post = yield controls.select( editorStore, 'getCurrentPost' );
	const additionalData = [
		post.comment_status ? [ 'comment_status', post.comment_status ] : false,
		post.ping_status ? [ 'ping_status', post.ping_status ] : false,
		post.sticky ? [ 'sticky', post.sticky ] : false,
		post.author ? [ 'post_author', post.author ] : false,
	].filter( Boolean );

	// We gather all the metaboxes locations data and the base form data
	const baseFormData = new window.FormData(
		document.querySelector( '.metabox-base-form' )
	);
	const activeMetaBoxLocations = yield controls.select(
		editPostStore,
		'getActiveMetaBoxLocations'
	);
	const formDataToMerge = [
		baseFormData,
		...activeMetaBoxLocations.map(
			( location ) =>
				new window.FormData( getMetaBoxContainer( location ) )
		),
	];

	// Merge all form data objects into a single one.
	const formData = reduce(
		formDataToMerge,
		( memo, currentFormData ) => {
			for ( const [ key, value ] of currentFormData ) {
				memo.append( key, value );
			}
			return memo;
		},
		new window.FormData()
	);
	additionalData.forEach( ( [ key, value ] ) =>
		formData.append( key, value )
	);

	try {
		// Save the metaboxes
		yield apiFetch( {
			url: window._wpMetaBoxUrl,
			method: 'POST',
			body: formData,
			parse: false,
		} );
		yield controls.dispatch( editPostStore, 'metaBoxUpdatesSuccess' );
	} catch {
		yield controls.dispatch( editPostStore, 'metaBoxUpdatesFailure' );
	}
}

/**
 * Returns an action object used to signal a successful meta box update.
 *
 * @return {Object} Action object.
 */
export function metaBoxUpdatesSuccess() {
	return {
		type: 'META_BOX_UPDATES_SUCCESS',
	};
}

/**
 * Returns an action object used to signal a failed meta box update.
 *
 * @return {Object} Action object.
 */
export function metaBoxUpdatesFailure() {
	return {
		type: 'META_BOX_UPDATES_FAILURE',
	};
}

/**
 * Returns an action object used to toggle the width of the editing canvas.
 *
 * @param {string} deviceType
 *
 * @return {Object} Action object.
 */
export function __experimentalSetPreviewDeviceType( deviceType ) {
	return {
		type: 'SET_PREVIEW_DEVICE_TYPE',
		deviceType,
	};
}

/**
 * Returns an action object used to open/close the inserter.
 *
 * @param {boolean|Object} value                Whether the inserter should be
 *                                              opened (true) or closed (false).
 *                                              To specify an insertion point,
 *                                              use an object.
 * @param {string}         value.rootClientId   The root client ID to insert at.
 * @param {number}         value.insertionIndex The index to insert at.
 *
 * @return {Object} Action object.
 */
export function setIsInserterOpened( value ) {
	return {
		type: 'SET_IS_INSERTER_OPENED',
		value,
	};
}

/**
 * Returns an action object used to open/close the list view.
 *
 * @param {boolean} isOpen A boolean representing whether the list view should be opened or closed.
 * @return {Object} Action object.
 */
export function setIsListViewOpened( isOpen ) {
	return {
		type: 'SET_IS_LIST_VIEW_OPENED',
		isOpen,
	};
}

/**
 * Returns an action object used to switch to template editing.
 *
 * @param {boolean} value Is editing template.
 * @return {Object} Action object.
 */
export function setIsEditingTemplate( value ) {
	return {
		type: 'SET_IS_EDITING_TEMPLATE',
		value,
	};
}

/**
 * Switches to the template mode.
 *
 * @param {boolean} newTemplate Is new template.
 */
export function* __unstableSwitchToTemplateMode( newTemplate = false ) {
	yield setIsEditingTemplate( true );

	const isWelcomeGuideActive = yield controls.select(
		editPostStore,
		'isFeatureActive',
		'welcomeGuideTemplate'
	);

	if ( ! isWelcomeGuideActive ) {
		const message = newTemplate
			? __( "Custom template created. You're in template mode now." )
			: __(
					'Editing template. Changes made here affect all posts and pages that use the template.'
			  );
		yield controls.dispatch( noticesStore, 'createSuccessNotice', message, {
			type: 'snackbar',
		} );
	}
}

/**
 * Create a block based template.
 *
 * @param {Object?} template Template to create and assign.
 */
export function* __unstableCreateTemplate( template ) {
	const savedTemplate = yield controls.dispatch(
		coreStore,
		'saveEntityRecord',
		'postType',
		'wp_template',
		template
	);
	const post = yield controls.select( editorStore, 'getCurrentPost' );

	yield controls.dispatch(
		coreStore,
		'editEntityRecord',
		'postType',
		post.type,
		post.id,
		{
			template: savedTemplate.slug,
		}
	);
}

let metaBoxesInitialized = false;

/**
 * Initializes WordPress `postboxes` script and the logic for saving meta boxes.
 */
export function* initializeMetaBoxes() {
	const isEditorReady = yield controls.select(
		editorStore,
		'__unstableIsEditorReady'
	);

	if ( ! isEditorReady ) {
		return;
	}

	const postType = yield controls.select( editorStore, 'getCurrentPostType' );

	// Only initialize once.
	if ( metaBoxesInitialized ) {
		return;
	}

	if ( window.postboxes.page !== postType ) {
		window.postboxes.add_postbox_toggles( postType );
	}

	metaBoxesInitialized = true;

	let wasSavingPost = yield controls.select( editorStore, 'isSavingPost' );
	let wasAutosavingPost = yield controls.select(
		editorStore,
		'isAutosavingPost'
	);
	const hasMetaBoxes = yield controls.select( editPostStore, 'hasMetaBoxes' );

	// Save metaboxes when performing a full save on the post.
	subscribe( () => {
		const isSavingPost = select( editorStore ).isSavingPost();
		const isAutosavingPost = select( editorStore ).isAutosavingPost();

		// Save metaboxes on save completion, except for autosaves that are not a post preview.
		//
		// Meta boxes are initialized once at page load. It is not necessary to
		// account for updates on each state change.
		//
		// See: https://github.com/WordPress/WordPress/blob/5.1.1/wp-admin/includes/post.php#L2307-L2309
		const shouldTriggerMetaboxesSave =
			hasMetaBoxes &&
			wasSavingPost &&
			! isSavingPost &&
			! wasAutosavingPost;

		// Save current state for next inspection.
		wasSavingPost = isSavingPost;
		wasAutosavingPost = isAutosavingPost;

		if ( shouldTriggerMetaboxesSave ) {
			dispatch( editPostStore ).requestMetaBoxUpdates();
		}
	} );

	return {
		type: 'META_BOXES_INITIALIZED',
	};
}
