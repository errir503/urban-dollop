/**
 * WordPress dependencies
 */
import { create, toHTMLString } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import getFootnotesOrder from './get-footnotes-order';

let oldFootnotes = {};

export function updateFootnotesFromMeta( blocks, meta ) {
	const output = { blocks };
	if ( ! meta ) return output;

	// If meta.footnotes is empty, it means the meta is not registered.
	if ( meta.footnotes === undefined ) return output;

	const newOrder = getFootnotesOrder( blocks );

	const footnotes = meta.footnotes ? JSON.parse( meta.footnotes ) : [];
	const currentOrder = footnotes.map( ( fn ) => fn.id );

	if ( currentOrder.join( '' ) === newOrder.join( '' ) ) return output;

	const newFootnotes = newOrder.map(
		( fnId ) =>
			footnotes.find( ( fn ) => fn.id === fnId ) ||
			oldFootnotes[ fnId ] || {
				id: fnId,
				content: '',
			}
	);

	function updateAttributes( attributes ) {
		// Only attempt to update attributes, if attributes is an object.
		if (
			! attributes ||
			Array.isArray( attributes ) ||
			typeof attributes !== 'object'
		) {
			return attributes;
		}

		attributes = { ...attributes };

		for ( const key in attributes ) {
			const value = attributes[ key ];

			if ( Array.isArray( value ) ) {
				attributes[ key ] = value.map( updateAttributes );
				continue;
			}

			if ( typeof value !== 'string' ) {
				continue;
			}

			if ( value.indexOf( 'data-fn' ) === -1 ) {
				continue;
			}

			const richTextValue = create( { html: value } );

			richTextValue.replacements.forEach( ( replacement ) => {
				if ( replacement.type === 'core/footnote' ) {
					const id = replacement.attributes[ 'data-fn' ];
					const index = newOrder.indexOf( id );
					// The innerHTML contains the count wrapped in a link.
					const countValue = create( {
						html: replacement.innerHTML,
					} );
					countValue.text = String( index + 1 );
					replacement.innerHTML = toHTMLString( {
						value: countValue,
					} );
				}
			} );

			attributes[ key ] = toHTMLString( { value: richTextValue } );
		}

		return attributes;
	}

	function updateBlocksAttributes( __blocks ) {
		return __blocks.map( ( block ) => {
			return {
				...block,
				attributes: updateAttributes( block.attributes ),
				innerBlocks: updateBlocksAttributes( block.innerBlocks ),
			};
		} );
	}

	// We need to go through all block attributes deeply and update the
	// footnote anchor numbering (textContent) to match the new order.
	const newBlocks = updateBlocksAttributes( blocks );

	oldFootnotes = {
		...oldFootnotes,
		...footnotes.reduce( ( acc, fn ) => {
			if ( ! newOrder.includes( fn.id ) ) {
				acc[ fn.id ] = fn;
			}
			return acc;
		}, {} ),
	};

	return {
		meta: {
			...meta,
			footnotes: JSON.stringify( newFootnotes ),
		},
		blocks: newBlocks,
	};
}
