/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Navigation from '..';
import NavigationItem from '../item';
import NavigationMenu from '../menu';
import NavigationGroup from '../group';

export function GroupStory() {
	const [ activeItem, setActiveItem ] = useState( 'item-1' );

	return (
		<Navigation activeItem={ activeItem } className="navigation-story">
			<NavigationMenu title="Home">
				<NavigationGroup title="Group 1">
					<NavigationItem
						item="item-1"
						onClick={ () => setActiveItem( 'item-1' ) }
						title="Item 1"
					/>
					<NavigationItem
						item="item-2"
						onClick={ () => setActiveItem( 'item-2' ) }
						title="Item 2"
					/>
				</NavigationGroup>
				<NavigationGroup title="Group 2">
					<NavigationItem
						item="item-3"
						onClick={ () => setActiveItem( 'item-3' ) }
						title="Item 3"
					/>
					<NavigationItem
						item="item-4"
						onClick={ () => setActiveItem( 'item-4' ) }
						title="Item 4"
					/>
				</NavigationGroup>
			</NavigationMenu>
		</Navigation>
	);
}
