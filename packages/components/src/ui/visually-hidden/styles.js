/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/css';

/**
 * Internal dependencies
 */
import { COLORS } from '../../utils/colors-values';

export const VisuallyHidden = css`
	border: 0;
	clip: rect( 1px, 1px, 1px, 1px );
	-webkit-clip-path: inset( 50% );
	clip-path: inset( 50% );
	height: 1px;
	margin: -1px;
	overflow: hidden;
	padding: 0;
	position: absolute;
	width: 1px;
	word-wrap: normal !important;

	&:focus {
		background-color: ${ COLORS.lightGray[ '300' ] };
		clip: auto !important;
		clip-path: none;
		color: #444;
		display: block;
		font-size: 1em;
		height: auto;
		left: 5px;
		line-height: normal;
		padding: 15px 23px 14px;
		text-decoration: none;
		top: 5px;
		width: auto;
		z-index: 100000;
	}
`;
