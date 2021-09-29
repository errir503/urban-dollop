/**
 * Internal dependencies
 */
import {
	PREFERENCES_DEFAULTS,
	SETTINGS_DEFAULTS as SETTINGS,
} from './defaults.js';

const fontSizes = SETTINGS.fontSizes.map( ( fontSize ) => {
	fontSize.sizePx = fontSize.size + 'px';
	return fontSize;
} );

const SETTINGS_DEFAULTS = {
	...SETTINGS,
	fontSizes,
	// FOR TESTING ONLY - Later, this will come from a REST API
	// eslint-disable-next-line no-undef
	__unstableGalleryWithImageBlocks: __DEV__,
	alignWide: true,
	supportsLayout: false,
	__experimentalFeatures: {
		color: {
			text: true,
			background: true,
		},
	},
};

export { PREFERENCES_DEFAULTS, SETTINGS_DEFAULTS };
