/**
 * WordPress dependencies
 */
import {
	category,
	page,
	postList,
	tag,
	customPostType,
} from '@wordpress/icons';

function getIcon( variationName ) {
	switch ( variationName ) {
		case 'post':
			return postList;
		case 'page':
			return page;
		case 'tag':
			return tag;
		case 'category':
			return category;
		default:
			return customPostType;
	}
}

export function enhanceNavigationLinkVariations( settings, name ) {
	if ( name !== 'core/navigation-link' ) {
		return settings;
	}

	// Otherwise decorate server passed variations with an icon and isActive function.
	if ( settings.variations ) {
		const isActive = ( blockAttributes, variationAttributes ) => {
			return blockAttributes.type === variationAttributes.type;
		};
		const variations = settings.variations.map( ( variation ) => {
			return {
				...variation,
				...( ! variation.icon && {
					icon: getIcon( variation.name ),
				} ),
				...( ! variation.isActive && {
					isActive,
				} ),
			};
		} );
		return {
			...settings,
			variations,
		};
	}
	return settings;
}
