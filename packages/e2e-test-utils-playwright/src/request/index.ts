/**
 * External dependencies
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { request } from '@playwright/test';
import type { APIRequestContext, Cookie } from '@playwright/test';

/**
 * Internal dependencies
 */
import { WP_ADMIN_USER, WP_BASE_URL } from '../config';
import type { User } from './login';
import { login } from './login';
import { setupRest, rest, getMaxBatchSize, batchRest } from './rest';
import { getPluginsMap, activatePlugin, deactivatePlugin } from './plugins';
import { activateTheme } from './themes';
import { deleteAllBlocks } from './blocks';
import { deleteAllPosts } from './posts';
import { deleteAllWidgets, addWidgetBlock } from './widgets';

interface StorageState {
	cookies: Cookie[];
	nonce: string;
	rootURL: string;
}

class RequestUtils {
	request: APIRequestContext;
	user: User;
	maxBatchSize?: number;
	storageState?: StorageState;
	storageStatePath?: string;
	baseURL?: string;

	pluginsMap: Record< string, string > | null = null;

	static async setup( {
		user,
		storageStatePath,
		baseURL = WP_BASE_URL,
	}: {
		user?: User;
		storageStatePath?: string;
		baseURL?: string;
	} ) {
		let storageState: StorageState | undefined;
		if ( storageStatePath ) {
			await fs.mkdir( path.dirname( storageStatePath ), {
				recursive: true,
			} );

			try {
				storageState = JSON.parse(
					await fs.readFile( storageStatePath, 'utf-8' )
				);
			} catch ( error ) {
				if (
					error instanceof Error &&
					( error as NodeJS.ErrnoException ).code === 'ENOENT'
				) {
					// Ignore errors if the state is not found.
				} else {
					throw error;
				}
			}
		}

		const requestContext = await request.newContext( {
			baseURL,
			storageState: storageState && {
				cookies: storageState.cookies,
				origins: [],
			},
		} );

		const requestUtils = new RequestUtils( requestContext, {
			user,
			storageState,
			storageStatePath,
			baseURL,
		} );

		return requestUtils;
	}

	constructor(
		requestContext: APIRequestContext,
		{
			user = WP_ADMIN_USER,
			storageState,
			storageStatePath,
			baseURL = WP_BASE_URL,
		}: {
			user?: User;
			storageState?: StorageState;
			storageStatePath?: string;
			baseURL?: string;
		} = {}
	) {
		this.user = user;
		this.request = requestContext;
		this.storageStatePath = storageStatePath;
		this.storageState = storageState;
		this.baseURL = baseURL;
	}

	login = login;
	setupRest = setupRest;
	rest = rest;
	getMaxBatchSize = getMaxBatchSize;
	batchRest = batchRest;
	getPluginsMap = getPluginsMap;
	activatePlugin = activatePlugin;
	deactivatePlugin = deactivatePlugin;
	activateTheme = activateTheme;
	deleteAllBlocks = deleteAllBlocks;
	deleteAllPosts = deleteAllPosts;
	deleteAllWidgets = deleteAllWidgets;
	addWidgetBlock = addWidgetBlock;
}

export type { StorageState };
export { RequestUtils };
