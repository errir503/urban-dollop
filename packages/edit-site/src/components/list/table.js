/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore, useEntityRecords } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import {
	VisuallyHidden,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import TemplateActions from '../template-actions';
import Link from '../routes/link';
import AddedBy from './added-by';

export default function Table( { templateType } ) {
	const { records: allTemplates } = useEntityRecords(
		'postType',
		templateType,
		{
			per_page: -1,
		}
	);

	const templates = useSelect(
		( select ) =>
			allTemplates?.filter(
				( template ) =>
					! select( coreStore ).isDeletingEntityRecord(
						'postType',
						templateType,
						template.id
					)
			),
		[ allTemplates ]
	);

	const postType = useSelect(
		( select ) => select( coreStore ).getPostType( templateType ),
		[ templateType ]
	);

	if ( ! templates ) {
		return null;
	}

	if ( ! templates.length ) {
		return (
			<div>
				{ sprintf(
					// translators: The template type name, should be either "templates" or "template parts".
					__( 'No %s found.' ),
					postType?.labels?.name?.toLowerCase()
				) }
			</div>
		);
	}

	const sortedTemplates = [ ...templates ];
	sortedTemplates.sort( ( a, b ) =>
		a.title.rendered.localeCompare( b.title.rendered )
	);

	return (
		// These explicit aria roles are needed for Safari.
		// See https://developer.mozilla.org/en-US/docs/Web/CSS/display#tables
		<table className="edit-site-list-table" role="table">
			<thead>
				<tr className="edit-site-list-table-head" role="row">
					<th
						className="edit-site-list-table-column"
						role="columnheader"
					>
						{ __( 'Template' ) }
					</th>
					<th
						className="edit-site-list-table-column"
						role="columnheader"
					>
						{ __( 'Added by' ) }
					</th>
					<th
						className="edit-site-list-table-column"
						role="columnheader"
					>
						<VisuallyHidden>{ __( 'Actions' ) }</VisuallyHidden>
					</th>
				</tr>
			</thead>

			<tbody>
				{ sortedTemplates.map( ( template ) => (
					<tr
						key={ template.id }
						className="edit-site-list-table-row"
						role="row"
					>
						<td className="edit-site-list-table-column" role="cell">
							<Heading level={ 4 }>
								<Link
									params={ {
										postId: template.id,
										postType: template.type,
										canvas: 'edit',
									} }
								>
									{ decodeEntities(
										template.title?.rendered ||
											template.slug
									) }
								</Link>
							</Heading>
							{ decodeEntities( template.description ) }
						</td>

						<td className="edit-site-list-table-column" role="cell">
							{ template ? (
								<AddedBy
									postType={ template.type }
									postId={ template.id }
								/>
							) : null }
						</td>
						<td className="edit-site-list-table-column" role="cell">
							<TemplateActions
								postType={ template.type }
								postId={ template.id }
								className="edit-site-list-table__actions"
							/>
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}
