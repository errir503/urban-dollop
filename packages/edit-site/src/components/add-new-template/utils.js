/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as editorStore } from '@wordpress/editor';
import { decodeEntities } from '@wordpress/html-entities';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { blockMeta, post } from '@wordpress/icons';

/**
 * @typedef IHasNameAndId
 * @property {string|number} id   The entity's id.
 * @property {string}        name The entity's name.
 */

/**
 * Helper util to map records to add a `name` prop from a
 * provided path, in order to handle all entities in the same
 * fashion(implementing`IHasNameAndId` interface).
 *
 * @param {Object[]} entities The array of entities.
 * @param {string}   path     The path to map a `name` property from the entity.
 * @return {IHasNameAndId[]} An array of enitities that now implement the `IHasNameAndId` interface.
 */
export const mapToIHasNameAndId = ( entities, path ) => {
	return ( entities || [] ).map( ( entity ) => ( {
		...entity,
		name: decodeEntities( get( entity, path ) ),
	} ) );
};

/**
 * @typedef {Object} EntitiesInfo
 * @property {boolean}  hasEntities         If an entity has available records(posts, terms, etc..).
 * @property {number[]} existingEntitiesIds An array of the existing entities ids.
 */

export const useExistingTemplates = () => {
	return useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords( 'postType', 'wp_template', {
				per_page: -1,
			} ),
		[]
	);
};

export const useDefaultTemplateTypes = () => {
	return useSelect(
		( select ) =>
			select( editorStore ).__experimentalGetDefaultTemplateTypes(),
		[]
	);
};

const usePublicPostTypes = () => {
	const postTypes = useSelect(
		( select ) => select( coreStore ).getPostTypes( { per_page: -1 } ),
		[]
	);
	return useMemo( () => {
		const excludedPostTypes = [ 'attachment' ];
		return postTypes?.filter(
			( { viewable, slug } ) =>
				viewable && ! excludedPostTypes.includes( slug )
		);
	}, [ postTypes ] );
};

const usePublicTaxonomies = () => {
	const taxonomies = useSelect(
		( select ) => select( coreStore ).getTaxonomies( { per_page: -1 } ),
		[]
	);
	return useMemo( () => {
		return taxonomies?.filter(
			( { visibility } ) => visibility?.publicly_queryable
		);
	}, [ taxonomies ] );
};

