/**
 * External dependencies
 */
import {
	castArray,
	flatMap,
	first,
	isArray,
	isBoolean,
	last,
	map,
	reduce,
	some,
	find,
	filter,
	mapKeys,
	orderBy,
} from 'lodash';
import createSelector from 'rememo';

/**
 * WordPress dependencies
 */
import {
	getBlockType,
	getBlockTypes,
	getBlockVariations,
	hasBlockSupport,
	getPossibleBlockTransformations,
	parse,
} from '@wordpress/blocks';
import { Platform } from '@wordpress/element';
import { symbol } from '@wordpress/icons';

/**
 * A block selection object.
 *
 * @typedef {Object} WPBlockSelection
 *
 * @property {string} clientId     A block client ID.
 * @property {string} attributeKey A block attribute key.
 * @property {number} offset       An attribute value offset, based on the rich
 *                                 text value. See `wp.richText.create`.
 */

// Module constants
const MILLISECONDS_PER_HOUR = 3600 * 1000;
const MILLISECONDS_PER_DAY = 24 * 3600 * 1000;
const MILLISECONDS_PER_WEEK = 7 * 24 * 3600 * 1000;

/**
 * Shared reference to an empty array for cases where it is important to avoid
 * returning a new array reference on every invocation, as in a connected or
 * other pure component which performs `shouldComponentUpdate` check on props.
 * This should be used as a last resort, since the normalized data should be
 * maintained by the reducer result in state.
 *
 * @type {Array}
 */
const EMPTY_ARRAY = [];

/**
 * Returns a block's name given its client ID, or null if no block exists with
 * the client ID.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {string} Block name.
 */
export function getBlockName( state, clientId ) {
	const block = state.blocks.byClientId[ clientId ];
	const socialLinkName = 'core/social-link';

	if ( Platform.OS !== 'web' && block?.name === socialLinkName ) {
		const attributes = state.blocks.attributes[ clientId ];
		const { service } = attributes;

		return service ? `${ socialLinkName }-${ service }` : socialLinkName;
	}
	return block ? block.name : null;
}

/**
 * Returns whether a block is valid or not.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Is Valid.
 */
export function isBlockValid( state, clientId ) {
	const block = state.blocks.byClientId[ clientId ];
	return !! block && block.isValid;
}

/**
 * Returns a block's attributes given its client ID, or null if no block exists with
 * the client ID.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {Object?} Block attributes.
 */
export function getBlockAttributes( state, clientId ) {
	const block = state.blocks.byClientId[ clientId ];
	if ( ! block ) {
		return null;
	}

	return state.blocks.attributes[ clientId ];
}

/**
 * Returns a block given its client ID. This is a parsed copy of the block,
 * containing its `blockName`, `clientId`, and current `attributes` state. This
 * is not the block's registration settings, which must be retrieved from the
 * blocks module registration store.
 *
 * getBlock recurses through its inner blocks until all its children blocks have
 * been retrieved. Note that getBlock will not return the child inner blocks of
 * an inner block controller. This is because an inner block controller syncs
 * itself with its own entity, and should therefore not be included with the
 * blocks of a different entity. For example, say you call `getBlocks( TP )` to
 * get the blocks of a template part. If another template part is a child of TP,
 * then the nested template part's child blocks will not be returned. This way,
 * the template block itself is considered part of the parent, but the children
 * are not.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {Object} Parsed block object.
 */
export function getBlock( state, clientId ) {
	const block = state.blocks.byClientId[ clientId ];
	if ( ! block ) {
		return null;
	}

	return state.blocks.tree[ clientId ];
}

export const __unstableGetBlockWithoutInnerBlocks = createSelector(
	( state, clientId ) => {
		const block = state.blocks.byClientId[ clientId ];
		if ( ! block ) {
			return null;
		}

		return {
			...block,
			attributes: getBlockAttributes( state, clientId ),
		};
	},
	( state, clientId ) => [
		state.blocks.byClientId[ clientId ],
		state.blocks.attributes[ clientId ],
	]
);

/**
 * Returns all block objects for the current post being edited as an array in
 * the order they appear in the post. Note that this will exclude child blocks
 * of nested inner block controllers.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {Object[]} Post blocks.
 */
export function getBlocks( state, rootClientId ) {
	const treeKey =
		! rootClientId || ! areInnerBlocksControlled( state, rootClientId )
			? rootClientId || ''
			: 'controlled||' + rootClientId;
	return state.blocks.tree[ treeKey ]?.innerBlocks || EMPTY_ARRAY;
}

/**
 * Returns a stripped down block object containing only its client ID,
 * and its inner blocks' client IDs.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Client ID of the block to get.
 *
 * @return {Object} Client IDs of the post blocks.
 */
export const __unstableGetClientIdWithClientIdsTree = createSelector(
	( state, clientId ) => ( {
		clientId,
		innerBlocks: __unstableGetClientIdsTree( state, clientId ),
	} ),
	( state ) => [ state.blocks.order ]
);

/**
 * Returns the block tree represented in the block-editor store from the
 * given root, consisting of stripped down block objects containing only
 * their client IDs, and their inner blocks' client IDs.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {Object[]} Client IDs of the post blocks.
 */
export const __unstableGetClientIdsTree = createSelector(
	( state, rootClientId = '' ) =>
		map( getBlockOrder( state, rootClientId ), ( clientId ) =>
			__unstableGetClientIdWithClientIdsTree( state, clientId )
		),
	( state ) => [ state.blocks.order ]
);

/**
 * Returns an array containing the clientIds of all descendants
 * of the blocks given.
 *
 * @param {Object} state     Global application state.
 * @param {Array}  clientIds Array of blocks to inspect.
 *
 * @return {Array} ids of descendants.
 */
export const getClientIdsOfDescendants = ( state, clientIds ) =>
	flatMap( clientIds, ( clientId ) => {
		const descendants = getBlockOrder( state, clientId );
		return [
			...descendants,
			...getClientIdsOfDescendants( state, descendants ),
		];
	} );

/**
 * Returns an array containing the clientIds of the top-level blocks
 * and their descendants of any depth (for nested blocks).
 *
 * @param {Object} state Global application state.
 *
 * @return {Array} ids of top-level and descendant blocks.
 */
export const getClientIdsWithDescendants = createSelector(
	( state ) => {
		const topLevelIds = getBlockOrder( state );
		return [
			...topLevelIds,
			...getClientIdsOfDescendants( state, topLevelIds ),
		];
	},
	( state ) => [ state.blocks.order ]
);

/**
 * Returns the total number of blocks, or the total number of blocks with a specific name in a post.
 * The number returned includes nested blocks.
 *
 * @param {Object}  state     Global application state.
 * @param {?string} blockName Optional block name, if specified only blocks of that type will be counted.
 *
 * @return {number} Number of blocks in the post, or number of blocks with name equal to blockName.
 */
export const getGlobalBlockCount = createSelector(
	( state, blockName ) => {
		const clientIds = getClientIdsWithDescendants( state );
		if ( ! blockName ) {
			return clientIds.length;
		}
		return reduce(
			clientIds,
			( accumulator, clientId ) => {
				const block = state.blocks.byClientId[ clientId ];
				return block.name === blockName ? accumulator + 1 : accumulator;
			},
			0
		);
	},
	( state ) => [ state.blocks.order, state.blocks.byClientId ]
);

/**
 * Given an array of block client IDs, returns the corresponding array of block
 * objects.
 *
 * @param {Object}   state     Editor state.
 * @param {string[]} clientIds Client IDs for which blocks are to be returned.
 *
 * @return {WPBlock[]} Block objects.
 */
export const getBlocksByClientId = createSelector(
	( state, clientIds ) =>
		map( castArray( clientIds ), ( clientId ) =>
			getBlock( state, clientId )
		),
	( state, clientIds ) =>
		map(
			castArray( clientIds ),
			( clientId ) => state.blocks.tree[ clientId ]
		)
);

