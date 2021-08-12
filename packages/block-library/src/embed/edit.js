/**
 * Internal dependencies
 */
import {
	createUpgradedEmbedBlock,
	getClassNames,
	fallback,
	getAttributesFromPreview,
	getEmbedInfoByProvider,
} from './util';
import EmbedControls from './embed-controls';
import { embedContentIcon } from './icons';
import EmbedLoading from './embed-loading';
import EmbedPlaceholder from './embed-placeholder';
import EmbedPreview from './embed-preview';

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import { useState, useEffect, Platform } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { useBlockProps } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { View } from '@wordpress/primitives';

function getResponsiveHelp( checked ) {
	return checked
		? __(
				'This embed will preserve its aspect ratio when the browser is resized.'
		  )
		: __(
				'This embed may not preserve its aspect ratio when the browser is resized.'
		  );
}

const EmbedEdit = ( props ) => {
	const {
		attributes: {
			providerNameSlug,
			previewable,
			responsive,
			url: attributesUrl,
		},
		attributes,
		isSelected,
		onReplace,
		setAttributes,
		insertBlocksAfter,
		onFocus,
		clientId,
	} = props;

	const defaultEmbedInfo = {
		title: _x( 'Embed', 'block title' ),
		icon: embedContentIcon,
	};
	const { icon, title } =
		getEmbedInfoByProvider( providerNameSlug ) || defaultEmbedInfo;

	const [ url, setURL ] = useState( attributesUrl );
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const { invalidateResolution } = useDispatch( coreStore );

	const {
		preview,
		fetching,
		themeSupportsResponsive,
		cannotEmbed,
	} = useSelect(
		( select ) => {
			const {
				getEmbedPreview,
				isPreviewEmbedFallback,
				isRequestingEmbedPreview,
				getThemeSupports,
			} = select( coreStore );
			if ( ! attributesUrl ) {
				return { fetching: false, cannotEmbed: false };
			}

			const embedPreview = Platform.select( {
				web: getEmbedPreview( attributesUrl ),
				native: attributesUrl,
			} );
			const previewIsFallback = isPreviewEmbedFallback( attributesUrl );

			// The external oEmbed provider does not exist. We got no type info and no html.
			const badEmbedProvider =
				embedPreview?.html === false &&
				embedPreview?.type === undefined;
			// Some WordPress URLs that can't be embedded will cause the API to return
			// a valid JSON response with no HTML and `data.status` set to 404, rather
			// than generating a fallback response as other embeds do.
			const wordpressCantEmbed = embedPreview?.data?.status === 404;
			const validPreview =
				!! embedPreview && ! badEmbedProvider && ! wordpressCantEmbed;
			return {
				preview: validPreview ? embedPreview : undefined,
				fetching: isRequestingEmbedPreview( attributesUrl ),
				themeSupportsResponsive: getThemeSupports()[
					'responsive-embeds'
				],
				cannotEmbed: ! validPreview || previewIsFallback,
			};
		},
		[ attributesUrl ]
	);

	/**
	 * @return {Object} Attributes derived from the preview, merged with the current attributes.
	 */
	const getMergedAttributes = () => {
		const { allowResponsive, className } = attributes;
		return {
			...attributes,
			...getAttributesFromPreview(
				preview,
				title,
				className,
				responsive,
				allowResponsive
			),
		};
	};

	const toggleResponsive = () => {
		const { allowResponsive, className } = attributes;
		const { html } = preview;
		const newAllowResponsive = ! allowResponsive;

		setAttributes( {
			allowResponsive: newAllowResponsive,
			className: getClassNames(
				html,
				className,
				responsive && newAllowResponsive
			),
		} );
	};

	useEffect( () => {
		if ( ! preview?.html || ! cannotEmbed || fetching ) {
			return;
		}
		// At this stage, we're not fetching the preview and know it can't be embedded,
		// so try removing any trailing slash, and resubmit.
		const newURL = attributesUrl.replace( /\/$/, '' );
		setURL( newURL );
		setIsEditingURL( false );
		setAttributes( { url: newURL } );
	}, [ preview?.html, attributesUrl ] );

	// Handle incoming preview
	useEffect( () => {
		if ( preview && ! isEditingURL ) {
			// Even though we set attributes that get derived from the preview,
			// we don't access them directly because for the initial render,
			// the `setAttributes` call will not have taken effect. If we're
			// rendering responsive content, setting the responsive classes
			// after the preview has been rendered can result in unwanted
			// clipping or scrollbars. The `getAttributesFromPreview` function
			// that `getMergedAttributes` uses is memoized so that we're not
			// calculating them on every render.
			setAttributes( getMergedAttributes() );
			if ( onReplace ) {
				const upgradedBlock = createUpgradedEmbedBlock(
					props,
					getMergedAttributes()
				);

				if ( upgradedBlock ) {
					onReplace( upgradedBlock );
				}
			}
		}
	}, [ preview, isEditingURL ] );

	const blockProps = useBlockProps();

	if ( fetching ) {
		return (
			<View { ...blockProps }>
				<EmbedLoading />
			</View>
		);
	}

	const label = Platform.select( {
		// translators: %s: type of embed e.g: "YouTube", "Twitter", etc. "Embed" is used when no specific type exists
		web: sprintf( __( '%s URL' ), title ),
		native: title,
	} );

	const onSubmit = ( event ) => {
		if ( event ) {
			event.preventDefault();
		}

		setIsEditingURL( false );
		setAttributes( { url } );
	};

	const onSubmitNative = ( value ) => {
		// On native, the URL change is only notified when submitting,
		// and not via 'onChange', so we have to explicitly set the URL.
		setURL( value );

		// Replicate the same behavior as onSubmit
		setIsEditingURL( false );
		setAttributes( { url: value } );
	};

	// No preview, or we can't embed the current URL, or we've clicked the edit button.
	const showEmbedPlaceholder = ! preview || cannotEmbed || isEditingURL;

	if ( showEmbedPlaceholder ) {
		return (
			<View { ...blockProps }>
				<EmbedPlaceholder
					icon={ icon }
					label={ label }
					onFocus={ onFocus }
					onSubmit={ Platform.select( {
						web: onSubmit,
						native: onSubmitNative,
					} ) }
					value={ url }
					cannotEmbed={ cannotEmbed }
					onChange={ ( event ) => setURL( event.target.value ) }
					fallback={ () => fallback( url, onReplace ) }
					tryAgain={ () => {
						invalidateResolution( 'getEmbedPreview', [ url ] );
					} }
					isSelected={ isSelected }
				/>
			</View>
		);
	}

	// Even though we set attributes that get derived from the preview,
	// we don't access them directly because for the initial render,
	// the `setAttributes` call will not have taken effect. If we're
	// rendering responsive content, setting the responsive classes
	// after the preview has been rendered can result in unwanted
	// clipping or scrollbars. The `getAttributesFromPreview` function
	// that `getMergedAttributes` uses is memoized so that we're not
	const {
		caption,
		type,
		allowResponsive,
		className: classFromPreview,
	} = getMergedAttributes();
	const className = classnames( classFromPreview, props.className );

	return (
		<>
			<EmbedControls
				showEditButton={ preview && ! cannotEmbed }
				themeSupportsResponsive={ themeSupportsResponsive }
				blockSupportsResponsive={ responsive }
				allowResponsive={ allowResponsive }
				getResponsiveHelp={ getResponsiveHelp }
				toggleResponsive={ toggleResponsive }
				switchBackToURLInput={ () => setIsEditingURL( true ) }
			/>
			<View { ...blockProps }>
				<EmbedPreview
					preview={ preview }
					previewable={ previewable }
					className={ className }
					url={ url }
					type={ type }
					caption={ caption }
					onCaptionChange={ ( value ) =>
						setAttributes( { caption: value } )
					}
					isSelected={ isSelected }
					icon={ icon }
					label={ label }
					insertBlocksAfter={ insertBlocksAfter }
					clientId={ clientId }
				/>
			</View>
		</>
	);
};

export default EmbedEdit;
