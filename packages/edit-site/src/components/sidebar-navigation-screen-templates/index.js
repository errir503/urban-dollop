/**
 * WordPress dependencies
 */
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import { useLink } from '../routes/link';
import SidebarNavigationItem from '../sidebar-navigation-item';
import AddNewTemplate from '../add-new-template';

const config = {
	wp_template: {
		path: '/templates',
		labels: {
			title: __( 'Templates' ),
			loading: __( 'Loading templates' ),
			notFound: __( 'No templates found' ),
			manage: __( 'Manage all templates' ),
		},
	},
	wp_template_part: {
		path: '/template-parts',
		labels: {
			title: __( 'Template parts' ),
			loading: __( 'Loading template parts' ),
			notFound: __( 'No template parts found' ),
			manage: __( 'Manage all template parts' ),
		},
	},
};

const TemplateItem = ( { postType, postId, ...props } ) => {
	const linkInfo = useLink( {
		postType,
		postId,
		path: config[ postType ].path + '/single',
	} );
	return <SidebarNavigationItem { ...linkInfo } { ...props } />;
};

export default function SidebarNavigationScreenTemplates( {
	postType = 'wp_template',
} ) {
	const isMobileViewport = useViewportMatch( 'medium', '<' );

	const { records: templates, isResolving: isLoading } = useEntityRecords(
		'postType',
		postType,
		{
			per_page: -1,
		}
	);

	const browseAllLink = useLink( {
		postType,
		postId: undefined,
		path: config[ postType ].path + '/all',
	} );

	return (
		<SidebarNavigationScreen
			path={ config[ postType ].path }
			title={ config[ postType ].labels.title }
			actions={
				! isMobileViewport && (
					<AddNewTemplate
						templateType={ postType }
						toggleProps={ {
							className:
								'edit-site-sidebar-navigation-screen-templates__add-button',
						} }
					/>
				)
			}
			content={
				<>
					{ isLoading && config[ postType ].labels.loading }
					{ ! isLoading && (
						<ItemGroup>
							{ ! templates?.length && (
								<Item>
									{ config[ postType ].labels.notFound }
								</Item>
							) }
							{ ( templates ?? [] ).map( ( template ) => (
								<TemplateItem
									postType={ postType }
									postId={ template.id }
									key={ template.id }
								>
									{ decodeEntities(
										template.title?.rendered ||
											template.slug
									) }
								</TemplateItem>
							) ) }
							{ ! isMobileViewport && (
								<SidebarNavigationItem
									className="edit-site-sidebar-navigation-screen-templates__see-all"
									{ ...browseAllLink }
									children={
										config[ postType ].labels.manage
									}
								/>
							) }
						</ItemGroup>
					) }
				</>
			}
		/>
	);
}
