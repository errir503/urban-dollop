/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { quote as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import deprecated from './deprecated';
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';
import settingsV2 from './v2';

const { name } = metadata;

export { metadata, name, settingsV2 };

export const settingsV1 = {
	icon,
	example: {
		attributes: {
			value:
				'<p>' + __( 'In quoting others, we cite ourselves.' ) + '</p>',
			citation: 'Julio Cortázar',
		},
	},
	transforms,
	edit,
	save,
	merge( attributes, { value, citation } ) {
		// Quote citations cannot be merged. Pick the second one unless it's
		// empty.
		if ( ! citation ) {
			citation = attributes.citation;
		}

		if ( ! value || value === '<p></p>' ) {
			return {
				...attributes,
				citation,
			};
		}

		return {
			...attributes,
			value: attributes.value + value,
			citation,
		};
	},
	deprecated,
};

let settings = settingsV1;
if ( process.env.IS_GUTENBERG_PLUGIN ) {
	settings = window?.__experimentalEnableQuoteBlockV2
		? settingsV2
		: settingsV1;
}
export { settings };
