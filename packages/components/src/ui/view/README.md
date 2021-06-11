# View (Experimental)

`View` is a core component that renders everything in the library. It is the principle component in the entire library.

**Everything** is a `View`, and a `View` is **everything**.

## Usage

```jsx
import { Text, View } from '@wordpress/components/ui';

function Example() {
	return (
		<View>
			<Text>Code is Poetry</Text>
		</View>
	);
}
```

## Props

##### as

**Type**: `string`,`E`

Render the component as another React Component or HTML Element.

##### css

**Type**: `InterpolatedCSS`

Render custom CSS using the style system.
