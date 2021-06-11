/**
 * External dependencies
 */
const Benchmark = require( 'benchmark' );

/**
 * Internal dependencies
 */
const { __ } = require( '../' );

const suite = new Benchmark.Suite();

suite
	.add( '__', () => {
		__( 'Translate' );
	} )
	// eslint-disable-next-line no-console
	.on( 'cycle', ( event ) => console.log( event.target.toString() ) )
	.run( { async: true } );
