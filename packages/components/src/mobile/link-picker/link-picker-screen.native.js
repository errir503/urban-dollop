/**
 * External dependencies
 */
import { Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { delay } from 'lodash';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { LinkPicker } from './';

const LinkPickerScreen = ( { returnScreenName } ) => {
	const navigation = useNavigation();
	const route = useRoute();

	const onLinkPicked = ( { url, title } ) => {
		Keyboard.dismiss();
		delay( () => {
			navigation.navigate( returnScreenName, {
				inputValue: url,
				text: title,
			} );
		}, 100 );
	};

	const onCancel = () => {
		Keyboard.dismiss();
		delay( () => {
			navigation.goBack();
		}, 100 );
	};

	const { inputValue } = route.params;
	return useMemo( () => {
		return (
			<LinkPicker
				value={ inputValue }
				onLinkPicked={ onLinkPicked }
				onCancel={ onCancel }
			/>
		);
	}, [ inputValue ] );
};

export default LinkPickerScreen;
