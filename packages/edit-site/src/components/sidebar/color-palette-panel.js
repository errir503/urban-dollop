/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __experimentalColorEdit as ColorEdit } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSetting } from '../editor/utils';
import { store as editSiteStore } from '../../store';

/**
 * Shared reference to an empty array for cases where it is important to avoid
 * returning a new array reference on every invocation, as in a connected or
 * other pure component which performs `shouldComponentUpdate` check on props.
 * This should be used as a last resort, since the normalized data should be
 * maintained by the reducer result in state.
 *
 * @type {Array}
 */
const EMPTY_ARRAY = [];

export default function ColorPalettePanel( {
	contextName,
	getSetting,
	setSetting,
} ) {
	const colors = useSetting( 'color.palette', contextName );
	const userColors = getSetting( contextName, 'color.palette' );
	const immutableColorSlugs = useSelect(
		( select ) => {
			const baseStyles = select( editSiteStore ).getSettings()
				.__experimentalGlobalStylesBaseStyles;
			const contextualBasePalette = get( baseStyles, [
				'settings',
				'blocks',
				contextName,
				'color',
				'palette',
			] );
			const globalPalette = get( baseStyles, [
				'settings',
				'color',
				'palette',
			] );
			const basePalette =
				contextualBasePalette?.theme ??
				contextualBasePalette?.core ??
				globalPalette?.theme ??
				globalPalette?.core;
			if ( ! basePalette ) {
				return EMPTY_ARRAY;
			}
			return basePalette.map( ( { slug } ) => slug );
		},
		[ contextName ]
	);
	return (
		<div className="edit-site-global-styles-color-palette-panel">
			<ColorEdit
				immutableColorSlugs={ immutableColorSlugs }
				colors={ colors }
				onChange={ ( newColors ) => {
					setSetting( contextName, 'color.palette', newColors );
				} }
				emptyUI={ __(
					'Colors are empty! Add some colors to create your own color palette.'
				) }
				canReset={ colors === userColors }
			/>
		</div>
	);
}
