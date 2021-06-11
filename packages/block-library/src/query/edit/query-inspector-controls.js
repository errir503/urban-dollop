/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */

import {
	PanelBody,
	QueryControls,
	TextControl,
	FormTokenField,
	SelectControl,
	RangeControl,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import {
	useEffect,
	useState,
	useCallback,
	createInterpolateElement,
} from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { getTermsInfo, usePostTypes } from '../utils';
import { MAX_FETCHED_TERMS } from '../constants';

const stickyOptions = [
	{ label: __( 'Include' ), value: '' },
	{ label: __( 'Exclude' ), value: 'exclude' },
	{ label: __( 'Only' ), value: 'only' },
];

const CreateNewPostLink = ( { type } ) => {
	const newPostUrl = addQueryArgs( 'post-new.php', {
		post_type: type,
	} );
	return (
		<div className="wp-block-query__create-new-link">
			{ createInterpolateElement(
				__( '<a>Create a new post</a> for this feed.' ),
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				{ a: <a href={ newPostUrl } /> }
			) }
		</div>
	);
};

export default function QueryInspectorControls( {
	attributes: { query, layout },
	setQuery,
	setLayout,
} ) {
	const {
		order,
		orderBy,
		author: selectedAuthorId,
		postType,
		sticky,
		inherit,
	} = query;
	const [ showCategories, setShowCategories ] = useState( true );
	const [ showTags, setShowTags ] = useState( true );
	const [ showSticky, setShowSticky ] = useState( postType === 'post' );
	const { postTypesTaxonomiesMap, postTypesSelectOptions } = usePostTypes();
	const { authorList, categories, tags } = useSelect( ( select ) => {
		const { getEntityRecords } = select( coreStore );
		const termsQuery = { per_page: MAX_FETCHED_TERMS };
		const _categories = getEntityRecords(
			'taxonomy',
			'category',
			termsQuery
		);
		const _tags = getEntityRecords( 'taxonomy', 'post_tag', termsQuery );
		return {
			categories: getTermsInfo( _categories ),
			tags: getTermsInfo( _tags ),
			authorList: getEntityRecords( 'root', 'user', {
				per_page: -1,
			} ),
		};
	}, [] );
	useEffect( () => {
		if ( ! postTypesTaxonomiesMap ) return;
		const postTypeTaxonomies = postTypesTaxonomiesMap[ postType ];
		setShowCategories( postTypeTaxonomies.includes( 'category' ) );
		setShowTags( postTypeTaxonomies.includes( 'post_tag' ) );
	}, [ postType, postTypesTaxonomiesMap ] );
	useEffect( () => {
		setShowSticky( postType === 'post' );
	}, [ postType ] );
	const onPostTypeChange = ( newValue ) => {
		const updateQuery = { postType: newValue };
		if ( ! postTypesTaxonomiesMap[ newValue ].includes( 'category' ) ) {
			updateQuery.categoryIds = [];
		}
		if ( ! postTypesTaxonomiesMap[ newValue ].includes( 'post_tag' ) ) {
			updateQuery.tagIds = [];
		}
		if ( newValue !== 'post' ) {
			updateQuery.sticky = '';
		}
		setQuery( updateQuery );
	};
	// Handles categories and tags changes.
	const onTermsChange = ( terms, queryProperty ) => ( newTermValues ) => {
		const termIds = newTermValues.reduce( ( accumulator, termValue ) => {
			const termId = termValue?.id || terms.mapByName[ termValue ]?.id;
			if ( termId ) accumulator.push( termId );
			return accumulator;
		}, [] );
		setQuery( { [ queryProperty ]: termIds } );
	};
	const onCategoriesChange = onTermsChange( categories, 'categoryIds' );
	const onTagsChange = onTermsChange( tags, 'tagIds' );

	const [ querySearch, setQuerySearch ] = useState( query.search );
	const onChangeDebounced = useCallback(
		debounce( () => {
			if ( query.search !== querySearch ) {
				setQuery( { search: querySearch } );
			}
		}, 250 ),
		[ querySearch, query.search ]
	);

	useEffect( () => {
		onChangeDebounced();
		return onChangeDebounced.cancel;
	}, [ querySearch, onChangeDebounced ] );

	// Returns only the existing term ids (categories/tags) in proper
	// format to be used in `FormTokenField`. This prevents the component
	// from crashing in the editor, when non existing term ids were provided.
	const getExistingTermsFormTokenValue = ( taxonomy ) => {
		const termsMapper = {
			category: {
				queryProp: 'categoryIds',
				terms: categories,
			},
			post_tag: {
				queryProp: 'tagIds',
				terms: tags,
			},
		};
		const requestedTerm = termsMapper[ taxonomy ];
		return ( query[ requestedTerm.queryProp ] || [] ).reduce(
			( accumulator, termId ) => {
				const term = requestedTerm.terms.mapById[ termId ];
				if ( term ) {
					accumulator.push( {
						id: termId,
						value: term.name,
					} );
				}
				return accumulator;
			},
			[]
		);
	};

	return (
		<InspectorControls>
			<CreateNewPostLink type={ postType } />
			<PanelBody title={ __( 'Settings' ) }>
				<ToggleControl
					label={ __( 'Inherit query from URL' ) }
					help={ __(
						'Disable the option to customize the query arguments. Leave enabled to inherit the global query depending on the URL.'
					) }
					checked={ !! inherit }
					onChange={ ( value ) => setQuery( { inherit: !! value } ) }
				/>
				{ ! inherit && (
					<SelectControl
						options={ postTypesSelectOptions }
						value={ postType }
						label={ __( 'Post Type' ) }
						onChange={ onPostTypeChange }
					/>
				) }
				{ layout?.type === 'flex' && (
					<>
						<RangeControl
							label={ __( 'Columns' ) }
							value={ layout.columns }
							onChange={ ( value ) =>
								setLayout( { columns: value } )
							}
							min={ 2 }
							max={ Math.max( 6, layout.columns ) }
						/>
						{ layout.columns > 6 && (
							<Notice status="warning" isDismissible={ false }>
								{ __(
									'This column count exceeds the recommended amount and may cause visual breakage.'
								) }
							</Notice>
						) }
					</>
				) }
				{ ! inherit && (
					<QueryControls
						{ ...{ order, orderBy } }
						onOrderChange={ ( value ) =>
							setQuery( { order: value } )
						}
						onOrderByChange={ ( value ) =>
							setQuery( { orderBy: value } )
						}
					/>
				) }
				{ showSticky && (
					<SelectControl
						label={ __( 'Sticky posts' ) }
						options={ stickyOptions }
						value={ sticky }
						onChange={ ( value ) => setQuery( { sticky: value } ) }
					/>
				) }
			</PanelBody>
			{ ! inherit && (
				<PanelBody title={ __( 'Filters' ) }>
					{ showCategories && categories?.terms?.length > 0 && (
						<FormTokenField
							label={ __( 'Categories' ) }
							value={ getExistingTermsFormTokenValue(
								'category'
							) }
							suggestions={ categories.names }
							onChange={ onCategoriesChange }
						/>
					) }
					{ showTags && tags?.terms?.length > 0 && (
						<FormTokenField
							label={ __( 'Tags' ) }
							value={ getExistingTermsFormTokenValue(
								'post_tag'
							) }
							suggestions={ tags.names }
							onChange={ onTagsChange }
						/>
					) }
					<QueryControls
						{ ...{ selectedAuthorId, authorList } }
						onAuthorChange={ ( value ) =>
							setQuery( {
								author: value !== '' ? +value : undefined,
							} )
						}
					/>
					<TextControl
						label={ __( 'Keyword' ) }
						value={ querySearch }
						onChange={ setQuerySearch }
					/>
				</PanelBody>
			) }
		</InspectorControls>
	);
}
