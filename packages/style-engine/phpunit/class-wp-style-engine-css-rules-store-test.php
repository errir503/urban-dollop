<?php
/**
 * Tests the Style Engine CSS Rules Store class.
 *
 * @package    Gutenberg
 * @subpackage style-engine
 */

// Check for the existence of Style Engine classes and methods.
// Once the Style Engine has been migrated to Core we can remove the if statements and require imports.
// Testing new features from the Gutenberg package may require
// testing against `gutenberg_` and `_Gutenberg` functions and methods in the future.
if ( ! class_exists( 'WP_Style_Engine_CSS_Declarations' ) ) {
	require __DIR__ . '/../class-wp-style-engine-css-declarations.php';
}

if ( ! class_exists( 'WP_Style_Engine_CSS_Rule' ) ) {
	require __DIR__ . '/../class-wp-style-engine-css-rule.php';
}

if ( ! class_exists( 'WP_Style_Engine_CSS_Rules_Store' ) ) {
	require __DIR__ . '/../class-wp-style-engine-css-rules-store.php';
}

/**
 * Tests for registering, storing and retrieving a collection of CSS Rules (a store).
 *
 * @coversDefaultClass WP_Style_Engine_CSS_Rules_Store
 */
class WP_Style_Engine_CSS_Rules_Store_Test extends WP_UnitTestCase {
	/**
	 * Cleans up stores after each test.
	 */
	public function tear_down() {
		WP_Style_Engine_CSS_Rules_Store::remove_all_stores();
		parent::tear_down();
	}

	/**
	 * Tests creating a new store on instantiation.
	 *
	 * @covers ::__construct
	 */
	public function test_should_create_new_store_on_instantiation() {
		$new_pancakes_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'pancakes-with-strawberries' );

		$this->assertInstanceOf( 'WP_Style_Engine_CSS_Rules_Store', $new_pancakes_store );
	}

	/**
	 * Tests that a `$store_name` argument is required and no store will be created without one.
	 *
	 * @covers ::get_store
	 */
	public function test_should_not_create_store_without_a_store_name() {
		$not_a_store = WP_Style_Engine_CSS_Rules_Store::get_store( '' );

		$this->assertEmpty( $not_a_store, 'get_store() did not return an empty value with empty string as argument.' );

		$also_not_a_store = WP_Style_Engine_CSS_Rules_Store::get_store( 123 );

		$this->assertEmpty( $also_not_a_store, 'get_store() did not return an empty value with number as argument.' );

		$definitely_not_a_store = WP_Style_Engine_CSS_Rules_Store::get_store( null );

		$this->assertEmpty( $definitely_not_a_store, 'get_store() did not return an empty value with `null` as argument.' );
	}

	/**
	 * Tests returning a previously created store when the same selector key is passed.
	 *
	 * @covers ::get_store
	 */
	public function test_should_return_existing_store() {
		$new_fish_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'fish-n-chips' );
		$selector       = '.haddock';

		$new_fish_store->add_rule( $selector );

		$this->assertSame( $selector, $new_fish_store->add_rule( $selector )->get_selector(), 'Selector string of store rule does not match expected value' );

		$the_same_fish_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'fish-n-chips' );

		$this->assertSame( $selector, $the_same_fish_store->add_rule( $selector )->get_selector(), 'Selector string of existing store rule does not match expected value' );
	}

	/**
	 * Tests returning all previously created stores.
	 *
	 * @covers ::get_stores
	 */
	public function test_should_get_all_existing_stores() {
		$burrito_store    = WP_Style_Engine_CSS_Rules_Store::get_store( 'burrito' );
		$quesadilla_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'quesadilla' );

		$this->assertEquals(
			array(
				'burrito'    => $burrito_store,
				'quesadilla' => $quesadilla_store,
			),
			WP_Style_Engine_CSS_Rules_Store::get_stores()
		);
	}

	/**
	 * Tests that all previously created stores are deleted.
	 *
	 * @covers ::remove_all_stores
	 */
	public function test_should_remove_all_stores() {
		$dolmades_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'dolmades' );
		$tzatziki_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'tzatziki' );

		$this->assertEquals(
			array(
				'dolmades' => $dolmades_store,
				'tzatziki' => $tzatziki_store,
			),
			WP_Style_Engine_CSS_Rules_Store::get_stores(),
			'Return value of get_stores() does not match expectation'
		);
		WP_Style_Engine_CSS_Rules_Store::remove_all_stores();

		$this->assertEquals(
			array(),
			WP_Style_Engine_CSS_Rules_Store::get_stores(),
			'Return value of get_stores() is not an empty array after remove_all_stores() called.'
		);
	}

	/**
	 * Tests adding rules to an existing store.
	 *
	 * @covers ::add_rule
	 */
	public function test_should_add_rule_to_existing_store() {
		$new_pie_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'meat-pie' );
		$selector      = '.wp-block-sauce a:hover';
		$store_rule    = $new_pie_store->add_rule( $selector );
		$expected      = '';

		$this->assertSame( $expected, $store_rule->get_css(), 'Return value of get_css() is not a empty string where a rule has no CSS declarations.' );

		$pie_declarations = array(
			'color'         => 'brown',
			'border-color'  => 'yellow',
			'border-radius' => '10rem',
		);
		$css_declarations = new WP_Style_Engine_CSS_Declarations( $pie_declarations );
		$store_rule->add_declarations( $css_declarations );

		$store_rule = $new_pie_store->add_rule( $selector );
		$expected   = "$selector{{$css_declarations->get_declarations_string()}}";

		$this->assertSame( $expected, $store_rule->get_css(), 'Return value of get_css() does not match expected CSS from existing store rules.' );
	}

	/**
	 * Tests that all stored rule objects are returned.
	 *
	 * @covers ::get_all_rules
	 */
	public function test_should_get_all_rule_objects_for_a_store() {
		$new_pizza_store = WP_Style_Engine_CSS_Rules_Store::get_store( 'pizza-with-mozzarella' );
		$selector        = '.wp-block-anchovies a:hover';
		$store_rule      = $new_pizza_store->add_rule( $selector );
		$expected        = array(
			$selector => $store_rule,
		);

		$this->assertSame( $expected, $new_pizza_store->get_all_rules(), 'Return value for get_all_rules() does not match expectations.' );

		$new_selector             = '.wp-block-mushroom a:hover';
		$newer_pizza_declarations = array(
			'padding' => '100px',
		);
		$new_store_rule           = $new_pizza_store->add_rule( $new_selector );
		$css_declarations         = new WP_Style_Engine_CSS_Declarations( $newer_pizza_declarations );
		$new_store_rule->add_declarations( array( $css_declarations ) );

		$expected = array(
			$selector     => $store_rule,
			$new_selector => $new_store_rule,
		);

		$this->assertSame( $expected, $new_pizza_store->get_all_rules(), 'Return value for get_all_rules() does not match expectations after adding new rules to store.' );
	}
}
