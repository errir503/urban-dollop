/**
 * External dependencies
 */
import { times, unescape } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	PanelBody,
	Placeholder,
	Spinner,
	ToggleControl,
	VisuallyHidden,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { pin } from '@wordpress/icons';
import { store as coreStore } from '@wordpress/core-data';

export default function CategoriesEdit( {
	attributes: { displayAsDropdown, showHierarchy, showPostCounts },
	setAttributes,
} ) {
	const selectId = useInstanceId( CategoriesEdit, 'blocks-category-select' );
	const { categories, isRequesting } = useSelect( ( select ) => {
		const { getEntityRecords } = select( coreStore );
		const { isResolving } = select( 'core/data' );
		const query = { per_page: -1, hide_empty: true };
		return {
			categories: getEntityRecords( 'taxonomy', 'category', query ),
			isRequesting: isResolving( 'core', 'getEntityRecords', [
				'taxonomy',
				'category',
				query,
			] ),
		};
	}, [] );
	const getCategoriesList = ( parentId ) => {
		if ( ! categories?.length ) {
			return [];
		}
		if ( parentId === null ) {
			return categories;
		}
		return categories.filter( ( { parent } ) => parent === parentId );
	};
	const getCategoryListClassName = ( level ) => {
		return `wp-block-categories__list wp-block-categories__list-level-${ level }`;
	};
	const toggleAttribute = ( attributeName ) => ( newValue ) =>
		setAttributes( { [ attributeName ]: newValue } );
	const renderCategoryName = ( name ) =>
		! name ? __( '(Untitled)' ) : unescape( name ).trim();

	const renderCategoryList = () => {
		const parentId = showHierarchy ? 0 : null;
		const categoriesList = getCategoriesList( parentId );
		return (
			<ul className={ getCategoryListClassName( 0 ) }>
				{ categoriesList.map( ( category ) =>
					renderCategoryListItem( category, 0 )
				) }
			</ul>
		);
	};
	const renderCategoryListItem = ( category, level ) => {
		const childCategories = getCategoriesList( category.id );
		const { id, link, count, name } = category;
		return (
			<li key={ id }>
				<a href={ link } target="_blank" rel="noreferrer noopener">
					{ renderCategoryName( name ) }
				</a>
				{ showPostCounts && (
					<span className="wp-block-categories__post-count">
						{ ` (${ count })` }
					</span>
				) }
				{ showHierarchy && !! childCategories.length && (
					<ul className={ getCategoryListClassName( level + 1 ) }>
						{ childCategories.map( ( childCategory ) =>
							renderCategoryListItem( childCategory, level + 1 )
						) }
					</ul>
				) }
			</li>
		);
	};
	const renderCategoryDropdown = () => {
		const parentId = showHierarchy ? 0 : null;
		const categoriesList = getCategoriesList( parentId );
		return (
			<>
				<VisuallyHidden as="label" htmlFor={ selectId }>
					{ __( 'Categories' ) }
				</VisuallyHidden>
				<select
					id={ selectId }
					className="wp-block-categories__dropdown"
				>
					{ categoriesList.map( ( category ) =>
						renderCategoryDropdownItem( category, 0 )
					) }
				</select>
			</>
		);
	};
	const renderCategoryDropdownItem = ( category, level ) => {
		const { id, count, name } = category;
		const childCategories = getCategoriesList( id );
		return [
			<option key={ id }>
				{ times( level * 3, () => '\xa0' ) }
				{ renderCategoryName( name ) }
				{ showPostCounts && ` (${ count })` }
			</option>,
			showHierarchy &&
				!! childCategories.length &&
				childCategories.map( ( childCategory ) =>
					renderCategoryDropdownItem( childCategory, level + 1 )
				),
		];
	};

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Categories settings' ) }>
					<ToggleControl
						label={ __( 'Display as dropdown' ) }
						checked={ displayAsDropdown }
						onChange={ toggleAttribute( 'displayAsDropdown' ) }
					/>
					<ToggleControl
						label={ __( 'Show hierarchy' ) }
						checked={ showHierarchy }
						onChange={ toggleAttribute( 'showHierarchy' ) }
					/>
					<ToggleControl
						label={ __( 'Show post counts' ) }
						checked={ showPostCounts }
						onChange={ toggleAttribute( 'showPostCounts' ) }
					/>
				</PanelBody>
			</InspectorControls>
			{ isRequesting && (
				<Placeholder icon={ pin } label={ __( 'Categories' ) }>
					<Spinner />
				</Placeholder>
			) }
			{ ! isRequesting && categories.length === 0 && (
				<p>
					{ __(
						'Your site does not have any posts, so there is nothing to display here at the moment.'
					) }
				</p>
			) }
			{ ! isRequesting &&
				categories.length > 0 &&
				( displayAsDropdown
					? renderCategoryDropdown()
					: renderCategoryList() ) }
		</div>
	);
}
