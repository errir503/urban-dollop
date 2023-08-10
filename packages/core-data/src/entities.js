/**
 * External dependencies
 */
import { capitalCase, pascalCase } from 'change-case';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { addEntities } from './actions';
import { getSyncProvider } from './sync';

export const DEFAULT_ENTITY_KEY = 'id';

const POST_RAW_ATTRIBUTES = [ 'title', 'excerpt', 'content' ];

export const rootEntitiesConfig = [
	{
		label: __( 'Base' ),
		kind: 'root',
		name: '__unstableBase',
		baseURL: '/',
		baseURLParams: {
			_fields: [
				'description',
				'gmt_offset',
				'home',
				'name',
				'site_icon',
				'site_icon_url',
				'site_logo',
				'timezone_string',
				'url',
			].join( ',' ),
		},
		syncConfig: {
			fetch: async () => {
				return apiFetch( { path: '/' } );
			},
			applyChangesToDoc: ( doc, changes ) => {
				const document = doc.getMap( 'document' );
				Object.entries( changes ).forEach( ( [ key, value ] ) => {
					if ( document.get( key ) !== value ) {
						document.set( key, value );
					}
				} );
			},
			fromCRDTDoc: ( doc ) => {
				return doc.getMap( 'document' ).toJSON();
			},
		},
		syncObjectType: 'root/base',
		getSyncObjectId: () => 'index',
	},
	{
		label: __( 'Site' ),
		name: 'site',
		kind: 'root',
		baseURL: '/wp/v2/settings',
		getTitle: ( record ) => {
			return record?.title ?? __( 'Site Title' );
		},
		syncConfig: {
			fetch: async () => {
				return apiFetch( { path: '/wp/v2/settings' } );
			},
			applyChangesToDoc: ( doc, changes ) => {
				const document = doc.getMap( 'document' );
				Object.entries( changes ).forEach( ( [ key, value ] ) => {
					if ( document.get( key ) !== value ) {
						document.set( key, value );
					}
				} );
			},
			fromCRDTDoc: ( doc ) => {
				return doc.getMap( 'document' ).toJSON();
			},
		},
		syncObjectType: 'root/site',
		getSyncObjectId: () => 'index',
	},
	{
		label: __( 'Post Type' ),
		name: 'postType',
		kind: 'root',
		key: 'slug',
		baseURL: '/wp/v2/types',
		baseURLParams: { context: 'edit' },
		syncConfig: {
			fetch: async ( id ) => {
				return apiFetch( {
					path: `/wp/v2/types/${ id }?context=edit`,
				} );
			},
			applyChangesToDoc: ( doc, changes ) => {
				const document = doc.getMap( 'document' );
				Object.entries( changes ).forEach( ( [ key, value ] ) => {
					if ( document.get( key ) !== value ) {
						document.set( key, value );
					}
				} );
			},
			fromCRDTDoc: ( doc ) => {
				return doc.getMap( 'document' ).toJSON();
			},
		},
		syncObjectType: 'root/postType',
		getSyncObjectId: ( id ) => id,
	},
	{
		name: 'media',
		kind: 'root',
		baseURL: '/wp/v2/media',
		baseURLParams: { context: 'edit' },
		plural: 'mediaItems',
		label: __( 'Media' ),
		rawAttributes: [ 'caption', 'title', 'description' ],
	},
	{
		name: 'taxonomy',
		kind: 'root',
		key: 'slug',
		baseURL: '/wp/v2/taxonomies',
		baseURLParams: { context: 'edit' },
		plural: 'taxonomies',
		label: __( 'Taxonomy' ),
	},
	{
		name: 'sidebar',
		kind: 'root',
		baseURL: '/wp/v2/sidebars',
		baseURLParams: { context: 'edit' },
		plural: 'sidebars',
		transientEdits: { blocks: true },
		label: __( 'Widget areas' ),
	},
	{
		name: 'widget',
		kind: 'root',
		baseURL: '/wp/v2/widgets',
		baseURLParams: { context: 'edit' },
		plural: 'widgets',
		transientEdits: { blocks: true },
		label: __( 'Widgets' ),
	},
	{
		name: 'widgetType',
		kind: 'root',
		baseURL: '/wp/v2/widget-types',
		baseURLParams: { context: 'edit' },
		plural: 'widgetTypes',
		label: __( 'Widget types' ),
	},
	{
		label: __( 'User' ),
		name: 'user',
		kind: 'root',
		baseURL: '/wp/v2/users',
		baseURLParams: { context: 'edit' },
		plural: 'users',
	},
	{
		name: 'comment',
		kind: 'root',
		baseURL: '/wp/v2/comments',
		baseURLParams: { context: 'edit' },
		plural: 'comments',
		label: __( 'Comment' ),
	},
	{
		name: 'menu',
		kind: 'root',
		baseURL: '/wp/v2/menus',
		baseURLParams: { context: 'edit' },
		plural: 'menus',
		label: __( 'Menu' ),
	},
	{
		name: 'menuItem',
		kind: 'root',
		baseURL: '/wp/v2/menu-items',
		baseURLParams: { context: 'edit' },
		plural: 'menuItems',
		label: __( 'Menu Item' ),
		rawAttributes: [ 'title' ],
	},
	{
		name: 'menuLocation',
		kind: 'root',
		baseURL: '/wp/v2/menu-locations',
		baseURLParams: { context: 'edit' },
		plural: 'menuLocations',
		label: __( 'Menu Location' ),
		key: 'name',
	},
	{
		label: __( 'Global Styles' ),
		name: 'globalStyles',
		kind: 'root',
		baseURL: '/wp/v2/global-styles',
		baseURLParams: { context: 'edit' },
		plural: 'globalStylesVariations', // Should be different than name.
		getTitle: ( record ) => record?.title?.rendered || record?.title,
	},
	{
		label: __( 'Themes' ),
		name: 'theme',
		kind: 'root',
		baseURL: '/wp/v2/themes',
		baseURLParams: { context: 'edit' },
		key: 'stylesheet',
	},
	{
		label: __( 'Plugins' ),
		name: 'plugin',
		kind: 'root',
		baseURL: '/wp/v2/plugins',
		baseURLParams: { context: 'edit' },
		key: 'plugin',
	},
];

