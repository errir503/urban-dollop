/**
 * WordPress dependencies
 */
import { parse as grammarParse } from '@wordpress/block-serialization-default-parser';
import { autop } from '@wordpress/autop';

/**
 * Internal dependencies
 */
import {
	getFreeformContentHandlerName,
	getUnregisteredTypeHandlerName,
	getBlockType,
} from '../registration';
import { getSaveContent } from '../serializer';
import { validateBlock } from '../validation';
import { createBlock } from '../factory';
import { convertLegacyBlockNameAndAttributes } from './convert-legacy-block';
import { serializeRawBlock } from './serialize-raw-block';
import { getBlockAttributes } from './get-block-attributes';
import { applyBlockDeprecatedVersions } from './apply-block-deprecated-versions';
import { applyBuiltInValidationFixes } from './apply-built-in-validation-fixes';

/**
 * The raw structure of a block includes its attributes, inner
 * blocks, and inner HTML. It is important to distinguish inner blocks from
 * the HTML content of the block as only the latter is relevant for block
 * validation and edit operations.
 *
 * @typedef WPRawBlock
 *
 * @property {string=}         blockName    Block name
 * @property {Object=}         attrs        Block raw or comment attributes.
 * @property {string}          innerHTML    HTML content of the block.
 * @property {(string|null)[]} innerContent Content without inner blocks.
 * @property {WPRawBlock[]}    innerBlocks  Inner Blocks.
 */

/**
 * Fully parsed block object.
 *
 * @typedef WPBlock
 *
 * @property {string}    name             Block name
 * @property {Object }   attributes       Block raw or comment attributes.
 * @property {WPBlock[]} innerBlocks      Inner Blocks.
 * @property {string}    originalContent  Original content of the block before validation fixes.
 * @property {boolean}   isValid          Whether the block is valid.
 * @property {Object[]}  validationIssues Validation issues.
 */

/**
 * Convert legacy blocks to their canonical form. This function is used
 * both in the parser level for previous content and to convert such blocks
 * used in Custom Post Types templates.
 *
 * @param {WPRawBlock} rawBlock
 *
 * @return {WPRawBlock} The block's name and attributes, changed accordingly if a match was found
 */
function convertLegacyBlocks( rawBlock ) {
	const [
		correctName,
		correctedAttributes,
	] = convertLegacyBlockNameAndAttributes(
		rawBlock.blockName,
		rawBlock.attrs
	);
	return {
		...rawBlock,
		blockName: correctName,
		attrs: correctedAttributes,
	};
}

/**
 * Normalize the raw block by applying the fallback block name if none given,
 * sanitize the parsed HTML...
 *
 * @param {WPRawBlock} rawBlock The raw block object.
 *
 * @return {WPRawBlock} The normalized block object.
 */
export function normalizeRawBlock( rawBlock ) {
	const fallbackBlockName = getFreeformContentHandlerName();

	// If the grammar parsing don't produce any block name, use the freeform block.
	const rawBlockName = rawBlock.blockName || getFreeformContentHandlerName();
	const rawAttributes = rawBlock.attrs || {};
	const rawInnerBlocks = rawBlock.innerBlocks || [];
	let rawInnerHTML = rawBlock.innerHTML.trim();

	// Fallback content may be upgraded from classic content expecting implicit
	// automatic paragraphs, so preserve them. Assumes wpautop is idempotent,
	// meaning there are no negative consequences to repeated autop calls.
	if ( rawBlockName === fallbackBlockName ) {
		rawInnerHTML = autop( rawInnerHTML ).trim();
	}

	return {
		...rawBlock,
		blockName: rawBlockName,
		attrs: rawAttributes,
		innerHTML: rawInnerHTML,
		innerBlocks: rawInnerBlocks,
	};
}

/**
 * Uses the "unregistered blockType" to create a block object.
 *
 * @param {WPRawBlock} rawBlock block.
 *
 * @return {WPRawBlock} The unregistered block object.
 */
function createMissingBlockType( rawBlock ) {
	const unregisteredFallbackBlock =
		getUnregisteredTypeHandlerName() || getFreeformContentHandlerName();

	// Preserve undelimited content for use by the unregistered type
	// handler. A block node's `innerHTML` isn't enough, as that field only
	// carries the block's own HTML and not its nested blocks.
	const originalUndelimitedContent = serializeRawBlock( rawBlock, {
		isCommentDelimited: false,
	} );

	// Preserve full block content for use by the unregistered type
	// handler, block boundaries included.
	const originalContent = serializeRawBlock( rawBlock, {
		isCommentDelimited: true,
	} );

	return {
		blockName: unregisteredFallbackBlock,
		attrs: {
			originalName: rawBlock.blockName,
			originalContent,
			originalUndelimitedContent,
		},
		innerHTML: rawBlock.blockName ? originalContent : rawBlock.innerHTML,
		innerBlocks: rawBlock.innerBlocks,
		innerContent: rawBlock.innerContent,
	};
}

