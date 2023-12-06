/**
 * WordPress dependencies
 */
import { useDispatch, useRegistry } from '@wordpress/data';
import { MenuGroup } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { displayShortcut } from '@wordpress/keycodes';
import {
	PreferenceToggleMenuItem,
	store as preferencesStore,
} from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import { store as postEditorStore } from '../../../store';

function WritingMenu() {
	const registry = useRegistry();

	const { setIsInserterOpened, setIsListViewOpened, closeGeneralSidebar } =
		useDispatch( postEditorStore );
	const { set: setPreference } = useDispatch( preferencesStore );

	const toggleDistractionFree = () => {
		registry.batch( () => {
			setPreference( 'core/edit-post', 'fixedToolbar', true );
			setIsInserterOpened( false );
			setIsListViewOpened( false );
			closeGeneralSidebar();
		} );
	};

	const turnOffDistractionFree = () => {
		setPreference( 'core/edit-post', 'distractionFree', false );
	};

	const isLargeViewport = useViewportMatch( 'medium' );
	if ( ! isLargeViewport ) {
		return null;
	}

	return (
		<MenuGroup label={ _x( 'View', 'noun' ) }>
			<PreferenceToggleMenuItem
				scope="core/edit-post"
				name="fixedToolbar"
				onToggle={ turnOffDistractionFree }
				label={ __( 'Top toolbar' ) }
				info={ __(
					'Access all block and document tools in a single place'
				) }
				messageActivated={ __( 'Top toolbar activated' ) }
				messageDeactivated={ __( 'Top toolbar deactivated' ) }
			/>
			<PreferenceToggleMenuItem
				scope="core/edit-post"
				name="distractionFree"
				onToggle={ toggleDistractionFree }
				label={ __( 'Distraction free' ) }
				info={ __( 'Write with calmness' ) }
				messageActivated={ __( 'Distraction free mode activated' ) }
				messageDeactivated={ __( 'Distraction free mode deactivated' ) }
				shortcut={ displayShortcut.primaryShift( '\\' ) }
			/>
			<PreferenceToggleMenuItem
				scope="core/edit-post"
				name="focusMode"
				label={ __( 'Spotlight mode' ) }
				info={ __( 'Focus on one block at a time' ) }
				messageActivated={ __( 'Spotlight mode activated' ) }
				messageDeactivated={ __( 'Spotlight mode deactivated' ) }
			/>
			<PreferenceToggleMenuItem
				scope="core/edit-post"
				name="fullscreenMode"
				label={ __( 'Fullscreen mode' ) }
				info={ __( 'Show and hide admin UI' ) }
				messageActivated={ __( 'Fullscreen mode activated' ) }
				messageDeactivated={ __( 'Fullscreen mode deactivated' ) }
				shortcut={ displayShortcut.secondary( 'f' ) }
			/>
		</MenuGroup>
	);
}

export default WritingMenu;
