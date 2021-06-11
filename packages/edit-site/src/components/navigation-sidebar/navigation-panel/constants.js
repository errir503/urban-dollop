/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const TEMPLATES_PRIMARY = [
	'index',
	'singular',
	'archive',
	'single',
	'page',
	'home',
	'404',
	'search',
];

export const TEMPLATES_SECONDARY = [
	'author',
	'category',
	'taxonomy',
	'date',
	'tag',
	'attachment',
	'single-post',
	'front-page',
];

export const TEMPLATES_TOP_LEVEL = [
	...TEMPLATES_PRIMARY,
	...TEMPLATES_SECONDARY,
];

export const TEMPLATES_GENERAL = [ 'page-home' ];

export const TEMPLATES_POSTS_PREFIXES = [
	'post-',
	'author-',
	'single-post-',
	'tag-',
];

export const TEMPLATES_PAGES_PREFIXES = [ 'page-' ];

export const TEMPLATES_NEW_OPTIONS = [
	'front-page',
	'single-post',
	'page',
	'archive',
	'search',
	'404',
	'index',
];

export const TEMPLATE_OVERRIDES = {
	singular: [ 'single', 'page' ],
	index: [ 'archive', '404', 'search', 'singular', 'home' ],
	home: [ 'front-page' ],
};

export const MENU_ROOT = 'root';
export const MENU_CONTENT_CATEGORIES = 'content-categories';
export const MENU_CONTENT_PAGES = 'content-pages';
export const MENU_CONTENT_POSTS = 'content-posts';
export const MENU_TEMPLATE_PARTS = 'template-parts';
export const MENU_TEMPLATES = 'templates';
export const MENU_TEMPLATES_GENERAL = 'templates-general';
export const MENU_TEMPLATES_PAGES = 'templates-pages';
export const MENU_TEMPLATES_POSTS = 'templates-posts';
export const MENU_TEMPLATES_UNUSED = 'templates-unused';

export const SEARCH_DEBOUNCE_IN_MS = 75;

export const MENU_TEMPLATE_PARTS_HEADERS = 'template-parts-headers';
export const MENU_TEMPLATE_PARTS_FOOTERS = 'template-parts-footers';
export const MENU_TEMPLATE_PARTS_SIDEBARS = 'template-parts-sidebars';
export const MENU_TEMPLATE_PARTS_GENERAL = 'template-parts-general';

export const TEMPLATE_PART_AREA_HEADER = 'header';
export const TEMPLATE_PART_AREA_FOOTER = 'footer';
export const TEMPLATE_PART_AREA_SIDEBAR = 'sidebar';

export const TEMPLATE_PARTS_SUB_MENUS = [
	{
		area: TEMPLATE_PART_AREA_HEADER,
		menu: MENU_TEMPLATE_PARTS_HEADERS,
		title: __( 'Headers' ),
	},
	{
		area: TEMPLATE_PART_AREA_FOOTER,
		menu: MENU_TEMPLATE_PARTS_FOOTERS,
		title: __( 'Footers' ),
	},
	{
		area: TEMPLATE_PART_AREA_SIDEBAR,
		menu: MENU_TEMPLATE_PARTS_SIDEBARS,
		title: __( 'Sidebars' ),
	},
	{
		area: 'uncategorized',
		menu: MENU_TEMPLATE_PARTS_GENERAL,
		title: __( 'General' ),
	},
];
