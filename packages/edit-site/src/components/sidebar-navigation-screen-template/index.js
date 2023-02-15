/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import useEditedEntityRecord from '../use-edited-entity-record';
import { unlock } from '../../private-apis';
import { store as editSiteStore } from '../../store';

const config = {
	wp_template: {
		path: '/templates/single',
	},
	wp_template_part: {
		path: '/template-parts/single',
	},
};

export default function SidebarNavigationScreenTemplate( {
	postType = 'wp_template',
} ) {
	const { setCanvasMode } = unlock( useDispatch( editSiteStore ) );
	const { getDescription, getTitle, record } = useEditedEntityRecord();
	let description = getDescription();
	if ( ! description && record.is_custom ) {
		description = __(
			'This is a custom template that can be applied manually to any Post or Page.'
		);
	}

	return (
		<SidebarNavigationScreen
			path={ config[ postType ].path }
			title={ getTitle() }
			actions={
				<Button
					variant="primary"
					onClick={ () => setCanvasMode( 'edit' ) }
				>
					{ __( 'Edit' ) }
				</Button>
			}
			content={ description ? <p>{ description }</p> : undefined }
		/>
	);
}
