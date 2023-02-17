/**
 * WordPress dependencies
 */
import {
	MenuGroup,
	MenuItem,
	MenuItemsChoice,
	DropdownMenu,
} from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useEffect, useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useNavigationMenu from '../use-navigation-menu';
import useNavigationEntities from '../use-navigation-entities';

function NavigationMenuSelector( {
	currentMenuId,
	onSelectNavigationMenu,
	onSelectClassicMenu,
	onCreateNew,
	actionLabel,
	createNavigationMenuIsSuccess,
	createNavigationMenuIsError,
} ) {
	/* translators: %s: The name of a menu. */
	const createActionLabel = __( "Create from '%s'" );

	const [ selectorLabel, setSelectorLabel ] = useState( '' );
	const [ isCreatingMenu, setIsCreatingMenu ] = useState( false );

	actionLabel = actionLabel || createActionLabel;

	const { menus: classicMenus } = useNavigationEntities();

	const {
		navigationMenus,
		hasResolvedNavigationMenus,
		canUserCreateNavigationMenu,
		canSwitchNavigationMenu,
	} = useNavigationMenu();

	const menuChoices = useMemo( () => {
		return (
			navigationMenus?.map( ( { id, title }, index ) => {
				const label =
					decodeEntities( title?.rendered ) ||
					/* translators: %s is the index of the menu in the list of menus. */
					sprintf( __( '(no title %s)' ), index + 1 );

				if ( id === currentMenuId && ! isCreatingMenu ) {
					setSelectorLabel(
						/* translators: %s is the name of a navigation menu. */
						sprintf( __( 'You are currently editing %s' ), label )
					);
				}
				return {
					value: id,
					label,
					ariaLabel: sprintf( actionLabel, label ),
				};
			} ) || []
		);
	}, [ currentMenuId, navigationMenus, actionLabel, isCreatingMenu ] );

	const hasNavigationMenus = !! navigationMenus?.length;
	const hasClassicMenus = !! classicMenus?.length;
	const showNavigationMenus = !! canSwitchNavigationMenu;
	const showClassicMenus = !! canUserCreateNavigationMenu;

	const noMenuSelected = hasNavigationMenus && ! currentMenuId;
	const noBlockMenus = ! hasNavigationMenus && hasResolvedNavigationMenus;
	const menuUnavailable =
		hasResolvedNavigationMenus && currentMenuId === null;

	useEffect( () => {
		if ( ! hasResolvedNavigationMenus && ! canUserCreateNavigationMenu ) {
			setSelectorLabel( __( 'Loading …' ) );
		} else if ( noMenuSelected || noBlockMenus || menuUnavailable ) {
			setSelectorLabel( __( 'Choose or create a Navigation menu' ) );
		}

		if (
			isCreatingMenu &&
			( createNavigationMenuIsSuccess || createNavigationMenuIsError )
		) {
			setIsCreatingMenu( false );
		}
	}, [ hasResolvedNavigationMenus, createNavigationMenuIsSuccess ] );

	const NavigationMenuSelectorDropdown = (
		<DropdownMenu
			label={ selectorLabel }
			icon={ moreVertical }
			toggleProps={ { isSmall: true } }
		>
			{ ( { onClose } ) => (
				<>
					{ showNavigationMenus && hasNavigationMenus && (
						<MenuGroup label={ __( 'Menus' ) }>
							<MenuItemsChoice
								value={ currentMenuId }
								onSelect={ ( menuId ) => {
									setSelectorLabel( __( 'Loading …' ) );
									setIsCreatingMenu( true );
									onSelectNavigationMenu( menuId );
									onClose();
								} }
								choices={ menuChoices }
								disabled={ isCreatingMenu }
							/>
						</MenuGroup>
					) }
					{ showClassicMenus && hasClassicMenus && (
						<MenuGroup label={ __( 'Import Classic Menus' ) }>
							{ classicMenus?.map( ( menu ) => {
								const label = decodeEntities( menu.name );
								return (
									<MenuItem
										onClick={ () => {
											setSelectorLabel(
												__( 'Loading …' )
											);
											setIsCreatingMenu( true );
											onSelectClassicMenu( menu );
											onClose();
										} }
										key={ menu.id }
										aria-label={ sprintf(
											createActionLabel,
											label
										) }
										disabled={ isCreatingMenu }
									>
										{ label }
									</MenuItem>
								);
							} ) }
						</MenuGroup>
					) }

					{ canUserCreateNavigationMenu && (
						<MenuGroup label={ __( 'Tools' ) }>
							<MenuItem
								disabled={ isCreatingMenu }
								onClick={ () => {
									onClose();
									onCreateNew();
									setIsCreatingMenu( true );
									setSelectorLabel( __( 'Loading …' ) );
								} }
							>
								{ __( 'Create new menu' ) }
							</MenuItem>
						</MenuGroup>
					) }
				</>
			) }
		</DropdownMenu>
	);

	return NavigationMenuSelectorDropdown;
}

export default NavigationMenuSelector;
