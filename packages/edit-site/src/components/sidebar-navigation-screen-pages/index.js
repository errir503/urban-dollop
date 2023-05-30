/**
 * WordPress dependencies
 */
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalTruncate as Truncate,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords, store as coreStore } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { layout, page, home, loop } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import { useLink } from '../routes/link';
import SidebarNavigationItem from '../sidebar-navigation-item';

const PageItem = ( { postType = 'page', postId, ...props } ) => {
	const linkInfo = useLink( {
		postType,
		postId,
	} );
	return <SidebarNavigationItem { ...linkInfo } { ...props } />;
};

export default function SidebarNavigationScreenPages() {
	const { records: pages, isResolving: isLoadingPages } = useEntityRecords(
		'postType',
		'page',
		{
			status: 'any',
			per_page: -1,
		}
	);
	const { records: templates, isResolving: isLoadingTemplates } =
		useEntityRecords( 'postType', 'wp_template', {
			per_page: -1,
		} );

	const dynamicPageTemplates = templates?.filter( ( { slug } ) =>
		[ '404', 'search' ].includes( slug )
	);

	const homeTemplate =
		templates?.find( ( template ) => template.slug === 'front-page' ) ||
		templates?.find( ( template ) => template.slug === 'home' ) ||
		templates?.find( ( template ) => template.slug === 'index' );

	const pagesAndTemplates = pages?.concat( dynamicPageTemplates, [
		homeTemplate,
	] );

	const { frontPage, postsPage } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );

		const siteSettings = getEntityRecord( 'root', 'site' );
		return {
			frontPage: siteSettings?.page_on_front,
			postsPage: siteSettings?.page_for_posts,
		};
	}, [] );

	const isHomePageBlog = frontPage === postsPage;

	const reorderedPages = pages && [ ...pages ];

	if ( ! isHomePageBlog && reorderedPages?.length ) {
		const homePageIndex = reorderedPages.findIndex(
			( item ) => item.id === frontPage
		);
		const homePage = reorderedPages.splice( homePageIndex, 1 );
		reorderedPages?.splice( 0, 0, ...homePage );

		const postsPageIndex = reorderedPages.findIndex(
			( item ) => item.id === postsPage
		);

		const blogPage = reorderedPages.splice( postsPageIndex, 1 );

		reorderedPages.splice( 1, 0, ...blogPage );
	}

	return (
		<SidebarNavigationScreen
			title={ __( 'Pages' ) }
			description={ __( 'Browse and edit pages on your site.' ) }
			content={
				<>
					{ ( isLoadingPages || isLoadingTemplates ) && (
						<ItemGroup>
							<Item>{ __( 'Loading pages' ) }</Item>
						</ItemGroup>
					) }
					{ ! ( isLoadingPages || isLoadingTemplates ) && (
						<ItemGroup>
							{ ! pagesAndTemplates?.length && (
								<Item>{ __( 'No page found' ) }</Item>
							) }
							{ isHomePageBlog && homeTemplate && (
								<PageItem
									postType="wp_template"
									postId={ homeTemplate.id }
									key={ homeTemplate.id }
									icon={ home }
									withChevron
								>
									<Truncate numberOfLines={ 1 }>
										{ decodeEntities(
											homeTemplate.title?.rendered
										) ?? __( '(no title)' ) }
									</Truncate>
								</PageItem>
							) }
							{ reorderedPages?.map( ( item ) => {
								let itemIcon;
								switch ( item.id ) {
									case frontPage:
										itemIcon = home;
										break;
									case postsPage:
										itemIcon = loop;
										break;
									default:
										itemIcon = page;
								}
								return (
									<PageItem
										postId={ item.id }
										key={ item.id }
										icon={ itemIcon }
										withChevron
									>
										<Truncate numberOfLines={ 1 }>
											{ decodeEntities(
												item.title?.rendered
											) ?? __( '(no title)' ) }
										</Truncate>
									</PageItem>
								);
							} ) }
							<VStack className="edit-site-sidebar-navigation-screen__sticky-section">
								{ dynamicPageTemplates?.map( ( item ) => (
									<PageItem
										postType="wp_template"
										postId={ item.id }
										key={ item.id }
										icon={ layout }
										withChevron
									>
										<Truncate numberOfLines={ 1 }>
											{ decodeEntities(
												item.title?.rendered
											) ?? __( '(no title)' ) }
										</Truncate>
									</PageItem>
								) ) }
								<SidebarNavigationItem
									className="edit-site-sidebar-navigation-screen-pages__see-all"
									href="edit.php?post_type=page"
									onClick={ () => {
										document.location =
											'edit.php?post_type=page';
									} }
								>
									{ __( 'Manage all pages' ) }
								</SidebarNavigationItem>
							</VStack>
						</ItemGroup>
					) }
				</>
			}
		/>
	);
}
