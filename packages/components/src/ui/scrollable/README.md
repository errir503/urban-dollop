# Scrollable

`Scrollable` is a layout component that content in a scrollable container.

## Usage

```jsx
import { Scrollable, View } from '@wordpress/components/ui';

function Example() {
	return (
		<Scrollable style={ { maxHeight: 200 } }>
			<View style={ { height: 500 } }>...</View>
		</Scrollable>
	);
}
```

## Props

##### scrollDirection

**Type**: `x` | `y` | `auto`

Renders a scrollbar for a specific axis when content overflows.

##### smoothScroll

**Type**: `boolean`

Enables (CSS) smooth scrolling.
