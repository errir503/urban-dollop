#!/usr/bin/env php
<?php
/**
 * Loads the minimum amount of the Gutenberg PHP code possible and lists vendor
 * JavaScript URLs and filenames.
 *
 * @package gutenberg-build
 */

define( 'SCRIPT_DEBUG', $argc > 1 && 'debug' === strtolower( $argv[1] ) );

// Hacks to get lib/client-assets.php to load.
define( 'ABSPATH', dirname( __DIR__ ) );

/**
 * Hi, phpcs
 */
function add_action() {}

/**
 * Hi, phpcs
 */
function add_filter() {}

/**
 * Hi, phpcs
 */
function wp_add_inline_script() {}

// Instead of loading script files, just show how they need to be loaded.
define( 'GUTENBERG_LIST_VENDOR_ASSETS', true );

require_once dirname( __DIR__ ) . '/lib/client-assets.php';

/**
 * Hi, phpcs
 */
function run_gutenberg_register_vendor_scripts() {
	global $wp_scripts;

	gutenberg_register_vendor_scripts( $wp_scripts );
}

run_gutenberg_register_vendor_scripts();
