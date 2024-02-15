# DataViews

DataViews is a component that provides an API to render datasets using different types of layouts (table, grid, list, etc.).

## Installation

Install the module

```bash
npm install @wordpress/dataviews --save
```

## Usage

```jsx
const Example = () => {

	// Declare data, fields, etc.

	return (
		<DataViews
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ onChangeView }
			actions={ actions }
			paginationInfo={ paginationInfo }
		/>
	);
}
```

## Properties

### `data`: `Object[]`

The dataset to work with, represented as a one-dimensional array.

Example:

```js
const data = [
	{
		id: 1,
		title: "Title",
		author: "Admin",
		date: "2012-04-23T18:25:43.511Z"
	},
	{ /* ... */ }
]
```

By default, dataviews would use each record's `id` as an unique identifier. If it's not, the consumer should provide a `getItemId` function that returns one.

### `fields`: `Object[]`

The fields describe the visible items for each record in the dataset.

Example:

```js
const fields = [
	{
		id: 'title',
		header: 'Title',
		getValue: ({ item }) => item.title,
		enableHiding: false,
	},
	{
		id: 'date',
		header: 'Date',
		getValue: ( { item } ) => item.date,
		render: ( { item } ) => {
			return (
				<time>{ getFormattedDate( item.date ) }</time>
			);
		}
	},
	{
		id: 'author',
		header: __( 'Author' ),
		getValue: ( { item } ) => item.author,
		render: ( { item } ) => {
			return (
				<a href="...">{ item.author }</a>
			);
		},
		type: 'enumeration',
		elements: [
			{ value: 1, label: 'Admin' }
			{ value: 2, label: 'User' }
		]
		enableSorting: false
	}
]
```

Each field is an object with the following properties:

-   `id`: identifier for the field. Unique.
-   `header`: the field's name to be shown in the UI.
-   `getValue`: function that returns the value of the field.
-   `render`: function that renders the field. Optional, `getValue` will be used if `render` is not defined.
-   `elements`: the set of valid values for the field's value.
-   `type`: the type of the field. Used to generate the proper filters. Only `enumeration` available at the moment. See "Field types".
-   `enableSorting`: whether the data can be sorted by the given field. True by default.
-   `enableHiding`: whether the field can be hidden. True by default.
-   `filterBy`: configuration for the filters.
    - `operators`: the list of operators supported by the field.
    - `isPrimary`: whether it is a primary filter. A primary filter is always visible and is not listed in the "Add filter" component, except for the list layout where it behaves like a secondary filter.

### `view`: `object`

The view object configures how the dataset is visible to the user.

Example:

```js
const view = {
	type: 'table',
	search: '',
	filters: [
		{ field: 'author', operator: 'in', value: 2 },
		{ field: 'status', operator: 'in', value: 'publish,draft' }
	],
	page: 1,
	perPage: 5,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	hiddenFields: [ 'date', 'featured-image' ],
	layout: {},
}
```

Properties:

-   `type`: view type, one of `table`, `grid`, `list`. See "Layout types".
-   `search`: the text search applied to the dataset.
-   `filters`: the filters applied to the dataset. Each item describes:
    -   `field`: which field this filter is bound to.
    -   `operator`: which type of filter it is. One of `in`, `notIn`. See "Operator types".
    -   `value`: the actual value selected by the user.
-   `perPage`: number of records to show per page.
-   `page`: the page that is visible.
-   `sort`:
	- `field`: the field used for sorting the dataset.
	- `direction`: the direction to use for sorting, one of `asc` or `desc`.
-   `hiddenFields`: the `id` of the fields that are hidden in the UI.
-   `layout`: config that is specific to a particular layout type.
    -   `mediaField`: used by the `grid` and `list` layouts. The `id` of the field to be used for rendering each card's media.
    -   `primaryField`: used by the `table`, `grid` and `list` layouts. The `id` of the field to be highlighted in each row/card/item.

### `onChangeView`: `function`

The view is a representation of the visible state of the dataset: what type of layout is used to display it (table, grid, etc.), how the dataset is filtered, how it is sorted or paginated.

It's the consumer's responsibility to work with the data provider to make sure the user options defined through the view's config (sort, pagination, filters, etc.) are respected. The `onChangeView` prop allows the consumer to provide a callback to be called when the view config changes, to process the data accordingly.

The following example shows how a view object is used to query the WordPress REST API via the entities abstraction. The same can be done with any other data provider.

