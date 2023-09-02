/**
 * External dependencies
 */
import { isPlainObject } from 'is-plain-object';

/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { isValidIcon, normalizeIconObject, omit } from '../api/utils';
import { BLOCK_ICON_DEFAULT, DEPRECATED_ENTRY_KEYS } from '../api/constants';

/** @typedef {import('../api/registration').WPBlockType} WPBlockType */

const { error, warn } = window.console;

/**
 * Mapping of legacy category slugs to their latest normal values, used to
 * accommodate updates of the default set of block categories.
 *
 * @type {Record<string,string>}
 */
const LEGACY_CATEGORY_MAPPING = {
	common: 'text',
	formatting: 'text',
	layout: 'design',
};

/**
 * Takes the unprocessed block type settings, merges them with block type metadata
 * and applies all the existing filters for the registered block type.
 * Next, it validates all the settings and performs additional processing to the block type definition.
 *
 * @param {string}      name          Block name.
 * @param {WPBlockType} blockSettings Unprocessed block type settings.
 *
 * @return {WPBlockType | undefined} The block, if it has been processed and can be registered; otherwise `undefined`.
 */
export const processBlockType =
	( name, blockSettings ) =>
	( { select } ) => {
		const blockType = {
			name,
			icon: BLOCK_ICON_DEFAULT,
			keywords: [],
			attributes: {},
			providesContext: {},
			usesContext: [],
			selectors: {},
			supports: {},
			styles: [],
			variations: [],
			save: () => null,
			...select.getBootstrappedBlockType( name ),
			...blockSettings,
		};

		const settings = applyFilters(
			'blocks.registerBlockType',
			blockType,
			name,
			null
		);

		if (
			settings.description &&
			typeof settings.description !== 'string'
		) {
			deprecated( 'Declaring non-string block descriptions', {
				since: '6.2',
			} );
		}

		if ( settings.deprecated ) {
			settings.deprecated = settings.deprecated.map( ( deprecation ) =>
				Object.fromEntries(
					Object.entries(
						// Only keep valid deprecation keys.
						applyFilters(
							'blocks.registerBlockType',
							// Merge deprecation keys with pre-filter settings
							// so that filters that depend on specific keys being
							// present don't fail.
							{
								// Omit deprecation keys here so that deprecations
								// can opt out of specific keys like "supports".
								...omit( blockType, DEPRECATED_ENTRY_KEYS ),
								...deprecation,
							},
							blockType.name,
							deprecation
						)
					).filter( ( [ key ] ) =>
						DEPRECATED_ENTRY_KEYS.includes( key )
					)
				)
			);
		}

		if ( ! isPlainObject( settings ) ) {
			error( 'Block settings must be a valid object.' );
			return;
		}

		if ( typeof settings.save !== 'function' ) {
			error( 'The "save" property must be a valid function.' );
			return;
		}
		if ( 'edit' in settings && typeof settings.edit !== 'function' ) {
			error( 'The "edit" property must be a valid function.' );
			return;
		}

		// Canonicalize legacy categories to equivalent fallback.
		if ( LEGACY_CATEGORY_MAPPING.hasOwnProperty( settings.category ) ) {
			settings.category = LEGACY_CATEGORY_MAPPING[ settings.category ];
		}

		if (
			'category' in settings &&
			! select
				.getCategories()
				.some( ( { slug } ) => slug === settings.category )
		) {
			warn(
				'The block "' +
					name +
					'" is registered with an invalid category "' +
					settings.category +
					'".'
			);
			delete settings.category;
		}

		if ( ! ( 'title' in settings ) || settings.title === '' ) {
			error( 'The block "' + name + '" must have a title.' );
			return;
		}
		if ( typeof settings.title !== 'string' ) {
			error( 'Block titles must be strings.' );
			return;
		}

		settings.icon = normalizeIconObject( settings.icon );
		if ( ! isValidIcon( settings.icon.src ) ) {
			error(
				'The icon passed is invalid. ' +
					'The icon should be a string, an element, a function, or an object following the specifications documented in https://developer.wordpress.org/block-editor/developers/block-api/block-registration/#icon-optional'
			);
			return;
		}

		return settings;
	};
