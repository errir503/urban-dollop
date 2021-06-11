/**
 * Returns true if the given object is a generator, or false otherwise.
 *
 * @see https://www.ecma-international.org/ecma-262/6.0/#sec-generator-objects
 *
 * @param {*} object Object to test.
 *
 * @return {boolean} Whether object is a generator.
 */
export default function isGenerator( object ) {
	// Check that iterator (next) and iterable (Symbol.iterator) interfaces are satisfied.
	// These checks seem to be compatible with several generator helpers as well as the native implementation.
	return (
		!! object &&
		typeof object[ Symbol.iterator ] === 'function' &&
		typeof object.next === 'function'
	);
}
