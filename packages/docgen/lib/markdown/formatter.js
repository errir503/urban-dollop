/**
 * Internal dependencies
 */
const getSymbolTagsByName = require( '../get-symbol-tags-by-name' );

const cleanSpaces = ( paragraph ) =>
	paragraph
		? paragraph
				.split( '\n' )
				.map( ( sentence ) => sentence.trim() )
				.reduce( ( acc, current ) => acc + ' ' + current, '' )
				.trim()
		: '';

const formatTag = ( title, tags, formatter, docs ) => {
	if ( tags && tags.length > 0 ) {
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( `*${ title }*` );
		docs.push( '\n' );
		docs.push( ...tags.map( formatter ) );
	}
};

const formatExamples = ( tags, docs ) => {
	if ( tags && tags.length > 0 ) {
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( '*Usage*' );
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push(
			...tags.map( ( tag ) => `${ tag.description }` ).join( '\n\n' )
		);
	}
};

const formatDeprecated = ( tags, docs ) => {
	if ( tags && tags.length > 0 ) {
		docs.push( '\n' );
		docs.push(
			...tags.map(
				( tag ) =>
					`\n> **Deprecated** ${ cleanSpaces(
						`${ tag.name } ${ tag.description }`
					) }`
			)
		);
	}
};

const formatDescription = ( description, docs ) => {
	docs.push( '\n' );
	docs.push( '\n' );
	docs.push( description );
};

const getHeading = ( index, text ) => {
	return '#'.repeat( index ) + ' ' + text;
};

const getSymbolHeading = ( text ) => {
	return `<a name="${ text }" href="#${ text }">#</a> **${ text }**`;
};

const getTypeOutput = ( tag ) => {
	if ( tag.optional ) {
		return `\`[${ tag.type }]\``;
	}
	return `\`${ tag.type }\``;
};

module.exports = (
	rootDir,
	docPath,
	symbols,
	headingTitle,
	headingStartIndex
) => {
	const docs = [];
	let headingIndex = headingStartIndex || 1;
	if ( headingTitle ) {
		docs.push( getHeading( headingIndex, `${ headingTitle }` ) );
		headingIndex++;
	}
	docs.push( '\n' );
	docs.push( '\n' );
	symbols.sort( ( first, second ) => {
		const firstName = first.name.toUpperCase();
		const secondName = second.name.toUpperCase();
		if ( firstName < secondName ) {
			return -1;
		}
		if ( firstName > secondName ) {
			return 1;
		}
		return 0;
	} );
	if ( symbols && symbols.length > 0 ) {
		symbols.forEach( ( symbol ) => {
			docs.push( getSymbolHeading( symbol.name ) );
			formatDeprecated(
				getSymbolTagsByName( symbol, 'deprecated' ),
				docs
			);
			formatDescription( symbol.description, docs );
			formatTag(
				'Related',
				getSymbolTagsByName( symbol, 'see', 'link' ),
				( tag ) =>
					`\n- ${ tag.name.trim() }${
						tag.description ? ' ' : ''
					}${ tag.description.trim() }`,
				docs
			);
			formatExamples( getSymbolTagsByName( symbol, 'example' ), docs );
			formatTag(
				'Type',
				getSymbolTagsByName( symbol, 'type' ),
				( tag ) =>
					`\n- ${ getTypeOutput( tag ) }${ cleanSpaces(
						` ${ tag.name } ${ tag.description }`
					) }`,
				docs
			);
			formatTag(
				'Parameters',
				getSymbolTagsByName( symbol, 'param' ),
				( tag ) =>
					`\n- *${ tag.name }* ${ getTypeOutput(
						tag
					) }: ${ cleanSpaces( tag.description ) }`,
				docs
			);
			formatTag(
				'Returns',
				getSymbolTagsByName( symbol, 'return' ),
				( tag ) => {
					return `\n- ${ getTypeOutput( tag ) }: ${ cleanSpaces(
						`${ tag.name } ${ tag.description }`
					) }`;
				},
				docs
			);
			formatTag(
				'Type Definition',
				getSymbolTagsByName( symbol, 'typedef' ),
				( tag ) => `\n- *${ tag.name }* ${ getTypeOutput( tag ) }`,
				docs
			);
			formatTag(
				'Properties',
				getSymbolTagsByName( symbol, 'property' ),
				( tag ) =>
					`\n- *${ tag.name }* ${ getTypeOutput(
						tag
					) }: ${ cleanSpaces( tag.description ) }`,
				docs
			);
			docs.push( '\n' );
			docs.push( '\n' );
		} );
		docs.pop(); // remove last \n, we want one blank line at the end of the file.
	} else {
		docs.push( 'Nothing to document.' );
		docs.push( '\n' );
	}
	return docs.join( '' );
};
