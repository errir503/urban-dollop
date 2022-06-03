# E2E Tests

End-To-End (E2E) tests for WordPress.

This directory is the new place for E2E tests in Gutenberg. We expect new tests to be placed here and follow the [best practices](#best-practices) listed below. We use [Playwright](https://playwright.dev/) and its test runner to run the tests in Chromium by default. [`@wordpress/e2e-test-utils-playwright`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/e2e-test-utils-playwright) is used as a helper package to simplify the usages. See the documentation of both for more information.

See the [migration guide](https://github.com/WordPress/gutenberg/tree/HEAD/test/e2e/MIGRATION.md) if you're coming from the previous Jest + Puppeteer framework.

## Best practices

### Forbid `$`, use `locator` instead

In fact, any API that returns `ElementHandle` is [discouraged](https://playwright.dev/docs/api/class-page#page-query-selector). This includes `$`, `$$`, `$eval`, `$$eval`, etc. [`Locator`](https://playwright.dev/docs/api/class-locator) is a much better API and can be used with playwright's [assertions](https://playwright.dev/docs/api/class-locatorassertions). This also works great with Page Object Model since that locator is lazy and doesn't return a promise.

### Use accessible selectors

Use the selector engine [role-selector](https://playwright.dev/docs/selectors#role-selector) to construct the query wherever possible. It enables us to write accessible queries without having to rely on internal implementations. The syntax should be straightforward and looks like this:

```js
// Select a button with the accessible name "Hello World" (case-insensitive).
page.locator( 'role=button[name="Hello World"i]' );
```

It's recommended to append `i` to the name attribute to match it case-insensitively wherever it makes sense. It can also be chained with built-in selector engines to perform complex queries:

```js
// Select a button with a name ends with `Back` and is visible on the screen.
page.locator( 'role=button[name=/Back$/] >> visible=true' );
// Select a button with the (exact) name "View options" under `#some-section`.
page.locator( 'css=#some-section >> role=button[name="View options"]' );
```

See the [official documentation](https://playwright.dev/docs/selectors#role-selector) for more info on how to use them.

### Selectors are strict by default

To encourage better practices for querying elements, selectors are [strict](https://playwright.dev/docs/api/class-browser#browser-new-page-option-strict-selectors) by default, meaning that it will throw an error if the query returns more than one element.

### Don't overload test-utils, inline simple utils

`e2e-test-utils` are too bloated with too many utils. Most of them are simple enough to be inlined directly in tests. With the help of accessible selectors, simple utils are easier to write now. For utils that only take place on a certain page, use Page Object Model instead (with an exception of clearing states with `requestUtils` which are better placed in `e2e-test-utils`). Otherwise, only create an util if the action is complex and repetitive enough.

### Favor Page Object Model over utils

As mentioned above, [Page Object Model](https://playwright.dev/docs/test-pom) is the preferred way to create reusable utility functions on a certain page.

The rationale behind using a POM is to group utils under namespaces to be easier to discover and use. In fact, `PageUtils` in the `e2e-test-utils-playwright` package is also a POM, which avoids the need for global variables, and utils can reference each other with `this`.

### Restify actions to clear or set states.

It's slow to set states manually before or after tests, especially when they're repeated multiple times between tests. It's recommended to set them via API calls. Use `requestUtils.rest` and `requestUtils.batchRest` instead to call the [REST API](https://developer.wordpress.org/rest-api/reference/) (and add them to `requestUtils` if needed). We should still add a test for manually setting them, but that should only be tested once.

### Avoid global variables

Previously in our Jest + Puppeteer E2E tests, `page` and `browser` are exposed as global variables. This makes it harder to work with when we have multiple pages/tabs in the same test, or if we want to run multiple tests in parallel. `@playwright/test` has the concept of [fixtures](https://playwright.dev/docs/test-fixtures) which allows us to inject `page`, `browser`, and other parameters into the tests.

### Make explicit assertions

We can insert as many assertions in one test as needed. It's better to make explicit assertions whenever possible. For instance, if we want to assert that a button exists before clicking on it, we can do `expect( locator ).toBeVisible()` before performing `locator.click()`. This makes the tests flow better and easier to read.

## Commands

```bash
# Run all available tests.
npm run test-e2e:playwright

# Run in headed mode.
npm run test-e2e:playwright -- --headed

# Run a single test file.
npm run test-e2e:playwright -- <path_to_test_file> # E.g., npm run test-e2e:playwright -- site-editor/title.spec.js

# Debugging
npm run test-e2e:playwright -- --debug
```

**Note**: This package requires Node.js 12.0.0 or later. It is not compatible with older versions.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
