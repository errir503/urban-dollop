/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import BaseSlot from './slot';
import Fill from './fill';
import Provider from './provider';

export { Fill, Provider };

export function Slot( props ) {
	return <BaseSlot { ...omit( props, 'bubblesVirtually' ) } />;
}

export function createSlotFill( name ) {
	const FillComponent = ( props ) => <Fill name={ name } { ...props } />;
	FillComponent.displayName = name + 'Fill';

	const SlotComponent = ( props ) => <Slot name={ name } { ...props } />;
	SlotComponent.displayName = name + 'Slot';

	return {
		Fill: FillComponent,
		Slot: SlotComponent,
	};
}
