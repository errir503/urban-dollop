/**
 * External dependencies
 */
import { get, times } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { width, content, columns } = attributes;
	return (
		<div
			{ ...useBlockProps.save( {
				className: `align${ width } columns-${ columns }`,
			} ) }
		>
			{ times( columns, ( index ) => (
				<div className="wp-block-column" key={ `column-${ index }` }>
					<RichText.Content
						tagName="p"
						value={ get( content, [ index, 'children' ] ) }
					/>
				</div>
			) ) }
		</div>
	);
}
