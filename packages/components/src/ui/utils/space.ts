/**
 * A real number or something parsable as a number
 */
export type SpaceInput = number | string;

const GRID_BASE = '4px';

/**
 * A function that handles numbers, numeric strings, and unit values.
 *
 * When given a number or a numeric string, it will return the grid-based
 * value as a factor of GRID_BASE, defined above.
 *
 * When given a unit value or one of the named CSS values like `auto`,
 * it will simply return the value back.
 *
 * @param  value A number, numeric string, or a unit value.
 */
export function space( value?: SpaceInput ): string | undefined {
	if ( typeof value === 'undefined' ) {
		return undefined;
	}

	// handle empty strings, if it's the number 0 this still works
	if ( ! value ) {
		return '0';
	}

	const asInt = typeof value === 'number' ? value : Number( value );

	// test if the input has a unit, was NaN, or was one of the named CSS values (like `auto`), in which case just use that value
	if (
		( typeof window !== 'undefined' &&
			window.CSS?.supports?.( 'margin', value.toString() ) ) ||
		Number.isNaN( asInt )
	) {
		return value.toString();
	}

	return `calc(${ GRID_BASE } * ${ value })`;
}
