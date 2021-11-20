# Plugin Sidebar

How to add a sidebar to your plugin. A sidebar is the region to the far right of the editor. Your plugin can add an additional icon next to the InspectorControls (gear icon) that can be expanded.

![Example sidebar](https://raw.githubusercontent.com/WordPress/gutenberg/HEAD/docs/assets/sidebar-up-and-running.png)

**Prerequisite:**: The tutorial assumes you have an existing plugin setup and ready to add PHP and JavaScript code. Please, refer to [Getting started with JavaScript](/docs/how-to-guides/javascript/) tutorial for an introduction to WordPress plugins and how to use JavaScript to extend the block editor.

In the next sections, you're going to create a custom sidebar for a plugin that contains a text control so the user can update a value that is stored in the `post_meta` table.

1. [Get a sidebar up and running](/docs/how-to-guides/sidebar-tutorial/plugin-sidebar-1-up-and-running.md)
2. [Tweak the sidebar style and add controls](/docs/how-to-guides/sidebar-tutorial/plugin-sidebar-2-styles-and-controls.md)
3. [Register a new meta field](/docs/how-to-guides/sidebar-tutorial/plugin-sidebar-3-register-meta.md)
4. [Initialize the input control with the meta field value](/docs/how-to-guides/sidebar-tutorial/plugin-sidebar-4-initialize-input.md)
5. [Update the meta field value when input's content changes](/docs/how-to-guides/sidebar-tutorial/plugin-sidebar-5-update-meta.md)