export const additionalEntityConfigLoaders = [
	{ kind: 'postType', loadEntities: loadPostTypeEntities },
	{ kind: 'taxonomy', loadEntities: loadTaxonomyEntities },
];

/**
 * Returns a function to be used to retrieve extra edits to apply before persisting a post type.
 *
 * @param {Object} persistedRecord Already persisted Post
 * @param {Object} edits           Edits.
 * @return {Object} Updated edits.
 */
export const prePersistPostType = ( persistedRecord, edits ) => {
	const newEdits = {};

	if ( persistedRecord?.status === 'auto-draft' ) {
		// Saving an auto-draft should create a draft by default.
		if ( ! edits.status && ! newEdits.status ) {
			newEdits.status = 'draft';
		}

		// Fix the auto-draft default title.
		if (
			( ! edits.title || edits.title === 'Auto Draft' ) &&
			! newEdits.title &&
			( ! persistedRecord?.title ||
				persistedRecord?.title === 'Auto Draft' )
		) {
			newEdits.title = '';
		}
	}

	return newEdits;
};

/**
 * Returns the list of post type entities.
 *
 * @return {Promise} Entities promise
 */
async function loadPostTypeEntities() {
	const postTypes = await apiFetch( {
		path: '/wp/v2/types?context=view',
	} );
	return Object.entries( postTypes ?? {} ).map( ( [ name, postType ] ) => {
		const isTemplate = [ 'wp_template', 'wp_template_part' ].includes(
			name
		);
		const namespace = postType?.rest_namespace ?? 'wp/v2';
		return {
			kind: 'postType',
			baseURL: `/${ namespace }/${ postType.rest_base }`,
			baseURLParams: { context: 'edit' },
			name,
			label: postType.name,
			transientEdits: {
				blocks: true,
				selection: true,
			},
			mergedEdits: { meta: true },
			rawAttributes: POST_RAW_ATTRIBUTES,
			getTitle: ( record ) =>
				record?.title?.rendered ||
				record?.title ||
				( isTemplate
					? capitalCase( record.slug ?? '' )
					: String( record.id ) ),
			__unstablePrePersist: isTemplate ? undefined : prePersistPostType,
			__unstable_rest_base: postType.rest_base,
			syncConfig: {
				fetch: async ( id ) => {
					return apiFetch( {
						path: `/${ namespace }/${ postType.rest_base }/${ id }?context=edit`,
					} );
				},
				applyChangesToDoc: ( doc, changes ) => {
					const document = doc.getMap( 'document' );
					Object.entries( changes ).forEach( ( [ key, value ] ) => {
						if (
							document.get( key ) !== value &&
							typeof value !== 'function'
						) {
							document.set( key, value );
						}
					} );
				},
				fromCRDTDoc: ( doc ) => {
					return doc.getMap( 'document' ).toJSON();
				},
			},
			syncObjectType: 'postType/' + postType.name,
			getSyncObjectId: ( id ) => id,
		};
	} );
}

