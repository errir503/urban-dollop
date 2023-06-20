/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState, useRef } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';

/**
 * Component that:
 *
 * - Displays a 'Edit your template to edit this block' notification when the
 *   user is focusing on editing page content and clicks on a disabled template
 *   block.
 * - Displays a 'Edit your template to edit this block' dialog when the user
 *   is focusing on editing page conetnt and double clicks on a disabled
 *   template block.
 *
 * @param {Object}                                 props
 * @param {import('react').RefObject<HTMLElement>} props.contentRef Ref to the block
 *                                                                  editor iframe canvas.
 */
export default function EditTemplateNotification( { contentRef } ) {
	const hasPageContentFocus = useSelect(
		( select ) => select( editSiteStore ).hasPageContentFocus(),
		[]
	);
	const { getNotices } = useSelect( noticesStore );

	const { createInfoNotice, removeNotice } = useDispatch( noticesStore );
	const { setHasPageContentFocus } = useDispatch( editSiteStore );

	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	const lastNoticeId = useRef( 0 );

	useEffect( () => {
		const handleClick = async ( event ) => {
			if ( ! hasPageContentFocus ) {
				return;
			}
			if ( ! event.target.classList.contains( 'is-root-container' ) ) {
				return;
			}
			const isNoticeAlreadyShowing = getNotices().some(
				( notice ) => notice.id === lastNoticeId.current
			);
			if ( isNoticeAlreadyShowing ) {
				return;
			}
			const { notice } = await createInfoNotice(
				__( 'Edit your template to edit this block.' ),
				{
					isDismissible: true,
					type: 'snackbar',
					actions: [
						{
							label: __( 'Edit template' ),
							onClick: () => setHasPageContentFocus( false ),
						},
					],
				}
			);
			lastNoticeId.current = notice.id;
		};

		const handleDblClick = ( event ) => {
			if ( ! hasPageContentFocus ) {
				return;
			}
			if ( ! event.target.classList.contains( 'is-root-container' ) ) {
				return;
			}
			if ( lastNoticeId.current ) {
				removeNotice( lastNoticeId.current );
			}
			setIsDialogOpen( true );
		};

		const canvas = contentRef.current;
		canvas?.addEventListener( 'click', handleClick );
		canvas?.addEventListener( 'dblclick', handleDblClick );
		return () => {
			canvas?.removeEventListener( 'click', handleClick );
			canvas?.removeEventListener( 'dblclick', handleDblClick );
		};
	}, [ lastNoticeId, hasPageContentFocus, contentRef.current ] );

	return (
		<ConfirmDialog
			isOpen={ isDialogOpen }
			confirmButtonText={ __( 'Edit template' ) }
			onConfirm={ () => {
				setIsDialogOpen( false );
				setHasPageContentFocus( false );
			} }
			onCancel={ () => setIsDialogOpen( false ) }
		>
			{ __( 'Edit your template to edit this block.' ) }
		</ConfirmDialog>
	);
}
