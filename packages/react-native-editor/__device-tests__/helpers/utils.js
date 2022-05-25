/**
 * External dependencies
 */
const childProcess = require( 'child_process' );
// eslint-disable-next-line import/no-extraneous-dependencies
const wd = require( 'wd' );
const crypto = require( 'crypto' );
const path = require( 'path' );
/**
 * Internal dependencies
 */
const serverConfigs = require( './serverConfigs' );
const { iosServer, iosLocal, android } = require( './caps' );
const AppiumLocal = require( './appium-local' );
// eslint-disable-next-line import/no-extraneous-dependencies
const _ = require( 'underscore' );

// Platform setup.
const defaultPlatform = 'android';
const rnPlatform = process.env.TEST_RN_PLATFORM || defaultPlatform;

// Environment setup, local environment or Sauce Labs.
const defaultEnvironment = 'local';
const testEnvironment = process.env.TEST_ENV || defaultEnvironment;

// Local App Paths.
const defaultAndroidAppPath =
	'./android/app/build/outputs/apk/debug/app-debug.apk';
const defaultIOSAppPath =
	'./ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator/GutenbergDemo.app';
const webDriverAgentPath = process.env.WDA_PATH || './ios/build/WDA';

const localAndroidAppPath =
	process.env.ANDROID_APP_PATH || defaultAndroidAppPath;
const localIOSAppPath = process.env.IOS_APP_PATH || defaultIOSAppPath;

const localAppiumPort = serverConfigs.local.port; // Port to spawn appium process for local runs.
let appiumProcess;

const backspace = '\u0008';

// Used to map unicode and special values to keycodes on Android
// Docs for keycode values: https://developer.android.com/reference/android/view/KeyEvent.html
const strToKeycode = {
	'\n': 66,
	[ backspace ]: 67,
};

const timer = ( ms ) => new Promise( ( res ) => setTimeout( res, ms ) );

const isAndroid = () => {
	return rnPlatform.toLowerCase() === 'android';
};

const isLocalEnvironment = () => {
	return testEnvironment.toLowerCase() === 'local';
};

const getIOSPlatformVersions = () => {
	const { runtimes = [] } = JSON.parse(
		childProcess.execSync( 'xcrun simctl list runtimes --json' ).toString()
	);

	return runtimes
		.reverse()
		.filter(
			( { name, isAvailable } ) => name.startsWith( 'iOS' ) && isAvailable
		);
};

