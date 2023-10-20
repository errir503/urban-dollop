/**
 * WordPress dependencies
 */
import { SlotFillProvider } from '@wordpress/components';
import { UnsavedChangesWarning } from '@wordpress/editor';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { PluginArea } from '@wordpress/plugins';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import Layout from '../layout';
import { GlobalStylesProvider } from '../global-styles/global-styles-provider';
import DataviewsProvider from '../dataviews/provider';
import { unlock } from '../../lock-unlock';

const { RouterProvider } = unlock( routerPrivateApis );

export default function App() {
	const { createErrorNotice } = useDispatch( noticesStore );

	function onPluginAreaError( name ) {
		createErrorNotice(
			sprintf(
				/* translators: %s: plugin name */
				__(
					'The "%s" plugin has encountered an error and cannot be rendered.'
				),
				name
			)
		);
	}

	return (
		<SlotFillProvider>
			<GlobalStylesProvider>
				<UnsavedChangesWarning />
				<RouterProvider>
					<DataviewsProvider>
						<Layout />
						<PluginArea onError={ onPluginAreaError } />
					</DataviewsProvider>
				</RouterProvider>
			</GlobalStylesProvider>
		</SlotFillProvider>
	);
}
