/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import PagePatterns from '../page-patterns';
import PageTemplateParts from '../page-template-parts';
import PageTemplates from '../page-templates';
import DataviewsTemplates from '../page-templates/dataviews-templates';
import PagePages from '../page-pages';
import { unlock } from '../../lock-unlock';

const { useLocation } = unlock( routerPrivateApis );

export default function PageMain() {
	const {
		params: { path },
	} = useLocation();

	if ( path === '/wp_template/all' ) {
		return window?.__experimentalAdminViews ? (
			<DataviewsTemplates />
		) : (
			<PageTemplates />
		);
	} else if ( path === '/wp_template_part/all' ) {
		return <PageTemplateParts />;
	} else if ( path === '/patterns' ) {
		return <PagePatterns />;
	} else if ( window?.__experimentalAdminViews && path === '/pages' ) {
		return <PagePages />;
	}

	return null;
}
