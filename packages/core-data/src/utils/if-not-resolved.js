/**
 * WordPress dependencies
 */
import { controls } from '@wordpress/data';

/**
 * Higher-order function which invokes the given resolver only if it has not
 * already been resolved with the arguments passed to the enhanced function.
 *
 * This only considers resolution state, and notably does not support resolver
 * custom `isFulfilled` behavior.
 *
 * @param {Function} resolver     Original resolver.
 * @param {string}   selectorName Selector name associated with resolver.
 *
 * @return {Function} Enhanced resolver.
 */
const ifNotResolved = ( resolver, selectorName ) =>
	/**
	 * @param {...any} args Original resolver arguments.
	 */
	function* resolveIfNotResolved( ...args ) {
		const hasStartedResolution = yield controls.select(
			'core',
			'hasStartedResolution',
			selectorName,
			args
		);

		if ( ! hasStartedResolution ) {
			yield* resolver( ...args );
		}
	};

export default ifNotResolved;
