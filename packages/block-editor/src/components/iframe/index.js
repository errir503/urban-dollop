/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useState,
	createPortal,
	forwardRef,
	useMemo,
	useReducer,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMergeRefs, useRefEffect } from '@wordpress/compose';
import { __experimentalStyleProvider as StyleProvider } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useBlockSelectionClearer } from '../block-selection-clearer';
import { useWritingFlow } from '../writing-flow';

const BODY_CLASS_NAME = 'editor-styles-wrapper';
const BLOCK_PREFIX = 'wp-block';

/**
 * Clones stylesheets targetting the editor canvas to the given document. A
 * stylesheet is considered targetting the editor a canvas if it contains the
 * `editor-styles-wrapper`, `wp-block`, or `wp-block-*` class selectors.
 *
 * Ideally, this hook should be removed in the future and styles should be added
 * explicitly as editor styles.
 */
function useStylesCompatibility() {
	return useRefEffect( ( node ) => {
		// Search the document for stylesheets targetting the editor canvas.
		Array.from( document.styleSheets ).forEach( ( styleSheet ) => {
			try {
				// May fail for external styles.
				// eslint-disable-next-line no-unused-expressions
				styleSheet.cssRules;
			} catch ( e ) {
				return;
			}

			const { ownerNode, cssRules } = styleSheet;

			if ( ! cssRules ) {
				return;
			}

			// Generally, ignore inline styles. We add inline styles belonging to a
			// stylesheet later, which may or may not match the selectors.
			if ( ownerNode.tagName !== 'LINK' ) {
				return;
			}

			// Don't try to add the reset styles, which were removed as a dependency
			// from `edit-blocks` for the iframe since we don't need to reset admin
			// styles.
			if ( ownerNode.id === 'wp-reset-editor-styles-css' ) {
				return;
			}

			function matchFromRules( _cssRules ) {
				return Array.from( _cssRules ).find(
					( {
						selectorText,
						conditionText,
						cssRules: __cssRules,
					} ) => {
						// If the rule is conditional then it will not have selector text.
						// Recurse into child CSS ruleset to determine selector eligibility.
						if ( conditionText ) {
							return matchFromRules( __cssRules );
						}

						return (
							selectorText &&
							( selectorText.includes(
								`.${ BODY_CLASS_NAME }`
							) ||
								selectorText.includes( `.${ BLOCK_PREFIX }` ) )
						);
					}
				);
			}

			const isMatch = matchFromRules( cssRules );

			if (
				isMatch &&
				! node.ownerDocument.getElementById( ownerNode.id )
			) {
				// Display warning once we have a way to add style dependencies to the editor.
				// See: https://github.com/WordPress/gutenberg/pull/37466.
				node.appendChild( ownerNode.cloneNode( true ) );

				// Add inline styles belonging to the stylesheet.
				const inlineCssId = ownerNode.id.replace(
					'-css',
					'-inline-css'
				);
				const inlineCssElement = document.getElementById( inlineCssId );

				if ( inlineCssElement ) {
					node.appendChild( inlineCssElement.cloneNode( true ) );
				}
			}
		} );
	}, [] );
}

/**
 * Bubbles some event types (keydown, keypress, and dragover) to parent document
 * document to ensure that the keyboard shortcuts and drag and drop work.
 *
 * Ideally, we should remove event bubbling in the future. Keyboard shortcuts
 * should be context dependent, e.g. actions on blocks like Cmd+A should not
 * work globally outside the block editor.
 *
 * @param {Document} doc Document to attach listeners to.
 */
function bubbleEvents( doc ) {
	const { defaultView } = doc;
	const { frameElement } = defaultView;

	function bubbleEvent( event ) {
		const prototype = Object.getPrototypeOf( event );
		const constructorName = prototype.constructor.name;
		const Constructor = window[ constructorName ];

		const init = {};

		for ( const key in event ) {
			init[ key ] = event[ key ];
		}

		if ( event instanceof defaultView.MouseEvent ) {
			const rect = frameElement.getBoundingClientRect();
			init.clientX += rect.left;
			init.clientY += rect.top;
		}

		const newEvent = new Constructor( event.type, init );
		const cancelled = ! frameElement.dispatchEvent( newEvent );

		if ( cancelled ) {
			event.preventDefault();
		}
	}

	const eventTypes = [ 'dragover' ];

	for ( const name of eventTypes ) {
		doc.addEventListener( name, bubbleEvent );
	}
}

