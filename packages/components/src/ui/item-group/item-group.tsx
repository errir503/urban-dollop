/**
 * Internal dependencies
 */
import type { PolymorphicComponentProps } from '../context';
// eslint-disable-next-line no-duplicate-imports
import { contextConnect } from '../context';
import { useItemGroup } from './use-item-group';
// eslint-disable-next-line no-duplicate-imports
import type { Props } from './use-item-group';
import { ItemGroupContext, useItemGroupContext } from './context';
import { View } from '../../view';

function ItemGroup( props: PolymorphicComponentProps< Props, 'div' > ) {
	const { bordered, separated, size: sizeProp, ...otherProps } = useItemGroup(
		props
	);

	const { size: contextSize } = useItemGroupContext();

	const spacedAround = ! bordered && ! separated;
	const size = sizeProp || contextSize;

	const contextValue = {
		spacedAround,
		size,
	};

	return (
		<ItemGroupContext.Provider value={ contextValue }>
			<View { ...otherProps } />
		</ItemGroupContext.Provider>
	);
}

export default contextConnect( ItemGroup, 'ItemGroup' );
