# FormFileUpload

## Usage

```jsx
import { FormFileUpload } from '@wordpress/components';

const MyFormFileUpload = () => (
	<FormFileUpload
		accept="image/*"
		onChange={ ( event ) => console.log( event.target.files ) }
	>
		Upload
	</FormFileUpload>
);
```

## Props

The component accepts the following props. Props not included in this set will be passed to the `Button` component.

### accept

A string passed to `input` element that tells the browser which file types can be upload to the upload by the user use. e.g: `image/*,video/*`.
More information about this string is available in https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers.

-   Type: `String`
-   Required: No

### children

Children are passed as children of `Button`.

-   Type: `Boolean`
-   Required: No

### icon

The icon to render. Supported values are: Dashicons (specified as strings), functions, WPComponent instances and `null`.

-   Type: `String|Function|WPComponent|null`
-   Required: No
-   Default: `null`

### multiple

Whether to allow multiple selection of files or not.

-   Type: `Boolean`
-   Required: No
-   Default: `false`

### onChange

Callback function passed directly to the `input` file element.

-   Type: `Function`
-   Required: Yes

### onClick

Callback function passed directly to the `input` file element.

This can be useful when you want to force a `change` event to fire when the user chooses the same file again. To do this, set the target value to an empty string in the `onClick` function.

```jsx
<FormFileUpload
	onClick={ ( event ) => ( event.target.value = '' ) }
	onChange={ onChange }
>
	Upload
</FormFileUpload>
```

-   Type: `Function`
-   Required: No

### render

Optional callback function used to render the UI. If passed the component does not render any UI and calls this function to render it.
This function receives an object with the property `openFileDialog`. The property is a function that when called opens the browser window to upload files.

-   Type: `Function`
-   Required: No
