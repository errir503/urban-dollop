/**
 * External dependencies
 */
import { get, find, forEach, camelCase, isString } from 'lodash';
/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';

/* Supporting data */
export const ROOT_BLOCK_NAME = 'root';
export const ROOT_BLOCK_SELECTOR = 'body';
export const ROOT_BLOCK_SUPPORTS = [
	'background',
	'backgroundColor',
	'color',
	'linkColor',
	'fontFamily',
	'fontSize',
	'fontStyle',
	'fontWeight',
	'lineHeight',
	'textDecoration',
	'textTransform',
];

export const PRESET_METADATA = [
	{
		path: [ 'color', 'palette' ],
		valueKey: 'color',
		cssVarInfix: 'color',
		classes: [
			{ classSuffix: 'color', propertyName: 'color' },
			{
				classSuffix: 'background-color',
				propertyName: 'background-color',
			},
			{
				classSuffix: 'border-color',
				propertyName: 'border-color',
			},
		],
	},
	{
		path: [ 'color', 'gradients' ],
		valueKey: 'gradient',
		cssVarInfix: 'gradient',
		classes: [
			{
				classSuffix: 'gradient-background',
				propertyName: 'background',
			},
		],
	},
	{
		path: [ 'typography', 'fontSizes' ],
		valueKey: 'size',
		cssVarInfix: 'font-size',
		classes: [ { classSuffix: 'font-size', propertyName: 'font-size' } ],
	},
	{
		path: [ 'typography', 'fontFamilies' ],
		valueKey: 'fontFamily',
		cssVarInfix: 'font-family',
		classes: [],
	},
];

const STYLE_PROPERTIES_TO_CSS_VAR_INFIX = {
	linkColor: 'color',
	backgroundColor: 'color',
	background: 'gradient',
};

function getPresetMetadataFromStyleProperty( styleProperty ) {
	if ( ! getPresetMetadataFromStyleProperty.MAP ) {
		getPresetMetadataFromStyleProperty.MAP = {};
		PRESET_METADATA.forEach( ( { cssVarInfix }, index ) => {
			getPresetMetadataFromStyleProperty.MAP[ camelCase( cssVarInfix ) ] =
				PRESET_METADATA[ index ];
		} );
		forEach( STYLE_PROPERTIES_TO_CSS_VAR_INFIX, ( value, key ) => {
			getPresetMetadataFromStyleProperty.MAP[ key ] =
				getPresetMetadataFromStyleProperty.MAP[ value ];
		} );
	}
	return getPresetMetadataFromStyleProperty.MAP[ styleProperty ];
}

const PATHS_WITH_MERGE = {
	'color.gradients': true,
	'color.palette': true,
	'typography.fontFamilies': true,
	'typography.fontSizes': true,
};

export function useSetting( path, blockName = '' ) {
	const settings = useSelect( ( select ) => {
		return select( editSiteStore ).getSettings();
	} );
	const topLevelPath = `__experimentalFeatures.${ path }`;
	const blockPath = `__experimentalFeatures.blocks.${ blockName }.${ path }`;
	const result = get( settings, blockPath ) ?? get( settings, topLevelPath );
	if ( result && PATHS_WITH_MERGE[ path ] ) {
		return result.user ?? result.theme ?? result.core;
	}
	return result;
}

function findInPresetsBy(
	styles,
	context,
	presetPath,
	presetProperty,
	presetValueValue
) {
	// Block presets take priority above root level presets.
	const orderedPresetsByOrigin = [
		get( styles, [ 'settings', 'blocks', context, ...presetPath ] ),
		get( styles, [ 'settings', ...presetPath ] ),
	];
	for ( const presetByOrigin of orderedPresetsByOrigin ) {
		if ( presetByOrigin ) {
			// Preset origins ordered by priority.
			const origins = [ 'user', 'theme', 'core' ];
			for ( const origin of origins ) {
				const presets = presetByOrigin[ origin ];
				if ( presets ) {
					const presetObject = find(
						presets,
						( preset ) =>
							preset[ presetProperty ] === presetValueValue
					);
					if ( presetObject ) {
						if ( presetProperty === 'slug' ) {
							return presetObject;
						}
						// if there is a highest priority preset with the same slug but different value the preset we found was overwritten and should be ignored.
						const highestPresetObjectWithSameSlug = findInPresetsBy(
							styles,
							context,
							presetPath,
							'slug',
							presetObject.slug
						);
						if (
							highestPresetObjectWithSameSlug[
								presetProperty
							] === presetObject[ presetProperty ]
						) {
							return presetObject;
						}
						return undefined;
					}
				}
			}
		}
	}
}

export function getPresetVariable( styles, context, propertyName, value ) {
	if ( ! value ) {
		return value;
	}

	const metadata = getPresetMetadataFromStyleProperty( propertyName );
	if ( ! metadata ) {
		// The property doesn't have preset data
		// so the value should be returned as it is.
		return value;
	}
	const { valueKey, path, cssVarInfix } = metadata;

	const presetObject = findInPresetsBy(
		styles,
		context,
		path,
		valueKey,
		value
	);

	if ( ! presetObject ) {
		// Value wasn't found in the presets,
		// so it must be a custom value.
		return value;
	}

	return `var:preset|${ cssVarInfix }|${ presetObject.slug }`;
}

function getValueFromPresetVariable(
	styles,
	blockName,
	variable,
	[ presetType, slug ]
) {
	presetType = camelCase( presetType );
	const metadata = getPresetMetadataFromStyleProperty( presetType );
	if ( ! metadata ) {
		return variable;
	}

	const presetObject = findInPresetsBy(
		styles,
		blockName,
		metadata.path,
		'slug',
		slug
	);

	if ( presetObject ) {
		const { valueKey } = metadata;
		const result = presetObject[ valueKey ];
		return getValueFromVariable( styles, blockName, result );
	}

	return variable;
}

function getValueFromCustomVariable( styles, blockName, variable, path ) {
	const result =
		get( styles, [ 'settings', 'blocks', blockName, 'custom', ...path ] ) ??
		get( styles, [ 'settings', 'custom', ...path ] );
	if ( ! result ) {
		return variable;
	}
	// A variable may reference another variable so we need recursion until we find the value.
	return getValueFromVariable( styles, blockName, result );
}

export function getValueFromVariable( styles, blockName, variable ) {
	if ( ! variable || ! isString( variable ) ) {
		return variable;
	}

	let parsedVar;
	const INTERNAL_REFERENCE_PREFIX = 'var:';
	const CSS_REFERENCE_PREFIX = 'var(--wp--';
	const CSS_REFERENCE_SUFFIX = ')';
	if ( variable.startsWith( INTERNAL_REFERENCE_PREFIX ) ) {
		parsedVar = variable
			.slice( INTERNAL_REFERENCE_PREFIX.length )
			.split( '|' );
	} else if (
		variable.startsWith( CSS_REFERENCE_PREFIX ) &&
		variable.endsWith( CSS_REFERENCE_SUFFIX )
	) {
		parsedVar = variable
			.slice( CSS_REFERENCE_PREFIX.length, -CSS_REFERENCE_SUFFIX.length )
			.split( '--' );
	} else {
		// Value is raw.
		return variable;
	}

	const [ type, ...path ] = parsedVar;
	if ( type === 'preset' ) {
		return getValueFromPresetVariable( styles, blockName, variable, path );
	}
	if ( type === 'custom' ) {
		return getValueFromCustomVariable( styles, blockName, variable, path );
	}
	return variable;
}
