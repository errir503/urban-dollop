/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * WordPress dependencies
 */
import { wordpress, category, media } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Tabs from '..';
import type { TabsProps } from '../types';
import type { IconType } from '../../icon';

type Tab = {
	id: string;
	title: string;
	content: React.ReactNode;
	tab: {
		className?: string;
		icon?: IconType;
		disabled?: boolean;
	};
};

const TABS: Tab[] = [
	{
		id: 'alpha',
		title: 'Alpha',
		content: 'Selected tab: Alpha',
		tab: { className: 'alpha-class', icon: wordpress },
	},
	{
		id: 'beta',
		title: 'Beta',
		content: 'Selected tab: Beta',
		tab: { className: 'beta-class', icon: category },
	},
	{
		id: 'gamma',
		title: 'Gamma',
		content: 'Selected tab: Gamma',
		tab: { className: 'gamma-class', icon: media },
	},
];

const TABS_WITH_DELTA: Tab[] = [
	...TABS,
	{
		id: 'delta',
		title: 'Delta',
		content: 'Selected tab: Delta',
		tab: { className: 'delta-class', icon: media },
	},
];

const UncontrolledTabs = ( {
	tabs,
	showTabIcons = false,
	...props
}: Omit< TabsProps, 'children' > & {
	tabs: Tab[];
	showTabIcons?: boolean;
} ) => {
	return (
		<Tabs { ...props }>
			<Tabs.TabList>
				{ tabs.map( ( tabObj ) => (
					<Tabs.Tab
						key={ tabObj.id }
						id={ tabObj.id }
						className={ tabObj.tab.className }
						disabled={ tabObj.tab.disabled }
						icon={ showTabIcons ? tabObj.tab.icon : undefined }
					>
						{ showTabIcons ? null : tabObj.title }
					</Tabs.Tab>
				) ) }
			</Tabs.TabList>
			{ tabs.map( ( tabObj ) => (
				<Tabs.TabPanel key={ tabObj.id } id={ tabObj.id }>
					{ tabObj.content }
				</Tabs.TabPanel>
			) ) }
		</Tabs>
	);
};

const ControlledTabs = ( {
	tabs,
	showTabIcons = false,
	...props
}: Omit< TabsProps, 'children' > & {
	tabs: Tab[];
	showTabIcons?: boolean;
} ) => {
	const [ selectedTabId, setSelectedTabId ] = useState<
		string | undefined | null
	>( props.selectedTabId );

	return (
		<Tabs
			{ ...props }
			selectedTabId={ selectedTabId }
			onSelect={ ( selectedId ) => {
				setSelectedTabId( selectedId );
				props.onSelect?.( selectedId );
			} }
		>
			<Tabs.TabList>
				{ tabs.map( ( tabObj ) => (
					<Tabs.Tab
						key={ tabObj.id }
						id={ tabObj.id }
						className={ tabObj.tab.className }
						disabled={ tabObj.tab.disabled }
						icon={ showTabIcons ? tabObj.tab.icon : undefined }
					>
						{ showTabIcons ? null : tabObj.title }
					</Tabs.Tab>
				) ) }
			</Tabs.TabList>
			{ tabs.map( ( tabObj ) => (
				<Tabs.TabPanel key={ tabObj.id } id={ tabObj.id }>
					{ tabObj.content }
				</Tabs.TabPanel>
			) ) }
		</Tabs>
	);
};

const getSelectedTab = async () =>
	await screen.findByRole( 'tab', { selected: true } );

let originalGetClientRects: () => DOMRectList;

