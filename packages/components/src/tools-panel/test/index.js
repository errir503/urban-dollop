/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { ToolsPanel, ToolsPanelContext, ToolsPanelItem } from '../';
import { createSlotFill, Provider as SlotFillProvider } from '../../slot-fill';

const { Fill: ToolsPanelItems, Slot } = createSlotFill( 'ToolsPanelSlot' );
const resetAll = jest.fn();

// Default props for the tools panel.
const defaultProps = {
	label: 'Panel header',
	resetAll,
};

// Default props for an enabled control to be rendered within panel.
const controlProps = {
	attributes: { value: true },
	hasValue: jest.fn().mockImplementation( () => {
		return !! controlProps.attributes.value;
	} ),
	label: 'Example',
	onDeselect: jest.fn().mockImplementation( () => {
		controlProps.attributes.value = undefined;
	} ),
	onSelect: jest.fn(),
};

// Default props without a value for an alternate control to be rendered within
// the panel.
const altControlProps = {
	attributes: { value: false },
	hasValue: jest.fn().mockImplementation( () => {
		return !! altControlProps.attributes.value;
	} ),
	label: 'Alt',
	onDeselect: jest.fn(),
	onSelect: jest.fn(),
};

// Default props for wrapped or grouped panel items.
const nestedControlProps = {
	attributes: { value: true },
	hasValue: jest.fn().mockImplementation( () => {
		return !! nestedControlProps.attributes.value;
	} ),
	label: 'Nested Control 1',
	onDeselect: jest.fn().mockImplementation( () => {
		nestedControlProps.attributes.value = undefined;
	} ),
	onSelect: jest.fn(),
	isShownByDefault: true,
};

// Alternative props for wrapped or grouped panel items.
const altNestedControlProps = {
	attributes: { value: false },
	hasValue: jest.fn().mockImplementation( () => {
		return !! altNestedControlProps.attributes.value;
	} ),
	label: 'Nested Control 2',
	onDeselect: jest.fn(),
	onSelect: jest.fn(),
};

// Simple custom component grouping panel items. Used to test panel item
// registration and display when not an immediate child of `ToolsPanel`.
const GroupedItems = ( {
	defaultGroupedProps = nestedControlProps,
	altGroupedProps = altNestedControlProps,
} ) => {
	return (
		<>
			<ToolsPanelItem { ...defaultGroupedProps }>
				<div>Grouped control</div>
			</ToolsPanelItem>
			<ToolsPanelItem { ...altGroupedProps }>
				<div>Alt grouped control</div>
			</ToolsPanelItem>
		</>
	);
};

// Renders a tools panel including panel items that have been grouped within
// a custom component.
const renderGroupedItemsInPanel = () => {
	return render(
		<ToolsPanel { ...defaultProps }>
			<GroupedItems />
		</ToolsPanel>
	);
};

// Custom component rendering a panel item within a wrapping element. Also used
// to test panel item registration and rendering.
const WrappedItem = ( { text, ...props } ) => {
	return (
		<div>
			<span>Wrapper</span>
			<ToolsPanelItem { ...props }>
				<div>{ text }</div>
			</ToolsPanelItem>
		</div>
	);
};

// Renders a `ToolsPanel` with single wrapped panel item via a custom component.
const renderWrappedItemInPanel = () => {
	return render(
		<ToolsPanel { ...defaultProps }>
			<WrappedItem { ...nestedControlProps } text="Wrapped 1" />
			<WrappedItem { ...altNestedControlProps } text="Wrapped 2" />
		</ToolsPanel>
	);
};

// Renders a default tools panel including children that are
// not to be represented within the panel's menu.
const renderPanel = () => {
	return render(
		<ToolsPanel { ...defaultProps }>
			{ false && <div>Hidden</div> }
			<ToolsPanelItem { ...controlProps }>
				<div>Example control</div>
			</ToolsPanelItem>
			<ToolsPanelItem { ...altControlProps }>
				<div>Alt control</div>
			</ToolsPanelItem>
			<span>Visible</span>
		</ToolsPanel>
	);
};

