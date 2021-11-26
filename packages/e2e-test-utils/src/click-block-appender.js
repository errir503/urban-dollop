/**
 * Clicks the default block appender.
 */
export async function clickBlockAppender() {
	// The block appender is only visible when there's no selection.
	await page.evaluate( () =>
		window.wp.data.dispatch( 'core/block-editor' ).clearSelectedBlock()
	);
	const appender = await page.waitForSelector(
		'.block-editor-default-block-appender__content'
	);
	await appender.click();
}
