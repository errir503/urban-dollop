global.process.env = {
	...global.process.env,
	/*
	Inject the `IS_GUTENBERG_PLUGIN` global, used for feature flagging.

	The conversion to boolean is required here. Why? Package.json defines
	IS_GUTENBERG_PLUGIN as follows:

		"config": {
			"IS_GUTENBERG_PLUGIN": true
		}

	Webpack then replaces references to IS_GUTENBERG_PLUGIN with a literal value `true`.
	The file you are reading right now, however, receives a string value "true":

		"true" === process.env.npm_package_config_IS_GUTENBERG_PLUGIN

	The code can only work consistently in both environments when the value of
	IS_GUTENBERG_PLUGIN is consistent. For this reason, the line below turns the
	string representation of IS_GUTENBERG_PLUGIN into a boolean value.
	*/
	// eslint-disable-next-line @wordpress/is-gutenberg-plugin
	IS_GUTENBERG_PLUGIN:
		String( process.env.npm_package_config_IS_GUTENBERG_PLUGIN ) === 'true',
	/**
	 * Feature flag guarding features specific to WordPress core.
	 * It's important to set it to "true" in the test environment
	 * to ensure the Gutenberg plugin can be cleanly merged into
	 * WordPress core.
	 */
	IS_WORDPRESS_CORE: true,
};
