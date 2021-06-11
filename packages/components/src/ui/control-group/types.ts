/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { CSSProperties } from 'react';

/**
 * Internal dependencies
 */
import type { FlexProps } from '../../flex/types';

export type ControlGroupContext = {
	isFirst?: boolean;
	isLast?: boolean;
	isMidde?: boolean;
	isOnly?: boolean;
	isVertical?: boolean;
	styles?: string;
};

export type Props = Pick< FlexProps, 'direction' > & {
	/**
	 * Adjust the layout (width) of content using CSS grid (`grid-template-columns`).
	 */
	templateColumns?: CSSProperties[ 'gridTemplateColumns' ];
};
