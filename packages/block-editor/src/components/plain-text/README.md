# `PlainText`

Render an auto-growing textarea allow users to fill any textual content.

## Properties

### `value: string`

_Required._ String value of the textarea

### `onChange( value: string ): Function`

_Required._ Called when the value changes.

You can also pass any extra prop to the textarea rendered by this component.

### `ref: Object`

_Optional._ The component forwards the `ref` property to the `TextareaAutosize` component.

## Example

{% codetabs %}
{% ES5 %}

```js
wp.blocks.registerBlockType( /* ... */, {
	// ...

	attributes: {
		content: {
			type: 'string',
		},
	},

	edit: function( props ) {
		return wp.element.createElement( wp.editor.PlainText, {
			className: props.className,
			value: props.attributes.content,
			onChange: function( content ) {
				props.setAttributes( { content: content } );
			},
		} );
	},
} );
```

{% ESNext %}

```js
const { registerBlockType } = wp.blocks;
const { PlainText } = wp.editor;

registerBlockType( /* ... */, {
	// ...

	attributes: {
		content: {
			type: 'string',
		},
	},

	edit( { className, attributes, setAttributes } ) {
		return (
			<PlainText
				className={ className }
				value={ attributes.content }
				onChange={ ( content ) => setAttributes( { content } ) }
			/>
		);
	},
} );
```

{% end %}
