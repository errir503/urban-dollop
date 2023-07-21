/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorAdvancedControls,
	store as blockEditorStore,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import { BaseControl, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	__EXPERIMENTAL_STYLE_PROPERTY as STYLE_PROPERTY,
	getBlockType,
	hasBlockSupport,
} from '@wordpress/blocks';
import { useContext, useMemo, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { useSupportedStyles } from '../../components/global-styles/hooks';
import { unlock } from '../../lock-unlock';

const {
	GlobalStylesContext,
	useBlockEditingMode,
	__experimentalUseGlobalBehaviors: useGlobalBehaviors,
	__experimentalUseHasBehaviorsPanel: useHasBehaviorsPanel,
} = unlock( blockEditorPrivateApis );

// TODO: Temporary duplication of constant in @wordpress/block-editor. Can be
// removed by moving PushChangesToGlobalStylesControl to
// @wordpress/block-editor.
const STYLE_PATH_TO_CSS_VAR_INFIX = {
	'color.background': 'color',
	'color.text': 'color',
	'elements.link.color.text': 'color',
	'elements.link.:hover.color.text': 'color',
	'elements.link.typography.fontFamily': 'font-family',
	'elements.link.typography.fontSize': 'font-size',
	'elements.button.color.text': 'color',
	'elements.button.color.background': 'color',
	'elements.button.typography.fontFamily': 'font-family',
	'elements.button.typography.fontSize': 'font-size',
	'elements.caption.color.text': 'color',
	'elements.heading.color': 'color',
	'elements.heading.color.background': 'color',
	'elements.heading.typography.fontFamily': 'font-family',
	'elements.heading.gradient': 'gradient',
	'elements.heading.color.gradient': 'gradient',
	'elements.h1.color': 'color',
	'elements.h1.color.background': 'color',
	'elements.h1.typography.fontFamily': 'font-family',
	'elements.h1.color.gradient': 'gradient',
	'elements.h2.color': 'color',
	'elements.h2.color.background': 'color',
	'elements.h2.typography.fontFamily': 'font-family',
	'elements.h2.color.gradient': 'gradient',
	'elements.h3.color': 'color',
	'elements.h3.color.background': 'color',
	'elements.h3.typography.fontFamily': 'font-family',
	'elements.h3.color.gradient': 'gradient',
	'elements.h4.color': 'color',
	'elements.h4.color.background': 'color',
	'elements.h4.typography.fontFamily': 'font-family',
	'elements.h4.color.gradient': 'gradient',
	'elements.h5.color': 'color',
	'elements.h5.color.background': 'color',
	'elements.h5.typography.fontFamily': 'font-family',
	'elements.h5.color.gradient': 'gradient',
	'elements.h6.color': 'color',
	'elements.h6.color.background': 'color',
	'elements.h6.typography.fontFamily': 'font-family',
	'elements.h6.color.gradient': 'gradient',
	'color.gradient': 'gradient',
	'typography.fontSize': 'font-size',
	'typography.fontFamily': 'font-family',
};

// TODO: Temporary duplication of constant in @wordpress/block-editor. Can be
// removed by moving PushChangesToGlobalStylesControl to
// @wordpress/block-editor.
const STYLE_PATH_TO_PRESET_BLOCK_ATTRIBUTE = {
	'color.background': 'backgroundColor',
	'color.text': 'textColor',
	'color.gradient': 'gradient',
	'typography.fontSize': 'fontSize',
	'typography.fontFamily': 'fontFamily',
};

const SUPPORTED_STYLES = [ 'border', 'color', 'spacing', 'typography' ];

const getValueFromObjectPath = ( object, path ) => {
	let value = object;
	path.forEach( ( fieldName ) => {
		value = value?.[ fieldName ];
	} );
	return value;
};

function useChangesToPush( name, attributes ) {
	const supports = useSupportedStyles( name );

	return useMemo(
		() =>
			supports.flatMap( ( key ) => {
				if ( ! STYLE_PROPERTY[ key ] ) {
					return [];
				}
				const { value: path } = STYLE_PROPERTY[ key ];
				const presetAttributeKey = path.join( '.' );
				const presetAttributeValue =
					attributes[
						STYLE_PATH_TO_PRESET_BLOCK_ATTRIBUTE[
							presetAttributeKey
						]
					];
				const value = presetAttributeValue
					? `var:preset|${ STYLE_PATH_TO_CSS_VAR_INFIX[ presetAttributeKey ] }|${ presetAttributeValue }`
					: getValueFromObjectPath( attributes.style, path );
				return value ? [ { path, value } ] : [];
			} ),
		[ supports, attributes ]
	);
}

/**
 * Sets the value at path of object.
 * If a portion of path doesn’t exist, it’s created.
 * Arrays are created for missing index properties while objects are created
 * for all other missing properties.
 *
 * This function intentionally mutates the input object.
 *
 * Inspired by _.set().
 *
 * @see https://lodash.com/docs/4.17.15#set
 *
 * @todo Needs to be deduplicated with its copy in `@wordpress/core-data`.
 *
 * @param {Object} object Object to modify
 * @param {Array}  path   Path of the property to set.
 * @param {*}      value  Value to set.
 */
function setNestedValue( object, path, value ) {
	if ( ! object || typeof object !== 'object' ) {
		return object;
	}

	path.reduce( ( acc, key, idx ) => {
		if ( acc[ key ] === undefined ) {
			if ( Number.isInteger( path[ idx + 1 ] ) ) {
				acc[ key ] = [];
			} else {
				acc[ key ] = {};
			}
		}
		if ( idx === path.length - 1 ) {
			acc[ key ] = value;
		}
		return acc[ key ];
	}, object );

	return object;
}

function cloneDeep( object ) {
	return ! object ? {} : JSON.parse( JSON.stringify( object ) );
}

function PushChangesToGlobalStylesControl( {
	name,
	attributes,
	setAttributes,
} ) {
	const changes = useChangesToPush( name, attributes );

	const hasBehaviorsPanel = useHasBehaviorsPanel( attributes, name, {
		blockSupportOnly: true,
	} );
	const { user: userConfig, setUserConfig } =
		useContext( GlobalStylesContext );

	const { __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );
	const { createSuccessNotice } = useDispatch( noticesStore );

	const { inheritedBehaviors, setBehavior } = useGlobalBehaviors( name );

	const userHasEditedBehaviors =
		attributes.hasOwnProperty( 'behaviors' ) && hasBehaviorsPanel;

	const pushChanges = useCallback( () => {
		if ( changes.length === 0 && ! userHasEditedBehaviors ) {
			return;
		}
		if ( changes.length > 0 ) {
			const { style: blockStyles } = attributes;

			const newBlockStyles = cloneDeep( blockStyles );
			const newUserConfig = cloneDeep( userConfig );

			for ( const { path, value } of changes ) {
				setNestedValue( newBlockStyles, path, undefined );
				setNestedValue(
					newUserConfig,
					[ 'styles', 'blocks', name, ...path ],
					value
				);
			}

			// @wordpress/core-data doesn't support editing multiple entity types in
			// a single undo level. So for now, we disable @wordpress/core-data undo
			// tracking and implement our own Undo button in the snackbar
			// notification.
			__unstableMarkNextChangeAsNotPersistent();
			setAttributes( { style: newBlockStyles } );
			setUserConfig( () => newUserConfig, { undoIgnore: true } );
			createSuccessNotice(
				sprintf(
					// translators: %s: Title of the block e.g. 'Heading'.
					__( '%s styles applied.' ),
					getBlockType( name ).title
				),
				{
					type: 'snackbar',
					actions: [
						{
							label: __( 'Undo' ),
							onClick() {
								__unstableMarkNextChangeAsNotPersistent();
								setAttributes( { style: blockStyles } );
								setUserConfig( () => userConfig, {
									undoIgnore: true,
								} );
							},
						},
					],
				}
			);
		}
		if ( userHasEditedBehaviors ) {
			__unstableMarkNextChangeAsNotPersistent();
			setBehavior( attributes.behaviors );
			createSuccessNotice(
				sprintf(
					// translators: %s: Title of the block e.g. 'Heading'.
					__( '%s behaviors applied.' ),
					getBlockType( name ).title
				),
				{
					type: 'snackbar',
					actions: [
						{
							label: __( 'Undo' ),
							onClick() {
								__unstableMarkNextChangeAsNotPersistent();
								setBehavior( inheritedBehaviors );
								setUserConfig( () => userConfig, {
									undoIgnore: true,
								} );
							},
						},
					],
				}
			);
		}
	}, [ changes, attributes, userConfig, name ] );

	return (
		<BaseControl
			className="edit-site-push-changes-to-global-styles-control"
			help={ sprintf(
				// translators: %s: Title of the block e.g. 'Heading'.
				__(
					'Apply this block’s typography, spacing, dimensions, color styles, and behaviors to all %s blocks.'
				),
				getBlockType( name ).title
			) }
		>
			<BaseControl.VisualLabel>
				{ __( 'Styles' ) }
			</BaseControl.VisualLabel>
			<Button
				variant="primary"
				disabled={ changes.length === 0 && ! userHasEditedBehaviors }
				onClick={ pushChanges }
			>
				{ __( 'Apply globally' ) }
			</Button>
		</BaseControl>
	);
}

const withPushChangesToGlobalStyles = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const blockEditingMode = useBlockEditingMode();
		const supportsStyles = SUPPORTED_STYLES.some( ( feature ) =>
			hasBlockSupport( props.name, feature )
		);

		return (
			<>
				<BlockEdit { ...props } />
				{ blockEditingMode === 'default' && supportsStyles && (
					<InspectorAdvancedControls>
						<PushChangesToGlobalStylesControl { ...props } />
					</InspectorAdvancedControls>
				) }
			</>
		);
	}
);

addFilter(
	'editor.BlockEdit',
	'core/edit-site/push-changes-to-global-styles',
	withPushChangesToGlobalStyles
);