/**
 * Given a raw block returned by grammar parsing, returns a fully parsed block.
 *
 * @param {WPRawBlock} rawBlock The raw block object.
 *
 * @return {WPBlock} Fully parsed block.
 */
export function parseRawBlock( rawBlock ) {
	let normalizedBlock = normalizeRawBlock( rawBlock );

	// During the lifecycle of the project, we renamed some old blocks
	// and transformed others to new blocks. To avoid breaking existing content,
	// we added this function to properly parse the old content.
	normalizedBlock = convertLegacyBlocks( normalizedBlock );

	// Try finding the type for known block name.
	let blockType = getBlockType( normalizedBlock.blockName );

	// If not blockType is found for the specified name, fallback to the "unregistedBlockType".
	if ( ! blockType ) {
		normalizedBlock = createMissingBlockType( normalizedBlock );
		blockType = getBlockType( normalizedBlock.blockName );
	}

	// If it's an empty freeform block or there's no blockType (no missing block handler)
	// Then, just ignore the block.
	// It might be a good idea to throw a warning here.
	// TODO: I'm unsure about the unregisteredFallbackBlock check,
	// it might ignore some dynamic unregistered third party blocks wrongly.
	const isFallbackBlock =
		normalizedBlock.blockName === getFreeformContentHandlerName() ||
		normalizedBlock.blockName === getUnregisteredTypeHandlerName();
	if ( ! blockType || ( ! normalizedBlock.innerHTML && isFallbackBlock ) ) {
		return;
	}

	// Parse inner blocks recursively.
	const parsedInnerBlocks = normalizedBlock.innerBlocks
		.map( parseRawBlock )
		// See https://github.com/WordPress/gutenberg/pull/17164.
		.filter( ( innerBlock ) => !! innerBlock );

	// Get the fully parsed block.
	let parsedBlock = createBlock(
		normalizedBlock.blockName,
		getBlockAttributes(
			blockType,
			normalizedBlock.innerHTML,
			normalizedBlock.attrs
		),
		parsedInnerBlocks
	);
	parsedBlock.originalContent = normalizedBlock.innerHTML;

	// Attempt to validate the block.
	let [ isValid, validationIssues ] = validateBlock( parsedBlock, blockType );

	// If the block is invalid, attempt some built-in fixes
	// like custom classNames handling.
	if ( ! isValid ) {
		parsedBlock = applyBuiltInValidationFixes( parsedBlock, blockType );
		// Attempt to validate the block once again after the built-in fixes.
		[ isValid, validationIssues ] = validateBlock( parsedBlock, blockType );
	}
	parsedBlock.isValid = isValid;
	parsedBlock.validationIssues = validationIssues;

	// Run the block deprecation and migrations.
	// This is performed on both invalid and valid blocks because
	// migration using the `migrate` functions should run even
	// if the output is deemed valid.
	parsedBlock = applyBlockDeprecatedVersions(
		parsedBlock,
		normalizedBlock,
		blockType
	);
	if ( validationIssues && validationIssues.length > 0 ) {
		if ( parsedBlock.isValid ) {
			/* eslint-disable no-console */
			console.groupCollapsed( 'Updated Block: %s', blockType.name );
			console.info(
				'Block successfully updated for `%s` (%o).\n\nNew content generated by `save` function:\n\n%s\n\nContent retrieved from post body:\n\n%s',
				blockType.name,
				blockType,
				getSaveContent( blockType, parsedBlock.attributes ),
				parsedBlock.originalContent
			);
			console.groupEnd();
			/* eslint-enable no-console */
		} else {
			validationIssues.forEach( ( { log, args } ) => log( ...args ) );
		}
	}

	return parsedBlock;
}

/**
 * Utilizes an optimized token-driven parser based on the Gutenberg grammar spec
 * defined through a parsing expression grammar to take advantage of the regular
 * cadence provided by block delimiters -- composed syntactically through HTML
 * comments -- which, given a general HTML document as an input, returns a block
 * list array representation.
 *
 * This is a recursive-descent parser that scans linearly once through the input
 * document. Instead of directly recursing it utilizes a trampoline mechanism to
 * prevent stack overflow. This initial pass is mainly interested in separating
 * and isolating the blocks serialized in the document and manifestly not in the
 * content within the blocks.
 *
 * @see
 * https://developer.wordpress.org/block-editor/packages/packages-block-serialization-default-parser/
 *
 * @param {string} content The post content.
 *
 * @return {Array} Block list.
 */
export default function parse( content ) {
	return grammarParse( content ).reduce( ( accumulator, rawBlock ) => {
		const block = parseRawBlock( rawBlock );
		if ( block ) {
			accumulator.push( block );
		}
		return accumulator;
	}, [] );
}