export const usePostTypeMenuItems = ( onClickMenuItem ) => {
	const publicPostTypes = usePublicPostTypes();
	const existingTemplates = useExistingTemplates();
	const defaultTemplateTypes = useDefaultTemplateTypes();
	// `page`is a special case in template hierarchy.
	const templatePrefixes = useMemo(
		() =>
			publicPostTypes?.reduce( ( accumulator, { slug } ) => {
				let suffix = slug;
				if ( slug !== 'page' ) {
					suffix = `single-${ suffix }`;
				}
				accumulator[ slug ] = suffix;
				return accumulator;
			}, {} ),
		[ publicPostTypes ]
	);
	// We need to keep track of naming conflicts. If a conflict
	// occurs, we need to add slug.
	const postTypeLabels = publicPostTypes?.reduce(
		( accumulator, { labels } ) => {
			const singularName = labels.singular_name.toLowerCase();
			accumulator[ singularName ] =
				( accumulator[ singularName ] || 0 ) + 1;
			return accumulator;
		},
		{}
	);
	const needsUniqueIdentifier = ( labels, slug ) => {
		const singularName = labels.singular_name.toLowerCase();
		return postTypeLabels[ singularName ] > 1 && singularName !== slug;
	};
	const postTypesInfo = useEntitiesInfo( 'postType', templatePrefixes );
	const existingTemplateSlugs = ( existingTemplates || [] ).map(
		( { slug } ) => slug
	);
	const menuItems = ( publicPostTypes || [] ).reduce(
		( accumulator, postType ) => {
			const { slug, labels, icon } = postType;
			// We need to check if the general template is part of the
			// defaultTemplateTypes. If it is, just use that info and
			// augment it with the specific template functionality.
			const generalTemplateSlug = templatePrefixes[ slug ];
			const defaultTemplateType = defaultTemplateTypes?.find(
				( { slug: _slug } ) => _slug === generalTemplateSlug
			);
			const hasGeneralTemplate =
				existingTemplateSlugs?.includes( generalTemplateSlug );
			const _needsUniqueIdentifier = needsUniqueIdentifier(
				labels,
				slug
			);
			let menuItemTitle = sprintf(
				// translators: %s: Name of the post type e.g: "Post".
				__( 'Single item: %s' ),
				labels.singular_name
			);
			if ( _needsUniqueIdentifier ) {
				menuItemTitle = sprintf(
					// translators: %1s: Name of the post type e.g: "Post"; %2s: Slug of the post type e.g: "book".
					__( 'Single item: %1$s (%2$s)' ),
					labels.singular_name,
					slug
				);
			}
			const menuItem = defaultTemplateType
				? { ...defaultTemplateType }
				: {
						slug: generalTemplateSlug,
						title: menuItemTitle,
						description: sprintf(
							// translators: %s: Name of the post type e.g: "Post".
							__( 'Displays a single item: %s.' ),
							labels.singular_name
						),
						// `icon` is the `menu_icon` property of a post type. We
						// only handle `dashicons` for now, even if the `menu_icon`
						// also supports urls and svg as values.
						icon: icon?.startsWith( 'dashicons-' )
							? icon.slice( 10 )
							: post,
				  };
			const hasEntities = postTypesInfo?.[ slug ]?.hasEntities;
			// We have a different template creation flow only if they have entities.
			if ( hasEntities ) {
				menuItem.onClick = ( template ) => {
					onClickMenuItem( {
						type: 'postType',
						slug,
						config: {
							recordNamePath: 'title.rendered',
							queryArgs: ( { search } ) => {
								return {
									_fields: 'id,title,slug,link',
									orderBy: search ? 'relevance' : 'modified',
									exclude:
										postTypesInfo[ slug ]
											.existingEntitiesIds,
								};
							},
							getSpecificTemplate: ( suggestion ) => {
								let title = sprintf(
									// translators: Represents the title of a user's custom template in the Site Editor, where %1$s is the singular name of a post type and %2$s is the name of the post, e.g. "Page: Hello".
									__( '%1$s: %2$s' ),
									labels.singular_name,
									suggestion.name
								);
								const description = sprintf(
									// translators: Represents the description of a user's custom template in the Site Editor, e.g. "Template for Page: Hello"
									__( 'Template for %1$s' ),
									title
								);
								if ( _needsUniqueIdentifier ) {
									title = sprintf(
										// translators: Represents the title of a user's custom template in the Site Editor, where %1$s is the template title and %2$s is the slug of the post type, e.g. "Project: Hello (project_type)"
										__( '%1$s (%2$s)' ),
										title,
										slug
									);
								}
								return {
									title,
									description,
									slug: `${ templatePrefixes[ slug ] }-${ suggestion.slug }`,
								};
							},
						},
						labels,
						hasGeneralTemplate,
						template,
					} );
				};
			}
			// We don't need to add the menu item if there are no
			// entities and the general template exists.
			if ( ! hasGeneralTemplate || hasEntities ) {
				accumulator.push( menuItem );
			}
			return accumulator;
		},
		[]
	);
	// Split menu items into two groups: one for the default post types
	// and one for the rest.
	const postTypesMenuItems = useMemo(
		() =>
			menuItems.reduce(
				( accumulator, postType ) => {
					const { slug } = postType;
					let key = 'postTypesMenuItems';
					if ( slug === 'page' ) {
						key = 'defaultPostTypesMenuItems';
					}
					accumulator[ key ].push( postType );
					return accumulator;
				},
				{ defaultPostTypesMenuItems: [], postTypesMenuItems: [] }
			),
		[ menuItems ]
	);
	return postTypesMenuItems;
};

