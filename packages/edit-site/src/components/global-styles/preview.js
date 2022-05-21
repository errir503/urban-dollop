/**
 * WordPress dependencies
 */
import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import {
	__unstableMotion as motion,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useReducedMotion, useResizeObserver } from '@wordpress/compose';
import { useState, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useSetting, useStyle } from './hooks';
import { useGlobalStylesOutput } from './use-global-styles-output';

const firstFrame = {
	start: {
		opacity: 1,
		display: 'block',
	},
	hover: {
		opacity: 0,
		display: 'none',
	},
};

const secondFrame = {
	hover: {
		opacity: 1,
		display: 'block',
	},
	start: {
		opacity: 0,
		display: 'none',
	},
};

const normalizedWidth = 248;
const normalizedHeight = 152;

const normalizedColorSwatchSize = 32;

const StylesPreview = ( { label, isFocused } ) => {
	const [ fontWeight ] = useStyle( 'typography.fontWeight' );
	const [ fontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ headingFontFamily = fontFamily ] = useStyle(
		'elements.h1.typography.fontFamily'
	);
	const [ headingFontWeight = fontWeight ] = useStyle(
		'elements.h1.typography.fontWeight'
	);
	const [ textColor = 'black' ] = useStyle( 'color.text' );
	const [ headingColor = textColor ] = useStyle( 'elements.h1.color.text' );
	const [ linkColor = 'blue' ] = useStyle( 'elements.link.color.text' );
	const [ backgroundColor = 'white' ] = useStyle( 'color.background' );
	const [ gradientValue ] = useStyle( 'color.gradient' );
	const [ styles ] = useGlobalStylesOutput();
	const disableMotion = useReducedMotion();
	const [ coreColors ] = useSetting( 'color.palette.core' );
	const [ themeColors ] = useSetting( 'color.palette.theme' );
	const [ customColors ] = useSetting( 'color.palette.custom' );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / normalizedWidth : 1;

	const paletteColors = ( themeColors ?? [] )
		.concat( customColors ?? [] )
		.concat( coreColors ?? [] );
	const highlightedColors = paletteColors
		.filter(
			// we exclude these two colors because they are already visible in the preview.
			( { color } ) => color !== backgroundColor && color !== headingColor
		)
		.slice( 0, 2 );

	// Reset leaked styles from WP common.css.
	const editorStyles = useMemo( () => {
		if ( styles ) {
			return [
				...styles,
				{
					css: 'body{min-width: 0;}',
					isGlobalStyles: true,
				},
			];
		}

		return styles;
	}, [ styles ] );

	return (
		<Iframe
			className="edit-site-global-styles-preview__iframe"
			head={ <EditorStyles styles={ editorStyles } /> }
			style={ {
				height: normalizedHeight * ratio,
				visibility: ! width ? 'hidden' : 'visible',
			} }
			onMouseEnter={ () => setIsHovered( true ) }
			onMouseLeave={ () => setIsHovered( false ) }
			tabIndex={ -1 }
		>
			{ containerResizeListener }
			<motion.div
				style={ {
					height: normalizedHeight * ratio,
					width: '100%',
					background: gradientValue ?? backgroundColor,
					cursor: 'pointer',
				} }
				initial="start"
				animate={
					( isHovered || isFocused ) && ! disableMotion
						? 'hover'
						: 'start'
				}
			>
				<motion.div
					variants={ firstFrame }
					style={ {
						height: '100%',
						overflow: 'hidden',
					} }
				>
					<HStack
						spacing={ 10 * ratio }
						justify="center"
						style={ {
							height: '100%',
							overflow: 'hidden',
						} }
					>
						<div
							style={ {
								fontFamily: headingFontFamily,
								fontSize: 65 * ratio,
								color: headingColor,
								fontWeight: headingFontWeight,
							} }
						>
							Aa
						</div>
						<VStack spacing={ 4 * ratio }>
							{ highlightedColors.map( ( { slug, color } ) => (
								<div
									key={ slug }
									style={ {
										height:
											normalizedColorSwatchSize * ratio,
										width:
											normalizedColorSwatchSize * ratio,
										background: color,
										borderRadius:
											( normalizedColorSwatchSize *
												ratio ) /
											2,
									} }
								/>
							) ) }
						</VStack>
					</HStack>
				</motion.div>
				<motion.div
					variants={ secondFrame }
					style={ {
						height: '100%',
						overflow: 'hidden',
					} }
				>
					<VStack
						spacing={ 3 * ratio }
						justify="center"
						style={ {
							height: '100%',
							overflow: 'hidden',
							padding: 10 * ratio,
							boxSizing: 'border-box',
						} }
					>
						{ label && (
							<div
								style={ {
									fontSize: 35 * ratio,
									fontFamily: headingFontFamily,
									color: headingColor,
									fontWeight: headingFontWeight,
									lineHeight: '1em',
								} }
							>
								{ label }
							</div>
						) }
						<HStack spacing={ 2 * ratio } justify="flex-start">
							<div
								style={ {
									fontFamily,
									fontSize: 24 * ratio,
									color: textColor,
								} }
							>
								Aa
							</div>
							<div
								style={ {
									fontFamily,
									fontSize: 24 * ratio,
									color: linkColor,
								} }
							>
								Aa
							</div>
						</HStack>
						{ paletteColors && (
							<HStack spacing={ 0 }>
								{ paletteColors
									.slice( 0, 4 )
									.map( ( { color }, index ) => (
										<div
											key={ index }
											style={ {
												height: 10 * ratio,
												width: 30 * ratio,
												background: color,
												flexGrow: 1,
											} }
										/>
									) ) }
							</HStack>
						) }
					</VStack>
				</motion.div>
			</motion.div>
		</Iframe>
	);
};

export default StylesPreview;
