# VStack

`VStack` (or Vertical Stack) is a layout component that arranges child elements in a vertical line.

## Usage

`VStack` can render anything inside.

```jsx
import { VStack, Text, View } from '@wordpress/components/ui';

function Example() {
	return (
		<VStack>
			<View>
				<Text>Code</Text>
			</View>
			<View>
				<Text>is</Text>
			</View>
			<View>
				<Text>Poetry</Text>
			</View>
		</VStack>
	);
}
```

## Props

##### alignment

**Type**: `HStackAlignment`,`CSS['alignItems']`

Determines how the child elements are aligned.

-   `top`: Aligns content to the top.
-   `topLeft`: Aligns content to the top/left.
-   `topRight`: Aligns content to the top/right.
-   `left`: Aligns content to the left.
-   `center`: Aligns content to the center.
-   `right`: Aligns content to the right.
-   `bottom`: Aligns content to the bottom.
-   `bottomLeft`: Aligns content to the bottom/left.
-   `bottomRight`: Aligns content to the bottom/right.
-   `edge`: Aligns content to the edges of the container.
-   `stretch`: Stretches content to the edges of the container.

##### direction

**Type**: `FlexDirection`

The direction flow of the children content can be adjusted with `direction`. `column` will align children vertically and `row` will align children horizontally.

##### expanded

**Type**: `boolean`

Expands to the maximum available width (if horizontal) or height (if vertical).

##### justify

**Type**: `CSS['justifyContent']`

Horizontally aligns content if the `direction` is `row`, or vertically aligns content if the `direction` is `column`.
In the example below, `flex-start` will align the children content to the left.

##### spacing

**Type**: `CSS['width']`

The amount of space between each child element. Spacing in between each child can be adjusted by using `spacing`.
The value of `spacing` works as a multiplier to the library's grid system (base of `4px`).

##### wrap

**Type**: `boolean`

Determines if children should wrap.

## Spacer

When a `Spacer` is used within an `VStack`, the `Spacer` adaptively expands to take up the remaining space.

```jsx
function Example() {
	return (
		<VStack>
			<View>
				<Text>Code</Text>
			</View>
			<Spacer>
				<Text>is</Text>
			</Spacer>
			<View>
				<Text>Poetry</Text>
			</View>
		</VStack>
	);
}
```

`Spacer` can also be used in-between items to push them apart.

```jsx
function Example() {
	return (
		<VStack>
			<View>
				<Text>Code</Text>
			</View>
			<Spacer />
			<View>
				<Text>is</Text>
			</View>
			<View>
				<Text>Poetry</Text>
			</View>
		</VStack>
	);
}
```