export const useTaxonomiesMenuItems = ( onClickMenuItem ) => {
	const publicTaxonomies = usePublicTaxonomies();
	const existingTemplates = useExistingTemplates();
	const defaultTemplateTypes = useDefaultTemplateTypes();
	// `category` and `post_tag` are special cases in template hierarchy.
	const templatePrefixes = useMemo(
		() =>
			publicTaxonomies?.reduce( ( accumulator, { slug } ) => {
				let suffix = slug;
				if ( ! [ 'category', 'post_tag' ].includes( slug ) ) {
					suffix = `taxonomy-${ suffix }`;
				}
				if ( slug === 'post_tag' ) {
					suffix = `tag`;
				}
				accumulator[ slug ] = suffix;
				return accumulator;
			}, {} ),
		[ publicTaxonomies ]
	);
	// We need to keep track of naming conflicts. If a conflict
	// occurs, we need to add slug.
	const taxonomyLabels = publicTaxonomies?.reduce(
		( accumulator, { labels } ) => {
			const singularName = labels.singular_name.toLowerCase();
			accumulator[ singularName ] =
				( accumulator[ singularName ] || 0 ) + 1;
			return accumulator;
		},
		{}
	);
	const needsUniqueIdentifier = ( labels, slug ) => {
		if ( [ 'category', 'post_tag' ].includes( slug ) ) {
			return false;
		}
		const singularName = labels.singular_name.toLowerCase();
		return taxonomyLabels[ singularName ] > 1 && singularName !== slug;
	};
	const taxonomiesInfo = useEntitiesInfo( 'taxonomy', templatePrefixes );
	const existingTemplateSlugs = ( existingTemplates || [] ).map(
		( { slug } ) => slug
	);
	const menuItems = ( publicTaxonomies || [] ).reduce(
		( accumulator, taxonomy ) => {
			const { slug, labels } = taxonomy;
			// We need to check if the general template is part of the
			// defaultTemplateTypes. If it is, just use that info and
			// augment it with the specific template functionality.
			const generalTemplateSlug = templatePrefixes[ slug ];
			const defaultTemplateType = defaultTemplateTypes?.find(
				( { slug: _slug } ) => _slug === generalTemplateSlug
			);
			const hasGeneralTemplate =
				existingTemplateSlugs?.includes( generalTemplateSlug );
			const _needsUniqueIdentifier = needsUniqueIdentifier(
				labels,
				slug
			);
			let menuItemTitle = labels.singular_name;
			if ( _needsUniqueIdentifier ) {
				menuItemTitle = sprintf(
					// translators: %1s: Name of the taxonomy e.g: "Category"; %2s: Slug of the taxonomy e.g: "product_cat".
					__( '%1$s (%2$s)' ),
					labels.singular_name,
					slug
				);
			}
			const menuItem = defaultTemplateType
				? { ...defaultTemplateType }
				: {
						slug: generalTemplateSlug,
						title: menuItemTitle,
						description: sprintf(
							// translators: %s: Name of the taxonomy e.g: "Product Categories".
							__( 'Displays taxonomy: %s.' ),
							labels.singular_name
						),
						icon: blockMeta,
				  };
			const hasEntities = taxonomiesInfo?.[ slug ]?.hasEntities;
			// We have a different template creation flow only if they have entities.
			if ( hasEntities ) {
				menuItem.onClick = ( template ) => {
					onClickMenuItem( {
						type: 'taxonomy',
						slug,
						config: {
							queryArgs: ( { search } ) => {
								return {
									_fields: 'id,name,slug,link',
									orderBy: search ? 'name' : 'count',
									exclude:
										taxonomiesInfo[ slug ]
											.existingEntitiesIds,
								};
							},
							getSpecificTemplate: ( suggestion ) => {
								let title = sprintf(
									// translators: Represents the title of a user's custom template in the Site Editor, where %1$s is the singular name of a taxonomy and %2$s is the name of the term, e.g. "Category: shoes".
									__( '%1$s: %2$s' ),
									labels.singular_name,
									suggestion.name
								);
								const description = sprintf(
									// translators: Represents the description of a user's custom template in the Site Editor, e.g. "Template for Category: shoes"
									__( 'Template for %1$s' ),
									title
								);
								if ( _needsUniqueIdentifier ) {
									title = sprintf(
										// translators: Represents the title of a user's custom template in the Site Editor, where %1$s is the template title and %2$s is the slug of the taxonomy, e.g. "Category: shoes (product_tag)"
										__( '%1$s (%2$s)' ),
										title,
										slug
									);
								}
								return {
									title,
									description,
									slug: `${ templatePrefixes[ slug ] }-${ suggestion.slug }`,
								};
							},
						},
						labels,
						hasGeneralTemplate,
						template,
					} );
				};
			}
			// We don't need to add the menu item if there are no
			// entities and the general template exists.
			if ( ! hasGeneralTemplate || hasEntities ) {
				accumulator.push( menuItem );
			}
			return accumulator;
		},
		[]
	);
	// Split menu items into two groups: one for the default taxonomies
	// and one for the rest.
	const taxonomiesMenuItems = useMemo(
		() =>
			menuItems.reduce(
				( accumulator, taxonomy ) => {
					const { slug } = taxonomy;
					let key = 'taxonomiesMenuItems';
					if ( [ 'category', 'tag' ].includes( slug ) ) {
						key = 'defaultTaxonomiesMenuItems';
					}
					accumulator[ key ].push( taxonomy );
					return accumulator;
				},
				{ defaultTaxonomiesMenuItems: [], taxonomiesMenuItems: [] }
			),
		[ menuItems ]
	);
	return taxonomiesMenuItems;
};

