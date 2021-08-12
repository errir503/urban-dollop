/**
 * External dependencies
 */
import { get } from 'lodash';

/** @typedef {Record<string, import('./reducer').State>} State */

/**
 * Returns the raw `isResolving` value for a given selector name,
 * and arguments set. May be undefined if the selector has never been resolved
 * or not resolved for the given set of arguments, otherwise true or false for
 * resolution started and completed respectively.
 *
 * @param {State}     state        Data state.
 * @param {string}    selectorName Selector name.
 * @param {unknown[]} args         Arguments passed to selector.
 *
 * @return {boolean | undefined} isResolving value.
 */
export function getIsResolving( state, selectorName, args ) {
	const map = get( state, [ selectorName ] );
	if ( ! map ) {
		return undefined;
	}

	return map.get( args );
}

/**
 * Returns true if resolution has already been triggered for a given
 * selector name, and arguments set.
 *
 * @param {State}     state        Data state.
 * @param {string}    selectorName Selector name.
 * @param {unknown[]} [args]       Arguments passed to selector (default `[]`).
 *
 * @return {boolean} Whether resolution has been triggered.
 */
export function hasStartedResolution( state, selectorName, args = [] ) {
	return getIsResolving( state, selectorName, args ) !== undefined;
}

/**
 * Returns true if resolution has completed for a given selector
 * name, and arguments set.
 *
 * @param {State}     state        Data state.
 * @param {string}    selectorName Selector name.
 * @param {unknown[]} [args]       Arguments passed to selector.
 *
 * @return {boolean} Whether resolution has completed.
 */
export function hasFinishedResolution( state, selectorName, args = [] ) {
	return getIsResolving( state, selectorName, args ) === false;
}

/**
 * Returns true if resolution has been triggered but has not yet completed for
 * a given selector name, and arguments set.
 *
 * @param {State}     state        Data state.
 * @param {string}    selectorName Selector name.
 * @param {unknown[]} [args]       Arguments passed to selector.
 *
 * @return {boolean} Whether resolution is in progress.
 */
export function isResolving( state, selectorName, args = [] ) {
	return getIsResolving( state, selectorName, args ) === true;
}

/**
 * Returns the list of the cached resolvers.
 *
 * @param {State} state Data state.
 *
 * @return {State} Resolvers mapped by args and selectorName.
 */
export function getCachedResolvers( state ) {
	return state;
}
