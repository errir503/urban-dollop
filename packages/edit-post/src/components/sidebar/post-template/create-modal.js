/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useState } from '@wordpress/element';
import { serialize, createBlock } from '@wordpress/blocks';
import {
	Modal,
	TextControl,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cleanForSlug } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

const DEFAULT_TITLE = __( 'Custom Template' );

export default function PostTemplateCreateModal( { onClose } ) {
	const defaultBlockTemplate = useSelect(
		( select ) =>
			select( editorStore ).getEditorSettings().defaultBlockTemplate,
		[]
	);

	const { __unstableCreateTemplate, __unstableSwitchToTemplateMode } =
		useDispatch( editPostStore );

	const [ title, setTitle ] = useState( '' );

	const [ isBusy, setIsBusy ] = useState( false );

	const cancel = () => {
		setTitle( '' );
		onClose();
	};

	const submit = async ( event ) => {
		event.preventDefault();

		if ( isBusy ) {
			return;
		}

		setIsBusy( true );

		const newTemplateContent =
			defaultBlockTemplate ??
			serialize( [
				createBlock(
					'core/group',
					{
						tagName: 'header',
						layout: { inherit: true },
					},
					[
						createBlock( 'core/site-title' ),
						createBlock( 'core/site-tagline' ),
					]
				),
				createBlock( 'core/separator' ),
				createBlock(
					'core/group',
					{
						tagName: 'main',
					},
					[
						createBlock(
							'core/group',
							{
								layout: { inherit: true },
							},
							[ createBlock( 'core/post-title' ) ]
						),
						createBlock( 'core/post-content', {
							layout: { inherit: true },
						} ),
					]
				),
			] );

		await __unstableCreateTemplate( {
			slug: cleanForSlug( title || DEFAULT_TITLE ),
			content: newTemplateContent,
			title: title || DEFAULT_TITLE,
		} );

		setIsBusy( false );
		cancel();

		__unstableSwitchToTemplateMode( true );
	};

	return (
		<Modal
			title={ __( 'Create custom template' ) }
			onRequestClose={ cancel }
			className="edit-post-post-template__create-modal"
		>
			<form
				className="edit-post-post-template__create-form"
				onSubmit={ submit }
			>
				<VStack spacing="3">
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Name' ) }
						value={ title }
						onChange={ setTitle }
						placeholder={ DEFAULT_TITLE }
						disabled={ isBusy }
						help={ __(
							'Describe the template, e.g. "Post with sidebar". A custom template can be manually applied to any post or page.'
						) }
					/>
					<HStack justify="right">
						<Button variant="tertiary" onClick={ cancel }>
							{ __( 'Cancel' ) }
						</Button>

						<Button
							variant="primary"
							type="submit"
							isBusy={ isBusy }
							aria-disabled={ isBusy }
						>
							{ __( 'Create' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Modal>
	);
}
