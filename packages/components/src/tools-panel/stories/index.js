/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ToolsPanel, ToolsPanelItem } from '../';
import Panel from '../../panel';
import UnitControl from '../../unit-control';
import { createSlotFill, Provider as SlotFillProvider } from '../../slot-fill';

export default {
	title: 'Components (Experimental)/ToolsPanel',
	component: ToolsPanel,
};

export const _default = () => {
	const [ height, setHeight ] = useState();
	const [ minHeight, setMinHeight ] = useState();
	const [ width, setWidth ] = useState();

	const resetAll = () => {
		setHeight( undefined );
		setWidth( undefined );
		setMinHeight( undefined );
	};

	return (
		<PanelWrapperView>
			<Panel>
				<ToolsPanel
					label="Tools Panel (default example)"
					resetAll={ resetAll }
				>
					<SingleColumnItem
						hasValue={ () => !! width }
						label="Width"
						onDeselect={ () => setWidth( undefined ) }
						isShownByDefault={ true }
					>
						<UnitControl
							label="Width"
							value={ width }
							onChange={ ( next ) => setWidth( next ) }
						/>
					</SingleColumnItem>
					<SingleColumnItem
						hasValue={ () => !! height }
						label="Height"
						onDeselect={ () => setHeight( undefined ) }
						isShownByDefault={ true }
					>
						<UnitControl
							label="Height"
							value={ height }
							onChange={ ( next ) => setHeight( next ) }
						/>
					</SingleColumnItem>
					<ToolsPanelItem
						hasValue={ () => !! minHeight }
						label="Minimum height"
						onDeselect={ () => setMinHeight( undefined ) }
						isShownByDefault={ true }
					>
						<UnitControl
							label="Minimum height"
							value={ minHeight }
							onChange={ ( next ) => setMinHeight( next ) }
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</Panel>
		</PanelWrapperView>
	);
};

export const WithOptionalItemsPlusIcon = () => {
	const [ height, setHeight ] = useState();
	const [ width, setWidth ] = useState();

	const resetAll = () => {
		setHeight( undefined );
		setWidth( undefined );
	};

	return (
		<PanelWrapperView>
			<Panel>
				<ToolsPanel
					label="Tools Panel (optional items only)"
					resetAll={ resetAll }
				>
					<SingleColumnItem
						hasValue={ () => !! width }
						label="Width"
						onDeselect={ () => setWidth( undefined ) }
						isShownByDefault={ false }
					>
						<UnitControl
							label="Width"
							value={ width }
							onChange={ ( next ) => setWidth( next ) }
						/>
					</SingleColumnItem>
					<SingleColumnItem
						hasValue={ () => !! height }
						label="Height"
						onDeselect={ () => setHeight( undefined ) }
						isShownByDefault={ false }
					>
						<UnitControl
							label="Height"
							value={ height }
							onChange={ ( next ) => setHeight( next ) }
						/>
					</SingleColumnItem>
				</ToolsPanel>
			</Panel>
		</PanelWrapperView>
	);
};

const { Fill: ToolsPanelItems, Slot } = createSlotFill( 'ToolsPanelSlot' );
const panelId = 'unique-tools-panel-id';

export const WithSlotFillItems = () => {
	const [ attributes, setAttributes ] = useState( {} );
	const { width, height } = attributes;

	const resetAll = ( resetFilters = [] ) => {
		let newAttributes = {};

		resetFilters.forEach( ( resetFilter ) => {
			newAttributes = {
				...newAttributes,
				...resetFilter( newAttributes ),
			};
		} );

		setAttributes( newAttributes );
	};

	const updateAttribute = ( name, value ) => {
		setAttributes( {
			...attributes,
			[ name ]: value,
		} );
	};

	return (
		<SlotFillProvider>
			<ToolsPanelItems>
				<SingleColumnItem
					hasValue={ () => !! width }
					label="Injected Width"
					onDeselect={ () => updateAttribute( 'width', undefined ) }
					resetAllFilter={ () => ( { width: undefined } ) }
					panelId={ panelId }
				>
					<UnitControl
						label="Injected Width"
						value={ width }
						onChange={ ( next ) =>
							updateAttribute( 'width', next )
						}
					/>
				</SingleColumnItem>
				<SingleColumnItem
					hasValue={ () => !! height }
					label="Injected Height"
					onDeselect={ () => updateAttribute( 'height', undefined ) }
					resetAllFilter={ () => ( { height: undefined } ) }
					panelId={ panelId }
				>
					<UnitControl
						label="Injected Height"
						value={ height }
						onChange={ ( next ) =>
							updateAttribute( 'height', next )
						}
					/>
				</SingleColumnItem>
				<ToolsPanelItem
					hasValue={ () => true }
					label="Item for alternate panel"
					onDeselect={ () => undefined }
					resetAllFilter={ () => undefined }
					panelId={ 'intended-for-another-panel-via-shared-slot' }
				>
					<p>
						This panel item will not be displayed in the demo as its
						panelId does not match the panel being rendered.
					</p>
				</ToolsPanelItem>
			</ToolsPanelItems>
			<PanelWrapperView>
				<Panel>
					<ToolsPanel
						label="Tools Panel With SlotFill Items"
						resetAll={ resetAll }
						panelId={ panelId }
					>
						<Slot />
					</ToolsPanel>
				</Panel>
			</PanelWrapperView>
		</SlotFillProvider>
	);
};

export { TypographyPanel } from './typography-panel';

const PanelWrapperView = styled.div`
	max-width: 280px;
	font-size: 13px;

	.components-dropdown-menu__menu {
		max-width: 220px;
	}
`;

const SingleColumnItem = styled( ToolsPanelItem )`
	grid-column: span 1;
`;
