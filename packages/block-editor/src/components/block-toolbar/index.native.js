/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockControls from '../block-controls';
import UngroupButton from '../ungroup-button';
import { store as blockEditorStore } from '../../store';

export default function BlockToolbar() {
	const { blockClientIds, isValid, mode } = useSelect( ( select ) => {
		const { getBlockMode, getSelectedBlockClientIds, isBlockValid } =
			select( blockEditorStore );
		const selectedBlockClientIds = getSelectedBlockClientIds();

		return {
			blockClientIds: selectedBlockClientIds,
			isValid:
				selectedBlockClientIds.length === 1
					? isBlockValid( selectedBlockClientIds[ 0 ] )
					: null,
			mode:
				selectedBlockClientIds.length === 1
					? getBlockMode( selectedBlockClientIds[ 0 ] )
					: null,
		};
	}, [] );

	if ( blockClientIds.length === 0 ) {
		return null;
	}

	return (
		<>
			{ mode === 'visual' && isValid && (
				<>
					<UngroupButton />
					<BlockControls.Slot group="block" />
					<BlockControls.Slot />
					<BlockControls.Slot group="inline" />
					<BlockControls.Slot group="other" />
				</>
			) }
		</>
	);
}
