/**
 * WordPress dependencies
 */
import { useLayoutEffect, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';

/**
 * This hook is a side effect which updates the block-editor store when changes
 * happen to inner block settings. The given props are transformed into a
 * settings object, and if that is different from the current settings object in
 * the block-editor store, then the store is updated with the new settings which
 * came from props.
 *
 * @param {string}   clientId        The client ID of the block to update.
 * @param {string[]} allowedBlocks   An array of block names which are permitted
 *                                   in inner blocks.
 * @param {string}   [templateLock]  The template lock specified for the inner
 *                                   blocks component. (e.g. "all")
 * @param {boolean}  captureToolbars Whether or children toolbars should be shown
 *                                   in the inner blocks component rather than on
 *                                   the child block.
 * @param {string}   orientation     The direction in which the block
 *                                   should face.
 */
export default function useNestedSettingsUpdate(
	clientId,
	allowedBlocks,
	templateLock,
	captureToolbars,
	orientation
) {
	const { updateBlockListSettings } = useDispatch( blockEditorStore );

	const { blockListSettings, parentLock } = useSelect(
		( select ) => {
			const rootClientId = select(
				blockEditorStore
			).getBlockRootClientId( clientId );
			return {
				blockListSettings: select(
					blockEditorStore
				).getBlockListSettings( clientId ),
				parentLock: select( blockEditorStore ).getTemplateLock(
					rootClientId
				),
			};
		},
		[ clientId ]
	);

	// Memoize as inner blocks implementors often pass a new array on every
	// render.
	const _allowedBlocks = useMemo( () => allowedBlocks, allowedBlocks );

	useLayoutEffect( () => {
		const newSettings = {
			allowedBlocks: _allowedBlocks,
			templateLock:
				templateLock === undefined ? parentLock : templateLock,
		};

		// These values are not defined for RN, so only include them if they
		// are defined.
		if ( captureToolbars !== undefined ) {
			newSettings.__experimentalCaptureToolbars = captureToolbars;
		}

		if ( orientation !== undefined ) {
			newSettings.orientation = orientation;
		}

		if ( ! isShallowEqual( blockListSettings, newSettings ) ) {
			updateBlockListSettings( clientId, newSettings );
		}
	}, [
		clientId,
		blockListSettings,
		_allowedBlocks,
		templateLock,
		parentLock,
		captureToolbars,
		orientation,
		updateBlockListSettings,
	] );
}