// Initialises the driver and desired capabilities for appium.
const setupDriver = async () => {
	const branch = process.env.CIRCLE_BRANCH || '';
	const safeBranchName = branch.replace( /\//g, '-' );
	if ( isLocalEnvironment() ) {
		try {
			appiumProcess = await AppiumLocal.start( localAppiumPort );
		} catch ( err ) {
			// Ignore error here, Appium is probably already running (Appium desktop has its own server for instance)
			// eslint-disable-next-line no-console
			await console.log(
				'Could not start Appium server',
				err.toString()
			);
		}
	}

	const serverConfig = isLocalEnvironment()
		? serverConfigs.local
		: serverConfigs.sauce;
	const driver = wd.promiseChainRemote( serverConfig );

	let desiredCaps;
	if ( isAndroid() ) {
		desiredCaps = _.clone( android );
		if ( isLocalEnvironment() ) {
			desiredCaps.app = path.resolve( localAndroidAppPath );
			try {
				const androidVersion = childProcess
					.execSync( 'adb shell getprop ro.build.version.release' )
					.toString()
					.replace( /^\s+|\s+$/g, '' );
				delete desiredCaps.platformVersion;
				desiredCaps.deviceName = 'Android Emulator';
				// eslint-disable-next-line no-console
				console.log(
					'Detected Android device running Android %s',
					androidVersion
				);
			} catch ( error ) {
				// Ignore error.
			}
		} else {
			desiredCaps.app = `sauce-storage:Gutenberg-${ safeBranchName }.apk`; // App should be preloaded to sauce storage, this can also be a URL.
		}
	} else {
		desiredCaps = _.clone( iosServer );
		desiredCaps.app = `sauce-storage:Gutenberg-${ safeBranchName }.app.zip`; // App should be preloaded to sauce storage, this can also be a URL.
		if ( isLocalEnvironment() ) {
			desiredCaps = _.clone( iosLocal );

			const iosPlatformVersions = getIOSPlatformVersions();
			if ( iosPlatformVersions.length === 0 ) {
				throw new Error(
					'No iOS simulators available! Please verify that you have iOS simulators installed.'
				);
			}
			// eslint-disable-next-line no-console
			console.log(
				'Available iOS platform versions:',
				iosPlatformVersions.map( ( { name } ) => name )
			);

			if ( ! desiredCaps.platformVersion ) {
				desiredCaps.platformVersion = iosPlatformVersions[ 0 ].version;

				// eslint-disable-next-line no-console
				console.log(
					`Using iOS ${ desiredCaps.platformVersion } platform version`
				);
			}

			desiredCaps.app = path.resolve( localIOSAppPath );
			desiredCaps.derivedDataPath = path.resolve( webDriverAgentPath );
		}
	}

	if ( ! isLocalEnvironment() ) {
		desiredCaps.name = `Gutenberg Editor Tests[${ rnPlatform }]-${ branch }`;
		desiredCaps.tags = [ 'Gutenberg', branch ];
	}

	await driver.init( desiredCaps );

	const status = await driver.status();
	// Display the driver status
	// eslint-disable-next-line no-console
	console.log( status );

	await driver.setOrientation( 'PORTRAIT' );
	return driver;
};

const stopDriver = async ( driver ) => {
	if ( ! isLocalEnvironment() ) {
		const jobID = driver.sessionID;

		const hash = crypto
			.createHmac( 'md5', jobID )
			.update( serverConfigs.sauce.auth )
			.digest( 'hex' );
		const jobURL = `https://saucelabs.com/jobs/${ jobID }?auth=${ hash }`;
		// eslint-disable-next-line no-console
		console.log( `You can view the video of this test run at ${ jobURL }` );
	}
	if ( driver === undefined ) {
		return;
	}
	await driver.quit();

	if ( appiumProcess !== undefined ) {
		await AppiumLocal.stop( appiumProcess );
	}
};

/*
 * Problems about the 'clear' parameter:
 *
 * On Android: "clear" is defaulted to true because not clearing the text requires Android to use ADB, which
 * has demonstrated itself to be very flaky, particularly on CI. In other words, clear the view unless you absolutely
 * have to append the new text and, in that case, append fewest number of characters possible.
 *
 * On iOS: "clear" is not defaulted to true because calling element.clear when a text is present takes a very long time (approx. 23 seconds)
 */
const typeString = async ( driver, element, str, clear ) => {
	if ( isAndroid() ) {
		await typeStringAndroid( driver, element, str, clear );
	} else {
		await typeStringIos( driver, element, str, clear );
	}
};

const typeStringIos = async ( driver, element, str, clear ) => {
	if ( clear ) {
		// await element.clear(); This was not working correctly on iOS so need a custom implementation
		await clearTextBox( driver, element );
	}
	await element.type( str );
};

const clearTextBox = async ( driver, element ) => {
	await element.click();
	let originalText = await element.text();
	let text = originalText;
	// We are double tapping on the text field and pressing backspace until all content is removed.
	do {
		originalText = await element.text();
		await doubleTap( driver, element );
		await element.type( '\b' );
		text = await element.text();
		// We compare with the original content and not empty because text always return any hint set on the element.
	} while ( originalText !== text );
};

const doubleTap = async ( driver, element ) => {
	const action = new wd.TouchAction( driver );
	action.tap( { el: element, count: 2 } );
	await action.perform();
};

const typeStringAndroid = async (
	driver,
	element,
	str,
	clear = true // See comment above for why it is defaulted to true.
) => {
	if ( str in strToKeycode ) {
		return await driver.pressKeycode( strToKeycode[ str ] );
	} else if ( clear ) {
		/*
		 * On Android `element.type` deletes the contents of the EditText before typing and, unfortunately,
		 * with our blocks it also deletes the block entirely. We used to avoid this by using adb to enter
		 * long text along these lines:
		 *         await driver.execute( 'mobile: shell', { command: 'input',
		 *                                                  args: [ 'text', 'text I want to enter...' ] } )
		 * but using adb in this way proved to be very flaky (frequently all of the text would not get entered,
		 * particularly on CI). We are now using the `type` approach again, but adding a space to the block to
		 * insure it is not empty, which avoids the deletion of the block when `type` executes.
		 *
		 * Note that this approach does not allow appending text to the text in a block on account
		 * of `type` always clearing the block (on Android).
		 */

		await driver.execute( 'mobile: shell', {
			command: 'input',
			args: [ 'text', '%s' ],
		} );
		await element.type( str );
	} else {
		// eslint-disable-next-line no-console
		console.log(
			'Warning: Using `adb shell input text` on Android which is rather flaky.'
		);

		const paragraphs = str.split( '\n' );
		for ( let i = 0; i < paragraphs.length; i++ ) {
			const paragraph = paragraphs[ i ].replace( /[ ]/g, '%s' );
			if ( paragraph in strToKeycode ) {
				await driver.pressKeycode( strToKeycode[ paragraph ] );
			} else {
				// Execute with adb shell input <text> since normal type auto clears field on Android
				await driver.execute( 'mobile: shell', {
					command: 'input',
					args: [ 'text', paragraph ],
				} );
			}
			if ( i !== paragraphs.length - 1 ) {
				await driver.pressKeycode( strToKeycode[ '\n' ] );
			}
		}
	}
};

// Calculates middle x,y and clicks that position
const clickMiddleOfElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const size = await element.getSize();

	const action = await new wd.TouchAction( driver );
	action.press( { x: location.x + size.width / 2, y: location.y } );
	action.release();
	await action.perform();
};

