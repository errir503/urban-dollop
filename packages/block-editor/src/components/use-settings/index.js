/**
 * WordPress dependencies
 */
import {
	__EXPERIMENTAL_PATHS_WITH_MERGE as PATHS_WITH_MERGE,
	hasBlockSupport,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';
import { useMemo } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { useBlockEditContext } from '../block-edit';
import { store as blockEditorStore } from '../../store';
import { getValueFromObjectPath } from '../../utils/object';

const blockedPaths = [
	'color',
	'border',
	'dimensions',
	'typography',
	'spacing',
];

const deprecatedFlags = {
	'color.palette': ( settings ) => settings.colors,
	'color.gradients': ( settings ) => settings.gradients,
	'color.custom': ( settings ) =>
		settings.disableCustomColors === undefined
			? undefined
			: ! settings.disableCustomColors,
	'color.customGradient': ( settings ) =>
		settings.disableCustomGradients === undefined
			? undefined
			: ! settings.disableCustomGradients,
	'typography.fontSizes': ( settings ) => settings.fontSizes,
	'typography.customFontSize': ( settings ) =>
		settings.disableCustomFontSizes === undefined
			? undefined
			: ! settings.disableCustomFontSizes,
	'typography.lineHeight': ( settings ) => settings.enableCustomLineHeight,
	'spacing.units': ( settings ) => {
		if ( settings.enableCustomUnits === undefined ) {
			return;
		}

		if ( settings.enableCustomUnits === true ) {
			return [ 'px', 'em', 'rem', 'vh', 'vw', '%' ];
		}

		return settings.enableCustomUnits;
	},
	'spacing.padding': ( settings ) => settings.enableCustomSpacing,
};

const prefixedFlags = {
	/*
	 * These were only available in the plugin
	 * and can be removed when the minimum WordPress version
	 * for the plugin is 5.9.
	 */
	'border.customColor': 'border.color',
	'border.customStyle': 'border.style',
	'border.customWidth': 'border.width',
	'typography.customFontStyle': 'typography.fontStyle',
	'typography.customFontWeight': 'typography.fontWeight',
	'typography.customLetterSpacing': 'typography.letterSpacing',
	'typography.customTextDecorations': 'typography.textDecoration',
	'typography.customTextTransforms': 'typography.textTransform',
	/*
	 * These were part of WordPress 5.8 and we need to keep them.
	 */
	'border.customRadius': 'border.radius',
	'spacing.customMargin': 'spacing.margin',
	'spacing.customPadding': 'spacing.padding',
	'typography.customLineHeight': 'typography.lineHeight',
};

/**
 * Remove `custom` prefixes for flags that did not land in 5.8.
 *
 * This provides continued support for `custom` prefixed properties. It will
 * be removed once third party devs have had sufficient time to update themes,
 * plugins, etc.
 *
 * @see https://github.com/WordPress/gutenberg/pull/34485
 *
 * @param {string} path Path to desired value in settings.
 * @return {string}     The value for defined setting.
 */
const removeCustomPrefixes = ( path ) => {
	return prefixedFlags[ path ] || path;
};

/**
 * For settings like `color.palette`, which have a value that is an object
 * with `default`, `theme`, `custom`, with field values that are arrays of
 * items, merge these three arrays into one and return it. The calculation
 * is memoized so that identical input values produce identical output.
 * @param {Object} value Object to merge
 * @return {Array} Array of merged items
 */
function mergeOrigins( value ) {
	let result = mergeCache.get( value );
	if ( ! result ) {
		result = [ 'default', 'theme', 'custom' ].flatMap(
			( key ) => value[ key ] ?? []
		);
		mergeCache.set( value, result );
	}
	return result;
}
const mergeCache = new WeakMap();

/**
 * Hook that retrieves the given settings for the block instance in use.
 *
 * It looks up the settings first in the block instance hierarchy.
 * If none are found, it'll look them up in the block editor settings.
 *
 * @param {string[]} paths The paths to the settings.
 * @return {any[]} Returns the values defined for the settings.
 * @example
 * ```js
 * const [ fixed, sticky ] = useSettings( 'position.fixed', 'position.sticky' );
 * ```
 */
export function useSettings( ...paths ) {
	const { name: blockName, clientId = null } = useBlockEditContext();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	paths = useMemo( () => paths, paths );

	return useSelect(
		( select ) => {
			const candidates = clientId
				? [
						clientId,
						...select( blockEditorStore ).getBlockParents(
							clientId,
							/* ascending */ true
						),
				  ].filter( ( candidateClientId ) => {
						const candidateBlockName =
							select( blockEditorStore ).getBlockName(
								candidateClientId
							);
						return hasBlockSupport(
							candidateBlockName,
							'__experimentalSettings',
							false
						);
				  } )
				: [];

			return paths.map( ( path ) => {
				if ( blockedPaths.includes( path ) ) {
					// eslint-disable-next-line no-console
					console.warn(
						'Top level useSetting paths are disabled. Please use a subpath to query the information needed.'
					);
					return undefined;
				}

				// 0. Allow third parties to filter the block's settings at runtime.
				let result = applyFilters(
					'blockEditor.useSetting.before',
					undefined,
					path,
					clientId,
					blockName
				);

				if ( undefined !== result ) {
					return result;
				}

				const normalizedPath = removeCustomPrefixes( path );

				// 1. Take settings from the block instance or its ancestors.
				// Start from the current block and work our way up the ancestors.
				for ( const candidateClientId of candidates ) {
					const candidateAtts =
						select( blockEditorStore ).getBlockAttributes(
							candidateClientId
						);
					result =
						getValueFromObjectPath(
							candidateAtts.settings?.blocks?.[ blockName ],
							normalizedPath
						) ??
						getValueFromObjectPath(
							candidateAtts.settings,
							normalizedPath
						);
					if ( result !== undefined ) {
						// Stop the search for more distant ancestors and move on.
						break;
					}
				}

				// 2. Fall back to the settings from the block editor store (__experimentalFeatures).
				const settings = select( blockEditorStore ).getSettings();
				if ( result === undefined && blockName ) {
					result = getValueFromObjectPath(
						settings.__experimentalFeatures?.blocks?.[ blockName ],
						normalizedPath
					);
				}

				if ( result === undefined ) {
					result = getValueFromObjectPath(
						settings.__experimentalFeatures,
						normalizedPath
					);
				}

				// Return if the setting was found in either the block instance or the store.
				if ( result !== undefined ) {
					if ( PATHS_WITH_MERGE[ normalizedPath ] ) {
						return mergeOrigins( result );
					}
					return result;
				}

				// 3. Otherwise, use deprecated settings.
				const deprecatedSettingsValue =
					deprecatedFlags[ normalizedPath ]?.( settings );
				if ( deprecatedSettingsValue !== undefined ) {
					return deprecatedSettingsValue;
				}

				// 4. Fallback for typography.dropCap:
				// This is only necessary to support typography.dropCap.
				// when __experimentalFeatures are not present (core without plugin).
				// To remove when __experimentalFeatures are ported to core.
				return normalizedPath === 'typography.dropCap'
					? true
					: undefined;
			} );
		},
		[ blockName, clientId, paths ]
	);
}

/**
 * Hook that retrieves the given setting for the block instance in use.
 *
 * It looks up the setting first in the block instance hierarchy.
 * If none is found, it'll look it up in the block editor settings.
 *
 * @param {string} path The path to the setting.
 * @return {any} Returns the value defined for the setting.
 * @deprecated 6.4.0 Use useSettings instead.
 * @example
 * ```js
 * const isEnabled = useSetting( 'typography.dropCap' );
 * ```
 */
export function useSetting( path ) {
	deprecated( 'wp.blockEditor.useSetting', {
		since: '6.4',
		alternative: 'wp.blockEditor.useSettings',
		note: 'The new useSettings function can retrieve multiple settings at once, with better performance.',
	} );

	const [ value ] = useSettings( path );
	return value;
}
