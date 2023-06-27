/**
 * Internal dependencies
 */
import * as globalStyles from './components/global-styles';
import { ExperimentalBlockEditorProvider } from './components/provider';
import { kebabCase } from './utils/object';
import { lock } from './lock-unlock';

/**
 * Private @wordpress/block-editor APIs.
 */
export const privateApis = {};
lock( privateApis, {
	...globalStyles,
	kebabCase,
	ExperimentalBlockEditorProvider,
} );
