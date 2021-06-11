/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { withPreferredColorScheme } from '@wordpress/compose';
import { gallery as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import styles from './styles.scss';

const IconWithColorScheme = withPreferredColorScheme(
	( { getStylesFromColorScheme } ) => {
		const colorSchemeStyles = getStylesFromColorScheme(
			styles.icon,
			styles.iconDark
		);
		return <Icon icon={ icon } { ...colorSchemeStyles } />;
	}
);

export const sharedIcon = <IconWithColorScheme />;