// Clicks in the top left of an element.
const clickBeginningOfElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const action = await new wd.TouchAction( driver );
	action.press( { x: location.x, y: location.y } );
	action.release();
	await action.perform();
};

// Long press to activate context menu.
const longPressMiddleOfElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const size = await element.getSize();

	const action = await new wd.TouchAction( driver );
	const x = location.x + size.width / 2;
	const y = location.y + size.height / 2;
	action.press( { x, y } );
	// Setting to wait a bit longer because this is failing more frequently on the CI
	action.wait( 5000 );
	action.release();
	await action.perform();
};

// Press "Select All" in floating context menu.
const tapSelectAllAboveElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const action = await new wd.TouchAction( driver );
	const x = location.x + 300;
	const y = location.y - 50;
	action.press( { x, y } );
	action.release();
	await action.perform();
};

// Press "Copy" in floating context menu.
const tapCopyAboveElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const action = await new wd.TouchAction( driver );
	const x = location.x + 220;
	const y = location.y - 50;
	action.wait( 2000 );
	action.press( { x, y } );
	action.wait( 2000 );
	action.release();
	await action.perform();
};

// Press "Paste" in floating context menu.
const tapPasteAboveElement = async ( driver, element ) => {
	const location = await element.getLocation();
	const action = await new wd.TouchAction( driver );
	action.wait( 2000 );
	action.press( { x: location.x + 100, y: location.y - 50 } );
	action.wait( 2000 );
	action.release();
	await action.perform();
};

// Starts from the middle of the screen or the element(if specified)
// and swipes upwards.
const swipeUp = async (
	driver,
	element = undefined,
	delay = 3000,
	endYCoefficient = 0.5
) => {
	let size = await driver.getWindowSize();
	let y = 0;
	if ( element !== undefined ) {
		size = await element.getSize();
		const location = await element.getLocation();
		y = location.y;
	}

	const startX = size.width / 2;
	const startY = y + size.height / 3;
	const endX = startX;
	const endY = startY + startY * -1 * endYCoefficient;

	await swipeFromTo(
		driver,
		{ x: startX, y: startY },
		{ x: endX, y: endY },
		delay
	);
};

const defaultCoordinates = { x: 0, y: 0 };
const swipeFromTo = async (
	driver,
	from = defaultCoordinates,
	to = defaultCoordinates,
	delay
) => {
	const action = await new wd.TouchAction( driver );
	action.press( from );
	action.wait( delay );
	action.moveTo( to );
	action.release();
	await action.perform();
};

// Starts from the middle of the screen and swipes downwards
const swipeDown = async ( driver, delay = 3000 ) => {
	const size = await driver.getWindowSize();
	const y = 0;

	const startX = size.width / 2;
	const startY = y + size.height / 3;
	const endX = startX;
	const endY = startY - startY * -1 * 0.5;

	await swipeFromTo(
		driver,
		{ x: startX, y: startY },
		{ x: endX, y: endY },
		delay
	);
};