/**
 * Retrieves the panel's dropdown menu toggle button.
 *
 * @return {HTMLElement} The menu button.
 */
const getMenuButton = () => {
	return screen.getByRole( 'button', {
		name: /view([\w\s]+)options/i,
	} );
};

/**
 * Helper to find the menu button and simulate a user click.
 *
 * @return {HTMLElement} The menuButton.
 */
const openDropdownMenu = () => {
	const menuButton = getMenuButton();
	fireEvent.click( menuButton );
	return menuButton;
};

// Opens dropdown then selects the menu item by label before simulating a click.
const selectMenuItem = async ( label ) => {
	openDropdownMenu();
	const menuItem = await screen.findByText( label );
	fireEvent.click( menuItem );
};

describe( 'ToolsPanel', () => {
	afterEach( () => {
		controlProps.attributes.value = true;
	} );

	describe( 'basic rendering', () => {
		it( 'should render panel', () => {
			renderPanel();

			const menuButton = getMenuButton();
			const label = screen.getByText( defaultProps.label );
			const control = screen.getByText( 'Example control' );
			const nonToolsPanelItem = screen.getByText( 'Visible' );

			expect( menuButton ).toBeInTheDocument();
			expect( label ).toBeInTheDocument();
			expect( control ).toBeInTheDocument();
			expect( nonToolsPanelItem ).toBeInTheDocument();
		} );

		it( 'should render panel item flagged as default control even without value', () => {
			render(
				<ToolsPanel { ...defaultProps }>
					<ToolsPanelItem { ...controlProps }>
						<div>Example control</div>
					</ToolsPanelItem>
					<ToolsPanelItem
						{ ...altControlProps }
						isShownByDefault={ true }
					>
						<div>Alt control</div>
					</ToolsPanelItem>
				</ToolsPanel>
			);

			const altControl = screen.getByText( 'Alt control' );

			expect( altControl ).toBeInTheDocument();
		} );

		it( 'should not render panel menu when there are no panel items', () => {
			render(
				<ToolsPanel { ...defaultProps }>
					{ false && (
						<ToolsPanelItem>Should not show</ToolsPanelItem>
					) }
					{ false && (
						<ToolsPanelItem>Not shown either</ToolsPanelItem>
					) }
					<span>Visible but insignificant</span>
				</ToolsPanel>
			);

			const menu = screen.queryByLabelText( defaultProps.label );
			expect( menu ).not.toBeInTheDocument();
		} );

		it( 'should render panel menu when at least one panel item', () => {
			renderPanel();

			const menuButton = openDropdownMenu();
			expect( menuButton ).toBeInTheDocument();
		} );

		it( 'should render reset all item in menu', async () => {
			renderPanel();
			openDropdownMenu();

			const resetAllItem = await screen.findByRole( 'menuitem' );

			expect( resetAllItem ).toBeInTheDocument();
		} );

		it( 'should render panel menu items correctly', async () => {
			renderPanel();
			openDropdownMenu();

			const menuItems = await screen.findAllByRole( 'menuitemcheckbox' );

			expect( menuItems.length ).toEqual( 2 );
			expect( menuItems[ 0 ] ).toHaveAttribute( 'aria-checked', 'true' );
			expect( menuItems[ 1 ] ).toHaveAttribute( 'aria-checked', 'false' );
		} );

		it( 'should render panel label as header text', () => {
			renderPanel();
			const header = screen.getByText( defaultProps.label );

			expect( header ).toBeInTheDocument();
		} );
	} );

	describe( 'conditional rendering of panel items', () => {
		it( 'should render panel item when it has a value', () => {
			renderPanel();

			const exampleControl = screen.getByText( 'Example control' );
			const altControl = screen.queryByText( 'Alt control' );

			expect( exampleControl ).toBeInTheDocument();
			expect( altControl ).not.toBeInTheDocument();
		} );

		it( 'should render panel item when corresponding menu item is selected', async () => {
			renderPanel();
			await selectMenuItem( altControlProps.label );
			const control = await screen.findByText( 'Alt control' );

			expect( control ).toBeInTheDocument();
		} );

		it( 'should prevent optional panel item rendering when toggled off via menu item', async () => {
			renderPanel();
			await selectMenuItem( controlProps.label );
			const control = screen.queryByText( 'Example control' );

			expect( control ).not.toBeInTheDocument();
		} );

		it( 'should continue to render shown by default item after it is toggled off via menu item', async () => {
			render(
				<ToolsPanel { ...defaultProps }>
					<ToolsPanelItem
						{ ...controlProps }
						isShownByDefault={ true }
					>
						<div>Default control</div>
					</ToolsPanelItem>
				</ToolsPanel>
			);

			const control = screen.getByText( 'Default control' );

			expect( control ).toBeInTheDocument();

			await selectMenuItem( controlProps.label );
			const resetControl = screen.getByText( 'Default control' );

			expect( resetControl ).toBeInTheDocument();
		} );

		it( 'should render appropriate menu groups', async () => {
			render(
				<ToolsPanel { ...defaultProps }>
					<ToolsPanelItem
						{ ...controlProps }
						isShownByDefault={ true }
					>
						<div>Default control</div>
					</ToolsPanelItem>
					<ToolsPanelItem { ...altControlProps }>
						<div>Optional control</div>
					</ToolsPanelItem>
				</ToolsPanel>
			);
			openDropdownMenu();

			const menuGroups = screen.getAllByRole( 'group' );

			// Groups should be: default controls, optional controls & reset all.
			expect( menuGroups.length ).toEqual( 3 );
		} );

		it( 'should not render contents of items when in placeholder state', () => {
			render(
				<ToolsPanel
					{ ...defaultProps }
					shouldRenderPlaceholderItems={ true }
				>
					<ToolsPanelItem { ...altControlProps }>
						<div>Optional control</div>
					</ToolsPanelItem>
				</ToolsPanel>
			);

			const optionalItem = screen.queryByText( 'Optional control' );

			// When rendered as a placeholder a ToolsPanelItem will just omit
			// all the item's children. So the container element will still be
			// there holding its position but the inner text etc should not be
			// there.
			expect( optionalItem ).not.toBeInTheDocument();
		} );
	} );

	describe( 'callbacks on menu item selection', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should call onDeselect callback when menu item is toggled off', async () => {
			renderPanel();
			await selectMenuItem( controlProps.label );

			expect( controlProps.onSelect ).not.toHaveBeenCalled();
			expect( controlProps.onDeselect ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call onSelect callback when menu item is toggled on', async () => {
			renderPanel();
			await selectMenuItem( altControlProps.label );

			expect( altControlProps.onSelect ).toHaveBeenCalledTimes( 1 );
			expect( altControlProps.onDeselect ).not.toHaveBeenCalled();
		} );

		it( 'should call resetAll callback when its menu item is selected', async () => {
			renderPanel();
			await selectMenuItem( 'Reset all' );

			expect( resetAll ).toHaveBeenCalledTimes( 1 );
			expect( controlProps.onSelect ).not.toHaveBeenCalled();
			expect( controlProps.onDeselect ).not.toHaveBeenCalled();
			expect( altControlProps.onSelect ).not.toHaveBeenCalled();
			expect( altControlProps.onDeselect ).not.toHaveBeenCalled();
		} );

		// This confirms the internal `isResetting` state when resetting all
		// controls does not prevent subsequent individual reset requests.
		// i.e. onDeselect callbacks are called correctly after a resetAll.
		it( 'should call onDeselect after previous reset all', async () => {
			renderPanel();

			await selectMenuItem( 'Reset all' ); // Initial control is displayed by default.
			await selectMenuItem( controlProps.label ); // Re-display control.

			expect( controlProps.onDeselect ).not.toHaveBeenCalled();

			await selectMenuItem( controlProps.label ); // Reset control.

			expect( controlProps.onDeselect ).toHaveBeenCalled();
		} );
	} );

	describe( 'grouped panel items within custom components', () => {
		it( 'should render grouped items correctly', () => {
			renderGroupedItemsInPanel();

			const defaultItem = screen.getByText( 'Grouped control' );
			const altItem = screen.queryByText( 'Alt grouped control' );

			expect( defaultItem ).toBeInTheDocument();
			expect( altItem ).not.toBeInTheDocument();
		} );

		it( 'should render grouped items within the menu', async () => {
			renderGroupedItemsInPanel();
			openDropdownMenu();

			const defaultItem = screen.getByText( 'Nested Control 1' );
			const defaultMenuItem = screen.getByRole( 'menuitemcheckbox', {
				name: 'Reset Nested Control 1',
				checked: true,
			} );

			const altItem = screen.getByText( 'Nested Control 2' );
			const altMenuItem = screen.getByRole( 'menuitemcheckbox', {
				name: 'Show Nested Control 2',
				checked: false,
			} );

			expect( defaultItem ).toBeInTheDocument();
			expect( defaultMenuItem ).toBeInTheDocument();

			expect( altItem ).toBeInTheDocument();
			expect( altMenuItem ).toBeInTheDocument();
		} );
	} );

	describe( 'wrapped panel items within custom components', () => {
		it( 'should render wrapped items correctly', () => {
			renderWrappedItemInPanel();

			const wrappers = screen.getAllByText( 'Wrapper' );
			const defaultItem = screen.getByText( 'Wrapped 1' );
			const altItem = screen.queryByText( 'Wrapped 2' );

			// Both wrappers should be rendered but only the panel item
			// displayed by default should be within the document.
			expect( wrappers.length ).toEqual( 2 );
			expect( defaultItem ).toBeInTheDocument();
			expect( altItem ).not.toBeInTheDocument();
		} );

		it( 'should render wrapped items within the menu', () => {
			renderWrappedItemInPanel();
			openDropdownMenu();

			const defaultItem = screen.getByText( 'Nested Control 1' );
			const defaultMenuItem = screen.getByRole( 'menuitemcheckbox', {
				name: 'Reset Nested Control 1',
				checked: true,
			} );

			const altItem = screen.getByText( 'Nested Control 2' );
			const altMenuItem = screen.getByRole( 'menuitemcheckbox', {
				name: 'Show Nested Control 2',
				checked: false,
			} );

			expect( defaultItem ).toBeInTheDocument();
			expect( defaultMenuItem ).toBeInTheDocument();

			expect( altItem ).toBeInTheDocument();
			expect( altMenuItem ).toBeInTheDocument();
		} );
	} );

	describe( 'rendering via SlotFills', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should maintain visual order of controls when toggled on and off', async () => {
			// Multiple fills are added to better simulate panel items being
			// injected from different locations.
			render(
				<SlotFillProvider>
					<ToolsPanelItems>
						<ToolsPanelItem { ...altControlProps }>
							<div>Item 1</div>
						</ToolsPanelItem>
					</ToolsPanelItems>
					<ToolsPanelItems>
						<ToolsPanelItem { ...controlProps }>
							<div>Item 2</div>
						</ToolsPanelItem>
					</ToolsPanelItems>
					<ToolsPanel { ...defaultProps }>
						<Slot />
					</ToolsPanel>
				</SlotFillProvider>
			);

			// Only the second item should be shown initially as it has a value.
			const firstItem = screen.queryByText( 'Item 1' );
			const secondItem = screen.getByText( 'Item 2' );

			expect( firstItem ).not.toBeInTheDocument();
			expect( secondItem ).toBeInTheDocument();

			// Toggle on the first item.
			await selectMenuItem( altControlProps.label );

			// The order of items should be as per their original source order.
			let items = screen.getAllByText( /Item [1-2]/ );

			expect( items ).toHaveLength( 2 );
			expect( items[ 0 ] ).toHaveTextContent( 'Item 1' );
			expect( items[ 1 ] ).toHaveTextContent( 'Item 2' );

			// Then toggle off both items.
			await selectMenuItem( controlProps.label );
			await selectMenuItem( altControlProps.label );

			// Toggle on controls again and ensure order remains.
			await selectMenuItem( controlProps.label );
			await selectMenuItem( altControlProps.label );

			items = screen.getAllByText( /Item [1-2]/ );

			expect( items ).toHaveLength( 2 );
			expect( items[ 0 ] ).toHaveTextContent( 'Item 1' );
			expect( items[ 1 ] ).toHaveTextContent( 'Item 2' );
		} );

		it( 'should not trigger callback when fill has not updated yet when panel has', () => {
			// Fill provided controls can update independently to the panel.
			// A `panelId` prop was added to both panels and items
			// so it could prevent erroneous registrations and calls to
			// `onDeselect` etc.
			//
			// See: https://github.com/WordPress/gutenberg/pull/35375
			//
			// This test simulates this issue by rendering an item within a
			// contrived `ToolsPanelContext` to reflect the changes the panel
			// item needs to protect against.

			const noop = () => undefined;
			const context = {
				panelId: '1234',
				menuItems: {
					default: {},
					optional: { [ altControlProps.label ]: true },
				},
				hasMenuItems: false,
				isResetting: false,
				shouldRenderPlaceholderItems: false,
				registerPanelItem: noop,
				deregisterPanelItem: noop,
				flagItemCustomization: noop,
				areAllOptionalControlsHidden: true,
			};

			// This initial render gives the tools panel item a chance to
			// set its internal state to reflect it was previously selected.
			// This later forms part of the condition used to determine if an
			// item is being deselected and thus call the onDeselect callback.
			const { rerender } = render(
				<ToolsPanelContext.Provider value={ context }>
					<ToolsPanelItem { ...altControlProps } panelId="1234">
						<div>Item</div>
					</ToolsPanelItem>
				</ToolsPanelContext.Provider>
			);

			// Simulate a change in panel separate to the rendering of fills.
			// e.g. a switch of block selection.
			context.panelId = '4321';
			context.menuItems.optional[ altControlProps.label ] = false;

			// Rerender the panel item and ensure that it skips any check
			// for deselection given it still belongs to a different panelId.
			rerender(
				<ToolsPanelContext.Provider value={ context }>
					<ToolsPanelItem { ...altControlProps } panelId="1234">
						<div>Item</div>
					</ToolsPanelItem>
				</ToolsPanelContext.Provider>
			);

			expect( altControlProps.onDeselect ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'panel header icon toggle', () => {
		const optionalControls = {
			attributes: { value: false },
			hasValue: jest.fn().mockImplementation( () => {
				return !! optionalControls.attributes.value;
			} ),
			label: 'Optional',
			onDeselect: jest.fn(),
			onSelect: jest.fn(),
			isShownByDefault: false,
		};

		it( 'should render appropriate icons for the dropdown menu', async () => {
			render(
				<ToolsPanel { ...defaultProps }>
					<ToolsPanelItem { ...optionalControls }>
						<div>Optional control</div>
					</ToolsPanelItem>
				</ToolsPanel>
			);

			// There are unactivated, optional menu items in the Tools Panel dropdown.
			const optionsHiddenIcon = screen.getByRole( 'button', {
				name: 'View and add options',
			} );

			expect( optionsHiddenIcon ).toBeInTheDocument();

			await selectMenuItem( optionalControls.label );

			// There are now NO unactivated, optional menu items in the Tools Panel dropdown.
			expect(
				screen.queryByRole( 'button', { name: 'View and add options' } )
			).not.toBeInTheDocument();

			const optionsDisplayedIcon = screen.getByRole( 'button', {
				name: 'View options',
			} );

			expect( optionsDisplayedIcon ).toBeInTheDocument();
		} );
	} );
} );
