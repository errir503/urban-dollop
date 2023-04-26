/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import traverse from './traverse';
import urlRewrite from './transforms/url-rewrite';
import wrap from './transforms/wrap';

/**
 * Applies a series of CSS rule transforms to wrap selectors inside a given class and/or rewrite URLs depending on the parameters passed.
 *
 * @param {Object|Array} styles           CSS rules.
 * @param {string}       wrapperClassName Wrapper Class Name.
 * @return {Array} converted rules.
 */
const transformStyles = ( styles, wrapperClassName = '' ) => {
	return Object.values( styles ?? [] ).map( ( { css, baseURL } ) => {
		const transforms = [];
		if ( wrapperClassName ) {
			transforms.push( wrap( wrapperClassName ) );
		}
		if ( baseURL ) {
			transforms.push( urlRewrite( baseURL ) );
		}
		if ( transforms.length ) {
			return traverse( css, compose( transforms ) );
		}

		return css;
	} );
};

export default transformStyles;
