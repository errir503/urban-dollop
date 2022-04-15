/**
 * External dependencies
 */
import type { Browser, Page, BrowserContext } from '@playwright/test';

/**
 * Internal dependencies
 */
import { clickBlockToolbarButton } from './click-block-toolbar-button';
import { createNewPost } from './create-new-post';
import { getEditedPostContent } from './get-edited-post-content';
import { getPageError } from './get-page-error';
import { insertBlock } from './insert-block';
import { isCurrentURL } from './is-current-url';
import { openDocumentSettingsSidebar } from './open-document-settings-sidebar';
import {
	setClipboardData,
	pressKeyWithModifier,
} from './press-key-with-modifier';
import { pressKeyTimes } from './press-key-times';
import { openPreviewPage } from './preview';
import { setBrowserViewport } from './set-browser-viewport';
import { showBlockToolbar } from './show-block-toolbar';
import { visitAdminPage } from './visit-admin-page';
import { visitSiteEditor } from './site-editor';

class PageUtils {
	browser: Browser;
	page: Page;
	context: BrowserContext;

	constructor( page: Page ) {
		this.page = page;
		this.context = page.context();
		this.browser = this.context.browser()!;
	}

	clickBlockToolbarButton = clickBlockToolbarButton;
	createNewPost = createNewPost;
	getEditedPostContent = getEditedPostContent;
	getPageError = getPageError;
	insertBlock = insertBlock;
	isCurrentURL = isCurrentURL;
	pressKeyWithModifier = pressKeyWithModifier;
	setClipboardData = setClipboardData;
	showBlockToolbar = showBlockToolbar;
	visitAdminPage = visitAdminPage;
	visitSiteEditor = visitSiteEditor;
	openDocumentSettingsSidebar = openDocumentSettingsSidebar;
	openPreviewPage = openPreviewPage;
	setBrowserViewport = setBrowserViewport;
	pressKeyTimes = pressKeyTimes;
}

export { PageUtils };
