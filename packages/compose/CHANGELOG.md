<!-- Learn how to maintain this file at https://github.com/WordPress/gutenberg/tree/HEAD/packages#maintaining-changelogs. -->

## Unreleased

## 5.16.0 (2022-09-21)

### New Features

-   Compose: Introduce an in-house `debounce()` utility, deprecate Lodash version ([#43943](https://github.com/WordPress/gutenberg/pull/43943)).
-   Compose: Introduce in-house `compose` and `pipe` utils ([#44112](https://github.com/WordPress/gutenberg/pull/44112)).

### Internal

-   `useInstanceId`: refactor to TypeScript ([#43790](https://github.com/WordPress/gutenberg/pull/43790)).

## 5.15.0 (2022-09-13)

### Internal

-   `useDialog`: refactor to TypeScript ([#43823](https://github.com/WordPress/gutenberg/pull/43823)).

## 5.14.0 (2022-08-24)

## 5.13.0 (2022-08-10)

## 5.12.0 (2022-07-27)

## 5.11.0 (2022-07-13)

## 5.10.0 (2022-06-29)

## 5.9.0 (2022-06-15)

## 5.8.0 (2022-06-01)

## 5.7.0 (2022-05-18)

### Bug Fix

-   `useRefEffect`: Allow `void` as a valid callback return type ([#40798](https://github.com/WordPress/gutenberg/pull/40798)).

### New Features

-   Add `useDisabled` hook.

### Internal

-   Update the implementation of useResizeObserver to rely on the ResizableObserver API.

## 5.6.0 (2022-05-04)

## 5.5.0 (2022-04-21)

## 5.4.0 (2022-04-08)

## 5.3.0 (2022-03-23)

## 5.2.0 (2022-03-11)

## 5.1.0 (2022-01-27)

## 5.0.0 (2021-07-29)

### Breaking Change

-   Upgraded React components to work with v17.0 ([#29118](https://github.com/WordPress/gutenberg/pull/29118)). There are no new features in React v17.0 as explained in the [blog post](https://reactjs.org/blog/2020/10/20/react-v17.html).

## 4.2.0 (2021-07-21)

### Deprecations

-   `withState` HOC has been deprecated. Use `useState` hook instead.

### New Features

-   Publish TypeScript types.

## 4.1.0 (2021-05-20)

## 4.0.0 (2021-05-14)

### Breaking Changes

-   Drop support for Internet Explorer 11 ([#31110](https://github.com/WordPress/gutenberg/pull/31110)). Learn more at https://make.wordpress.org/core/2021/04/22/ie-11-support-phase-out-plan/.
-   Increase the minimum Node.js version to v12 matching Long Term Support releases ([#31270](https://github.com/WordPress/gutenberg/pull/31270)). Learn more at https://nodejs.org/en/about/releases/.

## 3.25.0 (2021-03-17)

## 3.24.0 (2021-01-21)

### New Features

-   Add the `useIsomorphicLayoutEffect` hook.

## 3.4.0 (2019-06-12)

### New Features

-   Add the `useMediaQuery` and `useReducedMotion` hooks.

## 3.0.0 (2018-11-15)

### Breaking Changes

-   `remountOnPropChange` has been removed.

## 2.1.2 (2018-11-09)

## 2.1.1 (2018-11-09)

## 2.1.0 (2018-10-29)

### Deprecation

-   `remountOnPropChange` has been deprecated.

## 2.0.5 (2018-10-19)

## 2.0.4 (2018-10-18)

## 2.0.0 (2018-09-05)

### Breaking Change

-   Change how required built-ins are polyfilled with Babel 7 ([#9171](https://github.com/WordPress/gutenberg/pull/9171)). If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods.
