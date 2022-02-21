/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import history from '../../utils/history';
import getIsListPage from '../../utils/get-is-list-page';

function getNeedsHomepageRedirect( params ) {
	const { postType } = params;
	return (
		! getIsListPage( params ) &&
		! [ 'post', 'page', 'wp_template', 'wp_template_part' ].includes(
			postType
		)
	);
}

/**
 * Returns the postType and postId of the default homepage.
 *
 * @param {string} siteUrl The URL of the site.
 * @return {Object} An object containing the postType and postId properties
 *                  or `undefined` if a homepage could not be found.
 */
async function getHomepageParams( siteUrl ) {
	const siteSettings = await apiFetch( { path: '/wp/v2/settings' } );
	if ( ! siteSettings ) {
		throw new Error( '`getHomepageParams`: unable to load site settings.' );
	}

	const {
		show_on_front: showOnFront,
		page_on_front: frontpageId,
	} = siteSettings;

	// If the user has set a page as the homepage, use those details.
	if ( showOnFront === 'page' ) {
		return {
			postType: 'page',
			postId: frontpageId,
		};
	}

	// Else get the home template.
	// This matches the logic in `__experimentalGetTemplateForLink`.
	// (packages/core-data/src/resolvers.js)
	const template = await window
		.fetch( addQueryArgs( siteUrl, { '_wp-find-template': true } ) )
		.then( ( response ) => {
			if ( ! response.ok ) {
				throw new Error(
					`\`getHomepageParams\`: HTTP status error, ${ response.status } ${ response.statusText }`
				);
			}

			return response.json();
		} )
		.then( ( { data } ) => {
			if ( data.message ) {
				throw new Error(
					`\`getHomepageParams\`: REST API error, ${ data.message }`
				);
			}

			return data;
		} );

	if ( ! template?.id ) {
		throw new Error( '`getHomepageParams`: unable to find home template.' );
	}

	return {
		postType: 'wp_template',
		postId: template.id,
	};
}

export default async function redirectToHomepage( siteUrl ) {
	const searchParams = new URLSearchParams( history.location.search );
	const params = Object.fromEntries( searchParams.entries() );

	if ( getNeedsHomepageRedirect( params ) ) {
		const homepageParams = await getHomepageParams( siteUrl );

		if ( homepageParams ) {
			history.replace( homepageParams );
		}
	}
}