const toggleHtmlMode = async ( driver, toggleOn ) => {
	if ( isAndroid() ) {
		// Hit the "Menu" key.
		await driver.pressKeycode( 82 );

		const showHtmlButtonXpath =
			'/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.ListView/android.widget.TextView[9]';

		await clickIfClickable( driver, showHtmlButtonXpath );
	} else if ( toggleOn ) {
		await clickIfClickable(
			driver,
			'//XCUIElementTypeButton[@name="..."]'
		);
		await clickIfClickable(
			driver,
			'//XCUIElementTypeButton[@name="Switch to HTML"]'
		);
	} else {
		// This is to wait for the clipboard paste notification to disappear, currently it overlaps with the menu button
		await driver.sleep( 3000 );
		await clickIfClickable(
			driver,
			'//XCUIElementTypeButton[@name="..."]'
		);
		await clickIfClickable(
			driver,
			'//XCUIElementTypeButton[@name="Switch To Visual"]'
		);
	}
};

const toggleOrientation = async ( driver ) => {
	const orientation = await driver.getOrientation();
	if ( orientation === 'LANDSCAPE' ) {
		await driver.setOrientation( 'PORTRAIT' );
	} else {
		await driver.setOrientation( 'LANDSCAPE' );
	}
};

const isEditorVisible = async ( driver ) => {
	const postTitleLocator = isAndroid()
		? `//android.widget.EditText[contains(@content-desc, "Post title")]`
		: `(//XCUIElementTypeScrollView/XCUIElementTypeOther/XCUIElementTypeOther[contains(@name, "Post title")])`;

	await waitForVisible( driver, postTitleLocator );
};

const waitForMediaLibrary = async ( driver ) => {
	const accessibilityIdXPathAttrib = isAndroid() ? 'content-desc' : 'name';
	const accessibilityId = 'WordPress Media Library';
	const locator = `//*[@${ accessibilityIdXPathAttrib }="${ accessibilityId }"]`;
	await waitForVisible( driver, locator );
};

/**
 * @param {string} driver
 * @param {string} elementLocator
 * @param {number} maxIteration - Default value is 25
 * @param {number} iteration - Default value is 0
 * @return {string} - Returns the first element found, empty string if not found
 */
const waitForVisible = async (
	driver,
	elementLocator,
	maxIteration = 25,
	iteration = 0
) => {
	const timeout = 1000;

	if ( iteration >= maxIteration ) {
		// if element not found, print error and return empty string
		// eslint-disable-next-line no-console
		console.error(
			`"${ elementLocator }" is still not visible after ${ iteration } retries!`
		);
		return '';
	} else if ( iteration !== 0 ) {
		// wait before trying to locate element again
		await driver.sleep( timeout );
	}

	const element = await driver.elementsByXPath( elementLocator );
	if ( element.length === 0 ) {
		// if locator is not visible, try again
		return waitForVisible(
			driver,
			elementLocator,
			maxIteration,
			iteration + 1
		);
	}

	return element[ 0 ];
};

/**
 * @param {string} driver
 * @param {string} elementLocator
 * @param {number} maxIteration - Default value is 25, can be adjusted to be less to wait for element to not be visible
 * @return {boolean} - Returns true if element is found, false otherwise
 */
const isElementVisible = async (
	driver,
	elementLocator,
	maxIteration = 25
) => {
	const element = await waitForVisible(
		driver,
		elementLocator,
		maxIteration
	);

	// if there is no element, return false
	if ( ! element ) {
		return false;
	}

	return true;
};

const clickIfClickable = async (
	driver,
	elementLocator,
	maxIteration = 25,
	iteration = 0
) => {
	const element = await waitForVisible(
		driver,
		elementLocator,
		maxIteration,
		iteration
	);

	try {
		return await element.click();
	} catch ( error ) {
		if ( iteration >= maxIteration ) {
			// eslint-disable-next-line no-console
			console.error(
				`"${ elementLocator }" still not clickable after "${ iteration }" retries`
			);
			return '';
		}

		return clickIfClickable(
			driver,
			elementLocator,
			maxIteration,
			iteration + 1
		);
	}
};

// Only for Android
const waitIfAndroid = async () => {
	if ( isAndroid() ) {
		await editorPage.driver.sleep( 1000 );
	}
};

module.exports = {
	backspace,
	clickBeginningOfElement,
	clickIfClickable,
	clickMiddleOfElement,
	doubleTap,
	isAndroid,
	isEditorVisible,
	isElementVisible,
	isLocalEnvironment,
	longPressMiddleOfElement,
	setupDriver,
	stopDriver,
	swipeDown,
	swipeFromTo,
	swipeUp,
	tapCopyAboveElement,
	tapPasteAboveElement,
	tapSelectAllAboveElement,
	timer,
	toggleHtmlMode,
	toggleOrientation,
	typeString,
	waitForMediaLibrary,
	waitForVisible,
	waitIfAndroid,
};
