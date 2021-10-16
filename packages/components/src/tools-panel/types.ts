/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { ReactNode } from 'react';

type ResetAllFilter = () => void;
type ResetAll = ( filters?: ResetAllFilter[] ) => void;

export type ToolsPanelProps = {
	/**
	 * The child elements.
	 */
	children: ReactNode;
	/**
	 * Flags that the items in this ToolsPanel will be contained within an inner
	 * wrapper element allowing the panel to lay them out accordingly.
	 */
	hasInnerWrapper: boolean;
	/**
	 * Text to be displayed within the panel's header and as the `aria-label`
	 * for the panel's dropdown menu.
	 */
	label: string;
	/**
	 * If a `panelId` is set, it is passed through the `ToolsPanelContext` and
	 * used to restrict panel items. Only items with a matching `panelId` will
	 * be able to register themselves with this panel.
	 */
	panelId: string;
	/**
	 * A function to call when the `Reset all` menu option is selected. This is
	 * passed through to the panel's header component.
	 */
	resetAll: ResetAll;
	/**
	 * Advises the `ToolsPanel` that its child `ToolsPanelItem`s should render
	 * placeholder content instead of null when they are toggled off and hidden.
	 */
	shouldRenderPlaceholderItems: boolean;
};

export type ToolsPanelHeaderProps = {
	/**
	 * Text to be displayed within the panel header. It is also passed along as
	 * the `label` for the panel header's `DropdownMenu`.
	 */
	label: string;
	/**
	 * The `resetAll` prop provides the callback to execute when the "Reset all"
	 * menu item is selected. Its purpose is to facilitate resetting any control
	 * values for items contained within this header's panel.
	 */
	resetAll: ResetAll;
	/**
	 * This is executed when an individual control's menu item is toggled. It
	 * will update the panel's menu item state and call the panel item's
	 * `onSelect` or `onDeselect` callbacks as appropriate.
	 */
	toggleItem: ( label: string ) => void;
};

export type ToolsPanelItem = {
	/**
	 * This is called when building the `ToolsPanel` menu to determine the
	 * item's initial checked state.
	 */
	hasValue: () => boolean;
	/**
	 * This prop identifies the current item as being displayed by default. This
	 * means it will show regardless of whether it has a value set or is toggled
	 * on in the panel's menu.
	 */
	isShownByDefault: boolean;
	/**
	 * The supplied label is dual purpose. It is used as:
	 * 1. the human-readable label for the panel's dropdown menu
	 * 2. a key to locate the corresponding item in the panel's menu context to
	 * determine if the panel item should be displayed.
	 * A panel item's `label` should be unique among all items within a single
	 * panel.
	 */
	label: string;
	/**
	 * Panel items will ensure they are only registering with their intended
	 * panel by comparing the `panelId` props set on both the item and the panel
	 * itself. This allows items to be injected from a shared source.
	 */
	panelId: string;
	/**
	 * A `ToolsPanel` will collect each item's `resetAllFilter` and pass an
	 * array of these functions through to the panel's `resetAll` callback. They
	 * can then be iterated over to perform additional tasks.
	 */
	resetAllFilter: ResetAllFilter;
};

export type ToolsPanelItemProps = ToolsPanelItem & {
	/**
	 * The child elements.
	 */
	children?: ReactNode;
	/**
	 * Called when this item is deselected in the `ToolsPanel` menu. This is
	 * normally used to reset the panel item control's value.
	 */
	onDeselect?: () => void;
	/**
	 * A callback to take action when this item is selected in the `ToolsPanel`
	 * menu.
	 */
	onSelect?: () => void;
};

export type ToolsPanelMenuItemKey = 'default' | 'optional';

export type ToolsPanelMenuItems = {
	[ menuItemKey in ToolsPanelMenuItemKey ]: { [ key: string ]: boolean };
};

export type ToolsPanelContext = {
	panelId?: string;
	menuItems: ToolsPanelMenuItems;
	hasMenuItems: boolean;
	registerPanelItem: ( item: ToolsPanelItem ) => void;
	deregisterPanelItem: ( label: string ) => void;
	flagItemCustomization: ( label: string ) => void;
	isResetting: boolean;
	shouldRenderPlaceholderItems: boolean;
	areAllOptionalControlsHidden: boolean;
};

export type ToolsPanelControlsGroupProps = {
	items: [ string, boolean ][];
	onClose: () => void;
	toggleItem: ( label: string ) => void;
};

export type ToolsPanelMenuItemsConfig = {
	panelItems: ToolsPanelItem[];
	shouldReset: boolean;
};
