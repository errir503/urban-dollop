# Meta Boxes

This is a brief document detailing how meta box support works in the block editor. With the superior developer and user experience of blocks, especially once block templates are available, **porting PHP meta boxes to blocks is highly encouraged!** See the [Meta Block tutorial](/docs/how-to-guides/metabox/meta-block-1-intro.md) for how to store post meta data using blocks.

### Testing, Converting, and Maintaining Existing Meta Boxes

Before converting meta boxes to blocks, it may be easier to test if a meta box works with the block editor, and explicitly mark it as such.

If a meta box _doesn't_ work with the block editor, and updating it to work correctly is not an option, the next step is to add the `__block_editor_compatible_meta_box` argument to the meta box declaration:

```php
add_meta_box( 'my-meta-box', 'My Meta Box', 'my_meta_box_callback',
	null, 'normal', 'high',
	array(
		'__block_editor_compatible_meta_box' => false,
	)
);
```

WordPress won't show the meta box but a message saying that it isn't compatible with the block editor, including a link to the Classic Editor plugin. By default, `__block_editor_compatible_meta_box` is `true`.

After a meta box is converted to a block, it can be declared as existing for backward compatibility:

```php
add_meta_box( 'my-meta-box', 'My Meta Box', 'my_meta_box_callback',
	null, 'normal', 'high',
	array(
		'__back_compat_meta_box' => true,
	)
);
```

When the block editor is used, this meta box will no longer be displayed in the meta box area, as it now only exists for backward compatibility purposes. It will continue to display correctly in the classic editor.

### Meta Box Data Collection

On each block editor page load, we register an action that collects the meta box data to determine if an area is empty. The original global state is reset upon collection of meta box data.

See [`register_and_do_post_meta_boxes`](https://developer.wordpress.org/reference/functions/register_and_do_post_meta_boxes/).

It will run through the functions and hooks that `post.php` runs to register meta boxes; namely `add_meta_boxes`, `add_meta_boxes_{$post->post_type}`, and `do_meta_boxes`.

Meta boxes are filtered to strip out any core meta boxes, standard custom taxonomy meta boxes, and any meta boxes that have declared themselves as only existing for backward compatibility purposes.

Then each location for this particular type of meta box is checked for whether it is active. If it is not empty a value of true is stored, if it is empty a value of false is stored. This meta box location data is then dispatched by the editor Redux store in `INITIALIZE_META_BOX_STATE`.

Ideally, this could be done at instantiation of the editor and help simplify this flow. However, it is not possible to know the meta box state before `admin_enqueue_scripts`, where we are calling `initializeEditor()`. This will have to do, unless we want to move `initializeEditor()` to fire in the footer or at some point after `admin_head`. With recent changes to editor bootstrapping this might now be possible. Test with ACF to make sure.

### Redux and React Meta Box Management

When rendering the block editor, the meta boxes are rendered to a hidden div `#metaboxes`.

_The Redux store will hold all meta boxes as inactive by default_. When
`INITIALIZE_META_BOX_STATE` comes in, the store will update any active meta box areas by setting the `isActive` flag to `true`. Once this happens React will check for the new props sent in by Redux on the `MetaBox` component. If that `MetaBox` is now active, instead of rendering null, a `MetaBoxArea` component will be rendered. The `MetaBox` component is the container component that mediates between the `MetaBoxArea` and the Redux Store. _If no meta boxes are active, nothing happens. This will be the default behavior, as all core meta boxes have been stripped._

#### MetaBoxArea Component

When the component renders it will store a reference to the meta boxes container and retrieve the meta boxes HTML from the prefetch location.

When the post is updated, only meta box areas that are active will be submitted. This prevents unnecessary requests. No extra revisions are created by the meta box submissions. A Redux action will trigger on `REQUEST_POST_UPDATE` for any active meta box. See `editor/effects.js`. The `REQUEST_META_BOX_UPDATES` action will set that meta box's state to `isUpdating`. The `isUpdating` prop will be sent into the `MetaBoxArea` and cause a form submission.

When the meta box area is saving, we display an updating overlay, to prevent users from changing the form values while a save is in progress.

An example save url would look like:

`mysite.com/wp-admin/post.php?post=1&action=edit&meta-box-loader=1`

This url is automatically passed into React via a `_wpMetaBoxUrl` global variable.

This page mimics the `post.php` post form, so when it is submitted it will fire all of the normal hooks and actions, and have the proper global state to correctly fire any PHP meta box mumbo jumbo without needing to modify any existing code. On successful submission, React will signal a `handleMetaBoxReload` to remove the updating overlay.

### Common Compatibility Issues

Most PHP meta boxes should continue to work in the block editor, but some meta boxes that include advanced functionality could break. Here are some common reasons why meta boxes might not work as expected in the block editor:

-   Plugins relying on selectors that target the post title, post content fields, and other metaboxes (of the old editor).
-   Plugins relying on TinyMCE's API because there's no longer a single TinyMCE instance to talk to in the block editor.
-   Plugins making updates to their DOM on "submit" or on "save".

Please also note that if your plugin triggers a PHP warning or notice to be output on the page, this will cause the HTML document type (`<!DOCTYPE html>`) to be output incorrectly. This will cause the browser to render using "Quirks Mode", which is a compatibility layer that gets enabled when the browser doesn't know what type of document it is parsing. The block editor is not meant to work in this mode, but it can _appear_ to be working just fine. If you encounter issues such as _meta boxes overlaying the editor_ or other layout issues, please check the raw page source of your document to see that the document type definition is the first thing output on the page. There will also be a warning in the JavaScript console, noting the issue.
