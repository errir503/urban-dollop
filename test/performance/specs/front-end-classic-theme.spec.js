/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const results = {
	timeToFirstByte: [],
	largestContentfulPaint: [],
	lcpMinusTtfb: [],
};

test.describe( 'Front End Performance', () => {
	test.use( { storageState: {} } ); // User will be logged out.

	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.afterAll( async ( {}, testInfo ) => {
		await testInfo.attach( 'results', {
			body: JSON.stringify( results, null, 2 ),
			contentType: 'application/json',
		} );
	} );

	const samples = 16;
	const throwaway = 0;
	const rounds = samples + throwaway;
	for ( let i = 1; i <= rounds; i++ ) {
		test( `Report TTFB, LCP, and LCP-TTFB (${ i } of ${ rounds })`, async ( {
			page,
		} ) => {
			// Go to the base URL.
			await page.goto( '/', { waitUntil: 'networkidle' } );

			// Take the measurements.
			const [ lcp, ttfb ] = await page.evaluate( () => {
				return Promise.all( [
					// Measure the Largest Contentful Paint time.
					// Based on https://www.checklyhq.com/learn/headless/basics-performance#largest-contentful-paint-api-largest-contentful-paint
					new Promise( ( resolve ) => {
						new PerformanceObserver( ( entryList ) => {
							const entries = entryList.getEntries();
							// The last entry is the largest contentful paint.
							const largestPaintEntry = entries.at( -1 );

							resolve( largestPaintEntry.startTime );
						} ).observe( {
							type: 'largest-contentful-paint',
							buffered: true,
						} );
					} ),
					// Measure the Time To First Byte.
					// Based on https://web.dev/ttfb/#measure-ttfb-in-javascript
					new Promise( ( resolve ) => {
						new PerformanceObserver( ( entryList ) => {
							const [ pageNav ] =
								entryList.getEntriesByType( 'navigation' );

							resolve( pageNav.responseStart );
						} ).observe( {
							type: 'navigation',
							buffered: true,
						} );
					} ),
				] );
			} );

			// Ensure the numbers are valid.
			expect( lcp ).toBeGreaterThan( 0 );
			expect( ttfb ).toBeGreaterThan( 0 );

			// Save the results.
			if ( i >= throwaway ) {
				results.largestContentfulPaint.push( lcp );
				results.timeToFirstByte.push( ttfb );
				results.lcpMinusTtfb.push( lcp - ttfb );
			}
		} );
	}
} );
