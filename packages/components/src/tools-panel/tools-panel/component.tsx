/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { Ref } from 'react';

/**
 * Internal dependencies
 */
import ToolsPanelHeader from '../tools-panel-header';
import { ToolsPanelContext } from '../context';
import { useToolsPanel } from './hook';
import { Grid } from '../../grid';
import { contextConnect, WordPressComponentProps } from '../../ui/context';
import type { ToolsPanelProps } from '../types';

const ToolsPanel = (
	props: WordPressComponentProps< ToolsPanelProps, 'div' >,
	forwardedRef: Ref< any >
) => {
	const {
		children,
		label,
		panelContext,
		resetAllItems,
		toggleItem,
		className,
	} = useToolsPanel( props );

	// Props are not directly passed through to avoid exposing Grid props
	// until agreement has been reached on how ToolsPanel layout should be
	// handled.
	return (
		<Grid columns={ 2 } className={ className } ref={ forwardedRef }>
			<ToolsPanelContext.Provider value={ panelContext }>
				<ToolsPanelHeader
					label={ label }
					resetAll={ resetAllItems }
					toggleItem={ toggleItem }
				/>
				{ children }
			</ToolsPanelContext.Provider>
		</Grid>
	);
};

const ConnectedToolsPanel = contextConnect( ToolsPanel, 'ToolsPanel' );

export default ConnectedToolsPanel;
