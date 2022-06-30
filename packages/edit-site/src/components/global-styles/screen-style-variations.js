/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useMemo, useContext, useState } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import {
	__experimentalGrid as Grid,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { mergeBaseAndUserConfigs } from './global-styles-provider';
import { GlobalStylesContext } from './context';
import StylesPreview from './preview';
import ScreenHeader from './header';

function compareVariations( a, b ) {
	return isEqual( a.styles, b.styles ) && isEqual( a.settings, b.settings );
}

function Variation( { variation } ) {
	const [ isFocused, setIsFocused ] = useState( false );
	const { base, user, setUserConfig } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: {
				settings: variation.settings ?? {},
				styles: variation.styles ?? {},
			},
			base,
			merged: mergeBaseAndUserConfigs( base, variation ),
			setUserConfig: () => {},
		};
	}, [ variation, base ] );

	const selectVariation = () => {
		setUserConfig( () => {
			return {
				settings: variation.settings,
				styles: variation.styles,
			};
		} );
	};

	const selectOnEnter = ( event ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			selectVariation();
		}
	};

	const isActive = useMemo( () => {
		return compareVariations( user, variation );
	}, [ user, variation ] );

	return (
		<GlobalStylesContext.Provider value={ context }>
			<div
				className={ classnames(
					'edit-site-global-styles-variations_item',
					{
						'is-active': isActive,
					}
				) }
				role="button"
				onClick={ selectVariation }
				onKeyDown={ selectOnEnter }
				tabIndex="0"
				aria-label={ variation?.title }
				aria-current={ isActive }
				onFocus={ () => setIsFocused( true ) }
				onBlur={ () => setIsFocused( false ) }
			>
				<div className="edit-site-global-styles-variations_item-preview">
					<StylesPreview
						label={ variation?.title }
						isFocused={ isFocused }
					/>
				</div>
			</div>
		</GlobalStylesContext.Provider>
	);
}

function ScreenStyleVariations() {
	const { variations } = useSelect( ( select ) => {
		return {
			variations:
				select(
					coreStore
				).__experimentalGetCurrentThemeGlobalStylesVariations(),
		};
	}, [] );

	const withEmptyVariation = useMemo( () => {
		return [
			{
				title: __( 'Default' ),
				settings: {},
				styles: {},
			},
			...variations.map( ( variation ) => ( {
				...variation,
				settings: variation.settings ?? {},
				styles: variation.styles ?? {},
			} ) ),
		];
	}, [ variations ] );

	return (
		<>
			<ScreenHeader
				back="/"
				title={ __( 'Browse styles' ) }
				description={ __(
					'Choose a different style combination for the theme styles'
				) }
			/>

			<Card size="small" isBorderless>
				<CardBody>
					<Grid columns={ 2 }>
						{ withEmptyVariation?.map( ( variation, index ) => (
							<Variation key={ index } variation={ variation } />
						) ) }
					</Grid>
				</CardBody>
			</Card>
		</>
	);
}

export default ScreenStyleVariations;
