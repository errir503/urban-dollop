/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/css';

export const Flex = css`
	display: flex;
`;

export const Item = css`
	display: block;
	max-height: 100%;
	max-width: 100%;
	min-height: 0;
	min-width: 0;
`;

export const block = css`
	flex: 1;
`;

/**
 * Workaround to optimize DOM rendering.
 * We'll enhance alignment with naive parent flex assumptions.
 *
 * Trade-off:
 * Far less DOM less. However, UI rendering is not as reliable.
 */

/**
 * Improves stability of width/height rendering.
 * https://github.com/ItsJonQ/g2/pull/149
 */
export const ItemsColumn = css`
	> * {
		min-height: 0;
	}
`;

export const ItemsRow = css`
	> * {
		min-width: 0;
	}
`;
