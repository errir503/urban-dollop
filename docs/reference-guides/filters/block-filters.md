# Block Filters

To modify the behavior of existing blocks, WordPress exposes several APIs:

### Block Styles

Block Styles allow providing alternative styles to existing blocks. They work by adding a className to the block's wrapper. This className can be used to provide an alternative styling for the block if the block style is selected. See the [Getting Started with JavaScript tutorial](/docs/how-to-guides/javascript/) for a full example.

_Example:_

```js
wp.blocks.registerBlockStyle( 'core/quote', {
	name: 'fancy-quote',
	label: 'Fancy Quote',
} );
```

The example above registers a block style named `fancy-quote` to the `core/quote` block. When the user selects this block style from the styles selector, an `is-style-fancy-quote` className will be added to the block's wrapper.

By adding `isDefault: true` you can mark the registered block style as the one that is recognized as active when no custom class name is provided. It also means that there will be no custom class name added to the HTML output for the style that is marked as default.

To remove a block style use `wp.blocks.unregisterBlockStyle()`.

_Example:_

```js
wp.blocks.unregisterBlockStyle( 'core/quote', 'large' );
```

The above removes the block style named `large` from the `core/quote` block.

**Important:** When unregistering a block style, there can be a [race condition](https://en.wikipedia.org/wiki/Race_condition) on which code runs first: registering the style, or unregistering the style. You want your unregister code to run last. The way to do that is specify the component that is registering the style as a dependency, in this case `wp-edit-post`. Additionally, using `wp.domReady()` ensures the unregister code runs once the dom is loaded.

Enqueue your JavaScript with the following PHP code:

```php
function myguten_enqueue() {
	wp_enqueue_script(
		'myguten-script',
		plugins_url( 'myguten.js', __FILE__ ),
		array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
		filemtime( plugin_dir_path( __FILE__ ) . '/myguten.js' )
	);
}
add_action( 'enqueue_block_editor_assets', 'myguten_enqueue' );
```

The JavaScript code in `myguten.js`:

```js
wp.domReady( function () {
	wp.blocks.unregisterBlockStyle( 'core/quote', 'large' );
} );
```

### Server-side registration helper

While the samples provided do allow full control of block styles, they do require a considerable amount of code.

To simplify the process of registering and unregistering block styles, two server-side functions are also available: `register_block_style`, and `unregister_block_style`.

#### register_block_style

The `register_block_style` function receives the name of the block as the first argument and an array describing properties of the style as the second argument.

The properties of the style array must include `name` and `label`:

-   `name`: The identifier of the style used to compute a CSS class.
-   `label`: A human-readable label for the style.

Besides the two mandatory properties, the styles properties array should also include an `inline_style` or a `style_handle` property:

-   `inline_style`: Contains inline CSS code that registers the CSS class required for the style.
-   `style_handle`: Contains the handle to an already registered style that should be enqueued in places where block styles are needed.

It is also possible to set the `is_default` property to `true` to mark one of the block styles as the default one.

The following code sample registers a style for the quote block named "Blue Quote", and provides an inline style that makes quote blocks with the "Blue Quote" style have blue color:

```php
register_block_style(
    'core/quote',
    array(
        'name'         => 'blue-quote',
        'label'        => __( 'Blue Quote' ),
        'inline_style' => '.wp-block-quote.is-style-blue-quote { color: blue; }',
    )
);
```

Alternatively, if a stylesheet was already registered which contains the CSS for the block style, it is possible to just pass the stylesheet's handle so `register_block_style` function will make sure it is enqueue.

The following code sample provides an example of this use case:

```php
wp_register_style( 'myguten-style', get_template_directory_uri() . '/custom-style.css' );

// ...

register_block_style(
    'core/quote',
    array(
        'name'         => 'fancy-quote',
        'label'        => 'Fancy Quote',
        'style_handle' => 'myguten-style',
    )
);
```

#### unregister_block_style

`unregister_block_style` allows unregistering a block style previously registered on the server using `register_block_style`.

The function's first argument is the registered name of the block, and the name of the style as the second argument.

The following code sample unregisters the style named 'fancy-quote' from the quote block:

```php
unregister_block_style( 'core/quote', 'fancy-quote' );
```

**Important:** The function `unregister_block_style` only unregisters styles that were registered on the server using `register_block_style`. The function does not unregister a style registered using client-side code.

### Filters

Extending blocks can involve more than just providing alternative styles, in this case, you can use one of the following filters to extend the block settings.

#### `blocks.registerBlockType`

Used to filter the block settings. It receives the block settings and the name of the registered block as arguments. Since v6.1.0 this filter is also applied to each of a block's deprecated settings.

_Example:_

Ensure that List blocks are saved with the canonical generated class name (`wp-block-list`):

```js
function addListBlockClassName( settings, name ) {
	if ( name !== 'core/list' ) {
		return settings;
	}

	return lodash.assign( {}, settings, {
		supports: lodash.assign( {}, settings.supports, {
			className: true,
		} ),
	} );
}

wp.hooks.addFilter(
	'blocks.registerBlockType',
	'my-plugin/class-names/list-block',
	addListBlockClassName
);
```

#### `blocks.getSaveElement`

A filter that applies to the result of a block's `save` function. This filter is used to replace or extend the element, for example using `wp.element.cloneElement` to modify the element's props or replace its children, or returning an entirely new element.

The filter's callback receives an element, a block type and the block attributes as arguments. It should return an element.

#### `blocks.getSaveContent.extraProps`

A filter that applies to all blocks returning a WP Element in the `save` function. This filter is used to add extra props to the root element of the `save` function. For example: to add a className, an id, or any valid prop for this element.

The filter receives the current `save` element's props, a block type and the block attributes as arguments. It should return a props object.

_Example:_

Adding a background by default to all blocks.

```js
function addBackgroundColorStyle( props ) {
	return lodash.assign( props, { style: { backgroundColor: 'red' } } );
}

wp.hooks.addFilter(
	'blocks.getSaveContent.extraProps',
	'my-plugin/add-background-color-style',
	addBackgroundColorStyle
);
```

_Note:_ A [block validation](/docs/reference-guides/block-api/block-edit-save.md#validation) error will occur if this filter modifies existing content the next time the post is edited. The editor verifies that the content stored in the post matches the content output by the `save()` function.

To avoid this validation error, use `render_block` server-side to modify existing post content instead of this filter. See [render_block documentation](https://developer.wordpress.org/reference/hooks/render_block/).

#### `blocks.getBlockDefaultClassName`

Generated HTML classes for blocks follow the `wp-block-{name}` nomenclature. This filter allows to provide an alternative class name.

_Example:_

```js
// Our filter function
function setBlockCustomClassName( className, blockName ) {
	return blockName === 'core/code' ? 'my-plugin-code' : className;
}

// Adding the filter
wp.hooks.addFilter(
	'blocks.getBlockDefaultClassName',
	'my-plugin/set-block-custom-class-name',
	setBlockCustomClassName
);
```

#### `blocks.switchToBlockType.transformedBlock`

Used to filter an individual transform result from block transformation. All of the original blocks are passed since transformations are many-to-many, not one-to-one.

#### `blocks.getBlockAttributes`

Called immediately after the default parsing of a block's attributes and before validation to allow a plugin to manipulate attribute values in time for validation and/or the initial values rendering of the block in the editor.

#### `editor.BlockEdit`

Used to modify the block's `edit` component. It receives the original block `BlockEdit` component and returns a new wrapped component.

_Example:_

{% codetabs %}
{% ESNext %}

```js
const { createHigherOrderComponent } = wp.compose;
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody>My custom control</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withInspectorControl' );

wp.hooks.addFilter(
	'editor.BlockEdit',
	'my-plugin/with-inspector-controls',
	withInspectorControls
);
```

{% ES5 %}

```js
var el = wp.element.createElement;

var withInspectorControls = wp.compose.createHigherOrderComponent( function (
	BlockEdit
) {
	return function ( props ) {
		return el(
			wp.element.Fragment,
			{},
			el( BlockEdit, props ),
			el(
				wp.blockEditor.InspectorControls,
				{},
				el( wp.components.PanelBody, {}, 'My custom control' )
			)
		);
	};
},
'withInspectorControls' );

wp.hooks.addFilter(
	'editor.BlockEdit',
	'my-plugin/with-inspector-controls',
	withInspectorControls
);
```

{% end %}

#### `editor.BlockListBlock`

Used to modify the block's wrapper component containing the block's `edit` component and all toolbars. It receives the original `BlockListBlock` component and returns a new wrapped component.

_Example:_

{% codetabs %}
{% ESNext %}

```js
const { createHigherOrderComponent } = wp.compose;

const withClientIdClassName = createHigherOrderComponent(
	( BlockListBlock ) => {
		return ( props ) => {
			return (
				<BlockListBlock
					{ ...props }
					className={ 'block-' + props.clientId }
				/>
			);
		};
	},
	'withClientIdClassName'
);

wp.hooks.addFilter(
	'editor.BlockListBlock',
	'my-plugin/with-client-id-class-name',
	withClientIdClassName
);
```

{% ES5 %}

```js
var el = wp.element.createElement;

var withClientIdClassName = wp.compose.createHigherOrderComponent( function (
	BlockListBlock
) {
	return function ( props ) {
		var newProps = lodash.assign( {}, props, {
			className: 'block-' + props.clientId,
		} );

		return el( BlockListBlock, newProps );
	};
},
'withClientIdClassName' );

wp.hooks.addFilter(
	'editor.BlockListBlock',
	'my-plugin/with-client-id-class-name',
	withClientIdClassName
);
```

{% end %}

#### `media.crossOrigin`

Used to set or modify the `crossOrigin` attribute for foreign-origin media elements (i.e `<img>`, `<audio>` , `<img>` , `<link>` , `<script>`, `<video>`). See this [article](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin) for more information the `crossOrigin` attribute, its values and how it applies to each element.

One example of it in action is in the Image block's transform feature to allow cross-origin images to be used in a `<canvas>`.

_Example:_

```js
addFilter(
	'media.crossOrigin',
	'my-plugin/with-cors-media',
	// The callback accepts a second `mediaSrc` argument which references
	// the url to actual foreign media, useful if you want to decide
	// the value of crossOrigin based upon it.
	( crossOrigin, mediaSrc ) => {
		if ( mediaSrc.startsWith( 'https://example.com' ) ) {
			return 'use-credentials';
		}
		return crossOrigin;
	}
);
```

## Removing Blocks

### Using a deny list

Adding blocks is easy enough, removing them is as easy. Plugin or theme authors have the possibility to "unregister" blocks.

{% codetabs %}
{% ESNext %}

```js
// my-plugin.js
import { unregisterBlockType } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

domReady( function () {
	unregisterBlockType( 'core/verse' );
} );
```

{% ES5 %}

```js
// my-plugin.js
wp.domReady( function () {
	wp.blocks.unregisterBlockType( 'core/verse' );
} );
```

{% end %}

and load this script in the Editor

```php
<?php
// my-plugin.php

function my_plugin_deny_list_blocks() {
	wp_enqueue_script(
		'my-plugin-deny-list-blocks',
		plugins_url( 'my-plugin.js', __FILE__ ),
		array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' )
	);
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_deny_list_blocks' );
```

**Important:** When unregistering a block, there can be a [race condition](https://en.wikipedia.org/wiki/Race_condition) on which code runs first: registering the block, or unregistering the block. You want your unregister code to run last. The way to do that is specify the component that is registering the block as a dependency, in this case `wp-edit-post`. Additionally, using `wp.domReady()` ensures the unregister code runs once the dom is loaded.

### Using an allow list

If you want to disable all blocks except an allow list, you can adapt the script above like so:

```js
// my-plugin.js

var allowedBlocks = [
	'core/paragraph',
	'core/image',
	'core/html',
	'core/freeform',
];

wp.blocks.getBlockTypes().forEach( function ( blockType ) {
	if ( allowedBlocks.indexOf( blockType.name ) === -1 ) {
		wp.blocks.unregisterBlockType( blockType.name );
	}
} );
```

## Hiding blocks from the inserter

On the server, you can filter the list of blocks shown in the inserter using the `allowed_block_types` filter. You can return either true (all block types supported), false (no block types supported), or an array of block type names to allow. You can also use the second provided param `$post` to filter block types based on its content.

```php
<?php
// my-plugin.php

function my_plugin_allowed_block_types( $allowed_block_types, $post ) {
	if ( $post->post_type !== 'post' ) {
		return $allowed_block_types;
	}
	return array( 'core/paragraph' );
}

add_filter( 'allowed_block_types', 'my_plugin_allowed_block_types', 10, 2 );
```

## Managing block categories

It is possible to filter the list of default block categories using the `block_categories` filter. You can do it on the server by implementing a function which returns a list of categories. It is going to be used during blocks registration and to group blocks in the inserter. You can also use the second provided param `$post` to generate a different list depending on the post's content.

```php
<?php
// my-plugin.php

function my_plugin_block_categories( $categories, $post ) {
	if ( $post->post_type !== 'post' ) {
		return $categories;
	}
	return array_merge(
		$categories,
		array(
			array(
				'slug' => 'my-category',
				'title' => __( 'My category', 'my-plugin' ),
				'icon'  => 'wordpress',
			),
		)
	);
}
add_filter( 'block_categories', 'my_plugin_block_categories', 10, 2 );
```

You can also display an icon with your block category by setting an `icon` attribute. The value can be the slug of a [WordPress Dashicon](https://developer.wordpress.org/resource/dashicons/).

You can also set a custom icon in SVG format. To do so, the icon should be rendered and set on the frontend, so it can make use of WordPress SVG, allowing mobile compatibility and making the icon more accessible.

To set an SVG icon for the category shown in the previous example, add the following example JavaScript code to the editor calling `wp.blocks.updateCategory` e.g:

```js
( function () {
	var el = wp.element.createElement;
	var SVG = wp.primitives.SVG;
	var circle = el( 'circle', {
		cx: 10,
		cy: 10,
		r: 10,
		fill: 'red',
		stroke: 'blue',
		strokeWidth: '10',
	} );
	var svgIcon = el(
		SVG,
		{ width: 20, height: 20, viewBox: '0 0 20 20' },
		circle
	);
	wp.blocks.updateCategory( 'my-category', { icon: svgIcon } );
} )();
```