/**
 * Returns the number of blocks currently present in the post.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {number} Number of blocks in the post.
 */
export function getBlockCount( state, rootClientId ) {
	return getBlockOrder( state, rootClientId ).length;
}

/**
 * Returns the current selection start block client ID, attribute key and text
 * offset.
 *
 * @param {Object} state Block editor state.
 *
 * @return {WPBlockSelection} Selection start information.
 */
export function getSelectionStart( state ) {
	return state.selection.selectionStart;
}

/**
 * Returns the current selection end block client ID, attribute key and text
 * offset.
 *
 * @param {Object} state Block editor state.
 *
 * @return {WPBlockSelection} Selection end information.
 */
export function getSelectionEnd( state ) {
	return state.selection.selectionEnd;
}

/**
 * Returns the current block selection start. This value may be null, and it
 * may represent either a singular block selection or multi-selection start.
 * A selection is singular if its start and end match.
 *
 * @param {Object} state Global application state.
 *
 * @return {?string} Client ID of block selection start.
 */
export function getBlockSelectionStart( state ) {
	return state.selection.selectionStart.clientId;
}

/**
 * Returns the current block selection end. This value may be null, and it
 * may represent either a singular block selection or multi-selection end.
 * A selection is singular if its start and end match.
 *
 * @param {Object} state Global application state.
 *
 * @return {?string} Client ID of block selection end.
 */
export function getBlockSelectionEnd( state ) {
	return state.selection.selectionEnd.clientId;
}

/**
 * Returns the number of blocks currently selected in the post.
 *
 * @param {Object} state Global application state.
 *
 * @return {number} Number of blocks selected in the post.
 */
export function getSelectedBlockCount( state ) {
	const multiSelectedBlockCount = getMultiSelectedBlockClientIds( state )
		.length;

	if ( multiSelectedBlockCount ) {
		return multiSelectedBlockCount;
	}

	return state.selection.selectionStart.clientId ? 1 : 0;
}

/**
 * Returns true if there is a single selected block, or false otherwise.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Whether a single block is selected.
 */
export function hasSelectedBlock( state ) {
	const { selectionStart, selectionEnd } = state.selection;
	return (
		!! selectionStart.clientId &&
		selectionStart.clientId === selectionEnd.clientId
	);
}

/**
 * Returns the currently selected block client ID, or null if there is no
 * selected block.
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} Selected block client ID.
 */
export function getSelectedBlockClientId( state ) {
	const { selectionStart, selectionEnd } = state.selection;
	const { clientId } = selectionStart;

	if ( ! clientId || clientId !== selectionEnd.clientId ) {
		return null;
	}

	return clientId;
}

/**
 * Returns the currently selected block, or null if there is no selected block.
 *
 * @param {Object} state Global application state.
 *
 * @return {?Object} Selected block.
 */
export function getSelectedBlock( state ) {
	const clientId = getSelectedBlockClientId( state );
	return clientId ? getBlock( state, clientId ) : null;
}

/**
 * Given a block client ID, returns the root block from which the block is
 * nested, an empty string for top-level blocks, or null if the block does not
 * exist.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block from which to find root client ID.
 *
 * @return {?string} Root client ID, if exists
 */
export function getBlockRootClientId( state, clientId ) {
	return state.blocks.parents[ clientId ] !== undefined
		? state.blocks.parents[ clientId ]
		: null;
}

/**
 * Given a block client ID, returns the list of all its parents from top to bottom.
 *
 * @param {Object}  state     Editor state.
 * @param {string}  clientId  Block from which to find root client ID.
 * @param {boolean} ascending Order results from bottom to top (true) or top to bottom (false).
 *
 * @return {Array} ClientIDs of the parent blocks.
 */
export const getBlockParents = createSelector(
	( state, clientId, ascending = false ) => {
		const parents = [];
		let current = clientId;
		while ( !! state.blocks.parents[ current ] ) {
			current = state.blocks.parents[ current ];
			parents.push( current );
		}

		return ascending ? parents : parents.reverse();
	},
	( state ) => [ state.blocks.parents ]
);

/**
 * Given a block client ID and a block name, returns the list of all its parents
 * from top to bottom, filtered by the given name(s). For example, if passed
 * 'core/group' as the blockName, it will only return parents which are group
 * blocks. If passed `[ 'core/group', 'core/cover']`, as the blockName, it will
 * return parents which are group blocks and parents which are cover blocks.
 *
 * @param {Object}          state     Editor state.
 * @param {string}          clientId  Block from which to find root client ID.
 * @param {string|string[]} blockName Block name(s) to filter.
 * @param {boolean}         ascending Order results from bottom to top (true) or top to bottom (false).
 *
 * @return {Array} ClientIDs of the parent blocks.
 */
export const getBlockParentsByBlockName = createSelector(
	( state, clientId, blockName, ascending = false ) => {
		const parents = getBlockParents( state, clientId, ascending );
		return map(
			filter(
				map( parents, ( id ) => ( {
					id,
					name: getBlockName( state, id ),
				} ) ),
				( { name } ) => {
					if ( Array.isArray( blockName ) ) {
						return blockName.includes( name );
					}
					return name === blockName;
				}
			),
			( { id } ) => id
		);
	},
	( state ) => [ state.blocks.parents ]
);

/**
 * Given a block client ID, returns the root of the hierarchy from which the block is nested, return the block itself for root level blocks.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block from which to find root client ID.
 *
 * @return {string} Root client ID
 */
export function getBlockHierarchyRootClientId( state, clientId ) {
	let current = clientId;
	let parent;
	do {
		parent = current;
		current = state.blocks.parents[ current ];
	} while ( current );
	return parent;
}

/**
 * Given a block client ID, returns the lowest common ancestor with selected client ID.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block from which to find common ancestor client ID.
 *
 * @return {string} Common ancestor client ID or undefined
 */
export function getLowestCommonAncestorWithSelectedBlock( state, clientId ) {
	const selectedId = getSelectedBlockClientId( state );
	const clientParents = [ ...getBlockParents( state, clientId ), clientId ];
	const selectedParents = [
		...getBlockParents( state, selectedId ),
		selectedId,
	];

	let lowestCommonAncestor;

	const maxDepth = Math.min( clientParents.length, selectedParents.length );
	for ( let index = 0; index < maxDepth; index++ ) {
		if ( clientParents[ index ] === selectedParents[ index ] ) {
			lowestCommonAncestor = clientParents[ index ];
		} else {
			break;
		}
	}

	return lowestCommonAncestor;
}

/**
 * Returns the client ID of the block adjacent one at the given reference
 * startClientId and modifier directionality. Defaults start startClientId to
 * the selected block, and direction as next block. Returns null if there is no
 * adjacent block.
 *
 * @param {Object}  state         Editor state.
 * @param {?string} startClientId Optional client ID of block from which to
 *                                search.
 * @param {?number} modifier      Directionality multiplier (1 next, -1
 *                                previous).
 *
 * @return {?string} Return the client ID of the block, or null if none exists.
 */
export function getAdjacentBlockClientId( state, startClientId, modifier = 1 ) {
	// Default to selected block.
	if ( startClientId === undefined ) {
		startClientId = getSelectedBlockClientId( state );
	}

	// Try multi-selection starting at extent based on modifier.
	if ( startClientId === undefined ) {
		if ( modifier < 0 ) {
			startClientId = getFirstMultiSelectedBlockClientId( state );
		} else {
			startClientId = getLastMultiSelectedBlockClientId( state );
		}
	}

	// Validate working start client ID.
	if ( ! startClientId ) {
		return null;
	}

	// Retrieve start block root client ID, being careful to allow the falsey
	// empty string top-level root by explicitly testing against null.
	const rootClientId = getBlockRootClientId( state, startClientId );
	if ( rootClientId === null ) {
		return null;
	}

	const { order } = state.blocks;
	const orderSet = order[ rootClientId ];
	const index = orderSet.indexOf( startClientId );
	const nextIndex = index + 1 * modifier;

	// Block was first in set and we're attempting to get previous.
	if ( nextIndex < 0 ) {
		return null;
	}

	// Block was last in set and we're attempting to get next.
	if ( nextIndex === orderSet.length ) {
		return null;
	}

	// Assume incremented index is within the set.
	return orderSet[ nextIndex ];
}

