/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Modal,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import InstalledFonts from './installed-fonts';
import FontCollection from './font-collection';
import UploadFonts from './upload-fonts';
import { FontLibraryContext } from './context';
import { unlock } from '../../../lock-unlock';

const { Tabs } = unlock( componentsPrivateApis );

const DEFAULT_TAB = {
	id: 'installed-fonts',
	title: __( 'Library' ),
};

const UPLOAD_TAB = {
	id: 'upload-fonts',
	title: __( 'Upload' ),
};

const tabsFromCollections = ( collections ) =>
	collections.map( ( { slug, name } ) => ( {
		id: slug,
		title:
			collections.length === 1 && slug === 'google-fonts'
				? __( 'Install Fonts' )
				: name,
	} ) );

function FontLibraryModal( {
	onRequestClose,
	defaultTabId = 'installed-fonts',
} ) {
	const { collections, setNotice } = useContext( FontLibraryContext );
	const canUserCreate = useSelect( ( select ) => {
		const { canUser } = select( coreStore );
		return canUser( 'create', 'font-families' );
	}, [] );

	const tabs = [ DEFAULT_TAB ];

	if ( canUserCreate ) {
		tabs.push( UPLOAD_TAB );
		tabs.push( ...tabsFromCollections( collections || [] ) );
	}

	// Reset notice when new tab is selected.
	const onSelect = () => {
		setNotice( null );
	};

	return (
		<Modal
			title={ __( 'Fonts' ) }
			onRequestClose={ onRequestClose }
			isFullScreen
			className="font-library-modal"
		>
			<div className="font-library-modal__tabs">
				<Tabs defaultTabId={ defaultTabId } onSelect={ onSelect }>
					<Tabs.TabList>
						{ tabs.map( ( { id, title } ) => (
							<Tabs.Tab key={ id } tabId={ id }>
								{ title }
							</Tabs.Tab>
						) ) }
					</Tabs.TabList>
					{ tabs.map( ( { id } ) => {
						let contents;
						switch ( id ) {
							case 'upload-fonts':
								contents = <UploadFonts />;
								break;
							case 'installed-fonts':
								contents = <InstalledFonts />;
								break;
							default:
								contents = <FontCollection slug={ id } />;
						}
						return (
							<Tabs.TabPanel
								key={ id }
								tabId={ id }
								focusable={ false }
							>
								{ contents }
							</Tabs.TabPanel>
						);
					} ) }
				</Tabs>
			</div>
		</Modal>
	);
}

export default FontLibraryModal;
