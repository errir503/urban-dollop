/**
 * WordPress dependencies
 */
import { useMemo, useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { useInstanceId } from '@wordpress/compose';
import { CheckboxControl } from '@wordpress/components';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import BlockTypesChecklist from './checklist';
import { store as editPostStore } from '../../store';

function BlockManagerCategory( { title, blockTypes } ) {
	const instanceId = useInstanceId( BlockManagerCategory );
	const { defaultAllowedBlockTypes, hiddenBlockTypes } = useSelect(
		( select ) => {
			const { getEditorSettings } = select( editorStore );
			const { getHiddenBlockTypes } = select( editPostStore );
			return {
				defaultAllowedBlockTypes:
					getEditorSettings().defaultAllowedBlockTypes,
				hiddenBlockTypes: getHiddenBlockTypes(),
			};
		},
		[]
	);
	const filteredBlockTypes = useMemo( () => {
		if ( defaultAllowedBlockTypes === true ) {
			return blockTypes;
		}
		return blockTypes.filter( ( { name } ) => {
			return defaultAllowedBlockTypes?.includes( name );
		} );
	}, [ defaultAllowedBlockTypes, blockTypes ] );
	const { showBlockTypes, hideBlockTypes } = useDispatch( editPostStore );
	const toggleVisible = useCallback( ( blockName, nextIsChecked ) => {
		if ( nextIsChecked ) {
			showBlockTypes( blockName );
		} else {
			hideBlockTypes( blockName );
		}
	}, [] );
	const toggleAllVisible = useCallback(
		( nextIsChecked ) => {
			const blockNames = blockTypes.map( ( { name } ) => name );
			if ( nextIsChecked ) {
				showBlockTypes( blockNames );
			} else {
				hideBlockTypes( blockNames );
			}
		},
		[ blockTypes ]
	);

	if ( ! filteredBlockTypes.length ) {
		return null;
	}

	const checkedBlockNames = filteredBlockTypes
		.map( ( { name } ) => name )
		.filter( ( type ) => ! hiddenBlockTypes.includes( type ) );

	const titleId = 'edit-post-block-manager__category-title-' + instanceId;

	const isAllChecked = checkedBlockNames.length === filteredBlockTypes.length;
	const isIndeterminate = ! isAllChecked && checkedBlockNames.length > 0;

	return (
		<div
			role="group"
			aria-labelledby={ titleId }
			className="edit-post-block-manager__category"
		>
			<CheckboxControl
				__nextHasNoMarginBottom
				checked={ isAllChecked }
				onChange={ toggleAllVisible }
				className="edit-post-block-manager__category-title"
				indeterminate={ isIndeterminate }
				label={ <span id={ titleId }>{ title }</span> }
			/>
			<BlockTypesChecklist
				blockTypes={ filteredBlockTypes }
				value={ checkedBlockNames }
				onItemChange={ toggleVisible }
			/>
		</div>
	);
}

export default BlockManagerCategory;
