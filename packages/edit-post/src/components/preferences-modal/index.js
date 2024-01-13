/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { privateApis as preferencesPrivateApis } from '@wordpress/preferences';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import MetaBoxesSection from './meta-boxes-section';
import EnablePublishSidebarOption from './enable-publish-sidebar';

const { PreferencesModalSection, PreferenceToggleControl } = unlock(
	preferencesPrivateApis
);
const { PreferencesModal } = unlock( editorPrivateApis );

export const PREFERENCES_MODAL_NAME = 'edit-post/preferences';

export default function EditPostPreferencesModal() {
	const isLargeViewport = useViewportMatch( 'medium' );
	const { closeModal } = useDispatch( interfaceStore );
	const { isModalActive } = useSelect( ( select ) => {
		const modalActive = select( interfaceStore ).isModalActive(
			PREFERENCES_MODAL_NAME
		);
		return {
			isModalActive: modalActive,
		};
	}, [] );

	const extraSections = {
		general: (
			<>
				{ isLargeViewport && (
					<PreferencesModalSection title={ __( 'Publishing' ) }>
						<EnablePublishSidebarOption
							help={ __(
								'Review settings, such as visibility and tags.'
							) }
							label={ __( 'Enable pre-publish checks' ) }
						/>
					</PreferencesModalSection>
				) }
				<MetaBoxesSection title={ __( 'Advanced' ) } />
			</>
		),
		appearance: (
			<PreferenceToggleControl
				scope="core/edit-post"
				featureName="themeStyles"
				help={ __( 'Make the editor look like your theme.' ) }
				label={ __( 'Use theme styles' ) }
			/>
		),
	};

	if ( ! isModalActive ) {
		return null;
	}

	return (
		<PreferencesModal
			extraSections={ extraSections }
			isActive={ isModalActive }
			onClose={ closeModal }
		/>
	);
}
