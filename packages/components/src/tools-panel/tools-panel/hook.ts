/**
 * WordPress dependencies
 */
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from '../styles';
import { useContextSystem, WordPressComponentProps } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';
import type {
	ToolsPanelItem,
	ToolsPanelMenuItemKey,
	ToolsPanelMenuItems,
	ToolsPanelMenuItemsConfig,
	ToolsPanelProps,
} from '../types';

const DEFAULT_COLUMNS = 2;

const generateMenuItems = ( {
	panelItems,
	shouldReset,
}: ToolsPanelMenuItemsConfig ) => {
	const menuItems: ToolsPanelMenuItems = { default: {}, optional: {} };

	panelItems.forEach( ( { hasValue, isShownByDefault, label } ) => {
		const group = isShownByDefault ? 'default' : 'optional';
		menuItems[ group ][ label ] = shouldReset ? false : hasValue();
	} );

	return menuItems;
};

export function useToolsPanel(
	props: WordPressComponentProps< ToolsPanelProps, 'div' >
) {
	const {
		className,
		resetAll,
		panelId,
		hasInnerWrapper,
		shouldRenderPlaceholderItems,
		...otherProps
	} = useContextSystem( props, 'ToolsPanel' );

	const isResetting = useRef( false );
	const wasResetting = isResetting.current;

	// `isResetting` is cleared via this hook to effectively batch together
	// the resetAll task. Without this, the flag is cleared after the first
	// control updates and forces a rerender with subsequent controls then
	// believing they need to reset, unfortunately using stale data.
	useEffect( () => {
		if ( wasResetting ) {
			isResetting.current = false;
		}
	}, [ wasResetting ] );

	// Allow panel items to register themselves.
	const [ panelItems, setPanelItems ] = useState< ToolsPanelItem[] >( [] );

	const registerPanelItem = ( item: ToolsPanelItem ) => {
		setPanelItems( ( items ) => [ ...items, item ] );
	};

	// Panels need to deregister on unmount to avoid orphans in menu state.
	// This is an issue when panel items are being injected via SlotFills.
	const deregisterPanelItem = ( label: string ) => {
		// When switching selections between components injecting matching
		// controls, e.g. both panels have a "padding" control, the
		// deregistration of the first panel doesn't occur until after the
		// registration of the next.
		const index = panelItems.findIndex( ( item ) => item.label === label );

		if ( index !== -1 ) {
			setPanelItems( ( items ) => items.splice( index, 1 ) );
		}
	};

	// Manage and share display state of menu items representing child controls.
	const [ menuItems, setMenuItems ] = useState< ToolsPanelMenuItems >( {
		default: {},
		optional: {},
	} );

	// Setup menuItems state as panel items register themselves.
	useEffect( () => {
		const items = generateMenuItems( {
			panelItems,
			shouldReset: false,
		} );
		setMenuItems( items );
	}, [ panelItems ] );

	// Force a menu item to be checked.
	// This is intended for use with default panel items. They are displayed
	// separately to optional items and have different display states,
	//.we need to update that when their value is customized.
	const flagItemCustomization = (
		label: string,
		group: ToolsPanelMenuItemKey = 'default'
	) => {
		setMenuItems( {
			...menuItems,
			[ group ]: {
				...menuItems[ group ],
				[ label ]: true,
			},
		} );
	};

	// Whether all optional menu items are hidden or not must be tracked
	// in order to later determine if the panel display is empty and handle
	// conditional display of a plus icon to indicate the presence of further
	// menu items.
	const [
		areAllOptionalControlsHidden,
		setAreAllOptionalControlsHidden,
	] = useState( false );

	useEffect( () => {
		if ( menuItems.optional ) {
			const optionalItems = Object.entries( menuItems.optional );
			const allControlsHidden =
				optionalItems.length > 0 &&
				! optionalItems.some( ( [ , isSelected ] ) => isSelected );
			setAreAllOptionalControlsHidden( allControlsHidden );
		}
	}, [ menuItems.optional ] );

	const cx = useCx();
	const classes = useMemo( () => {
		const hasDefaultMenuItems =
			menuItems?.default && !! Object.keys( menuItems?.default ).length;
		const wrapperStyle =
			hasInnerWrapper &&
			styles.ToolsPanelWithInnerWrapper( DEFAULT_COLUMNS );
		const emptyStyle =
			! hasDefaultMenuItems &&
			areAllOptionalControlsHidden &&
			styles.ToolsPanelHiddenInnerWrapper;

		return cx( styles.ToolsPanel, wrapperStyle, emptyStyle, className );
	}, [
		className,
		hasInnerWrapper,
		menuItems,
		areAllOptionalControlsHidden,
	] );

	// Toggle the checked state of a menu item which is then used to determine
	// display of the item within the panel.
	const toggleItem = ( label: string ) => {
		const currentItem = panelItems.find( ( item ) => item.label === label );

		if ( ! currentItem ) {
			return;
		}

		const menuGroup = currentItem.isShownByDefault ? 'default' : 'optional';

		const newMenuItems = {
			...menuItems,
			[ menuGroup ]: {
				...menuItems[ menuGroup ],
				[ label ]: ! menuItems[ menuGroup ][ label ],
			},
		};

		setMenuItems( newMenuItems );
	};

	const getResetAllFilters = () => {
		const filters: Array< () => void > = [];

		panelItems.forEach( ( item ) => {
			if ( item.resetAllFilter ) {
				filters.push( item.resetAllFilter );
			}
		} );
		return filters;
	};

	// Resets display of children and executes resetAll callback if available.
	const resetAllItems = () => {
		if ( typeof resetAll === 'function' ) {
			isResetting.current = true;
			resetAll( getResetAllFilters() );
		}

		// Turn off display of all non-default items.
		const resetMenuItems = generateMenuItems( {
			panelItems,
			shouldReset: true,
		} );
		setMenuItems( resetMenuItems );
	};

	const panelContext = {
		panelId,
		menuItems,
		registerPanelItem,
		deregisterPanelItem,
		flagItemCustomization,
		areAllOptionalControlsHidden,
		hasMenuItems: !! panelItems.length,
		isResetting: isResetting.current,
		shouldRenderPlaceholderItems,
	};

	return {
		...otherProps,
		panelContext,
		resetAllItems,
		toggleItem,
		className: classes,
	};
}
