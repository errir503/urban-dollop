/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import InserterPanel from './panel';
import InserterNoResults from './no-results';
import useBlockTypesState from './hooks/use-block-types-state';
import ReusableBlocksRenameHint from './reusable-block-rename-hint';

function ReusableBlocksList( { onHover, onInsert, rootClientId } ) {
	const [ items, , , onSelectItem ] = useBlockTypesState(
		rootClientId,
		onInsert
	);

	const filteredItems = useMemo( () => {
		return items.filter(
			( { category, syncStatus } ) =>
				category === 'reusable' && syncStatus !== 'unsynced'
		);
	}, [ items ] );

	if ( filteredItems.length === 0 ) {
		return <InserterNoResults />;
	}

	return (
		<InserterPanel title={ __( 'Synced patterns' ) }>
			<BlockTypesList
				items={ filteredItems }
				onSelect={ onSelectItem }
				onHover={ onHover }
				label={ __( 'Synced patterns' ) }
			/>
		</InserterPanel>
	);
}

// The unwrapped component is only exported for use by unit tests.
/**
 * List of reusable blocks shown in the "Reusable" tab of the inserter.
 *
 * @param {Object}   props              Component props.
 * @param {?string}  props.rootClientId Client id of block to insert into.
 * @param {Function} props.onInsert     Callback to run when item is inserted.
 * @param {Function} props.onHover      Callback to run when item is hovered.
 *
 * @return {WPComponent} The component.
 */
export function ReusableBlocksTab( { rootClientId, onInsert, onHover } ) {
	return (
		<>
			<div className="block-editor-inserter__hint">
				<ReusableBlocksRenameHint />
			</div>
			<ReusableBlocksList
				onHover={ onHover }
				onInsert={ onInsert }
				rootClientId={ rootClientId }
			/>
			<div className="block-editor-inserter__manage-reusable-blocks-container">
				<Button
					className="block-editor-inserter__manage-reusable-blocks"
					variant="secondary"
					href={ addQueryArgs( 'edit.php', {
						post_type: 'wp_block',
					} ) }
				>
					{ __( 'Manage my patterns' ) }
				</Button>
			</div>
		</>
	);
}

export default ReusableBlocksTab;
