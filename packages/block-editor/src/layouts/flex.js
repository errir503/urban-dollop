/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	justifyLeft,
	justifyCenter,
	justifyRight,
	justifySpaceBetween,
	arrowRight,
	arrowDown,
} from '@wordpress/icons';
import { Button, ToggleControl, Flex, FlexItem } from '@wordpress/components';
import { getBlockSupport } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { appendSelectors } from './utils';
import { getGapCSSValue } from '../hooks/gap';
import useSetting from '../components/use-setting';
import {
	BlockControls,
	JustifyContentControl,
	BlockVerticalAlignmentControl,
} from '../components';
import { shouldSkipSerialization } from '../hooks/utils';

// Used with the default, horizontal flex orientation.
const justifyContentMap = {
	left: 'flex-start',
	right: 'flex-end',
	center: 'center',
	'space-between': 'space-between',
};

// Used with the vertical (column) flex orientation.
const alignItemsMap = {
	left: 'flex-start',
	right: 'flex-end',
	center: 'center',
};

const verticalAlignmentMap = {
	top: 'flex-start',
	center: 'center',
	bottom: 'flex-end',
};

const flexWrapOptions = [ 'wrap', 'nowrap' ];

export default {
	name: 'flex',
	label: __( 'Flex' ),
	inspectorControls: function FlexLayoutInspectorControls( {
		layout = {},
		onChange,
		layoutBlockSupport = {},
	} ) {
		const { allowOrientation = true } = layoutBlockSupport;
		return (
			<>
				<Flex>
					<FlexItem>
						<FlexLayoutJustifyContentControl
							layout={ layout }
							onChange={ onChange }
						/>
					</FlexItem>
					<FlexItem>
						{ allowOrientation && (
							<OrientationControl
								layout={ layout }
								onChange={ onChange }
							/>
						) }
					</FlexItem>
				</Flex>
				<FlexWrapControl layout={ layout } onChange={ onChange } />
			</>
		);
	},
	toolBarControls: function FlexLayoutToolbarControls( {
		layout = {},
		onChange,
		layoutBlockSupport,
	} ) {
		if ( layoutBlockSupport?.allowSwitching ) {
			return null;
		}
		const { allowVerticalAlignment = true } = layoutBlockSupport;
		return (
			<BlockControls group="block" __experimentalShareWithChildBlocks>
				<FlexLayoutJustifyContentControl
					layout={ layout }
					onChange={ onChange }
					isToolbar
				/>
				{ allowVerticalAlignment &&
					layout?.orientation !== 'vertical' && (
						<FlexLayoutVerticalAlignmentControl
							layout={ layout }
							onChange={ onChange }
							isToolbar
						/>
					) }
			</BlockControls>
		);
	},
	save: function FlexLayoutStyle( { selector, layout, style, blockName } ) {
		const { orientation = 'horizontal' } = layout;
		const blockGapSupport = useSetting( 'spacing.blockGap' );
		const fallbackValue =
			getBlockSupport( blockName, [
				'spacing',
				'blockGap',
				'__experimentalDefault',
			] ) || '0.5em';

		const hasBlockGapStylesSupport = blockGapSupport !== null;
		// If a block's block.json skips serialization for spacing or spacing.blockGap,
		// don't apply the user-defined value to the styles.
		const blockGapValue =
			style?.spacing?.blockGap &&
			! shouldSkipSerialization( blockName, 'spacing', 'blockGap' )
				? getGapCSSValue( style?.spacing?.blockGap, fallbackValue )
				: `var( --wp--style--block-gap, ${ fallbackValue } )`;
		const justifyContent =
			justifyContentMap[ layout.justifyContent ] ||
			justifyContentMap.left;
		const flexWrap = flexWrapOptions.includes( layout.flexWrap )
			? layout.flexWrap
			: 'wrap';
		const verticalAlignment =
			verticalAlignmentMap[ layout.verticalAlignment ] ||
			verticalAlignmentMap.center;
		const rowOrientation = `
		flex-direction: row;
		align-items: ${ verticalAlignment };
		justify-content: ${ justifyContent };
		`;
		const alignItems =
			alignItemsMap[ layout.justifyContent ] || alignItemsMap.left;
		const columnOrientation = `
		flex-direction: column;
		align-items: ${ alignItems };
		`;

		return (
			<style>{ `
				${ appendSelectors( selector ) } {
					display: flex;
					flex-wrap: ${ flexWrap };
					gap: ${ hasBlockGapStylesSupport ? blockGapValue : fallbackValue };
					${ orientation === 'horizontal' ? rowOrientation : columnOrientation }
				}

				${ appendSelectors( selector, '> *' ) } {
					margin: 0;
				}
			` }</style>
		);
	},
	getOrientation( layout ) {
		const { orientation = 'horizontal' } = layout;
		return orientation;
	},
	getAlignments() {
		return [];
	},
};

