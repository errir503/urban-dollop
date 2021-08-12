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
import { CONFIG } from '../utils';

export const scrollableScrollbar = css`
	@media only screen and ( min-device-width: 40em ) {
		&::-webkit-scrollbar {
			height: 12px;
			width: 12px;
		}

		&::-webkit-scrollbar-track {
			background-color: transparent;
		}

		&::-webkit-scrollbar-track {
			background: ${ CONFIG.colorScrollbarTrack };
			border-radius: 8px;
		}

		&::-webkit-scrollbar-thumb {
			background-clip: padding-box;
			background-color: ${ CONFIG.colorScrollbarThumb };
			border: 2px solid rgba( 0, 0, 0, 0 );
			border-radius: 7px;
		}

		&:hover::-webkit-scrollbar-thumb {
			background-color: ${ CONFIG.colorScrollbarThumbHover };
		}
	}
`;

export const Scrollable = css`
	height: 100%;
`;

export const Content = css`
	position: relative;
`;

export const smoothScroll = css`
	scroll-behavior: smooth;
`;

export const scrollX = css`
	overflow-x: auto;
	overflow-y: hidden;
`;

export const scrollY = css`
	overflow-x: hidden;
	overflow-y: auto;
`;

export const scrollAuto = css`
	overflow-y: auto;
`;
