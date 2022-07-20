/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import { store as blockEditorStore } from '../../store';
import { createInserterSection, filterInserterItems } from './utils';

function ReusableBlocksTab( { onSelect, rootClientId, listProps } ) {
	const { items } = useSelect(
		( select ) => {
			const { getInserterItems } = select( blockEditorStore );
			const allItems = getInserterItems( rootClientId );

			return {
				items: filterInserterItems( allItems, { onlyReusable: true } ),
			};
		},
		[ rootClientId ]
	);

	const sections = [ createInserterSection( { key: 'reuseable', items } ) ];

	return (
		<BlockTypesList
			name="ReusableBlocks"
			sections={ sections }
			onSelect={ onSelect }
			listProps={ listProps }
		/>
	);
}

export default ReusableBlocksTab;