/**
 * Returns the previous block's client ID from the given reference start ID.
 * Defaults start to the selected block. Returns null if there is no previous
 * block.
 *
 * @param {Object}  state         Editor state.
 * @param {?string} startClientId Optional client ID of block from which to
 *                                search.
 *
 * @return {?string} Adjacent block's client ID, or null if none exists.
 */
export function getPreviousBlockClientId( state, startClientId ) {
	return getAdjacentBlockClientId( state, startClientId, -1 );
}

/**
 * Returns the next block's client ID from the given reference start ID.
 * Defaults start to the selected block. Returns null if there is no next
 * block.
 *
 * @param {Object}  state         Editor state.
 * @param {?string} startClientId Optional client ID of block from which to
 *                                search.
 *
 * @return {?string} Adjacent block's client ID, or null if none exists.
 */
export function getNextBlockClientId( state, startClientId ) {
	return getAdjacentBlockClientId( state, startClientId, 1 );
}

/* eslint-disable jsdoc/valid-types */
/**
 * Returns the initial caret position for the selected block.
 * This position is to used to position the caret properly when the selected block changes.
 * If the current block is not a RichText, having initial position set to 0 means "focus block"
 *
 * @param {Object} state Global application state.
 *
 * @return {0|-1|null} Initial position.
 */
export function getSelectedBlocksInitialCaretPosition( state ) {
	/* eslint-enable jsdoc/valid-types */
	return state.initialPosition;
}

/**
 * Returns the current selection set of block client IDs (multiselection or single selection).
 *
 * @param {Object} state Editor state.
 *
 * @return {Array} Multi-selected block client IDs.
 */
export const getSelectedBlockClientIds = createSelector(
	( state ) => {
		const { selectionStart, selectionEnd } = state.selection;

		if (
			selectionStart.clientId === undefined ||
			selectionEnd.clientId === undefined
		) {
			return EMPTY_ARRAY;
		}

		if ( selectionStart.clientId === selectionEnd.clientId ) {
			return [ selectionStart.clientId ];
		}

		// Retrieve root client ID to aid in retrieving relevant nested block
		// order, being careful to allow the falsey empty string top-level root
		// by explicitly testing against null.
		const rootClientId = getBlockRootClientId(
			state,
			selectionStart.clientId
		);
		if ( rootClientId === null ) {
			return EMPTY_ARRAY;
		}

		const blockOrder = getBlockOrder( state, rootClientId );
		const startIndex = blockOrder.indexOf( selectionStart.clientId );
		const endIndex = blockOrder.indexOf( selectionEnd.clientId );

		if ( startIndex > endIndex ) {
			return blockOrder.slice( endIndex, startIndex + 1 );
		}

		return blockOrder.slice( startIndex, endIndex + 1 );
	},
	( state ) => [
		state.blocks.order,
		state.selection.selectionStart.clientId,
		state.selection.selectionEnd.clientId,
	]
);

/**
 * Returns the current multi-selection set of block client IDs, or an empty
 * array if there is no multi-selection.
 *
 * @param {Object} state Editor state.
 *
 * @return {Array} Multi-selected block client IDs.
 */
export function getMultiSelectedBlockClientIds( state ) {
	const { selectionStart, selectionEnd } = state.selection;

	if ( selectionStart.clientId === selectionEnd.clientId ) {
		return EMPTY_ARRAY;
	}

	return getSelectedBlockClientIds( state );
}

/**
 * Returns the current multi-selection set of blocks, or an empty array if
 * there is no multi-selection.
 *
 * @param {Object} state Editor state.
 *
 * @return {Array} Multi-selected block objects.
 */
export const getMultiSelectedBlocks = createSelector(
	( state ) => {
		const multiSelectedBlockClientIds = getMultiSelectedBlockClientIds(
			state
		);
		if ( ! multiSelectedBlockClientIds.length ) {
			return EMPTY_ARRAY;
		}

		return multiSelectedBlockClientIds.map( ( clientId ) =>
			getBlock( state, clientId )
		);
	},
	( state ) => [
		...getSelectedBlockClientIds.getDependants( state ),
		state.blocks.byClientId,
		state.blocks.order,
		state.blocks.attributes,
	]
);

/**
 * Returns the client ID of the first block in the multi-selection set, or null
 * if there is no multi-selection.
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} First block client ID in the multi-selection set.
 */
export function getFirstMultiSelectedBlockClientId( state ) {
	return first( getMultiSelectedBlockClientIds( state ) ) || null;
}

/**
 * Returns the client ID of the last block in the multi-selection set, or null
 * if there is no multi-selection.
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} Last block client ID in the multi-selection set.
 */
export function getLastMultiSelectedBlockClientId( state ) {
	return last( getMultiSelectedBlockClientIds( state ) ) || null;
}

/**
 * Returns true if a multi-selection exists, and the block corresponding to the
 * specified client ID is the first block of the multi-selection set, or false
 * otherwise.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Whether block is first in multi-selection.
 */
export function isFirstMultiSelectedBlock( state, clientId ) {
	return getFirstMultiSelectedBlockClientId( state ) === clientId;
}

/**
 * Returns true if the client ID occurs within the block multi-selection, or
 * false otherwise.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Whether block is in multi-selection set.
 */
export function isBlockMultiSelected( state, clientId ) {
	return getMultiSelectedBlockClientIds( state ).indexOf( clientId ) !== -1;
}

/**
 * Returns true if an ancestor of the block is multi-selected, or false
 * otherwise.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Whether an ancestor of the block is in multi-selection
 *                   set.
 */
export const isAncestorMultiSelected = createSelector(
	( state, clientId ) => {
		let ancestorClientId = clientId;
		let isMultiSelected = false;
		while ( ancestorClientId && ! isMultiSelected ) {
			ancestorClientId = getBlockRootClientId( state, ancestorClientId );
			isMultiSelected = isBlockMultiSelected( state, ancestorClientId );
		}
		return isMultiSelected;
	},
	( state ) => [
		state.blocks.order,
		state.selection.selectionStart.clientId,
		state.selection.selectionEnd.clientId,
	]
);
/**
 * Returns the client ID of the block which begins the multi-selection set, or
 * null if there is no multi-selection.
 *
 * This is not necessarily the first client ID in the selection.
 *
 * @see getFirstMultiSelectedBlockClientId
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} Client ID of block beginning multi-selection.
 */
export function getMultiSelectedBlocksStartClientId( state ) {
	const { selectionStart, selectionEnd } = state.selection;

	if ( selectionStart.clientId === selectionEnd.clientId ) {
		return null;
	}

	return selectionStart.clientId || null;
}

/**
 * Returns the client ID of the block which ends the multi-selection set, or
 * null if there is no multi-selection.
 *
 * This is not necessarily the last client ID in the selection.
 *
 * @see getLastMultiSelectedBlockClientId
 *
 * @param {Object} state Editor state.
 *
 * @return {?string} Client ID of block ending multi-selection.
 */
export function getMultiSelectedBlocksEndClientId( state ) {
	const { selectionStart, selectionEnd } = state.selection;

	if ( selectionStart.clientId === selectionEnd.clientId ) {
		return null;
	}

	return selectionEnd.clientId || null;
}

/**
 * Returns an array containing all block client IDs in the editor in the order
 * they appear. Optionally accepts a root client ID of the block list for which
 * the order should be returned, defaulting to the top-level block order.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {Array} Ordered client IDs of editor blocks.
 */
