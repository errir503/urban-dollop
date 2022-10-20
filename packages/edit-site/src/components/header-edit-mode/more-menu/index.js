/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { useReducer } from '@wordpress/element';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { displayShortcut } from '@wordpress/keycodes';
import { external } from '@wordpress/icons';
import { MenuGroup, MenuItem, VisuallyHidden } from '@wordpress/components';
import { ActionItem, MoreMenuDropdown } from '@wordpress/interface';
import { PreferenceToggleMenuItem } from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import KeyboardShortcutHelpModal from '../../keyboard-shortcut-help-modal';
import EditSitePreferencesModal from '../../preferences-modal';
import ToolsMoreMenuGroup from '../tools-more-menu-group';
import SiteExport from './site-export';
import WelcomeGuideMenuItem from './welcome-guide-menu-item';
import CopyContentMenuItem from './copy-content-menu-item';
import ModeSwitcher from '../mode-switcher';

export default function MoreMenu( { showIconLabels } ) {
	const [ isModalActive, toggleModal ] = useReducer(
		( isActive ) => ! isActive,
		false
	);

	const [ isPreferencesModalActive, togglePreferencesModal ] = useReducer(
		( isActive ) => ! isActive,
		false
	);

	useShortcut( 'core/edit-site/keyboard-shortcuts', toggleModal );

	return (
		<>
			<MoreMenuDropdown
				toggleProps={ {
					showTooltip: ! showIconLabels,
					...( showIconLabels && { variant: 'tertiary' } ),
				} }
			>
				{ ( { onClose } ) => (
					<>
						<MenuGroup label={ _x( 'View', 'noun' ) }>
							<PreferenceToggleMenuItem
								scope="core/edit-site"
								name="fixedToolbar"
								label={ __( 'Top toolbar' ) }
								info={ __(
									'Access all block and document tools in a single place'
								) }
								messageActivated={ __(
									'Top toolbar activated'
								) }
								messageDeactivated={ __(
									'Top toolbar deactivated'
								) }
							/>
							<PreferenceToggleMenuItem
								scope="core/edit-site"
								name="focusMode"
								label={ __( 'Spotlight mode' ) }
								info={ __( 'Focus on one block at a time' ) }
								messageActivated={ __(
									'Spotlight mode activated'
								) }
								messageDeactivated={ __(
									'Spotlight mode deactivated'
								) }
							/>
							<ModeSwitcher />
							<ActionItem.Slot
								name="core/edit-site/plugin-more-menu"
								label={ __( 'Plugins' ) }
								as={ MenuGroup }
								fillProps={ { onClick: onClose } }
							/>
						</MenuGroup>
						<MenuGroup label={ __( 'Tools' ) }>
							<SiteExport />
							<MenuItem
								onClick={ toggleModal }
								shortcut={ displayShortcut.access( 'h' ) }
							>
								{ __( 'Keyboard shortcuts' ) }
							</MenuItem>
							<WelcomeGuideMenuItem />
							<CopyContentMenuItem />
							<MenuItem
								icon={ external }
								role="menuitem"
								href={ __(
									'https://wordpress.org/support/article/site-editor/'
								) }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ __( 'Help' ) }
								<VisuallyHidden as="span">
									{
										/* translators: accessibility text */
										__( '(opens in a new tab)' )
									}
								</VisuallyHidden>
							</MenuItem>
							<ToolsMoreMenuGroup.Slot
								fillProps={ { onClose } }
							/>
						</MenuGroup>
						<MenuGroup>
							<MenuItem onClick={ togglePreferencesModal }>
								{ __( 'Preferences' ) }
							</MenuItem>
						</MenuGroup>
					</>
				) }
			</MoreMenuDropdown>
			<KeyboardShortcutHelpModal
				isModalActive={ isModalActive }
				toggleModal={ toggleModal }
			/>
			<EditSitePreferencesModal
				isModalActive={ isPreferencesModalActive }
				toggleModal={ togglePreferencesModal }
			/>
		</>
	);
}
