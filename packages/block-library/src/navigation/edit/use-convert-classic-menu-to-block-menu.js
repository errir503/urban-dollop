/**
 * WordPress dependencies
 */
import { useRegistry, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useState, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useCreateNavigationMenu from './use-create-navigation-menu';
import menuItemsToBlocks from '../menu-items-to-blocks';

export const CLASSIC_MENU_CONVERSION_SUCCESS = 'success';
export const CLASSIC_MENU_CONVERSION_ERROR = 'error';
export const CLASSIC_MENU_CONVERSION_PENDING = 'pending';
export const CLASSIC_MENU_CONVERSION_IDLE = 'idle';

function useConvertClassicToBlockMenu( clientId ) {
	/*
	 * The wp_navigation post is created as a draft so the changes on the frontend and
	 * the site editor are not permanent without a save interaction done by the user.
	 */
	const { create: createNavigationMenu } = useCreateNavigationMenu(
		clientId,
		'draft'
	);
	const registry = useRegistry();
	const { editEntityRecord } = useDispatch( coreStore );

	const [ status, setStatus ] = useState( CLASSIC_MENU_CONVERSION_IDLE );
	const [ error, setError ] = useState( null );

	async function convertClassicMenuToBlockMenu( menuId, menuName ) {
		let navigationMenu;
		let classicMenuItems;

		// 1. Fetch the classic Menu items.
		try {
			classicMenuItems = await registry
				.resolveSelect( coreStore )
				.getMenuItems( {
					menus: menuId,
					per_page: -1,
					context: 'view',
				} );
		} catch ( err ) {
			throw new Error(
				sprintf(
					// translators: %s: the name of a menu (e.g. Header navigation).
					__( `Unable to fetch classic menu "%s" from API.` ),
					menuName
				),
				{
					cause: err,
				}
			);
		}

		// Handle offline response which resolves to `null`.
		if ( classicMenuItems === null ) {
			throw new Error(
				sprintf(
					// translators: %s: the name of a menu (e.g. Header navigation).
					__( `Unable to fetch classic menu "%s" from API.` ),
					menuName
				)
			);
		}

		// 2. Convert the classic items into blocks.
		const { innerBlocks } = menuItemsToBlocks( classicMenuItems );

		// 3. Create the `wp_navigation` Post with the blocks.
		try {
			navigationMenu = await createNavigationMenu(
				menuName,
				innerBlocks
			);

			/**
			 * Immediately trigger editEntityRecord to change the wp_navigation post status to 'publish'.
			 * This status change causes the menu to be displayed on the front of the site and sets the post state to be "dirty".
			 * The problem being solved is if saveEditedEntityRecord was used here, the menu would be updated on the frontend and the editor _automatically_,
			 * without user interaction.
			 * If the user abandons the site editor without saving, there would still be a wp_navigation post created as draft.
			 */
			await editEntityRecord(
				'postType',
				'wp_navigation',
				navigationMenu.id,
				{
					status: 'publish',
				},
				{ throwOnError: true }
			);
		} catch ( err ) {
			throw new Error(
				sprintf(
					// translators: %s: the name of a menu (e.g. Header navigation).
					__( `Unable to create Navigation Menu "%s".` ),
					menuName
				),
				{
					cause: err,
				}
			);
		}

		return navigationMenu;
	}

	const convert = useCallback( async ( menuId, menuName ) => {
		if ( ! menuId || ! menuName ) {
			setError( 'Unable to convert menu. Missing menu details.' );
			setStatus( CLASSIC_MENU_CONVERSION_ERROR );
			return;
		}

		setStatus( CLASSIC_MENU_CONVERSION_PENDING );
		setError( null );

		return await convertClassicMenuToBlockMenu( menuId, menuName )
			.then( ( navigationMenu ) => {
				setStatus( CLASSIC_MENU_CONVERSION_SUCCESS );
				return navigationMenu;
			} )
			.catch( ( err ) => {
				setError( err?.message );
				setStatus( CLASSIC_MENU_CONVERSION_ERROR );

				// Rethrow error for debugging.
				throw new Error(
					sprintf(
						// translators: %s: the name of a menu (e.g. Header navigation).
						__( `Unable to create Navigation Menu "%s".` ),
						menuName
					),
					{
						cause: err,
					}
				);
			} );
	}, [] );

	return {
		convert,
		status,
		error,
	};
}

export default useConvertClassicToBlockMenu;