export function getBlockOrder( state, rootClientId ) {
	return state.blocks.order[ rootClientId || '' ] || EMPTY_ARRAY;
}

/**
 * Returns the index at which the block corresponding to the specified client
 * ID occurs within the block order, or `-1` if the block does not exist.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientId     Block client ID.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {number} Index at which block exists in order.
 */
export function getBlockIndex( state, clientId, rootClientId ) {
	return getBlockOrder( state, rootClientId ).indexOf( clientId );
}

/**
 * Returns true if the block corresponding to the specified client ID is
 * currently selected and no multi-selection exists, or false otherwise.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Whether block is selected and multi-selection exists.
 */
export function isBlockSelected( state, clientId ) {
	const { selectionStart, selectionEnd } = state.selection;

	if ( selectionStart.clientId !== selectionEnd.clientId ) {
		return false;
	}

	return selectionStart.clientId === clientId;
}

/**
 * Returns true if one of the block's inner blocks is selected.
 *
 * @param {Object}  state    Editor state.
 * @param {string}  clientId Block client ID.
 * @param {boolean} deep     Perform a deep check.
 *
 * @return {boolean} Whether the block as an inner block selected
 */
export function hasSelectedInnerBlock( state, clientId, deep = false ) {
	return some(
		getBlockOrder( state, clientId ),
		( innerClientId ) =>
			isBlockSelected( state, innerClientId ) ||
			isBlockMultiSelected( state, innerClientId ) ||
			( deep && hasSelectedInnerBlock( state, innerClientId, deep ) )
	);
}

/**
 * Returns true if the block corresponding to the specified client ID is
 * currently selected but isn't the last of the selected blocks. Here "last"
 * refers to the block sequence in the document, _not_ the sequence of
 * multi-selection, which is why `state.selectionEnd` isn't used.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {boolean} Whether block is selected and not the last in the
 *                   selection.
 */
export function isBlockWithinSelection( state, clientId ) {
	if ( ! clientId ) {
		return false;
	}

	const clientIds = getMultiSelectedBlockClientIds( state );
	const index = clientIds.indexOf( clientId );
	return index > -1 && index < clientIds.length - 1;
}

/**
 * Returns true if a multi-selection has been made, or false otherwise.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Whether multi-selection has been made.
 */
export function hasMultiSelection( state ) {
	const { selectionStart, selectionEnd } = state.selection;
	return selectionStart.clientId !== selectionEnd.clientId;
}

/**
 * Whether in the process of multi-selecting or not. This flag is only true
 * while the multi-selection is being selected (by mouse move), and is false
 * once the multi-selection has been settled.
 *
 * @see hasMultiSelection
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} True if multi-selecting, false if not.
 */
export function isMultiSelecting( state ) {
	return state.isMultiSelecting;
}

/**
 * Selector that returns if multi-selection is enabled or not.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} True if it should be possible to multi-select blocks, false if multi-selection is disabled.
 */
export function isSelectionEnabled( state ) {
	return state.isSelectionEnabled;
}

/**
 * Returns the block's editing mode, defaulting to "visual" if not explicitly
 * assigned.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {Object} Block editing mode.
 */
export function getBlockMode( state, clientId ) {
	return state.blocksMode[ clientId ] || 'visual';
}

/**
 * Returns true if the user is typing, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether user is typing.
 */
export function isTyping( state ) {
	return state.isTyping;
}

/**
 * Returns true if the user is dragging blocks, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether user is dragging blocks.
 */
export function isDraggingBlocks( state ) {
	return !! state.draggedBlocks.length;
}

/**
 * Returns the client ids of any blocks being directly dragged.
 *
 * This does not include children of a parent being dragged.
 *
 * @param {Object} state Global application state.
 *
 * @return {string[]} Array of dragged block client ids.
 */
export function getDraggedBlockClientIds( state ) {
	return state.draggedBlocks;
}

/**
 * Returns whether the block is being dragged.
 *
 * Only returns true if the block is being directly dragged,
 * not if the block is a child of a parent being dragged.
 * See `isAncestorBeingDragged` for child blocks.
 *
 * @param {Object} state    Global application state.
 * @param {string} clientId Client id for block to check.
 *
 * @return {boolean} Whether the block is being dragged.
 */
export function isBlockBeingDragged( state, clientId ) {
	return state.draggedBlocks.includes( clientId );
}

/**
 * Returns whether a parent/ancestor of the block is being dragged.
 *
 * @param {Object} state    Global application state.
 * @param {string} clientId Client id for block to check.
 *
 * @return {boolean} Whether the block's ancestor is being dragged.
 */
export function isAncestorBeingDragged( state, clientId ) {
	// Return early if no blocks are being dragged rather than
	// the more expensive check for parents.
	if ( ! isDraggingBlocks( state ) ) {
		return false;
	}

	const parents = getBlockParents( state, clientId );
	return some( parents, ( parentClientId ) =>
		isBlockBeingDragged( state, parentClientId )
	);
}

/**
 * Returns true if the caret is within formatted text, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the caret is within formatted text.
 */
export function isCaretWithinFormattedText( state ) {
	return state.isCaretWithinFormattedText;
}

/**
 * Returns the insertion point, the index at which the new inserted block would
 * be placed. Defaults to the last index.
 *
 * @param {Object} state Editor state.
 *
 * @return {Object} Insertion point object with `rootClientId`, `index`.
 */
export function getBlockInsertionPoint( state ) {
	let rootClientId, index;

	const {
		insertionPoint,
		selection: { selectionEnd },
	} = state;
	if ( insertionPoint !== null ) {
		return insertionPoint;
	}

	const { clientId } = selectionEnd;

	if ( clientId ) {
		rootClientId = getBlockRootClientId( state, clientId ) || undefined;
		index = getBlockIndex( state, selectionEnd.clientId, rootClientId ) + 1;
	} else {
		index = getBlockOrder( state ).length;
	}

	return { rootClientId, index };
}

/**
 * Returns true if we should show the block insertion point.
 *
 * @param {Object} state Global application state.
 *
 * @return {?boolean} Whether the insertion point is visible or not.
 */
export function isBlockInsertionPointVisible( state ) {
	return state.insertionPoint !== null;
}

/**
 * Returns whether the blocks matches the template or not.
 *
 * @param {boolean} state
 * @return {?boolean} Whether the template is valid or not.
 */
export function isValidTemplate( state ) {
	return state.template.isValid;
}

/**
 * Returns the defined block template
 *
 * @param {boolean} state
 *
 * @return {?Array} Block Template.
 */
export function getTemplate( state ) {
	return state.settings.template;
}

/**
 * Returns the defined block template lock. Optionally accepts a root block
 * client ID as context, otherwise defaulting to the global context.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional block root client ID.
 *
 * @return {?string} Block Template Lock
 */
export function getTemplateLock( state, rootClientId ) {
	if ( ! rootClientId ) {
		return state.settings.templateLock;
	}

	const blockListSettings = getBlockListSettings( state, rootClientId );
	if ( ! blockListSettings ) {
		return null;
	}

	return blockListSettings.templateLock;
}

const checkAllowList = ( list, item, defaultResult = null ) => {
	if ( isBoolean( list ) ) {
		return list;
	}
	if ( isArray( list ) ) {
		// TODO: when there is a canonical way to detect that we are editing a post
		// the following check should be changed to something like:
		// if ( list.includes( 'core/post-content' ) && getEditorMode() === 'post-content' && item === null )
		if ( list.includes( 'core/post-content' ) && item === null ) {
			return true;
		}
		return list.includes( item );
	}
	return defaultResult;
};

/**
 * Determines if the given block type is allowed to be inserted into the block list.
 * This function is not exported and not memoized because using a memoized selector
 * inside another memoized selector is just a waste of time.
 *
 * @param {Object}        state        Editor state.
 * @param {string|Object} blockName    The block type object, e.g., the response
 *                                     from the block directory; or a string name of
 *                                     an installed block type, e.g.' core/paragraph'.
 * @param {?string}       rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given block type is allowed to be inserted.
 */
