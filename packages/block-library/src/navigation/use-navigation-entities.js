/**
 * WordPress dependencies
 */
import { useEntityRecords } from '@wordpress/core-data';

/**
 * @typedef {Object} NavigationEntitiesData
 * @property {Array|undefined} pages                - a collection of WP Post entity objects of post type "Page".
 * @property {boolean}         isResolvingPages     - indicates whether the request to fetch pages is currently resolving.
 * @property {boolean}         hasResolvedPages     - indicates whether the request to fetch pages has finished resolving.
 * @property {Array|undefined} menus                - a collection of Menu entity objects.
 * @property {boolean}         isResolvingMenus     - indicates whether the request to fetch menus is currently resolving.
 * @property {boolean}         hasResolvedMenus     - indicates whether the request to fetch menus has finished resolving.
 * @property {Array|undefined} menusItems           - a collection of Menu Item entity objects for the current menuId.
 * @property {boolean}         hasResolvedMenuItems - indicates whether the request to fetch menuItems has finished resolving.
 * @property {boolean}         hasPages             - indicates whether there is currently any data for pages.
 * @property {boolean}         hasMenus             - indicates whether there is currently any data for menus.
 */

/**
 * Manages fetching and resolution state for all entities required
 * for the Navigation block.
 *
 * @param {number} menuId the menu for which to retrieve menuItem data.
 * @return { NavigationEntitiesData } the entity data.
 */
export default function useNavigationEntities( menuId ) {
	const {
		records: menus,
		isResolving: isResolvingMenus,
		hasResolved: hasResolvedMenus,
	} = useEntityRecords( 'root', 'menu', { per_page: -1, context: 'view' } );

	const {
		records: pages,
		isResolving: isResolvingPages,
		hasResolved: hasResolvedPages,
	} = useEntityRecords( 'postType', 'page', {
		parent: 0,
		order: 'asc',
		orderby: 'id',
		per_page: -1,
		context: 'view',
	} );

	const { records: menuItems, hasResolved: hasResolvedMenuItems } =
		useEntityRecords(
			'root',
			'menuItem',
			{
				menus: menuId,
				per_page: -1,
				context: 'view',
			},
			{ enabled: !! menuId }
		);

	return {
		pages,
		isResolvingPages,
		hasResolvedPages,
		hasPages: !! ( hasResolvedPages && pages?.length ),

		menus,
		isResolvingMenus,
		hasResolvedMenus,
		hasMenus: !! ( hasResolvedMenus && menus?.length ),

		menuItems,
		hasResolvedMenuItems,
	};
}
