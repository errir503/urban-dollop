/**
 * WordPress dependencies
 */
import { render, store, privateApis } from '@wordpress/interactivity';

const { directivePrefix, getRegionRootFragment, initialVdom, toVdom } =
	privateApis(
		'I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.'
	);

// The cache of visited and prefetched pages.
const pages = new Map();

// Helper to remove domain and hash from the URL. We are only interesting in
// caching the path and the query.
const getPagePath = ( url ) => {
	const u = new URL( url, window.location );
	return u.pathname + u.search;
};

// Fetch a new page and convert it to a static virtual DOM.
const fetchPage = async ( url, { html } ) => {
	try {
		if ( ! html ) {
			const res = await window.fetch( url );
			if ( res.status !== 200 ) return false;
			html = await res.text();
		}
		const dom = new window.DOMParser().parseFromString( html, 'text/html' );
		return regionsToVdom( dom );
	} catch ( e ) {
		return false;
	}
};

// Return an object with VDOM trees of those HTML regions marked with a
// `router-region` directive.
const regionsToVdom = ( dom, { vdom } = {} ) => {
	const regions = {};
	const attrName = `data-${ directivePrefix }-router-region`;
	dom.querySelectorAll( `[${ attrName }]` ).forEach( ( region ) => {
		const id = region.getAttribute( attrName );
		regions[ id ] = vdom?.has( region )
			? vdom.get( region )
			: toVdom( region );
	} );
	const title = dom.querySelector( 'title' )?.innerText;
	return { regions, title };
};

// Render all interactive regions contained in the given page.
const renderRegions = ( page ) => {
	const attrName = `data-${ directivePrefix }-router-region`;
	document.querySelectorAll( `[${ attrName }]` ).forEach( ( region ) => {
		const id = region.getAttribute( attrName );
		const fragment = getRegionRootFragment( region );
		render( page.regions[ id ], fragment );
	} );
	if ( page.title ) {
		document.title = page.title;
	}
};

// Listen to the back and forward buttons and restore the page if it's in the
// cache.
window.addEventListener( 'popstate', async () => {
	const pagePath = getPagePath( window.location ); // Remove hash.
	const page = pages.has( pagePath ) && ( await pages.get( pagePath ) );
	if ( page ) {
		renderRegions( page );
		// Update the URL in the state.
		state.url = window.location.href;
	} else {
		window.location.reload();
	}
} );

// Cache the initial page using the intially parsed vDOM.
pages.set(
	getPagePath( window.location ),
	Promise.resolve( regionsToVdom( document, { vdom: initialVdom } ) )
);

// Variable to store the current navigation.
let navigatingTo = '';

export const { state, actions } = store( 'core/router', {
	state: {
		url: window.location.href,
		navigation: {
			hasStarted: false,
			hasFinished: false,
			texts: {},
		},
	},
	actions: {
		/**
		 * Navigates to the specified page.
		 *
		 * This function normalizes the passed href, fetchs the page HTML if
		 * needed, and updates any interactive regions whose contents have
		 * changed. It also creates a new entry in the browser session history.
		 *
		 * @param {string}  href                               The page href.
		 * @param {Object}  [options]                          Options object.
		 * @param {boolean} [options.force]                    If true, it forces re-fetching the URL.
		 * @param {string}  [options.html]                     HTML string to be used instead of fetching the requested URL.
		 * @param {boolean} [options.replace]                  If true, it replaces the current entry in the browser session history.
		 * @param {number}  [options.timeout]                  Time until the navigation is aborted, in milliseconds. Default is 10000.
		 * @param {boolean} [options.loadingAnimation]         Whether an animation should be shown while navigating. Default to `true`.
		 * @param {boolean} [options.screenReaderAnnouncement] Whether a message for screen readers should be announced while navigating. Default to `true`.
		 *
		 * @return {Promise} Promise that resolves once the navigation is completed or aborted.
		 */
		*navigate( href, options = {} ) {
			const pagePath = getPagePath( href );
			const { navigation } = state;
			const {
				loadingAnimation = true,
				screenReaderAnnouncement = true,
				timeout = 10000,
			} = options;

			navigatingTo = href;
			actions.prefetch( pagePath, options );

			// Create a promise that resolves when the specified timeout ends.
			// The timeout value is 10 seconds by default.
			const timeoutPromise = new Promise( ( resolve ) =>
				setTimeout( resolve, timeout )
			);

			// Don't update the navigation status immediately, wait 400 ms.
			const loadingTimeout = setTimeout( () => {
				if ( navigatingTo !== href ) return;

				if ( loadingAnimation ) {
					navigation.hasStarted = true;
					navigation.hasFinished = false;
				}
				if ( screenReaderAnnouncement ) {
					navigation.message = navigation.texts.loading;
				}
			}, 400 );

			const page = yield Promise.race( [
				pages.get( pagePath ),
				timeoutPromise,
			] );

			// Dismiss loading message if it hasn't been added yet.
			clearTimeout( loadingTimeout );

			// Once the page is fetched, the destination URL could have changed
			// (e.g., by clicking another link in the meantime). If so, bail
			// out, and let the newer execution to update the HTML.
			if ( navigatingTo !== href ) return;

			if ( page ) {
				renderRegions( page );
				window.history[
					options.replace ? 'replaceState' : 'pushState'
				]( {}, '', href );

				// Update the URL in the state.
				state.url = href;

				// Update the navigation status once the the new page rendering
				// has been completed.
				if ( loadingAnimation ) {
					navigation.hasStarted = false;
					navigation.hasFinished = true;
				}

				if ( screenReaderAnnouncement ) {
					// Announce that the page has been loaded. If the message is the
					// same, we use a no-break space similar to the @wordpress/a11y
					// package: https://github.com/WordPress/gutenberg/blob/c395242b8e6ee20f8b06c199e4fc2920d7018af1/packages/a11y/src/filter-message.js#L20-L26
					navigation.message =
						navigation.texts.loaded +
						( navigation.message === navigation.texts.loaded
							? '\u00A0'
							: '' );
				}
			} else {
				window.location.assign( href );
				// Await a promise that won't resolve to prevent any potential
				// feedback indicating that the navigation has finished while
				// the new page is being loaded.
				yield new Promise( () => {} );
			}
		},

		/**
		 * Prefetchs the page with the passed URL.
		 *
		 * The function normalizes the URL and stores internally the fetch
		 * promise, to avoid triggering a second fetch for an ongoing request.
		 *
		 * @param {string}  url             The page URL.
		 * @param {Object}  [options]       Options object.
		 * @param {boolean} [options.force] Force fetching the URL again.
		 * @param {string}  [options.html]  HTML string to be used instead of
		 *                                  fetching the requested URL.
		 */
		prefetch( url, options = {} ) {
			const pagePath = getPagePath( url );
			if ( options.force || ! pages.has( pagePath ) ) {
				pages.set( pagePath, fetchPage( pagePath, options ) );
			}
		},
	},
} );
