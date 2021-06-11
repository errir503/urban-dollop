export const downloadableBlock = {
	name: 'boxer/boxer',
	title: 'Boxer',
	description:
		'Boxer is a Block that puts your WordPress posts into boxes on a page.',
	id: 'boxer-block',
	rating: 5,
	ratingCount: 1,
	activeInstalls: 0,
	authorBlockRating: 5,
	authorBlockCount: '1',
	author: 'CK Lee',
	icon: 'block-default',
	assets: [
		'https://plugins.svn.wordpress.org/boxer-block/trunk/build/index.js',
		'https://plugins.svn.wordpress.org/boxer-block/trunk/build/view.js',
	],
	humanizedUpdated: '3 months ago',
};

export const blockTypeInstalled = {
	id: 'boxer-block',
	name: 'boxer/boxer',
};

export const blockTypeUnused = {
	id: 'example-block',
	name: 'fake/unused',
};

export const blockList = [
	{
		clientId: 1,
		name: 'core/paragraph',
		attributes: {},
		innerBlocks: [],
	},
	{
		clientId: 2,
		name: 'boxer/boxer',
		attributes: {},
		innerBlocks: [],
	},
	{
		clientId: 3,
		name: 'core/heading',
		attributes: {},
		innerBlocks: [],
	},
];
