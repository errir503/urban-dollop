/**
 * WordPress dependencies
 */
import { useEffect, useState, useRef, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../../store';

/**
 * Interface for inserter media requests.
 *
 * @typedef {Object} InserterMediaRequest
 * @property {number} per_page How many items to fetch per page.
 * @property {string} search   The search term to use for filtering the results.
 */

/**
 * Interface for inserter media responses. Any media resource should
 * map their response to this interface, in order to create the core
 * WordPress media blocks (image, video, audio).
 *
 * @typedef {Object} InserterMediaItem
 * @property {string}        title        The title of the media item.
 * @property {string}        url          The source url of the media item.
 * @property {string}        [previewUrl] The preview source url of the media item to display in the media list.
 * @property {number}        [id]         The WordPress id of the media item.
 * @property {number|string} [sourceId]   The id of the media item from external source.
 * @property {string}        [alt]        The alt text of the media item.
 * @property {string}        [caption]    The caption of the media item.
 */

/**
 * Fetches media items based on the provided category.
 * Each media category is responsible for providing a `fetch` function.
 *
 * @param {Object}               category The media category to fetch results for.
 * @param {InserterMediaRequest} query    The query args to use for the request.
 * @return {InserterMediaItem[]} The media results.
 */
export function useMediaResults( category, query = {} ) {
	const [ mediaList, setMediaList ] = useState();
	const [ isLoading, setIsLoading ] = useState( false );
	// We need to keep track of the last request made because
	// multiple request can be fired without knowing the order
	// of resolution, and we need to ensure we are showing
	// the results of the last request.
	// In the future we could use AbortController to cancel previous
	// requests, but we don't for now as it involves adding support
	// for this to `core-data` package.
	const lastRequest = useRef();
	useEffect( () => {
		( async () => {
			const key = JSON.stringify( {
				category: category.name,
				...query,
			} );
			lastRequest.current = key;
			setIsLoading( true );
			setMediaList( [] ); // Empty the previous results.
			const _media = await category.fetch?.( query );
			if ( key === lastRequest.current ) {
				setMediaList( _media );
				setIsLoading( false );
			}
		} )();
	}, [ category.name, ...Object.values( query ) ] );
	return { mediaList, isLoading };
}

function useInserterMediaCategories() {
	const {
		inserterMediaCategories,
		allowedMimeTypes,
		enableOpenverseMediaCategory,
	} = useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		return {
			inserterMediaCategories: settings.inserterMediaCategories,
			allowedMimeTypes: settings.allowedMimeTypes,
			enableOpenverseMediaCategory: settings.enableOpenverseMediaCategory,
		};
	}, [] );
	// The allowed `mime_types` can be altered by `upload_mimes` filter and restrict
	// some of them. In this case we shouldn't add the category to the available media
	// categories list in the inserter.
	const allowedCategories = useMemo( () => {
		if ( ! inserterMediaCategories || ! allowedMimeTypes ) {
			return;
		}
		return inserterMediaCategories.filter( ( category ) => {
			// Check if Openverse category is enabled.
			if (
				! enableOpenverseMediaCategory &&
				category.name === 'openverse'
			) {
				return false;
			}
			// When a category has set `isExternalResource` to `true`, we
			// don't need to check for allowed mime types, as they are used
			// for restricting uploads for this media type and not for
			// inserting media from external sources.
			if ( category.isExternalResource ) {
				return true;
			}
			return Object.values( allowedMimeTypes ).some( ( mimeType ) =>
				mimeType.startsWith( `${ category.mediaType }/` )
			);
		} );
	}, [
		inserterMediaCategories,
		allowedMimeTypes,
		enableOpenverseMediaCategory,
	] );
	return allowedCategories;
}

export function useMediaCategories( rootClientId ) {
	const [ categories, setCategories ] = useState( [] );
	const { canInsertImage, canInsertVideo, canInsertAudio } = useSelect(
		( select ) => {
			const { canInsertBlockType } = select( blockEditorStore );
			return {
				canInsertImage: canInsertBlockType(
					'core/image',
					rootClientId
				),
				canInsertVideo: canInsertBlockType(
					'core/video',
					rootClientId
				),
				canInsertAudio: canInsertBlockType(
					'core/audio',
					rootClientId
				),
			};
		},
		[ rootClientId ]
	);
	const inserterMediaCategories = useInserterMediaCategories();
	useEffect( () => {
		( async () => {
			const _categories = [];
			// If `inserterMediaCategories` is not defined in
			// block editor settings, do not show any media categories.
			if ( ! inserterMediaCategories ) {
				return;
			}
			// Loop through categories to check if they have at least one media item.
			const categoriesHaveMedia = new Map(
				await Promise.all(
					inserterMediaCategories.map( async ( category ) => {
						// Some sources are external and we don't need to make a request.
						if ( category.isExternalResource ) {
							return [ category.name, true ];
						}
						const results = await category.fetch( { per_page: 1 } );
						return [ category.name, !! results.length ];
					} )
				)
			);
			// We need to filter out categories that don't have any media items or
			// whose corresponding block type is not allowed to be inserted, based
			// on the category's `mediaType`.
			const canInsertMediaType = {
				image: canInsertImage,
				video: canInsertVideo,
				audio: canInsertAudio,
			};
			inserterMediaCategories.forEach( ( category ) => {
				if (
					canInsertMediaType[ category.mediaType ] &&
					categoriesHaveMedia.get( category.name )
				) {
					_categories.push( category );
				}
			} );
			if ( !! _categories.length ) {
				setCategories( _categories );
			}
		} )();
	}, [
		canInsertImage,
		canInsertVideo,
		canInsertAudio,
		inserterMediaCategories,
	] );
	return categories;
}
