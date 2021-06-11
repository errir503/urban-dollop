# (Experimental) Interface

The Interface Package contains the basis to start a new WordPress screen as Edit Post or Edit Site. The package offers a data store and a set of components. The store is useful to contain common data required by a screen (e.g., active areas). The information is persisted across screen reloads. The components allow one to implement functionality like a sidebar or menu items. Third-party plugins can extend them by default.

## Installation

Install the module

```bash
npm install @wordpress/interface --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for ES2015+ such as IE browsers then using [core-js](https://github.com/zloirock/core-js) will add polyfills for these methods._

## API Usage

### Complementary Areas

This component was named after a [complementary landmark](https://www.w3.org/TR/wai-aria-practices/examples/landmarks/complementary.html) – a supporting section of the document, designed to be complementary to the main content at a similar level in the DOM hierarchy, but remains meaningful when separated from the main content.

`ComplementaryArea` and `ComplementaryArea.Slot` form a slot fill pair to render complementary areas. Multiple `ComplementaryArea` components representing different complementary areas may be rendered at the same time, but only one appears on the slot depending on which complementary area is enabled.

It is possible to control which complementary is enabled by using the store:

Below are some examples of how to control the active complementary area using the store:

```js
wp.data
	.select( 'core/interface' )
	.getActiveComplementaryArea( 'core/edit-post' );
// -> "edit-post/document"

wp.data
	.dispatch( 'core/interface' )
	.enableComplementaryArea( 'core/edit-post', 'edit-post/block' );

wp.data
	.select( 'core/interface' )
	.getActiveComplementaryArea( 'core/edit-post' );
// -> "edit-post/block"

wp.data
	.dispatch( 'core/interface' )
	.disableComplementaryArea( 'core/edit-post' );

wp.data
	.select( 'core/interface' )
	.getActiveComplementaryArea( 'core/edit-post' );
// -> null
```

### Pinned Items

`PinnedItems` and `PinnedItems.Slot` form a slot fill pair to render pinned items (or areas) that act as a list of favorites similar to browser extensions listed in the Chrome Menu.

Example usage: `ComplementaryArea` component makes use of `PinnedItems` and automatically adds a pinned item for the complementary areas marked as a favorite.

```js
wp.data.select( 'core/interface' ).isItemPinned( 'core/edit-post', 'edit-post-block-patterns/block-patterns-sidebar' );
// -> false

wp.data.dispatch( 'core/interface' ).pinItem( 'core/edit-post', 'edit-post-block-patterns/block-patterns-sidebar' );

wp.data.select( 'core/interface' ).isItemPinned( 'core/edit-post', 'edit-post-block-patterns/block-patterns-sidebar' );
// -> true

wp.data.dispatch( 'core/interface' ).unpinItem( 'core/edit-post', 'edit-post-block-patterns/block-patterns-sidebar' );

wp.data.select( 'core/interface' ).isItemPinned( 'core/edit-post', 'edit-post-block-patterns/block-patterns-sidebar' ); -> false
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
