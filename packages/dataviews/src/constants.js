/**
 * WordPress dependencies
 */
import { __, isRTL } from '@wordpress/i18n';
import {
	blockTable,
	category,
	formatListBullets,
	formatListBulletsRTL,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import ViewTable from './view-table';
import ViewGrid from './view-grid';
import ViewList from './view-list';

// Field types.
export const ENUMERATION_TYPE = 'enumeration';

// Filter operators.
export const OPERATOR_IS = 'is';
export const OPERATOR_IS_NOT = 'isNot';
export const OPERATOR_IS_ANY = 'isAny';
export const OPERATOR_IS_NONE = 'isNone';
export const ALL_OPERATORS = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
];
export const OPERATORS = {
	[ OPERATOR_IS ]: {
		key: 'is-filter',
		label: __( 'Is' ),
	},
	[ OPERATOR_IS_NOT ]: {
		key: 'is-not-filter',
		label: __( 'Is not' ),
	},
	[ OPERATOR_IS_ANY ]: {
		key: 'is-any-filter',
		label: __( 'Is any' ),
	},
	[ OPERATOR_IS_NONE ]: {
		key: 'is-none-filter',
		label: __( 'Is none' ),
	},
};

// Sorting
export const SORTING_DIRECTIONS = {
	asc: { label: __( 'Sort ascending' ) },
	desc: { label: __( 'Sort descending' ) },
};

// View layouts.
export const LAYOUT_TABLE = 'table';
export const LAYOUT_GRID = 'grid';
export const LAYOUT_LIST = 'list';

export const VIEW_LAYOUTS = [
	{
		type: LAYOUT_TABLE,
		label: __( 'Table' ),
		component: ViewTable,
		icon: blockTable,
	},
	{
		type: LAYOUT_GRID,
		label: __( 'Grid' ),
		component: ViewGrid,
		icon: category,
	},
	{
		type: LAYOUT_LIST,
		label: __( 'List' ),
		component: ViewList,
		icon: isRTL() ? formatListBulletsRTL : formatListBullets,
	},
];
