# Curating the Editor Experience

The purpose of this guide is to offer various ways one can lock down and curate the experience of using WordPress, especially with the introduction of more design tools and full site editing functionality. 

For information around adding functionality to a theme, rather than curating and locking, please review this guide on [Converting a classic theme to a block theme](https://developer.wordpress.org/themes/block-themes/converting-a-classic-theme-to-a-block-theme/).

## Locking APIs

**Lock the ability to move or remove specific blocks**

Users have the ability to lock and unlock blocks via the editor. The locking UI has options for preventing blocks from being moved within the content canvas or removed:

![Image of locking interface](https://raw.githubusercontent.com/WordPress/gutenberg/HEAD/docs/assets/Locking%20interface.png?raw=true)

Keep in mind that you can apply locking options to blocks nested inside of a containing block by turning on the "Apply to all blocks inside" option. However, you cannot mass lock blocks otherwise.

**Lock the ability to edit certain blocks**

Alongside the ability to lock moving or removing blocks, the [Navigation Block](https://github.com/WordPress/gutenberg/pull/44739) and [Reusable block](https://github.com/WordPress/gutenberg/pull/39950) have an additional capability: lock the ability to edit the contents of the block. This locks the ability to make changes to any blocks inside of either block type. 

**Apply block locking to patterns or templates**

When building patterns or templates, theme authors can use these same UI tools to set the default locked state of blocks. For example, a theme author could lock various pieces of a header. Keep in mind that by default, users with editing access can unlock these blocks. [Here’s an example of a pattern](https://gist.github.com/annezazu/acee30f8b6e8995e1b1a52796e6ef805) with various blocks locked in different ways and here’s more context on [creating a template with locked blocks](https://make.wordpress.org/core/2022/02/09/core-editor-improvement-curated-experiences-with-locking-apis-theme-json/). You can build these patterns in the editor itself, including adding locking options, before following the [documentation to register them](/docs/reference-guides/block-api/block-patterns.md).

**Apply content only editing in patterns or templates**

This functionality was introduced in WordPress 6.1. In contrast to block locking, which disables the ability to move or remove blocks, content only editing is both designed for use at the pattern or template level and hides all design tools, while still allowing for the ability to edit the content of the blocks. This provides a great way to simplify the interface for users and preserve a design. When this option is added, the following changes occur:  

- Non-content child blocks (containers, spacers, columns, etc) are hidden from list view, un-clickable on the canvas, and entirely un-editable.
- The Inspector will display a list of all child 'content' blocks. Clicking a block in this list reveals its settings panel. 
- The main List View only shows content blocks, all at the same level regardless of actual nesting.
- Children blocks within the overall content locked container are automatically move / remove locked.
- Additional child blocks cannot be inserted, further preserving the design and layout.
- There is a link in the block toolbar to ‘Modify’ that a user can toggle on/off to have access to the broader design tools. Currently, it's not possibly to programmatically remove this option.

This option can be applied to Columns, Cover, and Group blocks as well as third-party blocks that have the templateLock attribute in its block.json. To adopt this functionality, you need to use `"templateLock":"contentOnly"`. [Here's an example of a pattern](https://gist.github.com/annezazu/d62acd2514cea558be6cea97fe28ff3c) with this functionality in place. For more information, please [review the relevant documentation](/docs/reference-guides/block-api/block-templates.md#locking). 

Note: There is no UI in place to manage content locking and it must be managed at the code level. 

**Change permissions to control locking ability**

Agencies and plugin authors can offer an even more curated experience by limiting which users have [permission to lock and unlock blocks](https://make.wordpress.org/core/2022/05/05/block-locking-settings-in-wordpress-6-0/). By default, anyone who is an administrator will have access to lock and unlock blocks. 

Developers can add a filter to the [block_editor_settings_all](https://developer.wordpress.org/reference/hooks/block_editor_settings_all/) hook to configure permissions around locking blocks.  The hook passes two parameters to the callback function:

- `$settings` - An array of configurable settings for the editor.

- `$context` - An instance of WP_Block_Editor_Context, an object that contains information about the current editor.

Specifically, developers can alter the `$settings['canLockBlocks']` value by setting it to `true` or `false`, typically by running through one or more conditional checks. 

The following example disables block locking permissions for all users when editing a page:

```php
add_filter( 'block_editor_settings_all', function( $settings, $context ) {
	if ( $context->post && 'page' === $context->post->post_type ) {
		$settings['canLockBlocks'] = false;
	}

	return $settings;
}, 10, 2 );
```

Another common use case may be to only allow users who can edit the visual design of the site (theme editing) to lock or unlock blocks.  The best option would be to test against the `edit_theme_options` capability, as shown in the following code snippet:

```php
add_filter( 'block_editor_settings_all', function( $settings ) {
	$settings['canLockBlocks'] = current_user_can( 'edit_theme_options' );

	return $settings;
} );
```

Developers may use any type of conditional check to determine who can lock/unlock blocks. This is merely a small sampling of what is possible via the filter hook.


## Providing default controls/options

**Define default options**

Since theme.json acts as a configuration tool, there are numerous ways to define at a granular level what options are available. This section will use duotone as an example since it showcases a feature that cuts across a few blocks and allows for varying levels of access.   

*Duotone with Core options and customization available for each image related block:*

```json
{
"version": 2,
	"settings": {
		"color": {
			"customDuotone": true,
			"duotone": [
			]
		}
	}
}
```

*Duotone with theme defined color options, Core options, and customization available for each image related block:*
```json
{
	"version": 2,
	"settings": {
		"color": {
			"duotone": [
				{
					"colors": [ "#000000", "#ffffff" ],
					"slug": "foreground-and-background",
					"name": "Foreground and background"
				},
				{
					"colors": [ "#000000", "#ff0200" ],
					"slug": "foreground-and-secondary",
					"name": "Foreground and secondary"
				},
				{
					"colors": [ "#000000", "#7f5dee" ],
					"slug": "foreground-and-tertiary",
					"name": "Foreground and tertiary"
				},
			]
		}
	}
}
```

*Duotone with defined default options and all customization available for the Post Featured Image block:*

```json
{
	"schema": "https://schemas.wp.org/trunk/theme.json",
	"version": 2,
	"settings": {
		"color": {
			"custom": true,
			"customDuotone": true
		},
		"blocks": {
			"core/post-featured-image": {
				"color": {
					"duotone": [
						{
							"colors": [ "#282828", "#ff5837" ],
							"slug": "black-and-orange",
							"name": "Black and Orange"
						},
						{
							"colors": [ "#282828", "#0288d1" ],
							"slug": "black-and-blue", 
							"name": "Black and Blue"
						}
					],
					"customDuotone": true,
					"custom": true
				}
			}
		}
	}
}
```

*Duotone with only defined default options and core options available for the Post Featured Image block (no customization):*

```json
{
	"schema": "https://schemas.wp.org/trunk/theme.json",
	"version": 2,
	"settings": {
		"color": {
			"custom": true,
			"customDuotone": true
		},	
		"blocks": {
			"core/post-featured-image": {
				"color": {
					"duotone": [
						{
							"colors": [ "#282828", "#ff5837" ],
							"slug": "black-and-orange",
							"name": "Black and Orange"
						},
						{
							"colors": [ "#282828", "#0288d1" ],
							"slug": "black-and-blue",
							"name": "Black and Blue"
						}
					],
					"customDuotone": false,
					"custom": false
				}
			}
		} 
	}
}
```

## Limiting interface options with theme.json

**Limit options on a per block basis**

Beyond defining default values, using theme.json allows you to also remove options entirely and instead rely on what the theme has set in place. Below is a visual showing two extremes with the same paragraph block: 

![Image of restricted interface](https://raw.githubusercontent.com/WordPress/gutenberg/HEAD/docs/assets/Locking%20comparison%20visual.png?raw=true)

Continuing the examples with duotone, this means you could allow full access to all Duotone functionality for Image blocks and only limit the Post Featured Image block like so:

```json
{
	"schema": "https://schemas.wp.org/trunk/theme.json",
	"version": 2,
	"settings": {
		"color": {
			"custom": true,
			"customDuotone": true
		},
		"blocks": {
			"core/image": {
				"color": {
					"duotone": [],
					"customDuotone": true,
					"custom": true
				}
			},
			"core/post-featured-image": {
				"color": {
					"duotone": [],
					"customDuotone": false,
					"custom": false
				}
			}
		}
	}
}
```

You can read more about how best to [turn on/off options with theme.json here](/docs/how-to-guides/themes/theme-json.md). 

**Disable inherit default layout**

To disable the “Inherit default layout” setting for container blocks like the Group block, remove the following section: 

```json
"layout": {
	"contentSize": null,
	"wideSize": null
},
```

**Limit options globally**

When using theme.json in a block or classic theme, these settings will stop the default color and typography controls from being enabled globally, greatly limiting what’s possible:

```json
{
	"$schema": "http://schemas.wp.org/trunk/theme.json",
	"version": 2,
	"settings": {
		"layout": {
			"contentSize": "750px"
		},
		"color": {
			"background": false,
			"custom": false,
			"customDuotone": false,
			"customGradient": false,
			"defaultGradients": false,
			"defaultPalette": false,
			"text": false
		},
		"typography": {
			"customFontSize": false,
			"dropCap": false,
			"fontStyle": false,
			"fontWeight": false,
			"letterSpacing": false,
			"lineHeight": false,
			"textDecoration": false,
			"textTransform": false
		}
	}
}
```

To enable something from the above, just set whatever value you want to change to `true` for more granularity.

## Limiting interface options with theme.json filters

The theme.json file is a great way to control interface options, but it only allows for global or block-level modifications, which can be limiting in some scenarios.

For instance, in the previous section, color and typography controls were disabled globally using theme.json. But let's say you want to enable color settings for users who are Administrators. 

To provide more flexibility, WordPress 6.1 introduced server-side filters allowing you to customize theme.json data at four different data layers.

- [`wp_theme_json_data_default`](https://developer.wordpress.org/reference/hooks/wp_theme_json_data_default/) - Hooks into the default data provided by WordPress
- [`wp_theme_json_data_blocks`](https://developer.wordpress.org/reference/hooks/wp_theme_json_data_blocks/) - Hooks into the data provided by blocks.
- [`wp_theme_json_data_theme`](https://developer.wordpress.org/reference/hooks/wp_theme_json_data_theme/) - Hooks into the data provided by the current theme.
- [`wp_theme_json_data_user`](https://developer.wordpress.org/reference/hooks/wp_theme_json_data_user/) - Hooks into the data provided by the user.

In the following example, the data from the current theme's theme.json file is updated using the `wp_theme_json_data_theme` filter. Color controls are restored if the current user is an Administrator.

```php
// Disable color controls for all users except Administrators.
function example_filter_theme_json_data_theme( $theme_json ){
    $is_administrator = current_user_can( 'edit_theme_options' );

    if ( $is_administrator ) {
        $new_data = array(
            'version'  => 2,
            'settings' => array(
                'color' => array(
                    'background'       => true,
                    'custom'           => true,
                    'customDuotone'    => true,
                    'customGradient'   => true,
                    'defaultGradients' => true,
                    'defaultPalette'   => true,
                    'text'             => true,
                ),
            ),
        );
    }

	return $theme_json->update_with( $new_data );
}
add_filter( 'wp_theme_json_data_theme', 'example_filter_theme_json_data_theme' );
```

The filter receives an instance of the `WP_Theme_JSON_Data class` with the data for the respective layer. Then, you pass new data in a valid theme.json-like structure to the `update_with( $new_data )` method. A theme.json version number is required in `$new_data`. 


## Limiting interface options with client-side filters

WordPress 6.2 introduced a new client-side filter allowing you to modify block-level [theme.json settings](/docs/reference-guides/theme-json-reference/theme-json-living.md#settings) before the editor is rendered.

The filter is called `blockEditor.useSetting.before` and can be used in the JavaScript code as follows:

```js
import { addFilter } from '@wordpress/hooks';

/**
 * Limit the Column block's spacing options to pixels.
 */
addFilter(
	'blockEditor.useSetting.before',
	'example/useSetting.before',
	( settingValue, settingName, clientId, blockName ) => {
		if ( blockName === 'core/column' && settingName === 'spacing.units' ) {
			return [ 'px' ];
		}
		return settingValue;
	}
);
```

This example will restrict the available spacing units for the Column block to just pixels. As discussed above, a similar restriction could be applied using theme.json filters or directly in a theme’s theme.json file using block-level settings.

However, the `blockEditor.useSetting.before` filter is unique because it allows you to modify settings according to the block’s location, neighboring blocks, the current user’s role, and more. The possibilities for customization are extensive.

In the following example, text color controls are disabled for the Heading block whenever the block is placed inside of a Media & Text block.

```js
import { select } from  '@wordpress/data';
import { addFilter } from '@wordpress/hooks';

/**
 * Disable text color controls on Heading blocks when placed inside of Media & Text blocks.
 */
addFilter(
	'blockEditor.useSetting.before',
	'example/useSetting.before',
	( settingValue, settingName, clientId, blockName ) => {
		if ( blockName === 'core/heading' ) {
			const { getBlockParents, getBlockName } = select( 'core/block-editor' );
			const blockParents = getBlockParents( clientId, true );
			const inMediaText = blockParents.some( ( ancestorId ) => getBlockName( ancestorId ) === 'core/media-text' );

			if ( inMediaText && settingName === 'color.text' ) {
			    return false;
			}
		}

		return settingValue;
	}
);
```

## Remove access to functionality

**Remove access to the template editor**

Whether you’re using [theme.json in a Classic Theme](https://developer.wordpress.org/themes/block-themes/converting-a-classic-theme-to-a-block-theme/#adding-theme-json-in-classic-themes) or Block Theme, you can add the following to your functions.php file to remove access to the Template Editor that is available when editing posts or pages:

`remove_theme_support( 'block-templates');`

This prevents both the ability to both create new block templates or edit them from within the Post Editor. 

**Create an allow or disallow list to limit block options**

There might be times when you don’t want access to a block at all to be available for users. To control what’s available in the inserter, you can take two approaches: [an allow list](/docs/reference-guides/filters/block-filters.md#using-an-allow-list) that disables all blocks except those on the list or a [deny list that unregisters specific blocks](/docs/reference-guides/filters/block-filters.md#using-a-deny-list). 

**Disable pattern directory**

To fully remove patterns bundled with WordPress core from being accessed in the Inserter, the following can be added to your functions.php file: 

`remove_theme_support( 'core-block-patterns' );`

## Utilizing patterns

**Prioritize starter patterns for any post type**

When a user creates new content, regardless of post type, they are met with an empty canvas. However, that experience can be improved thanks to the option to have patterns from a specific type prioritized upon creation of a new piece of content. The modal appears each time the user creates a new item when there are patterns on their website that declare support for the `core/post-content` block types. By default, WordPress does not include any of these patterns, so the modal will not appear without at least two of these post content patterns being added. 

To opt into this, include `core/post-content` in the Block Types for your pattern. From there you can control which post types the pattern should show up for via the Post Types option. [Here's an example of a pattern](https://gist.github.com/annezazu/ead4c4965345251ec999b716c0c84f32) that would appear when creating a new post. 

Read more about this functionality in the [Page creation patterns in WordPress 6.0 dev note](https://make.wordpress.org/core/2022/05/03/page-creation-patterns-in-wordpress-6-0/) and [note that WordPress 6.1 brought this functionality to all post types](https://make.wordpress.org/core/2022/10/10/miscellaneous-editor-changes-for-wordpress-6-1/#start-content-patterns-for-all-post-types).  

**Prioritize starter patterns for template creation**

In the same way patterns can be prioritized for new posts or pages, the same experience can be added to the template creation process. When patterns declare support for the 'templateTypes' property, the patterns will appear anytime a template that matches the designation is created, along with the options to start from a blank state or use the current fallback of the template. By default, WordPress does not include any of these patterns. 

To opt into this, a pattern needs to specify a property called `templateTypes`, which is an array containing the templates where the patterns can be used as the full content. Here's an example of a pattern that would appear when creating a 404 template:

```
register_block_pattern(
  'wp-my-theme/404-template-pattern',
  array(
     'title'      => __( '404 Only template pattern', 'wp-my-theme' ),
     'templateTypes' => array( '404' ),
     'content'    => '<!-- wp:paragraph {"align":"center","fontSize":"x-large"} --><p class="has-text-align-center has-x-large-font-size">404 pattern</p><!-- /wp:paragraph -->',
  )
);
```

Read more about this functionality in the [Patterns on the create a new template modal in the WordPress 6.3 dev note](https://make.wordpress.org/core/2023/07/18/miscellaneous-editor-changes-in-wordpress-6-3/#patterns-on-the-create-a-new-template-modal).

**Lock patterns**

As mentioned in the prior section on Locking APIs, aspects of patterns themselves can be locked so that the important aspects of the design can be preserved. [Here’s an example of a pattern](https://gist.github.com/annezazu/acee30f8b6e8995e1b1a52796e6ef805) with various blocks locked in different ways. You can build these patterns in the editor itself, including adding locking options, before [following the documentation to register them](/docs/reference-guides/block-api/block-patterns.md). 

**Prioritize specific patterns from the Pattern Directory**

With WordPress 6.0 themes can register patterns from [Pattern Directory](https://wordpress.org/patterns/) through theme.json. To accomplish this, themes should use the new patterns top level key in theme.json. Within this field, themes can list patterns to register from the Pattern Directory. The patterns field is an array of pattern slugs from the Pattern Directory. Pattern slugs can be extracted by the url in a single pattern view at the Pattern Directory. Example: This url https://wordpress.org/patterns/pattern/partner-logos the slug is partner-logos.
```json
{
    "version": 2,
    "patterns": [ "short-text-surrounded-by-round-images", "partner-logos" ]
}
```

Note that this field requires using [version 2 of theme.json](/docs/reference-guides/theme-json-reference/theme-json-living.md). The content creator will then find the respective Pattern in the inserter “Patterns” tab in the categories that match the categories from the Pattern Directory.

## Combining approaches

Keep in mind that the above approaches can be combined as you see fit. For example, you can provide custom patterns to use when creating a new page while also limiting the amount of customization that can be done to aspects of them, like only allowing certain preset colors to be used for the background of a Cover block or locking down what blocks can be deleted. When considering the approaches to take, think about the specific ways you might want to both open up the experience and curate it. 

## Additional Resources

- [Builder Basics – Working with Templates in Full Site Editing (Part 3)](https://wordpress.tv/2022/05/24/nick-diego-builder-basics-working-with-templates-in-full-site-editing-part-3/)
- [Core Editor Improvement: Curated experiences with locking APIs & theme.json](https://make.wordpress.org/core/2022/02/09/core-editor-improvement-curated-experiences-with-locking-apis-theme-json/)
- [Learn WordPress session on Curating the Editor Experience](https://wordpress.tv/2022/07/22/nick-diego-curating-the-editor-experience/)
