/**
 * External dependencies
 */
import { Switch } from 'react-native';
import { isEmpty } from 'lodash';
/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import Cell from './cell';

export default function BottomSheetSwitchCell( props ) {
	const { value, onValueChange, ...cellProps } = props;

	const onPress = () => {
		onValueChange( ! value );
	};

	const getAccessibilityLabel = () => {
		if ( isEmpty( cellProps.help ) ) {
			return value
				? sprintf(
						/* translators: accessibility text. Switch setting ON state. %s: Switch title. */
						_x( '%s. On', 'switch control' ),
						cellProps.label
				  )
				: sprintf(
						/* translators: accessibility text. Switch setting OFF state. %s: Switch title. */
						_x( '%s. Off', 'switch control' ),
						cellProps.label
				  );
		}
		return value
			? sprintf(
					/* translators: accessibility text. Switch setting ON state. %1: Switch title, %2: switch help. */
					_x( '%1$s, %2$s. On', 'switch control' ),
					cellProps.label,
					cellProps.help
			  )
			: sprintf(
					/* translators: accessibility text. Switch setting OFF state. %1: Switch title, %2: switch help. */
					_x( '%1$s, %2$s. Off', 'switch control' ),
					cellProps.label,
					cellProps.help
			  );
	};

	return (
		<Cell
			{ ...cellProps }
			accessibilityLabel={ getAccessibilityLabel() }
			accessibilityRole={ 'none' }
			accessibilityHint={
				/* translators: accessibility text (hint for switches) */
				__( 'Double tap to toggle setting' )
			}
			onPress={ onPress }
			editable={ false }
			value={ '' }
		>
			<Switch value={ value } onValueChange={ onValueChange } />
		</Cell>
	);
}
