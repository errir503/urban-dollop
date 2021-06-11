module.exports = {
	plugins: [ '@wordpress' ],
	rules: {
		'@wordpress/no-unused-vars-before-return': 'error',
		'@wordpress/no-base-control-with-label-without-id': 'error',
		'@wordpress/no-unguarded-get-range-at': 'error',
		'@wordpress/no-global-active-element': 'error',
		'@wordpress/no-global-get-selection': 'error',
		'@wordpress/no-global-event-listener': 'warn',
		'@wordpress/no-unsafe-wp-apis': 'error',
	},
	overrides: [
		{
			files: [ '*.native.js' ],
			rules: {
				'@wordpress/no-base-control-with-label-without-id': 'off',
			},
		},
		{
			files: [
				'*.test.js',
				'**/test/*.js',
				'packages/e2e-test-utils/**/*.js',
			],
			rules: {
				'@wordpress/no-global-active-element': 'off',
				'@wordpress/no-global-get-selection': 'off',
				'@wordpress/no-global-event-listener': 'off',
			},
		},
	],
	settings: {
		react: {
			version: '16.6',
		},
	},
};
