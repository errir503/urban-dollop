/**
 * External dependencies
 */
import type { ForwardedRef, KeyboardEvent } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Modal from '../modal';
import type { OwnProps, DialogInputEvent } from './types';
import type { WordPressComponentProps } from '../ui/context';
import { useContextSystem, contextConnect } from '../ui/context';
import { Flex } from '../flex';
import Button from '../button';
import { Text } from '../text';
import { VStack } from '../v-stack';
import * as styles from './styles';
import { useCx } from '../utils/hooks/use-cx';

function ConfirmDialog(
	props: WordPressComponentProps< OwnProps, 'div', false >,
	forwardedRef: ForwardedRef< any >
) {
	const {
		isOpen: isOpenProp,
		onConfirm,
		onCancel,
		children,
		confirmButtonText,
		cancelButtonText,
		...otherProps
	} = useContextSystem( props, 'ConfirmDialog' );

	const cx = useCx();
	const wrapperClassName = cx( styles.wrapper );
	const cancelButtonRef = useRef();
	const confirmButtonRef = useRef();

	const [ isOpen, setIsOpen ] = useState< boolean >();
	const [ shouldSelfClose, setShouldSelfClose ] = useState< boolean >();

	useEffect( () => {
		// We only allow the dialog to close itself if `isOpenProp` is *not* set.
		// If `isOpenProp` is set, then it (probably) means it's controlled by a
		// parent component. In that case, `shouldSelfClose` might do more harm than
		// good, so we disable it.
		const isIsOpenSet = typeof isOpenProp !== 'undefined';
		setIsOpen( isIsOpenSet ? isOpenProp : true );
		setShouldSelfClose( ! isIsOpenSet );
	}, [ isOpenProp ] );

	const handleEvent = useCallback(
		( callback?: ( event: DialogInputEvent ) => void ) =>
			( event: DialogInputEvent ) => {
				callback?.( event );
				if ( shouldSelfClose ) {
					setIsOpen( false );
				}
			},
		[ shouldSelfClose, setIsOpen ]
	);

	const handleEnter = useCallback(
		( event: KeyboardEvent< HTMLDivElement > ) => {
			// Avoid triggering the 'confirm' action when a button is focused,
			// as this can cause a double submission.
			const isConfirmOrCancelButton =
				event.target === cancelButtonRef.current ||
				event.target === confirmButtonRef.current;

			if ( ! isConfirmOrCancelButton && event.key === 'Enter' ) {
				handleEvent( onConfirm )( event );
			}
		},
		[ handleEvent, onConfirm ]
	);

	const cancelLabel = cancelButtonText ?? __( 'Cancel' );
	const confirmLabel = confirmButtonText ?? __( 'OK' );

	return (
		<>
			{ isOpen && (
				<Modal
					onRequestClose={ handleEvent( onCancel ) }
					onKeyDown={ handleEnter }
					closeButtonLabel={ cancelLabel }
					isDismissible={ true }
					ref={ forwardedRef }
					overlayClassName={ wrapperClassName }
					__experimentalHideHeader
					{ ...otherProps }
				>
					<VStack spacing={ 8 }>
						<Text>{ children }</Text>
						<Flex direction="row" justify="flex-end">
							<Button
								ref={ cancelButtonRef }
								variant="tertiary"
								onClick={ handleEvent( onCancel ) }
							>
								{ cancelLabel }
							</Button>
							<Button
								ref={ confirmButtonRef }
								variant="primary"
								onClick={ handleEvent( onConfirm ) }
							>
								{ confirmLabel }
							</Button>
						</Flex>
					</VStack>
				</Modal>
			) }
		</>
	);
}

export default contextConnect( ConfirmDialog, 'ConfirmDialog' );
