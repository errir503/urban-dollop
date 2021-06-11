/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { unescapeTerms } from '../../utils/terms';

const MAX_MOST_USED_TERMS = 10;
const DEFAULT_QUERY = {
	per_page: MAX_MOST_USED_TERMS,
	orderby: 'count',
	order: 'desc',
	_fields: 'id,name,count',
};

export default function MostUsedTerms( { onSelect, taxonomy } ) {
	const { _terms, showTerms } = useSelect( ( select ) => {
		const mostUsedTerms = select( coreStore ).getEntityRecords(
			'taxonomy',
			taxonomy.slug,
			DEFAULT_QUERY
		);
		return {
			_terms: mostUsedTerms,
			showTerms: mostUsedTerms?.length >= MAX_MOST_USED_TERMS,
		};
	}, [] );

	if ( ! showTerms ) {
		return null;
	}

	const terms = unescapeTerms( _terms );
	const label = get( taxonomy, [ 'labels', 'most_used' ] );

	return (
		<div className="editor-post-taxonomies__flat-term-most-used">
			<h3 className="editor-post-taxonomies__flat-term-most-used-label">
				{ label }
			</h3>
			{ /*
			 * Disable reason: The `list` ARIA role is redundant but
			 * Safari+VoiceOver won't announce the list otherwise.
			 */
			/* eslint-disable jsx-a11y/no-redundant-roles */ }
			<ul
				role="list"
				className="editor-post-taxonomies__flat-term-most-used-list"
			>
				{ terms.map( ( term ) => (
					<li key={ term.id }>
						<Button isLink onClick={ () => onSelect( term ) }>
							{ term.name }
						</Button>
					</li>
				) ) }
			</ul>
			{ /* eslint-enable jsx-a11y/no-redundant-roles */ }
		</div>
	);
}
