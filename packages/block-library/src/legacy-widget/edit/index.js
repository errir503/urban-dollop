/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	BlockControls,
	InspectorControls,
	BlockIcon,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarButton, Spinner, Placeholder } from '@wordpress/components';
import { brush as brushIcon, update as updateIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import WidgetTypeSelector from './widget-type-selector';
import InspectorCard from './inspector-card';
import Form from './form';
import Preview from './preview';
import NoPreview from './no-preview';
import ConvertToBlocksButton from './convert-to-blocks-button';

export default function Edit( props ) {
	const { id, idBase } = props.attributes;
	return (
		<div { ...useBlockProps() }>
			{ ! id && ! idBase ? (
				<Empty { ...props } />
			) : (
				<NotEmpty { ...props } />
			) }
		</div>
	);
}

function Empty( { attributes: { id, idBase }, setAttributes } ) {
	return (
		<Placeholder
			icon={ <BlockIcon icon={ brushIcon } /> }
			label={ __( 'Legacy Widget' ) }
		>
			<WidgetTypeSelector
				selectedId={ id ?? idBase }
				onSelect={ ( { selectedId, isMulti } ) => {
					if ( ! selectedId ) {
						setAttributes( {
							id: null,
							idBase: null,
							instance: null,
						} );
					} else if ( isMulti ) {
						setAttributes( {
							id: null,
							idBase: selectedId,
							instance: {},
						} );
					} else {
						setAttributes( {
							id: selectedId,
							idBase: null,
							instance: null,
						} );
					}
				} }
			/>
		</Placeholder>
	);
}

function NotEmpty( {
	attributes: { id, idBase, instance },
	setAttributes,
	clientId,
	isSelected,
} ) {
	const [ hasPreview, setHasPreview ] = useState( null );

	const {
		widgetType,
		hasResolvedWidgetType,
		isWidgetTypeHidden,
		isNavigationMode,
	} = useSelect(
		( select ) => {
			const widgetTypeId = id ?? idBase;
			const hiddenIds =
				select( blockEditorStore ).getSettings()
					?.widgetTypesToHideFromLegacyWidgetBlock ?? [];
			return {
				widgetType: select( coreStore ).getWidgetType( widgetTypeId ),
				hasResolvedWidgetType: select(
					coreStore
				).hasFinishedResolution( 'getWidgetType', [ widgetTypeId ] ),
				isWidgetTypeHidden: hiddenIds.includes( widgetTypeId ),
				isNavigationMode: select( blockEditorStore ).isNavigationMode(),
			};
		},
		[ id, idBase ]
	);

	const setInstance = useCallback( ( nextInstance ) => {
		setAttributes( { instance: nextInstance } );
	}, [] );

	if ( ! widgetType && hasResolvedWidgetType ) {
		return (
			<Placeholder
				icon={ <BlockIcon icon={ brushIcon } /> }
				label={ __( 'Legacy Widget' ) }
			>
				{ __( 'Widget is missing.' ) }
			</Placeholder>
		);
	}

	if ( ! hasResolvedWidgetType ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	const mode = isNavigationMode || ! isSelected ? 'preview' : 'edit';

	return (
		<>
			{ ! isWidgetTypeHidden && (
				<BlockControls group="block">
					<ToolbarButton
						label={ __( 'Change widget' ) }
						icon={ updateIcon }
						onClick={ () =>
							setAttributes( {
								id: null,
								idBase: null,
								instance: null,
							} )
						}
					/>
				</BlockControls>
			) }

			{ idBase === 'text' && (
				<BlockControls group="other">
					<ConvertToBlocksButton
						clientId={ clientId }
						rawInstance={ instance.raw }
					/>
				</BlockControls>
			) }

			<InspectorControls>
				<InspectorCard
					name={ widgetType.name }
					description={ widgetType.description }
				/>
			</InspectorControls>

			<Form
				title={ widgetType.name }
				isVisible={ mode === 'edit' }
				id={ id }
				idBase={ idBase }
				instance={ instance }
				onChangeInstance={ setInstance }
				onChangeHasPreview={ setHasPreview }
			/>

			{ idBase && (
				<>
					{ hasPreview === null && mode === 'preview' && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ hasPreview === true && (
						<Preview
							idBase={ idBase }
							instance={ instance }
							isVisible={ mode === 'preview' }
						/>
					) }
					{ hasPreview === false && mode === 'preview' && (
						<NoPreview name={ widgetType.name } />
					) }
				</>
			) }
		</>
	);
}