const canInsertBlockTypeUnmemoized = (
	state,
	blockName,
	rootClientId = null
) => {
	let blockType;
	if ( blockName && 'object' === typeof blockName ) {
		blockType = blockName;
		blockName = blockType.name;
	} else {
		blockType = getBlockType( blockName );
	}
	if ( ! blockType ) {
		return false;
	}

	const { allowedBlockTypes } = getSettings( state );

	const isBlockAllowedInEditor = checkAllowList(
		allowedBlockTypes,
		blockName,
		true
	);
	if ( ! isBlockAllowedInEditor ) {
		return false;
	}

	const isLocked = !! getTemplateLock( state, rootClientId );
	if ( isLocked ) {
		return false;
	}

	const parentBlockListSettings = getBlockListSettings( state, rootClientId );

	// The parent block doesn't have settings indicating it doesn't support
	// inner blocks, return false.
	if ( rootClientId && parentBlockListSettings === undefined ) {
		return false;
	}

	const parentAllowedBlocks = parentBlockListSettings?.allowedBlocks;
	const hasParentAllowedBlock = checkAllowList(
		parentAllowedBlocks,
		blockName
	);

	const blockAllowedParentBlocks = blockType.parent;
	const parentName = getBlockName( state, rootClientId );
	const hasBlockAllowedParent = checkAllowList(
		blockAllowedParentBlocks,
		parentName
	);

	if ( hasParentAllowedBlock !== null && hasBlockAllowedParent !== null ) {
		return hasParentAllowedBlock || hasBlockAllowedParent;
	} else if ( hasParentAllowedBlock !== null ) {
		return hasParentAllowedBlock;
	} else if ( hasBlockAllowedParent !== null ) {
		return hasBlockAllowedParent;
	}

	return true;
};

/**
 * Determines if the given block type is allowed to be inserted into the block list.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  blockName    The name of the block type, e.g.' core/paragraph'.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given block type is allowed to be inserted.
 */
export const canInsertBlockType = createSelector(
	canInsertBlockTypeUnmemoized,
	( state, blockName, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId[ rootClientId ],
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
	]
);

/**
 * Determines if the given blocks are allowed to be inserted into the block
 * list.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientIds    The block client IDs to be inserted.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given blocks are allowed to be inserted.
 */
export function canInsertBlocks( state, clientIds, rootClientId = null ) {
	return clientIds.every( ( id ) =>
		canInsertBlockType( state, getBlockName( state, id ), rootClientId )
	);
}

/**
 * Determines if the given block is allowed to be deleted.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientId     The block client Id.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given block is allowed to be removed.
 */
export function canRemoveBlock( state, clientId, rootClientId = null ) {
	const attributes = getBlockAttributes( state, clientId );

	// attributes can be null if the block is already deleted.
	if ( attributes === null ) {
		return true;
	}

	const { lock } = attributes;
	const parentIsLocked = !! getTemplateLock( state, rootClientId );
	// If we don't have a lock on the blockType level, we differ to the parent templateLock.
	if ( lock === undefined || lock?.remove === undefined ) {
		return ! parentIsLocked;
	}

	// when remove is true, it means we cannot remove it.
	return ! lock?.remove;
}

/**
 * Determines if the given blocks are allowed to be removed.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientIds    The block client IDs to be removed.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given blocks are allowed to be removed.
 */
export function canRemoveBlocks( state, clientIds, rootClientId = null ) {
	return clientIds.every( ( clientId ) =>
		canRemoveBlock( state, clientId, rootClientId )
	);
}

/**
 * Determines if the given block is allowed to be moved.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientId     The block client Id.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given block is allowed to be moved.
 */
export function canMoveBlock( state, clientId, rootClientId = null ) {
	const attributes = getBlockAttributes( state, clientId );
	if ( attributes === null ) {
		return;
	}

	const { lock } = attributes;
	const parentIsLocked = getTemplateLock( state, rootClientId ) === 'all';
	// If we don't have a lock on the blockType level, we differ to the parent templateLock.
	if ( lock === undefined || lock?.move === undefined ) {
		return ! parentIsLocked;
	}

	// when move is true, it means we cannot move it.
	return ! lock?.move;
}

/**
 * Determines if the given blocks are allowed to be moved.
 *
 * @param {Object}  state        Editor state.
 * @param {string}  clientIds    The block client IDs to be moved.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given blocks are allowed to be moved.
 */
export function canMoveBlocks( state, clientIds, rootClientId = null ) {
	return clientIds.every( ( clientId ) =>
		canMoveBlock( state, clientId, rootClientId )
	);
}

/**
 * Returns information about how recently and frequently a block has been inserted.
 *
 * @param {Object} state Global application state.
 * @param {string} id    A string which identifies the insert, e.g. 'core/block/12'
 *
 * @return {?{ time: number, count: number }} An object containing `time` which is when the last
 *                                            insert occurred as a UNIX epoch, and `count` which is
 *                                            the number of inserts that have occurred.
 */
function getInsertUsage( state, id ) {
	return state.preferences.insertUsage?.[ id ] ?? null;
}

/**
 * Returns whether we can show a block type in the inserter
 *
 * @param {Object}  state        Global State
 * @param {Object}  blockType    BlockType
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Whether the given block type is allowed to be shown in the inserter.
 */
const canIncludeBlockTypeInInserter = ( state, blockType, rootClientId ) => {
	if ( ! hasBlockSupport( blockType, 'inserter', true ) ) {
		return false;
	}

	return canInsertBlockTypeUnmemoized( state, blockType.name, rootClientId );
};

/**
 * Return a function to be used to tranform a block variation to an inserter item
 *
 * @param {Object} state Global State
 * @param {Object} item  Denormalized inserter item
 * @return {Function} Function to transform a block variation to inserter item
 */
const getItemFromVariation = ( state, item ) => ( variation ) => {
	const variationId = `${ item.id }/${ variation.name }`;
	const { time, count = 0 } = getInsertUsage( state, variationId ) || {};
	return {
		...item,
		id: variationId,
		icon: variation.icon || item.icon,
		title: variation.title || item.title,
		description: variation.description || item.description,
		category: variation.category || item.category,
		// If `example` is explicitly undefined for the variation, the preview will not be shown.
		example: variation.hasOwnProperty( 'example' )
			? variation.example
			: item.example,
		initialAttributes: {
			...item.initialAttributes,
			...variation.attributes,
		},
		innerBlocks: variation.innerBlocks,
		keywords: variation.keywords || item.keywords,
		frecency: calculateFrecency( time, count ),
	};
};

/**
 * Returns the calculated frecency.
 *
 * 'frecency' is a heuristic (https://en.wikipedia.org/wiki/Frecency)
 * that combines block usage frequenty and recency.
 *
 * @param {number} time  When the last insert occurred as a UNIX epoch
 * @param {number} count The number of inserts that have occurred.
 *
 * @return {number} The calculated frecency.
 */
const calculateFrecency = ( time, count ) => {
	if ( ! time ) {
		return count;
	}
	// The selector is cached, which means Date.now() is the last time that the
	// relevant state changed. This suits our needs.
	const duration = Date.now() - time;
	switch ( true ) {
		case duration < MILLISECONDS_PER_HOUR:
			return count * 4;
		case duration < MILLISECONDS_PER_DAY:
			return count * 2;
		case duration < MILLISECONDS_PER_WEEK:
			return count / 2;
		default:
			return count / 4;
	}
};

/**
 * Returns a function that accepts a block type and builds an item to be shown
 * in a specific context. It's used for building items for Inserter and available
 * block Transfroms list.
 *
 * @param {Object} state              Editor state.
 * @param {Object} options            Options object for handling the building of a block type.
 * @param {string} options.buildScope The scope for which the item is going to be used.
 * @return {Function} Function returns an item to be shown in a specific context (Inserter|Transforms list).
 */