/**
 * Returns the list of the taxonomies entities.
 *
 * @return {Promise} Entities promise
 */
async function loadTaxonomyEntities() {
	const taxonomies = await apiFetch( {
		path: '/wp/v2/taxonomies?context=view',
	} );
	return Object.entries( taxonomies ?? {} ).map( ( [ name, taxonomy ] ) => {
		const namespace = taxonomy?.rest_namespace ?? 'wp/v2';
		return {
			kind: 'taxonomy',
			baseURL: `/${ namespace }/${ taxonomy.rest_base }`,
			baseURLParams: { context: 'edit' },
			name,
			label: taxonomy.name,
		};
	} );
}

/**
 * Returns the entity's getter method name given its kind and name.
 *
 * @example
 * ```js
 * const nameSingular = getMethodName( 'root', 'theme', 'get' );
 * // nameSingular is getRootTheme
 *
 * const namePlural = getMethodName( 'root', 'theme', 'set' );
 * // namePlural is setRootThemes
 * ```
 *
 * @param {string}  kind      Entity kind.
 * @param {string}  name      Entity name.
 * @param {string}  prefix    Function prefix.
 * @param {boolean} usePlural Whether to use the plural form or not.
 *
 * @return {string} Method name
 */
export const getMethodName = (
	kind,
	name,
	prefix = 'get',
	usePlural = false
) => {
	const entityConfig = rootEntitiesConfig.find(
		( config ) => config.kind === kind && config.name === name
	);
	const kindPrefix = kind === 'root' ? '' : pascalCase( kind );
	const nameSuffix = pascalCase( name ) + ( usePlural ? 's' : '' );
	const suffix =
		usePlural && 'plural' in entityConfig && entityConfig?.plural
			? pascalCase( entityConfig.plural )
			: nameSuffix;
	return `${ prefix }${ kindPrefix }${ suffix }`;
};

function registerSyncConfigs( configs ) {
	configs.forEach( ( { syncObjectType, syncConfig } ) => {
		getSyncProvider().register( syncObjectType, syncConfig );
		const editSyncConfig = { ...syncConfig };
		delete editSyncConfig.fetch;
		getSyncProvider().register( syncObjectType + '--edit', editSyncConfig );
	} );
}

/**
 * Loads the kind entities into the store.
 *
 * @param {string} kind Kind
 *
 * @return {(thunkArgs: object) => Promise<Array>} Entities
 */
export const getOrLoadEntitiesConfig =
	( kind ) =>
	async ( { select, dispatch } ) => {
		let configs = select.getEntitiesConfig( kind );
		if ( configs && configs.length !== 0 ) {
			registerSyncConfigs( configs );
			return configs;
		}

		const loader = additionalEntityConfigLoaders.find(
			( l ) => l.kind === kind
		);
		if ( ! loader ) {
			return [];
		}

		configs = await loader.loadEntities();
		registerSyncConfigs( configs );
		dispatch( addEntities( configs ) );

		return configs;
	};
