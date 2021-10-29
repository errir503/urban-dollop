/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef, Platform } from '@wordpress/element';
import {
	InspectorControls,
	JustifyToolbar,
	BlockControls,
	useBlockProps,
	__experimentalUseNoRecursiveRenders as useNoRecursiveRenders,
	store as blockEditorStore,
	withColors,
	PanelColorSettings,
	ContrastChecker,
	getColorClassName,
	Warning,
} from '@wordpress/block-editor';
import { EntityProvider } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	PanelBody,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	ToolbarGroup,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useListViewModal from './use-list-view-modal';
import useNavigationMenu from '../use-navigation-menu';
import Placeholder from './placeholder';
import ResponsiveWrapper from './responsive-wrapper';
import NavigationInnerBlocks from './inner-blocks';
import NavigationMenuSelector from './navigation-menu-selector';
import NavigationMenuNameControl from './navigation-menu-name-control';
import UnsavedInnerBlocks from './unsaved-inner-blocks';

function getComputedStyle( node ) {
	return node.ownerDocument.defaultView.getComputedStyle( node );
}

function detectColors( colorsDetectionElement, setColor, setBackground ) {
	if ( ! colorsDetectionElement ) {
		return;
	}
	setColor( getComputedStyle( colorsDetectionElement ).color );

	let backgroundColorNode = colorsDetectionElement;
	let backgroundColor = getComputedStyle( backgroundColorNode )
		.backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType ===
			backgroundColorNode.parentNode.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor = getComputedStyle( backgroundColorNode )
			.backgroundColor;
	}

	setBackground( backgroundColor );
}