const buildBlockTypeItem = ( state, { buildScope = 'inserter' } ) => (
	blockType
) => {
	const id = blockType.name;

	let isDisabled = false;
	if ( ! hasBlockSupport( blockType.name, 'multiple', true ) ) {
		isDisabled = some(
			getBlocksByClientId( state, getClientIdsWithDescendants( state ) ),
			{ name: blockType.name }
		);
	}

	const { time, count = 0 } = getInsertUsage( state, id ) || {};
	const blockItemBase = {
		id,
		name: blockType.name,
		title: blockType.title,
		icon: blockType.icon,
		isDisabled,
		frecency: calculateFrecency( time, count ),
	};
	if ( buildScope === 'transform' ) return blockItemBase;

	const inserterVariations = getBlockVariations( blockType.name, 'inserter' );
	return {
		...blockItemBase,
		initialAttributes: {},
		description: blockType.description,
		category: blockType.category,
		keywords: blockType.keywords,
		variations: inserterVariations,
		example: blockType.example,
		utility: 1, // deprecated
	};
};

/**
 * Determines the items that appear in the inserter. Includes both static
 * items (e.g. a regular block type) and dynamic items (e.g. a reusable block).
 *
 * Each item object contains what's necessary to display a button in the
 * inserter and handle its selection.
 *
 * The 'frecency' property is a heuristic (https://en.wikipedia.org/wiki/Frecency)
 * that combines block usage frequenty and recency.
 *
 * Items are returned ordered descendingly by their 'utility' and 'frecency'.
 *
 * @param    {Object}   state             Editor state.
 * @param    {?string}  rootClientId      Optional root client ID of block list.
 *
 * @return {WPEditorInserterItem[]} Items that appear in inserter.
 *
 * @typedef {Object} WPEditorInserterItem
 * @property {string}   id                Unique identifier for the item.
 * @property {string}   name              The type of block to create.
 * @property {Object}   initialAttributes Attributes to pass to the newly created block.
 * @property {string}   title             Title of the item, as it appears in the inserter.
 * @property {string}   icon              Dashicon for the item, as it appears in the inserter.
 * @property {string}   category          Block category that the item is associated with.
 * @property {string[]} keywords          Keywords that can be searched to find this item.
 * @property {boolean}  isDisabled        Whether or not the user should be prevented from inserting
 *                                        this item.
 * @property {number}   frecency          Heuristic that combines frequency and recency.
 */
export const getInserterItems = createSelector(
	( state, rootClientId = null ) => {
		const buildBlockTypeInserterItem = buildBlockTypeItem( state, {
			buildScope: 'inserter',
		} );

		/*
		 * Matches block comment delimiters amid serialized content.
		 *
		 * @see `tokenizer` in `@wordpress/block-serialization-default-parser`
		 * package
		 *
		 * blockParserTokenizer differs from the original tokenizer in the
		 * following ways:
		 *
		 * - removed global flag (/g)
		 * - prepended ^\s*
		 *
		 */
		const blockParserTokenizer = /^\s*<!--\s+(\/)?wp:([a-z][a-z0-9_-]*\/)?([a-z][a-z0-9_-]*)\s+({(?:(?=([^}]+|}+(?=})|(?!}\s+\/?-->)[^])*)\5|[^]*?)}\s+)?(\/)?-->/;

		const buildReusableBlockInserterItem = ( reusableBlock ) => {
			let icon = symbol;

			/*
			 * Instead of always displaying a generic "symbol" icon for every
			 * reusable block, try to use an icon that represents the first
			 * outermost block contained in the reusable block. This requires
			 * scanning the serialized form of the reusable block to find its
			 * first block delimiter, then looking up the corresponding block
			 * type, if available.
			 */
			if ( Platform.OS === 'web' ) {
				const content =
					typeof reusableBlock.content.raw === 'string'
						? reusableBlock.content.raw
						: reusableBlock.content;
				const rawBlockMatch = content.match( blockParserTokenizer );
				if ( rawBlockMatch ) {
					const [
						,
						,
						namespace = 'core/',
						blockName,
					] = rawBlockMatch;
					const referencedBlockType = getBlockType(
						namespace + blockName
					);
					if ( referencedBlockType ) {
						icon = referencedBlockType.icon;
					}
				}
			}

			const id = `core/block/${ reusableBlock.id }`;
			const { time, count = 0 } = getInsertUsage( state, id ) || {};
			const frecency = calculateFrecency( time, count );

			return {
				id,
				name: 'core/block',
				initialAttributes: { ref: reusableBlock.id },
				title: reusableBlock.title.raw,
				icon,
				category: 'reusable',
				keywords: [],
				isDisabled: false,
				utility: 1, // deprecated
				frecency,
			};
		};

		const blockTypeInserterItems = getBlockTypes()
			.filter( ( blockType ) =>
				canIncludeBlockTypeInInserter( state, blockType, rootClientId )
			)
			.map( buildBlockTypeInserterItem );

		const reusableBlockInserterItems = canInsertBlockTypeUnmemoized(
			state,
			'core/block',
			rootClientId
		)
			? getReusableBlocks( state ).map( buildReusableBlockInserterItem )
			: [];

		const items = blockTypeInserterItems.reduce( ( accumulator, item ) => {
			const { variations = [] } = item;
			// Exclude any block type item that is to be replaced by a default variation
			if ( ! variations.some( ( { isDefault } ) => isDefault ) ) {
				accumulator.push( item );
			}
			if ( variations.length ) {
				const variationMapper = getItemFromVariation( state, item );
				accumulator.push( ...variations.map( variationMapper ) );
			}
			return accumulator;
		}, [] );

		// Ensure core blocks are prioritized in the returned results,
		// because third party blocks can be registered earlier than
		// the core blocks (usually by using the `init` action),
		// thus affecting the display order.
		// We don't sort reusable blocks as they are handled differently.
		const groupByType = ( blocks, block ) => {
			const { core, noncore } = blocks;
			const type = block.name.startsWith( 'core/' ) ? core : noncore;

			type.push( block );
			return blocks;
		};
		const {
			core: coreItems,
			noncore: nonCoreItems,
		} = items.reduce( groupByType, { core: [], noncore: [] } );
		const sortedBlockTypes = [ ...coreItems, ...nonCoreItems ];
		return [ ...sortedBlockTypes, ...reusableBlockInserterItems ];
	},
	( state, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId,
		state.blocks.order,
		state.preferences.insertUsage,
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
		getReusableBlocks( state ),
		getBlockTypes(),
	]
);

/**
 * Determines the items that appear in the available block transforms list.
 *
 * Each item object contains what's necessary to display a menu item in the
 * transform list and handle its selection.
 *
 * The 'frecency' property is a heuristic (https://en.wikipedia.org/wiki/Frecency)
 * that combines block usage frequenty and recency.
 *
 * Items are returned ordered descendingly by their 'frecency'.
 *
 * @param    {Object}  state        Editor state.
 * @param    {?string} rootClientId Optional root client ID of block list.
 *
 * @return {WPEditorTransformItem[]} Items that appear in inserter.
 *
 * @typedef {Object} WPEditorTransformItem
 * @property {string}  id           Unique identifier for the item.
 * @property {string}  name         The type of block to create.
 * @property {string}  title        Title of the item, as it appears in the inserter.
 * @property {string}  icon         Dashicon for the item, as it appears in the inserter.
 * @property {boolean} isDisabled   Whether or not the user should be prevented from inserting
 *                                  this item.
 * @property {number}  frecency     Heuristic that combines frequency and recency.
 */
