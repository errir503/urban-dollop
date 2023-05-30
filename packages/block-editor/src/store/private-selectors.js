/**
 * External dependencies
 */
import createSelector from 'rememo';

/**
 * WordPress dependencies
 */
import { createRegistrySelector } from '@wordpress/data';
import { store as blocksStore } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	getBlockRootClientId,
	getTemplateLock,
	getBlockName,
} from './selectors';

/**
 * Returns true if the block interface is hidden, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the block toolbar is hidden.
 */
export function isBlockInterfaceHidden( state ) {
	return state.isBlockInterfaceHidden;
}

/**
 * Gets the client ids of the last inserted blocks.
 *
 * @param {Object} state Global application state.
 * @return {Array|undefined} Client Ids of the last inserted block(s).
 */
export function getLastInsertedBlocksClientIds( state ) {
	return state?.lastBlockInserted?.clientIds;
}

/**
 * @typedef {import('../components/block-editing-mode').BlockEditingMode} BlockEditingMode
 */

/**
 * Returns the block editing mode for a given block.
 *
 * The mode can be one of three options:
 *
 * - `'disabled'`: Prevents editing the block entirely, i.e. it cannot be
 *   selected.
 * - `'contentOnly'`: Hides all non-content UI, e.g. auxiliary controls in the
 *   toolbar, the block movers, block settings.
 * - `'default'`: Allows editing the block as normal.
 *
 * Blocks can set a mode using the `useBlockEditingMode` hook.
 *
 * The mode is inherited by all of the block's inner blocks, unless they have
 * their own mode.
 *
 * A template lock can also set a mode. If the template lock is `'contentOnly'`,
 * the block's mode is overridden to `'contentOnly'` if the block has a content
 * role attribute, or `'disabled'` otherwise.
 *
 * @see useBlockEditingMode
 *
 * @param {Object} state    Global application state.
 * @param {string} clientId The block client ID, or `''` for the root container.
 *
 * @return {BlockEditingMode} The block editing mode. One of `'disabled'`,
 *                            `'contentOnly'`, or `'default'`.
 */
export const getBlockEditingMode = createRegistrySelector(
	( select ) =>
		( state, clientId = '' ) => {
			const explicitEditingMode = getExplcitBlockEditingMode(
				state,
				clientId
			);
			const rootClientId = getBlockRootClientId( state, clientId );
			const templateLock = getTemplateLock( state, rootClientId );
			const name = getBlockName( state, clientId );
			const isContent =
				select( blocksStore ).__experimentalHasContentRoleAttribute(
					name
				);
			if (
				explicitEditingMode === 'disabled' ||
				( templateLock === 'contentOnly' && ! isContent )
			) {
				return 'disabled';
			}
			if (
				explicitEditingMode === 'contentOnly' ||
				( templateLock === 'contentOnly' && isContent )
			) {
				return 'contentOnly';
			}
			return 'default';
		}
);

const getExplcitBlockEditingMode = createSelector(
	( state, clientId = '' ) => {
		while (
			! state.blockEditingModes.has( clientId ) &&
			state.blocks.parents.has( clientId )
		) {
			clientId = state.blocks.parents.get( clientId );
		}
		return state.blockEditingModes.get( clientId ) ?? 'default';
	},
	( state ) => [ state.blockEditingModes, state.blocks.parents ]
);
