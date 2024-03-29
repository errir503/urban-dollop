# MoreMenuDropdown

`MoreMenuDropdown` is a convenient component for rendering an editor 'more' menu. This is typically a menu that provides:

- menu items for quick toggling editor preferences.
- a way to open dialogs for keyboard shortcuts and editor preferences.
- links to help.

This component implements a `DropdownMenu` component from the `@wordpress/components` package.

Note that just like the `DropdownMenu` component, this component accepts a render callback, which child elements should be returned from.

## Example

```jsx
function MyEditorMenu() {
	return (
		<MoreMenuDropdown>
			{ () => (
				<MenuGroup label={ __( 'Features' ) }>
					<MenuItem>
						{ __( 'Keyboard Shortcuts' ) }
					</MenuItem>
					<MenuItem>
						{ __( 'Editor Preferences' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</MoreMenuDropdown>
	);
}
```

## Props

### as

Provide a component that the dropdown should render as. This may be useful if you need `MoreMenuDropdown` to render a `ToolbarDropdownMenu` instead of a `DropdownMenu`. Defaults to `DropdownMenu`.

-   Type: `Component`
-   Required: No.

### className

Provide an additional class name to the dropdown component.

-   Type: `String`
-   Required: No

### label

Change the label of the button that opens the dropdown.

-   Default: 'Options'
-   Type: `String`
-   Required: No

### popoverProps

Override or extend the dropdown's popover props.

See the documentation for the `DropdownMenu` and `Popover` components in the `@wordpress/components` package for more information.

-   Type: `Object`
-   Required: No

### toggleProps

Override or extend the dropdown's toggle props.

See the documentation for the `DropdownMenu` and `Button` components in the `@wordpress/components` package for more information.

-   Type: `Object`
-   Required: No
