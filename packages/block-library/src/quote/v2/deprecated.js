/**
 * External dependencies
 */
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock, parseWithAttributeSchema } from '@wordpress/blocks';
import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import deprecationsForV1Block from '../deprecated';

export const migrateToQuoteV2 = ( attributes ) => {
	const { value } = attributes;

	return [
		{
			...omit( attributes, [ 'value' ] ),
		},
		value
			? parseWithAttributeSchema( value, {
					type: 'array',
					source: 'query',
					selector: 'p',
					query: {
						content: {
							type: 'string',
							source: 'html',
						},
					},
			  } ).map( ( { content } ) =>
					createBlock( 'core/paragraph', { content } )
			  )
			: createBlock( 'core/paragraph' ),
	];
};

const v3 = {
	attributes: {
		value: {
			type: 'string',
			source: 'html',
			selector: 'blockquote',
			multiline: 'p',
			default: '',
			__experimentalRole: 'content',
		},
		citation: {
			type: 'string',
			source: 'html',
			selector: 'cite',
			default: '',
			__experimentalRole: 'content',
		},
		align: {
			type: 'string',
		},
	},
	supports: {
		anchor: true,
		__experimentalSlashInserter: true,
		typography: {
			fontSize: true,
			lineHeight: true,
			__experimentalFontStyle: true,
			__experimentalFontWeight: true,
			__experimentalLetterSpacing: true,
			__experimentalTextTransform: true,
			__experimentalDefaultControls: {
				fontSize: true,
				fontAppearance: true,
			},
		},
	},
	save( { attributes } ) {
		const { align, value, citation } = attributes;

		const className = classnames( {
			[ `has-text-align-${ align }` ]: align,
		} );

		return (
			<blockquote { ...useBlockProps.save( { className } ) }>
				<RichText.Content multiline value={ value } />
				{ ! RichText.isEmpty( citation ) && (
					<RichText.Content tagName="cite" value={ citation } />
				) }
			</blockquote>
		);
	},
	migrate: migrateToQuoteV2,
};

/**
 * New deprecations need to be placed first
 * for them to have higher priority.
 *
 * Old deprecations may need to be updated as well.
 *
 * See block-deprecation.md
 */
export default [ v3, ...deprecationsForV1Block ];