```js
function MyCustomPageTable() {
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 5,
		page: 1,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		search: '',
		filters: [
			{ field: 'author', operator: 'in', value: 2 },
			{ field: 'status', operator: 'in', value: 'publish,draft' }
		],
		hiddenFields: [ 'date', 'featured-image' ],
		layout: {},
	} );

	const queryArgs = useMemo( () => {
		const filters = {};
		view.filters.forEach( ( filter ) => {
			if ( filter.field === 'status' && filter.operator === 'in' ) {
				filters.status = filter.value;
			}
			if ( filter.field === 'author' && filter.operator === 'in' ) {
				filters.author = filter.value;
			}
		} );
		return {
			per_page: view.perPage,
			page: view.page,
			_embed: 'author',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			...filters,
		};
	}, [ view ] );

	const {
		records
	} = useEntityRecords( 'postType', 'page', queryArgs );

	return (
		<DataViews
			data={ records }
			view={ view }
			onChangeView={ setView }
			// ...
		/>
	);
}
```

### `actions`: `Object[]`

Collection of operations that can be performed upon each record.

Each action is an object with the following properties:

-   `id`: string, required. Unique identifier of the action. For example, `move-to-trash`.
-   `label`: string, required. User facing description of the action. For example, `Move to Trash`.
-   `isPrimary`: boolean, optional. Whether the action should be listed inline (primary) or in hidden in the more actions menu (secondary).
-   `icon`: icon to show for primary actions. It's required for a primary action, otherwise the action would be considered secondary.
-   `isEligible`: function, optional. Whether the action can be performed for a given record. If not present, the action is considered to be eligible for all items. It takes the given record as input.
-   `isDestructive`: boolean, optional. Whether the action can delete data, in which case the UI would communicate it via red color.
-   `callback`: function, required unless `RenderModal` is provided. Callback function that takes the record as input and performs the required action.
-   `RenderModal`: ReactElement, optional. If an action requires that some UI be rendered in a modal, it can provide a component which takes as props the record as `item` and a `closeModal` function. When this prop is provided, the `callback` property is ignored.
-   `hideModalHeader`: boolean, optional. This property is used in combination with `RenderModal` and controls the visibility of the modal's header. If the action renders a modal and doesn't hide the header, the action's label is going to be used in the modal's header.

### `paginationInfo`: `Object`

- `totalItems`: the total number of items in the datasets.
- `totalPages`: the total number of pages, taking into account the total items in the dataset and the number of items per page provided by the user.

### `search`: `boolean`

Whether the search input is enabled. `true` by default.

### `searchLabel`: `string`

What text to show in the search input. "Search" by default.

### `getItemId`: `function`

Function that receives an item and returns an unique identifier for it. By default, it uses the `id` of the item as unique identifier. If it's not, the consumer should provide their own.

### `isLoading`: `boolean`

Whether the data is loading. `false` by default.

### `supportedLayouts`: `String[]`

Array of layouts supported. By default, all are: `table`, `grid`, `list`.

### `deferredRendering`: `boolean`

Whether the items should be rendered asynchronously. Useful when there's a field that takes a lot of time (e.g.: previews). `false` by default.

### `onSelectionChange`: `function`

Callback that signals the user selected one of more items, and takes them as parameter. So far, only the `list` view implements it.

### `onDetailsChange`: `function`

Callback that signals the user triggered the details for one of more items, and takes them as paremeter. So far, only the `list` view implements it.

## Types

### Layouts

- `table`: the view uses a table layout.
- `grid`: the view uses a grid layout.
- `list`: the view uses a list layout.

### Fields

- `enumeration`: the field value should be taken and can be filtered from a closed list of elements.

### Operators

- `in`: operator to be used in filters for fields of type `enumeration`.
- `notIn`: operator to be used in filters for fields of type `enumeration`.

## Contributing to this package

This is an individual package that's part of the Gutenberg project. The project is organized as a monorepo. It's made up of multiple self-contained software packages, each with a specific purpose. The packages in this monorepo are published to [npm](https://www.npmjs.com/) and used by [WordPress](https://make.wordpress.org/core/) as well as other software projects.

To find out more about contributing to this package or Gutenberg as a whole, please read the project's main [contributor guide](https://github.com/WordPress/gutenberg/tree/HEAD/CONTRIBUTING.md).

<br /><br /><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
