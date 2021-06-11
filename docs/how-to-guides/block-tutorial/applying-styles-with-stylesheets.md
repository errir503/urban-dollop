# Applying Styles From a Stylesheet

In the previous step, the block had applied its own styles by an inline `style` attribute. While this might be adequate for very simple components, you will quickly find that it becomes easier to write your styles by extracting them to a separate stylesheet file.

The editor will automatically generate a class name for each block type to simplify styling. It can be accessed from the object argument passed to the edit and save functions. In step 2, we will create a stylesheet to use that class name.

{% codetabs %}
{% ESNext %}

```jsx
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType( 'gutenberg-examples/example-02-stylesheets', {
	apiVersion: 2,

	title: 'Example: Stylesheets',

	icon: 'universal-access-alt',

	category: 'design',

	example: {},

	edit() {
		const blockProps = useBlockProps();

		return (
			<p { ...blockProps }>
				Hello World, step 2 (from the editor, in green).
			</p>
		);
	},

	save() {
		const blockProps = useBlockProps.save();

		return (
			<p { ...blockProps }>
				Hello World, step 2 (from the frontend, in red).
			</p>
		);
	},
} );
```

{% ES5 %}

```js
( function ( blocks, element, blockEditor ) {
	var el = element.createElement;

	blocks.registerBlockType( 'gutenberg-examples/example-02-stylesheets', {
		apiVersion: 2,
		title: 'Example: Stylesheets',
		icon: 'universal-access-alt',
		category: 'design',
		example: {},
		edit: function ( props ) {
			var blockProps = blockEditor.useBlockProps();
			return el(
				'p',
				blockProps,
				'Hello World, step 2 (from the editor, in green).'
			);
		},
		save: function () {
			var blockProps = blockEditor.useBlockProps.save();
			return el(
				'p',
				blockProps,
				'Hello World, step 2 (from the frontend, in red).'
			);
		},
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor );
```

{% end %}

The class name is generated using the block's name prefixed with `wp-block-`, replacing the `/` namespace separator with a single `-`.

## Enqueueing Editor and Front end Assets

Like scripts, you need to enqueue your block's styles. As explained in the section before, you use the `editor_style` handle for styles only relevant in the editor, and the `style` handle for common styles applied both in the editor and the front of your site.

The stylesheets enqueued by `style` are the base styles and are loaded first. The `editor` stylesheet will be loaded after it.

Let's move on into code. Create a file called `editor.css`:

```css
.wp-block-gutenberg-examples-example-02-stylesheets {
	color: green;
	background: #cfc;
	border: 2px solid #9c9;
	padding: 20px;
}
```

And a new `style.css` file containing:

```css
.wp-block-gutenberg-examples-example-02-stylesheets {
	color: darkred;
	background: #fcc;
	border: 2px solid #c99;
	padding: 20px;
}
```

Configure your plugin to use these new styles:

```php
<?php
/**
 * Plugin Name: Gutenberg Examples Stylesheets
 */

function gutenberg_examples_02_register_block() {
	wp_register_script(
		'gutenberg-examples-02',
		plugins_url( 'block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'block.js' )
	);

	wp_register_style(
		'gutenberg-examples-02-editor',
		plugins_url( 'editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'editor.css' )
	);

	wp_register_style(
		'gutenberg-examples-02',
		plugins_url( 'style.css', __FILE__ ),
		array( ),
		filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
	);

	// Allow inlining small stylesheets on the frontend if possible.
	wp_style_add_data( 'gutenberg-examples-02', 'path', dirname( __FILE__ ) . '/style.css' );

	register_block_type( 'gutenberg-examples/example-02-stylesheets', array(
		'api_version' => 2,
		'style' => 'gutenberg-examples-02',
		'editor_style' => 'gutenberg-examples-02-editor',
		'editor_script' => 'gutenberg-examples-02',
	) );
}
add_action( 'init', 'gutenberg_examples_02_register_block' );
```
