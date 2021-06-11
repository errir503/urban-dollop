/**
 * Internal dependencies
 */
import createNonceMiddleware from '../nonce';

describe( 'Nonce middleware', () => {
	it( 'should add a nonce header to the request', () => {
		expect.hasAssertions();

		const nonce = 'nonce';
		const nonceMiddleware = createNonceMiddleware( nonce );
		const requestOptions = {
			method: 'GET',
			path: '/wp/v2/posts',
		};
		const callback = ( options ) => {
			expect( options.headers[ 'X-WP-Nonce' ] ).toBe( nonce );
		};

		nonceMiddleware( requestOptions, callback );
	} );

	it( 'should update the nonce in requests with outdated nonces', () => {
		expect.hasAssertions();

		const nonce = 'new nonce';
		const nonceMiddleware = createNonceMiddleware( nonce );
		const requestOptions = {
			method: 'GET',
			path: '/wp/v2/posts',
			headers: { 'X-WP-Nonce': 'existing nonce' },
		};

		const callback = ( options ) => {
			expect( options.headers[ 'X-WP-Nonce' ] ).toBe( 'new nonce' );
		};

		nonceMiddleware( requestOptions, callback );
	} );
} );