function FlexLayoutVerticalAlignmentControl( {
	layout,
	onChange,
	isToolbar = false,
} ) {
	const { verticalAlignment = verticalAlignmentMap.center } = layout;

	const onVerticalAlignmentChange = ( value ) => {
		onChange( {
			...layout,
			verticalAlignment: value,
		} );
	};
	if ( isToolbar ) {
		return (
			<BlockVerticalAlignmentControl
				onChange={ onVerticalAlignmentChange }
				value={ verticalAlignment }
			/>
		);
	}

	const verticalAlignmentOptions = [
		{
			value: 'flex-start',
			label: __( 'Align items top' ),
		},
		{
			value: 'center',
			label: __( 'Align items center' ),
		},
		{
			value: 'flex-end',
			label: __( 'Align items bottom' ),
		},
	];

	return (
		<fieldset className="block-editor-hooks__flex-layout-vertical-alignment-control">
			<legend>{ __( 'Vertical alignment' ) }</legend>
			<div>
				{ verticalAlignmentOptions.map( ( value, icon, label ) => {
					return (
						<Button
							key={ value }
							label={ label }
							icon={ icon }
							isPressed={ verticalAlignment === value }
							onClick={ () => onVerticalAlignmentChange( value ) }
						/>
					);
				} ) }
			</div>
		</fieldset>
	);
}

function FlexLayoutJustifyContentControl( {
	layout,
	onChange,
	isToolbar = false,
} ) {
	const { justifyContent = 'left', orientation = 'horizontal' } = layout;
	const onJustificationChange = ( value ) => {
		onChange( {
			...layout,
			justifyContent: value,
		} );
	};
	const allowedControls = [ 'left', 'center', 'right' ];
	if ( orientation === 'horizontal' ) {
		allowedControls.push( 'space-between' );
	}
	if ( isToolbar ) {
		return (
			<JustifyContentControl
				allowedControls={ allowedControls }
				value={ justifyContent }
				onChange={ onJustificationChange }
				popoverProps={ {
					position: 'bottom right',
					isAlternate: true,
				} }
			/>
		);
	}

	const justificationOptions = [
		{
			value: 'left',
			icon: justifyLeft,
			label: __( 'Justify items left' ),
		},
		{
			value: 'center',
			icon: justifyCenter,
			label: __( 'Justify items center' ),
		},
		{
			value: 'right',
			icon: justifyRight,
			label: __( 'Justify items right' ),
		},
	];
	if ( orientation === 'horizontal' ) {
		justificationOptions.push( {
			value: 'space-between',
			icon: justifySpaceBetween,
			label: __( 'Space between items' ),
		} );
	}

	return (
		<fieldset className="block-editor-hooks__flex-layout-justification-controls">
			<legend>{ __( 'Justification' ) }</legend>
			<div>
				{ justificationOptions.map( ( { value, icon, label } ) => {
					return (
						<Button
							key={ value }
							label={ label }
							icon={ icon }
							isPressed={ justifyContent === value }
							onClick={ () => onJustificationChange( value ) }
						/>
					);
				} ) }
			</div>
		</fieldset>
	);
}

function FlexWrapControl( { layout, onChange } ) {
	const { flexWrap = 'wrap' } = layout;
	return (
		<ToggleControl
			label={ __( 'Allow to wrap to multiple lines' ) }
			onChange={ ( value ) => {
				onChange( {
					...layout,
					flexWrap: value ? 'wrap' : 'nowrap',
				} );
			} }
			checked={ flexWrap === 'wrap' }
		/>
	);
}

function OrientationControl( { layout, onChange } ) {
	const { orientation = 'horizontal' } = layout;
	return (
		<fieldset className="block-editor-hooks__flex-layout-orientation-controls">
			<legend>{ __( 'Orientation' ) }</legend>
			<Button
				label={ __( 'Horizontal' ) }
				icon={ arrowRight }
				isPressed={ orientation === 'horizontal' }
				onClick={ () =>
					onChange( {
						...layout,
						orientation: 'horizontal',
					} )
				}
			/>
			<Button
				label={ __( 'Vertical' ) }
				icon={ arrowDown }
				isPressed={ orientation === 'vertical' }
				onClick={ () =>
					onChange( {
						...layout,
						orientation: 'vertical',
					} )
				}
			/>
		</fieldset>
	);
}
