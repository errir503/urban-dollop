/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { css } from '@emotion/react';

/**
 * Internal dependencies
 */
import { Flex } from '../flex';
import { space } from '../ui/utils/space';

const deprecatedDefaultSize = ( { __next36pxDefaultSize } ) =>
	! __next36pxDefaultSize &&
	css`
		height: 28px; // 30px - 2px vertical borders on parent container
		padding-left: ${ space( 1 ) };
		padding-right: ${ space( 1 ) };
	`;

export const InputWrapperFlex = styled( Flex )`
	height: 34px; // 36px - 2px vertical borders on parent container
	padding-left: ${ space( 2 ) };
	padding-right: ${ space( 2 ) };

	${ deprecatedDefaultSize }
`;