function Navigation( {
	attributes,
	setAttributes,
	isSelected,
	clientId,
	className,
	backgroundColor,
	setBackgroundColor,
	textColor,
	setTextColor,
	overlayBackgroundColor,
	setOverlayBackgroundColor,
	overlayTextColor,
	setOverlayTextColor,

	// These props are used by the navigation editor to override specific
	// navigation block settings.
	hasSubmenuIndicatorSetting = true,
	hasItemJustificationControls = true,
	hasColorSettings = true,
	customPlaceholder: CustomPlaceholder = null,
	customAppender: CustomAppender = null,
} ) {
	const {
		navigationMenuId,
		itemsJustification,
		openSubmenusOnClick,
		orientation,
		overlayMenu,
		showSubmenuIcon,
	} = attributes;

	const [ hasAlreadyRendered, RecursionProvider ] = useNoRecursiveRenders(
		`navigationMenu/${ navigationMenuId }`
	);

	const innerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);
	const hasExistingNavItems = !! innerBlocks.length;
	const { selectBlock } = useDispatch( blockEditorStore );

	const [ isPlaceholderShown, setIsPlaceholderShown ] = useState(
		! hasExistingNavItems
	);

	const [ isResponsiveMenuOpen, setResponsiveMenuVisibility ] = useState(
		false
	);

	const {
		isNavigationMenuResolved,
		isNavigationMenuMissing,
		canSwitchNavigationMenu,
		hasResolvedNavigationMenu,
	} = useNavigationMenu( navigationMenuId );

	const navRef = useRef();

	const { listViewToolbarButton, listViewModal } = useListViewModal(
		clientId
	);

	const isEntityAvailable =
		! isNavigationMenuMissing && isNavigationMenuResolved;

	const blockProps = useBlockProps( {
		ref: navRef,
		className: classnames( className, {
			[ `items-justified-${ attributes.itemsJustification }` ]: itemsJustification,
			'is-vertical': orientation === 'vertical',
			'is-responsive': 'never' !== overlayMenu,
			'has-text-color': !! textColor.color || !! textColor?.class,
			[ getColorClassName(
				'color',
				textColor?.slug
			) ]: !! textColor?.slug,
			'has-background': !! backgroundColor.color || backgroundColor.class,
			[ getColorClassName(
				'background-color',
				backgroundColor?.slug
			) ]: !! backgroundColor?.slug,
		} ),
		style: {
			color: ! textColor?.slug && textColor?.color,
			backgroundColor: ! backgroundColor?.slug && backgroundColor?.color,
		},
	} );

	// Turn on contrast checker for web only since it's not supported on mobile yet.
	const enableContrastChecking = Platform.OS === 'web';

	const [ detectedBackgroundColor, setDetectedBackgroundColor ] = useState();
	const [ detectedColor, setDetectedColor ] = useState();
	const [
		detectedOverlayBackgroundColor,
		setDetectedOverlayBackgroundColor,
	] = useState();
	const [ detectedOverlayColor, setDetectedOverlayColor ] = useState();

	useEffect( () => {
		if ( ! enableContrastChecking ) {
			return;
		}
		detectColors(
			navRef.current,
			setDetectedColor,
			setDetectedBackgroundColor
		);
		const subMenuElement = navRef.current.querySelector(
			'[data-type="core/navigation-link"] [data-type="core/navigation-link"]'
		);
		if ( subMenuElement ) {
			detectColors(
				subMenuElement,
				setDetectedOverlayColor,
				setDetectedOverlayBackgroundColor
			);
		}
	} );

	// Hide the placeholder if an navigation menu entity has loaded.
	useEffect( () => {
		if ( isEntityAvailable ) {
			setIsPlaceholderShown( false );
		}
	}, [ isEntityAvailable ] );

	// If the block has inner blocks, but no menu id, this was an older
	// navigation block added before the block used a wp_navigation entity.
	// Consider this 'unsaved'. Offer an uncontrolled version of inner blocks,
	// with a prompt to 'save'.
	const hasUnsavedBlocks =
		hasExistingNavItems && navigationMenuId === undefined;
	if ( hasUnsavedBlocks ) {
		return (
			<UnsavedInnerBlocks
				blockProps={ blockProps }
				blocks={ innerBlocks }
				isSelected={ isSelected }
				onSave={ ( post ) =>
					setAttributes( { navigationMenuId: post.id } )
				}
			/>
		);
	}

	// Show a warning if the selected menu is no longer available.
	// TODO - the user should be able to select a new one?
	if ( navigationMenuId && isNavigationMenuMissing ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __(
						'Navigation menu has been deleted or is unavailable'
					) }
				</Warning>
			</div>
		);
	}

	if ( isEntityAvailable && hasAlreadyRendered ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __( 'Block cannot be rendered inside itself.' ) }
				</Warning>
			</div>
		);
	}

	const PlaceholderComponent = CustomPlaceholder
		? CustomPlaceholder
		: Placeholder;

	const justifyAllowedControls =
		orientation === 'vertical'
			? [ 'left', 'center', 'right' ]
			: [ 'left', 'center', 'right', 'space-between' ];

	return (
		<EntityProvider
			kind="postType"
			type="wp_navigation"
			id={ navigationMenuId }
		>
			<RecursionProvider>
				<BlockControls>
					<ToolbarGroup>
						{ isEntityAvailable && (
							<ToolbarDropdownMenu
								label={ __( 'Select Menu' ) }
								text={ __( 'Select Menu' ) }
								icon={ null }
							>
								{ ( { onClose } ) => (
									<NavigationMenuSelector
										onSelect={ ( { id } ) => {
											setAttributes( {
												navigationMenuId: id,
											} );
											onClose();
										} }
									/>
								) }
							</ToolbarDropdownMenu>
						) }
					</ToolbarGroup>
					{ hasItemJustificationControls && (
						<JustifyToolbar
							value={ itemsJustification }
							allowedControls={ justifyAllowedControls }
							onChange={ ( value ) =>
								setAttributes( { itemsJustification: value } )
							}
							popoverProps={ {
								position: 'bottom right',
								isAlternate: true,
							} }
						/>
					) }
					<ToolbarGroup>{ listViewToolbarButton }</ToolbarGroup>
				</BlockControls>
				{ listViewModal }
				<InspectorControls>
					{ isEntityAvailable && (
						<PanelBody title={ __( 'Navigation menu name' ) }>
							<NavigationMenuNameControl />
						</PanelBody>
					) }
					{ hasSubmenuIndicatorSetting && (
						<PanelBody title={ __( 'Display' ) }>
							<h3>{ __( 'Overlay Menu' ) }</h3>
							<ToggleGroupControl
								label={ __( 'Configure overlay menu' ) }
								value={ overlayMenu }
								help={ __(
									'Collapses the navigation options in a menu icon opening an overlay.'
								) }
								onChange={ ( value ) =>
									setAttributes( { overlayMenu: value } )
								}
								isBlock
								hideLabelFromVision
							>
								<ToggleGroupControlOption
									value="never"
									label={ __( 'Off' ) }
								/>
								<ToggleGroupControlOption
									value="mobile"
									label={ __( 'Mobile' ) }
								/>
								<ToggleGroupControlOption
									value="always"
									label={ __( 'Always' ) }
								/>
							</ToggleGroupControl>
							<h3>{ __( 'Submenus' ) }</h3>
							<ToggleControl
								checked={ openSubmenusOnClick }
								onChange={ ( value ) => {
									setAttributes( {
										openSubmenusOnClick: value,
									} );
								} }
								label={ __( 'Open on click' ) }
							/>
							{ ! attributes.openSubmenusOnClick && (
								<ToggleControl
									checked={ showSubmenuIcon }
									onChange={ ( value ) => {
										setAttributes( {
											showSubmenuIcon: value,
										} );
									} }
									label={ __( 'Show icons' ) }
								/>
							) }
						</PanelBody>
					) }
					{ hasColorSettings && (
						<PanelColorSettings
							title={ __( 'Color' ) }
							initialOpen={ false }
							colorSettings={ [
								{
									value: textColor.color,
									onChange: setTextColor,
									label: __( 'Text' ),
								},
								{
									value: backgroundColor.color,
									onChange: setBackgroundColor,
									label: __( 'Background' ),
								},
								{
									value: overlayTextColor.color,
									onChange: setOverlayTextColor,
									label: __( 'Submenu & overlay text' ),
								},
								{
									value: overlayBackgroundColor.color,
									onChange: setOverlayBackgroundColor,
									label: __( 'Submenu & overlay background' ),
								},
							] }
						>
							{ enableContrastChecking && (
								<>
									<ContrastChecker
										backgroundColor={
											detectedBackgroundColor
										}
										textColor={ detectedColor }
									/>
									<ContrastChecker
										backgroundColor={
											detectedOverlayBackgroundColor
										}
										textColor={ detectedOverlayColor }
									/>
								</>
							) }
						</PanelColorSettings>
					) }
				</InspectorControls>
				<nav { ...blockProps }>
					{ ! isEntityAvailable && isPlaceholderShown && (
						<PlaceholderComponent
							onFinish={ ( post ) => {
								setIsPlaceholderShown( false );
								setAttributes( {
									navigationMenuId: post.id,
								} );
								selectBlock( clientId );
							} }
							canSwitchNavigationMenu={ canSwitchNavigationMenu }
							hasResolvedNavigationMenu={
								hasResolvedNavigationMenu
							}
						/>
					) }
					<ResponsiveWrapper
						id={ clientId }
						onToggle={ setResponsiveMenuVisibility }
						isOpen={ isResponsiveMenuOpen }
						isResponsive={ 'never' !== overlayMenu }
						isHiddenByDefault={ 'always' === overlayMenu }
					>
						{ isEntityAvailable && (
							<NavigationInnerBlocks
								isVisible={ ! isPlaceholderShown }
								clientId={ clientId }
								appender={ CustomAppender }
								hasCustomPlaceholder={ !! CustomPlaceholder }
								orientation={ orientation }
							/>
						) }
					</ResponsiveWrapper>
				</nav>
			</RecursionProvider>
		</EntityProvider>
	);
}

export default withColors(
	{ textColor: 'color' },
	{ backgroundColor: 'color' },
	{ overlayBackgroundColor: 'color' },
	{ overlayTextColor: 'color' }
)( Navigation );
