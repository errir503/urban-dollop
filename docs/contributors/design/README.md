# Design Contributions

A guide on how to get started contributing design to the Gutenberg project.

## Discussions

The [Make WordPress Design blog](https://make.wordpress.org/design/) is the primary spot for the latest information around WordPress Design Team: including announcements, product goals, meeting notes, meeting agendas, and more.

Real-time discussions for design take place in the `#design` channel in [Make WordPress Slack](https://make.wordpress.org/chat) (registration required). Weekly meetings for the Design team are on Wednesdays at 19:00UTC.

## How Can Designers Contribute?

The Gutenberg project uses GitHub for managing code and tracking issues. The main repository is at: [https://github.com/WordPress/gutenberg](https://github.com/WordPress/gutenberg).

If you'd like to contribute to the design or front-end, feel free to contribute to tickets labeled [Needs Design](https://github.com/WordPress/gutenberg/issues?q=is%3Aissue+is%3Aopen+label%3A%22Needs+Design%22) or [Needs Design Feedback](https://github.com/WordPress/gutenberg/issues?q=is%3Aissue+is%3Aopen+label%3A"Needs+Design+Feedback%22). We could use your thoughtful replies, mockups, animatics, sketches, doodles. Proposed changes are best done as minimal and specific iterations on the work that precedes it so we can compare.

The [WordPress Design team](http://make.wordpress.org/design/) uses [Figma](https://www.figma.com/) to collaborate and share work. If you'd like to contribute, join the [#design channel](http://wordpress.slack.com/messages/design/) in [Slack](https://make.wordpress.org/chat/) and ask the team to set you up with a free Figma account. This will give you access to a helpful [library of components](https://www.figma.com/file/ZtN5xslEVYgzU7Dd5CxgGZwq/WordPress-Components?node-id=0%3A1) used in WordPress.

## Principles

This section outlines the design principles and patterns of the editor interface—to explain the background of the design, inform future improvements, and help people design great blocks.

![Gutenberg Logo](https://cldup.com/J2MgjuShPv-3000x3000.png)

### Goal of Gutenberg

Gutenberg's all-encompassing goal is a post- and page-building experience that makes it easy to create rich layouts. The block editor was the first product launched following this methodology for working with content.

From the [kickoff post](https://make.wordpress.org/core/2017/01/04/focus-tech-and-design-leads/):

> The editor will endeavor to create a new page and post building experience that makes writing rich posts effortless, and has “blocks” to make easy what today might take shortcodes, custom HTML, or “mystery meat” embed discovery.

We can extract a few key principles from this:

-   **Authoring rich posts is a key strength of WordPress.**
-   **Blocks will unify features and types of interaction under a single interface.** Users shouldn’t have to write shortcodes, custom HTML, or paste URLs to embed. Users only need to learn how the block works in order to use all of its features.
-   **Make core features more discoverable**, reducing hard-to-find “Mystery meat.” WordPress supports a large number of blocks and 30+ embeds. Let’s increase their visibility.

### Why

One thing that sets WordPress apart from other systems is that it allows users to create as rich a post layout as they can imagine — as long as they know HTML and CSS and build a custom theme.

Gutenberg reshapes the editor into a tool that allows users to write rich posts and build beautiful layouts in a few clicks — no technical knowledge needed. WordPress will become a powerful and flexible content tool that’s accessible to all.

### Vision

Gutenberg wants to make it easier to author rich content. This means ensuring good defaults, bundling advanced layout options into blocks, and making the most important actions immediately available. Authoring content with WordPress should be accessible to anyone.

**Everything on a WordPress website becomes a block:** text, images, galleries, widgets, shortcodes, and even chunks of custom HTML, whether added by plugins or otherwise. Users will only have to learn a single interface —— the block interface.

**All blocks are created equal.** They all live in the same inserter interface. Recency, search, tabs, and grouping ensure that the most-used blocks are within easy reach.

**Drag-and-drop is secondary.** For greater accessibility and platform compatibility, drag-and-drop interactions are used as an additive enhancement on top of explicit actions like click, tab, and space.

**Placeholders are key.** If a block can have a neutral placeholder state, it should. An image placeholder block shows a button to open the media library, and a text placeholder block shows a writing prompt. By embracing placeholders we can predefine editable layouts, so all users have to do is fill in the blanks.

**Direct manipulation is intuitive.** The block interface allows users to manipulate content directly on the page. Plugin and theme authors will support and extend this experience by building their own custom blocks.

**Code editing shouldn't be necessary for customization.** Customizing traditionally required complicated markup, and complicated markup is easy to break. With Gutenberg, customizing becomes more intuitive — and safer. A developer will be able to provide custom blocks that directly render portions of a layout (a three column grid of features, for instance) and clearly specify what can be directly edited by the user. That means the user can update text, swap images, reduce the number of columns, without having to ask a developer, or worrying about breaking things.

### Future Opportunities

The initial phase of Gutenberg as described in the kickoff goal is primarily limited to the content area (specifically `post_content`) of posts and pages. Within those confines, we are embracing the web as a vertical river of content by appending blocks sequentially, then adding layout options to each block.

That said, there isn’t any fixed limit to the kind of layouts Gutenberg will be able to create. It’s very possible for Gutenberg to grow beyond the confines of post and page content, to include the whole page — one could think of a theme template as a comma-separated list of blocks, like this:

```js
{
	'theme/header',
	'theme/sidebar',
	'core/content' {
		'core/cover-image',
		'theme/author-card',
		'core/text',
	},
	'theme/footer',
}
```

Every block nested inside the content block would be _rearrangeable_. Every block would be _editable_. Every block would use the same API, and both the editor and the theme would load the same `style.css` file directly. In the end, both the editor/page builder and theme/front-end would appear near-identical, allowing for a true WYSIWYG experience.

This concept is speculative, but it’s one direction Gutenberg could go in the future.
