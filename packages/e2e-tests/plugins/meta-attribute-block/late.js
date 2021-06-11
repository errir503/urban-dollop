( function() {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;

	registerBlockType( 'test/test-meta-attribute-block-late', {
		title: 'Test Meta Attribute Block (Late Registration)',
		icon: 'star',
		category: 'text',

		attributes: {
			content: {
				type: 'string',
				source: 'meta',
				meta: 'my_meta',
			},
		},

		edit: function( props ) {
			return el( 'input', {
				className: 'my-meta-input',
				value: props.attributes.content,
				onChange: function( event ) {
					props.setAttributes( { content: event.target.value } );
				},
			} );
		},

		save: function() {
			return null;
		},
	} );
} )();
