/**
 * External dependencies
 */
import { hydrate, render } from 'preact';
/**
 * Internal dependencies
 */
import { toVdom, hydratedIslands } from './vdom';
import { createRootFragment } from './utils';
import { directivePrefix } from './constants';

// The cache of visited and prefetched pages.
const pages = new Map();

// Keep the same root fragment for each interactive region node.
const regionRootFragments = new WeakMap();
const getRegionRootFragment = ( region ) => {
	if ( ! regionRootFragments.has( region ) ) {
		regionRootFragments.set(
			region,
			createRootFragment( region.parentElement, region )
		);
	}
	return regionRootFragments.get( region );
};

// Helper to remove domain and hash from the URL. We are only interesting in
// caching the path and the query.
const cleanUrl = ( url ) => {
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
// `navigation-id` directive.
const regionsToVdom = ( dom ) => {
	const regions = {};
	const attrName = `data-${ directivePrefix }-navigation-id`;
	dom.querySelectorAll( `[${ attrName }]` ).forEach( ( region ) => {
		const id = region.getAttribute( attrName );
		regions[ id ] = toVdom( region );
	} );
	const title = dom.querySelector( 'title' )?.innerText;
	return { regions, title };
};

/**
 * Prefetchs the page with the passed URL.
 *
 * The function normalizes the URL and stores internally the fetch promise, to
 * avoid triggering a second fetch for an ongoing request.
 *
 * @param {string}  url             The page URL.
 * @param {Object}  [options]       Options object.
 * @param {boolean} [options.force] Force fetching the URL again.
 * @param {string}  [options.html]  HTML string to be used instead of fetching
 *                                  the requested URL.
 */
export const prefetch = ( url, options = {} ) => {
	url = cleanUrl( url );
	if ( options.force || ! pages.has( url ) ) {
		pages.set( url, fetchPage( url, options ) );
	}
};

// Render all interactive regions contained in the given page.
const renderRegions = ( page ) => {
	const attrName = `data-${ directivePrefix }-navigation-id`;
	document.querySelectorAll( `[${ attrName }]` ).forEach( ( region ) => {
		const id = region.getAttribute( attrName );
		const fragment = getRegionRootFragment( region );
		render( page.regions[ id ], fragment );
	} );
	if ( page.title ) {
		document.title = page.title;
	}
};

// Variable to store the current navigation.
let navigatingTo = '';

/**
 * Navigates to the specified page.
 *
 * This function normalizes the passed href, fetchs the page HTML if needed, and
 * updates any interactive regions whose contents have changed. It also creates
 * a new entry in the browser session history.
 *
 * @param {string}  href              The page href.
 * @param {Object}  [options]         Options object.
 * @param {boolean} [options.force]   If true, it forces re-fetching the URL.
 * @param {string}  [options.html]    HTML string to be used instead of fetching
 *                                    the requested URL.
 * @param {boolean} [options.replace] If true, it replaces the current entry in
 *                                    the browser session history.
 * @param {number}  [options.timeout] Time until the navigation is aborted, in
 *                                    milliseconds. Default is 10000.
 *
 * @return {Promise} Promise that resolves once the navigation is completed or
 *                   aborted.
 */
export const navigate = async ( href, options = {} ) => {
	const url = cleanUrl( href );
	navigatingTo = href;
	prefetch( url, options );

	// Create a promise that resolves when the specified timeout ends. The
	// timeout value is 10 seconds by default.
	const timeoutPromise = new Promise( ( resolve ) =>
		setTimeout( resolve, options.timeout ?? 10000 )
	);

	const page = await Promise.race( [ pages.get( url ), timeoutPromise ] );

	// Once the page is fetched, the destination URL could have changed (e.g.,
	// by clicking another link in the meantime). If so, bail out, and let the
	// newer execution to update the HTML.
	if ( navigatingTo !== href ) return;

	if ( page ) {
		renderRegions( page );
		window.history[ options.replace ? 'replaceState' : 'pushState' ](
			{},
			'',
			href
		);
	} else {
		window.location.assign( href );
		await new Promise( () => {} );
	}
};

// Listen to the back and forward buttons and restore the page if it's in the
// cache.
window.addEventListener( 'popstate', async () => {
	const url = cleanUrl( window.location ); // Remove hash.
	const page = pages.has( url ) && ( await pages.get( url ) );
	if ( page ) {
		renderRegions( page );
	} else {
		window.location.reload();
	}
} );

// Initialize the router with the initial DOM.
export const init = async () => {
	document
		.querySelectorAll( `[data-${ directivePrefix }-interactive]` )
		.forEach( ( node ) => {
			if ( ! hydratedIslands.has( node ) ) {
				const fragment = getRegionRootFragment( node );
				const vdom = toVdom( node );
				hydrate( vdom, fragment );
			}
		} );

	// Cache the current regions.
	pages.set(
		cleanUrl( window.location ),
		Promise.resolve( regionsToVdom( document ) )
	);
};
