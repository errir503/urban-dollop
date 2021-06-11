/**
 * Internal dependencies
 */
import {
	iterateDescendants,
	iteratePath,
	hasConflictingLock,
	getNode,
} from './utils';

export function __unstableGetPendingLockRequests( state ) {
	return state.locks.requests;
}

export function __unstableIsLockAvailable( state, store, path, { exclusive } ) {
	const storePath = [ store, ...path ];
	const locks = state.locks.tree;

	// Validate all parents and the node itself
	for ( const node of iteratePath( locks, storePath ) ) {
		if ( hasConflictingLock( { exclusive }, node.locks ) ) {
			return false;
		}
	}

	// iteratePath terminates early if path is unreachable, let's
	// re-fetch the node and check it exists in the tree.
	const node = getNode( locks, storePath );
	if ( ! node ) {
		return true;
	}

	// Validate all nested nodes
	for ( const descendant of iterateDescendants( node ) ) {
		if ( hasConflictingLock( { exclusive }, descendant.locks ) ) {
			return false;
		}
	}

	return true;
}
