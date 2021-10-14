/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	Button,
	Icon,
	__unstableMotion as motion,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { wordpress } from '@wordpress/icons';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';
import { useReducedMotion } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

function FullscreenModeClose( { showTooltip, icon, href } ) {
	const { isActive, isRequestingSiteIcon, postType, siteIconUrl } = useSelect(
		( select ) => {
			const { getCurrentPostType } = select( editorStore );
			const { isFeatureActive } = select( editPostStore );
			const { getEntityRecord, getPostType, isResolving } = select(
				coreStore
			);
			const siteData =
				getEntityRecord( 'root', '__unstableBase', undefined ) || {};

			return {
				isActive: isFeatureActive( 'fullscreenMode' ),
				isRequestingSiteIcon: isResolving( 'getEntityRecord', [
					'root',
					'__unstableBase',
					undefined,
				] ),
				postType: getPostType( getCurrentPostType() ),
				siteIconUrl: siteData.site_icon_url,
			};
		},
		[]
	);

	const disableMotion = useReducedMotion();

	if ( ! isActive || ! postType ) {
		return null;
	}

	let buttonIcon = <Icon size="36px" icon={ wordpress } />;

	const effect = {
		expand: {
			scale: 1.7,
			borderRadius: 0,
			transition: { type: 'tween', duration: '0.2' },
		},
	};

	if ( siteIconUrl ) {
		buttonIcon = (
			<motion.img
				variants={ ! disableMotion && effect }
				alt={ __( 'Site Icon' ) }
				className="edit-post-fullscreen-mode-close_site-icon"
				src={ siteIconUrl }
			/>
		);
	}

	if ( isRequestingSiteIcon ) {
		buttonIcon = null;
	}

	// Override default icon if custom icon is provided via props.
	if ( icon ) {
		buttonIcon = <Icon size="36px" icon={ icon } />;
	}

	return (
		<motion.div whileHover="expand">
			<Button
				className="edit-post-fullscreen-mode-close has-icon"
				href={
					href ??
					addQueryArgs( 'edit.php', {
						post_type: postType.slug,
					} )
				}
				label={ get(
					postType,
					[ 'labels', 'view_items' ],
					__( 'Back' )
				) }
				showTooltip={ showTooltip }
			>
				{ buttonIcon }
			</Button>
		</motion.div>
	);
}

export default FullscreenModeClose;