/**
 * Helper hook that filters all the existing templates by the given
 * object with the entity's slug as key and the template prefix as value.
 *
 * Example:
 * `existingTemplates` is: [ { slug: 'tag-apple' }, { slug: 'page-about' }, { slug: 'tag' } ]
 * `templatePrefixes` is: { post_tag: 'tag' }
 * It will return: { post_tag: ['apple'] }
 *
 * Note: We append the `-` to the given template prefix in this function for our checks.
 *
 * @param {Record<string,string>} templatePrefixes An object with the entity's slug as key and the template prefix as value.
 * @return {Record<string,string[]>} An object with the entity's slug as key and an array with the existing template slugs as value.
 */
const useExistingTemplateSlugs = ( templatePrefixes ) => {
	const existingTemplates = useExistingTemplates();
	const existingSlugs = useMemo( () => {
		return Object.entries( templatePrefixes || {} ).reduce(
			( accumulator, [ slug, prefix ] ) => {
				const slugsWithTemplates = ( existingTemplates || [] ).reduce(
					( _accumulator, existingTemplate ) => {
						const _prefix = `${ prefix }-`;
						if ( existingTemplate.slug.startsWith( _prefix ) ) {
							_accumulator.push(
								existingTemplate.slug.substring(
									_prefix.length
								)
							);
						}
						return _accumulator;
					},
					[]
				);
				if ( slugsWithTemplates.length ) {
					accumulator[ slug ] = slugsWithTemplates;
				}
				return accumulator;
			},
			{}
		);
	}, [ templatePrefixes, existingTemplates ] );
	return existingSlugs;
};

/**
 * Helper hook that finds the existing records with an associated template,
 * as they need to be excluded from the template suggestions.
 *
 * @param {string}                entityName       The entity's name.
 * @param {Record<string,string>} templatePrefixes An object with the entity's slug as key and the template prefix as value.
 * @return {Record<string,EntitiesInfo>} An object with the entity's slug as key and the existing records as value.
 */
const useTemplatesToExclude = ( entityName, templatePrefixes ) => {
	const slugsToExcludePerEntity =
		useExistingTemplateSlugs( templatePrefixes );
	const recordsToExcludePerEntity = useSelect(
		( select ) => {
			return Object.entries( slugsToExcludePerEntity || {} ).reduce(
				( accumulator, [ slug, slugsWithTemplates ] ) => {
					const entitiesWithTemplates = select(
						coreStore
					).getEntityRecords( entityName, slug, {
						_fields: 'id',
						context: 'view',
						slug: slugsWithTemplates,
					} );
					if ( entitiesWithTemplates?.length ) {
						accumulator[ slug ] = entitiesWithTemplates;
					}
					return accumulator;
				},
				{}
			);
		},
		[ slugsToExcludePerEntity ]
	);
	return recordsToExcludePerEntity;
};

/**
 * Helper hook that returns information about an entity having
 * records that we can create a specific template for.
 *
 * For example we can search for `terms` in `taxonomy` entity or
 * `posts` in `postType` entity.
 *
 * First we need to find the existing records with an associated template,
 * to query afterwards for any remaining record, by excluding them.
 *
 * @param {string}                entityName       The entity's name.
 * @param {Record<string,string>} templatePrefixes An object with the entity's slug as key and the template prefix as value.
 * @return {Record<string,EntitiesInfo>} An object with the entity's slug as key and the EntitiesInfo as value.
 */
const useEntitiesInfo = ( entityName, templatePrefixes ) => {
	const recordsToExcludePerEntity = useTemplatesToExclude(
		entityName,
		templatePrefixes
	);
	const entitiesInfo = useSelect(
		( select ) => {
			return Object.keys( templatePrefixes || {} ).reduce(
				( accumulator, slug ) => {
					const existingEntitiesIds =
						recordsToExcludePerEntity?.[ slug ]?.map(
							( { id } ) => id
						) || [];
					accumulator[ slug ] = {
						hasEntities: !! select( coreStore ).getEntityRecords(
							entityName,
							slug,
							{
								per_page: 1,
								_fields: 'id',
								context: 'view',
								exclude: existingEntitiesIds,
							}
						)?.length,
						existingEntitiesIds,
					};
					return accumulator;
				},
				{}
			);
		},
		[ templatePrefixes, recordsToExcludePerEntity ]
	);
	return entitiesInfo;
};
