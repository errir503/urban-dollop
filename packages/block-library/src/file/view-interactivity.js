/**
 * WordPress dependencies
 */
import { store } from '@wordpress/interactivity';
/**
 * Internal dependencies
 */
import { browserSupportsPdfs as hasPdfPreview } from './utils';

store( {
	selectors: {
		core: {
			file: {
				hasPdfPreview,
			},
		},
	},
} );
