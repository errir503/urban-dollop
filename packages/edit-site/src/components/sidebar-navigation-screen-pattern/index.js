/**
 * WordPress dependencies
 */
import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { pencil } from '@wordpress/icons';
import { getQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import SidebarButton from '../sidebar-button';
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import useInitEditedEntityFromURL from '../sync-state-with-url/use-init-edited-entity-from-url';
import usePatternDetails from './use-pattern-details';
import { store as editSiteStore } from '../../store';
import { unlock } from '../../lock-unlock';

export default function SidebarNavigationScreenPattern() {
	const { params } = useNavigator();
	const { categoryType } = getQueryArgs( window.location.href );
	const { postType, postId } = params;
	const { setCanvasMode } = unlock( useDispatch( editSiteStore ) );

	useInitEditedEntityFromURL();

	const patternDetails = usePatternDetails( postType, postId );

	// The absence of a category type in the query params for template parts
	// indicates the user has arrived at the template part via the "manage all"
	// page and the back button should return them to that list page.
	const backPath =
		! categoryType && postType === 'wp_template_part'
			? '/wp_template_part/all'
			: '/patterns';

	return (
		<SidebarNavigationScreen
			actions={
				<SidebarButton
					onClick={ () => setCanvasMode( 'edit' ) }
					label={ __( 'Edit' ) }
					icon={ pencil }
				/>
			}
			backPath={ backPath }
			{ ...patternDetails }
		/>
	);
}
