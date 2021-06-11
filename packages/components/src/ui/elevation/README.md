# Elevation

`Elevation` is a core component that renders shadow, using the component system's shadow system.

## Usage

The shadow effect is generated using the `value` prop.

```jsx
import { Elevation, Surface, Text, View } from '@wordpress/components/ui';

function Example() {
	return (
		<Surface>
			<Text>Code is Poetry</Text>
			<Elevation value={ 5 } />
		</Surface>
	);
}
```

## Props

##### active

**Type**: `boolean`

Renders the active (interaction) shadow value.

##### borderRadius

**Type**: `string`,`number`

Renders the border-radius of the shadow.

##### focus

**Type**: `boolean`

Renders the focus (interaction) shadow value.

##### hover

**Type**: `boolean`

Renders the hover (interaction) shadow value.

##### isInteractive

**Type**: `boolean`

Determines if hover, active, and focus shadow values should be automatically calculated and rendered.

##### offset

**Type**: `number`

Dimensional offsets (margin) for the shadow.

##### value

**Type**: `number`

Size of the shadow, based on the Style system's elevation system. The `value` determines the strength of the shadow, which sense of depth.
In the example below, `isInteractive` is activated to give a better sense of depth.
