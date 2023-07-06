/**
 * WordPress dependencies
 */
import { store as wpStore } from '@wordpress/interactivity';

const focusableSelectors = [
	'a[href]',
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	'select:not([disabled]):not([aria-hidden])',
	'textarea:not([disabled]):not([aria-hidden])',
	'button:not([disabled]):not([aria-hidden])',
	'[contenteditable]',
	'[tabindex]:not([tabindex^="-"])',
];

const openMenu = ( store, menuOpenedOn ) => {
	const { context, ref, selectors } = store;
	selectors.core.navigation.menuOpenedBy( store )[ menuOpenedOn ] = true;
	context.core.navigation.previousFocus = ref;
	if ( context.core.navigation.type === 'overlay' ) {
		// Add a `has-modal-open` class to the <html> root.
		document.documentElement.classList.add( 'has-modal-open' );
	}
};

const closeMenu = ( store, menuClosedOn ) => {
	const { context, selectors } = store;
	selectors.core.navigation.menuOpenedBy( store )[ menuClosedOn ] = false;
	// Check if the menu is still open or not.
	if ( ! selectors.core.navigation.isMenuOpen( store ) ) {
		if (
			context.core.navigation.modal?.contains(
				window.document.activeElement
			)
		) {
			context.core.navigation.previousFocus.focus();
		}
		context.core.navigation.modal = null;
		context.core.navigation.previousFocus = null;
		if ( context.core.navigation.type === 'overlay' ) {
			document.documentElement.classList.remove( 'has-modal-open' );
		}
	}
};

wpStore( {
	effects: {
		core: {
			navigation: {
				initMenu: ( store ) => {
					const { context, selectors, ref } = store;
					if ( selectors.core.navigation.isMenuOpen( store ) ) {
						const focusableElements =
							ref.querySelectorAll( focusableSelectors );
						context.core.navigation.modal = ref;
						context.core.navigation.firstFocusableElement =
							focusableElements[ 0 ];
						context.core.navigation.lastFocusableElement =
							focusableElements[ focusableElements.length - 1 ];
					}
				},
				focusFirstElement: ( store ) => {
					const { selectors, ref } = store;
					if ( selectors.core.navigation.isMenuOpen( store ) ) {
						ref.querySelector(
							'.wp-block-navigation-item > *:first-child'
						).focus();
					}
				},
			},
		},
	},
	selectors: {
		core: {
			navigation: {
				roleAttribute: ( store ) => {
					const { context, selectors } = store;
					return context.core.navigation.type === 'overlay' &&
						selectors.core.navigation.isMenuOpen( store )
						? 'dialog'
						: '';
				},
				isMenuOpen: ( { context } ) =>
					// The menu is opened if either `click`, `hover` or `focus` is true.
					Object.values(
						context.core.navigation[
							context.core.navigation.type === 'overlay'
								? 'overlayOpenedBy'
								: 'submenuOpenedBy'
						]
					).filter( Boolean ).length > 0,
				menuOpenedBy: ( { context } ) =>
					context.core.navigation[
						context.core.navigation.type === 'overlay'
							? 'overlayOpenedBy'
							: 'submenuOpenedBy'
					],
			},
		},
	},
	actions: {
		core: {
			navigation: {
				openMenuOnHover( store ) {
					const { navigation } = store.context.core;
					if (
						navigation.type === 'submenu' &&
						// Only open on hover if the overlay is closed.
						Object.values(
							navigation.overlayOpenedBy || {}
						).filter( Boolean ).length === 0
					)
						openMenu( store, 'hover' );
				},
				closeMenuOnHover( store ) {
					closeMenu( store, 'hover' );
				},
				openMenuOnClick( store ) {
					openMenu( store, 'click' );
				},
				closeMenuOnClick( store ) {
					closeMenu( store, 'click' );
					closeMenu( store, 'focus' );
				},
				openMenuOnFocus( store ) {
					openMenu( store, 'focus' );
				},
				toggleMenuOnClick: ( store ) => {
					const { selectors } = store;
					const menuOpenedBy =
						selectors.core.navigation.menuOpenedBy( store );
					if ( menuOpenedBy.click || menuOpenedBy.focus ) {
						closeMenu( store, 'click' );
						closeMenu( store, 'focus' );
					} else {
						openMenu( store, 'click' );
					}
				},
				handleMenuKeydown: ( store ) => {
					const { context, selectors, event } = store;
					if (
						selectors.core.navigation.menuOpenedBy( store ).click
					) {
						// If Escape close the menu.
						if ( event?.key === 'Escape' ) {
							closeMenu( store, 'click' );
							closeMenu( store, 'focus' );
							return;
						}

						// Trap focus if it is an overlay (main menu).
						if (
							context.core.navigation.type === 'overlay' &&
							event.key === 'Tab'
						) {
							// If shift + tab it change the direction.
							if (
								event.shiftKey &&
								window.document.activeElement ===
									context.core.navigation
										.firstFocusableElement
							) {
								event.preventDefault();
								context.core.navigation.lastFocusableElement.focus();
							} else if (
								! event.shiftKey &&
								window.document.activeElement ===
									context.core.navigation.lastFocusableElement
							) {
								event.preventDefault();
								context.core.navigation.firstFocusableElement.focus();
							}
						}
					}
				},
				handleMenuFocusout: ( store ) => {
					const { context, event } = store;
					// If focus is outside modal, and in the document, close menu
					// event.target === The element losing focus
					// event.relatedTarget === The element receiving focus (if any)
					// When focusout is outsite the document,
					// `window.document.activeElement` doesn't change.
					if (
						! context.core.navigation.modal?.contains(
							event.relatedTarget
						) &&
						event.target !== window.document.activeElement
					) {
						closeMenu( store, 'click' );
						closeMenu( store, 'focus' );
					}
				},
			},
		},
	},
} );
