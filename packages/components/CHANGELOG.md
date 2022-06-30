<!-- Learn how to maintain this file at https://github.com/WordPress/gutenberg/tree/HEAD/packages#maintaining-changelogs. -->

## Unreleased

## 19.14.0 (2022-06-29)

### Bug Fix

-   `ColorPicker`: Remove horizontal scrollbar when using HSL or RGB color input types. ([#41646](https://github.com/WordPress/gutenberg/pull/41646))

### Enhancements

-   Wrapped `ColorIndicator` in a `forwardRef` call ([#41587](https://github.com/WordPress/gutenberg/pull/41587)).
-   `BorderControl`: Improve TypeScript support. ([#41843](https://github.com/WordPress/gutenberg/pull/41843)).
-   `DatePicker`: highlight today's date. ([#41647](https://github.com/WordPress/gutenberg/pull/41647/)).
-   Allow automatic repositioning of `BorderBoxControl` and `ColorPalette` popovers within smaller viewports ([#41930](https://github.com/WordPress/gutenberg/pull/41930)).

### Internal

-   `Spinner`: Convert to TypeScript and update storybook ([#41540](https://github.com/WordPress/gutenberg/pull/41540/)).
-   `InputControl`: Add tests and update to use `@testing-library/user-event` ([#41421](https://github.com/WordPress/gutenberg/pull/41421)).
-   `FormToggle`: Convert to TypeScript ([#41729](https://github.com/WordPress/gutenberg/pull/41729)).
-   `ColorIndicator`: Convert to TypeScript ([#41587](https://github.com/WordPress/gutenberg/pull/41587)).
-   `Truncate`: Convert to TypeScript ([#41697](https://github.com/WordPress/gutenberg/pull/41697)).
-   `FocalPointPicker`: Refactor away from `_.clamp()` ([#41735](https://github.com/WordPress/gutenberg/pull/41735/)).
-   `RangeControl`: Refactor away from `_.clamp()` ([#41735](https://github.com/WordPress/gutenberg/pull/41735/)).
-   Refactor components `utils` away from `_.clamp()` ([#41735](https://github.com/WordPress/gutenberg/pull/41735/)).
-   `BoxControl`: Refactor utils away from `_.isNumber()` ([#41776](https://github.com/WordPress/gutenberg/pull/41776/)).
-   `Elevation`: Refactor away from `_.isNil()` ([#41785](https://github.com/WordPress/gutenberg/pull/41785/)).
-   `HStack`: Refactor away from `_.isNil()` ([#41785](https://github.com/WordPress/gutenberg/pull/41785/)).
-   `Truncate`: Refactor away from `_.isNil()` ([#41785](https://github.com/WordPress/gutenberg/pull/41785/)).
-   `VStack`: Convert to TypeScript ([#41850](https://github.com/WordPress/gutenberg/pull/41587)).
-   `AlignmentMatrixControl`: Refactor away from `_.flattenDeep()` in utils ([#41814](https://github.com/WordPress/gutenberg/pull/41814/)).
-   `AutoComplete`: Revert recent `exhaustive-deps` refactor ([#41820](https://github.com/WordPress/gutenberg/pull/41820)).
-   `Spacer`: Convert knobs to controls in Storybook ([#41851](https://github.com/WordPress/gutenberg/pull/41851)).
-   `Heading`: Complete TypeScript migration ([#41921](https://github.com/WordPress/gutenberg/pull/41921)).
-   `Navigation`: Refactor away from Lodash functions ([#41865](https://github.com/WordPress/gutenberg/pull/41865/)).
-   `CustomGradientPicker`: Refactor away from Lodash ([#41901](https://github.com/WordPress/gutenberg/pull/41901/)).
-   `SegmentedControl`: Refactor away from `_.values()` ([#41905](https://github.com/WordPress/gutenberg/pull/41905/)).
-   `DimensionControl`: Refactor docs away from `_.partialRight()` ([#41909](https://github.com/WordPress/gutenberg/pull/41909/)).
-   `NavigationItem` updated to ignore `react/exhuastive-deps` eslint rule ([#41639](https://github.com/WordPress/gutenberg/pull/41639)).

## 19.13.0 (2022-06-15)

### Bug Fix

-   `Tooltip`: Opt in to `__unstableShift` to ensure that the Tooltip is always within the viewport. ([#41524](https://github.com/WordPress/gutenberg/pull/41524))
-   `FormTokenField`: Do not suggest the selected one even if `{ value: string }` is passed ([#41216](https://github.com/WordPress/gutenberg/pull/41216)).
-   `CustomGradientBar`: Fix insertion and control point positioning to more closely follow cursor. ([#41492](https://github.com/WordPress/gutenberg/pull/41492))
-   `FormTokenField`: Added Padding to resolve close button overlap issue ([#41556](https://github.com/WordPress/gutenberg/pull/41556)).
-   `ComboboxControl`: fix the autofocus behavior after resetting the value. ([#41737](https://github.com/WordPress/gutenberg/pull/41737)).

### Enhancements

-   `AnglePickerControl`: Use NumberControl as input field ([#41472](https://github.com/WordPress/gutenberg/pull/41472)).

### Internal

-   `FormTokenField`: Convert to TypeScript and refactor to functional component ([#41216](https://github.com/WordPress/gutenberg/pull/41216)).
-   `Draggable`: updated to satisfy `react/exhuastive-deps` eslint rule ([#41499](https://github.com/WordPress/gutenberg/pull/41499))
-   `RadioControl`: Convert to TypeScript ([#41568](https://github.com/WordPress/gutenberg/pull/41568)).
-   `Flex` updated to satisfy `react/exhuastive-deps` eslint rule ([#41507](https://github.com/WordPress/gutenberg/pull/41507)).
-   `CustomGradientBar` updated to satisfy `react/exhuastive-deps` eslint rule ([#41463](https://github.com/WordPress/gutenberg/pull/41463))
-   `TreeSelect`: Convert to TypeScript ([#41536](https://github.com/WordPress/gutenberg/pull/41536)).
-   `FontSizePicker`: updated to satisfy `react/exhuastive-deps` eslint rule ([#41600](https://github.com/WordPress/gutenberg/pull/41600)).
-   `ZStack`: Convert component story to TypeScript and add inline docs ([#41694](https://github.com/WordPress/gutenberg/pull/41694)).
-   `Dropdown`: Make sure cleanup (closing the dropdown) only runs when the menu has actually been opened.
-   Enhance the TypeScript migration guidelines ([#41669](https://github.com/WordPress/gutenberg/pull/41669)).
-   `ExternalLink`: Convert to TypeScript ([#41681](https://github.com/WordPress/gutenberg/pull/41681)).
-   `InputControl` updated to satisfy `react/exhuastive-deps` eslint rule ([#41601](https://github.com/WordPress/gutenberg/pull/41601))
-   `Modal`: updated to satisfy `react/exhuastive-deps` eslint rule ([#41610](https://github.com/WordPress/gutenberg/pull/41610))

### Experimental

-   `Navigation`: improve unit tests by using `@testing-library/user-event` and modern `@testing-library` assertions; add unit test for controlled component ([#41668](https://github.com/WordPress/gutenberg/pull/41668)).

## 19.12.0 (2022-06-01)

### Bug Fix

-   `Popover`, `Dropdown`, `CustomGradientPicker`: Fix dropdown positioning by always targeting the rendered toggle, and switch off width in the Popover size middleware to stop reducing the width of the popover. ([#41361](https://github.com/WordPress/gutenberg/pull/41361))
-   Fix `InputControl` blocking undo/redo while focused. ([#40518](https://github.com/WordPress/gutenberg/pull/40518))
-   `ColorPalette`: Correctly update color name label when CSS variables are involved ([#41461](https://github.com/WordPress/gutenberg/pull/41461)).

### Enhancements

-   `SelectControl`: Add `__nextHasNoMarginBottom` prop for opting into the new margin-free styles ([#41269](https://github.com/WordPress/gutenberg/pull/41269)).
-   `ColorPicker`: Strip leading hash character from hex values pasted into input. ([#41223](https://github.com/WordPress/gutenberg/pull/41223))
-   `ColorPicker`: Display detailed color inputs by default. ([#41222](https://github.com/WordPress/gutenberg/pull/41222))
-   Updated design for the `DateTimePicker`, `DatePicker` and `TimePicker` components ([#41097](https://github.com/WordPress/gutenberg/pull/41097)).
-   `DateTimePicker`: Add `__nextRemoveHelpButton` and `__nextRemoveResetButton` for opting into new behaviour where there is no Help and Reset button ([#41097](https://github.com/WordPress/gutenberg/pull/41097)).

### Internal

-   `AlignmentMatrixControl` updated to satisfy `react/exhuastive-deps` eslint rule ([#41167](https://github.com/WordPress/gutenberg/pull/41167))
-   `BorderControl` updated to satisfy `react/exhuastive-deps` eslint rule ([#41259](https://github.com/WordPress/gutenberg/pull/41259))
-   `CheckboxControl`: Add unit tests ([#41165](https://github.com/WordPress/gutenberg/pull/41165)).
-   `BorderBoxControl`: fix some layout misalignments, especially for RTL users ([#41254](https://github.com/WordPress/gutenberg/pull/41254)).
-   `TimePicker`: Update unit tests to use `@testing-library/user-event` ([#41270](https://github.com/WordPress/gutenberg/pull/41270)).
-   `DateTimePicker`: Update `moment` to 2.26.0 and update `react-date` typings ([#41266](https://github.com/WordPress/gutenberg/pull/41266)).
-   `TextareaControl`: Convert to TypeScript ([#41215](https://github.com/WordPress/gutenberg/pull/41215)).
-   `BoxControl`: Update unit tests to use `@testing-library/user-event` ([#41422](https://github.com/WordPress/gutenberg/pull/41422)).
-   `Surface`: Convert to TypeScript ([#41212](https://github.com/WordPress/gutenberg/pull/41212)).
-   `Autocomplete` updated to satisfy `react/exhuastive-deps` eslint rule ([#41382](https://github.com/WordPress/gutenberg/pull/41382))
-   `Dropdown` updated to satisfy `react/exhuastive-deps` eslint rule ([#41505](https://github.com/WordPress/gutenberg/pull/41505))
-   `DateDayPicker` updated to satisfy `react/exhuastive-deps` eslint rule ([#41470](https://github.com/WordPress/gutenberg/pull/41470)).

### Experimental

-   `Spacer`: Add RTL support. ([#41172](https://github.com/WordPress/gutenberg/pull/41172))

## 19.11.0 (2022-05-18)

### Enhancements

-   `BorderControl` now only displays the reset button in its popover when selections have already been made. ([#40917](https://github.com/WordPress/gutenberg/pull/40917))
-   `BorderControl` & `BorderBoxControl`: Add `__next36pxDefaultSize` flag for larger default size ([#40920](https://github.com/WordPress/gutenberg/pull/40920)).
-   `BorderControl` improved focus and border radius styling for component. ([#40951](https://github.com/WordPress/gutenberg/pull/40951))
-   Improve focused `CircularOptionPicker` styling ([#40990](https://github.com/WordPress/gutenberg/pull/40990))
-   `BorderControl`: Make border color consistent with other controls ([#40921](https://github.com/WordPress/gutenberg/pull/40921))
-   `SelectControl`: Remove `lineHeight` setting to fix issue with font descenders being cut off ([#40985](https://github.com/WordPress/gutenberg/pull/40985))

### Internal

-   `DateTimePicker`: Convert to TypeScript ([#40775](https://github.com/WordPress/gutenberg/pull/40775)).
-   `DateTimePicker`: Convert unit tests to TypeScript ([#40957](https://github.com/WordPress/gutenberg/pull/40957)).
-   `CheckboxControl`: Convert to TypeScript ([#40915](https://github.com/WordPress/gutenberg/pull/40915)).
-   `ButtonGroup`: Convert to TypeScript ([#41007](https://github.com/WordPress/gutenberg/pull/41007)).
-   `Popover`: refactor component to use the `floating-ui` library internally ([#40740](https://github.com/WordPress/gutenberg/pull/40740)).

## 19.10.0 (2022-05-04)

### Internal

-   `UnitControl`: migrate unit tests to TypeScript ([#40697](https://github.com/WordPress/gutenberg/pull/40697)).
-   `DatePicker`: Add improved unit tests ([#40754](https://github.com/WordPress/gutenberg/pull/40754)).
-   Setup `user-event` in unit tests inline, once per test ([#40839](https://github.com/WordPress/gutenberg/pull/40839)).
-   `DatePicker`: Update `react-dates` to 21.8.0 ([#40801](https://github.com/WordPress/gutenberg/pull/40801)).

### Enhancements

-   `InputControl`: Add `__next36pxDefaultSize` flag for larger default size ([#40622](https://github.com/WordPress/gutenberg/pull/40622)).
-   `UnitControl`: Add `__next36pxDefaultSize` flag for larger default size ([#40627](https://github.com/WordPress/gutenberg/pull/40627)).
-   `SelectControl`: Improved TypeScript support ([#40737](https://github.com/WordPress/gutenberg/pull/40737)).
-   `ToggleControlGroup`: Switch to internal `Icon` component for dashicon support ([40717](https://github.com/WordPress/gutenberg/pull/40717)).
-   Improve `ToolsPanel` accessibility. ([#40716](https://github.com/WordPress/gutenberg/pull/40716))

### Bug Fix

-   The `Button` component now displays the label as the tooltip for icon only buttons. ([#40716](https://github.com/WordPress/gutenberg/pull/40716))
-   Use fake timers and fix usage of async methods from `@testing-library/user-event`. ([#40790](https://github.com/WordPress/gutenberg/pull/40790))
-   UnitControl: avoid calling onChange callback twice when unit changes. ([#40796](https://github.com/WordPress/gutenberg/pull/40796))
-   `UnitControl`: show unit label when units prop has only one unit. ([#40784](https://github.com/WordPress/gutenberg/pull/40784))
-   `AnglePickerControl`: Fix closing of gradient popover when the angle control is clicked. ([#40735](https://github.com/WordPress/gutenberg/pull/40735))

### Internal

-   `TextControl`: Convert to TypeScript ([#40633](https://github.com/WordPress/gutenberg/pull/40633)).

## 19.9.0 (2022-04-21)

### Bug Fix

-   Consolidate the main black colors to gray-900. Affects `AlignmentMatrixControl`, `InputControl`, `Heading`, `SelectControl`, `Spinner (Experimental)`, and `Text` ([#40391](https://github.com/WordPress/gutenberg/pull/40391)).

### Internal

-   Remove individual color object exports from the `utils/colors-values.js` file. Colors should now be used from the main `COLORS` export([#40387](https://github.com/WordPress/gutenberg/pull/40387)).

### Bug Fix

-   `InputControl`: allow user to input a value interactively in Storybook, by removing default value argument ([#40410](https://github.com/WordPress/gutenberg/pull/40410)).

## 19.8.0 (2022-04-08)

### Enhancements

-   Update `BorderControl` and `BorderBoxControl` to allow the passing of custom class names to popovers ([#39753](https://github.com/WordPress/gutenberg/pull/39753)).
-   `ToggleGroupControl`: Reintroduce backdrop animation ([#40021](https://github.com/WordPress/gutenberg/pull/40021)).
-   `Card`: Adjust border radius effective size ([#40032](https://github.com/WordPress/gutenberg/pull/40032)).
-   `InputControl`: Improved TypeScript type annotations ([#40119](https://github.com/WordPress/gutenberg/pull/40119)).

### Internal

-   `BaseControl`: Convert to TypeScript ([#39468](https://github.com/WordPress/gutenberg/pull/39468)).

### New Features

-   Add `BorderControl` component ([#37769](https://github.com/WordPress/gutenberg/pull/37769)).
-   Add `BorderBoxControl` component ([#38876](https://github.com/WordPress/gutenberg/pull/38876)).
-   Add `ToggleGroupControlOptionIcon` component ([#39760](https://github.com/WordPress/gutenberg/pull/39760)).

### Bug Fix

-   Use `Object.assign` instead of `{ ...spread }` syntax to avoid errors in the code generated by TypeScript ([#39932](https://github.com/WordPress/gutenberg/pull/39932)).
-   `ItemGroup`: Ensure that the Item's text color is not overriden by the user agent's button color ([#40055](https://github.com/WordPress/gutenberg/pull/40055)).
-   `Surface`: Use updated UI text color `#1e1e1e` instead of `#000` ([#40055](https://github.com/WordPress/gutenberg/pull/40055)).
-   `CustomSelectControl`: Make chevron consistent with `SelectControl` ([#40049](https://github.com/WordPress/gutenberg/pull/40049)).

## 19.7.0 (2022-03-23)

### Enhancements

-   `CustomSelectControl`: Add `__next36pxDefaultSize` flag for larger default size ([#39401](https://github.com/WordPress/gutenberg/pull/39401)).
-   `BaseControl`: Add `__nextHasNoMarginBottom` prop for opting into the new margin-free styles ([#39325](https://github.com/WordPress/gutenberg/pull/39325)).
-   `Divider`: Make the divider visible by default (`display: inline`) in flow layout containers when the divider orientation is vertical ([#39316](https://github.com/WordPress/gutenberg/pull/39316)).
-   Stop using deprecated `event.keyCode` in favor of `event.key` for keyboard events in `UnitControl` and `InputControl`. ([#39360](https://github.com/WordPress/gutenberg/pull/39360))
-   `ColorPalette`: refine custom color button's label. ([#39386](https://github.com/WordPress/gutenberg/pull/39386))
-   Add `onClick` prop on `FormFileUpload`. ([#39268](https://github.com/WordPress/gutenberg/pull/39268))
-   `FocalPointPicker`: stop using `UnitControl`'s deprecated `unit` prop ([#39504](https://github.com/WordPress/gutenberg/pull/39504)).
-   `CheckboxControl`: Add support for the `indeterminate` state ([#39462](https://github.com/WordPress/gutenberg/pull/39462)).
-   `UnitControl`: add support for the `onBlur` prop ([#39589](https://github.com/WordPress/gutenberg/pull/39589)).

### Internal

-   Delete the `composeStateReducers` utility function ([#39262](https://github.com/WordPress/gutenberg/pull/39262)).
-   `BoxControl`: stop using `UnitControl`'s deprecated `unit` prop ([#39511](https://github.com/WordPress/gutenberg/pull/39511)).

### Bug Fix

-   `NumberControl`: commit (and constrain) value on `blur` event ([#39186](https://github.com/WordPress/gutenberg/pull/39186)).
-   Fix `UnitControl`'s reset of unit when the quantity value is cleared. ([#39531](https://github.com/WordPress/gutenberg/pull/39531/)).
-   `ResizableBox`: Ensure tooltip text remains on a single line. ([#39623](https://github.com/WordPress/gutenberg/pull/39623)).

### Deprecation

-   `unit` prop in `UnitControl` marked as deprecated ([#39503](https://github.com/WordPress/gutenberg/pull/39503)).

## 19.6.0 (2022-03-11)

### Enhancements

-   `ConfirmDialog`: Add support for custom label text on the confirmation and cancelation buttons ([#38994](https://github.com/WordPress/gutenberg/pull/38994))
-   `InputControl`: Allow `onBlur` for empty values to commit the change when `isPressEnterToChange` is true, and move reset behavior to the ESCAPE key. ([#39109](https://github.com/WordPress/gutenberg/pull/39109)).
-   `TreeGrid`: Add tests for Home/End keyboard navigation. Add `onFocusRow` callback for Home/End keyboard navigation, this was missed in the implementation PR. Modify test for expanding/collapsing a row as row 1 implements this now. Update README with latest changes. ([#39302](https://github.com/WordPress/gutenberg/pull/39302))
-   `ToggleGroupControlOption`: Calculate width from button content and remove `LabelPlaceholderView` ([#39345](https://github.com/WordPress/gutenberg/pull/39345))

### Bug Fix

-   Normalize `font-family` on `Button`, `ColorPalette`, `ComoboboxControl`, `DateTimePicker`, `FormTokenField`, `InputControl`, `SelectControl`, and `ToggleGroupControl` ([#38969](https://github.com/WordPress/gutenberg/pull/38969)).
-   Fix input value selection of `InputControl`-based controls in Firefox and Safari with axial constraint of drag gesture ([#38968](https://github.com/WordPress/gutenberg/pull/38968)).
-   Fix `UnitControl`'s behavior around updating the unit when a new `value` is passed (i.e. in controlled mode). ([#39148](https://github.com/WordPress/gutenberg/pull/39148)).

## 19.5.0 (2022-02-23)

### Bug Fix

-   Fix spin buttons of number inputs in Safari ([#38840](https://github.com/WordPress/gutenberg/pull/38840))
-   Show tooltip on toggle custom size button in FontSizePicker ([#38985](https://github.com/WordPress/gutenberg/pull/38985))

### Enhancements

-   `TreeGrid`: Add tests for `onCollapseRow`, `onExpandRow`, and `onFocusRow` callback functions. ([#38942](https://github.com/WordPress/gutenberg/pull/38942)).
-   `TreeGrid`: Update callback tests to use `TreeGridRow` and `TreeGridCell` sub-components. ([#39002](https://github.com/WordPress/gutenberg/pull/39002)).

## 19.4.0 (2022-02-10)

### Bug Fix

-   Components: Fix `Slot`/`Fill` Emotion `StyleProvider` ([#38237](https://github.com/WordPress/gutenberg/pull/38237))
-   Reduce height and min-width of the reset button on `ComboBoxControl` for consistency. ([#38020](https://github.com/WordPress/gutenberg/pull/38020))
-   Removed unused `rememo` dependency ([#38388](https://github.com/WordPress/gutenberg/pull/38388)).
-   Added `__unstableInputWidth` to `UnitControl` type definition ([#38429](https://github.com/WordPress/gutenberg/pull/38429)).
-   Fixed typing errors for `ColorPicker` ([#38430](https://github.com/WordPress/gutenberg/pull/38430)).
-   Updated destructuring of `Dropdown` props to be TypeScript friendly ([#38431](https://github.com/WordPress/gutenberg/pull/38431)).
-   Added `ts-nocheck` to `ColorIndicator` so it can be used in typed components ([#38433](https://github.com/WordPress/gutenberg/pull/38433)).
-   Added `cx` as a dependency of `useMemo` across the whole package, in order to recalculate the classnames correctly when a component is rendered across more than one `StyleProvider` ([#38541](https://github.com/WordPress/gutenberg/pull/38541)).

### Enhancements

-   Update the visual design of the `Spinner` component. ([#37551](https://github.com/WordPress/gutenberg/pull/37551))
-   `TreeGrid` accessibility enhancements around the expand/collapse functionality. ([#38358](https://github.com/WordPress/gutenberg/pull/38358))
-   `TreeGrid` accessibility: improve browser support for Left Arrow focus to parent row in child row. ([#38639](https://github.com/WordPress/gutenberg/pull/38639))
-   `TreeGrid` accessibility: Add Home/End keys for better keyboard navigation. ([#38679](https://github.com/WordPress/gutenberg/pull/38679))
-   Add `resolvePoint` prop to `FocalPointPicker` to allow updating the value of the picker after a user interaction ([#38247](https://github.com/WordPress/gutenberg/pull/38247))
-   `TreeGrid`: Allow SHIFT key to be held, and add `onFocusRow` callback to the `TreeGrid` component, fired when focus is shifted from one row to another via Up and Down arrow keys. ([#38314](https://github.com/WordPress/gutenberg/pull/38314))

### Experimental

-   `Navigator`: rename `push`/`pop` to `goTo`/`goBack` ([#38582](https://github.com/WordPress/gutenberg/pull/38582))
-   `Navigator`: add `NavigatorButton` and `NavigatorBackButton` components ([#38634](https://github.com/WordPress/gutenberg/pull/38634))
-   `UnitControl`: tidy up utilities and types. In particular, change the type of parsed quantities to `number` (previously it could have been a `string` too). ([#38987](https://github.com/WordPress/gutenberg/pull/38987]))

## 19.3.0 (2022-01-27)

### Enhancements

-   Refine `ExternalLink` to be same size as the text, to appear more as a glyph than an icon. ([#37859](https://github.com/WordPress/gutenberg/pull/37859))
-   Updated `ToolsPanel` header icon to only show "plus" icon when all items are optional and all are currently hidden ([#38262](https://github.com/WordPress/gutenberg/pull/38262))
-   `TreeGrid`: Fix keyboard navigation for expand/collapse table rows in Firefox ([#37983](https://github.com/WordPress/gutenberg/pull/37983))

### Bug Fix

-   Update the `HexInput` component to accept a pasted value that contains a starting #
-   Update `ToggleGroupControl` background active state to use a simple background color instead of animated backdrop ([38008](https://github.com/WordPress/gutenberg/pull/38008))
-   Update label spacing for the `BoxControl`, `CustomGradientPicker`, `FormTokenField`, `InputControl`, and `ToolsPanel` components to use a bottom margin of `8px` for consistency. ([#37844](https://github.com/WordPress/gutenberg/pull/37844))
-   Add missing styles to the `BaseControl.VisualLabel` component. ([#37747](https://github.com/WordPress/gutenberg/pull/37747))
-   Prevent keyDown events from propagating up in `CustomSelectControl` ([#30557](https://github.com/WordPress/gutenberg/pull/30557))
-   Mark `children` prop as optional in `SelectControl` ([#37872](https://github.com/WordPress/gutenberg/pull/37872))
-   Add memoization of callbacks and context to prevent unnecessary rerenders of the `ToolsPanel` ([#38037](https://github.com/WordPress/gutenberg/pull/38037))
-   Fix space between icons and rail `RangeControl` ([#36935](https://github.com/WordPress/gutenberg/pull/36935))
-   Increase z-index of `ConfirmDialog` to render on top of parent `Popover` components ([#37959](https://github.com/WordPress/gutenberg/pull/37959))

### Experimental

-   Add basic history location support to `Navigator` ([#37416](https://github.com/WordPress/gutenberg/pull/37416)).
-   Add focus restoration to `Navigator` ([#38149](https://github.com/WordPress/gutenberg/pull/38149)).

## 19.2.0 (2022-01-04)

### Experimental

-   Reinstated the ability to pass additional props to the `ToolsPanel` ([#36428](https://github.com/WordPress/gutenberg/pull/36428)).
-   Added an `__unstable-large` size variant to `InputControl`, `SelectControl`, and `UnitControl` for selective migration to the larger 40px heights. ([#35646](https://github.com/WordPress/gutenberg/pull/35646)).
-   Fixed inconsistent padding in `UnitControl` ([#35646](https://github.com/WordPress/gutenberg/pull/35646)).
-   Added support for RTL behavior for the `ZStack`'s `offset` prop ([#36769](https://github.com/WordPress/gutenberg/pull/36769))
-   Fixed race conditions causing conditionally displayed `ToolsPanelItem` components to be erroneously deregistered ([#36588](https://github.com/WordPress/gutenberg/pull/36588)).
-   Added `__experimentalHideHeader` prop to `Modal` component ([#36831](https://github.com/WordPress/gutenberg/pull/36831)).
-   Added experimental `ConfirmDialog` component ([#34153](https://github.com/WordPress/gutenberg/pull/34153)).
-   Divider: improve support for vertical orientation and RTL styles, use start/end logical props instead of top/bottom, change border-color to `currentColor` ([#36579](https://github.com/WordPress/gutenberg/pull/36579)).
-   `ToggleGroupControl`: Avoid calling `onChange` if radio state changed from an incoming value ([#37224](https://github.com/WordPress/gutenberg/pull/37224/)).
-   `ToggleGroupControl`: fix the computation of the backdrop dimensions when rendered in a Popover ([#37067](https://github.com/WordPress/gutenberg/pull/37067)).
-   Add `__experimentalIsRenderedInSidebar` property to the `GradientPicker`and `CustomGradientPicker`. The property changes the color popover behavior to have a special placement behavior appropriate for sidebar UI's.
-   Add `first` and `last` classes to displayed `ToolsPanelItem` group within a `ToolsPanel` ([#37546](https://github.com/WordPress/gutenberg/pull/37546))

### Bug Fix

-   Fixed spacing between `BaseControl` fields and help text within the `ToolsPanel` ([#36334](https://github.com/WordPress/gutenberg/pull/36334))
-   Replaced hardcoded blue in `ColorPicker` with UI theme color ([#36153](https://github.com/WordPress/gutenberg/pull/36153)).
-   Fixed empty `ToolsPanel` height by correcting menu button line-height ([#36895](https://github.com/WordPress/gutenberg/pull/36895)).
-   Normalized label line-height and spacing within the `ToolsPanel` ([36387](https://github.com/WordPress/gutenberg/pull/36387))
-   Remove unused `reakit-utils` from peer dependencies ([#37369](https://github.com/WordPress/gutenberg/pull/37369)).
-   Update all Emotion dependencies to the latest version to ensure they work correctly with React types ([#37365](https://github.com/WordPress/gutenberg/pull/37365)).
-   `DateTimePicker`: Fix the date format associated to the `is12Hour` prop ([#37465](https://github.com/WordPress/gutenberg/pull/37465))
-   Allowed `ToolsPanel` to register items when `panelId` is `null` due to multiple block selection ([37216](https://github.com/WordPress/gutenberg/pull/37216)).

### Enhancements

-   Wrapped `Modal` in a `forwardRef` call ([#36831](https://github.com/WordPress/gutenberg/pull/36831)).
-   Refactor `DateTime` class component to functional component ([#36835](https://github.com/WordPress/gutenberg/pull/36835))
-   Unify styles for `ColorIndicator` with how they appear in Global Styles ([#37028](https://github.com/WordPress/gutenberg/pull/37028))
-   Add support for rendering the `ColorPalette` in a `Dropdown` when opened in the sidebar ([#37067](https://github.com/WordPress/gutenberg/pull/37067))
-   Show an incremental sequence of numbers (1/2/3/4/5) as a label of the font size, when we have at most five font sizes, where at least one the them contains a complex css value(clamp, var, etc..). We do this because complex css values cannot be calculated properly and the incremental sequence of numbers as labels can help the user better mentally map the different available font sizes. ([#37038](https://github.com/WordPress/gutenberg/pull/37038))
-   Add support for proper borders to color indicators ([#37500](https://github.com/WordPress/gutenberg/pull/37500))
-   Refactor `SuggestionsList` class component to functional component([#36924](https://github.com/WordPress/gutenberg/pull/36924/))

## 19.1.4 (2021-12-13)

### Bug Fix

-   Improve accessibility and visibility in `ColorPallete` ([#36925](https://github.com/WordPress/gutenberg/pull/36925))

## 19.1.3 (2021-12-06)

-   Fix missing version information in `CHANGELOG.md`.

## 19.1.2 (2021-12-06)

### Bug Fix

-   Fixed `GradientPicker` not displaying `CustomGradientPicker` when no gradients are provided ([#36900](https://github.com/WordPress/gutenberg/pull/36900)).
-   Fixed error thrown in `ColorPicker` when used in controlled state in color gradients ([#36941](https://github.com/WordPress/gutenberg/pull/36941)).
-   Updated readme to include default value introduced in fix for unexpected movements in the `ColorPicker` ([#35670](https://github.com/WordPress/gutenberg/pull/35670)).
-   Added support for the legacy `extraSmall` value for the `size` prop in the `Card` component ([#37097](https://github.com/WordPress/gutenberg/pull/37097)).

## 19.1.0 (2021-11-29)

### Enhancements

-   Added a `showTooltip` prop to `ToggleGroupControlOption` in order to display tooltip text (using `<Tooltip />`). ([#36726](https://github.com/WordPress/gutenberg/pull/36726)).

### Bug Fix

-   Fixed a bug which prevented setting `PM` hours correctly in the `DateTimePicker` ([#36878](https://github.com/WordPress/gutenberg/pull/36878)).

## 19.0.2 (2021-11-15)

-   Remove erroneous use of `??=` syntax from `build-module`.

## 19.0.1 (2021-11-07)

### Enhancements

-   Updated the `ColorPalette` and `GradientPicker` components to the latest designs ([#35970](https://github.com/WordPress/gutenberg/pull/35970)).

### Experimental

-   Updated the `ToolsPanel` to use `Grid` internally to manage panel layout ([#35621](https://github.com/WordPress/gutenberg/pull/35621)).
-   Added experimental `__experimentalHasMultipleOrigins` prop to the `ColorPalette` and `GradientPicker` components ([#35970](https://github.com/WordPress/gutenberg/pull/35970)).

## 19.0.0 (2021-10-22)

### New Features

-   Added support for `step="any"` in `NumberControl` and `RangeControl` ([#34542](https://github.com/WordPress/gutenberg/pull/34542)).

### Enhancements

-   Removed the separator shown between `ToggleGroupControl` items ([#35497](https://github.com/WordPress/gutenberg/pull/35497)).
-   The `ColorPicker` component property `onChangeComplete`, a function accepting a color object, was replaced with the property `onChange`, a function accepting a string on ([#35220](https://github.com/WordPress/gutenberg/pull/35220)).
-   The property `disableAlpha`, was removed from the `ColorPicker` component. Use the new opposite property `enableAlpha` instead ([#35220](https://github.com/WordPress/gutenberg/pull/35220)).

### Experimental

-   Removed the `fieldset` wrapper from the `FontAppearanceControl` component ([35461](https://github.com/WordPress/gutenberg/pull/35461)).
-   Refactored the `ToggleGroupControl` component's structure and embedded `ToggleGroupControlButton` directly into `ToggleGroupControlOption` ([#35600](https://github.com/WordPress/gutenberg/pull/35600)).
-   Added support for showing an experimental hint in `CustomSelectControl` ([#35673](https://github.com/WordPress/gutenberg/pull/35673)).

### Breaking Changes

-   The `color` property a `tinycolor2` color object passed on `onChangeComplete` property of the `ColorPicker` component was removed. Please use the new `onChange` property that accepts a string color representation ([#35562](https://github.com/WordPress/gutenberg/pull/35562)).

## 18.0.0 (2021-10-12)

### Breaking Changes

-   Removed the deprecated `position` and `menuLabel` from the `DropdownMenu` component ([#34537](https://github.com/WordPress/gutenberg/pull/34537)).
-   Removed the deprecated `onClickOutside` prop from the `Popover` component ([#34537](https://github.com/WordPress/gutenberg/pull/34537)).
-   Changed `RangeControl` component to not apply `shiftStep` to inputs from its `<input type="range"/>` ([35020](https://github.com/WordPress/gutenberg/pull/35020)).
-   Removed `isAction` prop from `Item`. The component will now rely on `onClick` to render as a `button` ([35152](https://github.com/WordPress/gutenberg/pull/35152)).

### New Features

-   Add an experimental `Navigator` components ([#34904](https://github.com/WordPress/gutenberg/pull/34904)) as a replacement for the previous `Navigation` related components.
-   Update the `ColorPicker` component to the latest design ([#35220](https://github.com/WordPress/gutenberg/pull/35220))

### Bug Fix

-   Fixed rounding of value in `RangeControl` component when it loses focus while the `SHIFT` key is held. ([#35020](https://github.com/WordPress/gutenberg/pull/35020)).

### Internal

-   Deleted the `createComponent` utility function ([#34929](https://github.com/WordPress/gutenberg/pull/34929)).
-   Deleted the `useJumpStep` utility function ([#35561](https://github.com/WordPress/gutenberg/pull/35561)).

## 17.0.0 (2021-09-09)

### Breaking Change

-   Removed a min-width from the `DropdownMenu` component, allowing the menu to accommodate thin contents like vertical tools menus ([#33995](https://github.com/WordPress/gutenberg/pull/33995)).

### Bug Fix

-   Fixed RTL styles in `Flex` component ([#33729](https://github.com/WordPress/gutenberg/pull/33729)).
-   Fixed unit test errors caused by `CSS.supports` being called in a non-browser environment ([#34572](https://github.com/WordPress/gutenberg/pull/34572)).
-   Fixed `ToggleGroupControl`'s backdrop not updating when changing the `isAdaptiveWidth` property ([#34595](https://github.com/WordPress/gutenberg/pull/34595)).

### Internal

-   Renamed `PolymorphicComponent*` types to `WordPressComponent*` ([#34330](https://github.com/WordPress/gutenberg/pull/34330)).

## 16.0.0 (2021-08-23)

### Breaking Change

-   Updated the visual styles of the RangeControl component ([#33824](https://github.com/WordPress/gutenberg/pull/33824)).

### New Feature

-   Add `hideLabelFromVision` prop to `RangeControl` ([#33714](https://github.com/WordPress/gutenberg/pull/33714)).

### Bug Fix

-   Listen to `resize` events correctly in `useBreakpointIndex`. This hook is used in `useResponsiveValue` and consequently in the `Flex` and `Grid` components ([#33902](https://github.com/WordPress/gutenberg/pull/33902))

## 15.0.0 (2021-07-29)

### Breaking Change

-   Upgraded React components to work with v17.0 ([#29118](https://github.com/WordPress/gutenberg/pull/29118)). There are no new features in React v17.0 as explained in the [blog post](https://reactjs.org/blog/2020/10/20/react-v17.html).

### Deprecation

-   `isScrollable` prop in `CardBody` default value changed from `true` to `false` ([#33490](https://github.com/WordPress/gutenberg/pull/33490))

### Bug Fix

-   Added back `box-sizing: border-box` rule to `CardBody`, `CardHeader` and `CardFooter` components [#33511](https://github.com/WordPress/gutenberg/pull/33511).

## 14.2.0 (2021-07-21)

### New Feature

-   Update the border color used in `CardBody`, `CardHeader`, `CardFooter`, and `CardDivider` to a different shade of gray, in order to match the color used in other components ([#32566](https://github.com/WordPress/gutenberg/pull/32566)).

### Deprecation

-   `isPrimary`, `isSecondary`, `isTertiary` and `isLink` props in `Button` have been deprecated. Use `variant` instead ([#31713](https://github.com/WordPress/gutenberg/pull/31713)).
-   `isElevated` prop in `Card` has been deprecated. Use `elevation` instead ([#32566](https://github.com/WordPress/gutenberg/pull/32566)).

### Internal

-   `Card`, `CardBody`, `CardHeader`, `CardFooter`, `CardMedia`, and `CardDivider` components have been re-written from the ground up ([#32566](https://github.com/WordPress/gutenberg/pull/32566)).

## 14.1.0 (2021-05-20)

## 14.0.0 (2021-05-14)

### Breaking Changes

-   Drop support for Internet Explorer 11 ([#31110](https://github.com/WordPress/gutenberg/pull/31110)). Learn more at https://make.wordpress.org/core/2021/04/22/ie-11-support-phase-out-plan/.
-   Increase the minimum Node.js version to v12 matching Long Term Support releases ([#31270](https://github.com/WordPress/gutenberg/pull/31270)). Learn more at https://nodejs.org/en/about/releases/.
-   The experimental `Text` component has been completely re-written and enhanced with truncation support and separate variant, size, and weight props to allow for greater control. The previous `variant` prop has been completely removed.

### Deprecation

-   `isReversed` prop in `Flex` component has been deprecated. Use `direction` instead ([#31297](https://github.com/WordPress/gutenberg/pull/31297)).

### Internal

-   `Flex`, `FlexBlock`, and `FlexItem` components have been re-written from the ground up ([#31297](https://github.com/WordPress/gutenberg/pull/31297)).

## 13.0.0 (2021-03-17)

### Breaking Change

-   `onChange` prop of `FocalPointPicker` is called at the end of drag operations. Previously, it was called repetitively while dragging.

### New Feature

-   Supports ref forwarding in `withNotices` and `ResizableBox`.
-   Adds `onDrag` prop of `FocalPointPicker`.

### Bug Fix

-   Allows focus of the `FocalPointPicker` draggable area and adjustment with arrow keys. This was added in [#22531](https://github.com/WordPress/gutenberg/pull/22264) but was no longer working.

## 12.0.0 (2020-12-17)

### Enhancements

-   ComboboxControl: Deburr option labels before filter

### Breaking Change

-   Introduce support for other units and advanced CSS properties on `FontSizePicker`. Provided the value passed to the `FontSizePicker` is a string or one of the size options passed is a string, onChange will start to be called with a string value instead of a number. On WordPress usage, font size options are now automatically converted to strings with the default "px" unit added.

## 10.1.0 (2020-09-03)

### New Feature

-   Add `ToolbarItem` component.
-   Support `label` prop on the `Toolbar` component.

### Deprecations

-   Deprecate the `Toolbar` component when used without the `label` prop. `ToolbarGroup` should be used instead.

## 10.0.0 (2020-07-07)

### Breaking Change

-   `NumberControl` no longer automatically transforms values when rendering `value` into a `<input />` HTML element.
-   `Dashicon` component no longer renders SVGs. If you rely on this component, make sure to load the dashicon font.

## 9.6.0 (2020-05-14)

### Bug Fix

-   Fix and issue that would cause the `Popover` component to throw an error under certain
    circumstances ([#22264](https://github.com/WordPress/gutenberg/pull/22264)).

### Deprecations

-   The `Guide` component no longer supports passing pages as children. Use the `pages` prop instead.
-   The `GuidePage` component is deprecated. Use the `pages` prop in `Guide` instead.

## 9.2.0 (2020-02-10)

### Enhancements

-   The `Notice` component will speak its message. With this new feature, a developer can control either the `spokenMessage` spoken message, or the `politeness` politeness level of the message.
-   The `Snackbar` component will speak its message. With this new feature, a developer can control either the `spokenMessage` spoken message, or the `politeness` politeness level of the message.
-   A `Notice` `actions` member can now assign `isPrimary` to render a primary button action associated with a notice message.

### Bug Fixes

-   Notice will assume a default status of 'info' if none is provided. This resolves an issue where the notice would be assigned a class name `is-undefined`. This was previously the effective default by styled appearance and should not be considered a breaking change in that regard.

## 9.0.0 (2020-01-13)

### New Features

-   Added a new `Guide` component which allows developers to easily present a user guide.

### Breaking Changes

-   `is-button` classname has been removed from the Button component.
-   The `is-default` classname is not applied automatically anymore.
-   By default Button components come with a fixed height and hover styles.

### Bug Fixes

-   Fixes a regression published in version 8.5.0 that would prevent some build tools from including
    styles provided in the packages build-styles directory.

### Deprecations

-   `isDefault` prop in `Button` has been deprecated. Consider using `isSecondary` instead.
-   `IconButton` has been deprecated. Use the `Button` component instead.

## 8.2.0 (2019-08-29)

### New Features

-   The bundled `re-resizable` dependency has been updated from requiring `5.0.1` to requiring `^6.0.0` ([#17011](https://github.com/WordPress/gutenberg/pull/17011)).

## 8.1.0 (2019-08-05)

### New Features

-   Added a new `popoverProps` prop to the `Dropdown` component which allows users of the `Dropdown` component to pass props directly to the `Popover` component.
-   Added and documented `hideLabelFromVision` prop to `BaseControl` used by `SelectControl`, `TextControl`, and `TextareaControl`.
-   Added a new `popoverProps` prop to the `DropdownMenu` component which allows to pass props directly to the nested `Popover` component.
-   Added a new `toggleProps` prop to the `DropdownMenu` component which allows to pass props directly to the nested `IconButton` component.
-   Added a new `menuProps` prop to the `DropdownMenu` component which allows to pass props directly to the nested `NavigableMenu` component.

### Deprecations

-   `menuLabel` prop in `DropdownComponent` has been deprecated. Consider using `menuProps` object and its `aria-label` property instead.
-   `position` prop in `DropdownComponent` has been deprecated. Consider using `popoverProps` object and its `position` property instead.

### Bug Fixes

-   The `Button` component will no longer assign default styling (`is-default` class) when explicitly assigned as primary (the `isPrimary` prop). This should resolve potential conflicts affecting a combination of `isPrimary`, `isDefault`, and `isLarge` / `isSmall`, where the busy animation would appear with incorrect coloring.

### Deprecations

-   The `Popover` component `onClickOutside` prop has been deprecated. Use `onFocusOutside` instead.

### Internal

-   The `Dropdown` component has been refactored to focus changes using the `Popover` component's `onFocusOutside` prop.
-   The `MenuItem` component will now always use an `IconButton`. This prevents a focus loss when clicking a menu item.
-   Package no longer depends on external `react-click-outside` library.

## 8.0.0 (2019-06-12)

### New Feature

-   Add new `BlockQuotation` block to the primitives folder to support blockquote in a multiplatform way. [#15482](https://github.com/WordPress/gutenberg/pull/15482).
-   `DropdownMenu` now supports passing a [render prop](https://reactjs.org/docs/render-props.html#using-props-other-than-render) as children for more advanced customization.

### Internal

-   `MenuGroup` no longer uses `NavigableMenu` internally. It needs to be explicitly wrapped with `NavigableMenu` to bring back the same behavior.

### Documentation

-   Added missing documentation for `DropdownMenu` props `menuLabel`, `position`, `className`.

### Breaking Change

-   `ServerSideRender` is no longer part of components. It was extracted to an independent package `@wordpress/server-side-render`.

### Bug Fix

-   Although `DateTimePicker` does not allow picking the seconds, passed the current seconds as the selected value for seconds when calling `onChange`. Now it passes zero.

## 7.4.0 (2019-05-21)

### New Feature

-   Added a new `HorizontalRule` component.
-   Added a new `Snackbar` component.

### Bug Fix

-   Fixed display of reset button when using RangeControl `allowReset` prop.
-   Fixed minutes field of `DateTimePicker` missed '0' before single digit values.

## 7.3.0 (2019-04-16)

### New Features

-   Added a new `render` property to `FormFileUpload` component. Allowing users of the component to custom the UI for their needs.
-   Added a new `BaseControl.VisualLabel` component.
-   Added a new `preview` prop to the `Placeholder` component which allows to display a preview, for example a media preview when the Placeholder is used in media editing contexts.
-   Added a new `anchorRect` prop to `Popover` which enables a developer to provide a custom `DOMRect` object at which to position the popover.

### Improvements

-   Limit `Base Control Label` to the width of its content.

### Bug fixes

-   Fix `instanceId` prop passed through to `Button` component via `MenuItems` producing React console error. Fixed by removing the unnecessary use of `withInstanceId` on the `MenuItems` component [#14599](https://github.com/WordPress/gutenberg/pull/14599)

## 7.2.0 (2019-03-20)

### Improvements

-   Make `RangeControl` validation rely on the `checkValidity` provided by the browsers instead of using our own validation.

### Bug Fixes

-   Fix a problem that made `RangeControl` not work as expected with float values.

## 7.1.0 (2019-03-06)

### New Features

-   Added a new `Animate` component.

### Improvements

-   `withFilters` has been optimized to avoid binding hook handlers for each mounted instance of the component, instead using a single centralized hook delegator.
-   `withFilters` has been optimized to reuse a single shared component definition for all filtered instances of the component.
-   Make `RangeControl` validate min and max properties.

### Bug Fixes

-   Resolves a conflict where two instance of Slot would produce an inconsistent or duplicated rendering output.
-   Allow years between 0 and 1970 in DateTime component.

### New Feature

-   `Dropdown` now has a `focusOnMount` prop which is passed directly to the contained `Popover`.
-   `DatePicker` has new prop `isInvalidDate` exposing react-dates' `isOutsideRange`.
-   `DatePicker` allows `null` as accepted value for `currentDate` prop to signify no date selection.

## 7.0.5 (2019-01-03)

## 7.0.4 (2018-12-12)

## 7.0.3 (2018-11-30)

## 7.0.2 (2018-11-22)

## 7.0.1 (2018-11-21)

## 7.0.0 (2018-11-20)

### Breaking Change

-   `Dropdown.refresh()` has been removed. The contained `Popover` is now automatically refreshed.

## 6.0.2 (2018-11-15)

## 6.0.1 (2018-11-12)

### Bug Fixes

-   Avoid constantly recomputing the popover position.

### Polish

-   Remove `<DateTimePicker />` obsolete `locale` prop (and pass-through to child components) and obsolete `is12Hour` prop pass through to `<DateTime />` [#11649](https://github.com/WordPress/gutenberg/pull/11649)

## 6.0.0 (2018-11-12)

### Breaking Change

-   The `PanelColor` component has been removed.

## 5.1.1 (2018-11-09)

## 5.1.0 (2018-11-09)

### New Feature

-   Adjust a11y roles for MenuItem component, so that aria-checked is used properly, related change in Editor/Components/BlockNavigationList ([#11431](https://github.com/WordPress/gutenberg/issues/11431)).
-   `Popover` components are now automatically refreshed every 0.5s in order to recalculate their size or position.

### Deprecation

-   `Dropdown.refresh()` has been deprecated as the contained `Popover` is now automatically refreshed.

## 5.0.2 (2018-11-03)

### Polish

-   Forward `ref` in the `PanelBody` component.
-   Tooltip are no longer removed when Button becomes disabled, it's left to the component rendering the Tooltip.
-   Forward `ref` support in `TabbableContainer` and `NavigableMenu` components.

## 5.0.1 (2018-10-30)

## 5.0.0 (2018-10-29)

### Breaking Change

-   `AccessibleSVG` component has been removed. Please use `SVG` instead.

### New Feature

-   The `Notice` component accepts an array of action objects via the `actions` prop. Each member object should contain a `label` and either a `url` link string or `onClick` callback function.

## 4.2.1 (2018-10-22)

### Bug Fix

-   Fix importing `react-dates` stylesheet in production.

## 4.2.0 (2018-10-19)

### New Feature

-   Added a new `ColorPicker` component ([#10564](https://github.com/WordPress/gutenberg/pull/10564)).
-   `MenuItem` now accepts an `info` prop for including an extended description.

### Bug Fix

-   `IconButton` correctly respects a passed `aria-label` prop.

### Deprecation

-   `PanelColor` has been deprecated in favor of `wp.editor.PanelColorSettings`.

## 4.1.2 (2018-10-18)

## 4.1.0 (2018-10-10)

### New Feature

-   Added a new `ResizableBox` component.

## 4.0.0 (2018-09-30)

### Breaking Change

-   `Draggable` as a DOM node drag handler has been removed. Please, use `Draggable` as a wrap component for your DOM node drag handler.

### Deprecation

-   Renamed `AccessibleSVG` component to `SVG`.

## 3.0.0 (2018-09-05)

### Breaking Change

-   `withAPIData` has been removed. Please use the Core Data module or `@wordpress/api-fetch` directly instead.
-   `Draggable` as a DOM node drag handler has been deprecated. Please, use `Draggable` as a wrap component for your DOM node drag handler.
-   Change how required built-ins are polyfilled with Babel 7 ([#9171](https://github.com/WordPress/gutenberg/pull/9171)). If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods.
-   `withContext` has been removed. Please use `wp.element.createContext` instead. See: https://reactjs.org/docs/context.html.

### New Feature

-   Added a new `AccessibleSVG` component.
