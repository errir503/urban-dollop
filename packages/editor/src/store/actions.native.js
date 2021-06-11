/**
 * WordPress dependencies
 */
import RNReactNativeGutenbergBridge from '@wordpress/react-native-bridge';

export * from './actions.js';

/**
 * Returns an action object that enables or disables post title selection.
 *
 * @param {boolean} [isSelected=true] Whether post title is currently selected.
 *
 * @return {Object} Action object.
 */
export function togglePostTitleSelection( isSelected = true ) {
	return {
		type: 'TOGGLE_POST_TITLE_SELECTION',
		isSelected,
	};
}

/**
 * Action generator used in signalling that the post should autosave.
 */
export function* autosave() {
	RNReactNativeGutenbergBridge.editorDidAutosave();
}
