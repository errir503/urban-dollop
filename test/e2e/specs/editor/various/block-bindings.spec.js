/**
 * External dependencies
 */
const path = require( 'path' );
/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Block bindings', () => {
	const variables = {
		customFields: {
			textValue: 'Value of the text_custom_field',
			textKey: 'text_custom_field',
			urlValue: '',
			urlKey: 'url_custom_field',
		},
		labels: {
			align: 'Align text',
			bold: 'Bold',
			imageReplace: 'Replace',
			imageAlt: 'Alternative text',
			imageTitle: 'Title attribute',
		},
		blocks: {
			paragraph: {
				name: 'core/paragraph',
				attributes: {
					content: 'p',
					metadata: {
						bindings: {
							content: {
								source: 'core/post-meta',
								args: { key: 'text_custom_field' },
							},
						},
					},
				},
			},
			heading: {
				name: 'core/heading',
				attributes: {
					content: 'h',
					metadata: {
						bindings: {
							content: {
								source: 'core/post-meta',
								args: { key: 'text_custom_field' },
							},
						},
					},
				},
			},
			buttons: {
				textOnly: {
					name: 'core/buttons',
					innerBlocks: [
						{
							name: 'core/button',
							attributes: {
								text: 'b',
								url: 'https://www.wordpress.org/',
								metadata: {
									bindings: {
										text: {
											source: 'core/post-meta',
											args: { key: 'text_custom_field' },
										},
									},
								},
							},
						},
					],
				},
				urlOnly: {
					name: 'core/buttons',
					innerBlocks: [
						{
							name: 'core/button',
							attributes: {
								text: 'b',
								url: 'https://www.wordpress.org/',
								metadata: {
									bindings: {
										url: {
											source: 'core/post-meta',
											args: { key: 'url_custom_field' },
										},
									},
								},
							},
						},
					],
				},
				multipleAttrs: {
					name: 'core/buttons',
					innerBlocks: [
						{
							name: 'core/button',
							attributes: {
								text: 'b',
								url: 'https://www.wordpress.org/',
								metadata: {
									bindings: {
										text: {
											source: 'core/post-meta',
											args: { key: 'text_custom_field' },
										},
										url: {
											source: 'core/post-meta',
											args: { key: 'url_custom_field' },
										},
									},
								},
							},
						},
					],
				},
			},
			images: {
				urlOnly: {},
				altOnly: {},
				titleOnly: {},
				multipleAttrs: {},
			},
		},
		placeholderSrc: '',
	};
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
		await requestUtils.activatePlugin( 'gutenberg-test-block-bindings' );
		await requestUtils.deleteAllMedia();
		const placeholderMedia = await requestUtils.uploadMedia(
			path.join( './test/e2e/assets', '10x10_e2e_test_image_z9T8jK.png' )
		);
		variables.placeholderSrc = placeholderMedia.source_url;
		// Init image blocks.
		variables.blocks.images.urlOnly = {
			name: 'core/image',
			attributes: {
				url: variables.placeholderSrc,
				alt: 'default alt value',
				title: 'default title value',
				metadata: {
					bindings: {
						url: {
							source: 'core/post-meta',
							args: { key: 'url_custom_field' },
						},
					},
				},
			},
		};
		variables.blocks.images.altOnly = {
			name: 'core/image',
			attributes: {
				url: variables.placeholderSrc,
				alt: 'default alt value',
				title: 'default title value',
				metadata: {
					bindings: {
						alt: {
							source: 'core/post-meta',
							args: { key: 'text_custom_field' },
						},
					},
				},
			},
		};
		variables.blocks.images.titleOnly = {
			name: 'core/image',
			attributes: {
				url: variables.placeholderSrc,
				alt: 'default alt value',
				title: 'default title value',
				metadata: {
					bindings: {
						title: {
							source: 'core/post-meta',
							args: { key: 'text_custom_field' },
						},
					},
				},
			},
		};
		variables.blocks.images.multipleAttrs = {
			name: 'core/image',
			attributes: {
				url: variables.placeholderSrc,
				alt: 'default alt value',
				title: 'default title value',
				metadata: {
					bindings: {
						url: {
							source: 'core/post-meta',
							args: { key: 'url_custom_field' },
						},
						alt: {
							source: 'core/post-meta',
							args: { key: 'text_custom_field' },
						},
					},
				},
			},
		};
	} );

	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllMedia();
		await requestUtils.activateTheme( 'twentytwentyone' );
		await requestUtils.deactivatePlugin( 'gutenberg-test-block-bindings' );
	} );

	test.describe( 'Template context', () => {
		test.beforeEach( async ( { admin, editor } ) => {
			await admin.visitSiteEditor( {
				postId: 'emptytheme//index',
				postType: 'wp_template',
			} );
			await editor.canvas.locator( 'body' ).click();
			await editor.openDocumentSettingsSidebar();
		} );

		test.describe( 'Paragraph', () => {
			test( 'Should show the value of the custom field', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.paragraph );
				const paragraphBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Paragraph',
				} );
				const paragraphContent = await paragraphBlock.textContent();
				expect( paragraphContent ).toBe(
					variables.customFields.textKey
				);
			} );

			test( 'Should lock the appropriate controls', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.paragraph );
				const paragraphBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Paragraph',
				} );
				await paragraphBlock.click();

				// Alignment controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.align,
					} )
				).toBeVisible();

				// Format controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.bold,
					} )
				).toBeHidden();

				// Paragraph is not editable.
				const isContentEditable =
					await paragraphBlock.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );
			} );
		} );

		test.describe( 'Heading', () => {
			test( 'Should show the key of the custom field', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.heading );
				const headingBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Heading',
				} );
				const headingContent = await headingBlock.textContent();
				expect( headingContent ).toBe( variables.customFields.textKey );
			} );

			test( 'Should lock the appropriate controls', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.heading );
				const headingBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Heading',
				} );
				await headingBlock.click();

				// Alignment controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.align,
					} )
				).toBeVisible();

				// Format controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.bold,
					} )
				).toBeHidden();

				// Heading is not editable.
				const isContentEditable =
					await headingBlock.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );
			} );
		} );

		test.describe( 'Button', () => {
			test( 'Should show the key of the custom field when text is bound', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.buttons.textOnly );
				const buttonBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Button',
					exact: true,
				} );
				const buttonText = await buttonBlock.textContent();
				expect( buttonText ).toBe( variables.customFields.textKey );
			} );

			test( 'Should lock text controls when text is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.buttons.textOnly );
				const buttonBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Button',
					exact: true,
				} );
				await buttonBlock.click();

				// Alignment controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.align,
					} )
				).toBeVisible();

				// Format controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.bold,
					} )
				).toBeHidden();

				// Button is not editable.
				const isContentEditable = await buttonBlock
					.locator( 'div' )
					.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );

				// Link controls exist.
				await expect(
					page
						.getByRole( 'toolbar', { name: 'Block tools' } )
						.getByRole( 'button', { name: 'Unlink' } )
				).toBeVisible();
			} );

			test( 'Should lock url controls when url is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.buttons.urlOnly );
				const buttonBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Button',
					exact: true,
				} );
				await buttonBlock.click();

				// Format controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.bold,
					} )
				).toBeVisible();

				// Button is editable.
				const isContentEditable = await buttonBlock
					.locator( 'div' )
					.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'true' );

				// Link controls don't exist.
				await expect(
					page
						.getByRole( 'toolbar', { name: 'Block tools' } )
						.getByRole( 'button', { name: 'Link' } )
				).toBeHidden();
				await expect(
					page
						.getByRole( 'toolbar', { name: 'Block tools' } )
						.getByRole( 'button', { name: 'Unlink' } )
				).toBeHidden();
			} );

			test( 'Should lock url and text controls when both are bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock(
					variables.blocks.buttons.multipleAttrs
				);
				const buttonBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Button',
					exact: true,
				} );
				await buttonBlock.click();

				// Alignment controls are visible.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.align,
					} )
				).toBeVisible();

				// Format controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.bold,
					} )
				).toBeHidden();

				// Button is not editable.
				const isContentEditable = await buttonBlock
					.locator( 'div' )
					.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );

				// Link controls don't exist.
				await expect(
					page
						.getByRole( 'toolbar', { name: 'Block tools' } )
						.getByRole( 'button', { name: 'Link' } )
				).toBeHidden();
				await expect(
					page
						.getByRole( 'toolbar', { name: 'Block tools' } )
						.getByRole( 'button', { name: 'Unlink' } )
				).toBeHidden();
			} );
		} );

		test.describe( 'Image', () => {
			test( 'Should show the upload form when url is not bound', async ( {
				editor,
			} ) => {
				await editor.insertBlock( { name: 'core/image' } );
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();
				await expect(
					imageBlock.getByRole( 'button', { name: 'Upload' } )
				).toBeVisible();
			} );

			test( 'Should NOT show the upload form when url is bound', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.images.urlOnly );
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();
				await expect(
					imageBlock.getByRole( 'button', { name: 'Upload' } )
				).toBeHidden();
			} );

			test( 'Should lock url controls when url is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.images.urlOnly );
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();

				// Replace controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.imageReplace,
					} )
				).toBeHidden();

				// Image placeholder doesn't show the upload button.
				await expect(
					imageBlock.getByRole( 'button', { name: 'Upload' } )
				).toBeHidden();

				// Alt textarea is enabled and with the original value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeEnabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( 'default alt value' );

				// Title input is enabled and with the original value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeEnabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( 'default title value' );
			} );

			test( 'Should disable alt textarea when alt is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.images.altOnly );
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();

				// Replace controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.imageReplace,
					} )
				).toBeVisible();

				// Alt textarea is disabled and with the custom field value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeDisabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( variables.customFields.textKey );

				// Title input is enabled and with the original value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeEnabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( 'default title value' );
			} );

			test( 'Should disable title input when title is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.images.titleOnly );
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();

				// Replace controls exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.imageReplace,
					} )
				).toBeVisible();

				// Alt textarea is enabled and with the original value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeEnabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( 'default alt value' );

				// Title input is disabled and with the custom field value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeDisabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( variables.customFields.textKey );
			} );

			test( 'Multiple bindings should lock the appropriate controls', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock(
					variables.blocks.images.multipleAttrs
				);
				const imageBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Image',
				} );
				await imageBlock.click();

				// Replace controls don't exist.
				await expect(
					page.getByRole( 'button', {
						name: variables.labels.imageReplace,
					} )
				).toBeHidden();

				// Image placeholder doesn't show the upload button.
				await expect(
					imageBlock.getByRole( 'button', { name: 'Upload' } )
				).toBeHidden();

				// Alt textarea is disabled and with the custom field value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeDisabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( variables.customFields.textKey );

				// Title input is enabled and with the original value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeEnabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( 'default title value' );
			} );
		} );
	} );

	test.describe( 'Post/page context', () => {
		test.beforeEach( async ( { admin } ) => {
			await admin.createNewPost( { title: 'Test bindings' } );
		} );
		test.describe( 'Paragraph', () => {
			test( 'Should show the value of the custom field when exists', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.paragraph );
				const paragraphBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Paragraph',
				} );
				const paragraphContent = await paragraphBlock.textContent();
				expect( paragraphContent ).toBe(
					variables.customFields.textValue
				);
				// Paragraph is not editable.
				const isContentEditable =
					await paragraphBlock.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );
			} );

			test( "Should show the value of the key when custom field doesn't exists", async ( {
				editor,
			} ) => {
				await editor.insertBlock( {
					name: 'core/paragraph',
					attributes: {
						content: 'p',
						metadata: {
							bindings: {
								content: {
									source: 'core/post-meta',
									args: { key: 'non_existing_custom_field' },
								},
							},
						},
					},
				} );
				const paragraphBlock = editor.canvas.getByRole( 'document', {
					name: 'Block: Paragraph',
				} );
				const paragraphContent = await paragraphBlock.textContent();
				expect( paragraphContent ).toBe( 'non_existing_custom_field' );
				// Paragraph is not editable.
				const isContentEditable =
					await paragraphBlock.getAttribute( 'contenteditable' );
				expect( isContentEditable ).toBe( 'false' );
			} );
		} );

		test( 'Heading - should show the value of the custom field', async ( {
			editor,
		} ) => {
			await editor.insertBlock( variables.blocks.heading );
			const headingBlock = editor.canvas.getByRole( 'document', {
				name: 'Block: Heading',
			} );
			const headingContent = await headingBlock.textContent();
			expect( headingContent ).toBe( variables.customFields.textValue );
			// Heading is not editable.
			const isContentEditable =
				await headingBlock.getAttribute( 'contenteditable' );
			expect( isContentEditable ).toBe( 'false' );
		} );

		test( 'Button - should show the value of the custom field when text is bound', async ( {
			editor,
		} ) => {
			await editor.insertBlock( variables.blocks.buttons.textOnly );
			const buttonBlock = editor.canvas.getByRole( 'document', {
				name: 'Block: Button',
				exact: true,
			} );
			await buttonBlock.click();
			const buttonText = await buttonBlock.textContent();
			expect( buttonText ).toBe( variables.customFields.textValue );

			// Button is not editable.
			const isContentEditable = await buttonBlock
				.locator( 'div' )
				.getAttribute( 'contenteditable' );
			expect( isContentEditable ).toBe( 'false' );
		} );

		test.describe( 'Image', () => {
			let customFieldSrc;
			test.beforeAll( async ( { requestUtils } ) => {
				const customFieldMedia = await requestUtils.uploadMedia(
					path.join(
						'./test/e2e/assets',
						'1024x768_e2e_test_image_size.jpeg'
					)
				);
				customFieldSrc = customFieldMedia.source_url;
			} );

			test.beforeEach( async ( { editor, page, requestUtils } ) => {
				const postId = await editor.publishPost();
				await requestUtils.rest( {
					method: 'POST',
					path: '/wp/v2/posts/' + postId,
					data: {
						meta: {
							url_custom_field: customFieldSrc,
						},
					},
				} );
				await page.reload();
			} );
			test( 'Should show the value of the custom field when url is bound', async ( {
				editor,
			} ) => {
				await editor.insertBlock( variables.blocks.images.urlOnly );
				const imageBlockImg = editor.canvas
					.getByRole( 'document', {
						name: 'Block: Image',
					} )
					.locator( 'img' );
				const imageSrc = await imageBlockImg.getAttribute( 'src' );
				expect( imageSrc ).toBe( customFieldSrc );
			} );

			test( 'Should show value of the custom field in the alt textarea when alt is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.images.altOnly );
				const imageBlockImg = editor.canvas
					.getByRole( 'document', {
						name: 'Block: Image',
					} )
					.locator( 'img' );
				await imageBlockImg.click();

				// Image src is the placeholder.
				const imageSrc = await imageBlockImg.getAttribute( 'src' );
				expect( imageSrc ).toBe( variables.placeholderSrc );

				// Alt textarea is disabled and with the custom field value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeDisabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( variables.customFields.textValue );
			} );

			test( 'Should show value of the custom field in the title input when title is bound', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock( variables.blocks.images.titleOnly );
				const imageBlockImg = editor.canvas
					.getByRole( 'document', {
						name: 'Block: Image',
					} )
					.locator( 'img' );
				await imageBlockImg.click();

				// Image src is the placeholder.
				const imageSrc = await imageBlockImg.getAttribute( 'src' );
				expect( imageSrc ).toBe( variables.placeholderSrc );

				// Title input is disabled and with the custom field value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeDisabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( variables.customFields.textValue );
			} );

			test( 'Multiple bindings should show the value of the custom fields', async ( {
				editor,
				page,
			} ) => {
				await editor.insertBlock(
					variables.blocks.images.multipleAttrs
				);
				const imageBlockImg = editor.canvas
					.getByRole( 'document', {
						name: 'Block: Image',
					} )
					.locator( 'img' );
				await imageBlockImg.click();

				// Image src is the custom field value.
				const imageSrc = await imageBlockImg.getAttribute( 'src' );
				expect( imageSrc ).toBe( customFieldSrc );

				// Alt textarea is disabled and with the custom field value.
				await expect(
					page.getByLabel( variables.labels.imageAlt )
				).toBeDisabled();
				const altValue = await page
					.getByLabel( variables.labels.imageAlt )
					.inputValue();
				expect( altValue ).toBe( variables.customFields.textValue );

				// Title input is enabled and with the original value.
				await page.getByRole( 'button', { name: 'Advanced' } ).click();
				await expect(
					page.getByLabel( variables.labels.imageTitle )
				).toBeEnabled();
				const titleValue = await page
					.getByLabel( variables.labels.imageTitle )
					.inputValue();
				expect( titleValue ).toBe( 'default title value' );
			} );
		} );
	} );
} );
