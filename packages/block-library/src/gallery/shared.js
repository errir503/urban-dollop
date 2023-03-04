/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';

export function defaultColumnsNumber( imageCount ) {
	return imageCount ? Math.min( 3, imageCount ) : 3;
}

export const pickRelevantMediaFiles = ( image, sizeSlug = 'large' ) => {
	const imageProps = Object.fromEntries(
		Object.entries( image ?? {} ).filter( ( [ key ] ) =>
			[ 'alt', 'id', 'link' ].includes( key )
		)
	);

	imageProps.url =
		image?.sizes?.[ sizeSlug ]?.url ||
		image?.media_details?.sizes?.[ sizeSlug ]?.source_url ||
		image?.url ||
		image?.source_url;
	const fullUrl =
		image?.sizes?.full?.url ||
		image?.media_details?.sizes?.full?.source_url;
	if ( fullUrl ) {
		imageProps.fullUrl = fullUrl;
	}
	return imageProps;
};

function getGalleryBlockV2Enabled() {
	// We want to fail early here, at least during beta testing phase, to ensure
	// there aren't instances where undefined values cause false negatives.
	if ( ! window.wp || typeof window.wp.galleryBlockV2Enabled !== 'boolean' ) {
		throw 'window.wp.galleryBlockV2Enabled is not defined';
	}
	return window.wp.galleryBlockV2Enabled;
}

/**
 * The new gallery block format is not compatible with the use_BalanceTags option
 * in WP versions <= 5.8 https://core.trac.wordpress.org/ticket/54130. The
 * window.wp.galleryBlockV2Enabled flag is set in lib/compat.php. This method
 * can be removed when minimum supported WP version >=5.9.
 */
export function isGalleryV2Enabled() {
	if ( Platform.isNative ) {
		return getGalleryBlockV2Enabled();
	}

	return true;
}