function useParsedAssets( html ) {
	return useMemo( () => {
		const doc = document.implementation.createHTMLDocument( '' );
		doc.body.innerHTML = html;
		return Array.from( doc.body.children );
	}, [ html ] );
}

async function loadScript( head, { id, src } ) {
	return new Promise( ( resolve, reject ) => {
		const script = head.ownerDocument.createElement( 'script' );
		script.id = id;
		if ( src ) {
			script.src = src;
			script.onload = () => resolve();
			script.onerror = () => reject();
		} else {
			resolve();
		}
		head.appendChild( script );
	} );
}

function Iframe(
	{ contentRef, children, head, tabIndex = 0, assets, ...props },
	ref
) {
	const [ , forceRender ] = useReducer( () => ( {} ) );
	const [ iframeDocument, setIframeDocument ] = useState();
	const [ bodyClasses, setBodyClasses ] = useState( [] );
	const styles = useParsedAssets( assets?.styles );
	const scripts = useParsedAssets( assets?.scripts );
	const clearerRef = useBlockSelectionClearer();
	const [ before, writingFlowRef, after ] = useWritingFlow();
	const setRef = useRefEffect( ( node ) => {
		function setDocumentIfReady() {
			const { contentDocument, ownerDocument } = node;
			const { readyState, documentElement } = contentDocument;

			if ( readyState !== 'interactive' && readyState !== 'complete' ) {
				return false;
			}

			bubbleEvents( contentDocument );
			setIframeDocument( contentDocument );
			clearerRef( documentElement );

			// Ideally ALL classes that are added through get_body_class should
			// be added in the editor too, which we'll somehow have to get from
			// the server in the future (which will run the PHP filters).
			setBodyClasses(
				Array.from( ownerDocument.body.classList ).filter(
					( name ) =>
						name.startsWith( 'admin-color-' ) ||
						name.startsWith( 'post-type-' ) ||
						name === 'wp-embed-responsive'
				)
			);

			contentDocument.dir = ownerDocument.dir;
			documentElement.removeChild( contentDocument.head );
			documentElement.removeChild( contentDocument.body );

			return true;
		}

		// Document set with srcDoc is not immediately ready.
		node.addEventListener( 'load', setDocumentIfReady );

		return () => node.removeEventListener( 'load', setDocumentIfReady );
	}, [] );
	const headRef = useRefEffect( ( element ) => {
		scripts
			.reduce(
				( promise, script ) =>
					promise.then( () => loadScript( element, script ) ),
				Promise.resolve()
			)
			.finally( () => {
				// When script are loaded, re-render blocks to allow them
				// to initialise.
				forceRender();
			} );
	}, [] );
	const bodyRef = useMergeRefs( [ contentRef, clearerRef, writingFlowRef ] );
	const styleCompatibilityRef = useStylesCompatibility();

	head = (
		<>
			<style>{ 'body{margin:0}' }</style>
			{ styles.map(
				( { tagName, href, id, rel, media, textContent } ) => {
					const TagName = tagName.toLowerCase();

					if ( TagName === 'style' ) {
						return (
							<TagName { ...{ id } } key={ id }>
								{ textContent }
							</TagName>
						);
					}

					return (
						<TagName { ...{ href, id, rel, media } } key={ id } />
					);
				}
			) }
			{ head }
		</>
	);

	return (
		<>
			{ tabIndex >= 0 && before }
			<iframe
				{ ...props }
				ref={ useMergeRefs( [ ref, setRef ] ) }
				tabIndex={ tabIndex }
				// Correct doctype is required to enable rendering in standards mode
				srcDoc="<!doctype html>"
				title={ __( 'Editor canvas' ) }
			>
				{ iframeDocument &&
					createPortal(
						<>
							<head ref={ headRef }>{ head }</head>
							<body
								ref={ bodyRef }
								className={ classnames(
									BODY_CLASS_NAME,
									...bodyClasses
								) }
							>
								{ /*
								 * This is a wrapper for the extra styles and scripts
								 * rendered imperatively by cloning the parent,
								 * it's important that this div's content remains uncontrolled.
								 */ }
								<div
									style={ { display: 'none' } }
									ref={ styleCompatibilityRef }
								/>
								<StyleProvider document={ iframeDocument }>
									{ children }
								</StyleProvider>
							</body>
						</>,
						iframeDocument.documentElement
					) }
			</iframe>
			{ tabIndex >= 0 && after }
		</>
	);
}

export default forwardRef( Iframe );