export const getBlockTransformItems = createSelector(
	( state, blocks, rootClientId = null ) => {
		const buildBlockTypeTransformItem = buildBlockTypeItem( state, {
			buildScope: 'transform',
		} );
		const blockTypeTransformItems = getBlockTypes()
			.filter( ( blockType ) =>
				canIncludeBlockTypeInInserter( state, blockType, rootClientId )
			)
			.map( buildBlockTypeTransformItem );

		const itemsByName = mapKeys(
			blockTypeTransformItems,
			( { name } ) => name
		);
		const possibleTransforms = getPossibleBlockTransformations(
			blocks
		).reduce( ( accumulator, block ) => {
			if ( itemsByName[ block?.name ] ) {
				accumulator.push( itemsByName[ block.name ] );
			}
			return accumulator;
		}, [] );
		const possibleBlockTransformations = orderBy(
			possibleTransforms,
			( block ) => itemsByName[ block.name ].frecency,
			'desc'
		);
		return possibleBlockTransformations;
	},
	( state, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId,
		state.preferences.insertUsage,
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
		getBlockTypes(),
	]
);

/**
 * Determines whether there are items to show in the inserter.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {boolean} Items that appear in inserter.
 */
export const hasInserterItems = createSelector(
	( state, rootClientId = null ) => {
		const hasBlockType = some( getBlockTypes(), ( blockType ) =>
			canIncludeBlockTypeInInserter( state, blockType, rootClientId )
		);
		if ( hasBlockType ) {
			return true;
		}
		const hasReusableBlock =
			canInsertBlockTypeUnmemoized( state, 'core/block', rootClientId ) &&
			getReusableBlocks( state ).length > 0;

		return hasReusableBlock;
	},
	( state, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId,
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
		getReusableBlocks( state ),
		getBlockTypes(),
	]
);

/**
 * Returns the list of allowed inserter blocks for inner blocks children
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {Array?} The list of allowed block types.
 */
export const __experimentalGetAllowedBlocks = createSelector(
	( state, rootClientId = null ) => {
		if ( ! rootClientId ) {
			return;
		}

		return filter( getBlockTypes(), ( blockType ) =>
			canIncludeBlockTypeInInserter( state, blockType, rootClientId )
		);
	},
	( state, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId,
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
		getBlockTypes(),
	]
);

/**
 * Returns the block to be directly inserted by the block appender.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional root client ID of block list.
 *
 * @return {?Array} The block type to be directly inserted.
 */
export const __experimentalGetDirectInsertBlock = createSelector(
	( state, rootClientId = null ) => {
		if ( ! rootClientId ) {
			return;
		}
		const defaultBlock =
			state.blockListSettings[ rootClientId ]?.__experimentalDefaultBlock;
		const directInsert =
			state.blockListSettings[ rootClientId ]?.__experimentalDirectInsert;
		if ( ! defaultBlock || ! directInsert ) {
			return;
		}
		if ( typeof directInsert === 'function' ) {
			return directInsert( getBlock( state, rootClientId ) )
				? defaultBlock
				: null;
		}
		return defaultBlock;
	},
	( state, rootClientId ) => [
		state.blockListSettings[ rootClientId ],
		state.blocks.tree[ rootClientId ],
	]
);

const checkAllowListRecursive = ( blocks, allowedBlockTypes ) => {
	if ( isBoolean( allowedBlockTypes ) ) {
		return allowedBlockTypes;
	}

	const blocksQueue = [ ...blocks ];
	while ( blocksQueue.length > 0 ) {
		const block = blocksQueue.shift();

		const isAllowed = checkAllowList(
			allowedBlockTypes,
			block.name || block.blockName,
			true
		);
		if ( ! isAllowed ) {
			return false;
		}

		block.innerBlocks?.forEach( ( innerBlock ) => {
			blocksQueue.push( innerBlock );
		} );
	}

	return true;
};

export const __experimentalGetParsedPattern = createSelector(
	( state, patternName ) => {
		const patterns = state.settings.__experimentalBlockPatterns;
		const pattern = patterns.find( ( { name } ) => name === patternName );
		if ( ! pattern ) {
			return null;
		}
		return {
			...pattern,
			blocks: parse( pattern.content ),
		};
	},
	( state ) => [ state.settings.__experimentalBlockPatterns ]
);

const getAllAllowedPatterns = createSelector(
	( state ) => {
		const patterns = state.settings.__experimentalBlockPatterns;
		const { allowedBlockTypes } = getSettings( state );
		const parsedPatterns = patterns
			.filter( ( { inserter = true } ) => !! inserter )
			.map( ( { name } ) =>
				__experimentalGetParsedPattern( state, name )
			);
		const allowedPatterns = parsedPatterns.filter( ( { blocks } ) =>
			checkAllowListRecursive( blocks, allowedBlockTypes )
		);
		return allowedPatterns;
	},
	( state ) => [
		state.settings.__experimentalBlockPatterns,
		state.settings.allowedBlockTypes,
	]
);

/**
 * Returns the list of allowed patterns for inner blocks children.
 *
 * @param {Object}  state        Editor state.
 * @param {?string} rootClientId Optional target root client ID.
 *
 * @return {Array?} The list of allowed patterns.
 */
export const __experimentalGetAllowedPatterns = createSelector(
	( state, rootClientId = null ) => {
		const availableParsedPatterns = getAllAllowedPatterns( state );
		const patternsAllowed = filter(
			availableParsedPatterns,
			( { blocks } ) =>
				blocks.every( ( { name } ) =>
					canInsertBlockType( state, name, rootClientId )
				)
		);

		return patternsAllowed;
	},
	( state, rootClientId ) => [
		state.settings.__experimentalBlockPatterns,
		state.settings.allowedBlockTypes,
		state.settings.templateLock,
		state.blockListSettings[ rootClientId ],
		state.blocks.byClientId[ rootClientId ],
	]
);

/**
 * Returns the list of patterns based on their declared `blockTypes`
 * and a block's name.
 * Patterns can use `blockTypes` to integrate in work flows like
 * suggesting appropriate patterns in a Placeholder state(during insertion)
 * or blocks transformations.
 *
 * @param {Object}          state        Editor state.
 * @param {string|string[]} blockNames   Block's name or array of block names to find matching pattens.
 * @param {?string}         rootClientId Optional target root client ID.
 *
 * @return {Array} The list of matched block patterns based on declared `blockTypes` and block name.
 */
export const __experimentalGetPatternsByBlockTypes = createSelector(
	( state, blockNames, rootClientId = null ) => {
		if ( ! blockNames ) return EMPTY_ARRAY;
		const patterns = __experimentalGetAllowedPatterns(
			state,
			rootClientId
		);
		const normalizedBlockNames = Array.isArray( blockNames )
			? blockNames
			: [ blockNames ];
		return patterns.filter( ( pattern ) =>
			pattern?.blockTypes?.some?.( ( blockName ) =>
				normalizedBlockNames.includes( blockName )
			)
		);
	},
	( state, rootClientId ) => [
		...__experimentalGetAllowedPatterns.getDependants(
			state,
			rootClientId
		),
	]
);

/**
 * Determines the items that appear in the available pattern transforms list.
 *
 * For now we only handle blocks without InnerBlocks and take into account
 * the `__experimentalRole` property of blocks' attributes for the transformation.
 *
 * We return the first set of possible eligible block patterns,
 * by checking the `blockTypes` property. We still have to recurse through
 * block pattern's blocks and try to find matches from the selected blocks.
 * Now this happens in the consumer to avoid heavy operations in the selector.
 *
 * @param {Object}   state        Editor state.
 * @param {Object[]} blocks       The selected blocks.
 * @param {?string}  rootClientId Optional root client ID of block list.
 *
 * @return {WPBlockPattern[]} Items that are eligible for a pattern transformation.
 */
