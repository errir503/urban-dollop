/**
 * External dependencies
 */
import { ActivityIndicator, FlatList, View } from 'react-native';
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { BottomSheet, BottomSheetConsumer } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import styles from './styles.scss';

const PER_PAGE = 20;
const REQUEST_DEBOUNCE_DELAY = 400;
const MINIMUM_QUERY_SIZE = 2;
const meetsThreshold = ( query ) => MINIMUM_QUERY_SIZE <= query.length;

export default function LinkPickerResults( {
	query,
	onLinkPicked,
	directEntry,
} ) {
	const [ links, setLinks ] = useState( [ directEntry ] );
	const [ hasAllSuggestions, setHasAllSuggestions ] = useState( false );
	const nextPage = useRef( 1 );
	const pendingRequest = useRef();
	const clearRequest = () => {
		pendingRequest.current = null;
	};

	// a stable debounced function to fetch suggestions and append
	const { fetchMoreSuggestions } = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		const fetchLinkSuggestions = async ( { search } ) => {
			if ( meetsThreshold( search ) ) {
				return await getSettings().__experimentalFetchLinkSuggestions(
					search,
					{ page: nextPage.current, type: 'post', perPage: PER_PAGE }
				);
			}
		};
		const fetchMore = async ( {
			query: search,
			links: currentSuggestions,
		} ) => {
			// return early if we've already detected the end of data or we are
			// already awaiting a response
			if ( hasAllSuggestions || pendingRequest.current ) {
				return;
			}
			const request = fetchLinkSuggestions( { search } );
			pendingRequest.current = request;
			const suggestions = await request;

			// only update links for the most recent request
			if ( suggestions && request === pendingRequest.current ) {
				// since we don't have the response header, we check if the results
				// are truncated to determine we've reached the end
				if ( suggestions.length < PER_PAGE ) {
					setHasAllSuggestions( true );
				}
				setLinks( [ ...currentSuggestions, ...suggestions ] );
				nextPage.current++;
			}

			clearRequest();
		};
		return {
			fetchMoreSuggestions: debounce( fetchMore, REQUEST_DEBOUNCE_DELAY ),
		};
	}, [] );

	// prevent setting state when unmounted
	useEffect( () => clearRequest, [] );

	// any time the query changes, we reset pagination
	useEffect( () => {
		clearRequest();
		nextPage.current = 1;
		setHasAllSuggestions( false );
		setLinks( [ directEntry ] );
		fetchMoreSuggestions( { query, links: [ directEntry ] } );
	}, [ query ] );

	const onEndReached = () => fetchMoreSuggestions( { query, links } );

	const spinner = ! hasAllSuggestions && meetsThreshold( query ) && (
		<View style={ styles.spinner }>
			<ActivityIndicator animating />
		</View>
	);

	return (
		<BottomSheetConsumer>
			{ ( { listProps } ) => (
				<FlatList
					data={ links }
					keyboardShouldPersistTaps="always"
					renderItem={ ( { item } ) => (
						<BottomSheet.LinkSuggestionItemCell
							suggestion={ item }
							onLinkPicked={ onLinkPicked }
						/>
					) }
					keyExtractor={ ( { url, type } ) => `${ url }-${ type }` }
					onEndReached={ onEndReached }
					onEndReachedThreshold={ 0.1 }
					initialNumToRender={ PER_PAGE }
					ListFooterComponent={ spinner }
					{ ...listProps }
					contentContainerStyle={ [
						...listProps.contentContainerStyle,
						styles.list,
					] }
				/>
			) }
		</BottomSheetConsumer>
	);
}
