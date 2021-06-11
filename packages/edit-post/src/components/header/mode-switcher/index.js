/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuItemsChoice, MenuGroup } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

/**
 * Set of available mode options.
 *
 * @type {Array}
 */
const MODES = [
	{
		value: 'visual',
		label: __( 'Visual editor' ),
	},
	{
		value: 'text',
		label: __( 'Code editor' ),
	},
];

function ModeSwitcher() {
	const {
		shortcut,
		isRichEditingEnabled,
		isCodeEditingEnabled,
		mode,
	} = useSelect(
		( select ) => ( {
			shortcut: select(
				keyboardShortcutsStore
			).getShortcutRepresentation( 'core/edit-post/toggle-mode' ),
			isRichEditingEnabled: select( 'core/editor' ).getEditorSettings()
				.richEditingEnabled,
			isCodeEditingEnabled: select( 'core/editor' ).getEditorSettings()
				.codeEditingEnabled,
			mode: select( editPostStore ).getEditorMode(),
		} ),
		[]
	);
	const { switchEditorMode } = useDispatch( editPostStore );

	if ( ! isRichEditingEnabled || ! isCodeEditingEnabled ) {
		return null;
	}

	const choices = MODES.map( ( choice ) => {
		if ( choice.value !== mode ) {
			return { ...choice, shortcut };
		}
		return choice;
	} );

	return (
		<MenuGroup label={ __( 'Editor' ) }>
			<MenuItemsChoice
				choices={ choices }
				value={ mode }
				onSelect={ switchEditorMode }
			/>
		</MenuGroup>
	);
}

export default ModeSwitcher;
