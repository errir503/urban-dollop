const stories = [
	process.env.NODE_ENV !== 'test' && './stories/**/*.(js|mdx)',
	'../packages/block-editor/src/**/stories/*.js',
	'../packages/components/src/**/stories/*.js',
	'../packages/icons/src/**/stories/*.js',
].filter( Boolean );

const customEnvVariables = {
	COMPONENT_SYSTEM_PHASE: 1,
};

module.exports = {
	stories,
	addons: [
		{
			name: '@storybook/addon-docs',
			options: { configureJSX: true },
		},
		'@storybook/addon-knobs',
		'@storybook/addon-storysource',
		'@storybook/addon-viewport',
		'@storybook/addon-a11y',
	],
	// Workaround:
	// https://github.com/storybookjs/storybook/issues/12270
	webpackFinal: async ( config ) => {
		// Find the DefinePlugin
		const plugin = config.plugins.find( ( p ) => {
			return p.definitions && p.definitions[ 'process.env' ];
		} );
		// Add custom env variables
		Object.keys( customEnvVariables ).forEach( ( key ) => {
			plugin.definitions[ 'process.env' ][ key ] = JSON.stringify(
				customEnvVariables[ key ]
			);
		} );

		return config;
	},
};
