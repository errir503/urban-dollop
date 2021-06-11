/**
 * External dependencies
 */
import { find, get, includes, union } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, SelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import PostFormatCheck from './check';

// All WP post formats, sorted alphabetically by translated name.
export const POST_FORMATS = [
	{ id: 'aside', caption: __( 'Aside' ) },
	{ id: 'audio', caption: __( 'Audio' ) },
	{ id: 'chat', caption: __( 'Chat' ) },
	{ id: 'gallery', caption: __( 'Gallery' ) },
	{ id: 'image', caption: __( 'Image' ) },
	{ id: 'link', caption: __( 'Link' ) },
	{ id: 'quote', caption: __( 'Quote' ) },
	{ id: 'standard', caption: __( 'Standard' ) },
	{ id: 'status', caption: __( 'Status' ) },
	{ id: 'video', caption: __( 'Video' ) },
].sort( ( a, b ) => {
	const normalizedA = a.caption.toUpperCase();
	const normalizedB = b.caption.toUpperCase();

	if ( normalizedA < normalizedB ) {
		return -1;
	}
	if ( normalizedA > normalizedB ) {
		return 1;
	}
	return 0;
} );

export default function PostFormat() {
	const instanceId = useInstanceId( PostFormat );
	const postFormatSelectorId = `post-format-selector-${ instanceId }`;

	const { postFormat, suggestedFormat, supportedFormats } = useSelect(
		( select ) => {
			const { getEditedPostAttribute, getSuggestedPostFormat } = select(
				'core/editor'
			);
			const _postFormat = getEditedPostAttribute( 'format' );
			const themeSupports = select( 'core' ).getThemeSupports();
			return {
				postFormat: _postFormat ?? 'standard',
				suggestedFormat: getSuggestedPostFormat(),
				// Ensure current format is always in the set.
				// The current format may not be a format supported by the theme.
				supportedFormats: union(
					[ _postFormat ],
					get( themeSupports, [ 'formats' ], [] )
				),
			};
		},
		[]
	);

	const formats = POST_FORMATS.filter( ( format ) =>
		includes( supportedFormats, format.id )
	);
	const suggestion = find(
		formats,
		( format ) => format.id === suggestedFormat
	);

	const { editPost } = useDispatch( 'core/editor' );

	const onUpdatePostFormat = ( format ) => editPost( { format } );

	return (
		<PostFormatCheck>
			<div className="editor-post-format">
				<div className="editor-post-format__content">
					<label htmlFor={ postFormatSelectorId }>
						{ __( 'Post Format' ) }
					</label>
					<SelectControl
						value={ postFormat }
						onChange={ ( format ) => onUpdatePostFormat( format ) }
						id={ postFormatSelectorId }
						options={ formats.map( ( format ) => ( {
							label: format.caption,
							value: format.id,
						} ) ) }
					/>
				</div>

				{ suggestion && suggestion.id !== postFormat && (
					<div className="editor-post-format__suggestion">
						{ __( 'Suggestion:' ) }{ ' ' }
						<Button
							isLink
							onClick={ () =>
								onUpdatePostFormat( suggestion.id )
							}
						>
							{ suggestion.caption }
						</Button>
					</div>
				) }
			</div>
		</PostFormatCheck>
	);
}
