/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import HierarchicalTermSelector from './hierarchical-term-selector';
import FlatTermSelector from './flat-term-selector';
import { store as editorStore } from '../../store';

const identity = ( x ) => x;

export function PostTaxonomies( {
	postType,
	taxonomies,
	taxonomyWrapper = identity,
} ) {
	const availableTaxonomies = ( taxonomies ?? [] ).filter( ( taxonomy ) =>
		taxonomy.types.includes( postType )
	);
	const visibleTaxonomies = availableTaxonomies.filter(
		// In some circumstances .visibility can end up as undefined so optional chaining operator required.
		// https://github.com/WordPress/gutenberg/issues/40326
		( taxonomy ) => taxonomy.visibility?.show_ui
	);
	return visibleTaxonomies.map( ( taxonomy ) => {
		const TaxonomyComponent = taxonomy.hierarchical
			? HierarchicalTermSelector
			: FlatTermSelector;
		return (
			<Fragment key={ `taxonomy-${ taxonomy.slug }` }>
				{ taxonomyWrapper(
					<TaxonomyComponent slug={ taxonomy.slug } />,
					taxonomy
				) }
			</Fragment>
		);
	} );
}

export default compose( [
	withSelect( ( select ) => {
		return {
			postType: select( editorStore ).getCurrentPostType(),
			taxonomies: select( coreStore ).getTaxonomies( { per_page: -1 } ),
		};
	} ),
] )( PostTaxonomies );
