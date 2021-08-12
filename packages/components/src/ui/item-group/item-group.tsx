/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { Ref } from 'react';

/**
 * Internal dependencies
 */
import type { PolymorphicComponentProps } from '../context';
// eslint-disable-next-line no-duplicate-imports
import { contextConnect } from '../context';
import { useItemGroup } from './use-item-group';
import { ItemGroupContext, useItemGroupContext } from './context';
import { View } from '../../view';
import type { ItemGroupProps } from './types';

function ItemGroup(
	props: PolymorphicComponentProps< ItemGroupProps, 'div' >,
	forwardedRef: Ref< any >
) {
	const {
		isBordered,
		isSeparated,
		size: sizeProp,
		...otherProps
	} = useItemGroup( props );

	const { size: contextSize } = useItemGroupContext();

	const spacedAround = ! isBordered && ! isSeparated;
	const size = sizeProp || contextSize;

	const contextValue = {
		spacedAround,
		size,
	};

	return (
		<ItemGroupContext.Provider value={ contextValue }>
			<View { ...otherProps } ref={ forwardedRef } />
		</ItemGroupContext.Provider>
	);
}

export default contextConnect( ItemGroup, 'ItemGroup' );