describe( 'Tabs', () => {
	beforeAll( () => {
		originalGetClientRects = window.HTMLElement.prototype.getClientRects;
		// Mocking `getClientRects()` is necessary to pass a check performed by
		// the `focus.tabbable.find()` and by the `focus.focusable.find()` functions
		// from the `@wordpress/dom` package.
		// @ts-expect-error We're not trying to comply to the DOM spec, only mocking
		window.HTMLElement.prototype.getClientRects = function () {
			return [ 'trick-jsdom-into-having-size-for-element-rect' ];
		};
	} );

	afterAll( () => {
		window.HTMLElement.prototype.getClientRects = originalGetClientRects;
	} );

	describe( 'Accessibility and semantics', () => {
		it( 'should use the correct aria attributes', async () => {
			render( <UncontrolledTabs tabs={ TABS } /> );

			const tabList = screen.getByRole( 'tablist' );
			const allTabs = screen.getAllByRole( 'tab' );
			const selectedTabPanel = await screen.findByRole( 'tabpanel' );

			expect( tabList ).toBeVisible();
			expect( tabList ).toHaveAttribute(
				'aria-orientation',
				'horizontal'
			);

			expect( allTabs ).toHaveLength( TABS.length );

			// The selected `tab` aria-controls the active `tabpanel`,
			// which is `aria-labelledby` the selected `tab`.
			expect( selectedTabPanel ).toBeVisible();
			expect( allTabs[ 0 ] ).toHaveAttribute(
				'aria-controls',
				selectedTabPanel.getAttribute( 'id' )
			);
			expect( selectedTabPanel ).toHaveAttribute(
				'aria-labelledby',
				allTabs[ 0 ].getAttribute( 'id' )
			);
		} );
	} );

	describe( 'Tab Attributes', () => {
		it( "should apply the tab's `className` to the tab button", async () => {
			render( <UncontrolledTabs tabs={ TABS } /> );

			expect(
				await screen.findByRole( 'tab', { name: 'Alpha' } )
			).toHaveClass( 'alpha-class' );
			expect( screen.getByRole( 'tab', { name: 'Beta' } ) ).toHaveClass(
				'beta-class'
			);
			expect( screen.getByRole( 'tab', { name: 'Gamma' } ) ).toHaveClass(
				'gamma-class'
			);
		} );
	} );

	describe( 'Tab Activation', () => {
		it( 'defaults to automatic tab activation (pointer clicks)', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			render(
				<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
			);

			// Alpha is the initially selected tab
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect(
				await screen.findByRole( 'tabpanel', { name: 'Alpha' } )
			).toBeInTheDocument();
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Click on Beta, make sure beta is the selected tab
			await user.click( screen.getByRole( 'tab', { name: 'Beta' } ) );

			expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			expect(
				screen.getByRole( 'tabpanel', { name: 'Beta' } )
			).toBeInTheDocument();
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

			// Click on Alpha, make sure beta is the selected tab
			await user.click( screen.getByRole( 'tab', { name: 'Alpha' } ) );

			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect(
				screen.getByRole( 'tabpanel', { name: 'Alpha' } )
			).toBeInTheDocument();
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
		} );

		it( 'defaults to automatic tab activation (arrow keys)', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			render(
				<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
			);

			// onSelect gets called on the initial render. It should be called
			// with the first enabled tab, which is alpha.
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Tab to focus the tablist. Make sure alpha is focused.
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).not.toHaveFocus();
			await user.keyboard( '[Tab]' );
			expect( await getSelectedTab() ).toHaveFocus();

			// Navigate forward with arrow keys and make sure the Beta tab is
			// selected automatically.
			await user.keyboard( '[ArrowRight]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

			// Navigate backwards with arrow keys. Make sure alpha is
			// selected automatically.
			await user.keyboard( '[ArrowLeft]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
		} );

		it( 'wraps around the last/first tab when using arrow keys', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			render(
				<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
			);

			// onSelect gets called on the initial render.
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

			// Tab to focus the tablist. Make sure Alpha is focused.
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).not.toHaveFocus();
			await user.keyboard( '[Tab]' );
			expect( await getSelectedTab() ).toHaveFocus();

			// Navigate backwards with arrow keys and make sure that the Gamma tab
			// (the last tab) is selected automatically.
			await user.keyboard( '[ArrowLeft]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

			// Navigate forward with arrow keys. Make sure alpha (the first tab) is
			// selected automatically.
			await user.keyboard( '[ArrowRight]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
		} );

		it( 'should not move tab selection when pressing the up/down arrow keys, unless the orientation is changed to `vertical`', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			const { rerender } = render(
				<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
			);

			// onSelect gets called on the initial render. It should be called
			// with the first enabled tab, which is alpha.
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Tab to focus the tablist. Make sure alpha is focused.
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).not.toHaveFocus();
			await user.keyboard( '[Tab]' );
			expect( await getSelectedTab() ).toHaveFocus();

			// Press the arrow up key, nothing happens.
			await user.keyboard( '[ArrowUp]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Press the arrow down key, nothing happens
			await user.keyboard( '[ArrowDown]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Change orientation to `vertical`. When the orientation is vertical,
			// left/right arrow keys are replaced by up/down arrow keys.
			rerender(
				<UncontrolledTabs
					tabs={ TABS }
					onSelect={ mockOnSelect }
					orientation="vertical"
				/>
			);

			expect( screen.getByRole( 'tablist' ) ).toHaveAttribute(
				'aria-orientation',
				'vertical'
			);

			// Make sure alpha is still focused.
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();

			// Navigate forward with arrow keys and make sure the Beta tab is
			// selected automatically.
			await user.keyboard( '[ArrowDown]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

			// Navigate backwards with arrow keys. Make sure alpha is
			// selected automatically.
			await user.keyboard( '[ArrowUp]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Navigate backwards with arrow keys. Make sure alpha is
			// selected automatically.
			await user.keyboard( '[ArrowUp]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 4 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

			// Navigate backwards with arrow keys. Make sure alpha is
			// selected automatically.
			await user.keyboard( '[ArrowDown]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 5 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
		} );

		it( 'should move focus on a tab even if disabled with arrow key, but not with pointer clicks', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			const TABS_WITH_DELTA_DISABLED = TABS_WITH_DELTA.map( ( tabObj ) =>
				tabObj.id === 'delta'
					? {
							...tabObj,
							tab: {
								...tabObj.tab,
								disabled: true,
							},
					  }
					: tabObj
			);

			render(
				<UncontrolledTabs
					tabs={ TABS_WITH_DELTA_DISABLED }
					onSelect={ mockOnSelect }
				/>
			);

			// onSelect gets called on the initial render. It should be called
			// with the first enabled tab, which is alpha.
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Tab to focus the tablist. Make sure Alpha is focused.
			expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			expect( await getSelectedTab() ).not.toHaveFocus();
			await user.keyboard( '[Tab]' );
			expect( await getSelectedTab() ).toHaveFocus();
			// Confirm onSelect has not been re-called
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

			// Press the right arrow key three times. Since the delta tab is disabled:
			// - it won't be selected. The gamma tab will be selected instead, since
			//   it was the tab that was last selected before delta. Therefore, the
			//   `mockOnSelect` function gets called only twice (and not three times)
			// - it will receive focus, when using arrow keys
			await user.keyboard( '[ArrowRight][ArrowRight][ArrowRight]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			expect(
				screen.getByRole( 'tab', { name: 'Delta' } )
			).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

			// Navigate backwards with arrow keys. The gamma tab receives focus.
			// The `mockOnSelect` callback doesn't fire, since the gamma tab was
			// already selected.
			await user.keyboard( '[ArrowLeft]' );
			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );

			// Click on the disabled tab. Compared to using arrow keys to move the
			// focus, disabled tabs ignore pointer clicks — and therefore, they don't
			// receive focus, nor they cause the `mockOnSelect` function to fire.
			await user.click( screen.getByRole( 'tab', { name: 'Delta' } ) );
			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			expect( await getSelectedTab() ).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should not focus the next tab when the Tab key is pressed', async () => {
			const user = userEvent.setup();

			render( <UncontrolledTabs tabs={ TABS } /> );

			// Tab should initially focus the first tab in the tablist, which
			// is Alpha.
			await user.keyboard( '[Tab]' );
			expect(
				await screen.findByRole( 'tab', { name: 'Alpha' } )
			).toHaveFocus();

			// Because all other tabs should have `tabindex=-1`, pressing Tab
			// should NOT move the focus to the next tab, which is Beta.
			// Instead, focus should go to the currently selected tabpanel (alpha).
			await user.keyboard( '[Tab]' );
			expect(
				await screen.findByRole( 'tabpanel', {
					name: 'Alpha',
				} )
			).toHaveFocus();
		} );

		it( 'switches to manual tab activation when the `selectOnMove` prop is set to `false`', async () => {
			const user = userEvent.setup();
			const mockOnSelect = jest.fn();

			render(
				<UncontrolledTabs
					tabs={ TABS }
					onSelect={ mockOnSelect }
					selectOnMove={ false }
				/>
			);

			// onSelect gets called on the initial render. It should be called
			// with the first enabled tab, which is alpha.
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Click on Alpha and make sure it is selected.
			// onSelect shouldn't fire since the selected tab didn't change.
			await user.click( screen.getByRole( 'tab', { name: 'Alpha' } ) );
			expect(
				await screen.findByRole( 'tab', { name: 'Alpha' } )
			).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Navigate forward with arrow keys. Make sure Beta is focused, but
			// that the tab selection happens only when pressing the spacebar
			// or enter key. onSelect shouldn't fire since the selected tab
			// didn't change.
			await user.keyboard( '[ArrowRight]' );
			expect(
				await screen.findByRole( 'tab', { name: 'Beta' } )
			).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

			await user.keyboard( '[Enter]' );
			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

			// Navigate forward with arrow keys. Make sure Gamma (last tab) is
			// focused, but that tab selection happens only when pressing the
			// spacebar or enter key. onSelect shouldn't fire since the selected
			// tab didn't change.
			await user.keyboard( '[ArrowRight]' );
			expect(
				await screen.findByRole( 'tab', { name: 'Gamma' } )
			).toHaveFocus();
			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect(
				screen.getByRole( 'tab', { name: 'Gamma' } )
			).toHaveFocus();

			await user.keyboard( '[Space]' );
			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );
		} );
	} );
	describe( 'Uncontrolled mode', () => {
		describe( 'Without `initialTabId` prop', () => {
			it( 'should render first tab', async () => {
				render( <UncontrolledTabs tabs={ TABS } /> );

				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect(
					await screen.findByRole( 'tabpanel', { name: 'Alpha' } )
				).toBeInTheDocument();
			} );
			it( 'should fall back to first enabled tab if the active tab is removed', async () => {
				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS } />
				);

				// Remove first item from `TABS` array
				rerender( <UncontrolledTabs tabs={ TABS.slice( 1 ) } /> );
				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			} );
			it( 'should not load any tab if the active tab is removed and there are no enabled tabs', async () => {
				const TABS_WITH_BETA_GAMMA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id !== 'alpha'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS_WITH_BETA_GAMMA_DISABLED } />
				);
				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );

				// Remove alpha
				rerender(
					<UncontrolledTabs
						tabs={ TABS_WITH_BETA_GAMMA_DISABLED.slice( 1 ) }
					/>
				);

				// No tab should be selected i.e. it doesn't fall back to first tab.
				await waitFor( () =>
					expect(
						screen.queryByRole( 'tab', { selected: true } )
					).not.toBeInTheDocument()
				);

				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();
			} );
		} );

		describe( 'With `initialTabId`', () => {
			it( 'should render the tab set by `initialTabId` prop', async () => {
				render(
					<UncontrolledTabs tabs={ TABS } initialTabId="beta" />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			} );

			it( 'should not select a tab when `initialTabId` does not match any known tab', () => {
				render(
					<UncontrolledTabs
						tabs={ TABS }
						initialTabId="does-not-exist"
					/>
				);

				// No tab should be selected i.e. it doesn't fall back to first tab.
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument();

				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();
			} );
			it( 'should not change tabs when initialTabId is changed', async () => {
				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS } initialTabId="beta" />
				);

				rerender(
					<UncontrolledTabs tabs={ TABS } initialTabId="alpha" />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			} );

			it( 'should fall back to the tab associated to `initialTabId` if the currently active tab is removed', async () => {
				const user = userEvent.setup();
				const mockOnSelect = jest.fn();

				const { rerender } = render(
					<UncontrolledTabs
						tabs={ TABS }
						initialTabId="gamma"
						onSelect={ mockOnSelect }
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );

				await user.click(
					screen.getByRole( 'tab', { name: 'Alpha' } )
				);
				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				rerender(
					<UncontrolledTabs
						tabs={ TABS.slice( 1 ) }
						initialTabId="gamma"
						onSelect={ mockOnSelect }
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			} );

			it( 'should fall back to the tab associated to `initialTabId` if the currently active tab becomes disabled', async () => {
				const user = userEvent.setup();
				const mockOnSelect = jest.fn();

				const { rerender } = render(
					<UncontrolledTabs
						tabs={ TABS }
						initialTabId="gamma"
						onSelect={ mockOnSelect }
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );

				await user.click(
					screen.getByRole( 'tab', { name: 'Alpha' } )
				);
				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				const TABS_WITH_ALPHA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id === 'alpha'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				rerender(
					<UncontrolledTabs
						tabs={ TABS_WITH_ALPHA_DISABLED }
						initialTabId="gamma"
						onSelect={ mockOnSelect }
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			} );

			it( 'should have no active tabs when the tab associated to `initialTabId` is removed while being the active tab', async () => {
				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS } initialTabId="gamma" />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );

				// Remove gamma
				rerender(
					<UncontrolledTabs
						tabs={ TABS.slice( 0, 2 ) }
						initialTabId="gamma"
					/>
				);

				expect( screen.getAllByRole( 'tab' ) ).toHaveLength( 2 );
				// No tab should be selected i.e. it doesn't fall back to first tab.
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument();
				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();
			} );

			it( 'waits for the tab with the `initialTabId` to be present in the `tabs` array before selecting it', async () => {
				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS } initialTabId="delta" />
				);

				// There should be no selected tab yet.
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument();

				rerender(
					<UncontrolledTabs
						tabs={ TABS_WITH_DELTA }
						initialTabId="delta"
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Delta' );
			} );
		} );

		describe( 'Disabled tab', () => {
			it( 'should disable the tab when `disabled` is `true`', async () => {
				const user = userEvent.setup();
				const mockOnSelect = jest.fn();

				const TABS_WITH_DELTA_DISABLED = TABS_WITH_DELTA.map(
					( tabObj ) =>
						tabObj.id === 'delta'
							? {
									...tabObj,
									tab: {
										...tabObj.tab,
										disabled: true,
									},
							  }
							: tabObj
				);

				render(
					<UncontrolledTabs
						tabs={ TABS_WITH_DELTA_DISABLED }
						onSelect={ mockOnSelect }
					/>
				);

				expect(
					screen.getByRole( 'tab', { name: 'Delta' } )
				).toHaveAttribute( 'aria-disabled', 'true' );

				// onSelect gets called on the initial render.
				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// onSelect should not be called since the disabled tab is
				// highlighted, but not selected.
				await user.keyboard( '[Tab]' );
				await user.keyboard( '[ArrowLeft]' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

				// Delta (which is disabled) has focus
				expect(
					screen.getByRole( 'tab', { name: 'Delta' } )
				).toHaveFocus();

				// Alpha retains the selection, even if it's not focused.
				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
			} );

			it( 'should select first enabled tab when the initial tab is disabled', async () => {
				const TABS_WITH_ALPHA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id === 'alpha'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS_WITH_ALPHA_DISABLED } />
				);

				// As alpha (first tab) is disabled,
				// the first enabled tab should be beta.
				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );

				// Re-enable all tabs
				rerender( <UncontrolledTabs tabs={ TABS } /> );

				// Even if the initial tab becomes enabled again, the selected
				// tab doesn't change.
				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			} );

			it( 'should select first enabled tab when the tab associated to `initialTabId` is disabled', async () => {
				const TABS_ONLY_GAMMA_ENABLED = TABS.map( ( tabObj ) =>
					tabObj.id !== 'gamma'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);
				const { rerender } = render(
					<UncontrolledTabs
						tabs={ TABS_ONLY_GAMMA_ENABLED }
						initialTabId="beta"
					/>
				);

				// As alpha (first tab), and beta (the initial tab), are both
				// disabled the first enabled tab should be gamma.
				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );

				// Re-enable all tabs
				rerender(
					<UncontrolledTabs tabs={ TABS } initialTabId="beta" />
				);

				// Even if the initial tab becomes enabled again, the selected tab doesn't
				// change.
				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
			} );

			it( 'should select the first enabled tab when the selected tab becomes disabled', async () => {
				const mockOnSelect = jest.fn();
				const { rerender } = render(
					<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				const TABS_WITH_ALPHA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id === 'alpha'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				// Disable alpha
				rerender(
					<UncontrolledTabs
						tabs={ TABS_WITH_ALPHA_DISABLED }
						onSelect={ mockOnSelect }
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

				// Re-enable all tabs
				rerender(
					<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );
			} );

			it( 'should select the first enabled tab when the tab associated to `initialTabId` becomes disabled while being the active tab', async () => {
				const mockOnSelect = jest.fn();

				const { rerender } = render(
					<UncontrolledTabs
						tabs={ TABS }
						onSelect={ mockOnSelect }
						initialTabId="gamma"
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );

				const TABS_WITH_GAMMA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id === 'gamma'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				// Disable gamma
				rerender(
					<UncontrolledTabs
						tabs={ TABS_WITH_GAMMA_DISABLED }
						onSelect={ mockOnSelect }
						initialTabId="gamma"
					/>
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Re-enable all tabs
				rerender(
					<UncontrolledTabs
						tabs={ TABS }
						onSelect={ mockOnSelect }
						initialTabId="gamma"
					/>
				);

				// Confirm that alpha is still selected, and that onSelect has
				// not been called again.
				expect( await getSelectedTab() ).toHaveTextContent( 'Alpha' );
				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'Controlled mode', () => {
		it( 'should render the tab specified by the `selectedTabId` prop', async () => {
			render( <ControlledTabs tabs={ TABS } selectedTabId="beta" /> );

			expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );
			expect(
				await screen.findByRole( 'tabpanel', { name: 'Beta' } )
			).toBeInTheDocument();
		} );
		it( 'should render the specified `selectedTabId`, and ignore the `initialTabId` prop', async () => {
			render(
				<ControlledTabs
					tabs={ TABS }
					selectedTabId="gamma"
					initialTabId="beta"
				/>
			);

			expect( await getSelectedTab() ).toHaveTextContent( 'Gamma' );
		} );
		it( 'should not render any tab if `selectedTabId` does not match any known tab', async () => {
			render(
				<ControlledTabs
					tabs={ TABS_WITH_DELTA }
					selectedTabId="does-not-exist"
				/>
			);

			// No tab should be selected i.e. it doesn't fall back to first tab.
			// `waitFor` is needed here to prevent testing library from
			// throwing a 'not wrapped in `act()`' error.
			await waitFor( () =>
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument()
			);
			// No tabpanel should be rendered either
			expect( screen.queryByRole( 'tabpanel' ) ).not.toBeInTheDocument();
		} );
		it( 'should not render any tab if the active tab is removed', async () => {
			const { rerender } = render(
				<ControlledTabs tabs={ TABS } selectedTabId="beta" />
			);

			// Remove beta
			rerender(
				<ControlledTabs
					tabs={ TABS.filter( ( tab ) => tab.id !== 'beta' ) }
					selectedTabId="beta"
				/>
			);

			expect( screen.getAllByRole( 'tab' ) ).toHaveLength( 2 );

			// No tab should be selected i.e. it doesn't fall back to first tab.
			// `waitFor` is needed here to prevent testing library from
			// throwing a 'not wrapped in `act()`' error.
			await waitFor( () =>
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument()
			);
			// No tabpanel should be rendered either
			expect( screen.queryByRole( 'tabpanel' ) ).not.toBeInTheDocument();

			// Restore beta
			rerender( <ControlledTabs tabs={ TABS } selectedTabId="beta" /> );

			// No tab should be selected i.e. it doesn't reselect the previously
			// removed tab.
			expect(
				screen.queryByRole( 'tab', { selected: true } )
			).not.toBeInTheDocument();
			// No tabpanel should be rendered either
			expect( screen.queryByRole( 'tabpanel' ) ).not.toBeInTheDocument();
		} );

		describe( 'Disabled tab', () => {
			it( 'should not render any tab if `selectedTabId` refers to a disabled tab', async () => {
				const TABS_WITH_DELTA_WITH_BETA_DISABLED = TABS_WITH_DELTA.map(
					( tabObj ) =>
						tabObj.id === 'beta'
							? {
									...tabObj,
									tab: {
										...tabObj.tab,
										disabled: true,
									},
							  }
							: tabObj
				);

				render(
					<ControlledTabs
						tabs={ TABS_WITH_DELTA_WITH_BETA_DISABLED }
						selectedTabId="beta"
					/>
				);

				// No tab should be selected i.e. it doesn't fall back to first tab.
				await waitFor( () => {
					expect(
						screen.queryByRole( 'tab', { selected: true } )
					).not.toBeInTheDocument();
				} );
				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();
			} );
			it( 'should not render any tab when the selected tab becomes disabled', async () => {
				const { rerender } = render(
					<ControlledTabs tabs={ TABS } selectedTabId="beta" />
				);

				expect( await getSelectedTab() ).toHaveTextContent( 'Beta' );

				const TABS_WITH_BETA_DISABLED = TABS.map( ( tabObj ) =>
					tabObj.id === 'beta'
						? {
								...tabObj,
								tab: {
									...tabObj.tab,
									disabled: true,
								},
						  }
						: tabObj
				);

				rerender(
					<ControlledTabs
						tabs={ TABS_WITH_BETA_DISABLED }
						selectedTabId="beta"
					/>
				);
				// No tab should be selected i.e. it doesn't fall back to first tab.
				// `waitFor` is needed here to prevent testing library from
				// throwing a 'not wrapped in `act()`' error.
				await waitFor( () => {
					expect(
						screen.queryByRole( 'tab', { selected: true } )
					).not.toBeInTheDocument();
				} );
				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();

				// re-enable all tabs
				rerender(
					<ControlledTabs tabs={ TABS } selectedTabId="beta" />
				);

				// If the previously selected tab is reenabled, it should not
				// be reselected.
				expect(
					screen.queryByRole( 'tab', { selected: true } )
				).not.toBeInTheDocument();
				// No tabpanel should be rendered either
				expect(
					screen.queryByRole( 'tabpanel' )
				).not.toBeInTheDocument();
			} );
		} );
	} );
} );