export const __experimentalGetPatternTransformItems = createSelector(
	( state, blocks, rootClientId = null ) => {
		if ( ! blocks ) return EMPTY_ARRAY;
		/**
		 * For now we only handle blocks without InnerBlocks and take into account
		 * the `__experimentalRole` property of blocks' attributes for the transformation.
		 * Note that the blocks have been retrieved through `getBlock`, which doesn't
		 * return the inner blocks of an inner block controller, so we still need
		 * to check for this case too.
		 */
		if (
			blocks.some(
				( { clientId, innerBlocks } ) =>
					innerBlocks.length ||
					areInnerBlocksControlled( state, clientId )
			)
		) {
			return EMPTY_ARRAY;
		}

		// Create a Set of the selected block names that is used in patterns filtering.
		const selectedBlockNames = Array.from(
			new Set( blocks.map( ( { name } ) => name ) )
		);
		/**
		 * Here we will return first set of possible eligible block patterns,
		 * by checking the `blockTypes` property. We still have to recurse through
		 * block pattern's blocks and try to find matches from the selected blocks.
		 * Now this happens in the consumer to avoid heavy operations in the selector.
		 */
		return __experimentalGetPatternsByBlockTypes(
			state,
			selectedBlockNames,
			rootClientId
		);
	},
	( state, rootClientId ) => [
		...__experimentalGetPatternsByBlockTypes.getDependants(
			state,
			rootClientId
		),
	]
);

/**
 * Returns the Block List settings of a block, if any exist.
 *
 * @param {Object}  state    Editor state.
 * @param {?string} clientId Block client ID.
 *
 * @return {?Object} Block settings of the block if set.
 */
export function getBlockListSettings( state, clientId ) {
	return state.blockListSettings[ clientId ];
}

/**
 * Returns the editor settings.
 *
 * @param {Object} state Editor state.
 *
 * @return {Object} The editor settings object.
 */
export function getSettings( state ) {
	return state.settings;
}

/**
 * Returns true if the most recent block change is be considered persistent, or
 * false otherwise. A persistent change is one committed by BlockEditorProvider
 * via its `onChange` callback, in addition to `onInput`.
 *
 * @param {Object} state Block editor state.
 *
 * @return {boolean} Whether the most recent block change was persistent.
 */
export function isLastBlockChangePersistent( state ) {
	return state.blocks.isPersistentChange;
}

/**
 * Returns the block list settings for an array of blocks, if any exist.
 *
 * @param {Object} state     Editor state.
 * @param {Array}  clientIds Block client IDs.
 *
 * @return {Object} An object where the keys are client ids and the values are
 *                  a block list setting object.
 */
export const __experimentalGetBlockListSettingsForBlocks = createSelector(
	( state, clientIds = [] ) => {
		return clientIds.reduce( ( blockListSettingsForBlocks, clientId ) => {
			if ( ! state.blockListSettings[ clientId ] ) {
				return blockListSettingsForBlocks;
			}

			return {
				...blockListSettingsForBlocks,
				[ clientId ]: state.blockListSettings[ clientId ],
			};
		}, {} );
	},
	( state ) => [ state.blockListSettings ]
);

/**
 * Returns the title of a given reusable block
 *
 * @param {Object}        state Global application state.
 * @param {number|string} ref   The shared block's ID.
 *
 * @return {string} The reusable block saved title.
 */
export const __experimentalGetReusableBlockTitle = createSelector(
	( state, ref ) => {
		const reusableBlock = find(
			getReusableBlocks( state ),
			( block ) => block.id === ref
		);
		if ( ! reusableBlock ) {
			return null;
		}

		return reusableBlock.title?.raw;
	},
	( state ) => [ getReusableBlocks( state ) ]
);

/**
 * Returns true if the most recent block change is be considered ignored, or
 * false otherwise. An ignored change is one not to be committed by
 * BlockEditorProvider, neither via `onChange` nor `onInput`.
 *
 * @param {Object} state Block editor state.
 *
 * @return {boolean} Whether the most recent block change was ignored.
 */
export function __unstableIsLastBlockChangeIgnored( state ) {
	// TODO: Removal Plan: Changes incurred by RECEIVE_BLOCKS should not be
	// ignored if in-fact they result in a change in blocks state. The current
	// need to ignore changes not a result of user interaction should be
	// accounted for in the refactoring of reusable blocks as occurring within
	// their own separate block editor / state (#7119).
	return state.blocks.isIgnoredChange;
}

/**
 * Returns the block attributes changed as a result of the last dispatched
 * action.
 *
 * @param {Object} state Block editor state.
 *
 * @return {Object<string,Object>} Subsets of block attributes changed, keyed
 *                                 by block client ID.
 */
export function __experimentalGetLastBlockAttributeChanges( state ) {
	return state.lastBlockAttributesChange;
}

/**
 * Returns the available reusable blocks
 *
 * @param {Object} state Global application state.
 *
 * @return {Array} Reusable blocks
 */
function getReusableBlocks( state ) {
	return state?.settings?.__experimentalReusableBlocks ?? EMPTY_ARRAY;
}

/**
 * Returns whether the navigation mode is enabled.
 *
 * @param {Object} state Editor state.
 *
 * @return {boolean} Is navigation mode enabled.
 */
export function isNavigationMode( state ) {
	return state.isNavigationMode;
}

/**
 * Returns whether block moving mode is enabled.
 *
 * @param {Object} state Editor state.
 *
 * @return {string} Client Id of moving block.
 */
export function hasBlockMovingClientId( state ) {
	return state.hasBlockMovingClientId;
}

/**
 * Returns true if the last change was an automatic change, false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the last change was automatic.
 */
export function didAutomaticChange( state ) {
	return !! state.automaticChangeStatus;
}

/**
 * Returns true if the current highlighted block matches the block clientId.
 *
 * @param {Object} state    Global application state.
 * @param {string} clientId The block to check.
 *
 * @return {boolean} Whether the block is currently highlighted.
 */
export function isBlockHighlighted( state, clientId ) {
	return state.highlightedBlock === clientId;
}

/**
 * Checks if a given block has controlled inner blocks.
 *
 * @param {Object} state    Global application state.
 * @param {string} clientId The block to check.
 *
 * @return {boolean} True if the block has controlled inner blocks.
 */
export function areInnerBlocksControlled( state, clientId ) {
	return !! state.blocks.controlledInnerBlocks[ clientId ];
}

/**
 * Returns the clientId for the first 'active' block of a given array of block names.
 * A block is 'active' if it (or a child) is the selected block.
 * Returns the first match moving up the DOM from the selected block.
 *
 * @param {Object}   state            Global application state.
 * @param {string[]} validBlocksNames The names of block types to check for.
 *
 * @return {string} The matching block's clientId.
 */
export const __experimentalGetActiveBlockIdByBlockNames = createSelector(
	( state, validBlockNames ) => {
		if ( ! validBlockNames.length ) {
			return null;
		}
		// Check if selected block is a valid entity area.
		const selectedBlockClientId = getSelectedBlockClientId( state );
		if (
			validBlockNames.includes(
				getBlockName( state, selectedBlockClientId )
			)
		) {
			return selectedBlockClientId;
		}
		// Check if first selected block is a child of a valid entity area.
		const multiSelectedBlockClientIds = getMultiSelectedBlockClientIds(
			state
		);
		const entityAreaParents = getBlockParentsByBlockName(
			state,
			selectedBlockClientId || multiSelectedBlockClientIds[ 0 ],
			validBlockNames
		);
		if ( entityAreaParents ) {
			// Last parent closest/most interior.
			return last( entityAreaParents );
		}
		return null;
	},
	( state, validBlockNames ) => [
		state.selection.selectionStart.clientId,
		state.selection.selectionEnd.clientId,
		validBlockNames,
	]
);

/**
 * Tells if the block with the passed clientId was just inserted.
 *
 * @param {Object}  state    Global application state.
 * @param {Object}  clientId Client Id of the block.
 * @param {?string} source   Optional insertion source of the block.
 * @return {boolean} True if the block matches the last block inserted from the specified source.
 */
export function wasBlockJustInserted( state, clientId, source ) {
	const { lastBlockInserted } = state;
	return (
		lastBlockInserted.clientId === clientId &&
		lastBlockInserted.source === source
	);
}
