<!-- Learn how to maintain this file at https://github.com/WordPress/gutenberg/tree/HEAD/packages#maintaining-changelogs. -->

## Unreleased

## 8.0.0 (2023-07-20)

### Breaking Changes

-   Updated dependencies to require React 18 ([45235](https://github.com/WordPress/gutenberg/pull/45235))

## 5.20.0 (2022-11-16)

## 5.19.0 (2022-11-02)

## 5.18.0 (2022-10-19)

## 5.17.0 (2022-10-05)

## 5.16.0 (2022-09-21)

## 5.15.0 (2022-09-13)

## 5.14.0 (2022-08-24)

## 5.13.0 (2022-08-10)

## 5.12.0 (2022-07-27)

## 5.11.0 (2022-07-13)

## 5.10.0 (2022-06-29)

## 5.9.0 (2022-06-15)

## 5.8.0 (2022-06-01)

## 5.7.0 (2022-05-18)

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

## 4.1.0 (2021-05-20)

## 4.0.0 (2021-05-14)

### Breaking Changes

-   Drop support for Internet Explorer 11 ([#31110](https://github.com/WordPress/gutenberg/pull/31110)). Learn more at https://make.wordpress.org/core/2021/04/22/ie-11-support-phase-out-plan/.
-   Increase the minimum Node.js version to v12 matching Long Term Support releases ([#31270](https://github.com/WordPress/gutenberg/pull/31270)). Learn more at https://nodejs.org/en/about/releases/.

## 3.25.0 (2021-03-17)

## 3.24.0 (2020-12-17)

### New Feature

-   Added a store definition `store` for the core data namespace to use with `@wordpress/data` API ([#26655](https://github.com/WordPress/gutenberg/pull/26655)).

# 3.1.0 (2019-06-03)

-   The `@wordpress/nux` package has been deprecated. Please use the `Guide` component in `@wordpress/components` to show a user guide.

## 3.0.6 (2019-01-03)

## 3.0.5 (2018-12-12)

## 3.0.4 (2018-11-30)

## 3.0.3 (2018-11-22)

## 3.0.2 (2018-11-21)

## 3.0.1 (2018-11-20)

## 3.0.0 (2018-11-15)

### Breaking Changes

-   The id prop of DotTip has been removed. Please use the tipId prop instead.

## 2.0.13 (2018-11-12)

## 2.0.12 (2018-11-12)

## 2.0.11 (2018-11-09)

## 2.0.10 (2018-11-09)

## 2.0.9 (2018-11-03)

## 2.0.8 (2018-10-30)

## 2.0.7 (2018-10-29)

### Deprecations

-   The id prop of DotTip has been deprecated. Please use the tipId prop instead.

## 2.0.6 (2018-10-22)

## 2.0.5 (2018-10-19)

## 2.0.4 (2018-10-18)

## 2.0.0 (2018-09-05)

### Breaking Change

-   Change how required built-ins are polyfilled with Babel 7 ([#9171](https://github.com/WordPress/gutenberg/pull/9171)). If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods.
