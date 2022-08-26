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

/**
 * Internal dependencies
 */
import { appendSelectors, getBlockGapCSS } from './utils';
import { getGapCSSValue } from '../hooks/gap';
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
	getLayoutStyle: function getLayoutStyle( {
		selector,
		layout,
		style,
		blockName,
		hasBlockGapSupport,
		layoutDefinitions,
	} ) {
		const { orientation = 'horizontal' } = layout;

		// If a block's block.json skips serialization for spacing or spacing.blockGap,
		// don't apply the user-defined value to the styles.
		const blockGapValue =
			style?.spacing?.blockGap &&
			! shouldSkipSerialization( blockName, 'spacing', 'blockGap' )
				? getGapCSSValue( style?.spacing?.blockGap, '0.5em' )
				: undefined;
		const justifyContent = justifyContentMap[ layout.justifyContent ];
		const flexWrap = flexWrapOptions.includes( layout.flexWrap )
			? layout.flexWrap
			: 'wrap';
		const verticalAlignment =
			verticalAlignmentMap[ layout.verticalAlignment ];
		const alignItems =
			alignItemsMap[ layout.justifyContent ] || alignItemsMap.left;

		let output = '';
		const rules = [];

		if ( flexWrap && flexWrap !== 'wrap' ) {
			rules.push( `flex-wrap: ${ flexWrap }` );
		}

		if ( orientation === 'horizontal' ) {
			if ( verticalAlignment ) {
				rules.push( `align-items: ${ verticalAlignment }` );
			}
			if ( justifyContent ) {
				rules.push( `justify-content: ${ justifyContent }` );
			}
		} else {
			rules.push( 'flex-direction: column' );
			rules.push( `align-items: ${ alignItems }` );
		}

		if ( rules.length ) {
			output = `${ appendSelectors( selector ) } {
				${ rules.join( '; ' ) };
			}`;
		}

		// Output blockGap styles based on rules contained in layout definitions in theme.json.
		if ( hasBlockGapSupport && blockGapValue ) {
			output += getBlockGapCSS(
				selector,
				layoutDefinitions,
				'flex',
				blockGapValue
			);
		}
		return output;
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
