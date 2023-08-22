/**
 * External dependencies
 */
import { Platform } from 'react-native';

/**
 * WordPress dependencies
 */
import {
	hasBlockSupport,
	registerBlockType,
	setDefaultBlockName,
	setFreeformContentHandlerName,
	setUnregisteredTypeHandlerName,
	setGroupingBlockName,
} from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import * as paragraph from './paragraph';
import * as image from './image';
import * as heading from './heading';
import * as quote from './quote';
import * as gallery from './gallery';
import * as archives from './archives';
import * as audio from './audio';
import * as button from './button';
import * as calendar from './calendar';
import * as categories from './categories';
import * as code from './code';
import * as columns from './columns';
import * as column from './column';
import * as cover from './cover';
import * as embed from './embed';
import * as file from './file';
import * as html from './html';
import * as mediaText from './media-text';
import * as latestComments from './latest-comments';
import * as latestPosts from './latest-posts';
import * as list from './list';
import * as listItem from './list-item';
import * as missing from './missing';
import * as more from './more';
import * as nextpage from './nextpage';
import * as preformatted from './preformatted';
import * as pullquote from './pullquote';
import * as reusableBlock from './block';
import * as rss from './rss';
import * as search from './search';
import * as separator from './separator';
import * as shortcode from './shortcode';
import * as spacer from './spacer';
import * as table from './table';
import * as textColumns from './text-columns';
import * as verse from './verse';
import * as video from './video';
import * as tagCloud from './tag-cloud';
import * as classic from './freeform';
import * as group from './group';
import * as buttons from './buttons';
import * as socialLink from './social-link';
import * as socialLinks from './social-links';

import { transformationCategory } from './utils/transformation-categories';

export const coreBlocks = [
	// Common blocks are grouped at the top to prioritize their display
	// in various contexts — like the inserter and auto-complete components.
	paragraph,
	image,
	heading,
	gallery,
	list,
	listItem,
	quote,

	// Register all remaining core blocks.
	shortcode,
	archives,
	audio,
	button,
	calendar,
	categories,
	code,
	columns,
	column,
	cover,
	embed,
	group,
	file,
	html,
	mediaText,
	latestComments,
	latestPosts,
	missing,
	more,
	nextpage,
	preformatted,
	pullquote,
	rss,
	search,
	separator,
	reusableBlock,
	spacer,
	table,
	tagCloud,
	textColumns,
	verse,
	video,
	classic,
	buttons,
	socialLink,
	socialLinks,
].reduce( ( accumulator, block ) => {
	accumulator[ block.name ] = block;
	return accumulator;
}, {} );

/**
 * Function to register a block variations e.g. social icons different types.
 *
 * @param {Object} block The block which variations will be registered.
 */
const registerBlockVariations = ( block ) => {
	const { metadata, settings, name } = block;

	if ( ! settings.variations ) {
		return;
	}

	[ ...settings.variations ]
		.sort( ( a, b ) => a.title.localeCompare( b.title ) )
		.forEach( ( v ) => {
			registerBlockType( `${ name }-${ v.name }`, {
				...metadata,
				name: `${ name }-${ v.name }`,
				...settings,
				icon: v.icon(),
				title: v.title,
				variations: [],
			} );
		} );
};

// Only enable code block for development
// eslint-disable-next-line no-undef
const devOnly = ( block ) => ( !! __DEV__ ? block : null );

// eslint-disable-next-line no-unused-vars
const iOSOnly = ( block ) =>
	Platform.OS === 'ios' ? block : devOnly( block );

// Hide the Classic block and SocialLink block
addFilter(
	'blocks.registerBlockType',
	'core/react-native-editor',
	( settings, name ) => {
		const hiddenBlocks = [ 'core/freeform', 'core/social-link' ];
		if (
			hiddenBlocks.includes( name ) &&
			hasBlockSupport( settings, 'inserter', true )
		) {
			settings.supports = {
				...settings.supports,
				inserter: false,
			};
		}

		return settings;
	}
);

addFilter(
	'blocks.registerBlockType',
	'core/react-native-editor',
	( settings, name ) => {
		if ( ! settings.transforms ) {
			return settings;
		}

		if ( ! settings.transforms.supportedMobileTransforms ) {
			return {
				...settings,
				transforms: {
					...settings.transforms,
					supportedMobileTransforms: transformationCategory( name ),
				},
			};
		}

		return settings;
	}
);

/**
 * Function to register core blocks provided by the block editor.
 *
 * @example
 * ```js
 * import { registerCoreBlocks } from '@wordpress/block-library';
 *
 * registerCoreBlocks();
 * ```
 */
export const registerCoreBlocks = () => {
	// When adding new blocks to this list please also consider updating /src/block-support/supported-blocks.json in the Gutenberg-Mobile repo
	[
		paragraph,
		heading,
		devOnly( code ),
		missing,
		more,
		image,
		video,
		nextpage,
		separator,
		list,
		listItem,
		quote,
		mediaText,
		preformatted,
		gallery,
		columns,
		column,
		group,
		classic,
		button,
		spacer,
		shortcode,
		buttons,
		latestPosts,
		verse,
		cover,
		socialLink,
		socialLinks,
		pullquote,
		file,
		audio,
		reusableBlock,
		search,
		embed,
	]
		.filter( Boolean )
		.forEach( ( { init } ) => init() );

	registerBlockVariations( socialLink );
	setDefaultBlockName( paragraph.name );
	setFreeformContentHandlerName( classic.name );
	setUnregisteredTypeHandlerName( missing.name );
	if ( group ) {
		setGroupingBlockName( group.name );
	}
};

/**
 * Dictates which block types are considered "new." For each of the block types
 * below, if the native host app does not already have an impression count set,
 * an initial count will be set. When a block type's impression count is greater
 * than 0, a "new" badge is displayed on the block type within the block
 * inserter.
 *
 * With the below example, the Audio block will be displayed as "new" until its
 * impression count reaches 0, which occurs by various actions decrementing
 * the impression count.
 *
 * {
 * 	[ audio.name ]: 40
 * }
 *
 * @constant {{ string, number }}
 */
export const NEW_BLOCK_TYPES = {};
