# Block Development Environment

This guide will help you set up the right development environment to create blocks and other plugins that extend and modify the Block Editor in WordPress.

To contribute to the Gutenberg project itself, refer to the additional documentation in the [code contribution guide](/docs/contributors/code/getting-started-with-code-contribution.md).`

A block development environment includes the tools you need on your computer to successfully develop for the Block Editor. The three essential requirements are:

1.  [Code editor](#code-editor)
2.  [Node.js development tools](#node-js-development-tools)
3.  [Local WordPress environment (site)](#local-wordpress-environment)

## Code editor

A code editor is used to write code, and you can use whichever editor you're most comfortable with. The key is having a way to open, edit, and save text files.

If you do not already have a preferred code editor, [Visual Studio Code](https://code.visualstudio.com/) (VS Code) is a popular choice for JavaScript development among Core contributors. It works well across the three major platforms (Windows, Linux, and Mac) and is open-source and actively maintained by Microsoft. VS Code also has a vibrant community providing plugins and extensions, including many for WordPress development.

## Node.js development tools

Node.js (`node`) is an open-source runtime environment that allows you to execute JavaScript outside of the web browser. While Node.js is not required for all WordPress JavaScript development, it's essential when working with modern JavaScript tools and developing for the Block Editor.

Node.js and its accompanying development tools allow you to:

-   Install and run WordPress packages needed for Block Editor development, such as `wp-scripts`
-   Setup local WordPress environments with `wp-env` and `wp-now`
-   Use the latest ECMAScript features and write code in ESNext
-   Lint, format, and test JavaScript code
-   Scaffold custom blocks with the `create-block` package

The list goes on. While modern JavaScript development can be challenging, WordPress provides several tools, like [`wp-scripts`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/) and [`create-block`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/), that streamline the process and are made possible by Node.js development tools.

**The recommended Node.js version for block development is [Active LTS](https://nodejs.dev/en/about/releases/) (Long Term Support)**. However, there are times when you  need to to use different versions. A Node.js version manager tool like `nvm` is strongly recommended and allows you to easily change your `node` version when required. You will also need Node Package Manager (`npm`) and the Node Package eXecute (`npx`) to work with some WordPress packages. Both are installed automatically with Node.js.

To be able to use the Node.js tools and [packages provided by WordPress](https://github.com/WordPress/gutenberg/tree/trunk/packages) for block development, you'll need to set a proper Node.js runtime environment on your machine.. To learn more about how to do this, refer to the links below.

-   [Install Node.js for Mac and Linux](/docs/getting-started/devenv/nodejs-development-environment.md#node-js-installation-on-mac-and-linux-with-nvm)
-   [Install Node.js for Windows](/docs/getting-started/devenv/nodejs-development-environment.md#node-js-installation-on-windows-and-others)

## Local WordPress environment

A local WordPress environment (site) provides a controlled, efficient, and secure space for development, allowing you to build and test your code before deploying it to a production site. The [same requirements](https://en-gb.wordpress.org/about/requirements/) for WordPress apply to local sites.

Many tools are available for setting up a local WordPress environment on your computer. The Block Editor Handbook covers `wp-env` and `wp-now`, both of which are open-source and maintained by the WordPress project itself. 

Refer to the individual guides below for setup instructions.

-   [Get started with `wp-env`](/docs/getting-started/devenv/get-started-with-wp-env.md)
-   [Get started with `wp-now`](/docs/getting-started/devenv/get-started-with-wp-now.md)

Of the two, `wp-env` is the more solid and complete solution. It's also the recommended tool for Gutenberg development. On the other hand, `wp-now` offers a simplified setup but is more limited than `wp-env`. Both are valid options, so the choice is yours.
