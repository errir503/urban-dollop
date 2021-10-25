# Contributing

Thank you for taking the time to contribute.

The following is a set of guidelines for contributing to the `@wordpress/components` package to be considered in addition to the general ones described in our [Contributing Policy](/CONTRIBUTING.md).

This set of guidelines should apply especially to newly introduced components. In fact, while these guidelines should also be retroactively applied to existing components, it is sometimes impossible to do so for legacy/compatibility reasons.

For an example of a component that follows these requirements, take a look at [`ItemGroup`](/packages/components/src/item-group).

- [Compatibility](#compatibility)
- [Compound components](#compound-components)
- [Components & Hooks](#components--hooks)
- [TypeScript](#typescript)
- [Styling](#styling)
- [Context system](#context-system)
- [Unit tests](#unit-tests)
- [Storybook](#storybook)
- [Documentation](#documentation)
- [README example](#README-example)
- [Folder structure](#folder-structure)

## Compatibility

The `@wordpress/components` package includes components that are relied upon by many developers across different projects. It is, therefore, very important to avoid introducing breaking changes.

In these situations, one possible approach is to "soft-deprecate" a given legacy API. This is achieved by:

1. Removing traces of the API from the docs, while still supporting it in code.
2. Updating all places in Gutenberg that use that API.
3. Adding deprecation warnings (only after the previous point is completed, otherwise the Browser Console will be polluted by all those warnings and some e2e tests may fail).

When adding new components or new props to existing components, it's recommended to prefix them with `__unstable` or `__experimental` until they're stable enough to be exposed as part of the public API.

Learn more on [How to preserve backward compatibility for a React Component](/docs/how-to-guides/backward-compatibility/README.md#how-to-preserve-backward-compatibility-for-a-react-component) and [Experimental and Unstable APIs](/docs/contributors/code/coding-guidelines.md#experimental-and-unstable-apis).

<!-- ## Polymorphic Components (i.e. the `as` prop)

The primary way to compose components is through the `as` prop. This prop can be used to change the underlying element used to render a component, e.g.:

```tsx
function LinkButton( { href, children } ) {
	return <Button variant="primary" as="a" href={href}>{ children }</Button>;
}
```
-->

## Compound components

When creating components that render a list of subcomponents, prefer to expose the API using the [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks) technique over array props like `items` or `options`:

```jsx
// ❌ Don't:
<List
	items={ [
		{ value: 'Item 1' },
		{ value: 'Item 2' },
		{ value: 'Item 3' },
	] }
/>
```

```jsx
// ✅ Do:
<List>
	<ListItem value="Item 1" />
	<ListItem value="Item 2" />
	<ListItem value="Item 3" />
</List>
```

When implementing this pattern, avoid using `React.Children.map` and `React.cloneElement` to map through the children and augment them. Instead, use React Context to provide state to subcomponents and connect them:

```jsx
// ❌ Don't:
function List ( props ) {
	const [ state, setState ] = useState();
	return (
		<div { ...props }>
			{ Children.map( props.children, ( child ) => cloneElement( child, { state } ) ) ) }
		</div>
	);
}
```

```jsx
// ✅ Do:
const ListContext = createContext();

function List( props ) {
	const [ state, setState ] = useState();
	return (
		<ListContext.Provider value={ state }>
			<div { ...props } />
		</ListContext.Provider>
	);
}

function ListItem( props ) {
	const state = useContext( ListContext );
	...
}
```

<!-- ## (Semi-)Controlled components

TBD

## Layout "responsibilities"

TBD — Components' layout responsibilities and boundaries (i.e., a component should only affect the layout of its children, not its own) -->

## Components & Hooks

One way to enable reusability and composition is to extract a component's underlying logic into a hook (living in a separate `hook.ts` file). The actual component (usually defined in a `component.tsx` file) can then invoke the hook and use its output to render the required DOM elements. For example:

```tsx
// in `hook.ts`
function useExampleComponent( props: PolymorphicComponentProps< ExampleProps, 'div' > ) {
	// Merge received props with the context system.
	const { isVisible, className, ...otherProps } = useContextSystem( props, 'Example' );

	// Any other reusable rendering logic (e.g. computing className, state, event listeners...)
	const cx = useCx();
	const classes = useMemo(
		() =>
			cx(
				styles.example,
				isVisible && styles.visible,
				className
			),
		[ className, isVisible ]
	);

	return {
		...otherProps,
		className: classes
	};
}

// in `component.tsx`
function Example(
	props: PolymorphicComponentProps< ExampleProps, 'div' >,
	forwardedRef: Ref< any >
) {
	const exampleProps = useExampleComponent( props );

	return <View { ...spacerProps } ref={ forwardedRef } />;
}
```

A couple of good examples of how hooks are used for composition are:

- the `Card` component, which builds on top of the `Surface` component by [calling the `useSurface` hook inside its own hook](/packages/components/src/card/card/hook.js);
- the `HStack` component, which builds on top of the `Flex` component and [calls the `useFlex` hook inside its own hook](/packages/components/src/h-stack/hook.js).

<!-- ## API Consinstency

[To be expanded] E.g.:

- Boolean component props should be prefixed with `is*` (e.g. `isChecked`), `has*` (e.g. `hasValue`) or `enable*` (e.g. `enableScroll`)
- Event callback props should be prefixed with `on*` (e.g. `onChanged`)
- Subcomponents naming conventions (e.g `CardBody` instead of `Card.Body`)
- ...

## Performance

TDB -->

## TypeScript

We strongly encourage using TypeScript for all new components. Components should be typed using the `WordPressComponent` type.

<!-- TODO: add to the previous paragraph once the composision section gets added to this document.
(more details about polymorphism can be found above in the "Components composition" section). -->

## Styling

All new component should be styled using [Emotion](https://emotion.sh/docs/introduction).

Note: Instead of using Emotion's standard `cx` function, the custom [`useCx` hook](/packages/components/src/utils/hooks/use-cx.ts) should be used instead.

## Context system

The `@wordpress/components` context system is based on [React's `Context` API](https://reactjs.org/docs/context.html), and is a way for components to adapt to the "context" they're being rendered in.

Components can use this system via a couple of functions:

- they can provide values using a shared `ContextSystemProvider` component
- they can connect to the Context via `contextConnect`
- they can read the "computed" values from the context via `useContextSystem`

An example of how this is used can be found in the [`Card` component family](/packages/components/src/card). For example, this is how the `Card` component injects the `size` and `isBorderless` props down to its `CardBody` subcomponent — which makes it use the correct spacing and border settings "auto-magically".

```jsx
//=========================================================================
// Simplified snippet from `packages/components/src/card/card/hook.js`
//=========================================================================
import { useContextSystem } from '../../ui/context';

export function useCard( props ) {
	// Read any derived registered prop from the Context System in the `Card` namespace
	const derivedProps = useContextSystem( props, 'Card' );

	// [...]

	return computedHookProps;
}

//=========================================================================
// Simplified snippet from `packages/components/src/card/card/component.js`
//=========================================================================
import { contextConnect, ContextSystemProvider } from '../../ui/context';

function Card( props, forwardedRef ) {
	const {
		size,
		isBorderless,
		...otherComputedHookProps
	} = useCard( props );

	// [...]

	// Prepare the additional props that should be passed to subcomponents via the Context System.
	const contextProviderValue = useMemo( () => {
		return {
			// Each key in this object should match a component's registered namespace.
			CardBody: {
				size,
				isBorderless,
			},
		};
	}, [ isBorderless, size ] );

	return (
		{ /* Write additional values to the Context System */ }
		<ContextSystemProvider value={ contextProviderValue }>
			{ /* [...] */ }
		</ContextSystemProvider>
	);
}

// Connect to the Context System under the `Card` namespace
const ConnectedCard = contextConnect( Card, 'Card' );
export default ConnectedCard;

//=========================================================================
// Simplified snippet from `packages/components/src/card/card-body/hook.js`
//=========================================================================
import { useContextSystem } from '../../ui/context';

export function useCardBody( props ) {
	// Read any derived registered prop from the Context System in the `CardBody` namespace.
	// If a `CardBody` component is rendered as a child of a `Card` component, the value of
	// the `size` prop will be the one set by the parent `Card` component via the Context
	// System (unless the prop gets explicitely set on the `CardBody` component).
	const { size = 'medium', ...otherDerivedProps } = useContextSystem( props, 'CardBody' );

	// [...]

	return computedHookProps;
}
```

## Unit tests

Please refer to the [JavaScript Testing Overview docs](/docs/contributors/code/testing-overview.md#snapshot-testing).

## Storybook

All new components should add stories to the project's [Storybook](https://storybook.js.org/). Each [story](https://storybook.js.org/docs/react/get-started/whats-a-story) captures the rendered state of a UI component in isolation. This greatly simplifies working on a given component, while also serving as an interactive form of documentation.

A component's story should be showcasing its different states — for example, the different variants of a  `Button`:

```jsx
import Button from '../';

export default { title: 'Components/Button', component: Button };

const Template = ( args ) => <Button { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	text: 'Default Button',
	isBusy: false,
	isSmall: false,
};

export const Primary = Template.bind( {} );
Primary.args = {
	...Default.args,
	text: 'Primary Button',
	variant: 'primary',
};
```

A great tool to use when writing stories is the [Storybook Controls addon](https://storybook.js.org/addons/@storybook/addon-controls). Ideally props should be exposed by using this addon, which provides a graphical UI to interact dynamically with the component without needing to write code. Avoid using [Knobs](https://storybook.js.org/addons/@storybook/addon-knobs) for new stories, as this addon is deprecated.

The default value of each control should coincide with the default value of the props (i.e. it should be `undefined` if a prop is not required). A story should, therefore, also explicitly show how values from the Context System are applied to (sub)components. A good example of how this may look like is the [`Card` story](https://wordpress.github.io/gutenberg/?path=/story/components-card--default) (code [here](/packages/components/src/card/stories/index.js)).

Storybook can be started on a local machine by running `npm run storybook:dev`. Alternatively, the components' catalogue (up to date with the latest code on `trunk`) can be found at [wordpress.github.io/gutenberg/](https://wordpress.github.io/gutenberg/).

## Documentation

All components, in addition to being typed, should be using JSDoc when necessary — as explained in the [Coding Guidelines](/docs/contributors/code/coding-guidelines.md#javascript-documentation-using-jsdoc).

Each component that is exported from the `@wordpress/components` package should include a `README.md` file, explaining how to use the component, showing examples, and documenting all the props.

## README example

````markdown
# `ComponentName`

<!-- If component is experimental, add the following section: -->
<div class="callout callout-alert">
This feature is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.
</div>

<!-- If component is deprecated, add the following section: -->
<div class="callout callout-alert">
This component is deprecated. Please use `{other component}` from the `{other package}` package instead.
</div>

Description of the component.

## Usage

Code example using correct markdown syntax and formatted using project's formatting rules. See [ItemGroup](/packages/components/src/item-group/item-group/README.md#usage) for a real-world example.

```jsx
import { ExampleComponent } from '@wordpress/components';

function Example() {
	return (
		<ExampleComponent>
			<p>Code is poetry</p>
		</ExampleComponent>
	);
}
```

## Props

The component accepts the following props:

### `propName`: Typescript style type i.e `string`, `number`, `( nextValue: string ) => void`

Prop description. With a new line before and after the description and before and after type/required blocks.

-   Required: Either `Yes` or `No`
<!-- If the prop has a default value, add the following line: -->
-   Default: [default value]

### Inherited props

Add this section when there are props that are drilled down into an internal component. See [ClipboardButton](/packages/components/src/clipboard-button/README.md) for an example.

<!-- Only add the next section if the component relies on the [Context System](#context-system) -->
## Context

See examples for this section for the [ItemGroup](/packages/components/src/item-group/item-group/README.md#context) and [`Card`](/packages/components/src/card/card/README.md#context) components.
````

## Folder structure

As a result of the above guidelines, all new components (except for shared utilities) should _generally_ follow this folder structure:

```text
component-name/
├── stories
│   └── index.js
├── test
│   └── index.js
├── component.tsx
├── context.ts
├── hook.ts
├── index.ts
├── README.md
├── styles.ts
└── types.ts
```

In case of a family of components (e.g. `Card` and `CardBody`, `CardFooter`, `CardHeader` ...), each component's implementation should live in a separate subfolder, while code common to the whole family of components (e.g types, utils, context...) should live in the family of components root folder:

```text
component-family-name/
├── sub-component-name/
│   ├── index.ts
│   ├── component.tsx
│   ├── hook.ts
│   ├── README.md
│   └── styles.ts
├── sub-component-name/
│   ├── index.ts
│   ├── component.tsx
│   ├── hook.ts
│   ├── README.md
│   └── styles.ts
├── stories
│   └── index.js
├── test
│   └── index.js
├── context.ts
├── index.ts
├── types.ts
└── utils.ts
```
